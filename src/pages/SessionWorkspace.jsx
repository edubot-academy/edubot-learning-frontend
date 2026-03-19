import { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
    ATTENDANCE_STATUS,
    COURSE_GROUP_STATUS,
    COURSE_SESSION_STATUS,
    COURSE_TYPE,
    MEETING_PROVIDER,
    SESSION_ATTENDANCE_STATUS,
} from '@shared/contracts';
import {
    createCourseGroup,
    createCourseSession,
    createSessionHomework,
    createSessionMeeting,
    deleteSessionMeeting,
    fetchCourseAttendance,
    fetchCourseGroups,
    fetchSessionHomework,
    fetchSessionHomeworkSubmissions,
    fetchSessionMeeting,
    fetchCourseSessions,
    fetchCourseStudents,
    fetchInstructorProfile,
    fetchSessionAttendance,
    importSessionAttendance,
    markAttendanceSession,
    markSessionAttendanceBulk,
    syncSessionRecordings,
    updateCourseGroup,
    updateSessionHomework,
    updateSessionMeeting,
    updateCourseSession,
    reviewSessionHomeworkSubmission,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';

const todayIso = new Date().toISOString().slice(0, 10);
const JOIN_WINDOW_MS = 10 * 60 * 1000;

const QUICK_GROUP_DEFAULT = {
    name: '',
    code: '',
    status: COURSE_GROUP_STATUS.PLANNED,
    startDate: '',
    endDate: '',
    seatLimit: '',
    timezone: '',
    location: '',
    meetingProvider: '',
    meetingUrl: '',
    instructorId: '',
};

const QUICK_SESSION_DEFAULT = {
    sessionIndex: '',
    title: '',
    startsAt: '',
    endsAt: '',
    status: COURSE_SESSION_STATUS.SCHEDULED,
    recordingUrl: '',
    materialTitle: '',
    materialUrl: '',
};

const EDIT_GROUP_DEFAULT = {
    name: '',
    code: '',
    status: COURSE_GROUP_STATUS.PLANNED,
    startDate: '',
    endDate: '',
    seatLimit: '',
    timezone: '',
    location: '',
    meetingProvider: '',
    meetingUrl: '',
    instructorId: '',
};

const EDIT_SESSION_DEFAULT = {
    sessionIndex: '',
    title: '',
    startsAt: '',
    endsAt: '',
    status: COURSE_SESSION_STATUS.SCHEDULED,
    recordingUrl: '',
};

const tabList = [
    { id: 'attendance', label: 'Катышуу' },
    { id: 'chat', label: 'Чат' },
    { id: 'materials', label: 'Материалдар' },
    { id: 'notes', label: 'Сессия жазуулары' },
    { id: 'homework', label: 'Үй тапшырма' },
    { id: 'engagement', label: 'Активдүүлүк' },
];

const statusMeta = {
    [ATTENDANCE_STATUS.PRESENT]: { label: 'Катышты', className: 'bg-emerald-100 text-emerald-700' },
    [ATTENDANCE_STATUS.LATE]: { label: 'Кечикти', className: 'bg-amber-100 text-amber-700' },
    [ATTENDANCE_STATUS.ABSENT]: { label: 'Келген жок', className: 'bg-red-100 text-red-700' },
};

const sessionStatusMap = {
    [SESSION_ATTENDANCE_STATUS.PRESENT]: ATTENDANCE_STATUS.PRESENT,
    [SESSION_ATTENDANCE_STATUS.LATE]: ATTENDANCE_STATUS.LATE,
    [SESSION_ATTENDANCE_STATUS.ABSENT]: ATTENDANCE_STATUS.ABSENT,
    [SESSION_ATTENDANCE_STATUS.EXCUSED]: ATTENDANCE_STATUS.ABSENT,
};

const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.courses)) return payload.courses;
    return [];
};

const toSessionTime = (isoValue) => {
    if (!isoValue) return '-';
    const d = new Date(isoValue);
    if (Number.isNaN(d.getTime())) return '-';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const toInputDateTime = (isoValue) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const resolveSessionJoinUrl = (session, group) =>
    session?.joinUrl ||
    session?.meetingUrl ||
    session?.meetingUrlSnapshot ||
    group?.meetingUrl ||
    '';

const getSessionMode = (session, nowMs) => {
    const start = session?.startsAt ? new Date(session.startsAt).getTime() : null;
    const end = session?.endsAt ? new Date(session.endsAt).getTime() : null;
    if (!start || !end) return 'scheduled';
    if (nowMs < start) return 'upcoming';
    if (nowMs >= start && nowMs <= end) return 'live';
    return 'completed';
};

const formatCountdown = (targetMs, nowMs) => {
    const remaining = Math.max(0, targetMs - nowMs);
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds
    ).padStart(2, '0')}`;
};

const isJoinWindowOpen = (session, nowMs) => {
    const start = session?.startsAt ? new Date(session.startsAt).getTime() : null;
    const end = session?.endsAt ? new Date(session.endsAt).getTime() : null;
    if (!start || !end) return false;
    return nowMs >= start - JOIN_WINDOW_MS && nowMs <= end;
};

const normalizeCourseType = (course, session, group) =>
    course?.courseType ||
    course?.type ||
    session?.course?.courseType ||
    group?.course?.courseType ||
    COURSE_TYPE.VIDEO;

const getWorkspaceErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    if (status === 401) return 'Сессия мөөнөтү бүттү. Кайра кириңиз.';
    if (status === 403) return 'Бул курс, группа же сессия сизге бекитилген эмес.';
    const message = error?.response?.data?.message || error?.message || fallback;
    return Array.isArray(message) ? message.join(', ') : message;
};

const SessionWorkspace = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('attendance');

    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [sessions, setSessions] = useState([]);

    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [sessionDate, setSessionDate] = useState(todayIso);

    const [students, setStudents] = useState([]);
    const [attendanceRows, setAttendanceRows] = useState({});
    const [attendanceHistory, setAttendanceHistory] = useState([]);

    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    const [materials, setMaterials] = useState([]);
    const [recordingLink, setRecordingLink] = useState('');

    const [meetingProvider, setMeetingProvider] = useState(MEETING_PROVIDER.CUSTOM);
    const [meetingJoinUrl, setMeetingJoinUrl] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [savingMeeting, setSavingMeeting] = useState(false);
    const [loadingMeetingState, setLoadingMeetingState] = useState(false);
    const [deletingMeeting, setDeletingMeeting] = useState(false);
    const [importingAttendance, setImportingAttendance] = useState(false);
    const [syncingRecordings, setSyncingRecordings] = useState(false);

    const [quickGroup, setQuickGroup] = useState(QUICK_GROUP_DEFAULT);
    const [quickSession, setQuickSession] = useState(QUICK_SESSION_DEFAULT);
    const [editGroup, setEditGroup] = useState(EDIT_GROUP_DEFAULT);
    const [editSession, setEditSession] = useState(EDIT_SESSION_DEFAULT);
    const [savingGroup, setSavingGroup] = useState(false);
    const [savingSession, setSavingSession] = useState(false);
    const [savingGroupUpdate, setSavingGroupUpdate] = useState(false);
    const [savingSessionUpdate, setSavingSessionUpdate] = useState(false);

    const [sessionNotes, setSessionNotes] = useState('');

    const [homeworkTitle, setHomeworkTitle] = useState('');
    const [homeworkDescription, setHomeworkDescription] = useState('');
    const [homeworkDeadline, setHomeworkDeadline] = useState('');
    const [publishedHomework, setPublishedHomework] = useState([]);
    const [loadingHomework, setLoadingHomework] = useState(false);
    const [savingHomework, setSavingHomework] = useState(false);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState('');
    const [homeworkSubmissions, setHomeworkSubmissions] = useState([]);
    const [loadingHomeworkSubmissions, setLoadingHomeworkSubmissions] = useState(false);
    const [reviewingSubmissionId, setReviewingSubmissionId] = useState('');
    const [editingHomeworkId, setEditingHomeworkId] = useState('');
    const [editHomeworkTitle, setEditHomeworkTitle] = useState('');
    const [editHomeworkDescription, setEditHomeworkDescription] = useState('');
    const [editHomeworkDeadline, setEditHomeworkDeadline] = useState('');
    const [updatingHomework, setUpdatingHomework] = useState(false);
    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        let cancelled = false;
        const loadCourses = async () => {
            setLoadingCourses(true);
            try {
                const response = await fetchInstructorProfile(user.id);
                if (cancelled) return;
                const list = toArray(response?.courses || response);
                const teachingCourses = list.filter((course) => {
                    const type = String(course?.courseType || course?.type || 'video').toLowerCase();
                    return type === COURSE_TYPE.OFFLINE || type === COURSE_TYPE.ONLINE_LIVE;
                });
                setCourses(teachingCourses);
                if (teachingCourses.length > 0) {
                    setSelectedCourseId(String(teachingCourses[0].id));
                } else {
                    setSelectedCourseId('');
                    toast.error('Сессия workspace оффлайн же онлайн түз эфир курстары үчүн гана жеткиликтүү.');
                }
            } catch (error) {
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Курстар жүктөлгөн жок.'));
            } finally {
                if (!cancelled) setLoadingCourses(false);
            }
        };
        loadCourses();
        return () => {
            cancelled = true;
        };
    }, [user]);

    useEffect(() => {
        if (!selectedCourseId) {
            setGroups([]);
            setSelectedGroupId('');
            return;
        }

        let cancelled = false;
        const loadGroups = async () => {
            setLoadingGroups(true);
            try {
                const res = await fetchCourseGroups({ courseId: Number(selectedCourseId) });
                if (cancelled) return;
                const list = toArray(res);
                setGroups(list);
                setSelectedGroupId(list.length ? String(list[0].id) : '');
            } catch (error) {
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Группаларды жүктөө мүмкүн болгон жок.'));
                setGroups([]);
                setSelectedGroupId('');
            } finally {
                if (!cancelled) setLoadingGroups(false);
            }
        };
        loadGroups();
        return () => {
            cancelled = true;
        };
    }, [selectedCourseId]);

    useEffect(() => {
        if (!selectedGroupId) {
            setSessions([]);
            setSelectedSessionId('');
            return;
        }

        let cancelled = false;
        const loadSessions = async () => {
            setLoadingSessions(true);
            try {
                const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
                if (cancelled) return;
                const list = toArray(res);
                setSessions(list);
                const first = list[0];
                setSelectedSessionId(first?.id ? String(first.id) : '');
            } catch (error) {
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Сессияларды жүктөө мүмкүн болгон жок.'));
                setSessions([]);
                setSelectedSessionId('');
            } finally {
                if (!cancelled) setLoadingSessions(false);
            }
        };

        loadSessions();
        return () => {
            cancelled = true;
        };
    }, [selectedGroupId]);

    useEffect(() => {
        setQuickSession((prev) => ({
            ...prev,
            sessionIndex: prev.sessionIndex || String((sessions?.length || 0) + 1),
        }));
    }, [sessions]);

    useEffect(() => {
        if (!selectedCourseId) return;

        let cancelled = false;
        const loadStudentsAndHistory = async () => {
            setLoadingStudents(true);
            try {
                const [studentsRes, attendanceRes] = await Promise.all([
                    fetchCourseStudents(Number(selectedCourseId), { page: 1, limit: 200 }),
                    fetchCourseAttendance({ courseId: Number(selectedCourseId) }),
                ]);
                if (cancelled) return;

                const rawStudents = toArray(studentsRes);
                const normalized = rawStudents.map((item) => ({
                    id: Number(item.userId || item.id),
                    fullName: item.fullName || item.user?.fullName || `#${item.userId || item.id}`,
                }));
                setStudents(normalized);

                const rowState = {};
                normalized.forEach((student) => {
                    rowState[student.id] = {
                        studentId: student.id,
                        status: SESSION_ATTENDANCE_STATUS.PRESENT,
                        notes: '',
                        joinedAt: undefined,
                        leftAt: undefined,
                    };
                });
                setAttendanceRows(rowState);
                setAttendanceHistory(attendanceRes?.items || []);
            } catch (error) {
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Сессия маалыматтарын жүктөө катасы.'));
                setStudents([]);
                setAttendanceRows({});
                setAttendanceHistory([]);
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        };

        loadStudentsAndHistory();
        return () => {
            cancelled = true;
        };
    }, [selectedCourseId]);

    useEffect(() => {
        if (!selectedSessionId) return;

        let cancelled = false;
        const hydrateSessionAttendance = async () => {
            try {
                const res = await fetchSessionAttendance(Number(selectedSessionId));
                if (cancelled) return;
                const items = toArray(res);
                if (!items.length) return;

                setAttendanceRows((prev) => {
                    const next = { ...prev };
                    items.forEach((item) => {
                        const studentId = Number(item.studentId || item.userId);
                        if (!next[studentId]) return;
                        next[studentId] = {
                            ...next[studentId],
                            status: item.status,
                            notes: item.notes || '',
                            joinedAt: item.joinedAt || undefined,
                            leftAt: item.leftAt || undefined,
                        };
                    });
                    return next;
                });
            } catch (error) {
                console.error(error);
            }
        };

        hydrateSessionAttendance();
        return () => {
            cancelled = true;
        };
    }, [selectedSessionId]);

    useEffect(() => {
        if (!selectedSessionId) {
            setPublishedHomework([]);
            setSelectedHomeworkId('');
            setHomeworkSubmissions([]);
            setEditingHomeworkId('');
            return;
        }

        let cancelled = false;
        const loadSessionHomework = async () => {
            setLoadingHomework(true);
            try {
                const response = await fetchSessionHomework(Number(selectedSessionId));
                if (cancelled) return;
                const items = toArray(response);
                setPublishedHomework(items);
                setSelectedHomeworkId((prev) => {
                    if (prev && items.some((item) => String(item.id) === String(prev))) return prev;
                    return items[0]?.id ? String(items[0].id) : '';
                });
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Үй тапшырмалар жүктөлгөн жок.'));
                setPublishedHomework([]);
                setSelectedHomeworkId('');
            } finally {
                if (!cancelled) setLoadingHomework(false);
            }
        };

        loadSessionHomework();
        return () => {
            cancelled = true;
        };
    }, [selectedSessionId]);

    useEffect(() => {
        if (!selectedSessionId || !selectedHomeworkId) {
            setHomeworkSubmissions([]);
            return;
        }

        let cancelled = false;
        const loadSubmissions = async () => {
            setLoadingHomeworkSubmissions(true);
            try {
                const response = await fetchSessionHomeworkSubmissions(
                    Number(selectedSessionId),
                    Number(selectedHomeworkId)
                );
                if (cancelled) return;
                setHomeworkSubmissions(toArray(response));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Тапшырма жооптору жүктөлгөн жок.'));
                setHomeworkSubmissions([]);
            } finally {
                if (!cancelled) setLoadingHomeworkSubmissions(false);
            }
        };

        loadSubmissions();
        return () => {
            cancelled = true;
        };
    }, [selectedHomeworkId, selectedSessionId]);

    useEffect(() => {
        if (!selectedSessionId) {
            setMeetingJoinUrl('');
            setMeetingId('');
            return;
        }

        let cancelled = false;
        const loadMeetingState = async () => {
            setLoadingMeetingState(true);
            try {
                const res = await fetchSessionMeeting(Number(selectedSessionId), {
                    provider: meetingProvider || undefined,
                });
                if (cancelled) return;
                setMeetingJoinUrl(res?.joinUrl || '');
                setMeetingId(String(res?.meetingId || ''));
                if (res?.provider) setMeetingProvider(res.provider);
            } catch {
                if (cancelled) return;
                setMeetingJoinUrl('');
                setMeetingId('');
            } finally {
                if (!cancelled) setLoadingMeetingState(false);
            }
        };

        loadMeetingState();
        return () => {
            cancelled = true;
        };
    }, [selectedSessionId, meetingProvider]);

    const selectedCourse = useMemo(
        () => courses.find((course) => String(course.id) === String(selectedCourseId)) || null,
        [courses, selectedCourseId]
    );

    const selectedGroup = useMemo(
        () => groups.find((group) => String(group.id) === String(selectedGroupId)) || null,
        [groups, selectedGroupId]
    );
    const selectedSession = useMemo(
        () => sessions.find((session) => String(session.id) === String(selectedSessionId)) || null,
        [sessions, selectedSessionId]
    );
    const selectedHomework = useMemo(
        () =>
            publishedHomework.find((item) => String(item.id) === String(selectedHomeworkId)) || null,
        [publishedHomework, selectedHomeworkId]
    );

    useEffect(() => {
        if (!selectedGroup) {
            setEditGroup(EDIT_GROUP_DEFAULT);
            return;
        }

        setEditGroup({
            name: selectedGroup.name || '',
            code: selectedGroup.code || '',
            status: selectedGroup.status || COURSE_GROUP_STATUS.PLANNED,
            startDate: selectedGroup.startDate || '',
            endDate: selectedGroup.endDate || '',
            seatLimit: selectedGroup.seatLimit ? String(selectedGroup.seatLimit) : '',
            timezone: selectedGroup.timezone || '',
            location: selectedGroup.location || '',
            meetingProvider: selectedGroup.meetingProvider || '',
            meetingUrl: selectedGroup.meetingUrl || '',
            instructorId: selectedGroup.instructorId ? String(selectedGroup.instructorId) : '',
        });
    }, [selectedGroup]);

    useEffect(() => {
        if (!selectedSession) {
            setEditSession(EDIT_SESSION_DEFAULT);
            return;
        }

        setEditSession({
            sessionIndex: selectedSession.sessionIndex ? String(selectedSession.sessionIndex) : '',
            title: selectedSession.title || '',
            startsAt: toInputDateTime(selectedSession.startsAt),
            endsAt: toInputDateTime(selectedSession.endsAt),
            status: selectedSession.status || COURSE_SESSION_STATUS.SCHEDULED,
            recordingUrl: selectedSession.recordingUrl || '',
        });
    }, [selectedSession]);

    const selectedSessionMode = useMemo(
        () => getSessionMode(selectedSession, nowMs),
        [selectedSession, nowMs]
    );

    const selectedSessionJoinUrl = useMemo(
        () => resolveSessionJoinUrl(selectedSession, selectedGroup),
        [selectedSession, selectedGroup]
    );

    const selectedSessionJoinAllowed = useMemo(
        () => isJoinWindowOpen(selectedSession, nowMs),
        [selectedSession, nowMs]
    );

    const sessionsToday = useMemo(() => {
        return sessions
            .filter((session) => {
                if (!session.startsAt) return false;
                return session.startsAt.slice(0, 10) === todayIso;
            })
            .map((session) => ({
                id: session.id,
                courseId: String(selectedCourseId),
                courseTitle:
                    selectedCourse?.title ||
                    selectedCourse?.name ||
                    session.course?.title ||
                    session.course?.name ||
                    'Сабак',
                type: normalizeCourseType(selectedCourse, session, selectedGroup),
                startTime: toSessionTime(session.startsAt),
                room: selectedGroup?.location || null,
                sessionId: session.id,
                startsAt: session.startsAt,
                endsAt: session.endsAt,
                mode: getSessionMode(session, nowMs),
                joinUrl: resolveSessionJoinUrl(session, selectedGroup),
                joinAllowed: isJoinWindowOpen(session, nowMs),
            }));
    }, [sessions, selectedCourseId, selectedCourse, selectedGroup, nowMs]);

    const attendanceStats = useMemo(() => {
        const values = Object.values(attendanceRows);
        const present = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.PRESENT).length;
        const late = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.LATE).length;
        const absent = values.filter(
            (r) =>
                r.status === SESSION_ATTENDANCE_STATUS.ABSENT ||
                r.status === SESSION_ATTENDANCE_STATUS.EXCUSED
        ).length;
        return {
            total: values.length,
            present,
            late,
            absent,
            presentRate: values.length ? Math.round((present / values.length) * 100) : 0,
        };
    }, [attendanceRows]);

    const studentStreaks = useMemo(() => {
        const map = new Map();
        attendanceHistory.forEach((row) => {
            const arr = map.get(row.userId) || [];
            arr.push(row);
            map.set(row.userId, arr);
        });

        const streakByStudent = {};
        map.forEach((rows, userId) => {
            const sorted = rows
                .slice()
                .sort(
                    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
                );

            let streak = 0;
            for (let i = sorted.length - 1; i >= 0; i -= 1) {
                if (sorted[i].status === ATTENDANCE_STATUS.PRESENT) streak += 1;
                else break;
            }
            streakByStudent[userId] = streak;
        });

        return streakByStudent;
    }, [attendanceHistory]);

    const leaderboard = useMemo(() => {
        return students
            .map((student) => {
                const streak = studentStreaks[student.id] || 0;
                const homeworkPoints =
                    publishedHomework.filter((h) => {
                        const assignees =
                            h.assignedTo ||
                            h.assignedStudentIds ||
                            h.assignedStudents?.map((item) => item.id) ||
                            [];
                        return assignees.includes(student.id);
                    }).length * 5;
                const attendancePoint =
                    attendanceRows[student.id]?.status === SESSION_ATTENDANCE_STATUS.PRESENT
                        ? 10
                        : 0;
                const xp = streak * 3 + homeworkPoints + attendancePoint;
                return { ...student, streak, xp };
            })
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);
    }, [students, studentStreaks, publishedHomework, attendanceRows]);

    const topStudents = leaderboard.slice(0, 3);

    const updateStatus = (studentId, status) => {
        setAttendanceRows((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }));
    };

    const updateNotes = (studentId, notes) => {
        setAttendanceRows((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                notes,
            },
        }));
    };

    const saveAttendance = async () => {
        const rows = Object.values(attendanceRows).map((row) => ({
            studentId: row.studentId,
            status: row.status,
            notes: row.notes?.trim() || undefined,
            joinedAt: row.joinedAt,
            leftAt: row.leftAt,
        }));

        setSavingAttendance(true);
        try {
            if (selectedSessionId) {
                await markSessionAttendanceBulk(Number(selectedSessionId), {
                    courseId: Number(selectedCourseId),
                    rows,
                });
                toast.success('Session-based катышуу сакталды');
            } else {
                await markAttendanceSession({
                    courseId: Number(selectedCourseId),
                    sessionDate,
                    rows: rows.map((row) => ({
                        userId: row.studentId,
                        status: sessionStatusMap[row.status] || ATTENDANCE_STATUS.ABSENT,
                        notes: row.notes,
                    })),
                });
                toast.success('Date-based катышуу сакталды');
            }

            const refreshed = await fetchCourseAttendance({ courseId: Number(selectedCourseId) });
            setAttendanceHistory(refreshed?.items || []);
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Катышууну сактоо катасы'));
        } finally {
            setSavingAttendance(false);
        }
    };

    const createQuickGroup = async () => {
        if (!selectedCourseId) {
            toast.error('Адегенде курсту тандаңыз.');
            return;
        }
        if (!quickGroup.name.trim() || !quickGroup.code.trim()) {
            toast.error('Группа үчүн аталыш жана код милдеттүү.');
            return;
        }

        setSavingGroup(true);
        try {
            const payload = {
                courseId: Number(selectedCourseId),
                name: quickGroup.name.trim(),
                code: quickGroup.code.trim(),
                status: quickGroup.status || undefined,
                startDate: quickGroup.startDate || undefined,
                endDate: quickGroup.endDate || undefined,
                seatLimit: quickGroup.seatLimit ? Number(quickGroup.seatLimit) : undefined,
                timezone: quickGroup.timezone || undefined,
                location: quickGroup.location || undefined,
                meetingProvider: quickGroup.meetingProvider || undefined,
                meetingUrl: quickGroup.meetingUrl || undefined,
                instructorId: quickGroup.instructorId ? Number(quickGroup.instructorId) : undefined,
            };

            const created = await createCourseGroup(payload);
            toast.success('Group түзүлдү.');

            const res = await fetchCourseGroups({ courseId: Number(selectedCourseId) });
            const list = toArray(res);
            setGroups(list);
            if (created?.id) setSelectedGroupId(String(created.id));

            setQuickGroup((prev) => ({
                ...QUICK_GROUP_DEFAULT,
                timezone: prev.timezone,
                meetingProvider: prev.meetingProvider,
            }));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Группа түзүү катасы'));
        } finally {
            setSavingGroup(false);
        }
    };

    const createQuickSession = async () => {
        if (!selectedGroupId) {
            toast.error('Адегенде группаны тандаңыз.');
            return;
        }
        if (
            !quickSession.title.trim() ||
            !quickSession.sessionIndex ||
            !quickSession.startsAt ||
            !quickSession.endsAt
        ) {
            toast.error('Сессия үчүн номер, аталыш, башталышы жана аягы милдеттүү.');
            return;
        }

        setSavingSession(true);
        try {
            const materials =
                quickSession.materialTitle.trim() && quickSession.materialUrl.trim()
                    ? [
                          {
                              title: quickSession.materialTitle.trim(),
                              url: quickSession.materialUrl.trim(),
                          },
                      ]
                    : undefined;

            const payload = {
                groupId: Number(selectedGroupId),
                sessionIndex: Number(quickSession.sessionIndex),
                title: quickSession.title.trim(),
                startsAt: new Date(quickSession.startsAt).toISOString(),
                endsAt: new Date(quickSession.endsAt).toISOString(),
                status: quickSession.status || undefined,
                recordingUrl: quickSession.recordingUrl || undefined,
                materials,
            };

            const created = await createCourseSession(payload);
            toast.success('Session түзүлдү.');

            const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
            const list = toArray(res);
            setSessions(list);
            if (created?.id) setSelectedSessionId(String(created.id));

            setQuickSession((prev) => ({
                ...QUICK_SESSION_DEFAULT,
                sessionIndex: String((list?.length || 0) + 1),
                status: prev.status,
            }));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Сессия түзүү катасы'));
        } finally {
            setSavingSession(false);
        }
    };

    const updateSelectedGroup = async () => {
        if (!selectedGroupId) {
            toast.error('Группаны тандаңыз.');
            return;
        }
        if (!editGroup.name.trim() || !editGroup.code.trim()) {
            toast.error('Группа үчүн аталыш жана код милдеттүү.');
            return;
        }

        setSavingGroupUpdate(true);
        try {
            await updateCourseGroup(Number(selectedGroupId), {
                name: editGroup.name.trim(),
                code: editGroup.code.trim(),
                status: editGroup.status || undefined,
                startDate: editGroup.startDate || undefined,
                endDate: editGroup.endDate || undefined,
                seatLimit: editGroup.seatLimit ? Number(editGroup.seatLimit) : undefined,
                timezone: editGroup.timezone || undefined,
                location: editGroup.location || undefined,
                meetingProvider: editGroup.meetingProvider || undefined,
                meetingUrl: editGroup.meetingUrl || undefined,
                instructorId: editGroup.instructorId ? Number(editGroup.instructorId) : undefined,
            });

            const res = await fetchCourseGroups({ courseId: Number(selectedCourseId) });
            const list = toArray(res);
            setGroups(list);
            toast.success('Group жаңыртылды.');
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Группаны жаңыртуу катасы'));
        } finally {
            setSavingGroupUpdate(false);
        }
    };

    const updateSelectedSession = async () => {
        if (!selectedSessionId) {
            toast.error('Сессияны тандаңыз.');
            return;
        }
        if (!editSession.title.trim() || !editSession.startsAt || !editSession.endsAt) {
            toast.error('Сессия үчүн аталыш, башталышы жана аягы милдеттүү.');
            return;
        }

        setSavingSessionUpdate(true);
        try {
            await updateCourseSession(Number(selectedSessionId), {
                sessionIndex: editSession.sessionIndex
                    ? Number(editSession.sessionIndex)
                    : undefined,
                title: editSession.title.trim(),
                startsAt: new Date(editSession.startsAt).toISOString(),
                endsAt: new Date(editSession.endsAt).toISOString(),
                status: editSession.status || undefined,
                recordingUrl: editSession.recordingUrl || undefined,
            });

            const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
            const list = toArray(res);
            setSessions(list);
            toast.success('Session жаңыртылды.');
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Сессияны жаңыртуу катасы'));
        } finally {
            setSavingSessionUpdate(false);
        }
    };

    const saveMeetingLink = async () => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return;
        }
        setSavingMeeting(true);
        try {
            const payload = {
                provider: meetingProvider,
                customJoinUrl: meetingJoinUrl || undefined,
            };
            const res = meetingId
                ? await updateSessionMeeting(Number(selectedSessionId), payload)
                : await createSessionMeeting(Number(selectedSessionId), payload);
            setMeetingJoinUrl(res?.joinUrl || '');
            setMeetingId(String(res?.meetingId || meetingId || ''));
            toast.success('Жолугушуу шилтемеси жаңыртылды.');
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Жолугушуу шилтемесин сактоо катасы'));
        } finally {
            setSavingMeeting(false);
        }
    };

    const restoreMeetingState = async () => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return;
        }

        setLoadingMeetingState(true);
        try {
            const res = await fetchSessionMeeting(Number(selectedSessionId), {
                provider: meetingProvider || undefined,
            });
            setMeetingJoinUrl(res?.joinUrl || '');
            setMeetingId(String(res?.meetingId || ''));
            if (res?.provider) setMeetingProvider(res.provider);
            toast.success('Жолугушуунун абалы жаңыртылды.');
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Жолугушуу табылган жок'));
        } finally {
            setLoadingMeetingState(false);
        }
    };

    const removeMeeting = async () => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return;
        }

        setDeletingMeeting(true);
        try {
            await deleteSessionMeeting(Number(selectedSessionId), {
                provider: meetingProvider || undefined,
            });
            setMeetingJoinUrl('');
            setMeetingId('');
            toast.success('Жолугушуу өчүрүлдү.');
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Жолугушууну өчүрүү катасы'));
        } finally {
            setDeletingMeeting(false);
        }
    };

    const importZoomAttendanceToSession = async () => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return;
        }

        setImportingAttendance(true);
        try {
            await importSessionAttendance(Number(selectedSessionId), {
                presentMinPercent: 70,
                lateGraceMinutes: 10,
            });

            if (selectedSessionId) {
                const res = await fetchSessionAttendance(Number(selectedSessionId));
                const list = toArray(res);
                setAttendanceRows((prev) => {
                    const next = { ...prev };
                    list.forEach((item) => {
                        const studentId = Number(item.studentId || item.userId);
                        if (!next[studentId]) return;
                        next[studentId] = {
                            ...next[studentId],
                            status: item.status,
                            notes: item.notes || '',
                            joinedAt: item.joinedAt || undefined,
                            leftAt: item.leftAt || undefined,
                        };
                    });
                    return next;
                });
            }
            const refreshed = await fetchCourseAttendance({ courseId: Number(selectedCourseId) });
            setAttendanceHistory(refreshed?.items || []);

            toast.success('Zoom attendance импорттолду.');
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Катышууну импорттоо катасы'));
        } finally {
            setImportingAttendance(false);
        }
    };

    const syncZoomRecordingsToSession = async () => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return;
        }

        setSyncingRecordings(true);
        try {
            const res = await syncSessionRecordings(Number(selectedSessionId), {
                setSessionRecordingUrl: true,
            });
            if (res?.recordingUrl) setRecordingLink(res.recordingUrl);
            toast.success('Zoom recordings синхрондолду.');
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Жазууларды синхрондоо катасы'));
        } finally {
            setSyncingRecordings(false);
        }
    };

    const joinLiveSession = (joinUrl) => {
        if (!joinUrl) {
            toast.error('Кошулуу шилтемеси табылган жок.');
            return;
        }
        window.open(joinUrl, '_blank', 'noopener,noreferrer');
    };

    const sendChatMessage = () => {
        if (!chatInput.trim()) return;
        setChatMessages((prev) => [
            ...prev,
            {
                id: `m-${Date.now()}`,
                sender: 'Instructor',
                text: chatInput.trim(),
                createdAt: new Date().toISOString(),
            },
        ]);
        setChatInput('');
    };

    const addMaterialFiles = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setMaterials((prev) => [
            ...prev,
            ...files.map((file) => ({
                id: `f-${Date.now()}-${file.name}`,
                name: file.name,
                sizeKb: Math.round(file.size / 1024),
            })),
        ]);
        toast.success('Материал кошулду.');
    };

    const publishHomework = async () => {
        if (!homeworkTitle.trim()) {
            toast.error('Үй тапшырманын аталышын жазыңыз.');
            return;
        }
        if (!selectedSessionId) {
            toast.error('Алгач сессия тандаңыз.');
            return;
        }

        const assignedStudentIds = students.map((student) => student.id);
        setSavingHomework(true);
        try {
            await createSessionHomework(Number(selectedSessionId), {
                title: homeworkTitle.trim(),
                description: homeworkDescription.trim() || undefined,
                deadline: homeworkDeadline || undefined,
                assignedStudentIds,
            });

            const refreshed = await fetchSessionHomework(Number(selectedSessionId));
            const items = toArray(refreshed);
            setPublishedHomework(items);
            setSelectedHomeworkId((prev) => {
                if (prev && items.some((item) => String(item.id) === String(prev))) return prev;
                return items[0]?.id ? String(items[0].id) : '';
            });
            setHomeworkTitle('');
            setHomeworkDescription('');
            setHomeworkDeadline('');
            toast.success('Үй тапшырма жарыяланды.');
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, 'Үй тапшырманы жарыялоо катасы'));
        } finally {
            setSavingHomework(false);
        }
    };

    const beginHomeworkEdit = (item) => {
        if (!item?.id) return;
        setEditingHomeworkId(String(item.id));
        setEditHomeworkTitle(item.title || item.name || '');
        setEditHomeworkDescription(item.description || '');
        setEditHomeworkDeadline(item.deadline ? String(item.deadline).slice(0, 10) : '');
    };

    const cancelHomeworkEdit = () => {
        setEditingHomeworkId('');
        setEditHomeworkTitle('');
        setEditHomeworkDescription('');
        setEditHomeworkDeadline('');
    };

    const saveHomeworkEdit = async () => {
        if (!selectedSessionId || !editingHomeworkId) return;
        if (!editHomeworkTitle.trim()) {
            toast.error('Тапшырманын аталышын жазыңыз.');
            return;
        }

        setUpdatingHomework(true);
        try {
            await updateSessionHomework(Number(selectedSessionId), Number(editingHomeworkId), {
                title: editHomeworkTitle.trim(),
                description: editHomeworkDescription.trim() || undefined,
                deadline: editHomeworkDeadline || undefined,
            });

            const refreshed = await fetchSessionHomework(Number(selectedSessionId));
            const items = toArray(refreshed);
            setPublishedHomework(items);
            cancelHomeworkEdit();
            toast.success('Үй тапшырма жаңыртылды.');
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, 'Үй тапшырманы жаңыртуу катасы'));
        } finally {
            setUpdatingHomework(false);
        }
    };

    const reviewHomeworkSubmission = async (submissionId, status) => {
        if (!selectedSessionId || !selectedHomeworkId || !submissionId) return;
        setReviewingSubmissionId(String(submissionId));
        try {
            await reviewSessionHomeworkSubmission(
                Number(selectedSessionId),
                Number(selectedHomeworkId),
                Number(submissionId),
                { status }
            );
            const refreshed = await fetchSessionHomeworkSubmissions(
                Number(selectedSessionId),
                Number(selectedHomeworkId)
            );
            setHomeworkSubmissions(toArray(refreshed));
            toast.success('Тапшырма жооп статусу жаңыртылды.');
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, 'Тапшырма жоопун баалоо катасы'));
        } finally {
            setReviewingSubmissionId('');
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-6">
            <div className="grid xl:grid-cols-4 gap-4">
                <KpiCard label="Бүгүнкү сессиялар" value={sessionsToday.length} />
                <KpiCard label="Катышуу %" value={`${attendanceStats.presentRate}%`} />
                <KpiCard label="Тапшырма жарыяланды" value={publishedHomework.length} />
                <KpiCard
                    label="Кооптуу студенттер"
                    value={students.length - attendanceStats.present}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2 bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Instructor Session Workspace
                        </h1>
                        <div className="flex flex-wrap gap-2 items-center">
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                disabled={loadingCourses}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                            >
                                <option value="">Курс тандаңыз</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title || course.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                disabled={!selectedCourseId || loadingGroups}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                            >
                                <option value="">Группа</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name || group.code || `Group #${group.id}`}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedSessionId}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                disabled={!selectedGroupId || loadingSessions}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                            >
                                <option value="">Сессия</option>
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {session.title ||
                                            `Session #${session.sessionIndex || session.id}`}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                            />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                Quick Create Group
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={quickGroup.name}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Name *"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={quickGroup.code}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            code: e.target.value,
                                        }))
                                    }
                                    placeholder="Code *"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <select
                                    value={quickGroup.status}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                >
                                    {Object.values(COURSE_GROUP_STATUS).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={quickGroup.startDate}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="date"
                                    value={quickGroup.endDate}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={quickGroup.seatLimit}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            seatLimit: e.target.value,
                                        }))
                                    }
                                    placeholder="Seat limit"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={quickGroup.timezone}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            timezone: e.target.value,
                                        }))
                                    }
                                    placeholder="Timezone"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={quickGroup.location}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            location: e.target.value,
                                        }))
                                    }
                                    placeholder="Location"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <select
                                    value={quickGroup.meetingProvider}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            meetingProvider: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                >
                                    <option value="">meetingProvider</option>
                                    {Object.values(MEETING_PROVIDER).map((provider) => (
                                        <option key={provider} value={provider}>
                                            {provider}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={quickGroup.instructorId}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            instructorId: e.target.value,
                                        }))
                                    }
                                    placeholder="Instructor ID"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={quickGroup.meetingUrl}
                                    onChange={(e) =>
                                        setQuickGroup((prev) => ({
                                            ...prev,
                                            meetingUrl: e.target.value,
                                        }))
                                    }
                                    placeholder="Meeting URL"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                            </div>
                            <button
                                onClick={createQuickGroup}
                                disabled={!selectedCourseId || savingGroup}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60"
                            >
                                {savingGroup ? 'Түзүлүүдө...' : 'Create Group'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                Quick Create Session
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={quickSession.sessionIndex}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            sessionIndex: e.target.value,
                                        }))
                                    }
                                    placeholder="Session index *"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <select
                                    value={quickSession.status}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                >
                                    {[
                                        COURSE_SESSION_STATUS.SCHEDULED,
                                        COURSE_SESSION_STATUS.COMPLETED,
                                        COURSE_SESSION_STATUS.CANCELLED,
                                    ]
                                        .filter(Boolean)
                                        .map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                </select>
                                <input
                                    value={quickSession.title}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="Title *"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="datetime-local"
                                    value={quickSession.startsAt}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            startsAt: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="datetime-local"
                                    value={quickSession.endsAt}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            endsAt: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={quickSession.recordingUrl}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            recordingUrl: e.target.value,
                                        }))
                                    }
                                    placeholder="Recording URL"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={quickSession.materialTitle}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            materialTitle: e.target.value,
                                        }))
                                    }
                                    placeholder="Material title"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={quickSession.materialUrl}
                                    onChange={(e) =>
                                        setQuickSession((prev) => ({
                                            ...prev,
                                            materialUrl: e.target.value,
                                        }))
                                    }
                                    placeholder="Material URL"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                            </div>
                            <button
                                onClick={createQuickSession}
                                disabled={!selectedGroupId || savingSession}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60"
                            >
                                {savingSession ? 'Түзүлүүдө...' : 'Create Session'}
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                Edit Selected Group
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={editGroup.name}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    placeholder="Name *"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={editGroup.code}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({ ...prev, code: e.target.value }))
                                    }
                                    placeholder="Code *"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <select
                                    value={editGroup.status}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                >
                                    {Object.values(COURSE_GROUP_STATUS).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={editGroup.startDate}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="date"
                                    value={editGroup.endDate}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={editGroup.seatLimit}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            seatLimit: e.target.value,
                                        }))
                                    }
                                    placeholder="Seat limit"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={editGroup.timezone}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            timezone: e.target.value,
                                        }))
                                    }
                                    placeholder="Timezone"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={editGroup.location}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            location: e.target.value,
                                        }))
                                    }
                                    placeholder="Location"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <select
                                    value={editGroup.meetingProvider}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            meetingProvider: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                >
                                    <option value="">meetingProvider</option>
                                    {Object.values(MEETING_PROVIDER).map((provider) => (
                                        <option key={provider} value={provider}>
                                            {provider}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={editGroup.instructorId}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            instructorId: e.target.value,
                                        }))
                                    }
                                    placeholder="Instructor ID"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={editGroup.meetingUrl}
                                    onChange={(e) =>
                                        setEditGroup((prev) => ({
                                            ...prev,
                                            meetingUrl: e.target.value,
                                        }))
                                    }
                                    placeholder="Meeting URL"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                            </div>
                            <button
                                onClick={updateSelectedGroup}
                                disabled={!selectedGroupId || savingGroupUpdate}
                                className="px-4 py-2 rounded-lg border border-blue-600 text-blue-700 text-sm disabled:opacity-60"
                            >
                                {savingGroupUpdate ? 'Жаңыртылууда...' : 'Update Group'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                Edit Selected Session
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={editSession.sessionIndex}
                                    onChange={(e) =>
                                        setEditSession((prev) => ({
                                            ...prev,
                                            sessionIndex: e.target.value,
                                        }))
                                    }
                                    placeholder="Session index"
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <select
                                    value={editSession.status}
                                    onChange={(e) =>
                                        setEditSession((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                >
                                    {[
                                        COURSE_SESSION_STATUS.SCHEDULED,
                                        COURSE_SESSION_STATUS.COMPLETED,
                                        COURSE_SESSION_STATUS.CANCELLED,
                                    ]
                                        .filter(Boolean)
                                        .map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                </select>
                                <input
                                    value={editSession.title}
                                    onChange={(e) =>
                                        setEditSession((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="Title *"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="datetime-local"
                                    value={editSession.startsAt}
                                    onChange={(e) =>
                                        setEditSession((prev) => ({
                                            ...prev,
                                            startsAt: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    type="datetime-local"
                                    value={editSession.endsAt}
                                    onChange={(e) =>
                                        setEditSession((prev) => ({
                                            ...prev,
                                            endsAt: e.target.value,
                                        }))
                                    }
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                                <input
                                    value={editSession.recordingUrl}
                                    onChange={(e) =>
                                        setEditSession((prev) => ({
                                            ...prev,
                                            recordingUrl: e.target.value,
                                        }))
                                    }
                                    placeholder="Recording URL"
                                    className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-sm"
                                />
                            </div>
                            <button
                                onClick={updateSelectedSession}
                                disabled={!selectedSessionId || savingSessionUpdate}
                                className="px-4 py-2 rounded-lg border border-blue-600 text-blue-700 text-sm disabled:opacity-60"
                            >
                                {savingSessionUpdate ? 'Жаңыртылууда...' : 'Update Session'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {tabList.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-1.5 rounded-full text-sm border ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-[#E8ECF3]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {selectedSession &&
                        normalizeCourseType(selectedCourse, selectedSession, selectedGroup) ===
                            COURSE_TYPE.ONLINE_LIVE && (
                            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-3 flex flex-wrap gap-3 items-center justify-between">
                                <div className="text-sm">
                                    <div className="font-medium text-blue-800 dark:text-blue-200">
                                        Онлайн Live сессия
                                    </div>
                                    <div className="text-blue-700 dark:text-blue-300">
                                        {selectedSessionMode === 'upcoming' &&
                                            `Башталышына: ${formatCountdown(
                                                new Date(selectedSession.startsAt).getTime(),
                                                nowMs
                                            )}`}
                                        {selectedSessionMode === 'live' &&
                                            `Аяктаганга чейин: ${formatCountdown(
                                                new Date(selectedSession.endsAt).getTime(),
                                                nowMs
                                            )}`}
                                        {selectedSessionMode === 'completed' && 'Сессия аяктады'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => joinLiveSession(selectedSessionJoinUrl)}
                                    disabled={
                                        selectedSessionMode === 'completed' ||
                                        !selectedSessionJoinAllowed ||
                                        !selectedSessionJoinUrl
                                    }
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                                >
                                    Join Class
                                </button>
                                {!selectedSessionJoinAllowed &&
                                    selectedSessionMode !== 'completed' && (
                                        <div className="text-xs text-blue-700 dark:text-blue-300">
                                            Join 10 мүнөт калганда ачылат.
                                        </div>
                                    )}
                            </div>
                        )}

                    {activeTab === 'attendance' && (
                        <div className="space-y-3">
                            <div className="flex justify-end">
                                <button
                                    onClick={saveAttendance}
                                    disabled={
                                        savingAttendance || loadingStudents || !selectedCourseId
                                    }
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                                >
                                    {savingAttendance ? 'Сакталууда...' : 'Катышууну сактоо'}
                                </button>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                        <th className="py-2 pr-3">Студент</th>
                                        <th className="py-2 pr-3">Катышуу</th>
                                        <th className="py-2 pr-3">Эскертүү</th>
                                        <th className="py-2 pr-3">Streak</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b border-gray-50 dark:border-gray-900"
                                        >
                                            <td className="py-2 pr-3">{student.fullName}</td>
                                            <td className="py-2 pr-3">
                                                <div className="flex gap-2">
                                                    {statusOptions.map((status) => (
                                                        <button
                                                            key={status.value}
                                                            onClick={() =>
                                                                updateStatus(
                                                                    student.id,
                                                                    status.value
                                                                )
                                                            }
                                                            className={`px-2 py-1 rounded text-xs ${
                                                                attendanceRows[student.id]
                                                                    ?.status === status.value
                                                                    ? status.className
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            {status.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-2 pr-3">
                                                <input
                                                    value={attendanceRows[student.id]?.notes || ''}
                                                    onChange={(e) =>
                                                        updateNotes(student.id, e.target.value)
                                                    }
                                                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#0E0E0E]"
                                                    placeholder="Эскертүү"
                                                />
                                            </td>
                                            <td className="py-2 pr-3">
                                                {studentStreaks[student.id] || 0} күн
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && !loadingStudents && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-6 text-center text-gray-500"
                                            >
                                                Студент табылган жок.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="space-y-3">
                            <div className="max-h-72 overflow-auto border border-gray-100 dark:border-gray-800 rounded-xl p-3 space-y-2">
                                {chatMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className="text-sm bg-gray-50 dark:bg-[#1A1A1A] rounded p-2"
                                    >
                                        <div className="font-medium">{message.sender}</div>
                                        <div>{message.text}</div>
                                    </div>
                                ))}
                                {chatMessages.length === 0 && (
                                    <div className="text-sm text-gray-500">
                                        Чат билдирүүлөрү жок.
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Кыска билдирүү..."
                                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                />
                                <button
                                    onClick={sendChatMessage}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                                >
                                    Жөнөтүү
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div className="space-y-3">
                            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                                <span>Материал жүктөө</span>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={addMaterialFiles}
                                />
                            </label>
                            <div className="space-y-2">
                                {materials.map((file) => (
                                    <div
                                        key={file.id}
                                        className="text-sm border border-gray-100 dark:border-gray-800 rounded px-3 py-2"
                                    >
                                        {file.name} ({file.sizeKb} KB)
                                    </div>
                                ))}
                                {materials.length === 0 && (
                                    <div className="text-sm text-gray-500">
                                        Материал кошула элек.
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-3 gap-2">
                                <select
                                    value={meetingProvider}
                                    onChange={(e) => setMeetingProvider(e.target.value)}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                >
                                    {Object.values(MEETING_PROVIDER).map((provider) => (
                                        <option key={provider} value={provider}>
                                            {provider}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={meetingJoinUrl}
                                    onChange={(e) => setMeetingJoinUrl(e.target.value)}
                                    placeholder="Meeting URL"
                                    className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <button
                                    onClick={saveMeetingLink}
                                    disabled={!selectedSessionId || savingMeeting}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
                                >
                                    {savingMeeting
                                        ? 'Сакталууда...'
                                        : meetingId
                                          ? 'Meeting жаңыртуу'
                                          : 'Meeting түзүү'}
                                </button>
                                <button
                                    onClick={restoreMeetingState}
                                    disabled={!selectedSessionId || loadingMeetingState}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-[#E8ECF3] disabled:opacity-60"
                                >
                                    {loadingMeetingState
                                        ? 'Жүктөлүүдө...'
                                        : 'Meeting абалын жүктөө'}
                                </button>
                                <button
                                    onClick={removeMeeting}
                                    disabled={!selectedSessionId || deletingMeeting}
                                    className="px-4 py-2 rounded-lg border border-red-400 text-red-600 disabled:opacity-60"
                                >
                                    {deletingMeeting ? 'Өчүрүлүүдө...' : 'Meeting өчүрүү'}
                                </button>
                                {meetingId && (
                                    <span className="text-xs text-gray-500">ID: {meetingId}</span>
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    joinLiveSession(meetingJoinUrl || selectedSessionJoinUrl)
                                }
                                disabled={
                                    !(meetingJoinUrl || selectedSessionJoinUrl) ||
                                    !selectedSessionJoinAllowed
                                }
                                className="px-4 py-2 rounded-lg border border-blue-500 text-blue-700 disabled:opacity-60"
                            >
                                Join Class
                            </button>
                            {!selectedSessionJoinAllowed && selectedSessionMode !== 'completed' && (
                                <div className="text-xs text-gray-500">
                                    Join 10 мүнөт калганда гана жеткиликтүү.
                                </div>
                            )}

                            <input
                                value={recordingLink}
                                onChange={(e) => setRecordingLink(e.target.value)}
                                placeholder="Recording URL"
                                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                            />

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={importZoomAttendanceToSession}
                                    disabled={!selectedSessionId || importingAttendance}
                                    className="px-4 py-2 rounded-lg border border-indigo-400 text-indigo-700 disabled:opacity-60"
                                >
                                    {importingAttendance
                                        ? 'Импорттолууда...'
                                        : 'Zoom attendance импорт'}
                                </button>
                                <button
                                    onClick={syncZoomRecordingsToSession}
                                    disabled={!selectedSessionId || syncingRecordings}
                                    className="px-4 py-2 rounded-lg border border-indigo-400 text-indigo-700 disabled:opacity-60"
                                >
                                    {syncingRecordings
                                        ? 'Синхрондолууда...'
                                        : 'Zoom recordings sync'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <textarea
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            rows={10}
                            placeholder="Сессия боюнча жазуу: эмне өттүк, кимге колдоо керек, кийинки кадам..."
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                        />
                    )}

                    {activeTab === 'homework' && (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h4 className="font-medium">Жаңы тапшырма</h4>
                                    <input
                                        value={homeworkTitle}
                                        onChange={(e) => setHomeworkTitle(e.target.value)}
                                        placeholder="Тапшырманын аталышы"
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                    />
                                    <textarea
                                        value={homeworkDescription}
                                        onChange={(e) => setHomeworkDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Түшүндүрмө"
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                    />
                                    <input
                                        type="date"
                                        value={homeworkDeadline}
                                        onChange={(e) => setHomeworkDeadline(e.target.value)}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                    />
                                    <button
                                        onClick={publishHomework}
                                        disabled={!selectedSessionId || savingHomework}
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
                                    >
                                        {savingHomework ? 'Жарыяланып жатат...' : 'Үй тапшырмасын жарыялоо'}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium">Тапшырмалар тизмеси</h4>
                                    {loadingHomework && (
                                        <div className="text-sm text-gray-500">Үй тапшырмалар жүктөлүүдө...</div>
                                    )}
                                    <div className="space-y-2 max-h-72 overflow-auto">
                                        {publishedHomework.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setSelectedHomeworkId(String(item.id))}
                                                className={`w-full text-left border rounded p-3 ${
                                                    String(item.id) === String(selectedHomeworkId)
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-100 dark:border-gray-800'
                                                }`}
                                            >
                                                <div className="font-medium">
                                                    {item.title || item.name || 'Homework'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Deadline: {item.deadline || '-'}
                                                </div>
                                            </button>
                                        ))}
                                        {!loadingHomework && publishedHomework.length === 0 && (
                                            <div className="text-sm text-gray-500">
                                                Бул сессия боюнча үй тапшырма азырынча жок.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedHomework ? (
                                <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-3 space-y-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div>
                                            <div className="font-medium">
                                                {selectedHomework.title || selectedHomework.name || 'Homework'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Deadline: {selectedHomework.deadline || '-'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => beginHomeworkEdit(selectedHomework)}
                                            className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    {editingHomeworkId === String(selectedHomework.id) && (
                                        <div className="space-y-2 border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                                            <input
                                                value={editHomeworkTitle}
                                                onChange={(e) => setEditHomeworkTitle(e.target.value)}
                                                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                            />
                                            <textarea
                                                value={editHomeworkDescription}
                                                onChange={(e) =>
                                                    setEditHomeworkDescription(e.target.value)
                                                }
                                                rows={3}
                                                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                            />
                                            <input
                                                type="date"
                                                value={editHomeworkDeadline}
                                                onChange={(e) => setEditHomeworkDeadline(e.target.value)}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={saveHomeworkEdit}
                                                    disabled={updatingHomework}
                                                    className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-60"
                                                >
                                                    {updatingHomework ? 'Сакталып жатат...' : 'Сактоо'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelHomeworkEdit}
                                                    className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700"
                                                >
                                                    Жокко чыгаруу
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <h5 className="font-medium">Submissionдер</h5>
                                        {loadingHomeworkSubmissions && (
                                            <div className="text-sm text-gray-500">
                                                Submissionдер жүктөлүүдө...
                                            </div>
                                        )}
                                        {!loadingHomeworkSubmissions && homeworkSubmissions.length === 0 && (
                                            <div className="text-sm text-gray-500">Жооп азырынча жок.</div>
                                        )}
                                        {homeworkSubmissions.map((submission) => (
                                            <div
                                                key={submission.id}
                                                className="border border-gray-100 dark:border-gray-800 rounded-lg p-3"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {submission.student?.fullName ||
                                                                submission.fullName ||
                                                                `#${submission.studentId || submission.userId}`}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Status: {submission.status || 'submitted'}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                reviewHomeworkSubmission(
                                                                    submission.id,
                                                                    'approved'
                                                                )
                                                            }
                                                            disabled={
                                                                reviewingSubmissionId ===
                                                                String(submission.id)
                                                            }
                                                            className="px-2 py-1 rounded bg-emerald-600 text-white text-xs disabled:opacity-60"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                reviewHomeworkSubmission(
                                                                    submission.id,
                                                                    'rejected'
                                                                )
                                                            }
                                                            disabled={
                                                                reviewingSubmissionId ===
                                                                String(submission.id)
                                                            }
                                                            className="px-2 py-1 rounded bg-red-600 text-white text-xs disabled:opacity-60"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {activeTab === 'engagement' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card title="Attendance Streaks">
                                {students.slice(0, 8).map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex justify-between text-sm py-1"
                                    >
                                        <span>{student.fullName}</span>
                                        <span>{studentStreaks[student.id] || 0} күн</span>
                                    </div>
                                ))}
                            </Card>
                            <Card title="Top Students">
                                {topStudents.map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className="flex justify-between text-sm py-1"
                                    >
                                        <span>
                                            #{idx + 1} {student.fullName}
                                        </span>
                                        <span>{student.xp} XP</span>
                                    </div>
                                ))}
                            </Card>
                            <Card title="Quick Praise Badges">
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'Жигердүү',
                                        'Көп жардам берди',
                                        'Тартиптүү',
                                        'Үй тапшырма мыкты',
                                    ].map((badge) => (
                                        <button
                                            key={badge}
                                            onClick={() =>
                                                toast.success(`${badge} badge жиберилди`)
                                            }
                                            className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700"
                                        >
                                            {badge}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                            <Card title="Homework Leaderboard">
                                {leaderboard.map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className="flex justify-between text-sm py-1"
                                    >
                                        <span>
                                            #{idx + 1} {student.fullName}
                                        </span>
                                        <span>{student.xp}</span>
                                    </div>
                                ))}
                            </Card>
                        </div>
                    )}
                </section>

                <aside className="space-y-4">
                    <section className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-[#E8ECF3]">
                            Бүгүнкү сессиялар
                        </h3>
                        <div className="space-y-2 text-sm">
                            {sessionsToday.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => setSelectedSessionId(String(session.sessionId))}
                                    className={`w-full text-left border rounded p-2 ${
                                        String(selectedSessionId) === String(session.sessionId)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-100 dark:border-gray-800'
                                    }`}
                                >
                                    <div className="font-medium">{session.courseTitle}</div>
                                    <div className="text-gray-500">
                                        {session.startTime}{' '}
                                        {session.room ? `• ${session.room}` : ''}
                                    </div>
                                    {session.type === COURSE_TYPE.ONLINE_LIVE && (
                                        <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                            {session.mode === 'upcoming' &&
                                                `Башталышына: ${formatCountdown(
                                                    new Date(session.startsAt).getTime(),
                                                    nowMs
                                                )}`}
                                            {session.mode === 'live' &&
                                                `Live: ${formatCountdown(
                                                    new Date(session.endsAt).getTime(),
                                                    nowMs
                                                )}`}
                                            {session.mode === 'completed' && 'Аяктаган'}
                                        </div>
                                    )}
                                    {session.type === COURSE_TYPE.ONLINE_LIVE &&
                                        session.joinUrl && (
                                            <div className="mt-2">
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        if (!session.joinAllowed) return;
                                                        e.preventDefault();
                                                        joinLiveSession(session.joinUrl);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === 'Enter' &&
                                                            session.joinAllowed
                                                        ) {
                                                            e.preventDefault();
                                                            joinLiveSession(session.joinUrl);
                                                        }
                                                    }}
                                                    className={`inline-flex px-2 py-1 rounded text-white text-xs ${
                                                        session.joinAllowed
                                                            ? 'bg-blue-600'
                                                            : 'bg-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    Join
                                                </span>
                                                {!session.joinAllowed && (
                                                    <div className="mt-1 text-[11px] text-gray-500">
                                                        Join 10 мүнөт мурун ачылат
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </button>
                            ))}
                            {sessionsToday.length === 0 && (
                                <div className="text-gray-500">Бүгүн сессия жок.</div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-[#E8ECF3]">
                            Engagement Stats
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Катышкан</span>
                                <span>{attendanceStats.present}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Кечиккен</span>
                                <span>{attendanceStats.late}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Келбеген</span>
                                <span>{attendanceStats.absent}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                <div
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${attendanceStats.presentRate}%` }}
                                />
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};

const KpiCard = ({ label, value }) => (
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <div className="text-xs text-gray-500 dark:text-[#a6adba]">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">{value}</div>
    </div>
);

const Card = ({ title, children }) => (
    <div className="bg-white dark:bg-[#0f1114] border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <h4 className="font-medium mb-2 text-gray-900 dark:text-[#E8ECF3]">{title}</h4>
        {children}
    </div>
);

const statusOptions = Object.values(SESSION_ATTENDANCE_STATUS).map((status) => ({
    value: status,
    label: statusMeta[sessionStatusMap[status] || ATTENDANCE_STATUS.ABSENT]?.label || status,
    className:
        statusMeta[sessionStatusMap[status] || ATTENDANCE_STATUS.ABSENT]?.className ||
        'bg-gray-100 text-gray-600',
}));

KpiCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

Card.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default SessionWorkspace;

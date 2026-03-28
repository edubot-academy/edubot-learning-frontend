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
    fetchInstructorCourses,
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
import {
    FiAlertCircle,
    FiActivity,
    FiBookOpen,
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiEdit3,
    FiFileText,
    FiLayers,
    FiPlayCircle,
    FiRadio,
    FiSearch,
    FiUsers,
    FiXCircle,
} from 'react-icons/fi';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    EmptyState,
    StatusBadge,
} from '../components/ui/dashboard';
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

const SESSION_MODE_META = {
    upcoming: {
        label: 'Күтүүдө',
        badgeClass:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        icon: FiClock,
    },
    live: {
        label: 'Түз эфирде',
        badgeClass:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        icon: FiRadio,
    },
    completed: {
        label: 'Аяктаган',
        badgeClass:
            'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: FiCheckCircle,
    },
    scheduled: {
        label: 'Пландалган',
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        icon: FiCalendar,
    },
};

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

const formatDisplayDate = (value, fallback = 'Мөөнөт коюлган эмес') => {
    if (!value) return fallback;
    const normalized =
        typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('ky-KG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getHomeworkDeadlineMeta = (item, nowMs) => {
    const raw = item?.deadline || item?.dueAt || item?.dueDate;
    if (!raw) {
        return {
            label: 'Мөөнөт жок',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
            sortValue: Number.MAX_SAFE_INTEGER,
            key: 'noDeadline',
        };
    }

    const normalized = typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T23:59:59` : raw;
    const deadlineMs = new Date(normalized).getTime();
    if (Number.isNaN(deadlineMs)) {
        return {
            label: 'Мөөнөт белгисиз',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
            sortValue: Number.MAX_SAFE_INTEGER - 1,
            key: 'unknown',
        };
    }

    const daysLeft = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
    if (deadlineMs < nowMs) {
        return {
            label: 'Өтүп кеткен',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
            sortValue: deadlineMs,
            key: 'overdue',
        };
    }
    if (daysLeft <= 3) {
        return {
            label: 'Жакында бүтөт',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
            sortValue: deadlineMs,
            key: 'dueSoon',
        };
    }

    return {
        label: 'Активдүү',
        badgeClass:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        sortValue: deadlineMs,
        key: 'active',
    };
};

const getSubmissionStatusMeta = (status) => {
    const normalized = String(status || 'submitted').toLowerCase();
    if (['approved', 'completed', 'reviewed', 'accepted'].includes(normalized)) {
        return {
            label: 'Бекитилди',
            badgeClass:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }
    if (['rejected', 'declined', 'needs_revision'].includes(normalized)) {
        return {
            label: 'Кайтарылды',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    return {
        label: 'Күтүүдө',
        badgeClass:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    };
};

const getSubmissionPreview = (submission) =>
    submission?.content ||
    submission?.submissionText ||
    submission?.text ||
    submission?.description ||
    submission?.answer ||
    submission?.note ||
    submission?.comment ||
    submission?.fileUrl ||
    submission?.attachmentUrl ||
    submission?.submissionUrl ||
    'Жооп текшерүү үчүн жүктөлгөн.';

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
    const [workspaceEntity, setWorkspaceEntity] = useState('group');
    const [workspaceMode, setWorkspaceMode] = useState('create');

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
    const [homeworkQuery, setHomeworkQuery] = useState('');
    const [homeworkFilter, setHomeworkFilter] = useState('all');
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
                const data = await fetchInstructorCourses({ status: 'approved' });
                if (cancelled) return;

                const teachingCourses = (Array.isArray(data?.courses) ? data.courses : []).filter(
                    (course) => {
                        const type = course?.courseType || course?.type;
                        return type === COURSE_TYPE.OFFLINE || type === COURSE_TYPE.ONLINE_LIVE;
                    }
                );
                setCourses(teachingCourses);

                if (teachingCourses.length > 0) {
                    setSelectedCourseId(String(teachingCourses[0].id));
                } else {
                    setSelectedCourseId('');
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
                const response = await fetchSessionHomework(Number(selectedSessionId), { includeUnpublished: true });
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

    const homeworkCards = useMemo(
        () =>
            publishedHomework
                .map((item) => ({
                    ...item,
                    deadlineMeta: getHomeworkDeadlineMeta(item, nowMs),
                }))
                .sort((a, b) => a.deadlineMeta.sortValue - b.deadlineMeta.sortValue),
        [publishedHomework, nowMs]
    );

    const filteredHomework = useMemo(() => {
        const query = homeworkQuery.trim().toLowerCase();
        return homeworkCards.filter((item) => {
            const matchesQuery =
                !query ||
                [item.title, item.name, item.description]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));
            const matchesFilter = homeworkFilter === 'all' || item.deadlineMeta.key === homeworkFilter;
            return matchesQuery && matchesFilter;
        });
    }, [homeworkCards, homeworkFilter, homeworkQuery]);

    const homeworkStats = useMemo(() => {
        const overdue = homeworkCards.filter((item) => item.deadlineMeta.key === 'overdue').length;
        const dueSoon = homeworkCards.filter((item) => item.deadlineMeta.key === 'dueSoon').length;
        const open = homeworkCards.filter((item) =>
            ['active', 'dueSoon', 'noDeadline', 'unknown'].includes(item.deadlineMeta.key)
        ).length;
        return {
            total: homeworkCards.length,
            open,
            dueSoon,
            overdue,
        };
    }, [homeworkCards]);

    const selectedHomeworkMeta = useMemo(
        () => (selectedHomework ? getHomeworkDeadlineMeta(selectedHomework, nowMs) : null),
        [selectedHomework, nowMs]
    );

    const submissionStats = useMemo(() => {
        const approved = homeworkSubmissions.filter((item) =>
            ['approved', 'completed', 'reviewed', 'accepted'].includes(
                String(item.status || '').toLowerCase()
            )
        ).length;
        const rejected = homeworkSubmissions.filter((item) =>
            ['rejected', 'declined', 'needs_revision'].includes(
                String(item.status || '').toLowerCase()
            )
        ).length;
        return {
            total: homeworkSubmissions.length,
            approved,
            rejected,
            pending: Math.max(0, homeworkSubmissions.length - approved - rejected),
        };
    }, [homeworkSubmissions]);

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
                isPublished: false,
                assignedStudentIds,
            });

            const refreshed = await fetchSessionHomework(Number(selectedSessionId), { includeUnpublished: true });
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
                isPublished: true,
            });

            const refreshed = await fetchSessionHomework(Number(selectedSessionId), { includeUnpublished: true });
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

    const toggleHomeworkPublish = async (homeworkId, currentStatus) => {
        if (!selectedSessionId || !homeworkId) return;

        try {
            await updateSessionHomework(Number(selectedSessionId), Number(homeworkId), {
                isPublished: !currentStatus,
            });

            const refreshed = await fetchSessionHomework(Number(selectedSessionId), { includeUnpublished: true });
            const items = toArray(refreshed);
            setPublishedHomework(items);

            toast.success(!currentStatus ? 'Үй тапшырма жарыяланды.' : 'Үй тапшырма жарыялоодон алынды.');
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, 'Үй тапшырма статусун өзгөртүү катасы'));
        }
    };

    const selectedModeMeta = SESSION_MODE_META[selectedSessionMode] || SESSION_MODE_META.scheduled;
    const SelectedModeIcon = selectedModeMeta.icon;
    const isGroupWorkspace = workspaceEntity === 'group';
    const isCreateWorkspace = workspaceMode === 'create';
    const workspaceTitle = isGroupWorkspace
        ? isCreateWorkspace
            ? 'Create Group'
            : 'Edit Group'
        : isCreateWorkspace
            ? 'Create Session'
            : 'Edit Session';
    const workspaceDescription = isGroupWorkspace
        ? isCreateWorkspace
            ? 'Курс үчүн жаңы группаны негизги маалымат, график жана жеткирүү параметрлери менен түзүңүз.'
            : 'Тандалган группанын маалыматтарын жаңыртыңыз.'
        : isCreateWorkspace
            ? 'Тандалган группа үчүн жаңы сессия түзүп, убактысын жана материалдарын бекитиңиз.'
            : 'Тандалган сессиянын убактысын жана статусун жаңыртыңыз.';
    const workspaceDisabled = isGroupWorkspace
        ? isCreateWorkspace
            ? !selectedCourseId
            : !selectedGroupId
        : isCreateWorkspace
            ? !selectedGroupId
            : !selectedSessionId;
    const workspaceDisabledReason = isGroupWorkspace
        ? isCreateWorkspace
            ? 'Жаңы группа түзүү үчүн курс тандаңыз.'
            : 'Edit mode үчүн группа тандаңыз.'
        : isCreateWorkspace
            ? 'Жаңы сессия түзүү үчүн группа тандаңыз.'
            : 'Edit mode үчүн сессия тандаңыз.';
    const workspaceActionLabel = isGroupWorkspace
        ? isCreateWorkspace
            ? savingGroup
                ? 'Түзүлүүдө...'
                : 'Create Group'
            : savingGroupUpdate
                ? 'Жаңыртылууда...'
                : 'Update Group'
        : isCreateWorkspace
            ? savingSession
                ? 'Түзүлүүдө...'
                : 'Create Session'
            : savingSessionUpdate
                ? 'Жаңыртылууда...'
                : 'Update Session';
    const workspaceAction = isGroupWorkspace
        ? isCreateWorkspace
            ? createQuickGroup
            : updateSelectedGroup
        : isCreateWorkspace
            ? createQuickSession
            : updateSelectedSession;
    const workspaceSaving = isGroupWorkspace
        ? isCreateWorkspace
            ? savingGroup
            : savingGroupUpdate
        : isCreateWorkspace
            ? savingSession
            : savingSessionUpdate;

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-6">
            {!loadingCourses && courses.length === 0 ? (
                <div className="dashboard-panel p-6">
                    <EmptyState
                        title="Session workspace азырынча жеткиликтүү эмес"
                        subtitle="Бул бөлүм оффлайн же онлайн түз эфир форматындагы бекитилген курстар үчүн ачылат. Алгач ушундай курс түзүңүз же бекитилген курс кошулушун күтүңүз."
                    />
                </div>
            ) : null}

            {courses.length > 0 ? (
                <div className="space-y-6">
                    <DashboardWorkspaceHero
                        className="dashboard-panel"
                        eyebrow="Session Workspace"
                        title="Instructor Session Workspace"
                        description="Сессияларды, группаларды жана жандуу сабак агымдарын бир жерден көзөмөлдөңүз."
                        metrics={(
                            <>
                                <DashboardMetricCard
                                    label="Бүгүнкү сессиялар"
                                    value={sessionsToday.length}
                                    icon={FiCalendar}
                                />
                                <DashboardMetricCard
                                    label="Катышуу %"
                                    value={`${attendanceStats.presentRate}%`}
                                    icon={FiActivity}
                                />
                                <DashboardMetricCard
                                    label="Тапшырма жарыяланды"
                                    value={publishedHomework.length}
                                    icon={FiBookOpen}
                                />
                                <DashboardMetricCard
                                    label="Кооптуу студенттер"
                                    value={students.length - attendanceStats.present}
                                    icon={FiUsers}
                                    tone="amber"
                                />
                            </>
                        )}
                        metricsClassName="grid grid-cols-2 gap-3 xl:grid-cols-4"
                    >
                        <DashboardFilterBar gridClassName="xl:grid-cols-[minmax(0,1fr),minmax(0,1fr),minmax(0,1fr),minmax(0,1fr)]">
                            <div className="max-w-2xl xl:col-span-4">
                                <p className="text-sm leading-6 text-edubot-muted dark:text-slate-300">
                                    Сессияларды, группаларды жана жандуу сабак агымдарын бир жерден көзөмөлдөңүз.
                                </p>
                            </div>
                            <div className="text-sm">
                                <span className="mb-1.5 inline-flex items-center gap-2 font-medium text-edubot-ink dark:text-white">
                                    <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                                    Курс
                                </span>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    disabled={loadingCourses}
                                    className="dashboard-select w-full"
                                >
                                    <option value="">Курс тандаңыз</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title || course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm">
                                <span className="mb-1.5 inline-flex items-center gap-2 font-medium text-edubot-ink dark:text-white">
                                    <FiLayers className="h-4 w-4 text-edubot-orange" />
                                    Группа
                                </span>
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    disabled={!selectedCourseId || loadingGroups}
                                    className="dashboard-select w-full disabled:opacity-60"
                                >
                                    <option value="">Группа</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name || group.code || `Group #${group.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm">
                                <span className="mb-1.5 inline-flex items-center gap-2 font-medium text-edubot-ink dark:text-white">
                                    <FiPlayCircle className="h-4 w-4 text-edubot-orange" />
                                    Сессия
                                </span>
                                <select
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                    disabled={!selectedGroupId || loadingSessions}
                                    className="dashboard-select w-full disabled:opacity-60"
                                >
                                    <option value="">Сессия</option>
                                    {sessions.map((session) => (
                                        <option key={session.id} value={session.id}>
                                            {session.title || `Session #${session.sessionIndex || session.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm">
                                <span className="mb-1.5 inline-flex items-center gap-2 font-medium text-edubot-ink dark:text-white">
                                    <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                    Дата
                                </span>
                                <input
                                    type="date"
                                    value={sessionDate}
                                    onChange={(e) => setSessionDate(e.target.value)}
                                    className="dashboard-field w-full"
                                />
                            </div>
                        </DashboardFilterBar>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <ContextPill label="Курс" value={selectedCourse?.title || selectedCourse?.name || 'Тандала элек'} />
                            <ContextPill label="Группа" value={selectedGroup?.name || selectedGroup?.code || 'Тандала элек'} />
                            <ContextPill label="Сессия" value={selectedSession?.title || (selectedSession ? `Session #${selectedSession.sessionIndex || selectedSession.id}` : 'Тандала элек')} />
                        </div>
                    </DashboardWorkspaceHero>

                    <section className="dashboard-panel p-5 space-y-5">
                        <div className="grid gap-4 xl:grid-cols-[280px,minmax(0,1fr)]">
                            <DashboardInsetPanel
                                title="Workspace control"
                                description="Бир учурда бир объект жана бир режим менен иштеңиз."
                            >
                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                            Объект
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setWorkspaceEntity('group')}
                                                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${isGroupWorkspace
                                                    ? 'bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-edubot-soft'
                                                    : 'bg-white text-edubot-ink shadow-sm dark:bg-slate-950 dark:text-slate-200'
                                                    }`}
                                            >
                                                Group
                                            </button>
                                            <button
                                                onClick={() => setWorkspaceEntity('session')}
                                                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${!isGroupWorkspace
                                                    ? 'bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-edubot-soft'
                                                    : 'bg-white text-edubot-ink shadow-sm dark:bg-slate-950 dark:text-slate-200'
                                                    }`}
                                            >
                                                Session
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                            Режим
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setWorkspaceMode('create')}
                                                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${isCreateWorkspace
                                                    ? 'bg-edubot-dark text-white shadow-edubot-card'
                                                    : 'bg-white text-edubot-ink shadow-sm dark:bg-slate-950 dark:text-slate-200'
                                                    }`}
                                            >
                                                Create
                                            </button>
                                            <button
                                                onClick={() => setWorkspaceMode('edit')}
                                                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${!isCreateWorkspace
                                                    ? 'bg-edubot-dark text-white shadow-edubot-card'
                                                    : 'bg-white text-edubot-ink shadow-sm dark:bg-slate-950 dark:text-slate-200'
                                                    }`}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 rounded-[1.25rem] border border-edubot-line/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/80">
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            Контекст
                                        </div>
                                        <div className="text-sm text-edubot-ink dark:text-white">
                                            <span className="font-semibold">Курс:</span>{' '}
                                            {selectedCourse?.title || selectedCourse?.name || 'Тандала элек'}
                                        </div>
                                        <div className="text-sm text-edubot-ink dark:text-white">
                                            <span className="font-semibold">Группа:</span>{' '}
                                            {selectedGroup?.name || selectedGroup?.code || 'Тандала элек'}
                                        </div>
                                        <div className="text-sm text-edubot-ink dark:text-white">
                                            <span className="font-semibold">Сессия:</span>{' '}
                                            {selectedSession?.title ||
                                                (selectedSession
                                                    ? `Session #${selectedSession.sessionIndex || selectedSession.id}`
                                                    : 'Тандала элек')}
                                        </div>
                                    </div>

                                    {workspaceDisabled ? (
                                        <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                            {workspaceDisabledReason}
                                        </div>
                                    ) : null}
                                </div>
                            </DashboardInsetPanel>

                            <DashboardInsetPanel
                                title={workspaceTitle}
                                description={workspaceDescription}
                            >
                                <div className="space-y-5">
                                    {isGroupWorkspace ? (
                                        <>
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                    Basics
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <input
                                                        value={isCreateWorkspace ? quickGroup.name : editGroup.name}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, name: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, name: e.target.value }))
                                                        }
                                                        placeholder="Group name *"
                                                        className="dashboard-field md:col-span-2"
                                                    />
                                                    <input
                                                        value={isCreateWorkspace ? quickGroup.code : editGroup.code}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, code: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, code: e.target.value }))
                                                        }
                                                        placeholder="Group code *"
                                                        className="dashboard-field"
                                                    />
                                                    <select
                                                        value={isCreateWorkspace ? quickGroup.status : editGroup.status}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, status: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, status: e.target.value }))
                                                        }
                                                        className="dashboard-field dashboard-select"
                                                    >
                                                        {Object.values(COURSE_GROUP_STATUS).map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                    Schedule
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                    <input
                                                        type="date"
                                                        value={isCreateWorkspace ? quickGroup.startDate : editGroup.startDate}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, startDate: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, startDate: e.target.value }))
                                                        }
                                                        className="dashboard-field"
                                                    />
                                                    <input
                                                        type="date"
                                                        value={isCreateWorkspace ? quickGroup.endDate : editGroup.endDate}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, endDate: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, endDate: e.target.value }))
                                                        }
                                                        className="dashboard-field"
                                                    />
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={isCreateWorkspace ? quickGroup.seatLimit : editGroup.seatLimit}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, seatLimit: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, seatLimit: e.target.value }))
                                                        }
                                                        placeholder="Seat limit"
                                                        className="dashboard-field"
                                                    />
                                                    <input
                                                        value={isCreateWorkspace ? quickGroup.timezone : editGroup.timezone}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, timezone: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, timezone: e.target.value }))
                                                        }
                                                        placeholder="Timezone"
                                                        className="dashboard-field"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                    Delivery
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <input
                                                        value={isCreateWorkspace ? quickGroup.location : editGroup.location}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, location: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, location: e.target.value }))
                                                        }
                                                        placeholder="Location"
                                                        className="dashboard-field md:col-span-2"
                                                    />
                                                    <select
                                                        value={isCreateWorkspace ? quickGroup.meetingProvider : editGroup.meetingProvider}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, meetingProvider: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, meetingProvider: e.target.value }))
                                                        }
                                                        className="dashboard-field dashboard-select"
                                                    >
                                                        <option value="">Meeting provider</option>
                                                        {Object.values(MEETING_PROVIDER).map((provider) => (
                                                            <option key={provider} value={provider}>
                                                                {provider}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        value={isCreateWorkspace ? quickGroup.instructorId : editGroup.instructorId}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, instructorId: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, instructorId: e.target.value }))
                                                        }
                                                        placeholder="Instructor ID"
                                                        className="dashboard-field"
                                                    />
                                                    <input
                                                        value={isCreateWorkspace ? quickGroup.meetingUrl : editGroup.meetingUrl}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickGroup((prev) => ({ ...prev, meetingUrl: e.target.value }))
                                                                : setEditGroup((prev) => ({ ...prev, meetingUrl: e.target.value }))
                                                        }
                                                        placeholder="Meeting URL"
                                                        className="dashboard-field md:col-span-2"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                    Basics
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={isCreateWorkspace ? quickSession.sessionIndex : editSession.sessionIndex}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickSession((prev) => ({ ...prev, sessionIndex: e.target.value }))
                                                                : setEditSession((prev) => ({ ...prev, sessionIndex: e.target.value }))
                                                        }
                                                        placeholder="Session index *"
                                                        className="dashboard-field"
                                                    />
                                                    <select
                                                        value={isCreateWorkspace ? quickSession.status : editSession.status}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickSession((prev) => ({ ...prev, status: e.target.value }))
                                                                : setEditSession((prev) => ({ ...prev, status: e.target.value }))
                                                        }
                                                        className="dashboard-field dashboard-select"
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
                                                        value={isCreateWorkspace ? quickSession.title : editSession.title}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickSession((prev) => ({ ...prev, title: e.target.value }))
                                                                : setEditSession((prev) => ({ ...prev, title: e.target.value }))
                                                        }
                                                        placeholder="Session title *"
                                                        className="dashboard-field md:col-span-2"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                    Schedule
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <input
                                                        type="datetime-local"
                                                        value={isCreateWorkspace ? quickSession.startsAt : editSession.startsAt}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickSession((prev) => ({ ...prev, startsAt: e.target.value }))
                                                                : setEditSession((prev) => ({ ...prev, startsAt: e.target.value }))
                                                        }
                                                        className="dashboard-field"
                                                    />
                                                    <input
                                                        type="datetime-local"
                                                        value={isCreateWorkspace ? quickSession.endsAt : editSession.endsAt}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickSession((prev) => ({ ...prev, endsAt: e.target.value }))
                                                                : setEditSession((prev) => ({ ...prev, endsAt: e.target.value }))
                                                        }
                                                        className="dashboard-field"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                    Materials & recording
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <input
                                                        value={isCreateWorkspace ? quickSession.recordingUrl : editSession.recordingUrl}
                                                        onChange={(e) =>
                                                            isCreateWorkspace
                                                                ? setQuickSession((prev) => ({ ...prev, recordingUrl: e.target.value }))
                                                                : setEditSession((prev) => ({ ...prev, recordingUrl: e.target.value }))
                                                        }
                                                        placeholder="Recording URL"
                                                        className="dashboard-field md:col-span-2"
                                                    />
                                                    {isCreateWorkspace ? (
                                                        <>
                                                            <input
                                                                value={quickSession.materialTitle}
                                                                onChange={(e) =>
                                                                    setQuickSession((prev) => ({ ...prev, materialTitle: e.target.value }))
                                                                }
                                                                placeholder="Material title"
                                                                className="dashboard-field"
                                                            />
                                                            <input
                                                                value={quickSession.materialUrl}
                                                                onChange={(e) =>
                                                                    setQuickSession((prev) => ({ ...prev, materialUrl: e.target.value }))
                                                                }
                                                                placeholder="Material URL"
                                                                className="dashboard-field"
                                                            />
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center justify-between gap-3 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                                            {workspaceDisabled ? workspaceDisabledReason : 'Бардык өзгөртүүлөрдү ушул жерде сактаңыз.'}
                                        </p>
                                        <button
                                            onClick={workspaceAction}
                                            disabled={workspaceDisabled || workspaceSaving}
                                            className="dashboard-button-primary"
                                        >
                                            {workspaceActionLabel}
                                        </button>
                                    </div>
                                </div>
                            </DashboardInsetPanel>
                        </div>

                        <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-edubot-line/70 bg-edubot-surfaceAlt/70 p-2 dark:border-slate-700 dark:bg-slate-900/70">
                            {tabList.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${activeTab === tab.id
                                        ? 'border-edubot-orange bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-edubot-soft'
                                        : 'border-transparent bg-white text-edubot-ink hover:border-edubot-line dark:bg-slate-950 dark:text-[#E8ECF3]'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {selectedSession &&
                            normalizeCourseType(selectedCourse, selectedSession, selectedGroup) ===
                            COURSE_TYPE.ONLINE_LIVE && (
                                <div className="dashboard-panel-muted flex flex-wrap items-center justify-between gap-3 p-4">
                                    <div className="text-sm">
                                        <div className="flex items-center gap-2 font-medium text-edubot-ink dark:text-white">
                                            <StatusBadge tone={selectedModeMeta.tone || 'default'} className="gap-1">
                                                <SelectedModeIcon className="h-3.5 w-3.5" />
                                                {selectedModeMeta.label}
                                            </StatusBadge>
                                            Онлайн Live сессия
                                        </div>
                                        <div className="mt-1 text-edubot-muted dark:text-slate-300">
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
                                        className="dashboard-button-primary"
                                    >
                                        Join Class
                                    </button>
                                    {!selectedSessionJoinAllowed &&
                                        selectedSessionMode !== 'completed' && (
                                            <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                Join 10 мүнөт калганда ачылат.
                                            </div>
                                        )}
                                </div>
                            )}

                        {activeTab === 'attendance' && (
                            <div className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-4">
                                    <DashboardMetricCard
                                        label="Жалпы студент"
                                        value={attendanceStats.total}
                                        icon={FiUsers}
                                    />
                                    <DashboardMetricCard
                                        label="Катышты"
                                        value={attendanceStats.present}
                                        tone="green"
                                        icon={FiCheckCircle}
                                    />
                                    <DashboardMetricCard
                                        label="Кечикти"
                                        value={attendanceStats.late}
                                        tone="amber"
                                        icon={FiClock}
                                    />
                                    <DashboardMetricCard
                                        label="Келген жок"
                                        value={attendanceStats.absent}
                                        tone="red"
                                        icon={FiActivity}
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                        Студенттик катышууну бул сессия үчүн белгилеп, бир жолу сактаңыз.
                                    </div>
                                    <button
                                        onClick={saveAttendance}
                                        disabled={
                                            savingAttendance || loadingStudents || !selectedCourseId
                                        }
                                        className="dashboard-button-primary"
                                    >
                                        {savingAttendance ? 'Сакталууда...' : 'Катышууну сактоо'}
                                    </button>
                                </div>

                                {loadingStudents ? (
                                    <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                                        Студенттер жүктөлүүдө...
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                                        Студент табылган жок.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 xl:grid-cols-2">
                                        {students.map((student) => {
                                            const currentStatus = attendanceRows[student.id]?.status;
                                            const streak = studentStreaks[student.id] || 0;

                                            return (
                                                <article
                                                    key={student.id}
                                                    className="rounded-[1.5rem] border border-edubot-line/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-sm font-bold text-edubot-dark dark:bg-slate-800 dark:text-edubot-soft">
                                                            {student.fullName
                                                                .split(' ')
                                                                .filter(Boolean)
                                                                .slice(0, 2)
                                                                .map((part) => part[0]?.toUpperCase())
                                                                .join('') || 'S'}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                                                    {student.fullName}
                                                                </h3>
                                                                <StatusBadge tone="default" className="gap-1">
                                                                    <FiActivity className="h-3.5 w-3.5" />
                                                                    {streak} күн streak
                                                                </StatusBadge>
                                                            </div>

                                                            <div className="mt-4 grid gap-3">
                                                                <div>
                                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                                        Катышуу
                                                                    </p>
                                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                                        {statusOptions.map((status) => (
                                                                            <button
                                                                                key={status.value}
                                                                                onClick={() =>
                                                                                    updateStatus(
                                                                                        student.id,
                                                                                        status.value
                                                                                    )
                                                                                }
                                                                                className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${currentStatus === status.value
                                                                                    ? status.className
                                                                                    : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                                                                                    }`}
                                                                            >
                                                                                {status.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                                        Эскертүү
                                                                    </p>
                                                                    <input
                                                                        value={attendanceRows[student.id]?.notes || ''}
                                                                        onChange={(e) =>
                                                                            updateNotes(student.id, e.target.value)
                                                                        }
                                                                        className="dashboard-field"
                                                                        placeholder="Эскертүү"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
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
                            !selectedSessionId ? (
                                <EmptyState
                                    title="Үй тапшырма үчүн сессия тандаңыз"
                                    subtitle="Тапшырма жарыялоо, өзгөртүү жана студент жоопторун текшерүү үчүн алгач активдүү группадан бир сессияны тандаңыз."
                                    icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                                    className="dashboard-panel"
                                />
                            ) : (
                                <div className="space-y-5">
                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                        <DashboardMetricCard
                                            label="Жалпы тапшырма"
                                            value={homeworkStats.total}
                                            icon={FiBookOpen}
                                        />
                                        <DashboardMetricCard
                                            label="Активдүү"
                                            value={homeworkStats.open}
                                            icon={FiActivity}
                                            tone="green"
                                        />
                                        <DashboardMetricCard
                                            label="Жакында бүтөт"
                                            value={homeworkStats.dueSoon}
                                            icon={FiClock}
                                            tone="amber"
                                        />
                                        <DashboardMetricCard
                                            label="Өтүп кеткен"
                                            value={homeworkStats.overdue}
                                            icon={FiAlertCircle}
                                            tone="red"
                                        />
                                    </div>

                                    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                                        <DashboardInsetPanel
                                            title="Тапшырма жарыялоо"
                                            description="Сессияга байланышкан тапшырманы түзүп, ушул группанын бардык студенттерине бир эле агымда дайындаңыз."
                                            action={
                                                <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                                    {students.length} студент
                                                </span>
                                            }
                                        >
                                            <div className="mt-4 space-y-4">
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                            Аталышы
                                                        </label>
                                                        <input
                                                            value={homeworkTitle}
                                                            onChange={(e) => setHomeworkTitle(e.target.value)}
                                                            placeholder="Мисалы: Lesson 5 reflection"
                                                            className="dashboard-field"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                            Түшүндүрмө
                                                        </label>
                                                        <textarea
                                                            value={homeworkDescription}
                                                            onChange={(e) => setHomeworkDescription(e.target.value)}
                                                            rows={5}
                                                            placeholder="Эмне тапшырыш керек, кайсы форматта жана кандай бааланат..."
                                                            className="dashboard-field"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                            Deadline
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={homeworkDeadline}
                                                            onChange={(e) => setHomeworkDeadline(e.target.value)}
                                                            className="dashboard-field"
                                                        />
                                                    </div>
                                                    <div className="dashboard-panel-muted flex items-center justify-between rounded-2xl px-4 py-3">
                                                        <div>
                                                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                                Дайындалат
                                                            </div>
                                                            <div className="mt-1 text-sm font-semibold text-edubot-ink dark:text-white">
                                                                {selectedGroup?.name || selectedGroup?.code || 'Группа тандалган жок'}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                                Сессия
                                                            </div>
                                                            <div className="mt-1 text-sm font-semibold text-edubot-ink dark:text-white">
                                                                {selectedSession?.title || `#${selectedSessionId}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <p className="text-sm text-edubot-muted dark:text-slate-400">
                                                        Жарыялангандан кийин тапшырма ушул сессиянын бардык студенттерине дароо байланат.
                                                    </p>
                                                    <button
                                                        onClick={publishHomework}
                                                        disabled={!selectedSessionId || savingHomework}
                                                        className="dashboard-button-primary"
                                                    >
                                                        {savingHomework ? 'Жарыяланып жатат...' : 'Үй тапшырмасын жарыялоо'}
                                                    </button>
                                                </div>
                                            </div>
                                        </DashboardInsetPanel>

                                        <DashboardInsetPanel
                                            title="Тапшырмалар тизмеси"
                                            description="Издеп табыңыз, deadline абалы боюнча чыпкалап, керектүүсүн тандап текшерүүгө өтүңүз."
                                            action={
                                                <StatusBadge tone="default">
                                                    {publishedHomework.length}
                                                </StatusBadge>
                                            }
                                        >
                                            <DashboardFilterBar className="mt-4" gridClassName="lg:grid-cols-[minmax(0,1fr),180px]">
                                                <div className="relative flex-1">
                                                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                                                    <input
                                                        value={homeworkQuery}
                                                        onChange={(e) => setHomeworkQuery(e.target.value)}
                                                        placeholder="Тапшырма издөө"
                                                        className="dashboard-field-icon pl-10"
                                                    />
                                                </div>
                                                <select
                                                    value={homeworkFilter}
                                                    onChange={(e) => setHomeworkFilter(e.target.value)}
                                                    className="dashboard-select w-full"
                                                >
                                                    <option value="all">Баары</option>
                                                    <option value="active">Активдүү</option>
                                                    <option value="dueSoon">Жакында бүтөт</option>
                                                    <option value="overdue">Өтүп кеткен</option>
                                                    <option value="noDeadline">Мөөнөт жок</option>
                                                </select>
                                            </DashboardFilterBar>

                                            {loadingHomework && (
                                                <div className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                                                    Үй тапшырмалар жүктөлүүдө...
                                                </div>
                                            )}

                                            <div className="mt-4 space-y-3 max-h-[28rem] overflow-auto pr-1">
                                                {filteredHomework.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => setSelectedHomeworkId(String(item.id))}
                                                        className={`w-full rounded-3xl border p-4 text-left transition cursor-pointer ${String(item.id) === String(selectedHomeworkId)
                                                            ? 'border-edubot-orange bg-white shadow-edubot-card dark:bg-slate-900'
                                                            : 'border-edubot-line/80 bg-white/80 hover:-translate-y-0.5 hover:border-edubot-orange/40 hover:shadow-edubot-card dark:border-slate-700 dark:bg-slate-950'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="font-medium text-edubot-ink dark:text-white">
                                                                    {item.title || item.name || 'Homework'}
                                                                </div>
                                                                <div className="mt-1 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                                                    {item.description || 'Түшүндүрмө кошула элек.'}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <StatusBadge
                                                                    tone={item.deadlineMeta.tone || 'default'}
                                                                    className="shrink-0 text-[11px]"
                                                                >
                                                                    {item.deadlineMeta.label}
                                                                </StatusBadge>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleHomeworkPublish(item.id, item.isPublished);
                                                                    }}
                                                                    className={`shrink-0 transition ${item.isPublished
                                                                        ? 'text-emerald-700 dark:text-emerald-300'
                                                                        : 'text-amber-700 dark:text-amber-300'
                                                                        }`}
                                                                >
                                                                    <StatusBadge
                                                                        tone={item.isPublished ? 'green' : 'amber'}
                                                                        className="text-[11px]"
                                                                    >
                                                                        {item.isPublished ? 'Жарыяланган' : 'Жарыяланбаган'}
                                                                    </StatusBadge>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-edubot-muted dark:text-slate-400">
                                                            <span>Deadline: {formatDisplayDate(item.deadline)}</span>
                                                            <span>Session: {selectedSession?.title || `#${selectedSessionId}`}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {!loadingHomework && filteredHomework.length === 0 && (
                                                    <div className="dashboard-panel-muted rounded-3xl p-6 text-sm text-edubot-muted dark:text-slate-400">
                                                        {publishedHomework.length === 0
                                                            ? 'Бул сессия боюнча үй тапшырма азырынча жок.'
                                                            : 'Издөө же фильтр боюнча тапшырма табылган жок.'}
                                                    </div>
                                                )}
                                            </div>
                                        </DashboardInsetPanel>
                                    </div>

                                    {selectedHomework ? (
                                        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                                            <DashboardInsetPanel
                                                title="Тандалган тапшырма"
                                                description="Тапшырманын мазмуну, deadline жана түзөтүү агымы ушул жерде."
                                                action={
                                                    <button
                                                        type="button"
                                                        onClick={() => beginHomeworkEdit(selectedHomework)}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiEdit3 className="h-4 w-4" />
                                                        Өзгөртүү
                                                    </button>
                                                }
                                            >
                                                <div className="mt-4 space-y-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                                {selectedHomework.title || selectedHomework.name || 'Homework'}
                                                            </div>
                                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                                                {selectedHomework.description || 'Түшүндүрмө кошула элек.'}
                                                            </p>
                                                        </div>
                                                        {selectedHomeworkMeta ? (
                                                            <StatusBadge tone={selectedHomeworkMeta.tone || 'default'}>
                                                                {selectedHomeworkMeta.label}
                                                            </StatusBadge>
                                                        ) : null}
                                                    </div>

                                                    <div className="grid gap-3 md:grid-cols-3">
                                                        <div className="dashboard-panel-muted rounded-2xl p-4">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                                Deadline
                                                            </div>
                                                            <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                                {formatDisplayDate(selectedHomework.deadline)}
                                                            </div>
                                                        </div>
                                                        <div className="dashboard-panel-muted rounded-2xl p-4">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                                Студенттер
                                                            </div>
                                                            <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                                {students.length} адамга дайындады
                                                            </div>
                                                        </div>
                                                        <div className="dashboard-panel-muted rounded-2xl p-4">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                                Текшерүү
                                                            </div>
                                                            <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                                {submissionStats.pending} жооп күтүп турат
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {editingHomeworkId === String(selectedHomework.id) && (
                                                        <DashboardInsetPanel
                                                            title="Тапшырманы өзгөртүү"
                                                            description="Аталышын, мазмунун же мөөнөтүн жаңыртып сактаңыз."
                                                        >
                                                            <div className="mt-4 space-y-3">
                                                                <input
                                                                    value={editHomeworkTitle}
                                                                    onChange={(e) => setEditHomeworkTitle(e.target.value)}
                                                                    className="dashboard-field"
                                                                />
                                                                <textarea
                                                                    value={editHomeworkDescription}
                                                                    onChange={(e) => setEditHomeworkDescription(e.target.value)}
                                                                    rows={4}
                                                                    className="dashboard-field"
                                                                />
                                                                <input
                                                                    type="date"
                                                                    value={editHomeworkDeadline}
                                                                    onChange={(e) => setEditHomeworkDeadline(e.target.value)}
                                                                    className="dashboard-field"
                                                                />
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={saveHomeworkEdit}
                                                                        disabled={updatingHomework}
                                                                        className="dashboard-button-primary"
                                                                    >
                                                                        {updatingHomework ? 'Сакталып жатат...' : 'Сактоо'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelHomeworkEdit}
                                                                        className="dashboard-button-secondary"
                                                                    >
                                                                        Жокко чыгаруу
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </DashboardInsetPanel>
                                                    )}
                                                </div>
                                            </DashboardInsetPanel>

                                            <DashboardInsetPanel
                                                title="Жоопторду текшерүү"
                                                description="Студент жоопторун карап чыгып, дароо кабыл алыңыз же кайра жөнөтүңүз."
                                                action={
                                                    <StatusBadge tone="default">
                                                        {submissionStats.total} жооп
                                                    </StatusBadge>
                                                }
                                            >
                                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                    <div className="dashboard-panel-muted rounded-2xl p-4">
                                                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                            Күтүүдө
                                                        </div>
                                                        <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                                            {submissionStats.pending}
                                                        </div>
                                                    </div>
                                                    <div className="dashboard-panel-muted rounded-2xl p-4">
                                                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                            Бекитилди
                                                        </div>
                                                        <div className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
                                                            {submissionStats.approved}
                                                        </div>
                                                    </div>
                                                    <div className="dashboard-panel-muted rounded-2xl p-4">
                                                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                            Кайтарылды
                                                        </div>
                                                        <div className="mt-2 text-2xl font-semibold text-red-700 dark:text-red-300">
                                                            {submissionStats.rejected}
                                                        </div>
                                                    </div>
                                                </div>

                                                {loadingHomeworkSubmissions && (
                                                    <div className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                                                        Submissionдер жүктөлүүдө...
                                                    </div>
                                                )}
                                                {!loadingHomeworkSubmissions && homeworkSubmissions.length === 0 && (
                                                    <div className="mt-4 dashboard-panel-muted p-6 text-sm text-edubot-muted dark:text-slate-400">
                                                        Жооп азырынча жок.
                                                    </div>
                                                )}
                                                <div className="mt-4 grid gap-3">
                                                    {homeworkSubmissions.map((submission) => {
                                                        const submissionMeta = getSubmissionStatusMeta(submission.status);
                                                        return (
                                                            <div
                                                                key={submission.id}
                                                                className="dashboard-panel-muted rounded-3xl p-4"
                                                            >
                                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <div className="font-medium text-sm text-edubot-ink dark:text-white">
                                                                                {submission.student?.fullName ||
                                                                                    submission.fullName ||
                                                                                    `#${submission.studentId || submission.userId}`}
                                                                            </div>
                                                                            <StatusBadge tone={submissionMeta.tone || 'default'} className="text-[11px]">
                                                                                {submissionMeta.label}
                                                                            </StatusBadge>
                                                                        </div>
                                                                        <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                                            Жөнөтүлгөн: {formatDisplayDate(submission.submittedAt, '-')}
                                                                        </div>
                                                                        <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                                <FiFileText className="h-4 w-4" />
                                                                                Жооп мазмуну
                                                                            </div>
                                                                            <p className="whitespace-pre-wrap break-words leading-6">
                                                                                {getSubmissionPreview(submission)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
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
                                                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                                                                        >
                                                                            <FiCheck className="h-4 w-4" />
                                                                            Бекитүү
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
                                                                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                                                                        >
                                                                            <FiXCircle className="h-4 w-4" />
                                                                            Кайтаруу
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </DashboardInsetPanel>
                                        </div>
                                    ) : (
                                        <DashboardInsetPanel
                                            title="Тапшырма тандаңыз"
                                            description="Тизменин ичинен бир тапшырманы тандасаңыз, мазмуну жана студент жооптору ушул жерде ачылат."
                                        >
                                            <EmptyState
                                                title="Тандалган тапшырма жок"
                                                subtitle="Сол жактагы тизме аркылуу бир тапшырманы тандап, дароо текшерүү агымына өтүңүз."
                                                icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                                                className="py-6"
                                            />
                                        </DashboardInsetPanel>
                                    )}
                                </div>
                            )
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

                    <div className="grid gap-4 lg:grid-cols-2">
                        <section className="dashboard-panel p-4">
                            <h3 className="mb-3 font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                Бүгүнкү сессиялар
                            </h3>
                            <div className="space-y-2 text-sm">
                                {sessionsToday.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => setSelectedSessionId(String(session.sessionId))}
                                        className={`w-full rounded-2xl border p-3 text-left transition ${String(selectedSessionId) === String(session.sessionId)
                                            ? 'border-edubot-orange bg-edubot-surface shadow-edubot-soft dark:bg-slate-900'
                                            : 'border-edubot-line/80 bg-white hover:border-edubot-orange/40 dark:border-slate-800 dark:bg-slate-950'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="font-medium text-edubot-ink dark:text-white">
                                                {session.courseTitle}
                                            </div>
                                            <StatusBadge tone={(SESSION_MODE_META[session.mode] || SESSION_MODE_META.scheduled).tone || 'default'} className="gap-1 text-[11px]">
                                                {(() => {
                                                    const SessionModeIcon = (SESSION_MODE_META[session.mode] || SESSION_MODE_META.scheduled).icon;
                                                    return <SessionModeIcon className="h-3.5 w-3.5" />;
                                                })()}
                                                {(SESSION_MODE_META[session.mode] || SESSION_MODE_META.scheduled).label}
                                            </StatusBadge>
                                        </div>
                                        <div className="mt-1 text-gray-500 dark:text-slate-400">
                                            {session.startTime}{' '}
                                            {session.room ? `• ${session.room}` : ''}
                                        </div>
                                        {session.type === COURSE_TYPE.ONLINE_LIVE && (
                                            <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
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
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white ${session.joinAllowed
                                                            ? 'bg-edubot-orange'
                                                            : 'bg-gray-400 cursor-not-allowed dark:bg-slate-700'
                                                            }`}
                                                    >
                                                        Join
                                                    </span>
                                                    {!session.joinAllowed && (
                                                        <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-500">
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

                        <section className="dashboard-panel p-4">
                            <h3 className="mb-3 font-semibold text-gray-900 dark:text-[#E8ECF3]">
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
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const Card = ({ title, children }) => <DashboardInsetPanel title={title}>{children}</DashboardInsetPanel>;

const ContextPill = ({ label, value }) => (
    <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
            {label}
        </div>
        <div className="mt-1 text-sm font-medium text-white">
            {value}
        </div>
    </div>
);

const statusOptions = Object.values(SESSION_ATTENDANCE_STATUS).map((status) => ({
    value: status,
    label: statusMeta[sessionStatusMap[status] || ATTENDANCE_STATUS.ABSENT]?.label || status,
    className:
        statusMeta[sessionStatusMap[status] || ATTENDANCE_STATUS.ABSENT]?.className ||
        'bg-gray-100 text-gray-600',
}));

Card.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

ContextPill.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default SessionWorkspace;

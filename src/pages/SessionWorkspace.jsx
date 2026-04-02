import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';
import {
    ATTENDANCE_STATUS,
    COURSE_SESSION_STATUS,
    COURSE_TYPE,
    MEETING_PROVIDER,
    SESSION_ATTENDANCE_STATUS,
} from '@shared/contracts';
import {
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
    fetchInstructorCourses,
    fetchSessionAttendance,
    importSessionAttendance,
    markSessionAttendanceBulk,
    syncSessionRecordings,
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
    FiExternalLink,
    FiFileText,
    FiLayers,
    FiPaperclip,
    FiPlayCircle,
    FiRadio,
    FiSearch,
    FiUsers,
    FiXCircle,
} from 'react-icons/fi';
import { fetchGroupRoster } from '@features/courseGroups/roster';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    EmptyState,
    StatusBadge,
} from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';

const JOIN_WINDOW_MS = 10 * 60 * 1000;

const toLocalDateKey = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

const getNextSessionIndex = (sessionList = []) => {
    const maxSessionIndex = sessionList.reduce((maxValue, session) => {
        const parsedIndex = Number(session?.sessionIndex);
        if (!Number.isFinite(parsedIndex)) return maxValue;
        return Math.max(maxValue, parsedIndex);
    }, 0);

    return String(maxSessionIndex + 1);
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

const resolveHomeworkDeadline = (item = {}) => item?.deadline || item?.dueAt || item?.dueDate || '';

const getHomeworkDeadlineMeta = (item, nowMs) => {
    const raw = resolveHomeworkDeadline(item);
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
    submission?.answerText ||
    submission?.description ||
    submission?.answer ||
    submission?.note ||
    submission?.comment ||
    submission?.fileUrl ||
    submission?.attachmentUrl ||
    submission?.submissionUrl ||
    'Жооп текшерүү үчүн жүктөлгөн.';

const getSubmissionAttachmentUrl = (submission) =>
    submission?.attachmentUrl || submission?.fileUrl || submission?.submissionUrl || '';

const getAttachmentName = (value) => {
    if (!value) return 'Тиркеме';
    try {
        const withoutQuery = String(value).split('?')[0];
        const lastSegment = withoutQuery.split('/').pop() || withoutQuery;
        return decodeURIComponent(lastSegment) || 'Тиркеме';
    } catch {
        return 'Тиркеме';
    }
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
    const [workspaceMode, setWorkspaceMode] = useState('create');
    const [isSessionSetupOpen, setIsSessionSetupOpen] = useState(false);

    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [sessions, setSessions] = useState([]);

    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');

    const [students, setStudents] = useState([]);
    const [attendanceRows, setAttendanceRows] = useState({});
    const [initialAttendanceRows, setInitialAttendanceRows] = useState({});
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [attendanceQuery, setAttendanceQuery] = useState('');
    const [attendanceFilter, setAttendanceFilter] = useState('all');

    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

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

    const [quickSession, setQuickSession] = useState(QUICK_SESSION_DEFAULT);
    const [editSession, setEditSession] = useState(EDIT_SESSION_DEFAULT);
    const [savingSession, setSavingSession] = useState(false);
    const [savingSessionUpdate, setSavingSessionUpdate] = useState(false);

    const [sessionNotes, setSessionNotes] = useState('');

    const [homeworkTitle, setHomeworkTitle] = useState('');
    const [homeworkDescription, setHomeworkDescription] = useState('');
    const [homeworkDeadline, setHomeworkDeadline] = useState('');
    const [publishedHomework, setPublishedHomework] = useState([]);
    const [homeworkLoadedSessionId, setHomeworkLoadedSessionId] = useState('');
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
    const sessionSetupModalRef = useRef(null);
    const previousModalFocusRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!isSessionSetupOpen || typeof document === 'undefined') return undefined;

        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [isSessionSetupOpen]);

    useEffect(() => {
        if (!isSessionSetupOpen || typeof document === 'undefined') return undefined;

        previousModalFocusRef.current = document.activeElement;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsSessionSetupOpen(false);
                return;
            }

            if (event.key !== 'Tab' || !sessionSetupModalRef.current) return;

            const focusableElements = sessionSetupModalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        const focusTimer = window.setTimeout(() => {
            const firstFocusable = sessionSetupModalRef.current?.querySelector(
                'input, select, textarea, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }, 0);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
            previousModalFocusRef.current?.focus?.();
        };
    }, [isSessionSetupOpen]);

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
                setSelectedCourseId((prev) => {
                    if (prev && teachingCourses.some((course) => String(course.id) === String(prev))) {
                        return prev;
                    }
                    return teachingCourses.length > 0 ? String(teachingCourses[0].id) : '';
                });
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
            setSessions([]);
            setSelectedSessionId('');
            return;
        }

        let cancelled = false;
        const loadGroups = async () => {
            setLoadingGroups(true);
            setGroups([]);
            setSelectedGroupId('');
            setSessions([]);
            setSelectedSessionId('');
            try {
                const res = await fetchCourseGroups({ courseId: Number(selectedCourseId) });
                if (cancelled) return;
                const list = toArray(res);
                setGroups(list);
                setSelectedGroupId((prev) => {
                    if (prev && list.some((group) => String(group.id) === String(prev))) {
                        return prev;
                    }
                    return list.length ? String(list[0].id) : '';
                });
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
            setSessions([]);
            setSelectedSessionId('');
            try {
                const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
                if (cancelled) return;
                const list = toArray(res);
                setSessions(list);
                setSelectedSessionId((prev) => {
                    if (prev && list.some((session) => String(session.id) === String(prev))) {
                        return prev;
                    }
                    return list[0]?.id ? String(list[0].id) : '';
                });
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
            sessionIndex: prev.sessionIndex || getNextSessionIndex(sessions),
        }));
    }, [sessions]);

    useEffect(() => {
        if (!selectedCourseId || !selectedGroupId) {
            setStudents([]);
            setAttendanceRows({});
            setInitialAttendanceRows({});
            return;
        }

        let cancelled = false;
        const loadStudentsAndHistory = async () => {
                setLoadingStudents(true);
            try {
                const [studentsRes, attendanceRes] = await Promise.all([
                    fetchGroupRoster({
                        groupId: Number(selectedGroupId),
                        page: 1,
                        limit: 200,
                    }),
                    fetchCourseAttendance({ courseId: Number(selectedCourseId) }),
                ]);
                if (cancelled) return;

                const normalized = studentsRes.map((item) => ({
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
                setInitialAttendanceRows(rowState);
                setAttendanceHistory(attendanceRes?.items || []);
            } catch (error) {
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Сессия маалыматтарын жүктөө катасы.'));
                setStudents([]);
                setAttendanceRows({});
                setInitialAttendanceRows({});
                setAttendanceHistory([]);
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        };

        loadStudentsAndHistory();
        return () => {
            cancelled = true;
        };
    }, [selectedCourseId, selectedGroupId]);

    useEffect(() => {
        if (!selectedSessionId) return;

        let cancelled = false;
        const hydrateSessionAttendance = async () => {
            try {
                const res = await fetchSessionAttendance(Number(selectedSessionId));
                if (cancelled) return;
                const items = toArray(res);
                if (!items.length) return;

                let hydratedRows = null;
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
                    hydratedRows = next;
                    return next;
                });
                if (hydratedRows) setInitialAttendanceRows(hydratedRows);
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
        setSelectedHomeworkId('');
        setHomeworkSubmissions([]);
        setEditingHomeworkId('');
        setPublishedHomework([]);
        setHomeworkLoadedSessionId('');

        if (!selectedSessionId) {
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
                setHomeworkLoadedSessionId(String(selectedSessionId));
                setSelectedHomeworkId((prev) => {
                    if (prev && items.some((item) => String(item.id) === String(prev))) return prev;
                    return items[0]?.id ? String(items[0].id) : '';
                });
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Үй тапшырмалар жүктөлгөн жок.'));
                setPublishedHomework([]);
                setHomeworkLoadedSessionId('');
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
        const activeHomework = publishedHomework.find(
            (item) => String(item.id) === String(selectedHomeworkId)
        );

        if (
            !selectedSessionId ||
            homeworkLoadedSessionId !== String(selectedSessionId) ||
            !activeHomework
        ) {
            setHomeworkSubmissions([]);
            return;
        }

        let cancelled = false;
        const loadSubmissions = async () => {
            setLoadingHomeworkSubmissions(true);
            try {
                const response = await fetchSessionHomeworkSubmissions(
                    Number(selectedSessionId),
                    Number(activeHomework.id)
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
    }, [homeworkLoadedSessionId, publishedHomework, selectedHomeworkId, selectedSessionId]);

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
    }, [selectedSessionId]);

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
        const todayKey = toLocalDateKey(nowMs);

        return sessions
            .filter((session) => {
                if (!session.startsAt) return false;
                return toLocalDateKey(session.startsAt) === todayKey;
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

    const hasAttendanceChanges = useMemo(() => {
        const currentIds = Object.keys(attendanceRows);
        const initialIds = Object.keys(initialAttendanceRows);
        if (currentIds.length !== initialIds.length) return currentIds.length > 0;

        return currentIds.some((studentId) => {
            const current = attendanceRows[studentId];
            const initial = initialAttendanceRows[studentId];
            if (!current || !initial) return true;

            return (
                current.status !== initial.status ||
                (current.notes || '').trim() !== (initial.notes || '').trim() ||
                (current.joinedAt || '') !== (initial.joinedAt || '') ||
                (current.leftAt || '') !== (initial.leftAt || '')
            );
        });
    }, [attendanceRows, initialAttendanceRows]);

    const filteredStudents = useMemo(() => {
        const query = attendanceQuery.trim().toLowerCase();

        return students.filter((student) => {
            const row = attendanceRows[student.id];
            const status = row?.status;
            const initial = initialAttendanceRows[student.id];
            const matchesQuery =
                !query ||
                [student.fullName, student.email, student.phone]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));

            if (!matchesQuery) return false;

            if (attendanceFilter === 'all') return true;
            if (attendanceFilter === 'changed') {
                return (
                    status !== initial?.status ||
                    (row?.notes || '').trim() !== (initial?.notes || '').trim()
                );
            }

            return status === attendanceFilter;
        });
    }, [attendanceFilter, attendanceQuery, attendanceRows, initialAttendanceRows, students]);

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

    const applyAttendanceStatus = (studentIds, status) => {
        setAttendanceRows((prev) => {
            const next = { ...prev };
            studentIds.forEach((studentId) => {
                if (!next[studentId]) return;
                next[studentId] = {
                    ...next[studentId],
                    status,
                };
            });
            return next;
        });
    };

    const handleCourseChange = (courseId) => {
        setSelectedCourseId(courseId);
        setSelectedGroupId('');
        setSelectedSessionId('');
        setGroups([]);
        setSessions([]);
        setQuickSession((prev) => ({
            ...QUICK_SESSION_DEFAULT,
            status: prev.status,
        }));
    };

    const handleGroupChange = (groupId) => {
        setSelectedGroupId(groupId);
        setSelectedSessionId('');
        setSessions([]);
        setQuickSession((prev) => ({
            ...QUICK_SESSION_DEFAULT,
            status: prev.status,
        }));
    };

    const handleSessionChange = (sessionId) => {
        setSelectedSessionId(sessionId);
    };

    const saveAttendance = async () => {
        if (!selectedSessionId) {
            toast.error('Катышууну сактоо үчүн сессияны тандаңыз.');
            return;
        }

        if (!hasAttendanceChanges) {
            toast('Өзгөртүү жок.');
            return;
        }

        const rows = Object.values(attendanceRows).map((row) => ({
            studentId: row.studentId,
            status: row.status,
            notes: row.notes?.trim() || undefined,
            joinedAt: row.joinedAt,
            leftAt: row.leftAt,
        }));

        setSavingAttendance(true);
        try {
            await markSessionAttendanceBulk(Number(selectedSessionId), {
                courseId: Number(selectedCourseId),
                rows,
            });
            toast.success('Session-based катышуу сакталды');

            const refreshed = await fetchCourseAttendance({ courseId: Number(selectedCourseId) });
            setAttendanceHistory(refreshed?.items || []);
            setInitialAttendanceRows(attendanceRows);
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Катышууну сактоо катасы'));
        } finally {
            setSavingAttendance(false);
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
            setIsSessionSetupOpen(false);

            setQuickSession((prev) => ({
                ...QUICK_SESSION_DEFAULT,
                sessionIndex: getNextSessionIndex(list),
                status: prev.status,
            }));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Сессия түзүү катасы'));
        } finally {
            setSavingSession(false);
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
            setIsSessionSetupOpen(false);
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
                isPublished: true,
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
        setEditHomeworkDeadline(
            resolveHomeworkDeadline(item) ? String(resolveHomeworkDeadline(item)).slice(0, 10) : ''
        );
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
                isPublished: Boolean(selectedHomework?.isPublished),
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
    const nextSessionIndex = useMemo(() => getNextSessionIndex(sessions), [sessions]);
    const isCreateWorkspace = workspaceMode === 'create';
    const workspaceTitle = isCreateWorkspace ? 'Create Session' : 'Edit Session';
    const workspaceDescription = isCreateWorkspace
        ? 'Тандалган группа үчүн жаңы сессия түзүп, убактысын жана материалдарын бекитиңиз.'
        : 'Тандалган сессиянын убактысын жана статусун жаңыртыңыз.';
    const workspaceDisabled = isCreateWorkspace ? !selectedGroupId : !selectedSessionId;
    const workspaceDisabledReason = isCreateWorkspace
        ? 'Жаңы сессия түзүү үчүн группа тандаңыз.'
        : 'Edit mode үчүн сессия тандаңыз.';
    const workspaceActionLabel = isCreateWorkspace
        ? savingSession
            ? 'Түзүлүүдө...'
            : 'Create Session'
        : savingSessionUpdate
            ? 'Жаңыртылууда...'
            : 'Update Session';
    const workspaceAction = isCreateWorkspace ? createQuickSession : updateSelectedSession;
    const workspaceSaving = isCreateWorkspace ? savingSession : savingSessionUpdate;

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
                        description="Сессияларды, катышууну, үй тапшырманы жана жандуу сабак агымдарын бир жерден көзөмөлдөңүз. Группа lifecycle эми өзүнчө Groups tab аркылуу башкарылат."
                        metrics={(
                            <>
                                <DashboardMetricCard
                                    label="Бүгүнкү сессиялар"
                                    value={sessionsToday.length}
                                    icon={FiCalendar}
                                    className="min-h-[11rem] min-w-0"
                                />
                                <DashboardMetricCard
                                    label="Катышуу %"
                                    value={`${attendanceStats.presentRate}%`}
                                    icon={FiActivity}
                                    className="min-h-[11rem] min-w-0"
                                />
                                <DashboardMetricCard
                                    label="Тапшырма жарыяланды"
                                    value={publishedHomework.length}
                                    icon={FiBookOpen}
                                    className="min-h-[11rem] min-w-0"
                                />
                                <DashboardMetricCard
                                    label="Кооптуу студенттер"
                                    value={students.length - attendanceStats.present}
                                    icon={FiUsers}
                                    tone="amber"
                                    className="min-h-[11rem] min-w-0"
                                />
                            </>
                        )}
                        metricsClassName="grid w-full grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 xl:min-w-[26rem] 2xl:min-w-[48rem]"
                    >
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="max-w-2xl">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                        Current Session
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-edubot-muted dark:text-slate-300">
                                        Адегенде курс, группа жана сессияны так тандаңыз. Андан кийин катышуу, тапшырма жана ресурстар ошол активдүү сессиянын контекстинде иштейт.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <DashboardFilterBar gridClassName="md:grid-cols-2 xl:grid-cols-3">
                                    <div className="text-sm">
                                        <span className="mb-1.5 inline-flex items-center gap-2 font-medium text-edubot-ink dark:text-white">
                                            <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                                            Курс
                                        </span>
                                        <select
                                            value={selectedCourseId}
                                            onChange={(e) => handleCourseChange(e.target.value)}
                                            disabled={loadingCourses}
                                            className="dashboard-select min-h-[3.5rem] w-full text-edubot-ink dark:text-white"
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
                                            onChange={(e) => handleGroupChange(e.target.value)}
                                            disabled={!selectedCourseId || loadingGroups}
                                            className="dashboard-select min-h-[3.5rem] w-full text-edubot-ink disabled:opacity-60 dark:text-white"
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
                                            Сессияны алмаштыруу
                                        </span>
                                        <select
                                            value={selectedSessionId}
                                            onChange={(e) => handleSessionChange(e.target.value)}
                                            disabled={!selectedGroupId || loadingSessions}
                                            className="dashboard-select min-h-[3.5rem] w-full text-edubot-ink disabled:opacity-60 dark:text-white"
                                        >
                                            <option value="">Сессия тандаңыз</option>
                                            {sessions.map((session) => (
                                                <option key={session.id} value={session.id}>
                                                    {session.title || `Session #${session.sessionIndex || session.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </DashboardFilterBar>

                                <div className="rounded-[1.5rem] border border-edubot-line/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/80">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                Тандалган группанын бүгүнкү сессиялары
                                            </p>
                                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                                {selectedGroup?.name || selectedGroup?.code
                                                    ? `${selectedGroup?.name || selectedGroup?.code} үчүн сессияны ушул жерден тез алмаштырыңыз.`
                                                    : 'Алгач группа тандаңыз, анан ошол группанын бүгүнкү сессиялары көрүнөт.'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-edubot-surface px-3 py-1 text-xs font-semibold text-edubot-ink dark:bg-slate-900 dark:text-slate-200">
                                            {sessionsToday.length}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                                        {sessionsToday.map((session) => (
                                            <button
                                                key={session.id}
                                                type="button"
                                                onClick={() => setSelectedSessionId(String(session.sessionId))}
                                                className={`min-w-[220px] rounded-[1.25rem] border p-3 text-left transition ${String(selectedSessionId) === String(session.sessionId)
                                                    ? 'border-edubot-orange bg-edubot-surface shadow-edubot-soft dark:bg-slate-900'
                                                    : 'border-edubot-line/80 bg-white hover:border-edubot-orange/40 dark:border-slate-800 dark:bg-slate-950'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-edubot-ink dark:text-white">
                                                            {session.courseTitle}
                                                        </p>
                                                        <p className="truncate text-xs text-edubot-muted dark:text-slate-400">
                                                            {session.room || session.groupName || 'Group session'}
                                                        </p>
                                                    </div>
                                                    <StatusBadge tone={(SESSION_MODE_META[session.mode] || SESSION_MODE_META.scheduled).tone || 'default'} className="gap-1 text-[11px]">
                                                        {(() => {
                                                            const SessionModeIcon = (SESSION_MODE_META[session.mode] || SESSION_MODE_META.scheduled).icon;
                                                            return <SessionModeIcon className="h-3.5 w-3.5" />;
                                                        })()}
                                                        {(SESSION_MODE_META[session.mode] || SESSION_MODE_META.scheduled).label}
                                                    </StatusBadge>
                                                </div>
                                                <div className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                                    {session.startTime}
                                                    {session.type === COURSE_TYPE.ONLINE_LIVE && session.mode === 'upcoming'
                                                        ? ` • ${formatCountdown(new Date(session.startsAt).getTime(), nowMs)} калды`
                                                        : ''}
                                                    {session.type === COURSE_TYPE.ONLINE_LIVE && session.mode === 'live'
                                                        ? ` • ${formatCountdown(new Date(session.endsAt).getTime(), nowMs)} калды`
                                                        : ''}
                                                </div>
                                            </button>
                                        ))}
                                        {sessionsToday.length === 0 ? (
                                            <div className="flex min-h-[88px] w-full items-center justify-center rounded-[1.25rem] border border-dashed border-edubot-line/80 bg-white/70 px-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                                                Тандалган группада бүгүн сессия жок.
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </DashboardWorkspaceHero>

                    <div className="sticky top-24 z-30 rounded-[1.75rem] border border-edubot-line bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-950">
                        <SessionHeaderContent
                            activeTab={activeTab}
                            joinLiveSession={joinLiveSession}
                            selectedCourse={selectedCourse}
                            selectedGroup={selectedGroup}
                            selectedModeMeta={selectedModeMeta}
                            selectedSession={selectedSession}
                            selectedSessionJoinAllowed={selectedSessionJoinAllowed}
                            selectedSessionJoinUrl={selectedSessionJoinUrl}
                            selectedSessionMode={selectedSessionMode}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    <section className="dashboard-panel p-5 space-y-5">
                        <div className="dashboard-panel-muted flex flex-wrap items-start justify-between gap-4 rounded-[1.75rem] border border-edubot-line/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                        Session Setup
                                    </p>
                                    <p className="mt-1 max-w-2xl text-sm text-edubot-muted dark:text-slate-400">
                                        Create жана edit аракеттерин модалдан аткарыңыз. Негизги canvas азыр активдүү сессияны иштетүүгө багытталган.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspaceMode('create');
                                            setQuickSession((prev) => ({
                                                ...QUICK_SESSION_DEFAULT,
                                                status: prev.status,
                                                sessionIndex: nextSessionIndex,
                                            }));
                                            setIsSessionSetupOpen(true);
                                        }}
                                        disabled={!selectedGroupId}
                                        className="dashboard-button-primary"
                                    >
                                        Жаңы сессия түзүү
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspaceMode('edit');
                                            setIsSessionSetupOpen(true);
                                        }}
                                        disabled={!selectedSessionId}
                                        className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                    >
                                        Сессияны түзөтүү
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.location.href = '/instructor?tab=groups';
                                        }}
                                        className="rounded-2xl border border-edubot-line bg-transparent px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:text-slate-200"
                                    >
                                        Groups tab ачуу
                                    </button>
                                </div>
                            </div>

                            <div className="min-w-[260px] space-y-2 rounded-[1.25rem] border border-edubot-line/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/80">
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
                        </div>

                        {isSessionSetupOpen && typeof document !== 'undefined'
                            ? createPortal(
                            <div
                                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm"
                                onMouseDown={(event) => {
                                    if (event.target === event.currentTarget) {
                                        setIsSessionSetupOpen(false);
                                    }
                                }}
                            >
                                <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
                                    <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))] sm:px-7">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange dark:border-edubot-orange/25 dark:bg-slate-900/60">
                                                    {workspaceTitle}
                                                </div>
                                                <div>
                                                    <h2
                                                        id="session-setup-modal-title"
                                                        className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]"
                                                    >
                                                        {workspaceTitle}
                                                    </h2>
                                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                        {workspaceDescription}
                                                    </p>
                                                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-500">
                                                        {isCreateWorkspace
                                                            ? 'Курс жана группа жогору жактагы picker аркылуу тандалат'
                                                            : 'Түзөтүү активдүү сессиянын контекстинде жүрөт'}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setIsSessionSetupOpen(false)}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
                                                aria-label="Жабуу"
                                            >
                                                <span className="text-xl leading-none">×</span>
                                            </button>
                                        </div>
                                    </div>

                                    <form
                                        ref={sessionSetupModalRef}
                                        className="flex min-h-0 flex-1 flex-col"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="session-setup-modal-title"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            workspaceAction();
                                        }}
                                    >
                                        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-6 py-5 sm:px-7 lg:grid-cols-[minmax(0,1.1fr),minmax(260px,0.9fr)]">
                                            <div className="space-y-5">
                                                <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        <FiEdit3 className="h-4 w-4 text-edubot-orange" />
                                                        Негизги маалымат
                                                    </div>
                                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                        <div className="space-y-2">
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
                                                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                                                {isCreateWorkspace
                                                                    ? `Кийинки жеткиликтүү номер: ${nextSessionIndex}. Зарыл болсо гана өзгөртүңүз.`
                                                                    : 'Номер ушул группанын ичинде уникалдуу болушу керек.'}
                                                            </p>
                                                        </div>
                                                        <select
                                                            value={isCreateWorkspace ? quickSession.status : editSession.status}
                                                            onChange={(e) =>
                                                                isCreateWorkspace
                                                                    ? setQuickSession((prev) => ({ ...prev, status: e.target.value }))
                                                                    : setEditSession((prev) => ({ ...prev, status: e.target.value }))
                                                            }
                                                            className="dashboard-field dashboard-select"
                                                        >
                                                            {[COURSE_SESSION_STATUS.SCHEDULED, COURSE_SESSION_STATUS.COMPLETED, COURSE_SESSION_STATUS.CANCELLED].map((status) => (
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
                                                </section>

                                                <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                                        Schedule
                                                    </div>
                                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                                                </section>
                                            </div>

                                            <div className="space-y-5">
                                                <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        <FiPaperclip className="h-4 w-4 text-edubot-orange" />
                                                        Materials & recording
                                                    </div>
                                                    <div className="mt-4 grid gap-3">
                                                        <input
                                                            value={isCreateWorkspace ? quickSession.recordingUrl : editSession.recordingUrl}
                                                            onChange={(e) =>
                                                                isCreateWorkspace
                                                                    ? setQuickSession((prev) => ({ ...prev, recordingUrl: e.target.value }))
                                                                    : setEditSession((prev) => ({ ...prev, recordingUrl: e.target.value }))
                                                            }
                                                            placeholder="Recording URL"
                                                            className="dashboard-field"
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
                                                </section>

                                                <section className="rounded-[1.75rem] border border-edubot-line/70 bg-slate-900 px-5 py-5 text-white dark:border-slate-700 dark:bg-slate-800">
                                                    <div className="text-sm font-semibold text-white">Контекст</div>
                                                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                                                        <div>
                                                            <span className="font-semibold text-white">Курс:</span>{' '}
                                                            {selectedCourse?.title || selectedCourse?.name || 'Тандала элек'}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-white">Группа:</span>{' '}
                                                            {selectedGroup?.name || selectedGroup?.code || 'Тандала элек'}
                                                        </div>
                                                        {isCreateWorkspace ? (
                                                            <div>
                                                                <span className="font-semibold text-white">Жаңы сессия:</span>{' '}
                                                                Тандалган группага кошулат
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <span className="font-semibold text-white">Сессия:</span>{' '}
                                                                {selectedSession?.title ||
                                                                    (selectedSession
                                                                        ? `Session #${selectedSession.sessionIndex || selectedSession.id}`
                                                                        : 'Тандала элек')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edubot-line/70 bg-white/95 px-6 py-4 sm:px-7 dark:border-slate-700 dark:bg-[#151922]/95">
                                            <p className="text-sm text-edubot-muted dark:text-slate-400">
                                                {workspaceDisabled ? workspaceDisabledReason : 'Бардык өзгөртүүлөрдү ушул жерде сактаңыз.'}
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    className="dashboard-button-secondary"
                                                    onClick={() => setIsSessionSetupOpen(false)}
                                                    disabled={workspaceSaving}
                                                >
                                                    Жабуу
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={workspaceDisabled || workspaceSaving}
                                                    className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {workspaceActionLabel}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>,
                            document.body
                        ) : null}

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

                                <DashboardInsetPanel
                                    title="Session attendance"
                                    description="Катышуу түздөн-түз активдүү сессияга сакталат. Издөө, фильтр жана bulk аракеттер менен тез бүтүрүңүз."
                                    action={
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasAttendanceChanges
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                                            }`}>
                                            {hasAttendanceChanges ? 'Сакталбаган өзгөртүү бар' : 'Баары сакталган'}
                                        </span>
                                    }
                                >
                                    <div className="mt-4 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/80">
                                            <div>
                                                <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                    {selectedSession?.title || `Session #${selectedSession?.sessionIndex || selectedSession?.id || '—'}`}
                                                </p>
                                                <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {selectedGroup?.name || selectedGroup?.code || 'Группа'} • {selectedSession?.startsAt ? toSessionTime(selectedSession.startsAt) : 'Убакыт жок'}
                                                    {selectedSessionMode === 'upcoming' ? ' • Күтүүдө' : ''}
                                                    {selectedSessionMode === 'live' ? ' • Түз эфирде' : ''}
                                                    {selectedSessionMode === 'completed' ? ' • Аяктаган' : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={saveAttendance}
                                                disabled={
                                                    savingAttendance ||
                                                    loadingStudents ||
                                                    !selectedCourseId ||
                                                    !selectedSessionId ||
                                                    !hasAttendanceChanges
                                                }
                                                className="dashboard-button-primary"
                                            >
                                                {savingAttendance
                                                    ? 'Сакталууда...'
                                                    : hasAttendanceChanges
                                                        ? 'Катышууну сактоо'
                                                        : 'Өзгөртүү жок'}
                                            </button>
                                        </div>

                                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),auto]">
                                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
                                                <input
                                                    value={attendanceQuery}
                                                    onChange={(e) => setAttendanceQuery(e.target.value)}
                                                    placeholder="Студент издөө"
                                                    className="dashboard-field"
                                                />
                                                <select
                                                    value={attendanceFilter}
                                                    onChange={(e) => setAttendanceFilter(e.target.value)}
                                                    className="dashboard-field dashboard-select"
                                                >
                                                    <option value="all">Баары</option>
                                                    <option value={SESSION_ATTENDANCE_STATUS.PRESENT}>Катышты</option>
                                                    <option value={SESSION_ATTENDANCE_STATUS.LATE}>Кечикти</option>
                                                    <option value={SESSION_ATTENDANCE_STATUS.ABSENT}>Келген жок</option>
                                                    <option value={SESSION_ATTENDANCE_STATUS.EXCUSED}>Уруксат менен</option>
                                                    <option value="changed">Өзгөртүлгөндөр</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applyAttendanceStatus(
                                                            filteredStudents.map((student) => student.id),
                                                            SESSION_ATTENDANCE_STATUS.PRESENT
                                                        )
                                                    }
                                                    className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                                >
                                                    Баарын катышты
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applyAttendanceStatus(
                                                            filteredStudents.map((student) => student.id),
                                                            SESSION_ATTENDANCE_STATUS.LATE
                                                        )
                                                    }
                                                    className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                                >
                                                    Баарын кечикти
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applyAttendanceStatus(
                                                            filteredStudents.map((student) => student.id),
                                                            SESSION_ATTENDANCE_STATUS.ABSENT
                                                        )
                                                    }
                                                    className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                                >
                                                    Баарын жок
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs text-edubot-muted dark:text-slate-400">
                                            <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                                                Көрсөтүлгөндөр: {filteredStudents.length}
                                            </span>
                                            <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                                                Сакталбаган: {hasAttendanceChanges ? 'ооба' : 'жок'}
                                            </span>
                                            <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                                                Катышуу даярдыгы: {attendanceStats.presentRate}%
                                            </span>
                                        </div>
                                    </div>
                                </DashboardInsetPanel>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                        Ар бир студентти ушул сессиянын контекстинде белгилеңиз. Bulk аракеттер учурдагы фильтрге жараша иштейт.
                                    </div>
                                    {hasAttendanceChanges ? (
                                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                            Өзгөртүүлөр али сактала элек
                                        </div>
                                    ) : null}
                                </div>

                                {loadingStudents ? (
                                    <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                                        Студенттер жүктөлүүдө...
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                                        Студент табылган жок.
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                                        Бул фильтр боюнча студент табылган жок.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 xl:grid-cols-2">
                                        {filteredStudents.map((student) => {
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
                                                                    <div className="relative">
                                                                        <FiEdit3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                                                                        <select
                                                                            value={currentStatus}
                                                                            onChange={(e) =>
                                                                                updateStatus(student.id, e.target.value)
                                                                            }
                                                                            className="dashboard-field pl-11"
                                                                        >
                                                                            {statusOptions.map((status) => (
                                                                                <option key={status.value} value={status.value}>
                                                                                    {status.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                                                        Статус тизмеден тандалат, ошондуктан кокус басуу азаят.
                                                                    </p>
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
                                                            <span>
                                                                Deadline: {formatDisplayDate(resolveHomeworkDeadline(item))}
                                                            </span>
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
                                                                {formatDisplayDate(resolveHomeworkDeadline(selectedHomework))}
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
                                                        const previewText = getSubmissionPreview(submission);
                                                        const attachmentUrl = getSubmissionAttachmentUrl(submission);
                                                        const hasAttachment =
                                                            Boolean(attachmentUrl) &&
                                                            previewText !== attachmentUrl;
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
                                                                            Жөнөтүлгөн:{' '}
                                                                            {formatDisplayDate(
                                                                                submission.submittedAt ||
                                                                                    submission.createdAt,
                                                                                '-'
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                                <FiFileText className="h-4 w-4" />
                                                                                Жооп мазмуну
                                                                            </div>
                                                                            <p className="whitespace-pre-wrap break-words leading-6">
                                                                                {previewText}
                                                                            </p>
                                                                        </div>
                                                                        {hasAttachment && (
                                                                            <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                                    <FiPaperclip className="h-4 w-4" />
                                                                                    Тиркелген файл
                                                                                </div>
                                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="truncate font-medium text-edubot-ink dark:text-white">
                                                                                            {getAttachmentName(
                                                                                                attachmentUrl
                                                                                            )}
                                                                                        </p>
                                                                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                                                            LMSке жүктөлгөн файл же тышкы шилтеме
                                                                                        </p>
                                                                                    </div>
                                                                                    <a
                                                                                        href={attachmentUrl}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                        className="inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200"
                                                                                    >
                                                                                        <FiExternalLink className="h-4 w-4" />
                                                                                        Ачуу
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        )}
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

                    <div className="flex justify-end">
                        <section className="dashboard-panel w-full max-w-[320px] p-4">
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

const SessionHeaderContent = ({
    activeTab,
    joinLiveSession,
    selectedCourse,
    selectedGroup,
    selectedModeMeta,
    selectedSession,
    selectedSessionJoinAllowed,
    selectedSessionJoinUrl,
    selectedSessionMode,
    setActiveTab,
}) => {
    const SelectedModeIcon = selectedModeMeta.icon;

    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                        Active Session
                    </div>
                    {selectedSession ? (
                        <StatusBadge tone={selectedModeMeta.tone || 'default'} className="gap-1">
                            <SelectedModeIcon className="h-3.5 w-3.5" />
                            {selectedModeMeta.label}
                        </StatusBadge>
                    ) : null}
                </div>
                <div className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">
                    {selectedSession?.title ||
                        (selectedSession
                            ? `Session #${selectedSession.sessionIndex || selectedSession.id}`
                            : 'Сессия тандала элек')}
                </div>
                <div className="mt-1 text-sm text-edubot-muted dark:text-slate-300">
                    {selectedCourse?.title || selectedCourse?.name || 'Курс тандаңыз'}
                    {' • '}
                    {selectedGroup?.name || selectedGroup?.code || 'Группа тандаңыз'}
                    {selectedSession
                        ? ` • ${toSessionTime(selectedSession.startsAt)} - ${toSessionTime(selectedSession.endsAt)}`
                        : ''}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        activeTab === 'attendance'
                            ? 'bg-edubot-dark text-white'
                            : 'bg-edubot-surfaceAlt text-edubot-ink dark:bg-slate-900 dark:text-slate-200'
                    }`}
                >
                    Катышуу
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('homework')}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        activeTab === 'homework'
                            ? 'bg-edubot-dark text-white'
                            : 'bg-edubot-surfaceAlt text-edubot-ink dark:bg-slate-900 dark:text-slate-200'
                    }`}
                >
                    Үй тапшырма
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('materials')}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        activeTab === 'materials'
                            ? 'bg-edubot-dark text-white'
                            : 'bg-edubot-surfaceAlt text-edubot-ink dark:bg-slate-900 dark:text-slate-200'
                    }`}
                >
                    Ресурстар
                </button>
                <button
                    type="button"
                    onClick={() => joinLiveSession(selectedSessionJoinUrl)}
                    disabled={
                        !selectedSessionJoinUrl ||
                        !selectedSessionJoinAllowed ||
                        selectedSessionMode === 'completed'
                    }
                    className="dashboard-button-primary"
                >
                    Join Class
                </button>
            </div>
        </div>
    );
};

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

SessionHeaderContent.propTypes = {
    activeTab: PropTypes.string.isRequired,
    joinLiveSession: PropTypes.func.isRequired,
    selectedCourse: PropTypes.shape({
        title: PropTypes.string,
        name: PropTypes.string,
    }),
    selectedGroup: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
    }),
    selectedModeMeta: PropTypes.shape({
        icon: PropTypes.elementType.isRequired,
        label: PropTypes.string.isRequired,
        tone: PropTypes.string,
    }).isRequired,
    selectedSession: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        startsAt: PropTypes.string,
        endsAt: PropTypes.string,
    }),
    selectedSessionJoinAllowed: PropTypes.bool.isRequired,
    selectedSessionJoinUrl: PropTypes.string,
    selectedSessionMode: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
};

export default SessionWorkspace;

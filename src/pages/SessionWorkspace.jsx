import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import {
    ATTENDANCE_STATUS,
    COURSE_SESSION_STATUS,
    COURSE_TYPE,
    MEETING_PROVIDER,
    SESSION_ATTENDANCE_STATUS,
} from '@shared/contracts';
import {
    createCourseSession,
    createSessionActivity,
    createSessionHomework,
    createSessionMeeting,
    deleteSessionActivity,
    deleteSessionMeeting,
    fetchCourseAttendance,
    fetchCourseGroups,
    fetchSessionHomework,
    fetchSessionHomeworkReviewRoster,
    fetchSessionMeeting,
    fetchCourseSessions,
    fetchInstructorCourses,
    fetchSessionAttendance,
    fetchSections,
    importSessionAttendance,
    markSessionAttendanceBulk,
    syncSessionRecordings,
    uploadSessionMaterial,
    updateSessionActivity,
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
import SessionAttendanceTab from '@features/groupSessions/components/SessionAttendanceTab.jsx';
import SessionActivitiesTab from '@features/groupSessions/components/SessionActivitiesTab.jsx';
import SessionEngagementTab from '@features/groupSessions/components/SessionEngagementTab.jsx';
import SessionHomeworkTab from '@features/groupSessions/components/SessionHomeworkTab.jsx';
import SessionNotesTab from '@features/groupSessions/components/SessionNotesTab.jsx';
import SessionResourcesTab from '@features/groupSessions/components/SessionResourcesTab.jsx';
import SessionSetupModal from '@features/groupSessions/components/SessionSetupModal.jsx';
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
    { id: 'materials', label: 'Ресурстар' },
    { id: 'homework', label: 'Үй тапшырма' },
    { id: 'activities', label: 'Иштер' },
    { id: 'notes', label: 'Жазуулар' },
    { id: 'engagement', label: 'Кийинки аракеттер' },
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

const UNMARKED_ATTENDANCE_STATUS = '__unmarked__';

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

const resolveSessionJoinUrl = (session) =>
    session?.liveJoinUrl ||
    session?.joinUrl ||
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
    if (['needs_revision'].includes(normalized)) {
        return {
            label: 'Оңдоп кайра жиберүү',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (['rejected', 'declined'].includes(normalized)) {
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

const openAttachmentInBrowser = async (url, filename = 'attachment') => {
    if (!url) return;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Тиркемени ачуу мүмкүн болгон жок.');
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const popup = window.open(blobUrl, '_blank', 'noopener,noreferrer');

    if (!popup) {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
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

const getCourseTypeLabel = (type) => {
    if (type === COURSE_TYPE.OFFLINE) return 'Оффлайн';
    if (type === COURSE_TYPE.ONLINE_LIVE) return 'Онлайн түз эфир';
    return 'Видео курс';
};

const getWorkspaceErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    if (status === 401) return 'Сессия мөөнөтү бүттү. Кайра кириңиз.';
    if (status === 403) return 'Бул курс, группа же сессия сизге бекитилген эмес.';
    const message = error?.response?.data?.message || error?.message || fallback;
    return Array.isArray(message) ? message.join(', ') : message;
};

const SessionWorkspace = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialWorkspaceTab = searchParams.get('workspaceTab') || 'attendance';
    const initialHomeworkReviewFilter = searchParams.get('homeworkReviewFilter') || 'all';
    const pendingRouteSelectionRef = useRef({
        courseId: searchParams.get('courseId') || '',
        groupId: searchParams.get('groupId') || '',
        sessionId: searchParams.get('sessionId') || '',
        homeworkId: searchParams.get('homeworkId') || '',
    });
    const [activeTab, setActiveTab] = useState(
        tabList.some((tab) => tab.id === initialWorkspaceTab) ? initialWorkspaceTab : 'attendance'
    );
    const [workspaceMode, setWorkspaceMode] = useState('create');
    const [isSessionSetupOpen, setIsSessionSetupOpen] = useState(false);

    const [courses, setCourses] = useState([]);
    const [sourceVideoCourses, setSourceVideoCourses] = useState([]);
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

    const [meetingProvider, setMeetingProvider] = useState(MEETING_PROVIDER.CUSTOM);
    const [meetingJoinUrl, setMeetingJoinUrl] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [savingMeeting, setSavingMeeting] = useState(false);
    const [loadingMeetingState, setLoadingMeetingState] = useState(false);
    const [deletingMeeting, setDeletingMeeting] = useState(false);
    const [importingAttendance, setImportingAttendance] = useState(false);
    const [syncingRecordings, setSyncingRecordings] = useState(false);
    const [savingMaterials, setSavingMaterials] = useState(false);
    const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');
    const [savingSessionNotes, setSavingSessionNotes] = useState(false);
    const [creatingSessionActivity, setCreatingSessionActivity] = useState(false);
    const [savingSessionActivityId, setSavingSessionActivityId] = useState(null);
    const [deletingSessionActivityId, setDeletingSessionActivityId] = useState(null);

    const [quickSession, setQuickSession] = useState(QUICK_SESSION_DEFAULT);
    const [editSession, setEditSession] = useState(EDIT_SESSION_DEFAULT);
    const [savingSession, setSavingSession] = useState(false);
    const [savingSessionUpdate, setSavingSessionUpdate] = useState(false);

    const [courseResourceAssets, setCourseResourceAssets] = useState([]);
    const [loadingCourseResourceAssets, setLoadingCourseResourceAssets] = useState(false);
    const [selectedSourceVideoCourseId, setSelectedSourceVideoCourseId] = useState('');

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
    const [homeworkReviewFilter, setHomeworkReviewFilterState] = useState(
        ['all', 'needs_review', 'missing', 'needs_revision', 'late'].includes(
            initialHomeworkReviewFilter
        )
            ? initialHomeworkReviewFilter
            : 'all'
    );
    const [nowMs, setNowMs] = useState(Date.now());
    const sessionSetupModalRef = useRef(null);
    const previousModalFocusRef = useRef(null);

    useEffect(() => {
        pendingRouteSelectionRef.current = {
            courseId: searchParams.get('courseId') || '',
            groupId: searchParams.get('groupId') || '',
            sessionId: searchParams.get('sessionId') || '',
            homeworkId: searchParams.get('homeworkId') || '',
        };
        const nextWorkspaceTab = searchParams.get('workspaceTab') || 'attendance';
        if (tabList.some((tab) => tab.id === nextWorkspaceTab)) {
            setActiveTab(nextWorkspaceTab);
        }
        const nextHomeworkReviewFilter = searchParams.get('homeworkReviewFilter') || 'all';
        setHomeworkReviewFilterState(
            ['all', 'needs_review', 'missing', 'needs_revision', 'late'].includes(
                nextHomeworkReviewFilter
            )
                ? nextHomeworkReviewFilter
                : 'all'
        );
    }, [searchParams]);

    const setHomeworkReviewFilter = useCallback(
        (nextFilter) => {
            const normalized = ['all', 'needs_review', 'missing', 'needs_revision', 'late'].includes(
                nextFilter
            )
                ? nextFilter
                : 'all';
            setHomeworkReviewFilterState(normalized);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (normalized === 'all') next.delete('homeworkReviewFilter');
                    else next.set('homeworkReviewFilter', normalized);
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

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
                const [deliveryData, sourceVideoData] = await Promise.all([
                    fetchInstructorCourses({ status: 'approved', limit: 100 }),
                    fetchInstructorCourses({
                        status: 'all',
                        courseType: COURSE_TYPE.VIDEO,
                        limit: 100,
                    }),
                ]);
                if (cancelled) return;

                const allInstructorCourses = Array.isArray(deliveryData?.courses)
                    ? deliveryData.courses
                    : [];
                const allSourceVideoCourses = Array.isArray(sourceVideoData?.courses)
                    ? sourceVideoData.courses
                    : [];
                const teachingCourses = allInstructorCourses.filter(
                    (course) => {
                        const type = course?.courseType || course?.type;
                        return type === COURSE_TYPE.OFFLINE || type === COURSE_TYPE.ONLINE_LIVE;
                    }
                );
                const publishedVideos = allSourceVideoCourses.filter((course) => {
                    const type = String(course?.courseType || course?.type || '').trim().toLowerCase();
                    return type === COURSE_TYPE.VIDEO && Boolean(course?.isPublished);
                });

                setCourses(teachingCourses);
                setSourceVideoCourses(publishedVideos);
                setSelectedCourseId((prev) => {
                    const pendingCourseId = pendingRouteSelectionRef.current.courseId;
                    if (
                        pendingCourseId &&
                        teachingCourses.some((course) => String(course.id) === String(pendingCourseId))
                    ) {
                        pendingRouteSelectionRef.current.courseId = '';
                        return String(pendingCourseId);
                    }
                    if (prev && teachingCourses.some((course) => String(course.id) === String(prev))) {
                        return prev;
                    }
                    return teachingCourses.length > 0 ? String(teachingCourses[0].id) : '';
                });
            } catch (error) {
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Курстар жүктөлгөн жок.'));
                setSourceVideoCourses([]);
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
                    const pendingGroupId = pendingRouteSelectionRef.current.groupId;
                    if (
                        pendingGroupId &&
                        list.some((group) => String(group.id) === String(pendingGroupId))
                    ) {
                        pendingRouteSelectionRef.current.groupId = '';
                        return String(pendingGroupId);
                    }
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
                    const pendingSessionId = pendingRouteSelectionRef.current.sessionId;
                    if (
                        pendingSessionId &&
                        list.some((session) => String(session.id) === String(pendingSessionId))
                    ) {
                        pendingRouteSelectionRef.current.sessionId = '';
                        return String(pendingSessionId);
                    }
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

    const buildBlankAttendanceRows = useCallback((roster) => {
        const next = {};
        roster.forEach((student) => {
            next[student.id] = {
                studentId: student.id,
                status: UNMARKED_ATTENDANCE_STATUS,
                notes: '',
                joinedAt: undefined,
                leftAt: undefined,
            };
        });
        return next;
    }, []);

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
                    fetchCourseAttendance({
                        courseId: Number(selectedCourseId),
                        groupId: Number(selectedGroupId),
                    }),
                ]);
                if (cancelled) return;

                const normalized = studentsRes.map((item) => ({
                    id: Number(item.userId || item.id),
                    fullName: item.fullName || item.user?.fullName || `#${item.userId || item.id}`,
                }));
                setStudents(normalized);

                const rowState = buildBlankAttendanceRows(normalized);
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
    }, [buildBlankAttendanceRows, selectedCourseId, selectedGroupId]);

    useEffect(() => {
        const blankRows = buildBlankAttendanceRows(students);
        setAttendanceRows(blankRows);
        setInitialAttendanceRows(blankRows);

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
    }, [buildBlankAttendanceRows, selectedSessionId, students]);

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
                    const pendingHomeworkId = pendingRouteSelectionRef.current.homeworkId;
                    if (
                        pendingHomeworkId &&
                        items.some((item) => String(item.id) === String(pendingHomeworkId))
                    ) {
                        pendingRouteSelectionRef.current.homeworkId = '';
                        return String(pendingHomeworkId);
                    }
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
        const loadReviewRoster = async () => {
            setLoadingHomeworkSubmissions(true);
            try {
                const response = await fetchSessionHomeworkReviewRoster(
                    Number(selectedSessionId),
                    Number(activeHomework.id)
                );
                if (cancelled) return;
                setHomeworkSubmissions(toArray(response?.items));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Текшерүү тизмеси жүктөлгөн жок.'));
                setHomeworkSubmissions([]);
            } finally {
                if (!cancelled) setLoadingHomeworkSubmissions(false);
            }
        };

        loadReviewRoster();
        return () => {
            cancelled = true;
        };
    }, [homeworkLoadedSessionId, publishedHomework, selectedHomeworkId, selectedSessionId]);

    useEffect(() => {
        if (!selectedSessionId) {
            setMeetingProvider(MEETING_PROVIDER.CUSTOM);
            setMeetingJoinUrl('');
            setMeetingId('');
            return;
        }

        let cancelled = false;
        const loadMeetingState = async () => {
            setLoadingMeetingState(true);
            try {
                const res = await fetchSessionMeeting(Number(selectedSessionId));
                if (cancelled) return;
                setMeetingJoinUrl(res?.joinUrl || '');
                setMeetingId(String(res?.meetingId || ''));
                if (res?.provider) setMeetingProvider(res.provider);
            } catch {
                if (cancelled) return;
                setMeetingProvider(MEETING_PROVIDER.CUSTOM);
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

    useEffect(() => {
        if (!selectedSourceVideoCourseId) {
            setCourseResourceAssets([]);
            setLoadingCourseResourceAssets(false);
            return;
        }

        let cancelled = false;
        const loadCourseAssets = async () => {
            setLoadingCourseResourceAssets(true);
            try {
                const sections = await fetchSections(Number(selectedSourceVideoCourseId));
                if (cancelled) return;

                const assets = (Array.isArray(sections) ? sections : []).flatMap((section) =>
                    (Array.isArray(section.lessons) ? section.lessons : []).flatMap((lesson) => {
                        const items = [];
                        if (
                            lesson.kind === 'video' &&
                            lesson.videoUrl &&
                            lesson.videoKey
                        ) {
                            items.push({
                                id: `video-${lesson.id}`,
                                lessonId: lesson.id,
                                lessonTitle: lesson.title,
                                sectionTitle: section.title,
                                assetType: 'video',
                                title: lesson.title || 'Сабак видеосу',
                                url: lesson.videoUrl,
                                storageKey: lesson.videoKey,
                            });
                        }
                        return items;
                    })
                );

                setCourseResourceAssets(assets);
            } catch (error) {
                if (!cancelled) {
                    setCourseResourceAssets([]);
                    toast.error(getWorkspaceErrorMessage(error, 'Курстун материалдарын жүктөө катасы'));
                }
            } finally {
                if (!cancelled) setLoadingCourseResourceAssets(false);
            }
        };

        loadCourseAssets();
        return () => {
            cancelled = true;
        };
    }, [selectedSourceVideoCourseId]);

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
    const selectedDeliveryType = useMemo(
        () => normalizeCourseType(selectedCourse, selectedSession, selectedGroup),
        [selectedCourse, selectedSession, selectedGroup]
    );
    const canReusePublishedCourseAssets = useMemo(
        () =>
            (selectedDeliveryType === COURSE_TYPE.OFFLINE ||
                selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE) &&
            sourceVideoCourses.length > 0,
        [selectedDeliveryType, sourceVideoCourses.length]
    );
    const canImportZoomAttendance = useMemo(
        () =>
            selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE &&
            meetingProvider === MEETING_PROVIDER.ZOOM &&
            Boolean(meetingId),
        [meetingId, meetingProvider, selectedDeliveryType]
    );
    const selectedHomework = useMemo(
        () =>
            publishedHomework.find((item) => String(item.id) === String(selectedHomeworkId)) || null,
        [publishedHomework, selectedHomeworkId]
    );

    useEffect(() => {
        if (!sourceVideoCourses.length) {
            setSelectedSourceVideoCourseId('');
            return;
        }

        setSelectedSourceVideoCourseId((prev) => {
            if (
                prev &&
                sourceVideoCourses.some((course) => String(course.id) === String(prev))
            ) {
                return prev;
            }
            return String(sourceVideoCourses[0].id);
        });
    }, [sourceVideoCourses]);

    useEffect(() => {
        if (!selectedSession) {
            setEditSession(EDIT_SESSION_DEFAULT);
            setSessionNotes('');
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
        setSessionNotes(selectedSession.notes || '');
    }, [selectedSession]);

    const selectedSessionMode = useMemo(
        () => getSessionMode(selectedSession, nowMs),
        [selectedSession, nowMs]
    );

    const selectedSessionJoinUrl = useMemo(
        () => resolveSessionJoinUrl(selectedSession),
        [selectedSession]
    );
    const selectedSessionMaterials = useMemo(
        () => (Array.isArray(selectedSession?.materials) ? selectedSession.materials : []),
        [selectedSession]
    );
    const selectedSessionRecordingUrl = selectedSession?.recordingUrl || '';
    const hasSessionNotesChanges = useMemo(
        () => (sessionNotes || '').trim() !== String(selectedSession?.notes || '').trim(),
        [selectedSession?.notes, sessionNotes]
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
                joinUrl: resolveSessionJoinUrl(session),
                joinAllowed: isJoinWindowOpen(session, nowMs),
            }));
    }, [sessions, selectedCourseId, selectedCourse, selectedGroup, nowMs]);

    const attendanceStats = useMemo(() => {
        const values = Object.values(attendanceRows);
        const present = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.PRESENT).length;
        const late = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.LATE).length;
        const absent = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.ABSENT).length;
        const excused = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.EXCUSED).length;
        const marked = values.filter((r) => r.status && r.status !== UNMARKED_ATTENDANCE_STATUS).length;
        const unmarked = Math.max(0, values.length - marked);
        return {
            total: values.length,
            present,
            late,
            absent,
            excused,
            marked,
            unmarked,
            presentRate: marked ? Math.round((present / marked) * 100) : 0,
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
            if (attendanceFilter === 'unmarked') return !status || status === UNMARKED_ATTENDANCE_STATUS;
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

    const attentionStudents = useMemo(() => {
        return students
            .map((student) => {
                const status = attendanceRows[student.id]?.status;
                const reasons = [];
                let severity = 99;

                if (status === SESSION_ATTENDANCE_STATUS.ABSENT) {
                    reasons.push('Бул сессияда келген жок');
                    severity = 0;
                } else if (status === SESSION_ATTENDANCE_STATUS.LATE) {
                    reasons.push('Бул сессияда кечикти');
                    severity = 1;
                } else if (status === SESSION_ATTENDANCE_STATUS.EXCUSED) {
                    reasons.push('Бул сессияда уруксат менен белгиленди');
                    severity = 2;
                }

                return reasons.length ? { ...student, reasons, severity } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.severity - b.severity || a.fullName.localeCompare(b.fullName))
            .slice(0, 8);
    }, [attendanceRows, students]);

    const consistentStudents = useMemo(() => {
        return students
            .map((student) => ({
                ...student,
                streak: studentStreaks[student.id] || 0,
            }))
            .filter((student) => student.streak > 0)
            .sort((a, b) => b.streak - a.streak || a.fullName.localeCompare(b.fullName))
            .slice(0, 8);
    }, [studentStreaks, students]);

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
        const approved = homeworkSubmissions.filter((item) => item.reviewState === 'approved').length;
        const rejected = homeworkSubmissions.filter((item) => item.reviewState === 'rejected').length;
        const needsRevision = homeworkSubmissions.filter(
            (item) => item.reviewState === 'needs_revision'
        ).length;
        const missing = homeworkSubmissions.filter((item) => item.reviewState === 'missing').length;
        const needsReview = homeworkSubmissions.filter(
            (item) => item.reviewState === 'needs_review'
        ).length;
        const pendingSubmission = homeworkSubmissions.filter(
            (item) => item.reviewState === 'pending_submission'
        ).length;
        const late = homeworkSubmissions.filter((item) => Boolean(item.isLate)).length;
        return {
            total: homeworkSubmissions.length,
            approved,
            rejected,
            needsRevision,
            missing,
            needsReview,
            pendingSubmission,
            late,
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

        const unmarkedCount = Object.values(attendanceRows).filter(
            (row) => !row.status || row.status === UNMARKED_ATTENDANCE_STATUS
        ).length;
        if (unmarkedCount > 0) {
            toast.error(`Адегенде ${unmarkedCount} студент үчүн катышуу статусун тандаңыз.`);
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
                rows,
            });
            toast.success('Катышуу ушул сессия үчүн сакталды.');

            const refreshed = await fetchCourseAttendance({
                courseId: Number(selectedCourseId),
                groupId: Number(selectedGroupId),
            });
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

    const saveSessionMaterials = async (
        materials,
        { successMessage = 'Материалдар жаңыртылды.', suppressSuccessToast = false } = {}
    ) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setSavingMaterials(true);
        try {
            await updateCourseSession(Number(selectedSessionId), {
                materials,
            });

            const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
            const list = toArray(res);
            setSessions(list);
            if (!suppressSuccessToast) {
                toast.success(successMessage);
            }
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Материалдарды жаңыртуу катасы'));
            return false;
        } finally {
            setSavingMaterials(false);
        }
    };

    const saveSessionNotes = async () => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setSavingSessionNotes(true);
        try {
            await updateCourseSession(Number(selectedSessionId), {
                notes: sessionNotes,
            });

            const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
            const list = toArray(res);
            setSessions(list);
            toast.success('Жазуулар сакталды.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Жазууларды сактоо катасы'));
            return false;
        } finally {
            setSavingSessionNotes(false);
        }
    };

    const refreshSelectedGroupSessions = async () => {
        const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
        const list = toArray(res);
        setSessions(list);
        return list;
    };

    const createActivityItem = async (activity) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setCreatingSessionActivity(true);
        try {
            await createSessionActivity(Number(selectedSessionId), activity);
            await refreshSelectedGroupSessions();
            toast.success('Иш кошулду.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Ишти сактоо катасы'));
            return false;
        } finally {
            setCreatingSessionActivity(false);
        }
    };

    const updateActivityItem = async (activityId, activity) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setSavingSessionActivityId(String(activityId));
        try {
            await updateSessionActivity(Number(selectedSessionId), Number(activityId), activity);
            await refreshSelectedGroupSessions();
            toast.success('Иш жаңыртылды.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Ишти жаңыртуу катасы'));
            return false;
        } finally {
            setSavingSessionActivityId(null);
        }
    };

    const deleteActivityItem = async (activityId) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setDeletingSessionActivityId(String(activityId));
        try {
            await deleteSessionActivity(Number(selectedSessionId), Number(activityId));
            await refreshSelectedGroupSessions();
            toast.success('Иш өчүрүлдү.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Ишти өчүрүү катасы'));
            return false;
        } finally {
            setDeletingSessionActivityId(null);
        }
    };

    const uploadSessionMaterialFile = async (file) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return null;
        }

        setUploadingMaterialFile(true);
        try {
            const uploaded = await uploadSessionMaterial(Number(selectedSessionId), file);
            const nextMaterials = [
                ...selectedSessionMaterials,
                {
                    title: uploaded.title || file.name,
                    url: uploaded.url || '',
                    storageKey: uploaded.storageKey || undefined,
                },
            ];

            const saved = await saveSessionMaterials(nextMaterials, {
                successMessage: 'Файл материалдарга кошулду.',
            });

            return saved ? uploaded : null;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Файлды жүктөө катасы'));
            return null;
        } finally {
            setUploadingMaterialFile(false);
        }
    };

    const addCourseAssetToSessionMaterials = async (asset) => {
        const exists = selectedSessionMaterials.some(
            (item) => item.storageKey && item.storageKey === asset.storageKey
        );
        if (exists) {
            toast.error('Бул материал сессияга мурунтан кошулган.');
            return false;
        }

        return saveSessionMaterials([
            ...selectedSessionMaterials,
            {
                title: asset.title,
                url: asset.url,
                storageKey: asset.storageKey,
            },
        ]);
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
            const refreshed = await fetchCourseAttendance({
                courseId: Number(selectedCourseId),
                groupId: Number(selectedGroupId),
            });
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
            if (res?.recordingUrl) {
                setSessions((prev) =>
                    prev.map((session) =>
                        String(session.id) === String(selectedSessionId)
                            ? { ...session, recordingUrl: res.recordingUrl }
                            : session
                    )
                );
            }
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

    const reviewHomeworkSubmission = async (submissionId, status, reviewComment = '') => {
        if (!selectedSessionId || !selectedHomeworkId || !submissionId) return;
        setReviewingSubmissionId(String(submissionId));
        try {
            await reviewSessionHomeworkSubmission(
                Number(selectedSessionId),
                Number(selectedHomeworkId),
                Number(submissionId),
                {
                    status,
                    reviewComment: String(reviewComment || '').trim() || undefined,
                }
            );
            const refreshed = await fetchSessionHomeworkReviewRoster(
                Number(selectedSessionId),
                Number(selectedHomeworkId)
            );
            setHomeworkSubmissions(toArray(refreshed?.items));
            toast.success('Тапшырма жооп статусу жаңыртылды.');
            return true;
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, 'Тапшырма жоопун баалоо катасы'));
            return false;
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
    const workspaceTitle = isCreateWorkspace ? 'Жаңы сессия' : 'Сессияны түзөтүү';
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
                            joinLiveSession={joinLiveSession}
                            selectedCourse={selectedCourse}
                            selectedDeliveryType={selectedDeliveryType}
                            selectedGroup={selectedGroup}
                            selectedModeMeta={selectedModeMeta}
                            selectedSession={selectedSession}
                            selectedSessionJoinAllowed={selectedSessionJoinAllowed}
                            selectedSessionJoinUrl={selectedSessionJoinUrl}
                            selectedSessionMode={selectedSessionMode}
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

                        <SessionSetupModal
                            editSession={editSession}
                            isCreateWorkspace={isCreateWorkspace}
                            isOpen={isSessionSetupOpen}
                            modalRef={sessionSetupModalRef}
                            nextSessionIndex={nextSessionIndex}
                            onClose={() => setIsSessionSetupOpen(false)}
                            onSubmit={workspaceAction}
                            quickSession={quickSession}
                            selectedCourse={selectedCourse}
                            selectedGroup={selectedGroup}
                            selectedSession={selectedSession}
                            setEditSession={setEditSession}
                            setQuickSession={setQuickSession}
                            workspaceActionLabel={workspaceActionLabel}
                            workspaceDescription={workspaceDescription}
                            workspaceDisabled={workspaceDisabled}
                            workspaceDisabledReason={workspaceDisabledReason}
                            workspaceSaving={workspaceSaving}
                            workspaceTitle={workspaceTitle}
                        />

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
                            selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE && (
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
                                        Сабакка кирүү
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
                                <div className="grid gap-3 md:grid-cols-5">
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
                                    <DashboardMetricCard
                                        label="Уруксат менен"
                                        value={attendanceStats.excused}
                                        tone="default"
                                        icon={FiAlertCircle}
                                    />
                                </div>

                                <SessionAttendanceTab
                                    applyAttendanceStatus={applyAttendanceStatus}
                                    attendanceFilter={attendanceFilter}
                                    attendanceQuery={attendanceQuery}
                                    attendanceRows={attendanceRows}
                                    attendanceStats={attendanceStats}
                                    canImportZoomAttendance={canImportZoomAttendance}
                                    filteredStudents={filteredStudents}
                                    hasAttendanceChanges={hasAttendanceChanges}
                                    importZoomAttendanceToSession={importZoomAttendanceToSession}
                                    importingAttendance={importingAttendance}
                                    loadingStudents={loadingStudents}
                                    saveAttendance={saveAttendance}
                                    savingAttendance={savingAttendance}
                                    selectedCourseId={selectedCourseId}
                                    selectedGroup={selectedGroup}
                                    selectedSession={selectedSession}
                                    selectedSessionId={selectedSessionId}
                                    selectedSessionMode={selectedSessionMode}
                                    setAttendanceFilter={setAttendanceFilter}
                                    setAttendanceQuery={setAttendanceQuery}
                                    students={students}
                                    toSessionTime={toSessionTime}
                                    updateNotes={updateNotes}
                                    updateStatus={updateStatus}
                                />
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <SessionResourcesTab
                                deletingMeeting={deletingMeeting}
                                importZoomAttendanceToSession={importZoomAttendanceToSession}
                                importingAttendance={importingAttendance}
                                joinLiveSession={joinLiveSession}
                                loadingMeetingState={loadingMeetingState}
                                meetingId={meetingId}
                                meetingJoinUrl={meetingJoinUrl}
                                meetingProvider={meetingProvider}
                                availableCourseAssets={courseResourceAssets}
                                loadingCourseAssets={loadingCourseResourceAssets}
                                onAddCourseAsset={addCourseAssetToSessionMaterials}
                                onSourceVideoCourseChange={setSelectedSourceVideoCourseId}
                                onSaveMaterials={saveSessionMaterials}
                                onUploadMaterialFile={uploadSessionMaterialFile}
                                publishedVideoCourses={sourceVideoCourses}
                                removeMeeting={removeMeeting}
                                restoreMeetingState={restoreMeetingState}
                                saveMeetingLink={saveMeetingLink}
                                savingMaterials={savingMaterials}
                                savingMeeting={savingMeeting}
                                showCourseAssetReuse={canReusePublishedCourseAssets}
                                selectedSourceVideoCourseId={selectedSourceVideoCourseId}
                                selectedDeliveryType={selectedDeliveryType}
                                selectedGroupLocation={selectedGroup?.location || ''}
                                selectedSessionId={selectedSessionId}
                                selectedSessionJoinAllowed={selectedSessionJoinAllowed}
                                selectedSessionJoinUrl={selectedSessionJoinUrl}
                                selectedSessionMaterials={selectedSessionMaterials}
                                selectedSessionMode={selectedSessionMode}
                                selectedSessionRecordingUrl={selectedSessionRecordingUrl}
                                setMeetingJoinUrl={setMeetingJoinUrl}
                                setMeetingProvider={setMeetingProvider}
                                syncZoomRecordingsToSession={syncZoomRecordingsToSession}
                                syncingRecordings={syncingRecordings}
                                uploadingMaterialFile={uploadingMaterialFile}
                            />
                        )}

                        {activeTab === 'homework' && (
                            <SessionHomeworkTab
                                beginHomeworkEdit={beginHomeworkEdit}
                                cancelHomeworkEdit={cancelHomeworkEdit}
                                editHomeworkDeadline={editHomeworkDeadline}
                                editHomeworkDescription={editHomeworkDescription}
                                editHomeworkTitle={editHomeworkTitle}
                                editingHomeworkId={editingHomeworkId}
                                filteredHomework={filteredHomework}
                                formatDisplayDate={formatDisplayDate}
                                getAttachmentName={getAttachmentName}
                                getSubmissionAttachmentUrl={getSubmissionAttachmentUrl}
                                getSubmissionPreview={getSubmissionPreview}
                                getSubmissionStatusMeta={getSubmissionStatusMeta}
                                homeworkDeadline={homeworkDeadline}
                                homeworkDescription={homeworkDescription}
                                homeworkFilter={homeworkFilter}
                                homeworkQuery={homeworkQuery}
                                homeworkReviewFilter={homeworkReviewFilter}
                                homeworkStats={homeworkStats}
                                homeworkSubmissions={homeworkSubmissions}
                                homeworkTitle={homeworkTitle}
                                loadingHomework={loadingHomework}
                                loadingHomeworkSubmissions={loadingHomeworkSubmissions}
                                publishHomework={publishHomework}
                                publishedHomework={publishedHomework}
                                resolveHomeworkDeadline={resolveHomeworkDeadline}
                                reviewHomeworkSubmission={reviewHomeworkSubmission}
                                reviewingSubmissionId={reviewingSubmissionId}
                                saveHomeworkEdit={saveHomeworkEdit}
                                savingHomework={savingHomework}
                                selectedGroup={selectedGroup}
                                selectedHomework={selectedHomework}
                                selectedHomeworkId={selectedHomeworkId}
                                selectedHomeworkMeta={selectedHomeworkMeta}
                                selectedSession={selectedSession}
                                selectedSessionId={selectedSessionId}
                                setEditHomeworkDeadline={setEditHomeworkDeadline}
                                setEditHomeworkDescription={setEditHomeworkDescription}
                                setEditHomeworkTitle={setEditHomeworkTitle}
                                setHomeworkDeadline={setHomeworkDeadline}
                                setHomeworkDescription={setHomeworkDescription}
                                setHomeworkFilter={setHomeworkFilter}
                                setHomeworkQuery={setHomeworkQuery}
                                setHomeworkReviewFilter={setHomeworkReviewFilter}
                                setHomeworkTitle={setHomeworkTitle}
                                setSelectedHomeworkId={setSelectedHomeworkId}
                                students={students}
                                submissionStats={submissionStats}
                                toggleHomeworkPublish={toggleHomeworkPublish}
                                updatingHomework={updatingHomework}
                            />
                        )}

                        {activeTab === 'notes' && (
                            <SessionNotesTab
                                canEdit={Boolean(selectedSessionId)}
                                hasChanges={hasSessionNotesChanges}
                                notes={sessionNotes}
                                onChange={setSessionNotes}
                                onSave={saveSessionNotes}
                                savedAt={selectedSession?.notes?.trim() ? selectedSession?.notesUpdatedAt || '' : ''}
                                saving={savingSessionNotes}
                            />
                        )}

                        {activeTab === 'activities' && (
                            <SessionActivitiesTab
                                activities={Array.isArray(selectedSession?.activities) ? selectedSession.activities : []}
                                canEdit={Boolean(selectedSessionId)}
                                onCreateActivity={createActivityItem}
                                onUpdateActivity={updateActivityItem}
                                onDeleteActivity={deleteActivityItem}
                                savedAt={selectedSession?.activities?.length ? selectedSession?.activitiesUpdatedAt || '' : ''}
                                creating={creatingSessionActivity}
                                savingActivityId={savingSessionActivityId}
                                deletingActivityId={deletingSessionActivityId}
                            />
                        )}

                        {activeTab === 'engagement' && (
                            <SessionEngagementTab
                                attentionStudents={attentionStudents}
                                attendanceStats={attendanceStats}
                                consistentStudents={consistentStudents}
                                homeworkStats={homeworkStats}
                            />
                        )}
                    </section>
                </div>
            ) : null}
        </div>
    );
};

const SessionHeaderContent = ({
    joinLiveSession,
    selectedCourse,
    selectedDeliveryType,
    selectedGroup,
    selectedModeMeta,
    selectedSession,
    selectedSessionJoinAllowed,
    selectedSessionJoinUrl,
    selectedSessionMode,
}) => {
    const SelectedModeIcon = selectedModeMeta.icon;
    const isOnlineLive = selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE;

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
                {selectedSession ? (
                    <div className="mt-2 text-xs font-medium text-edubot-muted dark:text-slate-400">
                        {getCourseTypeLabel(selectedDeliveryType)}
                        {selectedDeliveryType === COURSE_TYPE.OFFLINE && selectedGroup?.location
                            ? ` • ${selectedGroup.location}`
                            : ''}
                    </div>
                ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {isOnlineLive && (
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
                        Сабакка кирүү
                    </button>
                )}
            </div>
        </div>
    );
};

SessionHeaderContent.propTypes = {
    joinLiveSession: PropTypes.func.isRequired,
    selectedCourse: PropTypes.shape({
        title: PropTypes.string,
        name: PropTypes.string,
    }),
    selectedDeliveryType: PropTypes.string.isRequired,
    selectedGroup: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
        location: PropTypes.string,
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
};

export default SessionWorkspace;

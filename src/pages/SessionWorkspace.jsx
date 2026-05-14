import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    COURSE_SESSION_STATUS,
    COURSE_TYPE,
} from '@shared/contracts';
import {
    fetchSessionInsights,
    fetchCourseSessions,
    updateCourseSession,
} from '@services/api';
import {
    FiAlertCircle,
    FiActivity,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiLayers,
    FiPlayCircle,
    FiRadio,
    FiUsers,
} from 'react-icons/fi';
import SessionAttendanceTab from '@features/groupSessions/components/SessionAttendanceTab.jsx';
import SessionActivitiesTab from '@features/groupSessions/components/SessionActivitiesTab.jsx';
import SessionEngagementTab from '@features/groupSessions/components/SessionEngagementTab.jsx';
import SessionHomeworkTab from '@features/groupSessions/components/SessionHomeworkTab.jsx';
import SessionNotesTab from '@features/groupSessions/components/SessionNotesTab.jsx';
import SessionResourcesTab from '@features/groupSessions/components/SessionResourcesTab.jsx';
import SessionSetupModal from '@features/groupSessions/components/SessionSetupModal.jsx';
import { useSessionSetupModalState } from '@features/groupSessions/hooks/useSessionSetupModalState';
import { useSessionWorkspaceActivities } from '@features/groupSessions/hooks/useSessionWorkspaceActivities';
import { useSessionWorkspaceAttendance } from '@features/groupSessions/hooks/useSessionWorkspaceAttendance';
import { useSessionWorkspaceEditor } from '@features/groupSessions/hooks/useSessionWorkspaceEditor';
import { useSessionWorkspaceHomework } from '@features/groupSessions/hooks/useSessionWorkspaceHomework';
import { useSessionWorkspaceResources } from '@features/groupSessions/hooks/useSessionWorkspaceResources';
import { useSessionWorkspaceRouteState } from '@features/groupSessions/hooks/useSessionWorkspaceRouteState';
import { useSessionWorkspaceSelections } from '@features/groupSessions/hooks/useSessionWorkspaceSelections';
import {
    QUICK_SESSION_DEFAULT,
    SESSION_WORKSPACE_TABS,
    formatCountdown,
    formatDisplayDate,
    getAttachmentName,
    getCourseTypeLabel,
    getNextSessionDateTime,
    getSubmissionAttachmentUrl,
    getSubmissionPreview,
    getWorkspaceErrorMessage,
    isJoinWindowOpen,
    normalizeCourseType,
    resolveHomeworkDeadline,
    resolveSessionJoinUrl,
    toArray,
    toLocalDateKey,
    toSessionTime,
} from '@features/groupSessions/utils/sessionWorkspace.helpers';
import { getDashboardPath } from '@shared/utils/navigation';
import {
    DashboardFilterBar,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    EmptyState,
    StatusBadge,
} from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';

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

const SESSION_STATUS_OPTIONS = [
    { value: COURSE_SESSION_STATUS.SCHEDULED, label: 'Пландалган' },
    { value: COURSE_SESSION_STATUS.COMPLETED, label: 'Аяктады' },
    { value: COURSE_SESSION_STATUS.CANCELLED, label: 'Жокко чыгарылды' },
];

const SESSION_STATUS_META = {
    [COURSE_SESSION_STATUS.SCHEDULED]: {
        label: 'Пландалган',
        tone: 'default',
    },
    [COURSE_SESSION_STATUS.COMPLETED]: {
        label: 'Аяктады',
        tone: 'green',
    },
    [COURSE_SESSION_STATUS.CANCELLED]: {
        label: 'Жокко чыгарылды',
        tone: 'red',
    },
};

const getCourseSessionStatusMeta = (status) =>
    SESSION_STATUS_META[status] || SESSION_STATUS_META[COURSE_SESSION_STATUS.SCHEDULED];

const PRIMARY_WORKSPACE_TAB_IDS = new Set(['attendance', 'materials', 'homework']);
const WORKSPACE_TAB_GROUPS = [
    {
        label: 'Негизги workflow',
        description: 'Сессия учурунда эң көп колдонулган аракеттер.',
        tabs: SESSION_WORKSPACE_TABS.filter((tab) => PRIMARY_WORKSPACE_TAB_IDS.has(tab.id)),
    },
    {
        label: 'Кошумча workspace',
        description: 'Рефлексия, activity жана engagement анализи.',
        tabs: SESSION_WORKSPACE_TABS.filter((tab) => !PRIMARY_WORKSPACE_TAB_IDS.has(tab.id)),
    },
];
const workspaceNoticeClassNames = {
    info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

const WorkspaceNotice = ({ tone = 'info', title, message, action }) => (
    <div className={`rounded-[1.25rem] border px-4 py-3 text-sm ${workspaceNoticeClassNames[tone] || workspaceNoticeClassNames.info}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <div className="font-semibold">{title}</div>
                {message ? <p className="mt-1 opacity-90">{message}</p> : null}
            </div>
            {action}
        </div>
    </div>
);

WorkspaceNotice.propTypes = {
    tone: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    action: PropTypes.node,
};

const getSessionMode = (session, nowMs) => {
    const start = session?.startsAt ? new Date(session.startsAt).getTime() : null;
    const end = session?.endsAt ? new Date(session.endsAt).getTime() : null;
    if (!start || !end) return 'scheduled';
    if (nowMs < start) return 'upcoming';
    if (nowMs >= start && nowMs <= end) return 'live';
    return 'completed';
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

const SessionWorkspace = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const {
        activeTab,
        activityResponseFilter,
        homeworkReviewFilter,
        openWorkspaceTab,
        pendingRouteSelectionRef,
        setHomeworkReviewFilter,
    } = useSessionWorkspaceRouteState();
    const {
        isSessionSetupOpen,
        sessionSetupModalRef,
        setIsSessionSetupOpen,
        setWorkspaceMode,
        workspaceMode,
    } = useSessionSetupModalState();
    const [workspaceNotice, setWorkspaceNotice] = useState(null);
    const setWorkspaceFeedback = useCallback((notice) => {
        setWorkspaceNotice(notice);
    }, []);
    const {
        courses,
        groups,
        handleCourseChange: setWorkspaceCourse,
        handleGroupChange: setWorkspaceGroup,
        loadingCourses,
        loadingGroups,
        loadingSessions,
        selectedCourseId,
        selectedGroupId,
        selectedSessionId,
        sessions,
        setSessions,
        setSelectedSessionId,
        sourceVideoCourses,
    } = useSessionWorkspaceSelections({
        user,
        pendingRouteSelectionRef,
        onNotice: setWorkspaceFeedback,
    });

    const [sessionNotes, setSessionNotes] = useState('');
    const [savingSessionNotes, setSavingSessionNotes] = useState(false);
    const [sessionInsights, setSessionInsights] = useState(null);
    const [loadingSessionInsights, setLoadingSessionInsights] = useState(false);
    const [nowMs, setNowMs] = useState(Date.now());
    const latestInsightsRequestRef = useRef(0);
    const selectedSessionIdRef = useRef('');

    useEffect(() => {
        selectedSessionIdRef.current = selectedSessionId;
    }, [selectedSessionId]);

    const refreshSessionInsights = useCallback(async () => {
        if (!selectedSessionId) {
            setSessionInsights(null);
            return null;
        }

        const requestedSessionId = String(selectedSessionId);
        const requestId = latestInsightsRequestRef.current + 1;
        latestInsightsRequestRef.current = requestId;
        setLoadingSessionInsights(true);
        try {
            const payload = await fetchSessionInsights(Number(selectedSessionId));
            if (
                latestInsightsRequestRef.current !== requestId ||
                selectedSessionIdRef.current !== requestedSessionId
            ) {
                return null;
            }
            setSessionInsights(payload || null);
            return payload || null;
        } catch (error) {
            console.error(error);
            if (
                latestInsightsRequestRef.current === requestId &&
                selectedSessionIdRef.current === requestedSessionId
            ) {
                toast.error(getWorkspaceErrorMessage(error, 'Кийинки аракеттерди жүктөө катасы.'));
                setSessionInsights(null);
            }
            return null;
        } finally {
            if (
                latestInsightsRequestRef.current === requestId &&
                selectedSessionIdRef.current === requestedSessionId
            ) {
                setLoadingSessionInsights(false);
            }
        }
    }, [selectedSessionId]);

    const {
        applyAttendanceStatus,
        attendanceFilter,
        attendanceQuery,
        attendanceRows,
        attendanceStats,
        filteredStudents,
        hasAttendanceChanges,
        hydrateAttendanceRows,
        loadingStudents,
        saveAttendance,
        savingAttendance,
        setAttendanceFilter,
        setAttendanceHistory,
        setAttendanceQuery,
        students,
        updateNotes,
        updateStatus,
    } = useSessionWorkspaceAttendance({
        selectedCourseId,
        selectedGroupId,
        selectedSessionId,
        onNotice: setWorkspaceFeedback,
        onRefreshInsights: refreshSessionInsights,
    });
    const {
        deleteSessionHomework,
        filteredHomework,
        homeworkFilter,
        homeworkQuery,
        homeworkStats,
        homeworkSubmissions,
        loadingHomework,
        loadingHomeworkSubmissions,
        publishHomework,
        publishedHomework,
        reviewHomeworkSubmission,
        reviewingSubmissionId,
        savingHomework,
        selectedHomework,
        selectedHomeworkId,
        selectedHomeworkMeta,
        setHomeworkFilter,
        setHomeworkQuery,
        setSelectedHomeworkId,
        submissionStats,
        toggleHomeworkPublish,
        updatingHomework,
        updateHomework,
    } = useSessionWorkspaceHomework({
        nowMs,
        pendingRouteSelectionRef,
        selectedSessionId,
        students,
        onRefreshInsights: refreshSessionInsights,
    });
    const {
        editSession,
        isCreateWorkspace,
        nextSessionIndex,
        quickSession,
        refreshSelectedGroupSessions,
        savingSessionStatus,
        setEditSession,
        setQuickSession,
        updateSelectedSessionStatus,
        workspaceAction,
        workspaceActionLabel,
        workspaceDescription,
        workspaceDisabled,
        workspaceDisabledReason,
        workspaceSaving,
        workspaceTitle,
    } = useSessionWorkspaceEditor({
        selectedGroupId,
        selectedSession,
        selectedSessionId,
        sessions,
        setIsSessionSetupOpen,
        setSessionNotes,
        setSelectedSessionId,
        setSessions,
        setWorkspaceFeedback,
        workspaceMode,
        onRefreshInsights: refreshSessionInsights,
    });
    const {
        activityResponses,
        createActivityItem,
        creatingSessionActivity,
        deleteActivityItem,
        deletingSessionActivityId,
        loadActivityResponses,
        loadingActivityResponsesId,
        reviewActivitySubmissionItem,
        reviewingActivitySubmissionId,
        savingSessionActivityId,
        updateActivityItem,
    } = useSessionWorkspaceActivities({
        selectedSessionId,
        onRefreshInsights: refreshSessionInsights,
        onRefreshSessions: refreshSelectedGroupSessions,
    });
    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!selectedSessionId) {
            setSessionInsights(null);
            setLoadingSessionInsights(false);
            return;
        }

        let cancelled = false;
        const loadInsights = async () => {
            const requestedSessionId = String(selectedSessionId);
            const requestId = latestInsightsRequestRef.current + 1;
            latestInsightsRequestRef.current = requestId;
            setLoadingSessionInsights(true);
            try {
                const payload = await fetchSessionInsights(Number(selectedSessionId));
                if (
                    cancelled ||
                    latestInsightsRequestRef.current !== requestId ||
                    selectedSessionIdRef.current !== requestedSessionId
                ) {
                    return;
                }
                setSessionInsights(payload || null);
            } catch (error) {
                if (
                    cancelled ||
                    latestInsightsRequestRef.current !== requestId ||
                    selectedSessionIdRef.current !== requestedSessionId
                ) {
                    return;
                }
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Кийинки аракеттерди жүктөө катасы.'));
                setSessionInsights(null);
            } finally {
                if (
                    !cancelled &&
                    latestInsightsRequestRef.current === requestId &&
                    selectedSessionIdRef.current === requestedSessionId
                ) {
                    setLoadingSessionInsights(false);
                }
            }
        };

        loadInsights();
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
    const selectedDeliveryType = useMemo(
        () => normalizeCourseType(selectedCourse, selectedSession, selectedGroup),
        [selectedCourse, selectedSession, selectedGroup]
    );
    const {
        addCourseAssetToSessionMaterials,
        canImportZoomAttendance,
        canReusePublishedCourseAssets,
        courseResourceAssets,
        deletingMeeting,
        importZoomAttendanceToSession,
        importingAttendance,
        joinLiveSession,
        loadingCourseResourceAssets,
        loadingMeetingState,
        meetingId,
        meetingJoinUrl,
        meetingProvider,
        removeMeeting,
        restoreMeetingState,
        saveMeetingLink,
        saveSessionMaterials,
        savingMaterials,
        savingMeeting,
        selectedSessionJoinUrl,
        selectedSessionMaterials,
        selectedSessionRecordingUrl,
        selectedSourceVideoCourseId,
        setMeetingJoinUrl,
        setMeetingProvider,
        setSelectedSourceVideoCourseId,
        syncZoomRecordingsToSession,
        syncingRecordings,
        uploadingMaterialFile,
        uploadSessionMaterialFile,
    } = useSessionWorkspaceResources({
        hydrateAttendanceRows,
        onRefreshInsights: refreshSessionInsights,
        selectedCourseId,
        selectedDeliveryType,
        selectedGroupId,
        selectedSession,
        selectedSessionId,
        setAttendanceHistory,
        setSessions,
        sourceVideoCourses,
    });
    const selectedSessionMode = useMemo(
        () => getSessionMode(selectedSession, nowMs),
        [selectedSession, nowMs]
    );
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

    const handleCourseChange = (courseId) => {
        setWorkspaceCourse(courseId);
        setQuickSession((prev) => ({
            ...QUICK_SESSION_DEFAULT,
            status: prev.status,
        }));
    };

    const handleGroupChange = (groupId) => {
        setWorkspaceGroup(groupId);
        setQuickSession((prev) => ({
            ...QUICK_SESSION_DEFAULT,
            status: prev.status,
        }));
    };

    const handleSessionChange = (sessionId) => {
        setSelectedSessionId(sessionId);
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

    const selectedModeMeta = SESSION_MODE_META[selectedSessionMode] || SESSION_MODE_META.scheduled;
    const SelectedModeIcon = selectedModeMeta.icon;
    const primaryWorkspaceTools = useMemo(
        () => [
            {
                tab: 'attendance',
                label: 'Катышууну белгилөө',
                description: `${attendanceStats.total} студент, ${attendanceStats.presentRate}% катышуу`,
                disabled: !selectedSessionId,
            },
            {
                tab: 'materials',
                label: 'Сабак ресурстары',
                description: selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE
                    ? 'Live шилтеме, жаздыруу жана материалдар'
                    : 'Материалдар жана жаздыруулар',
                disabled: !selectedSessionId,
            },
            {
                tab: 'homework',
                label: 'Үй тапшырма',
                description: `${homeworkStats.total} тапшырма, ${submissionStats.needsReview} жооп текшерүүдө`,
                disabled: !selectedSessionId,
            },
        ],
        [
            attendanceStats.presentRate,
            attendanceStats.total,
            homeworkStats.total,
            selectedDeliveryType,
            selectedSessionId,
            submissionStats.needsReview,
        ]
    );

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
                        eyebrow="Instructor workbench"
                        title="Сессия workspace"
                        description="Instructor dashboard ичиндеги активдүү сессия борбору. Курс, группа жана сессия тандалгандан кийин катышуу, ресурстар жана үй тапшырма ошол контекстте иштейт."
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
                                        Активдүү контекст
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
                            onSessionStatusChange={updateSelectedSessionStatus}
                            savingSessionStatus={savingSessionStatus}
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
                                        Сессия даярдоо
                                    </p>
                                    <p className="mt-1 max-w-2xl text-sm text-edubot-muted dark:text-slate-400">
                                        Түзүү жана түзөтүү аракеттери модалда калат. Негизги canvas активдүү сессияны жүргүзүүгө багытталган.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspaceMode('create');
                                            const nextDateTime = getNextSessionDateTime(selectedGroup);
                                            setQuickSession((prev) => ({
                                                ...QUICK_SESSION_DEFAULT,
                                                status: prev.status,
                                                sessionIndex: nextSessionIndex,
                                                startsAt: nextDateTime.startsAt,
                                                endsAt: nextDateTime.endsAt,
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
                                        onClick={() => navigate(getDashboardPath('instructor', 'groups'))}
                                        className="rounded-2xl border border-edubot-line bg-transparent px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:text-slate-200"
                                    >
                                        Groups workspace ачуу
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

                        {workspaceNotice ? (
                            <WorkspaceNotice
                                tone={workspaceNotice.tone}
                                title={workspaceNotice.title}
                                message={workspaceNotice.message}
                                action={
                                    workspaceNotice.tone === 'success' ? (
                                        <button
                                            type="button"
                                            onClick={() => setWorkspaceFeedback(null)}
                                            className="rounded-full border border-current px-3 py-1 text-xs font-semibold opacity-80 transition hover:opacity-100"
                                        >
                                            Жабуу
                                        </button>
                                    ) : null
                                }
                            />
                        ) : null}

                        <div className="grid gap-3 lg:grid-cols-3">
                            {primaryWorkspaceTools.map((tool) => (
                                <button
                                    key={tool.tab}
                                    type="button"
                                    onClick={() => openWorkspaceTab(tool.tab)}
                                    disabled={tool.disabled}
                                    className={`rounded-[1.25rem] border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${activeTab === tool.tab
                                        ? 'border-edubot-orange bg-edubot-orange/10 text-edubot-ink shadow-edubot-soft dark:bg-edubot-orange/15 dark:text-white'
                                        : 'border-edubot-line bg-white text-edubot-ink hover:border-edubot-orange/50 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                                        }`}
                                >
                                    <div className="text-sm font-semibold">{tool.label}</div>
                                    <p className="mt-1 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                        {tool.description}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <div className="grid gap-3 rounded-[1.5rem] border border-edubot-line/70 bg-edubot-surfaceAlt/70 p-3 dark:border-slate-700 dark:bg-slate-900/70 lg:grid-cols-[1.1fr,0.9fr]">
                            {WORKSPACE_TAB_GROUPS.map((group) => (
                                <div key={group.label} className="min-w-0 rounded-[1.25rem] bg-white/80 p-3 dark:bg-slate-950/80">
                                    <div className="mb-3">
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            {group.label}
                                        </div>
                                        <p className="mt-1 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                            {group.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => openWorkspaceTab(tab.id)}
                                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${activeTab === tab.id
                                                    ? 'border-edubot-orange bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-edubot-soft'
                                                    : 'border-transparent bg-white text-edubot-ink hover:border-edubot-line dark:bg-slate-900 dark:text-[#E8ECF3]'
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
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
                                deleteSessionHomework={deleteSessionHomework}
                                filteredHomework={filteredHomework}
                                formatDisplayDate={formatDisplayDate}
                                getAttachmentName={getAttachmentName}
                                getSubmissionAttachmentUrl={getSubmissionAttachmentUrl}
                                getSubmissionPreview={getSubmissionPreview}
                                getSubmissionStatusMeta={getSubmissionStatusMeta}
                                homeworkFilter={homeworkFilter}
                                homeworkQuery={homeworkQuery}
                                homeworkReviewFilter={homeworkReviewFilter}
                                homeworkStats={homeworkStats}
                                homeworkSubmissions={homeworkSubmissions}
                                loadingHomework={loadingHomework}
                                loadingHomeworkSubmissions={loadingHomeworkSubmissions}
                                publishHomework={publishHomework}
                                publishedHomework={publishedHomework}
                                resolveHomeworkDeadline={resolveHomeworkDeadline}
                                reviewHomeworkSubmission={reviewHomeworkSubmission}
                                reviewingSubmissionId={reviewingSubmissionId}
                                savingHomework={savingHomework}
                                selectedGroup={selectedGroup}
                                selectedHomework={selectedHomework}
                                selectedHomeworkId={selectedHomeworkId}
                                selectedHomeworkMeta={selectedHomeworkMeta}
                                selectedSession={selectedSession}
                                selectedSessionId={selectedSessionId}
                                setHomeworkFilter={setHomeworkFilter}
                                setHomeworkQuery={setHomeworkQuery}
                                setHomeworkReviewFilter={setHomeworkReviewFilter}
                                setSelectedHomeworkId={setSelectedHomeworkId}
                                students={students}
                                submissionStats={submissionStats}
                                toggleHomeworkPublish={toggleHomeworkPublish}
                                updatingHomework={updatingHomework}
                                updateHomework={updateHomework}
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
                                responsesByActivity={activityResponses}
                                loadingResponsesId={loadingActivityResponsesId}
                                reviewingSubmissionId={reviewingActivitySubmissionId}
                                onLoadResponses={loadActivityResponses}
                                onReviewSubmission={reviewActivitySubmissionItem}
                                activityResponseFilter={activityResponseFilter}
                            />
                        )}

                        {activeTab === 'engagement' && (
                            <SessionEngagementTab
                                insights={sessionInsights}
                                loading={loadingSessionInsights}
                                onOpenTab={openWorkspaceTab}
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
    onSessionStatusChange,
    savingSessionStatus,
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
    const officialStatus = selectedSession?.status || COURSE_SESSION_STATUS.SCHEDULED;
    const officialStatusMeta = getCourseSessionStatusMeta(officialStatus);
    const canMarkCompleted =
        Boolean(selectedSession) && officialStatus !== COURSE_SESSION_STATUS.COMPLETED;

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
                    {selectedSession ? (
                        <StatusBadge tone={officialStatusMeta.tone} className="gap-1">
                            {officialStatusMeta.label}
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
                        ? ` • ${formatDisplayDate(selectedSession.startsAt)} ${toSessionTime(selectedSession.startsAt)} - ${toSessionTime(selectedSession.endsAt)}`
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

            <div className="flex flex-wrap items-center justify-end gap-2">
                <label className="min-w-[11rem] text-xs font-semibold text-edubot-muted dark:text-slate-400">
                    Сессия статусу
                    <select
                        value={officialStatus}
                        onChange={(event) => onSessionStatusChange(event.target.value)}
                        disabled={!selectedSession || savingSessionStatus}
                        className="dashboard-select mt-1 min-h-[2.75rem] w-full text-sm text-edubot-ink disabled:opacity-60 dark:text-white"
                    >
                        {SESSION_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                {canMarkCompleted ? (
                    <button
                        type="button"
                        onClick={() => onSessionStatusChange(COURSE_SESSION_STATUS.COMPLETED)}
                        disabled={savingSessionStatus}
                        className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    >
                        <FiCheckCircle className="h-4 w-4" />
                        {savingSessionStatus ? 'Жаңыртылууда...' : 'Аяктады'}
                    </button>
                ) : null}
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
    onSessionStatusChange: PropTypes.func.isRequired,
    savingSessionStatus: PropTypes.bool.isRequired,
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
        status: PropTypes.string,
    }),
    selectedSessionJoinAllowed: PropTypes.bool.isRequired,
    selectedSessionJoinUrl: PropTypes.string,
    selectedSessionMode: PropTypes.string.isRequired,
};

export default SessionWorkspace;

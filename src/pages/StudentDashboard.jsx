import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    fetchStudentCourses,
    fetchStudentDashboard,
    fetchStudentUpcomingSessions,
    fetchStudentRecordings,
    fetchStudentHomework,
    fetchSessionHomework,
    submitSessionHomework,
    fetchUserProfile,
    updateUserProfile,
    fetchStudentProgress,
    fetchStudentCertificates,
    fetchStudentNotificationSettings,
    fetchWeeklyLeaderboard,
    updateStudentNotificationSettings,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    FiHome,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiBarChart2,
    FiUser,
    FiBell,
    FiMessageCircle,
    FiPlay,
} from 'react-icons/fi';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import Loader from '@shared/ui/Loader';
import LeaderboardHub from '../features/leaderboard/components/LeaderboardHub';
import StudentAnalyticsPage from './StudentAnalytics';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import {
    AchievementCloud,
    buildLeaderboardSnapshot,
    ChallengeRail,
    LeaderboardListCard,
} from '../features/leaderboard/components/LeaderboardExperience';

const NAV_ITEMS = [
    // Primary Navigation - Core Learning Activities
    { id: 'overview', label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: 'my-courses', label: 'Курстарым', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: 'schedule', label: 'Жүгүртмө', icon: FiCalendar, category: 'primary', priority: 3 },

    // Learning Progress - Performance & Achievement
    { id: 'progress', label: 'Прогресс', icon: FiBarChart2, category: 'progress', priority: 1 },
    { id: 'leaderboard', label: 'Рейтинг', icon: FiFilter, category: 'progress', priority: 2 },
    { id: 'certificates', label: 'Сертификаттар', icon: FiCheckCircle, category: 'progress', priority: 3 },

    // Personal Management - Settings & Communication
    { id: 'profile', label: 'Профиль', icon: FiUser, category: 'personal', priority: 1 },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell, category: 'personal', priority: 2 },
    { id: 'chat', label: 'Чат', icon: FiMessageCircle, category: 'personal', priority: 3 },
];

const DEFAULT_NOTIFICATION_SETTINGS = {
    lessonReminders: true,
    announcementEmails: true,
    taskUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
};

const NOTIFICATION_LABELS = {
    lessonReminders: {
        label: 'Сабак эскертмелери',
        description: 'Сабак башталар алдында эскертүү алыңыз.',
    },
    announcementEmails: {
        label: 'Курс боюнча жаңылыктар',
        description: 'Жаңы модулдар жана маанилүү окуу жаңылыктары email аркылуу жетет.',
    },
    taskUpdates: {
        label: 'Тапшырма эскертмелери',
        description: 'Тапшырмалардын мөөнөтү жакындаганда эскертүү алыңыз.',
    },
    smsAlerts: {
        label: 'SMS эскертүүлөр',
        description: 'Маанилүү окуялар боюнча SMS кабыл алыңыз.',
    },
    pushNotifications: {
        label: 'Калтырылган сабак эскертмелери',
        description: 'Калтырылган сабактар боюнча дароо билдирүү алыңыз.',
    },
};

const formatNotificationLabel = (key) =>
    key
        ?.replace(/([A-Z])/g, ' $1')
        ?.replace(/_/g, ' ')
        ?.replace(/\b\w/g, (l) => l.toUpperCase())
        ?.trim() || key;

const JOIN_WINDOW_MS = 10 * 60 * 1000;

const isOnlineLiveOffering = (offering) => {
    const type = String(offering?.courseType || offering?.type || '').toLowerCase();
    const modality = String(offering?.modality || offering?.modalityLabel || '').toLowerCase();
    return type === 'online_live' || modality.includes('online') || modality.includes('live');
};

const isStudentJoinWindowOpen = (offering, nowMs) => {
    const startMs = offering?.startAt ? new Date(offering.startAt).getTime() : null;
    const endMs = offering?.endAt ? new Date(offering.endAt).getTime() : null;
    if (!startMs || Number.isNaN(startMs)) return true;
    if (!endMs || Number.isNaN(endMs)) return nowMs >= startMs - JOIN_WINDOW_MS;
    return nowMs >= startMs - JOIN_WINDOW_MS && nowMs <= endMs;
};

const resolveCourseType = (item = {}) =>
    item.courseType || item.type || item.course?.courseType || item.course?.type || 'video';

const isOfflineOrLiveCourse = (item = {}) => {
    const type = String(resolveCourseType(item)).toLowerCase();
    return type === 'offline' || type === 'online_live';
};

const courseTypeLabel = (type) => {
    if (type === 'offline') return 'Оффлайн';
    if (type === 'online_live') return 'Онлайн түз эфир';
    return 'Видео';
};

const formatCountdown = (targetMs, nowMs) => {
    const totalSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds
    ).padStart(2, '0')}`;
};

const formatSessionDate = (isoValue) => {
    if (!isoValue) return 'Белгисиз убакыт';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return 'Белгисиз убакыт';
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const resolveInstructorName = (item = {}) =>
    item.instructorName ||
    item.teacherName ||
    item.instructor?.fullName ||
    item.teacher ||
    'Инструктор';

const resolveRecordings = (item = {}) => {
    if (Array.isArray(item.recordings)) return item.recordings;
    if (item.recordingUrl) {
        return [
            {
                id: `rec-${item.id || '1'}`,
                title: item.recordingTitle || 'Сабактын жазуусу',
                url: item.recordingUrl,
            },
        ];
    }
    return [];
};

const readNumber = (obj, paths = []) => {
    for (const path of paths) {
        const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
        const numeric = Number(value);
        if (Number.isFinite(numeric)) return numeric;
    }
    return null;
};

const readArray = (obj, paths = []) => {
    for (const path of paths) {
        const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
        if (Array.isArray(value)) return value;
    }
    return [];
};

const toItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const getTaskKey = (task = {}) =>
    String(
        task.id ||
        task.taskId ||
        `${task.sessionId || task.courseSessionId || 'task'}:${task.homeworkId || ''}`
    );

const resolveSessionHomeworkIds = (task = {}) => {
    const sessionRaw = task.sessionId || task.courseSessionId || task.session?.id;
    const homeworkRaw = task.homeworkId || task.id || task.taskId;

    const sessionId = Number(sessionRaw);
    const homeworkId = Number(homeworkRaw);

    return {
        sessionId: Number.isInteger(sessionId) && sessionId > 0 ? sessionId : null,
        homeworkId: Number.isInteger(homeworkId) && homeworkId > 0 ? homeworkId : null,
    };
};

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';
    const studentId = user?.id;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [summary, setSummary] = useState(null);
    const [courses, setCourses] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [filterCourseId, setFilterCourseId] = useState('');
    const [filterGroupId, setFilterGroupId] = useState('');
    const [progress, setProgress] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [leaderboardItems, setLeaderboardItems] = useState([]);
    const [leaderboardPreviewMeta, setLeaderboardPreviewMeta] = useState({ fallback: false, message: '' });
    const [notificationSettings, setNotificationSettings] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [tabLoading, setTabLoading] = useState(null);
    const [loadedTabs, setLoadedTabs] = useState({
        overview: false,
        'my-courses': false,
        schedule: false,
        tasks: false,
        progress: false,
        analytics: true,
        leaderboard: true,
        notifications: true,
        profile: true,
    });
    const [notificationsLoaded, setNotificationsLoaded] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);
    const [submittingTaskId, setSubmittingTaskId] = useState('');

    const studentFilters = useMemo(
        () => ({
            courseId: filterCourseId || undefined,
            groupId: filterGroupId || undefined,
            limit: 20,
        }),
        [filterCourseId, filterGroupId]
    );

    const groupOptions = useMemo(() => {
        const groups = [];
        offerings.forEach((item) => {
            const groupId = item.groupId || item.group?.id;
            if (!groupId) return;
            const groupName = item.groupName || item.group?.name || `Group #${groupId}`;
            if (!groups.some((g) => String(g.id) === String(groupId))) {
                groups.push({ id: String(groupId), name: groupName });
            }
        });
        return groups;
    }, [offerings]);

    const loadOverview = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('overview');
        try {
            const [summaryRes, leaderboardRes] = await Promise.all([
                fetchStudentDashboard(studentFilters),
                fetchWeeklyLeaderboard({ limit: 5 }),
            ]);

            setSummary(summaryRes || null);
            setLeaderboardItems(
                Array.isArray(leaderboardRes?.items) ? leaderboardRes.items : leaderboardRes || []
            );
            setLeaderboardPreviewMeta({
                fallback: Boolean(leaderboardRes?._fallback),
                message: leaderboardRes?._fallbackMessage || '',
            });
        } catch (error) {
            console.error('Failed to load overview', error);
            toast.error('Кыскача маалымат жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, overview: true }));
        }
    }, [studentId, studentFilters]);

    const loadCourses = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('my-courses');
        try {
            const coursesRes = await fetchStudentCourses(studentId);
            setCourses(Array.isArray(coursesRes?.items) ? coursesRes.items : coursesRes || []);
        } catch (error) {
            console.error('Failed to load courses', error);
            toast.error('Курстарды жүктөө мүмкүн болбоду');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, 'my-courses': true }));
        }
    }, [studentId]);

    const loadSchedule = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('schedule');
        try {
            const [offeringsRes, recordingsRes] = await Promise.all([
                fetchStudentUpcomingSessions(studentFilters),
                fetchStudentRecordings(studentFilters),
            ]);
            setOfferings(
                Array.isArray(offeringsRes?.items) ? offeringsRes.items : offeringsRes || []
            );
            setRecordings(
                Array.isArray(recordingsRes?.items) ? recordingsRes.items : recordingsRes || []
            );
        } catch (error) {
            console.error('Failed to load schedule', error);
            toast.error('Жүгүртмө жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, schedule: true }));
        }
    }, [studentId, studentFilters]);

    const loadTasks = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('tasks');
        try {
            const [tasksRes, sessionsRes] = await Promise.all([
                fetchStudentHomework(studentFilters),
                fetchStudentUpcomingSessions(studentFilters),
            ]);

            const sessionIds = [
                ...new Set(
                    toItems(sessionsRes)
                        .map((session) => session?.sessionId || session?.id || session?.offeringId)
                        .filter(Boolean)
                ),
            ].slice(0, 10);

            let sessionHomeworkItems = [];
            if (sessionIds.length > 0) {
                const responses = await Promise.all(
                    sessionIds.map((sessionId) =>
                        fetchSessionHomework(sessionId)
                            .then((data) => ({ data, sessionId }))
                            .catch(() => null)
                    )
                );

                sessionHomeworkItems = responses
                    .filter(Boolean)
                    .flatMap(({ data, sessionId }) =>
                        toItems(data).map((item) => ({
                            ...item,
                            sessionId,
                        }))
                    );
            }

            if (sessionHomeworkItems.length > 0) {
                setTasks(sessionHomeworkItems);
            } else {
                setTasks(toItems(tasksRes));
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
            toast.error('Тапшырмаларды жүктөө мүмкүн болбоду');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, tasks: true }));
        }
    }, [studentId, studentFilters]);

    const loadProgress = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('progress');
        try {
            const [progressRes, certificatesRes] = await Promise.all([
                fetchStudentProgress(studentId),
                fetchStudentCertificates(studentId),
            ]);
            setProgress(Array.isArray(progressRes?.items) ? progressRes.items : progressRes || []);
            setCertificates(
                Array.isArray(certificatesRes?.items)
                    ? certificatesRes.items
                    : certificatesRes || []
            );
        } catch (error) {
            console.error('Failed to load progress', error);
            toast.error('Прогресс маалыматтары жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, progress: true }));
        }
    }, [studentId]);

    const loadNotificationSettings = useCallback(async () => {
        if (!studentId) return;
        setNotificationLoading(true);
        try {
            const data = await fetchStudentNotificationSettings(studentId);
            setNotificationSettings({
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(data || {}),
            });
        } catch (error) {
            console.error('Failed to load notification settings', error);
            toast.error('Эскертмелерди жүктөө мүмкүн болбоду');
            setNotificationSettings((prev) => prev ?? DEFAULT_NOTIFICATION_SETTINGS);
        } finally {
            setNotificationLoading(false);
            setNotificationsLoaded(true);
        }
    }, [studentId]);

    const loadProfileData = useCallback(async () => {
        if (!studentId) return;
        setProfileLoading(true);
        try {
            const data = await fetchUserProfile(studentId);
            setProfileData(data || null);
        } catch (error) {
            console.error('Failed to load profile data', error);
            toast.error('Профиль маалыматы жүктөлгөн жок');
            setProfileData(null);
        } finally {
            setProfileLoading(false);
            setProfileLoaded(true);
        }
    }, [studentId]);

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') || 'overview';
        setActiveTab((prev) => (tabFromUrl !== prev ? tabFromUrl : prev));
    }, [searchParams]);

    useEffect(() => {
        if (!studentId) return;
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('tab', activeTab);
            return next;
        });
        const tab = activeTab;
        if (tab === 'overview') {
            loadOverview();
        } else if (tab === 'my-courses') {
            loadCourses();
        } else if (tab === 'schedule') {
            loadSchedule();
        } else if (tab === 'tasks') {
            loadTasks();
        } else if (tab === 'progress') {
            loadProgress();
        } else if (tab === 'profile') {
            if (!profileLoaded && !profileLoading) {
                loadProfileData();
            }
        }
        if (activeTab === 'profile' && !notificationsLoaded && !notificationLoading) {
            loadNotificationSettings();
        }
    }, [
        studentId,
        activeTab,
        loadOverview,
        loadCourses,
        loadSchedule,
        loadTasks,
        loadProgress,
        loadProfileData,
        loadNotificationSettings,
        notificationsLoaded,
        notificationLoading,
        profileLoaded,
        profileLoading,
        setSearchParams,
    ]);

    useEffect(() => {
        if (!filterCourseId) {
            setFilterGroupId('');
            return;
        }
        const selected = courses.find((course) => String(course.id) === String(filterCourseId));
        if (!isOfflineOrLiveCourse(selected)) {
            setFilterGroupId('');
            return;
        }
        const hasGroup = groupOptions.some((group) => String(group.id) === String(filterGroupId));
        if (!hasGroup) {
            setFilterGroupId('');
        }
    }, [filterCourseId, filterGroupId, courses, groupOptions]);

    const hasAttendanceEligibleCourses = useMemo(() => {
        if (filterCourseId) {
            const selected = courses.find((course) => String(course.id) === String(filterCourseId));
            return isOfflineOrLiveCourse(selected);
        }
        return courses.some((course) => isOfflineOrLiveCourse(course));
    }, [courses, filterCourseId]);

    const overviewStudent = useMemo(
        () => ({
            id: user?.id || null,
            name: summary?.name || user?.fullName || 'Студент',
            streak: summary?.streak || 0,
            lastLesson: summary?.lastLesson || null,
        }),
        [summary, user]
    );

    const overviewStats = useMemo(
        () =>
            summary?.stats || {
                activeCourses: 0,
                lessonsCompleted: 0,
                timeThisWeek: '—',
                pendingTasks: 0,
            },
        [summary]
    );

    const attendanceStats = useMemo(() => {
        if (!hasAttendanceEligibleCourses) {
            return { rate: 0, totalSessions: 0, present: 0, absent: 0 };
        }
        const rawRate = readNumber(summary, [
            'attendance.rate',
            'stats.attendanceRate',
            'attendanceRate',
            'attendance.percent',
        ]);
        const rate = rawRate !== null ? Math.round(rawRate) : null;
        const totalSessions =
            readNumber(summary, ['attendance.totalSessions', 'stats.totalSessions']) ||
            offerings.filter(
                (item) => item.startAt && new Date(item.startAt).getTime() < Date.now()
            ).length;
        const present =
            readNumber(summary, ['attendance.present', 'stats.attendedSessions']) ||
            Math.round((totalSessions * (rate ?? 80)) / 100);
        const absent = Math.max(0, totalSessions - present);
        return {
            rate: rate ?? (totalSessions ? Math.round((present / totalSessions) * 100) : 0),
            totalSessions,
            present,
            absent,
        };
    }, [summary, offerings, hasAttendanceEligibleCourses]);

    const hasActiveStudentAccess = useMemo(() => {
        if (Number(summary?.stats?.upcomingSessions || 0) > 0) return true;
        if (Number(summary?.stats?.availableRecordings || 0) > 0) return true;
        if (Number(summary?.stats?.homeworkOpen || 0) > 0) return true;
        if (Number(overviewStats.activeCourses || 0) > 0) return true;
        if (courses.length > 0) return true;
        if (offerings.length > 0) return true;
        if (tasks.length > 0) return true;
        if (progress.length > 0) return true;
        return false;
    }, [summary, overviewStats.activeCourses, courses.length, offerings.length, tasks.length, progress.length]);

    const engagement = useMemo(() => {
        const calculatedXp =
            readNumber(summary, ['xp', 'stats.xp', 'gamification.xp', 'engagement.xp']) ||
            progress.reduce(
                (acc, item) => acc + Math.round((Number(item.progressPercent || 0) || 0) * 4),
                0
            ) +
            tasks.filter((task) => task.status === 'completed').length * 30;
        const xp = Math.max(0, calculatedXp);
        const level = Math.max(1, Math.floor(xp / 500) + 1);
        const currentLevelStart = (level - 1) * 500;
        const nextLevelXp = level * 500;
        const streak =
            readNumber(summary, [
                'streak',
                'stats.streakDays',
                'engagement.streak',
                'gamification.streakDays',
            ]) || 0;
        return {
            xp,
            streak,
            level,
            currentLevelXp: xp - currentLevelStart,
            nextLevelGap: nextLevelXp - currentLevelStart,
        };
    }, [summary, progress, tasks]);

    const milestoneItems = useMemo(() => {
        const incoming = readArray(summary, [
            'milestones',
            'engagement.milestones',
            'gamification.milestones',
        ]);
        if (incoming.length) {
            return incoming.map((item, index) => ({
                id: item.id || item.milestoneId || `m-${index}`,
                title: item.title || item.name || item.label || 'Этап',
                value: item.value || item.description || item.progressText || '',
            }));
        }
        return [
            {
                id: 'm1',
                title: 'Курсту аяктоо',
                value: `${overviewStats.lessonsCompleted || 0} сабак бүткөн`,
            },
            {
                id: 'm2',
                title: 'Катышуу максаты',
                value: `${attendanceStats.rate}% айлык катышуу`,
            },
            {
                id: 'm3',
                title: 'Жумалык туруктуулук',
                value: `${engagement.streak} күн катары менен окуу`,
            },
        ];
    }, [summary, overviewStats.lessonsCompleted, attendanceStats.rate, engagement.streak]);

    const badgeItems = useMemo(() => {
        const incoming = readArray(summary, [
            'badges',
            'engagement.badges',
            'gamification.badges',
            'achievements',
        ]);
        if (incoming.length) {
            return incoming.map((item, index) => ({
                id: item.id || item.badgeId || `b-${index}`,
                title: item.title || item.name || item.label || 'Badge',
            }));
        }
        const badges = [];
        if (engagement.streak >= 3) badges.push({ id: 'b1', title: 'Streak Starter' });
        if (attendanceStats.rate >= 90) badges.push({ id: 'b2', title: 'Perfect Presence' });
        if (engagement.xp >= 1000) badges.push({ id: 'b3', title: 'XP 1000+' });
        if (!badges.length) badges.push({ id: 'b0', title: 'First Step' });
        return badges;
    }, [summary, engagement.streak, attendanceStats.rate, engagement.xp]);

    const announcementItems = useMemo(() => {
        const incoming = readArray(summary, [
            'announcements',
            'notifications.announcements',
            'feed.announcements',
            'updates',
        ]);
        if (incoming.length) {
            return incoming.map((item, index) => ({
                id: item.id || item.announcementId || `a-${index}`,
                title: item.title || item.subject || item.name || 'Announcement',
                body: item.body || item.message || item.description || '',
            }));
        }

        return [
            {
                id: 'a-default-1',
                title: 'Окуу графигиңизди текшериңиз',
                body: 'Кийинки сабактарыңызды жана тапшырмаларды табдардан көрө аласыз.',
            },
            {
                id: 'a-default-2',
                title: 'Прогрессти көзөмөлдөңүз',
                body: 'Прогресс жана аналитика табдары аркылуу жыйынтыктарды текшериңиз.',
            },
        ];
    }, [summary]);

    const offeringsByCourse = useMemo(() => {
        const map = new Map();
        offerings.forEach((offering) => {
            const key = String(
                offering.courseId || offering.course?.id || offering.course?.courseId || ''
            );
            if (!key) return;
            const current = map.get(key) || [];
            current.push(offering);
            map.set(key, current);
        });
        return map;
    }, [offerings]);

    const progressItems = useMemo(() => {
        return (progress || []).map((item) => {
            const lessonsArray = Array.isArray(item.lessons) ? item.lessons : [];
            const sectionsMap = new Map();
            lessonsArray.forEach((lesson) => {
                const sectionKey =
                    lesson.sectionId ?? `section-${lesson.sectionTitle || 'unknown'}`;
                if (!sectionsMap.has(sectionKey)) {
                    sectionsMap.set(sectionKey, {
                        sectionId: lesson.sectionId,
                        sectionTitle: lesson.sectionTitle || 'Секция',
                        sectionOrder: lesson.sectionOrder ?? 0,
                        lessons: [],
                    });
                }
                sectionsMap.get(sectionKey).lessons.push(lesson);
            });
            const sections = Array.from(sectionsMap.values())
                .map((section) => ({
                    ...section,
                    lessons: section.lessons
                        .slice()
                        .sort(
                            (a, b) =>
                                (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0) ||
                                String(a.lessonTitle || '').localeCompare(b.lessonTitle || '')
                        ),
                }))
                .sort(
                    (a, b) =>
                        (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0) ||
                        String(a.sectionTitle || '').localeCompare(b.sectionTitle || '')
                );
            const totalLessons =
                item.lessonsTotal ?? (lessonsArray.length ? lessonsArray.length : 0);
            const completedLessons = item.lessonsCompleted ?? 0;
            const progressPercent =
                totalLessons > 0
                    ? Math.min(100, Math.round((completedLessons * 100) / totalLessons))
                    : 0;
            const flatOrderedLessons = sections.flatMap((section) => section.lessons);
            const resumeLesson =
                item.lastViewedLesson && item.lastViewedLesson.lessonId
                    ? item.lastViewedLesson
                    : flatOrderedLessons.find((lesson) => !lesson.completed) ||
                    flatOrderedLessons[0];
            const hasCertificate =
                item.certificate ??
                certificates.some(
                    (cert) => cert.courseId === item.courseId || cert.course === item.course
                );
            return {
                courseId: item.courseId,
                courseTitle: item.courseTitle || item.course || 'Course',
                lessonsCompleted: completedLessons,
                lessonsTotal: totalLessons,
                progressPercent,
                sections: sections.map((section) => ({
                    ...section,
                    lessons: section.lessons.map((lesson) => ({
                        ...lesson,
                        kind: lesson.kind || 'video',
                    })),
                })),
                resumeLesson,
                hasCertificate,
            };
        });
    }, [progress, certificates]);

    const handleNotificationChange = useCallback((key, value) => {
        setNotificationSettings((prev) => ({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(prev || {}),
            [key]: value,
        }));
    }, []);

    const handleSaveNotifications = useCallback(async () => {
        if (!studentId) return;
        setSavingNotifications(true);
        try {
            const payload = {
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(notificationSettings || {}),
            };
            const updated = await updateStudentNotificationSettings(studentId, payload);
            setNotificationSettings({
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(updated || {}),
            });
            toast.success('Эскертмелер сакталды');
        } catch (error) {
            console.error('Failed to save notifications', error);
            toast.error('Эскертмелерди сактоо мүмкүн болбоду');
        } finally {
            setSavingNotifications(false);
        }
    }, [studentId, notificationSettings]);

    const handleSaveProfile = useCallback(
        async ({ fullName, phoneNumber, avatarFile, newPassword, confirmPassword }) => {
            if (!studentId) return false;

            if (newPassword && newPassword !== confirmPassword) {
                toast.error('Жаңы сырсөздөр дал келбейт.');
                return false;
            }
            if (newPassword && newPassword.length < 6) {
                toast.error('Сырсөз кеминде 6 белги болушу керек.');
                return false;
            }
            if (phoneNumber) {
                const digitsOnly = String(phoneNumber).replace(/\D/g, '');
                if (digitsOnly.length < 10 || !/^\+\d{10,15}$/.test(String(phoneNumber))) {
                    toast.error(
                        'Телефон номери эл аралык форматта болсун. Мисалы: +996700123456'
                    );
                    return false;
                }
            }

            setSavingProfile(true);
            try {
                const form = new FormData();
                form.append('fullName', (fullName || '').trim());
                if (phoneNumber) form.append('phoneNumber', String(phoneNumber).trim());
                if (avatarFile instanceof File) form.append('avatar', avatarFile);
                if (newPassword) form.append('password', newPassword);

                const updated = await updateUserProfile(studentId, form);
                const nextUser = updated?.user || {};

                setProfileData((prev) => ({
                    ...(prev || {}),
                    ...nextUser,
                    fullName: nextUser.fullName || fullName,
                    phoneNumber: nextUser.phoneNumber || phoneNumber,
                }));

                try {
                    const storedRaw = localStorage.getItem('user');
                    const stored = storedRaw ? JSON.parse(storedRaw) : {};
                    localStorage.setItem(
                        'user',
                        JSON.stringify({
                            ...stored,
                            ...nextUser,
                            fullName: nextUser.fullName || fullName,
                            phoneNumber: nextUser.phoneNumber || phoneNumber,
                        })
                    );
                } catch {
                    // no-op: profile was saved on backend even if local cache sync fails
                }

                toast.success('Профиль ийгиликтүү жаңыртылды');
                return true;
            } catch (error) {
                console.error('Failed to update profile', error);
                const rawMessage = error?.response?.data?.message || 'Профилди сактоо мүмкүн болбоду';
                const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
                toast.error(message);
                return false;
            } finally {
                setSavingProfile(false);
            }
        },
        [studentId]
    );

    const handleSubmitHomework = useCallback(async (task, submission) => {
        const { sessionId, homeworkId } = resolveSessionHomeworkIds(task);
        if (!sessionId || !homeworkId) {
            toast.error('Бул тапшырма үчүн submit жеткиликтүү эмес.');
            return false;
        }

        const key = getTaskKey(task);
        const text = submission?.text?.trim() || '';
        const link = submission?.link?.trim() || '';
        if (!text && !link) {
            toast.error('Жооп же шилтеме киргизиңиз.');
            return false;
        }

        setSubmittingTaskId(key);
        try {
            await submitSessionHomework(sessionId, homeworkId, {
                text: text || undefined,
                link: link || undefined,
            });

            setTasks((prev) =>
                prev.map((item) => {
                    if (getTaskKey(item) !== key) return item;
                    return {
                        ...item,
                        status: 'submitted',
                        submissionStatus: 'submitted',
                        submittedAt: new Date().toISOString(),
                    };
                })
            );
            toast.success('Тапшырма ийгиликтүү жөнөтүлдү.');
            return true;
        } catch (error) {
            console.error('Failed to submit session homework', error);
            const rawMessage = error?.response?.data?.message || 'Тапшырманы жөнөтүү катасы';
            const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
            toast.error(message);
            return false;
        } finally {
            setSubmittingTaskId('');
        }
    }, []);

    const mergedNotificationSettings = useMemo(
        () => ({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(notificationSettings || {}),
        }),
        [notificationSettings]
    );

    const profileStudent = useMemo(
        () => ({
            name: profileData?.fullName || user?.fullName || overviewStudent.name,
            email: profileData?.email || user?.email || '',
            phone: profileData?.phoneNumber || user?.phoneNumber || '',
            avatar: profileData?.avatar || user?.avatar || '',
        }),
        [overviewStudent.name, profileData, user]
    );

    const resolvedTab = activeTab;
    const isTabDataLoaded = loadedTabs[resolvedTab] || false;
    const isProfileReady =
        activeTab !== 'profile' ||
        ((notificationsLoaded && !notificationLoading) && (profileLoaded && !profileLoading));
    const isCurrentTabLoading =
        tabLoading === resolvedTab ||
        (activeTab === 'profile' && (notificationLoading || profileLoading));
    const renderTab = () => {
        if (!isTabDataLoaded || !isProfileReady || isCurrentTabLoading) {
            return <Loader fullScreen={false} />;
        }

        const requiresActiveAccess = ['overview', 'my-courses', 'schedule', 'tasks', 'progress', 'analytics', 'leaderboard'].includes(activeTab);
        if (requiresActiveAccess && !hasActiveStudentAccess) {
            return <AccessInactiveState />;
        }

        switch (activeTab) {
            case 'my-courses':
                return <CoursesTab courses={courses} offeringsByCourse={offeringsByCourse} />;
            case 'schedule':
                return <ScheduleTab offerings={offerings} recordings={recordings} />;
            case 'tasks':
                return (
                    <TasksTab
                        tasks={tasks}
                        onSubmitHomework={handleSubmitHomework}
                        submittingTaskId={submittingTaskId}
                    />
                );
            case 'progress':
                return (
                    <ProgressTab
                        items={progressItems}
                        attendanceStats={attendanceStats}
                        attendanceEnabled={hasAttendanceEligibleCourses}
                        engagement={engagement}
                        leaderboardItems={leaderboardItems}
                        leaderboardMeta={leaderboardPreviewMeta}
                        milestoneItems={milestoneItems}
                        badgeItems={badgeItems}
                    />
                );
            case 'analytics':
                return <StudentAnalyticsPage embedded />;
            case 'leaderboard':
                return <LeaderboardHub embedded />;
            case 'notifications':
                return <NotificationsTab />;
            case 'profile':
                return (
                    <ProfileTab
                        student={profileStudent}
                        notificationSettings={mergedNotificationSettings}
                        onSaveProfile={handleSaveProfile}
                        savingProfile={savingProfile}
                        onNotificationChange={handleNotificationChange}
                        onSaveNotifications={handleSaveNotifications}
                        savingNotifications={savingNotifications}
                    />
                );
            case 'overview':
            default:
                return (
                    <OverviewTab
                        student={overviewStudent}
                        stats={overviewStats}
                        offerings={offerings}
                        tasks={tasks}
                        announcements={announcementItems}
                        attendanceStats={attendanceStats}
                        attendanceEnabled={hasAttendanceEligibleCourses}
                        engagement={engagement}
                        leaderboardItems={leaderboardItems}
                        milestoneItems={milestoneItems}
                        badgeItems={badgeItems}
                    />
                );
        }
    };
    const navigate = useNavigate();
    const handleDashboardNavSelect = useCallback(
        (id) => {
            if (id === 'chat') {
                navigate('/chat');
                return;
            }
            setActiveTab(id);
        },
        [navigate]
    );

    return (
        <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200 min-w-0 break-words">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 px-4 pb-12">
                <div
                    className={`
    ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
    hidden w-full lg:block lg:flex-shrink-0
    transition-all duration-300
  `}
                >
                    <div className="sticky top-24" style={{ height: 'calc(100vh - 6rem)' }}>
                        <DashboardSidebar
                            items={NAV_ITEMS}
                            activeId={activeTab}
                            onSelect={handleDashboardNavSelect}
                            isOpen={sidebarOpen}
                            onToggle={setSidebarOpen}
                            className="h-full overflow-y-auto scrollbar-hide"
                        />
                    </div>
                </div>

                <main className="flex-1 space-y-6 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-sm uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                Студент
                            </p>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E8ECF3]">
                                {overviewStudent.name}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Чыгармачыл окуу жолуңузду көзөмөлдөңүз
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="inline-flex lg:hidden px-4 py-2 rounded-full border text-sm text-gray-600 dark:text-[#E8ECF3] dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-edubot-orange hover:text-edubot-orange transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-edubot-orange/20 group"
                            type="button"
                        >
                            <span className="transition-transform duration-300 group-hover:scale-110">
                                {sidebarOpen ? 'Бөлүмдөрдү жашыруу' : 'Бөлүмдөрдү көрсөтүү'}
                            </span>
                        </button>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <select
                                value={filterCourseId}
                                onChange={(e) => setFilterCourseId(e.target.value)}
                                className="px-3 py-2 rounded-full border text-sm bg-white dark:bg-[#222222]"
                            >
                                <option value="">All courses</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                            {(() => {
                                const selected = courses.find(
                                    (course) => String(course.id) === String(filterCourseId)
                                );
                                return filterCourseId && isOfflineOrLiveCourse(selected);
                            })() ? (
                                <select
                                    value={filterGroupId}
                                    onChange={(e) => setFilterGroupId(e.target.value)}
                                    className="px-3 py-2 rounded-full border text-sm bg-white dark:bg-[#222222]"
                                >
                                    <option value="">All groups</option>
                                    {groupOptions.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            ) : null}
                            <button
                                onClick={() => setSidebarOpen((prev) => !prev)}
                                className="hidden md:inline-flex px-4 py-2 rounded-full border text-sm text-gray-600 dark:text-[#E8ECF3] dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-edubot-orange hover:text-edubot-orange transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-edubot-orange/20 group"
                                type="button"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110">
                                    {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="lg:hidden space-y-3">
                        {sidebarOpen ? (
                            <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[#222222]">
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleDashboardNavSelect(item.id)}
                                                className={[
                                                    'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md group',
                                                    isActive
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1A1A1A] dark:text-gray-200 dark:hover:bg-gray-800',
                                                ].join(' ')}
                                            >
                                                {Icon ? <Icon className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" /> : null}
                                                <span className="transition-transform duration-300 group-hover:scale-105">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                    {renderTab()}
                </main>
            </div>
        </div>
    );
};

const AccessInactiveState = () => (
    <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
            !
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                Окуу мүмкүнчүлүгү азырынча активдүү эмес
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Сизде азырынча активдүү курс жок. Төлөм ырасталгандан же каттоо иштетилгенден кийин
                бул жерде курстарыңыз, сабактарыңыз жана прогрессиңиз көрүнөт.
            </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
                to="/catalog"
                className="inline-flex px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
            >
                Видео курстарды көрүү
            </Link>
            <Link
                to="/student?tab=profile"
                className="inline-flex px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-gray-300 dark:border-gray-700"
            >
                Профилди ачуу
            </Link>
        </div>
    </div>
);

const OverviewTab = ({
    student,
    stats,
    offerings,
    tasks,
    announcements,
    attendanceStats,
    attendanceEnabled,
    engagement,
    leaderboardItems,
    leaderboardMeta,
    milestoneItems,
    badgeItems,
}) => {
    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const upcoming = useMemo(
        () =>
            offerings
                .filter((item) => item.startAt && new Date(item.startAt).getTime() >= nowMs)
                .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                .slice(0, 4),
        [offerings, nowMs]
    );
    const pendingHomework = useMemo(
        () => tasks.filter((task) => task.status !== 'completed').slice(0, 4),
        [tasks]
    );
    const leaderboardSnapshot = useMemo(
        () =>
            buildLeaderboardSnapshot({
                items: leaderboardItems,
                user: { id: student.id, fullName: student.name },
                xp: engagement.xp,
                streakDays: engagement.streak,
                badges: badgeItems,
                label: 'Dashboard',
            }),
        [leaderboardItems, student, engagement, badgeItems]
    );
    const hasLeaderboardPreviewIssue = Boolean(leaderboardMeta?.fallback);
    const emptyLeaderboardPreview = !hasLeaderboardPreviewIssue && !leaderboardItems.length;

    const leaderboardChallenges = useMemo(
        () => [
            {
                id: 'overview-rank',
                title: leaderboardSnapshot.rank
                    ? `#${leaderboardSnapshot.rank} орунду бекемдөө`
                    : 'Алгачкы рейтингге чыгуу',
                detail: leaderboardSnapshot.targetGap
                    ? `Дагы ${leaderboardSnapshot.targetGap} XP кийинки тепкичке жеткирет.`
                    : '1 сабак жана 1 тест сизди таблицага алып кирет.',
            },
            {
                id: 'overview-streak',
                title: `${engagement.streak} күндүк серияны сактоо`,
                detail: 'Эртең дагы кирсеңиз, туруктуулук сигналы күчөйт.',
            },
            {
                id: 'overview-homework',
                title: 'Ачык тапшырманы жабуу',
                detail: pendingHomework.length
                    ? `${pendingHomework.length} тапшырма күтүп турат.`
                    : 'Азырынча тапшырма жок, ушул темпти сактаңыз.',
            },
        ],
        [leaderboardSnapshot, engagement.streak, pendingHomework.length]
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
                <div className="bg-gradient-to-r from-edubot-orange to-edubot-soft text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-edubot-orange/20">
                    <p className="text-sm uppercase tracking-wide opacity-80">
                        Streak: {engagement.streak} күн
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                        Кош келиңиз, {student.name.split(' ')[0]}!
                    </h2>
                    {student.lastLesson && (
                        <p className="mt-3 text-sm sm:text-base opacity-90">
                            Акыркы сабак: <strong>{student.lastLesson.lesson}</strong> (
                            {student.lastLesson.course})
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Активдүү курстар" value={stats.activeCourses} />
                    <StatCard label="Жалпы сабактар" value={stats.lessonsCompleted} />
                    <StatCard label="Күтүүдө тапшырма" value={pendingHomework.length} />
                    {attendanceEnabled ? (
                        <StatCard label="Катышуу" value={`${attendanceStats.rate}%`} />
                    ) : null}
                </div>

                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Жакынкы сабактар
                        </h3>
                        <span className="text-xs text-gray-500">{upcoming.length} даана</span>
                    </div>
                    <div className="space-y-2">
                        {upcoming.map((item) => {
                            const type = resolveCourseType(item);
                            const joinUrl = item.joinLink || item.link || item.joinUrl || '';
                            const joinAllowed =
                                !isOnlineLiveOffering(item) || isStudentJoinWindowOpen(item, nowMs);
                            const countdown = item.startAt
                                ? formatCountdown(new Date(item.startAt).getTime(), nowMs)
                                : null;
                            return (
                                <div
                                    key={item.id || `${item.courseId}-${item.startAt}`}
                                    className="rounded-2xl border border-gray-100 dark:border-gray-700 p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                            {item.courseTitle || item.course?.title || 'Сабак'}
                                        </p>
                                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                            {courseTypeLabel(type)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatSessionDate(item.startAt)}
                                    </p>
                                    {type === 'offline' && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {item.location || item.room || 'Класс али дайындала элек'} •{' '}
                                            {resolveInstructorName(item)}
                                        </p>
                                    )}
                                    {type === 'online_live' && (
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-blue-700 dark:text-blue-300">
                                                Калган убакыт: {countdown}
                                            </span>
                                            {joinUrl && joinAllowed ? (
                                                <a
                                                    href={joinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 rounded-full text-xs bg-blue-600 text-white"
                                                >
                                                    Кошулуу
                                                </a>
                                            ) : (
                                                <span className="text-xs text-amber-600">
                                                    Кошулуу 10 мүнөт калганда ачылат
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {upcoming.length === 0 && (
                            <p className="text-sm text-gray-500">Жакынкы класстар жок.</p>
                        )}
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Тапшырмалар
                        </h3>
                        {pendingHomework.map((task) => (
                            <div
                                key={task.id || task.taskId}
                                className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                            >
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {task.title}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {task.due || task.dueAt || 'Тапшыруу мөөнөтү көрсөтүлгөн эмес'}
                                </p>
                            </div>
                        ))}
                        {pendingHomework.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Тапшырмалар жок.</p>
                        )}
                    </div>
                    <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Жарыялар
                        </h3>
                        {announcements.map((item) => (
                            <div
                                key={item.id || item.title}
                                className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                            >
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {item.body || item.message || 'Жаңы жаңылык'}
                                </p>
                            </div>
                        ))}
                        {announcements.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Жаңылыктар жок.</p>
                        )}
                    </div>
                </section>
                <NotificationsWidget />
            </div>

            <div className="space-y-4">
                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">XP & Level</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{engagement.xp} XP</p>
                            <p className="text-sm text-gray-500">
                                Деңгээл {engagement.level}
                                {leaderboardSnapshot.rank ? ` · #${leaderboardSnapshot.rank} орун` : ''}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-blue-50 px-3 py-2 text-right dark:bg-blue-900/30">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Next push</p>
                            <p className="mt-1 text-sm font-semibold text-blue-700 dark:text-blue-200">
                                {leaderboardSnapshot.targetGap ? `${leaderboardSnapshot.targetGap} XP` : 'Баштаңыз'}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 mt-4">
                        <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                                width: `${Math.round(
                                    (engagement.currentLevelXp /
                                        Math.max(1, engagement.nextLevelGap)) *
                                    100
                                )}%`,
                            }}
                        />
                    </div>
                </section>

                <div className="space-y-3">
                    {hasLeaderboardPreviewIssue ? (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                            <p className="font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Рейтинг эскертүүсү</p>
                            <p className="mt-1">Азыр кыска preview үчүн чыныгы рейтинг алынган жок. Жасалма студенттер көрсөтүлгөн жок.</p>
                            {leaderboardMeta?.message ? <p className="mt-2 text-xs opacity-80">{leaderboardMeta.message}</p> : null}
                        </div>
                    ) : null}
                    {emptyLeaderboardPreview ? (
                        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-[#222222] dark:text-slate-300">
                            Бул кыска preview үчүн азырынча рейтинг маалыматтары толо элек.
                        </div>
                    ) : null}
                    <LeaderboardListCard
                        title="Сизге жакын рейтинг"
                        description="Жөн гана лидерлер эмес, сизге реалдуу жакын орундар да көрүнүшү керек."
                        items={leaderboardSnapshot.nearYou}
                        currentUserId={student.id}
                        embedded
                    />
                </div>

                <ChallengeRail items={leaderboardChallenges} embedded />

                <AchievementCloud
                    items={badgeItems}
                    title="Жетишкендиктерди бөлүшүү"
                    subtitle="Сиз ачкан жетишкендиктерди story, post же шилтеме катары бөлүшсөңүз болот."
                    embedded
                    shareMeta={{
                        displayName: student.name,
                        rank: leaderboardSnapshot.rank || null,
                        xp: engagement.xp || null,
                        streakDays: engagement.streak || null,
                        trackLabel: 'Dashboard',
                    }}
                />
            </div>
        </div>
    );
};

const CoursesTab = ({ courses, offeringsByCourse }) => {
    if (!courses.length) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500 dark:text-slate-400 shadow-lg">
                Сизде активдүү курстар жок.
            </div>
        );
    }

    const fallbackCover =
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Менин курстарым
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => {
                    const courseId = String(course.id ?? course.courseId ?? '');
                    const cover =
                        course.coverImageUrl || course.coverImage || course.cover || fallbackCover;
                    const instructor = resolveInstructorName(course);
                    const progressValue = Math.max(
                        0,
                        Math.min(
                            100,
                            Math.round(Number(course.progressPercent ?? course.progress ?? 0))
                        )
                    );
                    const linkedOfferings = offeringsByCourse.get(courseId) || [];
                    const nextSession = linkedOfferings
                        .filter((item) => item.startAt)
                        .sort(
                            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
                        )[0];
                    const courseType = resolveCourseType(course);
                    const recordingsCount = linkedOfferings.reduce(
                        (acc, row) => acc + resolveRecordings(row).length,
                        0
                    );

                    return (
                        <div
                            key={courseId || course.title}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <img
                                src={cover}
                                alt={course.title}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm text-gray-500">{instructor}</p>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                            {course.title}
                                        </h3>
                                    </div>
                                    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {courseTypeLabel(courseType)}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Прогресс</span>
                                        <span>{progressValue}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-blue-500"
                                            style={{ width: `${progressValue}%` }}
                                        />
                                    </div>
                                </div>
                                {courseType === 'offline' && (
                                    <div className="text-sm text-gray-500">
                                        <p>
                                            Жайгашкан жери:{' '}
                                            {nextSession?.location ||
                                                nextSession?.room ||
                                                'Класс али дайындала элек'}
                                        </p>
                                        <p>Жүгүртмө: {formatSessionDate(nextSession?.startAt)}</p>
                                        <p>
                                            Мугалим: {resolveInstructorName(nextSession || course)}
                                        </p>
                                    </div>
                                )}
                                {courseType === 'online_live' && (
                                    <div className="text-sm text-gray-500">
                                        <p>Кийинки сабак: {formatSessionDate(nextSession?.startAt)}</p>
                                        <p>Жазуулар: {recordingsCount}</p>
                                    </div>
                                )}
                                <Link
                                    to={courseId ? `/courses/${courseId}` : '#'}
                                    className="inline-flex px-4 py-2 rounded-full border text-sm text-blue-600 dark:text-blue-400 dark:border-gray-700"
                                >
                                    Курсту ачуу
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ScheduleTab = ({ offerings, recordings }) => {
    const [nowMs, setNowMs] = useState(Date.now());
    const [selectedLiveId, setSelectedLiveId] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const sorted = useMemo(
        () =>
            [...offerings].sort(
                (a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime()
            ),
        [offerings]
    );

    useEffect(() => {
        if (selectedLiveId) return;
        const firstLive = sorted.find((item) => resolveCourseType(item) === 'online_live');
        if (firstLive?.id) setSelectedLiveId(String(firstLive.id));
    }, [sorted, selectedLiveId]);

    if (!sorted.length) {
        return (
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                Жакынкы класстар табылган жок.
            </div>
        );
    }

    const selectedLive = sorted.find((item) => String(item.id) === String(selectedLiveId));
    const selectedRecordings = [
        ...resolveRecordings(selectedLive || {}),
        ...recordings.filter((rec) => {
            const recSessionId = rec.sessionId || rec.courseSessionId || rec.offeringId;
            const liveSessionId = selectedLive?.sessionId || selectedLive?.id || selectedLive?.offeringId;
            return recSessionId && liveSessionId && String(recSessionId) === String(liveSessionId);
        }),
    ];
    const selectedJoinUrl =
        selectedLive?.joinLink || selectedLive?.link || selectedLive?.joinUrl || '';
    const selectedJoinAllowed = !selectedLive || isStudentJoinWindowOpen(selectedLive, nowMs);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Жүгүртмө</h2>
            <div className="space-y-3">
                {sorted.map((item) => {
                    const type = resolveCourseType(item);
                    const joinUrl = item.joinLink || item.link || item.joinUrl || '';
                    const joinAllowed =
                        !isOnlineLiveOffering(item) || isStudentJoinWindowOpen(item, nowMs);
                    const recordings = resolveRecordings(item);
                    return (
                        <div
                            key={item.id || `${item.courseId}-${item.startAt}`}
                            className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                        {item.courseTitle || item.course?.title || 'Class'}

                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSessionDate(item.startAt)}
                                    </p>
                                </div>
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {courseTypeLabel(type)}
                                </span>
                            </div>
                            {type === 'offline' && (
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Жайгашкан жери: {item.location || item.room || 'Класс али дайындала элек'}</p>
                                    <p>Мугалим: {resolveInstructorName(item)}</p>
                                    <p>Жүгүртмө: {formatSessionDate(item.startAt)}</p>
                                </div>
                            )}
                            {type === 'online_live' && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-blue-700 dark:text-blue-300">
                                        Калган убакыт:{' '}
                                        {item.startAt
                                            ? formatCountdown(
                                                new Date(item.startAt).getTime(),
                                                nowMs
                                            )
                                            : '--:--:--'}
                                    </span>
                                    {joinUrl && joinAllowed ? (
                                        <a
                                            href={joinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs"
                                        >
                                            Сабакка кошулуу
                                        </a>
                                    ) : (
                                        <span className="text-xs text-amber-600">
                                            Join 10 мүнөт мурун ачылат
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLiveId(String(item.id))}
                                        className="px-3 py-1 rounded-full border text-xs text-gray-600 dark:text-gray-300 dark:border-gray-700 hover:border-edubot-orange hover:text-edubot-orange hover:bg-edubot-orange/10 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                                    >
                                        <span className="transition-transform duration-300 group-hover:scale-110">
                                            🔴 Түз эфир барагы
                                        </span>
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        Жазуулар: {recordings.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedLive && resolveCourseType(selectedLive) === 'online_live' && (
                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Түз эфир сабак барагы
                    </h3>
                    <p className="text-sm text-gray-500">
                        {selectedLive.courseTitle || selectedLive.course?.title}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Калган убакыт:{' '}
                        {selectedLive.startAt
                            ? formatCountdown(new Date(selectedLive.startAt).getTime(), nowMs)
                            : '--:--:--'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedJoinUrl && selectedJoinAllowed ? (
                            <a
                                href={selectedJoinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                            >
                                Сабакка кошулуу
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="px-4 py-2 rounded-full border text-sm text-gray-400 cursor-not-allowed"
                            >
                                Сабакка кошулуу
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">Жазуулар</p>
                        {selectedRecordings.length ? (
                            selectedRecordings.map((rec) => (
                                <a
                                    key={rec.id || rec.url}
                                    href={rec.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-blue-600 dark:text-blue-400 underline"
                                >
                                    {rec.title || 'Жазуу'}
                                </a>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Азырынча жазуу жок.</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

const TasksTab = ({ tasks, onSubmitHomework, submittingTaskId }) => {
    const [drafts, setDrafts] = useState({});

    const updateDraft = (taskKey, field, value) => {
        setDrafts((prev) => ({
            ...prev,
            [taskKey]: {
                ...(prev[taskKey] || {}),
                [field]: value,
            },
        }));
    };

    const submitTask = async (task) => {
        if (!onSubmitHomework) return;
        const key = getTaskKey(task);
        const draft = drafts[key] || { text: '', link: '' };
        const success = await onSubmitHomework(task, draft);
        if (success) {
            setDrafts((prev) => ({
                ...prev,
                [key]: { text: '', link: '' },
            }));
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Тапшырмалар</h2>
            {tasks.length ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto min-w-[600px] w-full text-sm shadow-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="text-left px-4 py-3">Тапшырма</th>
                                <th className="text-left px-4 py-3">Курс</th>
                                <th className="text-left px-4 py-3">Бүтүү мөөнөтү</th>
                                <th className="text-left px-4 py-3">Статус</th>
                                <th className="text-left px-4 py-3">Жооп</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => {
                                const key = getTaskKey(task);
                                const draft = drafts[key] || { text: '', link: '' };
                                const { sessionId, homeworkId } = resolveSessionHomeworkIds(task);
                                const canSubmit = Boolean(sessionId && homeworkId);
                                const isSubmitting = submittingTaskId === key;
                                const isDone =
                                    task.status === 'completed' || task.submissionStatus === 'approved';

                                return (
                                    <tr
                                        key={key}
                                        className="border-t border-gray-100 dark:border-gray-800 align-top"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-[#E8ECF3]">
                                            {task.title || task.name || 'Тапшырма'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {task.courseTitle || task.course || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {task.due ||
                                                task.deadline ||
                                                (task.dueAt
                                                    ? new Date(task.dueAt).toLocaleDateString('ru-RU')
                                                    : '—')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs ${isDone
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                    }`}
                                            >
                                                {isDone ? 'Жабылган' : 'Күтүүдө'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 min-w-[280px]">
                                            {canSubmit ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={draft.text || ''}
                                                        onChange={(e) =>
                                                            updateDraft(key, 'text', e.target.value)
                                                        }
                                                        rows={2}
                                                        placeholder="Жооп жазыңыз"
                                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-[#0E0E0E]"
                                                    />
                                                    <input
                                                        value={draft.link || ''}
                                                        onChange={(e) =>
                                                            updateDraft(key, 'link', e.target.value)
                                                        }
                                                        placeholder="Шилтеме (эгер бар болсо)"
                                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-[#0E0E0E]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => submitTask(task)}
                                                        disabled={isSubmitting}
                                                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-60"
                                                    >
                                                        {isSubmitting ? 'Жөнөтүлүүдө...' : 'Жөнөтүү'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    Бул тапшырма жөнөтүү API'ине туташкан эмес.
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                    Азырынча тапшырмалар табылган жок.
                </div>
            )}
        </div>
    );
};

const ProgressTab = ({
    items,
    attendanceStats,
    attendanceEnabled,
    engagement,
    leaderboardItems,
    milestoneItems,
    badgeItems,
}) => {
    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return null;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60)
            .toString()
            .padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (!items.length) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                    Прогресс жана сертификаттар
                </h2>
                <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                    Азырынча катталган курстар жок.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                Прогресс жана сертификаттар
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard label="XP" value={engagement.xp} />
                <StatCard label="Окуу сериясы" value={`${engagement.streak} күн`} />
                {attendanceEnabled ? (
                    <StatCard label="Катышуу" value={`${attendanceStats.rate}%`} />
                ) : null}
                <StatCard
                    label="Рейтинг"
                    value={leaderboardItems.length ? `Top ${leaderboardItems.length}` : 'Tracked'}
                />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <div className="xl:col-span-2 bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Курстагы этаптар
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                        {milestoneItems.map((item) => (
                            <div key={item.id || item.title}>
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">{item.value || item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Жетишкендик белгилери
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {badgeItems.map((badge) => (
                            <span
                                key={badge.id || badge.title}
                                className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            >
                                {badge.title || badge.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.courseId || item.courseTitle}
                        className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-4"
                    >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                    {item.courseTitle}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Сабактар: {item.lessonsCompleted}/{item.lessonsTotal || '—'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {item.progressPercent}%
                                </span>
                                {item.resumeLesson ? (
                                    <Link
                                        to={
                                            item.courseId
                                                ? `/courses/${item.courseId}?resumeLessonId=${item.resumeLesson.lessonId || ''
                                                }${item.resumeLesson.lastVideoTime
                                                    ? `&resumeTime=${Math.floor(
                                                        item.resumeLesson.lastVideoTime
                                                    )}`
                                                    : ''
                                                }`
                                                : '#'
                                        }
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30"
                                    >
                                        <FiPlay className="shrink-0" />
                                        Улантуу: {item.resumeLesson.lessonTitle}
                                        {item.resumeLesson.lastVideoTime
                                            ? ` (${formatTime(item.resumeLesson.lastVideoTime)})`
                                            : ''}
                                    </Link>
                                ) : null}
                                {item.hasCertificate ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        Сертификат даяр
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                            <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{
                                    width: `${Math.min(100, Math.max(0, item.progressPercent))}%`,
                                }}
                            />
                        </div>

                        {item.sections.length ? (
                            <div className="space-y-3">
                                {item.sections.map((section) => (
                                    <div
                                        key={section.sectionId || section.sectionTitle}
                                        className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                                {section.sectionTitle}
                                            </p>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {section.lessons.filter((l) => l.completed).length}/
                                                {section.lessons.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {section.lessons.map((lesson) => {
                                                const isQuiz = lesson.kind === 'quiz';
                                                const quizBadge = isQuiz
                                                    ? lesson.quizPassed === true
                                                        ? {
                                                            label: 'Квиз өттү',
                                                            className:
                                                                'bg-green-100 text-green-700',
                                                        }
                                                        : lesson.quizPassed === false
                                                            ? {
                                                                label: 'Квиз өтпөдү',
                                                                className:
                                                                    'bg-red-100 text-red-700',
                                                            }
                                                            : null
                                                    : null;
                                                return (
                                                    <div
                                                        key={lesson.lessonId || lesson.lessonTitle}
                                                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-800/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${lesson.completed
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400'
                                                                    }`}
                                                            >
                                                                {lesson.completed ? '✓' : ''}
                                                            </span>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm text-gray-800 dark:text-[#E8ECF3]">
                                                                        {lesson.lessonTitle}
                                                                    </p>
                                                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase">
                                                                        {lesson.kind === 'quiz'
                                                                            ? 'Квиз'
                                                                            : lesson.kind ===
                                                                                'article'
                                                                                ? 'Макала'
                                                                                : lesson.kind ===
                                                                                    'code'
                                                                                    ? 'Код'
                                                                                    : 'Видео'}
                                                                    </span>
                                                                    {quizBadge ? (
                                                                        <span
                                                                            className={`text-[11px] px-2 py-0.5 rounded-full ${quizBadge.className}`}
                                                                        >
                                                                            {quizBadge.label}
                                                                            {typeof lesson.quizScore ===
                                                                                'number'
                                                                                ? ` (${lesson.quizScore}%)`
                                                                                : ''}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                                {!lesson.completed &&
                                                                    lesson.lastVideoTime ? (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Акыркы убакыт:{' '}
                                                                        {formatTime(
                                                                            lesson.lastVideoTime
                                                                        )}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Бул курс боюнча сабактар табылган жок.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
const ProfileTab = ({
    student,
    notificationSettings,
    onSaveProfile,
    savingProfile,
    onNotificationChange,
    onSaveNotifications,
    savingNotifications,
}) => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [formData, setFormData] = useState({
        fullName: student?.name || '',
        email: student?.email || '',
        phoneNumber: student?.phone || '',
        avatar: null,
    });
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [preview, setPreview] = useState(student?.avatar || null);

    useEffect(() => {
        setFormData({
            fullName: student?.name || '',
            email: student?.email || '',
            phoneNumber: student?.phone || '',
            avatar: null,
        });
        setPreview(student?.avatar || null);
        setPasswordData({ newPassword: '', confirmPassword: '' });
    }, [student]);

    useEffect(() => {
        if (!formData.avatar) return undefined;
        const objectUrl = URL.createObjectURL(formData.avatar);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [formData.avatar]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setFormData((prev) => ({ ...prev, avatar: file }));
    };

    const handleSaveProfileClick = async () => {
        if (!onSaveProfile) return;
        const success = await onSaveProfile({
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            avatarFile: formData.avatar,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword,
        });
        if (success) {
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setFormData((prev) => ({ ...prev, avatar: null }));
            setIsEditingProfile(false);
        }
    };

    const handleResetProfile = () => {
        setFormData({
            fullName: student?.name || '',
            email: student?.email || '',
            phoneNumber: student?.phone || '',
            avatar: null,
        });
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setPreview(student?.avatar || null);
    };

    const hasProfileChanges =
        formData.fullName.trim() !== (student?.name || '').trim() ||
        formData.phoneNumber.trim() !== (student?.phone || '').trim() ||
        Boolean(formData.avatar) ||
        Boolean(passwordData.newPassword) ||
        Boolean(passwordData.confirmPassword);

    const notificationEntries = Object.entries(notificationSettings || {});
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">Профиль</h2>
                {!isEditingProfile ? (
                    <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-semibold hover:border-edubot-orange hover:text-edubot-orange hover:bg-edubot-orange/10 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                    >
                        <span className="transition-transform duration-300 group-hover:scale-110">
                            ✏️ Өзгөртүү
                        </span>
                    </button>
                ) : null}
            </div>
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl font-semibold text-gray-500">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            (formData.fullName || student?.name || 'U').charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isEditingProfile ? 'Профиль сүрөтү' : 'Каттоо сүрөтү'}
                        </p>
                        {isEditingProfile ? (
                            <>
                                <label className="inline-flex px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm cursor-pointer">
                                    Аватар жүктөө
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {formData.avatar && (
                                    <p className="text-xs text-gray-500">
                                        Тандалды: {formData.avatar.name}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Өзгөртүү режимин ачуу үчүн жогортогу баскычты басыңыз.
                            </p>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Аты-жөнү</p>
                    {isEditingProfile ? (
                        <input
                            type="text"
                            className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                            }
                        />
                    ) : (
                        <div className="mt-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-gray-900 dark:text-[#E8ECF3]">
                            {formData.fullName || '—'}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                        <div className="mt-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-gray-900 dark:text-[#E8ECF3]">
                            {formData.email || 'student@example.com'}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Телефон</p>
                        {isEditingProfile ? (
                            <div className="mt-1">
                                <PhoneInput
                                    value={formData.phoneNumber}
                                    onChange={(value) =>
                                        setFormData((prev) => ({ ...prev, phoneNumber: value }))
                                    }
                                />
                            </div>
                        ) : (
                            <div className="mt-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-gray-900 dark:text-[#E8ECF3]">
                                {formData.phoneNumber || '—'}
                            </div>
                        )}
                    </div>
                </div>
                {isEditingProfile && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Жаңы сырсөз
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData((prev) => ({
                                            ...prev,
                                            newPassword: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Кеминде 6 белги"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Сырсөздү кайталоо
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Сырсөздү дагы бир жолу киргизиңиз"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={handleSaveProfileClick}
                                disabled={!hasProfileChanges || savingProfile}
                                className="px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group disabled:hover:scale-100"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    {savingProfile ? 'Сакталууда...' : '💾 Профилди сактоо'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleResetProfile();
                                    setIsEditingProfile(false);
                                }}
                                disabled={savingProfile}
                                className="px-5 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-semibold disabled:opacity-60 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 transform hover:scale-105 hover:shadow-md group disabled:hover:scale-100"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110">
                                    ❌ Жокко чыгаруу
                                </span>
                            </button>
                        </div>
                    </>
                )}
            </div>
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Эскертмелер
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Кайсы каналдар аркылуу эскертмелерди алгыңыз келерин тандаңыз.
                    </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {notificationEntries.length ? (
                        notificationEntries.map(([key, value]) => {
                            const meta = NOTIFICATION_LABELS[key] || {};
                            const label = meta.label || formatNotificationLabel(key);
                            const description = meta.description || '';
                            const inputId = `notification-${key}`;
                            return (
                                <div
                                    key={key}
                                    className="flex items-start justify-between py-3 gap-4"
                                >
                                    <div>
                                        <label
                                            htmlFor={inputId}
                                            className="font-medium text-gray-900 dark:text-[#E8ECF3]"
                                        >
                                            {label}
                                        </label>
                                        {description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            id={inputId}
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={Boolean(value)}
                                            onChange={(e) =>
                                                onNotificationChange?.(key, e.target.checked)
                                            }
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                                        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                                            {value ? 'Күйгүзүлгөн' : 'Өчүрүлгөн'}
                                        </span>
                                    </label>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                            Эскертме параметрлери табылган жок.
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onSaveNotifications}
                    disabled={savingNotifications}
                    className="px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                    {savingNotifications ? 'Сакталууда...' : 'Эскертмелерди сактоо'}
                </button>
            </div>
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="group relative">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500"></div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-edubot-orange/5 via-transparent to-edubot-soft/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Content */}
        <div className="relative p-6 z-10">
            {/* Animated corner accent */}
            <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>

            {/* Icon placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-xl mb-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-edubot-orange rounded-full animate-pulse"></div>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{value}</p>

            {/* Subtle progress indicator */}
            <div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-edubot-orange to-edubot-soft rounded-full w-3/4 animate-pulse"></div>
            </div>
        </div>
    </div>
);

OverviewTab.propTypes = {
    student: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
        streak: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        lastLesson: PropTypes.shape({
            lesson: PropTypes.string,
            course: PropTypes.string,
        }),
    }).isRequired,
    stats: PropTypes.shape({
        activeCourses: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        lessonsCompleted: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        timeThisWeek: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        pendingTasks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
    offerings: PropTypes.arrayOf(PropTypes.object).isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    announcements: PropTypes.arrayOf(PropTypes.object).isRequired,
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
        totalSessions: PropTypes.number,
        present: PropTypes.number,
        absent: PropTypes.number,
    }).isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    engagement: PropTypes.shape({
        xp: PropTypes.number,
        streak: PropTypes.number,
        level: PropTypes.number,
        currentLevelXp: PropTypes.number,
        nextLevelGap: PropTypes.number,
    }).isRequired,
    leaderboardItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    milestoneItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    badgeItems: PropTypes.arrayOf(PropTypes.object).isRequired,
};

CoursesTab.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    offeringsByCourse: PropTypes.instanceOf(Map).isRequired,
};

ScheduleTab.propTypes = {
    offerings: PropTypes.arrayOf(PropTypes.object).isRequired,
    recordings: PropTypes.arrayOf(PropTypes.object),
};

ScheduleTab.defaultProps = {
    recordings: [],
};

TasksTab.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSubmitHomework: PropTypes.func,
    submittingTaskId: PropTypes.string,
};

TasksTab.defaultProps = {
    onSubmitHomework: undefined,
    submittingTaskId: '',
};

ProgressTab.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
    }).isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    engagement: PropTypes.shape({
        xp: PropTypes.number,
        streak: PropTypes.number,
    }).isRequired,
    leaderboardItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    milestoneItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    badgeItems: PropTypes.arrayOf(PropTypes.object).isRequired,
};

ProfileTab.propTypes = {
    student: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        avatar: PropTypes.string,
    }).isRequired,
    notificationSettings: PropTypes.object,
    onSaveProfile: PropTypes.func,
    savingProfile: PropTypes.bool,
    onNotificationChange: PropTypes.func,
    onSaveNotifications: PropTypes.func.isRequired,
    savingNotifications: PropTypes.bool,
};

ProfileTab.defaultProps = {
    notificationSettings: {},
    onSaveProfile: undefined,
    savingProfile: false,
    onNotificationChange: undefined,
    savingNotifications: false,
};

StatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StudentDashboard;

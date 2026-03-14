import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    fetchStudentCourses,
    fetchStudentDashboardSummary,
    fetchStudentOfferings,
    fetchStudentTasks,
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

const NAV_ITEMS = [
    { id: 'overview', label: 'Кыскача', icon: FiHome },
    { id: 'my-courses', label: 'Курстарым', icon: FiBookOpen },
    { id: 'schedule', label: 'Жүгүртмө', icon: FiCalendar },
    { id: 'tasks', label: 'Тапшырмалар', icon: FiCheckCircle },
    { id: 'progress', label: 'Прогресс', icon: FiBarChart2 },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell },
    { id: 'profile', label: 'Профиль', icon: FiUser },
    { id: 'chat', label: 'Чат', icon: FiMessageCircle },
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
        label: 'Class reminders',
        description: 'Сабак башталар алдында эскертүү алыңыз.',
    },
    announcementEmails: {
        label: 'Курс боюнча жаңылыктар',
        description: 'Жаңы модулдар жана маанилүү окуу жаңылыктары email аркылуу жетет.',
    },
    taskUpdates: {
        label: 'Homework reminders',
        description: 'Тапшырмалардын мөөнөтү жакындаганда эскертүү алыңыз.',
    },
    smsAlerts: {
        label: 'SMS эскертүүлөр',
        description: 'Маанилүү окуялар боюнча SMS кабыл алыңыз.',
    },
    pushNotifications: {
        label: 'Missed class alerts',
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

const courseTypeLabel = (type) => {
    if (type === 'offline') return 'Offline';
    if (type === 'online_live') return 'Online Live';
    return 'Video';
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
                title: item.recordingTitle || 'Session Recording',
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
    const [progress, setProgress] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [leaderboardItems, setLeaderboardItems] = useState([]);
    const [notificationSettings, setNotificationSettings] = useState(null);
    const [tabLoading, setTabLoading] = useState(null);
    const [loadedTabs, setLoadedTabs] = useState({
        overview: false,
        'my-courses': false,
        schedule: false,
        tasks: false,
        progress: false,
        notifications: true,
    });
    const [notificationsLoaded, setNotificationsLoaded] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    const analyticsLink = useMemo(() => {
        const to = new Date();
        const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
        const toIso = to.toISOString().slice(0, 10);
        const fromIso = from.toISOString().slice(0, 10);
        return `/student/analytics?from=${fromIso}&to=${toIso}`;
    }, []);

    const loadOverview = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('overview');
        try {
            const [summaryRes, leaderboardRes, offeringsRes, tasksRes] = await Promise.all([
                fetchStudentDashboardSummary(studentId),
                fetchWeeklyLeaderboard({ limit: 5 }),
                fetchStudentOfferings(studentId),
                fetchStudentTasks(studentId),
            ]);

            setSummary(summaryRes || null);
            setLeaderboardItems(
                Array.isArray(leaderboardRes?.items) ? leaderboardRes.items : leaderboardRes || []
            );
            setOfferings(
                Array.isArray(offeringsRes?.items) ? offeringsRes.items : offeringsRes || []
            );
            setTasks(Array.isArray(tasksRes?.items) ? tasksRes.items : tasksRes || []);
        } catch (error) {
            console.error('Failed to load overview', error);
            toast.error('Кыскача маалымат жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, overview: true, schedule: true, tasks: true }));
        }
    }, [studentId]);

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
            const offeringsRes = await fetchStudentOfferings(studentId);
            setOfferings(
                Array.isArray(offeringsRes?.items) ? offeringsRes.items : offeringsRes || []
            );
        } catch (error) {
            console.error('Failed to load schedule', error);
            toast.error('Жүгүртмө жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, schedule: true }));
        }
    }, [studentId]);

    const loadTasks = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('tasks');
        try {
            const tasksRes = await fetchStudentTasks(studentId);
            setTasks(Array.isArray(tasksRes?.items) ? tasksRes.items : tasksRes || []);
        } catch (error) {
            console.error('Failed to load tasks', error);
            toast.error('Тапшырмаларды жүктөө мүмкүн болбоду');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, tasks: true }));
        }
    }, [studentId]);

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

    useEffect(() => {
        if (!studentId) return;
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('tab', activeTab);
            return next;
        });
        const tab = activeTab === 'profile' ? 'overview' : activeTab;
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
        loadNotificationSettings,
        notificationsLoaded,
        notificationLoading,
        setSearchParams,
    ]);

    const overviewStudent = useMemo(
        () => ({
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
                pendingTasks: tasks.length,
            },
        [summary, tasks.length]
    );

    const attendanceStats = useMemo(() => {
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
    }, [summary, offerings]);

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
                title: item.title || item.name || item.label || 'Milestone',
                value: item.value || item.description || item.progressText || '',
            }));
        }
        return [
            {
                id: 'm1',
                title: 'Course Completion',
                value: `${overviewStats.lessonsCompleted || 0} lessons done`,
            },
            {
                id: 'm2',
                title: 'Attendance Target',
                value: `${attendanceStats.rate}% monthly attendance`,
            },
            {
                id: 'm3',
                title: 'Weekly Consistency',
                value: `${engagement.streak} day learning streak`,
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

        const homeworkAnnouncements = tasks
            .filter((task) => task.status !== 'completed')
            .slice(0, 2)
            .map((task, idx) => ({
                id: `a-task-${task.id || idx}`,
                title: task.title || 'Үй тапшырма',
                body: task.courseTitle || task.course || 'Курс жаңыртуусу',
            }));

        const classAnnouncements = offerings.slice(0, 2).map((offering, idx) => ({
            id: `a-offering-${offering.id || idx}`,
            title: offering.courseTitle || offering.course?.title || 'Класс жаңыртуусу',
            body: `${formatSessionDate(offering.startAt)} • ${courseTypeLabel(
                resolveCourseType(offering)
            )}`,
        }));

        return [...homeworkAnnouncements, ...classAnnouncements].slice(0, 4);
    }, [summary, tasks, offerings]);

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

    const mergedNotificationSettings = useMemo(
        () => ({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(notificationSettings || {}),
        }),
        [notificationSettings]
    );

    const resolvedTab = activeTab === 'profile' ? 'overview' : activeTab;
    const isTabDataLoaded = loadedTabs[resolvedTab] || false;
    const isProfileReady = activeTab !== 'profile' || (notificationsLoaded && !notificationLoading);
    const isCurrentTabLoading =
        tabLoading === resolvedTab || (activeTab === 'profile' && notificationLoading);
    const renderTab = () => {
        if (!isTabDataLoaded || !isProfileReady || isCurrentTabLoading) {
            return <Loader fullScreen={false} />;
        }
        switch (activeTab) {
            case 'my-courses':
                return <CoursesTab courses={courses} offeringsByCourse={offeringsByCourse} />;
            case 'schedule':
                return <ScheduleTab offerings={offerings} />;
            case 'tasks':
                return <TasksTab tasks={tasks} />;
            case 'progress':
                return (
                    <ProgressTab
                        items={progressItems}
                        attendanceStats={attendanceStats}
                        engagement={engagement}
                        leaderboardItems={leaderboardItems}
                        milestoneItems={milestoneItems}
                        badgeItems={badgeItems}
                    />
                );
            case 'notifications':
                return <NotificationsTab />;
            case 'profile':
                return (
                    <ProfileTab
                        student={overviewStudent}
                        notificationSettings={mergedNotificationSettings}
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
                        engagement={engagement}
                        leaderboardItems={leaderboardItems}
                        milestoneItems={milestoneItems}
                        badgeItems={badgeItems}
                    />
                );
        }
    };
    const navigate = useNavigate();
    return (
        <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] transition-colors duration-200 min-w-0 break-words">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 px-4 pb-12">
                <div
                    className={`
    ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
    w-full lg:flex-shrink-0
    transition-all duration-300
  `}
                >
                    <div className="sticky top-24" style={{ height: 'calc(100vh - 6rem)' }}>
                        <DashboardSidebar
                            items={NAV_ITEMS}
                            activeId={activeTab}
                            onSelect={(id) => {
                                if (id === 'chat') {
                                    navigate('/chat');
                                    return;
                                }
                                if (id === 'profile') {
                                    navigate('/profile');
                                    return;
                                }
                                setActiveTab(id);
                            }}
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen((prev) => !prev)}
                                className="hidden md:inline-flex px-4 py-2 rounded-full border text-sm text-gray-600 dark:text-[#E8ECF3] dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                type="button"
                            >
                                {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                            </button>
                            <Link
                                to={analyticsLink}
                                className="inline-flex px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                            >
                                Analytics
                            </Link>
                        </div>
                    </div>
                    {renderTab()}
                </main>
            </div>
        </div>
    );
};

const OverviewTab = ({
    student,
    stats,
    offerings,
    tasks,
    announcements,
    attendanceStats,
    engagement,
    leaderboardItems,
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

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white rounded-3xl p-6 sm:p-8">
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
                    <StatCard label="Катышуу" value={`${attendanceStats.rate}%`} />
                </div>

                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Upcoming classes
                        </h3>
                        <span className="text-xs text-gray-500">{upcoming.length} items</span>
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
                                            {item.courseTitle || item.course?.title || 'Class'}
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
                                            {item.location || item.room || 'Classroom TBD'} •{' '}
                                            {resolveInstructorName(item)}
                                        </p>
                                    )}
                                    {type === 'online_live' && (
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-blue-700 dark:text-blue-300">
                                                Countdown: {countdown}
                                            </span>
                                            {joinUrl && joinAllowed ? (
                                                <a
                                                    href={joinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 rounded-full text-xs bg-blue-600 text-white"
                                                >
                                                    Join
                                                </a>
                                            ) : (
                                                <span className="text-xs text-amber-600">
                                                    Join 10 мүнөт мурун ачылат
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
                            Homework
                        </h3>
                        {pendingHomework.map((task) => (
                            <div
                                key={task.id || task.taskId}
                                className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                            >
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {task.title}
                                </p>
                                <p className="text-gray-500">
                                    {task.due || task.dueAt || 'Due date pending'}
                                </p>
                            </div>
                        ))}
                        {pendingHomework.length === 0 && (
                            <p className="text-sm text-gray-500">Тапшырмалар жок.</p>
                        )}
                    </div>
                    <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Announcements
                        </h3>
                        {announcements.map((item) => (
                            <div
                                key={item.id || item.title}
                                className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                            >
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title}
                                </p>
                                <p className="text-gray-500">
                                    {item.body || item.message || 'Жаңы жаңылык'}
                                </p>
                            </div>
                        ))}
                        {announcements.length === 0 && (
                            <p className="text-sm text-gray-500">Жаңылыктар жок.</p>
                        )}
                    </div>
                </section>
                <NotificationsWidget />
            </div>

            <div className="space-y-4">
                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">XP & Level</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{engagement.xp} XP</p>
                    <p className="text-sm text-gray-500">Level {engagement.level}</p>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 mt-2">
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

                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">Leaderboard</h3>
                    <div className="mt-2 space-y-2 text-sm">
                        {leaderboardItems.slice(0, 5).map((row, idx) => (
                            <div
                                key={row.studentId || row.id || idx}
                                className="flex items-center justify-between"
                            >
                                <span className="text-gray-700 dark:text-gray-300">
                                    {idx + 1}. {row.fullName || row.name || 'Student'}
                                </span>
                                <span className="text-gray-500">{row.xp || 0} XP</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">Milestones</h3>
                    <div className="mt-2 space-y-2 text-sm">
                        {milestoneItems.map((item) => (
                            <div key={item.id || item.title}>
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title}
                                </p>
                                <p className="text-gray-500">{item.value || item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Achievement badges
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {badgeItems.map((badge) => (
                            <span
                                key={badge.id || badge.title}
                                className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            >
                                {badge.title || badge.name}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const CoursesTab = ({ courses, offeringsByCourse }) => {
    if (!courses.length) {
        return (
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                Сизде активдүү курстар жок.
            </div>
        );
    }

    const fallbackCover =
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
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
                            className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden"
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
                                            Location:{' '}
                                            {nextSession?.location ||
                                                nextSession?.room ||
                                                'Classroom TBD'}
                                        </p>
                                        <p>Schedule: {formatSessionDate(nextSession?.startAt)}</p>
                                        <p>
                                            Teacher: {resolveInstructorName(nextSession || course)}
                                        </p>
                                    </div>
                                )}
                                {courseType === 'online_live' && (
                                    <div className="text-sm text-gray-500">
                                        <p>Next class: {formatSessionDate(nextSession?.startAt)}</p>
                                        <p>Recordings: {recordingsCount}</p>
                                    </div>
                                )}
                                <Link
                                    to={courseId ? `/courses/${courseId}` : '#'}
                                    className="inline-flex px-4 py-2 rounded-full border text-sm text-blue-600 dark:text-blue-400 dark:border-gray-700"
                                >
                                    Open Course
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ScheduleTab = ({ offerings }) => {
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
    const selectedRecordings = resolveRecordings(selectedLive || {});
    const selectedJoinUrl =
        selectedLive?.joinLink || selectedLive?.link || selectedLive?.joinUrl || '';
    const selectedJoinAllowed = !selectedLive || isStudentJoinWindowOpen(selectedLive, nowMs);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">Жүгүртмө</h2>
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
                            className="bg-white dark:bg-[#222222] border border-gray-100 dark:border-gray-800 rounded-2xl p-4"
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
                                    <p>Location: {item.location || item.room || 'Classroom TBD'}</p>
                                    <p>Teacher: {resolveInstructorName(item)}</p>
                                    <p>Schedule: {formatSessionDate(item.startAt)}</p>
                                </div>
                            )}
                            {type === 'online_live' && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-blue-700 dark:text-blue-300">
                                        Countdown:{' '}
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
                                            Join class
                                        </a>
                                    ) : (
                                        <span className="text-xs text-amber-600">
                                            Join 10 мүнөт мурун ачылат
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLiveId(String(item.id))}
                                        className="px-3 py-1 rounded-full border text-xs text-gray-600 dark:text-gray-300 dark:border-gray-700"
                                    >
                                        Live page
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        Recordings: {recordings.length}
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
                        Live class page
                    </h3>
                    <p className="text-sm text-gray-500">
                        {selectedLive.courseTitle || selectedLive.course?.title}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Countdown:{' '}
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
                                Join class
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="px-4 py-2 rounded-full border text-sm text-gray-400 cursor-not-allowed"
                            >
                                Join class
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">Recordings</p>
                        {selectedRecordings.length ? (
                            selectedRecordings.map((rec) => (
                                <a
                                    key={rec.id || rec.url}
                                    href={rec.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-blue-600 dark:text-blue-400 underline"
                                >
                                    {rec.title || 'Recording'}
                                </a>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Азырынча recording жок.</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

const TasksTab = ({ tasks }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">Тапшырмалар</h2>
        {tasks.length ? (
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-x-auto min-w-[600px] w-full text-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="text-left px-4 py-3">Тапшырма</th>
                            <th className="text-left px-4 py-3">Курс</th>
                            <th className="text-left px-4 py-3">Бүтүү мөөнөтү</th>
                            <th className="text-left px-4 py-3">Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr
                                key={task.id || task.taskId}
                                className="border-t border-gray-100 dark:border-gray-800"
                            >
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {task.title}
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                    {task.courseTitle || task.course}
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                    {task.due ||
                                        (task.dueAt
                                            ? new Date(task.dueAt).toLocaleDateString('ru-RU')
                                            : '—')}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs ${
                                            task.status === 'completed'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        }`}
                                    >
                                        {task.status === 'completed' ? 'Жабылган' : 'Күтүүдө'}
                                    </span>
                                </td>
                            </tr>
                        ))}
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

const ProgressTab = ({
    items,
    attendanceStats,
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
                    No enrolled courses yet.
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
                <StatCard label="Learning streak" value={`${engagement.streak} күн`} />
                <StatCard label="Attendance" value={`${attendanceStats.rate}%`} />
                <StatCard
                    label="Leaderboard"
                    value={`Top ${Math.max(1, leaderboardItems.length)}`}
                />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <div className="xl:col-span-2 bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Course milestones
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                        {milestoneItems.map((item) => (
                            <div key={item.id || item.title}>
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title}
                                </p>
                                <p className="text-gray-500">{item.value || item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Achievement badges
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
                                                ? `/courses/${item.courseId}?resumeLessonId=${
                                                      item.resumeLesson.lessonId || ''
                                                  }${
                                                      item.resumeLesson.lastVideoTime
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
                                                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                                                    lesson.completed
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
    onNotificationChange,
    onSaveNotifications,
    savingNotifications,
}) => {
    const notificationEntries = Object.entries(notificationSettings || {});
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">Профиль</h2>
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Аты-жөнү
                    </label>
                    <input
                        type="text"
                        className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={student.name}
                        disabled
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Email
                        </label>
                        <input
                            type="email"
                            className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={student.email || 'student@example.com'}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Телефон
                        </label>
                        <input
                            type="text"
                            className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={student.phone || '+996 (555) 123-456'}
                            disabled
                        />
                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Профиль маалыматтарын өзгөртүү жакында жеткиликтүү болот. Учурда сиз
                    эскертмелерди башкарсаңыз болот.
                </p>
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
    <div className="bg-white dark:bg-[#222222] rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3] mt-1">{value}</p>
    </div>
);

OverviewTab.propTypes = {
    student: PropTypes.shape({
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
};

TasksTab.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

ProgressTab.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
    }).isRequired,
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
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
    }).isRequired,
    notificationSettings: PropTypes.object,
    onNotificationChange: PropTypes.func,
    onSaveNotifications: PropTypes.func.isRequired,
    savingNotifications: PropTypes.bool,
};

ProfileTab.defaultProps = {
    notificationSettings: {},
    onNotificationChange: undefined,
    savingNotifications: false,
};

StatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StudentDashboard;

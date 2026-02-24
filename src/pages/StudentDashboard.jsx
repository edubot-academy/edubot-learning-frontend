import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
        label: 'Сабак эскертмелери',
        description: 'Жандуу сабактар же жаңы сабактар башталар алдында эскертүү алыңыз.',
    },
    announcementEmails: {
        label: 'Курс боюнча жаңылыктар',
        description: 'Жаңы модулдар жана маанилүү окуу жаңылыктары email аркылуу жетет.',
    },
    taskUpdates: {
        label: 'Тапшырмалар боюнча билдирүү',
        description: 'Квиз жана чакырыктар боюнча эскертмелерди алыңыз.',
    },
    smsAlerts: {
        label: 'SMS эскертүүлөр',
        description: 'Маанилүү окуялар боюнча SMS кабыл алыңыз.',
    },
    pushNotifications: {
        label: 'Push билдирүүлөр',
        description: 'Прогресс жана окуу сунуштары боюнча push билдирүүлөрүн алыңыз.',
    },
};

const formatNotificationLabel = (key) =>
    key
        ?.replace(/([A-Z])/g, ' $1')
        ?.replace(/_/g, ' ')
        ?.replace(/\b\w/g, (l) => l.toUpperCase())
        ?.trim() || key;

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

    const loadOverview = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('overview');
        try {
            const summaryRes = await fetchStudentDashboardSummary(studentId);
            setSummary(summaryRes || null);
        } catch (error) {
            console.error('Failed to load overview', error);
            toast.error('Кыскача маалымат жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, overview: true }));
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

    const progressItems = useMemo(() => {
        return (progress || []).map((item) => {
            const lessonsArray = Array.isArray(item.lessons) ? item.lessons : [];
            const sectionsMap = new Map();
            lessonsArray.forEach((lesson) => {
                const sectionKey = lesson.sectionId ?? `section-${lesson.sectionTitle || 'unknown'}`;
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
            return (
                <Loader fullScreen={false} />
            );
        }
        switch (activeTab) {
            case 'my-courses':
                return <CoursesTab courses={courses} />;
            case 'schedule':
                return <ScheduleTab offerings={offerings} />;
            case 'tasks':
                return <TasksTab tasks={tasks} />;
            case 'progress':
                return <ProgressTab items={progressItems} />;
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
                return <OverviewTab student={overviewStudent} stats={overviewStats} />;
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
                            <p className="text-sm uppercase tracking-wide text-gray-400 dark:text-gray-500">Студент</p>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E8ECF3]">
                                {overviewStudent.name}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Чыгармачыл окуу жолуңузду көзөмөлдөңүз
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="hidden md:inline-flex px-4 py-2 rounded-full border text-sm text-gray-600 dark:text-[#E8ECF3] dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            type="button"
                        >
                            {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                        </button>
                    </div>
                    {renderTab()}
                </main>
            </div>
        </div>
    );
};

const OverviewTab = ({ student, stats }) => (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white rounded-3xl p-6 sm:p-8">
            <p className="text-sm uppercase tracking-wide opacity-80">
                Streak: {student.streak} күн
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
            <button className="mt-5 px-5 py-3 rounded-full bg-white text-blue-600 font-semibold text-sm sm:text-base shadow hover:bg-gray-100 transition-colors">
                Сабакты улантуу
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Активдүү курстар" value={stats.activeCourses} />
            <StatCard label="Жалпы сабактар" value={stats.lessonsCompleted} />
            <StatCard label="Бул жумадагы убакыт" value={stats.timeThisWeek} />
            <StatCard label="Күтүлүп жаткан тапшырмалар" value={stats.pendingTasks} />
        </div>
        <NotificationsWidget />
    </div>
);

const CoursesTab = ({ courses }) => {
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">Менин курстарым</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => {
                    const cover =
                        course.coverImageUrl || course.coverImage || course.cover || fallbackCover;
                    const instructor =
                        course.instructorName ||
                        course.instructor?.fullName ||
                        course.instructor ||
                        'Инструктор';
                    const courseId = course.id ?? course.courseId;
                    const lessonsCompleted = Number(course.lessonsCompleted ?? 0);
                    const lessonsTotal = Number(course.lessonsTotal ?? course.lessonCount ?? 0);
                    const rawProgress = course.progressPercent ?? course.progress;
                    const progressValue =
                        typeof rawProgress === 'number'
                            ? Math.max(0, Math.min(100, Math.round(rawProgress)))
                            : lessonsTotal > 0
                                ? Math.round((lessonsCompleted * 100) / lessonsTotal)
                                : 0;
                    const nextLessonObj =
                        course.nextLesson && typeof course.nextLesson === 'object'
                            ? course.nextLesson
                            : null;
                    const lastViewed =
                        course.lastViewedLesson ||
                        (course.lastViewedLessonId
                            ? {
                                lessonId: course.lastViewedLessonId,
                                lessonTitle: course.lastViewedLessonTitle,
                                lastVideoTime: course.lastVideoTime,
                            }
                            : null);
                    const nextLessonTitle =
                        nextLessonObj?.title ||
                        course.nextLessonTitle ||
                        course.nextLesson ||
                        '';
                    const resumeLessonId = nextLessonObj?.lessonId || lastViewed?.lessonId;
                    const resumeTimeSeconds =
                        nextLessonObj?.lessonId === resumeLessonId && nextLessonObj?.lastVideoTime
                            ? nextLessonObj.lastVideoTime
                            : lastViewed?.lastVideoTime;
                    const resumeTimeParam =
                        resumeLessonId && resumeTimeSeconds
                            ? `&resumeTime=${Math.floor(resumeTimeSeconds)}`
                            : '';
                    const resumeSearch =
                        courseId && resumeLessonId
                            ? `?resumeLessonId=${resumeLessonId}${resumeTimeParam}`
                            : '';

                    return (
                        <div
                            key={courseId || course.title}
                            className="bg-white dark:bg-[#222222] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                        >
                            <img
                                src={cover}
                                alt={course.title}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4 flex-1 flex flex-col gap-3">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{instructor}</p>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">{course.title}</h3>
                                    {lessonsTotal > 0 ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Сабактар: {lessonsCompleted}/{lessonsTotal}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Процесс</span>
                                        <span>{Math.max(0, Math.min(100, progressValue))}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-blue-500"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, progressValue))}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Кийинки сабак:{' '}
                                    {nextLessonTitle || '—'}
                                </p>
                                <Link
                                    to={courseId ? `/courses/${courseId}${resumeSearch}` : '#'}
                                    className="mt-auto px-4 py-2 rounded-full border text-sm text-blue-600 dark:text-blue-400 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                                >
                                    Улантуу
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
    if (!offerings.length) {
        return (
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                Жакынкы жандуу сабактар табылган жок.
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">Жүгүртмө</h2>
            <div className="space-y-3">
                {offerings.map((offering) => {
                    const date =
                        offering.date ||
                        (offering.startAt
                            ? new Date(offering.startAt).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            : 'Белгисиз убакыт');
                    const modality = offering.modality || offering.modalityLabel || '';
                    return (
                        <div
                            key={offering.id}
                            className="bg-white dark:bg-[#222222] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow"
                        >
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {offering.courseTitle || offering.course?.title}
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">{date}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{modality}</p>
                            </div>
                            <a
                                href={offering.joinLink || offering.link || '#'}
                                className="px-4 py-2 rounded-full border text-sm text-blue-600 dark:text-blue-400 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Сессияга кошулуу
                            </a>
                        </div>
                    );
                })}
            </div>
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
                            <tr key={task.id || task.taskId} className="border-t border-gray-100 dark:border-gray-800">
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
                                        className={`px-3 py-1 rounded-full text-xs ${task.status === 'completed'
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

const ProgressTab = ({ items }) => {
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
                                <div className="w-48">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Прогресс</span>
                                        <span>{item.progressPercent}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className="h-2 bg-blue-600 rounded-full"
                                            style={{ width: `${item.progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                                {item.resumeLesson ? (
                                    <Link
                                        to={
                                            item.courseId
                                                ? {
                                                    pathname: `/courses/${item.courseId}`,
                                                    search: `?resumeLessonId=${item.resumeLesson.lessonId || ''}${item.resumeLesson.lastVideoTime
                                                            ? `&resumeTime=${Math.floor(
                                                                item.resumeLesson.lastVideoTime
                                                            )}`
                                                            : ''
                                                        }`,
                                                }
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
                                                        ? { label: 'Квиз өттү', className: 'bg-green-100 text-green-700' }
                                                        : lesson.quizPassed === false
                                                            ? { label: 'Квиз өтпөдү', className: 'bg-red-100 text-red-700' }
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
                                                                            : lesson.kind === 'article'
                                                                                ? 'Макала'
                                                                                : lesson.kind === 'code'
                                                                                    ? 'Код'
                                                                                    : 'Видео'}
                                                                    </span>
                                                                    {quizBadge ? (
                                                                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${quizBadge.className}`}>
                                                                            {quizBadge.label}
                                                                            {typeof lesson.quizScore === 'number'
                                                                                ? ` (${lesson.quizScore}%)`
                                                                                : ''}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                                {!lesson.completed && lesson.lastVideoTime ? (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Акыркы убакыт: {formatTime(lesson.lastVideoTime)}
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
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Аты-жөнү</label>
                    <input
                        type="text"
                        className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={student.name}
                        disabled
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <input
                            type="email"
                            className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={student.email || 'student@example.com'}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Телефон</label>
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
                    <p className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">Эскертмелер</p>
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
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
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

export default StudentDashboard;

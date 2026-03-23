import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import {
    fetchInstructorProfile,
    fetchCourseDetails,
    fetchUsers,
    listOfferingsForCourse,
    createOffering,
    updateOffering,
    enrollUserInCourse,
    fetchInstructorStudentCourses,
    fetchCourseStudents,
    createCourse,
    fetchCategories,
} from '@services/api';
import toast from 'react-hot-toast';
import {
    FiHome,
    FiBookOpen,
    FiUsers,
    FiUser,
    FiCpu,
    FiLayers,
    FiFilter,
    FiCalendar,
    FiGlobe,
    FiBell,
} from 'react-icons/fi';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import Loader from '@shared/ui/Loader';
import AttendancePage from './Attendance';
import SessionWorkspacePage from './SessionWorkspace';
import InstructorAnalyticsPage from './InstructorAnalytics';
import InternalLeaderboardPage from './InternalLeaderboard';
import InstructorHomeworkPage from './InstructorHomework';

const NAV_ITEMS = [
    { id: 'overview', label: 'Кыскача', icon: FiHome },
    { id: 'courses', label: 'Курстарым', icon: FiBookOpen },
    { id: 'students', label: 'Студенттер', icon: FiUsers },
    { id: 'profile', label: 'Профиль', icon: FiUser },
    { id: 'ai', label: 'AI ассистент', icon: FiCpu },
    { id: 'offerings', label: 'Агымдар', icon: FiLayers },
    { id: 'sessions', label: 'Сессиялар', icon: FiCalendar },
    { id: 'attendance', label: 'Катышуу', icon: FiUsers },
    { id: 'analytics', label: 'Аналитика', icon: FiGlobe },
    { id: 'leaderboard', label: 'Рейтинг', icon: FiFilter },
    { id: 'homework', label: 'Үй тапшырма', icon: FiBookOpen },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell },
];

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(
        NAV_ITEMS.some((item) => item.id === initialTab) ? initialTab : 'overview'
    );
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [courseList, setCourseList] = useState([]);
    const [offeringsByCourse, setOfferingsByCourse] = useState({});
    const [loadingOfferings, setLoadingOfferings] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [studentCourses, setStudentCourses] = useState([]);
    const [studentCoursesTotal, setStudentCoursesTotal] = useState(null);
    const [loadingStudentCourses, setLoadingStudentCourses] = useState(false);
    const [selectedStudentCourseId, setSelectedStudentCourseId] = useState(null);
    const [courseStudents, setCourseStudents] = useState([]);
    const [courseStudentsMeta, setCourseStudentsMeta] = useState(null);
    const [loadingCourseStudents, setLoadingCourseStudents] = useState(false);
    const [studentsPage, setStudentsPage] = useState(1);
    const [studentSearch, setStudentSearch] = useState('');
    const [progressMin, setProgressMin] = useState('');
    const [progressMax, setProgressMax] = useState('');
    const [studentsError, setStudentsError] = useState('');
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [creatingDeliveryCourse, setCreatingDeliveryCourse] = useState(false);
    const [deliveryCategories, setDeliveryCategories] = useState([]);
    const [deliveryCourse, setDeliveryCourse] = useState({
        courseType: 'offline',
        title: '',
        description: '',
        categoryId: '',
        price: '',
        languageCode: 'ky',
    });

    useEffect(() => {
        const tabFromQuery = searchParams.get('tab');
        const resolvedTab =
            tabFromQuery && NAV_ITEMS.some((item) => item.id === tabFromQuery)
                ? tabFromQuery
                : 'overview';
        if (resolvedTab !== activeTab) {
            setActiveTab(resolvedTab);
        }
    }, [searchParams]);

    const handleTabSelect = useCallback(
        (tabId) => {
            if (!NAV_ITEMS.some((item) => item.id === tabId)) return;
            setActiveTab(tabId);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (tabId === 'overview') next.delete('tab');
                    else next.set('tab', tabId);
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const analyticsLink = useMemo(() => {
        const to = new Date();
        const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
        const toIso = to.toISOString().slice(0, 10);
        const fromIso = from.toISOString().slice(0, 10);
        return `/instructor/analytics?from=${fromIso}&to=${toIso}`;
    }, []);

    const courses = useMemo(
        () => (courseList.length ? courseList : profile?.courses || []),
        [courseList, profile]
    );

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        const loadProfile = async () => {
            setLoadingProfile(true);
            try {
                const data = await fetchInstructorProfile(user.id);
                setProfile(data);
            } catch (error) {
                console.error('Failed to load instructor profile', error);
                toast.error('Инструктор маалыматын жүктөө мүмкүн болбоду');
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, [user]);

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        const loadCourses = async () => {
            setLoadingCourses(true);
            try {
                const profileData = await fetchInstructorProfile(user.id);
                setCourseList(Array.isArray(profileData?.courses) ? profileData.courses : []);
            } catch (error) {
                console.error('Failed to load instructor courses', error);
                toast.error('Инструктор курстарын жүктөө мүмкүн болбоду');
            } finally {
                setLoadingCourses(false);
            }
        };

        loadCourses();
    }, [user]);

    const loadStudentCourses = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;
        setLoadingStudentCourses(true);
        setStudentsError('');
        try {
            const data = await fetchInstructorStudentCourses();
            const list = data?.courses || [];
            setStudentCourses(list);
            setStudentCoursesTotal(
                typeof data?.total === 'number'
                    ? data.total
                    : list.reduce((acc, course) => acc + (course.studentCount || 0), 0)
            );
            setSelectedStudentCourseId((prev) => {
                if (!list.length) return null;
                const exists = list.some((course) => course.id === prev);
                return exists ? prev : null;
            });
            if (!list.length) {
                setCourseStudents([]);
                setCourseStudentsMeta(null);
            }
        } catch (error) {
            console.error('Failed to load student courses', error);
            if (error?.response?.status === 403) {
                setStudentsError('Бул курс сизге бекитилген эмес');
            } else {
                toast.error('Студенттер тизмесин жүктөө мүмкүн болбоду');
            }
        } finally {
            setLoadingStudentCourses(false);
        }
    }, [user]);

    const loadCourseStudents = useCallback(
        async (courseId) => {
            if (!courseId) {
                setCourseStudents([]);
                setCourseStudentsMeta(null);
                return;
            }
            setLoadingCourseStudents(true);
            setStudentsError('');
            try {
                const data = await fetchCourseStudents(courseId, {
                    page: studentsPage,
                    limit: 20,
                    q: studentSearch || undefined,
                    progressGte: progressMin === '' ? undefined : Number(progressMin),
                    progressLte: progressMax === '' ? undefined : Number(progressMax),
                });
                setCourseStudents(data?.students || []);
                setCourseStudentsMeta({
                    ...(data?.course || {}),
                    page: data?.page,
                    total: data?.total,
                    totalPages: data?.totalPages,
                    limit: data?.limit,
                });
            } catch (error) {
                console.error('Failed to load course students', error);
                setCourseStudents([]);
                setCourseStudentsMeta(null);
                if (error?.response?.status === 403) {
                    setStudentsError('Бул курс сизге бекитилген эмес');
                } else {
                    toast.error('Курс студенттерин жүктөө мүмкүн болбоду');
                }
            } finally {
                setLoadingCourseStudents(false);
            }
        },
        [studentsPage, studentSearch, progressMin, progressMax]
    );

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        loadStudentCourses();
    }, [user, loadStudentCourses]);

    const loadOfferingsForCourses = useCallback(async (courseArray) => {
        if (!courseArray.length) {
            setOfferingsByCourse({});
            return;
        }
        setLoadingOfferings(true);
        try {
            const summaries = {};
            await Promise.all(
                courseArray.map(async (course) => {
                    try {
                        const data = await listOfferingsForCourse(course.id);
                        summaries[course.id] = (data || []).map((offering) => ({
                            ...offering,
                            course,
                        }));
                    } catch (error) {
                        console.error('Failed to load offerings for course', course.id, error);
                    }
                })
            );
            setOfferingsByCourse(summaries);
        } finally {
            setLoadingOfferings(false);
        }
    }, []);

    useEffect(() => {
        if (!courses.length) return;
        loadOfferingsForCourses(courses);
    }, [courses, loadOfferingsForCourses]);

    if (!user || user.role !== 'instructor') {
        return <Navigate to="/" replace />;
    }

    const aiCourses = courses.filter((course) => course.aiAssistantEnabled);
    const publishedCount = courses.filter((course) => course.isPublished).length;
    const pendingCount = courses.filter((course) => !course.isPublished).length;
    const aiEnabledCount = aiCourses.length;
    const offerings = useMemo(
        () => courses.flatMap((course) => offeringsByCourse[course.id] || []),
        [courses, offeringsByCourse]
    );
    const expertiseTags = useMemo(() => {
        if (Array.isArray(profile?.expertiseTags) && profile.expertiseTags.length) {
            return profile.expertiseTags;
        }
        if (typeof profile?.expertiseTagsText === 'string' && profile.expertiseTagsText.trim()) {
            return profile.expertiseTagsText
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);
        }
        return [];
    }, [profile]);

    const socialLinks = useMemo(
        () =>
            Object.entries(profile?.socialLinks || {}).filter(
                ([, value]) => typeof value === 'string' && value.trim().length
            ),
        [profile]
    );

    const handleRefreshOfferings = useCallback(() => {
        if (courses.length) {
            loadOfferingsForCourses(courses);
        }
    }, [courses, loadOfferingsForCourses]);

    useEffect(() => {
        if (activeTab !== 'students') return;
        if (selectedStudentCourseId) {
            loadCourseStudents(selectedStudentCourseId);
        } else {
            setCourseStudents([]);
            setCourseStudentsMeta(null);
        }
    }, [
        activeTab,
        selectedStudentCourseId,
        studentsPage,
        studentSearch,
        progressMin,
        progressMax,
        loadCourseStudents,
    ]);

    const handleSelectStudentCourse = useCallback((courseId) => {
        setStudentsPage(1);
        setSelectedStudentCourseId(courseId);
    }, []);

    const handleDeliveryCourseChange = (event) => {
        const { name, value } = event.target;
        setDeliveryCourse((prev) => ({ ...prev, [name]: value }));
    };

    const closeDeliveryModal = () => {
        setShowDeliveryModal(false);
        setDeliveryCourse({
            courseType: 'offline',
            title: '',
            description: '',
            categoryId: '',
            price: '',
            languageCode: 'ky',
        });
    };

    const openDeliveryModal = async () => {
        if (!deliveryCategories.length) {
            try {
                const categories = await fetchCategories();
                setDeliveryCategories(Array.isArray(categories) ? categories : []);
            } catch (error) {
                console.error('Failed to load categories', error);
                toast.error('Категориялар жүктөлгөн жок');
            }
        }
        setShowDeliveryModal(true);
    };

    const handleCreateDeliveryCourse = async () => {
        if (!deliveryCourse.title || !deliveryCourse.description || !deliveryCourse.categoryId) {
            toast.error('Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз.');
            return;
        }

        setCreatingDeliveryCourse(true);
        try {
            await createCourse({
                title: deliveryCourse.title,
                description: deliveryCourse.description,
                categoryId: parseInt(deliveryCourse.categoryId, 10),
                price: Number(deliveryCourse.price || 0),
                languageCode: deliveryCourse.languageCode || 'ky',
                courseType: deliveryCourse.courseType,
                isPaid: Number(deliveryCourse.price || 0) > 0,
            });

            toast.success('Курс түзүлдү. Эми группа жана сессия түзө аласыз.');
            closeDeliveryModal();
            setActiveTab('courses');

            const profileData = await fetchInstructorProfile(user.id);
            setCourseList(Array.isArray(profileData?.courses) ? profileData.courses : []);
        } catch (error) {
            console.error('Failed to create delivery course', error);
            toast.error('Курсту түзүүдө ката кетти.');
        } finally {
            setCreatingDeliveryCourse(false);
        }
    };

    const renderContent = () => {
        if ((loadingProfile && !profile) || (loadingCourses && !courses.length)) {
            return <Loader fullScreen={false} />;
        }

        switch (activeTab) {
            case 'courses':
                return (
                    <CoursesSection
                        courses={courses}
                        loading={loadingCourses}
                        offeringsByCourse={offeringsByCourse}
                        loadingOfferings={loadingOfferings}
                        onViewOfferings={() => setActiveTab('offerings')}
                        onOpenDeliveryModal={openDeliveryModal}
                        showDeliveryModal={showDeliveryModal}
                        onCloseDeliveryModal={closeDeliveryModal}
                        deliveryCourse={deliveryCourse}
                        onDeliveryCourseChange={handleDeliveryCourseChange}
                        onCreateDeliveryCourse={handleCreateDeliveryCourse}
                        creatingDeliveryCourse={creatingDeliveryCourse}
                        deliveryCategories={deliveryCategories}
                    />
                );
            case 'students':
                return (
                    <StudentsSection
                        total={studentCoursesTotal}
                        courses={studentCourses}
                        loadingCourses={loadingStudentCourses}
                        selectedCourseId={selectedStudentCourseId}
                        onSelectCourse={handleSelectStudentCourse}
                        courseStudents={courseStudents}
                        courseMeta={courseStudentsMeta}
                        loadingStudents={loadingCourseStudents}
                        error={studentsError}
                        refreshCourses={loadStudentCourses}
                        studentsPage={studentsPage}
                        onChangePage={setStudentsPage}
                        search={studentSearch}
                        onSearchChange={setStudentSearch}
                        progressMin={progressMin}
                        progressMax={progressMax}
                        onProgressMinChange={setProgressMin}
                        onProgressMaxChange={setProgressMax}
                    />
                );
            case 'profile':
                return (
                    <ProfileSection
                        profile={profile}
                        expertiseTags={expertiseTags}
                        socialLinks={socialLinks}
                    />
                );
            case 'ai':
                return <AiSection aiCourses={aiCourses} totalCourses={courses.length} />;
            case 'offerings':
                return (
                    <OfferingsSection
                        courses={courses}
                        offerings={offerings}
                        loading={loadingOfferings}
                        refreshOfferings={handleRefreshOfferings}
                    />
                );
            case 'sessions':
                return <SessionWorkspacePage />;
            case 'attendance':
                return <AttendancePage embedded />;
            case 'analytics':
                return <InstructorAnalyticsPage />;
            case 'leaderboard':
                return <InternalLeaderboardPage />;
            case 'homework':
                return <InstructorHomeworkPage />;
            case 'notifications':
                return <NotificationsTab />;
            case 'overview':
            default:
                return (
                    <OverviewSection
                        user={user}
                        profile={profile}
                        courses={courses}
                        publishedCount={publishedCount}
                        pendingCount={pendingCount}
                        aiEnabledCount={aiEnabledCount}
                        analyticsLink={analyticsLink}
                    />
                );
        }
    };

    return (
        <div className="pt-24 min-h-screen">
            <div className="max-w-7xl mx-auto flex gap-6 px-4 pb-12">
                <DashboardSidebar
                    items={NAV_ITEMS}
                    activeId={activeTab}
                    onSelect={handleTabSelect}
                    isOpen={sidebarOpen}
                    onToggle={setSidebarOpen}
                    className="flex-shrink-0"
                />

                <main className="flex-1 min-w-0 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-sm uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                Инструктор
                            </p>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.fullName || user.email}</h1>
                            <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                Курстарыңызды жана студенттерди толук көзөмөлдөңүз
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="hidden md:inline-flex px-4 py-2 rounded-full border text-sm text-gray-600 dark:text-[#a6adba]"
                            type="button"
                        >
                            {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                        </button>
                        <Link
                            to={analyticsLink}
                            className="inline-flex px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                        >
                            Аналитика
                        </Link>
                    </div>

                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const OverviewSection = ({
    user,
    profile,
    courses,
    publishedCount,
    pendingCount,
    aiEnabledCount,
    analyticsLink,
}) => {
    const stats = [
        {
            label: 'Жарыяланган курстар',
            value: publishedCount,
        },
        {
            label: 'Каралуудагы курстар',
            value: pendingCount,
        },
        {
            label: 'AI ассистент иштетилген',
            value: aiEnabledCount,
        },
        {
            label: 'Студенттер',
            value: profile?.numberOfStudents ?? '—',
        },
    ];

    return (
        <>
            <div className="rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">Кош келиңиз</p>
                <h2 className="text-2xl font-semibold">{user.fullName || user.email}</h2>
                <p className="mt-2 text-gray-600 dark:text-[#a6adba]">
                    Профилди толтуруңуз, курстарды жаңыртыңыз жана студенттерге баалуулук
                    тартуулаңыз.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickActionCard
                    title="Курстарды Башкаруу"
                    description="Бар болгон курстарыңызды көрүңүз, өзгөртүңүз же өчүрүңүз."
                    link="/instructor/courses"
                    buttonText="Курстар"
                />
                <QuickActionCard
                    title="Жаңы Курс Түзүү"
                    description="Сабак жана бөлүмдөрү менен жаңы курс кошуңуз."
                    link="/instructor/course/create"
                    buttonText="Курс түзүү"
                    accent="green"
                />
                <QuickActionCard
                    title="Катталуулар"
                    description="Студенттердин катталуусун көзөмөлдөңүз."
                    link="/instructor/enrollments"
                    buttonText="Катталгандар"
                    accent="amber"
                />
                <QuickActionCard
                    title="Аналитика"
                    description="Attendance, homework жана risk метрикаларын көрүңүз."
                    link={analyticsLink}
                    buttonText="Аналитика"
                    accent="blue"
                />
            </div>

            <NotificationsWidget />
        </>
    );
};

const CoursesSection = ({
    courses,
    loading,
    offeringsByCourse,
    loadingOfferings,
    onViewOfferings,
    onOpenDeliveryModal,
    showDeliveryModal,
    onCloseDeliveryModal,
    deliveryCourse,
    onDeliveryCourseChange,
    onCreateDeliveryCourse,
    creatingDeliveryCourse,
    deliveryCategories,
}) => (
    <div className="rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
                <h2 className="text-2xl font-semibold">Курстарым</h2>
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Активдүү жана каралуудагы курстар
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenDeliveryModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-edubot-teal text-edubot-teal text-sm"
                >
                    Оффлайн/Live курс
                </button>
                <Link
                    to="/instructor/course/create"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                >
                    Жаңы курс
                </Link>
            </div>
        </div>
        {loading && !courses.length ? (
            <Loader fullScreen={false} />
        ) : courses.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                    <div
                        key={course.id || course.title}
                        className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</p>
                                {course.category?.name && (
                                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                        {course.category.name}
                                    </p>
                                )}
                            </div>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${course.isPublished
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}
                            >
                                {course.isPublished ? 'Жарыяланды' : 'Каралууда'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-[#a6adba]">
                            <span>
                                {course.studentsCount
                                    ? `${course.studentsCount} студент`
                                    : 'Студенттер маалымат жок'}
                            </span>
                            <span>
                                {course.updatedAt
                                    ? new Date(course.updatedAt).toLocaleDateString()
                                    : ''}
                            </span>
                        </div>
                        <OfferingsSummary
                            offerings={offeringsByCourse?.[course.id] || []}
                            loading={loadingOfferings}
                            onViewOfferings={onViewOfferings}
                        />
                        <div className="flex gap-2">
                            <Link
                                to={`/courses/${course.id}`}
                                className="flex-1 text-center border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Көрүү
                            </Link>
                            <Link
                                to={`/instructor/courses/edit/${course.id}`}
                                className="flex-1 text-center rounded-full px-4 py-2 text-sm bg-blue-600 text-white"
                            >
                                Өзгөртүү
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <EmptyState
                title="Азырынча курс жок"
                description="Алгачкы курсту түзүп студенттерди чакырыңыз."
                actionLabel="Курс түзүү"
                actionLink="/instructor/course/create"
            />
        )}

        {showDeliveryModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white dark:bg-[#161616] rounded-2xl shadow-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-edubot-dark dark:text-white">
                            Оффлайн / Онлайн түз эфир курс түзүү
                        </h3>
                        <button
                            type="button"
                            onClick={onCloseDeliveryModal}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Жабуу
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm mb-1">Курс түрү</label>
                            <select
                                name="courseType"
                                value={deliveryCourse.courseType}
                                onChange={onDeliveryCourseChange}
                                className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                            >
                                <option value="offline">Оффлайн</option>
                                <option value="online_live">Онлайн түз эфир</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Сабак тили</label>
                            <select
                                name="languageCode"
                                value={deliveryCourse.languageCode}
                                onChange={onDeliveryCourseChange}
                                className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                            >
                                <option value="ky">Кыргызча</option>
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm mb-1">Курс аталышы</label>
                            <input
                                name="title"
                                value={deliveryCourse.title}
                                onChange={onDeliveryCourseChange}
                                className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm mb-1">Сүрөттөмө</label>
                            <textarea
                                name="description"
                                value={deliveryCourse.description}
                                onChange={onDeliveryCourseChange}
                                className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Категория</label>
                            <select
                                name="categoryId"
                                value={deliveryCourse.categoryId}
                                onChange={onDeliveryCourseChange}
                                className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                            >
                                <option value="">Тандаңыз</option>
                                {deliveryCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Баасы (сом)</label>
                            <input
                                name="price"
                                type="number"
                                min="0"
                                value={deliveryCourse.price}
                                onChange={onDeliveryCourseChange}
                                className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCloseDeliveryModal}
                            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                        >
                            Жокко чыгаруу
                        </button>
                        <button
                            type="button"
                            onClick={onCreateDeliveryCourse}
                            disabled={creatingDeliveryCourse}
                            className="px-4 py-2 rounded bg-edubot-teal text-white disabled:opacity-60"
                        >
                            {creatingDeliveryCourse ? 'Түзүлүүдө...' : 'Түзүү'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const StudentsSection = ({
    total,
    courses,
    loadingCourses,
    selectedCourseId,
    onSelectCourse,
    courseStudents,
    courseMeta,
    loadingStudents,
    error,
    refreshCourses,
    studentsPage,
    onChangePage,
    search,
    onSearchChange,
    progressMin,
    progressMax,
    onProgressMinChange,
    onProgressMaxChange,
}) => {
    const fallbackCover =
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';
    const selectedCourse = courses.find((course) => course.id === selectedCourseId);
    const sortedStudents = (courseStudents || []).slice().sort((a, b) => {
        const aDate = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
        const bDate = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
        return bDate - aDate;
    });

    const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
    };

    const formatLastViewed = (student) => {
        if (!student.lastViewedLessonId) return '—';
        const rawTime = Number(student.lastVideoTime) || 0;
        const totalSeconds = rawTime > 1000 ? Math.round(rawTime / 1000) : Math.round(rawTime);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        const timeText = totalSeconds ? ` (${minutes}:${seconds})` : '';
        return `Сабак #${student.lastViewedLessonId}${timeText}`;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl p-6 shadow-sm flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-2xl font-semibold">Студенттер</h2>
                    <p className="text-gray-500 dark:text-[#a6adba] text-sm">
                        Курстарыңыздагы студенттерди курстар боюнча карап чыгыңыз.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <StatCard label="Жалпы студенттер" value={total ?? '—'} />
                    <button
                        type="button"
                        onClick={refreshCourses}
                        disabled={loadingCourses}
                        className="px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-[#a6adba] disabled:opacity-60"
                    >
                        Жаңыртуу
                    </button>
                </div>
            </div>

            {!selectedCourseId ? (
                <div className="rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold">Курстар</h3>
                            <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                Курсту тандап студенттердин тизмесин көрүңүз.
                            </p>
                        </div>
                    </div>
                    {error ? (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-100">
                            {error}
                        </div>
                    ) : null}
                    {loadingCourses && !courses.length ? (
                        <Loader fullScreen={false} />
                    ) : courses.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((course) => (
                                <button
                                    type="button"
                                    key={course.id || course.title}
                                    onClick={() => onSelectCourse(course.id)}
                                    className="text-left rounded-2xl border transition-shadow overflow-hidden border-gray-200 hover:shadow-sm"
                                >
                                    <div className="h-32 w-full overflow-hidden">
                                        <img
                                            src={course.coverImageUrl || fallbackCover}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold line-clamp-2">
                                                {course.title}
                                            </p>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${course.isPublished
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {course.isPublished
                                                    ? 'Жарыяланды'
                                                    : course.status || 'Каралууда'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-[#a6adba]">
                                            <span>{course.studentCount ?? 0} студент</span>
                                            <span>
                                                {course.createdAt
                                                    ? formatDate(course.createdAt)
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Курс табылган жок"
                            description="Алгач курстарды түзүп студенттерди чакырыңыз."
                            actionLabel="Курс түзүү"
                            actionLink="/instructor/course/create"
                        />
                    )}
                </div>
            ) : null}

            <div className="rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {courseMeta?.title || selectedCourse?.title || 'Студенттер тизмеси'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                            {courseMeta
                                ? `Сабактар: ${courseMeta.lessonCount ?? '—'} • Студенттер: ${courseMeta.studentCount ?? 0
                                }`
                                : 'Курс тандаңыз.'}
                        </p>
                    </div>
                    {selectedCourseId ? (
                        <button
                            type="button"
                            onClick={() => onSelectCourse(null)}
                            className="px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-[#a6adba]"
                        >
                            Курстарга кайтуу
                        </button>
                    ) : null}
                </div>

                {selectedCourseId ? (
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-[#a6adba]">
                                Издөө
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    onChangePage(1);
                                    onSearchChange(e.target.value);
                                }}
                                placeholder="Ат, email же телефон"
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] text-sm"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-[#a6adba]">
                                Прогресс кеминде (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={progressMin}
                                onChange={(e) => {
                                    onChangePage(1);
                                    onProgressMinChange(e.target.value);
                                }}
                                className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] text-sm"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-[#a6adba]">
                                Прогресс жогору (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={progressMax}
                                onChange={(e) => {
                                    onChangePage(1);
                                    onProgressMaxChange(e.target.value);
                                }}
                                className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] text-sm"
                            />
                        </div>
                    </div>
                ) : null}

                {error ? (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-100">
                        {error}
                    </div>
                ) : null}

                {loadingStudents ? (
                    <Loader fullScreen={false} />
                ) : !selectedCourseId ? (
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">Курс тандаңыз.</p>
                ) : sortedStudents.length ? (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-full bg-white dark:bg-[#0B0B0D] px-4">
                        <table className="table-auto w-full min-w-max divide-y divide-gray-200">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 dark:text-[#a6adba]">
                                    <th className="py-2 pr-4 pl-1">Студент</th>
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Телефон</th>
                                    <th className="py-2 pr-4">Катталды</th>
                                    <th className="py-2 pr-4">Процесс</th>
                                    <th className="py-2 pr-4">Статус</th>
                                    <th className="py-2 pr-4">Тесттер</th>
                                    <th className="py-2">Акыркы көргөн</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sortedStudents.map((student) => {
                                    const progress = Math.max(
                                        0,
                                        Math.min(100, Number(student.progressPercent || 0))
                                    );
                                    const tests = Array.isArray(student.tests) ? student.tests : [];
                                    return (
                                        <tr key={student.id} className="bg-white dark:bg-[#0B0B0D]">
                                            <td className="py-3 pr-4">
                                                <p className="font-medium">{student.fullName}</p>
                                            </td>
                                            <td className="py-3 pr-4 text-sm text-gray-600 dark:text-[#a6adba] break-words">
                                                {student.email || '—'}
                                            </td>
                                            <td className="py-3 pr-4 text-sm text-gray-600 dark:text-[#a6adba] whitespace-nowrap">
                                                {student.phoneNumber || '—'}
                                            </td>
                                            <td className="py-3 pr-4 text-sm text-gray-600 dark:text-[#a6adba] whitespace-nowrap">
                                                {formatDate(student.enrolledAt)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-28 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-2 bg-blue-600 rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-[#a6adba]">
                                                        {progress}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full ${student.completed
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                >
                                                    {student.completed ? 'Бүттү' : 'Уланууда'}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 align-top">
                                                {tests.length ? (
                                                    <div className="flex flex-col gap-1">
                                                        {tests.map((test) => (
                                                            <div
                                                                key={`${test.sectionId}-${test.lessonId}-${test.attemptedAt || ''}`}
                                                                className="text-xs flex items-center gap-2"
                                                            >
                                                                <span className="font-medium text-gray-800 dark:text-[#E8ECF3]">
                                                                    {test.lessonTitle}
                                                                </span>
                                                                <span
                                                                    className={`px-2 py-0.5 rounded-full ${test.passed
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                        }`}
                                                                >
                                                                    {test.passed
                                                                        ? 'Өттү'
                                                                        : 'Өтпөдү'}
                                                                </span>
                                                                {typeof test.score === 'number' && (
                                                                    <span className="text-gray-500 dark:text-[#a6adba]">
                                                                        {test.score}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-[#a6adba]">
                                                        Тест тапшыруулар жок
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-sm text-gray-600 dark:text-[#a6adba] whitespace-normal break-words leading-5">
                                                {formatLastViewed(student)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        Бул курста азырынча студент жок.
                    </p>
                )}

                {selectedCourseId && courseMeta?.totalPages > 1 ? (
                    <div className="flex items-center justify-between gap-3 pt-4 text-sm text-gray-600 dark:text-[#a6adba]">
                        <button
                            type="button"
                            onClick={() => onChangePage(Math.max(1, studentsPage - 1))}
                            disabled={studentsPage <= 1}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                        >
                            Алдыңкы
                        </button>
                        <span>
                            Барак {studentsPage} / {courseMeta.totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                onChangePage(Math.min(courseMeta.totalPages || 1, studentsPage + 1))
                            }
                            disabled={studentsPage >= (courseMeta.totalPages || 1)}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                        >
                            Кийинки
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const ProfileSection = ({ profile, expertiseTags, socialLinks }) => (
    <div className="rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
                <h2 className="text-2xl font-semibold">Профиль</h2>
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">Өзүңүз жөнүндө маалымат</p>
            </div>
            <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            >
                Профилди өзгөртүү
            </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141619] p-4">
            <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-2">Био / Өзүм жөнүндө</p>
            <p className="text-gray-800 dark:text-white whitespace-pre-line">
                {profile?.bio?.trim() || 'Маалымат кошула элек'}
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Наам</p>
                <p className="text-gray-800 dark:text-white">{profile?.title?.trim() || '—'}</p>
            </div>
            <div>
                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Тажрыйба</p>
                <p className="text-gray-800 dark:text-white">
                    {profile?.yearsOfExperience ? `${profile.yearsOfExperience} жыл` : '—'}
                </p>
            </div>
            <div>
                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Студенттер</p>
                <p className="text-gray-800 dark:text-white">{profile?.numberOfStudents ?? '—'}</p>
            </div>
        </div>
        <div>
            <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Экспертиза</p>
            {expertiseTags.length ? (
                <div className="flex flex-wrap gap-2">
                    {expertiseTags.map((tag) => (
                        <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-[#141619] text-gray-800 dark:text-white px-3 py-1 rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">Экспертиза кошула элек</p>
            )}
        </div>
        <div>
            <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">
                Социалдык тармактар
            </p>
            {socialLinks.length ? (
                <div className="flex flex-col gap-1">
                    {socialLinks.map(([key, value]) => (
                        <a
                            key={key}
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {value}
                        </a>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Социалдык шилтемелер кошула элек
                </p>
            )}
        </div>
    </div>
);

const AiSection = ({ aiCourses, totalCourses }) => (
    <div className="rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
                <h2 className="text-2xl font-semibold">EDU AI ассистент</h2>
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Курстарыңызда AI жардамчыны кантип колдонуп жатканыңызды көзөмөлдөңүз.
                </p>
            </div>
            <Link
                to="/instructor/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            >
                AI жөндөөлөрүнө өтүү
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="AI активдүү курстар" value={aiCourses.length} />
            <StatCard label="Жалпы курстар" value={totalCourses} />
            <StatCard label="AI жабдылбаган курстар" value={totalCourses - aiCourses.length} />
        </div>
        {aiCourses.length ? (
            <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    AI жардамчысы иштетилген курстар
                </p>
                {aiCourses.map((course) => (
                    <div
                        key={course.id}
                        className="flex items-center justify-between gap-3 border border-gray-200 rounded-2xl px-4 py-3"
                    >
                        <div>
                            <p className="font-semibold">{course.title}</p>
                            <p className="text-xs text-gray-500 dark:text-[#a6adba]">
                                {course.updatedAt
                                    ? `Жаңыртылды: ${new Date(course.updatedAt).toLocaleDateString()}`
                                    : 'Жаңыртуу маалыматы жок'}
                            </p>
                        </div>
                        <Link
                            to={`/instructor/courses/edit/${course.id}`}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Өзгөртүү
                        </Link>
                    </div>
                ))}
            </div>
        ) : (
            <EmptyState
                title="AI ассистенти иштетилген курс жок"
                description="Курс редакторунда AI ассистентти активдештирип, студенттерге реалдуу убакыттагы жардам сунуштаңыз."
                actionLabel="Курс түзүү"
                actionLink="/instructor/course/create"
            />
        )}
        <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl p-4 text-sm text-gray-700">
            <p className="font-semibold">Кантип пайдалансам болот?</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Курс редакторунда AI ассистентти активдештириңиз.</li>
                <li>Админ панелинен жеке промптторду кошуңуз.</li>
                <li>Студенттерге AI чат аркылуу суроолорун тез берүү мүмкүнчүлүгүн түзүңүз.</li>
            </ul>
        </div>
    </div>
);

const formatDateTimeForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

const OfferingsSection = ({ courses, offerings, loading, refreshOfferings }) => {
    const getInitialForm = useCallback(
        (base = null) => ({
            courseId: base?.courseId
                ? String(base.courseId)
                : courses[0]?.id
                    ? String(courses[0].id)
                    : '',
            title: base?.title || '',
            modality: base?.modality || 'ONLINE',
            visibility: base?.visibility || 'PRIVATE',
            startAt: base?.startAt ? formatDateTimeForInput(base.startAt) : '',
            endAt: base?.endAt ? formatDateTimeForInput(base.endAt) : '',
            scheduleNote: base?.scheduleNote || '',
            scheduleBlocks: base?.scheduleBlocks
                ? base.scheduleBlocks.map((block) => ({
                    day: block.day || '',
                    startTime: block.startTime || '',
                    endTime: block.endTime || '',
                }))
                : [],
            capacity: base?.capacity ? String(base.capacity) : '',
            priceOverride: base?.priceOverride || '',
            companyId: base?.companyId ? String(base.companyId) : '',
            status: base?.status || 'DRAFT',
            isFeatured: Boolean(base?.isFeatured),
        }),
        [courses]
    );

    const [filterCourseId, setFilterCourseId] = useState('all');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('upcoming');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingOffering, setEditingOffering] = useState(null);
    const [createForm, setCreateForm] = useState(() => getInitialForm());
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollOffering, setEnrollOffering] = useState(null);
    const [enrollForm, setEnrollForm] = useState({ userId: '', discountPercentage: '' });
    const [enrolling, setEnrolling] = useState(false);
    const [enrollStudents, setEnrollStudents] = useState([]);
    const [loadingEnrollStudents, setLoadingEnrollStudents] = useState(false);
    const [enrollUserSearch, setEnrollUserSearch] = useState('');
    const [enrollStudentOptions, setEnrollStudentOptions] = useState([]);
    const [loadingUserOptions, setLoadingUserOptions] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    useEffect(() => {
        setCreateForm((prev) => ({
            ...prev,
            courseId: courses[0]?.id ? String(courses[0].id) : '',
        }));
    }, [courses]);

    const summary = useMemo(() => {
        const now = Date.now();
        const upcoming = offerings.filter(
            (offering) => offering.startAt && new Date(offering.startAt).getTime() >= now
        );
        const past = offerings.length - upcoming.length;
        const company = offerings.filter((offering) => offering.companyId);
        const publicOnes = offerings.filter((offering) => offering.visibility === 'PUBLIC');
        const statusCounts = offerings.reduce((acc, offering) => {
            const key = offering.status || 'DRAFT';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return {
            total: offerings.length,
            upcoming: upcoming.length,
            past,
            company: company.length,
            public: publicOnes.length,
            active: statusCounts.ACTIVE || 0,
            draft: statusCounts.DRAFT || 0,
            completed: (statusCounts.COMPLETED || 0) + (statusCounts.ARCHIVED || 0),
        };
    }, [offerings]);

    const filteredOfferings = useMemo(() => {
        return offerings.filter((offering) => {
            if (filterCourseId !== 'all' && offering.course.id !== Number(filterCourseId)) {
                return false;
            }
            if (statusFilter !== 'all') {
                const now = Date.now();
                const start = offering.startAt ? new Date(offering.startAt).getTime() : null;
                if (statusFilter === 'upcoming' && start && start < now) return false;
                if (statusFilter === 'past' && start && start >= now) return false;
            }
            if (search.trim()) {
                const term = search.toLowerCase();
                const haystack =
                    `${offering.title || ''} ${offering.course.title || ''} ${offering.company?.name || ''}`.toLowerCase();
                return haystack.includes(term);
            }
            return true;
        });
    }, [offerings, filterCourseId, statusFilter, search]);

    const handleOpenModal = (mode, offering = null) => {
        setModalMode(mode);
        setEditingOffering(offering);
        setCreateForm(getInitialForm(offering));
        setShowCreateModal(true);
    };

    const handleCreateOffering = async () => {
        if (!createForm.courseId) {
            toast.error('Курс тандаңыз');
            return;
        }
        setCreating(true);
        try {
            const payload = {
                courseId: Number(createForm.courseId),
                title: createForm.title.trim() || null,
                modality: createForm.modality,
                visibility: createForm.visibility,
                startAt: createForm.startAt
                    ? new Date(createForm.startAt).toISOString()
                    : undefined,
                endAt: createForm.endAt ? new Date(createForm.endAt).toISOString() : undefined,
                scheduleNote: createForm.scheduleNote.trim() || null,
                scheduleBlocks:
                    createForm.scheduleBlocks && createForm.scheduleBlocks.length
                        ? createForm.scheduleBlocks.filter(
                            (block) => block.day && block.startTime && block.endTime
                        )
                        : null,
                capacity: createForm.capacity ? Number(createForm.capacity) : null,
                priceOverride: createForm.priceOverride.trim() || null,
                companyId: createForm.companyId ? Number(createForm.companyId) : undefined,
                status: createForm.status,
                isFeatured: Boolean(createForm.isFeatured),
            };
            if (modalMode === 'edit' && editingOffering) {
                const patch = { ...payload };
                delete patch.courseId;
                await updateOffering(editingOffering.id, patch);
                toast.success('Offering жаңыртылды');
            } else {
                await createOffering(payload);
                toast.success('Offering ийгиликтүү түзүлдү');
            }
            setShowCreateModal(false);
            setCreateForm(getInitialForm());
            setEditingOffering(null);
            refreshOfferings();
        } catch (error) {
            console.error('Failed to create offering', error);
            const message =
                error.response?.data?.message || error.message || 'Offering түзүүдө ката кетти';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setCreating(false);
        }
    };

    const loadOfferingStudents = useCallback(async (offering) => {
        setLoadingEnrollStudents(true);
        try {
            const studentResponse = await fetchCourseStudents(offering.course.id, {
                page: 1,
                limit: 100,
            });
            const list =
                studentResponse?.students
                    ?.filter(
                        (student) => Number(student.offeringId) === Number(offering.id)
                    )
                    .map((student) => ({
                        id: student.id,
                        name: student.fullName || student.email || 'Студент',
                        email: student.email || '—',
                        enrolledAt: student.enrolledAt,
                    })) || [];
            setEnrollStudents(list);
        } catch (error) {
            console.error('Failed to load offering students', error);
            toast.error('Студенттердин тизмесин жүктөө мүмкүн болбoду');
            setEnrollStudents([]);
        } finally {
            setLoadingEnrollStudents(false);
        }
    }, []);
    const handleOpenEnrollModal = (offering) => {
        setEnrollOffering(offering);
        setEnrollForm({ userId: '', discountPercentage: '' });
        setEnrollUserSearch('');
        setEnrollStudentOptions([]);
        setShowEnrollModal(true);
        loadOfferingStudents(offering);
    };

    useEffect(() => {
        if (!showEnrollModal) return;
        if (!enrollUserSearch || enrollUserSearch.trim().length < 2) {
            setEnrollStudentOptions([]);
            setLoadingUserOptions(false);
            return;
        }
        let cancelled = false;
        setLoadingUserOptions(true);
        fetchUsers({
            page: 1,
            limit: 10,
            search: enrollUserSearch.trim(),
            role: 'student',
        })
            .then((res) => {
                if (cancelled) return;
                const rows = res?.data || res?.items || [];
                const options = rows.map((user) => ({
                    id: user.id,
                    name: user.fullName || user.email || `ID: ${user.id}`,
                    email: user.email || '',
                }));
                setEnrollStudentOptions(options);
                if (
                    options.length &&
                    !options.some((opt) => String(opt.id) === enrollForm.userId)
                ) {
                    setEnrollForm((prev) => ({ ...prev, userId: String(options[0].id) }));
                }
            })
            .catch((error) => {
                console.error('Failed to fetch users', error);
                if (!cancelled) {
                    toast.error('Студенттерди издөөдө ката кетти');
                    setEnrollStudentOptions([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingUserOptions(false);
            });
        return () => {
            cancelled = true;
        };
    }, [showEnrollModal, enrollUserSearch, enrollForm.userId]);

    const handleEnrollStudent = async () => {
        if (!enrollOffering) return;
        const userIdValue = Number(enrollForm.userId);
        if (!userIdValue || Number.isNaN(userIdValue)) {
            toast.error('Колдонуучу ID туура эмес');
            return;
        }
        setEnrolling(true);
        try {
            await enrollUserInCourse(userIdValue, enrollOffering.course.id, {
                offeringId: enrollOffering.id,
                discountPercentage: enrollForm.discountPercentage
                    ? Number(enrollForm.discountPercentage)
                    : undefined,
            });
            toast.success('Студент offeringге кошулду');
            setShowEnrollModal(false);
            setEnrollOffering(null);
            setEnrollForm({ userId: '', discountPercentage: '' });
            refreshOfferings();
        } catch (error) {
            console.error('Failed to enroll student', error);
            const message =
                error.response?.data?.message ||
                error.message ||
                'Студентти offeringге кошууда ката кетти';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400">
                        Offering башкаруу
                    </p>
                    <h2 className="text-2xl font-bold">Курс сунуштары</h2>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        Курстарыңызга арналган корпоративдик же атайын сунуштарды көзөмөлдөңүз.
                    </p>
                </div>
                <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                    onClick={() => handleOpenModal('create')}
                >
                    Offering түзүү
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Бардык offeringдер" value={summary.total} />
                <StatCard label="Жакынкы offeringдер" value={summary.upcoming} />
                <StatCard label="Компаниялар үчүн" value={summary.company} />
                <StatCard label="Публичный offeringдер" value={summary.public} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Активдүү" value={summary.active} />
                <StatCard label="Долбоор (Draft)" value={summary.draft} />
                <StatCard label="Жабылган/аякталган" value={summary.completed} />
            </div>

            <div className="rounded-3xl p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm text-gray-600 dark:text-[#a6adba]">
                        <FiFilter />
                        Фильтр
                    </div>
                    <select
                        value={filterCourseId}
                        onChange={(e) => setFilterCourseId(e.target.value)}
                        className="border rounded-full px-3 py-1 text-sm bg-white dark:bg-[#222222]"
                    >
                        <option value="all">Бардык курстар</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-full px-3 py-1 text-sm bg-white dark:bg-[#222222]"
                    >
                        <option value="upcoming">Жакынкы</option>
                        <option value="past">Өткөн</option>
                        <option value="all">Баары</option>
                    </select>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-2xl px-4 py-2 text-sm w-full md:w-64 text-gray-500 dark:text-[#a6adba] bg-white dark:bg-[#222222]"
                    placeholder="Offering боюнча издөө..."
                />
            </div>

            <div className="rounded-3xl p-6 shadow-sm">
                {loading ? (
                    <Loader fullScreen={false} />
                ) : filteredOfferings.length ? (
                    <div className="space-y-4">
                        {filteredOfferings.map((offering) => (
                            <OfferingCard
                                key={offering.id}
                                offering={offering}
                                onEdit={(item) => handleOpenModal('edit', item)}
                                onEnroll={handleOpenEnrollModal}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Offeringдер табылган жок"
                        description="Курстарыңыз үчүн атайын сунуштарды түзүп баштаңыз."
                        actionLabel="Курс түзүү"
                        actionLink="/instructor/course/create"
                    />
                )}
            </div>

            {showCreateModal && (
                <CreateOfferingModal
                    courses={courses}
                    form={createForm}
                    onChange={(field, value) =>
                        setCreateForm((prev) => ({
                            ...prev,
                            [field]: value,
                        }))
                    }
                    onClose={() => {
                        setShowCreateModal(false);
                        setCreateForm(getInitialForm());
                        setEditingOffering(null);
                    }}
                    onSubmit={handleCreateOffering}
                    creating={creating}
                    mode={modalMode}
                />
            )}
            {showEnrollModal && enrollOffering && (
                <EnrollStudentModal
                    offering={enrollOffering}
                    form={enrollForm}
                    onChange={(field, value) =>
                        setEnrollForm((prev) => ({
                            ...prev,
                            [field]: value,
                        }))
                    }
                    onClose={() => {
                        setShowEnrollModal(false);
                        setEnrollOffering(null);
                        setEnrollUserSearch('');
                        setEnrollStudentOptions([]);
                    }}
                    onSubmit={handleEnrollStudent}
                    enrolling={enrolling}
                    students={enrollStudents}
                    loadingStudents={loadingEnrollStudents}
                    studentOptions={enrollStudentOptions}
                    userSearch={enrollUserSearch}
                    onSearchChange={setEnrollUserSearch}
                    loadingUserOptions={loadingUserOptions}
                    showDropdown={showUserDropdown}
                    setShowDropdown={setShowUserDropdown}
                />
            )}
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="border border-gray-200 rounded-2xl p-4">
        <p className="text-sm text-gray-500 dark:text-[#a6adba]">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
);

const QuickActionCard = ({ title, description, link, buttonText, accent = 'blue' }) => {
    const accentClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        amber: 'bg-amber-500 hover:bg-amber-600',
    }[accent];

    return (
        <div className="rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">{description}</p>
            </div>
            <Link
                to={link}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-white text-sm font-semibold transition ${accentClasses}`}
            >
                {buttonText}
            </Link>
        </div>
    );
};

const EmptyState = ({ title, description, actionLabel, actionLink }) => (
    <div className="flex flex-col items-center text-center gap-3 border border-dashed border-gray-300 rounded-2xl p-8">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-gray-500 dark:text-[#a6adba]">{description}</p>
        {actionLabel && actionLink && (
            <Link to={actionLink} className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm">
                {actionLabel}
            </Link>
        )}
    </div>
);

const OfferingsSummary = ({ offerings, loading, onViewOfferings }) => {
    if (loading) {
        return <Loader fullScreen={false} />;
    }
    if (!offerings.length) {
        return (
            <div className="border border-dashed border-gray-200 rounded-2xl p-3 text-xs text-gray-500 dark:text-[#a6adba] flex flex-col gap-2">
                <span>Offering түзүлө элек.</span>
                <button
                    type="button"
                    onClick={onViewOfferings}
                    className="text-blue-600 hover:underline text-left"
                >
                    Offering түзүү
                </button>
            </div>
        );
    }
    const upcoming = offerings
        .filter((offering) => offering.startAt)
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    return (
        <div className="border border-gray-100 rounded-2xl p-3 text-xs text-gray-600 dark:text-[#a6adba] flex flex-col gap-1">
            <span className="font-semibold text-gray-700">{offerings.length} offering</span>
            {upcoming[0] && (
                <span>Жакынкысы: {new Date(upcoming[0].startAt).toLocaleDateString()}</span>
            )}
            <button
                type="button"
                onClick={onViewOfferings}
                className="text-blue-600 hover:underline text-xs text-left"
            >
                Offering'дерди башкаруу
            </button>
        </div>
    );
};

const CreateOfferingModal = ({ courses, form, onChange, onClose, onSubmit, creating, mode }) => {
    const modalityDescriptions = {
        ONLINE: 'Zoom же Google Meet аркылуу жандуу сабак.',
        OFFLINE: 'Офлайн тренинг – жайгашкан жерди көрсөтүңүз.',
        HYBRID: 'Онлайн жана офлайн аралаш формат.',
    };
    const scheduleBlocks = form.scheduleBlocks || [];
    const handleBlockChange = (index, field, value) => {
        const next = scheduleBlocks.map((block, idx) =>
            idx === index ? { ...block, [field]: value } : block
        );
        onChange('scheduleBlocks', next);
    };
    const handleBlockAdd = () => {
        onChange('scheduleBlocks', [...scheduleBlocks, { day: '', startTime: '', endTime: '' }]);
    };
    const handleBlockRemove = (index) => {
        onChange(
            'scheduleBlocks',
            scheduleBlocks.filter((_, idx) => idx !== index)
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="rounded-3xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-gray-400">
                            {mode === 'edit' ? 'Offering өзгөртүү' : 'Жаңы offering'}
                        </p>
                        <h2 className="text-2xl font-semibold">
                            {mode === 'edit' ? 'Offeringди өзгөртүү' : 'Курс сунушун түзүү'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 dark:text-[#a6adba] hover:text-gray-700"
                    >
                        Жабуу
                    </button>
                </div>
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Курс
                            </label>
                            <select
                                value={form.courseId}
                                onChange={(e) => onChange('courseId', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                required
                            >
                                <option value="">Курс тандаңыз</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Offering аталышы (опция)
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => onChange('title', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Мисалы: Жандуу интенсив 15-апрел"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Модалдуулук
                            </label>
                            <select
                                value={form.modality}
                                onChange={(e) => onChange('modality', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            >
                                <option value="ONLINE">Онлайн (Zoom/Meet)</option>
                                <option value="OFFLINE">Офлайн (жандуу)</option>
                                <option value="HYBRID">Гибрид</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                                {modalityDescriptions[form.modality]}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Көрүнүү
                            </label>
                            <select
                                value={form.visibility}
                                onChange={(e) => onChange('visibility', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            >
                                <option value="PRIVATE">Жабык</option>
                                <option value="PUBLIC">Публичный (жалпы үчүн)</option>
                                <option value="UNLISTED">Сырткы шилтеме боюнча</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Башталышы
                            </label>
                            <input
                                type="datetime-local"
                                value={form.startAt}
                                onChange={(e) => onChange('startAt', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Аяктоосу
                            </label>
                            <input
                                type="datetime-local"
                                value={form.endAt}
                                onChange={(e) => onChange('endAt', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Статус
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => onChange('status', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            >
                                <option value="DRAFT">Draft (жарыяланбаган)</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a6adba] mt-6">
                            <input
                                type="checkbox"
                                checked={form.isFeatured}
                                onChange={(e) => onChange('isFeatured', e.target.checked)}
                            />
                            Featured offering катары белгилөө
                        </label>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                            Жайгашкан жери / Zoom шилтемеси / Расписаниеси
                        </label>
                        <textarea
                            value={form.scheduleNote}
                            onChange={(e) => onChange('scheduleNote', e.target.value)}
                            className="mt-1 w-full border rounded-2xl px-3 py-2 min-h-[100px]"
                            placeholder="Мисалы: Бишкек, Бизнес борбор 3-кабат. Же: Zoom — https://zoom.us/..."
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Даяр расписание блоктору
                            </label>
                            <button
                                type="button"
                                onClick={handleBlockAdd}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Блок кошуу
                            </button>
                        </div>
                        {scheduleBlocks.length ? (
                            <div className="mt-2 space-y-2">
                                {scheduleBlocks.map((block, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-12 gap-2 items-center border border-gray-100 rounded-2xl px-3 py-2"
                                    >
                                        <input
                                            type="text"
                                            className="col-span-4 border rounded-xl px-2 py-1 text-sm"
                                            placeholder="Күн (мисалы: Дүйшөмбү)"
                                            value={block.day}
                                            onChange={(e) =>
                                                handleBlockChange(index, 'day', e.target.value)
                                            }
                                        />
                                        <input
                                            type="time"
                                            className="col-span-3 border rounded-xl px-2 py-1 text-sm"
                                            value={block.startTime}
                                            onChange={(e) =>
                                                handleBlockChange(
                                                    index,
                                                    'startTime',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            type="time"
                                            className="col-span-3 border rounded-xl px-2 py-1 text-sm"
                                            value={block.endTime}
                                            onChange={(e) =>
                                                handleBlockChange(index, 'endTime', e.target.value)
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="col-span-2 text-xs text-red-500"
                                            onClick={() => handleBlockRemove(index)}
                                        >
                                            Өчүрүү
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                                Жума күндөрү жана убакыттарын кошуу үчүн "Блок кошуу" баскычын
                                басыңыз.
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Капасити (опция)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.capacity}
                                onChange={(e) => onChange('capacity', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Мисалы: 25"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Бааны өзгөртүү (опция)
                            </label>
                            <input
                                type="text"
                                value={form.priceOverride}
                                onChange={(e) => onChange('priceOverride', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Мисалы: 4500 сом"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Компания ID (опция)
                            </label>
                            <input
                                type="text"
                                value={form.companyId}
                                onChange={(e) => onChange('companyId', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Компания бириктирүү керек болсо"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-full border text-sm"
                            onClick={onClose}
                            disabled={creating}
                        >
                            Жабуу
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm disabled:opacity-60"
                            disabled={creating}
                        >
                            {creating
                                ? 'Сакталууда...'
                                : mode === 'edit'
                                    ? 'Өзгөртүүлөрдү сактоо'
                                    : 'Offering түзүү'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OfferingCard = ({ offering, onEdit, onEnroll }) => {
    const title = offering.title || `${offering.course.title} Offering`;
    const start = offering.startAt ? new Date(offering.startAt).toLocaleString() : 'Белгисиз';
    const end = offering.endAt ? new Date(offering.endAt).toLocaleString() : null;
    const modality = offering.modality || 'ONLINE';
    const modalityLabel =
        modality === 'OFFLINE' ? 'Офлайн' : modality === 'HYBRID' ? 'Гибрид' : 'Онлайн';
    const capacity = offering.capacity ? `${offering.capacity} орун` : 'Орун чектелбеген';
    const visibility = offering.visibility || 'PRIVATE';
    const companyName = offering.company?.name;
    const status = offering.status || 'DRAFT';
    const statusStyles = {
        ACTIVE: 'bg-green-100 text-green-700',
        DRAFT: 'bg-gray-200 text-gray-700',
        COMPLETED: 'bg-blue-100 text-blue-700',
        ARCHIVED: 'bg-orange-100 text-orange-700',
    };
    return (
        <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-semibold">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        Курс: {offering.course.title}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${visibility === 'PUBLIC'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 dark:text-[#a6adba]'
                        }`}
                >
                    {visibility === 'PUBLIC' ? 'Публичный' : 'Жабык'}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-[#a6adba]">
                <div className="flex items-center gap-2">
                    <FiCalendar className="text-gray-400" />
                    <span>{start}</span>
                    {end && <span className="text-gray-400">— {end}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <FiGlobe className="text-gray-400" />
                    <span>{modalityLabel}</span>
                </div>
                <div>
                    <p>{capacity}</p>
                    {companyName && (
                        <p className="text-xs text-gray-500 dark:text-[#a6adba]">{companyName}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span
                    className={`px-3 py-1 rounded-full font-semibold ${statusStyles[status] || 'bg-gray-200 text-gray-700'}`}
                >
                    {status}
                </span>
                {offering.isFeatured && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                        Featured
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-[#a6adba]">
                <span>Катталган: {offering.enrolledCount ?? 0}</span>
                {offering.seatsRemaining != null && (
                    <span>Калган орун: {offering.seatsRemaining}</span>
                )}
            </div>
            {offering.scheduleBlocks?.length ? (
                <div className="text-sm text-gray-600 dark:text-[#a6adba]">
                    <p className="font-semibold text-gray-700 mb-1">Жүгүртмө:</p>
                    <ul className="space-y-1">
                        {offering.scheduleBlocks.map((block, idx) => (
                            <li key={idx}>
                                {block.day}: {block.startTime} – {block.endTime}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : offering.scheduleNote ? (
                <p className="text-sm text-gray-600 dark:text-[#a6adba]">
                    Белгилей кетүү: {offering.scheduleNote}
                </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
                <Link
                    to={`/instructor/courses/edit/${offering.course.id}`}
                    className="px-4 py-2 rounded-full border text-sm"
                >
                    Курсту өзгөртүү
                </Link>
                <button
                    type="button"
                    className="px-4 py-2 rounded-full border text-sm"
                    onClick={() => onEdit(offering)}
                >
                    Offeringди өзгөртүү
                </button>
                <button
                    type="button"
                    className="px-4 py-2 rounded-full border text-sm text-green-700"
                    onClick={() => onEnroll(offering)}
                >
                    Студент кошуу
                </button>
                <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                >
                    Шилтеме көчүрүү
                </button>
            </div>
        </div>
    );
};

const EnrollStudentModal = ({
    offering,
    form,
    onChange,
    onClose,
    onSubmit,
    enrolling,
    students,
    loadingStudents,
    studentOptions,
    userSearch,
    onSearchChange,
    loadingUserOptions,
    showDropdown,
    setShowDropdown,
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
        <div className="rounded-3xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400">Студент кошуу</p>
                    <h2 className="text-2xl font-semibold">{offering.course.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        {offering.title || 'Offering'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 dark:text-[#a6adba] hover:text-gray-700"
                >
                    Жабуу
                </button>
            </div>
            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                        Студентти издөө жана тандоо
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="mt-1 w-full border rounded-2xl px-3 py-2"
                            placeholder="Аты же email (кеминде 2 тамга)"
                            onFocus={() => setShowDropdown(true)}
                        />
                        {showDropdown && studentOptions?.length > 0 && (
                            <div className="absolute mt-1 w-full border border-gray-200 rounded-2xl shadow-lg max-h-48 overflow-auto z-10">
                                {studentOptions.map((student) => (
                                    <button
                                        key={student.id}
                                        type="button"
                                        className={`w-full text-left px-3 py-2 text-sm ${String(student.id) === form.userId
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => {
                                            onChange('userId', String(student.id));
                                            onSearchChange(student.name || student.email || '');
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <span className="font-medium">{student.name}</span>
                                        {student.email && (
                                            <span className="text-xs text-gray-500 dark:text-[#a6adba] ml-2">
                                                {student.email}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {loadingUserOptions && <Loader fullScreen={false} />}
                    {!studentOptions?.length && userSearch.length >= 2 && !loadingUserOptions && (
                        <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-2">
                            Студент табылган жок.
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                        {form.userId
                            ? `Тандалган студент ID: ${form.userId}`
                            : 'Кеминде эки тамга издөө үчүн жазыңыз жана тизмеден тандаңыз.'}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                        Скидка % (опция)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.discountPercentage}
                        onChange={(e) => onChange('discountPercentage', e.target.value)}
                        className="mt-1 w-full border rounded-2xl px-3 py-2"
                        placeholder="Мисалы: 10"
                    />
                </div>
                <div className="text-xs text-gray-500 dark:text-[#a6adba]">
                    Offering ID: {offering.id}. Орундар:{' '}
                    {offering.capacity != null
                        ? `${offering.enrolledCount ?? 0}/${offering.capacity}`
                        : 'Чектелбеген'}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-full border text-sm"
                        onClick={onClose}
                        disabled={enrolling}
                    >
                        Жабуу
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-full bg-green-600 text-white text-sm disabled:opacity-60"
                        disabled={enrolling}
                    >
                        {enrolling ? 'Кошууда...' : 'Студент кошуу'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default InstructorDashboard;

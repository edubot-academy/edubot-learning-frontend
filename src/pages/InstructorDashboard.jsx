import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import SkipNavigation from '../components/ui/SkipNavigation';
import InstructorDashboardTabs from '../components/ui/InstructorDashboardTabs';
import useDashboardSwipeGestures from '../hooks/useDashboardSwipeGestures';
import {
    fetchInstructorProfile,
    listOfferingsForCourse,
    fetchInstructorStudentCourses,
    fetchCourseStudents,
    createCourse,
    fetchCategories,
    fetchInstructorCourses,
} from '@services/api';
import toast from 'react-hot-toast';
import Loader from '../shared/ui/Loader';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import AttendancePage from './Attendance';
import SessionWorkspacePage from './SessionWorkspace';
import InstructorAnalyticsPage from './InstructorAnalytics';
import InternalLeaderboard from './InternalLeaderboard';
import InstructorHomework from './InstructorHomework';
import {
    InstructorDashboardHeader,
    InstructorOverviewSection,
    CoursesSection,
    StudentsSection,
    AiSection,
    OfferingsSection,
    ChatTab,
    NAV_ITEMS,
} from '@features/instructor-dashboard';

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

    const analyticsLink = useMemo(() => {
        const to = new Date();
        const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
        return `/instructor/analytics?from=${from.toISOString().slice(0, 10)}&to=${to
            .toISOString()
            .slice(0, 10)}`;
    }, []);

    const courses = useMemo(
        () => (courseList.length ? courseList : profile?.courses || []),
        [courseList, profile]
    );

    const aiCourses = useMemo(
        () => courses.filter((course) => course.aiAssistantEnabled),
        [courses]
    );

    const publishedCount = useMemo(
        () => courses.filter((course) => course.isPublished).length,
        [courses]
    );

    const pendingCount = useMemo(
        () => courses.filter((course) => !course.isPublished).length,
        [courses]
    );

    const aiEnabledCount = aiCourses.length;

    const offerings = useMemo(
        () => courses.flatMap((course) => offeringsByCourse[course.id] || []),
        [courses, offeringsByCourse]
    );

    const handleSwipeLeft = useCallback(() => {
        if (window.innerWidth < 768) setSidebarOpen(false);
    }, []);

    const handleSwipeRight = useCallback(() => {
        if (window.innerWidth < 768) setSidebarOpen(true);
    }, []);

    useDashboardSwipeGestures({
        onSwipeLeft: handleSwipeLeft,
        onSwipeRight: handleSwipeRight,
        enabled: typeof window !== 'undefined' && window.innerWidth < 768,
    });

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
                const data = await fetchInstructorCourses({ status: 'approved' });
                setCourseList(Array.isArray(data?.courses) ? data.courses : []);
            } catch (error) {
                console.error('Failed to load instructor courses', error);
                toast.error('Инструктор курстарын жүктөө мүмкүн болбоду');
            } finally {
                setLoadingCourses(false);
            }
        };

        loadCourses();
    }, [user]);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'm': {
                        e.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.focus();
                            mainContent.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                    case 'n': {
                        e.preventDefault();
                        const navigation = document.querySelector('nav[role="navigation"]');
                        if (navigation) {
                            navigation.focus();
                            navigation.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                    case 's': {
                        e.preventDefault();
                        const searchInput = document.querySelector(
                            'input[placeholder*="издөө" i], input[type="search"]'
                        );
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                    default:
                        break;
                }
            }

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const sidebarItems = document.querySelectorAll('[role="menuitem"]');
                const currentIndex = Array.from(sidebarItems).findIndex(
                    (item) => item === document.activeElement
                );

                if (currentIndex !== -1) {
                    e.preventDefault();
                    const newIndex =
                        e.key === 'ArrowLeft'
                            ? currentIndex > 0
                                ? currentIndex - 1
                                : sidebarItems.length - 1
                            : currentIndex < sidebarItems.length - 1
                                ? currentIndex + 1
                                : 0;

                    sidebarItems[newIndex]?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

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

    useEffect(() => {
        const tabFromQuery = searchParams.get('tab');
        const resolvedTab =
            tabFromQuery && NAV_ITEMS.some((item) => item.id === tabFromQuery)
                ? tabFromQuery
                : 'overview';

        if (resolvedTab !== activeTab) {
            setActiveTab(resolvedTab);
        }
    }, [searchParams, activeTab]);

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
                return list.some((course) => course.id === prev) ? prev : null;
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
        if (!courses.length) {
            setOfferingsByCourse({});
            return;
        }
        loadOfferingsForCourses(courses);
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

            const data = await fetchInstructorCourses({ status: 'approved' });
            setCourseList(Array.isArray(data?.courses) ? data.courses : []);
        } catch (error) {
            console.error('Failed to create delivery course', error);
            toast.error('Курсту түзүүдө ката кетти.');
        } finally {
            setCreatingDeliveryCourse(false);
        }
    };

    const isTabLoading =
        loadingStudentCourses || loadingCourseStudents || loadingOfferings;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sessions':
                return <SessionWorkspacePage />;
            case 'attendance':
                return <AttendancePage embedded />;
            case 'analytics':
                return <InstructorAnalyticsPage />;
            case 'leaderboard':
                return <InternalLeaderboard />;
            case 'homework':
                return <InstructorHomework />;
            case 'chat':
                return <ChatTab />;
            case 'notifications':
                return <NotificationsTab />;
            case 'courses':
                return (
                    <CoursesSection
                        courses={courses}
                        loading={loadingCourses}
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
                        progressMin={progressMin}
                        progressMax={progressMax}
                        onProgressFilterChange={setProgressMin}
                        onStudentSearchChange={setStudentSearch}
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
                        refreshOfferings={() => {
                            if (courses.length) loadOfferingsForCourses(courses);
                        }}
                    />
                );
            case 'overview':
            default:
                return (
                    <InstructorOverviewSection
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

    const renderContent = () => {
        const isInitialLoading =
            (loadingProfile && !profile) || (loadingCourses && !courses.length);
        const hasDataLoaded = !!profile || courses.length > 0;

        if (isInitialLoading && !hasDataLoaded) {
            return <Loader fullScreen={false} />;
        }

        return (
            <div className="relative">
                {renderTabContent()}
                {isTabLoading && hasDataLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-gray-900/50">
                        <div className="rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'instructor') return <Navigate to="/" replace />;

    return (
        <div className="min-h-screen pt-24">
            <SkipNavigation />

            <InstructorDashboardTabs
                items={NAV_ITEMS}
                activeId={activeTab}
                onSelect={handleTabSelect}
            />

            <div className="mx-auto max-w-6xl px-2 pb-12 sm:px-4 md:hidden">
                <main
                    className="w-full space-y-4"
                    id="main-content"
                    tabIndex={-1}
                    role="main"
                    aria-label="Инструктор dashboard мазмуну"
                >
                    <InstructorDashboardHeader
                        user={user}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        analyticsLink={analyticsLink}
                    />
                    {renderContent()}
                </main>
            </div>

            <div className="mx-auto hidden max-w-6xl px-2 pb-12 sm:px-4 md:block md:max-w-7xl md:px-6">
                <div className="flex gap-0 md:gap-6">
                    <DashboardSidebar
                        items={NAV_ITEMS}
                        activeId={activeTab}
                        onSelect={handleTabSelect}
                        isOpen={sidebarOpen}
                        onToggle={setSidebarOpen}
                        className="hidden md:flex md:flex-shrink-0"
                    />

                    <main
                        className="w-full space-y-4 md:min-w-0 md:flex-1 md:space-y-6"
                        id="main-content"
                        tabIndex={-1}
                        role="main"
                        aria-label="Инструктор dashboard мазмуну"
                    >
                        <InstructorDashboardHeader
                            user={user}
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                            analyticsLink={analyticsLink}
                        />
                        {renderContent()}
                    </main>
                </div>
            </div>

            <FloatingActionButton role="instructor" />
        </div>
    );
};

export default InstructorDashboard;
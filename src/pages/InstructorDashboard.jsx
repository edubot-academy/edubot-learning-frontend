import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
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
import Loader from '@shared/ui/Loader';
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
    ProfileSection,
    AiSection,
    OfferingsSection,
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
        const toIso = to.toISOString().slice(0, 10);
        const fromIso = from.toISOString().slice(0, 10);
        return `/instructor/analytics?from=${fromIso}&to=${toIso}`;
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
                const allCourses = Array.isArray(data?.courses) ? data.courses : [];
                setCourseList(allCourses);
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
    }, [listOfferingsForCourse]);

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

    const renderContent = () => {
        if ((loadingProfile && !profile) || (loadingCourses && !courses.length)) {
            return <Loader fullScreen={false} />;
        }

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
                return (
                    <AiSection
                        aiCourses={aiCourses}
                        totalCourses={courses.length}
                    />
                );

            case 'offerings':
                return (
                    <OfferingsSection
                        courses={courses}
                        offerings={offerings}
                        loading={loadingOfferings}
                        refreshOfferings={() => {
                            if (courses.length) {
                                loadOfferingsForCourses(courses);
                            }
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

    if (!user || user.role !== 'instructor') {
        return <Navigate to="/" replace />;
    }

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
    );
};


export default InstructorDashboard;
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import {
    fetchCourses,
    fetchInstructorProfile,
    fetchCourseDetails,
    fetchUsers,
    listOfferingsForCourse,
    createOffering,
    updateOffering,
    enrollUserInCourse,
} from '@services/api';
import toast from 'react-hot-toast';
import {
    FiHome,
    FiBookOpen,
    FiUsers,
    FiUser,
    FiCpu,
    FiExternalLink,
    FiLayers,
    FiFilter,
    FiCalendar,
    FiGlobe,
} from 'react-icons/fi';

const NAV_ITEMS = [
    { id: 'overview', label: 'Кыскача', icon: FiHome },
    { id: 'courses', label: 'Курстарым', icon: FiBookOpen },
    { id: 'students', label: 'Студенттер', icon: FiUsers },
    { id: 'profile', label: 'Профиль', icon: FiUser },
    { id: 'ai', label: 'AI ассистент', icon: FiCpu },
    { id: 'offerings', label: 'Offeringдер', icon: FiLayers },
];

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [courseList, setCourseList] = useState([]);
    const [offeringsByCourse, setOfferingsByCourse] = useState({});
    const [loadingOfferings, setLoadingOfferings] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);

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
                const data = await fetchCourses();
                const instructorCourses = (data.courses || []).filter(
                    (course) => course.instructor?.id === user.id
                );
                setCourseList(instructorCourses);
            } catch (error) {
                console.error('Failed to load instructor courses', error);
                toast.error('Инструктор курстарын жүктөө мүмкүн болбоду');
            } finally {
                setLoadingCourses(false);
            }
        };

        loadCourses();
    }, [user]);

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

    const renderContent = () => {
        if ((loadingProfile && !profile) || (loadingCourses && !courses.length)) {
            return <p className="text-center text-gray-500">Маалымат жүктөлүүдө...</p>;
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
                    />
                );
            case 'students':
                return <StudentsSection total={profile?.numberOfStudents} courses={courses} />;
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
                    />
                );
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto flex gap-6 px-4 pb-12">
                <DashboardSidebar
                    items={NAV_ITEMS}
                    activeId={activeTab}
                    onSelect={setActiveTab}
                    isOpen={sidebarOpen}
                    onToggle={setSidebarOpen}
                    className="flex-shrink-0"
                />

                <main className="flex-1 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-sm uppercase tracking-wide text-gray-400">
                                Инструктор
                            </p>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user.fullName || user.email}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Курстарыңызды жана студенттерди толук көзөмөлдөңүз
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="hidden md:inline-flex px-4 py-2 rounded-full border text-sm text-gray-600"
                            type="button"
                        >
                            {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                        </button>
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
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-gray-500">Кош келиңиз</p>
                <h2 className="text-2xl font-semibold text-gray-900">
                    {user.fullName || user.email}
                </h2>
                <p className="mt-2 text-gray-600">
                    Профилди толтуруңуз, курстарды жаңыртыңыз жана студенттерге баалуулук
                    тартуулаңыз.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
        </>
    );
};

const CoursesSection = ({
    courses,
    loading,
    offeringsByCourse,
    loadingOfferings,
    onViewOfferings,
}) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
                <h2 className="text-2xl font-semibold">Курстарым</h2>
                <p className="text-sm text-gray-500">Активдүү жана каралуудагы курстар</p>
            </div>
            <Link
                to="/instructor/course/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
            >
                Жаңы курс
            </Link>
        </div>
        {loading && !courses.length ? (
            <p className="text-sm text-gray-500">Курстар жүктөлүүдө...</p>
        ) : courses.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                    <div
                        key={course.id || course.title}
                        className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-lg font-semibold">{course.title}</p>
                                {course.category?.name && (
                                    <p className="text-sm text-gray-500">{course.category.name}</p>
                                )}
                            </div>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                    course.isPublished
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}
                            >
                                {course.isPublished ? 'Жарыяланды' : 'Каралууда'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
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
                                className="flex-1 text-center border border-gray-200 rounded-full px-4 py-2 text-sm"
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
    </div>
);

const StudentsSection = ({ total, courses }) => (
    <div className="space-y-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">Студенттер</h2>
            <p className="text-gray-500 text-sm">
                Жалпы студенттердин саны (бардык курстар боюнча).
            </p>
            <div className="mt-4">
                <StatCard label="Студенттер" value={total ?? '—'} />
            </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Курс боюнча бөлүштүрүү</h3>
            {courses.length ? (
                <div className="space-y-3">
                    {courses.map((course) => (
                        <div
                            key={course.id || course.title}
                            className="flex items-center justify-between gap-4"
                        >
                            <div>
                                <p className="font-semibold">{course.title}</p>
                                <p className="text-sm text-gray-500">
                                    {course.category?.name || 'Категория белгисиз'}
                                </p>
                            </div>
                            <span className="text-sm text-gray-600">
                                {course.studentsCount
                                    ? `${course.studentsCount} студент`
                                    : 'Маалымат жок'}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">Азырынча курс жок.</p>
            )}
        </div>
        <div className="bg-gradient-to-r from-[#FFEDD5] via-[#FFEAD1] to-[#FFDACC] rounded-3xl p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-sm uppercase tracking-wide text-orange-600">Кеңеш</p>
                <h3 className="text-xl font-semibold text-gray-900">Катталууларды башкарыңыз</h3>
                <p className="text-sm text-gray-600">
                    Курстар боюнча студенттерди кошуу же алып салуу үчүн админ панелиндеги
                    "Катталуулар" бөлүмүн колдонууга болот.
                </p>
            </div>
            <Link
                to="/instructor/enrollments"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white text-sm"
            >
                Катталууларга өтүү
                <FiExternalLink />
            </Link>
        </div>
    </div>
);

const ProfileSection = ({ profile, expertiseTags, socialLinks }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
                <h2 className="text-2xl font-semibold">Профиль</h2>
                <p className="text-sm text-gray-500">Өзүңүз жөнүндө маалымат</p>
            </div>
            <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            >
                Профилди өзгөртүү
            </Link>
        </div>
        <div>
            <p className="text-gray-600 font-medium mb-1">Био / Өзүм жөнүндө</p>
            <p className="text-gray-800">{profile?.bio?.trim() || 'Маалымат кошула элек'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p className="text-gray-600 font-medium mb-1">Тажрыйба</p>
                <p className="text-gray-800">
                    {profile?.yearsOfExperience ? `${profile.yearsOfExperience} жыл` : '—'}
                </p>
            </div>
            <div>
                <p className="text-gray-600 font-medium mb-1">Студенттер</p>
                <p className="text-gray-800">{profile?.numberOfStudents ?? '—'}</p>
            </div>
        </div>
        <div>
            <p className="text-gray-600 font-medium mb-1">Экспертиза</p>
            {expertiseTags.length ? (
                <div className="flex flex-wrap gap-2">
                    {expertiseTags.map((tag) => (
                        <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">Экспертиза кошула элек</p>
            )}
        </div>
        <div>
            <p className="text-gray-600 font-medium mb-1">Социалдык тармактар</p>
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
                <p className="text-sm text-gray-500">Социалдык шилтемелер кошула элек</p>
            )}
        </div>
    </div>
);

const AiSection = ({ aiCourses, totalCourses }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
                <h2 className="text-2xl font-semibold">EDU AI ассистент</h2>
                <p className="text-sm text-gray-500">
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
                <p className="text-sm text-gray-500">AI жардамчысы иштетилген курстар</p>
                {aiCourses.map((course) => (
                    <div
                        key={course.id}
                        className="flex items-center justify-between gap-3 border border-gray-200 rounded-2xl px-4 py-3"
                    >
                        <div>
                            <p className="font-semibold">{course.title}</p>
                            <p className="text-xs text-gray-500">
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
            const courseDetails = await fetchCourseDetails(offering.course.id);
            const list =
                courseDetails?.enrollments
                    ?.filter(
                        (enrollment) =>
                            (enrollment.offeringId || enrollment.offering?.id) === offering.id &&
                            enrollment.isActive !== false
                    )
                    .map((enrollment) => ({
                        id: enrollment.user?.id || enrollment.userId || enrollment.id,
                        name: enrollment.user?.fullName || enrollment.user?.email || 'Студент',
                        email: enrollment.user?.email || '—',
                        enrolledAt: enrollment.enrolledAt,
                    })) || [];
            setEnrollStudents(list);
        } catch (error) {
            console.error('Failed to load offering students', error);
            toast.error('Студенттердин тизмесин жүктөө мүмкүн болбodu');
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
                'Студентти offeringге кошууда ката';
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
                    <h2 className="text-2xl font-bold text-gray-900">Курс сунуштары</h2>
                    <p className="text-sm text-gray-500">
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

            <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm text-gray-600">
                        <FiFilter />
                        Фильтр
                    </div>
                    <select
                        value={filterCourseId}
                        onChange={(e) => setFilterCourseId(e.target.value)}
                        className="border rounded-full px-3 py-1 text-sm"
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
                        className="border rounded-full px-3 py-1 text-sm"
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
                    className="border rounded-2xl px-4 py-2 text-sm w-full md:w-64"
                    placeholder="Offering боюнча издөө..."
                />
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm">
                {loading ? (
                    <p className="text-center text-gray-500">Offeringдер жүктөлүүдө...</p>
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
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
);

const QuickActionCard = ({ title, description, link, buttonText, accent = 'blue' }) => {
    const accentClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        amber: 'bg-amber-500 hover:bg-amber-600',
    }[accent];

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
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
        <p className="text-lg font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        {actionLabel && actionLink && (
            <Link to={actionLink} className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm">
                {actionLabel}
            </Link>
        )}
    </div>
);

const OfferingsSummary = ({ offerings, loading, onViewOfferings }) => {
    if (loading) {
        return <p className="text-xs text-gray-500">Offering маалымат жүктөлүүдө...</p>;
    }
    if (!offerings.length) {
        return (
            <div className="border border-dashed border-gray-200 rounded-2xl p-3 text-xs text-gray-500 flex flex-col gap-2">
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
        <div className="border border-gray-100 rounded-2xl p-3 text-xs text-gray-600 flex flex-col gap-1">
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
            <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-gray-400">
                            {mode === 'edit' ? 'Offering өзгөртүү' : 'Жаңы offering'}
                        </p>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {mode === 'edit' ? 'Offeringди өзгөртүү' : 'Курс сунушун түзүү'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
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
                            <label className="text-sm font-medium text-gray-600">Курс</label>
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
                            <label className="text-sm font-medium text-gray-600">
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
                            <label className="text-sm font-medium text-gray-600">Модалдуулук</label>
                            <select
                                value={form.modality}
                                onChange={(e) => onChange('modality', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            >
                                <option value="ONLINE">Онлайн (Zoom/Meet)</option>
                                <option value="OFFLINE">Офлайн (жандуу)</option>
                                <option value="HYBRID">Гибрид</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {modalityDescriptions[form.modality]}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Көрүнүү</label>
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
                            <label className="text-sm font-medium text-gray-600">Башталышы</label>
                            <input
                                type="datetime-local"
                                value={form.startAt}
                                onChange={(e) => onChange('startAt', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Аяктоосу</label>
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
                            <label className="text-sm font-medium text-gray-600">Статус</label>
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
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mt-6">
                            <input
                                type="checkbox"
                                checked={form.isFeatured}
                                onChange={(e) => onChange('isFeatured', e.target.checked)}
                            />
                            Featured offering катары белгилөө
                        </label>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
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
                            <label className="text-sm font-medium text-gray-600">
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
                            <p className="text-xs text-gray-500 mt-1">
                                Жума күндөрү жана убакыттарын кошуу үчүн "Блок кошуу" баскычын
                                басыңыз.
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
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
                            <label className="text-sm font-medium text-gray-600">
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
                            <label className="text-sm font-medium text-gray-600">
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
                    <p className="text-lg font-semibold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500">Курс: {offering.course.title}</p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        visibility === 'PUBLIC'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    {visibility === 'PUBLIC' ? 'Публичный' : 'Жабык'}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
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
                    {companyName && <p className="text-xs text-gray-500">{companyName}</p>}
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
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <span>Катталган: {offering.enrolledCount ?? 0}</span>
                {offering.seatsRemaining != null && (
                    <span>Калган орун: {offering.seatsRemaining}</span>
                )}
            </div>
            {offering.scheduleBlocks?.length ? (
                <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-700 mb-1">Расписание:</p>
                    <ul className="space-y-1">
                        {offering.scheduleBlocks.map((block, idx) => (
                            <li key={idx}>
                                {block.day}: {block.startTime} – {block.endTime}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : offering.scheduleNote ? (
                <p className="text-sm text-gray-600">Белгилей кетүү: {offering.scheduleNote}</p>
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
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400">Студент кошуу</p>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {offering.course.title}
                    </h2>
                    <p className="text-sm text-gray-500">{offering.title || 'Offering'}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
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
                    <label className="text-sm font-medium text-gray-600">
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
                            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg max-h-48 overflow-auto z-10">
                                {studentOptions.map((student) => (
                                    <button
                                        key={student.id}
                                        type="button"
                                        className={`w-full text-left px-3 py-2 text-sm ${
                                            String(student.id) === form.userId
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
                                            <span className="text-xs text-gray-500 ml-2">
                                                {student.email}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {loadingUserOptions && (
                        <p className="text-xs text-gray-500 mt-1">Студенттер жүктөлүүдө...</p>
                    )}
                    {!studentOptions?.length && userSearch.length >= 2 && !loadingUserOptions && (
                        <p className="text-xs text-gray-500 mt-2">Студент табылган жок.</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        {form.userId
                            ? `Тандалган студент ID: ${form.userId}`
                            : 'Кеминде эки тамга издөө үчүн жазыңыз жана тизмеден тандаңыз.'}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600">Скидка % (опция)</label>
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
                <div className="text-xs text-gray-500">
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

import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useDashboardSwipeGestures from '../hooks/useDashboardSwipeGestures';
import {
    fetchInstructorProfile,
    updateInstructorProfile,
    listOfferingsForCourse,
    fetchInstructorStudentCourses,
    fetchCourseStudents,
    fetchCourseCertificateSettings,
    fetchCourseCertificates,
    updateCourseCertificateSettings,
    issueCourseCertificate,
    approveCertificate,
    rejectCertificate,
    revokeCertificate,
    regenerateCourseCertificates,
    createCourse,
    fetchCategories,
    fetchInstructorCourses,
    updateCourse,
} from '@services/api';
import { markCoursePending } from '@features/courses/api';
import {
    uploadCourseCertificateSecondaryLogo,
    saveCourseCertificateSignatureAsset,
} from '@features/courses/api';
import toast from 'react-hot-toast';
import Loader from '../shared/ui/Loader';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import {
    InstructorOverviewSection,
    CoursesSection,
    GroupsSection,
    StudentsSection,
    CertificatesSection,
    ProfileSection,
    AiSection,
    OfferingsSection,
    NAV_ITEMS,
} from '@features/instructor-dashboard';
import {
    DashboardLayout,
    DashboardHeader,
    DashboardTabs,
} from '../components/ui/dashboard';
import {
    isCourseFeatureEnabled,
    TENANT_FEATURES,
} from '@shared/utils/tenantFeatures';
import { getDashboardPath } from '@shared/utils/navigation';

const AttendancePage = lazy(() => import('./Attendance'));
const SessionWorkspacePage = lazy(() => import('./SessionWorkspace'));
const InstructorAnalyticsPage = lazy(() => import('./InstructorAnalytics'));
const InternalLeaderboard = lazy(() => import('./InternalLeaderboard'));
const InstructorHomework = lazy(() => import('./InstructorHomework'));
const NotificationsTab = lazy(() => import('@features/notifications/components/NotificationsTab'));
const ChatTab = lazy(() => import('@features/instructor-dashboard/components/ChatTab.jsx'));

const TabSuspense = ({ children }) => (
    <Suspense fallback={<Loader fullScreen={false} />}>{children}</Suspense>
);

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
    const [savingProfile, setSavingProfile] = useState(false);
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
    const [certificateSettings, setCertificateSettings] = useState(null);
    const [courseCertificates, setCourseCertificates] = useState([]);
    const [loadingCertificateWorkspace, setLoadingCertificateWorkspace] = useState(false);
    const [savingCertificateSettings, setSavingCertificateSettings] = useState(false);
    const [certificateActionStudentId, setCertificateActionStudentId] = useState(null);
    const [certificateActionKind, setCertificateActionKind] = useState(null);
    const [regeneratingCertificates, setRegeneratingCertificates] = useState(false);
    const [savingCertificateAssetKind, setSavingCertificateAssetKind] = useState(null);

    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [creatingDeliveryCourse, setCreatingDeliveryCourse] = useState(false);
    const [showEditDeliveryModal, setShowEditDeliveryModal] = useState(false);
    const [editingDeliveryCourse, setEditingDeliveryCourse] = useState(null);
    const [updatingDeliveryCourse, setUpdatingDeliveryCourse] = useState(false);
    const [submittingCourseId, setSubmittingCourseId] = useState(null);
    const [deliveryCategories, setDeliveryCategories] = useState([]);

    const analyticsLink = useMemo(() => {
        const to = new Date();
        const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
        return getDashboardPath('instructor', 'analytics', {
            from: from.toISOString().slice(0, 10),
            to: to.toISOString().slice(0, 10),
        });
    }, []);

    const courses = useMemo(
        () => (courseList.length ? courseList : profile?.courses || []),
        [courseList, profile]
    );

    const aiCourses = useMemo(
        () =>
            courses.filter(
                (course) =>
                    course.aiAssistantEnabled &&
                    isCourseFeatureEnabled(course, TENANT_FEATURES.AI_ASSISTANT)
            ),
        [courses]
    );

    const approvedCourses = useMemo(
        () => courses.filter((course) => course?.status === 'approved' && course?.isPublished),
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

    const expertiseTags = useMemo(
        () => (Array.isArray(profile?.expertiseTags) ? profile.expertiseTags.filter(Boolean) : []),
        [profile]
    );

    const socialLinks = useMemo(
        () =>
            Object.entries(profile?.socialLinks || {}).filter(([, value]) => Boolean(value?.trim?.() || value)),
        [profile]
    );

    const approvedOfferings = useMemo(
        () => approvedCourses.flatMap((course) => offeringsByCourse[course.id] || []),
        [approvedCourses, offeringsByCourse]
    );
    const certificateCurrentUser = useMemo(
        () =>
            user
                ? {
                      ...user,
                      title: profile?.title ?? user.title,
                  }
                : user,
        [profile?.title, user]
    );
    const selectedStudentCourse = useMemo(
        () =>
            studentCourses.find((course) => String(course.id) === String(selectedStudentCourseId)) ||
            null,
        [selectedStudentCourseId, studentCourses]
    );
    const certificateCourses = useMemo(
        () =>
            studentCourses.filter((course) =>
                isCourseFeatureEnabled(course, TENANT_FEATURES.CERTIFICATES)
            ),
        [studentCourses]
    );
    const certificatesFeatureEnabled = selectedStudentCourse
        ? isCourseFeatureEnabled(selectedStudentCourse, TENANT_FEATURES.CERTIFICATES)
        : true;

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
                const data = await fetchInstructorCourses({ status: 'all' });
                setCourseList(Array.isArray(data?.courses) ? data.courses : []);
            } catch (error) {
                console.error('Failed to load instructor courses', error);
                toast.error('Инструктор курстарын жүктөө мүмкүн болбоду');
            } finally {
                setLoadingCourses(false);
            }
        };

        loadCourses();
    }, [activeTab, user]);

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
                        const navigation = document.querySelector('[data-dashboard-navigation]');
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
                const sidebarItems = document.querySelectorAll('[data-dashboard-nav-item]');
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
            const list = (data?.courses || []).filter(
                (course) => course?.status === 'approved' && course?.isPublished
            );

            setStudentCourses(list);
            setStudentCoursesTotal(
                list.reduce((acc, course) => acc + (course.studentCount || 0), 0)
            );

            setSelectedStudentCourseId((prev) => {
                if (!list.length) return null;
                if (prev && !list.some((course) => course.id === prev)) return null;
                if (activeTab === 'certificates') {
                    const certificateList = list.filter((course) =>
                        isCourseFeatureEnabled(course, TENANT_FEATURES.CERTIFICATES)
                    );
                    if (prev && certificateList.some((course) => course.id === prev)) return prev;
                    return null;
                }
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
    }, [user, activeTab]);

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
        if (!['students', 'certificates'].includes(activeTab)) return;

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

    useEffect(() => {
        if (
            !['students', 'certificates'].includes(activeTab) ||
            !selectedStudentCourseId ||
            !certificatesFeatureEnabled
        ) {
            setCertificateSettings(null);
            setCourseCertificates([]);
            setLoadingCertificateWorkspace(false);
            return;
        }

        const loadCertificateSettings = async () => {
            setLoadingCertificateWorkspace(true);
            try {
                const [settingsData, certificatesData] = await Promise.all([
                    fetchCourseCertificateSettings(selectedStudentCourseId),
                    fetchCourseCertificates(selectedStudentCourseId),
                ]);
                setCertificateSettings(settingsData);
                setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
            } catch (error) {
                console.error('Failed to load certificate settings', error);
            } finally {
                setLoadingCertificateWorkspace(false);
            }
        };

        loadCertificateSettings();
    }, [activeTab, selectedStudentCourseId, certificatesFeatureEnabled]);

    const handleToggleCertificateApproval = useCallback(
        async (enabled) => {
            if (!selectedStudentCourseId) return;
            if (!certificatesFeatureEnabled) {
                toast.error('Certificates are disabled for this tenant.');
                return;
            }
            setSavingCertificateSettings(true);
            try {
                const updated = await updateCourseCertificateSettings(
                    selectedStudentCourseId,
                    {
                        enabled: certificateSettings?.enabled ?? true,
                        issueMode: certificateSettings?.issueMode ?? 'auto',
                        approvalMode: enabled ? 'instructor' : 'none',
                    }
                );
                setCertificateSettings(updated);
                toast.success('Сертификат эрежеси жаңыртылды');
            } catch (error) {
                console.error('Failed to update certificate settings', error);
                toast.error('Сертификат эрежесин жаңыртуу мүмкүн болбоду');
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [selectedStudentCourseId, certificateSettings, certificatesFeatureEnabled]
    );

    const handleSaveCertificateSettings = useCallback(
        async (payload) => {
            if (!selectedStudentCourseId) return false;
            if (!certificatesFeatureEnabled) {
                toast.error('Certificates are disabled for this tenant.');
                return false;
            }
            setSavingCertificateSettings(true);
            try {
                const updated = await updateCourseCertificateSettings(
                    selectedStudentCourseId,
                    payload
                );
                setCertificateSettings(updated);
                toast.success('Сертификат шаблону сакталды');
                return true;
            } catch (error) {
                console.error('Failed to save certificate settings', error);
                toast.error('Сертификат шаблонун сактоо мүмкүн болбоду');
                return false;
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [selectedStudentCourseId, certificatesFeatureEnabled]
    );

    const handleRegenerateCertificates = useCallback(
        async () => {
            if (!selectedStudentCourseId) return false;
            if (!certificatesFeatureEnabled) {
                toast.error('Certificates are disabled for this tenant.');
                return false;
            }
            setRegeneratingCertificates(true);
            try {
                const result = await regenerateCourseCertificates(selectedStudentCourseId);
                await loadCourseStudents(selectedStudentCourseId);
                const certificatesData = await fetchCourseCertificates(selectedStudentCourseId);
                setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
                toast.success(
                    result?.regeneratedCount
                        ? `${result.regeneratedCount} сертификат жаңыртылды`
                        : 'Жаңыртууга сертификат табылган жок'
                );
                return true;
            } catch (error) {
                console.error('Failed to regenerate certificates', error);
                toast.error('Сертификат PDF файлдарын жаңыртуу мүмкүн болбоду');
                return false;
            } finally {
                setRegeneratingCertificates(false);
            }
        },
        [selectedStudentCourseId, certificatesFeatureEnabled, loadCourseStudents]
    );

    const handleSaveCertificateAsset = useCallback(
        async (kind, file) => {
            if (!selectedStudentCourseId || !file) return null;
            if (!certificatesFeatureEnabled) {
                toast.error('Certificates are disabled for this tenant.');
                return null;
            }
            setSavingCertificateAssetKind(kind);
            try {
                const updated =
                    kind === 'signature'
                        ? await saveCourseCertificateSignatureAsset(selectedStudentCourseId, file)
                        : await uploadCourseCertificateSecondaryLogo(selectedStudentCourseId, file);
                setCertificateSettings(updated);
                toast.success(
                    kind === 'signature'
                        ? 'Кол коюу сакталды'
                        : 'Экинчи бренд логотиби жүктөлдү'
                );
                return updated;
            } catch (error) {
                console.error('Failed to save certificate asset', error);
                toast.error(
                    kind === 'signature'
                        ? 'Кол коюуну сактоо мүмкүн болбоду'
                        : 'Сертификат активин жүктөө мүмкүн болбоду'
                );
                return null;
            } finally {
                setSavingCertificateAssetKind(null);
            }
        },
        [selectedStudentCourseId, certificatesFeatureEnabled]
    );

    const handleCertificateAction = useCallback(
        async (kind, student, displayOverrides = {}) => {
            if (!selectedStudentCourseId || !student) return;
            if (!certificatesFeatureEnabled) {
                toast.error('Certificates are disabled for this tenant.');
                return;
            }
            setCertificateActionStudentId(student.id);
            setCertificateActionKind(kind);
            try {
                if (kind === 'issue') {
                    await issueCourseCertificate(selectedStudentCourseId, {
                        studentId: student.id,
                        ...displayOverrides,
                    });
                } else if (kind === 'approve' && student.certificateId) {
                    await approveCertificate(student.certificateId, displayOverrides);
                } else if (kind === 'reject' && student.certificateId) {
                    await rejectCertificate(student.certificateId);
                } else if (kind === 'revoke' && student.certificateId) {
                    await revokeCertificate(student.certificateId);
                }

                await loadCourseStudents(selectedStudentCourseId);
                const certificatesData = await fetchCourseCertificates(selectedStudentCourseId);
                setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
                toast.success('Сертификат жаңыртылды');
            } catch (error) {
                console.error('Failed to update certificate', error);
                toast.error('Сертификат аракетин аткаруу мүмкүн болбоду');
            } finally {
                setCertificateActionStudentId(null);
                setCertificateActionKind(null);
            }
        },
        [selectedStudentCourseId, certificatesFeatureEnabled, loadCourseStudents]
    );

    const handleSelectStudentCourse = useCallback((courseId) => {
        setStudentsPage(1);
        setSelectedStudentCourseId(courseId);
    }, []);

    const handleSaveInstructorProfile = useCallback(
        async (payload) => {
            if (!user?.id) return false;

            setSavingProfile(true);
            try {
                const updated = await updateInstructorProfile(user.id, payload);
                setProfile(updated);
                toast.success('Инструктор профили сакталды');
                return true;
            } catch (error) {
                console.error('Failed to save instructor profile', error);
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Инструктор профилин сактоо мүмкүн болбоду';
                toast.error(Array.isArray(message) ? message.join(', ') : message);
                return false;
            } finally {
                setSavingProfile(false);
            }
        },
        [user?.id]
    );

    const closeDeliveryModal = () => {
        setShowDeliveryModal(false);
    };

    const closeEditDeliveryModal = () => {
        setShowEditDeliveryModal(false);
        setEditingDeliveryCourse(null);
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

    const openDeliveryEditModal = async (course) => {
        if (!course) return;

        if (!deliveryCategories.length) {
            try {
                const categories = await fetchCategories();
                setDeliveryCategories(Array.isArray(categories) ? categories : []);
            } catch (error) {
                console.error('Failed to load categories', error);
                toast.error('Категориялар жүктөлгөн жок');
                return;
            }
        }

        setEditingDeliveryCourse({
            id: course.id,
            courseType: course.courseType || 'offline',
            title: course.title || '',
            description: course.description || '',
            categoryId: course.category?.id || course.categoryId || '',
            price: course.price || 0,
            languageCode: course.languageCode || 'ky',
            status: course.status || '',
            isPublished: Boolean(course.isPublished),
        });
        setShowEditDeliveryModal(true);
    };

    const handleCreateDeliveryCourse = async (payload) => {
        if (!payload?.title || !payload?.description || !payload?.categoryId) {
            toast.error('Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз.');
            return false;
        }

        setCreatingDeliveryCourse(true);
        try {
            await createCourse({
                title: payload.title,
                description: payload.description,
                categoryId: parseInt(payload.categoryId, 10),
                price: Number(payload.price || 0),
                languageCode: payload.languageCode || 'ky',
                courseType: payload.courseType,
                isPaid: Number(payload.price || 0) > 0,
            });

            toast.success('Курс түзүлдү. Эми группа жана сессия түзө аласыз.');
            closeDeliveryModal();
            setActiveTab('courses');

            const data = await fetchInstructorCourses({ status: 'all' });
            setCourseList(Array.isArray(data?.courses) ? data.courses : []);
            return true;
        } catch (error) {
            console.error('Failed to create delivery course', error);
            toast.error('Курсту түзүүдө ката кетти.');
            return false;
        } finally {
            setCreatingDeliveryCourse(false);
        }
    };

    const handleUpdateDeliveryCourse = async (payload) => {
        if (!editingDeliveryCourse?.id) return false;

        if (!payload?.title || !payload?.description || !payload?.categoryId) {
            toast.error('Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз.');
            return false;
        }

        setUpdatingDeliveryCourse(true);
        try {
            await updateCourse(editingDeliveryCourse.id, {
                title: payload.title,
                description: payload.description,
                categoryId: parseInt(payload.categoryId, 10),
                price: Number(payload.price || 0),
                languageCode: payload.languageCode || 'ky',
                courseType: payload.courseType,
                isPaid: Number(payload.price || 0) > 0,
            });

            const requiresReview =
                editingDeliveryCourse.status === 'approved' || editingDeliveryCourse.isPublished;

            if (requiresReview) {
                await markCoursePending(editingDeliveryCourse.id);
            }

            const data = await fetchInstructorCourses({ status: 'all' });
            setCourseList(Array.isArray(data?.courses) ? data.courses : []);
            toast.success(
                requiresReview
                    ? 'Delivery курс жаңыртылды жана кайра карап чыгууга жөнөтүлдү'
                    : 'Delivery курс жаңыртылды'
            );
            closeEditDeliveryModal();
            return true;
        } catch (error) {
            console.error('Failed to update delivery course', error);
            toast.error('Delivery курсту жаңыртууда ката кетти.');
            return false;
        } finally {
            setUpdatingDeliveryCourse(false);
        }
    };

    const handleSubmitCourseForApproval = useCallback(async (courseId) => {
        if (!courseId) return false;

        setSubmittingCourseId(courseId);
        try {
            await markCoursePending(courseId);
            const data = await fetchInstructorCourses({ status: 'all' });
            setCourseList(Array.isArray(data?.courses) ? data.courses : []);
            toast.success('Курс тастыктоого жөнөтүлдү');
            return true;
        } catch (error) {
            console.error('Failed to submit course for approval', error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Курсту тастыктоого жөнөтүү мүмкүн болбоду';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
            return false;
        } finally {
            setSubmittingCourseId(null);
        }
    }, []);

    const isTabLoading =
        loadingStudentCourses || loadingCourseStudents || loadingOfferings;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sessions':
                return (
                    <TabSuspense>
                        <SessionWorkspacePage />
                    </TabSuspense>
                );
            case 'attendance':
                return (
                    <TabSuspense>
                        <AttendancePage embedded />
                    </TabSuspense>
                );
            case 'analytics':
                return (
                    <TabSuspense>
                        <InstructorAnalyticsPage embedded />
                    </TabSuspense>
                );
            case 'leaderboard':
                return (
                    <TabSuspense>
                        <InternalLeaderboard />
                    </TabSuspense>
                );
            case 'homework':
                return (
                    <TabSuspense>
                        <InstructorHomework />
                    </TabSuspense>
                );
            case 'chat':
                return (
                    <TabSuspense>
                        <ChatTab />
                    </TabSuspense>
                );
            case 'notifications':
                return (
                    <TabSuspense>
                        <NotificationsTab />
                    </TabSuspense>
                );
            case 'courses':
                return (
                    <CoursesSection
                        courses={courses}
                        loading={loadingCourses}
                        submittingCourseId={submittingCourseId}
                        onOpenDeliveryModal={openDeliveryModal}
                        onOpenDeliveryEditModal={openDeliveryEditModal}
                        showDeliveryModal={showDeliveryModal}
                        onCloseDeliveryModal={closeDeliveryModal}
                        onCreateDeliveryCourse={handleCreateDeliveryCourse}
                        showEditDeliveryModal={showEditDeliveryModal}
                        onCloseEditDeliveryModal={closeEditDeliveryModal}
                        editingDeliveryCourse={editingDeliveryCourse}
                        onUpdateDeliveryCourse={handleUpdateDeliveryCourse}
                        updatingDeliveryCourse={updatingDeliveryCourse}
                        onSubmitCourseForApproval={handleSubmitCourseForApproval}
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
                        onProgressMinChange={setProgressMin}
                        progressMax={progressMax}
                        onProgressMaxChange={setProgressMax}
                    />
                );
            case 'certificates':
                return (
                    <CertificatesSection
                        mode="instructor"
                        total={certificateCourses.reduce((sum, course) => sum + (course.studentCount || 0), 0)}
                        courses={certificateCourses}
                        loadingCourses={loadingStudentCourses}
                        selectedCourseId={selectedStudentCourseId}
                        onSelectCourse={handleSelectStudentCourse}
                        disabledCourseCount={studentCourses.length - certificateCourses.length}
                        disabledReason="Certificates are disabled for some tenant courses."
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
                        onProgressMinChange={setProgressMin}
                        progressMax={progressMax}
                        onProgressMaxChange={setProgressMax}
                        certificateSettings={certificateSettings}
                        courseCertificates={courseCertificates}
                        loadingCertificateWorkspace={loadingCertificateWorkspace}
                        savingCertificateSettings={savingCertificateSettings}
                        onToggleCertificateApproval={handleToggleCertificateApproval}
                        onSaveCertificateSettings={handleSaveCertificateSettings}
                        onRegenerateCertificates={handleRegenerateCertificates}
                        regeneratingCertificates={regeneratingCertificates}
                        savingCertificateAssetKind={savingCertificateAssetKind}
                        onSaveCertificateAsset={handleSaveCertificateAsset}
                        onCertificateAction={handleCertificateAction}
                        certificateActionStudentId={certificateActionStudentId}
                        certificateActionKind={certificateActionKind}
                        currentUser={certificateCurrentUser}
                    />
                );
            case 'groups':
                return <GroupsSection courses={courses} />;
            case 'profile':
                return (
                    <ProfileSection
                        profile={profile}
                        expertiseTags={expertiseTags}
                        socialLinks={socialLinks}
                        onSaveProfile={handleSaveInstructorProfile}
                        savingProfile={savingProfile}
                    />
                );
            case 'ai':
                return <AiSection aiCourses={aiCourses} totalCourses={courses.length} />;
            case 'offerings':
                return (
                    <OfferingsSection
                        courses={approvedCourses}
                        offerings={approvedOfferings}
                        loading={loadingOfferings}
                        refreshOfferings={() => {
                            if (approvedCourses.length) loadOfferingsForCourses(approvedCourses);
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

    // Prepare navigation items for the standardized layout
    const dashboardNavItems = NAV_ITEMS.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: handleTabSelect,
    }));

    // Prepare header actions
    const headerActions = [
        {
            label: '📊 Аналитика',
            to: analyticsLink,
            variant: 'primary',
        },
        {
            label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: 'secondary',
            className: 'hidden md:inline-flex',
        },
    ];

    // Prepare header content
    const headerContent = (
        <DashboardHeader
            user={user}
            role="instructor"
            subtitle="Курстарыңызды жана студенттерди толук көзөмөлдөңүз"
            actions={headerActions}
        />
    );

    // Mobile tabs
    const mobileTabs = (
        <DashboardTabs
            items={dashboardNavItems}
            activeId={activeTab}
            onSelect={handleTabSelect}
        />
    );

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'instructor') return <Navigate to="/" replace />;

    return (
        <DashboardLayout
            role="instructor"
            user={user}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
            {renderContent()}

            {/* Floating Action Button */}
            <FloatingActionButton role="instructor" />
        </DashboardLayout>
    );
};

export default InstructorDashboard;

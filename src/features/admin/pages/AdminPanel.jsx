import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import FloatingActionButton from '../../../components/ui/FloatingActionButton';
import { AuthContext } from '../../../context/AuthContext';
import {
    fetchCourses,
    fetchCategories,
    fetchUsers,
    deleteCourse,
    deleteCategory,
    updateUserRole,
    deleteUser,
    enrollUserInCourse,
    createCategory,
    updateCategory,
    fetchContactMessages,
    getPendingCourses,
    markCourseApproved,
    markCourseRejected,
    listCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    assignCourseToCompany,
    unassignCourseFromCompany,
    clearCourseCompany,
    uploadCompanyLogo,
    fetchCourseAiPrompts,
    addCourseAiPrompt,
    updateCourseAiPrompt,
    deleteCourseAiPrompt,
    transcodeLessonHls,
    bulkTranscodeLessonHls,
    getTranscodeStatus,
    fetchAdminStats,
    fetchSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    markNotificationRead as markNotificationReadApi,
    fetchCourseGroups,
} from '@services/api';
import toast from 'react-hot-toast';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import IntegrationTab from '@features/integration/components/IntegrationTab';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';
import AttendancePage from '../../../pages/Attendance';
import AdminAnalyticsPage from '../../../pages/AdminAnalytics';
import { isForbiddenError } from '@shared/api/error';

// Import standardized dashboard components
import {
    DashboardLayout,
    DashboardHeader,
    DashboardTabs,
} from '../../../components/ui/dashboard';

// Import extracted components
import AdminStatsTab from '../components/AdminStatsTab';
import AdminUsersTab from '../components/AdminUsersTab';
import AdminCoursesTab from '../components/AdminCoursesTab';
import AdminCompaniesTab from '../components/AdminCompaniesTab';
import AdminSkillsTab from '../components/AdminSkillsTab';
import AdminAiPromptsTab from '../components/AdminAiPromptsTab';
import AdminContactsTab from '../components/AdminContactsTab';
import AdminPendingCoursesTab from '../components/AdminPendingCoursesTab';

// Import constants and helpers
import { ADMIN_TABS, NAV_ITEMS, USERS_QUERY_KEYS } from '../utils/adminPanel.constants';
import { calculateVisiblePages } from '../utils/adminPanel.helpers';

const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [pendingCourses, setPendingCourses] = useState([]);
    const [courseGroupsByCourseId, setCourseGroupsByCourseId] = useState({});
    const [selectedEnrollmentGroupIds, setSelectedEnrollmentGroupIds] = useState({});

    const [companies, setCompanies] = useState([]);
    const [, setCompaniesTotalPages] = useState(1);
    const [companySearch, setCompanySearch] = useState('');
    const [companyPage] = useState(1);
    const [newCompanyName, setNewCompanyName] = useState('');

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [aiPromptCourseId, setAiPromptCourseId] = useState(null);
    const [aiPrompts, setAiPrompts] = useState([]);
    const [aiPromptsLoading, setAiPromptsLoading] = useState(false);
    const [newPromptText, setNewPromptText] = useState('');
    const [newPromptLanguage, setNewPromptLanguage] = useState('ky');
    const [newPromptOrder, setNewPromptOrder] = useState(0);
    const [newPromptIsActive, setNewPromptIsActive] = useState(true);

    const [skills, setSkills] = useState([]);
    const [newSkillName, setNewSkillName] = useState('');

    const [transcodeCourseId, setTranscodeCourseId] = useState('');
    const [transcodeSectionId, setTranscodeSectionId] = useState('');
    const [transcodeLessonId, setTranscodeLessonId] = useState('');
    const [transcodeLessonIds, setTranscodeLessonIds] = useState('');
    const [transcodeLoading, setTranscodeLoading] = useState(false);
    const [activeTranscodes, setActiveTranscodes] = useState([]); // [{courseId, sectionId, lessonId, status}]

    const [adminStats, setAdminStats] = useState(null);
    const [adminStatsLoading, setAdminStatsLoading] = useState(false);
    const [adminStatsLoaded, setAdminStatsLoaded] = useState(false);
    const [confirmation, setConfirmation] = useState(null);

    // Users pagination state
    const [usersPage, setUsersPage] = useState(
        Number(searchParams.get(USERS_QUERY_KEYS.page) || searchParams.get('page')) || 1
    );
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [usersTotal, setUsersTotal] = useState(0);

    // Users filters state
    const [search, setSearch] = useState(searchParams.get(USERS_QUERY_KEYS.search) || '');
    const [roleFilter, setRoleFilter] = useState(searchParams.get(USERS_QUERY_KEYS.role) || '');
    const [dateFrom, setDateFrom] = useState(searchParams.get(USERS_QUERY_KEYS.dateFrom) || '');
    const [dateTo, setDateTo] = useState(searchParams.get(USERS_QUERY_KEYS.dateTo) || '');

    // Tab state
    const [activeTab, setActiveTab] = useState('stats');

    const debounceRef = useRef(null);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Alt + shortcuts for navigation
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
                        const searchInput = document.querySelector('input[placeholder*="издөө" i], input[type="search"]');
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                }
            }

            // Arrow key navigation for sidebar
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const sidebarItems = document.querySelectorAll('[role="menuitem"]');
                const currentIndex = Array.from(sidebarItems).findIndex(item => item === document.activeElement);

                if (currentIndex !== -1) {
                    e.preventDefault();
                    let newIndex;
                    if (e.key === 'ArrowLeft') {
                        newIndex = currentIndex > 0 ? currentIndex - 1 : sidebarItems.length - 1;
                    } else {
                        newIndex = currentIndex < sidebarItems.length - 1 ? currentIndex + 1 : 0;
                    }
                    sidebarItems[newIndex].focus();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Update search params helper
    const updateSearchParams = useCallback(
        (params) => {
            setSearchParams((prev) => {
                const updated = new URLSearchParams(prev);
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') updated.set(key, value);
                    else updated.delete(key);
                });
                return updated;
            });
        },
        [setSearchParams]
    );

    // Initialize tab from URL
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (ADMIN_TABS.includes(tabFromUrl)) {
            setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
        }
    }, [searchParams]);

    // Update URL when tab changes
    useEffect(() => {
        updateSearchParams({ tab: activeTab });
    }, [activeTab, updateSearchParams]);

    // Tab selection handler
    const handleTabSelect = useCallback(
        (tabId) => {
            if (!ADMIN_TABS.includes(tabId)) return;
            setActiveTab(tabId);
            updateSearchParams({ tab: tabId });
        },
        [updateSearchParams]
    );

    // Users filters URL sync
    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (search.length === 0 || search.length >= 3) {
                updateSearchParams({
                    [USERS_QUERY_KEYS.search]: search,
                    [USERS_QUERY_KEYS.role]: roleFilter,
                    [USERS_QUERY_KEYS.dateFrom]: dateFrom,
                    [USERS_QUERY_KEYS.dateTo]: dateTo,
                    [USERS_QUERY_KEYS.page]: usersPage,
                });
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [search, roleFilter, dateFrom, dateTo, usersPage, updateSearchParams]);

    // Users page change handler
    const handleUsersPageChange = useCallback(
        (nextPage) => {
            if (nextPage < 1) return;
            setUsersPage(nextPage);
        },
        []
    );

    // Render pagination buttons
    const renderUserPageButtons = () => {
        if (usersTotalPages <= 1) return null;

        const visiblePages = calculateVisiblePages(usersPage, usersTotalPages);

        return visiblePages.map((p) => (
            <button
                key={p}
                type="button"
                onClick={() => handleUsersPageChange(p)}
                className={`w-9 h-9 rounded border text-sm font-medium transition-all duration-300 transform hover:scale-110 ${p === usersPage
                    ? 'bg-edubot-orange text-white border-edubot-orange scale-110 ring-2 ring-edubot-orange/50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-edubot-orange hover:text-edubot-orange hover:shadow-md'
                    }`}
            >
                {p}
            </button>
        ));
    };

    // API Functions (keeping existing logic)
    const loadUsers = useCallback(async () => {
        try {
            const res = await fetchUsers({
                page: usersPage,
                limit: 10,
                search,
                role: roleFilter,
                dateFrom,
                dateTo,
            });
            setUsers(res?.data || []);
            setUsersTotal(res?.total || 0);
            setUsersTotalPages(res?.totalPages || 1);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Колдонуучуларды жүктөөдө ката кетти');
            }
        }
    }, [usersPage, search, roleFilter, dateFrom, dateTo]);

    const loadCoursesAndCategories = useCallback(async () => {
        try {
            const [coursesRes, categoriesRes] = await Promise.all([
                fetchCourses(),
                fetchCategories(),
            ]);
            const loadedCourses = coursesRes?.courses || [];
            setCourses(loadedCourses);
            setCategories(categoriesRes || []);

            const deliveryCourses = loadedCourses.filter((course) =>
                ['offline', 'online_live'].includes(
                    normalizeEnrollmentCourseType(course?.courseType || course?.type)
                )
            );

            if (!deliveryCourses.length) {
                setCourseGroupsByCourseId({});
                return;
            }

            const groupEntries = await Promise.all(
                deliveryCourses.map(async (course) => {
                    try {
                        const response = await fetchCourseGroups({ courseId: Number(course.id) });
                        const items = Array.isArray(response)
                            ? response
                            : Array.isArray(response?.items)
                                ? response.items
                                : Array.isArray(response?.data)
                                    ? response.data
                                    : [];
                        return [String(course.id), items];
                    } catch (error) {
                        console.error('Failed to load groups for admin course', course.id, error);
                        return [String(course.id), []];
                    }
                })
            );

            setCourseGroupsByCourseId(Object.fromEntries(groupEntries));
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Курстарды жана категорияларды жүктөөдө ката кетти');
            }
        }
    }, []);

    const loadContacts = useCallback(async () => {
        try {
            const res = await fetchContactMessages();
            setContacts(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Байланыш каттарын жүктөөдө ката кетти');
            }
        }
    }, []);

    const loadPendingCourses = useCallback(async () => {
        try {
            const res = await getPendingCourses();
            setPendingCourses(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Каралуудагы курстарды жүктөөдө ката кетти');
            }
        }
    }, []);

    const loadCompanies = useCallback(async () => {
        try {
            const res = await listCompanies({
                page: companyPage,
                limit: 10,
                search: companySearch,
            });
            setCompanies(res?.items || []);
            setCompaniesTotalPages(res?.totalPages || 1);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Компанияларды жүктөөдө ката кетти');
            }
        }
    }, [companyPage, companySearch]);

    const loadAdminStats = useCallback(async () => {
        setAdminStatsLoading(true);
        try {
            const stats = await fetchAdminStats();
            setAdminStats(stats);
            setAdminStatsLoaded(true);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Статистиканы жүктөөдө ката кетти');
            }
        } finally {
            setAdminStatsLoading(false);
        }
    }, []);

    const loadSkillsList = useCallback(async () => {
        try {
            const res = await fetchSkills();
            setSkills(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Скиллдерди жүктөөдө ката кетти');
            }
        }
    }, []);

    const loadPromptsForCourse = useCallback(async (courseId) => {
        setAiPromptsLoading(true);
        try {
            const res = await fetchCourseAiPrompts(courseId);
            setAiPrompts(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('AI промпттарды жүктөөдө ката кетти');
            }
        } finally {
            setAiPromptsLoading(false);
        }
    }, []);

    const loadUsersForEnrollment = useCallback(async () => {
        try {
            const res = await fetchUsers({ role: 'student', limit: 100 });
            setUsers(res?.data || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Студенттерди жүктөөдө ката кетти');
            }
        }
    }, []);

    // Event handlers
    const requestConfirmation = useCallback((config) => {
        setConfirmation(config);
    }, []);

    const closeConfirmation = useCallback(() => {
        setConfirmation(null);
    }, []);

    const confirmAndRun = useCallback(async () => {
        if (!confirmation?.onConfirm) return;
        try {
            await confirmation.onConfirm();
        } catch {
            // handled in action handlers
        } finally {
            setConfirmation(null);
        }
    }, [confirmation]);

    const handleDeleteUser = async (id) => {
        requestConfirmation({
            title: 'Колдонуучуну өчүрүү',
            message: 'Бул колдонуучуну өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteUser(id);
                    setUsers((prev) => prev.filter((u) => u.id !== id));
                    toast.success('Колдонуучу ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('Колдонуучуну өчүрүүдө ката кетти');
                }
            },
        });
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
            toast.success('Роль ийгиликтүү өзгөртүлдү');
        } catch {
            toast.error('Ролду өзгөртүүдө ката кетти');
        }
    };

    const handleDeleteCourse = async (id) => {
        requestConfirmation({
            title: 'Курсту өчүрүү',
            message: 'Бул курсту өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteCourse(id);
                    setCourses((prev) => prev.filter((c) => c.id !== id));
                    toast.success('Курс ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('Курсту өчүрүүдө ката кетти');
                }
            },
        });
    };

    const handleEnrollUser = async (userId, courseId) => {
        if (!userId) return;
        try {
            const selectedCourse = courses.find((course) => Number(course.id) === Number(courseId));
            const normalizedCourseType = normalizeEnrollmentCourseType(selectedCourse?.courseType);
            const selectedGroupId = selectedEnrollmentGroupIds[String(courseId)];

            if (
                ['offline', 'online_live'].includes(normalizedCourseType) &&
                (!selectedGroupId || Number.isNaN(Number(selectedGroupId)))
            ) {
                toast.error('Delivery курс үчүн адегенде группаны тандаңыз');
                return;
            }

            await enrollUserInCourse(userId, courseId, {
                courseType: normalizedCourseType,
                groupId:
                    ['offline', 'online_live'].includes(normalizedCourseType) && selectedGroupId
                        ? Number(selectedGroupId)
                        : undefined,
            });
            toast.success('Студент курска ийгиликтүү катталды');
        } catch {
            toast.error('Каттоодо ката кетти');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const created = await createCategory({ name: newCategory.trim() });
            setCategories((prev) => [...prev, created]);
            setNewCategory('');
            toast.success('Категория ийгиликтүү кошулду');
        } catch {
            toast.error('Категория кошууда ката кетти');
        }
    };

    const handleUpdateCategory = async (id) => {
        if (!editingCategoryName.trim()) return;
        try {
            await updateCategory(id, { name: editingCategoryName.trim() });
            setCategories((prev) =>
                prev.map((c) => (c.id === id ? { ...c, name: editingCategoryName.trim() } : c))
            );
            setEditingCategoryId(null);
            setEditingCategoryName('');
            toast.success('Категория ийгиликтүү жаңыртылды');
        } catch {
            toast.error('Категорияны жаңыртууда ката кетти');
        }
    };

    const handleDeleteCategory = async (id) => {
        requestConfirmation({
            title: 'Категорияны өчүрүү',
            message: 'Бул категорияны өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteCategory(id);
                    setCategories((prev) => prev.filter((c) => c.id !== id));
                    toast.success('Категория ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('Категорияны өчүрүүдө ката кетти');
                }
            },
        });
    };

    const handleTranscode = async () => {
        if (!transcodeCourseId || !transcodeSectionId || !transcodeLessonId) {
            toast.error('Бардык ID полярын толтуруңуз');
            return;
        }
        setTranscodeLoading(true);
        try {
            const result = await transcodeLessonHls({
                courseId: Number(transcodeCourseId),
                sectionId: Number(transcodeSectionId),
                lessonId: Number(transcodeLessonId),
            });
            toast.success('Транскоддоо ийгиликтүү башталды');
            // Add to active transcodes for polling
            setActiveTranscodes((prev) => [
                ...prev,
                {
                    courseId: Number(transcodeCourseId),
                    sectionId: Number(transcodeSectionId),
                    lessonId: Number(transcodeLessonId),
                    status: 'processing',
                    jobId: result.jobId,
                },
            ]);
            setTranscodeCourseId('');
            setTranscodeSectionId('');
            setTranscodeLessonId('');
        } catch {
            toast.error('Транскоддоодо ката кетти');
        } finally {
            setTranscodeLoading(false);
        }
    };

    const handleBulkTranscode = async () => {
        if (!transcodeCourseId || !transcodeSectionId) {
            toast.error('Course жана Section ID толтуруңуз');
            return;
        }

        const lessonIds = transcodeLessonIds
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
            .map(Number)
            .filter(Number.isFinite);

        setTranscodeLoading(true);
        try {
            const result = await bulkTranscodeLessonHls({
                courseId: Number(transcodeCourseId),
                sectionId: Number(transcodeSectionId),
                lessonIds: lessonIds.length ? lessonIds : undefined,
            });
            toast.success(`Топтук транскоддоо башталды: ${result.started}/${result.total}`);
            // Add started lessons to active transcodes for polling
            const startedLessons = result.results
                .filter((r) => r.status === 'started')
                .map((r) => ({
                    courseId: Number(transcodeCourseId),
                    sectionId: Number(transcodeSectionId),
                    lessonId: r.lessonId,
                    status: 'processing',
                    jobId: r.jobId,
                }));
            setActiveTranscodes((prev) => [...prev, ...startedLessons]);
            setTranscodeLessonIds('');
        } catch {
            toast.error('Топтук транскоддоодо ката кетти');
        } finally {
            setTranscodeLoading(false);
        }
    };

    // Company management handlers
    const handleCreateCompany = async () => {
        if (!newCompanyName.trim()) return;
        try {
            const created = await createCompany({ name: newCompanyName.trim() });
            setCompanies((prev) => [...prev, created]);
            setNewCompanyName('');
            toast.success('Компания ийгиликтүү кошулду');
        } catch {
            toast.error('Компания кошууда ката кетти');
        }
    };

    const handleUpdateCompany = async (companyId, newName) => {
        if (!newName.trim()) return;
        try {
            await updateCompany(companyId, { name: newName.trim() });
            setCompanies((prev) => prev.map((company) =>
                company.id === companyId ? { ...company, name: newName.trim() } : company
            ));
            toast.success('Компания ийгиликтүү жаңыртылды');
        } catch {
            toast.error('Компанияны жаңыртууда ката кетти');
        }
    };

    const handleDeleteCompany = async (companyId) => {
        requestConfirmation({
            title: 'Компанияны өчүрүү',
            message: 'Бул компанияны өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteCompany(companyId);
                    setCompanies((prev) => prev.filter((company) => company.id !== companyId));
                    toast.success('Компания ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('Компанияны өчүрүүдө ката кетти');
                }
            },
        });
    };

    // Advanced company management handlers
    const handleAssignCourseToCompany = async (courseId, companyId) => {
        try {
            await assignCourseToCompany(courseId, companyId);
            toast.success('Курс компанияга ийгиликтүү таанды');
            // Reload courses to update company assignments
            loadCoursesAndCategories();
        } catch {
            toast.error('Курс таандоодо ката кетти');
        }
    };

    const handleUnassignCourseFromCompany = async (courseId, companyId) => {
        try {
            await unassignCourseFromCompany(courseId, companyId);
            toast.success('Курс компаниядан ийгиликтүү алынды');
            // Reload courses to update company assignments
            loadCoursesAndCategories();
        } catch {
            toast.error('Курс алындоодо ката кетти');
        }
    };

    const handleClearCourseCompany = async (courseId) => {
        requestConfirmation({
            title: 'Компания байланыштарын тазалоо',
            message: 'Бул курстун бардык компания таандоолорун алырга ишенимдүүсүзбү?',
            confirmLabel: 'Тазалоо',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await clearCourseCompany(courseId);
                    toast.success('Курстун компания таандоолору тазаланды');
                    loadCoursesAndCategories();
                } catch {
                    toast.error('Компания таандоолорду тазалоодо ката кетти');
                }
            },
        });
    };

    const handleUploadCompanyLogo = async (companyId, file) => {
        if (!file) {
            toast.error('Файл тандаңыз');
            return;
        }
        try {
            await uploadCompanyLogo(companyId, file);
            toast.success('Компания логотипи ийгиликтүү жүктөлдү');
            // Reload companies to show updated logo
            loadCompanies();
        } catch {
            toast.error('Логотип жүктөөдө ката кетти');
        }
    };

    // Skill management handlers
    const handleCreateSkill = async () => {
        if (!newSkillName.trim()) return;
        try {
            const created = await createSkill({ name: newSkillName.trim() });
            setSkills((prev) => [...prev, created]);
            setNewSkillName('');
            toast.success('Скилл ийгиликтүү кошулду');
        } catch {
            toast.error('Скилл кошууда ката кетти');
        }
    };

    const handleUpdateSkill = async (skillId, newName) => {
        if (!newName.trim()) return;
        try {
            await updateSkill(skillId, { name: newName.trim() });
            setSkills((prev) => prev.map((skill) =>
                skill.id === skillId ? { ...skill, name: newName.trim() } : skill
            ));
            toast.success('Скилл ийгиликтүү жаңыртылды');
        } catch {
            toast.error('Скиллди жаңыртууда ката кетти');
        }
    };

    const handleDeleteSkill = async (skillId) => {
        requestConfirmation({
            title: 'Скиллди өчүрүү',
            message: 'Бул скилди өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteSkill(skillId);
                    setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
                    toast.success('Скилл ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('Скилди өчүрүүдө ката кетти');
                }
            },
        });
    };

    // AI Prompt management handlers
    const handleCreatePrompt = async () => {
        if (!newPromptText.trim()) return;
        try {
            await addCourseAiPrompt(aiPromptCourseId, {
                text: newPromptText.trim(),
                language: newPromptLanguage,
                order: Number(newPromptOrder),
                isActive: newPromptIsActive,
            });
            setNewPromptText('');
            setNewPromptLanguage('ky');
            setNewPromptOrder(0);
            setNewPromptIsActive(true);
            toast.success('AI промпт ийгиликтүү кошулду');
            // Reload prompts to show new one
            loadPromptsForCourse(aiPromptCourseId);
        } catch {
            toast.error('AI промпт кошууда ката кетти');
        }
    };

    const handleUpdatePrompt = async (promptId, updates) => {
        try {
            await updateCourseAiPrompt(promptId, updates);
            setAiPrompts((prev) => prev.map((prompt) =>
                prompt.id === promptId ? { ...prompt, ...updates } : prompt
            ));
            toast.success('AI промпт ийгиликтүү жаңыртылды');
        } catch {
            toast.error('AI промптти жаңыртууда ката кетти');
        }
    };

    const handleDeletePrompt = async (promptId) => {
        requestConfirmation({
            title: 'AI промптти өчүрүү',
            message: 'Бул AI промптти өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteCourseAiPrompt(promptId);
                    setAiPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));
                    toast.success('AI промпт ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('AI промптти өчүрүүдө ката кетти');
                }
            },
        });
    };

    const handleApprovePendingCourse = async (courseId) => {
        try {
            await markCourseApproved(courseId);
            setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
            toast.success('Курс ийгиликтүү бекитилди');
        } catch {
            toast.error('Курсту бекитүүдө ката кетти');
        }
    };

    const handleRejectPendingCourse = async (courseId) => {
        try {
            await markCourseRejected(courseId);
            setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
            toast.success('Курс баш тартылган тизмеге жылдырылды');
        } catch {
            toast.error('Курстан баш тартууда ката кетти');
        }
    };

    // Notification management handlers
    const markNotificationRead = async (notificationId) => {
        try {
            await markNotificationReadApi(notificationId);
            toast.success('Билдирүү окулган деп белгиленди');
        } catch {
            toast.error('Билдирүүнү окулган деп белгилөөдө ката кетти');
        }
    };

    const deleteNotification = async (notificationId) => {
        requestConfirmation({
            title: 'Билдирүүнү өчүрүү',
            message: 'Бул билдирүүнү өчүрүүгө ишенимдүүсүзбү?',
            confirmLabel: 'Өчүрүү',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    setContacts((prev) => prev.filter((contact) => contact.id !== notificationId));
                    toast.success('Билдирүү ийгиликтүү өчүрүлдү');
                } catch {
                    toast.error('Билдирүүнү өчүрүүдө ката кетти');
                }
            },
        });
    };

    // Effects for loading data based on active tab
    useEffect(() => {
        if (activeTab === 'courses' || activeTab === 'ai-prompts') {
            loadCoursesAndCategories();
        }
        if (activeTab === 'contacts') {
            loadContacts();
        }
        if (activeTab === 'pending') {
            loadPendingCourses();
        }
        if (activeTab === 'companies') {
            loadCompanies();
        }
        if (activeTab === 'courses') {
            loadUsersForEnrollment();
        }
    }, [activeTab, loadCoursesAndCategories, loadContacts, loadPendingCourses, loadCompanies, loadUsersForEnrollment]);

    useEffect(() => {
        if (activeTab === 'stats' && !adminStatsLoaded) {
            loadAdminStats();
        }
        if (activeTab === 'skills') {
            loadSkillsList();
        }
    }, [activeTab, adminStatsLoaded, loadAdminStats, loadSkillsList]);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab, loadUsers]);

    useEffect(() => {
        if (activeTab === 'ai-prompts' && courses.length && !aiPromptCourseId) {
            setAiPromptCourseId(courses[0].id);
        }
    }, [activeTab, courses, aiPromptCourseId]);

    useEffect(() => {
        if (activeTab === 'ai-prompts' && aiPromptCourseId) {
            loadPromptsForCourse(aiPromptCourseId);
        }
    }, [activeTab, aiPromptCourseId, loadPromptsForCourse]);

    useEffect(() => {
        if (activeTab === 'companies') {
            loadCompanies();
        }
    }, [companySearch, activeTab, loadCompanies]);

    // Transcode status polling
    useEffect(() => {
        if (activeTranscodes.length === 0) return;

        const interval = setInterval(async () => {
            const updates = await Promise.all(
                activeTranscodes.map(async (t) => {
                    try {
                        const status = await getTranscodeStatus({
                            courseId: t.courseId,
                            sectionId: t.sectionId,
                            lessonId: t.lessonId,
                        });
                        return { ...t, status: status.playbackStatus, jobStatus: status.jobStatus };
                    } catch (e) {
                        return t;
                    }
                })
            );

            // Remove completed/failed transcodes from polling
            const stillProcessing = updates.filter(
                (u) => u.status === 'processing' && !['COMPLETE', 'ERROR', 'CANCELED'].includes(u.jobStatus)
            );

            // Show toast for completed/failed and refresh courses
            let shouldRefreshCourses = false;
            updates.forEach((u) => {
                if (u.status === 'ready' && !u.notified) {
                    toast.success(`Lesson ${u.lessonId} transcode complete`);
                    u.notified = true;
                    shouldRefreshCourses = true;
                } else if (u.status === 'failed' && !u.notified) {
                    toast.error(`Lesson ${u.lessonId} transcode failed`);
                    u.notified = true;
                }
            });

            // Refresh courses to get updated playbackStatus for completed transcodes
            if (shouldRefreshCourses) {
                loadCoursesAndCategories();
            }

            setActiveTranscodes(stillProcessing);
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [activeTranscodes, loadCoursesAndCategories]);

    // Anti-flickering wrapper for tab content
    const renderTab = () => {
        const isLoading = adminStatsLoading || aiPromptsLoading || transcodeLoading;
        const isDataLoaded = true; // Admin data is generally loaded on mount

        // For tab switching, show content with overlay if loading
        if (isLoading && isDataLoaded) {
            return (
                <div className="relative">
                    {renderTabContent()}
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-edubot-orange w-5 h-5"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Жүктөлүүдө...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return renderTabContent();
    };

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'stats':
                return (
                    <AdminStatsTab
                        stats={adminStats}
                        loading={adminStatsLoading}
                        onRefresh={loadAdminStats}
                    />
                );

            case 'users':
                return (
                    <AdminUsersTab
                        users={users}
                        usersPage={usersPage}
                        usersTotalPages={usersTotalPages}
                        usersTotal={usersTotal}
                        search={search}
                        roleFilter={roleFilter}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        setSearch={setSearch}
                        setRoleFilter={setRoleFilter}
                        setDateFrom={setDateFrom}
                        setDateTo={setDateTo}
                        handleRoleChange={handleRoleChange}
                        handleDeleteUser={handleDeleteUser}
                        handleUsersPageChange={handleUsersPageChange}
                        renderUserPageButtons={renderUserPageButtons}
                    />
                );

            case 'courses':
                return (
                    <AdminCoursesTab
                        courses={courses}
                        categories={categories}
                        users={users}
                        newCategory={newCategory}
                        editingCategoryId={editingCategoryId}
                        editingCategoryName={editingCategoryName}
                        courseGroupsByCourseId={courseGroupsByCourseId}
                        selectedEnrollmentGroupIds={selectedEnrollmentGroupIds}
                        transcodeCourseId={transcodeCourseId}
                        transcodeSectionId={transcodeSectionId}
                        transcodeLessonId={transcodeLessonId}
                        transcodeLessonIds={transcodeLessonIds}
                        transcodeLoading={transcodeLoading}
                        setNewCategory={setNewCategory}
                        setEditingCategoryId={setEditingCategoryId}
                        setEditingCategoryName={setEditingCategoryName}
                        setSelectedEnrollmentGroupIds={setSelectedEnrollmentGroupIds}
                        setTranscodeCourseId={setTranscodeCourseId}
                        setTranscodeSectionId={setTranscodeSectionId}
                        setTranscodeLessonId={setTranscodeLessonId}
                        setTranscodeLessonIds={setTranscodeLessonIds}
                        handleDeleteCourse={handleDeleteCourse}
                        handleEnrollUser={handleEnrollUser}
                        handleAddCategory={handleAddCategory}
                        handleUpdateCategory={handleUpdateCategory}
                        handleDeleteCategory={handleDeleteCategory}
                        handleTranscode={handleTranscode}
                        handleBulkTranscode={handleBulkTranscode}
                    />
                );

            case 'companies':
                return (
                    <AdminCompaniesTab
                        companies={companies}
                        companySearch={companySearch}
                        setCompanySearch={setCompanySearch}
                        newCompanyName={newCompanyName}
                        setNewCompanyName={setNewCompanyName}
                        courses={courses}
                        onCreateCompany={handleCreateCompany}
                        onUpdateCompany={handleUpdateCompany}
                        onDeleteCompany={handleDeleteCompany}
                        onUploadCompanyLogo={handleUploadCompanyLogo}
                        onAssignCourseToCompany={handleAssignCourseToCompany}
                        onClearCourseCompany={handleClearCourseCompany}
                        onUnassignCourseFromCompany={handleUnassignCourseFromCompany}
                    />
                );

            case 'skills':
                return (
                    <AdminSkillsTab
                        skills={skills}
                        newSkillName={newSkillName}
                        setNewSkillName={setNewSkillName}
                        onCreateSkill={handleCreateSkill}
                        onUpdateSkill={handleUpdateSkill}
                        onDeleteSkill={handleDeleteSkill}
                    />
                );

            case 'ai-prompts':
                return (
                    <AdminAiPromptsTab
                        courses={courses}
                        aiPromptCourseId={aiPromptCourseId}
                        setAiPromptCourseId={setAiPromptCourseId}
                        newPromptText={newPromptText}
                        setNewPromptText={setNewPromptText}
                        newPromptLanguage={newPromptLanguage}
                        setNewPromptLanguage={setNewPromptLanguage}
                        newPromptOrder={newPromptOrder}
                        setNewPromptOrder={setNewPromptOrder}
                        newPromptIsActive={newPromptIsActive}
                        setNewPromptIsActive={setNewPromptIsActive}
                        aiPrompts={aiPrompts}
                        aiPromptsLoading={aiPromptsLoading}
                        onCreatePrompt={handleCreatePrompt}
                        onUpdatePrompt={handleUpdatePrompt}
                        onDeletePrompt={handleDeletePrompt}
                    />
                );

            case 'notifications':
                return (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                            <NotificationsWidget />
                        </div>
                        <div className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                            <NotificationsTab />
                        </div>
                    </div>
                );

            case 'contacts':
                return (
                    <AdminContactsTab
                        contacts={contacts}
                        onMarkRead={markNotificationRead}
                        onDelete={deleteNotification}
                    />
                );

            case 'pending':
                return (
                    <AdminPendingCoursesTab
                        pendingCourses={pendingCourses}
                        onApprove={handleApprovePendingCourse}
                        onReject={handleRejectPendingCourse}
                    />
                );

            case 'integration':
                return <IntegrationTab />;

            case 'attendance':
                return <AttendancePage embedded />;

            case 'analytics':
                return <AdminAnalyticsPage />;

            default:
                // For other tabs, render the original inline components
                // This maintains existing behavior while allowing gradual migration
                return null;
        }
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
            label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: 'secondary',
        },
    ];

    // Prepare header content
    const adminUser = {
        fullName: user?.fullName || 'Админ',
        email: user?.email || 'admin@edubot.kg',
    };

    const headerContent = (
        <DashboardHeader
            user={adminUser}
            role="admin"
            subtitle="Платформаны башкаруу жана көзөмөлдөө"
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

    return (
        <DashboardLayout
            role="admin"
            user={adminUser}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
            {renderTab()}

            {/* Floating Action Button */}
            <FloatingActionButton role="admin" />
            <ConfirmationModal
                isOpen={!!confirmation}
                onClose={closeConfirmation}
                onConfirm={confirmAndRun}
                title={confirmation?.title || 'Аракетти ырастоо'}
                message={confirmation?.message || ''}
                confirmLabel={confirmation?.confirmLabel || 'Ырастоо'}
                confirmVariant={confirmation?.confirmVariant || 'danger'}
            />
        </DashboardLayout>
    );
};

export default AdminPanel;

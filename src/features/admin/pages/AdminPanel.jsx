import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import FloatingActionButton from '../../../components/ui/FloatingActionButton';
import SkipNavigation from '../../../components/ui/SkipNavigation';
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
    fetchAdminStats,
    fetchSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    markNotificationRead as markNotificationReadApi,
} from '@services/api';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import toast from 'react-hot-toast';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import Loader from '@shared/ui/Loader';
import IntegrationTab from '@features/integration/components/IntegrationTab';
import AttendancePage from '../../../pages/Attendance';
import AdminAnalyticsPage from '../../../pages/AdminAnalytics';
import { isForbiddenError, parseApiError } from '@shared/api/error';

// Import extracted components
import AdminStatsTab from '../components/AdminStatsTab';
import AdminUsersTab from '../components/AdminUsersTab';
import AdminCoursesTab from '../components/AdminCoursesTab';

// Import constants and helpers
import { ADMIN_TABS, NAV_ITEMS, USERS_QUERY_KEYS } from '../utils/adminPanel.constants';
import { calculateVisiblePages, debounce } from '../utils/adminPanel.helpers';

const AdminPanel = () => {
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

    const [companies, setCompanies] = useState([]);
    const [companiesTotalPages, setCompaniesTotalPages] = useState(1);
    const [companySearch, setCompanySearch] = useState('');
    const [companyPage, setCompanyPage] = useState(1);
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
    const [transcodeLoading, setTranscodeLoading] = useState(false);

    const [adminStats, setAdminStats] = useState(null);
    const [adminStatsLoading, setAdminStatsLoading] = useState(false);
    const [adminStatsLoaded, setAdminStatsLoaded] = useState(false);

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

    const usersFiltersInitialized = useRef(false);
    const usersSearchInitialized = useRef(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Alt + shortcuts for navigation
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'm':
                        e.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.focus();
                            mainContent.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    case 'n':
                        e.preventDefault();
                        const navigation = document.querySelector('nav[role="navigation"]');
                        if (navigation) {
                            navigation.focus();
                            navigation.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        const searchInput = document.querySelector('input[placeholder*="издөө" i], input[type="search"]');
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
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
                    ? 'bg-blue-600 text-white border-blue-600 scale-110 ring-2 ring-blue-600/50'
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
            setCourses(coursesRes?.courses || []);
            setCategories(categoriesRes || []);
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
    const handleDeleteUser = async (id) => {
        if (window.confirm('Бул колдонуучуну өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteUser(id);
                setUsers((prev) => prev.filter((u) => u.id !== id));
                toast.success('Колдонуучу ийгиликтүү өчүрүлдү');
            } catch (error) {
                toast.error('Колдонуучуну өчүрүүдө ката кетти');
            }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
            toast.success('Роль ийгиликтүү өзгөртүлдү');
        } catch (error) {
            toast.error('Ролду өзгөртүүдө ката кетти');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Бул курсту өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteCourse(id);
                setCourses((prev) => prev.filter((c) => c.id !== id));
                toast.success('Курс ийгиликтүү өчүрүлдү');
            } catch (error) {
                toast.error('Курсту өчүрүүдө ката кетти');
            }
        }
    };

    const handleEnrollUser = async (userId, courseId) => {
        if (!userId) return;
        try {
            await enrollUserInCourse(userId, courseId);
            toast.success('Студент курска ийгиликтүү катталды');
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            toast.error('Категорияны жаңыртууда ката кетти');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Бул категорияны өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteCategory(id);
                setCategories((prev) => prev.filter((c) => c.id !== id));
                toast.success('Категория ийгиликтүү өчүрүлдү');
            } catch (error) {
                toast.error('Категорияны өчүрүүдө ката кетти');
            }
        }
    };

    const handleTranscode = async () => {
        if (!transcodeCourseId || !transcodeSectionId || !transcodeLessonId) {
            toast.error('Бардык ID полярын толтуруңуз');
            return;
        }
        setTranscodeLoading(true);
        try {
            await transcodeLessonHls({
                courseId: Number(transcodeCourseId),
                sectionId: Number(transcodeSectionId),
                lessonId: Number(transcodeLessonId),
            });
            toast.success('Транскоддоо ийгиликтүү башталды');
            setTranscodeCourseId('');
            setTranscodeSectionId('');
            setTranscodeLessonId('');
        } catch (error) {
            toast.error('Транскоддоодо ката кетти');
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
        } catch (error) {
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
        } catch (error) {
            toast.error('Компанияны жаңыртууда ката кетти');
        }
    };

    const handleDeleteCompany = async (companyId) => {
        if (window.confirm('Бул компанияны өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteCompany(companyId);
                setCompanies((prev) => prev.filter((company) => company.id !== companyId));
                toast.success('Компания ийгиликтүү өчүрүлдү');
            } catch (error) {
                toast.error('Компанияны өчүрүүдө ката кетти');
            }
        }
    };

    // Advanced company management handlers
    const handleAssignCourseToCompany = async (courseId, companyId) => {
        try {
            await assignCourseToCompany(courseId, companyId);
            toast.success('Курс компанияга ийгиликтүү таанды');
            // Reload courses to update company assignments
            loadCoursesAndCategories();
        } catch (error) {
            toast.error('Курс таандоодо ката кетти');
        }
    };

    const handleUnassignCourseFromCompany = async (courseId, companyId) => {
        try {
            await unassignCourseFromCompany(courseId, companyId);
            toast.success('Курс компаниядан ийгиликтүү алынды');
            // Reload courses to update company assignments
            loadCoursesAndCategories();
        } catch (error) {
            toast.error('Курс алындоодо ката кетти');
        }
    };

    const handleClearCourseCompany = async (courseId) => {
        if (window.confirm('Бул курстун бардык компания таандоолорун алырга ишенимдүүсүзбү?')) {
            try {
                await clearCourseCompany(courseId);
                toast.success('Курстун компания таандоолору тазаланды');
                // Reload courses to update company assignments
                loadCoursesAndCategories();
            } catch (error) {
                toast.error('Компания таандоолорду тазалоодо ката кетти');
            }
        }
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            toast.error('Скиллди жаңыртууда ката кетти');
        }
    };

    const handleDeleteSkill = async (skillId) => {
        if (window.confirm('Бул скилди өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteSkill(skillId);
                setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
                toast.success('Скилл ийгиликтүү өчүрүлдү');
            } catch (error) {
                toast.error('Скилди өчүрүүдө ката кетти');
            }
        }
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
        } catch (error) {
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
        } catch (error) {
            toast.error('AI промптти жаңыртууда ката кетти');
        }
    };

    const handleDeletePrompt = async (promptId) => {
        if (window.confirm('Бул AI промптти өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteCourseAiPrompt(promptId);
                setAiPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));
                toast.success('AI промпт ийгиликтүү өчүрүлдү');
            } catch (error) {
                toast.error('AI промптти өчүрүүдө ката кетти');
            }
        }
    };

    // Notification management handlers
    const markNotificationRead = async (notificationId) => {
        try {
            await markNotificationReadApi(notificationId);
            toast.success('Билдирүү окулган деп белгиленди');
        } catch (error) {
            toast.error('Билдирүүнү окулган деп белгилөөдө ката кетти');
        }
    };

    const deleteNotification = async (notificationId) => {
        if (window.confirm('Бул билдирүүнү өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                // For contact messages, we'll remove from local state
                // In a real implementation, this would call a delete API
                setContacts((prev) => prev.filter((contact) => contact.id !== notificationId));
                toast.success('Билдирүү ийгиликтүү өчүрүлдү');
            } catch (error) {
                toast.error('Билдирүүнү өчүрүүдө ката кетти');
            }
        }
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
                                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-5 h-5"></div>
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
                        transcodeCourseId={transcodeCourseId}
                        transcodeSectionId={transcodeSectionId}
                        transcodeLessonId={transcodeLessonId}
                        transcodeLoading={transcodeLoading}
                        setNewCategory={setNewCategory}
                        setEditingCategoryId={setEditingCategoryId}
                        setEditingCategoryName={setEditingCategoryName}
                        setTranscodeCourseId={setTranscodeCourseId}
                        setTranscodeSectionId={setTranscodeSectionId}
                        setTranscodeLessonId={setTranscodeLessonId}
                        handleDeleteCourse={handleDeleteCourse}
                        handleEnrollUser={handleEnrollUser}
                        handleAddCategory={handleAddCategory}
                        handleUpdateCategory={handleUpdateCategory}
                        handleDeleteCategory={handleDeleteCategory}
                        handleTranscode={handleTranscode}
                    />
                );

            case 'companies':
                return (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4">Компаниялар</h2>

                        {/* Company Creation */}
                        <div className="flex gap-2 mb-4">
                            <input
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg w-full bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                                placeholder="Жаңы компаниянын аталышы"
                            />
                            <button
                                onClick={handleCreateCompany}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    ➕ Компания кошуу
                                </span>
                            </button>
                        </div>

                        {/* Company Search */}
                        <div className="flex gap-2 mb-4">
                            <input
                                value={companySearch}
                                onChange={(e) => setCompanySearch(e.target.value)}
                                className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg w-full bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                                placeholder="Компаниянын аталышы боюнча издөө"
                            />
                        </div>

                        {/* Company List */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2 text-left">Аты</th>
                                        <th className="p-2 text-left">Каттоолор</th>
                                        <th className="p-2 text-left">Аракеттер</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((company) => (
                                        <tr key={company.id} className="border-b">
                                            <td className="p-2">{company.name}</td>
                                            <td className="p-2">{company.enrollmentCount || 0}</td>
                                            <td className="p-2">
                                                <div className="flex gap-2 flex-wrap">
                                                    {/* Basic Actions */}
                                                    <button
                                                        onClick={() => {
                                                            const newName = prompt('Компаниянын жаңы аталышы:', company.name);
                                                            if (newName && newName !== company.name) {
                                                                handleUpdateCompany(company.id, newName);
                                                            }
                                                        }}
                                                        className="text-blue-500 hover:underline text-xs"
                                                    >
                                                        Өзгөртүү
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCompany(company.id)}
                                                        className="text-red-500 hover:underline text-xs"
                                                    >
                                                        Өчүрүү
                                                    </button>

                                                    {/* Advanced Actions */}
                                                    <div className="border-l border-gray-300 pl-2 ml-2">
                                                        <button
                                                            onClick={() => {
                                                                const fileInput = document.createElement('input');
                                                                fileInput.type = 'file';
                                                                fileInput.accept = 'image/*';
                                                                fileInput.onchange = (e) => {
                                                                    if (e.target.files[0]) {
                                                                        handleUploadCompanyLogo(company.id, e.target.files[0]);
                                                                    }
                                                                };
                                                                fileInput.click();
                                                            }}
                                                            className="text-green-500 hover:underline text-xs"
                                                        >
                                                            Логотип жүктөө
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Course Assignment Section */}
                        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Курс таандоолор</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Курстарды компанияларга таандоңуз үчүн бөлүмү
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.slice(0, 6).map((course) => (
                                    <div key={course.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm">{course.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    Азыркы компания: {course.company?.name || 'Таандылган эмес'}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <select
                                                    value={course.company?.id || ''}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAssignCourseToCompany(course.id, e.target.value);
                                                        } else {
                                                            handleClearCourseCompany(course.id);
                                                        }
                                                    }}
                                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                                >
                                                    <option value="">Компания тандаңыз</option>
                                                    {companies.map((company) => (
                                                        <option key={company.id} value={company.id}>
                                                            {company.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {course.company?.id && (
                                                    <button
                                                        onClick={() => handleUnassignCourseFromCompany(course.id, course.company.id)}
                                                        className="text-xs text-red-500 hover:underline"
                                                    >
                                                        Алынды
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'skills':
                return (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4">Скиллдер</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg w-full bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                                placeholder="Жаңы скиллдин аталышы"
                            />
                            <button
                                onClick={handleCreateSkill}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    ➕ Кошуу
                                </span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2 text-left">Скилл</th>
                                        <th className="p-2 text-left">Аракеттер</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skills.map((skill) => (
                                        <tr key={skill.id} className="border-b">
                                            <td className="p-2">{skill.name}</td>
                                            <td className="p-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const newName = prompt('Скиллдин жаңы аталышы:', skill.name);
                                                            if (newName && newName !== skill.name) {
                                                                handleUpdateSkill(skill.id, newName);
                                                            }
                                                        }}
                                                        className="text-blue-500 hover:underline mr-2"
                                                    >
                                                        Өзгөртүү
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSkill(skill.id)}
                                                        className="text-red-500 hover:underline"
                                                    >
                                                        Өчүрүү
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'ai-prompts':
                return (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4">AI Промпттар</h2>
                        <div className="mb-4">
                            <label className="block text-sm mb-2">Курс тандаңыз</label>
                            <select
                                value={aiPromptCourseId || ''}
                                onChange={(e) => setAiPromptCourseId(e.target.value)}
                                className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg w-full bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                            >
                                <option value="">Курс тандаңыз</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm mb-2">Жаңы промпт</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPromptText}
                                    onChange={(e) => setNewPromptText(e.target.value)}
                                    className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg flex-1 bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                                    placeholder="Промпт текстин киргизиңиз"
                                />
                                <select
                                    value={newPromptLanguage}
                                    onChange={(e) => setNewPromptLanguage(e.target.value)}
                                    className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                                >
                                    <option value="ky">Кыргызча</option>
                                    <option value="ru">Русский</option>
                                    <option value="en">English</option>
                                </select>
                                <select
                                    value={newPromptOrder}
                                    onChange={(e) => setNewPromptOrder(e.target.value)}
                                    className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                                >
                                    <option value="0">Жогорку</option>
                                    <option value="1">Ортосу</option>
                                    <option value="2">Аягы</option>
                                </select>
                                <input
                                    type="checkbox"
                                    checked={newPromptIsActive}
                                    onChange={(e) => setNewPromptIsActive(e.target.checked)}
                                    className="ml-2"
                                />
                                <label className="text-sm">Активдүү</label>
                            </div>
                            <button
                                onClick={handleCreatePrompt}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    ➕ Промпт кошуу
                                </span>
                            </button>
                        </div>
                        {aiPromptsLoading ? (
                            <div className="py-6">
                                <Loader fullScreen={false} />
                            </div>
                        ) : aiPrompts.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left">Промпт</th>
                                            <th className="p-2 text-left">Тил</th>
                                            <th className="p-2 text-left">Тартип</th>
                                            <th className="p-2 text-left">Аракеттер</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {aiPrompts.map((prompt) => (
                                            <tr key={prompt.id} className="border-b">
                                                <td className="p-2">{prompt.text}</td>
                                                <td className="p-2">{prompt.language}</td>
                                                <td className="p-2">{prompt.order}</td>
                                                <td className="p-2">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const newText = prompt('AI промпттин жаңы текстин киргизиңиз:', prompt.text);
                                                                const newLanguage = prompt('Тил (ky/ru/en):', prompt.language);
                                                                const newOrder = prompt('Тартип (0/1/2):', prompt.order.toString());
                                                                const newActive = confirm('Активдүү өзгөртүүбү?', prompt.isActive ? 'Yes' : 'No');

                                                                if (newText !== prompt.text || newLanguage !== prompt.language || newOrder !== prompt.order.toString() || newActive !== (prompt.isActive ? 'Yes' : 'No')) {
                                                                    handleUpdatePrompt(prompt.id, {
                                                                        text: newText,
                                                                        language: newLanguage,
                                                                        order: Number(newOrder),
                                                                        isActive: newActive === 'Yes',
                                                                    });
                                                                }
                                                            }}
                                                            className="text-blue-500 hover:underline mr-2"
                                                        >
                                                            Өзгөртүү
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePrompt(prompt.id)}
                                                            className="text-red-500 hover:underline"
                                                        >
                                                            Өчүрүү
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                                AI промпттар табылган жок
                            </p>
                        )}
                    </div>
                );

            case 'notifications':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                            <NotificationsWidget />
                        </div>
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                            <NotificationsTab />
                        </div>
                    </div>
                );

            case 'contacts':
                return (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4">Байланыштар</h2>
                        {contacts.length ? (
                            <ul className="space-y-3">
                                {contacts.map((contact) => (
                                    <li key={contact.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50 dark:bg-[#1B1B1B]">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-[#E8ECF3] truncate">
                                                    {contact.subject || contact.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                                    {contact.email}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => markNotificationRead(contact.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
                                                >
                                                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                        ✅ Окулган деп белгилөө
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => deleteNotification(contact.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 group"
                                                >
                                                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                        ❌ Өчүрүү
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-[#a6adba] p-4 border border-dashed rounded-2xl">
                                Байланыштар табылган жок.
                            </p>
                        )}
                    </div>
                );

            case 'pending':
                return (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4">Каралуудагы курстар</h2>
                        {pendingCourses.length ? (
                            <ul className="space-y-3">
                                {pendingCourses.map((course) => (
                                    <li key={course.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50 dark:bg-[#1B1B1B]">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-[#E8ECF3] truncate">
                                                    {course.title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                                    Окутуучу: {course.instructor?.fullName || '—'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => markCourseApproved(course.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 group"
                                                >
                                                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                        ✅ Бекитүү
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => markCourseRejected(course.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 group"
                                                >
                                                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                        ❌ Баш тартуу
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-[#a6adba] p-4 border border-dashed rounded-2xl">
                                Каралуудагы курстар табылган жок.
                            </p>
                        )}
                    </div>
                );

            case 'integration':
                return <IntegrationTab />;

            case 'attendance':
                return (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <AttendancePage embedded />
                    </div>
                );

            case 'analytics':
                return (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <AdminAnalyticsPage />
                    </div>
                );

            default:
                // For other tabs, render the original inline components
                // This maintains existing behavior while allowing gradual migration
                return null;
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <SkipNavigation />
            <div className="max-w-7xl mx-auto flex gap-6 px-4 pb-12">
                <DashboardSidebar
                    items={NAV_ITEMS}
                    activeId={activeTab}
                    onSelect={handleTabSelect}
                    isOpen={sidebarOpen}
                    onToggle={setSidebarOpen}
                    defaultOpen
                    toggleLabels={{ collapse: 'Менюну жыйуу', expand: 'Меню' }}
                />

                <div
                    className="flex-1 space-y-6"
                    id="main-content"
                    tabIndex={-1}
                    role="main"
                    aria-label="Админ панель мазмуну"
                >
                    {/* Extracted tab content */}
                    {renderTab()}
                </div>

                {/* Floating Action Button */}
                <FloatingActionButton role="admin" />
            </div>
        </div>
    );
};

export default AdminPanel;

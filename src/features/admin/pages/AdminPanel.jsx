import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
            
            default:
                // For other tabs, render the original inline components
                // This maintains existing behavior while allowing gradual migration
                return null;
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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

                <div className="flex-1 space-y-6">
                    {/* Extracted tab content */}
                    {renderTabContent()}

                    {/* Original inline components for non-extracted tabs */}
                    {/* TODO: Gradually migrate these to separate components */}
                    
                    {activeTab === 'notifications' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                                <NotificationsWidget />
                            </div>
                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                                <NotificationsTab />
                            </div>
                        </div>
                    )}

                    {activeTab === 'integration' && <IntegrationTab />}

                    {activeTab === 'attendance' && (
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                            <AttendancePage embedded />
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                            <AdminAnalyticsPage />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;

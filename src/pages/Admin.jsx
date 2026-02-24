// AdminPanel.jsx — with Companies tab added (KY labels kept)
import { useEffect, useState, useCallback, useRef } from 'react';
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
} from '@services/api';
import { Link, useSearchParams } from 'react-router-dom';
import {
    FiUsers,
    FiBookOpen,
    FiMail,
    FiClock,
    FiBriefcase,
    FiCpu,
    FiBell,
    FiBarChart2,
} from 'react-icons/fi';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import toast from 'react-hot-toast';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import Loader from '@shared/ui/Loader';

const AdminPanel = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [pendingCourses, setPendingCourses] = useState([]);

    // ✅ Companies state
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
    const [newPromptIsGlobal, setNewPromptIsGlobal] = useState(false);
    const [editingPromptId, setEditingPromptId] = useState(null);
    const [transcodeCourseId, setTranscodeCourseId] = useState('');
    const [transcodeSectionId, setTranscodeSectionId] = useState('');
    const [transcodeLessonId, setTranscodeLessonId] = useState('');
    const [transcodeLoading, setTranscodeLoading] = useState(false);
    const [adminStats, setAdminStats] = useState(null);
    const [adminStatsLoading, setAdminStatsLoading] = useState(false);
    const [adminStatsLoaded, setAdminStatsLoaded] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
    const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
    const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

    const initialUsersPage = Number(searchParams.get('page')) || 1;
    const [usersPage, setUsersPage] = useState(initialUsersPage);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [usersTotal, setUsersTotal] = useState(0);
    const usersFiltersInitialized = useRef(false);
    const usersSearchInitialized = useRef(false);
    const usersPageInitialized = useRef(false);
    const pendingUsersPageRef = useRef(null);
    const lastUsersFetchKeyRef = useRef(null);
    const lastSearchRef = useRef(search);
    const lastFilterRef = useRef({
        role: roleFilter,
        dateFrom,
        dateTo,
    });

    const [activeTab, setActiveTab] = useState('stats'); // stats | users | courses | contacts | pending | companies | ai-prompts | notifications

    const NAV_ITEMS = [
        { id: 'stats', label: 'Статистика', icon: FiBarChart2 },
        { id: 'users', label: 'Колдонуучулар', icon: FiUsers },
        { id: 'courses', label: 'Курстар & Категориялар', icon: FiBookOpen },
        { id: 'contacts', label: 'Байланыш каттары', icon: FiMail },
        { id: 'pending', label: 'Каралуудагы курстар', icon: FiClock },
        { id: 'companies', label: 'Компаниялар', icon: FiBriefcase },
        { id: 'ai-prompts', label: 'AI сунуштары', icon: FiCpu },
        { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell },
    ];

    const updateSearchParams = useCallback(
        (params) => {
            setSearchParams((prev) => {
                const updated = new URLSearchParams(prev);
                Object.entries(params).forEach(([key, value]) => {
                    if (value) updated.set(key, value);
                    else updated.delete(key);
                });
                return updated;
            });
        },
        [setSearchParams]
    );

    const loadAdminStats = useCallback(async () => {
        setAdminStatsLoading(true);
        try {
            const data = await fetchAdminStats();
            setAdminStats(data || {});
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
            toast.error('Статистика жүктөлгөн жок.');
        } finally {
            setAdminStatsLoading(false);
            setAdminStatsLoaded(true);
        }
    }, []);

    const loadCoursesAndCategories = useCallback(async () => {
        try {
            const coursesRes = await fetchCourses();
            const categoriesRes = await fetchCategories();
            setCourses(coursesRes.courses);
            setCategories(categoriesRes);
        } catch (error) {
            console.error('Failed to fetch courses/categories:', error);
            toast.error('Курстар/категорияларды жүктөө катасы.');
        }
    }, []);

    const loadContacts = useCallback(async () => {
        try {
            const res = await fetchContactMessages();
            setContacts(res);
        } catch (error) {
            console.error(error);
            toast.error('Байланыш каттарын жүктөө катасы.');
        }
    }, []);

    const loadUsers = useCallback(async () => {
        const key = JSON.stringify({
            p: usersPage,
            s: search,
            r: roleFilter,
            df: dateFrom,
            dt: dateTo,
        });
        if (lastUsersFetchKeyRef.current === key) return;
        lastUsersFetchKeyRef.current = key;
        try {
            const res = await fetchUsers({
                page: usersPage,
                limit: 20,
                search,
                role: roleFilter,
                dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
                dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
            });
            setUsers(res.data);
            setUsersTotal(res?.total ?? res?.data?.length ?? 0);
            const fallbackTotalPages =
                res?.total && res?.data?.length
                    ? Math.max(1, Math.ceil(res.total / res.data.length))
                    : 1;
            setUsersTotalPages(res?.totalPages ?? fallbackTotalPages);
        } catch (error) {
            console.error(error);
            toast.error('Колдонуучуларды жүктөө катасы.');
        }
    }, [usersPage, search, roleFilter, dateFrom, dateTo]);

    const loadPendingCourses = useCallback(async () => {
        try {
            const data = await getPendingCourses();
            setPendingCourses(data);
            toast.success('Каралуудагы курстар жүктөлдү.');
        } catch (error) {
            console.error(error);
            toast.error('Каралуудагы курстарды жүктөө катасы.');
        }
    }, []);

    const handleTranscode = useCallback(async () => {
        if (!transcodeCourseId || !transcodeSectionId || !transcodeLessonId) {
            toast.error('Course, section, жана lesson ID киргизиңиз');
            return;
        }
        setTranscodeLoading(true);
        try {
            await transcodeLessonHls({
                courseId: Number(transcodeCourseId),
                sectionId: Number(transcodeSectionId),
                lessonId: Number(transcodeLessonId),
            });
            toast.success('HLS транс коддоо башталды');
        } catch (error) {
            const message =
                error?.response?.data?.message || error?.message || 'Транс коддоо катасы';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setTranscodeLoading(false);
        }
    }, [transcodeCourseId, transcodeSectionId, transcodeLessonId]);

    // ✅ Companies loader
    const loadCompanies = useCallback(
        async (p = companyPage, q = companySearch) => {
            try {
                const { items, totalPages } = await listCompanies({ page: p, limit: 12, q });
                setCompanies(items || []);
                setCompaniesTotalPages(totalPages || 1);
            } catch {
                toast.error('Компанияларды жүктөө катасы.');
            }
        },
        [companyPage, companySearch]
    );

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Бул курсту өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteCourse(id);
                setCourses((prev) => prev.filter((c) => c.id !== id));
                toast.success('Курс өчүрүлдү.');
            } catch (error) {
                console.error(error);
                toast.error('Курс өчүрүү катасы.');
            }
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Бул категорияны өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteCategory(id);
                setCategories((prev) => prev.filter((cat) => cat.id !== id));
                toast.success('Категория өчүрүлдү.');
            } catch (error) {
                console.error(error);
                toast.error('Категория өчүрүү катасы.');
            }
        }
    };

    const handleUpdateCategory = async (id) => {
        try {
            await updateCategory(id, { name: editingCategoryName });
            setCategories((prev) =>
                prev.map((cat) => (cat.id === id ? { ...cat, name: editingCategoryName } : cat))
            );
            setEditingCategoryId(null);
            setEditingCategoryName('');
            toast.success('Категория жаңыртылды.');
        } catch (error) {
            console.error(error);
            toast.error('Категорияны жаңыртуу катасы.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Бул колдонуучуну өчүрүүгө ишенимдүүсүзбү?')) {
            try {
                await deleteUser(id);
                setUsers((prev) => prev.filter((u) => u.id !== id));
                toast.success('Колдонуучу өчүрүлдү.');
            } catch (error) {
                console.error(error);
                toast.error('Колдонуучуну өчүрүү катасы.');
            }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
            toast.success('Роль жаңыртылды.');
        } catch (error) {
            console.error(error);
            toast.error('Роль жаңыртуу катасы.');
        }
    };

    const handleEnrollUser = async (userId, courseId) => {
        if (window.confirm(`Колдонуучу #${userId} курс #${courseId} га жазылсынбы?`)) {
            try {
                await enrollUserInCourse(userId, courseId);
                toast.success('Колдонуучу ийгиликтүү жазылды.');
            } catch (error) {
                console.error(error);
                toast.error('Жазууда ката кетти.');
            }
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const category = await createCategory({ name: newCategory.trim() });
            setCategories((prev) => [...prev, category]);
            setNewCategory('');
            toast.success('Категория кошулду.');
        } catch (error) {
            console.error(error);
            toast.error('Категория кошуу катасы.');
        }
    };

    const handleMarkCourseApproved = async (courseId) => {
        try {
            await markCourseApproved(courseId);
            toast.success('Курс тастыкталды жана жарыяланды.');
            setPendingCourses((prev) => prev.filter((c) => c.id !== courseId));
        } catch (error) {
            console.error(error);
            toast.error('Курсту тастыктоо катасы.');
        }
    };

    const handleMarkCourseRejected = async (courseId) => {
        try {
            await markCourseRejected(courseId);
            toast.success('Курс жокко чыгарылды.');
            setPendingCourses((prev) => prev.filter((c) => c.id !== courseId));
        } catch (error) {
            console.error(error);
            toast.error('Курсту жокко чыгаруу катасы.');
        }
    };

    // ✅ Create company quick action
    const handleCreateCompany = async (e) => {
        e.preventDefault();
        const name = newCompanyName.trim();
        if (!name) return;
        try {
            await createCompany({ name });
            setNewCompanyName('');
            toast.success('Компания түзүлдү.');
            setCompanyPage(1);
            setCompanySearch('');
            loadCompanies(1, '');
        } catch (error) {
            console.error(error);
            toast.error('Компания түзүү катасы.');
        }
    };

    const loadPromptsForCourse = useCallback(async (courseId) => {
        if (!courseId) return;
        setAiPromptsLoading(true);
        try {
            const data = await fetchCourseAiPrompts(courseId);
            setAiPrompts(data || []);
        } catch (error) {
            console.error('Failed to load prompts:', error);
            toast.error('AI сунуштарын жүктөө катасы.');
        } finally {
            setAiPromptsLoading(false);
        }
    }, []);

    // Tab-driven loaders
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
    }, [activeTab, loadCoursesAndCategories, loadContacts, loadPendingCourses, loadCompanies]);

    useEffect(() => {
        if (activeTab === 'stats' && !adminStatsLoaded) {
            loadAdminStats();
        }
    }, [activeTab, adminStatsLoaded, loadAdminStats]);

    // Sync page from URL when landing on Users tab (e.g., back/forward)
    useEffect(() => {
        if (activeTab !== 'users') return;
        const pageFromUrl = Number(searchParams.get('page')) || 1;
        if (pendingUsersPageRef.current !== null) {
            if (pageFromUrl === pendingUsersPageRef.current && pageFromUrl !== usersPage) {
                setUsersPage(pageFromUrl);
            }
            if (pageFromUrl === pendingUsersPageRef.current) {
                pendingUsersPageRef.current = null;
            }
            return;
        }
        if (!usersPageInitialized.current) {
            usersPageInitialized.current = true;
            setUsersPage(pageFromUrl);
            return;
        }
        if (pageFromUrl !== usersPage) {
            setUsersPage(pageFromUrl);
        }
    }, [activeTab, searchParams, usersPage]);

    // Remove page query when leaving Users tab
    useEffect(() => {
        if (activeTab !== 'users') {
            updateSearchParams({ page: undefined });
        }
    }, [activeTab, updateSearchParams]);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab, loadUsers]);

    const handleUsersPageChange = useCallback(
        (nextPage) => {
            if (nextPage < 1) return;
            pendingUsersPageRef.current = nextPage;
            setUsersPage(nextPage);
            updateSearchParams({
                search,
                role: roleFilter,
                dateFrom,
                dateTo,
                page: nextPage,
            });
        },
        [dateFrom, dateTo, roleFilter, search, updateSearchParams]
    );

    // Debounce for Users search
    useEffect(() => {
        if (activeTab !== 'users') return;
        if (!usersSearchInitialized.current) {
            usersSearchInitialized.current = true;
            lastSearchRef.current = search;
            return;
        }
        if (search === lastSearchRef.current) return;
        lastSearchRef.current = search;
        const delayDebounce = setTimeout(() => {
            if (search.length >= 3 || search === '') {
                setUsersPage(1);
                updateSearchParams({
                    search,
                    role: roleFilter,
                    dateFrom,
                    dateTo,
                    page: 1,
                });
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [activeTab, dateFrom, dateTo, roleFilter, search, updateSearchParams]);

    // Users filters (role/date) -> reset page & sync params
    useEffect(() => {
        if (activeTab !== 'users') return;
        if (!usersFiltersInitialized.current) {
            usersFiltersInitialized.current = true;
            lastFilterRef.current = { role: roleFilter, dateFrom, dateTo };
            return;
        }
        const last = lastFilterRef.current;
        if (
            last.role === roleFilter &&
            last.dateFrom === dateFrom &&
            last.dateTo === dateTo
        ) {
            return;
        }
        lastFilterRef.current = { role: roleFilter, dateFrom, dateTo };
        setUsersPage(1);
        updateSearchParams({
            search,
            role: roleFilter,
            dateFrom,
            dateTo,
            page: 1,
        });
    }, [activeTab, roleFilter, dateFrom, dateTo, search, updateSearchParams]);

    // Debounce for Companies search
    useEffect(() => {
        if (activeTab !== 'companies') return;
        const t = setTimeout(() => {
            setCompanyPage(1);
            loadCompanies(1, companySearch);
        }, 400);
        return () => clearTimeout(t);
    }, [companySearch, activeTab, loadCompanies]);

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

    const resetPromptForm = () => {
        setNewPromptText('');
        setNewPromptOrder(0);
        setNewPromptIsActive(true);
        setNewPromptIsGlobal(false);
        setNewPromptLanguage('ky');
        setEditingPromptId(null);
    };

    const handleEditPrompt = (prompt) => {
        setEditingPromptId(prompt.id);
        setNewPromptText(prompt.text || '');
        setNewPromptLanguage(prompt.language || 'ky');
        setNewPromptOrder(prompt.order ?? 0);
        setNewPromptIsActive(prompt.isActive ?? true);
        setNewPromptIsGlobal(prompt.isGlobal ?? false);
    };

    const handleCreatePrompt = async (e) => {
        e.preventDefault();
        if (!aiPromptCourseId) {
            toast.error('Курс тандаңыз.');
            return;
        }
        if (!newPromptText.trim()) {
            toast.error('Сунуш текстин жазыңыз.');
            return;
        }
        const payload = {
            text: newPromptText.trim(),
            language: newPromptLanguage,
            order: Number(newPromptOrder) || 0,
            isActive: newPromptIsActive,
            isGlobal: newPromptIsGlobal,
        };

        try {
            if (editingPromptId) {
                await updateCourseAiPrompt(aiPromptCourseId, editingPromptId, payload);
                toast.success('Сунуш жаңыртылды.');
            } else {
                await addCourseAiPrompt(aiPromptCourseId, payload);
                toast.success('Сунуш кошулду.');
            }
            resetPromptForm();
            loadPromptsForCourse(aiPromptCourseId);
        } catch (error) {
            console.error(error);
            toast.error('Сунушту сактоо катасы.');
        }
    };

    const handleDeletePrompt = async (promptId) => {
        if (!aiPromptCourseId) return;
        if (!window.confirm('Бул AI сунушту өчүрүүнү каалайсызбы?')) return;
        try {
            await deleteCourseAiPrompt(aiPromptCourseId, promptId);
            toast.success('Сунуш өчүрүлдү.');
            if (editingPromptId === promptId) {
                resetPromptForm();
            }
            loadPromptsForCourse(aiPromptCourseId);
        } catch (error) {
            console.error(error);
            toast.error('Сунушту өчүрүү катасы.');
        }
    };

    const renderUserPageButtons = () => {
        if (usersTotalPages <= 1) return null;
        const maxButtons = 10;
        let start = Math.max(1, usersPage - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;
        if (end > usersTotalPages) {
            end = usersTotalPages;
            start = Math.max(1, end - maxButtons + 1);
        }
        const pages = [];
        for (let p = start; p <= end; p += 1) {
            pages.push(
                <button
                    key={p}
                    type="button"
                    onClick={() => handleUsersPageChange(p)}
                    className={`w-9 h-9 rounded border text-sm font-medium transition ${
                        p === usersPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    {p}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A]">
            <div className="max-w-7xl mx-auto flex gap-6 px-4 pb-12">
                <DashboardSidebar
                    items={NAV_ITEMS}
                    activeId={activeTab}
                    onSelect={setActiveTab}
                    isOpen={sidebarOpen}
                    onToggle={setSidebarOpen}
                    className="flex-shrink-0"
                    toggleLabels={{ collapse: 'Менюну жыйуу', expand: '' }}
                />

                <main className="flex-1 space-y-6 ">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E8ECF3]">Админ Панель</h1>
                            <p className="text-sm text-gray-500">
                                Платформанын бардык секцияларына көзөмөл
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="hidden md:inline-flex px-4 py-2 rounded-full border text-sm text-gray-600 dark:text-[#E8ECF3]"
                        >
                            {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                        </button>
                    </div>
                    {activeTab === 'notifications' && (
                        <>
                            <NotificationsWidget />
                            <NotificationsTab />
                        </>
                    )}
                    {activeTab === 'stats' && (
                        <AdminStatsView
                            stats={adminStats}
                            loading={adminStatsLoading}
                            onRefresh={loadAdminStats}
                        />
                    )}

                    {activeTab === 'contacts' && (
                        <div className="bg-white shadow rounded p-4">
                            <h2 className="text-2xl font-semibold mb-4">Байланыш Каттары</h2>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2">Аты</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Телефон</th>
                                        <th className="p-2">Каттар</th>
                                        <th className="p-2">Келген күнү</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((c) => (
                                        <tr key={c.id} className="border-b">
                                            <td className="p-2">{c.name}</td>
                                            <td className="p-2">{c.email}</td>
                                            <td className="p-2">{c.phone}</td>
                                            <td className="p-2">{c.message}</td>
                                            <td className="p-2">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white shadow rounded p-4">
                                <h2 className="text-2xl font-semibold mb-4">Курстар</h2>
                                <ul className="space-y-3">
                                    {courses.map((course) => (
                                        <li key={course.id} className="border p-3 rounded">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{course.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Окутуучу: {course.instructor?.fullName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/courses/${course.id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Көрүү
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteCourse(course.id)
                                                        }
                                                        className="text-red-600 hover:underline"
                                                    >
                                                        Өчүрүү
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <label className="text-sm">
                                                    Колдонуучуну курска жазуу:
                                                </label>
                                                <select
                                                    onChange={(e) =>
                                                        handleEnrollUser(e.target.value, course.id)
                                                    }
                                                    className="ml-2 px-2 py-1 border rounded"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>
                                                        Колдонуучуну тандаңыз
                                                    </option>
                                                    {users.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.fullName} ({u.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </li>
                                    ))}
                                    {courses.length === 0 && (
                                        <li className="text-center text-gray-500 p-4 border rounded">
                                            Курстар табылган жок.
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-white shadow rounded p-4">
                                <h2 className="text-2xl font-semibold mb-4">Категориялар</h2>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="border px-2 py-1 rounded w-full"
                                        placeholder="Жаңы категориянын аталышы"
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        className="bg-blue-600 text-white px-4 py-1 rounded"
                                    >
                                        Кошуу
                                    </button>
                                </div>
                                <ul className="space-y-3">
                                    {categories.map((category) => (
                                        <li
                                            key={category.id}
                                            className="border p-3 rounded flex justify-between items-center"
                                        >
                                            {editingCategoryId === category.id ? (
                                                <>
                                                    <input
                                                        value={editingCategoryName}
                                                        onChange={(e) =>
                                                            setEditingCategoryName(e.target.value)
                                                        }
                                                        className="border px-2 py-1 rounded w-full mr-2"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateCategory(category.id)
                                                        }
                                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                                    >
                                                        Сактоо
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{category.name}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCategoryId(category.id);
                                                                setEditingCategoryName(
                                                                    category.name
                                                                );
                                                            }}
                                                            className="text-blue-600"
                                                        >
                                                            Өзгөртүү
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteCategory(category.id)
                                                            }
                                                            className="text-red-600"
                                                        >
                                                            Өчүрүү
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white shadow rounded p-4">
                                <h2 className="text-2xl font-semibold mb-4">HLS транс коддоо</h2>
                                <p className="text-sm text-gray-600 mb-3">
                                    MP4 сабакты HLSке айландыруу үчүн Course / Section / Lesson ID
                                    киргизиңиз.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <input
                                        type="number"
                                        placeholder="Course ID"
                                        value={transcodeCourseId}
                                        onChange={(e) => setTranscodeCourseId(e.target.value)}
                                        className="border rounded px-3 py-2"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Section ID"
                                        value={transcodeSectionId}
                                        onChange={(e) => setTranscodeSectionId(e.target.value)}
                                        className="border rounded px-3 py-2"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Lesson ID"
                                        value={transcodeLessonId}
                                        onChange={(e) => setTranscodeLessonId(e.target.value)}
                                        className="border rounded px-3 py-2"
                                    />
                                </div>
                                <button
                                    onClick={handleTranscode}
                                    disabled={transcodeLoading}
                                    className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-60"
                                >
                                    {transcodeLoading ? <Loader fullScreen={false} /> : 'Транс коддоо'}
                                </button>
                                <p className="text-xs text-gray-500 mt-2">
                                    ffmpeg серверде орнотулган болушу керек.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'companies' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white shadow rounded p-4 space-y-3">
                                <h2 className="text-2xl font-semibold">Компанияларды издөө</h2>
                                <input
                                    value={companySearch}
                                    onChange={(e) => setCompanySearch(e.target.value)}
                                    className="border px-3 py-2 rounded w-full"
                                    placeholder="Компаниянын аталышы"
                                />
                                <ul className="space-y-3">
                                    {companies.map((c) => (
                                        <li
                                            key={c.id}
                                            className="border rounded p-3 flex items-center justify-between"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-semibold truncate">
                                                    {c.name}
                                                </div>
                                                {c.about && (
                                                    <div className="text-sm text-gray-600 line-clamp-1">
                                                        {c.about}
                                                    </div>
                                                )}
                                            </div>
                                            <Link
                                                to={`/companies/${c.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Ачуу
                                            </Link>
                                        </li>
                                    ))}
                                    {companies.length === 0 && (
                                        <li className="text-center text-gray-500 p-6 border rounded">
                                            Компаниялар табылган жок.
                                        </li>
                                    )}
                                </ul>

                                <div className="flex gap-2 justify-center">
                                    {Array.from(
                                        { length: companiesTotalPages },
                                        (_, i) => i + 1
                                    ).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => {
                                                setCompanyPage(p);
                                                loadCompanies(p, companySearch);
                                            }}
                                            className={`px-3 py-1 border rounded ${p === companyPage ? 'bg-blue-600 text-white' : ''}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white shadow rounded p-4 space-y-4">
                                <h2 className="text-2xl font-semibold">Жаңы компания кошуу</h2>
                                <form onSubmit={handleCreateCompany} className="space-y-3">
                                    <input
                                        value={newCompanyName}
                                        onChange={(e) => setNewCompanyName(e.target.value)}
                                        className="border px-3 py-2 rounded w-full"
                                        placeholder="Компаниянын аталышы"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                                    >
                                        Кошуу
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai-prompts' && (
                        <div className="bg-white shadow rounded-2xl p-6 space-y-6">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-[240px]">
                                    <label className="text-sm font-semibold text-gray-600">
                                        Курс тандаңыз
                                    </label>
                                    <select
                                        value={aiPromptCourseId || ''}
                                        onChange={(e) =>
                                            setAiPromptCourseId(Number(e.target.value))
                                        }
                                        className="mt-1 w-full border rounded px-3 py-2"
                                    >
                                        <option value="">Курс...</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() =>
                                        aiPromptCourseId && loadPromptsForCourse(aiPromptCourseId)
                                    }
                                    className="px-4 py-2 rounded-full bg-gray-100 text-sm"
                                >
                                    Жаңыртуу
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreatePrompt}
                                className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4"
                            >
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-600">
                                        AI сунуш
                                    </label>
                                    <textarea
                                        value={newPromptText}
                                        onChange={(e) => setNewPromptText(e.target.value)}
                                        className="mt-1 w-full border rounded px-3 py-2 text-sm"
                                        rows={3}
                                        placeholder="Суроо же сунуш текстин жазыңыз..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                        Тил
                                    </label>
                                    <select
                                        value={newPromptLanguage}
                                        onChange={(e) => setNewPromptLanguage(e.target.value)}
                                        className="mt-1 w-full border rounded px-3 py-2"
                                    >
                                        <option value="ky">Кыргызча</option>
                                        <option value="ru">Русский</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                        Тартип
                                    </label>
                                    <input
                                        type="number"
                                        value={newPromptOrder}
                                        onChange={(e) => setNewPromptOrder(e.target.value)}
                                        className="mt-1 w-full border rounded px-3 py-2"
                                    />
                                </div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={newPromptIsActive}
                                        onChange={(e) => setNewPromptIsActive(e.target.checked)}
                                    />
                                    Активдүү
                                </label>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={newPromptIsGlobal}
                                        onChange={(e) => setNewPromptIsGlobal(e.target.checked)}
                                    />
                                    Глобалдык
                                </label>
                                <div className="md:col-span-2 flex justify-end gap-3">
                                    {editingPromptId && (
                                        <button
                                            type="button"
                                            className="px-5 py-2 rounded-full border text-sm text-gray-600"
                                            onClick={resetPromptForm}
                                        >
                                            Баш тартуу
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm"
                                    >
                                        {editingPromptId ? 'Сактоо' : 'Сунуш кошуу'}
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-3">
                                {aiPromptsLoading ? (
                                    <Loader fullScreen={false} />
                                ) : aiPrompts.length ? (
                                    aiPrompts.map((prompt) => (
                                        <div
                                            key={prompt.id}
                                            className="border rounded-2xl p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold">{prompt.text}</p>
                                                <div className="text-xs text-gray-500 flex flex-wrap gap-3 mt-1">
                                                    <span>Тил: {prompt.language}</span>
                                                    <span>Тартип: {prompt.order}</span>
                                                    <span>
                                                        {prompt.courseId
                                                            ? 'Курс үчүн'
                                                            : 'Глобалдык'}
                                                    </span>
                                                    {!prompt.isActive && (
                                                        <span className="text-red-500">
                                                            Өчүрүлгөн
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditPrompt(prompt)}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Өзгөртүү
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrompt(prompt.id)}
                                                    className="text-sm text-red-500 hover:underline"
                                                >
                                                    Өчүрүү
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 text-sm">
                                        Бул курс үчүн сунуштар табылган жок.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white dark:bg-black shadow rounded p-4">
                            <h2 className="text-2xl font-semibold mb-4">Колдонуучулар</h2>
                            <div className="flex flex-wrap gap-4 mb-4 items-end">
                                <input
                                    type="text"
                                    placeholder="Ат же Email боюнча издөө"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                                />
                                <div className="flex flex-wrap gap-2 items-end">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                                    >
                                        <option value="">Бардык ролдор</option>
                                        <option value="student">Студент</option>
                                        <option value="instructor">Окутуучу</option>
                                        <option value="sales">Сатуу</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                                    />
                                </div>
                            </div>
                            <table className="w-full text-left text-sm ">
                                <thead>
                                    <tr className="border-b ">
                                        <th className="p-2">Аты</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Роль</th>
                                        <th className="p-2">Аракеттер</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b">
                                            <td className="p-2">{user.fullName}</td>
                                            <td className="p-2">{user.email}</td>
                                            <td className="p-2">{user.role}</td>
                                            <td className="p-2 flex gap-2">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) =>
                                                        handleRoleChange(user.id, e.target.value)
                                                    }
                                                    className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                                                >
                                                    <option value="student">Студент</option>
                                                    <option value="instructor">Окутуучу</option>
                                                    <option value="sales">Сатуу</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Өчүрүү
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                    Баракча {usersPage} / {usersTotalPages} · Бардыгы:{' '}
                                    {usersTotal}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleUsersPageChange(usersPage - 1)}
                                        disabled={usersPage <= 1}
                                        className="px-3 py-2 rounded border text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Алдыңкы
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {renderUserPageButtons()}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleUsersPageChange(usersPage + 1)}
                                        disabled={usersPage >= usersTotalPages}
                                        className="px-3 py-2 rounded border text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Кийинки
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pending' && (
                        <div className="bg-white shadow rounded p-4">
                            <h2 className="text-2xl font-semibold mb-4">Каралуудагы курстар</h2>
                            <ul className="space-y-3">
                                {pendingCourses.map((course) => (
                                    <li
                                        key={course.id}
                                        className="border rounded p-3 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold">{course.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {course.instructor?.fullName}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleMarkCourseApproved(course.id)}
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                            >
                                                Тастыктоо
                                            </button>
                                            <button
                                                onClick={() => handleMarkCourseRejected(course.id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                Жокко чыгаруу
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const AdminStatsView = ({ stats, loading, onRefresh }) => {
    const totals = stats?.totals || {};
    const growth = stats?.growth || {};
    const activity = stats?.activity || {};
    const revenue = stats?.revenue || {};
    const trends = stats?.trends || {};
    const topCourses = Array.isArray(stats?.topCourses) ? stats.topCourses : [];

    const formatNumber = (value) =>
        Number(value ?? 0).toLocaleString('ru-RU', {
            maximumFractionDigits: 0,
        });
    const formatPercent = (value) => `${Math.round(Number(value ?? 0))}%`;
    const formatCurrency = (value) =>
        `${Number(value ?? 0).toLocaleString('ru-RU', {
            maximumFractionDigits: 0,
        })} сом`;

    if (loading && !stats) {
        return (
            <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <Loader fullScreen={false} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Акыркы 7 күн
                    </p>
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Платформанын статистикасы
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Жалпы көрсөткүчтөр, активдүүлүк жана тренддер
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <GrowthBadge label="Жаңы студенттер" value={growth.newStudents7d} tone="blue" />
                    <GrowthBadge label="Каттоолор" value={growth.enrollments7d} tone="emerald" />
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-[#E8ECF3] dark:border-gray-700 bg-white dark:bg-[#111111] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Жүктөлүүдө...' : 'Жаңыртуу'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <MetricCard label="Студенттер" value={formatNumber(totals.students)} />
                <MetricCard label="Курстар" value={formatNumber(totals.courses)} />
                <MetricCard
                    label="Жарияланган курстар"
                    value={formatNumber(totals.publishedCourses)}
                />
                <MetricCard label="Жалпы каттоолор" value={formatNumber(totals.enrollments)} />
                <MetricCard
                    label="Активдүү каттоолор"
                    value={formatNumber(totals.activeEnrollments)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    label="Даяр киреше (жалпы)"
                    value={formatCurrency(revenue.total)}
                    accent="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    sub="Бардык убакыт"
                />
                <MetricCard
                    label="Акыркы 30 күн"
                    value={formatCurrency(revenue.last30d)}
                    accent="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    sub="Ревеню"
                />
                <MetricCard
                    label="Курс аяктоо көрсөткүчү"
                    value={formatPercent(activity.courseCompletionRate)}
                    accent="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    sub={`Активдүү: ${formatNumber(activity.activeStudents7d || 0)} (7к) | ${formatNumber(
                        activity.activeStudents30d || 0
                    )} (30к)`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TrendCard
                    title="Күнүмдүк каттоо (студент)"
                    series={trends.dailySignups7d}
                    color="#2563EB"
                />
                <TrendCard
                    title="Күнүмдүк enrollments"
                    series={trends.dailyEnrollments7d}
                    color="#10B981"
                />
            </div>

            <TopCoursesTable
                courses={topCourses}
                formatNumber={formatNumber}
                formatPercent={formatPercent}
                formatCurrency={formatCurrency}
                loading={loading}
            />
        </div>
    );
};

const MetricCard = ({ label, value, accent, sub }) => (
    <div
        className={`rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm ${
            accent || 'bg-white dark:bg-[#1B1B1B]'
        }`}
    >
        <p className={`text-sm ${accent ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
            {label}
        </p>
        <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-[#E8ECF3]">{value}</p>
        {sub ? <p className="text-xs mt-1 text-white/80 dark:text-gray-400">{sub}</p> : null}
    </div>
);

const GrowthBadge = ({ label, value, tone = 'blue' }) => {
    const toneMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
        emerald:
            'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
    };
    const classes = toneMap[tone] || toneMap.blue;
    return (
        <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${classes}`}
        >
            <span className="inline-flex h-2 w-2 rounded-full bg-current" aria-hidden />
            <span className="font-medium">+{Number(value ?? 0).toLocaleString('ru-RU')}</span>
            <span className="text-xs opacity-70">{label}</span>
        </span>
    );
};

const TrendCard = ({ title, series, color }) => {
    const safeSeries = Array.isArray(series) && series.length ? series : [{ date: '—', count: 0 }];
    const latest = safeSeries[safeSeries.length - 1];
    return (
        <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        {(latest?.count ?? 0).toLocaleString('ru-RU')}
                    </p>
                </div>
                <span className="text-xs text-gray-400">7 күн</span>
            </div>
            <Sparkline series={safeSeries} color={color} />
            <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                {safeSeries.map((point) => (
                    <span key={point.date} className="truncate">
                        {point.date?.slice(5) || '—'}
                    </span>
                ))}
            </div>
        </div>
    );
};

const Sparkline = ({ series, color = '#2563EB' }) => {
    const width = 100;
    const height = 40;
    const maxVal = Math.max(...series.map((p) => Number(p.count) || 0), 1);
    const points = series
        .map((point, idx) => {
            const x = (idx / Math.max(series.length - 1, 1)) * width;
            const y = height - ((Number(point.count) || 0) / maxVal) * (height - 6) - 3;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 text-blue-600">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points || `0,${height / 2} ${width},${height / 2}`}
            />
        </svg>
    );
};

const TopCoursesTable = ({ courses, formatNumber, formatPercent, formatCurrency, loading }) => (
    <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Алдыңкы курстар</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                    Активдүүлүк & киреше
                </h3>
            </div>
        </div>
        <div className="overflow-x-auto">
            {loading ? (
                <div className="py-6">
                    <Loader fullScreen={false} />
                </div>
            ) : courses.length ? (
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 dark:text-gray-400 text-left">
                            <th className="py-2 pr-3 font-medium">Курс</th>
                            <th className="py-2 pr-3 font-medium">Каттоолор</th>
                            <th className="py-2 pr-3 font-medium">Активдүү (7к)</th>
                            <th className="py-2 pr-3 font-medium">Аяктоо</th>
                            <th className="py-2 pr-3 font-medium">Ревеню</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {courses.map((course) => (
                            <tr key={course.courseId || course.title}>
                                <td className="py-2 pr-3 font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                    {course.title}
                                </td>
                                <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                    {formatNumber(course.enrollments)}
                                </td>
                                <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                    {formatNumber(course.activeStudents7d)}
                                </td>
                                <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                    {formatPercent(course.completionRate)}
                                </td>
                                <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                    {formatCurrency(course.revenueTotal)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                    Алдыңкы курстар дагы жок.
                </p>
            )}
        </div>
    </div>
);

export default AdminPanel;

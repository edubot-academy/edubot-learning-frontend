// AdminPanel.jsx — with Companies tab added (KY labels kept)
import { useEffect, useState, useCallback } from 'react';
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
} from '@services/api';
import { Link, useSearchParams } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiMail, FiClock, FiBriefcase, FiCpu } from 'react-icons/fi';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import toast from 'react-hot-toast';

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

    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
    const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
    const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

    const [activeTab, setActiveTab] = useState('users'); // users | courses | contacts | pending | companies | ai-prompts

    const NAV_ITEMS = [
        { id: 'users', label: 'Колдонуучулар', icon: FiUsers },
        { id: 'courses', label: 'Курстар & Категориялар', icon: FiBookOpen },
        { id: 'contacts', label: 'Байланыш каттары', icon: FiMail },
        { id: 'pending', label: 'Каралуудагы курстар', icon: FiClock },
        { id: 'companies', label: 'Компаниялар', icon: FiBriefcase },
        { id: 'ai-prompts', label: 'AI сунуштары', icon: FiCpu },
    ];

    const updateSearchParams = useCallback(
        (params) => {
            const updated = new URLSearchParams(searchParams);
            Object.entries(params).forEach(([key, value]) => {
                if (value) updated.set(key, value);
                else updated.delete(key);
            });
            setSearchParams(updated);
        },
        [searchParams, setSearchParams]
    );

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
        try {
            const res = await fetchUsers({
                page,
                limit: 10,
                search,
                role: roleFilter,
                dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
                dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Колдонуучуларды жүктөө катасы.');
        }
    }, [page, search, roleFilter, dateFrom, dateTo]);

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
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab, loadUsers]);

    // Debounce for Users search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search.length >= 3 || search === '') {
                updateSearchParams({ search });
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [search, updateSearchParams]);

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
                    toggleLabels={{ collapse: 'Менюну жыйуу', expand: '' }}
                />

                <main className="flex-1 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Админ Панель</h1>
                            <p className="text-sm text-gray-500">
                                Платформанын бардык секцияларына көзөмөл
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="hidden md:inline-flex px-4 py-2 rounded-full border text-sm text-gray-600"
                        >
                            {sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү'}
                        </button>
                    </div>

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
                                    <p className="text-center text-gray-500">Жүктөлүүдө...</p>
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
                        <div className="bg-white shadow rounded p-4">
                            <h2 className="text-2xl font-semibold mb-4">Колдонуучулар</h2>
                            <div className="flex flex-wrap gap-4 mb-4 items-end">
                                <input
                                    type="text"
                                    placeholder="Ат же Email боюнча издөө"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border px-2 py-1 rounded"
                                />
                                <div className="flex flex-wrap gap-2 items-end">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="border px-2 py-1 rounded"
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
                                        className="border px-2 py-1 rounded"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="border px-2 py-1 rounded"
                                    />
                                </div>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
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
                                                    className="border px-2 py-1 rounded"
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

export default AdminPanel;

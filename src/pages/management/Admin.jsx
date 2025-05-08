// AdminPanel.jsx
import React, { useEffect, useState } from "react";
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
    fetchCompanies,
    updateUserCompany
} from "../../services/api";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminTabRenderer from "../../components/admin/AdminUsersTab";
import AdminTabSwitcher from "../../components/admin/AdminTabSwitcher";

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);

    const [newCategory, setNewCategory] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
    const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
    const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
    const [totalPages, setTotalPages] = useState(1);

    const updateSearchParams = (params) => {
        const updated = new URLSearchParams(searchParams);
        Object.entries(params).forEach(([key, value]) => {
            if (value) updated.set(key, value);
            else updated.delete(key);
        });
        setSearchParams(updated);
    };

    useEffect(() => {
        if (activeTab === 'courses') loadCoursesAndCategories();
        if (activeTab === 'contacts') loadContacts();
        if (activeTab === 'pending') loadPendingCourses();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
            loadCompanies();
        }
    }, [searchParams, activeTab]);

    const loadCoursesAndCategories = async () => {
        try {
            const coursesRes = await fetchCourses();
            const categoriesRes = await fetchCategories();
            setCourses(coursesRes.courses);
            setCategories(categoriesRes);
        } catch (error) {
            toast.error("Курстар же категориялар жүктөлгөн жок");
        }
    };

    const loadContacts = async () => {
        try {
            const res = await fetchContactMessages();
            setContacts(res);
        } catch (error) {
            toast.error("Байланыш каттары жүктөлгөн жок");
        }
    };

    const loadUsers = async () => {
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
            setTotalPages(res.totalPages);
        } catch {
            toast.error("Колдонуучулар жүктөлгөн жок");
        }
    };

    const loadCompanies = async () => {
        try {
            const res = await fetchCompanies();
            setCompanies(res.data);
        } catch {
            toast.error("Компаниялар жүктөлгөн жок");
        }
    };

    const loadPendingCourses = async () => {
        try {
            const data = await getPendingCourses();
            setPendingCourses(data);
        } catch {
            toast.error("Каралуудагы курстарды жүктөө катасы");
        }
    };

    return (
        <div className="min-h-screen p-6 pt-24 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Админ Панель</h1>

            <AdminTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

            <AdminTabRenderer
                activeTab={activeTab}
                users={users}
                companies={companies}
                courses={courses}
                categories={categories}
                contacts={contacts}
                pendingCourses={pendingCourses}
                usersProps={{
                    search,
                    setSearch,
                    roleFilter,
                    setRoleFilter,
                    dateFrom,
                    setDateFrom,
                    dateTo,
                    setDateTo,
                    page,
                    totalPages,
                    updateSearchParams,
                    handleRoleChange: async (id, role) => {
                        try {
                            await updateUserRole(id, role);
                            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
                            toast.success("Role жаңыртылды");
                        } catch {
                            toast.error("Role жаңыртуу катасы");
                        }
                    },
                    handleDeleteUser: async (id) => {
                        try {
                            await deleteUser(id);
                            setUsers((prev) => prev.filter((u) => u.id !== id));
                            toast.success("Колдонуучу өчүрүлдү");
                        } catch {
                            toast.error("Өчүрүү катасы");
                        }
                    },
                    handleApplyFilters: () => {
                        updateSearchParams({ role: roleFilter, dateFrom, dateTo, page: 1 });
                    },
                    handleAssignCompany: async (userId, companyId) => {
                        try {
                            await updateUserCompany(userId, companyId);
                            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, company: { id: Number(companyId) } } : u));
                            toast.success("Компания дайындалды");
                        } catch {
                            toast.error("Компания дайындоо катасы");
                        }
                    },
                }}
                coursesProps={{
                    newCategory,
                    editingCategoryId,
                    editingCategoryName,
                    setNewCategory,
                    setEditingCategoryId,
                    setEditingCategoryName,
                    handleAddCategory: async () => {
                        try {
                            const res = await createCategory({ name: newCategory });
                            setCategories((prev) => [...prev, res]);
                            setNewCategory("");
                            toast.success("Категория кошулду");
                        } catch {
                            toast.error("Ката: кошуу мүмкүн болбоду");
                        }
                    },
                    handleUpdateCategory: async (id) => {
                        try {
                            await updateCategory(id, { name: editingCategoryName });
                            setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: editingCategoryName } : c));
                            setEditingCategoryId(null);
                            setEditingCategoryName("");
                            toast.success("Категория жаңыртылды");
                        } catch {
                            toast.error("Жаңыртуу катасы");
                        }
                    },
                    handleDeleteCategory: async (id) => {
                        try {
                            await deleteCategory(id);
                            setCategories((prev) => prev.filter((c) => c.id !== id));
                            toast.success("Категория өчүрүлдү");
                        } catch {
                            toast.error("Өчүрүү катасы");
                        }
                    },
                    handleDeleteCourse: async (id) => {
                        try {
                            await deleteCourse(id);
                            setCourses((prev) => prev.filter((c) => c.id !== id));
                            toast.success("Курс өчүрүлдү");
                        } catch {
                            toast.error("Курс өчүрүү катасы");
                        }
                    },
                    handleEnrollUser: async (userId, courseId) => {
                        try {
                            await enrollUserInCourse(userId, courseId);
                            toast.success("Колдонуучу курска кошулду");
                        } catch {
                            toast.error("Кошуу катасы");
                        }
                    },
                }}
                pendingProps={{
                    handleMarkCourseApproved: async (id) => {
                        try {
                            await markCourseApproved(id);
                            setPendingCourses((prev) => prev.filter((c) => c.id !== id));
                            toast.success("Тастыкталды жана жарыяланды");
                        } catch {
                            toast.error("Тастыктоо катасы");
                        }
                    },
                    handleMarkCourseRejected: async (id) => {
                        try {
                            await markCourseRejected(id);
                            setPendingCourses((prev) => prev.filter((c) => c.id !== id));
                            toast.success("Жокко чыгарылды");
                        } catch {
                            toast.error("Жокко чыгаруу катасы");
                        }
                    },
                }}
            />
        </div>
    );
};

export default AdminPanel;

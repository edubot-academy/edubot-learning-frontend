// Cleaned and fixed version of АдминPanel.jsx
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
    markCourseApproved
} from "../services/api";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const AdminPanel = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [pendingCourses, setPendingCourses] = useState([]);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
    const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
    const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
        if (activeTab === 'courses') loadCoursesAndCategories();
        if (activeTab === 'contacts') loadContacts();
        if (activeTab === 'pending') loadPendingCourses();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
    }, [searchParams, activeTab]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search.length >= 3 || search === "") {
                updateSearchParams({ search });
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    const updateSearchParams = (params) => {
        const updated = new URLSearchParams(searchParams);
        Object.entries(params).forEach(([key, value]) => {
            if (value) updated.set(key, value);
            else updated.delete(key);
        });
        setSearchParams(updated);
    };

    const loadCoursesAndCategories = async () => {
        try {
            const coursesRes = await fetchCourses();
            const categoriesRes = await fetchCategories();
            setCourses(coursesRes.courses);
            setCategories(categoriesRes);
        } catch (error) {
            console.error("Failed to fetch courses/categories:", error);
        }
    };

    const loadContacts = async () => {
        try {
            const res = await fetchContactMessages();
            setContacts(res);
        } catch (error) {
            toast.error("Failed to load contact messages");
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
        } catch (err) {
            toast.error("Failed to load users.");
        }
    };


    const loadPendingCourses = async () => {
        try {
            const data = await getPendingCourses();
            setPendingCourses(data);
            toast.success("Pending курстарды жүктөө үчүн үйрөнүлгү");
        } catch (err) {
            toast.error("Pending курстарды жүктөө катасы");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                await deleteCourse(id);
                setCourses((prev) => prev.filter((c) => c.id !== id));
                toast.success("Course deleted.");
            } catch (err) {
                toast.error("Failed to delete course.");
            }
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id);
                setCategories((prev) => prev.filter((cat) => cat.id !== id));
                toast.success("Category deleted.");
            } catch (err) {
                toast.error("Failed to delete category.");
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
            setEditingCategoryName("");
            toast.success("Category updated.");
        } catch (err) {
            toast.error("Failed to update category.");
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                setUsers((prev) => prev.filter((u) => u.id !== id));
                toast.success("User deleted.");
            } catch (err) {
                toast.error("Failed to delete user.");
            }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
            toast.success("Role updated.");
        } catch (err) {
            toast.error("Failed to update role.");
        }
    };

    const handleEnrollUser = async (userId, courseId) => {
        if (window.confirm(`Enroll user #${userId} in course #${courseId}?`)) {
            try {
                await enrollUserInCourse(userId, courseId);
                toast.success("User enrolled successfully.");
            } catch (err) {
                toast.error("Failed to enroll user.");
            }
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const category = await createCategory({ name: newCategory.trim() });
            setCategories((prev) => [...prev, category]);
            setNewCategory("");
            toast.success("Category added.");
        } catch (err) {
            toast.error("Failed to add category.");
        }
    };

    const handleApplyFilters = () => {
        updateSearchParams({ role: roleFilter, dateFrom, dateTo, page: 1 });
    };

    const handleMarkCourseApproved = async (courseId) => {
        try {
            await markCourseApproved(courseId);
            toast.success("Course marked as approved and published.");
            setPendingCourses(prev => prev.filter(c => c.id !== courseId));
        } catch (err) {
            toast.error("Failed to mark course as approved and published.");
        }
    };

    return (
        <div className="min-h-screen p-6 pt-24 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Админ Панель</h1>

            <div className="flex justify-center gap-4 mb-8">
                <button className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('users')}>Колдонуучулар</button>
                <button className={`px-4 py-2 rounded ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('courses')}>Курстар жана Категориялар</button>
                <button className={`px-4 py-2 rounded ${activeTab === 'contacts' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('contacts')}>Байланыш Сообщениелери</button>
                <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Каралуудагы курстар</button>
            </div>

            {activeTab === 'contacts' && (
                <div className="bg-white shadow rounded p-4 mt-6">
                    <h2 className="text-2xl font-semibold mb-4">Байланыш Сообщениелери</h2>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Аты</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Телефон</th>
                                <th className="p-2">Сообщение</th>
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
                                    <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'courses' && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="text-2xl font-semibold mb-4">Курстар</h2>
                        <ul className="space-y-3">
                            {courses.map((course) => (
                                <li key={course.id} className="border p-3 rounded">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{course.title}</p>
                                            <p className="text-sm text-gray-500">Окутуучу: {course.instructor?.fullName}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/courses/${course.id}`} className="text-blue-600 hover:underline">Көрүү</Link>
                                            <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <label className="text-sm">Колдонуучуну курска жазуу:</label>
                                        <select onChange={(e) => handleEnrollUser(e.target.value, course.id)} className="ml-2 px-2 py-1 border rounded" defaultValue="">
                                            <option value="" disabled>Колдонуучуну тандаңыз</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white shadow rounded p-4">
                        <h2 className="text-2xl font-semibold mb-4">Категориялар</h2>
                        <div className="flex gap-2 mb-4">
                            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="border px-2 py-1 rounded w-full" placeholder="Жаңы категориянын аталышы" />
                            <button onClick={handleAddCategory} className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
                        </div>
                        <ul className="space-y-3">
                            {categories.map((cat) => (
                                <li key={cat.id} className="border p-3 rounded flex justify-between items-center gap-2">
                                    {editingCategoryId === cat.id ? (
                                        <>
                                            <input value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} className="border px-2 py-1 rounded w-full" />
                                            <button onClick={() => handleUpdateCategory(cat.id)} className="text-green-600 hover:underline">Сактоо</button>
                                            <button onClick={() => { setEditingCategoryId(null); setEditingCategoryName(""); }} className="text-gray-500 hover:underline">Жокко чыгаруу</button>
                                        </>
                                    ) : (
                                        <>
                                            <span>{cat.name}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} className="text-blue-600 hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:underline">Delete</button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'pending' && (
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-2xl font-semibold mb-4">Каралуудагы курстар</h2>
                    {pendingCourses.length === 0 ? (
                        <p>Азырынча курс жок.</p>
                    ) : (
                        <ul className="space-y-4">
                            {pendingCourses.map((course) => (
                                <li key={course.id} className="border p-4 rounded shadow flex justify-between items-center">
                                    <div>
                                        <h2 className="font-semibold text-lg">{course.title}</h2>
                                        <p className="text-sm text-gray-600">Окутуучу: {course.instructor?.fullName}</p>
                                    </div>
                                    <button
                                        onClick={() => handleMarkCourseApproved(course.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        Тастыктоо
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <div className="mt-10 bg-white shadow rounded p-4">
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
                            <button
                                onClick={handleApplyFilters}
                                className="bg-blue-600 text-white px-4 py-1 rounded"
                            >
                                Apply
                            </button>
                            <button
                                onClick={() => {
                                    setRoleFilter("");
                                    setDateFrom("");
                                    setDateTo("");
                                    updateSearchParams({ role: "", dateFrom: "", dateTo: "", page: 1 });
                                }}
                                className="bg-gray-300 text-black px-4 py-1 rounded"
                            >
                                Тазалоо
                            </button>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Аты</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Роли</th>
                                <th className="p-2">Катталган күнү</th>
                                <th className="p-2">Аракеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="p-2">{user.fullName}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2 capitalize">{user.role}</td>
                                    <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-2 flex gap-2 items-center">
                                        <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="border rounded px-2 py-1">
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="sales">Sales</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button key={p} onClick={() => updateSearchParams({ page: p })} className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : ''}`}>{p}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

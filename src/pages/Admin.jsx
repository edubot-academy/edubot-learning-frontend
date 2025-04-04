import React, { useEffect, useState } from "react";
import { fetchCourses, fetchCategories, fetchUsers, deleteCourse, deleteCategory, updateUserRole, deleteUser, enrollUserInCourse, updateCategory } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AdminPanel = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const coursesRes = await fetchCourses();
                const categoriesRes = await fetchCategories();
                const usersRes = await fetchUsers();
                setCourses(coursesRes.courses);
                setCategories(categoriesRes);
                setUsers(usersRes);
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
            }
        };

        loadData();
    }, []);

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
            setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, name: editingCategoryName } : cat));
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
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
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
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory.trim() }),
            });
            if (!response.ok) throw new Error();
            const created = await response.json();
            setCategories((prev) => [...prev, created]);
            setNewCategory("");
            toast.success("Category added.");
        } catch (err) {
            toast.error("Failed to add category.");
        }
    };

    return (
        <div className="min-h-screen p-6 pt-24 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Courses Panel */}
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-2xl font-semibold mb-4">Courses</h2>
                    <ul className="space-y-3">
                        {courses.map((course) => (
                            <li key={course.id} className="border p-3 rounded">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{course.title}</p>
                                        <p className="text-sm text-gray-500">Instructor: {course.instructor?.fullName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/courses/${course.id}`} className="text-blue-600 hover:underline">View</Link>
                                        <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:underline">Delete</button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="text-sm">Enroll a user:</label>
                                    <select
                                        onChange={(e) => handleEnrollUser(e.target.value, course.id)}
                                        className="ml-2 px-2 py-1 border rounded"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select User</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Categories Panel */}
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="border px-2 py-1 rounded w-full"
                            placeholder="New category name"
                        />
                        <button onClick={handleAddCategory} className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
                    </div>
                    <ul className="space-y-3">
                        {categories.map((cat) => (
                            <li key={cat.id} className="border p-3 rounded flex justify-between items-center gap-2">
                                {editingCategoryId === cat.id ? (
                                    <>
                                        <input
                                            value={editingCategoryName}
                                            onChange={(e) => setEditingCategoryName(e.target.value)}
                                            className="border px-2 py-1 rounded w-full"
                                        />
                                        <button
                                            onClick={() => handleUpdateCategory(cat.id)}
                                            className="text-green-600 hover:underline"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingCategoryId(null);
                                                setEditingCategoryName("");
                                            }}
                                            className="text-gray-500 hover:underline"
                                        >
                                            Cancel
                                        </button>
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

            {/* Users Panel */}
            <div className="mt-10 bg-white shadow rounded p-4">
                <h2 className="text-2xl font-semibold mb-4">Users</h2>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="p-2">{user.fullName}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2 capitalize">{user.role}</td>
                                <td className="p-2 flex gap-2 items-center">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="student">Student</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="sales">Sales</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
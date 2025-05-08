import React from 'react';
import { Link } from 'react-router-dom';

const AdminCoursesTab = ({
    courses,
    categories,
    users,
    newCategory,
    editingCategoryId,
    editingCategoryName,
    setNewCategory,
    setEditingCategoryId,
    setEditingCategoryName,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleDeleteCourse,
    handleEnrollUser,
}) => {
    return (
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
                                    <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:underline">Өчүрүү</button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <label className="text-sm">Колдонуучуну курска жазуу:</label>
                                <select
                                    onChange={(e) => handleEnrollUser(e.target.value, course.id)}
                                    className="ml-2 px-2 py-1 border rounded"
                                    defaultValue=""
                                >
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
                    {categories.map((cat) => (
                        <li key={cat.id} className="border p-3 rounded flex justify-between items-center gap-2">
                            {editingCategoryId === cat.id ? (
                                <>
                                    <input
                                        value={editingCategoryName}
                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                        className="border px-2 py-1 rounded w-full"
                                    />
                                    <button onClick={() => handleUpdateCategory(cat.id)} className="text-green-600 hover:underline">Сактоо</button>
                                    <button onClick={() => { setEditingCategoryId(null); setEditingCategoryName(""); }} className="text-gray-500 hover:underline">Жокко чыгаруу</button>
                                </>
                            ) : (
                                <>
                                    <span>{cat.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} className="text-blue-600 hover:underline">Түзөтүү</button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:underline">Өчүрүү</button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminCoursesTab;

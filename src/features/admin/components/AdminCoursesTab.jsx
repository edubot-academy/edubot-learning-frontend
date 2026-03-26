/* eslint-disable react/prop-types */
import { EmptyState } from '@components/ui/dashboard';
import { Link } from 'react-router-dom';
import Loader from '@shared/ui/Loader';

const AdminCoursesTab = ({
    courses,
    categories,
    users,
    newCategory,
    editingCategoryId,
    editingCategoryName,
    transcodeCourseId,
    transcodeSectionId,
    transcodeLessonId,
    transcodeLoading,
    setNewCategory,
    setEditingCategoryId,
    setEditingCategoryName,
    setTranscodeCourseId,
    setTranscodeSectionId,
    setTranscodeLessonId,
    handleDeleteCourse,
    handleEnrollUser,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleTranscode
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                    Курстар
                </h2>
                <ul className="space-y-3">
                    {courses.map((course) => (
                        <li
                            key={course.id}
                            className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50 dark:bg-[#1B1B1B]"
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-[#E8ECF3] truncate">
                                        {course.title}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                        Окутуучу: {course.instructor?.fullName || '—'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Link
                                        to={`/courses/${course.id}`}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Көрүү
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="text-red-500 hover:underline"
                                    >
                                        Өчүрүү
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="text-sm text-gray-500 dark:text-[#a6adba]">
                                    Колдонуучуну курска жазуу:
                                </label>
                                <select
                                    onChange={(e) => handleEnrollUser(e.target.value, course.id)}
                                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E0E0E] text-sm text-gray-900 dark:text-[#E8ECF3]"
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
                        <li className="p-8">
                            <EmptyState
                                title="Системада курстар жок"
                                subtitle="Платформада курстар жазылган эмес"
                            />
                        </li>
                    )}
                </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                    Категориялар
                </h2>
                <div className="flex gap-2 mb-4">
                    <input
                        value={newCategory || ''}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg w-full bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                        placeholder="Жаңы категориянын аталышы"
                    />
                    <button
                        onClick={handleAddCategory}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group"
                    >
                        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            ➕ Кошуу
                        </span>
                    </button>
                </div>

                <ul className="space-y-3">
                    {categories.map((category) => (
                        <li
                            key={category.id}
                            className="border border-gray-200 dark:border-gray-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-50 dark:bg-[#1B1B1B]"
                        >
                            {editingCategoryId === category.id ? (
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    <input
                                        value={editingCategoryName}
                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                        className="border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg flex-1 bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                                    />
                                    <button
                                        onClick={() => handleUpdateCategory(category.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 group"
                                    >
                                        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                            💾 Сактоо
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                        {category.name}
                                    </span>
                                    <div className="flex gap-3 text-sm">
                                        <button
                                            onClick={() => {
                                                setEditingCategoryId(category.id);
                                                setEditingCategoryName(category.name);
                                            }}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-all duration-300 transform hover:scale-105 group"
                                        >
                                            <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                                ✏️ Өзгөртүү
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-all duration-300 transform hover:scale-105 group"
                                        >
                                            <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                                🗑️ Өчүрүү
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white dark:bg-[#111111] shadow-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-[#E8ECF3]">
                    HLS транс коддоо
                </h2>
                <p className="text-sm text-gray-600 dark:text-[#a6adba] mb-3">
                    MP4 сабакты HLSке айландыруу үчүн Course / Section / Lesson ID киргизиңиз.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                        type="number"
                        placeholder="Course ID"
                        value={transcodeCourseId || ''}
                        onChange={(e) => setTranscodeCourseId(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                    />
                    <input
                        type="number"
                        placeholder="Section ID"
                        value={transcodeSectionId}
                        onChange={(e) => setTranscodeSectionId(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                    />
                    <input
                        type="number"
                        placeholder="Lesson ID"
                        value={transcodeLessonId || ''}
                        onChange={(e) => setTranscodeLessonId(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E] text-gray-900 dark:text-[#E8ECF3]"
                    />
                </div>
                <button
                    onClick={handleTranscode}
                    disabled={transcodeLoading}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 group disabled:hover:scale-100"
                >
                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        {transcodeLoading ? <Loader fullScreen={false} /> : '🔄 Транс коддоо'}
                    </span>
                </button>
                <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-2">
                    ffmpeg серверде орнотулган болушу керек.
                </p>
            </div>
        </div>
    );
};

export default AdminCoursesTab;

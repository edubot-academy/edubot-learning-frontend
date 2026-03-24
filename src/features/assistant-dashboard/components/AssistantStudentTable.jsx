import React from "react";
import AssistantCourseStats from "./AssistantCourseStats";
import AssistantPagination from "./AssistantPagination";

const AssistantStudentTable = ({
    students,
    totalStudents,
    enrolledStudents,
    courses,
    courseCounts,
    enrollmentsMap,
    courseSelections,
    coursesById,
    currentPage,
    totalPages,
    loading,
    search,
    setSearch,
    setCurrentPage,
    setCourseSelections,
    handleEnroll,
    handleUnenroll
}) => {
    return (
        <div className="relative">
            <div className="flex gap-6 mb-4 text-sm font-medium flex-wrap">
                <div>👥 Жалпы студенттер: {totalStudents}</div>
                <div>✅ Катталган студенттер: {enrolledStudents.length}</div>
                <div>🎓 Курстар: {courses.length}</div>
            </div>

            <div className="mb-4">
                <AssistantCourseStats
                    courses={courses}
                    courseCounts={courseCounts}
                    loading={loading}
                />
            </div>

            <div className="mb-6 max-w-md">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Студент атын же email изде..."
                        className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-edubot-orange focus:border-transparent transition-all duration-200 shadow-sm"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        disabled={loading}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <table className="w-full table-auto text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                                Студент
                            </th>
                            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                                Катталган курстар
                            </th>
                            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                                Курс тандаңыз
                            </th>
                            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                                Иш-аракет
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {students.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-[#a6adba] italic">
                                    Студент табылган жок
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => {
                                const selectedCourseId = courseSelections[student.id] || "";
                                const enrolledCourseIds = enrollmentsMap[student.id] || [];

                                const availableCourses = courses.filter(
                                    (course) => !enrolledCourseIds.includes(course.id)
                                );

                                const isDisabled =
                                    !selectedCourseId || availableCourses.length === 0 || loading;

                                return (
                                    <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="p-4 align-top">
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {student.fullName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-[#a6adba]">
                                                {student.email}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-[#a6adba]">
                                                {student.phoneNumber || "—"}
                                            </div>
                                        </td>

                                        <td className="p-4 align-top">
                                            {enrolledCourseIds.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {enrolledCourseIds.map((courseId) => {
                                                        const course = coursesById[courseId];
                                                        if (!course) return null;

                                                        return (
                                                            <span
                                                                key={courseId}
                                                                className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-2 py-1 rounded dark:bg-green-900/20 dark:border-green-700"
                                                            >
                                                                <span className="text-sm text-green-800 dark:text-green-200">{course.title}</span>
                                                                <button
                                                                    className="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
                                                                    onClick={() => handleUnenroll(student, courseId)}
                                                                    disabled={loading}
                                                                    title="Курстан чыгаруу"
                                                                >
                                                                    Чыгаруу
                                                                </button>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td className="p-4 align-top">
                                            {availableCourses.length > 0 ? (
                                                <select
                                                    className="w-full border p-2 rounded text-slate-900 dark:text-white bg-white dark:bg-gray-700 border-slate-200 dark:border-slate-600"
                                                    value={selectedCourseId}
                                                    onChange={(e) =>
                                                        setCourseSelections((prev) => ({
                                                            ...prev,
                                                            [student.id]: e.target.value ? Number(e.target.value) : "",
                                                        }))
                                                    }
                                                    disabled={loading}
                                                >
                                                    <option value="">-- Тандоо --</option>
                                                    {availableCourses.map((course) => (
                                                        <option key={course.id} value={course.id}>
                                                            {course.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-gray-500 dark:text-[#a6adba] italic">
                                                    Бардык курстарга катталган
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 align-top">
                                            <button
                                                className={`px-3 py-2 rounded text-white ${isDisabled
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    handleEnroll(student, selectedCourseId);
                                                }}
                                            >
                                                Каттоо
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <AssistantPagination
                currentPage={currentPage}
                totalPages={totalPages}
                loading={loading}
                setCurrentPage={setCurrentPage}
            />

            {loading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/50 flex items-center justify-center rounded-2xl">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default AssistantStudentTable;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    fetchUsers,
    fetchCourses,
    enrollUserInCourse,
    checkEnrollments
} from '../../services/api';
import toast from 'react-hot-toast';

const AssistantDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [search, setSearch] = useState('');
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseCounts, setCourseCounts] = useState({});
    const [enrollmentsMap, setEnrollmentsMap] = useState({});
    const [courseSelections, setCourseSelections] = useState({});
    const [discounts, setDiscounts] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const debounceRef = useRef();

    const loadStudentsAndCourses = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, coursesRes] = await Promise.all([
                fetchUsers({ role: 'student', page: currentPage, limit: itemsPerPage, search }),
                fetchCourses(),
            ]);

            const studentsData = usersRes.data || [];
            setStudents(studentsData);
            setTotalStudents(usersRes.total || studentsData.length);
            setTotalPages(usersRes.totalPages || 1);

            const published = coursesRes.courses.filter(c => c.isPublished);
            setCourses(published);

            const courseIds = published.map(c => c.id);
            const userIds = studentsData.map(s => s.id);
            const map = await checkEnrollments(courseIds, userIds);
            setEnrollmentsMap(map);

            const counts = {};
            const enrolledSet = new Set();
            courseIds.forEach(courseId => {
                counts[courseId] = 0;
                for (const studentId in map) {
                    if (map[studentId].includes(courseId)) {
                        counts[courseId]++;
                        enrolledSet.add(Number(studentId));
                    }
                }
            });
            setCourseCounts(counts);
            setEnrolledStudents(studentsData.filter(s => enrolledSet.has(s.id)));
        } catch {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, search]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (search.length === 0 || search.length >= 3) {
                loadStudentsAndCourses();
            }
        }, 500);
        return () => clearTimeout(debounceRef.current);
    }, [search, currentPage, loadStudentsAndCourses]);

    const filteredStudents = students;

    return (
        <div className="pt-20 p-6 relative">
            <h2 className="text-2xl font-bold mb-4">📘 Assistant Dashboard</h2>

            <div className="flex gap-6 mb-4 text-sm font-medium flex-wrap">
                <div>👥 Жалпы студенттер: {totalStudents}</div>
                <div>✅ Катталган студенттер: {enrolledStudents.length}</div>
                <div>🎓 Курстар: {courses.length}</div>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700">
                {courses.map(course => (
                    <div key={course.id} className="bg-gray-100 px-3 py-1 rounded">
                        {course.title}: {course.enrolledStudents || 0} студент
                    </div>
                ))}
            </div>

            <div className="mb-4 max-w-md">
                <input
                    type="text"
                    placeholder="Студент атын же email изде..."
                    className="border px-3 py-2 rounded w-full"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Студент</th>
                            <th className="p-2 border">Катталган курстар</th>
                            <th className="p-2 border">Курс тандаңыз</th>
                            <th className="p-2 border">Иш-аракет</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500 italic">
                                    Студент табылган жок
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map(student => {
                                const selectedCourseId = courseSelections[student.id] || '';
                                const enrolledCourseIds = enrollmentsMap[student.id] || [];
                                const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
                                const isDisabled = !selectedCourseId || availableCourses.length === 0;

                                return (
                                    <tr key={student.id}>
                                        <td className="p-2 border">
                                            {student.fullName}
                                            <br />
                                            <span className="text-xs text-gray-500">{student.email}</span>
                                            <br />
                                            <span className="text-xs text-gray-500">{student.phoneNumber || '—'}</span>
                                        </td>
                                        <td className="p-2 border">
                                            {enrolledCourseIds
                                                .map(id => courses.find(c => c.id === id)?.title)
                                                .filter(Boolean)
                                                .join(', ') || '—'}
                                        </td>
                                        <td className="p-2 border">
                                            {availableCourses.length > 0 ? (
                                                <select
                                                    className="w-full border p-1 rounded"
                                                    value={selectedCourseId}
                                                    onChange={e => setCourseSelections(prev => ({
                                                        ...prev,
                                                        [student.id]: Number(e.target.value),
                                                    }))}
                                                    disabled={loading}
                                                >
                                                    <option value="">-- Курс тандаңыз--</option>
                                                    {availableCourses.map(c => (
                                                        <option key={c.id} value={c.id}>{c.title}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-gray-500 italic">
                                                    Бардык курстарга катталган
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2 border">
                                            <button
                                                className={`px-3 py-1 rounded text-white ${isDisabled
                                                    ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'
                                                    : 'bg-blue-600 hover:bg-blue-700'}`}
                                                disabled={isDisabled || loading}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    const courseTitle = courses.find(c => c.id === selectedCourseId)?.title;
                                                    toast(t => (
                                                        <div>
                                                            <div className="mb-2">
                                                                <span className="font-bold text-lg text-700">{student.fullName}</span> студентин{' '}
                                                                <span className="font-bold text-lg text-700">{courseTitle}</span> курсуна каттоо — макулсузбу?
                                                            </div>
                                                            <div className="mt-2 flex justify-end space-x-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        toast.dismiss(t.id);
                                                                        try {
                                                                            await enrollUserInCourse(student.id, selectedCourseId);
                                                                            toast.success(
                                                                                <span>
                                                                                    <span className="font-bold text-lg text-700">{student.fullName}</span>{' '}
                                                                                    ийгиликтүү катталды
                                                                                </span>
                                                                            );

                                                                            setCourseSelections(prev => ({
                                                                                ...prev,
                                                                                [student.id]: '',
                                                                            }));
                                                                            setDiscounts(prev => ({
                                                                                ...prev,
                                                                                [student.id]: 0,
                                                                            }));
                                                                            loadStudentsAndCourses();
                                                                        } catch {
                                                                            toast.error('Ката каттоо учурунда');
                                                                        }
                                                                    }}
                                                                    className="px-2 py-1 bg-blue-600 text-white rounded"
                                                                >
                                                                    Ооба
                                                                </button>
                                                                <button
                                                                    onClick={() => toast.dismiss(t.id)}
                                                                    className="px-2 py-1 border rounded hover:text-white"
                                                                >
                                                                    Жок
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ));
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

            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        ⟨ Мурунку
                    </button>
                    {[...Array(totalPages).keys()]
                        .filter(i => i + 1 === 1 || i + 1 === totalPages || Math.abs(i + 1 - currentPage) <= 2)
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && p - arr[idx - 1] > 1 && (
                                    <span className="px-2 text-gray-400">...</span>
                                )}
                                <button
                                    onClick={() => setCurrentPage(p + 1)}
                                    disabled={loading}
                                    className={`px-3 py-1 rounded border ${currentPage === p + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700'}`}
                                >
                                    {p + 1}
                                </button>
                            </React.Fragment>
                        ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Кийинки ⟩
                    </button>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default AssistantDashboard;

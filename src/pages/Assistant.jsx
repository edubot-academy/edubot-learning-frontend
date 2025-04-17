import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchCourses, enrollUserInCourse } from '../services/api';
import toast from 'react-hot-toast';

const AssistantDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [courseSelections, setCourseSelections] = useState({});
    const [discounts, setDiscounts] = useState({});
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadStudentsAndCourses();
    }, [currentPage]);

    const loadStudentsAndCourses = async () => {
        setLoading(true);
        try {
            const [studentsRes, coursesRes] = await Promise.all([
                fetchUsers({ role: 'student', page: currentPage, limit: itemsPerPage }),
                fetchCourses(),
            ]);
            setStudents(studentsRes.data || []);
            setTotalPages(studentsRes.totalPages || 1);
            setCourses(coursesRes.courses.filter(c => c.isPublished));
        } catch (err) {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        }
        setLoading(false);
    };

    if (loading) return <div className="p-6">Жүктөлүүдө...</div>;

    return (
        <div className="pt-20 p-6">
            <h2 className="text-2xl font-bold mb-4">📘 Assistant Dashboard</h2>
            <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Студент</th>
                            <th className="p-2 border">Курс</th>

                            <th className="p-2 border">Иш-аракет</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => {
                            const selectedCourseId = courseSelections[student.id] || '';
                            const discount = discounts[student.id] || 0;
                            return (
                                <tr key={student.id}>
                                    <td className="p-2 border">{student.fullName}<br /><span className="text-xs text-gray-500">{student.email}</span></td>
                                    <td className="p-2 border">
                                        <select
                                            className="w-full border p-1 rounded"
                                            value={selectedCourseId}
                                            onChange={(e) => setCourseSelections(prev => ({ ...prev, [student.id]: Number(e.target.value) }))}
                                        >
                                            <option value="">-- Тандоо --</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title}</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="p-2 border">
                                        <button
                                            className="bg-blue-600 text-white px-3 py-1 rounded"
                                            onClick={() => {
                                                if (!selectedCourseId) return toast.error('Курс тандаңыз');
                                                toast(t => (
                                                    <span>
                                                        {`${student.fullName} студентин ${courses.find(c => c.id === selectedCourseId)?.title} курсуна каттоо — макулсузбу?`}
                                                        <div className="mt-2 flex justify-end space-x-2">
                                                            <button
                                                                onClick={async () => {
                                                                    toast.dismiss(t.id);
                                                                    try {
                                                                        await enrollUserInCourse(student.id, selectedCourseId);
                                                                        toast.success(`${student.fullName} ийгиликтүү катталды`);
                                                                        setCourseSelections(prev => ({ ...prev, [student.id]: '' }));
                                                                        setDiscounts(prev => ({ ...prev, [student.id]: 0 }));
                                                                    } catch (err) {
                                                                        toast.error('Ката каттоо учурунда');
                                                                    }
                                                                }}
                                                                className="px-2 py-1 bg-blue-600 text-white rounded"
                                                            >
                                                                Ооба
                                                            </button>
                                                            <button
                                                                onClick={() => toast.dismiss(t.id)}
                                                                className="px-2 py-1 border rounded"
                                                            >
                                                                Жок
                                                            </button>
                                                        </div>
                                                    </span>
                                                ));
                                            }}
                                        >
                                            Каттоо
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center items-center mt-4 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AssistantDashboard;

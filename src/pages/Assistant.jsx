import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
    fetchUsers,
    fetchCourses,
    enrollUserInCourse,
    checkEnrollments,
    unenrollUserFromCourse,
    listCompanyCourses,
    myCompanies, // ✅ use existing helper
} from '@services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import AttendancePage from './Attendance';

const AssistantDashboard = () => {
    const { user } = useContext(AuthContext);

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
    const [activeTab, setActiveTab] = useState('enrollments');

    // Company membership (derived from company-user entity)
    const [myCos, setMyCos] = useState([]); // [{id,name,role,...}]
    const [activeCompanyId, setActiveCompanyId] = useState(null);

    const debounceRef = useRef();

    const isAssistant = user?.role === 'assistant';

    // Load assistant's companies (from /companies/my)
    useEffect(() => {
        (async () => {
            if (!isAssistant) {
                setMyCos([]);
                setActiveCompanyId(null);
                return;
            }
            try {
                const res = await myCompanies({ page: 1, limit: 50, q: '' });
                const items = res?.items ?? [];
                setMyCos(items);
                if (items.length === 1) setActiveCompanyId(items[0].id);
            } catch {
                toast.error('Компанияларыңызды жүктөөдө ката кетти');
            }
        })();
    }, [isAssistant]);

    const assistantNoCompany = isAssistant && myCos.length === 0;
    const assistantNeedsSelect = isAssistant && myCos.length > 1 && !activeCompanyId;

    const loadStudentsAndCourses = useCallback(async () => {
        // Guard: assistant without company → do not fetch, show message
        if (assistantNoCompany || assistantNeedsSelect) {
            setStudents([]);
            setTotalStudents(0);
            setTotalPages(1);
            setCourses([]);
            setEnrollmentsMap({});
            setCourseCounts({});
            setEnrolledStudents([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // 1) Students (role=student)
            const usersRes = await fetchUsers({
                role: 'student',
                page: currentPage,
                limit: itemsPerPage,
                search,
            });
            const studentsData = usersRes?.data ?? [];
            setStudents(studentsData);
            setTotalStudents(usersRes?.total ?? studentsData.length);
            setTotalPages(usersRes?.totalPages ?? 1);

            // 2) Courses (company-scoped for assistants)
            let published = [];
            if (isAssistant) {
                if (activeCompanyId) {
                    const companyRes = await listCompanyCourses(activeCompanyId, {
                        page: 1,
                        q: '',
                    });
                    const items = companyRes?.items ?? companyRes?.courses ?? [];
                    published = items.filter((c) => c.isPublished);
                } else {
                    published = [];
                }
            } else {
                const coursesRes = await fetchCourses();
                const all = coursesRes?.courses ?? [];
                published = all.filter((c) => c.isPublished);
            }
            setCourses(published);

            // 3) Enrollment map + counts
            const courseIds = published.map((c) => c.id);
            const userIds = studentsData.map((s) => s.id);
            const map =
                courseIds.length && userIds.length
                    ? await checkEnrollments(courseIds, userIds)
                    : {};
            setEnrollmentsMap(map || {});

            const counts = {};
            const enrolledSet = new Set();
            courseIds.forEach((courseId) => {
                counts[courseId] = 0;
                for (const studentId in map) {
                    if (map[studentId]?.includes(courseId)) {
                        counts[courseId]++;
                        enrolledSet.add(Number(studentId));
                    }
                }
            });
            setCourseCounts(counts);
            setEnrolledStudents(studentsData.filter((s) => enrolledSet.has(s.id)));
        } catch {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        } finally {
            setLoading(false);
        }
    }, [
        assistantNoCompany,
        assistantNeedsSelect,
        isAssistant,
        activeCompanyId,
        currentPage,
        itemsPerPage,
        search,
    ]);

    // Debounced reload
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (search.length === 0 || search.length >= 3) {
                loadStudentsAndCourses();
            }
        }, 500);
        return () => clearTimeout(debounceRef.current);
    }, [search, currentPage, loadStudentsAndCourses]);

    const handleUnenroll = (student, courseId) => {
        const courseTitle = courses.find((c) => c.id === courseId)?.title;
        toast((t) => (
            <div>
                <div className="mb-2">
                    <span className="font-bold">{student.fullName}</span> студентин{' '}
                    <span className="font-bold">{courseTitle}</span> курсунан чыгаруу — макулсузбу?
                </div>
                <div className="mt-2 flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await unenrollUserFromCourse(student.id, courseId);
                                toast.success(
                                    <span>
                                        <span className="font-bold">{student.fullName}</span>{' '}
                                        курстан ийгиликтүү чыгарылды
                                    </span>
                                );
                                await loadStudentsAndCourses();
                            } catch {
                                toast.error('Курстан чыгарууда ката кетти');
                            }
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded"
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
    };

    // ⛔️ Assistant: no company memberships
    if (assistantNoCompany) {
        return (
            <div className="pt-20 p-6">
                <h2 className="text-2xl font-bold mb-4">📘 Assistant Dashboard</h2>
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 max-w-2xl">
                    <div className="text-lg font-semibold mb-1">Компания дайындалган эмес</div>
                    <p className="text-gray-700 dark:text-[#a6adba]">
                        Сиз азырынча эч бир компанияга байланыштырылган жоксуз. Иштей баштоо үчүн
                        администраторго же компанияңыздын жетекчисине кайрылыңыз.
                    </p>
                    <p className="text-gray-500 dark:text-[#a6adba] mt-2 text-sm">
                        (RU) Вы не привязаны ни к одной компании. Обратитесь к администратору или
                        руководителю компании для доступа.
                    </p>
                </div>
            </div>
        );
    }

    // ⛔️ Assistant: multiple companies → require selection first
    if (assistantNeedsSelect) {
        return (
            <div className="pt-20 p-6">
                <h2 className="text-2xl font-bold mb-4">📘 Assistant Dashboard</h2>

                <div className="max-w-xl rounded-xl border bg-white dark:bg-[#222222] p-6 space-y-4">
                    <div className="text-sm text-gray-700 dark:text-[#a6adba]">
                        Сураныч, компанияны тандаңыз (сиз бир нече компанияга байланыштырылгансыз).
                        <br />
                        (RU) Вы привязаны к нескольким компаниям — выберите, с какой работать.
                    </div>

                    <select
                        className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-[#222222]"
                        value={activeCompanyId ?? ''}
                        onChange={(e) => setActiveCompanyId(Number(e.target.value))}
                    >
                        <option value="">-- Компанияны тандаңыз --</option>
                        {myCos.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                                {c.role ? ` · ${c.role}` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    const filteredStudents = students;

    if (activeTab === 'attendance') {
        return (
            <div className="pt-20 p-6">
                <h2 className="text-2xl font-bold mb-4">📘 Assistant Dashboard</h2>
                <div className="mb-4 inline-flex gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-[#111111]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('enrollments')}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-[#a6adba] hover:text-gray-900 dark:hover:text-[#E8ECF3]"
                    >
                        Каттоо
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('attendance')}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white"
                    >
                        Катышуу
                    </button>
                </div>
                <div className="bg-white dark:bg-[#111111] shadow-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                    <AttendancePage embedded />
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 p-6 relative">
            <h2 className="text-2xl font-bold mb-4">📘 Assistant Dashboard</h2>

            <div className="mb-4 inline-flex gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-[#111111]">
                <button
                    type="button"
                    onClick={() => setActiveTab('enrollments')}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white"
                >
                    Каттоо
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-[#a6adba] hover:text-gray-900 dark:hover:text-[#E8ECF3]"
                >
                    Катышуу
                </button>
            </div>

            {isAssistant && activeCompanyId && (
                <div className="mb-3 text-xs text-gray-600 dark:text-[#a6adba]">
                    Ассистент катары сиз{' '}
                    <span className="font-semibold">компания #{activeCompanyId}</span> курстарын
                    көрүп жатасыз.
                </div>
            )}

            <div className="flex gap-6 mb-4 text-sm font-medium flex-wrap">
                <div>👥 Жалпы студенттер: {totalStudents}</div>
                <div>✅ Катталган студенттер: {enrolledStudents.length}</div>
                <div>🎓 Курстар: {courses.length}</div>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700 dark:text-[#a6adba]">
                {courses.map((course) => (
                    <div key={course.id} className="bg-gray-100 px-3 py-1 rounded">
                        {course.title}: {courseCounts[course.id] || 0} студент
                    </div>
                ))}
                {!courses.length && !loading && (
                    <div className="text-gray-500 dark:text-[#a6adba] italic">Курс табылган жок.</div>
                )}
            </div>

            <div className="mb-4 max-w-md">
                <input
                    type="text"
                    placeholder="Студент атын же email изде..."
                    className="border px-3 py-2 rounded w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                                <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-[#a6adba] italic">
                                    Студент табылган жок
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => {
                                const selectedCourseId = courseSelections[student.id] || '';
                                const enrolledCourseIds = enrollmentsMap[student.id] || [];
                                const availableCourses = courses.filter(
                                    (c) => !enrolledCourseIds.includes(c.id)
                                );
                                const isDisabled =
                                    !selectedCourseId || availableCourses.length === 0;

                                return (
                                    <tr key={student.id}>
                                        <td className="p-2 border">
                                            {student.fullName}
                                            <br />
                                            <span className="text-xs text-gray-500 dark:text-[#a6adba]">
                                                {student.email}
                                            </span>
                                            <br />
                                            <span className="text-xs text-gray-500 dark:text-[#a6adba]">
                                                {student.phoneNumber || '—'}
                                            </span>
                                        </td>
                                        <td className="p-2 border">
                                            {enrolledCourseIds.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {enrolledCourseIds.map((id) => {
                                                        const course = courses.find(
                                                            (c) => c.id === id
                                                        );
                                                        if (!course) return null;
                                                        return (
                                                            <span
                                                                key={id}
                                                                className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-2 py-1 rounded"
                                                            >
                                                                <span className="text-sm">
                                                                    {course.title}
                                                                </span>
                                                                <button
                                                                    className="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
                                                                    onClick={() =>
                                                                        handleUnenroll(student, id)
                                                                    }
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
                                                '—'
                                            )}
                                        </td>
                                        <td className="p-2 border">
                                            {availableCourses.length > 0 ? (
                                                <select
                                                    className="w-full border p-1 rounded text-black dark:text-white bg-white dark:bg-[#222222]"
                                                    value={selectedCourseId}
                                                    onChange={(e) =>
                                                        setCourseSelections((prev) => ({
                                                            ...prev,
                                                            [student.id]: Number(e.target.value),
                                                        }))
                                                    }
                                                    disabled={loading}
                                                >
                                                    <option value="">-- Тандоо --</option>
                                                    {availableCourses.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-gray-500 dark:text-[#a6adba] italic">
                                                    Бардык курстарга катталган
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2 border">
                                            <button
                                                className={`px-3 py-1 rounded text-white ${
                                                    isDisabled
                                                        ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                                disabled={isDisabled || loading}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    const courseTitle = courses.find(
                                                        (c) => c.id === selectedCourseId
                                                    )?.title;
                                                    toast((t) => (
                                                        <div>
                                                            <div className="mb-2">
                                                                <span className="font-bold text-lg text-700">
                                                                    {student.fullName}
                                                                </span>{' '}
                                                                студентин{' '}
                                                                <span className="font-bold text-lg text-700">
                                                                    {courseTitle}
                                                                </span>{' '}
                                                                курсуна каттоо — макулсузбу?
                                                            </div>
                                                            <div className="mt-2 flex justify-end space-x-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        toast.dismiss(t.id);
                                                                        try {
                                                                            await enrollUserInCourse(
                                                                                student.id,
                                                                                selectedCourseId
                                                                            );
                                                                            toast.success(
                                                                                <span>
                                                                                    <span className="font-bold text-lg text-700">
                                                                                        {
                                                                                            student.fullName
                                                                                        }
                                                                                    </span>{' '}
                                                                                    ийгиликтүү
                                                                                    катталды
                                                                                </span>
                                                                            );
                                                                            setCourseSelections(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [student.id]:
                                                                                        '',
                                                                                })
                                                                            );
                                                                            setDiscounts(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [student.id]: 0,
                                                                                })
                                                                            );
                                                                            loadStudentsAndCourses();
                                                                        } catch {
                                                                            toast.error(
                                                                                'Ката каттоо учурунда'
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="px-2 py-1 bg-blue-600 text-white rounded"
                                                                >
                                                                    Ооба
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        toast.dismiss(t.id)
                                                                    }
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
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        ⟨ Мурунку
                    </button>
                    {[...Array(totalPages).keys()]
                        .filter(
                            (i) =>
                                i + 1 === 1 ||
                                i + 1 === totalPages ||
                                Math.abs(i + 1 - currentPage) <= 2
                        )
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && p - arr[idx - 1] > 1 && (
                                    <span className="px-2 text-gray-400">...</span>
                                )}
                                <button
                                    onClick={() => setCurrentPage(p + 1)}
                                    disabled={loading}
                                    className={`px-3 py-1 rounded border ${
                                        currentPage === p + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 dark:text-[#a6adba]'
                                    }`}
                                >
                                    {p + 1}
                                </button>
                            </React.Fragment>
                        ))}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Кийинки ⟩
                    </button>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
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

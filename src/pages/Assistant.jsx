import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useContext,
    useMemo,
} from "react";
import {
    fetchUsers,
    fetchCourses,
    enrollUserInCourse,
    checkEnrollments,
    unenrollUserFromCourse,
    listCompanyCourses,
    myCompanies,
} from "@services/api";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import AttendancePage from "./Attendance";

const ITEMS_PER_PAGE = 10;

const AssistantDashboard = () => {
    const { user } = useContext(AuthContext);

    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseCounts, setCourseCounts] = useState({});
    const [enrollmentsMap, setEnrollmentsMap] = useState({});
    const [courseSelections, setCourseSelections] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("enrollments");

    const [myCos, setMyCos] = useState([]);
    const [activeCompanyId, setActiveCompanyId] = useState(null);

    const debounceRef = useRef(null);

    const isAssistant = user?.role === "assistant";

    const assistantNoCompany = isAssistant && myCos.length === 0;
    const assistantNeedsSelect =
        isAssistant && myCos.length > 1 && !activeCompanyId;

    const activeCompany = useMemo(() => {
        return myCos.find((c) => c.id === activeCompanyId) || null;
    }, [myCos, activeCompanyId]);

    useEffect(() => {
        let isMounted = true;

        const loadCompanies = async () => {
            if (!isAssistant) {
                if (!isMounted) return;
                setMyCos([]);
                setActiveCompanyId(null);
                return;
            }

            try {
                const res = await myCompanies({ page: 1, limit: 50, q: "" });
                const items = res?.items ?? [];

                if (!isMounted) return;

                setMyCos(items);

                if (items.length === 1) {
                    setActiveCompanyId(items[0].id);
                }
            } catch {
                if (isMounted) {
                    toast.error("Компанияларыңызды жүктөөдө ката кетти");
                }
            }
        };

        loadCompanies();

        return () => {
            isMounted = false;
        };
    }, [isAssistant]);

    const resetDashboardData = useCallback(() => {
        setStudents([]);
        setTotalStudents(0);
        setTotalPages(1);
        setCourses([]);
        setEnrollmentsMap({});
        setCourseCounts({});
        setEnrolledStudents([]);
        setCourseSelections({});
    }, []);

    const loadStudentsAndCourses = useCallback(async () => {
        if (assistantNoCompany || assistantNeedsSelect) {
            resetDashboardData();
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const usersRes = await fetchUsers({
                role: "student",
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search,
            });

            const studentsData = usersRes?.data ?? [];
            setStudents(studentsData);
            setTotalStudents(usersRes?.total ?? studentsData.length);
            setTotalPages(usersRes?.totalPages ?? 1);

            let publishedCourses = [];

            if (isAssistant) {
                if (activeCompanyId) {
                    const companyRes = await listCompanyCourses(activeCompanyId, {
                        page: 1,
                        q: "",
                    });

                    const items = companyRes?.items ?? companyRes?.courses ?? [];
                    publishedCourses = items.filter((course) => course?.isPublished);
                }
            } else {
                const coursesRes = await fetchCourses();
                const allCourses = coursesRes?.courses ?? [];
                publishedCourses = allCourses.filter((course) => course?.isPublished);
            }

            setCourses(publishedCourses);

            const courseIds = publishedCourses.map((course) => course.id);
            const userIds = studentsData.map((student) => student.id);

            const enrollmentData =
                courseIds.length > 0 && userIds.length > 0
                    ? await checkEnrollments(courseIds, userIds)
                    : {};

            const safeMap = enrollmentData || {};
            setEnrollmentsMap(safeMap);

            const counts = {};
            const enrolledSet = new Set();

            courseIds.forEach((courseId) => {
                counts[courseId] = 0;

                Object.entries(safeMap).forEach(([studentId, studentCourseIds]) => {
                    if (Array.isArray(studentCourseIds) && studentCourseIds.includes(courseId)) {
                        counts[courseId] += 1;
                        enrolledSet.add(Number(studentId));
                    }
                });
            });

            setCourseCounts(counts);
            setEnrolledStudents(
                studentsData.filter((student) => enrolledSet.has(student.id))
            );
        } catch {
            toast.error("Маалыматтарды жүктөөдө ката кетти");
            resetDashboardData();
        } finally {
            setLoading(false);
        }
    }, [
        assistantNoCompany,
        assistantNeedsSelect,
        resetDashboardData,
        isAssistant,
        activeCompanyId,
        currentPage,
        search,
    ]);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (search.length === 0 || search.length >= 3) {
                loadStudentsAndCourses();
            }
        }, 500);

        return () => {
            clearTimeout(debounceRef.current);
        };
    }, [search, currentPage, loadStudentsAndCourses]);

    const handleEnroll = async (student, selectedCourseId) => {
        const courseTitle = courses.find((c) => c.id === selectedCourseId)?.title;

        toast((t) => (
            <div>
                <div className="mb-2">
                    <span className="font-bold">{student.fullName}</span> студентин{" "}
                    <span className="font-bold">{courseTitle}</span> курсуна каттоо —
                    макулсузбу?
                </div>

                <div className="mt-2 flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);

                            try {
                                await enrollUserInCourse(student.id, selectedCourseId);

                                toast.success(
                                    <span>
                                        <span className="font-bold">{student.fullName}</span>{" "}
                                        курска ийгиликтүү катталды
                                    </span>
                                );

                                setCourseSelections((prev) => ({
                                    ...prev,
                                    [student.id]: "",
                                }));

                                await loadStudentsAndCourses();
                            } catch {
                                toast.error("Курска каттоодо ката кетти");
                            }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Ооба
                    </button>

                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                        Жок
                    </button>
                </div>
            </div>
        ));
    };

    const handleUnenroll = (student, courseId) => {
        const courseTitle = courses.find((c) => c.id === courseId)?.title;

        toast((t) => (
            <div>
                <div className="mb-2">
                    <span className="font-bold">{student.fullName}</span> студентин{" "}
                    <span className="font-bold">{courseTitle}</span> курсунан чыгаруу —
                    макулсузбу?
                </div>

                <div className="mt-2 flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);

                            try {
                                await unenrollUserFromCourse(student.id, courseId);

                                toast.success(
                                    <span>
                                        <span className="font-bold">{student.fullName}</span>{" "}
                                        курстан ийгиликтүү чыгарылды
                                    </span>
                                );

                                await loadStudentsAndCourses();
                            } catch {
                                toast.error("Курстан чыгарууда ката кетти");
                            }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Ооба
                    </button>

                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                        Жок
                    </button>
                </div>
            </div>
        ));
    };

    const renderHeader = () => (
        <div className="bg-gradient-to-r from-edubot-dark to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-white mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-sm uppercase tracking-wide text-edubot-orange font-medium">
                        Assistant Panel
                    </p>
                    <h1 className="text-3xl font-bold text-white mt-1">
                        📘 Assistant Dashboard
                    </h1>

                    {isAssistant && activeCompany && (
                        <p className="text-sm text-slate-300 mt-2">
                            Ассистент катары сиз{" "}
                            <span className="font-semibold text-edubot-orange">
                                {activeCompany.name}
                            </span>{" "}
                            компаниясынын курстарын көрүп жатасыз.
                        </p>
                    )}
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-edubot-orange">
                        {totalStudents}
                    </div>
                    <div className="text-xs text-slate-300">Жалпы студенттер</div>
                </div>
            </div>
        </div>
    );

    const renderTabs = () => (
        <div className="mb-6 inline-flex gap-2 rounded-xl border border-slate-300 dark:border-slate-600 p-1 bg-white dark:bg-gray-800 shadow-lg">
            <button
                type="button"
                onClick={() => setActiveTab("enrollments")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "enrollments"
                        ? "bg-edubot-orange text-white shadow-lg"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
            >
                Каттоо
            </button>

            <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "attendance"
                        ? "bg-edubot-orange text-white shadow-lg"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
            >
                Катышуу
            </button>
        </div>
    );

    if (assistantNoCompany) {
        return (
            <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
                <div className="max-w-4xl mx-auto">
                    {renderHeader()}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>

                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Компания дайындалган эмес
                            </h2>

                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Сиз азырынча эч бир компанияга байланыштырылган жоксуз. Иштей
                                баштоо үчүн администраторго же компанияңыздын жетекчисине
                                кайрылыңыз.
                            </p>

                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                (RU) Вы не привязаны ни к одной компании. Обратитесь к
                                администратору или руководителю компании для доступа.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (assistantNeedsSelect) {
        return (
            <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
                <div className="max-w-4xl mx-auto">
                    {renderHeader()}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-edubot-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🏢</span>
                            </div>

                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                Компанияны тандаңыз
                            </h2>

                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Сураныч, компанияны тандаңыз (сиз бир нече компанияга
                                байланыштырылгансыз).
                                <br />
                                (RU) Вы привязаны к нескольким компаниям — выберите, с какой
                                работать.
                            </p>

                            <select
                                className="w-full max-w-md px-4 py-3 bg-white dark:bg-gray-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-edubot-orange focus:border-transparent transition-all duration-200 shadow-sm"
                                value={activeCompanyId ?? ""}
                                onChange={(e) =>
                                    setActiveCompanyId(
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                }
                            >
                                <option value="">-- Компанияны тандаңыз --</option>
                                {myCos.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                        {company.role ? ` · ${company.role}` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "attendance") {
        return (
            <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
                <div className="max-w-7xl mx-auto">
                    {renderHeader()}
                    {renderTabs()}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">
                        <AttendancePage embedded />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 relative">
            <div className="max-w-7xl mx-auto">
                {renderHeader()}
                {renderTabs()}

                <div className="flex gap-6 mb-4 text-sm font-medium flex-wrap">
                    <div>👥 Жалпы студенттер: {totalStudents}</div>
                    <div>✅ Катталган студенттер: {enrolledStudents.length}</div>
                    <div>🎓 Курстар: {courses.length}</div>
                </div>

                <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700 dark:text-[#a6adba]">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded"
                        >
                            {course.title}: {courseCounts[course.id] || 0} студент
                        </div>
                    ))}

                    {!courses.length && !loading && (
                        <div className="text-gray-500 dark:text-[#a6adba] italic">
                            Курс табылган жок.
                        </div>
                    )}
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
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            🔍
                        </div>
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
                                    <td
                                        colSpan="4"
                                        className="p-4 text-center text-gray-500 dark:text-[#a6adba] italic"
                                    >
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
                                        <tr
                                            key={student.id}
                                            className="border-b border-slate-100 dark:border-slate-700"
                                        >
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
                                                            const course = courses.find((c) => c.id === courseId);
                                                            if (!course) return null;

                                                            return (
                                                                <span
                                                                    key={courseId}
                                                                    className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-2 py-1 rounded"
                                                                >
                                                                    <span className="text-sm">{course.title}</span>
                                                                    <button
                                                                        className="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
                                                                        onClick={() =>
                                                                            handleUnenroll(student, courseId)
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
                                                    "—"
                                                )}
                                            </td>

                                            <td className="p-4 align-top">
                                                {availableCourses.length > 0 ? (
                                                    <select
                                                        className="w-full border p-2 rounded text-black dark:text-white bg-white dark:bg-[#222222]"
                                                        value={selectedCourseId}
                                                        onChange={(e) =>
                                                            setCourseSelections((prev) => ({
                                                                ...prev,
                                                                [student.id]: e.target.value
                                                                    ? Number(e.target.value)
                                                                    : "",
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

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-4 space-x-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            ⟨ Мурунку
                        </button>

                        {[...Array(totalPages).keys()]
                            .filter(
                                (index) =>
                                    index + 1 === 1 ||
                                    index + 1 === totalPages ||
                                    Math.abs(index + 1 - currentPage) <= 2
                            )
                            .map((pageIndex, idx, arr) => (
                                <React.Fragment key={pageIndex + 1}>
                                    {idx > 0 && pageIndex - arr[idx - 1] > 1 && (
                                        <span className="px-2 text-gray-400">...</span>
                                    )}

                                    <button
                                        onClick={() => setCurrentPage(pageIndex + 1)}
                                        disabled={loading}
                                        className={`px-3 py-1 rounded border ${currentPage === pageIndex + 1
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-700 dark:text-[#a6adba]"
                                            }`}
                                    >
                                        {pageIndex + 1}
                                    </button>
                                </React.Fragment>
                            ))}

                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                            }
                            disabled={currentPage === totalPages || loading}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Кийинки ⟩
                        </button>
                    </div>
                )}

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
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssistantDashboard;
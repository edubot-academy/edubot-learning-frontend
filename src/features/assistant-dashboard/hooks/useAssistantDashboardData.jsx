import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { normalizeEnrollmentCourseType } from "@features/enrollments/policy";
import { 
    createCoursesById, 
    buildCourseCounts, 
    buildEnrolledStudentSet,
    filterPublishedCourses 
} from "../utils/assistantDashboard.helpers";

const ITEMS_PER_PAGE = 10;

export const useAssistantDashboardData = (user) => {
    const isAssistant = user?.role === "assistant";

    // State
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
    const [companies, setCompanies] = useState([]);
    const [activeCompanyId, setActiveCompanyId] = useState(null);

    const debounceRef = useRef(null);

    // Computed values
    const assistantNoCompany = isAssistant && companies.length === 0;
    const assistantNeedsSelect = isAssistant && companies.length > 1 && !activeCompanyId;

    const activeCompany = useMemo(
        () => companies.find((company) => company.id === activeCompanyId) || null,
        [companies, activeCompanyId]
    );

    const coursesById = useMemo(() => {
        return createCoursesById(courses);
    }, [courses]);

    // Reset dashboard data
    const resetDashboardData = useCallback(() => {
        setStudents([]);
        setTotalStudents(0);
        setEnrolledStudents([]);
        setCourses([]);
        setCourseCounts({});
        setEnrollmentsMap({});
        setCourseSelections({});
        setTotalPages(1);
    }, []);

    // Load companies
    const loadCompanies = useCallback(async () => {
        if (!isAssistant) {
            setCompanies([]);
            setActiveCompanyId(null);
            return;
        }

        try {
            const res = await myCompanies({ page: 1, limit: 50, q: "" });
            const items = res?.items ?? [];
            setCompanies(items);

            if (items.length === 1) {
                setActiveCompanyId(items[0].id);
            }
        } catch {
            toast.error("Компанияларды жүктөөдө ката кетти");
        }
    }, [isAssistant]);

    // Load students and courses
    const loadStudentsAndCourses = useCallback(async () => {
        if (assistantNoCompany || assistantNeedsSelect) {
            resetDashboardData();
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Fetch students
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

            // Fetch courses
            let publishedCourses = [];

            if (isAssistant) {
                if (activeCompanyId) {
                    const companyRes = await listCompanyCourses(activeCompanyId, {
                        page: 1,
                        q: "",
                    });
                    const items = companyRes?.items ?? companyRes?.courses ?? [];
                    publishedCourses = filterPublishedCourses(items);
                }
            } else {
                const coursesRes = await fetchCourses();
                const allCourses = coursesRes?.courses ?? [];
                publishedCourses = filterPublishedCourses(allCourses);
            }

            setCourses(publishedCourses);

            // Fetch enrollments
            const courseIds = publishedCourses.map((course) => course.id);
            const userIds = studentsData.map((student) => student.id);

            const enrollmentData =
                courseIds.length && userIds.length
                    ? await checkEnrollments(courseIds, userIds)
                    : {};

            const safeMap = enrollmentData || {};
            setEnrollmentsMap(safeMap);

            // Build course counts and enrolled students
            const counts = buildCourseCounts(courseIds, safeMap);
            const enrolledSet = buildEnrolledStudentSet(safeMap);

            setCourseCounts(counts);
            setEnrolledStudents(studentsData.filter((student) => enrolledSet.has(student.id)));
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

    // Effects
    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (search.length === 0 || search.length >= 3) {
                loadStudentsAndCourses();
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [search, currentPage, loadStudentsAndCourses]);

    // Confirm toast helper
    const confirmToast = (message, onConfirm, confirmClass = "bg-blue-600 hover:bg-blue-700") => {
        toast((t) => (
            <div>
                <div className="mb-2">{message}</div>
                <div className="mt-2 flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await onConfirm();
                        }}
                        className={`px-3 py-1 text-white rounded ${confirmClass}`}
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

    // Enrollment handlers
    const handleEnroll = async (student, selectedCourseId) => {
        const courseTitle = coursesById[selectedCourseId]?.title ?? "курс";

        confirmToast(
            <>
                <span className="font-bold">{student.fullName}</span> студентин{" "}
                <span className="font-bold">{courseTitle}</span> курсуна каттоо — макулсузбу?
            </>,
            async () => {
                try {
                    await enrollUserInCourse(student.id, selectedCourseId, {
                        courseType: normalizeEnrollmentCourseType(
                            coursesById[selectedCourseId]?.courseType
                        ),
                    });

                    toast.success(
                        <span>
                            <span className="font-bold">{student.fullName}</span> курска ийгиликтүү катталды
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
            }
        );
    };

    const handleUnenroll = (student, courseId) => {
        const courseTitle = coursesById[courseId]?.title ?? "курс";

        confirmToast(
            <>
                <span className="font-bold">{student.fullName}</span> студентин{" "}
                <span className="font-bold">{courseTitle}</span> курсунан чыгаруу — макулсузбу?
            </>,
            async () => {
                try {
                    await unenrollUserFromCourse(student.id, courseId);
                    toast.success(
                        <span>
                            <span className="font-bold">{student.fullName}</span> курстан ийгиликтүү чыгарылды
                        </span>
                    );
                    await loadStudentsAndCourses();
                } catch {
                    toast.error("Курстан чыгарууда ката кетти");
                }
            },
            "bg-red-600 hover:bg-red-700"
        );
    };

    return {
        // State
        currentPage,
        search,
        students,
        totalStudents,
        enrolledStudents,
        courses,
        courseCounts,
        enrollmentsMap,
        courseSelections,
        totalPages,
        loading,
        companies,
        activeCompanyId,
        activeCompany,
        coursesById,
        assistantNoCompany,
        assistantNeedsSelect,
        isAssistant,

        // Actions
        setCurrentPage,
        setSearch,
        setActiveCompanyId,
        setCourseSelections,
        handleEnroll,
        handleUnenroll,
        loadStudentsAndCourses,
    };
};

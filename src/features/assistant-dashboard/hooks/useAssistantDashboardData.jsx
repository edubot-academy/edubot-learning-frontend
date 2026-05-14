import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    fetchUsers,
    fetchCourses,
    checkEnrollments,
    listCompanyCourses,
    myCompanies,
} from "@services/api";
import toast from "react-hot-toast";
import { 
    createCoursesById, 
    buildCourseCounts, 
    buildEnrolledStudentSet,
    filterPublishedCourses 
} from "../utils/assistantDashboard.helpers";
import { useAssistantEnrollmentActions } from "./useAssistantEnrollmentActions.jsx";

const ITEMS_PER_PAGE = 10;
const MIN_SEARCH_LENGTH = 3;

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
    const coursesRef = useRef([]);
    const enrollmentsMapRef = useRef({});
    const mutationContextRef = useRef('');
    const studentsRef = useRef([]);

    useEffect(() => {
        coursesRef.current = courses;
    }, [courses]);

    useEffect(() => {
        studentsRef.current = students;
    }, [students]);

    useEffect(() => {
        enrollmentsMapRef.current = enrollmentsMap;
    }, [enrollmentsMap]);

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

    const isSearchTooShort = search.trim().length > 0 && search.trim().length < MIN_SEARCH_LENGTH;

    const mutationContext = useMemo(() => {
        const courseIds = courses.map((course) => course.id).join(',');
        const studentIds = students.map((student) => student.id).join(',');

        return [
            activeCompanyId ?? '',
            currentPage,
            search.trim(),
            courseIds,
            studentIds,
        ].join('|');
    }, [activeCompanyId, courses, currentPage, search, students]);

    useEffect(() => {
        mutationContextRef.current = mutationContext;
    }, [mutationContext]);

    const getMutationContext = useCallback(() => mutationContextRef.current, []);

    const isCurrentMutationContext = useCallback(
        (mutationContextAtStart) => mutationContextAtStart === mutationContextRef.current,
        []
    );

    const applyEnrollmentState = useCallback((createNextMap) => {
        const nextMap = createNextMap(enrollmentsMapRef.current);
        const courseIds = coursesRef.current.map((course) => course.id);
        const enrolledSet = buildEnrolledStudentSet(nextMap);

        enrollmentsMapRef.current = nextMap;
        setEnrollmentsMap(nextMap);
        setCourseCounts(buildCourseCounts(courseIds, nextMap));
        setEnrolledStudents(studentsRef.current.filter((student) => enrolledSet.has(student.id)));
    }, []);

    const handleEnrollSuccess = useCallback((studentId, courseId, mutationContextAtStart) => {
        if (!isCurrentMutationContext(mutationContextAtStart)) return;

        setCourseSelections((prev) => ({
            ...prev,
            [studentId]: '',
        }));

        applyEnrollmentState((currentMap) => {
            const mapKey = String(studentId);
            const currentCourseIds = Array.isArray(currentMap[mapKey]) ? currentMap[mapKey] : [];
            const nextCourseIds = currentCourseIds.some((currentCourseId) => Number(currentCourseId) === courseId)
                ? currentCourseIds
                : [...currentCourseIds, courseId];

            return {
                ...currentMap,
                [mapKey]: nextCourseIds,
            };
        });
    }, [applyEnrollmentState, isCurrentMutationContext]);

    const handleUnenrollSuccess = useCallback((studentId, courseId, mutationContextAtStart) => {
        if (!isCurrentMutationContext(mutationContextAtStart)) return;

        applyEnrollmentState((currentMap) => {
            const mapKey = String(studentId);
            const currentCourseIds = Array.isArray(currentMap[mapKey]) ? currentMap[mapKey] : [];

            return {
                ...currentMap,
                [mapKey]: currentCourseIds.filter((id) => Number(id) !== courseId),
            };
        });
    }, [applyEnrollmentState, isCurrentMutationContext]);

    // Reset dashboard data
    const resetDashboardData = useCallback(() => {
        setStudents([]);
        setTotalStudents(0);
        setEnrolledStudents([]);
        setCourses([]);
        setCourseCounts({});
        enrollmentsMapRef.current = {};
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
            const enrolledSet = buildEnrolledStudentSet(safeMap);

            enrollmentsMapRef.current = safeMap;
            setEnrollmentsMap(safeMap);
            setCourseCounts(buildCourseCounts(courseIds, safeMap));
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
            if (!isSearchTooShort) {
                loadStudentsAndCourses();
            } else {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [isSearchTooShort, search, currentPage, loadStudentsAndCourses]);

    const { handleEnroll, handleUnenroll } = useAssistantEnrollmentActions({
        coursesById,
        getMutationContext,
        onEnrollSuccess: handleEnrollSuccess,
        onUnenrollSuccess: handleUnenrollSuccess,
    });

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
        isSearchTooShort,
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

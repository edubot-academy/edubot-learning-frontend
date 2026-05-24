import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
    checkEnrollments,
    fetchCourses,
    fetchUsers,
} from "@services/api";
import {
    buildCourseCounts,
    buildEnrolledStudentSet,
    createCoursesById,
    filterPublishedCourses,
} from "../utils/assistantDashboard.helpers";

const ITEMS_PER_PAGE = 10;
const MIN_SEARCH_LENGTH = 3;

export const useAssistantWorkspaceData = ({
    assistantCompanyPending,
} = {}) => {
    const { t } = useTranslation();
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

    const debounceRef = useRef(null);
    const coursesContextRef = useRef("");
    const coursesRef = useRef([]);
    const enrollmentsMapRef = useRef({});
    const mutationContextRef = useRef("");
    const requestSeqRef = useRef(0);
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

    const coursesById = useMemo(() => createCoursesById(courses), [courses]);

    const isSearchTooShort = search.trim().length > 0 && search.trim().length < MIN_SEARCH_LENGTH;

    const mutationContext = useMemo(() => {
        const courseIds = courses.map((course) => course.id).join(",");
        const studentIds = students.map((student) => student.id).join(",");

        return [
            currentPage,
            search.trim(),
            courseIds,
            studentIds,
        ].join("|");
    }, [courses, currentPage, search, students]);

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

    const handleEnrollSuccess = useCallback(
        (studentId, courseId, mutationContextAtStart) => {
            if (!isCurrentMutationContext(mutationContextAtStart)) return;

            setCourseSelections((prev) => ({
                ...prev,
                [studentId]: "",
            }));

            applyEnrollmentState((currentMap) => {
                const mapKey = String(studentId);
                const currentCourseIds = Array.isArray(currentMap[mapKey])
                    ? currentMap[mapKey]
                    : [];
                const nextCourseIds = currentCourseIds.some(
                    (currentCourseId) => Number(currentCourseId) === courseId
                )
                    ? currentCourseIds
                    : [...currentCourseIds, courseId];

                return {
                    ...currentMap,
                    [mapKey]: nextCourseIds,
                };
            });
        },
        [applyEnrollmentState, isCurrentMutationContext]
    );

    const handleUnenrollSuccess = useCallback(
        (studentId, courseId, mutationContextAtStart) => {
            if (!isCurrentMutationContext(mutationContextAtStart)) return;

            applyEnrollmentState((currentMap) => {
                const mapKey = String(studentId);
                const currentCourseIds = Array.isArray(currentMap[mapKey])
                    ? currentMap[mapKey]
                    : [];

                return {
                    ...currentMap,
                    [mapKey]: currentCourseIds.filter((id) => Number(id) !== courseId),
                };
            });
        },
        [applyEnrollmentState, isCurrentMutationContext]
    );

    const resetDashboardData = useCallback(() => {
        setStudents([]);
        setTotalStudents(0);
        setEnrolledStudents([]);
        setCourses([]);
        setCourseCounts({});
        coursesContextRef.current = "";
        coursesRef.current = [];
        enrollmentsMapRef.current = {};
        setEnrollmentsMap({});
        setCourseSelections({});
        setTotalPages(1);
    }, []);

    const loadPublishedCourses = useCallback(async (shouldApply = () => true) => {
        const coursesContext = "all";

        if (coursesContextRef.current === coursesContext) {
            return coursesRef.current;
        }

        const coursesRes = await fetchCourses();
        const allCourses = coursesRes?.courses ?? [];
        const publishedCourses = filterPublishedCourses(allCourses);

        if (!shouldApply()) {
            return null;
        }

        coursesContextRef.current = coursesContext;
        coursesRef.current = publishedCourses;
        setCourses(publishedCourses);
        return publishedCourses;
    }, []);

    const loadStudentsAndCourses = useCallback(async () => {
        if (assistantCompanyPending) {
            requestSeqRef.current += 1;
            setLoading(true);
            return;
        }

        const requestId = requestSeqRef.current + 1;
        requestSeqRef.current = requestId;
        const isCurrentRequest = () => requestSeqRef.current === requestId;

        setLoading(true);

        try {
            const usersRes = await fetchUsers({
                role: "student",
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search,
            });

            if (!isCurrentRequest()) return;

            const studentsData = usersRes?.data ?? [];

            const publishedCourses = await loadPublishedCourses(isCurrentRequest);

            if (!isCurrentRequest() || !publishedCourses) return;

            const courseIds = publishedCourses.map((course) => course.id);
            const userIds = studentsData.map((student) => student.id);

            const enrollmentData =
                courseIds.length && userIds.length
                    ? await checkEnrollments(courseIds, userIds)
                    : {};

            if (!isCurrentRequest()) return;

            const safeMap = enrollmentData || {};
            const enrolledSet = buildEnrolledStudentSet(safeMap);

            setStudents(studentsData);
            setTotalStudents(usersRes?.total ?? studentsData.length);
            setTotalPages(usersRes?.totalPages ?? 1);
            enrollmentsMapRef.current = safeMap;
            setEnrollmentsMap(safeMap);
            setCourseCounts(buildCourseCounts(courseIds, safeMap));
            setEnrolledStudents(studentsData.filter((student) => enrolledSet.has(student.id)));
        } catch {
            if (!isCurrentRequest()) return;
            toast.error(t('assistantDashboard.toasts.loadFailed'));
            resetDashboardData();
        } finally {
            if (isCurrentRequest()) {
                setLoading(false);
            }
        }
    }, [
        assistantCompanyPending,
        currentPage,
        loadPublishedCourses,
        resetDashboardData,
        search,
        t,
    ]);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (!isSearchTooShort) {
                loadStudentsAndCourses();
            } else {
                requestSeqRef.current += 1;
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [currentPage, isSearchTooShort, loadStudentsAndCourses, search]);

    return {
        courseCounts,
        courseSelections,
        courses,
        coursesById,
        currentPage,
        enrolledStudents,
        enrollmentsMap,
        getMutationContext,
        handleEnrollSuccess,
        handleUnenrollSuccess,
        isSearchTooShort,
        loadStudentsAndCourses,
        loading,
        search,
        setCourseSelections,
        setCurrentPage,
        setSearch,
        students,
        totalPages,
        totalStudents,
    };
};

import { useAssistantEnrollmentActions } from "./useAssistantEnrollmentActions.jsx";
import { useAssistantWorkspaceData } from "./useAssistantWorkspaceData.js";

export const useAssistantDashboardData = () => {
    const {
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
    } = useAssistantWorkspaceData();

    const {
        getActionKey,
        handleEnroll,
        handleUnenroll,
        lastEnrollmentFeedback,
        pendingEnrollmentAction,
    } = useAssistantEnrollmentActions({
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
        coursesById,
        isSearchTooShort,

        // Actions
        setCurrentPage,
        setSearch,
        setCourseSelections,
        handleEnroll,
        handleUnenroll,
        getActionKey,
        lastEnrollmentFeedback,
        pendingEnrollmentAction,
        loadStudentsAndCourses,
    };
};

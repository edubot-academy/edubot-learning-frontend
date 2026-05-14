import { useEffect } from "react";
import { useAssistantEnrollmentActions } from "./useAssistantEnrollmentActions.jsx";
import { useAssistantCompanyState } from "./useAssistantCompanyState.js";
import { useAssistantWorkspaceData } from "./useAssistantWorkspaceData.js";

export const useAssistantDashboardData = (user) => {
    const {
        activeCompany,
        activeCompanyId,
        assistantCompanyPending,
        assistantNeedsSelect,
        assistantNoCompany,
        companies,
        isAssistant,
        loadCompanies,
        setActiveCompanyId,
    } = useAssistantCompanyState(user);

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
    } = useAssistantWorkspaceData({
        activeCompanyId,
        assistantCompanyPending,
        assistantNoCompany,
        assistantNeedsSelect,
        isAssistant,
    });

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    const {
        getActionKey,
        handleEnroll,
        handleUnenroll,
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
        companies,
        activeCompanyId,
        activeCompany,
        coursesById,
        assistantCompanyPending,
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
        getActionKey,
        pendingEnrollmentAction,
        loadStudentsAndCourses,
    };
};

import { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import AssistantDashboardShell from "../components/AssistantDashboardShell";
import { useAssistantDashboardData } from "../hooks/useAssistantDashboardData.jsx";
import { useAssistantDashboardRouteState } from "../hooks/useAssistantDashboardRouteState.js";
import { NAV_ITEMS } from "../utils/assistantDashboard.constants";
import { useDashboardKeyboardNavigation } from "../../../components/ui/dashboard/useDashboardKeyboardNavigation";

const AssistantDashboard = () => {
    const { user } = useContext(AuthContext);
    const { activeTab, handleTabSelect } = useAssistantDashboardRouteState(NAV_ITEMS);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    useDashboardKeyboardNavigation();

    const {
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
        setCurrentPage,
        setSearch,
        setActiveCompanyId,
        setCourseSelections,
        handleEnroll,
        handleUnenroll,
        getActionKey,
        pendingEnrollmentAction,
    } = useAssistantDashboardData(user);

    return (
        <AssistantDashboardShell
            activeTab={activeTab}
            activeCompany={activeCompany}
            activeCompanyId={activeCompanyId}
            assistantNeedsSelect={assistantNeedsSelect}
            assistantNoCompany={assistantNoCompany}
            companies={companies}
            courseCounts={courseCounts}
            courseSelections={courseSelections}
            courses={courses}
            coursesById={coursesById}
            currentPage={currentPage}
            enrolledStudents={enrolledStudents}
            enrollmentsMap={enrollmentsMap}
            handleEnroll={handleEnroll}
            getActionKey={getActionKey}
            handleTabSelect={handleTabSelect}
            handleUnenroll={handleUnenroll}
            isAssistant={isAssistant}
            isSearchTooShort={isSearchTooShort}
            loading={loading}
            pendingEnrollmentAction={pendingEnrollmentAction}
            search={search}
            setActiveCompanyId={setActiveCompanyId}
            setCourseSelections={setCourseSelections}
            setCurrentPage={setCurrentPage}
            setSearch={setSearch}
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            students={students}
            totalPages={totalPages}
            totalStudents={totalStudents}
            user={user}
        />
    );
};

export default AssistantDashboard;

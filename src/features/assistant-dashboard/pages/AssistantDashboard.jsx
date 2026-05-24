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
        coursesById,
        isSearchTooShort,
        setCurrentPage,
        setSearch,
        setCourseSelections,
        handleEnroll,
        handleUnenroll,
        getActionKey,
        lastEnrollmentFeedback,
        pendingEnrollmentAction,
    } = useAssistantDashboardData();

    return (
        <AssistantDashboardShell
            activeTab={activeTab}
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
            isSearchTooShort={isSearchTooShort}
            loading={loading}
            lastEnrollmentFeedback={lastEnrollmentFeedback}
            pendingEnrollmentAction={pendingEnrollmentAction}
            search={search}
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

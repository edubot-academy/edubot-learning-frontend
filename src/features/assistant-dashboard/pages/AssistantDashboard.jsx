import React, { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import DashboardSidebar from "@features/dashboard/components/DashboardSidebar";
import FloatingActionButton from "../../../components/ui/FloatingActionButton";
import AttendancePage from "../../../pages/Attendance";
import AssistantDashboardHeader from "../components/AssistantDashboardHeader";
import AssistantCompanyState from "../components/AssistantCompanyState";
import AssistantStudentTable from "../components/AssistantStudentTable";
import AssistantCourseStats from "../components/AssistantCourseStats";
import { useAssistantDashboardData } from "../hooks/useAssistantDashboardData.jsx";
import {
    FiHome,
    FiUsers,
    FiBookOpen,
    FiCalendar,
    FiMail,
    FiBarChart2,
} from "react-icons/fi";

const NAV_ITEMS = [
    { id: "overview", label: "Кыскача", icon: FiHome, category: "primary", priority: 1 },
    { id: "enrollments", label: "Студенттер", icon: FiUsers, category: "primary", priority: 2 },
    { id: "courses", label: "Курстар", icon: FiBookOpen, category: "learning", priority: 1 },
    { id: "attendance", label: "Катышуу", icon: FiCalendar, category: "learning", priority: 2 },
    { id: "communication", label: "Байланыштар", icon: FiMail, category: "support", priority: 1 },
    { id: "analytics", label: "Аналитика", icon: FiBarChart2, category: "support", priority: 2 },
];

const AssistantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
        isAssistant,
        setCurrentPage,
        setSearch,
        setActiveCompanyId,
        setCourseSelections,
        handleEnroll,
        handleUnenroll,
    } = useAssistantDashboardData(user);

    const renderMainContent = () => {
        if (activeTab === "attendance") {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">
                    <AttendancePage embedded />
                </div>
            );
        }

        if (activeTab === "courses") {
            return (
                <div className="space-y-4">
                    <div className="flex gap-6 mb-2 text-sm font-medium flex-wrap">
                        <div>🎓 Курстар: {courses.length}</div>
                    </div>

                    <div className="mb-4">
                        <AssistantCourseStats
                            courses={courses}
                            courseCounts={courseCounts}
                            loading={loading}
                        />
                    </div>
                </div>
            );
        }

        if (activeTab === "communication" || activeTab === "analytics") {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 text-center">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        Бул бөлүм даярдала элек
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Бул таб үчүн өзүнчө модуль керек. Азырынча негизги каттоо агымы гана калды.
                    </p>
                </div>
            );
        }

        return (
            <AssistantStudentTable
                students={students}
                totalStudents={totalStudents}
                enrolledStudents={enrolledStudents}
                courses={courses}
                courseCounts={courseCounts}
                enrollmentsMap={enrollmentsMap}
                courseSelections={courseSelections}
                coursesById={coursesById}
                currentPage={currentPage}
                totalPages={totalPages}
                loading={loading}
                search={search}
                setSearch={setSearch}
                setCurrentPage={setCurrentPage}
                setCourseSelections={setCourseSelections}
                handleEnroll={handleEnroll}
                handleUnenroll={handleUnenroll}
            />
        );
    };

    return (
        <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex gap-6">
            <DashboardSidebar
                items={NAV_ITEMS}
                activeId={activeTab}
                onSelect={setActiveTab}
                isOpen={sidebarOpen}
                onToggle={setSidebarOpen}
                defaultOpen
                toggleLabels={{ collapse: "Менюну жыйуу", expand: "Меню" }}
            />

            <div className="flex-1">
                <AssistantDashboardHeader
                    isAssistant={isAssistant}
                    activeCompany={activeCompany}
                    totalStudents={totalStudents}
                    enrolledStudents={enrolledStudents}
                    courses={courses}
                />

                <AssistantCompanyState
                    assistantNoCompany={assistantNoCompany}
                    assistantNeedsSelect={assistantNeedsSelect}
                    companies={companies}
                    activeCompanyId={activeCompanyId}
                    setActiveCompanyId={setActiveCompanyId}
                />

                {!assistantNoCompany && !assistantNeedsSelect && renderMainContent()}

                {/* Floating Action Button */}
                <FloatingActionButton role="assistant" />
            </div>
        </div>
    );
};

export default AssistantDashboard;

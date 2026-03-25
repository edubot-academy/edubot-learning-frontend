import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import DashboardSidebar from "@features/dashboard/components/DashboardSidebar";
import FloatingActionButton from "../../../components/ui/FloatingActionButton";
import SkipNavigation from "../../../components/ui/SkipNavigation";
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

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Alt + shortcuts for navigation
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'm':
                        e.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.focus();
                            mainContent.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    case 'n':
                        e.preventDefault();
                        const navigation = document.querySelector('nav[role="navigation"]');
                        if (navigation) {
                            navigation.focus();
                            navigation.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        const searchInput = document.querySelector('input[placeholder*="издөө" i], input[type="search"]');
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                }
            }

            // Arrow key navigation for sidebar
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const sidebarItems = document.querySelectorAll('[role="menuitem"]');
                const currentIndex = Array.from(sidebarItems).findIndex(item => item === document.activeElement);

                if (currentIndex !== -1) {
                    e.preventDefault();
                    let newIndex;
                    if (e.key === 'ArrowLeft') {
                        newIndex = currentIndex > 0 ? currentIndex - 1 : sidebarItems.length - 1;
                    } else {
                        newIndex = currentIndex < sidebarItems.length - 1 ? currentIndex + 1 : 0;
                    }
                    sidebarItems[newIndex].focus();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

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
        const isLoading = loading;
        const isDataLoaded = true; // Assistant data is generally loaded on mount

        // For tab switching, show content with overlay if loading
        if (isLoading && isDataLoaded) {
            return (
                <div className="relative">
                    {renderTabContent()}
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-5 h-5"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Жүктөлүүдө...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return renderTabContent();
    };

    const renderTabContent = () => {
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
            <SkipNavigation />
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
                <div
                    id="main-content"
                    tabIndex={-1}
                    role="main"
                    aria-label="Ассистент dashboard мазмуну"
                >
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
        </div>
    );
};

export default AssistantDashboard;

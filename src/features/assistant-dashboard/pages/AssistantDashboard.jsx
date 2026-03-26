import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../../../context/AuthContext";
import FloatingActionButton from "../../../components/ui/FloatingActionButton";
import AttendancePage from "../../../pages/Attendance";
import AssistantCompanyState from "../components/AssistantCompanyState";
import AssistantStudentTable from "../components/AssistantStudentTable";
import AssistantCourseStats from "../components/AssistantCourseStats";
import { useAssistantDashboardData } from "../hooks/useAssistantDashboardData.jsx";
import {
    DashboardLayout,
    DashboardHeader,
    DashboardTabs,
    StatCard,
    EmptyState,
} from "../../../components/ui/dashboard";
import { NAV_ITEMS } from "../utils/assistantDashboard.constants";

const AssistantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Alt + shortcuts for navigation
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'm': {
                        e.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.focus();
                            mainContent.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                    case 'n': {
                        e.preventDefault();
                        const navigation = document.querySelector('nav[role="navigation"]');
                        if (navigation) {
                            navigation.focus();
                            navigation.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                    case 's': {
                        e.preventDefault();
                        const searchInput = document.querySelector('input[placeholder*="издөө" i], input[type="search"]');
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
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

    const handleTabSelect = useCallback((tabId) => {
        setActiveTab(tabId);
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
                                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-edubot-orange w-5 h-5"></div>
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                    <AttendancePage embedded />
                </div>
            );
        }

        if (activeTab === "courses") {
            return (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-edubot-orange rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">🎓</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Курстар жөнүндө маалымат
                            </h3>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-medium flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-edubot-orange rounded-full"></span>
                                <span>Курстар: {courses.length}</span>
                            </div>
                        </div>
                    </div>

                    <AssistantCourseStats
                        courses={courses}
                        courseCounts={courseCounts}
                        loading={loading}
                    />
                </div>
            );
        }

        if (activeTab === "communication" || activeTab === "analytics") {
            return (
                <EmptyState
                    title="Бул бөлүм даярдала элек"
                    subtitle="Бул таб үчүн өзүнчө модуль керек. Азырынча негизги каттоо агымы гана калды."
                    icon={
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                />
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

    // Prepare navigation items for the standardized layout
    const dashboardNavItems = NAV_ITEMS.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: handleTabSelect,
    }));

    // Prepare header actions
    const headerActions = [
        {
            label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: 'secondary',
        },
    ];

    // Prepare header content with stats
    const headerContent = (
        <div>
            <DashboardHeader
                user={{ fullName: user?.fullName || 'Ассистент', email: user?.email || '' }}
                role="assistant"
                subtitle={isAssistant && activeCompany
                    ? `Ассистент катары сиз ${activeCompany.name} компаниясынын курстарын көрүп жатасыз`
                    : 'Инструкторлорго жардам берүү жана колдоо'
                }
                actions={headerActions}
            />

            {/* Stats Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <StatCard label="Жалпы студенттер" value={totalStudents} color="orange" />
                <StatCard label="Катталган студенттер" value={enrolledStudents.length} color="blue" />
                <StatCard label="Жарыяланган курстар" value={courses.length} color="green" />
            </div>
        </div>
    );

    // Mobile tabs
    const mobileTabs = (
        <DashboardTabs
            items={dashboardNavItems}
            activeId={activeTab}
            onSelect={handleTabSelect}
        />
    );

    return (
        <DashboardLayout
            role="assistant"
            user={{ fullName: user?.fullName || 'Ассистент', email: user?.email || '' }}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
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
        </DashboardLayout>
    );
};

export default AssistantDashboard;

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
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardTabs,
    DashboardWorkspaceHero,
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
        if (activeTab === "overview") {
            const availableCourses = courses.filter((course) => (courseCounts[course.id] || 0) === 0).length;

            return (
                <div className="space-y-6">
                    <DashboardWorkspaceHero
                        eyebrow="Assistant overview"
                        title="Ассистенттин кыскача көрүнүшү"
                        description="Компаниядагы студенттер, курстар жана каттоо агымы боюнча ыкчам абал."
                        metrics={(
                            <>
                                <DashboardMetricCard label="Жалпы студенттер" value={totalStudents} tone="blue" />
                                <DashboardMetricCard label="Катталган студенттер" value={enrolledStudents.length} tone="green" />
                                <DashboardMetricCard label="Жарыяланган курстар" value={courses.length} tone="amber" />
                            </>
                        )}
                        metricsClassName="grid grid-cols-1 gap-3 sm:grid-cols-3"
                    >
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr),minmax(0,0.7fr)]">
                            <DashboardInsetPanel
                                title="Иш агымы"
                                description="Негизги милдеттер жана учурдагы компания контексти."
                            >
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            Компания
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">
                                            {activeCompany?.name || 'Тандалган компания'}
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            Ассистент катары ушул компаниянын студент агымын жана курстарын башкарып жатасыз.
                                        </p>
                                    </div>
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            Каттоо мүмкүнчүлүгү
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">
                                            {availableCourses} бош курс
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            Учурда студент кошула элек жарыяланган курстарды тез аныктап, андан ары каттоо табына өтүңүз.
                                        </p>
                                    </div>
                                </div>
                            </DashboardInsetPanel>

                            <DashboardInsetPanel
                                title="Кийинки кадам"
                                description="Күндөлүк иш үчүн тез багыт."
                            >
                                <div className="space-y-3 text-sm text-edubot-muted dark:text-slate-300">
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="font-semibold text-edubot-ink dark:text-white">1. Студенттерди текшериңиз</p>
                                        <p className="mt-1">Каттоо күтүп турган студенттерди `Студенттер` табынан караңыз.</p>
                                    </div>
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="font-semibold text-edubot-ink dark:text-white">2. Курстарды салыштырыңыз</p>
                                        <p className="mt-1">`Курстар` табынан ар бир курс боюнча жүктөмдү көрүңүз.</p>
                                    </div>
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="font-semibold text-edubot-ink dark:text-white">3. Катышууну жаңыртыңыз</p>
                                        <p className="mt-1">Сабак күнү келгенде `Катышуу` табынан күндүк белгилөөнү аткарыңыз.</p>
                                    </div>
                                </div>
                            </DashboardInsetPanel>
                        </div>
                    </DashboardWorkspaceHero>

                    <AssistantCourseStats
                        courses={courses}
                        courseCounts={courseCounts}
                        loading={loading}
                    />
                </div>
            );
        }

        if (activeTab === "attendance") {
            return <AttendancePage embedded />;
        }

        if (activeTab === "courses") {
            return (
                <div className="space-y-6">
                    <DashboardWorkspaceHero
                        eyebrow="Assistant courses"
                        title="Курстар жөнүндө маалымат"
                        description="Компаниядагы жарыяланган курстар жана алардагы студент жүктөмү."
                        metrics={(
                            <DashboardMetricCard label="Курстар" value={courses.length} tone="blue" />
                        )}
                        metricsClassName="grid grid-cols-1 gap-3 sm:grid-cols-1"
                    />

                    <AssistantCourseStats
                        courses={courses}
                        courseCounts={courseCounts}
                        loading={loading}
                    />
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
                <DashboardMetricCard label="Жалпы студенттер" value={totalStudents} tone="blue" />
                <DashboardMetricCard label="Катталган студенттер" value={enrolledStudents.length} tone="green" />
                <DashboardMetricCard label="Жарыяланган курстар" value={courses.length} tone="amber" />
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

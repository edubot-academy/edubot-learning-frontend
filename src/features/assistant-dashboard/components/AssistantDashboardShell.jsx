import FloatingActionButton from "../../../components/ui/FloatingActionButton";
import AttendancePage from "../../../pages/Attendance";
import {
    DashboardLayout,
    DashboardHeader,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardTabs,
    DashboardWorkspaceHero,
} from "../../../components/ui/dashboard";
import { NAV_ITEMS } from "../utils/assistantDashboard.constants";
import AssistantCompanyState from "./AssistantCompanyState";
import AssistantCourseStats from "./AssistantCourseStats";
import AssistantStudentTable from "./AssistantStudentTable";

const AssistantDashboardShell = ({
    activeTab,
    activeCompany,
    activeCompanyId,
    assistantNeedsSelect,
    assistantNoCompany,
    companies,
    courseCounts,
    courseSelections,
    courses,
    coursesById,
    currentPage,
    enrolledStudents,
    enrollmentsMap,
    handleEnroll,
    handleTabSelect,
    handleUnenroll,
    isAssistant,
    isSearchTooShort,
    loading,
    search,
    setActiveCompanyId,
    setCourseSelections,
    setCurrentPage,
    setSearch,
    setSidebarOpen,
    sidebarOpen,
    students,
    totalPages,
    totalStudents,
    user,
}) => {
    const dashboardNavItems = NAV_ITEMS.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: handleTabSelect,
    }));

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
                                            {activeCompany?.name || "Тандалган компания"}
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
                isSearchTooShort={isSearchTooShort}
            />
        );
    };

    const renderMainContent = () => {
        if (loading) {
            return (
                <div className="relative">
                    {renderTabContent()}
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-edubot-orange" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Жүктөлүүдө...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return renderTabContent();
    };

    const headerActions = [
        {
            label: sidebarOpen ? "Менюну жашыруу" : "Менюну көрсөтүү",
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: "secondary",
        },
    ];

    const headerContent = (
        <div>
            <DashboardHeader
                user={{ fullName: user?.fullName || "Ассистент", email: user?.email || "" }}
                role="assistant"
                subtitle={isAssistant && activeCompany
                    ? `Ассистент катары сиз ${activeCompany.name} компаниясынын курстарын көрүп жатасыз`
                    : "Инструкторлорго жардам берүү жана колдоо"
                }
                actions={headerActions}
            />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <DashboardMetricCard label="Жалпы студенттер" value={totalStudents} tone="blue" />
                <DashboardMetricCard label="Катталган студенттер" value={enrolledStudents.length} tone="green" />
                <DashboardMetricCard label="Жарыяланган курстар" value={courses.length} tone="amber" />
            </div>
        </div>
    );

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
            user={{ fullName: user?.fullName || "Ассистент", email: user?.email || "" }}
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

            <FloatingActionButton role="assistant" />
        </DashboardLayout>
    );
};

export default AssistantDashboardShell;

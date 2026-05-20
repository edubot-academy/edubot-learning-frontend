import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import {
    ASSISTANT_ATTENDANCE_WORKSPACE_DECISION,
    NAV_ITEMS,
} from "../utils/assistantDashboard.constants";
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
    getActionKey,
    handleEnroll,
    handleTabSelect,
    handleUnenroll,
    isAssistant,
    isSearchTooShort,
    loading,
    lastEnrollmentFeedback,
    pendingEnrollmentAction,
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
    const { t } = useTranslation();
    const dashboardNavItems = useMemo(
        () =>
            NAV_ITEMS.map((item) => ({
                ...item,
                label: item.labelKey ? t(item.labelKey) : item.label,
                groupLabel: item.groupLabelKey ? t(item.groupLabelKey) : item.groupLabel,
                isActive: item.id === activeTab,
                onSelect: handleTabSelect,
            })),
        [activeTab, handleTabSelect, t]
    );

    const renderTabContent = () => {
        if (activeTab === "overview") {
            const availableCourses = courses.filter((course) => (courseCounts[course.id] || 0) === 0).length;
            const visibleStudentsWithoutCourse = Math.max(0, students.length - enrolledStudents.length);
            const loadedCourseCounts = Object.values(courseCounts).map((count) => Number(count || 0));
            const averageCourseLoad = loadedCourseCounts.length
                ? loadedCourseCounts.reduce((sum, count) => sum + count, 0) / loadedCourseCounts.length
                : 0;
            const highLoadCourses = courses.filter((course) => {
                const courseLoad = Number(courseCounts[course.id] || 0);
                return courseLoad > 0 && courseLoad >= Math.max(8, averageCourseLoad * 1.5);
            }).length;

            return (
                <div className="space-y-6">
                    <DashboardWorkspaceHero
                        eyebrow={t('assistantDashboard.overview.eyebrow')}
                        title={t('assistantDashboard.overview.title')}
                        description={t('assistantDashboard.overview.description')}
                        metrics={(
                            <>
                                <DashboardMetricCard label={t('assistantDashboard.overview.metrics.studentsWithoutCourse')} value={visibleStudentsWithoutCourse} tone="amber" />
                                <DashboardMetricCard label={t('assistantDashboard.overview.metrics.emptyCourses')} value={availableCourses} tone="blue" />
                                <DashboardMetricCard label={t('assistantDashboard.overview.metrics.highLoadCourses')} value={highLoadCourses} tone="green" />
                            </>
                        )}
                        metricsClassName="grid grid-cols-1 gap-3 sm:grid-cols-3"
                    >
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr),minmax(0,0.7fr)]">
                            <DashboardInsetPanel
                                title={t('assistantDashboard.overview.workflow.title')}
                                description={t('assistantDashboard.overview.workflow.description')}
                            >
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            {t('assistantDashboard.overview.company.label')}
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">
                                            {activeCompany?.name || t('assistantDashboard.overview.company.fallback')}
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {t('assistantDashboard.overview.company.description')}
                                        </p>
                                    </div>
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            {t('assistantDashboard.overview.signal.label')}
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">
                                            {visibleStudentsWithoutCourse > 0
                                                ? t('assistantDashboard.overview.signal.studentsNeedCourse', { count: visibleStudentsWithoutCourse })
                                                : highLoadCourses > 0
                                                  ? t('assistantDashboard.overview.signal.highLoadCourses', { count: highLoadCourses })
                                                  : t('assistantDashboard.overview.signal.emptyCourses', { count: availableCourses })}
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {t('assistantDashboard.overview.signal.description')}
                                        </p>
                                    </div>
                                </div>
                            </DashboardInsetPanel>

                            <DashboardInsetPanel
                                title={t('assistantDashboard.overview.nextSteps.title')}
                                description={t('assistantDashboard.overview.nextSteps.description')}
                            >
                                <div className="space-y-3 text-sm text-edubot-muted dark:text-slate-300">
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="font-semibold text-edubot-ink dark:text-white">{t('assistantDashboard.overview.nextSteps.students.title')}</p>
                                        <p className="mt-1">{t('assistantDashboard.overview.nextSteps.students.text')}</p>
                                    </div>
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="font-semibold text-edubot-ink dark:text-white">{t('assistantDashboard.overview.nextSteps.courses.title')}</p>
                                        <p className="mt-1">{t('assistantDashboard.overview.nextSteps.courses.text')}</p>
                                    </div>
                                    <div className="dashboard-panel-muted rounded-3xl p-4">
                                        <p className="font-semibold text-edubot-ink dark:text-white">{t('assistantDashboard.overview.nextSteps.attendance.title')}</p>
                                        <p className="mt-1">{t('assistantDashboard.overview.nextSteps.attendance.text')}</p>
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
            return (
                <div className="space-y-4">
                    <DashboardInsetPanel
                        title={t('assistantDashboard.attendance.title')}
                        description={t('assistantDashboard.attendance.description')}
                    >
                        <div className="text-sm text-edubot-muted dark:text-slate-400">
                            {t(ASSISTANT_ATTENDANCE_WORKSPACE_DECISION.reasonKey)}
                        </div>
                    </DashboardInsetPanel>
                    <AttendancePage embedded />
                </div>
            );
        }

        if (activeTab === "courses") {
            return (
                <div className="space-y-6">
                    <DashboardWorkspaceHero
                        eyebrow={t('assistantDashboard.courses.eyebrow')}
                        title={t('assistantDashboard.courses.title')}
                        description={t('assistantDashboard.courses.description')}
                        metrics={(
                            <DashboardMetricCard label={t('assistantDashboard.metrics.courses')} value={courses.length} tone="blue" />
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
                getActionKey={getActionKey}
                handleEnroll={handleEnroll}
                handleUnenroll={handleUnenroll}
                isSearchTooShort={isSearchTooShort}
                lastEnrollmentFeedback={lastEnrollmentFeedback}
                pendingEnrollmentAction={pendingEnrollmentAction}
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
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
            label: sidebarOpen
                ? t('assistantDashboard.header.hideMenu')
                : t('assistantDashboard.header.showMenu'),
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: "secondary",
        },
    ];

    const headerContent = (
        <div>
            <DashboardHeader
                user={{ fullName: user?.fullName || t('assistantDashboard.header.userFallback'), email: user?.email || "" }}
                role="assistant"
                subtitle={isAssistant && activeCompany
                    ? t('assistantDashboard.header.companySubtitle', { company: activeCompany.name })
                    : t('assistantDashboard.header.defaultSubtitle')
                }
                actions={headerActions}
            />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <DashboardMetricCard label={t('assistantDashboard.metrics.totalStudents')} value={totalStudents} tone="blue" />
                <DashboardMetricCard label={t('assistantDashboard.metrics.enrolledStudents')} value={enrolledStudents.length} tone="green" />
                <DashboardMetricCard label={t('assistantDashboard.metrics.publishedCourses')} value={courses.length} tone="amber" />
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
            user={{ fullName: user?.fullName || t('assistantDashboard.header.userFallback'), email: user?.email || "" }}
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

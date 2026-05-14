import PropTypes from 'prop-types';
import FloatingActionButton from '@components/ui/FloatingActionButton';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import StudentEmptyState from './shared/StudentEmptyState.jsx';
import OverviewTab from './tabs/OverviewTab.jsx';
import CoursesTab from './tabs/CoursesTab.jsx';
import ScheduleTab from './tabs/ScheduleTab.jsx';
import ResourcesTab from './tabs/ResourcesTab.jsx';
import TasksTab from './tabs/TasksTab.jsx';
import ProgressTab from './tabs/ProgressTab.jsx';
import CertificatesTab from './tabs/CertificatesTab.jsx';
import ProfileTab from './tabs/ProfileTab.jsx';
import ChatTab from './ChatTab.jsx';
import LeaderboardHub from '@features/leaderboard/components/LeaderboardHub.jsx';
import {
    DashboardLayout,
    DashboardHeader,
    DashboardTabs,
    LoadingState,
} from '@components/ui/dashboard';

const ACCESS_REQUIRED_TABS = [
    'overview',
    'my-courses',
    'schedule',
    'resources',
    'tasks',
    'progress',
    'certificates',
    'leaderboard',
];

const LIST_LOADING_TABS = ['my-courses', 'schedule', 'resources', 'tasks', 'certificates'];

const StudentDashboardShell = ({
    activeTab,
    attendanceEnabled,
    attendanceStats,
    certificates,
    courses,
    filterCourseId,
    handleDashboardNavSelect,
    handleNotificationChange,
    handleOpenCourse,
    handleSaveNotifications,
    handleSaveProfile,
    handleSubmitHomework,
    hasActiveStudentAccess,
    isCurrentTabLoading,
    isProfileReady,
    isTabDataLoaded,
    mergedNotificationSettings,
    navItems,
    offerings,
    offeringsByCourse,
    openingCourseId,
    overviewStudent,
    profileData,
    profileStudent,
    progressItems,
    recordings,
    resources,
    savingNotifications,
    savingProfile,
    setActiveTab,
    setSidebarOpen,
    sidebarOpen,
    submittingTaskState,
    summary,
    tasks,
    user,
}) => {
    const renderTabContent = () => {
        switch (activeTab) {
            case 'my-courses':
                return <CoursesTab courses={courses} offeringsByCourse={offeringsByCourse} />;
            case 'schedule':
                return <ScheduleTab offerings={offerings} recordings={recordings} />;
            case 'resources':
                return (
                    <ResourcesTab
                        items={resources}
                        onOpenTasks={() => setActiveTab('tasks')}
                    />
                );
            case 'tasks':
                return (
                    <TasksTab
                        tasks={tasks}
                        onSubmitHomework={handleSubmitHomework}
                        submittingTaskState={submittingTaskState}
                    />
                );
            case 'progress':
                return (
                    <ProgressTab
                        items={progressItems}
                        courses={courses}
                        attendanceStats={attendanceStats}
                        attendanceEnabled={attendanceEnabled}
                        courseId={filterCourseId || undefined}
                    />
                );
            case 'certificates':
                return <CertificatesTab certificates={certificates} />;
            case 'leaderboard':
                return <LeaderboardHub embedded initialTrack="all" />;
            case 'notifications':
                return <NotificationsTab />;
            case 'profile':
                return (
                    <ProfileTab
                        student={profileStudent}
                        notificationSettings={mergedNotificationSettings}
                        onSaveProfile={handleSaveProfile}
                        savingProfile={savingProfile}
                        onNotificationChange={handleNotificationChange}
                        onSaveNotifications={handleSaveNotifications}
                        savingNotifications={savingNotifications}
                    />
                );
            case 'chat':
                return <ChatTab />;
            case 'overview':
            default:
                return (
                    <OverviewTab
                        student={overviewStudent}
                        summary={summary}
                        courses={courses}
                        offerings={offerings}
                        tasks={tasks}
                        attendanceStats={attendanceStats}
                        attendanceEnabled={attendanceEnabled}
                        progressItems={progressItems}
                        onOpenCourse={handleOpenCourse}
                        openingCourseId={openingCourseId}
                    />
                );
        }
    };

    const renderTab = () => {
        if (ACCESS_REQUIRED_TABS.includes(activeTab) && !hasActiveStudentAccess) {
            return <StudentEmptyState />;
        }

        if (!isTabDataLoaded || !isProfileReady) {
            if (activeTab === 'overview') return <LoadingState type="card" count={3} />;
            if (LIST_LOADING_TABS.includes(activeTab)) return <LoadingState type="list" />;
            return <LoadingState type="table" />;
        }

        if (isCurrentTabLoading && isTabDataLoaded) {
            return (
                <div className="relative">
                    {renderTabContent()}
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-edubot-orange w-6 h-6" />
                        </div>
                    </div>
                </div>
            );
        }

        return renderTabContent();
    };

    const dashboardNavItems = navItems.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: handleDashboardNavSelect,
    }));

    const headerActions = [
        {
            label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: 'secondary',
        },
    ];

    const headerContent = (
        <DashboardHeader
            user={{
                fullName: profileData?.fullName || user?.fullName || overviewStudent.name,
                email: user?.email || profileData?.email || '',
            }}
            role="student"
            subtitle="Чыгармачыл окуу жолуңузду көзөмөлдөңүз"
            actions={headerActions}
        />
    );

    const mobileTabs = (
        <DashboardTabs
            items={dashboardNavItems}
            activeId={activeTab}
            onSelect={handleDashboardNavSelect}
        />
    );

    return (
        <DashboardLayout
            role="student"
            user={overviewStudent}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
            {renderTab()}
            <FloatingActionButton role="student" />
        </DashboardLayout>
    );
};

StudentDashboardShell.propTypes = {
    activeTab: PropTypes.string.isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    attendanceStats: PropTypes.shape({}).isRequired,
    certificates: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    courses: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    filterCourseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handleDashboardNavSelect: PropTypes.func.isRequired,
    handleNotificationChange: PropTypes.func.isRequired,
    handleOpenCourse: PropTypes.func.isRequired,
    handleSaveNotifications: PropTypes.func.isRequired,
    handleSaveProfile: PropTypes.func.isRequired,
    handleSubmitHomework: PropTypes.func.isRequired,
    hasActiveStudentAccess: PropTypes.bool.isRequired,
    isCurrentTabLoading: PropTypes.bool.isRequired,
    isProfileReady: PropTypes.bool.isRequired,
    isTabDataLoaded: PropTypes.bool.isRequired,
    mergedNotificationSettings: PropTypes.shape({}).isRequired,
    navItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
    })).isRequired,
    offerings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    offeringsByCourse: PropTypes.instanceOf(Map).isRequired,
    openingCourseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    overviewStudent: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
    profileData: PropTypes.shape({}),
    profileStudent: PropTypes.shape({}).isRequired,
    progressItems: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    recordings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    resources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    savingNotifications: PropTypes.bool.isRequired,
    savingProfile: PropTypes.bool.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    setSidebarOpen: PropTypes.func.isRequired,
    sidebarOpen: PropTypes.bool.isRequired,
    submittingTaskState: PropTypes.shape({}),
    summary: PropTypes.shape({}),
    tasks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    user: PropTypes.shape({
        email: PropTypes.string,
        fullName: PropTypes.string,
    }),
};

export default StudentDashboardShell;

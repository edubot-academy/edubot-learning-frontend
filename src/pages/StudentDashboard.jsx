import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '@features/student-dashboard/utils/studentDashboard.constants.js';
import {
    isOfflineOrLiveCourse,
} from '@features/student-dashboard/utils/studentDashboard.helpers.js';
import StudentDashboardShell from '@features/student-dashboard/components/StudentDashboardShell.jsx';
import { useStudentDashboardData } from '@features/student-dashboard/hooks/useStudentDashboardData.js';
import { useStudentDashboardRouteState } from '@features/student-dashboard/hooks/useStudentDashboardRouteState.js';
import { useStudentDashboardViewModel } from '@features/student-dashboard/hooks/useStudentDashboardViewModel.js';
import { useStudentProfileSettings } from '@features/student-dashboard/hooks/useStudentProfileSettings.js';
import { useStudentTaskRefresh } from '@features/student-dashboard/hooks/useStudentTaskRefresh.js';
import { useStudentTaskSubmission } from '@features/student-dashboard/hooks/useStudentTaskSubmission.js';
import { useDashboardKeyboardNavigation } from '../components/ui/dashboard/useDashboardKeyboardNavigation';


const StudentDashboard = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const studentId = user?.id;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {
        activeTab,
        filterCourseId,
        filterGroupId,
        setActiveTab,
        setFilterGroupId,
    } = useStudentDashboardRouteState({
        navItems: NAV_ITEMS,
        enabled: Boolean(studentId),
    });
    const [openingCourseId, setOpeningCourseId] = useState(null);
    useDashboardKeyboardNavigation();
    const {
        handleNotificationChange,
        handleSaveNotifications,
        handleSaveProfile,
        loadNotificationSettings,
        loadProfileData,
        notificationLoading,
        notificationSettings,
        notificationsLoaded,
        profileData,
        profileLoaded,
        profileLoading,
        savingNotifications,
        savingProfile,
    } = useStudentProfileSettings({ studentId });

    const {
        accessLoaded,
        accessState,
        accessStateError,
        certificates,
        courses,
        loadedTabs,
        loadTasks,
        offerings,
        progress,
        recordings,
        resources,
        summary,
        tabLoading,
        tasks,
    } = useStudentDashboardData({
        activeTab,
        filterCourseId,
        filterGroupId,
        loadNotificationSettings,
        loadProfileData,
        notificationLoading,
        notificationsLoaded,
        profileLoaded,
        profileLoading,
        studentId,
    });

    const {
        attendanceEnabled,
        attendanceStats,
        accessStateDetails,
        groupOptions,
        hasActiveStudentAccess,
        mergedNotificationSettings,
        offeringsByCourse,
        overviewStudent,
        profileStudent,
        progressItems,
    } = useStudentDashboardViewModel({
        accessLoaded,
        accessState,
        accessStateError,
        certificates,
        courses,
        filterCourseId,
        notificationSettings,
        offerings,
        profileData,
        progress,
        summary,
        user,
    });

    useEffect(() => {
        if (!filterCourseId) {
            setFilterGroupId('');
            return;
        }
        const selected = courses.find((course) => String(course.id) === String(filterCourseId));
        if (!isOfflineOrLiveCourse(selected)) {
            setFilterGroupId('');
            return;
        }
        const hasGroup = groupOptions.some((group) => String(group.id) === String(filterGroupId));
        if (!hasGroup) {
            setFilterGroupId('');
        }
    }, [filterCourseId, filterGroupId, courses, groupOptions, setFilterGroupId]);

    useStudentTaskRefresh({
        activeTab,
        studentId,
        onRefreshTasks: loadTasks,
    });
    const {
        handleSubmitHomework,
        submittingTaskState,
    } = useStudentTaskSubmission({ onRefreshTasks: loadTasks });

    const handleOpenCourse = useCallback(async (courseId) => {
        if (!courseId) {
            toast.error(t('studentDashboard.toasts.courseNotFound'));
            return;
        }

        try {
            setOpeningCourseId(courseId);
            navigate(`/courses/${courseId}`);
        } catch (error) {
            console.error('Failed to open course:', error);
            toast.error(t('studentDashboard.toasts.openCourseError'));
        } finally {
            setOpeningCourseId(null);
        }
    }, [navigate, t]);

    const resolvedTab = activeTab;
    const isTabDataLoaded = loadedTabs[resolvedTab] || false;
    const isProfileReady =
        activeTab !== 'profile' ||
        ((notificationsLoaded && !notificationLoading) && (profileLoaded && !profileLoading));
    const isCurrentTabLoading =
        tabLoading === resolvedTab ||
        (activeTab === 'profile' && (notificationLoading || profileLoading));
    const handleDashboardNavSelect = useCallback(
        (id) => {
            if (!NAV_ITEMS.some((item) => item.id === id)) return;
            setActiveTab(id);
        },
        [setActiveTab]
    );

    return (
        <StudentDashboardShell
            activeTab={activeTab}
            accessStateDetails={accessStateDetails}
            attendanceEnabled={attendanceEnabled}
            attendanceStats={attendanceStats}
            certificates={certificates}
            courses={courses}
            filterCourseId={filterCourseId}
            handleDashboardNavSelect={handleDashboardNavSelect}
            handleNotificationChange={handleNotificationChange}
            handleOpenCourse={handleOpenCourse}
            handleSaveNotifications={handleSaveNotifications}
            handleSaveProfile={handleSaveProfile}
            handleSubmitHomework={handleSubmitHomework}
            hasActiveStudentAccess={hasActiveStudentAccess}
            isCurrentTabLoading={isCurrentTabLoading}
            isProfileReady={isProfileReady}
            isTabDataLoaded={isTabDataLoaded}
            mergedNotificationSettings={mergedNotificationSettings}
            navItems={NAV_ITEMS}
            offerings={offerings}
            offeringsByCourse={offeringsByCourse}
            openingCourseId={openingCourseId}
            overviewStudent={overviewStudent}
            profileData={profileData}
            profileStudent={profileStudent}
            progressItems={progressItems}
            recordings={recordings}
            resources={resources}
            savingNotifications={savingNotifications}
            savingProfile={savingProfile}
            setActiveTab={setActiveTab}
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            submittingTaskState={submittingTaskState}
            summary={summary}
            tasks={tasks}
            user={user}
        />
    );
};

export default StudentDashboard;

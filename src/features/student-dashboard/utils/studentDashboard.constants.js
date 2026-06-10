import {
    FiHome,
    FiBookOpen,
    FiCalendar,
    FiFolder,
    FiCheckCircle,
    FiBarChart2,
    FiUser,
    FiBell,
    FiMessageCircle,
    FiPlay,
    FiAward,
    FiGlobe,
} from 'react-icons/fi';
import { STUDENT_DASHBOARD_TABS } from '@shared/constants/dashboardTabs';
import { applyWorkspaceGroups } from '@shared/utils/workspaceGroups';

export const STUDENT_WORKSPACE_GROUPS = Object.freeze({
    LEARNING: Object.freeze({
        id: 'learning',
        labelKey: 'studentDashboard.shell.workspaceGroups.learning.label',
        descriptionKey: 'studentDashboard.shell.workspaceGroups.learning.description',
        tabs: Object.freeze([
            STUDENT_DASHBOARD_TABS.OVERVIEW,
            STUDENT_DASHBOARD_TABS.MY_COURSES,
            STUDENT_DASHBOARD_TABS.SCHEDULE,
            STUDENT_DASHBOARD_TABS.RESOURCES,
            STUDENT_DASHBOARD_TABS.FREE_RESOURCES,
        ]),
    }),
    PROGRESS: Object.freeze({
        id: 'progress',
        labelKey: 'studentDashboard.shell.workspaceGroups.progress.label',
        descriptionKey: 'studentDashboard.shell.workspaceGroups.progress.description',
        tabs: Object.freeze([
            STUDENT_DASHBOARD_TABS.TASKS,
            STUDENT_DASHBOARD_TABS.PROGRESS,
            STUDENT_DASHBOARD_TABS.CERTIFICATES,
            STUDENT_DASHBOARD_TABS.LEADERBOARD,
        ]),
    }),
    SUPPORT: Object.freeze({
        id: 'support',
        labelKey: 'studentDashboard.shell.workspaceGroups.support.label',
        descriptionKey: 'studentDashboard.shell.workspaceGroups.support.description',
        tabs: Object.freeze([
            STUDENT_DASHBOARD_TABS.CHAT,
            STUDENT_DASHBOARD_TABS.PROFILE,
            STUDENT_DASHBOARD_TABS.NOTIFICATIONS,
        ]),
    }),
});

export const STUDENT_WORKSPACE_GROUP_BY_ID = Object.freeze(
    Object.values(STUDENT_WORKSPACE_GROUPS).reduce((groups, group) => {
        groups[group.id] = group;
        return groups;
    }, {})
);

const RAW_NAV_ITEMS = [
    // Primary Navigation - Core Learning Activities
    { id: STUDENT_DASHBOARD_TABS.OVERVIEW, labelKey: 'studentDashboard.shell.nav.overview', icon: FiHome, category: 'primary', priority: 1 },
    { id: STUDENT_DASHBOARD_TABS.MY_COURSES, labelKey: 'studentDashboard.shell.nav.myCourses', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: STUDENT_DASHBOARD_TABS.SCHEDULE, labelKey: 'studentDashboard.shell.nav.schedule', icon: FiCalendar, category: 'primary', priority: 3 },
    { id: STUDENT_DASHBOARD_TABS.RESOURCES, labelKey: 'studentDashboard.shell.nav.resources', icon: FiFolder, category: 'primary', priority: 4 },
    { id: STUDENT_DASHBOARD_TABS.FREE_RESOURCES, labelKey: 'studentDashboard.shell.nav.freeResources', icon: FiGlobe, category: 'primary', priority: 5 },
    { id: STUDENT_DASHBOARD_TABS.TASKS, labelKey: 'studentDashboard.shell.nav.tasks', icon: FiPlay, category: 'primary', priority: 6 },
    { id: STUDENT_DASHBOARD_TABS.PROGRESS, labelKey: 'studentDashboard.shell.nav.progress', icon: FiBarChart2, category: 'primary', priority: 7 },
    { id: STUDENT_DASHBOARD_TABS.CERTIFICATES, labelKey: 'studentDashboard.shell.nav.certificates', icon: FiAward, category: 'primary', priority: 8 },

    // Secondary Navigation - Learning Management
    { id: STUDENT_DASHBOARD_TABS.CHAT, labelKey: 'studentDashboard.shell.nav.chat', icon: FiMessageCircle, category: 'secondary', priority: 2 },
    { id: STUDENT_DASHBOARD_TABS.LEADERBOARD, labelKey: 'studentDashboard.shell.nav.leaderboard', icon: FiCheckCircle, category: 'secondary', priority: 3 },

    // Administrative - Settings & Communication
    { id: STUDENT_DASHBOARD_TABS.PROFILE, labelKey: 'studentDashboard.shell.nav.profile', icon: FiUser, category: 'admin', priority: 1 },
    { id: STUDENT_DASHBOARD_TABS.NOTIFICATIONS, labelKey: 'studentDashboard.shell.nav.notifications', icon: FiBell, category: 'admin', priority: 2 },
];

export const NAV_ITEMS = applyWorkspaceGroups(RAW_NAV_ITEMS, STUDENT_WORKSPACE_GROUPS);

export const DEFAULT_NOTIFICATION_SETTINGS = {
    lessonReminders: true,
    announcementEmails: true,
    taskUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
};

export const NOTIFICATION_LABELS = {
    lessonReminders: {
        labelKey: 'studentDashboard.profile.notifications.lessonReminders.label',
        descriptionKey: 'studentDashboard.profile.notifications.lessonReminders.description',
    },
    announcementEmails: {
        labelKey: 'studentDashboard.profile.notifications.announcementEmails.label',
        descriptionKey: 'studentDashboard.profile.notifications.announcementEmails.description',
    },
    taskUpdates: {
        labelKey: 'studentDashboard.profile.notifications.taskUpdates.label',
        descriptionKey: 'studentDashboard.profile.notifications.taskUpdates.description',
    },
    smsAlerts: {
        labelKey: 'studentDashboard.profile.notifications.smsAlerts.label',
        descriptionKey: 'studentDashboard.profile.notifications.smsAlerts.description',
    },
    pushNotifications: {
        labelKey: 'studentDashboard.profile.notifications.pushNotifications.label',
        descriptionKey: 'studentDashboard.profile.notifications.pushNotifications.description',
    },
};

export const JOIN_WINDOW_MS = 10 * 60 * 1000;

import {
    FiHome,
    FiAward,
    FiBookOpen,
    FiUsers,
    FiUser,
    FiCpu,
    FiLayers,
    FiFilter,
    FiCalendar,
    FiGlobe,
    FiBell,
    FiMessageCircle,
    FiGrid,
} from 'react-icons/fi';
import { INSTRUCTOR_DASHBOARD_TABS } from '@shared/constants/dashboardTabs';
import { applyWorkspaceGroups } from '@shared/utils/workspaceGroups';

export const INSTRUCTOR_WORKSPACE_GROUPS = Object.freeze({
    OVERVIEW: Object.freeze({
        id: 'overview',
        labelKey: 'instructorDashboard.workspaceGroups.overview.label',
        descriptionKey: 'instructorDashboard.workspaceGroups.overview.description',
        tabs: Object.freeze([
            INSTRUCTOR_DASHBOARD_TABS.OVERVIEW,
            INSTRUCTOR_DASHBOARD_TABS.ANALYTICS,
            INSTRUCTOR_DASHBOARD_TABS.LEADERBOARD,
        ]),
    }),
    COURSE_MANAGEMENT: Object.freeze({
        id: 'course-management',
        labelKey: 'instructorDashboard.workspaceGroups.courseManagement.label',
        descriptionKey: 'instructorDashboard.workspaceGroups.courseManagement.description',
        tabs: Object.freeze([
            INSTRUCTOR_DASHBOARD_TABS.COURSES,
            INSTRUCTOR_DASHBOARD_TABS.STUDENTS,
            INSTRUCTOR_DASHBOARD_TABS.CERTIFICATES,
            INSTRUCTOR_DASHBOARD_TABS.GROUPS,
            INSTRUCTOR_DASHBOARD_TABS.OFFERINGS,
        ]),
    }),
    DELIVERY_WORKBENCH: Object.freeze({
        id: 'delivery-workbench',
        labelKey: 'instructorDashboard.workspaceGroups.deliveryWorkbench.label',
        descriptionKey: 'instructorDashboard.workspaceGroups.deliveryWorkbench.description',
        tabs: Object.freeze([
            INSTRUCTOR_DASHBOARD_TABS.SESSIONS,
            INSTRUCTOR_DASHBOARD_TABS.HOMEWORK,
            INSTRUCTOR_DASHBOARD_TABS.ATTENDANCE,
            INSTRUCTOR_DASHBOARD_TABS.CHAT,
        ]),
    }),
    SETTINGS: Object.freeze({
        id: 'settings',
        labelKey: 'instructorDashboard.workspaceGroups.settings.label',
        descriptionKey: 'instructorDashboard.workspaceGroups.settings.description',
        tabs: Object.freeze([
            INSTRUCTOR_DASHBOARD_TABS.PROFILE,
            INSTRUCTOR_DASHBOARD_TABS.AI,
            INSTRUCTOR_DASHBOARD_TABS.NOTIFICATIONS,
        ]),
    }),
});

export const INSTRUCTOR_WORKSPACE_GROUP_BY_ID = Object.freeze(
    Object.values(INSTRUCTOR_WORKSPACE_GROUPS).reduce((groups, group) => {
        groups[group.id] = group;
        return groups;
    }, {})
);

const RAW_NAV_ITEMS = [
    // Primary Navigation - Core Daily Tasks
    { id: INSTRUCTOR_DASHBOARD_TABS.OVERVIEW, labelKey: 'instructorDashboard.nav.overview', icon: FiHome, category: 'primary', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.COURSES, labelKey: 'instructorDashboard.nav.courses', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: INSTRUCTOR_DASHBOARD_TABS.STUDENTS, labelKey: 'instructorDashboard.nav.students', icon: FiUsers, category: 'primary', priority: 3 },
    { id: INSTRUCTOR_DASHBOARD_TABS.CERTIFICATES, labelKey: 'instructorDashboard.nav.certificates', icon: FiAward, category: 'primary', priority: 4 },
    { id: INSTRUCTOR_DASHBOARD_TABS.GROUPS, labelKey: 'instructorDashboard.nav.groups', icon: FiGrid, category: 'primary', priority: 5 },

    // Secondary Navigation - Learning Management
    { id: INSTRUCTOR_DASHBOARD_TABS.OFFERINGS, labelKey: 'instructorDashboard.nav.offerings', icon: FiLayers, category: 'secondary', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.SESSIONS, labelKey: 'instructorDashboard.nav.sessions', icon: FiCalendar, category: 'secondary', priority: 2 },
    { id: INSTRUCTOR_DASHBOARD_TABS.HOMEWORK, labelKey: 'instructorDashboard.nav.homework', icon: FiBookOpen, category: 'secondary', priority: 3 },
    { id: INSTRUCTOR_DASHBOARD_TABS.CHAT, labelKey: 'instructorDashboard.nav.chat', icon: FiMessageCircle, category: 'secondary', priority: 4 },

    // Performance & Analytics
    { id: INSTRUCTOR_DASHBOARD_TABS.ANALYTICS, labelKey: 'instructorDashboard.nav.analytics', icon: FiGlobe, category: 'analytics', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.LEADERBOARD, labelKey: 'instructorDashboard.nav.leaderboard', icon: FiFilter, category: 'analytics', priority: 2 },

    // Administrative - Settings & Management
    { id: INSTRUCTOR_DASHBOARD_TABS.PROFILE, labelKey: 'instructorDashboard.nav.profile', icon: FiUser, category: 'admin', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.AI, labelKey: 'instructorDashboard.nav.ai', icon: FiCpu, category: 'admin', priority: 2 },
    { id: INSTRUCTOR_DASHBOARD_TABS.ATTENDANCE, labelKey: 'instructorDashboard.nav.attendance', icon: FiUsers, category: 'admin', priority: 3 },
    { id: INSTRUCTOR_DASHBOARD_TABS.NOTIFICATIONS, labelKey: 'instructorDashboard.nav.notifications', icon: FiBell, category: 'admin', priority: 4 },
];

export const NAV_ITEMS = applyWorkspaceGroups(RAW_NAV_ITEMS, INSTRUCTOR_WORKSPACE_GROUPS);

export const formatDateTimeForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

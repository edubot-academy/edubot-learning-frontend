import {
    FiAward,
    FiUsers,
    FiBookOpen,
    FiMail,
    FiBriefcase,
    FiCpu,
    FiBell,
    FiBarChart2,
    FiTag,
    FiTrendingUp,
    FiCheckSquare,
    FiGlobe,
} from 'react-icons/fi';
import { ADMIN_DASHBOARD_TABS } from '@shared/constants/dashboardTabs';
import { applyWorkspaceGroups } from '@shared/utils/workspaceGroups';

export const ADMIN_TABS = [
    ADMIN_DASHBOARD_TABS.STATS,
    ADMIN_DASHBOARD_TABS.USERS,
    ADMIN_DASHBOARD_TABS.COURSES,
    ADMIN_DASHBOARD_TABS.CONTACTS,
    ADMIN_DASHBOARD_TABS.PENDING,
    ADMIN_DASHBOARD_TABS.COMPANIES,
    ADMIN_DASHBOARD_TABS.CERTIFICATES,
    ADMIN_DASHBOARD_TABS.SKILLS,
    ADMIN_DASHBOARD_TABS.AI_PROMPTS,
    ADMIN_DASHBOARD_TABS.AI_LMS,
    ADMIN_DASHBOARD_TABS.NOTIFICATIONS,
    ADMIN_DASHBOARD_TABS.ANALYTICS,
    ADMIN_DASHBOARD_TABS.EXTERNAL_RESOURCES,
];

export const USERS_QUERY_KEYS = Object.freeze({
    search: 'u_search',
    role: 'u_role',
    dateFrom: 'u_dateFrom',
    dateTo: 'u_dateTo',
    page: 'u_page',
});

export const ADMIN_WORKSPACE_GROUPS = Object.freeze({
    GOVERNANCE: Object.freeze({
        id: 'governance',
        label: 'Platform governance',
        labelKey: 'adminPanel.workspaceGroups.governance',
        tabs: Object.freeze([
            ADMIN_DASHBOARD_TABS.STATS,
            ADMIN_DASHBOARD_TABS.USERS,
            ADMIN_DASHBOARD_TABS.COMPANIES,
            ADMIN_DASHBOARD_TABS.CONTACTS,
            ADMIN_DASHBOARD_TABS.ANALYTICS,
        ]),
    }),
    CONTENT_OPERATIONS: Object.freeze({
        id: 'content-operations',
        label: 'Content operations',
        labelKey: 'adminPanel.workspaceGroups.contentOperations',
        tabs: Object.freeze([
            ADMIN_DASHBOARD_TABS.COURSES,
            ADMIN_DASHBOARD_TABS.PENDING,
            ADMIN_DASHBOARD_TABS.CERTIFICATES,
            ADMIN_DASHBOARD_TABS.EXTERNAL_RESOURCES,
        ]),
    }),
    TECHNICAL_OPERATIONS: Object.freeze({
        id: 'technical-operations',
        label: 'Technical operations',
        labelKey: 'adminPanel.workspaceGroups.technicalOperations',
        tabs: Object.freeze([
            ADMIN_DASHBOARD_TABS.SKILLS,
            ADMIN_DASHBOARD_TABS.AI_PROMPTS,
            ADMIN_DASHBOARD_TABS.AI_LMS,
            ADMIN_DASHBOARD_TABS.NOTIFICATIONS,
        ]),
    }),
});

export const ADMIN_WORKSPACE_GROUP_BY_ID = Object.freeze(
    Object.values(ADMIN_WORKSPACE_GROUPS).reduce((groups, group) => {
        groups[group.id] = group;
        return groups;
    }, {})
);

export const ADMIN_COURSES_TAB_SECTIONS = Object.freeze({
    CATALOG_GOVERNANCE: 'catalog-governance',
    ENROLLMENT_OVERSIGHT: 'enrollment-oversight',
    MEDIA_OPERATIONS: 'media-operations',
});

const RAW_NAV_ITEMS = [
    // Primary Navigation - Core Admin Tasks
    {
        id: ADMIN_DASHBOARD_TABS.STATS,
        label: 'Statistics',
        labelKey: 'adminPanel.tabs.stats',
        icon: FiBarChart2,
        category: 'primary',
        priority: 1,
    },
    {
        id: ADMIN_DASHBOARD_TABS.COURSES,
        label: 'Courses and categories',
        labelKey: 'adminPanel.tabs.courses',
        icon: FiBookOpen,
        category: 'primary',
        priority: 2,
    },
    {
        id: ADMIN_DASHBOARD_TABS.PENDING,
        label: 'Approve new courses',
        labelKey: 'adminPanel.tabs.pending',
        icon: FiCheckSquare,
        category: 'primary',
        priority: 3,
    },
    {
        id: ADMIN_DASHBOARD_TABS.CERTIFICATES,
        label: 'Certificates',
        labelKey: 'adminPanel.tabs.certificates',
        icon: FiAward,
        category: 'primary',
        priority: 4,
    },
    {
        id: ADMIN_DASHBOARD_TABS.EXTERNAL_RESOURCES,
        label: 'Free resources',
        labelKey: 'adminPanel.tabs.externalResources',
        icon: FiGlobe,
        category: 'primary',
        priority: 5,
    },

    // Secondary Navigation - People & Access
    {
        id: ADMIN_DASHBOARD_TABS.USERS,
        label: 'Users',
        labelKey: 'adminPanel.tabs.users',
        icon: FiUsers,
        category: 'secondary',
        priority: 1,
    },
    {
        id: ADMIN_DASHBOARD_TABS.COMPANIES,
        label: 'Companies',
        labelKey: 'adminPanel.tabs.companies',
        icon: FiBriefcase,
        category: 'secondary',
        priority: 2,
    },
    {
        id: ADMIN_DASHBOARD_TABS.CONTACTS,
        label: 'Contacts',
        labelKey: 'adminPanel.tabs.contacts',
        icon: FiMail,
        category: 'secondary',
        priority: 3,
    },

    // Analytics & Insights
    {
        id: ADMIN_DASHBOARD_TABS.ANALYTICS,
        label: 'Analytics',
        labelKey: 'adminPanel.tabs.analytics',
        icon: FiTrendingUp,
        category: 'analytics',
        priority: 1,
    },

    // Administrative - Settings & Configuration
    {
        id: ADMIN_DASHBOARD_TABS.AI_PROMPTS,
        label: 'AI prompts',
        labelKey: 'adminPanel.tabs.aiPrompts',
        icon: FiCpu,
        category: 'admin',
        priority: 1,
    },
    {
        id: ADMIN_DASHBOARD_TABS.AI_LMS,
        label: 'AI LMS settings',
        labelKey: 'adminPanel.tabs.aiLms',
        icon: FiCpu,
        category: 'admin',
        priority: 2,
    },
    {
        id: ADMIN_DASHBOARD_TABS.SKILLS,
        label: 'Skills',
        labelKey: 'adminPanel.tabs.skills',
        icon: FiTag,
        category: 'admin',
        priority: 3,
    },
    {
        id: ADMIN_DASHBOARD_TABS.NOTIFICATIONS,
        label: 'Notifications',
        labelKey: 'adminPanel.tabs.notifications',
        icon: FiBell,
        category: 'admin',
        priority: 4,
    },
];

export const NAV_ITEMS = applyWorkspaceGroups(RAW_NAV_ITEMS, ADMIN_WORKSPACE_GROUPS);

// Pagination helper constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_VISIBLE_PAGES = 5;

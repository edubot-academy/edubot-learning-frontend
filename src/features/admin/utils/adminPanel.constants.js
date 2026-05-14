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
    FiActivity,
    FiCalendar,
    FiTrendingUp,
    FiCheckSquare,
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
    ADMIN_DASHBOARD_TABS.NOTIFICATIONS,
    ADMIN_DASHBOARD_TABS.INTEGRATION,
    ADMIN_DASHBOARD_TABS.ATTENDANCE,
    ADMIN_DASHBOARD_TABS.ANALYTICS,
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
        label: 'Governance',
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
        tabs: Object.freeze([
            ADMIN_DASHBOARD_TABS.COURSES,
            ADMIN_DASHBOARD_TABS.PENDING,
            ADMIN_DASHBOARD_TABS.CERTIFICATES,
        ]),
    }),
    TECHNICAL_OPERATIONS: Object.freeze({
        id: 'technical-operations',
        label: 'Technical operations',
        tabs: Object.freeze([
            ADMIN_DASHBOARD_TABS.SKILLS,
            ADMIN_DASHBOARD_TABS.AI_PROMPTS,
            ADMIN_DASHBOARD_TABS.NOTIFICATIONS,
            ADMIN_DASHBOARD_TABS.INTEGRATION,
            ADMIN_DASHBOARD_TABS.ATTENDANCE,
        ]),
    }),
});

export const ADMIN_COURSES_TAB_SECTIONS = Object.freeze({
    CATALOG_GOVERNANCE: 'catalog-governance',
    ENROLLMENT_OVERSIGHT: 'enrollment-oversight',
    MEDIA_OPERATIONS: 'media-operations',
});

const RAW_NAV_ITEMS = [
    // Primary Navigation - Core Admin Tasks
    { id: ADMIN_DASHBOARD_TABS.STATS, label: 'Статистика', icon: FiBarChart2, category: 'primary', priority: 1 },
    { id: ADMIN_DASHBOARD_TABS.COURSES, label: 'Курстар & Категориялар', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: ADMIN_DASHBOARD_TABS.PENDING, label: 'Жаңы курстарды бекитүү', icon: FiCheckSquare, category: 'primary', priority: 3 },
    { id: ADMIN_DASHBOARD_TABS.CERTIFICATES, label: 'Сертификаттар', icon: FiAward, category: 'primary', priority: 4 },

    // Secondary Navigation - People & Access
    { id: ADMIN_DASHBOARD_TABS.USERS, label: 'Колдонуучулар', icon: FiUsers, category: 'secondary', priority: 1 },
    { id: ADMIN_DASHBOARD_TABS.COMPANIES, label: 'Компаниялар', icon: FiBriefcase, category: 'secondary', priority: 2 },
    { id: ADMIN_DASHBOARD_TABS.CONTACTS, label: 'Байланыштар', icon: FiMail, category: 'secondary', priority: 3 },

    // Analytics & Insights
    { id: ADMIN_DASHBOARD_TABS.ANALYTICS, label: 'Аналитика', icon: FiTrendingUp, category: 'analytics', priority: 1 },

    // Administrative - Settings & Configuration
    { id: ADMIN_DASHBOARD_TABS.AI_PROMPTS, label: 'AI промпттар', icon: FiCpu, category: 'admin', priority: 1 },
    { id: ADMIN_DASHBOARD_TABS.SKILLS, label: 'Скиллдер', icon: FiTag, category: 'admin', priority: 2 },
    { id: ADMIN_DASHBOARD_TABS.NOTIFICATIONS, label: 'Билдирүүлөр', icon: FiBell, category: 'admin', priority: 3 },
    { id: ADMIN_DASHBOARD_TABS.INTEGRATION, label: 'Интеграциялар', icon: FiActivity, category: 'admin', priority: 4 },
    { id: ADMIN_DASHBOARD_TABS.ATTENDANCE, label: 'Катышуу', icon: FiCalendar, category: 'admin', priority: 5 },
];

export const NAV_ITEMS = applyWorkspaceGroups(RAW_NAV_ITEMS, ADMIN_WORKSPACE_GROUPS);

// Pagination helper constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_VISIBLE_PAGES = 5;

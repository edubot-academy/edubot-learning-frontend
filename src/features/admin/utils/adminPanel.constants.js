import {
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
} from 'react-icons/fi';

export const ADMIN_TABS = [
    'stats',
    'users',
    'courses',
    'contacts',
    'pending',
    'companies',
    'skills',
    'ai-prompts',
    'notifications',
    'integration',
    'attendance',
    'analytics',
];

export const USERS_QUERY_KEYS = Object.freeze({
    search: 'u_search',
    role: 'u_role',
    dateFrom: 'u_dateFrom',
    dateTo: 'u_dateTo',
    page: 'u_page',
});

export const NAV_ITEMS = [
    // Content Management - Primary Admin Tasks
    { id: 'stats', label: 'Статистика', icon: FiBarChart2, category: 'content', priority: 1 },
    { id: 'courses', label: 'Курстар & Категориялар', icon: FiBookOpen, category: 'content', priority: 2 },

    // User Management - People & Access
    { id: 'users', label: 'Колдонуучулар', icon: FiUsers, category: 'users', priority: 1 },
    { id: 'companies', label: 'Компаниялар', icon: FiBriefcase, category: 'users', priority: 2 },

    // System Administration - Settings & Configuration
    { id: 'contacts', label: 'Байланыштар', icon: FiMail, category: 'admin', priority: 1 },
    { id: 'ai-prompts', label: 'AI промпттар', icon: FiCpu, category: 'admin', priority: 2 },
    { id: 'skills', label: 'Скиллдер', icon: FiTag, category: 'admin', priority: 3 },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell, category: 'admin', priority: 4 },
    { id: 'integration', label: 'Интеграциялар', icon: FiActivity, category: 'admin', priority: 5 },
    { id: 'attendance', label: 'Катышуу', icon: FiCalendar, category: 'admin', priority: 6 },
    { id: 'analytics', label: 'Аналитика', icon: FiTrendingUp, category: 'admin', priority: 7 },
];

// Pagination helper constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_VISIBLE_PAGES = 5;

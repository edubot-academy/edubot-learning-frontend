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
    FiCheckSquare,
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
    // Primary Navigation - Core Admin Tasks
    { id: 'stats', label: 'Статистика', icon: FiBarChart2, category: 'primary', priority: 1 },
    { id: 'courses', label: 'Курстар & Категориялар', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: 'pending', label: 'Жаңы курстарды бекитүү', icon: FiCheckSquare, category: 'primary', priority: 3 },

    // Secondary Navigation - People & Access
    { id: 'users', label: 'Колдонуучулар', icon: FiUsers, category: 'secondary', priority: 1 },
    { id: 'companies', label: 'Компаниялар', icon: FiBriefcase, category: 'secondary', priority: 2 },
    { id: 'contacts', label: 'Байланыштар', icon: FiMail, category: 'secondary', priority: 3 },

    // Analytics & Insights
    { id: 'analytics', label: 'Аналитика', icon: FiTrendingUp, category: 'analytics', priority: 1 },

    // Administrative - Settings & Configuration
    { id: 'ai-prompts', label: 'AI промпттар', icon: FiCpu, category: 'admin', priority: 1 },
    { id: 'skills', label: 'Скиллдер', icon: FiTag, category: 'admin', priority: 2 },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell, category: 'admin', priority: 3 },
    { id: 'integration', label: 'Интеграциялар', icon: FiActivity, category: 'admin', priority: 4 },
    { id: 'attendance', label: 'Катышуу', icon: FiCalendar, category: 'admin', priority: 5 },
];

// Pagination helper constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_VISIBLE_PAGES = 5;

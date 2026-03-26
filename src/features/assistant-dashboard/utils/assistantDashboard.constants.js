import {
    FiHome,
    FiUsers,
    FiBookOpen,
    FiCalendar,
    FiMail,
    FiBarChart2,
} from 'react-icons/fi';

export const NAV_ITEMS = [
    // Primary Navigation - Core Daily Tasks
    { id: 'overview', label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: 'enrollments', label: 'Студенттер', icon: FiUsers, category: 'primary', priority: 2 },

    // Secondary Navigation - Learning Management
    { id: 'courses', label: 'Курстар', icon: FiBookOpen, category: 'secondary', priority: 1 },
    { id: 'attendance', label: 'Катышуу', icon: FiCalendar, category: 'secondary', priority: 2 },

    // Analytics & Communication
    { id: 'communication', label: 'Байланыштар', icon: FiMail, category: 'analytics', priority: 1 },
    { id: 'analytics', label: 'Аналитика', icon: FiBarChart2, category: 'analytics', priority: 2 },
];

export const ASSISTANT_ROLES = {
    ASSISTANT: 'assistant',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin',
};

export const COMPANY_STATES = {
    NO_COMPANY: 'no_company',
    NEEDS_SELECT: 'needs_select',
    HAS_COMPANY: 'has_company',
};

export const TAB_CATEGORIES = {
    primary: 'primary',
    secondary: 'secondary', 
    analytics: 'analytics',
    admin: 'admin',
    other: 'other',
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

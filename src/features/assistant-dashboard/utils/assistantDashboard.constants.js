import {
    FiHome,
    FiUsers,
    FiBookOpen,
    FiCalendar,
} from 'react-icons/fi';

export const ASSISTANT_DASHBOARD_TABS = Object.freeze({
    OVERVIEW: 'overview',
    ENROLLMENTS: 'enrollments',
    COURSES: 'courses',
    ATTENDANCE: 'attendance',
});

export const ASSISTANT_WORKSPACE_GROUPS = Object.freeze({
    DAILY_ACTIONS: Object.freeze({
        id: 'daily-actions',
        label: 'Daily actions',
        tabs: Object.freeze([
            ASSISTANT_DASHBOARD_TABS.OVERVIEW,
            ASSISTANT_DASHBOARD_TABS.ENROLLMENTS,
            ASSISTANT_DASHBOARD_TABS.ATTENDANCE,
        ]),
    }),
    REFERENCE_VIEWS: Object.freeze({
        id: 'reference-views',
        label: 'Reference views',
        tabs: Object.freeze([
            ASSISTANT_DASHBOARD_TABS.COURSES,
        ]),
    }),
});

export const NAV_ITEMS = [
    // Primary Navigation - Core Daily Tasks
    { id: ASSISTANT_DASHBOARD_TABS.OVERVIEW, label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: ASSISTANT_DASHBOARD_TABS.ENROLLMENTS, label: 'Студенттер', icon: FiUsers, category: 'primary', priority: 2 },

    // Secondary Navigation - Learning Management
    { id: ASSISTANT_DASHBOARD_TABS.COURSES, label: 'Курстар', icon: FiBookOpen, category: 'secondary', priority: 1 },
    { id: ASSISTANT_DASHBOARD_TABS.ATTENDANCE, label: 'Катышуу', icon: FiCalendar, category: 'secondary', priority: 2 },
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

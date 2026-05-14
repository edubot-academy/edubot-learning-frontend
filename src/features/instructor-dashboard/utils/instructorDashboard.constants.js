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

export const NAV_ITEMS = [
    // Primary Navigation - Core Daily Tasks
    { id: INSTRUCTOR_DASHBOARD_TABS.OVERVIEW, label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.COURSES, label: 'Курстарым', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: INSTRUCTOR_DASHBOARD_TABS.STUDENTS, label: 'Студенттер', icon: FiUsers, category: 'primary', priority: 3 },
    { id: INSTRUCTOR_DASHBOARD_TABS.CERTIFICATES, label: 'Сертификаттар', icon: FiAward, category: 'primary', priority: 4 },
    { id: INSTRUCTOR_DASHBOARD_TABS.GROUPS, label: 'Группалар', icon: FiGrid, category: 'primary', priority: 5 },

    // Secondary Navigation - Learning Management
    { id: INSTRUCTOR_DASHBOARD_TABS.OFFERINGS, label: 'Агымдар', icon: FiLayers, category: 'secondary', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.SESSIONS, label: 'Сессиялар', icon: FiCalendar, category: 'secondary', priority: 2 },
    { id: INSTRUCTOR_DASHBOARD_TABS.HOMEWORK, label: 'Үй тапшырма', icon: FiBookOpen, category: 'secondary', priority: 3 },
    { id: INSTRUCTOR_DASHBOARD_TABS.CHAT, label: 'Чат', icon: FiMessageCircle, category: 'secondary', priority: 4 },

    // Performance & Analytics
    { id: INSTRUCTOR_DASHBOARD_TABS.ANALYTICS, label: 'Аналитика', icon: FiGlobe, category: 'analytics', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.LEADERBOARD, label: 'Рейтинг', icon: FiFilter, category: 'analytics', priority: 2 },

    // Administrative - Settings & Management
    { id: INSTRUCTOR_DASHBOARD_TABS.PROFILE, label: 'Профиль', icon: FiUser, category: 'admin', priority: 1 },
    { id: INSTRUCTOR_DASHBOARD_TABS.AI, label: 'AI ассистент', icon: FiCpu, category: 'admin', priority: 2 },
    { id: INSTRUCTOR_DASHBOARD_TABS.ATTENDANCE, label: 'Катышуу', icon: FiUsers, category: 'admin', priority: 3 },
    { id: INSTRUCTOR_DASHBOARD_TABS.NOTIFICATIONS, label: 'Билдирүүлөр', icon: FiBell, category: 'admin', priority: 4 },
];

export const formatDateTimeForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

import {
    FiHome,
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
} from 'react-icons/fi';

export const NAV_ITEMS = [
    // Primary Navigation - Core Daily Tasks
    { id: 'overview', label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: 'courses', label: 'Курстарым', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: 'students', label: 'Студенттер', icon: FiUsers, category: 'primary', priority: 3 },

    // Secondary Navigation - Learning Management
    { id: 'offerings', label: 'Агымдар', icon: FiLayers, category: 'secondary', priority: 1 },
    { id: 'sessions', label: 'Сессиялар', icon: FiCalendar, category: 'secondary', priority: 2 },
    { id: 'homework', label: 'Үй тапшырма', icon: FiBookOpen, category: 'secondary', priority: 3 },
    { id: 'chat', label: 'Чат', icon: FiMessageCircle, category: 'secondary', priority: 4 },

    // Performance & Analytics
    { id: 'analytics', label: 'Аналитика', icon: FiGlobe, category: 'analytics', priority: 1 },
    { id: 'leaderboard', label: 'Рейтинг', icon: FiFilter, category: 'analytics', priority: 2 },

    // Administrative - Settings & Management
    { id: 'profile', label: 'Профиль', icon: FiUser, category: 'admin', priority: 1 },
    { id: 'ai', label: 'AI ассистент', icon: FiCpu, category: 'admin', priority: 2 },
    { id: 'attendance', label: 'Катышуу', icon: FiUsers, category: 'admin', priority: 3 },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell, category: 'admin', priority: 4 },
];

export const formatDateTimeForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

import {
    FiHome,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiBarChart2,
    FiUser,
    FiBell,
    FiMessageCircle,
    FiPlay,
    FiFilter,
    FiTarget
} from 'react-icons/fi';

export const NAV_ITEMS = [
    // Primary Navigation - Core Learning Activities
    { id: 'overview', label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: 'my-courses', label: 'Курстарым', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: 'schedule', label: 'Жүгүртмө', icon: FiCalendar, category: 'primary', priority: 3 },
    { id: 'tasks', label: 'Тапшырмалар', icon: FiPlay, category: 'primary', priority: 4 },
    { id: 'progress', label: 'Прогресс', icon: FiBarChart2, category: 'primary', priority: 5 },

    // Secondary Navigation - Learning Management
    { id: 'chat', label: 'Чат', icon: FiMessageCircle, category: 'secondary', priority: 2 },

    // Analytics & Performance
    { id: 'analytics', label: 'Аналитика', icon: FiFilter, category: 'analytics', priority: 1 },
    { id: 'leaderboard', label: 'Рейтинг', icon: FiCheckCircle, category: 'analytics', priority: 2 },

    // Administrative - Settings & Communication
    { id: 'profile', label: 'Профиль', icon: FiUser, category: 'admin', priority: 1 },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell, category: 'admin', priority: 2 },
];

export const DEFAULT_NOTIFICATION_SETTINGS = {
    lessonReminders: true,
    announcementEmails: true,
    taskUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
};

export const NOTIFICATION_LABELS = {
    lessonReminders: {
        label: 'Сабак эскертмелери',
        description: 'Сабак башталар алдында эскертүү алыңыз.',
    },
    announcementEmails: {
        label: 'Курс боюнча жаңылыктар',
        description: 'Жаңы модулдар жана маанилүү окуу жаңылыктары email аркылуу жетет.',
    },
    taskUpdates: {
        label: 'Тапшырма эскертмелери',
        description: 'Тапшырмалардын мөөнөтү жакындаганда эскертүү алыңыз.',
    },
    smsAlerts: {
        label: 'SMS эскертүүлөр',
        description: 'Маанилүү окуялар боюнча SMS кабыл алыңыз.',
    },
    pushNotifications: {
        label: 'Калтырылган сабак эскертмелери',
        description: 'Калтырылган сабактар боюнча дароо билдирүү алыңыз.',
    },
};

export const JOIN_WINDOW_MS = 10 * 60 * 1000;

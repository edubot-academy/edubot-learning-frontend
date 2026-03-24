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
} from 'react-icons/fi';

export const NAV_ITEMS = [
    // Primary Navigation - Core Learning Activities
    { id: 'overview', label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: 'my-courses', label: 'Курстарым', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: 'schedule', label: 'Жүгүртмө', icon: FiCalendar, category: 'primary', priority: 3 },
    { id: 'tasks', label: 'Тапшырмалар', icon: FiPlay, category: 'primary', priority: 4 },

    // Learning Progress - Performance & Achievement
    { id: 'progress', label: 'Прогресс', icon: FiBarChart2, category: 'progress', priority: 1 },
    { id: 'analytics', label: 'Аналитика', icon: FiFilter, category: 'progress', priority: 2 },
    { id: 'leaderboard', label: 'Рейтинг', icon: FiCheckCircle, category: 'progress', priority: 3 },

    // Personal Management - Settings & Communication
    { id: 'profile', label: 'Профиль', icon: FiUser, category: 'personal', priority: 1 },
    { id: 'notifications', label: 'Билдирүүлөр', icon: FiBell, category: 'personal', priority: 2 },
    { id: 'chat', label: 'Чат', icon: FiMessageCircle, category: 'personal', priority: 3 },
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

import {
    FiHome,
    FiBookOpen,
    FiCalendar,
    FiFolder,
    FiCheckCircle,
    FiBarChart2,
    FiUser,
    FiBell,
    FiMessageCircle,
    FiPlay,
    FiAward,
} from 'react-icons/fi';
import { STUDENT_DASHBOARD_TABS } from '@shared/constants/dashboardTabs';
import { applyWorkspaceGroups } from '@shared/utils/workspaceGroups';

export const STUDENT_WORKSPACE_GROUPS = Object.freeze({
    LEARNING: Object.freeze({
        id: 'learning',
        label: 'Окуу workspace',
        description: 'Курстар, сабак жүгүртмөсү жана окуу материалдары боюнча негизги аракеттер.',
        tabs: Object.freeze([
            STUDENT_DASHBOARD_TABS.OVERVIEW,
            STUDENT_DASHBOARD_TABS.MY_COURSES,
            STUDENT_DASHBOARD_TABS.SCHEDULE,
            STUDENT_DASHBOARD_TABS.RESOURCES,
        ]),
    }),
    PROGRESS: Object.freeze({
        id: 'progress',
        label: 'Аткаруу жана прогресс',
        description: 'Тапшырмалар, прогресс, сертификаттар жана рейтинг мониторинги.',
        tabs: Object.freeze([
            STUDENT_DASHBOARD_TABS.TASKS,
            STUDENT_DASHBOARD_TABS.PROGRESS,
            STUDENT_DASHBOARD_TABS.CERTIFICATES,
            STUDENT_DASHBOARD_TABS.LEADERBOARD,
        ]),
    }),
    SUPPORT: Object.freeze({
        id: 'support',
        label: 'Байланыш жана орнотуулар',
        description: 'Чат, профиль жана билдирүү жөндөөлөрү үчүн жеке workspace.',
        tabs: Object.freeze([
            STUDENT_DASHBOARD_TABS.CHAT,
            STUDENT_DASHBOARD_TABS.PROFILE,
            STUDENT_DASHBOARD_TABS.NOTIFICATIONS,
        ]),
    }),
});

export const STUDENT_WORKSPACE_GROUP_BY_ID = Object.freeze(
    Object.values(STUDENT_WORKSPACE_GROUPS).reduce((groups, group) => {
        groups[group.id] = group;
        return groups;
    }, {})
);

const RAW_NAV_ITEMS = [
    // Primary Navigation - Core Learning Activities
    { id: STUDENT_DASHBOARD_TABS.OVERVIEW, label: 'Кыскача', icon: FiHome, category: 'primary', priority: 1 },
    { id: STUDENT_DASHBOARD_TABS.MY_COURSES, label: 'Курстарым', icon: FiBookOpen, category: 'primary', priority: 2 },
    { id: STUDENT_DASHBOARD_TABS.SCHEDULE, label: 'Жүгүртмө', icon: FiCalendar, category: 'primary', priority: 3 },
    { id: STUDENT_DASHBOARD_TABS.RESOURCES, label: 'Ресурстар', icon: FiFolder, category: 'primary', priority: 4 },
    { id: STUDENT_DASHBOARD_TABS.TASKS, label: 'Тапшырмалар', icon: FiPlay, category: 'primary', priority: 5 },
    { id: STUDENT_DASHBOARD_TABS.PROGRESS, label: 'Прогресс', icon: FiBarChart2, category: 'primary', priority: 6 },
    { id: STUDENT_DASHBOARD_TABS.CERTIFICATES, label: 'Сертификаттар', icon: FiAward, category: 'primary', priority: 7 },

    // Secondary Navigation - Learning Management
    { id: STUDENT_DASHBOARD_TABS.CHAT, label: 'Чат', icon: FiMessageCircle, category: 'secondary', priority: 2 },
    { id: STUDENT_DASHBOARD_TABS.LEADERBOARD, label: 'Рейтинг', icon: FiCheckCircle, category: 'secondary', priority: 3 },

    // Administrative - Settings & Communication
    { id: STUDENT_DASHBOARD_TABS.PROFILE, label: 'Профиль', icon: FiUser, category: 'admin', priority: 1 },
    { id: STUDENT_DASHBOARD_TABS.NOTIFICATIONS, label: 'Билдирүүлөр', icon: FiBell, category: 'admin', priority: 2 },
];

export const NAV_ITEMS = applyWorkspaceGroups(RAW_NAV_ITEMS, STUDENT_WORKSPACE_GROUPS);

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

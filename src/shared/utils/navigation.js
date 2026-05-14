import { isPlatformAdmin } from './roles';
import {
    ADMIN_DASHBOARD_TABS,
    INSTRUCTOR_DASHBOARD_TABS,
    STUDENT_DASHBOARD_TABS,
} from '@shared/constants/dashboardTabs';

const DASHBOARD_PATHS = {
    student: '/student',
    instructor: '/instructor',
    assistant: '/assistant',
};

const getRole = (userOrRole) =>
    typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;

const DASHBOARD_TAB_FALLBACKS = Object.freeze({
    COURSES: 'courses',
    ENROLLMENTS: 'enrollments',
    ATTENDANCE: 'attendance',
    NOTIFICATIONS: 'notifications',
});

const getDashboardTabForRole = (userOrRole, tabKey) => {
    const role = getRole(userOrRole);

    if (isPlatformAdmin(role)) {
        return ADMIN_DASHBOARD_TABS[tabKey] || DASHBOARD_TAB_FALLBACKS[tabKey];
    }

    if (role === 'instructor') {
        return INSTRUCTOR_DASHBOARD_TABS[tabKey] || DASHBOARD_TAB_FALLBACKS[tabKey];
    }

    if (role === 'student') {
        return STUDENT_DASHBOARD_TABS[tabKey] || DASHBOARD_TAB_FALLBACKS[tabKey];
    }

    return DASHBOARD_TAB_FALLBACKS[tabKey];
};

const appendSearchParams = (path, params = {}) => {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');

    if (!entries.length) {
        return path;
    }

    const searchParams = new URLSearchParams();
    entries.forEach(([key, value]) => {
        searchParams.set(key, String(value));
    });

    return `${path}${path.includes('?') ? '&' : '?'}${searchParams.toString()}`;
};

export const getDashboardPath = (userOrRole, tab, params) => {
    const role = getRole(userOrRole);
    const basePath = isPlatformAdmin(role)
        ? '/admin'
        : DASHBOARD_PATHS[role] || '/dashboard';

    if (!tab) {
        return appendSearchParams(basePath, params);
    }

    return appendSearchParams(`${basePath}?tab=${encodeURIComponent(tab)}`, params);
};

export const getCommunicationPath = (userOrRole) => {
    const role = getRole(userOrRole);

    if (role === 'student' || role === 'instructor') {
        return getDashboardPath(role, role === 'student' ? STUDENT_DASHBOARD_TABS.CHAT : INSTRUCTOR_DASHBOARD_TABS.CHAT);
    }

    if (isPlatformAdmin(role)) {
        return getDashboardPath(role, ADMIN_DASHBOARD_TABS.NOTIFICATIONS);
    }

    if (role === 'assistant') {
        return getDashboardPath(role);
    }

    return null;
};

export const getUserNavigationPaths = (userOrRole) => ({
    dashboard: getDashboardPath(userOrRole),
    dashboardOverview: getDashboardPath(
        userOrRole,
        isPlatformAdmin(getRole(userOrRole)) ? ADMIN_DASHBOARD_TABS.STATS : STUDENT_DASHBOARD_TABS.OVERVIEW
    ),
    myCourses: getDashboardPath(userOrRole, STUDENT_DASHBOARD_TABS.MY_COURSES),
    courses: getDashboardPath(userOrRole, getDashboardTabForRole(userOrRole, 'COURSES')),
    enrollments: getDashboardPath(userOrRole, getDashboardTabForRole(userOrRole, 'ENROLLMENTS')),
    attendance: getDashboardPath(userOrRole, getDashboardTabForRole(userOrRole, 'ATTENDANCE')),
    notifications: getDashboardPath(userOrRole, getDashboardTabForRole(userOrRole, 'NOTIFICATIONS')),
    cart: '/cart',
    favourites: '/favourites',
    chat: getCommunicationPath(userOrRole) || '/chat',
});

export const getUserMenuItems = (userOrRole) => {
    const role = getRole(userOrRole);
    const paths = getUserNavigationPaths(userOrRole);
    const items = [];

    if (role === 'student') {
        items.push({ id: 'my-courses', label: 'Менин курстарым', path: paths.myCourses });
    } else if (role === 'assistant') {
        items.push(
            { id: 'courses', label: 'Курстар', path: paths.courses },
            { id: 'attendance', label: 'Катышуу', path: paths.attendance },
        );
    } else if (role === 'instructor' || isPlatformAdmin(role)) {
        items.push({ id: 'courses', label: 'Курстар', path: paths.courses });
    }

    if (['student', 'instructor', 'admin', 'superadmin'].includes(role)) {
        items.push({ id: 'notifications', label: 'Билдирүүлөр', path: paths.notifications });
    }

    items.push(
        { id: 'cart', label: 'Себет', path: paths.cart },
        { id: 'favourites', label: 'Тандалгандар', path: paths.favourites },
        { id: 'chat', label: 'Чат', path: paths.chat },
    );

    return items;
};

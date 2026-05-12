import { isPlatformAdmin } from './roles';

const DASHBOARD_PATHS = {
    student: '/student',
    instructor: '/instructor',
    assistant: '/assistant',
};

const SUPPORTED_ROLE_TABS = {
    student: new Set(['overview', 'notifications', 'my-courses', 'chat']),
    instructor: new Set(['overview', 'notifications', 'courses', 'chat']),
    admin: new Set(['stats', 'notifications', 'courses']),
    superadmin: new Set(['stats', 'notifications', 'courses']),
    assistant: new Set(['overview', 'enrollments', 'courses', 'attendance']),
};

const getRole = (userOrRole) =>
    typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;

export const getDashboardPath = (userOrRole, tab) => {
    const role = getRole(userOrRole);
    const basePath = isPlatformAdmin(role)
        ? '/admin'
        : DASHBOARD_PATHS[role] || '/dashboard';
    const supportedTabs = SUPPORTED_ROLE_TABS[role];

    if (!tab || !supportedTabs?.has(tab)) {
        return basePath;
    }

    return `${basePath}?tab=${encodeURIComponent(tab)}`;
};

export const getCommunicationPath = (userOrRole) => {
    const role = getRole(userOrRole);

    if (role === 'student' || role === 'instructor') {
        return getDashboardPath(role, 'chat');
    }

    if (isPlatformAdmin(role)) {
        return getDashboardPath(role, 'notifications');
    }

    if (role === 'assistant') {
        return getDashboardPath(role);
    }

    return null;
};

export const getUserNavigationPaths = (userOrRole) => ({
    dashboard: getDashboardPath(userOrRole),
    dashboardOverview: getDashboardPath(userOrRole, 'overview'),
    myCourses: getDashboardPath(userOrRole, 'my-courses'),
    courses: getDashboardPath(userOrRole, 'courses'),
    enrollments: getDashboardPath(userOrRole, 'enrollments'),
    attendance: getDashboardPath(userOrRole, 'attendance'),
    notifications: getDashboardPath(userOrRole, 'notifications'),
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

    if (SUPPORTED_ROLE_TABS[role]?.has('notifications')) {
        items.push({ id: 'notifications', label: 'Билдирүүлөр', path: paths.notifications });
    }

    items.push(
        { id: 'cart', label: 'Себет', path: paths.cart },
        { id: 'favourites', label: 'Тандалгандар', path: paths.favourites },
        { id: 'chat', label: 'Чат', path: paths.chat },
    );

    return items;
};

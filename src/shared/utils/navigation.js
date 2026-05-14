import { isPlatformAdmin } from './roles';

const DASHBOARD_PATHS = {
    student: '/student',
    instructor: '/instructor',
    assistant: '/assistant',
};

const getRole = (userOrRole) =>
    typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;

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
    dashboardOverview: getDashboardPath(
        userOrRole,
        isPlatformAdmin(getRole(userOrRole)) ? 'stats' : 'overview'
    ),
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

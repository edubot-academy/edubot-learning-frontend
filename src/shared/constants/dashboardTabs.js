export const STUDENT_DASHBOARD_TABS = Object.freeze({
    OVERVIEW: 'overview',
    MY_COURSES: 'my-courses',
    SCHEDULE: 'schedule',
    RESOURCES: 'resources',
    TASKS: 'tasks',
    PROGRESS: 'progress',
    CERTIFICATES: 'certificates',
    CHAT: 'chat',
    LEADERBOARD: 'leaderboard',
    PROFILE: 'profile',
    NOTIFICATIONS: 'notifications',
});

export const INSTRUCTOR_DASHBOARD_TABS = Object.freeze({
    OVERVIEW: 'overview',
    COURSES: 'courses',
    STUDENTS: 'students',
    CERTIFICATES: 'certificates',
    GROUPS: 'groups',
    OFFERINGS: 'offerings',
    SESSIONS: 'sessions',
    HOMEWORK: 'homework',
    CHAT: 'chat',
    ANALYTICS: 'analytics',
    LEADERBOARD: 'leaderboard',
    PROFILE: 'profile',
    AI: 'ai',
    ATTENDANCE: 'attendance',
    NOTIFICATIONS: 'notifications',
});

export const ADMIN_DASHBOARD_TABS = Object.freeze({
    STATS: 'stats',
    USERS: 'users',
    COURSES: 'courses',
    CONTACTS: 'contacts',
    PENDING: 'pending',
    COMPANIES: 'companies',
    CERTIFICATES: 'certificates',
    SKILLS: 'skills',
    AI_PROMPTS: 'ai-prompts',
    AI_LMS: 'ai-lms',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics',
});

export const DASHBOARD_TABS_BY_ROLE = Object.freeze({
    student: STUDENT_DASHBOARD_TABS,
    instructor: INSTRUCTOR_DASHBOARD_TABS,
    admin: ADMIN_DASHBOARD_TABS,
    superadmin: ADMIN_DASHBOARD_TABS,
});

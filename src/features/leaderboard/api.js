import api, { clean } from '../../shared/api/client';

// Lightweight mock data so the UI can render offline or when the API is unavailable.
const mockStudents = [
    {
        studentId: 1,
        fullName: 'Айсулуу Турсунбаева',
        avatarUrl: null,
        xp: 12450,
        progressPercent: 92,
        lessonsCompleted: 41,
        quizzesPassed: 18,
        lastActivityAt: new Date().toISOString(),
        streakDays: 6,
    },
    {
        studentId: 2,
        fullName: 'Нурбек Бакытбеков',
        avatarUrl: null,
        xp: 11040,
        progressPercent: 78,
        lessonsCompleted: 35,
        quizzesPassed: 15,
        lastActivityAt: new Date().toISOString(),
        streakDays: 4,
    },
    {
        studentId: 3,
        fullName: 'Аделина Калыкова',
        avatarUrl: null,
        xp: 9680,
        progressPercent: 70,
        lessonsCompleted: 30,
        quizzesPassed: 12,
        lastActivityAt: new Date().toISOString(),
        streakDays: 3,
    },
    {
        studentId: 4,
        fullName: 'Азиз Сатаров',
        avatarUrl: null,
        xp: 8100,
        progressPercent: 65,
        lessonsCompleted: 25,
        quizzesPassed: 9,
        lastActivityAt: new Date().toISOString(),
        streakDays: 1,
    },
];

const buildFallback = (page = 1, limit = 10) => ({
    items: mockStudents.slice(0, limit),
    total: mockStudents.length,
    page,
    limit,
});

const safeRequest = async (fn, fallback) => {
    try {
        const { data } = await fn();
        return data;
    } catch (error) {
        console.warn('Leaderboard API fallback used', error);
        return typeof fallback === 'function' ? fallback() : fallback;
    }
};

export const fetchWeeklyLeaderboard = async ({ page = 1, limit = 10 } = {}) =>
    safeRequest(
        () => api.get('/leaderboard/weekly', { params: clean({ page, limit }) }),
        () => buildFallback(page, limit)
    );

export const fetchFastProgressLeaderboard = async ({ page = 1, limit = 10 } = {}) =>
    safeRequest(
        () => api.get('/leaderboard/fast-progress', { params: clean({ page, limit }) }),
        () => buildFallback(page, limit)
    );

export const fetchCourseLeaderboard = async (courseId, { page = 1, limit = 10 } = {}) =>
    safeRequest(
        () =>
            api.get(`/leaderboard/course/${courseId}`, {
                params: clean({ page, limit }),
            }),
        () => buildFallback(page, limit)
    );

export const fetchSkillLeaderboard = async (skillSlug, { page = 1, limit = 10 } = {}) =>
    safeRequest(
        () =>
            api.get(`/leaderboard/skills/${skillSlug}`, {
                params: clean({ page, limit }),
            }),
        () => buildFallback(page, limit)
    );

export const fetchStudentOfWeek = async () =>
    safeRequest(() => api.get('/leaderboard/student-of-week'), mockStudents[0]);

export const fetchHomepageLeaderboard = async () =>
    safeRequest(() => api.get('/leaderboard/homepage'), {
        items: mockStudents.slice(0, 3),
    });

import api, { clean } from '../../shared/api/client';

const buildEmptyLeaderboard = (page = 1, limit = 10) => ({
    items: [],
    total: 0,
    page,
    limit,
});

const withFallbackMeta = (value, error) => ({
    ...(value || {}),
    _fallback: true,
    _fallbackMessage: error?.response?.data?.error?.message || error?.message || 'Leaderboard unavailable',
});

const safeRequest = async (fn, fallback) => {
    try {
        const { data } = await fn();
        return data;
    } catch (error) {
        console.warn('Leaderboard API request failed', error);
        const resolved = typeof fallback === 'function' ? fallback() : fallback;
        return withFallbackMeta(resolved, error);
    }
};

const requestOrNull = async (fn) => {
    try {
        const { data } = await fn();
        return data;
    } catch (error) {
        console.warn('Leaderboard optional endpoint unavailable', error);
        return null;
    }
};

export const fetchWeeklyLeaderboard = async ({ page = 1, limit = 10, track = 'all' } = {}) =>
    safeRequest(
        () => api.get('/leaderboard/weekly', { params: clean({ page, limit, track }) }),
        () => buildEmptyLeaderboard(page, limit)
    );

export const fetchFastProgressLeaderboard = async ({ page = 1, limit = 10 } = {}) =>
    safeRequest(
        () => api.get('/leaderboard/fast-progress', { params: clean({ page, limit }) }),
        () => buildEmptyLeaderboard(page, limit)
    );

export const fetchCourseLeaderboard = async (courseId, { page = 1, limit = 10 } = {}) =>
    safeRequest(
        () =>
            api.get(`/leaderboard/course/${courseId}`, {
                params: clean({ page, limit }),
            }),
        () => buildEmptyLeaderboard(page, limit)
    );

export const fetchSkillLeaderboard = async (skillSlug, { page = 1, limit = 10 } = {}) =>
    safeRequest(
        () =>
            api.get(`/leaderboard/skills/${skillSlug}`, {
                params: clean({ page, limit }),
            }),
        () => buildEmptyLeaderboard(page, limit)
    );

export const fetchStudentOfWeek = async ({ track = 'all' } = {}) =>
    safeRequest(() => api.get('/leaderboard/student-of-week', { params: clean({ track }) }), () => ({}));

export const fetchHomepageLeaderboard = async ({ track = 'all' } = {}) =>
    safeRequest(() => api.get('/leaderboard/homepage', { params: clean({ track }) }), {
        items: [],
    });

export const fetchInternalWeeklyLeaderboard = async ({ page = 1, limit = 10, track = 'all' } = {}) =>
    safeRequest(
        () =>
            api.get('/leaderboard/internal/weekly', {
                params: clean({ page, limit, track }),
            }),
        () => buildEmptyLeaderboard(page, limit)
    );

export const fetchInternalCourseLeaderboard = async (
    courseId,
    { page = 1, limit = 10, track = 'all' } = {}
) =>
    safeRequest(
        () =>
            api.get(`/leaderboard/internal/course/${courseId}`, {
                params: clean({ page, limit, track }),
            }),
        () => buildEmptyLeaderboard(page, limit)
    );

export const fetchInternalStudentOfWeek = async ({ track = 'all' } = {}) =>
    safeRequest(
        () =>
            api.get('/leaderboard/internal/student-of-week', {
                params: clean({ track }),
            }),
        () => ({})
    );

export const fetchInternalHomepageLeaderboard = async ({ track = 'all' } = {}) =>
    safeRequest(
        () =>
            api.get('/leaderboard/internal/homepage', {
                params: clean({ track }),
            }),
        { items: [] }
    );

export const fetchMyLeaderboardSummary = async (params = {}) =>
    requestOrNull(() => api.get('/leaderboard/me', { params: clean(params) }));

export const fetchNearMeLeaderboard = async ({ limit = 5, ...params } = {}) =>
    requestOrNull(() =>
        api.get('/leaderboard/near-me', {
            params: clean({ limit, ...params }),
        })
    );

export const fetchLeaderboardAchievements = async (params = {}) =>
    requestOrNull(() => api.get('/leaderboard/achievements', { params: clean(params) }));

export const fetchLeaderboardChallenges = async (params = {}) =>
    requestOrNull(() => api.get('/leaderboard/challenges', { params: clean(params) }));

export const createLeaderboardShare = async (payload) => {
    const { data } = await api.post('/leaderboard/share', payload);
    return data;
};

export const fetchLeaderboardSharePayload = async (token) => {
    const { data } = await api.get(`/leaderboard/share/${token}`);
    return data;
};

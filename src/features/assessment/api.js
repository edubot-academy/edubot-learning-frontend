import api from '@shared/api/client';

const ENGLISH_PLACEMENT_TEST_ID = 1;

// ─── Student: start attempt ───────────────────────────────────────────────────

export const startAssessmentAttempt = async (goal) => {
    const res = await api.post(`/assessment-tests/${ENGLISH_PLACEMENT_TEST_ID}/start`, { goal });
    return res.data;
};

// ─── Student: in-progress attempt ─────────────────────────────────────────────

export const getNextQuestion = async (attemptId) => {
    const res = await api.get(`/assessment-attempts/${attemptId}/next-question`);
    return res.data;
};

export const submitAnswer = async (attemptId, { questionId, selectedOptionId, timeSpentSeconds }) => {
    const res = await api.post(`/assessment-attempts/${attemptId}/answer`, {
        questionId,
        selectedOptionId,
        timeSpentSeconds,
    });
    return res.data;
};

export const completeAttempt = async (attemptId) => {
    const res = await api.post(`/assessment-attempts/${attemptId}/complete`);
    return res.data;
};

// ─── Student: result ──────────────────────────────────────────────────────────

export const getAttemptResult = async (attemptId) => {
    const res = await api.get(`/assessment-attempts/${attemptId}/result`);
    return res.data;
};

// ─── Admin: tests ─────────────────────────────────────────────────────────────

export const fetchAdminTests = async () => {
    const res = await api.get('/admin/assessment/tests');
    return res.data;
};

// ─── Admin: questions ─────────────────────────────────────────────────────────

export const fetchAdminQuestions = async ({ testId, level, skill, page = 0, limit = 30 } = {}) => {
    const params = { limit, offset: page * limit };
    if (testId) params.testId = testId;
    if (level) params.level = level;
    if (skill) params.skill = skill;
    const res = await api.get('/admin/assessment/questions', { params });
    return res.data;
};

export const createAdminQuestion = async (data) => {
    const res = await api.post('/admin/assessment/questions', data);
    return res.data;
};

export const updateAdminQuestion = async (id, data) => {
    const res = await api.patch(`/admin/assessment/questions/${id}`, data);
    return res.data;
};

// ─── Admin: learning paths ────────────────────────────────────────────────────

export const fetchAdminLearningPaths = async () => {
    const res = await api.get('/admin/assessment/learning-paths');
    return res.data;
};

// ─── Admin: analytics ────────────────────────────────────────────────────────

export const fetchAdminAnalytics = async (companyId) => {
    const params = companyId ? { companyId } : {};
    const res = await api.get('/admin/assessment/analytics', { params });
    return res.data;
};

// ─── Admin: attempts list ─────────────────────────────────────────────────────

export const fetchAdminAttempts = async ({ page = 0, limit = 20, companyId } = {}) => {
    const params = { limit, offset: page * limit };
    if (companyId) params.companyId = companyId;
    const res = await api.get('/admin/assessment/attempts', { params });
    return res.data;
};

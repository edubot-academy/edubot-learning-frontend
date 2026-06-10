import api from '@shared/api/client';

// ─── Public catalog (no auth required) ───────────────────────────────────────

export const fetchExternalResources = async ({ category, featured } = {}) => {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (featured) params.featured = 'true';
    const res = await api.get('/external-resources', { params });
    return res.data;
};

export const fetchExternalResourceBySlug = async (slug) => {
    const res = await api.get(`/external-resources/${slug}`);
    return res.data;
};

// ─── Course-linked resources ──────────────────────────────────────────────────

export const fetchResourcesByCourse = async (courseId) => {
    const res = await api.get(`/courses/${courseId}/external-resources`);
    return res.data;
};

// ─── User progress (JWT required) ─────────────────────────────────────────────

export const fetchMyExternalResourceProgress = async () => {
    const res = await api.get('/external-resources/my');
    return res.data;
};

export const upsertExternalResourceProgress = async (slug, { status, progressPercent, notes, checklistProgress } = {}) => {
    const res = await api.post(`/external-resources/${slug}/progress`, {
        status,
        progressPercent,
        notes,
        checklistProgress,
    });
    return res.data;
};

export const deleteExternalResourceProgress = async (slug) => {
    await api.delete(`/external-resources/${slug}/progress`);
};

export const updateExternalResourceProgress = async (slug, { status, progressPercent, notes, checklistProgress } = {}) => {
    const res = await api.patch(`/external-resources/${slug}/progress`, {
        status,
        progressPercent,
        notes,
        checklistProgress,
    });
    return res.data;
};

// ─── AI Learning Companion ────────────────────────────────────────────────────

export const generateAiStudyPlan = async (slug, lang = 'ky') => {
    const res = await api.post(`/external-resources/${slug}/ai-study-plan`, { lang });
    return res.data.plan;
};

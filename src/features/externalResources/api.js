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

export const upsertExternalResourceProgress = async (slug, { status, progressPercent, notes, checklistProgress, aiCache } = {}) => {
    const res = await api.post(`/external-resources/${slug}/progress`, {
        status,
        progressPercent,
        notes,
        checklistProgress,
        aiCache,
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

export const generateAiStudyPlan = async (slug, lang = 'ky', topic = null) => {
    const res = await api.post(`/external-resources/${slug}/ai-study-plan`, { lang, ...(topic ? { topic } : {}) });
    return res.data.plan;
};

export const explainConcept = async (slug, concept, lang = 'ky') => {
    const res = await api.post(`/external-resources/${slug}/ai-explain-concept`, { concept, lang });
    return res.data.explanation;
};

export const generatePracticeTasks = async (slug, lang = 'ky', topic = null) => {
    const res = await api.post(`/external-resources/${slug}/ai-practice-tasks`, { lang, ...(topic ? { topic } : {}) });
    return res.data.tasks;
};

// ─── Certificate upload (JWT required) ───────────────────────────────────────

export const uploadResourceCertificate = async (slug, file) => {
    const form = new FormData();
    form.append('certificate', file);
    const res = await api.post(`/external-resources/${slug}/certificate`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

// ─── Admin catalog (admin / instructor role) ──────────────────────────────────

export const aiAutofillResource = async (url) => {
    const res = await api.post('/external-resources/ai-autofill', { url });
    return res.data;
};

export const fetchAllExternalResourcesAdmin = async () => {
    const res = await api.get('/external-resources/admin-all');
    return res.data;
};

export const createExternalResourceAdmin = async (data) => {
    const res = await api.post('/external-resources', data);
    return res.data;
};

export const updateExternalResourceAdmin = async (id, data) => {
    const res = await api.patch(`/external-resources/${id}`, data);
    return res.data;
};

export const deleteExternalResourceAdmin = async (id) => {
    await api.delete(`/external-resources/${id}`);
};

// ─── Course linking (admin / instructor role) ─────────────────────────────────

export const fetchCourseLinkedResources = async (courseId) => {
    const res = await api.get(`/courses/${courseId}/external-resources`);
    return res.data;
};

export const linkResourceToCourse = async (courseId, resourceId) => {
    const res = await api.post(`/courses/${courseId}/external-resources`, { resourceId });
    return res.data;
};

export const unlinkResourceFromCourse = async (courseId, resourceId) => {
    await api.delete(`/courses/${courseId}/external-resources/${resourceId}`);
};

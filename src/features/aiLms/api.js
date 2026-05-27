import api from '../../shared/api/client';

export const generateAiFeedbackDraft = async (submissionId, payload) => {
    const { data } = await api.post(`/ai-lms/submissions/${submissionId}/feedback-draft`, payload);
    return data;
};

export const generateAiLessonQuizDraft = async (lessonId, payload) => {
    const { data } = await api.post(`/ai-lms/lessons/${lessonId}/quiz-draft`, payload);
    return data;
};

export const generateAiSessionQuizDraft = async (sessionId, payload) => {
    const { data } = await api.post(`/ai-lms/sessions/${sessionId}/quiz-draft`, payload);
    return data;
};

export const generateAiHomeworkDraft = async (sessionId, payload) => {
    const { data } = await api.post(`/ai-lms/sessions/${sessionId}/homework-draft`, payload);
    return data;
};

export const generateAiLessonKit = async (lessonId, payload) => {
    const { data } = await api.post(`/ai-lms/lessons/${lessonId}/lesson-kit`, payload);
    return data;
};

export const generateAiWorksheetDraft = async (sessionId, payload) => {
    const { data } = await api.post(`/ai-lms/sessions/${sessionId}/worksheet-draft`, payload);
    return data;
};

export const generateAiCourseDraft = async (payload) => {
    const { data } = await api.post('/ai-lms/courses/course-draft', payload);
    return data;
};

export const generateAiMessageDraft = async (studentId, payload) => {
    const { data } = await api.post(`/ai-lms/students/${studentId}/message-draft`, payload);
    return data;
};

export const getAiLmsCapabilities = async (courseId) => {
    const { data } = await api.get('/ai-lms/capabilities', {
        params: courseId ? { courseId } : undefined,
    });
    return data;
};

export const listAiLmsAdminSettings = async (params) => {
    const { data } = await api.get('/ai-lms/admin/settings', { params });
    return data;
};

export const updateAiLmsAdminSettings = async (payload) => {
    const { data } = await api.patch('/ai-lms/admin/settings', payload);
    return data;
};

export const listAiLmsAdminFeatureLimits = async (params) => {
    const { data } = await api.get('/ai-lms/admin/feature-limits', { params });
    return data;
};

export const updateAiLmsAdminFeatureLimit = async (payload) => {
    const { data } = await api.patch('/ai-lms/admin/feature-limits', payload);
    return data;
};

export const acceptAiGeneration = async (generationId) => {
    const { data } = await api.patch(`/ai-lms/generations/${generationId}/accept`);
    return data;
};

export const rejectAiGeneration = async (generationId) => {
    const { data } = await api.patch(`/ai-lms/generations/${generationId}/reject`);
    return data;
};

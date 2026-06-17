import api from '../../shared/api/client';

export const listLessonPlanTemplates = async () => {
    const { data } = await api.get('/lesson-plan-templates');
    return data;
};

export const createLessonPlanTemplate = async (payload) => {
    const { data } = await api.post('/lesson-plan-templates', payload);
    return data;
};

export const updateLessonPlanTemplate = async (id, patch) => {
    const { data } = await api.patch(`/lesson-plan-templates/${id}`, patch);
    return data;
};

export const deleteLessonPlanTemplate = async (id) => {
    const { data } = await api.delete(`/lesson-plan-templates/${id}`);
    return data;
};

import api from '../../shared/api/client';

export const listQuizTemplates = async () => {
    const { data } = await api.get('/quiz-templates');
    return data;
};

export const createQuizTemplate = async (payload) => {
    const { data } = await api.post('/quiz-templates', payload);
    return data;
};

export const deleteQuizTemplate = async (id) => {
    const { data } = await api.delete(`/quiz-templates/${id}`);
    return data;
};

export const duplicateQuizTemplate = async (id) => {
    const { data } = await api.post(`/quiz-templates/${id}/duplicate`);
    return data;
};

export const useQuizTemplate = async (id) => {
    const { data } = await api.post(`/quiz-templates/${id}/use`);
    return data;
};

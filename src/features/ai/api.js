import api from '../../shared/api/client';

export const fetchCourseAiPrompts = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/ai/prompts`);
    return data;
};

export const addCourseAiPrompt = async (courseId, payload) => {
    const { data } = await api.post(`/courses/${courseId}/ai/prompts`, payload);
    return data;
};

export const updateCourseAiPrompt = async (courseId, promptId, payload) => {
    const { data } = await api.patch(`/courses/${courseId}/ai/prompts/${promptId}`, payload);
    return data;
};

export const deleteCourseAiPrompt = async (courseId, promptId) => {
    const { data } = await api.delete(`/courses/${courseId}/ai/prompts/${promptId}`);
    return data;
};

export const fetchCourseAiSettings = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/ai/settings`);
    return data;
};

export const updateCourseAiSettings = async (courseId, payload) => {
    const { data } = await api.patch(`/courses/${courseId}/ai/settings`, payload);
    return data;
};

export const fetchCourseAiChats = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/ai/chats`);
    return data;
};

export const createCourseAiChat = async (courseId, payload = {}) => {
    const { data } = await api.post(`/courses/${courseId}/ai/chats`, payload);
    return data;
};

export const deleteAiChat = async (chatId) => {
    const { data } = await api.delete(`/ai/chats/${chatId}`);
    return data;
};

export const fetchAiChatMessages = async (chatId) => {
    const { data } = await api.get(`/ai/chats/${chatId}/messages`);
    return data;
};

export const sendAiChatMessage = async (chatId, payload) => {
    const { data } = await api.post(`/ai/chats/${chatId}/messages`, payload);
    return data;
};

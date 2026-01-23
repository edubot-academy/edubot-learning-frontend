import api from '@shared/api/client';

export const sendInstructorChatMessage = async ({ content, courseId, instructorId }) => {
    const response = await api.post('/instructor-chat', { content, courseId, instructorId });
    return response.data;
};

export const replyInstructorChatMessage = async ({ chatId, content }) => {
    const response = await api.post(`/instructor-chat/${chatId}/reply`, { content });
    return response.data;
};

export const fetchInstructorChats = async ({ role } = {}) => {
    const response = await api.get('/instructor-chat', { params: role ? { role } : {} });
    return response.data;
};

export const fetchInstructorChatMessages = async (chatId) => {
    const response = await api.get(`/instructor-chat/${chatId}/messages`);
    return response.data;
};

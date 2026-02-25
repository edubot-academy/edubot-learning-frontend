import api from '@shared/api/client';

export const sendInstructorChatMessage = async ({ content, courseId, instructorId }) => {
    const response = await api.post('/instructor-chat', { content, courseId, instructorId });
    return response.data;
};

export const replyInstructorChatMessage = async ({ chatId, content, type, file }) => {
    if (!chatId) throw new Error('chatId is required');

    const hasFile = Boolean(file);
    const payload = hasFile ? new FormData() : { content, type };

    if (hasFile) {
        payload.append('type', type || 'file');
        if (content) payload.append('content', content);
        payload.append('file', file);
    }

    const response = await api.post(`/instructor-chat/${chatId}/reply`, payload);
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

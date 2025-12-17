import api from '@shared/api/client';

export const fetchNotifications = async ({ page = 1, limit = 20 } = {}) => {
    const response = await api.get('/notifications', { params: { page, limit } });
    return response.data;
};

export const fetchUnreadNotificationsCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
};

export const sendNotification = async ({ subject, message, method = 'email', userId }) => {
    const url = userId ? `/notifications/${userId}` : '/notifications/me';
    const response = await api.post(url, { subject, message, method });
    return response.data;
};

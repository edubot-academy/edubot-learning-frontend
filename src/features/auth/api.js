import api from '../../shared/api/client';

export const sendOtp = async (data) => await api.post(`/auth/forgot-password`, data);

export const resetPassword = async (data) => await api.post(`/auth/reset-password`, data);

export const registerUser = async (userData) => await api.post('/auth/register', userData);

export const loginUser = async (userData) => await api.post('/auth/login', userData);

export const fetchUserProfile = async () => await api.get('/auth/profile');

export const updateUserProfile = async (userId, data) =>
    await api.patch(`/auth/update/${userId}`, data);

export const fetchInstructorProfile = async (userId) => {
    const response = await api.get(`/users/${userId}/instructor-profile`);
    return response.data;
};

export const updateInstructorProfile = async (userId, data) => {
    const response = await api.patch(`/users/${userId}/instructor-profile`, data);
    return response.data;
};

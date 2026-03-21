import api from '../../shared/api/client';

export const sendOtp = async (data) => await api.post(`/auth/forgot-password`, data);

export const resetPassword = async (data) => await api.post(`/auth/reset-password`, data);

export const registerUser = async (userData) => await api.post('/auth/register', userData);

export const loginUser = async (userData) => await api.post('/auth/login', userData);

export const logoutUser = async () => {
    try {

        const response = await api.post('/auth/logout');

        return response.data;
    } catch (error) {
        console.error('❌ Logout API error:', error);
        throw error;
    }
};

export const fetchUserProfile = async (config = {}) => {
    const response = await api.get('/auth/profile', config);
    return response.data;
};

export const updateUserProfile = async (userId, data) => {
    const response = await api.patch(`/auth/update/${userId}`, data);
    return response.data;
};

export const fetchInstructorProfile = async (userId) => {
    const response = await api.get(`/users/${userId}/instructor-profile`);
    return response.data;
};

export const updateInstructorProfile = async (userId, data) => {
    const response = await api.patch(`/users/${userId}/instructor-profile`, data);
    return response.data;
};

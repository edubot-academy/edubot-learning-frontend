import api from '@shared/api/client';

export const fetchFavorites = async () => {
    const response = await api.get('/favorites');
    return response.data;
};

export const addFavorite = async (courseId) => {
    const response = await api.post(`/favorites/${courseId}`);
    return response.data;
};

export const removeFavorite = async (courseId) => {
    const response = await api.delete(`/favorites/${courseId}`);
    return response.data;
};

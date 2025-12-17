import api from '@shared/api/client';

export const fetchCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

export const addCourseToCart = async ({ courseId }) => {
    const response = await api.post(`/cart/${courseId}`);
    return response.data;
};

export const removeCourseFromCart = async ({ courseId }) => {
    const response = await api.delete(`/cart/${courseId}`);
    return response.data;
};

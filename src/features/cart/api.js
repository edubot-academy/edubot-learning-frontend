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

export const checkoutManual = async ({ method = 'manual_transfer', payerPhone }) => {
    const response = await api.post('/cart/checkout/manual', {
        method,
        payerPhone,
    });
    return response.data;
};

import api from '../../shared/api/client';

export const addPayment = async (data) => {
    try {
        const response = await api.post('/payments', data);
        return response.data;
    } catch (error) {
        console.error('Error adding payment:', error);
        throw error;
    }
};

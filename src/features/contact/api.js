import api from '../../shared/api/client';

export const submitContactMessage = async (formData) => {
    const response = await api.post('/contact', formData);
    return response.data;
};

export const fetchContactMessages = async () => {
    const response = await api.get('/contact');
    return response.data;
};

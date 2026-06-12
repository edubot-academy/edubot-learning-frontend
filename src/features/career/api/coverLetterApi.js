import api from '@shared/api/client';

export const getCoverLetters = async () => {
    const res = await api.get('/career/cover-letters');
    return res.data;
};

export const getCoverLetter = async (coverLetterId) => {
    const res = await api.get(`/career/cover-letters/${coverLetterId}`);
    return res.data;
};

export const createCoverLetter = async (payload) => {
    const res = await api.post('/career/cover-letters', payload);
    return res.data;
};

export const updateCoverLetter = async (coverLetterId, payload) => {
    const res = await api.patch(`/career/cover-letters/${coverLetterId}`, payload);
    return res.data;
};

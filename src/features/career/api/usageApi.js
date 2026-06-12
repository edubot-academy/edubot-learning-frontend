import api from '@shared/api/client';

export const getCareerUsage = async () => {
    const res = await api.get('/career/usage');
    return res.data;
};

export const getCareerPlans = async () => {
    const res = await api.get('/career/plans');
    return res.data;
};

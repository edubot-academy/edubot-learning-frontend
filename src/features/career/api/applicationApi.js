import api from '@shared/api/client';

export const getApplications = async () => {
    const res = await api.get('/career/applications');
    return res.data;
};

export const createApplication = async (payload) => {
    const res = await api.post('/career/applications', payload);
    return res.data;
};

export const updateApplication = async (applicationId, payload) => {
    const res = await api.patch(`/career/applications/${applicationId}`, payload);
    return res.data;
};

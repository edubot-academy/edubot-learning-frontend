import api from '../../shared/api/client';

export const getParentProfile = async () => {
    const { data } = await api.get('/parent/profile');
    return data;
};

export const getParentChildren = async () => {
    const { data } = await api.get('/parent/children');
    return data;
};

export const updateGuardianConsent = async (guardianId, status) => {
    const { data } = await api.patch(`/parent/guardian-links/${guardianId}/consent`, { status });
    return data;
};

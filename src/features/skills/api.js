import api from '../../shared/api/client';

export const fetchSkills = async () => {
    const { data } = await api.get('/skills');
    return data;
};

export const createSkill = async (payload) => {
    const { data } = await api.post('/skills', payload);
    return data;
};

export const updateSkill = async (skillId, payload) => {
    const { data } = await api.patch(`/skills/${skillId}`, payload);
    return data;
};

export const deleteSkill = async (skillId) => {
    const { data } = await api.delete(`/skills/${skillId}`);
    return data;
};

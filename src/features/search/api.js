import api from '../../shared/api/client';

export const searchCourses = async (q) => {
    if (!q || q.length < 2) return [];
    const res = await api.get('/courses/search', { params: { q } });
    return res.data;
};

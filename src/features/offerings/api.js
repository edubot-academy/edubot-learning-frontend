import api from '../../shared/api/client';

export async function createOffering(payload) {
    const { data } = await api.post('/offerings', payload);
    return data;
}

export async function updateOffering(id, patch) {
    const { data } = await api.patch(`/offerings/${id}`, patch);
    return data;
}

export async function listOfferingsForCourse(courseId, { q } = {}) {
    const { data } = await api.get(`/offerings/course/${courseId}`, { params: { q } });
    return data;
}

export async function publicOfferingsForCourse(courseId) {
    const { data } = await api.get(`/public/course/${courseId}/offerings`);
    return data;
}

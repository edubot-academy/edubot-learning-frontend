import api, { clean } from '@shared/api/client';

export const fetchCourseStudents = async (
    courseId,
    { page = 1, limit = 20, q, progressGte, progressLte } = {}
) => {
    const response = await api.get(`/courses/${courseId}/students`, {
        params: clean({ page, limit, q, progressGte, progressLte }),
    });
    return response.data;
};

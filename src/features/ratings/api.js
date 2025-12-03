import api from '../../shared/api/client';

export async function getCourseRating(courseId) {
    const { data } = await api.get(`/courses/${courseId}/rating`);
    return data;
}

export async function getTopRatings({ limit = 10 } = {}) {
    const { data } = await api.get(`/courses/top-ratings`, {
        params: { limit },
    });
    return data;
}

export async function rateCourse(courseId, { value, comment }) {
    const { data } = await api.post(`/courses/${courseId}/rate`, {
        value,
        comment,
    });
    return data;
}

export async function fetchCourseReviews(courseId, page = 1, limit = 10) {
    const { data } = await api.get(`/courses/${courseId}/reviews`, {
        params: { page, limit },
    });
    return data;
}

export async function fetchTopCourses(limit = 3) {
    const { data } = await api.get(`/courses/top`, {
        params: { limit },
    });
    return data;
}

export async function fetchTopInstructors(limit = 3) {
    const { data } = await api.get(`/users/top-instructors`, {
        params: { limit },
    });
    return data;
}

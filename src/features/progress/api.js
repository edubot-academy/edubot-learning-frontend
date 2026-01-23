import api from '../../shared/api/client';

export const fetchUserProgress = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
};

export const updateUserProgress = async (courseId, lessonId) => {
    const response = await api.post(`/courses/${courseId}/progress`, { lessonId });
    return response.data;
};

export const markLessonComplete = async (courseId, sectionId, lessonId) => {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/complete`
    );
    return response.data;
};

export const updateLastViewedLesson = async ({ courseId, lessonId }) => {
    const res = await api.put(`/student-progress/last-viewed`, { courseId, lessonId });
    return res.data;
};

export const getLastViewedLesson = async (courseId) => {
    const res = await api.get(`/student-progress/last-viewed?courseId=${courseId}`);
    return res.data;
};

export const getVideoTime = async (courseId, lessonId) => {
    const res = await api.get(`courses/${courseId}/progress/lessons/${lessonId}/video-time`);
    return res.data;
};

export const updateVideoTime = async ({ courseId, lessonId, time }) => {
    const res = await api.put(`courses/${courseId}/progress/lessons/${lessonId}/video-time`, {
        time,
    });
    return res.data;
};

import axios from 'axios';
import api, { clean } from '../../shared/api/client';
import toast from 'react-hot-toast';
import { COURSE_TYPE } from '@shared/contracts';

const VALID_COURSE_TYPES = new Set(Object.values(COURSE_TYPE));

const withCourseType = (courseData = {}) => {
    if (!courseData || typeof courseData !== 'object') return courseData;
    if (!courseData.courseType) return courseData;
    if (!VALID_COURSE_TYPES.has(courseData.courseType)) {
        throw new Error('courseType must be video, offline, or online_live');
    }
    return courseData;
};

export const fetchCourses = async ({ q = '', limit = 20, excludeIds = '' } = {}) => {
    try {
        const response = await api.get('/courses', { params: clean({ q, limit, excludeIds }) });
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

export const fetchCatalogCourses = async ({ page = 1, limit = 20, q = '' } = {}) => {
    try {
        const response = await api.get('/courses/catalog', {
            params: clean({ page, limit, q }),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching catalog courses:', error);
        throw error;
    }
};

export const fetchCoursePreview = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/preview`);
    return response.data;
};

export const fetchTopReviews = async ({ courseId, limit = 3 }) => {
    const response = await api.get(`/courses/${courseId}/reviews/top`, { params: { limit } });
    return response.data;
};

export const fetchInstructorStudentCourses = async () => {
    const response = await api.get('/courses/instructor/my-students');
    return response.data;
};

export const fetchCourseStudents = async (
    courseId,
    { page = 1, limit = 20, q, progressGte, progressLte } = {}
) => {
    const response = await api.get(`/courses/${courseId}/students`, {
        params: clean({ page, limit, q, progressGte, progressLte }),
    });
    return response.data;
};

export const fetchCourseDetails = async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
};

export const fetchCompanyCourses = async (companyId, params = {}) => {
    const { page, limit, q } = params;
    const { data } = await api.get(`/courses/company/${companyId}`, {
        params: clean({ page, limit, q }),
    });
    return data;
};

export const createCourse = async (courseData) => {
    const response = await api.post('/courses', withCourseType(courseData));
    return response.data;
};

export const updateCourse = async (courseId, courseData) => {
    const response = await api.patch(`/courses/${courseId}`, withCourseType(courseData));
    return response.data;
};

export const deleteCourse = async (courseId) => {
    try {
        const response = await api.delete(`/courses/${courseId}`);
        toast.success('Course deleted successfully');
        return response.data;
    } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
        throw error;
    }
};

export const publishCourse = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/publish`);
    return response.data;
};

export const markCoursePending = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/status`, { status: 'pending' });
    return response.data;
};

export const getPendingCourses = async () => {
    const response = await api.get('/courses/pending');
    return response.data;
};

export const markCourseApproved = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/status`, { status: 'approved' });
    return response.data;
};

export const markCourseRejected = async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/status`, { status: 'rejected' });
    return response.data;
};

export const uploadCourseImage = async (courseId, coverFile) => {
    const formData = new FormData();
    formData.append('cover', coverFile);
    const response = await api.post(`/courses/${courseId}/upload-cover`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const createSection = async (courseId, sectionData) => {
    const response = await api.post(`/courses/${courseId}/sections`, sectionData);
    return response.data;
};

export const fetchSections = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/sections`);
    return response.data;
};

export const updateSection = async (courseId, sectionId, sectionData) => {
    const response = await api.patch(`/courses/${courseId}/sections/${sectionId}`, sectionData);
    return response.data;
};

export const deleteSection = async (courseId, sectionId) => {
    await api.delete(`/courses/${courseId}/sections/${sectionId}`);
};

export async function createLesson(courseId, sectionId, lessonData) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons`,
        lessonData
    );
    return response.data;
}

export async function updateLesson(courseId, sectionId, lessonId, lessonData) {
    const response = await api.patch(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        lessonData
    );
    return response.data;
}

export const transcodeLessonHls = async ({ courseId, sectionId, lessonId }) => {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/transcode-hls`
    );
    return response.data;
};
export async function deleteLesson(courseId, sectionId, lessonId) {
    await api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
}

export async function fetchLessons(courseId, sectionId) {
    const response = await api.get(`/courses/${courseId}/sections/${sectionId}/lessons`);
    return response.data;
}

export async function fetchLessonQuiz(courseId, sectionId, lessonId, manage = false) {
    const suffix = manage ? '/manage' : '';
    const response = await api.get(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz${suffix}`
    );
    return response.data;
}

export async function upsertLessonQuiz(courseId, sectionId, lessonId, quizData) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz`,
        quizData
    );
    return response.data;
}

export async function submitLessonQuiz(courseId, sectionId, lessonId, answers) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz/submit`,
        answers
    );
    return response.data;
}

export async function fetchLessonChallenge(courseId, sectionId, lessonId, manage = false) {
    const suffix = manage ? '/manage' : '';
    const response = await api.get(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/challenge${suffix}`
    );
    return response.data;
}

export async function upsertLessonChallenge(courseId, sectionId, lessonId, challengeData) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/challenge`,
        challengeData
    );
    return response.data;
}

export async function submitLessonChallenge(courseId, sectionId, lessonId, payload) {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/challenge/submit`,
        payload
    );
    return response.data;
}

export async function uploadLessonFile(courseId, sectionId, type, file, lessonOrder, onProgress) {
    if (!file || typeof file.name !== 'string') {
        throw new Error('No file provided');
    }

    const parts = file.name.split('.');
    if (parts.length < 2) {
        throw new Error('File name does not contain an extension');
    }

    const extension = parts.pop().toLowerCase();
    const allowed = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'pdf', 'zip'];
    if (!allowed.includes(extension)) {
        throw new Error(`Unsupported file type: .${extension}`);
    }

    let presign;
    try {
        presign = await api.get(`/courses/${courseId}/sections/${sectionId}/lessons/upload-url`, {
            params: { type, extension, lessonOrder },
        });
    } catch (err) {
        const msg = err.response?.data?.message || err.message;
        throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    const { key, url, maxFileSize } = presign.data;

    if (file.size > maxFileSize) {
        throw new Error(`File too large: ${file.size} > ${maxFileSize}`);
    }

    try {
        await axios.put(url, file, {
            headers: { 'Content-Type': file.type },
            maxBodyLength: Infinity,
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
        });
    } catch (err) {
        const msg = err.response?.statusText || err.message;
        throw new Error(msg);
    }

    return key;
}

export const updateLessonDuration = async (courseId, sectionId, lessonId, duration) => {
    try {
        const response = await api.patch(
            `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/set-duration`,
            {
                duration,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to update lesson duration:', error);
        throw error;
    }
};

export async function fetchTopCourses(limit = 3) {
    const { data } = await api.get(`/courses/top`, {
        params: { limit },
    });
    return data;
}

import axios from 'axios';
import api, { clean } from '../../shared/api/client';
import toast from 'react-hot-toast';
import { COURSE_TYPE } from '@shared/contracts';
import i18n from '../../i18n';
import { parseApiError } from '@shared/api/error';

const VALID_COURSE_TYPES = new Set(Object.values(COURSE_TYPE));
const localizedError = (message) => Object.assign(new Error(message), { isLocalizedMessage: true });

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

export const fetchInstructorCourses = async ({
    page = 1,
    limit = 20,
    q = '',
    status = 'all',
    courseType = 'all'
} = {}) => {
    const params = clean({
        page,
        limit,
        q: q || undefined,
        status: status === 'all' ? undefined : status,
        courseType: courseType === 'all' ? undefined : courseType
    });
    const response = await api.get('/courses/instructor/my-courses', { params });
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

export const fetchCourseCertificateSettings = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/certificate-settings`);
    return response.data;
};

export const updateCourseCertificateSettings = async (courseId, payload) => {
    const response = await api.patch(`/courses/${courseId}/certificate-settings`, payload);
    return response.data;
};

export const saveCourseCertificateSignatureAsset = async (courseId, file) => {
    const formData = new FormData();
    formData.append('signature', file);
    const response = await api.post(
        `/courses/${courseId}/certificate-settings/upload-signature`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const uploadCourseCertificateSecondaryLogo = async (courseId, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post(
        `/courses/${courseId}/certificate-settings/upload-secondary-logo`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const fetchCourseCertificates = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/certificates`);
    return response.data;
};

const getDownloadFilename = (contentDisposition, fallback = 'certificate.pdf') => {
    if (!contentDisposition || typeof contentDisposition !== 'string') return fallback;

    const utfMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
        try {
            return decodeURIComponent(utfMatch[1]).replace(/["']/g, '');
        } catch {
            return utfMatch[1].replace(/["']/g, '');
        }
    }

    const basicMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    return basicMatch?.[1] ? basicMatch[1].trim() : fallback;
};

export const downloadCourseCertificatePdf = async (
    downloadUrl,
    fallbackFilename = 'certificate.pdf',
) => {
    try {
        const response = await api.get(downloadUrl, {
            responseType: 'blob',
        });
        const blob =
            response.data instanceof Blob
                ? response.data
                : new Blob([response.data], { type: 'application/pdf' });
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = getDownloadFilename(
            response.headers?.['content-disposition'],
            fallbackFilename,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
        return true;
    } catch (error) {
        console.error('Error downloading certificate PDF:', error);
        toast.error(i18n.t('courseApi.toasts.certificatePdfDownloadFailed'));
        throw error;
    }
};

export const issueCourseCertificate = async (courseId, payload) => {
    const response = await api.post(`/courses/${courseId}/certificates/issue`, payload);
    return response.data;
};

export const approveCertificate = async (certificateId, payload = {}) => {
    const response = await api.post(`/certificates/${certificateId}/approve`, payload);
    return response.data;
};

export const rejectCertificate = async (certificateId, payload = {}) => {
    const response = await api.post(`/certificates/${certificateId}/reject`, payload);
    return response.data;
};

export const revokeCertificate = async (certificateId, payload = {}) => {
    const response = await api.post(`/certificates/${certificateId}/revoke`, payload);
    return response.data;
};

export const fetchCertificateVerification = async (publicId) => {
    const response = await api.get(`/certificates/${publicId}/verify`);
    return response.data;
};

export const regenerateCourseCertificates = async (courseId, payload = {}) => {
    const response = await api.post(`/courses/${courseId}/certificates/regenerate`, payload);
    return response.data;
};

export const fetchCourseCertificatePreviewHtml = async (courseId, payload = {}) => {
    const response = await api.post(`/courses/${courseId}/certificate-preview`, payload, {
        responseType: 'text',
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
        toast.success(i18n.t('courseApi.toasts.courseDeleted'));
        return response.data;
    } catch (error) {
        console.error('Error deleting course:', error);
        toast.error(parseApiError(error, i18n.t('courseApi.toasts.courseDeleteFailed')).message);
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

export const bulkTranscodeLessonHls = async ({ courseId, sectionId, lessonIds }) => {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/bulk-transcode-hls`,
        { lessonIds }
    );
    return response.data;
};

export const getTranscodeStatus = async ({ courseId, sectionId, lessonId }) => {
    const response = await api.get(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/transcode-status`
    );
    return response.data;
};

export const retryTranscodeLessonHls = async ({ courseId, sectionId, lessonId }) => {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/transcode-hls`,
        { retry: true }
    );
    return response.data;
};

export const forceTranscodeLessonHls = async ({ courseId, sectionId, lessonId }) => {
    const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/transcode-hls`,
        { force: true }
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
        throw localizedError(parseApiError(err, i18n.t('courseApi.errors.uploadUrlFailed')).message);
    }

    const { key, url, maxFileSize } = presign.data;

    if (file.size > maxFileSize) {
        throw localizedError(i18n.t('courseApi.errors.fileTooLarge'));
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
        throw localizedError(parseApiError(err, i18n.t('courseApi.errors.fileUploadFailed')).message);
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

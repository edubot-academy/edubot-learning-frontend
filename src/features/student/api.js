import api, { clean } from '../../shared/api/client';

export const fetchStudentCourses = async (studentId, params = {}) => {
    const { status } = params;
    const { data } = await api.get('/student/courses', {
        params: clean({ status }),
    });
    return data;
};

export const fetchStudentAccessState = async () => {
    const { data } = await api.get('/student/access');
    return data;
};

export const fetchStudentProgress = async (studentId) => {
    const { data } = await api.get('/student/progress');
    return data;
};

export const fetchStudentCertificates = async (studentId) => {
    const { data } = await api.get('/student/certificates');
    return data;
};

export const fetchStudentNotificationSettings = async (studentId) => {
    const { data } = await api.get('/student/notification-settings');
    return data;
};

export const updateStudentNotificationSettings = async (studentId, payload) => {
    const { data } = await api.patch('/student/notification-settings', payload);
    return data;
};

export const fetchAdminStats = async () => {
    const { data } = await api.get('/students/admin/stats');
    return data;
};

// New LMS student-role endpoints (/student/*)
export const fetchStudentDashboard = async ({ courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/student/dashboard', {
        params: clean({ courseId, groupId, limit }),
    });
    return data;
};

export const fetchStudentUpcomingSessions = async ({ courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/student/sessions/upcoming', {
        params: clean({ courseId, groupId, limit }),
    });
    return data;
};

export const fetchStudentRecordings = async ({ courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/student/recordings', {
        params: clean({ courseId, groupId, limit }),
    });
    return data;
};

export const fetchStudentResources = async ({ courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/student/resources', {
        params: clean({ courseId, groupId, limit }),
    });
    return data;
};

export const fetchStudentSessionMaterialPreview = async (sessionId, materialIndex) => {
    const { data, headers } = await api.get(
        `/student/sessions/${sessionId}/materials/${materialIndex}`,
        {
            responseType: 'blob',
        }
    );

    return {
        blob: data,
        contentType: headers?.['content-type'] || data?.type || '',
    };
};

export const fetchStudentSessionMaterialMeta = async (sessionId, materialIndex) => {
    const { data } = await api.get(`/student/sessions/${sessionId}/materials/${materialIndex}/meta`);
    return data;
};

export const fetchStudentSessionRecordingMeta = async (sessionId) => {
    const { data } = await api.get(`/student/sessions/${sessionId}/recording/meta`);
    return data;
};

export const fetchStudentAttendance = async ({ from, to, courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/student/attendance', {
        params: clean({ from, to, courseId, groupId, limit }),
    });
    return data;
};

export const fetchStudentHomework = async ({ courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/student/homework', {
        params: clean({ courseId, groupId, limit }),
    });
    return data;
};

export const fetchStudentTasks = async ({ courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/student/tasks', {
        params: clean({ courseId, groupId, limit }),
    });
    return data;
};

export const fetchStudentHomeworkSubmissionAttachmentPreview = async (homeworkId) => {
    const { data, headers } = await api.get(`/student/homework/${homeworkId}/submission/attachment`, {
        responseType: 'blob',
    });

    return {
        blob: data,
        contentType: headers?.['content-type'] || data?.type || '',
    };
};

export const fetchStudentActivitySubmissionAttachmentPreview = async (activityId) => {
    const { data, headers } = await api.get(`/student/activities/${activityId}/submission/attachment`, {
        responseType: 'blob',
    });

    return {
        blob: data,
        contentType: headers?.['content-type'] || data?.type || '',
    };
};

export const uploadStudentActivityAttachment = async (sessionId, activityId, file) => {
    const form = new FormData();
    form.append('file', file);

    const { data } = await api.post(`/student/sessions/${sessionId}/activities/${activityId}/submissions/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const submitStudentActivity = async (sessionId, activityId, payload) => {
    const { data } = await api.post(`/student/sessions/${sessionId}/activities/${activityId}/submit`, payload);
    return data;
};

export const submitStudentActivityQuiz = async (sessionId, activityId, payload) => {
    const { data } = await api.post(`/student/sessions/${sessionId}/activities/${activityId}/quiz-attempt`, payload);
    return data;
};

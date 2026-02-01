import api from '@shared/api/client';

export const createTypedCourse = async (payload) => {
    const response = await api.post('/courses', payload);
    return response.data;
};

export const updateTypedCourse = async (courseId, payload) => {
    const response = await api.patch(`/courses/${courseId}`, payload);
    return response.data;
};

export const generateCourseSessions = async (courseId, payload) => {
    const response = await api.post(`/instructor/courses/${courseId}/sessions/generate`, payload);
    return response.data;
};

export const listCourseSessions = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/sessions`);
    return response.data;
};

export const markSessionComplete = async (courseId, sessionId) => {
    const response = await api.post(`/instructor/sessions/${sessionId}/complete`, {
        courseId,
    });
    return response.data;
};

export const rescheduleSession = async (courseId, sessionId, payload) => {
    const response = await api.patch(`/instructor/sessions/${sessionId}`, {
        ...payload,
        courseId,
    });
    return response.data;
};

export const cancelSession = async (courseId, sessionId) => {
    const response = await api.patch(`/instructor/sessions/${sessionId}`, {
        status: 'cancelled',
        courseId,
    });
    return response.data;
};

export const bulkSaveAttendance = async (courseId, sessionId, payload) => {
    const response = await api.post(`/instructor/sessions/${sessionId}/attendance`, {
        ...payload,
        courseId,
    });
    return response.data;
};

export const upsertAssignment = async (courseId, payload) => {
    const response = await api.post(`/instructor/courses/${courseId}/assignments`, payload);
    return response.data;
};

export const publishAssignment = async (assignmentId) => {
    const response = await api.post(`/instructor/assignments/${assignmentId}/publish`);
    return response.data;
};

export const listAssignments = async (courseId) => {
    const response = await api.get(`/instructor/courses/${courseId}/assignments`);
    return response.data;
};

export const listSubmissions = async (courseId, assignmentId) => {
    const response = await api.get(`/instructor/assignments/${assignmentId}/submissions`);
    return response.data;
};

export const reviewSubmission = async (courseId, assignmentId, submissionId, payload) => {
    const response = await api.post(`/instructor/submissions/${submissionId}/review`, payload);
    return response.data;
};

export const submitHomework = async (courseId, assignmentId, payload) => {
    const response = await api.post(`/student/assignments/${assignmentId}/submit`, payload);
    return response.data;
};

export const studentListAssignments = async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/assignments`);
    return response.data;
};

export const fetchCourseRoster = async (courseId) => {
    const response = await api.get(`/enrollments/courses/${courseId}/students`);
    return response.data;
};

export const fetchCourseOverview = async (courseId) => {
    try {
        const response = await api.get(`/courses/${courseId}/overview`);
        return response.data;
    } catch (error) {
        // Fallback to details if overview not implemented
        try {
            const response = await api.get(`/courses/${courseId}`);
            return response.data;
        } catch (err) {
            throw error;
        }
    }
};

export const releaseSessionHomework = async (sessionId, courseId) => {
    const response = await api.post(`/instructor/sessions/${sessionId}/release-homework`, {
        courseId,
    });
    return response.data;
};

export const fetchStudentCourseDashboard = async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/dashboard`);
    return response.data;
};

export const fetchStudentCourseAttendance = async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/attendance`);
    return response.data;
};

export const fetchParentStudentSummary = async (studentId) => {
    const response = await api.get(`/parent/students/${studentId}/summary`);
    return response.data;
};

export const linkParentToStudent = async ({ studentId, code }) => {
    const response = await api.post(`/parent/students/${studentId}/link`, { code });
    return response.data;
};

export const searchStudents = async (query) => {
    const response = await api.get('/students/search', { params: { q: query } });
    return response.data;
};

export const fetchHomeworkNotifications = async ({ page = 1, limit = 20, type }) => {
    const response = await api.get('/notifications', { params: { page, limit, type } });
    return response.data;
};

export const fetchInstructorLiveDashboard = async (courseId) => {
    const response = await api.get(`/instructor/courses/${courseId}/attendance`);
    return response.data;
};

export const generateCoursePlan = async (courseId, payload) => {
    const response = await api.post(`/courses/${courseId}/plan/generate`, payload);
    return response.data;
};

export const presignAssignmentUpload = async ({ courseId, fileName }) => {
    const response = await api.post('/instructor/assignments/uploads/presign', { courseId, fileName });
    return response.data;
};

export const presignSubmissionUpload = async ({ assignmentId, fileName }) => {
    const response = await api.post('/student/submissions/uploads/presign', { assignmentId, fileName });
    return response.data;
};

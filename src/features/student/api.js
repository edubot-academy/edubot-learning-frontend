import api, { clean } from '../../shared/api/client';

export const fetchStudentDashboardSummary = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/dashboard-summary`);
    return data;
};

export const fetchStudentCourses = async (studentId, params = {}) => {
    const { status } = params;
    const { data } = await api.get(`/students/${studentId}/courses`, {
        params: clean({ status }),
    });
    return data;
};

export const fetchStudentOfferings = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/offerings`);
    return data;
};

export const fetchStudentTasks = async (studentId, params = {}) => {
    const { status } = params;
    const { data } = await api.get(`/students/${studentId}/tasks`, {
        params: clean({ status }),
    });
    return data;
};

export const fetchStudentProgress = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/progress`);
    return data;
};

export const fetchStudentCertificates = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/certificates`);
    return data;
};

export const fetchStudentNotificationSettings = async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/notification-settings`);
    return data;
};

export const updateStudentNotificationSettings = async (studentId, payload) => {
    const { data } = await api.patch(`/students/${studentId}/notification-settings`, payload);
    return data;
};

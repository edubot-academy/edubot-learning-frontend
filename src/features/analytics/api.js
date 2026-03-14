import api, { clean } from '../../shared/api/client';

const ensurePositiveInt = (value, fieldName) => {
    if (value === undefined || value === null || value === '') return undefined;
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) {
        throw new Error(`${fieldName} must be a positive integer`);
    }
    return numeric;
};

const ensureIsoDateTime = (value, fieldName) => {
    if (value === undefined || value === null || value === '') return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid ISO date string`);
    }
    return date.toISOString();
};

const normalizeAnalyticsFilters = ({ from, to, courseId, groupId } = {}) =>
    clean({
        from: ensureIsoDateTime(from, 'from'),
        to: ensureIsoDateTime(to, 'to'),
        courseId: ensurePositiveInt(courseId, 'courseId'),
        groupId: ensurePositiveInt(groupId, 'groupId'),
    });

const normalizeInstructorQuery = ({ from, to, courseId, groupId, instructorId } = {}) =>
    clean({
        ...normalizeAnalyticsFilters({ from, to, courseId, groupId }),
        instructorId: ensurePositiveInt(instructorId, 'instructorId'),
    });

const normalizeStudentQuery = ({ from, to, courseId, groupId, studentId } = {}) =>
    clean({
        ...normalizeAnalyticsFilters({ from, to, courseId, groupId }),
        studentId: ensurePositiveInt(studentId, 'studentId'),
    });

// Admin analytics
export const fetchAdminOverviewAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/overview', {
        params: normalizeAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminCoursePopularityAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/course-popularity', {
        params: normalizeAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminGroupFillRateAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/group-fill-rate', {
        params: normalizeAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminAttendanceRateAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/attendance-rate', {
        params: normalizeAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminDropoutRiskAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/dropout-risk', {
        params: normalizeAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminInstructorPerformanceAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/instructor-performance', {
        params: normalizeAnalyticsFilters(filters),
    });
    return data;
};

// Instructor analytics
export const fetchInstructorOverviewAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/instructor/overview', {
        params: normalizeInstructorQuery(filters),
    });
    return data;
};

export const fetchInstructorStudentsAtRiskAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/instructor/students-at-risk', {
        params: normalizeInstructorQuery(filters),
    });
    return data;
};

// Student analytics
export const fetchStudentOverviewAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/student/overview', {
        params: normalizeStudentQuery(filters),
    });
    return data;
};

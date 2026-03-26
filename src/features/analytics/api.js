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

// Updated filter normalization for simplified new API
const normalizeAnalyticsFilters = ({ from, to } = {}) =>
    clean({
        from: ensureIsoDateTime(from, 'from'),
        to: ensureIsoDateTime(to, 'to'),
    });

const normalizeInstructorQuery = ({ from, to, instructorId } = {}) =>
    clean({
        from: ensureIsoDateTime(from, 'from'),
        to: ensureIsoDateTime(to, 'to'),
        instructorId: ensurePositiveInt(instructorId, 'instructorId'),
    });

const normalizeStudentQuery = ({ from, to, studentId } = {}) =>
    clean({
        from: ensureIsoDateTime(from, 'from'),
        to: ensureIsoDateTime(to, 'to'),
        studentId: ensurePositiveInt(studentId, 'studentId'),
    });

// Legacy filter normalization (kept for backward compatibility)
const normalizeLegacyAnalyticsFilters = ({ from, to, courseId, groupId } = {}) =>
    clean({
        from: ensureIsoDateTime(from, 'from'),
        to: ensureIsoDateTime(to, 'to'),
        courseId: ensurePositiveInt(courseId, 'courseId'),
        groupId: ensurePositiveInt(groupId, 'groupId'),
    });

const normalizeLegacyInstructorQuery = ({ from, to, courseId, groupId, instructorId } = {}) =>
    clean({
        ...normalizeLegacyAnalyticsFilters({ from, to, courseId, groupId }),
        instructorId: ensurePositiveInt(instructorId, 'instructorId'),
    });

const normalizeLegacyStudentQuery = ({ from, to, courseId, groupId, studentId } = {}) =>
    clean({
        ...normalizeLegacyAnalyticsFilters({ from, to, courseId, groupId }),
        studentId: ensurePositiveInt(studentId, 'studentId'),
    });

// New simplified analytics endpoints
export const fetchAdminOverviewAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/overview', {
        params: normalizeAnalyticsFilters(filters),
    });
    return data;
};

export const fetchInstructorOverviewAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/instructor/overview', {
        params: normalizeInstructorQuery(filters),
    });
    return data;
};

export const fetchStudentOverviewAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/student/overview', {
        params: normalizeStudentQuery(filters),
    });
    return data;
};

// Legacy endpoints (kept for backward compatibility)
export const fetchAdminCoursePopularityAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/course-popularity', {
        params: normalizeLegacyAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminGroupFillRateAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/group-fill-rate', {
        params: normalizeLegacyAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminAttendanceRateAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/attendance-rate', {
        params: normalizeLegacyAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminDropoutRiskAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/dropout-risk', {
        params: normalizeLegacyAnalyticsFilters(filters),
    });
    return data;
};

export const fetchAdminInstructorPerformanceAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/admin/instructor-performance', {
        params: normalizeLegacyAnalyticsFilters(filters),
    });
    return data;
};

export const fetchInstructorStudentsAtRiskAnalytics = async (filters = {}) => {
    const { data } = await api.get('/analytics/instructor/students-at-risk', {
        params: normalizeLegacyInstructorQuery(filters),
    });
    return data;
};

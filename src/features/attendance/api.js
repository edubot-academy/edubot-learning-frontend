import api, { clean } from '../../shared/api/client';
import { ATTENDANCE_STATUS, SESSION_ATTENDANCE_STATUS } from '@shared/contracts';

const VALID_LEGACY_STATUSES = new Set(Object.values(ATTENDANCE_STATUS));
const VALID_SESSION_STATUSES = new Set(Object.values(SESSION_ATTENDANCE_STATUS));
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const ensurePositiveInt = (value, fieldName) => {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) {
        throw new Error(`${fieldName} must be a positive integer`);
    }
    return numeric;
};

const ensureDateOnly = (value, fieldName) => {
    if (!ISO_DATE_REGEX.test(String(value || ''))) {
        throw new Error(`${fieldName} must be YYYY-MM-DD`);
    }
    return value;
};

const normalizeLegacyRows = (rows = []) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('rows must be a non-empty array');
    }

    return rows.map((row) => {
        const userId = ensurePositiveInt(row?.userId, 'userId');
        if (!VALID_LEGACY_STATUSES.has(row?.status)) {
            throw new Error('status must be present, absent, or late');
        }

        return clean({
            userId,
            status: row.status,
            notes: row?.notes,
        });
    });
};

const normalizeSessionRows = (rows = []) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('rows must be a non-empty array');
    }

    return rows.map((row) => {
        const studentId = ensurePositiveInt(row?.studentId, 'studentId');
        if (!VALID_SESSION_STATUSES.has(row?.status)) {
            throw new Error('status must be present, absent, late, or excused');
        }

        return clean({
            studentId,
            status: row.status,
            joinedAt: row?.joinedAt,
            leftAt: row?.leftAt,
            notes: row?.notes,
        });
    });
};

// Legacy date-based attendance
export const markAttendanceSession = async ({ courseId, sessionDate, rows }) => {
    const payload = {
        courseId: ensurePositiveInt(courseId, 'courseId'),
        sessionDate: ensureDateOnly(sessionDate, 'sessionDate'),
        rows: normalizeLegacyRows(rows),
    };

    const { data } = await api.post('/attendance/session', payload);
    return data;
};

export const fetchCourseAttendance = async ({ courseId, groupId, from, to }) => {
    const params = clean({
        courseId: ensurePositiveInt(courseId, 'courseId'),
        groupId: groupId !== undefined ? ensurePositiveInt(groupId, 'groupId') : undefined,
        from: from ? ensureDateOnly(from, 'from') : undefined,
        to: to ? ensureDateOnly(to, 'to') : undefined,
    });

    const { data } = await api.get('/attendance/course', { params });
    return data;
};

// New session-based attendance
export const markSessionAttendanceBulk = async (sessionId, { rows }) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const payload = {
        rows: normalizeSessionRows(rows),
    };

    const { data } = await api.post(`/attendance/sessions/${validSessionId}/bulk`, payload);
    return data;
};

export const fetchSessionAttendance = async (sessionId) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.get(`/attendance/sessions/${validSessionId}`);
    return data;
};

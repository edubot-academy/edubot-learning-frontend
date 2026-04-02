import api, { clean } from '../../shared/api/client';
import { COURSE_GROUP_STATUS, MEETING_PROVIDER } from '@shared/contracts';

const VALID_GROUP_STATUS = new Set(Object.values(COURSE_GROUP_STATUS));
const VALID_PROVIDER = new Set(Object.values(MEETING_PROVIDER));
const VALID_SCHEDULE_DAYS = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

const ensurePositiveInt = (value, fieldName) => {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) {
        throw new Error(`${fieldName} must be a positive integer`);
    }
    return numeric;
};

const ensureDateString = (value, fieldName) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        throw new Error(`${fieldName} must be YYYY-MM-DD`);
    }
    return value;
};

const ensureNonEmptyString = (value, fieldName) => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${fieldName} is required`);
    }
    return value.trim();
};

const compareTimeStrings = (left, right) => {
    const [leftHour, leftMinute] = String(left || '00:00').split(':').map(Number);
    const [rightHour, rightMinute] = String(right || '00:00').split(':').map(Number);
    return leftHour * 60 + leftMinute - (rightHour * 60 + rightMinute);
};

const normalizeScheduleBlocks = (blocks) => {
    if (blocks === undefined) return undefined;
    if (blocks === null) return null;
    if (!Array.isArray(blocks)) {
        throw new Error('scheduleBlocks must be an array');
    }

    const seen = new Set();
    const normalized = blocks
        .map((block) => ({
            day: String(block?.day || '').trim().toLowerCase(),
            startTime: String(block?.startTime || '').trim(),
            endTime: String(block?.endTime || '').trim(),
        }))
        .filter((block) => block.day || block.startTime || block.endTime)
        .map((block) => {
            if (!VALID_SCHEDULE_DAYS.has(block.day)) {
                throw new Error('scheduleBlocks.day must be a valid weekday');
            }
            if (!/^\d{2}:\d{2}$/.test(block.startTime)) {
                throw new Error('scheduleBlocks.startTime must be HH:MM');
            }
            if (!/^\d{2}:\d{2}$/.test(block.endTime)) {
                throw new Error('scheduleBlocks.endTime must be HH:MM');
            }
            if (compareTimeStrings(block.startTime, block.endTime) >= 0) {
                throw new Error('scheduleBlocks.endTime must be later than startTime');
            }

            const key = `${block.day}:${block.startTime}:${block.endTime}`;
            if (seen.has(key)) {
                throw new Error('scheduleBlocks cannot contain duplicate schedule blocks');
            }
            seen.add(key);
            return block;
        });

    return normalized.length ? normalized : null;
};

const normalizeGroupPayload = (payload = {}, { partial = false } = {}) => {
    if (!payload || typeof payload !== 'object') {
        throw new Error('payload must be an object');
    }

    if (!partial || payload.courseId !== undefined) {
        if (payload.courseId === undefined && !partial) {
            throw new Error('courseId is required');
        }
    }

    if (!partial || payload.name !== undefined) {
        if (payload.name === undefined && !partial) {
            throw new Error('name is required');
        }
    }

    if (!partial || payload.code !== undefined) {
        if (payload.code === undefined && !partial) {
            throw new Error('code is required');
        }
    }

    const normalized = clean({
        courseId:
            payload.courseId !== undefined
                ? ensurePositiveInt(payload.courseId, 'courseId')
                : undefined,
        name: payload.name !== undefined ? ensureNonEmptyString(payload.name, 'name') : undefined,
        code: payload.code !== undefined ? ensureNonEmptyString(payload.code, 'code') : undefined,
        status:
            payload.status !== undefined
                ? (() => {
                      if (!VALID_GROUP_STATUS.has(payload.status)) {
                          throw new Error(
                              `status must be one of: ${Array.from(VALID_GROUP_STATUS).join(', ')}`
                          );
                      }
                      return payload.status;
                  })()
                : undefined,
        startDate: ensureDateString(payload.startDate, 'startDate'),
        endDate: ensureDateString(payload.endDate, 'endDate'),
        seatLimit:
            payload.seatLimit !== undefined
                ? ensurePositiveInt(payload.seatLimit, 'seatLimit')
                : undefined,
        timezone: payload.timezone,
        location: payload.location,
        meetingProvider:
            payload.meetingProvider !== undefined
                ? (() => {
                      if (!VALID_PROVIDER.has(payload.meetingProvider)) {
                          throw new Error(
                              `meetingProvider must be one of: ${Array.from(VALID_PROVIDER).join(', ')}`
                          );
                      }
                      return payload.meetingProvider;
                  })()
                : undefined,
        meetingUrl: payload.meetingUrl,
        scheduleNote:
            payload.scheduleNote !== undefined ? String(payload.scheduleNote || '').trim() || null : undefined,
        scheduleBlocks: normalizeScheduleBlocks(payload.scheduleBlocks),
        instructorId:
            payload.instructorId !== undefined
                ? ensurePositiveInt(payload.instructorId, 'instructorId')
                : undefined,
    });

    return normalized;
};

export const createCourseGroup = async (payload) => {
    const { data } = await api.post('/course-groups', normalizeGroupPayload(payload));
    return data;
};

export const updateCourseGroup = async (id, patch) => {
    const groupId = ensurePositiveInt(id, 'id');
    const { data } = await api.patch(
        `/course-groups/${groupId}`,
        normalizeGroupPayload(patch, { partial: true })
    );
    return data;
};

export const fetchCourseGroup = async (id) => {
    const groupId = ensurePositiveInt(id, 'id');
    const { data } = await api.get(`/course-groups/${groupId}`);
    return data;
};

export const fetchCourseGroups = async ({ courseId, status } = {}) => {
    const params = clean({
        courseId: courseId !== undefined ? ensurePositiveInt(courseId, 'courseId') : undefined,
        status:
            status !== undefined
                ? (() => {
                      if (!VALID_GROUP_STATUS.has(status)) {
                          throw new Error(
                              `status must be one of: ${Array.from(VALID_GROUP_STATUS).join(', ')}`
                          );
                      }
                      return status;
                  })()
                : undefined,
    });

    const { data } = await api.get('/course-groups', { params });
    return data;
};

export const fetchCourseGroupStudents = async (
    groupId,
    { page = 1, limit = 200, q, progressGte, progressLte } = {}
) => {
    const normalizedGroupId = ensurePositiveInt(groupId, 'groupId');
    const { data } = await api.get(`/course-groups/${normalizedGroupId}/students`, {
        params: clean({ page, limit, q, progressGte, progressLte }),
    });
    return data;
};

export const fetchCourseGroupSessionGenerationPreview = async (
    groupId,
    { fromDate, toDate } = {}
) => {
    const normalizedGroupId = ensurePositiveInt(groupId, 'groupId');
    const { data } = await api.get(`/course-groups/${normalizedGroupId}/session-generation/preview`, {
        params: clean({
            fromDate: ensureDateString(fromDate, 'fromDate'),
            toDate: ensureDateString(toDate, 'toDate'),
        }),
    });
    return data;
};

export const generateCourseGroupSessions = async (groupId, { fromDate, toDate } = {}) => {
    const normalizedGroupId = ensurePositiveInt(groupId, 'groupId');
    const { data } = await api.post(`/course-groups/${normalizedGroupId}/session-generation`, clean({
        fromDate: ensureDateString(fromDate, 'fromDate'),
        toDate: ensureDateString(toDate, 'toDate'),
    }));
    return data;
};

import api, { clean } from '../../shared/api/client';
import { COURSE_SESSION_STATUS } from '@shared/contracts';

const VALID_SESSION_STATUS = new Set(
    [
        COURSE_SESSION_STATUS.SCHEDULED,
        COURSE_SESSION_STATUS.COMPLETED,
        COURSE_SESSION_STATUS.CANCELLED,
    ].filter(Boolean)
);

const ensurePositiveInt = (value, fieldName) => {
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
        throw new Error(`${fieldName} must be a valid datetime`);
    }
    return date.toISOString();
};

const ensureNonEmptyString = (value, fieldName) => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${fieldName} is required`);
    }
    return value.trim();
};

const normalizeMaterials = (materials) => {
    if (materials === undefined) return undefined;
    if (!Array.isArray(materials)) {
        throw new Error('materials must be an array');
    }

    return materials.map((item, index) => {
        const title = ensureNonEmptyString(item?.title, `materials[${index}].title`);
        const url = ensureNonEmptyString(item?.url, `materials[${index}].url`);
        return { title, url };
    });
};

const normalizeSessionPayload = (payload = {}, { partial = false } = {}) => {
    if (!payload || typeof payload !== 'object') {
        throw new Error('payload must be an object');
    }

    if (!partial && payload.groupId === undefined) {
        throw new Error('groupId is required');
    }
    if (!partial && payload.sessionIndex === undefined) {
        throw new Error('sessionIndex is required');
    }
    if (!partial && payload.title === undefined) {
        throw new Error('title is required');
    }
    if (!partial && payload.startsAt === undefined) {
        throw new Error('startsAt is required');
    }
    if (!partial && payload.endsAt === undefined) {
        throw new Error('endsAt is required');
    }

    return clean({
        groupId:
            payload.groupId !== undefined
                ? ensurePositiveInt(payload.groupId, 'groupId')
                : undefined,
        sessionIndex:
            payload.sessionIndex !== undefined
                ? ensurePositiveInt(payload.sessionIndex, 'sessionIndex')
                : undefined,
        title:
            payload.title !== undefined ? ensureNonEmptyString(payload.title, 'title') : undefined,
        startsAt: ensureIsoDateTime(payload.startsAt, 'startsAt'),
        endsAt: ensureIsoDateTime(payload.endsAt, 'endsAt'),
        status:
            payload.status !== undefined
                ? (() => {
                      if (!VALID_SESSION_STATUS.has(payload.status)) {
                          throw new Error(
                              `status must be one of: ${Array.from(VALID_SESSION_STATUS).join(', ')}`
                          );
                      }
                      return payload.status;
                  })()
                : undefined,
        recordingUrl: payload.recordingUrl,
        materials: normalizeMaterials(payload.materials),
    });
};

export const createCourseSession = async (payload) => {
    const { data } = await api.post('/group-sessions', normalizeSessionPayload(payload));
    return data;
};

export const updateCourseSession = async (id, patch) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const { data } = await api.patch(
        `/group-sessions/${sessionId}`,
        normalizeSessionPayload(patch, { partial: true })
    );
    return data;
};

export const fetchCourseSession = async (id) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const { data } = await api.get(`/group-sessions/${sessionId}`);
    return data;
};

export const fetchCourseSessions = async ({ groupId } = {}) => {
    const { data } = await api.get('/group-sessions', {
        params: clean({
            groupId: groupId !== undefined ? ensurePositiveInt(groupId, 'groupId') : undefined,
        }),
    });
    return data;
};

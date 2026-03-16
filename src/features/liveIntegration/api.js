import api, { clean } from '../../shared/api/client';
import { MEETING_PROVIDER } from '@shared/contracts';

const VALID_PROVIDER = new Set(Object.values(MEETING_PROVIDER));

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

const ensureProvider = (provider) => {
    if (provider === undefined || provider === null || provider === '') return undefined;
    if (!VALID_PROVIDER.has(provider)) {
        throw new Error(`provider must be one of: ${Array.from(VALID_PROVIDER).join(', ')}`);
    }
    return provider;
};

const normalizeMeetingPayload = (payload = {}) => {
    if (!payload || typeof payload !== 'object') {
        return {};
    }

    return clean({
        provider: ensureProvider(payload.provider),
        customJoinUrl: payload.customJoinUrl,
        topic: payload.topic,
        agenda: payload.agenda,
        startTime: ensureIsoDateTime(payload.startTime, 'startTime'),
        durationMinutes:
            payload.durationMinutes !== undefined
                ? ensurePositiveInt(payload.durationMinutes, 'durationMinutes')
                : undefined,
        timezone: payload.timezone,
        hostUserId: payload.hostUserId,
    });
};

const normalizeImportPayload = (payload = {}) =>
    clean({
        presentMinPercent:
            payload.presentMinPercent !== undefined
                ? ensurePositiveInt(payload.presentMinPercent, 'presentMinPercent')
                : undefined,
        lateGraceMinutes:
            payload.lateGraceMinutes !== undefined
                ? ensurePositiveInt(payload.lateGraceMinutes, 'lateGraceMinutes')
                : undefined,
    });

const normalizeRecordingSyncPayload = (payload = {}) =>
    clean({
        setSessionRecordingUrl:
            payload.setSessionRecordingUrl !== undefined
                ? Boolean(payload.setSessionRecordingUrl)
                : undefined,
    });

export const createSessionMeeting = async (sessionId, payload) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.post(
        `/live-integration/sessions/${validSessionId}/meeting`,
        normalizeMeetingPayload(payload)
    );
    return data;
};

export const updateSessionMeeting = async (sessionId, payload) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.patch(
        `/live-integration/sessions/${validSessionId}/meeting`,
        normalizeMeetingPayload(payload)
    );
    return data;
};

export const fetchSessionMeeting = async (sessionId, { provider } = {}) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.get(`/live-integration/sessions/${validSessionId}/meeting`, {
        params: clean({ provider: ensureProvider(provider) }),
    });
    return data;
};

export const deleteSessionMeeting = async (sessionId, { provider } = {}) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.delete(`/live-integration/sessions/${validSessionId}/meeting`, {
        params: clean({ provider: ensureProvider(provider) }),
    });
    return data;
};

export const importSessionAttendance = async (sessionId, payload = {}) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.post(
        `/live-integration/sessions/${validSessionId}/attendance/import`,
        normalizeImportPayload(payload)
    );
    return data;
};

export const syncSessionRecordings = async (sessionId, payload = {}) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.post(
        `/live-integration/sessions/${validSessionId}/recordings/sync`,
        normalizeRecordingSyncPayload(payload)
    );
    return data;
};

export const fetchLiveIntegrationHealth = async () => {
    const { data } = await api.get('/live-integration/admin/health');
    return data;
};

export const retryFailedZoomWebhooks = async ({ limit } = {}) => {
    const { data } = await api.post(
        '/live-integration/admin/webhooks/retry-failed',
        clean({ limit: limit !== undefined ? ensurePositiveInt(limit, 'limit') : undefined })
    );
    return data;
};

export const replayZoomWebhookEvent = async (eventId) => {
    const validEventId = ensurePositiveInt(eventId, 'eventId');
    const { data } = await api.post(`/live-integration/admin/webhooks/${validEventId}/replay`);
    return data;
};

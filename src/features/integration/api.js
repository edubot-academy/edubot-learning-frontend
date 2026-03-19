import api, { clean } from '../../shared/api/client';

const randomRequestId = () =>
    globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const randomIdempotencyKey = (prefix = 'integration') =>
    `${prefix}:${Date.now()}:${Math.random().toString(16).slice(2)}`;

const integrationHeaders = (crmCompanyId, idempotencyKey) => {
    const headers = {
        'X-Client-System': 'crm',
        'X-Company-Id': String(crmCompanyId || 'default_company'),
        'X-Request-Id': randomRequestId(),
    };

    if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
    }

    return headers;
};

export const fetchIntegrationCourses = async ({ page, limit, search, isActive } = {}) => {
    const { data } = await api.get('/api/integration/courses', {
        params: clean({ page, limit, search, isActive }),
    });
    return data;
};

export const fetchIntegrationGroups = async ({ courseId, status, page, limit } = {}) => {
    const { data } = await api.get('/api/integration/groups', {
        params: clean({ courseId, status, page, limit }),
    });
    return data;
};

export const createIntegrationEnrollmentRequest = async (payload) => {
    const crmCompanyId = payload?.crmCompanyId;
    const idempotencyKey = randomIdempotencyKey(`enrollment:create:${crmCompanyId || 'default'}`);
    const { data } = await api.post('/api/integration/enrollments', payload, {
        headers: integrationHeaders(crmCompanyId, idempotencyKey),
    });
    return data;
};

export const activateIntegrationEnrollment = async (enrollmentId, payload) => {
    const crmCompanyId = payload?.crmCompanyId;
    const idempotencyKey = randomIdempotencyKey(
        `enrollment:activate:${crmCompanyId || 'default'}:${enrollmentId}`
    );
    const { data } = await api.patch(
        `/api/integration/enrollments/${enrollmentId}/activate`,
        payload,
        {
            headers: integrationHeaders(crmCompanyId, idempotencyKey),
        }
    );
    return data;
};

export const fetchIntegrationRiskSummary = async () => {
    const { data } = await api.get('/admin/integration/risk-summary');
    return data;
};

export const fetchIntegrationHealth = async () => {
    const { data } = await api.get('/admin/integration/health');
    return data;
};

export const fetchEnrollmentStatusEvents = async ({ page = 1, limit = 20 } = {}) => {
    const { data } = await api.get('/admin/integration/events', {
        params: clean({
            page,
            limit,
            eventType: 'enrollment_status_changed',
        }),
    });
    return data;
};

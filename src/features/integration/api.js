import api, { clean } from '../../shared/api/client';
import { SOURCE_SYSTEM } from '@shared/contracts';

const buildRequestId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const integrationHeaders = (companyId) => ({
    'X-Client-System': SOURCE_SYSTEM.CRM,
    'X-Company-Id': String(companyId || 'default_company'),
    'X-Request-Id': buildRequestId(),
});

const getFirstSuccessful = async (requests = []) => {
    let lastError;
    for (const request of requests) {
        try {
            return await request();
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError;
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
    const { crmCompanyId } = payload || {};
    const { data } = await api.post('/api/integration/enrollments', payload, {
        headers: integrationHeaders(crmCompanyId),
    });
    return data;
};

export const activateIntegrationEnrollment = async (enrollmentId, payload) => {
    const { crmCompanyId } = payload || {};
    const { data } = await api.patch(
        `/api/integration/enrollments/${enrollmentId}/activate`,
        payload,
        {
            headers: integrationHeaders(crmCompanyId),
        }
    );
    return data;
};

export const fetchLmsRiskAlerts = async ({
    page = 1,
    limit = 20,
    companyId,
    severity,
    issueType,
    dateFrom,
    dateTo,
} = {}) => {
    const params = clean({ page, limit, companyId, severity, issueType, dateFrom, dateTo });

    const response = await getFirstSuccessful([
        () => api.get('/api/integrations/lms/risk-alerts', { params }),
        () => api.get('/integrations/lms/risk-alerts', { params }),
        () => api.get('/api/integration/risk-alerts', { params }),
    ]);

    return response.data;
};

export const fetchEnrollmentStatusEvents = async ({
    page = 1,
    limit = 20,
    companyId,
    enrollmentStatus,
    dateFrom,
    dateTo,
} = {}) => {
    const params = clean({
        page,
        limit,
        companyId,
        eventType: 'enrollment_status_changed',
        enrollmentStatus,
        dateFrom,
        dateTo,
    });

    const response = await getFirstSuccessful([
        () => api.get('/api/integrations/lms/enrollment-events', { params }),
        () => api.get('/integrations/lms/enrollment-events', { params }),
        () => api.get('/api/integrations/lms/events', { params }),
    ]);

    return response.data;
};

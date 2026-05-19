import i18n from '../../i18n';

export const API_ERROR_CODES = {
    CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
    AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
    AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
    AUTH_CREDENTIALS_INVALID: 'AUTH_CREDENTIALS_INVALID',
    COMPANY_LOCALE_UNSUPPORTED: 'COMPANY_LOCALE_UNSUPPORTED',
    TENANT_CONTEXT_MISMATCH: 'TENANT_CONTEXT_MISMATCH',
};

export const getApiErrorCode = (error) => {
    const payload = error?.response?.data || {};
    const stableError = payload?.error || {};
    return stableError?.code || payload?.code || null;
};

export const getApiErrorMessage = (code, fallbackMessage = i18n.t('errors.generic')) => {
    if (!code) return fallbackMessage;

    const translated = i18n.t(`errors.${code}`, { defaultValue: '' });
    return translated || fallbackMessage;
};

export const parseApiError = (error, fallbackMessage = i18n.t('errors.generic')) => {
    const payload = error?.response?.data || {};
    const stableError = payload?.error || {};
    const status = error?.response?.status ?? null;

    const code = getApiErrorCode(error);
    const requestId = payload?.requestId || stableError?.requestId || null;
    const timestamp = payload?.timestamp || stableError?.timestamp || null;

    const rawMessage =
        stableError?.message || payload?.message || error?.message || fallbackMessage;

    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;

    return {
        status,
        code,
        requestId,
        timestamp,
        message: getApiErrorMessage(code, message),
    };
};

export const isUnauthorizedError = (error) => error?.response?.status === 401;

export const isForbiddenError = (error) => error?.response?.status === 403;

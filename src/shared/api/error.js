import i18n from '../../i18n';

export const API_ERROR_CODES = {
    CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
    AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
    AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
    AUTH_CREDENTIALS_INVALID: 'AUTH_CREDENTIALS_INVALID',
    COMPANY_LOCALE_UNSUPPORTED: 'COMPANY_LOCALE_UNSUPPORTED',
    TENANT_CONTEXT_MISMATCH: 'TENANT_CONTEXT_MISMATCH',
    CHAT_NOT_FOUND: 'CHAT_NOT_FOUND',
    INSTRUCTOR_CHAT_NOT_FOUND: 'INSTRUCTOR_CHAT_NOT_FOUND',
};

const getApiErrorPayload = (source) => source?.response?.data || source || {};

const ERROR_CATEGORY_PREFIXES = [
    ['CRM_INTEGRATION_', 'integration'],
    ['CRM_WEBHOOK_', 'integration'],
    ['STUDENT_PORTAL_', 'student'],
    ['COURSE_GROUP_', 'group'],
    ['GROUP_SESSION_', 'session'],
    ['MEDIA_CONVERT_', 'media'],
    ['AUTH_', 'auth'],
    ['TENANT_', 'tenant'],
    ['COMPANY_', 'company'],
    ['USER_', 'user'],
    ['STUDENT_', 'student'],
    ['COURSE_', 'course'],
    ['SECTION_', 'course'],
    ['LESSON_', 'lesson'],
    ['HOMEWORK_', 'homework'],
    ['ATTENDANCE_', 'attendance'],
    ['CERTIFICATE_', 'certificate'],
    ['ENROLLMENT_', 'enrollment'],
    ['AI_', 'ai'],
    ['VIDEO_', 'media'],
    ['TRANSCODE_', 'media'],
    ['IMAGE_', 'media'],
    ['S3_', 'media'],
    ['ZOOM_', 'meeting'],
    ['CART_', 'cart'],
    ['FAVORITE_', 'favorite'],
    ['SKILL_', 'skill'],
    ['OFFERING_', 'offering'],
    ['LEADERBOARD_', 'leaderboard'],
    ['NOTIFICATION_', 'notification'],
];

export const getApiErrorCode = (error) => {
    const payload = getApiErrorPayload(error);
    const stableError = payload?.error || {};
    return stableError?.code || payload?.code || payload?.errorCode || null;
};

export const getApiErrorMessage = (code, fallbackMessage = i18n.t('errors.generic')) => {
    if (!code) return fallbackMessage;

    const translated = i18n.t(`errors.${code}`, { defaultValue: '' });
    if (translated) return translated;

    const category = ERROR_CATEGORY_PREFIXES.find(([prefix]) => code.startsWith(prefix))?.[1];
    if (category) {
        const categoryMessage = i18n.t(`errors.categories.${category}`, { defaultValue: '' });
        if (categoryMessage) return categoryMessage;
    }

    return fallbackMessage;
};

const getApiTranslationKey = (source) => {
    const payload = getApiErrorPayload(source);
    const stableError = payload?.error || {};

    return (
        stableError?.messageKey ||
        stableError?.labelKey ||
        payload?.messageKey ||
        payload?.labelKey ||
        null
    );
};

export const getLocalizedBackendMessage = (
    source,
    fallbackMessage = i18n.t('errors.generic')
) => {
    const translationKey = getApiTranslationKey(source);
    if (translationKey) {
        const translated = i18n.t(translationKey, { defaultValue: '' });
        if (translated) return translated;
    }

    return getApiErrorMessage(getApiErrorCode(source), fallbackMessage);
};

export const parseApiError = (error, fallbackMessage = i18n.t('errors.generic')) => {
    const payload = getApiErrorPayload(error);
    const stableError = payload?.error || {};
    const status = error?.response?.status ?? null;

    const code = getApiErrorCode(error);
    const headers = error?.response?.headers || {};
    const requestId =
        stableError?.requestId ||
        payload?.requestId ||
        stableError?.traceId ||
        payload?.traceId ||
        headers['x-request-id'] ||
        headers['x-correlation-id'] ||
        null;
    const timestamp = payload?.timestamp || stableError?.timestamp || null;

    return {
        status,
        code,
        requestId,
        timestamp,
        message: getLocalizedBackendMessage(error, fallbackMessage),
    };
};

export const isUnauthorizedError = (error) => error?.response?.status === 401;

export const isForbiddenError = (error) => error?.response?.status === 403;

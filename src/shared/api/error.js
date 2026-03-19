export const parseApiError = (error, fallbackMessage = 'Сервер катасы болду.') => {
    const payload = error?.response?.data || {};
    const stableError = payload?.error || {};

    const code = stableError?.code || payload?.code || null;
    const requestId = payload?.requestId || stableError?.requestId || null;
    const timestamp = payload?.timestamp || stableError?.timestamp || null;

    const rawMessage =
        stableError?.message ||
        payload?.message ||
        error?.message ||
        fallbackMessage;

    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;

    return {
        code,
        requestId,
        timestamp,
        message,
    };
};

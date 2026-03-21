import axios from 'axios';
import { API_BASE_URL } from '../../config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Utility: only send defined params
export const clean = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

const getCookieValue = (name) => {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookie = document.cookie
        .split(';')
        .map((chunk) => chunk.trim())
        .find((chunk) => chunk.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

api.interceptors.request.use(
    (config) => {
        const method = String(config.method || 'get').toUpperCase();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            const csrfToken = getCookieValue('edubot_csrf_token');
            if (csrfToken) {
                if (!config.headers) {
                    config.headers = {};
                }
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        // Don't set Content-Type for FormData
        if (config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const shouldSkipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);

        if (error?.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('pendingAction');

            if (!shouldSkipAuthRedirect && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export { api };
export default api;

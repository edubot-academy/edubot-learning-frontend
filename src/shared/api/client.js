import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { getResolvedLocale } from '../../i18n/locale';
import { API_ERROR_CODES, getApiErrorCode } from './error';

// Token management for cross-domain authentication
const getStoredToken = () => {
    try {
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
};

const setStoredToken = (token) => {
    try {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    } catch {
        // Ignore localStorage errors
    }
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

const CSRF_ERROR_TEXT = 'CSRF token missing or invalid';

// Utility: only send defined params
export const clean = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

export const getCookieValue = (name) => {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookie = document.cookie
        .split(';')
        .map((chunk) => chunk.trim())
        .find((chunk) => chunk.startsWith(`${name}=`));

    if (!cookie) return null;

    try {
        return decodeURIComponent(cookie.slice(name.length + 1));
    } catch {
        return null;
    }
};

api.interceptors.request.use(
    (config) => {
        if (!config.headers) {
            config.headers = {};
        }

        // Add Authorization header as fallback for cross-domain requests
        const token = getStoredToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers['Accept-Language'] = getResolvedLocale();

        const method = String(config.method || 'get').toUpperCase();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            const csrfToken = getCookieValue('edubot_csrf_token');
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        // Don't set Content-Type for FormData unless a specific endpoint opts in.
        if (config.data instanceof FormData && config.headers && !config.preserveContentType) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        // Store token from login response for fallback
        if (response.config.url?.includes('/auth/login') && response.data?.access_token) {
            setStoredToken(response.data.access_token);
        }
        return response;
    },
    async (error) => {
        const shouldSkipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);
        const message = error?.response?.data?.message;
        const code = getApiErrorCode(error);
        const isCsrfError =
            error?.response?.status === 403 &&
            (code === API_ERROR_CODES.CSRF_TOKEN_INVALID ||
                (Array.isArray(message)
                    ? message.includes(CSRF_ERROR_TEXT)
                    : String(message || '').includes(CSRF_ERROR_TEXT)));

        if (isCsrfError && error.config && !error.config.__csrfRetry) {
            error.config.__csrfRetry = true;
            try {
                await api.get('/auth/profile', {
                    skipAuthRedirect: true,
                    __csrfRefresh: true,
                });
                return api(error.config);
            } catch {
                return Promise.reject(error);
            }
        }

        if (error?.response?.status === 401) {
            // Clear stored token on 401
            setStoredToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('pendingAction');

            if (!shouldSkipAuthRedirect && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }

            // If we're skipping auth redirect, suppress the error to avoid console noise
            if (shouldSkipAuthRedirect) {
                return Promise.reject({ ...error, suppressed: true });
            }
        }

        return Promise.reject(error);
    }
);

export { api, setStoredToken };
export default api;

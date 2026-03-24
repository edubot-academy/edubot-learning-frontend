import axios from 'axios';
import { API_BASE_URL } from '../../config';

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
        // Add Authorization header as fallback for cross-domain requests
        const token = getStoredToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }

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
    (response) => {
        // Store token from login response for fallback
        if (response.config.url?.includes('/auth/login') && response.data?.access_token) {
            setStoredToken(response.data.access_token);
        }
        return response;
    },
    (error) => {
        const shouldSkipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);

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

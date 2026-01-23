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

const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        return currentTime >= expiryTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            if (!config.headers) config.headers = {};
            config.headers['Authorization'] = `Bearer ${token}`;

            if (isTokenExpired(token)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject('Token expired');
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

export { api };
export default api;

import {
    getJsonStorageItem,
    getStorageItem,
    removeStorageItem,
    setJsonStorageItem,
    setStorageItem,
} from '@shared/utils/storage';

const USER_CACHE_KEY = 'user';
const AUTH_TOKEN_KEY = 'auth_token';
const PENDING_AUTH_ACTION_KEY = 'pendingAction';

export const loadCachedUser = () => getJsonStorageItem(USER_CACHE_KEY, null);

export const saveCachedUser = (user) => {
    setJsonStorageItem(USER_CACHE_KEY, user);
};

export const clearCachedUser = () => {
    removeStorageItem(USER_CACHE_KEY);
};

export const hasCachedUser = () => {
    const storedUser = getStorageItem(USER_CACHE_KEY);
    return Boolean(storedUser && storedUser !== 'undefined');
};

export const getStoredAuthToken = () => getStorageItem(AUTH_TOKEN_KEY);

export const setStoredAuthToken = (token) => {
    if (token) {
        setStorageItem(AUTH_TOKEN_KEY, token);
    } else {
        removeStorageItem(AUTH_TOKEN_KEY);
    }
};

export const clearStoredAuthToken = () => {
    removeStorageItem(AUTH_TOKEN_KEY);
};

export const loadPendingAuthAction = () => getJsonStorageItem(PENDING_AUTH_ACTION_KEY, null);

export const savePendingAuthAction = (action) => {
    setJsonStorageItem(PENDING_AUTH_ACTION_KEY, action);
};

export const clearPendingAuthAction = () => {
    removeStorageItem(PENDING_AUTH_ACTION_KEY);
};

export const clearStoredSession = () => {
    clearCachedUser();
    clearPendingAuthAction();
    clearStoredAuthToken();
};

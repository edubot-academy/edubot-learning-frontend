const getDefaultStorage = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage ?? null;
};

const getStorage = (storage) => storage ?? getDefaultStorage();

const getDefaultSessionStorage = () => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage ?? null;
};

export const getStorageItem = (key, fallback = null, storage) => {
    const resolvedStorage = getStorage(storage);
    if (!resolvedStorage) return fallback;

    try {
        const value = resolvedStorage.getItem(key);
        return value ?? fallback;
    } catch {
        return fallback;
    }
};

export const setStorageItem = (key, value, storage) => {
    const resolvedStorage = getStorage(storage);
    if (!resolvedStorage) return false;

    try {
        if (value === undefined || value === null) {
            resolvedStorage.removeItem(key);
        } else {
            resolvedStorage.setItem(key, value);
        }
        return true;
    } catch {
        return false;
    }
};

export const removeStorageItem = (key, storage) => {
    const resolvedStorage = getStorage(storage);
    if (!resolvedStorage) return false;

    try {
        resolvedStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
};

export const getStorageKeys = (storage) => {
    const resolvedStorage = getStorage(storage);
    if (!resolvedStorage) return [];

    try {
        return Object.keys(resolvedStorage);
    } catch {
        return [];
    }
};

export const getJsonStorageItem = (key, fallback = null, storage) => {
    const raw = getStorageItem(key, null, storage);
    if (!raw || raw === 'undefined') return fallback;

    try {
        return JSON.parse(raw);
    } catch {
        removeStorageItem(key, storage);
        return fallback;
    }
};

export const setJsonStorageItem = (key, value, storage) => {
    if (value === undefined || value === null) {
        return removeStorageItem(key, storage);
    }

    try {
        return setStorageItem(key, JSON.stringify(value), storage);
    } catch {
        return false;
    }
};

export const getSessionStorageItem = (key, fallback = null) =>
    getStorageItem(key, fallback, getDefaultSessionStorage());

export const setSessionStorageItem = (key, value) =>
    setStorageItem(key, value, getDefaultSessionStorage());

export const removeSessionStorageItem = (key) =>
    removeStorageItem(key, getDefaultSessionStorage());

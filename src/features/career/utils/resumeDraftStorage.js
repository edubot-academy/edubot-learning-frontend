const SESSION_KEY = 'careerSessionId';
const DRAFT_KEY = 'careerResumeDraftId';
const FORM_KEY = 'careerResumeFormData';
const GUEST_SCOPE = 'guest';

const safeGet = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSet = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore quota and storage access failures.
    }
};

const safeRemove = (key) => {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage access failures.
    }
};

const safeParse = (key) => {
    const raw = safeGet(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const getStorageScope = (user) => (user?.id ? `user:${user.id}` : GUEST_SCOPE);

const getScopedKey = (baseKey, user) => `${baseKey}:${getStorageScope(user)}`;

const migrateLegacyGuestValue = (baseKey, parser = (value) => value) => {
    const guestKey = getScopedKey(baseKey, null);
    const scopedValue = parser(guestKey);
    if (scopedValue) return scopedValue;

    const legacyValue = parser(baseKey);
    if (!legacyValue) return null;

    safeSet(guestKey, safeGet(baseKey));
    safeRemove(baseKey);
    return legacyValue;
};

const getScopedValue = (baseKey, user, parser, { allowGuestFallback = false, migrateGuestFallback = false } = {}) => {
    const scopedKey = getScopedKey(baseKey, user);
    const scopedValue = parser(scopedKey);
    if (scopedValue) return scopedValue;

    if (!user?.id) {
        return migrateLegacyGuestValue(baseKey, parser);
    }

    if (!allowGuestFallback) return null;

    const guestValue = migrateLegacyGuestValue(baseKey, parser);
    if (!guestValue) return null;

    if (migrateGuestFallback) {
        safeSet(scopedKey, safeGet(getScopedKey(baseKey, null)));
    }

    return guestValue;
};

export const getSavedCareerFormData = (user, options) =>
    getScopedValue(FORM_KEY, user, safeParse, options);

export const hasSavedCareerFormData = (user, options) =>
    Boolean(getSavedCareerFormData(user, options));

export const saveCareerFormData = (user, formData) => {
    safeSet(getScopedKey(FORM_KEY, user), JSON.stringify(formData));
};

export const getSavedCareerDraftId = (user) =>
    getScopedValue(DRAFT_KEY, user, safeGet);

export const saveCareerDraftId = (user, draftId) => {
    safeSet(getScopedKey(DRAFT_KEY, user), draftId);
};

export const clearCareerDraftStorage = (user, { includeFormData = false, includeSession = false } = {}) => {
    safeRemove(getScopedKey(DRAFT_KEY, user));

    if (includeFormData) {
        safeRemove(getScopedKey(FORM_KEY, user));
    }

    if (includeSession) {
        safeRemove(getScopedKey(SESSION_KEY, user));
    }
};

export const getOrCreateCareerSessionId = (user) => {
    const scopedKey = getScopedKey(SESSION_KEY, user);
    let id = safeGet(scopedKey);

    if (!id && !user?.id) {
        id = migrateLegacyGuestValue(SESSION_KEY, safeGet);
    }

    if (!id) {
        id =
            typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        safeSet(scopedKey, id);
    }

    return id;
};

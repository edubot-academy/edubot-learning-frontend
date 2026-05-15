export const SUPPORTED_LOCALES = ['ky', 'ru', 'en'];

export const DEFAULT_LOCALE = 'ky';

export const LOCALE_STORAGE_KEY = 'edubot_locale';

export const LOCALE_OPTIONS = [
    { value: 'ky', label: 'Kyrgyz', nativeLabel: 'Кыргызча' },
    { value: 'ru', label: 'Russian', nativeLabel: 'Русский' },
    { value: 'en', label: 'English', nativeLabel: 'English' },
];

const supportedLocaleSet = new Set(SUPPORTED_LOCALES);

export const isSupportedLocale = (value) =>
    typeof value === 'string' && supportedLocaleSet.has(value);

export const parseSupportedLocale = (value) => {
    if (typeof value !== 'string') return null;

    const rawLocale = value.split(';', 1)[0]?.trim().toLowerCase();
    if (!rawLocale) return null;

    const primaryLocale = rawLocale.split(/[-_]/, 1)[0];
    return isSupportedLocale(primaryLocale) ? primaryLocale : null;
};

export const normalizeLocale = (value, fallback = DEFAULT_LOCALE) =>
    parseSupportedLocale(value) ?? fallback;

export const getBrowserLocale = () => {
    if (typeof navigator === 'undefined') return null;
    return navigator.languages?.[0] ?? navigator.language ?? null;
};

export const getStoredLocale = (storage = globalThis.localStorage) => {
    try {
        return normalizeLocale(storage?.getItem(LOCALE_STORAGE_KEY));
    } catch {
        return DEFAULT_LOCALE;
    }
};

export const setStoredLocale = (locale, storage = globalThis.localStorage) => {
    const normalizedLocale = normalizeLocale(locale);
    try {
        storage?.setItem(LOCALE_STORAGE_KEY, normalizedLocale);
    } catch {
        // Ignore storage errors so locale selection never breaks core app flows.
    }
    return normalizedLocale;
};

export const resolveLocale = ({
    storedLocale,
    tenantLocale,
    browserLocale = getBrowserLocale(),
} = {}) => {
    const explicitStoredLocale = parseSupportedLocale(storedLocale);
    if (explicitStoredLocale) return explicitStoredLocale;

    const selectedTenantLocale = parseSupportedLocale(tenantLocale);
    if (selectedTenantLocale) return selectedTenantLocale;

    return normalizeLocale(browserLocale);
};

export const getResolvedLocale = ({ tenantLocale, browserLocale, storage } = {}) =>
    (() => {
        let storedLocale = null;
        try {
            storedLocale =
                storage?.getItem(LOCALE_STORAGE_KEY) ??
                globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY);
        } catch {
            storedLocale = null;
        }

        if (storedLocale !== null && storedLocale !== undefined) {
            return normalizeLocale(storedLocale);
        }

        return resolveLocale({ tenantLocale, browserLocale });
    })();

export const getLocaleLabel = (locale) => {
    const normalizedLocale = normalizeLocale(locale);
    const option = LOCALE_OPTIONS.find((item) => item.value === normalizedLocale);
    return option ? `${option.nativeLabel} (${option.value})` : normalizedLocale;
};

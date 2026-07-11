import { getStorageItem, setStorageItem } from '@shared/utils/storage';

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

export const getStoredLocale = (storage) => {
    return normalizeLocale(getStorageItem(LOCALE_STORAGE_KEY, DEFAULT_LOCALE, storage));
};

export const setStoredLocale = (locale, storage) => {
    const normalizedLocale = normalizeLocale(locale);
    setStorageItem(LOCALE_STORAGE_KEY, normalizedLocale, storage);
    return normalizedLocale;
};

export const resolveLocale = ({
    storedLocale,
    browserLocale = getBrowserLocale(),
} = {}) => {
    const explicitStoredLocale = parseSupportedLocale(storedLocale);
    if (explicitStoredLocale) return explicitStoredLocale;

    return normalizeLocale(browserLocale);
};

export const getResolvedLocale = ({ browserLocale, storage } = {}) =>
    (() => {
        const storedLocale =
            getStorageItem(LOCALE_STORAGE_KEY, null, storage) ??
            getStorageItem(LOCALE_STORAGE_KEY, null);

        if (storedLocale !== null && storedLocale !== undefined) {
            return normalizeLocale(storedLocale);
        }

        return resolveLocale({ browserLocale });
    })();

export const getLocaleLabel = (locale) => {
    const normalizedLocale = normalizeLocale(locale);
    const option = LOCALE_OPTIONS.find((item) => item.value === normalizedLocale);
    return option ? `${option.nativeLabel} (${option.value})` : normalizedLocale;
};

import { describe, expect, it, vi } from 'vitest';
import {
    DEFAULT_LOCALE,
    LOCALE_STORAGE_KEY,
    getResolvedLocale,
    getStoredLocale,
    normalizeLocale,
    parseSupportedLocale,
    resolveLocale,
    setStoredLocale,
} from './locale';

const createStorage = (initial = {}) => {
    const values = new Map(Object.entries(initial));
    return {
        getItem: vi.fn((key) => values.get(key) ?? null),
        setItem: vi.fn((key, value) => values.set(key, value)),
    };
};

describe('locale helpers', () => {
    it('parses supported canonical and regional locale values', () => {
        expect(parseSupportedLocale('ky')).toBe('ky');
        expect(parseSupportedLocale('ky-KG')).toBe('ky');
        expect(parseSupportedLocale('ru_RU')).toBe('ru');
        expect(parseSupportedLocale('en-US')).toBe('en');
    });

    it('rejects unsupported, empty, and malformed values', () => {
        expect(parseSupportedLocale('fr-FR')).toBeNull();
        expect(parseSupportedLocale('')).toBeNull();
        expect(parseSupportedLocale(null)).toBeNull();
        expect(normalizeLocale('fr-FR')).toBe(DEFAULT_LOCALE);
    });

    it('resolves locale from stored value before tenant and browser defaults', () => {
        expect(
            resolveLocale({
                storedLocale: 'ru',
                tenantLocale: 'en',
                browserLocale: 'ky-KG',
            })
        ).toBe('ru');
    });

    it('falls back through tenant, browser, then default locale', () => {
        expect(resolveLocale({ tenantLocale: 'en-US', browserLocale: 'ru-RU' })).toBe('en');
        expect(resolveLocale({ tenantLocale: 'fr-FR', browserLocale: 'ru-RU' })).toBe('ru');
        expect(resolveLocale({ tenantLocale: 'fr-FR', browserLocale: 'de-DE' })).toBe('ky');
    });

    it('persists only supported short locale codes', () => {
        const storage = createStorage();

        expect(setStoredLocale('ru-RU', storage)).toBe('ru');
        expect(storage.setItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, 'ru');

        expect(setStoredLocale('fr-FR', storage)).toBe('ky');
        expect(storage.setItem).toHaveBeenLastCalledWith(LOCALE_STORAGE_KEY, 'ky');
    });

    it('reads stored locale safely', () => {
        expect(getStoredLocale(createStorage({ [LOCALE_STORAGE_KEY]: 'en-US' }))).toBe('en');
        expect(
            getStoredLocale({
                getItem: () => {
                    throw new Error('blocked');
                },
            })
        ).toBe('ky');
    });

    it('uses injected storage when resolving the current app locale', () => {
        const storage = createStorage({ [LOCALE_STORAGE_KEY]: 'ru-RU' });

        expect(getResolvedLocale({ tenantLocale: 'en', browserLocale: 'ky-KG', storage })).toBe(
            'ru'
        );
    });
});

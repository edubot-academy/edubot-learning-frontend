import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    getJsonStorageItem,
    getStorageKeys,
    getStorageItem,
    getSessionStorageItem,
    removeStorageItem,
    setJsonStorageItem,
    setSessionStorageItem,
    setStorageItem,
} from './storage';

describe('storage utilities', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns fallback values when localStorage is unavailable', () => {
        vi.stubGlobal('window', undefined);

        expect(getStorageItem('missing', 'fallback')).toBe('fallback');
        expect(getJsonStorageItem('missing', { ok: true })).toEqual({ ok: true });
        expect(getStorageKeys()).toEqual([]);
        expect(setStorageItem('key', 'value')).toBe(false);
        expect(removeStorageItem('key')).toBe(false);
    });

    it('reads and writes plain string values', () => {
        const store = new Map();
        vi.stubGlobal('window', {
            localStorage: {
                getItem: vi.fn((key) => store.get(key) ?? null),
                setItem: vi.fn((key, value) => store.set(key, value)),
                removeItem: vi.fn((key) => store.delete(key)),
            },
        });

        expect(setStorageItem('theme', 'dark')).toBe(true);
        expect(getStorageItem('theme')).toBe('dark');

        expect(removeStorageItem('theme')).toBe(true);
        expect(getStorageItem('theme', 'light')).toBe('light');
    });

    it('removes corrupt JSON and returns the fallback', () => {
        const removeItem = vi.fn();
        vi.stubGlobal('window', {
            localStorage: {
                getItem: vi.fn(() => '{bad json'),
                setItem: vi.fn(),
                removeItem,
            },
        });

        expect(getJsonStorageItem('user', null)).toBeNull();
        expect(removeItem).toHaveBeenCalledWith('user');
    });

    it('serializes JSON values', () => {
        const setItem = vi.fn();
        vi.stubGlobal('window', {
            localStorage: {
                getItem: vi.fn(),
                setItem,
                removeItem: vi.fn(),
            },
        });

        expect(setJsonStorageItem('cart', [{ id: 1 }])).toBe(true);
        expect(setItem).toHaveBeenCalledWith('cart', '[{"id":1}]');
    });

    it('lists available storage keys', () => {
        vi.stubGlobal('window', {
            localStorage: {
                alpha: '1',
                beta: '2',
                getItem: vi.fn(),
                setItem: vi.fn(),
                removeItem: vi.fn(),
            },
        });

        expect(getStorageKeys()).toEqual(expect.arrayContaining(['alpha', 'beta']));
    });

    it('supports explicitly injected storage areas', () => {
        const storage = {
            getItem: vi.fn(() => 'ru'),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        };

        expect(getStorageItem('locale', 'ky', storage)).toBe('ru');
        expect(setStorageItem('locale', 'en', storage)).toBe(true);
        expect(storage.setItem).toHaveBeenCalledWith('locale', 'en');
    });

    it('reads and writes sessionStorage through explicit helpers', () => {
        const store = new Map();
        vi.stubGlobal('window', {
            sessionStorage: {
                getItem: vi.fn((key) => store.get(key) ?? null),
                setItem: vi.fn((key, value) => store.set(key, value)),
                removeItem: vi.fn((key) => store.delete(key)),
            },
        });

        expect(setSessionStorageItem('expiresAt', '2026-01-01T00:10:00Z')).toBe(true);
        expect(getSessionStorageItem('expiresAt')).toBe('2026-01-01T00:10:00Z');
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import api from './client';
import { LOCALE_STORAGE_KEY } from '../../i18n/locale';

const runRequestInterceptor = (config = {}) => {
    const interceptor = api.interceptors.request.handlers.find((handler) => handler.fulfilled);
    return interceptor.fulfilled({
        method: 'get',
        headers: {},
        ...config,
    });
};

describe('API client locale headers', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('sends the stored UI locale as Accept-Language', () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => (key === LOCALE_STORAGE_KEY ? 'ru-RU' : null)),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        });

        const config = runRequestInterceptor();

        expect(config.headers['Accept-Language']).toBe('ru');
    });

    it('falls back to Kyrgyz for unsupported stored locales', () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => (key === LOCALE_STORAGE_KEY ? 'fr-FR' : null)),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        });

        const config = runRequestInterceptor();

        expect(config.headers['Accept-Language']).toBe('ky');
    });
});

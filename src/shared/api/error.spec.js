import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { API_ERROR_CODES, getApiErrorCode, parseApiError } from './error';

describe('API error helpers', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('ky');
    });

    it('extracts stable error codes from top-level and nested payloads', () => {
        expect(getApiErrorCode({ response: { data: { code: 'TOP_LEVEL' } } })).toBe('TOP_LEVEL');
        expect(getApiErrorCode({ response: { data: { error: { code: 'NESTED' } } } })).toBe(
            'NESTED'
        );
    });

    it('uses localized messages for known stable error codes', () => {
        const parsed = parseApiError({
            response: {
                status: 403,
                data: {
                    code: API_ERROR_CODES.CSRF_TOKEN_INVALID,
                    message: 'CSRF token missing or invalid',
                },
            },
        });

        expect(parsed).toMatchObject({
            status: 403,
            code: API_ERROR_CODES.CSRF_TOKEN_INVALID,
            message: 'Сессия коопсуздугу жаңыртылды. Кайра аракет кылыңыз.',
        });
    });

    it('falls back to backend message for unknown codes', () => {
        expect(
            parseApiError({
                response: {
                    data: {
                        code: 'UNKNOWN_CODE',
                        message: 'Backend message',
                    },
                },
            }).message
        ).toBe('Backend message');
    });
});

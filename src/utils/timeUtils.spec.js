import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatShortDate, getDateLocale } from './timeUtils';

describe('timeUtils', () => {
    it('formats valid dates and returns a dash for empty or invalid dates', () => {
        expect(formatDate(null, 'en-US')).toBe('—');
        expect(formatDate('not-a-date', 'en-US')).toBe('—');
        expect(formatDate('2026-07-13T09:30:00.000Z', 'en-US')).toContain('2026');
    });

    it('passes date formatting options through to the platform formatter', () => {
        expect(
            formatDate('2026-07-13T09:30:00.000Z', 'en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
        ).toContain('Jul');
    });

    it('formats date-time values with a configurable fallback', () => {
        expect(formatDateTime(null, 'en-US')).toBe('');
        expect(formatDateTime('not-a-date', 'en-US', {}, 'n/a')).toBe('n/a');
        expect(formatDateTime('2026-07-13T09:30:00.000Z', 'en-US')).toContain('2026');
    });

    it('normalizes app language codes for short dates', () => {
        expect(getDateLocale('en')).toBe('en-US');
        expect(getDateLocale('ru')).toBe('ru-RU');
        expect(getDateLocale('ky')).toBe('ky-KG');
        expect(formatShortDate('2026-07-13T09:30:00.000Z', 'en')).toContain('2026');
    });
});

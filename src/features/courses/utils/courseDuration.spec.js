import { describe, expect, it } from 'vitest';
import {
    getLessonDurationSeconds,
    getSectionDurationMinutes,
    getSectionsDurationMinutes,
} from './courseDuration';

describe('courseDuration', () => {
    it('sums lesson seconds and rounds the final course total once', () => {
        const sections = [
            {
                lessons: [
                    { duration: 933 },
                    { duration: 482 },
                ],
            },
            {
                lessons: [{ duration: 550 }],
            },
        ];

        expect(getSectionsDurationMinutes(sections)).toBe(33);
    });

    it('does not inflate totals by rounding every lesson up', () => {
        const sections = [
            {
                lessons: Array.from({ length: 3 }, () => ({ duration: 61 })),
            },
        ];

        expect(getSectionsDurationMinutes(sections)).toBe(3);
    });

    it('falls back to section duration minutes when lessons are unavailable', () => {
        expect(getSectionDurationMinutes({ durationMinutes: '45', lessons: [] })).toBe(45);
        expect(
            getSectionsDurationMinutes([
                { durationMinutes: '45', lessons: [] },
                { durationMinutes: 15 },
            ])
        ).toBe(60);
    });

    it('ignores invalid lesson durations', () => {
        expect(getLessonDurationSeconds({ duration: 'bad' })).toBe(0);
        expect(getLessonDurationSeconds({ duration: -10 })).toBe(0);
        expect(getLessonDurationSeconds({ duration: '90' })).toBe(90);
    });

    it('handles missing sections defensively', () => {
        expect(getSectionsDurationMinutes(null)).toBe(0);
    });
});

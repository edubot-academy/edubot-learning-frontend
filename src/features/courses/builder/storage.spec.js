import { beforeEach, describe, expect, it } from 'vitest';
import { clearDraftCourse, loadDraftCourse, saveDraftCourse } from './storage';

describe('course builder draft storage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('saves, loads, and clears the draft course payload', () => {
        const draft = {
            courseInfo: { title: 'Draft course' },
            courseId: 42,
            step: 2,
            savedAt: '2026-07-11T00:00:00.000Z',
        };

        saveDraftCourse(draft);

        expect(loadDraftCourse()).toEqual(draft);

        clearDraftCourse();

        expect(loadDraftCourse()).toBeNull();
    });

    it('clears corrupt draft JSON on load', () => {
        localStorage.setItem('draftCourse', '{bad json');

        expect(loadDraftCourse()).toBeNull();
        expect(localStorage.getItem('draftCourse')).toBeNull();
    });
});

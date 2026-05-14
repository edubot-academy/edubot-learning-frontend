import { describe, expect, it } from 'vitest';
import {
    COURSE_LIFECYCLE_STATES,
    getCourseLifecycleMeta,
    getCourseLifecycleState,
} from './courseLifecycle';

describe('courseLifecycle', () => {
    it('treats approved or published courses as published', () => {
        expect(getCourseLifecycleState({ status: 'approved' })).toBe(COURSE_LIFECYCLE_STATES.PUBLISHED);
        expect(getCourseLifecycleState({ isPublished: true })).toBe(COURSE_LIFECYCLE_STATES.PUBLISHED);
    });

    it('maps review and draft states to stable action labels', () => {
        expect(getCourseLifecycleMeta({ status: 'pending' })).toMatchObject({
            state: COURSE_LIFECYCLE_STATES.PENDING,
            primaryActionLabel: 'Текшерүү',
        });
        expect(getCourseLifecycleMeta({ status: 'rejected' })).toMatchObject({
            state: COURSE_LIFECYCLE_STATES.REJECTED,
            primaryActionLabel: 'Оңдоо',
        });
        expect(getCourseLifecycleMeta({})).toMatchObject({
            state: COURSE_LIFECYCLE_STATES.DRAFT,
            primaryActionLabel: 'Өзгөртүү',
        });
    });
});

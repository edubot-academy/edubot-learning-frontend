import { describe, expect, it } from 'vitest';
import {
    COURSE_STATUS_STRATEGY,
    COURSE_VISIBILITY_OPTIONS,
    getCourseStatusLabel,
    getCourseVisibilityLabel,
    getNormalizedCourseStatus,
} from './coursePresentation';

const t = (key, options = {}) => options.defaultValue || key;

describe('coursePresentation', () => {
    it('normalizes company course statuses with the existing fallback rules', () => {
        expect(getNormalizedCourseStatus({ status: 'PENDING_REVIEW' })).toBe('pending_review');
        expect(getNormalizedCourseStatus({ isPublished: true })).toBe('published');
        expect(getNormalizedCourseStatus({ isPublished: false })).toBe('draft');
        expect(getNormalizedCourseStatus({})).toBe('unknown');
    });

    it('normalizes tenant detail course statuses with approval fallback rules', () => {
        expect(
            getNormalizedCourseStatus(
                { published: true },
                COURSE_STATUS_STRATEGY.TENANT_DETAIL
            )
        ).toBe('published');
        expect(
            getNormalizedCourseStatus(
                { approved: true },
                COURSE_STATUS_STRATEGY.TENANT_DETAIL
            )
        ).toBe('approved');
        expect(getNormalizedCourseStatus({}, COURSE_STATUS_STRATEGY.TENANT_DETAIL)).toBe('draft');
    });

    it('normalizes instructor student course statuses with pending fallback rules', () => {
        expect(
            getNormalizedCourseStatus(
                { status: 'approved' },
                COURSE_STATUS_STRATEGY.INSTRUCTOR_STUDENTS
            )
        ).toBe('approved');
        expect(
            getNormalizedCourseStatus(
                { status: 'published' },
                COURSE_STATUS_STRATEGY.INSTRUCTOR_STUDENTS
            )
        ).toBe('pending');
    });

    it('formats course status and visibility labels', () => {
        expect(getCourseStatusLabel({ status: 'pending_review' }, t)).toBe('pending review');
        expect(getCourseVisibilityLabel('TENANT_ONLY', t)).toBe('TENANT ONLY');
        expect(COURSE_VISIBILITY_OPTIONS).toEqual(['PUBLIC', 'PRIVATE', 'TENANT_ONLY']);
    });
});

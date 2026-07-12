import { describe, expect, it } from 'vitest';
import {
    COURSE_WORKFLOWS,
    getCourseStudentsCount,
    getCourseFromMutationResponse,
    getInstructorCourseEditTarget,
    getInstructorCourseViewTarget,
    getCourseWorkflow,
    getPendingReviewCourseCount,
    getPublishedCourseCount,
    getUnpublishedCourseCount,
    isDeliveryCourse,
    isDraftCourse,
    markInstructorCoursePending,
    selectAiEnabledCourses,
    selectApprovedPublishedCourses,
    toInstructorCourseList,
    upsertInstructorCourse,
} from './instructorCourses';

describe('instructorCourses utils', () => {
    it('classifies course workflows by type', () => {
        expect(isDeliveryCourse({ courseType: 'offline' })).toBe(true);
        expect(isDeliveryCourse({ type: 'online_live' })).toBe(true);
        expect(isDeliveryCourse('video')).toBe(false);
        expect(getCourseWorkflow({ courseType: 'offline' })).toBe(COURSE_WORKFLOWS.DELIVERY);
        expect(getCourseWorkflow({ courseType: 'video' })).toBe(COURSE_WORKFLOWS.VIDEO);
    });

    it('derives instructor course route targets', () => {
        expect(getInstructorCourseViewTarget({ id: 10, courseType: 'offline' })).toBe(
            '/instructor?tab=groups&courseId=10'
        );
        expect(getInstructorCourseViewTarget({ id: 11, courseType: 'video' })).toBe('/courses/11');
        expect(getInstructorCourseEditTarget({ id: 12 })).toBe('/instructor/courses/edit/12');
    });

    it('detects draft courses using existing submit rules', () => {
        expect(isDraftCourse({ status: 'draft' })).toBe(true);
        expect(isDraftCourse({})).toBe(true);
        expect(isDraftCourse({ status: 'pending' })).toBe(false);
    });

    it('normalizes instructor course list response shapes', () => {
        expect(toInstructorCourseList([{ id: 1 }])).toEqual([{ id: 1 }]);
        expect(toInstructorCourseList({ courses: [{ id: 2 }] })).toEqual([{ id: 2 }]);
        expect(toInstructorCourseList({ items: [{ id: 3 }] })).toEqual([{ id: 3 }]);
        expect(toInstructorCourseList(null)).toEqual([]);
    });

    it('extracts a course from supported mutation response shapes', () => {
        expect(getCourseFromMutationResponse({ course: { id: 1 } })).toEqual({ id: 1 });
        expect(getCourseFromMutationResponse({ id: 2 })).toEqual({ id: 2 });
        expect(getCourseFromMutationResponse({ data: { id: 3 } })).toBeNull();
        expect(getCourseFromMutationResponse(null)).toBeNull();
    });

    it('prepends new courses when upserting', () => {
        expect(
            upsertInstructorCourse([{ id: 1, title: 'Existing' }], {
                course: { id: 2, title: 'New' },
            })
        ).toEqual({
            courses: [
                { id: 2, title: 'New' },
                { id: 1, title: 'Existing' },
            ],
            changed: true,
        });
    });

    it('merges existing courses when upserting', () => {
        expect(
            upsertInstructorCourse(
                [
                    { id: 1, title: 'Existing', status: 'draft' },
                    { id: 2, title: 'Other' },
                ],
                { id: '1', status: 'approved' }
            )
        ).toEqual({
            courses: [
                { id: '1', title: 'Existing', status: 'approved' },
                { id: 2, title: 'Other' },
            ],
            changed: true,
        });
    });

    it('leaves the list unchanged for invalid upsert responses', () => {
        const courses = [{ id: 1, title: 'Existing' }];

        expect(upsertInstructorCourse(courses, { message: 'ok' })).toEqual({
            courses,
            changed: false,
        });
    });

    it('marks a course pending locally', () => {
        expect(
            markInstructorCoursePending(
                [
                    { id: 1, status: 'approved', isPublished: true },
                    { id: 2, status: 'approved', isPublished: true },
                ],
                '1'
            )
        ).toEqual([
            { id: 1, status: 'pending', isPublished: false },
            { id: 2, status: 'approved', isPublished: true },
        ]);
    });

    it('selects AI-enabled courses using tenant feature flags', () => {
        expect(
            selectAiEnabledCourses([
                {
                    id: 1,
                    aiAssistantEnabled: true,
                },
                {
                    id: 2,
                    aiAssistantEnabled: true,
                    tenantFeatureAvailability: { aiAssistant: false },
                },
                {
                    id: 3,
                    aiAssistantEnabled: false,
                },
            ])
        ).toEqual([
            {
                id: 1,
                aiAssistantEnabled: true,
            },
        ]);
    });

    it('selects approved published courses', () => {
        expect(
            selectApprovedPublishedCourses([
                { id: 1, status: 'approved', isPublished: true },
                { id: 2, status: 'approved', isPublished: false },
                { id: 3, status: 'pending', isPublished: true },
            ])
        ).toEqual([{ id: 1, status: 'approved', isPublished: true }]);
    });

    it('keeps published, unpublished, and pending-review counts distinct', () => {
        const courses = [
            { id: 1, status: 'approved', isPublished: true },
            { id: 2, status: 'pending', isPublished: false },
            { id: 3, status: 'draft', isPublished: false },
        ];

        expect(getPublishedCourseCount(courses)).toBe(1);
        expect(getUnpublishedCourseCount(courses)).toBe(2);
        expect(getPendingReviewCourseCount(courses)).toBe(1);
    });

    it('sums course student counts defensively', () => {
        expect(
            getCourseStudentsCount([
                { id: 1, studentsCount: 3 },
                { id: 2, studentsCount: '4' },
                { id: 3 },
            ])
        ).toBe(7);
    });
});

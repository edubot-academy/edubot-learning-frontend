import { describe, expect, it } from 'vitest';
import { COURSE_LIFECYCLE_STATES } from './courseLifecycle';
import { COURSE_WORKFLOWS } from './instructorCourses';
import {
    filterInstructorCourseDisplayItems,
    getInstructorCourseDisplayData,
    getInstructorCourseFilters,
    getInstructorCourseLifecycleCounts,
    getInstructorCourseWorkflowCounts,
    getInstructorCourseWorkflowFilters,
    toInstructorCourseDisplayItems,
} from './instructorCourseDisplay';

const t = (key, params = {}) => {
    if (key === 'instructorDashboard.coursesPage.fallbacks.courseWithId') {
        return `Course #${params.id}`;
    }
    if (key === 'instructorDashboard.coursesPage.price.value') {
        return `$${params.value}`;
    }
    return key;
};

describe('instructorCourseDisplay utils', () => {
    it('builds display data with fallbacks and derived state', () => {
        expect(
            getInstructorCourseDisplayData(
                {
                    id: 12,
                    title: '  ',
                    price: '150',
                    courseType: 'offline',
                    status: 'pending',
                    coverImageUrl: ' /cover.png ',
                },
                { fullName: 'Instructor Name' },
                t
            )
        ).toMatchObject({
            courseId: 12,
            coverImageUrl: '/cover.png',
            instructorName: 'Instructor Name',
            priceLabel: '$150',
            title: 'Course #12',
            workflow: COURSE_WORKFLOWS.DELIVERY,
            lifecycle: {
                state: COURSE_LIFECYCLE_STATES.PENDING,
                label: 'instructorDashboard.coursesPage.lifecycle.pending',
            },
        });
    });

    it('falls back when instructor and price are missing', () => {
        expect(
            getInstructorCourseDisplayData(
                { courseId: 30, title: 'Video Course', courseType: 'video' },
                null,
                t
            )
        ).toMatchObject({
            courseId: 30,
            instructorName: 'instructorDashboard.coursesPage.fallbacks.noInstructor',
            priceLabel: 'instructorDashboard.coursesPage.price.missing',
            title: 'Video Course',
            workflow: COURSE_WORKFLOWS.VIDEO,
        });
    });

    it('creates localized status and workflow filters', () => {
        expect(getInstructorCourseFilters(t).map((filter) => filter.value)).toEqual([
            'all',
            COURSE_LIFECYCLE_STATES.DRAFT,
            COURSE_LIFECYCLE_STATES.PENDING,
            COURSE_LIFECYCLE_STATES.PUBLISHED,
            COURSE_LIFECYCLE_STATES.REJECTED,
        ]);
        expect(getInstructorCourseWorkflowFilters(t).map((filter) => filter.value)).toEqual([
            'all',
            COURSE_WORKFLOWS.VIDEO,
            COURSE_WORKFLOWS.DELIVERY,
        ]);
    });

    it('counts lifecycle states and workflows from display items', () => {
        const items = toInstructorCourseDisplayItems(
            [
                { id: 1, title: 'Video', courseType: 'video', status: 'approved', isPublished: true },
                { id: 2, title: 'Offline', courseType: 'offline', status: 'pending' },
                { id: 3, title: 'Draft', courseType: 'video', status: 'draft' },
            ],
            null,
            t
        );

        expect(getInstructorCourseLifecycleCounts(items)).toMatchObject({
            [COURSE_LIFECYCLE_STATES.PUBLISHED]: 1,
            [COURSE_LIFECYCLE_STATES.PENDING]: 1,
            [COURSE_LIFECYCLE_STATES.DRAFT]: 1,
        });
        expect(getInstructorCourseWorkflowCounts(items)).toEqual({
            [COURSE_WORKFLOWS.VIDEO]: 2,
            [COURSE_WORKFLOWS.DELIVERY]: 1,
        });
    });

    it('filters by query, lifecycle state, and workflow', () => {
        const items = toInstructorCourseDisplayItems(
            [
                {
                    id: 1,
                    title: 'React Basics',
                    courseType: 'video',
                    status: 'approved',
                    isPublished: true,
                    instructor: { fullName: 'Ada Lovelace' },
                },
                {
                    id: 2,
                    title: 'Offline Speaking',
                    courseType: 'offline',
                    status: 'pending',
                    instructor: { fullName: 'Grace Hopper' },
                },
            ],
            null,
            t
        );

        expect(
            filterInstructorCourseDisplayItems(items, {
                query: 'grace',
                statusFilter: COURSE_LIFECYCLE_STATES.PENDING,
                typeFilter: COURSE_WORKFLOWS.DELIVERY,
            }).map((item) => item.display.courseId)
        ).toEqual([2]);

        expect(
            filterInstructorCourseDisplayItems(items, {
                query: 'react',
                statusFilter: COURSE_LIFECYCLE_STATES.PENDING,
                typeFilter: 'all',
            })
        ).toEqual([]);
    });
});

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { COURSE_LIFECYCLE_STATES } from '@features/instructor-dashboard/utils/courseLifecycle';
import { COURSE_WORKFLOWS } from '@features/instructor-dashboard/utils/instructorCourses';
import { useInstructorCoursePageModel } from './useInstructorCoursePageModel';

const t = (key, params = {}) => {
    if (key === 'instructorDashboard.coursesPage.price.value') {
        return `$${params.value}`;
    }
    return key;
};

const renderPageModel = (overrides = {}) =>
    renderHook(() =>
        useInstructorCoursePageModel({
            courses: [
                {
                    id: 1,
                    title: 'React Basics',
                    courseType: 'video',
                    status: 'approved',
                    isPublished: true,
                    instructor: { fullName: 'Ada Lovelace' },
                    price: 100,
                },
                {
                    id: 2,
                    title: 'Offline Speaking',
                    courseType: 'offline',
                    status: 'pending',
                    instructor: { fullName: 'Grace Hopper' },
                    price: '',
                },
            ],
            error: null,
            i18nLanguage: 'en',
            loading: false,
            t,
            user: { fullName: 'Fallback Instructor' },
            ...overrides,
        })
    );

describe('useInstructorCoursePageModel', () => {
    it('builds display counts and filters', () => {
        const { result } = renderPageModel();

        expect(result.current.workflowCounts).toEqual({
            [COURSE_WORKFLOWS.VIDEO]: 1,
            [COURSE_WORKFLOWS.DELIVERY]: 1,
        });
        expect(result.current.lifecycleCounts).toMatchObject({
            [COURSE_LIFECYCLE_STATES.PUBLISHED]: 1,
            [COURSE_LIFECYCLE_STATES.PENDING]: 1,
        });
        expect(result.current.filteredCourses.map((item) => item.display.courseId)).toEqual([1, 2]);
        expect(result.current.courseFilters.map((filter) => filter.value)).toContain(
            COURSE_LIFECYCLE_STATES.PENDING
        );
        expect(result.current.courseTypeFilters.map((filter) => filter.value)).toContain(
            COURSE_WORKFLOWS.DELIVERY
        );
    });

    it('filters courses through page state setters', () => {
        const { result } = renderPageModel();

        act(() => {
            result.current.setQuery('grace');
            result.current.setStatusFilter(COURSE_LIFECYCLE_STATES.PENDING);
            result.current.setTypeFilter(COURSE_WORKFLOWS.DELIVERY);
        });

        expect(result.current.filteredCourses.map((item) => item.display.courseId)).toEqual([2]);
        expect(result.current.query).toBe('grace');
        expect(result.current.statusFilter).toBe(COURSE_LIFECYCLE_STATES.PENDING);
        expect(result.current.typeFilter).toBe(COURSE_WORKFLOWS.DELIVERY);
    });

    it('does not update last-loaded time while loading or errored', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-12T12:34:00Z'));

        const loadingResult = renderPageModel({ loading: true }).result;
        const errorResult = renderPageModel({ error: new Error('load failed') }).result;

        expect(loadingResult.current.lastLoadedLabel).toBe('-');
        expect(errorResult.current.lastLoadedLabel).toBe('-');

        vi.useRealTimers();
    });
});

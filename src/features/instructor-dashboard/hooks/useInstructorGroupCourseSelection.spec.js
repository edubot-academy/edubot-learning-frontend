import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useInstructorGroupCourseSelection } from './useInstructorGroupCourseSelection';

const offlineCourse = {
    id: 1,
    courseType: 'offline',
    status: 'approved',
    isPublished: true,
    title: 'Offline Course',
};

const liveCourse = {
    id: 2,
    courseType: 'online_live',
    status: 'approved',
    isPublished: true,
    title: 'Live Course',
};

const pendingDeliveryCourse = {
    id: 3,
    courseType: 'offline',
    status: 'pending',
    isPublished: false,
    title: 'Pending Delivery Course',
};

const videoCourse = {
    id: 4,
    courseType: 'video',
    status: 'approved',
    isPublished: true,
    title: 'Video Course',
};

describe('useInstructorGroupCourseSelection', () => {
    it('selects the requested eligible delivery course', () => {
        const { result } = renderHook(() =>
            useInstructorGroupCourseSelection({
                courses: [offlineCourse, liveCourse],
                requestedCourseId: '2',
            })
        );

        expect(result.current.deliveryCourses.map((course) => course.id)).toEqual([1, 2]);
        expect(result.current.selectedCourseId).toBe('2');
        expect(result.current.selectedCourse).toEqual(liveCourse);
    });

    it('falls back to the first eligible delivery course when the requested course is invalid', () => {
        const { result } = renderHook(() =>
            useInstructorGroupCourseSelection({
                courses: [offlineCourse, liveCourse],
                requestedCourseId: '99',
            })
        );

        expect(result.current.selectedCourseId).toBe('1');
        expect(result.current.selectedCourse).toEqual(offlineCourse);
    });

    it('exposes pending delivery courses separately from eligible courses', () => {
        const { result } = renderHook(() =>
            useInstructorGroupCourseSelection({
                courses: [offlineCourse, pendingDeliveryCourse, videoCourse],
            })
        );

        expect(result.current.deliveryCourses.map((course) => course.id)).toEqual([1]);
        expect(result.current.pendingDeliveryCourses.map((course) => course.id)).toEqual([3]);
    });

    it('allows manual selection changes to update the selected course', () => {
        const { result } = renderHook(() =>
            useInstructorGroupCourseSelection({
                courses: [offlineCourse, liveCourse],
            })
        );

        act(() => {
            result.current.setSelectedCourseId('2');
        });

        expect(result.current.selectedCourseId).toBe('2');
        expect(result.current.selectedCourse).toEqual(liveCourse);
    });

    it('clears selection when no eligible delivery courses exist', () => {
        const { result } = renderHook(() =>
            useInstructorGroupCourseSelection({
                courses: [videoCourse],
                requestedCourseId: '4',
            })
        );

        expect(result.current.deliveryCourses).toEqual([]);
        expect(result.current.selectedCourseId).toBe('');
        expect(result.current.selectedCourse).toBeNull();
    });
});

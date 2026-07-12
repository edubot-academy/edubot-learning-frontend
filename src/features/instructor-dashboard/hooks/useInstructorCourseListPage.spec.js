import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchInstructorCourses } from '@features/courses/api/instructorCourses';
import { useInstructorCourseListPage } from './useInstructorCourseListPage';

vi.mock('@features/courses/api/instructorCourses', () => ({
    fetchInstructorCourses: vi.fn(),
}));

const createDeferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
    });

    return { promise, reject, resolve };
};

describe('useInstructorCourseListPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads instructor courses using the instructor list response adapter', async () => {
        fetchInstructorCourses.mockResolvedValueOnce({ items: [{ id: 1, title: 'Course' }] });

        const { result } = renderHook(() =>
            useInstructorCourseListPage({ role: 'instructor' })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchInstructorCourses).toHaveBeenCalledWith({
            page: 1,
            limit: 100,
            status: 'all',
        });
        expect(result.current.courses).toEqual([{ id: 1, title: 'Course' }]);
        expect(result.current.error).toBeNull();
    });

    it('ignores stale course load responses', async () => {
        const firstLoad = createDeferred();
        const secondLoad = createDeferred();
        fetchInstructorCourses
            .mockReturnValueOnce(firstLoad.promise)
            .mockReturnValueOnce(secondLoad.promise);

        const { result } = renderHook(() =>
            useInstructorCourseListPage({ role: 'instructor' })
        );

        await waitFor(() => expect(result.current.loading).toBe(true));

        act(() => {
            result.current.refresh();
        });

        await act(async () => {
            secondLoad.resolve({ courses: [{ id: 2, title: 'Fresh' }] });
            await secondLoad.promise;
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.courses).toEqual([{ id: 2, title: 'Fresh' }]);

        await act(async () => {
            firstLoad.resolve({ courses: [{ id: 1, title: 'Stale' }] });
            await firstLoad.promise;
        });

        expect(result.current.courses).toEqual([{ id: 2, title: 'Fresh' }]);
    });

    it('clears local state for non-instructor users without fetching', async () => {
        const { result } = renderHook(() =>
            useInstructorCourseListPage({ role: 'student' })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchInstructorCourses).not.toHaveBeenCalled();
        expect(result.current.courses).toEqual([]);
        expect(result.current.error).toBeNull();
    });
});

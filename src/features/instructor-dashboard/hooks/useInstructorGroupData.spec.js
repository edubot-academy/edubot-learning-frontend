import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    fetchCourseDeliveryContext,
    fetchCourseGroups,
} from '@features/courseGroups/api';
import { fetchGroupRoster } from '@features/courseGroups/roster';
import { toast } from 'react-hot-toast';
import { useInstructorGroupData } from './useInstructorGroupData';

vi.mock('@features/courseGroups/api', () => ({
    fetchCourseDeliveryContext: vi.fn(),
    fetchCourseGroups: vi.fn(),
}));

vi.mock('@features/courseGroups/roster', () => ({
    fetchGroupRoster: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
    },
}));

const t = (key) => key;
const createDeferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((nextResolve, nextReject) => {
        resolve = nextResolve;
        reject = nextReject;
    });
    return { promise, reject, resolve };
};

describe('useInstructorGroupData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchCourseGroups.mockResolvedValue([]);
        fetchCourseDeliveryContext.mockResolvedValue(null);
        fetchGroupRoster.mockResolvedValue([]);
    });

    it('loads groups and delivery context for a selected course', async () => {
        const groups = [{ id: 10, deliveryMode: 'group', name: 'A1' }];
        const context = { readiness: { issues: ['session_schedule_required'] } };
        fetchCourseGroups.mockResolvedValue({ data: groups });
        fetchCourseDeliveryContext.mockResolvedValue(context);

        const { result } = renderHook(() => useInstructorGroupData({ t }));

        await act(async () => {
            await result.current.loadGroups('7');
        });

        expect(fetchCourseGroups).toHaveBeenCalledWith({ courseId: 7 });
        expect(fetchCourseDeliveryContext).toHaveBeenCalledWith(7);
        expect(result.current.groups).toEqual(groups);
        expect(result.current.deliveryContext).toEqual(context);
        expect(result.current.loadingGroups).toBe(false);
    });

    it('clears loaded state when no course is selected', async () => {
        fetchCourseGroups.mockResolvedValue([{ id: 10, deliveryMode: 'group' }]);
        const { result } = renderHook(() => useInstructorGroupData({ t }));

        await act(async () => {
            await result.current.loadGroups('7');
        });
        await act(async () => {
            await result.current.loadGroups('');
        });

        expect(result.current.groups).toEqual([]);
        expect(result.current.deliveryContext).toBeNull();
        expect(result.current.individualStudentsByGroupId).toEqual({});
    });

    it('keeps groups when delivery context loading fails independently', async () => {
        const groups = [{ id: 10, deliveryMode: 'group', name: 'A1' }];
        fetchCourseGroups.mockResolvedValue(groups);
        fetchCourseDeliveryContext.mockRejectedValue(new Error('context failed'));

        const { result } = renderHook(() => useInstructorGroupData({ t }));

        await act(async () => {
            await result.current.loadGroups('7');
        });

        expect(result.current.groups).toEqual(groups);
        expect(result.current.deliveryContext).toBeNull();
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('clears groups and reports a toast when group loading fails', async () => {
        fetchCourseGroups.mockRejectedValue(new Error('groups failed'));

        const { result } = renderHook(() => useInstructorGroupData({ t }));

        await act(async () => {
            await result.current.loadGroups('7');
        });

        expect(result.current.groups).toEqual([]);
        expect(result.current.deliveryContext).toBeNull();
        expect(result.current.individualStudentsByGroupId).toEqual({});
        expect(toast.error).toHaveBeenCalledWith(
            'instructorDashboard.groupForm.toasts.loadFailed'
        );
    });

    it('ignores stale group load responses after a newer course is selected', async () => {
        const firstRequest = createDeferred();
        const secondRequest = createDeferred();
        fetchCourseGroups.mockImplementation(({ courseId }) =>
            courseId === 7 ? firstRequest.promise : secondRequest.promise
        );
        fetchCourseDeliveryContext.mockImplementation((courseId) =>
            Promise.resolve({ courseId })
        );

        const { result } = renderHook(() => useInstructorGroupData({ t }));
        let firstLoad;
        let secondLoad;

        act(() => {
            firstLoad = result.current.loadGroups('7');
        });
        act(() => {
            secondLoad = result.current.loadGroups('8');
        });

        await act(async () => {
            secondRequest.resolve([{ id: 80, deliveryMode: 'group' }]);
            await secondLoad;
        });

        expect(result.current.groups).toEqual([{ id: 80, deliveryMode: 'group' }]);
        expect(result.current.deliveryContext).toEqual({ courseId: 8 });

        await act(async () => {
            firstRequest.resolve([{ id: 70, deliveryMode: 'group' }]);
            await firstLoad;
        });

        expect(result.current.groups).toEqual([{ id: 80, deliveryMode: 'group' }]);
        expect(result.current.deliveryContext).toEqual({ courseId: 8 });
        expect(result.current.loadingGroups).toBe(false);
    });

    it('loads the first roster row for individual groups only', async () => {
        const individualStudent = {
            id: 50,
            email: 'student@example.com',
            fullName: 'Ada Student',
        };
        fetchCourseGroups.mockResolvedValue([
            { id: 10, deliveryMode: 'individual' },
            { id: 11, deliveryMode: 'group' },
        ]);
        fetchGroupRoster.mockResolvedValue([individualStudent]);

        const { result } = renderHook(() => useInstructorGroupData({ t }));

        await act(async () => {
            await result.current.loadGroups('7');
        });

        await waitFor(() => {
            expect(result.current.individualStudentsByGroupId).toEqual({
                10: individualStudent,
            });
        });
        expect(fetchGroupRoster).toHaveBeenCalledTimes(1);
        expect(fetchGroupRoster).toHaveBeenCalledWith({
            groupId: 10,
            limit: 1,
            page: 1,
        });
    });
});

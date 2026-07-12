import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGroupRoster } from '@features/courseGroups/roster';
import { toast } from 'react-hot-toast';
import { useInstructorGroupModals } from './useInstructorGroupModals';

vi.mock('@features/courseGroups/roster', () => ({
    fetchGroupRoster: vi.fn(),
}));

vi.mock('@features/users/api', () => ({
    fetchUsers: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
    },
}));

const t = (key) => key;
const selectedCourse = {
    id: 7,
    title: 'Live Course',
    courseType: 'online_live',
};
const groups = [
    {
        id: 30,
        code: 'LIVE-G01',
        deliveryMode: 'group',
        name: 'Live Group',
        scheduleBlocks: [{ day: 'mon', startTime: '09:00', endTime: '10:00' }],
        status: 'active',
    },
];
const createDeferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((nextResolve, nextReject) => {
        resolve = nextResolve;
        reject = nextReject;
    });
    return { promise, reject, resolve };
};

const renderModalsHook = (overrides = {}) =>
    renderHook(() =>
        useInstructorGroupModals({
            canEnrollInGroup: vi.fn(() => true),
            groups,
            selectedCourse,
            selectedCourseId: '7',
            t,
            ...overrides,
        })
    );

describe('useInstructorGroupModals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchGroupRoster.mockResolvedValue([]);
    });

    it('opens and closes the create modal with course defaults', () => {
        const { result } = renderModalsHook();

        act(() => {
            result.current.handleOpenCreateModal();
        });

        expect(result.current.showCreateModal).toBe(true);
        expect(result.current.createForm.code).toMatch(/^LIVE-COUR/);
        expect(result.current.createForm.timezone).toBe('Asia/Bishkek');

        act(() => {
            result.current.handleCloseCreateModal();
        });

        expect(result.current.showCreateModal).toBe(false);
    });

    it('loads roster rows when opening enrollment', async () => {
        fetchGroupRoster.mockResolvedValue([
            {
                id: 50,
                email: 'student@example.com',
                fullName: 'Ada Student',
                enrolledAt: '2026-07-13',
            },
        ]);
        const { result } = renderModalsHook();

        act(() => {
            result.current.handleOpenEnrollModal(groups[0]);
        });

        expect(result.current.showEnrollModal).toBe(true);
        expect(result.current.enrollGroup).toEqual(groups[0]);
        await waitFor(() => {
            expect(result.current.groupStudents).toEqual([
                {
                    id: 50,
                    name: 'Ada Student',
                    email: 'student@example.com',
                    enrolledAt: '2026-07-13',
                },
            ]);
        });
        expect(fetchGroupRoster).toHaveBeenCalledWith({
            groupId: 30,
            limit: 100,
            page: 1,
        });
    });

    it('ignores stale roster responses after opening another group', async () => {
        const firstRoster = createDeferred();
        const secondRoster = createDeferred();
        fetchGroupRoster.mockImplementation(({ groupId }) =>
            groupId === 30 ? firstRoster.promise : secondRoster.promise
        );
        const secondGroup = {
            ...groups[0],
            id: 31,
            name: 'Second Group',
        };
        const { result } = renderModalsHook({
            groups: [...groups, secondGroup],
        });

        act(() => {
            result.current.handleOpenEnrollModal(groups[0]);
        });
        act(() => {
            result.current.handleOpenEnrollModal(secondGroup);
        });

        await act(async () => {
            secondRoster.resolve([
                {
                    id: 51,
                    email: 'second@example.com',
                    fullName: 'Second Student',
                },
            ]);
            await secondRoster.promise;
        });

        expect(result.current.groupStudents).toEqual([
            {
                id: 51,
                name: 'Second Student',
                email: 'second@example.com',
                enrolledAt: undefined,
            },
        ]);

        await act(async () => {
            firstRoster.resolve([
                {
                    id: 50,
                    email: 'first@example.com',
                    fullName: 'First Student',
                },
            ]);
            await firstRoster.promise;
        });

        expect(result.current.enrollGroup).toEqual(secondGroup);
        expect(result.current.groupStudents).toEqual([
            {
                id: 51,
                name: 'Second Student',
                email: 'second@example.com',
                enrolledAt: undefined,
            },
        ]);
    });

    it('invalidates roster loading when the enrollment modal closes', async () => {
        const rosterRequest = createDeferred();
        fetchGroupRoster.mockReturnValue(rosterRequest.promise);
        const { result } = renderModalsHook();

        act(() => {
            result.current.handleOpenEnrollModal(groups[0]);
        });
        expect(result.current.loadingGroupStudents).toBe(true);

        act(() => {
            result.current.handleCloseEnrollModal();
        });

        expect(result.current.showEnrollModal).toBe(false);
        expect(result.current.groupStudents).toEqual([]);
        expect(result.current.loadingGroupStudents).toBe(false);

        await act(async () => {
            rosterRequest.resolve([
                {
                    id: 50,
                    email: 'late@example.com',
                    fullName: 'Late Student',
                },
            ]);
            await rosterRequest.promise;
        });

        expect(result.current.groupStudents).toEqual([]);
        expect(result.current.loadingGroupStudents).toBe(false);
    });

    it('blocks enrollment modal when course readiness rejects enrollment', () => {
        const canEnrollInGroup = vi.fn(() => false);
        const { result } = renderModalsHook({ canEnrollInGroup });

        act(() => {
            result.current.handleOpenEnrollModal(groups[0]);
        });

        expect(result.current.showEnrollModal).toBe(false);
        expect(toast.error).toHaveBeenCalledWith(
            'instructorDashboard.groupsSection.toasts.enrollmentNotReady'
        );
    });

    it('opens edit modal and normalizes the selected group form', () => {
        const { result } = renderModalsHook();

        act(() => {
            result.current.handleOpenEditModal(groups[0]);
        });

        expect(result.current.showEditModal).toBe(true);
        expect(result.current.editingGroupId).toBe('30');
        expect(result.current.editForm).toEqual(expect.objectContaining({
            code: 'LIVE-G01',
            name: 'Live Group',
            status: 'active',
        }));
    });

    it('closes create modal and selects the created group after create success', () => {
        const { result } = renderModalsHook();

        act(() => {
            result.current.handleOpenCreateModal();
            result.current.handleCreateSuccess({ id: 99 });
        });

        expect(result.current.showCreateModal).toBe(false);
        expect(result.current.editingGroupId).toBe('99');
    });
});

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchUsers } from '@features/users/api';
import { toast } from 'react-hot-toast';
import { useInstructorGroupStudentOptions } from './useInstructorGroupStudentOptions';

vi.mock('@features/users/api', () => ({
    fetchUsers: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
    },
}));

const t = (key) => key;

describe('useInstructorGroupStudentOptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchUsers.mockResolvedValue({ items: [] });
    });

    it('does not search when disabled', () => {
        const { result } = renderHook(() =>
            useInstructorGroupStudentOptions({ enabled: false, t })
        );

        act(() => {
            result.current.setUserSearch('Ada');
        });

        expect(fetchUsers).not.toHaveBeenCalled();
        expect(result.current.studentOptions).toEqual([]);
    });

    it('clears options without searching until the query has at least two characters', async () => {
        fetchUsers.mockResolvedValue({
            items: [{ id: 1, fullName: 'Existing' }],
        });
        const { result } = renderHook(() =>
            useInstructorGroupStudentOptions({ enabled: true, t })
        );

        act(() => {
            result.current.setUserSearch('Existing');
        });

        await waitFor(() => {
            expect(result.current.studentOptions).toEqual([
                { id: 1, name: 'Existing', email: '' },
            ]);
        });

        act(() => {
            result.current.setUserSearch('A');
        });

        expect(fetchUsers).toHaveBeenCalledTimes(1);
        expect(result.current.studentOptions).toEqual([]);
        expect(result.current.loadingUserOptions).toBe(false);
    });

    it('loads and maps student options for a valid query', async () => {
        fetchUsers.mockResolvedValue({
            items: [
                { id: 3, fullName: 'Ada Student', email: 'ada@example.com' },
                { id: 4 },
            ],
        });
        const { result } = renderHook(() =>
            useInstructorGroupStudentOptions({ enabled: true, t })
        );

        act(() => {
            result.current.setUserSearch(' Ada ');
        });

        await waitFor(() => {
            expect(result.current.studentOptions).toEqual([
                { id: 3, name: 'Ada Student', email: 'ada@example.com' },
                { id: 4, name: 'ID: 4', email: '' },
            ]);
        });
        expect(fetchUsers).toHaveBeenCalledWith({
            limit: 10,
            page: 1,
            role: 'student',
            search: 'Ada',
        });
        expect(result.current.loadingUserOptions).toBe(false);
    });

    it('resets search, options, loading, and dropdown state', async () => {
        fetchUsers.mockResolvedValue({
            items: [{ id: 1, fullName: 'Ada' }],
        });
        const { result } = renderHook(() =>
            useInstructorGroupStudentOptions({ enabled: true, t })
        );

        act(() => {
            result.current.setUserSearch('Ada');
            result.current.setShowDropdown(true);
        });
        await waitFor(() => {
            expect(result.current.studentOptions).toEqual([
                { id: 1, name: 'Ada', email: '' },
            ]);
        });

        act(() => {
            result.current.resetStudentOptions();
        });

        expect(result.current.userSearch).toBe('');
        expect(result.current.studentOptions).toEqual([]);
        expect(result.current.loadingUserOptions).toBe(false);
        expect(result.current.showDropdown).toBe(false);
    });

    it('reports a toast and clears options when search fails', async () => {
        fetchUsers.mockRejectedValue(new Error('search failed'));
        const { result } = renderHook(() =>
            useInstructorGroupStudentOptions({ enabled: true, t })
        );

        act(() => {
            result.current.setUserSearch('Ada');
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'instructorDashboard.enrollGroupStudentModal.toasts.studentSearchFailed'
            );
        });
        expect(result.current.studentOptions).toEqual([]);
        expect(result.current.loadingUserOptions).toBe(false);
    });
});

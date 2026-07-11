import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { searchCourses } from '@features/search/api';
import { useCourseSearch } from './useCourseSearch';

vi.mock('@features/search/api', () => ({
    searchCourses: vi.fn(),
}));

vi.mock('react-i18next', () => {
    const t = (key) => key;
    return {
        useTranslation: () => ({ t }),
    };
});

describe('useCourseSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not search until the trimmed query has at least two characters', async () => {
        const { result } = renderHook(() => useCourseSearch());

        act(() => {
            result.current.setSearch(' a ');
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 350));
        });
        expect(searchCourses).not.toHaveBeenCalled();
        expect(result.current.results).toEqual([]);
        expect(result.current.showDropdown).toBe(false);
        expect(result.current.searchLoading).toBe(false);
    });

    it('debounces course search and normalizes list responses', async () => {
        searchCourses.mockResolvedValue({ items: [{ id: 1, title: 'Math' }] });
        const { result } = renderHook(() => useCourseSearch());

        act(() => {
            result.current.setSearch('math');
        });

        expect(result.current.searchLoading).toBe(true);
        expect(searchCourses).not.toHaveBeenCalled();

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 350));
        });

        expect(result.current.results).toEqual([{ id: 1, title: 'Math' }]);
        expect(searchCourses).toHaveBeenCalledWith('math');
        expect(result.current.showDropdown).toBe(true);
        expect(result.current.searchLoading).toBe(false);
    });

    it('surfaces a localized error when search fails', async () => {
        searchCourses.mockRejectedValue(new Error('offline'));
        const { result } = renderHook(() => useCourseSearch());

        act(() => {
            result.current.setSearch('math');
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 350));
        });

        expect(result.current.searchError).toBe('common.searchUnavailable');
        expect(result.current.results).toEqual([]);
        expect(result.current.showDropdown).toBe(true);
        expect(result.current.searchLoading).toBe(false);
    });
});

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { publicCatalog } from '@features/offerings/catalog';
import { usePublicCatalog } from './usePublicCatalog';

vi.mock('@features/offerings/catalog', () => ({
    publicCatalog: vi.fn(),
}));

describe('usePublicCatalog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('keeps normalized items when the backend returns malformed items', async () => {
        publicCatalog.mockResolvedValue({
            data: [{ id: 1, title: 'Live course' }],
            items: null,
            totalPages: 0,
        });

        const { result } = renderHook(() =>
            usePublicCatalog({ page: 1, q: '', limit: 20 })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data.items).toEqual([{ id: 1, title: 'Live course' }]);
        expect(result.current.data.totalPages).toBe(1);
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { executePendingAuthAction } from './postLogin';

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
    },
}));

describe('executePendingAuthAction', () => {
    afterEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('executes a pending favourite action and clears it', async () => {
        const toggleFavourite = vi.fn().mockResolvedValue({ success: true });
        const navigate = vi.fn();
        localStorage.setItem(
            'pendingAction',
            JSON.stringify({
                type: 'favourite',
                courseId: 12,
                courseTitle: 'Physics',
                course: { id: 12, title: 'Physics' },
                timestamp: Date.now(),
            })
        );

        const handled = await executePendingAuthAction({
            addToCart: vi.fn(),
            toggleFavourite,
            saveResource: vi.fn(),
            navigate,
        });

        expect(handled).toBe(true);
        expect(toggleFavourite).toHaveBeenCalledWith(
            expect.objectContaining({ id: 12, title: 'Physics' })
        );
        expect(navigate).toHaveBeenCalledWith('/favourites');
        expect(localStorage.getItem('pendingAction')).toBeNull();
    });

    it('clears expired pending actions without executing them', async () => {
        const toggleFavourite = vi.fn();
        localStorage.setItem(
            'pendingAction',
            JSON.stringify({
                type: 'favourite',
                courseId: 12,
                timestamp: Date.now() - 25 * 60 * 60 * 1000,
            })
        );

        const handled = await executePendingAuthAction({
            addToCart: vi.fn(),
            toggleFavourite,
            saveResource: vi.fn(),
            navigate: vi.fn(),
        });

        expect(handled).toBe(false);
        expect(toggleFavourite).not.toHaveBeenCalled();
        expect(localStorage.getItem('pendingAction')).toBeNull();
    });

    it('clears corrupt pending action JSON', async () => {
        localStorage.setItem('pendingAction', '{bad json');

        const handled = await executePendingAuthAction({
            addToCart: vi.fn(),
            toggleFavourite: vi.fn(),
            saveResource: vi.fn(),
            navigate: vi.fn(),
        });

        expect(handled).toBe(false);
        expect(localStorage.getItem('pendingAction')).toBeNull();
    });
});

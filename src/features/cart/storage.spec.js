import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    CART_STORAGE_KEY,
    clearStoredCart,
    createOptimisticCartItem,
    loadStoredCart,
    normalizeCartItems,
    saveStoredCart,
} from './storage';

describe('cart storage helpers', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('normalizes API cart responses into course-shaped items', () => {
        const normalized = normalizeCartItems({
            items: [
                {
                    id: 'cart-1',
                    quantity: 2,
                    addedAt: '2026-01-01T00:00:00Z',
                    course: { id: 42, title: 'React Basics', price: '15' },
                },
            ],
        });

        expect(normalized).toEqual([
            {
                id: 42,
                title: 'React Basics',
                price: '15',
                cartItemId: 'cart-1',
                addedAt: '2026-01-01T00:00:00Z',
                quantity: 2,
            },
        ]);
    });

    it('loads only valid stored cart items and backfills cartItemId', () => {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify([{ id: 1, title: 'A' }, null, 'bad', { id: 2, cartItemId: 'c2' }])
        );

        expect(loadStoredCart()).toEqual([
            { id: 1, title: 'A', cartItemId: 1 },
            { id: 2, cartItemId: 'c2' },
        ]);
    });

    it('saves non-empty carts and clears empty carts', () => {
        expect(saveStoredCart([{ id: 1 }])).toBe(true);
        expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toEqual([{ id: 1 }]);

        expect(saveStoredCart([])).toBe(true);
        expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    });

    it('creates optimistic cart items with stable defaults', () => {
        vi.useFakeTimers();
        vi.spyOn(Date, 'now').mockReturnValue(123);
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

        expect(createOptimisticCartItem({ id: 9, title: 'Course' })).toEqual({
            id: 9,
            title: 'Course',
            cartItemId: '9_123',
            addedAt: '2026-01-01T00:00:00.000Z',
            quantity: 1,
        });
    });

    it('clears the stored cart', () => {
        localStorage.setItem(CART_STORAGE_KEY, '[{"id":1}]');

        expect(clearStoredCart()).toBe(true);
        expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    });
});

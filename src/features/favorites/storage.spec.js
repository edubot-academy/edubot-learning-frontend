import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    FAVOURITES_STORAGE_KEY,
    clearStoredFavourites,
    loadStoredFavourites,
    mergeFavoriteImages,
    normalizeFavoriteCourse,
    normalizeFavoriteItems,
    saveStoredFavourites,
} from './storage';

describe('favorites storage helpers', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('normalizes API favorites and derives coverImageUrl from known fields', () => {
        const normalized = normalizeFavoriteItems({
            items: [
                {
                    id: 'fav-1',
                    addedAt: '2026-01-01T00:00:00Z',
                    course: { id: 10, title: 'Course', thumbnailUrl: '/thumb.jpg' },
                },
            ],
        });

        expect(normalized).toEqual([
            {
                id: 10,
                title: 'Course',
                thumbnailUrl: '/thumb.jpg',
                coverImageUrl: '/thumb.jpg',
                favoriteId: 'fav-1',
                addedAt: '2026-01-01T00:00:00Z',
            },
        ]);
    });

    it('normalizes optimistic favorite courses', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

        expect(normalizeFavoriteCourse({ id: 11, image: '/image.jpg' })).toEqual({
            id: 11,
            image: '/image.jpg',
            coverImageUrl: '/image.jpg',
            addedAt: '2026-01-01T00:00:00.000Z',
        });
    });

    it('preserves existing cover images when refreshed server rows omit them', () => {
        expect(
            mergeFavoriteImages(
                [{ id: 1, title: 'A', coverImageUrl: null }],
                [{ id: 1, coverImageUrl: '/cached.jpg' }]
            )
        ).toEqual([{ id: 1, title: 'A', coverImageUrl: '/cached.jpg' }]);
    });

    it('loads stored favourites defensively', () => {
        localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify({ bad: true }));

        expect(loadStoredFavourites()).toEqual([]);
    });

    it('saves and clears stored favourites', () => {
        expect(saveStoredFavourites([{ id: 1 }])).toBe(true);
        expect(JSON.parse(localStorage.getItem(FAVOURITES_STORAGE_KEY))).toEqual([{ id: 1 }]);

        expect(saveStoredFavourites([])).toBe(true);
        expect(localStorage.getItem(FAVOURITES_STORAGE_KEY)).toBeNull();

        localStorage.setItem(FAVOURITES_STORAGE_KEY, '[{"id":2}]');
        expect(clearStoredFavourites()).toBe(true);
        expect(localStorage.getItem(FAVOURITES_STORAGE_KEY)).toBeNull();
    });
});

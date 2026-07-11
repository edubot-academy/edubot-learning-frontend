import { getJsonStorageItem, removeStorageItem, setJsonStorageItem } from '@shared/utils/storage';

export const FAVOURITES_STORAGE_KEY = 'favourites';

const getCoverImageUrl = (course = {}) =>
    course.coverImageUrl ||
    course.coverImage ||
    course.image ||
    course.thumbnail ||
    course.thumbnailUrl ||
    null;

const toItemsArray = (data = []) => {
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
};

export const normalizeFavoriteItems = (data = []) =>
    toItemsArray(data).map((item) => {
        const course = item.course || item;

        return {
            ...course,
            coverImageUrl: getCoverImageUrl(course),
            favoriteId: item.id || course.id,
            addedAt: item.addedAt || new Date().toISOString(),
        };
    });

export const normalizeFavoriteCourse = (course) => ({
    ...course,
    coverImageUrl: getCoverImageUrl(course),
    addedAt: new Date().toISOString(),
});

export const mergeFavoriteImages = (serverItems, existingItems) => {
    const existingMap = new Map(existingItems.map((item) => [item.id, item]));

    return serverItems.map((item) => {
        const existing = existingMap.get(item.id);

        return {
            ...item,
            coverImageUrl: item.coverImageUrl || existing?.coverImageUrl || null,
        };
    });
};

export const loadStoredFavourites = () => {
    const parsed = getJsonStorageItem(FAVOURITES_STORAGE_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
};

export const saveStoredFavourites = (items) => {
    if (Array.isArray(items) && items.length > 0) {
        return setJsonStorageItem(FAVOURITES_STORAGE_KEY, items);
    }

    return removeStorageItem(FAVOURITES_STORAGE_KEY);
};

export const clearStoredFavourites = () => removeStorageItem(FAVOURITES_STORAGE_KEY);

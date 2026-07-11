import { getJsonStorageItem, removeStorageItem, setJsonStorageItem } from '@shared/utils/storage';

export const CART_STORAGE_KEY = 'cart';

const toItemsArray = (data = []) => {
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
};

export const normalizeCartItems = (data = []) =>
    toItemsArray(data).map((item) => {
        const course = item.course || item;
        return {
            ...course,
            cartItemId: item.id || item.cartItemId || course.id,
            addedAt: item.addedAt || new Date().toISOString(),
            quantity: item.quantity || 1,
        };
    });

export const loadStoredCart = () => {
    const parsed = getJsonStorageItem(CART_STORAGE_KEY, []);
    if (!Array.isArray(parsed)) return [];

    return parsed
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            ...item,
            cartItemId: item.cartItemId || item.id,
        }));
};

export const saveStoredCart = (items) => {
    if (Array.isArray(items) && items.length > 0) {
        return setJsonStorageItem(CART_STORAGE_KEY, items);
    }

    return removeStorageItem(CART_STORAGE_KEY);
};

export const clearStoredCart = () => removeStorageItem(CART_STORAGE_KEY);

export const createOptimisticCartItem = (course) => ({
    ...course,
    cartItemId: `${course.id}_${Date.now()}`,
    addedAt: new Date().toISOString(),
    quantity: 1,
});

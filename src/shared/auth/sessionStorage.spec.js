import { beforeEach, describe, expect, it } from 'vitest';
import {
    clearPendingAuthAction,
    clearStoredSession,
    getStoredAuthToken,
    hasCachedUser,
    loadCachedUser,
    loadPendingAuthAction,
    saveCachedUser,
    savePendingAuthAction,
    setStoredAuthToken,
} from './sessionStorage';

describe('auth session storage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('manages cached user state', () => {
        expect(hasCachedUser()).toBe(false);

        saveCachedUser({ id: 1, email: 'student@example.com' });

        expect(hasCachedUser()).toBe(true);
        expect(loadCachedUser()).toEqual({ id: 1, email: 'student@example.com' });
    });

    it('manages auth token state', () => {
        setStoredAuthToken('token-123');

        expect(getStoredAuthToken()).toBe('token-123');

        setStoredAuthToken(null);

        expect(getStoredAuthToken()).toBeNull();
    });

    it('manages pending auth actions', () => {
        savePendingAuthAction({ type: 'cart', courseId: 1 });

        expect(loadPendingAuthAction()).toEqual({ type: 'cart', courseId: 1 });

        clearPendingAuthAction();

        expect(loadPendingAuthAction()).toBeNull();
    });

    it('clears the complete stored session', () => {
        saveCachedUser({ id: 1 });
        setStoredAuthToken('token-123');
        savePendingAuthAction({ type: 'favourite', courseId: 2 });

        clearStoredSession();

        expect(loadCachedUser()).toBeNull();
        expect(getStoredAuthToken()).toBeNull();
        expect(loadPendingAuthAction()).toBeNull();
    });
});

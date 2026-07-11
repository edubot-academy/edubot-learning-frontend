import { beforeEach, describe, expect, it } from 'vitest';
import { clearPendingAuthAction, loadPendingAuthAction, savePendingAuthAction } from './storage';

describe('auth storage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('saves, loads, and clears pending auth actions', () => {
        const action = {
            type: 'cart',
            courseId: 7,
            timestamp: 1000,
        };

        savePendingAuthAction(action);

        expect(loadPendingAuthAction()).toEqual(action);

        clearPendingAuthAction();

        expect(loadPendingAuthAction()).toBeNull();
    });

    it('clears corrupt pending action JSON on load', () => {
        localStorage.setItem('pendingAction', '{bad json');

        expect(loadPendingAuthAction()).toBeNull();
        expect(localStorage.getItem('pendingAction')).toBeNull();
    });
});

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHeaderInteractionState } from './useHeaderInteractionState';

describe('useHeaderInteractionState', () => {
    const setup = (pathname = '/courses') => {
        const setCourseSearchDropdown = vi.fn();
        const view = renderHook(
            ({ nextPathname }) =>
                useHeaderInteractionState({
                    avatarUrl: '/avatar.png',
                    pathname: nextPathname,
                    setCourseSearchDropdown,
                }),
            { initialProps: { nextPathname: pathname } }
        );

        return { ...view, setCourseSearchDropdown };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('derives the active icon from the current route', () => {
        const { result, rerender, setCourseSearchDropdown } = setup('/cart');

        expect(result.current.activeIcon).toBe('cart');

        rerender({ nextPathname: '/favourites' });
        expect(result.current.activeIcon).toBe('heart');
        expect(setCourseSearchDropdown).toHaveBeenCalledWith(false);

        rerender({ nextPathname: '/courses' });
        expect(result.current.activeIcon).toBeNull();
    });

    it('resets open header surfaces when the route changes', () => {
        const { result, rerender } = setup('/courses');

        act(() => {
            result.current.openMenu();
            result.current.toggleSearch();
            result.current.toggleUserMenu();
            result.current.setPositionBar(true);
        });

        expect(result.current.menuOpen).toBe(true);
        expect(result.current.searchOpen).toBe(true);
        expect(result.current.userMenuOpen).toBe(true);
        expect(result.current.positionBar).toBe(true);

        rerender({ nextPathname: '/about' });

        expect(result.current.menuOpen).toBe(false);
        expect(result.current.searchOpen).toBe(false);
        expect(result.current.userMenuOpen).toBe(false);
        expect(result.current.positionBar).toBe(false);
    });

    it('closes open header surfaces on Escape', () => {
        const { result, setCourseSearchDropdown } = setup('/courses');

        act(() => {
            result.current.openMenu();
            result.current.toggleSearch();
            result.current.toggleUserMenu();
            result.current.setPositionBar(true);
        });

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });

        expect(result.current.menuOpen).toBe(false);
        expect(result.current.searchOpen).toBe(false);
        expect(result.current.userMenuOpen).toBe(false);
        expect(result.current.positionBar).toBe(false);
        expect(setCourseSearchDropdown).toHaveBeenCalledWith(false);
    });

    it('closes the user menu on outside clicks', () => {
        const { result } = setup('/courses');

        act(() => {
            result.current.toggleUserMenu();
        });
        expect(result.current.userMenuOpen).toBe(true);

        act(() => {
            document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        });
        expect(result.current.userMenuOpen).toBe(false);
    });
});

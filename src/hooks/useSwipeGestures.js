import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for handling swipe gestures on mobile devices
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {Function} options.onSwipeUp - Callback for up swipe
 * @param {Function} options.onSwipeDown - Callback for down swipe
 * @param {number} options.threshold - Minimum distance for swipe (default: 50)
 * @param {number} options.restraint - Maximum vertical distance for horizontal swipe (default: 100)
 * @param {number} options.swipeTime - Maximum time for swipe (default: 300)
 */
export const useSwipeGestures = ({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    restraint = 100,
    swipeTime = 300,
} = {}) => {
    const elementRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchEndX = useRef(0);
    const touchEndY = useRef(0);
    const startTime = useRef(0);

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.changedTouches[0].screenX;
        touchStartY.current = e.changedTouches[0].screenY;
        startTime.current = Date.now();
    }, []);

    const handleTouchEnd = useCallback((e) => {
        touchEndX.current = e.changedTouches[0].screenX;
        touchEndY.current = e.changedTouches[0].screenY;
        
        const elapsedTime = Date.now() - startTime.current;
        
        if (elapsedTime <= swipeTime) {
            handleSwipeGesture();
        }
    }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

    const handleSwipeGesture = useCallback(() => {
        const deltaX = touchEndX.current - touchStartX.current;
        const deltaY = touchEndY.current - touchStartY.current;
        
        // Horizontal swipe detection
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > threshold && Math.abs(deltaY) < restraint) {
                if (deltaX > 0 && onSwipeRight) {
                    onSwipeRight();
                } else if (deltaX < 0 && onSwipeLeft) {
                    onSwipeLeft();
                }
            }
        }
        // Vertical swipe detection
        else {
            if (Math.abs(deltaY) > threshold && Math.abs(deltaX) < restraint) {
                if (deltaY > 0 && onSwipeDown) {
                    onSwipeDown();
                } else if (deltaY < 0 && onSwipeUp) {
                    onSwipeUp();
                }
            }
        }
    }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, restraint]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return elementRef;
};

/**
 * Hook for swipe navigation between pages
 * @param {Object} navigation - Navigation functions
 * @param {Function} navigation.goBack - Function to go back
 * @param {Function} navigation.goForward - Function to go forward
 * @param {string[]} navigation.pages - Array of page paths for navigation
 * @param {number} navigation.currentIndex - Current page index
 */
export const useSwipeNavigation = ({
    goBack,
    goForward,
    pages = [],
    currentIndex = 0,
}) => {
    const handleSwipeLeft = useCallback(() => {
        if (goForward && currentIndex < pages.length - 1) {
            goForward();
        }
    }, [goForward, currentIndex, pages.length]);

    const handleSwipeRight = useCallback(() => {
        if (goBack && currentIndex > 0) {
            goBack();
        }
    }, [goBack, currentIndex]);

    return useSwipeGestures({
        onSwipeLeft: handleSwipeLeft,
        onSwipeRight: handleSwipeRight,
    });
};

export default useSwipeGestures;

import { useCallback, useRef, useEffect } from 'react';

const useDashboardSwipeGestures = ({ onSwipeLeft, onSwipeRight, enabled = true }) => {
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isSwiping = useRef(false);

    const handleTouchStart = useCallback((e) => {
        if (!enabled) return;
        
        touchStartX.current = e.touches[0].clientX;
        isSwiping.current = false;
    }, [enabled]);

    const handleTouchMove = useCallback((e) => {
        if (!enabled || !isSwiping.current) return;
        
        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX.current;
        
        // Only consider it a swipe if moved more than 10px
        if (Math.abs(diffX) > 10) {
            isSwiping.current = true;
        }
    }, [enabled]);

    const handleTouchEnd = useCallback((e) => {
        if (!enabled) return;
        
        touchEndX.current = e.changedTouches[0].clientX;
        const diffX = touchEndX.current - touchStartX.current;
        
        // Swipe threshold: 50px minimum
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe right - open sidebar or previous tab
                onSwipeRight?.();
            } else {
                // Swipe left - close sidebar or next tab
                onSwipeLeft?.();
            }
        }
        
        isSwiping.current = false;
    }, [enabled, onSwipeLeft, onSwipeRight]);

    useEffect(() => {
        const element = document.documentElement;
        
        if (enabled) {
            element.addEventListener('touchstart', handleTouchStart, { passive: true });
            element.addEventListener('touchmove', handleTouchMove, { passive: true });
            element.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        return () => {
            if (enabled) {
                element.removeEventListener('touchstart', handleTouchStart);
                element.removeEventListener('touchmove', handleTouchMove);
                element.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        // No return value needed for this hook
    };
};

export default useDashboardSwipeGestures;

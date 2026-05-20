import { useEffect } from 'react';

export const useDashboardKeyboardNavigation = () => {
    useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            if (event.altKey) {
                switch (event.key.toLowerCase()) {
                    case 'm': {
                        event.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        mainContent?.focus();
                        mainContent?.scrollIntoView({ behavior: 'smooth' });
                        break;
                    }
                    case 'n': {
                        event.preventDefault();
                        const navigation = document.querySelector('[data-dashboard-navigation]');
                        navigation?.focus();
                        navigation?.scrollIntoView({ behavior: 'smooth' });
                        break;
                    }
                    case 's': {
                        event.preventDefault();
                        const searchInput = document.querySelector(
                            '[data-dashboard-search], input[type="search"]'
                        );
                        searchInput?.focus();
                        searchInput?.scrollIntoView({ behavior: 'smooth' });
                        break;
                    }
                    default:
                        break;
                }
            }

            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

            const sidebarItems = document.querySelectorAll('[data-dashboard-nav-item]');
            const currentIndex = Array.from(sidebarItems).findIndex(
                (item) => item === document.activeElement
            );

            if (currentIndex === -1) return;

            event.preventDefault();
            const nextIndex =
                event.key === 'ArrowLeft'
                    ? currentIndex > 0
                        ? currentIndex - 1
                        : sidebarItems.length - 1
                    : currentIndex < sidebarItems.length - 1
                        ? currentIndex + 1
                        : 0;

            sidebarItems[nextIndex]?.focus();
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);
};

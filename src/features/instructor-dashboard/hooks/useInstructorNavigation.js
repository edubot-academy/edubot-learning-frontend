import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/instructorDashboard.constants.js';

export const useInstructorNavigation = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';

    const [activeTab, setActiveTab] = useState(
        NAV_ITEMS.some((item) => item.id === initialTab) ? initialTab : 'overview'
    );

    const handleTabSelect = useCallback(
        (tabId) => {
            if (!NAV_ITEMS.some((item) => item.id === tabId)) return;

            setActiveTab(tabId);
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set('tab', tabId);
                return newParams;
            });
        },
        [setSearchParams]
    );

    // Sync URL with active tab
    const syncUrlWithTab = useCallback(() => {
        const tabFromQuery = searchParams.get('tab');
        const resolvedTab =
            tabFromQuery && NAV_ITEMS.some((item) => item.id === tabFromQuery)
                ? tabFromQuery
                : 'overview';

        if (resolvedTab !== activeTab) {
            setActiveTab(resolvedTab);
        }
    }, [searchParams, activeTab]);

    return {
        activeTab,
        handleTabSelect,
        syncUrlWithTab,
    };
};

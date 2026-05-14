import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADMIN_TABS } from '../utils/adminPanel.constants';
import { isValidTab } from '../utils/adminPanel.helpers';

export const useAdminTabState = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('stats');

    // Initialize tab from URL
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (isValidTab(tabFromUrl, ADMIN_TABS)) {
            setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
        }
    }, [searchParams]);

    const handleTabSelect = useCallback(
        (tabId) => {
            if (!isValidTab(tabId, ADMIN_TABS)) return;
            
            setActiveTab(tabId);
            
            // Update URL search params
            setSearchParams(
                (prev) => {
                    const updated = new URLSearchParams(prev);
                    updated.set('tab', tabId);
                    return updated;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    return {
        activeTab,
        handleTabSelect,
    };
};

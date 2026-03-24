import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADMIN_TABS } from '../utils/adminPanel.constants';
import { isValidTab } from '../utils/adminPanel.helpers';

export const useAdminTabState = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('stats');

    const updateSearchParams = useCallback(
        (params) => {
            // This will be passed in from the parent component
            // since setSearchParams is not available here
            return params;
        },
        []
    );

    // Initialize tab from URL
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (isValidTab(tabFromUrl, ADMIN_TABS)) {
            setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
        }
    }, [searchParams]);

    const handleTabSelect = useCallback(
        (tabId, setSearchParams) => {
            if (!isValidTab(tabId, ADMIN_TABS)) return;
            
            setActiveTab(tabId);
            
            // Update URL search params
            setSearchParams((prev) => {
                const updated = new URLSearchParams(prev);
                updated.set('tab', tabId);
                return updated;
            });
        },
        []
    );

    return {
        activeTab,
        setActiveTab,
        handleTabSelect,
        updateSearchParams,
    };
};

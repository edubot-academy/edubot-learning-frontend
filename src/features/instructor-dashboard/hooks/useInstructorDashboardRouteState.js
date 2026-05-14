import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const normalizeTab = (tabId, navItems) =>
    navItems.some((item) => item.id === tabId) ? tabId : 'overview';

export const useInstructorDashboardRouteState = ({ navItems }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(
        normalizeTab(searchParams.get('tab') || 'overview', navItems)
    );

    useEffect(() => {
        const nextTab = normalizeTab(searchParams.get('tab') || 'overview', navItems);
        setActiveTab((prev) => (prev === nextTab ? prev : nextTab));
    }, [navItems, searchParams]);

    const handleTabSelect = useCallback(
        (tabId) => {
            const nextTab = normalizeTab(tabId, navItems);
            if (nextTab !== tabId) return;

            setActiveTab(nextTab);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (nextTab === 'overview') next.delete('tab');
                    else next.set('tab', nextTab);
                    return next;
                },
                { replace: true }
            );
        },
        [navItems, setSearchParams]
    );

    return {
        activeTab,
        handleTabSelect,
    };
};

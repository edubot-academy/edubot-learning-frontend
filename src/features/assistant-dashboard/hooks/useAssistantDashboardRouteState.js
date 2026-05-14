import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const normalizeTab = (tabId, validTabIds) =>
    validTabIds.includes(tabId) ? tabId : 'overview';

export const useAssistantDashboardRouteState = (navItems) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const validTabIds = useMemo(() => navItems.map((item) => item.id), [navItems]);
    const [activeTab, setActiveTab] = useState(
        normalizeTab(searchParams.get('tab'), validTabIds)
    );

    useEffect(() => {
        const nextTab = normalizeTab(searchParams.get('tab'), validTabIds);
        setActiveTab((prev) => (prev === nextTab ? prev : nextTab));
    }, [searchParams, validTabIds]);

    const handleTabSelect = useCallback(
        (tabId) => {
            const nextTab = normalizeTab(tabId, validTabIds);
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
        [setSearchParams, validTabIds]
    );

    return {
        activeTab,
        handleTabSelect,
    };
};

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const normalizeTab = (tab, validTabIds) =>
    validTabIds.includes(tab) ? tab : 'overview';

export const useStudentDashboardRouteState = ({ navItems, enabled = true }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const validTabIds = useMemo(() => navItems.map((item) => item.id), [navItems]);
    const [activeTab, setActiveTab] = useState(
        normalizeTab(searchParams.get('tab'), validTabIds)
    );
    const [filterCourseId, setFilterCourseId] = useState(searchParams.get('courseId') || '');
    const [filterGroupId, setFilterGroupId] = useState(searchParams.get('groupId') || '');

    useEffect(() => {
        const nextTab = normalizeTab(searchParams.get('tab'), validTabIds);
        const nextCourseId = searchParams.get('courseId') || '';
        const nextGroupId = searchParams.get('groupId') || '';

        setActiveTab((prev) => (nextTab !== prev ? nextTab : prev));
        setFilterCourseId((prev) => (prev !== nextCourseId ? nextCourseId : prev));
        setFilterGroupId((prev) => (prev !== nextGroupId ? nextGroupId : prev));
    }, [searchParams, validTabIds]);

    useEffect(() => {
        if (!enabled) return;

        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);

            if (activeTab === 'overview') {
                next.delete('tab');
            } else {
                next.set('tab', activeTab);
            }

            if (filterCourseId) {
                next.set('courseId', filterCourseId);
            } else {
                next.delete('courseId');
            }

            if (filterGroupId) {
                next.set('groupId', filterGroupId);
            } else {
                next.delete('groupId');
            }

            return next;
        });
    }, [activeTab, enabled, filterCourseId, filterGroupId, setSearchParams]);

    return {
        activeTab,
        filterCourseId,
        filterGroupId,
        setActiveTab,
        setFilterCourseId,
        setFilterGroupId,
    };
};

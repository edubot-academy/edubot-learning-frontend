import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SESSION_WORKSPACE_TABS } from '../utils/sessionWorkspace.helpers';

const VALID_HOMEWORK_REVIEW_FILTERS = ['all', 'needs_review', 'missing', 'needs_revision', 'late'];
const VALID_ACTIVITY_RESPONSE_FILTERS = [
    'all',
    'pending',
    'reviewed',
    'revision',
    'passed',
    'failed',
    'not_started',
    'missing_response',
];

const normalizeFilter = (value, allowedValues) =>
    allowedValues.includes(value) ? value : 'all';

const getRouteSelection = (searchParams) => ({
    courseId: searchParams.get('courseId') || '',
    groupId: searchParams.get('groupId') || '',
    sessionId: searchParams.get('sessionId') || '',
    homeworkId: searchParams.get('homeworkId') || '',
});

const normalizeWorkspaceTab = (value) =>
    SESSION_WORKSPACE_TABS.some((tab) => tab.id === value) ? value : 'attendance';

export const useSessionWorkspaceRouteState = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pendingRouteSelectionRef = useRef(getRouteSelection(searchParams));
    const [activeTab, setActiveTab] = useState(
        normalizeWorkspaceTab(searchParams.get('workspaceTab') || 'attendance')
    );
    const [homeworkReviewFilter, setHomeworkReviewFilterState] = useState(
        normalizeFilter(searchParams.get('homeworkReviewFilter') || 'all', VALID_HOMEWORK_REVIEW_FILTERS)
    );
    const [activityResponseFilter, setActivityResponseFilterState] = useState(
        normalizeFilter(searchParams.get('activityResponseFilter') || 'all', VALID_ACTIVITY_RESPONSE_FILTERS)
    );

    useEffect(() => {
        pendingRouteSelectionRef.current = getRouteSelection(searchParams);
        setActiveTab(normalizeWorkspaceTab(searchParams.get('workspaceTab') || 'attendance'));
        setHomeworkReviewFilterState(
            normalizeFilter(searchParams.get('homeworkReviewFilter') || 'all', VALID_HOMEWORK_REVIEW_FILTERS)
        );
        setActivityResponseFilterState(
            normalizeFilter(searchParams.get('activityResponseFilter') || 'all', VALID_ACTIVITY_RESPONSE_FILTERS)
        );
    }, [searchParams]);

    const setHomeworkReviewFilter = useCallback(
        (nextFilter) => {
            const normalized = normalizeFilter(nextFilter, VALID_HOMEWORK_REVIEW_FILTERS);
            setHomeworkReviewFilterState(normalized);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (normalized === 'all') next.delete('homeworkReviewFilter');
                    else next.set('homeworkReviewFilter', normalized);
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const openWorkspaceTab = useCallback(
        (target) => {
            const tabId = normalizeWorkspaceTab(typeof target === 'string' ? target : target?.tab);
            const nextHomeworkReviewFilter =
                tabId === 'homework' && typeof target === 'object'
                    ? normalizeFilter(target?.homeworkReviewFilter || 'all', VALID_HOMEWORK_REVIEW_FILTERS)
                    : 'all';
            const nextActivityResponseFilter =
                tabId === 'activities' && typeof target === 'object'
                    ? normalizeFilter(target?.activityResponseFilter || 'all', VALID_ACTIVITY_RESPONSE_FILTERS)
                    : 'all';

            setActiveTab(tabId);
            setHomeworkReviewFilterState(nextHomeworkReviewFilter);
            setActivityResponseFilterState(nextActivityResponseFilter);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('workspaceTab', tabId);

                    if (tabId === 'homework' && nextHomeworkReviewFilter !== 'all') {
                        next.set('homeworkReviewFilter', nextHomeworkReviewFilter);
                    } else {
                        next.delete('homeworkReviewFilter');
                    }

                    if (tabId === 'activities' && nextActivityResponseFilter !== 'all') {
                        next.set('activityResponseFilter', nextActivityResponseFilter);
                    } else {
                        next.delete('activityResponseFilter');
                    }

                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    return {
        activeTab,
        activityResponseFilter,
        homeworkReviewFilter,
        openWorkspaceTab,
        pendingRouteSelectionRef,
        setHomeworkReviewFilter,
    };
};

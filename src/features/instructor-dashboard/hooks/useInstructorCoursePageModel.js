import { useEffect, useMemo, useState } from 'react';
import {
    filterInstructorCourseDisplayItems,
    getInstructorCourseFilters,
    getInstructorCourseLifecycleCounts,
    getInstructorCourseWorkflowCounts,
    getInstructorCourseWorkflowFilters,
    toInstructorCourseDisplayItems,
} from '@features/instructor-dashboard/utils/instructorCourseDisplay';

export const useInstructorCoursePageModel = ({
    courses,
    error,
    i18nLanguage,
    loading,
    t,
    user,
}) => {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [lastLoadedAt, setLastLoadedAt] = useState(null);

    useEffect(() => {
        if (!loading && !error) {
            setLastLoadedAt(new Date());
        }
    }, [error, loading, courses.length]);

    const courseDisplayItems = useMemo(
        () => toInstructorCourseDisplayItems(courses, user, t),
        [courses, user, t]
    );

    const lifecycleCounts = useMemo(
        () => getInstructorCourseLifecycleCounts(courseDisplayItems),
        [courseDisplayItems]
    );

    const workflowCounts = useMemo(
        () => getInstructorCourseWorkflowCounts(courseDisplayItems),
        [courseDisplayItems]
    );

    const filteredCourses = useMemo(
        () =>
            filterInstructorCourseDisplayItems(courseDisplayItems, {
                query,
                statusFilter,
                typeFilter,
            }),
        [courseDisplayItems, query, statusFilter, typeFilter]
    );

    const lastLoadedLabel = lastLoadedAt
        ? lastLoadedAt.toLocaleTimeString(i18nLanguage || undefined, {
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-';

    const courseFilters = useMemo(() => getInstructorCourseFilters(t), [t]);
    const courseTypeFilters = useMemo(() => getInstructorCourseWorkflowFilters(t), [t]);

    return {
        courseFilters,
        courseTypeFilters,
        filteredCourses,
        lastLoadedLabel,
        lifecycleCounts,
        query,
        setQuery,
        setStatusFilter,
        setTypeFilter,
        statusFilter,
        typeFilter,
        workflowCounts,
    };
};

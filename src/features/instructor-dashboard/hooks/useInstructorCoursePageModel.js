import { useEffect, useMemo, useState } from 'react';
import {
    filterInstructorCourseDisplayItems,
    getInstructorCourseFilters,
    getInstructorCourseLifecycleCounts,
    getInstructorCourseWorkflowCounts,
    getInstructorCourseWorkflowFilters,
    INSTRUCTOR_COURSE_FILTER_ALL,
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
    const [statusFilter, setStatusFilter] = useState(INSTRUCTOR_COURSE_FILTER_ALL);
    const [typeFilter, setTypeFilter] = useState(INSTRUCTOR_COURSE_FILTER_ALL);
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

    const timeFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(i18nLanguage || undefined, {
                hour: '2-digit',
                minute: '2-digit',
            }),
        [i18nLanguage]
    );

    const lastLoadedLabel = lastLoadedAt
        ? timeFormatter.format(lastLoadedAt)
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

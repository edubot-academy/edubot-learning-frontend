import { useMemo } from 'react';
import { useInstructorCourseQuery } from './useInstructorCourseQuery';

export const useInstructorCourseListPage = (user) => {
    const params = useMemo(
        () => ({
            page: 1,
            limit: 100,
            status: 'all',
        }),
        []
    );
    const { courses, error, loading, refresh } = useInstructorCourseQuery({
        clearOnDisabled: true,
        clearOnError: true,
        enabled: user?.role === 'instructor',
        params,
    });

    return {
        courses,
        error,
        loading,
        refresh,
    };
};

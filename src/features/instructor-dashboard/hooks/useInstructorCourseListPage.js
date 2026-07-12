import { useCallback, useEffect, useState } from 'react';
import { fetchInstructorCourses } from '@features/courses/api';
import { toInstructorCourseList } from '@features/instructor-dashboard/utils/instructorCourses';

export const useInstructorCourseListPage = (user) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadCourses = useCallback(async () => {
        if (user?.role !== 'instructor') {
            setCourses([]);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetchInstructorCourses({
                page: 1,
                limit: 100,
                status: 'all',
            });
            setCourses(toInstructorCourseList(response));
        } catch (loadError) {
            console.error('Failed to load instructor courses', loadError);
            setCourses([]);
            setError(loadError);
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    return {
        courses,
        error,
        loading,
        refresh: loadCourses,
    };
};

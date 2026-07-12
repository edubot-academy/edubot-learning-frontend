import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchInstructorCourses } from '@features/courses/api/instructorCourses';
import { toInstructorCourseList } from '@features/instructor-dashboard/utils/instructorCourses';

export const useInstructorCourseQuery = ({
    clearOnDisabled = false,
    clearOnError = false,
    enabled,
    onError,
    params,
} = {}) => {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const requestSequenceRef = useRef(0);

    const loadCourses = useCallback(async () => {
        if (!enabled) {
            requestSequenceRef.current += 1;
            setError(null);
            setLoading(false);
            if (clearOnDisabled) {
                setCourses([]);
            }
            return;
        }

        const requestId = requestSequenceRef.current + 1;
        requestSequenceRef.current = requestId;

        setLoading(true);
        setError(null);

        try {
            const response = await fetchInstructorCourses(params);
            if (requestId !== requestSequenceRef.current) return;
            setCourses(toInstructorCourseList(response));
        } catch (loadError) {
            if (requestId !== requestSequenceRef.current) return;
            console.error('Failed to load instructor courses', loadError);
            if (clearOnError) {
                setCourses([]);
            }
            setError(loadError);
            onError?.(loadError);
        } finally {
            if (requestId === requestSequenceRef.current) {
                setLoading(false);
            }
        }
    }, [clearOnDisabled, clearOnError, enabled, onError, params]);

    useEffect(() => {
        loadCourses();

        return () => {
            requestSequenceRef.current += 1;
        };
    }, [loadCourses]);

    return {
        courses,
        error,
        loading,
        refresh: loadCourses,
        setCourses,
    };
};

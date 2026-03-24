import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchInstructorCourses } from '@services/api';

export const useInstructorCourses = (user) => {
    const [courseList, setCourseList] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    const loadCourses = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;

        setLoadingCourses(true);
        try {
            const data = await fetchInstructorCourses({ status: 'approved' });
            setCourseList(Array.isArray(data?.courses) ? data.courses : []);
        } catch (error) {
            console.error('Failed to load courses', error);
            toast.error('Курстарды жүктөө мүмкүн болбоду');
        } finally {
            setLoadingCourses(false);
        }
    }, [user]);

    const courses = useMemo(
        () => courseList,
        [courseList]
    );

    const aiCourses = useMemo(
        () => courses.filter((course) => course.aiAssistantEnabled),
        [courses]
    );

    const publishedCount = useMemo(
        () => courses.filter((course) => course.isPublished).length,
        [courses]
    );

    const pendingCount = useMemo(
        () => courses.filter((course) => !course.isPublished).length,
        [courses]
    );

    return {
        courseList,
        courses,
        loadingCourses,
        aiCourses,
        publishedCount,
        pendingCount,
        loadCourses,
    };
};

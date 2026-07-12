import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { fetchInstructorCourses } from '@features/courses/api';
import { parseApiError } from '@shared/api/error';
import {
    getCourseFromMutationResponse,
    getPublishedCourseCount,
    getUnpublishedCourseCount,
    markInstructorCoursePending,
    selectAiEnabledCourses,
    selectApprovedPublishedCourses,
    toInstructorCourseList,
    upsertInstructorCourse,
} from '@features/instructor-dashboard/utils/instructorCourses';

export const useInstructorCourses = (user, profile) => {
    const { t } = useTranslation();
    const [courseList, setCourseList] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    const loadCourses = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;

        setLoadingCourses(true);
        try {
            const data = await fetchInstructorCourses({ status: 'all' });
            setCourseList(toInstructorCourseList(data));
        } catch (error) {
            console.error('Failed to load instructor courses', error);
            toast.error(parseApiError(error, t('instructorDashboard.data.toasts.coursesLoadError')).message);
        } finally {
            setLoadingCourses(false);
        }
    }, [t, user]);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    const upsertCourse = useCallback((response) => {
        const nextCourse = getCourseFromMutationResponse(response);
        if (!nextCourse?.id) return false;

        setCourseList((prev) => {
            const result = upsertInstructorCourse(prev, response);
            return result.courses;
        });

        return true;
    }, []);

    const markCoursePendingLocally = useCallback((courseId) => {
        if (!courseId) return;

        setCourseList((prev) => markInstructorCoursePending(prev, courseId));
    }, []);

    const courses = useMemo(
        () => (courseList.length ? courseList : profile?.courses || []),
        [courseList, profile]
    );

    const aiCourses = useMemo(
        () => selectAiEnabledCourses(courses),
        [courses]
    );

    const approvedCourses = useMemo(
        () => selectApprovedPublishedCourses(courses),
        [courses]
    );

    const publishedCount = useMemo(
        () => getPublishedCourseCount(courses),
        [courses]
    );

    const pendingCount = useMemo(
        () => getUnpublishedCourseCount(courses),
        [courses]
    );

    return {
        courseList,
        courses,
        loadingCourses,
        aiCourses,
        approvedCourses,
        publishedCount,
        pendingCount,
        loadCourses,
        upsertCourse,
        markCoursePendingLocally,
    };
};

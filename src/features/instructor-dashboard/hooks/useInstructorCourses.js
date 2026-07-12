import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '@shared/api/error';
import {
    getCourseFromMutationResponse,
    getPublishedCourseCount,
    getUnpublishedCourseCount,
    markInstructorCoursePending,
    selectAiEnabledCourses,
    selectApprovedPublishedCourses,
    upsertInstructorCourse,
} from '@features/instructor-dashboard/utils/instructorCourses';
import { useInstructorCourseQuery } from './useInstructorCourseQuery';

export const useInstructorCourses = (user, profile) => {
    const { t } = useTranslation();
    const params = useMemo(() => ({ status: 'all' }), []);
    const handleLoadError = useCallback(
        (error) => {
            toast.error(parseApiError(error, t('instructorDashboard.data.toasts.coursesLoadError')).message);
        },
        [t]
    );
    const {
        courses: courseList,
        loading: loadingCourses,
        refresh: loadCourses,
        setCourses: setCourseList,
    } = useInstructorCourseQuery({
        enabled: Boolean(user?.id && user.role === 'instructor'),
        onError: handleLoadError,
        params,
    });

    const upsertCourse = useCallback((response) => {
        const nextCourse = getCourseFromMutationResponse(response);
        if (!nextCourse?.id) return false;

        setCourseList((prev) => {
            const result = upsertInstructorCourse(prev, response);
            return result.courses;
        });

        return true;
    }, [setCourseList]);

    const markCoursePendingLocally = useCallback((courseId) => {
        if (!courseId) return;

        setCourseList((prev) => markInstructorCoursePending(prev, courseId));
    }, [setCourseList]);

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

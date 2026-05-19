import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { fetchInstructorCourses } from '@services/api';
import {
    isCourseFeatureEnabled,
    TENANT_FEATURES,
} from '@shared/utils/tenantFeatures';
import { parseApiError } from '@shared/api/error';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const getCourseFromResponse = (response) => {
    if (!response) return null;
    if (response.course) return response.course;
    if (response.id) return response;
    return null;
};

export const useInstructorCourses = (user, profile) => {
    const { t } = useTranslation();
    const [courseList, setCourseList] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    const loadCourses = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;

        setLoadingCourses(true);
        try {
            const data = await fetchInstructorCourses({ status: 'all' });
            setCourseList(toArray(data?.courses || data));
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
        const nextCourse = getCourseFromResponse(response);
        if (!nextCourse?.id) return false;

        setCourseList((prev) => {
            const existingIndex = prev.findIndex(
                (course) => String(course.id) === String(nextCourse.id)
            );

            if (existingIndex === -1) return [nextCourse, ...prev];

            return prev.map((course, index) =>
                index === existingIndex ? { ...course, ...nextCourse } : course
            );
        });

        return true;
    }, []);

    const markCoursePendingLocally = useCallback((courseId) => {
        if (!courseId) return;

        setCourseList((prev) =>
            prev.map((course) =>
                String(course.id) === String(courseId)
                    ? { ...course, status: 'pending', isPublished: false }
                    : course
            )
        );
    }, []);

    const courses = useMemo(
        () => (courseList.length ? courseList : profile?.courses || []),
        [courseList, profile]
    );

    const aiCourses = useMemo(
        () =>
            courses.filter(
                (course) =>
                    course.aiAssistantEnabled &&
                    isCourseFeatureEnabled(course, TENANT_FEATURES.AI_ASSISTANT)
            ),
        [courses]
    );

    const approvedCourses = useMemo(
        () => courses.filter((course) => course?.status === 'approved' && course?.isPublished),
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
        approvedCourses,
        publishedCount,
        pendingCount,
        loadCourses,
        upsertCourse,
        markCoursePendingLocally,
    };
};

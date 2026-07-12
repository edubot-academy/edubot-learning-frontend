import { toArray } from '@shared/api/response';
import { getDashboardPath } from '@shared/utils/navigation';
import {
    isCourseFeatureEnabled,
    TENANT_FEATURES,
} from '@shared/utils/tenantFeatures';

export const COURSE_WORKFLOWS = Object.freeze({
    VIDEO: 'video',
    DELIVERY: 'delivery',
});

export const isDeliveryCourse = (courseOrType) => {
    const courseType =
        typeof courseOrType === 'string'
            ? courseOrType
            : courseOrType?.courseType || courseOrType?.type;
    const normalized = String(courseType || '').toLowerCase();
    return normalized === 'offline' || normalized === 'online_live';
};

export const getCourseWorkflow = (courseOrType) =>
    isDeliveryCourse(courseOrType) ? COURSE_WORKFLOWS.DELIVERY : COURSE_WORKFLOWS.VIDEO;

export const isDraftCourse = (course) => course?.status === 'draft' || !course?.status;

export const getInstructorCourseViewTarget = (course) =>
    isDeliveryCourse(course)
        ? getDashboardPath('instructor', 'groups', { courseId: course.id })
        : `/courses/${course.id}`;

export const getInstructorCourseEditTarget = (course) =>
    `/instructor/courses/edit/${course.id}`;

export const toInstructorCourseList = (payload) => toArray(payload?.courses || payload);

export const getCourseFromMutationResponse = (response) => {
    if (!response) return null;
    if (response.course) return response.course;
    if (response.id) return response;
    return null;
};

export const upsertInstructorCourse = (courses, response) => {
    const nextCourse = getCourseFromMutationResponse(response);
    if (!nextCourse?.id) {
        return { courses, changed: false };
    }

    const existingIndex = courses.findIndex(
        (course) => String(course.id) === String(nextCourse.id)
    );

    if (existingIndex === -1) {
        return { courses: [nextCourse, ...courses], changed: true };
    }

    return {
        courses: courses.map((course, index) =>
            index === existingIndex ? { ...course, ...nextCourse } : course
        ),
        changed: true,
    };
};

export const markInstructorCoursePending = (courses, courseId) => {
    if (!courseId) return courses;

    return courses.map((course) =>
        String(course.id) === String(courseId)
            ? { ...course, status: 'pending', isPublished: false }
            : course
    );
};

export const selectAiEnabledCourses = (courses) =>
    courses.filter(
        (course) =>
            course.aiAssistantEnabled &&
            isCourseFeatureEnabled(course, TENANT_FEATURES.AI_ASSISTANT)
    );

export const selectApprovedPublishedCourses = (courses) =>
    courses.filter((course) => course?.status === 'approved' && course?.isPublished);

export const getPublishedCourseCount = (courses) =>
    courses.filter((course) => course.isPublished).length;

export const getUnpublishedCourseCount = (courses) =>
    courses.filter((course) => !course.isPublished).length;

export const getPendingReviewCourseCount = (courses) =>
    courses.filter((course) => course.status === 'pending').length;

export const getCourseStudentsCount = (courses) =>
    courses.reduce((sum, course) => sum + Number(course.studentsCount || 0), 0);

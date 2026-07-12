export const DELIVERY_COURSE_TYPES = Object.freeze(['offline', 'online_live']);
export const DELIVERY_COURSE_TYPE_SET = new Set(DELIVERY_COURSE_TYPES);

export const normalizeCourseType = (course = {}) =>
    String(course.courseType || course.type || '').trim().toLowerCase();

export const isGroupEligibleCourse = (course = {}) =>
    DELIVERY_COURSE_TYPE_SET.has(normalizeCourseType(course)) &&
    course.status === 'approved' &&
    course.isPublished === true;

export const selectGroupEligibleCourses = (courses = []) =>
    courses.filter(isGroupEligibleCourse);

export const selectPendingDeliveryCourses = (courses = []) =>
    courses.filter(
        (course) =>
            DELIVERY_COURSE_TYPE_SET.has(normalizeCourseType(course)) &&
            !isGroupEligibleCourse(course)
    );

export const isIndividualGroup = (group = {}) => group.deliveryMode === 'individual';
export const isOpenForEnrollment = (group = {}) => ['open', 'active'].includes(String(group.status || ''));
export const hasGroupLiveMeeting = (group = {}) => Boolean(group.meetingProvider || group.meetingUrl);

export const canEnrollInGroupForCourse = ({
    course,
    group,
    needsLiveMeeting = false,
    needsSession = false,
}) => {
    if (!isOpenForEnrollment(group)) return false;
    if (normalizeCourseType(course) !== 'online_live') return true;
    return !needsSession && (!needsLiveMeeting || hasGroupLiveMeeting(group));
};

export const findGroupCourseById = (courses = [], courseId) =>
    courses.find((course) => String(course.id) === String(courseId)) || null;

export const getNextSelectedGroupCourseId = ({
    deliveryCourses = [],
    requestedCourseId = '',
    selectedCourseId = '',
}) => {
    const hasRequestedCourse =
        requestedCourseId &&
        deliveryCourses.some((course) => String(course.id) === String(requestedCourseId));

    if (hasRequestedCourse && String(selectedCourseId) !== String(requestedCourseId)) {
        return String(requestedCourseId);
    }

    if (
        selectedCourseId &&
        !deliveryCourses.some((course) => String(course.id) === String(selectedCourseId))
    ) {
        return deliveryCourses.length ? String(deliveryCourses[0].id) : '';
    }

    if (!selectedCourseId && deliveryCourses.length) {
        return hasRequestedCourse ? String(requestedCourseId) : String(deliveryCourses[0].id);
    }

    return selectedCourseId;
};

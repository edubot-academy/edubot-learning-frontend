export const COURSE_LIFECYCLE_STATES = Object.freeze({
    PUBLISHED: 'published',
    PENDING: 'pending',
    REJECTED: 'rejected',
    DRAFT: 'draft',
});

const DEFAULT_LIFECYCLE_BADGE_CLASSES = Object.freeze({
    [COURSE_LIFECYCLE_STATES.PUBLISHED]: 'bg-green-100 text-gray-700 dark:text-[#a6adba]',
    [COURSE_LIFECYCLE_STATES.PENDING]: 'bg-yellow-100 text-yellow-700',
    [COURSE_LIFECYCLE_STATES.REJECTED]: 'bg-red-100 text-red-700',
    [COURSE_LIFECYCLE_STATES.DRAFT]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
});

export const getCourseLifecycleState = (course) => {
    if (course?.status === 'approved' || course?.isPublished) {
        return COURSE_LIFECYCLE_STATES.PUBLISHED;
    }

    if (course?.status === 'pending') {
        return COURSE_LIFECYCLE_STATES.PENDING;
    }

    if (course?.status === 'rejected') {
        return COURSE_LIFECYCLE_STATES.REJECTED;
    }

    return COURSE_LIFECYCLE_STATES.DRAFT;
};

export const getCourseLifecycleMeta = (course, labels = {}, badgeClasses = {}) => {
    const state = getCourseLifecycleState(course);
    const getBadgeClass = (nextState) =>
        badgeClasses[nextState] ?? DEFAULT_LIFECYCLE_BADGE_CLASSES[nextState];

    if (state === COURSE_LIFECYCLE_STATES.PUBLISHED) {
        return {
            state,
            label: labels.published ?? 'Published',
            primaryActionLabel: labels.manage ?? 'Manage',
            badgeClass: getBadgeClass(state),
        };
    }

    if (state === COURSE_LIFECYCLE_STATES.PENDING) {
        return {
            state,
            label: labels.pending ?? 'In review',
            primaryActionLabel: labels.review ?? 'Review',
            badgeClass: getBadgeClass(state),
        };
    }

    if (state === COURSE_LIFECYCLE_STATES.REJECTED) {
        return {
            state,
            label: labels.rejected ?? 'Needs changes',
            primaryActionLabel: labels.fix ?? 'Fix',
            badgeClass: getBadgeClass(state),
        };
    }

    return {
        state,
        label: labels.draft ?? 'Draft',
        primaryActionLabel: labels.edit ?? 'Edit',
        badgeClass: getBadgeClass(state),
    };
};

export const COURSE_LIFECYCLE_STATES = Object.freeze({
    PUBLISHED: 'published',
    PENDING: 'pending',
    REJECTED: 'rejected',
    DRAFT: 'draft',
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

export const getCourseLifecycleMeta = (course) => {
    const state = getCourseLifecycleState(course);

    if (state === COURSE_LIFECYCLE_STATES.PUBLISHED) {
        return {
            state,
            label: 'Жарыяланды',
            primaryActionLabel: 'Башкаруу',
            badgeClass: 'bg-green-100 text-gray-700 dark:text-[#a6adba]',
        };
    }

    if (state === COURSE_LIFECYCLE_STATES.PENDING) {
        return {
            state,
            label: 'Каралууда',
            primaryActionLabel: 'Текшерүү',
            badgeClass: 'bg-yellow-100 text-yellow-700',
        };
    }

    if (state === COURSE_LIFECYCLE_STATES.REJECTED) {
        return {
            state,
            label: 'Оңдоо керек',
            primaryActionLabel: 'Оңдоо',
            badgeClass: 'bg-red-100 text-red-700',
        };
    }

    return {
        state,
        label: 'Черновик',
        primaryActionLabel: 'Өзгөртүү',
        badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
};

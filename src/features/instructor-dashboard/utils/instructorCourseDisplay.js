import {
    COURSE_LIFECYCLE_STATES,
    getCourseLifecycleMeta,
} from './courseLifecycle';
import {
    COURSE_WORKFLOWS,
    getCourseWorkflow,
} from './instructorCourses';
import { getCourseTypeLabel } from '@shared/i18n/enumLabels';

export const getInstructorCourseFilters = (t) => [
    { value: 'all', label: t('instructorDashboard.coursesPage.filters.all') },
    { value: COURSE_LIFECYCLE_STATES.DRAFT, label: t('instructorDashboard.coursesPage.lifecycle.draft') },
    { value: COURSE_LIFECYCLE_STATES.PENDING, label: t('instructorDashboard.coursesPage.lifecycle.pending') },
    { value: COURSE_LIFECYCLE_STATES.PUBLISHED, label: t('instructorDashboard.coursesPage.lifecycle.published') },
    { value: COURSE_LIFECYCLE_STATES.REJECTED, label: t('instructorDashboard.coursesPage.lifecycle.rejected') },
];

export const getInstructorCourseWorkflowFilters = (t) => [
    { value: 'all', label: t('instructorDashboard.coursesPage.filters.allWorkflows') },
    { value: COURSE_WORKFLOWS.VIDEO, label: t('instructorDashboard.coursesPage.workflows.video') },
    { value: COURSE_WORKFLOWS.DELIVERY, label: t('instructorDashboard.coursesPage.workflows.delivery') },
];

export const getInstructorCourseDisplayData = (course, user, t) => {
    const courseId = course?.id ?? course?.courseId ?? '';
    const rawTitle = typeof course?.title === 'string' ? course.title.trim() : '';
    const title = rawTitle || (courseId
        ? t('instructorDashboard.coursesPage.fallbacks.courseWithId', { id: courseId })
        : t('instructorDashboard.coursesPage.fallbacks.untitledCourse'));
    const instructorName =
        course?.instructor?.fullName ||
        user?.fullName ||
        t('instructorDashboard.coursesPage.fallbacks.noInstructor');
    const hasPrice = course?.price !== null && course?.price !== undefined && course?.price !== '';
    const price = hasPrice ? Number(course.price) : Number.NaN;
    const lifecycle = getCourseLifecycleMeta(course, {
        published: t('instructorDashboard.coursesPage.lifecycle.published'),
        pending: t('instructorDashboard.coursesPage.lifecycle.pending'),
        rejected: t('instructorDashboard.coursesPage.lifecycle.rejected'),
        draft: t('instructorDashboard.coursesPage.lifecycle.draft'),
        manage: t('instructorDashboard.coursesPage.actions.manage'),
        review: t('instructorDashboard.coursesPage.actions.review'),
        fix: t('instructorDashboard.coursesPage.actions.fix'),
        edit: t('instructorDashboard.coursesPage.actions.edit'),
    });

    return {
        courseId,
        coverImageUrl: typeof course?.coverImageUrl === 'string' ? course.coverImageUrl.trim() : '',
        instructorName,
        lifecycle,
        priceLabel: Number.isFinite(price)
            ? t('instructorDashboard.coursesPage.price.value', { value: price })
            : t('instructorDashboard.coursesPage.price.missing'),
        title,
        workflow: getCourseWorkflow(course),
        typeLabel: getCourseTypeLabel(course?.courseType || course?.type, t),
    };
};

export const toInstructorCourseDisplayItems = (courses, user, t) =>
    courses.map((course) => ({
        raw: course,
        display: getInstructorCourseDisplayData(course, user, t),
    }));

export const getInstructorCourseLifecycleCounts = (courseDisplayItems) =>
    courseDisplayItems.reduce(
        (acc, item) => ({
            ...acc,
            [item.display.lifecycle.state]: (acc[item.display.lifecycle.state] || 0) + 1,
        }),
        {}
    );

export const getInstructorCourseWorkflowCounts = (courseDisplayItems) =>
    courseDisplayItems.reduce(
        (acc, item) => ({
            ...acc,
            [item.display.workflow]: (acc[item.display.workflow] || 0) + 1,
        }),
        {
            [COURSE_WORKFLOWS.VIDEO]: 0,
            [COURSE_WORKFLOWS.DELIVERY]: 0,
        }
    );

export const filterInstructorCourseDisplayItems = (
    courseDisplayItems,
    { query = '', statusFilter = 'all', typeFilter = 'all' } = {}
) => {
    const normalizedQuery = query.trim().toLowerCase();

    return courseDisplayItems.filter(({ display }) => {
        const matchesStatus =
            statusFilter === 'all' || display.lifecycle.state === statusFilter;
        const matchesType = typeFilter === 'all' || display.workflow === typeFilter;
        const matchesQuery =
            !normalizedQuery ||
            display.title.toLowerCase().includes(normalizedQuery) ||
            display.instructorName.toLowerCase().includes(normalizedQuery) ||
            display.typeLabel.toLowerCase().includes(normalizedQuery);

        return matchesStatus && matchesType && matchesQuery;
    });
};

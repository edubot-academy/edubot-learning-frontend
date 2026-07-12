import {
    COURSE_LIFECYCLE_STATES,
    getCourseLifecycleMeta,
} from './courseLifecycle';
import {
    COURSE_WORKFLOWS,
    getCourseWorkflow,
} from './instructorCourses';
import { getCourseTypeLabel } from '@shared/i18n/enumLabels';

export const INSTRUCTOR_COURSE_FILTER_ALL = 'all';

const LIFECYCLE_FILTERS = Object.freeze([
    COURSE_LIFECYCLE_STATES.DRAFT,
    COURSE_LIFECYCLE_STATES.PENDING,
    COURSE_LIFECYCLE_STATES.PUBLISHED,
    COURSE_LIFECYCLE_STATES.REJECTED,
]);

const WORKFLOW_FILTERS = Object.freeze([
    COURSE_WORKFLOWS.VIDEO,
    COURSE_WORKFLOWS.DELIVERY,
]);

const getTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const includesNormalized = (value, normalizedQuery) =>
    String(value || '').toLowerCase().includes(normalizedQuery);

const getLifecycleLabels = (t) => ({
    published: t('instructorDashboard.coursesPage.lifecycle.published'),
    pending: t('instructorDashboard.coursesPage.lifecycle.pending'),
    rejected: t('instructorDashboard.coursesPage.lifecycle.rejected'),
    draft: t('instructorDashboard.coursesPage.lifecycle.draft'),
    manage: t('instructorDashboard.coursesPage.actions.manage'),
    review: t('instructorDashboard.coursesPage.actions.review'),
    fix: t('instructorDashboard.coursesPage.actions.fix'),
    edit: t('instructorDashboard.coursesPage.actions.edit'),
});

export const getInstructorCourseFilters = (t) => [
    { value: INSTRUCTOR_COURSE_FILTER_ALL, label: t('instructorDashboard.coursesPage.filters.all') },
    ...LIFECYCLE_FILTERS.map((state) => ({
        value: state,
        label: t(`instructorDashboard.coursesPage.lifecycle.${state}`),
    })),
];

export const getInstructorCourseWorkflowFilters = (t) => [
    {
        value: INSTRUCTOR_COURSE_FILTER_ALL,
        label: t('instructorDashboard.coursesPage.filters.allWorkflows'),
    },
    ...WORKFLOW_FILTERS.map((workflow) => ({
        value: workflow,
        label: t(`instructorDashboard.coursesPage.workflows.${workflow}`),
    })),
];

export const getInstructorCourseDisplayData = (course, user, t) => {
    const courseId = course?.id ?? course?.courseId ?? '';
    const rawTitle = getTrimmedString(course?.title);
    const title = rawTitle || (courseId
        ? t('instructorDashboard.coursesPage.fallbacks.courseWithId', { id: courseId })
        : t('instructorDashboard.coursesPage.fallbacks.untitledCourse'));
    const instructorName =
        course?.instructor?.fullName ||
        user?.fullName ||
        t('instructorDashboard.coursesPage.fallbacks.noInstructor');
    const hasPrice = course?.price !== null && course?.price !== undefined && course?.price !== '';
    const price = hasPrice ? Number(course.price) : Number.NaN;
    const lifecycle = getCourseLifecycleMeta(course, getLifecycleLabels(t));

    return {
        courseId,
        coverImageUrl: getTrimmedString(course?.coverImageUrl),
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
    courseDisplayItems.reduce((acc, item) => {
        const state = item.display.lifecycle.state;
        acc[state] = (acc[state] || 0) + 1;
        return acc;
    }, {});

export const getInstructorCourseWorkflowCounts = (courseDisplayItems) =>
    courseDisplayItems.reduce(
        (acc, item) => {
            acc[item.display.workflow] = (acc[item.display.workflow] || 0) + 1;
            return acc;
        },
        Object.fromEntries(WORKFLOW_FILTERS.map((workflow) => [workflow, 0]))
    );

export const filterInstructorCourseDisplayItems = (
    courseDisplayItems,
    {
        query = '',
        statusFilter = INSTRUCTOR_COURSE_FILTER_ALL,
        typeFilter = INSTRUCTOR_COURSE_FILTER_ALL,
    } = {}
) => {
    const normalizedQuery = query.trim().toLowerCase();

    return courseDisplayItems.filter(({ display }) => {
        const matchesStatus =
            statusFilter === INSTRUCTOR_COURSE_FILTER_ALL ||
            display.lifecycle.state === statusFilter;
        const matchesType =
            typeFilter === INSTRUCTOR_COURSE_FILTER_ALL || display.workflow === typeFilter;
        const matchesQuery =
            !normalizedQuery ||
            includesNormalized(display.title, normalizedQuery) ||
            includesNormalized(display.instructorName, normalizedQuery) ||
            includesNormalized(display.typeLabel, normalizedQuery);

        return matchesStatus && matchesType && matchesQuery;
    });
};

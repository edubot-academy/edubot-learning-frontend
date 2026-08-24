export const COURSE_STATUS_STRATEGY = {
    COMPANY_COURSES: 'companyCourses',
    TENANT_DETAIL: 'tenantDetail',
    INSTRUCTOR_STUDENTS: 'instructorStudents',
};

export const COURSE_VISIBILITY_OPTIONS = ['PUBLIC', 'PRIVATE', 'TENANT_ONLY'];

const normalizeStatusText = (value) => String(value || '').toLowerCase();

export const getNormalizedCourseStatus = (
    course = {},
    strategy = COURSE_STATUS_STRATEGY.COMPANY_COURSES
) => {
    const status = course?.status ? normalizeStatusText(course.status) : '';

    if (strategy === COURSE_STATUS_STRATEGY.TENANT_DETAIL) {
        if (status) return status;
        if (course?.isPublished || course?.published) return 'published';
        if (course?.approved) return 'approved';
        return 'draft';
    }

    if (strategy === COURSE_STATUS_STRATEGY.INSTRUCTOR_STUDENTS) {
        if (course?.isPublished) return 'published';
        if (['approved', 'rejected', 'draft'].includes(status)) return status;
        return 'pending';
    }

    if (status) return status;
    if (typeof course?.isPublished === 'boolean') {
        return course.isPublished ? 'published' : 'draft';
    }
    return 'unknown';
};

export const getCourseStatusLabel = (
    course,
    t,
    {
        namespace = 'company.courses.status',
        strategy = COURSE_STATUS_STRATEGY.COMPANY_COURSES,
    } = {}
) => {
    const status = getNormalizedCourseStatus(course, strategy);
    return t(`${namespace}.${status}`, {
        defaultValue: status.replace(/_/g, ' '),
    });
};

export const getCourseVisibilityLabel = (visibility, t) => {
    const normalizedVisibility = String(visibility || 'PUBLIC').toUpperCase();
    return t(`company.platformTenant.courseVisibility.${normalizedVisibility}`, {
        defaultValue: normalizedVisibility.replace(/_/g, ' '),
    });
};

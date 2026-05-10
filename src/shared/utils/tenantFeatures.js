export const TENANT_FEATURES = {
    OFFLINE_COURSES: 'courses.offline.enabled',
    ONLINE_LIVE_COURSES: 'courses.onlineLive.enabled',
    CERTIFICATES: 'certificates.enabled',
    ATTENDANCE: 'attendance.enabled',
    HOMEWORK: 'homework.enabled',
    AI_ASSISTANT: 'aiAssistant.enabled',
};

const normalizeFlags = (tenantOrFlags) => {
    if (!tenantOrFlags || typeof tenantOrFlags !== 'object') return {};
    return tenantOrFlags.featureFlags && typeof tenantOrFlags.featureFlags === 'object'
        ? tenantOrFlags.featureFlags
        : tenantOrFlags;
};

export const isTenantFeatureEnabled = (tenantOrFlags, key) => {
    const flags = normalizeFlags(tenantOrFlags);
    return flags?.[key] !== false;
};

export const isCourseTypeAllowedForTenant = (tenant, courseType) => {
    const normalizedType = String(courseType || '').toLowerCase();
    if (normalizedType === 'offline') {
        return isTenantFeatureEnabled(tenant, TENANT_FEATURES.OFFLINE_COURSES);
    }
    if (normalizedType === 'online_live') {
        return isTenantFeatureEnabled(tenant, TENANT_FEATURES.ONLINE_LIVE_COURSES);
    }
    return true;
};

const COURSE_TYPE_AVAILABILITY_KEYS = {
    offline: 'offlineCourses',
    online_live: 'onlineLiveCourses',
};

export const isCourseTypeAllowedForCourse = (course, courseType = course?.courseType) => {
    const normalizedType = String(courseType || '').toLowerCase();
    const availabilityKey = COURSE_TYPE_AVAILABILITY_KEYS[normalizedType];
    if (!availabilityKey) return true;
    return course?.tenantFeatureAvailability?.[availabilityKey] !== false;
};

export const getCourseTypeTenantDisabledMessage = (courseType) => {
    const normalizedType = String(courseType || '').toLowerCase();
    if (normalizedType === 'offline') return 'Offline courses are disabled for this tenant.';
    if (normalizedType === 'online_live') return 'Online live courses are disabled for this tenant.';
    return 'This course type is disabled for this tenant.';
};

const firstTenantFromCourse = (course) => {
    if (!course || typeof course !== 'object') return null;
    if (course.company?.featureFlags) return course.company;
    if (course.tenant?.featureFlags) return course.tenant;
    if (Array.isArray(course.companies)) {
        const companiesWithFlags = course.companies.filter((company) => company?.featureFlags);
        return companiesWithFlags.length === 1 ? companiesWithFlags[0] : null;
    }
    if (Array.isArray(course.companyLinks)) {
        const companiesWithFlags = course.companyLinks
            .map((link) => link?.company)
            .filter((company) => company?.featureFlags);
        return companiesWithFlags.length === 1 ? companiesWithFlags[0] : null;
    }
    return null;
};

export const isCourseFeatureEnabled = (course, key) => {
    const availabilityKey = {
        [TENANT_FEATURES.OFFLINE_COURSES]: 'offlineCourses',
        [TENANT_FEATURES.ONLINE_LIVE_COURSES]: 'onlineLiveCourses',
        [TENANT_FEATURES.CERTIFICATES]: 'certificates',
        [TENANT_FEATURES.ATTENDANCE]: 'attendance',
        [TENANT_FEATURES.HOMEWORK]: 'homework',
        [TENANT_FEATURES.AI_ASSISTANT]: 'aiAssistant',
    }[key];

    if (availabilityKey && course?.tenantFeatureAvailability?.[availabilityKey] === false) {
        return false;
    }

    const tenant = firstTenantFromCourse(course);
    return tenant ? isTenantFeatureEnabled(tenant, key) : true;
};

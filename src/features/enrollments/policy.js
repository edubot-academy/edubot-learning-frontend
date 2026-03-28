import { COURSE_TYPE } from '@shared/contracts';

const normalizeEnrollmentCourseType = (courseType) => {
    const normalized = String(courseType || '').trim().toLowerCase();
    if (Object.values(COURSE_TYPE).includes(normalized)) {
        return normalized;
    }
    return COURSE_TYPE.VIDEO;
};

const isDeliveryCourseType = (courseType) => {
    const normalized = normalizeEnrollmentCourseType(courseType);
    return normalized === COURSE_TYPE.OFFLINE || normalized === COURSE_TYPE.ONLINE_LIVE;
};

const canStudentSelfEnroll = (courseType) =>
    normalizeEnrollmentCourseType(courseType) === COURSE_TYPE.VIDEO;

const getEnrollmentSourceMode = ({ role, courseType }) => {
    if (role === 'student') {
        return canStudentSelfEnroll(courseType) ? 'lms_checkout' : 'crm_request';
    }

    if (role === 'admin' || role === 'instructor' || role === 'assistant') {
        return 'lms_manual';
    }

    return 'unknown';
};

const validateManualEnrollmentContext = ({ courseType, offeringId, groupId }) => {
    if (!isDeliveryCourseType(courseType)) return;

    const hasOffering = Number.isInteger(Number(offeringId)) && Number(offeringId) > 0;
    const hasGroup = Number.isInteger(Number(groupId)) && Number(groupId) > 0;

    if (!hasOffering && !hasGroup) {
        throw new Error(
            'Offline and online live courses require an offering or group context for manual enrollment'
        );
    }
};

export {
    normalizeEnrollmentCourseType,
    isDeliveryCourseType,
    canStudentSelfEnroll,
    getEnrollmentSourceMode,
    validateManualEnrollmentContext,
};

import { COURSE_TYPE } from '@shared/contracts/enums';

export const COURSE_TYPE_LABEL_KEYS = Object.freeze({
    [COURSE_TYPE.VIDEO]: 'common.enums.courseTypes.video',
    [COURSE_TYPE.OFFLINE]: 'common.enums.courseTypes.offline',
    [COURSE_TYPE.ONLINE_LIVE]: 'common.enums.courseTypes.onlineLive',
});

export const DELIVERY_MODE_LABEL_KEYS = Object.freeze({
    group: 'common.enums.deliveryModes.group',
    individual: 'common.enums.deliveryModes.individual',
});

export const CERTIFICATE_STATUS_LABEL_KEYS = Object.freeze({
    issued: 'common.enums.certificateStatuses.issued',
    pending_approval: 'common.enums.certificateStatuses.pendingApproval',
    pending: 'common.enums.certificateStatuses.pending',
    rejected: 'common.enums.certificateStatuses.rejected',
    revoked: 'common.enums.certificateStatuses.revoked',
    none: 'common.enums.certificateStatuses.none',
});

export const PAGE_ORIENTATION_LABEL_KEYS = Object.freeze({
    landscape: 'common.enums.pageOrientations.landscape',
    portrait: 'common.enums.pageOrientations.portrait',
});

const normalizeEnumValue = (value, fallback) =>
    String(value || fallback)
        .trim()
        .toLowerCase();

export const getCourseTypeLabel = (value, t) => {
    const normalized = normalizeEnumValue(value, COURSE_TYPE.VIDEO);
    return t(COURSE_TYPE_LABEL_KEYS[normalized] || COURSE_TYPE_LABEL_KEYS[COURSE_TYPE.VIDEO]);
};

export const getDeliveryModeLabel = (value, t) => {
    const normalized = normalizeEnumValue(value, 'group');
    return t(DELIVERY_MODE_LABEL_KEYS[normalized] || DELIVERY_MODE_LABEL_KEYS.group);
};

export const getCertificateStatusLabel = (value, t) => {
    const normalized = normalizeEnumValue(value, 'none');
    return t(CERTIFICATE_STATUS_LABEL_KEYS[normalized] || CERTIFICATE_STATUS_LABEL_KEYS.none);
};

export const getPageOrientationLabel = (value, t) => {
    const normalized = normalizeEnumValue(value, 'landscape');
    return t(PAGE_ORIENTATION_LABEL_KEYS[normalized] || PAGE_ORIENTATION_LABEL_KEYS.landscape);
};

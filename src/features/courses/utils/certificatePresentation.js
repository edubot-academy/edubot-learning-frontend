import { formatShortDate } from '@utils/timeUtils';

export const CERTIFICATE_STATUS = {
    ISSUED: 'issued',
    PENDING_APPROVAL: 'pending_approval',
    REJECTED: 'rejected',
    REVOKED: 'revoked',
};

export const CERTIFICATE_STATS_EMPTY = Object.freeze({
    issued: 0,
    pending: 0,
    rejected: 0,
    revoked: 0,
});

export const clampCertificateProgress = (value) => {
    const progress = Number(value || 0);
    if (!Number.isFinite(progress)) return 0;
    return Math.max(0, Math.min(100, progress));
};

export const formatCertificateDate = (value, language = 'ky') => {
    return formatShortDate(value, language);
};

export const getAdminCertificateStatusMeta = (status) => {
    if (status === CERTIFICATE_STATUS.ISSUED) {
        return {
            labelKey: 'adminCertificates.status.issued',
            className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        };
    }
    if (status === CERTIFICATE_STATUS.PENDING_APPROVAL) {
        return {
            labelKey: 'adminCertificates.status.pending_approval',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        };
    }
    if (status === CERTIFICATE_STATUS.REJECTED) {
        return {
            labelKey: 'adminCertificates.status.rejected',
            className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
        };
    }
    if (status === CERTIFICATE_STATUS.REVOKED) {
        return {
            labelKey: 'adminCertificates.status.revoked',
            className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        };
    }
    return {
        labelKey: 'adminCertificates.status.none',
        className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    };
};

export const getCertificateStats = (certificates = []) =>
    certificates.reduce(
        (acc, item) => {
            if (item?.status === CERTIFICATE_STATUS.ISSUED) acc.issued += 1;
            else if (item?.status === CERTIFICATE_STATUS.PENDING_APPROVAL) acc.pending += 1;
            else if (item?.status === CERTIFICATE_STATUS.REVOKED) acc.revoked += 1;
            else if (item?.status === CERTIFICATE_STATUS.REJECTED) acc.rejected += 1;
            return acc;
        },
        { ...CERTIFICATE_STATS_EMPTY }
    );

export const getStudentCertificateStatusMeta = (status, namespace = 'certificates') => {
    const labelPrefix =
        namespace === 'progress'
            ? 'studentDashboard.progress.certificateBadges'
            : 'studentDashboard.certificates.statuses';

    if (status === CERTIFICATE_STATUS.ISSUED) {
        return {
            labelKey: `${labelPrefix}.${namespace === 'progress' ? 'ready' : 'issued'}`,
            className:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }
    if (status === CERTIFICATE_STATUS.PENDING_APPROVAL) {
        return {
            labelKey: `${labelPrefix}.pending`,
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (status === CERTIFICATE_STATUS.REJECTED) {
        return {
            labelKey: `${labelPrefix}.rejected`,
            className:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    if (status === CERTIFICATE_STATUS.REVOKED) {
        return {
            labelKey: `${labelPrefix}.revoked`,
            className:
                'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        };
    }
    if (namespace === 'progress') return null;
    return {
        labelKey: `${labelPrefix}.unknown`,
        className:
            'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
    };
};

export const getStudentCertificateReadinessMeta = (status) => {
    if (status === CERTIFICATE_STATUS.ISSUED) {
        return {
            labelKey: 'studentDashboard.progress.certificateReadiness.ready',
            className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }
    if (status === CERTIFICATE_STATUS.PENDING_APPROVAL) {
        return {
            labelKey: 'studentDashboard.progress.certificateReadiness.pending',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (status === CERTIFICATE_STATUS.REJECTED) {
        return {
            labelKey: 'studentDashboard.progress.certificateReadiness.rejected',
            className: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    return {
        labelKey: 'studentDashboard.progress.certificateReadiness.notReady',
        className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    };
};

export const getCertificateDownloadKey = (certificate = {}) =>
    certificate.publicId || certificate.id || certificate.courseId;

export const getCertificatePdfFilename = (certificate = {}, fallback = 'student') =>
    `certificate-${certificate.publicId || certificate.courseId || certificate.id || fallback}.pdf`;

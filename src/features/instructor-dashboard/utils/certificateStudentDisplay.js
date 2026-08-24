import { getCertificateStatusLabel } from '@shared/i18n/enumLabels';
import {
    CERTIFICATE_STATUS,
    clampCertificateProgress,
    getCertificateStats,
} from '@features/courses/utils/certificatePresentation';

const ELIGIBILITY_REASON_LABEL_KEYS = {
    activities_below_threshold: 'adminCertificates.eligibilityReasons.activitiesBelowThreshold',
    attendance_below_threshold: 'adminCertificates.eligibilityReasons.attendanceBelowThreshold',
    homework_below_threshold: 'adminCertificates.eligibilityReasons.homeworkBelowThreshold',
    lesson_progress_incomplete: 'adminCertificates.eligibilityReasons.lessonProgressIncomplete',
    sessions_incomplete: 'adminCertificates.eligibilityReasons.sessionsIncomplete',
    sessions_missing: 'adminCertificates.eligibilityReasons.sessionsMissing',
};

export const getCertificateBadge = (status) => {
    if (status === CERTIFICATE_STATUS.ISSUED) {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
    }
    if (status === CERTIFICATE_STATUS.PENDING_APPROVAL) {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    }
    if (status === CERTIFICATE_STATUS.REJECTED) {
        return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
    }
    if (status === CERTIFICATE_STATUS.REVOKED) {
        return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
};

export const getStudentCertificateStatusLabel = (status, t) =>
    getCertificateStatusLabel(status, t);

export const isStudentEligibleForCertificate = (student) => {
    const progress = clampCertificateProgress(student?.progressPercent);
    return Boolean(student?.certificateEligible) || Boolean(student?.completed) || progress >= 100;
};

const getMissingEligibilityText = (reasons, t) => {
    if (!Array.isArray(reasons) || !reasons.length) return '';
    return reasons
        .map((reason) => {
            const labelKey = ELIGIBILITY_REASON_LABEL_KEYS[reason];
            return labelKey ? t(labelKey) : null;
        })
        .filter(Boolean)
        .join(', ');
};

export const getStudentCertificateState = (student, canIssueManually = true, t) => {
    const progress = clampCertificateProgress(student?.progressPercent);
    const eligibility = student?.certificateEligibility;
    const isComplete = isStudentEligibleForCertificate(student);

    if (student?.certificateStatus === CERTIFICATE_STATUS.ISSUED) {
        return {
            canIssue: false,
            buttonLabel: t('adminCertificates.state.issued.button'),
            helperText: t('adminCertificates.state.issued.helper'),
            helperTone: 'text-emerald-600 dark:text-emerald-300',
        };
    }

    if (student?.certificateStatus === CERTIFICATE_STATUS.PENDING_APPROVAL) {
        return {
            canIssue: false,
            buttonLabel: t('adminCertificates.state.pending.button'),
            helperText: t('adminCertificates.state.pending.helper'),
            helperTone: 'text-amber-600 dark:text-amber-300',
        };
    }

    if (!isComplete) {
        const missing = getMissingEligibilityText(eligibility?.reasons, t);
        return {
            canIssue: canIssueManually,
            buttonLabel: canIssueManually
                ? t('adminCertificates.actions.issue')
                : t('adminCertificates.state.incomplete.requirementsButton'),
            helperText: canIssueManually
                ? missing
                    ? t('adminCertificates.state.incomplete.manualWithMissing', { missing })
                    : t('adminCertificates.state.incomplete.manualWithProgress', { progress })
                : missing
                  ? t('adminCertificates.state.incomplete.blockedWithMissing', { missing })
                  : t('adminCertificates.state.incomplete.blockedWithProgress', { progress }),
            helperTone: 'text-amber-600 dark:text-amber-300',
        };
    }

    if (student?.certificateStatus === CERTIFICATE_STATUS.REJECTED) {
        return {
            canIssue: canIssueManually,
            buttonLabel: canIssueManually
                ? t('adminCertificates.actions.reissue')
                : t('adminCertificates.status.rejected'),
            helperText: canIssueManually
                ? t('adminCertificates.state.rejected.manualHelper')
                : t('adminCertificates.state.rejected.helper'),
            helperTone: 'text-red-600 dark:text-red-300',
        };
    }

    if (student?.certificateStatus === CERTIFICATE_STATUS.REVOKED) {
        return {
            canIssue: canIssueManually,
            buttonLabel: canIssueManually
                ? t('adminCertificates.actions.reissue')
                : t('adminCertificates.status.revoked'),
            helperText: canIssueManually
                ? t('adminCertificates.state.revoked.manualHelper')
                : t('adminCertificates.state.revoked.helper'),
            helperTone: 'text-slate-600 dark:text-slate-300',
        };
    }

    return {
        canIssue: canIssueManually,
        buttonLabel: canIssueManually
            ? t('adminCertificates.actions.issue')
            : t('adminCertificates.state.ready.button'),
        helperText: canIssueManually
            ? t('adminCertificates.state.ready.manualHelper')
            : t('adminCertificates.state.ready.helper'),
        helperTone: 'text-emerald-600 dark:text-emerald-300',
    };
};

export { getCertificateStats };

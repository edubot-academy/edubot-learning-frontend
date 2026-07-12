import { getCertificateStatusLabel } from '@shared/i18n/enumLabels';

const clampProgress = (value) => {
    const progress = Number(value || 0);
    if (!Number.isFinite(progress)) return 0;
    return Math.max(0, Math.min(100, progress));
};

const ELIGIBILITY_REASON_LABEL_KEYS = {
    activities_below_threshold: 'adminCertificates.eligibilityReasons.activitiesBelowThreshold',
    attendance_below_threshold: 'adminCertificates.eligibilityReasons.attendanceBelowThreshold',
    homework_below_threshold: 'adminCertificates.eligibilityReasons.homeworkBelowThreshold',
    lesson_progress_incomplete: 'adminCertificates.eligibilityReasons.lessonProgressIncomplete',
    sessions_incomplete: 'adminCertificates.eligibilityReasons.sessionsIncomplete',
    sessions_missing: 'adminCertificates.eligibilityReasons.sessionsMissing',
};

export const getCertificateBadge = (status) => {
    if (status === 'issued') {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
    }
    if (status === 'pending_approval') {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    }
    if (status === 'rejected') {
        return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
    }
    if (status === 'revoked') {
        return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
};

export const getStudentCertificateStatusLabel = (status, t) =>
    getCertificateStatusLabel(status, t);

export const isStudentEligibleForCertificate = (student) => {
    const progress = clampProgress(student?.progressPercent);
    return Boolean(student?.certificateEligible) || Boolean(student?.completed) || progress >= 100;
};

export const getCertificateStats = (courseCertificates = []) =>
    courseCertificates.reduce(
        (acc, item) => {
            if (item?.status === 'issued') acc.issued += 1;
            else if (item?.status === 'pending_approval') acc.pending += 1;
            else if (item?.status === 'revoked') acc.revoked += 1;
            else if (item?.status === 'rejected') acc.rejected += 1;
            return acc;
        },
        { issued: 0, pending: 0, revoked: 0, rejected: 0 }
    );

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
    const progress = clampProgress(student?.progressPercent);
    const eligibility = student?.certificateEligibility;
    const isComplete = isStudentEligibleForCertificate(student);

    if (student?.certificateStatus === 'issued') {
        return {
            canIssue: false,
            buttonLabel: t('adminCertificates.state.issued.button'),
            helperText: t('adminCertificates.state.issued.helper'),
            helperTone: 'text-emerald-600 dark:text-emerald-300',
        };
    }

    if (student?.certificateStatus === 'pending_approval') {
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

    if (student?.certificateStatus === 'rejected') {
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

    if (student?.certificateStatus === 'revoked') {
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

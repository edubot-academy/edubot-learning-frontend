import { describe, expect, it, vi } from 'vitest';
import {
    getCertificateBadge,
    getCertificateStats,
    getStudentCertificateState,
    isStudentEligibleForCertificate,
} from './certificateStudentDisplay';

vi.mock('@shared/i18n/enumLabels', () => ({
    getCertificateStatusLabel: (status) => `status:${status || 'none'}`,
}));

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key);

describe('certificate student display utilities', () => {
    it('maps certificate statuses to badge classes', () => {
        expect(getCertificateBadge('issued')).toContain('emerald');
        expect(getCertificateBadge('pending_approval')).toContain('amber');
        expect(getCertificateBadge('rejected')).toContain('red');
        expect(getCertificateBadge('revoked')).toContain('slate');
        expect(getCertificateBadge(null)).toContain('slate');
    });

    it('counts certificate registry statuses', () => {
        expect(
            getCertificateStats([
                { status: 'issued' },
                { status: 'issued' },
                { status: 'pending_approval' },
                { status: 'revoked' },
                { status: 'rejected' },
                { status: 'unknown' },
                null,
            ])
        ).toEqual({
            issued: 2,
            pending: 1,
            rejected: 1,
            revoked: 1,
        });
    });

    it('treats explicit eligibility, completion, or full progress as certificate eligible', () => {
        expect(isStudentEligibleForCertificate({ certificateEligible: true })).toBe(true);
        expect(isStudentEligibleForCertificate({ completed: true })).toBe(true);
        expect(isStudentEligibleForCertificate({ progressPercent: 100 })).toBe(true);
        expect(isStudentEligibleForCertificate({ progressPercent: 99 })).toBe(false);
        expect(isStudentEligibleForCertificate({ progressPercent: 'not-a-number' })).toBe(false);
    });

    it('blocks issued and pending certificates from manual issuing', () => {
        expect(getStudentCertificateState({ certificateStatus: 'issued' }, true, t)).toMatchObject({
            canIssue: false,
            buttonLabel: 'adminCertificates.state.issued.button',
        });
        expect(
            getStudentCertificateState({ certificateStatus: 'pending_approval' }, true, t)
        ).toMatchObject({
            canIssue: false,
            buttonLabel: 'adminCertificates.state.pending.button',
        });
    });

    it('describes incomplete students with translated missing requirements', () => {
        const state = getStudentCertificateState(
            {
                certificateEligibility: {
                    reasons: ['sessions_missing', 'homework_below_threshold', 'unknown'],
                },
                progressPercent: 40,
            },
            true,
            t
        );

        expect(state.canIssue).toBe(true);
        expect(state.buttonLabel).toBe('adminCertificates.actions.issue');
        expect(state.helperText).toContain('adminCertificates.state.incomplete.manualWithMissing');
        expect(state.helperText).toContain(
            'adminCertificates.eligibilityReasons.sessionsMissing'
        );
        expect(state.helperText).toContain(
            'adminCertificates.eligibilityReasons.homeworkBelowThreshold'
        );
        expect(state.helperText).not.toContain('unknown');
    });

    it('uses zero progress in incomplete helper text when progress is malformed', () => {
        const state = getStudentCertificateState(
            {
                progressPercent: 'not-a-number',
            },
            true,
            t
        );

        expect(state.helperText).toBe(
            'adminCertificates.state.incomplete.manualWithProgress:{"progress":0}'
        );
    });

    it('returns reissue state for rejected or revoked eligible students', () => {
        expect(
            getStudentCertificateState(
                { certificateStatus: 'rejected', progressPercent: 100 },
                true,
                t
            )
        ).toMatchObject({
            canIssue: true,
            buttonLabel: 'adminCertificates.actions.reissue',
        });
        expect(
            getStudentCertificateState(
                { certificateStatus: 'revoked', progressPercent: 100 },
                true,
                t
            )
        ).toMatchObject({
            canIssue: true,
            buttonLabel: 'adminCertificates.actions.reissue',
        });
    });
});

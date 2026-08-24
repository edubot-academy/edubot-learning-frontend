import { describe, expect, it } from 'vitest';
import {
    clampCertificateProgress,
    formatCertificateDate,
    getAdminCertificateStatusMeta,
    getCertificateDownloadKey,
    getCertificatePdfFilename,
    getCertificateStats,
    getStudentCertificateReadinessMeta,
    getStudentCertificateStatusMeta,
} from './certificatePresentation';

describe('certificate presentation utilities', () => {
    it('clamps certificate progress into a display-safe percentage', () => {
        expect(clampCertificateProgress(120)).toBe(100);
        expect(clampCertificateProgress(-10)).toBe(0);
        expect(clampCertificateProgress('not-a-number')).toBe(0);
        expect(clampCertificateProgress(72)).toBe(72);
    });

    it('formats valid dates and returns a dash for missing or invalid dates', () => {
        expect(formatCertificateDate(null)).toBe('—');
        expect(formatCertificateDate('not-a-date')).toBe('—');
        expect(formatCertificateDate('2026-07-13T09:30:00.000Z', 'en')).toContain('2026');
    });

    it('counts registry statuses without counting unknown records', () => {
        expect(
            getCertificateStats([
                { status: 'issued' },
                { status: 'pending_approval' },
                { status: 'revoked' },
                { status: 'rejected' },
                { status: 'unknown' },
            ])
        ).toEqual({
            issued: 1,
            pending: 1,
            rejected: 1,
            revoked: 1,
        });
    });

    it('builds status metadata for certificate and progress surfaces', () => {
        expect(getStudentCertificateStatusMeta('issued')).toMatchObject({
            labelKey: 'studentDashboard.certificates.statuses.issued',
        });
        expect(getStudentCertificateStatusMeta('issued', 'progress')).toMatchObject({
            labelKey: 'studentDashboard.progress.certificateBadges.ready',
        });
        expect(getStudentCertificateStatusMeta('unknown', 'progress')).toBeNull();
        expect(getStudentCertificateStatusMeta('unknown')).toMatchObject({
            labelKey: 'studentDashboard.certificates.statuses.unknown',
        });
    });

    it('builds compact admin status metadata without changing fallback styling', () => {
        expect(getAdminCertificateStatusMeta('issued')).toMatchObject({
            labelKey: 'adminCertificates.status.issued',
        });
        expect(getAdminCertificateStatusMeta('pending_approval').className).toContain('amber');
        expect(getAdminCertificateStatusMeta('rejected').className).toContain('red');
        expect(getAdminCertificateStatusMeta('revoked')).toMatchObject({
            labelKey: 'adminCertificates.status.revoked',
        });
        expect(getAdminCertificateStatusMeta('unknown')).toMatchObject({
            labelKey: 'adminCertificates.status.none',
        });
    });

    it('builds readiness metadata for student progress summaries', () => {
        expect(getStudentCertificateReadinessMeta('pending_approval')).toMatchObject({
            labelKey: 'studentDashboard.progress.certificateReadiness.pending',
        });
        expect(getStudentCertificateReadinessMeta('unknown')).toMatchObject({
            labelKey: 'studentDashboard.progress.certificateReadiness.notReady',
        });
    });

    it('derives stable download keys and filenames', () => {
        expect(getCertificateDownloadKey({ publicId: 'public', id: 2, courseId: 3 })).toBe(
            'public'
        );
        expect(getCertificateDownloadKey({ id: 2, courseId: 3 })).toBe(2);
        expect(getCertificatePdfFilename({ publicId: 'public', courseId: 3 })).toBe(
            'certificate-public.pdf'
        );
        expect(getCertificatePdfFilename({}, 'student')).toBe('certificate-student.pdf');
    });
});

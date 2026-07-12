import { describe, expect, it, vi } from 'vitest';
import {
    buildCertificateSettingsForm,
    CERTIFICATE_COLOR_PRESETS,
    CERTIFICATE_LANGUAGE_OPTIONS,
    DEFAULT_CERTIFICATE_LANGUAGE,
    getExactPreviewPayload,
    getTemplatePayload,
    hasTemplatePayloadChanges,
    STUDENT_PAGE_SIZE_OPTIONS,
} from './certificateTemplate';

describe('certificate template utilities', () => {
    it('exposes stable template option constants', () => {
        expect(DEFAULT_CERTIFICATE_LANGUAGE).toBe('en');
        expect(CERTIFICATE_LANGUAGE_OPTIONS.map((option) => option.value)).toEqual([
            'en',
            'ru',
            'ky',
        ]);
        expect(STUDENT_PAGE_SIZE_OPTIONS).toEqual([20, 50, 100]);
        expect(CERTIFICATE_COLOR_PRESETS[0]).toEqual({
            label: 'EduBot',
            primary: '#122144',
            accent: '#F17E22',
        });
    });

    it('builds admin form defaults from saved certificate settings', () => {
        expect(
            buildCertificateSettingsForm({
                certificateSettings: {
                    certificateLanguage: 'ru',
                    certificateTitle: 'Saved title',
                    issuerDisplayName: 'Saved issuer',
                    issuerTitle: 'Saved title',
                    secondaryBrandName: 'Partner',
                    eligibilityHomeworkRequired: true,
                    eligibilityHomeworkPercent: 90,
                },
                defaultCertificateTitle: 'Default title',
                defaultIssuerDisplayName: 'Default issuer',
                defaultIssuerTitle: 'Default role',
                isAdminMode: true,
            })
        ).toMatchObject({
            certificateLanguage: 'ru',
            certificateTitle: 'Saved title',
            eligibilityAttendancePercent: 80,
            eligibilityHomeworkPercent: 90,
            eligibilityHomeworkRequired: true,
            issuerDisplayName: 'Saved issuer',
            issuerTitle: 'Saved title',
            secondaryBrandName: 'Partner',
        });
    });

    it('forces instructor issuer defaults outside admin mode', () => {
        expect(
            buildCertificateSettingsForm({
                certificateSettings: {
                    issuerDisplayName: 'Saved issuer',
                    issuerTitle: 'Saved title',
                },
                defaultCertificateTitle: 'Default title',
                defaultIssuerDisplayName: 'Course instructor',
                defaultIssuerTitle: 'Instructor',
                isAdminMode: false,
            })
        ).toMatchObject({
            issuerDisplayName: 'Course instructor',
            issuerTitle: 'Instructor',
        });
    });

    it('builds admin template payloads with admin-only styling and eligibility fields', () => {
        const payload = getTemplatePayload(
            {
                accentColor: '#222222',
                certificateLanguage: 'ky',
                certificateTitle: ' ',
                eligibilityActivitiesPercent: '70',
                eligibilityActivitiesRequired: true,
                eligibilityAttendancePercent: '85',
                eligibilityAttendanceRequired: true,
                eligibilityHomeworkPercent: '',
                eligibilityHomeworkRequired: false,
                issuerDisplayName: '  Issuer  ',
                issuerTitle: ' ',
                pageOrientation: 'portrait',
                primaryColor: '#111111',
                secondaryBrandName: '  Partner  ',
            },
            true,
            'Default title'
        );

        expect(payload).toEqual({
            accentColor: '#222222',
            certificateLanguage: 'ky',
            certificateTitle: 'Default title',
            eligibilityActivitiesPercent: 70,
            eligibilityActivitiesRequired: true,
            eligibilityAttendancePercent: 85,
            eligibilityAttendanceRequired: true,
            eligibilityHomeworkPercent: 0,
            eligibilityHomeworkRequired: false,
            issuerDisplayName: 'Issuer',
            issuerTitle: null,
            pageOrientation: 'portrait',
            primaryColor: '#111111',
            secondaryBrandName: 'Partner',
        });
    });

    it('omits admin-only fields from instructor template payloads', () => {
        const payload = getTemplatePayload(
            {
                accentColor: '#222222',
                certificateLanguage: 'en',
                certificateTitle: 'Title',
                eligibilityActivitiesPercent: 70,
                eligibilityActivitiesRequired: true,
                eligibilityAttendancePercent: 85,
                eligibilityAttendanceRequired: true,
                eligibilityHomeworkPercent: 90,
                eligibilityHomeworkRequired: true,
                issuerDisplayName: 'Issuer',
                issuerTitle: 'Role',
                pageOrientation: 'landscape',
                primaryColor: '#111111',
                secondaryBrandName: 'Partner',
            },
            false,
            'Default title'
        );

        expect(payload).toEqual({
            accentColor: undefined,
            certificateLanguage: 'en',
            certificateTitle: undefined,
            eligibilityActivitiesPercent: undefined,
            eligibilityActivitiesRequired: undefined,
            eligibilityAttendancePercent: undefined,
            eligibilityAttendanceRequired: undefined,
            eligibilityHomeworkPercent: undefined,
            eligibilityHomeworkRequired: undefined,
            issuerDisplayName: 'Issuer',
            issuerTitle: 'Role',
            pageOrientation: 'landscape',
            primaryColor: undefined,
            secondaryBrandName: undefined,
        });
    });

    it('builds exact preview payloads with a generated issue timestamp', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-13T09:30:00.000Z'));

        expect(
            getExactPreviewPayload({
                defaultCertificateTitle: 'Default title',
                isAdminMode: true,
                previewCourseTitle: 'Course',
                previewIssuerName: 'Issuer',
                previewIssuerTitle: 'Role',
                previewStudentName: 'Student',
                settingsForm: {
                    accentColor: '#222222',
                    certificateLanguage: 'en',
                    certificateTitle: '',
                    issuerDisplayName: 'Issuer',
                    issuerTitle: 'Role',
                    pageOrientation: 'landscape',
                    primaryColor: '#111111',
                    secondaryBrandName: '',
                },
            })
        ).toMatchObject({
            accentColor: '#222222',
            certificateTitle: 'Default title',
            previewCourseTitle: 'Course',
            previewIssuedAt: '2026-07-13T09:30:00.000Z',
            previewStudentName: 'Student',
            secondaryBrandName: null,
        });

        vi.useRealTimers();
    });

    it('compares template payloads by serialized value', () => {
        expect(hasTemplatePayloadChanges({ a: 1 }, { a: 1 })).toBe(false);
        expect(hasTemplatePayloadChanges({ a: 1 }, { a: 2 })).toBe(true);
    });
});

import { describe, expect, it, vi } from 'vitest';
import {
    buildCertificateDisplayPayload,
    buildCertificateWorkspaceViewModel,
    getAverageProgress,
    sortCertificateStudents,
} from './certificateWorkspaceViewModel';

const t = (key) => `t:${key}`;

const settingsForm = {
    certificateLanguage: 'en',
    issuerDisplayName: '  Form issuer  ',
    issuerTitle: '  Form title  ',
    pageOrientation: 'portrait',
};

describe('certificate workspace view model', () => {
    it('sorts students by newest enrollment first', () => {
        expect(
            sortCertificateStudents([
                { id: 1, enrolledAt: '2026-01-01T00:00:00.000Z' },
                { id: 2, enrolledAt: '2026-03-01T00:00:00.000Z' },
                { id: 4, enrolledAt: 'not-a-date' },
                { id: 3 },
            ]).map((student) => student.id)
        ).toEqual([2, 1, 4, 3]);
    });

    it('averages clamped student progress', () => {
        expect(
            getAverageProgress([
                { progressPercent: 100 },
                { progressPercent: 200 },
                { progressPercent: -20 },
                { progressPercent: 'not-a-number' },
            ])
        ).toBe(50);
        expect(getAverageProgress([])).toBe(0);
    });

    it('builds derived certificate workspace data', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-13T09:30:00.000Z'));

        const model = buildCertificateWorkspaceViewModel({
            courseMeta: { title: 'Meta course', total: 42 },
            courseStudents: [
                {
                    completed: true,
                    enrolledAt: '2026-01-01T00:00:00.000Z',
                    fullName: 'Ada',
                    id: 1,
                    progressPercent: 100,
                },
                {
                    enrolledAt: '2026-02-01T00:00:00.000Z',
                    fullName: 'Grace',
                    id: 2,
                    progressPercent: 50,
                },
            ],
            pageSize: 20,
            progressMax: '',
            progressMin: 10,
            search: '',
            selectedCourse: { instructorName: 'Course instructor', title: 'Selected course' },
            selectedStudentId: '2',
            settingsForm,
            studentNameOverride: '',
            studentsPage: 2,
            t,
        });

        expect(model.sortedStudents.map((student) => student.id)).toEqual([2, 1]);
        expect(model.visibleStudents.map((student) => student.id)).toEqual([2]);
        expect(model.selectedStudent?.fullName).toBe('Grace');
        expect(model.averageProgress).toBe(75);
        expect(model.completedCount).toBe(1);
        expect(model.hasActiveFilters).toBe(true);
        expect(model.isPortraitPreview).toBe(true);
        expect(model.pageRangeStart).toBe(21);
        expect(model.pageRangeEnd).toBe(21);
        expect(model.previewCourseTitle).toBe('Meta course');
        expect(model.previewIssuerName).toBe('Form issuer');
        expect(model.previewIssuerTitle).toBe('Form title');
        expect(model.previewStudentName).toBe('Grace');
        expect(model.previewDate).toContain('2026');
        expect(model.selectedStudentExistsOnPage).toBe(true);
        expect(model.totalStudents).toBe(42);

        vi.useRealTimers();
    });

    it('falls back to course and translation copy when form fields are blank', () => {
        const model = buildCertificateWorkspaceViewModel({
            courseMeta: null,
            courseStudents: [],
            pageSize: 20,
            progressMax: '',
            progressMin: '',
            search: '   ',
            selectedCourse: { instructorName: 'Course instructor', title: 'Selected course' },
            selectedStudentId: '',
            settingsForm: {
                certificateLanguage: 'en',
                issuerDisplayName: ' ',
                issuerTitle: ' ',
                pageOrientation: 'landscape',
            },
            studentNameOverride: '',
            studentsPage: 1,
            t,
        });

        expect(model.hasActiveFilters).toBe(false);
        expect(model.isPortraitPreview).toBe(false);
        expect(model.pageRangeStart).toBe(0);
        expect(model.pageRangeEnd).toBe(0);
        expect(model.previewCourseTitle).toBe('Selected course');
        expect(model.previewIssuerName).toBe('Course instructor');
        expect(model.previewIssuerTitle).toBe(
            't:adminCertificates.previewCanvas.instructorIssuerTitle'
        );
        expect(model.previewStudentName).toBe(
            't:adminCertificates.previewCanvas.sampleStudentName'
        );
    });

    it('builds certificate action display payloads', () => {
        expect(
            buildCertificateDisplayPayload({
                eligibilityOverrideByStudentId: { 2: true },
                previewIssuerName: 'Issuer',
                previewIssuerTitle: 'Role',
                selectedStudent: { id: 2 },
                settingsForm,
                student: { fullName: 'Grace', id: 2 },
                studentNameOverride: '  Custom Grace  ',
            })
        ).toEqual({
            allowEligibilityOverride: true,
            certificateLanguage: 'en',
            issuerDisplayName: 'Issuer',
            issuerTitle: 'Role',
            pageOrientation: 'portrait',
            studentFullName: 'Custom Grace',
        });

        expect(
            buildCertificateDisplayPayload({
                eligibilityOverrideByStudentId: {},
                previewIssuerName: '',
                previewIssuerTitle: '',
                selectedStudent: null,
                settingsForm,
                student: { fullName: 'Ada', id: 1 },
                studentNameOverride: '',
            })
        ).toEqual({
            allowEligibilityOverride: undefined,
            certificateLanguage: 'en',
            issuerDisplayName: undefined,
            issuerTitle: undefined,
            pageOrientation: 'portrait',
            studentFullName: 'Ada',
        });
    });
});

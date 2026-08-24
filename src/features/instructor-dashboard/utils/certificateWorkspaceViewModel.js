import { formatPreviewDate } from './certificatePreview';
import { clampCertificateProgress } from '@features/courses/utils/certificatePresentation';

const getTimestamp = (value) => {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
};

export const sortCertificateStudents = (students = []) =>
    students.slice().sort((a, b) => {
        const aDate = getTimestamp(a?.enrolledAt);
        const bDate = getTimestamp(b?.enrolledAt);
        return bDate - aDate;
    });

export const getAverageProgress = (students = []) =>
    students.length
        ? Math.round(
              students.reduce(
                  (sum, student) => sum + clampCertificateProgress(student?.progressPercent),
                  0
              ) / students.length
          )
        : 0;

export const buildCertificateDisplayPayload = ({
    eligibilityOverrideByStudentId = {},
    previewIssuerName,
    previewIssuerTitle,
    selectedStudent,
    settingsForm,
    student,
    studentNameOverride,
}) => {
    const allowEligibilityOverride = Boolean(eligibilityOverrideByStudentId[student.id]);
    return {
        studentFullName:
            selectedStudent && String(selectedStudent.id) === String(student.id)
                ? studentNameOverride.trim() || student.fullName || undefined
                : student.fullName || undefined,
        issuerDisplayName: previewIssuerName || undefined,
        issuerTitle: previewIssuerTitle || undefined,
        certificateLanguage: settingsForm.certificateLanguage,
        pageOrientation: settingsForm.pageOrientation,
        allowEligibilityOverride: allowEligibilityOverride || undefined,
    };
};

export const buildCertificateWorkspaceViewModel = ({
    courseMeta,
    courseStudents,
    pageSize,
    progressMax,
    progressMin,
    search,
    selectedCourse,
    selectedStudentId,
    settingsForm,
    studentNameOverride,
    studentsPage,
    t,
}) => {
    const sortedStudents = sortCertificateStudents(courseStudents || []);
    const averageProgress = getAverageProgress(sortedStudents);
    const completedCount = sortedStudents.filter((student) => student.completed).length;
    const previewStudentFallback =
        sortedStudents[0]?.fullName || t('adminCertificates.previewCanvas.sampleStudentName');
    const previewCourseTitle =
        courseMeta?.title ||
        selectedCourse?.title ||
        t('adminCertificates.previewCanvas.sampleCourseTitle');
    const previewIssuerName =
        settingsForm.issuerDisplayName.trim() ||
        selectedCourse?.instructorName ||
        t('adminCertificates.previewCanvas.sampleIssuerName');
    const previewIssuerTitle =
        settingsForm.issuerTitle.trim() ||
        t('adminCertificates.previewCanvas.instructorIssuerTitle');
    const visibleStudents = selectedStudentId
        ? sortedStudents.filter((student) => String(student.id) === selectedStudentId)
        : sortedStudents;
    const selectedStudent = selectedStudentId
        ? sortedStudents.find((student) => String(student.id) === selectedStudentId) || null
        : null;
    const previewDate = formatPreviewDate(new Date(), settingsForm.certificateLanguage);
    const isPortraitPreview = settingsForm.pageOrientation === 'portrait';
    const totalStudents = Number(courseMeta?.total || 0);
    const shownStudents = visibleStudents.length;
    const selectedStudentExistsOnPage = selectedStudentId
        ? sortedStudents.some((student) => String(student.id) === selectedStudentId)
        : false;
    const pageRangeStart = totalStudents > 0 ? (studentsPage - 1) * pageSize + 1 : 0;
    const pageRangeEnd = shownStudents > 0 ? pageRangeStart + shownStudents - 1 : 0;
    const hasActiveFilters = Boolean(
        search.trim() || progressMin !== '' || progressMax !== '' || selectedStudentId
    );
    const previewStudentName =
        studentNameOverride.trim() ||
        selectedStudent?.fullName ||
        visibleStudents[0]?.fullName ||
        previewStudentFallback;

    return {
        averageProgress,
        completedCount,
        hasActiveFilters,
        isPortraitPreview,
        pageRangeEnd,
        pageRangeStart,
        previewCourseTitle,
        previewDate,
        previewIssuerName,
        previewIssuerTitle,
        previewStudentFallback,
        previewStudentName,
        selectedStudent,
        selectedStudentExistsOnPage,
        shownStudents,
        sortedStudents,
        totalStudents,
        visibleStudents,
    };
};

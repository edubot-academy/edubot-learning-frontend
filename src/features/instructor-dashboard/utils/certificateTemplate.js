export const DEFAULT_CERTIFICATE_LANGUAGE = 'en';

export const CERTIFICATE_LANGUAGE_OPTIONS = [
    { value: 'en', labelKey: 'adminCertificates.page.template.languageOptions.en' },
    { value: 'ru', labelKey: 'adminCertificates.page.template.languageOptions.ru' },
    { value: 'ky', labelKey: 'adminCertificates.page.template.languageOptions.ky' },
];

export const STUDENT_PAGE_SIZE_OPTIONS = [20, 50, 100];

export const CERTIFICATE_COLOR_PRESETS = [
    { label: 'EduBot', primary: '#122144', accent: '#F17E22' },
    { label: 'Forest', primary: '#1F4D3D', accent: '#D6A85F' },
    { label: 'Royal', primary: '#1E3A8A', accent: '#F59E0B' },
    { label: 'Graphite', primary: '#1F2937', accent: '#14B8A6' },
];

const trimOrNull = (value) => value?.trim() || null;

export const buildCertificateSettingsForm = ({
    certificateSettings,
    defaultCertificateTitle,
    defaultIssuerDisplayName,
    defaultIssuerTitle,
    isAdminMode,
}) => ({
    certificateTitle: certificateSettings?.certificateTitle || defaultCertificateTitle,
    certificateLanguage: certificateSettings?.certificateLanguage || DEFAULT_CERTIFICATE_LANGUAGE,
    secondaryBrandName: certificateSettings?.secondaryBrandName || '',
    secondaryBrandLogoUrl: certificateSettings?.secondaryBrandLogoUrl || '',
    issuerDisplayName: isAdminMode
        ? certificateSettings?.issuerDisplayName || defaultIssuerDisplayName
        : defaultIssuerDisplayName,
    issuerTitle: isAdminMode
        ? certificateSettings?.issuerTitle || defaultIssuerTitle
        : defaultIssuerTitle,
    signatureAssetUrl: certificateSettings?.signatureAssetUrl || '',
    pageOrientation: certificateSettings?.pageOrientation || 'landscape',
    primaryColor: certificateSettings?.primaryColor || '#122144',
    accentColor: certificateSettings?.accentColor || '#F17E22',
    eligibilityAttendanceRequired: certificateSettings?.eligibilityAttendanceRequired ?? true,
    eligibilityAttendancePercent: certificateSettings?.eligibilityAttendancePercent ?? 80,
    eligibilityHomeworkRequired: certificateSettings?.eligibilityHomeworkRequired ?? false,
    eligibilityHomeworkPercent: certificateSettings?.eligibilityHomeworkPercent ?? 100,
    eligibilityActivitiesRequired: certificateSettings?.eligibilityActivitiesRequired ?? false,
    eligibilityActivitiesPercent: certificateSettings?.eligibilityActivitiesPercent ?? 100,
});

export const getTemplatePayload = (settingsForm, isAdminMode, defaultCertificateTitle) => ({
    certificateTitle: isAdminMode
        ? settingsForm.certificateTitle.trim() || defaultCertificateTitle
        : undefined,
    secondaryBrandName: isAdminMode ? trimOrNull(settingsForm.secondaryBrandName) : undefined,
    certificateLanguage: settingsForm.certificateLanguage,
    issuerDisplayName: trimOrNull(settingsForm.issuerDisplayName),
    issuerTitle: trimOrNull(settingsForm.issuerTitle),
    pageOrientation: settingsForm.pageOrientation,
    primaryColor: isAdminMode ? settingsForm.primaryColor : undefined,
    accentColor: isAdminMode ? settingsForm.accentColor : undefined,
    eligibilityAttendanceRequired: isAdminMode
        ? Boolean(settingsForm.eligibilityAttendanceRequired)
        : undefined,
    eligibilityAttendancePercent: isAdminMode
        ? Number(settingsForm.eligibilityAttendancePercent || 0)
        : undefined,
    eligibilityHomeworkRequired: isAdminMode
        ? Boolean(settingsForm.eligibilityHomeworkRequired)
        : undefined,
    eligibilityHomeworkPercent: isAdminMode
        ? Number(settingsForm.eligibilityHomeworkPercent || 0)
        : undefined,
    eligibilityActivitiesRequired: isAdminMode
        ? Boolean(settingsForm.eligibilityActivitiesRequired)
        : undefined,
    eligibilityActivitiesPercent: isAdminMode
        ? Number(settingsForm.eligibilityActivitiesPercent || 0)
        : undefined,
});

export const getExactPreviewPayload = ({
    defaultCertificateTitle,
    isAdminMode,
    previewCourseTitle,
    previewIssuerName,
    previewIssuerTitle,
    previewStudentName,
    settingsForm,
}) => ({
    certificateTitle: isAdminMode
        ? settingsForm.certificateTitle.trim() || defaultCertificateTitle
        : undefined,
    secondaryBrandName: isAdminMode ? trimOrNull(settingsForm.secondaryBrandName) : undefined,
    issuerDisplayName: trimOrNull(settingsForm.issuerDisplayName),
    issuerTitle: trimOrNull(settingsForm.issuerTitle),
    certificateLanguage: settingsForm.certificateLanguage,
    pageOrientation: settingsForm.pageOrientation,
    primaryColor: isAdminMode ? settingsForm.primaryColor : undefined,
    accentColor: isAdminMode ? settingsForm.accentColor : undefined,
    previewStudentName,
    previewCourseTitle,
    previewIssuerName,
    previewIssuerTitle,
    previewIssuedAt: new Date().toISOString(),
});

export const hasTemplatePayloadChanges = (currentPayload, savedPayload) =>
    JSON.stringify(currentPayload) !== JSON.stringify(savedPayload);

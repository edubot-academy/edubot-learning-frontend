import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    approveCertificate,
    fetchCourseCertificates,
    fetchCourseCertificateSettings,
    fetchCourseStudents,
    issueCourseCertificate,
    regenerateCourseCertificates,
    rejectCertificate,
    revokeCertificate,
    saveCourseCertificateSignatureAsset,
    updateCourseCertificateSettings,
    uploadCourseCertificateSecondaryLogo,
} from '@features/courses/api';
import { parseApiError } from '@shared/api/error';

export const useAdminCertificatesDomain = ({ activeTab }) => {
    const { t } = useTranslation();
    const [selectedCertificateCourseId, setSelectedCertificateCourseId] = useState(null);
    const [certificateStudents, setCertificateStudents] = useState([]);
    const [certificateCourseMeta, setCertificateCourseMeta] = useState(null);
    const [loadingCertificateStudents, setLoadingCertificateStudents] = useState(false);
    const [certificateStudentsPage, setCertificateStudentsPage] = useState(1);
    const [certificateSearch, setCertificateSearch] = useState('');
    const [certificateProgressMin, setCertificateProgressMin] = useState('');
    const [certificateProgressMax, setCertificateProgressMax] = useState('');
    const [certificateError, setCertificateError] = useState('');
    const [certificateSettings, setCertificateSettings] = useState(null);
    const [courseCertificates, setCourseCertificates] = useState([]);
    const [loadingCertificateWorkspace, setLoadingCertificateWorkspace] = useState(false);
    const [savingCertificateSettings, setSavingCertificateSettings] = useState(false);
    const [certificateActionStudentId, setCertificateActionStudentId] = useState(null);
    const [regeneratingCertificates, setRegeneratingCertificates] = useState(false);
    const [savingCertificateAssetKind, setSavingCertificateAssetKind] = useState(null);

    const loadCertificateStudents = useCallback(
        async (courseId) => {
            if (!courseId) {
                setCertificateStudents([]);
                setCertificateCourseMeta(null);
                return;
            }

            setLoadingCertificateStudents(true);
            setCertificateError('');
            try {
                const data = await fetchCourseStudents(courseId, {
                    page: certificateStudentsPage,
                    limit: 20,
                    q: certificateSearch || undefined,
                    progressGte:
                        certificateProgressMin === '' ? undefined : Number(certificateProgressMin),
                    progressLte:
                        certificateProgressMax === '' ? undefined : Number(certificateProgressMax),
                });
                setCertificateStudents(data?.students || []);
                setCertificateCourseMeta({
                    ...(data?.course || {}),
                    page: data?.page,
                    total: data?.total,
                    totalPages: data?.totalPages,
                    limit: data?.limit,
                });
            } catch (error) {
                console.error('Failed to load admin certificate students', error);
                setCertificateStudents([]);
                setCertificateCourseMeta(null);
                setCertificateError(
                    parseApiError(error, t('adminCertificates.errors.loadStudents')).message
                );
            } finally {
                setLoadingCertificateStudents(false);
            }
        },
        [certificateProgressMax, certificateProgressMin, certificateSearch, certificateStudentsPage, t]
    );

    const handleSelectCertificateCourse = useCallback((courseId) => {
        setSelectedCertificateCourseId(courseId);
        setCertificateStudentsPage(1);
        setCertificateSearch('');
        setCertificateProgressMin('');
        setCertificateProgressMax('');
    }, []);

    const handleToggleCertificateApproval = useCallback(
        async (enabled) => {
            if (!selectedCertificateCourseId) return;
            setSavingCertificateSettings(true);
            try {
                const updated = await updateCourseCertificateSettings(selectedCertificateCourseId, {
                    enabled: certificateSettings?.enabled ?? true,
                    issueMode: certificateSettings?.issueMode ?? 'auto',
                    approvalMode: enabled ? 'instructor' : 'none',
                });
                setCertificateSettings(updated);
                toast.success(t('adminCertificates.toasts.ruleUpdated'));
            } catch (error) {
                console.error('Failed to update certificate settings', error);
                toast.error(
                    parseApiError(error, t('adminCertificates.toasts.ruleUpdateError')).message
                );
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [certificateSettings, selectedCertificateCourseId, t]
    );

    const handleSaveCertificateSettings = useCallback(
        async (payload) => {
            if (!selectedCertificateCourseId) return false;
            setSavingCertificateSettings(true);
            try {
                const updated = await updateCourseCertificateSettings(
                    selectedCertificateCourseId,
                    payload
                );
                setCertificateSettings(updated);
                toast.success(t('adminCertificates.toasts.templateSaved'));
                return true;
            } catch (error) {
                console.error('Failed to save certificate settings', error);
                toast.error(
                    parseApiError(error, t('adminCertificates.toasts.templateSaveError')).message
                );
                return false;
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [selectedCertificateCourseId, t]
    );

    const handleRegenerateCertificates = useCallback(async () => {
        if (!selectedCertificateCourseId) return false;
        setRegeneratingCertificates(true);
        try {
            const result = await regenerateCourseCertificates(selectedCertificateCourseId);
            await loadCertificateStudents(selectedCertificateCourseId);
            const certificatesData = await fetchCourseCertificates(selectedCertificateCourseId);
            setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
            toast.success(
                result?.regeneratedCount
                    ? t('adminCertificates.toasts.regenerated', {
                          count: result.regeneratedCount,
                      })
                    : t('adminCertificates.toasts.noneRegenerated')
            );
            return true;
        } catch (error) {
            console.error('Failed to regenerate certificates', error);
            toast.error(
                parseApiError(error, t('adminCertificates.toasts.regenerateError')).message
            );
            return false;
        } finally {
            setRegeneratingCertificates(false);
        }
    }, [loadCertificateStudents, selectedCertificateCourseId, t]);

    const handleSaveCertificateAsset = useCallback(
        async (kind, file) => {
            if (!selectedCertificateCourseId || !file) return null;
            setSavingCertificateAssetKind(kind);
            try {
                const updated =
                    kind === 'signature'
                        ? await saveCourseCertificateSignatureAsset(
                              selectedCertificateCourseId,
                              file
                          )
                        : await uploadCourseCertificateSecondaryLogo(
                              selectedCertificateCourseId,
                              file
                          );
                setCertificateSettings(updated);
                toast.success(
                    kind === 'signature'
                        ? t('adminCertificates.toasts.signatureSaved')
                        : t('adminCertificates.toasts.secondaryLogoUploaded')
                );
                return updated;
            } catch (error) {
                console.error('Failed to save certificate asset', error);
                toast.error(
                    parseApiError(
                        error,
                        kind === 'signature'
                            ? t('adminCertificates.toasts.signatureSaveError')
                            : t('adminCertificates.toasts.assetUploadError')
                    ).message
                );
                return null;
            } finally {
                setSavingCertificateAssetKind(null);
            }
        },
        [selectedCertificateCourseId, t]
    );

    const handleCertificateAction = useCallback(
        async (kind, student, displayOverrides = {}) => {
            if (!selectedCertificateCourseId || !student) return;
            setCertificateActionStudentId(student.id);
            try {
                if (kind === 'issue') {
                    await issueCourseCertificate(selectedCertificateCourseId, {
                        studentId: student.id,
                        ...displayOverrides,
                    });
                } else if (kind === 'approve' && student.certificateId) {
                    await approveCertificate(student.certificateId, displayOverrides);
                } else if (kind === 'reject' && student.certificateId) {
                    await rejectCertificate(student.certificateId);
                } else if (kind === 'revoke' && student.certificateId) {
                    await revokeCertificate(student.certificateId);
                }

                await loadCertificateStudents(selectedCertificateCourseId);
                const certificatesData = await fetchCourseCertificates(selectedCertificateCourseId);
                setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
                toast.success(t('adminCertificates.toasts.certificateUpdated'));
            } catch (error) {
                console.error('Failed to update certificate', error);
                toast.error(
                    parseApiError(error, t('adminCertificates.toasts.certificateActionError'))
                        .message
                );
            } finally {
                setCertificateActionStudentId(null);
            }
        },
        [loadCertificateStudents, selectedCertificateCourseId, t]
    );

    useEffect(() => {
        if (activeTab !== 'certificates') return;

        if (selectedCertificateCourseId) {
            loadCertificateStudents(selectedCertificateCourseId);
        } else {
            setCertificateStudents([]);
            setCertificateCourseMeta(null);
        }
    }, [
        activeTab,
        loadCertificateStudents,
        selectedCertificateCourseId,
    ]);

    useEffect(() => {
        if (activeTab !== 'certificates' || !selectedCertificateCourseId) {
            setCertificateSettings(null);
            setCourseCertificates([]);
            setLoadingCertificateWorkspace(false);
            return;
        }

        const loadCertificateWorkspace = async () => {
            setLoadingCertificateWorkspace(true);
            try {
                const [settingsData, certificatesData] = await Promise.all([
                    fetchCourseCertificateSettings(selectedCertificateCourseId),
                    fetchCourseCertificates(selectedCertificateCourseId),
                ]);
                setCertificateSettings(settingsData);
                setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
            } catch (error) {
                console.error('Failed to load admin certificate settings', error);
            } finally {
                setLoadingCertificateWorkspace(false);
            }
        };

        loadCertificateWorkspace();
    }, [activeTab, selectedCertificateCourseId]);

    return {
        certificateActionStudentId,
        certificateCourseMeta,
        certificateError,
        certificateProgressMax,
        certificateProgressMin,
        certificateSearch,
        certificateSettings,
        certificateStudents,
        certificateStudentsPage,
        courseCertificates,
        handleCertificateAction,
        handleRegenerateCertificates,
        handleSaveCertificateAsset,
        handleSaveCertificateSettings,
        handleSelectCertificateCourse,
        handleToggleCertificateApproval,
        loadingCertificateStudents,
        loadingCertificateWorkspace,
        regeneratingCertificates,
        savingCertificateAssetKind,
        savingCertificateSettings,
        selectedCertificateCourseId,
        setCertificateProgressMax,
        setCertificateProgressMin,
        setCertificateSearch,
        setCertificateStudentsPage,
    };
};

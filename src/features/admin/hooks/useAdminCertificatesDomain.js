import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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

export const useAdminCertificatesDomain = ({ activeTab }) => {
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
                setCertificateError('Курс студенттерин жүктөө мүмкүн болбоду');
            } finally {
                setLoadingCertificateStudents(false);
            }
        },
        [certificateProgressMax, certificateProgressMin, certificateSearch, certificateStudentsPage]
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
                toast.success('Сертификат эрежеси жаңыртылды');
            } catch (error) {
                console.error('Failed to update certificate settings', error);
                toast.error('Сертификат эрежесин жаңыртуу мүмкүн болбоду');
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [certificateSettings, selectedCertificateCourseId]
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
                toast.success('Сертификат шаблону сакталды');
                return true;
            } catch (error) {
                console.error('Failed to save certificate settings', error);
                toast.error('Сертификат шаблонун сактоо мүмкүн болбоду');
                return false;
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [selectedCertificateCourseId]
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
                    ? `${result.regeneratedCount} сертификат жаңыртылды`
                    : 'Жаңыртууга сертификат табылган жок'
            );
            return true;
        } catch (error) {
            console.error('Failed to regenerate certificates', error);
            toast.error('Сертификат PDF файлдарын жаңыртуу мүмкүн болбоду');
            return false;
        } finally {
            setRegeneratingCertificates(false);
        }
    }, [loadCertificateStudents, selectedCertificateCourseId]);

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
                    kind === 'signature' ? 'Кол коюу сакталды' : 'Экинчи бренд логотиби жүктөлдү'
                );
                return updated;
            } catch (error) {
                console.error('Failed to save certificate asset', error);
                toast.error(
                    kind === 'signature'
                        ? 'Кол коюуну сактоо мүмкүн болбоду'
                        : 'Сертификат активин жүктөө мүмкүн болбоду'
                );
                return null;
            } finally {
                setSavingCertificateAssetKind(null);
            }
        },
        [selectedCertificateCourseId]
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
                toast.success('Сертификат жаңыртылды');
            } catch (error) {
                console.error('Failed to update certificate', error);
                toast.error('Сертификат аракетин аткаруу мүмкүн болбоду');
            } finally {
                setCertificateActionStudentId(null);
            }
        },
        [loadCertificateStudents, selectedCertificateCourseId]
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

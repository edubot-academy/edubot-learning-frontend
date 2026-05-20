import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    approveCertificate,
    fetchCourseCertificateSettings,
    fetchCourseCertificates,
    fetchCourseStudents,
    fetchInstructorStudentCourses,
    issueCourseCertificate,
    regenerateCourseCertificates,
    rejectCertificate,
    revokeCertificate,
    updateCourseCertificateSettings,
} from '@services/api';
import {
    saveCourseCertificateSignatureAsset,
    uploadCourseCertificateSecondaryLogo,
} from '@features/courses/api';
import {
    isCourseFeatureEnabled,
    TENANT_FEATURES,
} from '@shared/utils/tenantFeatures';

export const useInstructorStudentWorkspace = ({ activeTab, user }) => {
    const { t } = useTranslation();
    const [studentCourses, setStudentCourses] = useState([]);
    const [studentCoursesTotal, setStudentCoursesTotal] = useState(null);
    const [loadingStudentCourses, setLoadingStudentCourses] = useState(false);
    const [selectedStudentCourseId, setSelectedStudentCourseId] = useState(null);
    const [courseStudents, setCourseStudents] = useState([]);
    const [courseStudentsMeta, setCourseStudentsMeta] = useState(null);
    const [loadingCourseStudents, setLoadingCourseStudents] = useState(false);
    const [studentsPage, setStudentsPage] = useState(1);
    const [studentSearch, setStudentSearch] = useState('');
    const [progressMin, setProgressMin] = useState('');
    const [progressMax, setProgressMax] = useState('');
    const [studentsError, setStudentsError] = useState('');
    const [certificateSettings, setCertificateSettings] = useState(null);
    const [courseCertificates, setCourseCertificates] = useState([]);
    const [loadingCertificateWorkspace, setLoadingCertificateWorkspace] = useState(false);
    const [savingCertificateSettings, setSavingCertificateSettings] = useState(false);
    const [certificateActionStudentId, setCertificateActionStudentId] = useState(null);
    const [certificateActionKind, setCertificateActionKind] = useState(null);
    const [regeneratingCertificates, setRegeneratingCertificates] = useState(false);
    const [savingCertificateAssetKind, setSavingCertificateAssetKind] = useState(null);

    const selectedStudentCourse = useMemo(
        () =>
            studentCourses.find((course) => String(course.id) === String(selectedStudentCourseId)) ||
            null,
        [selectedStudentCourseId, studentCourses]
    );

    const certificateCourses = useMemo(
        () =>
            studentCourses.filter((course) =>
                isCourseFeatureEnabled(course, TENANT_FEATURES.CERTIFICATES)
            ),
        [studentCourses]
    );

    const certificatesFeatureEnabled = selectedStudentCourse
        ? isCourseFeatureEnabled(selectedStudentCourse, TENANT_FEATURES.CERTIFICATES)
        : true;

    const loadStudentCourses = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;

        setLoadingStudentCourses(true);
        setStudentsError('');

        try {
            const data = await fetchInstructorStudentCourses();
            const list = (data?.courses || []).filter(
                (course) => course?.status === 'approved' && course?.isPublished
            );

            setStudentCourses(list);
            setStudentCoursesTotal(
                list.reduce((acc, course) => acc + (course.studentCount || 0), 0)
            );

            setSelectedStudentCourseId((prev) => {
                if (!list.length) return null;
                if (prev && !list.some((course) => course.id === prev)) return null;
                if (activeTab === 'certificates') {
                    const certificateList = list.filter((course) =>
                        isCourseFeatureEnabled(course, TENANT_FEATURES.CERTIFICATES)
                    );
                    if (prev && certificateList.some((course) => course.id === prev)) return prev;
                    return null;
                }
                return list.some((course) => course.id === prev) ? prev : null;
            });

            if (!list.length) {
                setCourseStudents([]);
                setCourseStudentsMeta(null);
            }
        } catch (error) {
            console.error('Failed to load student courses', error);
            if (error?.response?.status === 403) {
                setStudentsError(t('adminCertificates.errors.courseNotAssigned'));
            } else {
                toast.error(t('adminCertificates.errors.loadStudentCourses'));
            }
        } finally {
            setLoadingStudentCourses(false);
        }
    }, [activeTab, t, user]);

    const loadCourseStudents = useCallback(
        async (courseId) => {
            if (!courseId) {
                setCourseStudents([]);
                setCourseStudentsMeta(null);
                return;
            }

            setLoadingCourseStudents(true);
            setStudentsError('');

            try {
                const data = await fetchCourseStudents(courseId, {
                    page: studentsPage,
                    limit: 20,
                    q: studentSearch || undefined,
                    progressGte: progressMin === '' ? undefined : Number(progressMin),
                    progressLte: progressMax === '' ? undefined : Number(progressMax),
                });

                setCourseStudents(data?.students || []);
                setCourseStudentsMeta({
                    ...(data?.course || {}),
                    page: data?.page,
                    total: data?.total,
                    totalPages: data?.totalPages,
                    limit: data?.limit,
                });
            } catch (error) {
                console.error('Failed to load course students', error);
                setCourseStudents([]);
                setCourseStudentsMeta(null);

                if (error?.response?.status === 403) {
                    setStudentsError(t('adminCertificates.errors.courseNotAssigned'));
                } else {
                    toast.error(t('adminCertificates.errors.loadStudents'));
                }
            } finally {
                setLoadingCourseStudents(false);
            }
        },
        [progressMax, progressMin, studentSearch, studentsPage, t]
    );

    const refreshCourseCertificates = useCallback(async () => {
        if (!selectedStudentCourseId) return;
        const certificatesData = await fetchCourseCertificates(selectedStudentCourseId);
        setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
    }, [selectedStudentCourseId]);

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        loadStudentCourses();
    }, [loadStudentCourses, user]);

    useEffect(() => {
        if (!['students', 'certificates'].includes(activeTab)) return;

        if (selectedStudentCourseId) {
            loadCourseStudents(selectedStudentCourseId);
        } else {
            setCourseStudents([]);
            setCourseStudentsMeta(null);
        }
    }, [
        activeTab,
        loadCourseStudents,
        progressMax,
        progressMin,
        selectedStudentCourseId,
        studentSearch,
        studentsPage,
    ]);

    useEffect(() => {
        if (
            !['students', 'certificates'].includes(activeTab) ||
            !selectedStudentCourseId ||
            !certificatesFeatureEnabled
        ) {
            setCertificateSettings(null);
            setCourseCertificates([]);
            setLoadingCertificateWorkspace(false);
            return;
        }

        const loadCertificateSettings = async () => {
            setLoadingCertificateWorkspace(true);
            try {
                const [settingsData, certificatesData] = await Promise.all([
                    fetchCourseCertificateSettings(selectedStudentCourseId),
                    fetchCourseCertificates(selectedStudentCourseId),
                ]);
                setCertificateSettings(settingsData);
                setCourseCertificates(Array.isArray(certificatesData) ? certificatesData : []);
            } catch (error) {
                console.error('Failed to load certificate settings', error);
            } finally {
                setLoadingCertificateWorkspace(false);
            }
        };

        loadCertificateSettings();
    }, [activeTab, certificatesFeatureEnabled, selectedStudentCourseId]);

    const handleToggleCertificateApproval = useCallback(
        async (enabled) => {
            if (!selectedStudentCourseId) return;
            if (!certificatesFeatureEnabled) {
                toast.error(t('adminCertificates.toasts.featureDisabled'));
                return;
            }
            setSavingCertificateSettings(true);
            try {
                const updated = await updateCourseCertificateSettings(
                    selectedStudentCourseId,
                    {
                        enabled: certificateSettings?.enabled ?? true,
                        issueMode: certificateSettings?.issueMode ?? 'auto',
                        approvalMode: enabled ? 'instructor' : 'none',
                    }
                );
                setCertificateSettings(updated);
                toast.success(t('adminCertificates.toasts.ruleUpdated'));
            } catch (error) {
                console.error('Failed to update certificate settings', error);
                toast.error(t('adminCertificates.toasts.ruleUpdateError'));
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [certificateSettings, certificatesFeatureEnabled, selectedStudentCourseId, t]
    );

    const handleSaveCertificateSettings = useCallback(
        async (payload) => {
            if (!selectedStudentCourseId) return false;
            if (!certificatesFeatureEnabled) {
                toast.error(t('adminCertificates.toasts.featureDisabled'));
                return false;
            }
            setSavingCertificateSettings(true);
            try {
                const updated = await updateCourseCertificateSettings(
                    selectedStudentCourseId,
                    payload
                );
                setCertificateSettings(updated);
                toast.success(t('adminCertificates.toasts.templateSaved'));
                return true;
            } catch (error) {
                console.error('Failed to save certificate settings', error);
                toast.error(t('adminCertificates.toasts.templateSaveError'));
                return false;
            } finally {
                setSavingCertificateSettings(false);
            }
        },
        [certificatesFeatureEnabled, selectedStudentCourseId, t]
    );

    const handleRegenerateCertificates = useCallback(
        async () => {
            if (!selectedStudentCourseId) return false;
            if (!certificatesFeatureEnabled) {
                toast.error(t('adminCertificates.toasts.featureDisabled'));
                return false;
            }
            setRegeneratingCertificates(true);
            try {
                const result = await regenerateCourseCertificates(selectedStudentCourseId);
                await loadCourseStudents(selectedStudentCourseId);
                await refreshCourseCertificates();
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
                toast.error(t('adminCertificates.toasts.regenerateError'));
                return false;
            } finally {
                setRegeneratingCertificates(false);
            }
        },
        [certificatesFeatureEnabled, loadCourseStudents, refreshCourseCertificates, selectedStudentCourseId, t]
    );

    const handleSaveCertificateAsset = useCallback(
        async (kind, file) => {
            if (!selectedStudentCourseId || !file) return null;
            if (!certificatesFeatureEnabled) {
                toast.error(t('adminCertificates.toasts.featureDisabled'));
                return null;
            }
            setSavingCertificateAssetKind(kind);
            try {
                const updated =
                    kind === 'signature'
                        ? await saveCourseCertificateSignatureAsset(selectedStudentCourseId, file)
                        : await uploadCourseCertificateSecondaryLogo(selectedStudentCourseId, file);
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
                    kind === 'signature'
                        ? t('adminCertificates.toasts.signatureSaveError')
                        : t('adminCertificates.toasts.assetUploadError')
                );
                return null;
            } finally {
                setSavingCertificateAssetKind(null);
            }
        },
        [certificatesFeatureEnabled, selectedStudentCourseId, t]
    );

    const handleCertificateAction = useCallback(
        async (kind, student, displayOverrides = {}) => {
            if (!selectedStudentCourseId || !student) return;
            if (!certificatesFeatureEnabled) {
                toast.error(t('adminCertificates.toasts.featureDisabled'));
                return;
            }
            setCertificateActionStudentId(student.id);
            setCertificateActionKind(kind);
            try {
                if (kind === 'issue') {
                    await issueCourseCertificate(selectedStudentCourseId, {
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

                await loadCourseStudents(selectedStudentCourseId);
                await refreshCourseCertificates();
                toast.success(t('adminCertificates.toasts.certificateUpdated'));
            } catch (error) {
                console.error('Failed to update certificate', error);
                toast.error(t('adminCertificates.toasts.certificateActionError'));
            } finally {
                setCertificateActionStudentId(null);
                setCertificateActionKind(null);
            }
        },
        [certificatesFeatureEnabled, loadCourseStudents, refreshCourseCertificates, selectedStudentCourseId, t]
    );

    const handleSelectStudentCourse = useCallback((courseId) => {
        setStudentsPage(1);
        setSelectedStudentCourseId(courseId);
    }, []);

    return {
        certificateActionKind,
        certificateActionStudentId,
        certificateCourses,
        certificateSettings,
        certificatesFeatureEnabled,
        courseCertificates,
        courseStudents,
        courseStudentsMeta,
        handleCertificateAction,
        handleRegenerateCertificates,
        handleSaveCertificateAsset,
        handleSaveCertificateSettings,
        handleSelectStudentCourse,
        handleToggleCertificateApproval,
        loadCourseStudents,
        loadStudentCourses,
        loadingCertificateWorkspace,
        loadingCourseStudents,
        loadingStudentCourses,
        progressMax,
        progressMin,
        regeneratingCertificates,
        savingCertificateAssetKind,
        savingCertificateSettings,
        selectedStudentCourse,
        selectedStudentCourseId,
        setProgressMax,
        setProgressMin,
        setStudentSearch,
        setStudentsPage,
        studentCourses,
        studentCoursesTotal,
        studentSearch,
        studentsError,
        studentsPage,
    };
};

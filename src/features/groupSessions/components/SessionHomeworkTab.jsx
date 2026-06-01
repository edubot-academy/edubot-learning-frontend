import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    FiActivity,
    FiAlertCircle,
    FiBookOpen,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiDownload,
    FiEdit3,
    FiFileText,
    FiLoader,
    FiPaperclip,
    FiPlayCircle,
    FiSearch,
    FiTrash2,
    FiXCircle,
    FiZap,
} from 'react-icons/fi';
import BasicModal from '../../../shared/ui/BasicModal';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    EmptyState,
    StatusBadge,
} from '../../../components/ui/dashboard';
import { parseApiError } from '../../../shared/api/error';
import {
    acceptAiGeneration,
    generateAiFeedbackDraft,
    generateAiHomeworkDraft,
    getAiLmsCapabilities,
    rejectAiGeneration,
} from '../../aiLms/api';
import { fetchSessionHomeworkAttachmentBlob, deleteSessionHomework } from '../../homework/api';
import HomeworkModal from './HomeworkModal';

const getReviewStateMeta = (item, getSubmissionStatusMeta, t) => {
    if (item.reviewState === 'missing') {
        return { label: t('groupSessions.homeworkTab.reviewStates.missing'), tone: 'red' };
    }
    if (item.reviewState === 'pending_submission') {
        return { label: t('groupSessions.homeworkTab.reviewStates.pendingSubmission'), tone: 'default' };
    }
    if (item.reviewState === 'needs_review') {
        return { label: t('groupSessions.homeworkTab.reviewStates.needsReview'), tone: 'amber' };
    }
    const statusMeta = getSubmissionStatusMeta(item.status, t);
    if (item.status === 'approved') {
        return { ...statusMeta, label: t('groupSessions.homeworkTab.reviewStates.approved'), tone: 'green' };
    }
    if (item.status === 'needs_revision') {
        return { ...statusMeta, label: t('groupSessions.homeworkTab.reviewStates.needsRevision'), tone: 'amber' };
    }
    if (item.status === 'rejected') {
        return { ...statusMeta, label: t('groupSessions.homeworkTab.reviewStates.rejected'), tone: 'red' };
    }
    return { ...statusMeta, tone: 'default' };
};

const getReviewItemPriority = (item) => {
    if (item.reviewState === 'needs_review') return 0;
    if (item.reviewState === 'missing') return 1;
    if (item.reviewState === 'needs_revision') return 2;
    if (item.isLate) return 3;
    if (item.reviewState === 'pending_submission') return 4;
    if (item.reviewState === 'rejected') return 5;
    return 6;
};

const SessionHomeworkTab = ({
    filteredHomework,
    formatDisplayDate,
    getAttachmentName,
    getSubmissionAttachmentUrl,
    getSubmissionPreview,
    getSubmissionStatusMeta,
    homeworkFilter,
    homeworkQuery,
    homeworkReviewFilter,
    homeworkStats,
    homeworkSubmissions,
    loadingHomework,
    loadingHomeworkSubmissions,
    publishHomework,
    publishedHomework,
    resolveHomeworkDeadline,
    reviewHomeworkSubmission,
    reviewingSubmissionId,
    savingHomework,
    selectedGroup,
    selectedHomework,
    selectedHomeworkId,
    selectedHomeworkMeta,
    selectedSession,
    selectedSessionId,
    setHomeworkFilter,
    setHomeworkQuery,
    setHomeworkReviewFilter,
    setSelectedHomeworkId,
    students,
    submissionStats,
    toggleHomeworkPublish,
    updatingHomework,
    updateHomework,
}) => {
    const { t, i18n } = useTranslation();
    const [previewState, setPreviewState] = useState({
        open: false,
        loading: false,
        title: '',
        url: '',
        contentType: '',
        canPreview: false,
    });
    const [reviewModal, setReviewModal] = useState({
        open: false,
        submissionId: null,
        status: 'approved',
        comment: '',
        studentName: '',
    });
    const [aiDraft, setAiDraft] = useState(null);
    const [aiDraftLoading, setAiDraftLoading] = useState(false);
    const [aiDraftError, setAiDraftError] = useState('');
    const [aiFeedbackDraftEnabled, setAiFeedbackDraftEnabled] = useState(false);
    const [aiHomeworkDraft, setAiHomeworkDraft] = useState(null);
    const [aiHomeworkDraftLoading, setAiHomeworkDraftLoading] = useState(false);
    const [aiHomeworkDraftError, setAiHomeworkDraftError] = useState('');
    const [aiHomeworkDraftEnabled, setAiHomeworkDraftEnabled] = useState(false);
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        homeworkId: null,
        homeworkTitle: '',
        loading: false,
    });
    const [homeworkModal, setHomeworkModal] = useState({
        open: false,
        mode: 'create',
        homework: null,
    });

    useEffect(() => {
        return () => {
            if (previewState.url) {
                window.URL.revokeObjectURL(previewState.url);
            }
        };
    }, [previewState.url]);

    useEffect(() => {
        const courseId = selectedSession?.courseId || selectedHomework?.courseId;
        if (!selectedSessionId) {
            setAiFeedbackDraftEnabled(false);
            setAiHomeworkDraftEnabled(false);
            return;
        }
        let cancelled = false;
        getAiLmsCapabilities(courseId)
            .then((capabilities) => {
                if (!cancelled) {
                    setAiFeedbackDraftEnabled(Boolean(capabilities?.feedbackDraft?.enabled));
                    setAiHomeworkDraftEnabled(Boolean(capabilities?.homeworkDraft?.enabled));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAiFeedbackDraftEnabled(false);
                    setAiHomeworkDraftEnabled(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [selectedHomework?.courseId, selectedSession?.courseId, selectedSessionId]);

    const filteredReviewItems = useMemo(() => {
        const matchesFilter = (item) => {
            if (homeworkReviewFilter === 'all') return true;
            if (homeworkReviewFilter === 'needs_review') return item.reviewState === 'needs_review';
            if (homeworkReviewFilter === 'missing') return item.reviewState === 'missing';
            if (homeworkReviewFilter === 'needs_revision') return item.reviewState === 'needs_revision';
            if (homeworkReviewFilter === 'late') return Boolean(item.isLate);
            return true;
        };

        return [...homeworkSubmissions]
            .filter(matchesFilter)
            .sort((left, right) => {
                const priorityDiff = getReviewItemPriority(left) - getReviewItemPriority(right);
                if (priorityDiff !== 0) return priorityDiff;
                return String(left.fullName || '').localeCompare(String(right.fullName || ''));
            });
    }, [homeworkReviewFilter, homeworkSubmissions]);

    const homeworkFilterOptions = useMemo(() => [
        { id: 'all', label: t('groupSessions.homeworkTab.filters.all') },
        { id: 'active', label: t('groupSessions.homeworkTab.filters.active') },
        { id: 'dueSoon', label: t('groupSessions.homeworkTab.filters.dueSoon') },
        { id: 'overdue', label: t('groupSessions.homeworkTab.filters.overdue') },
        { id: 'noDeadline', label: t('groupSessions.homeworkTab.filters.noDeadline') },
    ], [t]);

    const reviewFilterOptions = useMemo(() => [
        { id: 'all', label: t('groupSessions.homeworkTab.filters.all') },
        { id: 'needs_review', label: t('groupSessions.homeworkTab.reviewStates.needsReview') },
        { id: 'missing', label: t('groupSessions.homeworkTab.reviewStates.missing') },
        { id: 'needs_revision', label: t('groupSessions.homeworkTab.reviewStates.needsRevisionFilter') },
        { id: 'late', label: t('groupSessions.homeworkTab.reviewStates.late') },
    ], [t]);

    const closePreview = useCallback(() => {
        setPreviewState((current) => {
            if (current.url) {
                window.URL.revokeObjectURL(current.url);
            }
            return {
                open: false,
                loading: false,
                title: '',
                url: '',
                contentType: '',
                canPreview: false,
            };
        });
    }, []);

    const closeReviewModal = useCallback(() => {
        setReviewModal({
            open: false,
            submissionId: null,
            status: 'approved',
            comment: '',
            studentName: '',
        });
    }, []);

    const openDeleteModal = (homeworkId, homeworkTitle) => {
        setDeleteModal({
            open: true,
            homeworkId,
            homeworkTitle,
            loading: false,
        });
    };

    const closeDeleteModal = useCallback(() => {
        setDeleteModal({
            open: false,
            homeworkId: null,
            homeworkTitle: '',
            loading: false,
        });
    }, []);

    const openHomeworkModal = useCallback((mode = 'create', homework = null) => {
        setHomeworkModal({
            open: true,
            mode,
            homework,
        });
        setAiHomeworkDraft(null);
        setAiHomeworkDraftError('');
    }, []);

    const closeHomeworkModal = useCallback(() => {
        setHomeworkModal({
            open: false,
            mode: 'create',
            homework: null,
        });
        setAiHomeworkDraft(null);
        setAiHomeworkDraftError('');
    }, []);

    const handleHomeworkSubmit = useCallback(async (formData) => {
        try {
            let saved = false;
            if (homeworkModal.mode === 'create') {
                saved = await publishHomework({
                    title: formData.title,
                    description: formData.description,
                    deadline: formData.deadline,
                    isPublished: formData.isPublished,
                });
            } else {
                saved = await updateHomework(homeworkModal.homework.id, {
                    title: formData.title,
                    description: formData.description,
                    deadline: formData.deadline,
                });
            }

            if (!saved) return;

            toast.success(
                homeworkModal.mode === 'create'
                    ? t('groupSessions.homeworkTab.toasts.created')
                    : t('groupSessions.homeworkTab.toasts.updated')
            );
            closeHomeworkModal();
        } catch (error) {
            toast.error(parseApiError(error, t('groupSessions.homeworkTab.toasts.saveError')).message);
        }
    }, [homeworkModal.mode, homeworkModal.homework, publishHomework, updateHomework, closeHomeworkModal, t]);

    const confirmDelete = async () => {
        if (!deleteModal.homeworkId || !selectedSessionId) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));

        try {
            await deleteSessionHomework(selectedSessionId, deleteModal.homeworkId);
            toast.success(t('groupSessions.homeworkTab.toasts.deleted'));
            closeDeleteModal();
            // Refresh the homework list by triggering a refetch
            // This will be handled by the parent component
        } catch (error) {
            toast.error(parseApiError(error, t('groupSessions.homeworkTab.toasts.deleteError')).message);
        } finally {
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const openReviewModal = (submissionId, status, item) => {
        const existingComment = item?.submission?.reviewComment || '';
        setReviewModal({
            open: true,
            submissionId,
            status,
            comment: existingComment,
            studentName: item?.fullName || '',
        });
        setAiDraft(null);
        setAiDraftError('');
    };

    const closeReviewModalWithAiReset = () => {
        setAiDraft(null);
        setAiDraftError('');
        closeReviewModal();
    };

    const requestAiFeedbackDraft = async () => {
        if (!reviewModal.submissionId) return;
        setAiDraftLoading(true);
        setAiDraftError('');
        try {
            const draft = await generateAiFeedbackDraft(reviewModal.submissionId, {
                submissionType: 'homework',
                language: i18n.language || 'ky',
                tone: 'encouraging',
                includeScoreSuggestion: true,
            });
            setAiDraft({
                generationId: draft.generationId,
                output: draft.output || {},
            });
            toast.success(t('ai.feedbackDraftReady'));
        } catch (error) {
            const parsed = parseApiError(error, t('ai.feedbackDraftFailed'));
            setAiDraftError(parsed.requestId ? t('ai.requestId', { requestId: parsed.requestId }) : parsed.message);
            toast.error(parsed.message);
        } finally {
            setAiDraftLoading(false);
        }
    };

    const useAiDraft = async () => {
        if (!aiDraft) return false;
        try {
            await acceptAiGeneration(aiDraft.generationId);
            setReviewModal((current) => ({
                ...current,
                comment: aiDraft.output?.feedback || current.comment,
            }));
            setAiDraft(null);
            setAiDraftError('');
            toast.success(t('ai.feedbackDraftAccepted'));
            return true;
        } catch (error) {
            toast.error(parseApiError(error, t('ai.feedbackDraftActionFailed')).message);
            return false;
        }
    };

    const cancelAiDraft = async () => {
        if (!aiDraft) return;
        try {
            await rejectAiGeneration(aiDraft.generationId);
            setAiDraft(null);
            setAiDraftError('');
            toast.success(t('ai.feedbackDraftRejected'));
        } catch (error) {
            toast.error(parseApiError(error, t('ai.feedbackDraftActionFailed')).message);
        }
    };

    const requestAiHomeworkDraft = async (brief = {}) => {
        if (!selectedSessionId) return;
        setAiHomeworkDraftLoading(true);
        setAiHomeworkDraftError('');
        try {
            const draft = await generateAiHomeworkDraft(selectedSessionId, {
                language: i18n.language || 'ky',
                topic: brief.topic || selectedSession?.title || '',
                ...(brief.instructions?.trim() ? { instructions: brief.instructions.trim() } : {}),
                ...(brief.difficulty ? { difficulty: brief.difficulty } : {}),
                ...(brief.maxScore !== undefined && brief.maxScore !== null && brief.maxScore !== ''
                    ? { maxScore: Number(brief.maxScore) }
                    : {}),
                includeRubric: brief.includeRubric !== false,
            });
            setAiHomeworkDraft({
                generationId: draft.generationId,
                output: draft.output || {},
            });
            toast.success(t('ai.homeworkDraftReady'));
        } catch (error) {
            const parsed = parseApiError(error, t('ai.homeworkDraftFailed'));
            setAiHomeworkDraftError(parsed.requestId ? t('ai.requestId', { requestId: parsed.requestId }) : parsed.message);
            toast.error(parsed.message);
        } finally {
            setAiHomeworkDraftLoading(false);
        }
    };

    const useAiHomeworkDraft = async () => {
        if (!aiHomeworkDraft) return false;
        try {
            await acceptAiGeneration(aiHomeworkDraft.generationId);
            setAiHomeworkDraft(null);
            setAiHomeworkDraftError('');
            toast.success(t('ai.homeworkDraftAccepted'));
            return true;
        } catch (error) {
            toast.error(parseApiError(error, t('ai.feedbackDraftActionFailed')).message);
            return false;
        }
    };

    const cancelAiHomeworkDraft = async () => {
        if (!aiHomeworkDraft) return;
        try {
            await rejectAiGeneration(aiHomeworkDraft.generationId);
            setAiHomeworkDraft(null);
            setAiHomeworkDraftError('');
            toast.success(t('ai.homeworkDraftRejected'));
        } catch (error) {
            toast.error(parseApiError(error, t('ai.feedbackDraftActionFailed')).message);
        }
    };

    const confirmReviewAction = async () => {
        if (!reviewModal.submissionId) return;

        const trimmedComment = reviewModal.comment.trim();
        if (
            ['needs_revision', 'rejected'].includes(reviewModal.status) &&
            !trimmedComment
        ) {
            return;
        }

        const saved = await reviewHomeworkSubmission(
            reviewModal.submissionId,
            reviewModal.status,
            trimmedComment
        );
        if (saved) {
            closeReviewModalWithAiReset();
        }
    };

    const openAttachmentPreview = async (submissionId, attachmentUrl) => {
        const attachmentName = getAttachmentName(attachmentUrl, t('groupSessions.homeworkTab.fallbacks.attachment'));

        setPreviewState((current) => {
            if (current.url) {
                window.URL.revokeObjectURL(current.url);
            }
            return {
                open: true,
                loading: true,
                title: attachmentName,
                url: '',
                contentType: '',
                canPreview: false,
            };
        });

        try {
            const { blob, contentType } = await fetchSessionHomeworkAttachmentBlob(
                selectedSessionId,
                selectedHomework?.id,
                submissionId
            );
            const objectUrl = window.URL.createObjectURL(blob);
            const normalizedType = String(contentType || blob?.type || '').toLowerCase();
            const lowerName = String(attachmentName || '').toLowerCase();
            const canPreview =
                normalizedType.startsWith('image/') ||
                normalizedType.startsWith('video/') ||
                normalizedType.startsWith('audio/') ||
                normalizedType.includes('pdf') ||
                normalizedType.startsWith('text/') ||
                /\.(pdf|png|jpe?g|webp|gif|mp4|webm|mov|mp3|wav|ogg|txt|csv|json)$/i.test(lowerName);

            setPreviewState({
                open: true,
                loading: false,
                title: attachmentName,
                url: objectUrl,
                contentType: normalizedType,
                canPreview,
            });
        } catch {
            toast.error(t('groupSessions.homeworkTab.toasts.previewError'));
            closePreview();
        }
    };

    const downloadPreviewFile = () => {
        if (!previewState.url) return;
        const link = document.createElement('a');
        link.href = previewState.url;
        link.download = previewState.title || 'attachment';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const renderPreviewBody = () => {
        if (previewState.loading) {
            return (
                <div className="flex min-h-[260px] items-center justify-center text-edubot-muted dark:text-slate-400">
                    <FiLoader className="h-5 w-5 animate-spin" />
                </div>
            );
        }

        if (!previewState.url) {
            return (
                <div className="rounded-2xl border border-edubot-line/80 bg-white/70 p-6 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                    {t('groupSessions.homeworkTab.preview.loadError')}
                </div>
            );
        }

        if (previewState.canPreview && previewState.contentType.startsWith('image/')) {
            return (
                <div className="flex justify-center">
                    <img
                        src={previewState.url}
                        alt={previewState.title}
                        className="max-h-[70vh] w-auto max-w-full rounded-2xl"
                    />
                </div>
            );
        }

        if (previewState.canPreview && previewState.contentType.startsWith('video/')) {
            return (
                <video
                    src={previewState.url}
                    controls
                    className="max-h-[70vh] w-full rounded-2xl bg-black"
                />
            );
        }

        if (previewState.canPreview && previewState.contentType.startsWith('audio/')) {
            return (
                <div className="rounded-2xl border border-edubot-line/80 bg-white/70 p-6 dark:border-slate-700 dark:bg-slate-950">
                    <audio src={previewState.url} controls className="w-full" />
                </div>
            );
        }

        if (
            previewState.canPreview &&
            (previewState.contentType.includes('pdf') || previewState.contentType.startsWith('text/'))
        ) {
            return (
                <iframe
                    src={previewState.url}
                    title={previewState.title}
                    className="h-[70vh] w-full rounded-2xl border border-edubot-line/80 bg-white dark:border-slate-700"
                />
            );
        }

        return (
            <div className="rounded-2xl border border-edubot-line/80 bg-white/70 p-6 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                <div className="font-semibold text-edubot-ink dark:text-white">{t('groupSessions.homeworkTab.preview.unsupportedTitle')}</div>
                <div className="mt-2">{t('groupSessions.homeworkTab.preview.unsupportedDescription')}</div>
            </div>
        );
    };

    if (!selectedSessionId) {
        return (
            <EmptyState
                title={t('groupSessions.homeworkTab.empty.noSessionTitle')}
                subtitle={t('groupSessions.homeworkTab.empty.noSessionSubtitle')}
                icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                className="dashboard-panel"
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DashboardMetricCard
                    label={t('groupSessions.homeworkTab.metrics.total')}
                    value={homeworkStats.total}
                    icon={FiBookOpen}
                />
                <DashboardMetricCard
                    label={t('groupSessions.homeworkTab.metrics.active')}
                    value={homeworkStats.open}
                    icon={FiActivity}
                    tone="green"
                />
                <DashboardMetricCard
                    label={t('groupSessions.homeworkTab.metrics.dueSoon')}
                    value={homeworkStats.dueSoon}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label={t('groupSessions.homeworkTab.metrics.overdue')}
                    value={homeworkStats.overdue}
                    icon={FiAlertCircle}
                    tone="red"
                />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr),minmax(0,1.15fr)]">
                <DashboardInsetPanel
                    title={t('groupSessions.homeworkTab.create.title')}
                    description={t('groupSessions.homeworkTab.create.description')}
                    action={
                        <button
                            onClick={() => openHomeworkModal('create')}
                            disabled={!selectedSessionId}
                            className="dashboard-button-primary"
                        >
                            {t('groupSessions.homeworkTab.create.action')}
                        </button>
                    }
                >
                    <div className="dashboard-panel-muted rounded-2xl px-4 py-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('groupSessions.homeworkTab.create.assignedTo')}
                                </div>
                                <div className="mt-1 break-words text-sm font-semibold text-edubot-ink dark:text-white">
                                    {selectedGroup?.name || selectedGroup?.code || t('groupSessions.homeworkTab.fallbacks.noGroup')}
                                </div>
                            </div>
                            <div className="min-w-0 sm:text-right">
                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                    {t('groupSessions.homeworkTab.labels.session')}
                                </div>
                                <div className="mt-1 break-words text-sm font-semibold text-edubot-ink dark:text-white">
                                    {selectedSession?.title || `#${selectedSessionId}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title={t('groupSessions.homeworkTab.list.title')}
                    description={t('groupSessions.homeworkTab.list.description')}
                    action={<StatusBadge tone="default">{publishedHomework.length}</StatusBadge>}
                >
                    <DashboardFilterBar className="mt-4" gridClassName="items-center lg:grid-cols-[minmax(0,1fr),180px] xl:grid-cols-[minmax(0,1fr),180px]">
                        <div className="relative min-w-0 w-full">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                            <input
                                value={homeworkQuery}
                                onChange={(e) => setHomeworkQuery(e.target.value)}
                                placeholder={t('groupSessions.homeworkTab.list.searchPlaceholder')}
                                className="dashboard-field dashboard-field-icon h-12 w-full pl-10"
                            />
                        </div>
                        <select
                            value={homeworkFilter}
                            onChange={(e) => setHomeworkFilter(e.target.value)}
                            className="dashboard-select h-12 min-w-0 w-full"
                        >
                            {homeworkFilterOptions.map((option) => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                    </DashboardFilterBar>

                    {loadingHomework && (
                        <div className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                            {t('groupSessions.homeworkTab.list.loading')}
                        </div>
                    )}

                    <div className="mt-4 space-y-3 max-h-[28rem] overflow-auto pr-1">
                        {filteredHomework.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedHomeworkId(String(item.id))}
                                className={`w-full cursor-pointer rounded-3xl border p-4 text-left transition ${String(item.id) === String(selectedHomeworkId)
                                    ? 'border-edubot-orange bg-white shadow-edubot-card dark:bg-slate-900'
                                    : 'border-edubot-line/80 bg-white/80 hover:-translate-y-0.5 hover:border-edubot-orange/40 hover:shadow-edubot-card dark:border-slate-700 dark:bg-slate-950'
                                    }`}
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="font-medium text-edubot-ink dark:text-white">
                                            {item.title || item.name || t('groupSessions.homeworkTab.fallbacks.homework')}
                                        </div>
                                        <div className="mt-1 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                            {item.description || t('groupSessions.homeworkTab.fallbacks.noDescription')}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:max-w-[220px] sm:justify-end">
                                        <StatusBadge
                                            tone={item.deadlineMeta.tone || 'default'}
                                            className="shrink-0 text-[11px]"
                                        >
                                            {item.deadlineMeta.label}
                                        </StatusBadge>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleHomeworkPublish(item.id, item.isPublished);
                                            }}
                                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 ${item.isPublished
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/20'
                                                : 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/20'
                                                }`}
                                            title={item.isPublished ? t('groupSessions.homeworkTab.actions.unpublish') : t('groupSessions.homeworkTab.actions.publish')}
                                        >
                                            {item.isPublished ? (
                                                <>
                                                    <FiCheckCircle className="h-3 w-3" />
                                                    {t('groupSessions.homeworkTab.status.published')}
                                                </>
                                            ) : (
                                                <>
                                                    <FiAlertCircle className="h-3 w-3" />
                                                    {t('groupSessions.homeworkTab.status.unpublished')}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(item.id, item.title || item.name || t('groupSessions.homeworkTab.fallbacks.homework'));
                                            }}
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition-all hover:scale-105 hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-500/50 dark:hover:bg-red-500/20"
                                            title={t('groupSessions.homeworkTab.actions.delete')}
                                        >
                                            <FiTrash2 className="h-3 w-3" />
                                            {t('groupSessions.homeworkTab.actions.deleteShort')}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 grid gap-1 text-xs text-edubot-muted dark:text-slate-400">
                                    <span>
                                        {t('groupSessions.homeworkTab.labels.deadline')}: {formatDisplayDate(
                                            resolveHomeworkDeadline(item),
                                            t('groupSessions.homeworkTab.fallbacks.noDeadline'),
                                            i18n.language
                                        )}
                                    </span>
                                    <span className="truncate">{t('groupSessions.homeworkTab.labels.session')}: {selectedSession?.title || `#${selectedSessionId}`}</span>
                                </div>
                            </div>
                        ))}
                        {!loadingHomework && filteredHomework.length === 0 && (
                            <div className="dashboard-panel-muted rounded-3xl p-6 text-sm text-edubot-muted dark:text-slate-400">
                                {publishedHomework.length === 0
                                    ? t('groupSessions.homeworkTab.empty.noHomework')
                                    : t('groupSessions.homeworkTab.empty.noFilteredHomework')}
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>
            </div>

            {selectedHomework ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.82fr),minmax(0,1.18fr)]">
                    <DashboardInsetPanel
                        title={t('groupSessions.homeworkTab.selected.title')}
                        description={t('groupSessions.homeworkTab.selected.description')}
                        action={
                            <button
                                type="button"
                                onClick={() => openHomeworkModal('edit', selectedHomework)}
                                className="dashboard-button-secondary"
                            >
                                <FiEdit3 className="h-4 w-4" />
                                {t('groupSessions.homeworkTab.actions.edit')}
                            </button>
                        }
                    >
                        <div className="mt-4 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-lg font-semibold text-edubot-ink dark:text-white">
                                        {selectedHomework.title || selectedHomework.name || t('groupSessions.homeworkTab.fallbacks.homework')}
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                        {selectedHomework.description || t('groupSessions.homeworkTab.fallbacks.noDescription')}
                                    </p>
                                </div>
                                {selectedHomeworkMeta ? (
                                    <StatusBadge tone={selectedHomeworkMeta.tone || 'default'}>
                                        {selectedHomeworkMeta.label}
                                    </StatusBadge>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <StatusBadge tone={selectedHomeworkMeta?.tone || 'default'}>
                                    {t('groupSessions.homeworkTab.labels.deadline')}: {formatDisplayDate(
                                        resolveHomeworkDeadline(selectedHomework),
                                        t('groupSessions.homeworkTab.fallbacks.noDeadline'),
                                        i18n.language
                                    )}
                                </StatusBadge>
                                <StatusBadge tone="default">
                                    {t('groupSessions.homeworkTab.selected.assignedStudents', { count: students.length })}
                                </StatusBadge>
                                <StatusBadge tone={submissionStats.needsReview > 0 ? 'amber' : 'default'}>
                                    {t('groupSessions.homeworkTab.selected.needsReviewCount', { count: submissionStats.needsReview })}
                                </StatusBadge>
                            </div>

                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('groupSessions.homeworkTab.review.title')}
                        description={t('groupSessions.homeworkTab.review.description')}
                        action={<StatusBadge tone="default">{t('groupSessions.homeworkTab.review.studentsCount', { count: submissionStats.total })}</StatusBadge>}
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('groupSessions.homeworkTab.review.needsReview')}
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                    {submissionStats.needsReview}
                                </div>
                            </div>
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('groupSessions.homeworkTab.review.needsRevision')}
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-amber-700 dark:text-amber-300">
                                    {submissionStats.needsRevision}
                                </div>
                            </div>
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('groupSessions.homeworkTab.review.missing')}
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-red-700 dark:text-red-300">
                                    {submissionStats.missing}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <StatusBadge tone="default">{t('groupSessions.homeworkTab.review.pending')}: {submissionStats.pendingSubmission}</StatusBadge>
                            <StatusBadge tone="amber">{t('groupSessions.homeworkTab.review.late')}: {submissionStats.late}</StatusBadge>
                            <StatusBadge tone="green">{t('groupSessions.homeworkTab.review.approved')}: {submissionStats.approved}</StatusBadge>
                            <StatusBadge tone="red">{t('groupSessions.homeworkTab.review.rejected')}: {submissionStats.rejected}</StatusBadge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                            {reviewFilterOptions.map((filterOption) => (
                                <button
                                    key={filterOption.id}
                                    type="button"
                                    onClick={() => setHomeworkReviewFilter(filterOption.id)}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${homeworkReviewFilter === filterOption.id
                                        ? 'bg-edubot-orange text-white shadow-edubot-card'
                                        : 'border border-edubot-line bg-white text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                                        }`}
                                >
                                    {filterOption.label}
                                </button>
                            ))}
                        </div>

                        {loadingHomeworkSubmissions && (
                            <div className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                                {t('groupSessions.homeworkTab.review.loading')}
                            </div>
                        )}
                        {!loadingHomeworkSubmissions && homeworkSubmissions.length === 0 && (
                            <div className="mt-4 dashboard-panel-muted p-6 text-sm text-edubot-muted dark:text-slate-400">
                                {t('groupSessions.homeworkTab.empty.noStudents')}
                            </div>
                        )}
                        {!loadingHomeworkSubmissions &&
                            homeworkSubmissions.length > 0 &&
                            filteredReviewItems.length === 0 && (
                                <div className="mt-4 dashboard-panel-muted p-6 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('groupSessions.homeworkTab.empty.noFilteredStudents')}
                                </div>
                            )}
                        <div className="mt-4 grid gap-3">
                            {filteredReviewItems.map((item) => {
                                const reviewMeta = getReviewStateMeta(item, getSubmissionStatusMeta, t);
                                const submission = item.submission || null;
                                const previewText = submission
                                    ? getSubmissionPreview(
                                        submission,
                                        t('groupSessions.homeworkTab.fallbacks.answerUploaded')
                                    )
                                    : '';
                                const attachmentUrl = submission
                                    ? getSubmissionAttachmentUrl(submission)
                                    : '';
                                const hasAttachment =
                                    Boolean(attachmentUrl) && previewText !== attachmentUrl;
                                return (
                                    <div
                                        key={submission?.id || `student-${item.studentId}`}
                                        className={`rounded-2xl border p-4 ${submission
                                            ? 'dashboard-panel-muted'
                                            : item.reviewState === 'missing'
                                                ? 'border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10'
                                                : 'border-edubot-line/80 bg-white/70 dark:border-slate-700 dark:bg-slate-950'
                                            }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="font-medium text-sm text-edubot-ink dark:text-white">
                                                        {item.fullName || `#${item.studentId}`}
                                                    </div>
                                                    <StatusBadge tone={reviewMeta.tone || 'default'} className="text-[11px]">
                                                        {reviewMeta.label}
                                                    </StatusBadge>
                                                    {item.isLate && (
                                                        <StatusBadge tone="amber" className="text-[11px]">
                                                            {t('groupSessions.homeworkTab.reviewStates.lateShort')}
                                                        </StatusBadge>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {submission
                                                        ? t('groupSessions.homeworkTab.review.submittedAt', {
                                                            date: formatDisplayDate(
                                                                submission.submittedAt ||
                                                                submission.createdAt,
                                                                '-',
                                                                i18n.language
                                                            ),
                                                        })
                                                        : item.reviewState === 'missing'
                                                            ? t('groupSessions.homeworkTab.review.missingAfterDeadline')
                                                            : t('groupSessions.homeworkTab.review.pendingSubmission')}
                                                </div>
                                                {submission ? (
                                                    <>
                                                        <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                <FiFileText className="h-4 w-4" />
                                                                {t('groupSessions.homeworkTab.review.answerContent')}
                                                            </div>
                                                            <p className="whitespace-pre-wrap break-words leading-6">
                                                                {previewText}
                                                            </p>
                                                        </div>
                                                        {hasAttachment && (
                                                            <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                    <FiPaperclip className="h-4 w-4" />
                                                                    {t('groupSessions.homeworkTab.review.attachment')}
                                                                </div>
                                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate font-medium text-edubot-ink dark:text-white">
                                                                            {getAttachmentName(
                                                                                attachmentUrl,
                                                                                t('groupSessions.homeworkTab.fallbacks.attachment')
                                                                            )}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                                            {t('groupSessions.homeworkTab.review.attachmentDescription')}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openAttachmentPreview(
                                                                                submission.id,
                                                                                attachmentUrl
                                                                            )
                                                                        }
                                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-edubot-line px-3 py-2 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200 sm:w-auto"
                                                                    >
                                                                        <FiPlayCircle className="h-4 w-4" />
                                                                        {t('groupSessions.homeworkTab.actions.view')}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {submission.reviewComment ? (
                                                            <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                    <FiEdit3 className="h-4 w-4" />
                                                                    {t('groupSessions.homeworkTab.review.feedback')}
                                                                </div>
                                                                <p className="whitespace-pre-wrap break-words leading-6">
                                                                    {submission.reviewComment}
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {item.reviewState === 'missing' && (
                                                            <StatusBadge tone="red">{t('groupSessions.homeworkTab.review.followUpNeeded')}</StatusBadge>
                                                        )}
                                                        {item.reviewState === 'pending_submission' && (
                                                            <StatusBadge tone="default">{t('groupSessions.homeworkTab.review.waiting')}</StatusBadge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {submission && (
                                                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(submission.id, 'approved', item)}
                                                        disabled={
                                                            reviewingSubmissionId ===
                                                            String(submission.id)
                                                        }
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:w-auto"
                                                    >
                                                        <FiCheck className="h-4 w-4" />
                                                        {t('groupSessions.homeworkTab.actions.approve')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openReviewModal(submission.id, 'needs_revision', item)
                                                        }
                                                        disabled={
                                                            reviewingSubmissionId ===
                                                            String(submission.id)
                                                        }
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:w-auto"
                                                    >
                                                        <FiEdit3 className="h-4 w-4" />
                                                        {t('groupSessions.homeworkTab.actions.requestRevision')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(submission.id, 'rejected', item)}
                                                        disabled={
                                                            reviewingSubmissionId ===
                                                            String(submission.id)
                                                        }
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:w-auto"
                                                    >
                                                        <FiXCircle className="h-4 w-4" />
                                                        {t('groupSessions.homeworkTab.actions.reject')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DashboardInsetPanel>
                </div>
            ) : (
                <DashboardInsetPanel
                    title={t('groupSessions.homeworkTab.empty.selectHomeworkPanelTitle')}
                    description={t('groupSessions.homeworkTab.empty.selectHomeworkPanelDescription')}
                >
                    <EmptyState
                        title={t('groupSessions.homeworkTab.empty.selectHomeworkTitle')}
                        subtitle={t('groupSessions.homeworkTab.empty.selectHomeworkSubtitle')}
                        icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                        className="py-6"
                    />
                </DashboardInsetPanel>
            )}

            <BasicModal
                isOpen={previewState.open}
                onClose={closePreview}
                title={previewState.title || t('groupSessions.homeworkTab.preview.title')}
                size="xl"
            >
                <div className="space-y-4">
                    {renderPreviewBody()}
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={downloadPreviewFile}
                            disabled={!previewState.url}
                            className="inline-flex items-center gap-2 rounded-xl border border-edubot-line px-4 py-2 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                        >
                            <FiDownload className="h-4 w-4" />
                            {t('groupSessions.homeworkTab.actions.download')}
                        </button>
                    </div>
                </div>
            </BasicModal>

            <BasicModal
                isOpen={reviewModal.open}
                onClose={closeReviewModalWithAiReset}
                title={
                    reviewModal.status === 'approved'
                        ? t('groupSessions.homeworkTab.reviewModal.approveTitle')
                        : reviewModal.status === 'needs_revision'
                            ? t('groupSessions.homeworkTab.reviewModal.revisionTitle')
                            : t('groupSessions.homeworkTab.reviewModal.rejectTitle')
                }
                subtitle={
                    reviewModal.studentName
                        ? t('groupSessions.homeworkTab.reviewModal.subtitleWithName', { name: reviewModal.studentName })
                        : t('groupSessions.homeworkTab.reviewModal.subtitle')
                }
                size="md"
            >
                <div className="space-y-4">
                    <div className="rounded-2xl border border-edubot-line/80 bg-white/70 p-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                        {reviewModal.status === 'approved'
                            ? t('groupSessions.homeworkTab.reviewModal.approveHelp')
                            : t('groupSessions.homeworkTab.reviewModal.requiredHelp')}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                            {t('groupSessions.homeworkTab.reviewModal.commentLabel')}
                        </label>
                        <textarea
                            value={reviewModal.comment}
                            onChange={(e) =>
                                setReviewModal((current) => ({
                                    ...current,
                                    comment: e.target.value,
                                }))
                            }
                            rows={5}
                            placeholder={
                                reviewModal.status === 'approved'
                                    ? t('groupSessions.homeworkTab.reviewModal.approvePlaceholder')
                                    : t('groupSessions.homeworkTab.reviewModal.requiredPlaceholder')
                            }
                            className="dashboard-field"
                        />
                        {['needs_revision', 'rejected'].includes(reviewModal.status) &&
                            !reviewModal.comment.trim() && (
                                <p className="text-xs text-red-600 dark:text-red-300">
                                    {t('groupSessions.homeworkTab.reviewModal.commentRequired')}
                                </p>
                            )}
                    </div>
                    {aiFeedbackDraftEnabled ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={requestAiFeedbackDraft}
                                disabled={aiDraftLoading || reviewingSubmissionId === String(reviewModal.submissionId)}
                                className="dashboard-button-secondary"
                            >
                                <FiZap className="h-4 w-4" />
                                {aiDraftLoading ? t('ai.generating') : t('ai.suggestFeedback')}
                            </button>
                            {aiDraft ? (
                                <>
                                    <button type="button" onClick={useAiDraft} className="dashboard-button-secondary">
                                        {t('ai.useDraft')}
                                    </button>
                                    <button type="button" onClick={cancelAiDraft} className="dashboard-button-secondary text-red-600">
                                        {t('ai.cancelDraft')}
                                    </button>
                                </>
                            ) : null}
                        </div>
                        {aiDraft ? (
                            <div className="mt-3 space-y-2">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                                    {t('ai.feedbackDraft')}
                                </div>
                                <textarea
                                    value={aiDraft.output?.feedback || ''}
                                    onChange={(event) => setAiDraft((current) => ({
                                        ...current,
                                        output: {
                                            ...(current?.output || {}),
                                            feedback: event.target.value,
                                        },
                                    }))}
                                    rows={4}
                                    className="dashboard-field"
                                    aria-label={t('ai.feedbackDraft')}
                                />
                                {aiDraft.output?.nextStep ? (
                                    <p className="text-xs leading-5 text-edubot-muted dark:text-slate-300">{aiDraft.output.nextStep}</p>
                                ) : null}
                            </div>
                        ) : null}
                        {aiDraftError ? <p className="mt-2 text-xs text-red-600 dark:text-red-300">{aiDraftError}</p> : null}
                    </div>
                    ) : null}
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeReviewModalWithAiReset}
                            className="dashboard-button-secondary"
                        >
                            {t('groupSessions.homeworkTab.actions.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={confirmReviewAction}
                            disabled={
                                reviewingSubmissionId === String(reviewModal.submissionId) ||
                                (['needs_revision', 'rejected'].includes(reviewModal.status) &&
                                    !reviewModal.comment.trim())
                            }
                            className="dashboard-button-primary"
                        >
                            {reviewModal.status === 'approved'
                                ? t('groupSessions.homeworkTab.actions.approve')
                                : reviewModal.status === 'needs_revision'
                                    ? t('groupSessions.homeworkTab.actions.sendForRevision')
                                    : t('groupSessions.homeworkTab.actions.reject')}
                        </button>
                    </div>
                </div>
            </BasicModal>

            <BasicModal
                isOpen={deleteModal.open}
                onClose={closeDeleteModal}
                title={t('groupSessions.homeworkTab.deleteModal.title')}
                subtitle={t('groupSessions.homeworkTab.deleteModal.subtitle', { title: deleteModal.homeworkTitle })}
                size="md"
            >
                <div className="space-y-4">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        <div className="font-semibold">{t('groupSessions.homeworkTab.deleteModal.warningTitle')}</div>
                        <div className="mt-2">
                            {t('groupSessions.homeworkTab.deleteModal.warningDescription')}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            disabled={deleteModal.loading}
                            className="dashboard-button-secondary"
                        >
                            {t('groupSessions.homeworkTab.actions.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={deleteModal.loading}
                            className="dashboard-button-primary bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:opacity-50"
                        >
                            {deleteModal.loading ? t('groupSessions.homeworkTab.actions.deleting') : t('groupSessions.homeworkTab.actions.confirmDelete')}
                        </button>
                    </div>
                </div>
            </BasicModal>

            <HomeworkModal
                isOpen={homeworkModal.open}
                onClose={closeHomeworkModal}
                onSubmit={handleHomeworkSubmit}
                homework={homeworkModal.homework}
                mode={homeworkModal.mode}
                loading={savingHomework || updatingHomework}
                selectedSession={selectedSession}
                aiDraftEnabled={homeworkModal.mode === 'create' && aiHomeworkDraftEnabled}
                aiDraft={aiHomeworkDraft}
                aiDraftLoading={aiHomeworkDraftLoading}
                aiDraftError={aiHomeworkDraftError}
                onRequestAiDraft={requestAiHomeworkDraft}
                onUseAiDraft={useAiHomeworkDraft}
                onCancelAiDraft={cancelAiHomeworkDraft}
            />
        </div>
    );
};

SessionHomeworkTab.propTypes = {
    deleteSessionHomework: PropTypes.func.isRequired,
    filteredHomework: PropTypes.arrayOf(PropTypes.object).isRequired,
    formatDisplayDate: PropTypes.func.isRequired,
    getAttachmentName: PropTypes.func.isRequired,
    getSubmissionAttachmentUrl: PropTypes.func.isRequired,
    getSubmissionPreview: PropTypes.func.isRequired,
    getSubmissionStatusMeta: PropTypes.func.isRequired,
    homeworkFilter: PropTypes.string.isRequired,
    homeworkQuery: PropTypes.string.isRequired,
    homeworkReviewFilter: PropTypes.string.isRequired,
    homeworkStats: PropTypes.shape({
        total: PropTypes.number,
        open: PropTypes.number,
        dueSoon: PropTypes.number,
        overdue: PropTypes.number,
    }).isRequired,
    homeworkSubmissions: PropTypes.arrayOf(PropTypes.object).isRequired,
    loadingHomework: PropTypes.bool.isRequired,
    loadingHomeworkSubmissions: PropTypes.bool.isRequired,
    publishHomework: PropTypes.func.isRequired,
    publishedHomework: PropTypes.arrayOf(PropTypes.object).isRequired,
    resolveHomeworkDeadline: PropTypes.func.isRequired,
    reviewHomeworkSubmission: PropTypes.func.isRequired,
    reviewingSubmissionId: PropTypes.string.isRequired,
    savingHomework: PropTypes.bool.isRequired,
    selectedGroup: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
    }),
    selectedSession: PropTypes.shape({
        courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
    }),
    selectedSessionId: PropTypes.string,
    setHomeworkFilter: PropTypes.func.isRequired,
    setHomeworkQuery: PropTypes.func.isRequired,
    setHomeworkReviewFilter: PropTypes.func.isRequired,
    setSelectedHomeworkId: PropTypes.func.isRequired,
    students: PropTypes.arrayOf(PropTypes.object).isRequired,
    submissionStats: PropTypes.shape({
        total: PropTypes.number,
        pending: PropTypes.number,
        needsReview: PropTypes.number,
        overdue: PropTypes.number,
    }).isRequired,
    toggleHomeworkPublish: PropTypes.func.isRequired,
    updatingHomework: PropTypes.bool.isRequired,
    updateHomework: PropTypes.func.isRequired,
};

SessionHomeworkTab.defaultProps = {
    selectedGroup: null,
    selectedHomework: null,
    selectedHomeworkMeta: null,
    selectedSession: null,
    selectedSessionId: '',
};

export default SessionHomeworkTab;

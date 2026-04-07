import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
    FiActivity,
    FiAlertCircle,
    FiBookOpen,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiDownload,
    FiEdit3,
    FiExternalLink,
    FiFileText,
    FiLoader,
    FiPaperclip,
    FiPlayCircle,
    FiSearch,
    FiTrash2,
    FiXCircle,
} from 'react-icons/fi';
import BasicModal from '../../../shared/ui/BasicModal';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    EmptyState,
    StatusBadge,
} from '../../../components/ui/dashboard';
import { fetchSessionHomeworkAttachmentBlob, deleteSessionHomework } from '../../homework/api';
import HomeworkModal from './HomeworkModal';

const getReviewStateMeta = (item, getSubmissionStatusMeta) => {
    if (item.reviewState === 'missing') {
        return { label: 'Жөнөткөн жок', tone: 'red' };
    }
    if (item.reviewState === 'pending_submission') {
        return { label: 'Азырынча жөнөтө элек', tone: 'default' };
    }
    if (item.reviewState === 'needs_review') {
        return { label: 'Текшерүү керек', tone: 'amber' };
    }
    const statusMeta = getSubmissionStatusMeta(item.status);
    if (statusMeta.label === 'Бекитилди') return { ...statusMeta, tone: 'green' };
    if (statusMeta.label === 'Оңдоп кайра жиберүү') return { ...statusMeta, tone: 'amber' };
    if (statusMeta.label === 'Кайтарылды') return { ...statusMeta, tone: 'red' };
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
    beginHomeworkEdit,
    cancelHomeworkEdit,
    editHomeworkDeadline,
    editHomeworkDescription,
    editHomeworkTitle,
    filteredHomework,
    formatDisplayDate,
    getAttachmentName,
    getSubmissionAttachmentUrl,
    getSubmissionPreview,
    getSubmissionStatusMeta,
    homeworkDeadline,
    homeworkDescription,
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
    saveHomeworkEdit,
    savingHomework,
    selectedGroup,
    selectedHomework,
    selectedHomeworkId,
    selectedHomeworkMeta,
    selectedSession,
    selectedSessionId,
    setEditHomeworkDeadline,
    setEditHomeworkDescription,
    setEditHomeworkTitle,
    setHomeworkDeadline,
    setHomeworkDescription,
    setHomeworkFilter,
    setHomeworkQuery,
    setHomeworkReviewFilter,
    setHomeworkTitle,
    setSelectedHomeworkId,
    students,
    submissionStats,
    toggleHomeworkPublish,
    updatingHomework,
    homeworkTitle,
    editingHomeworkId,
}) => {
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
    }, []);

    const closeHomeworkModal = useCallback(() => {
        setHomeworkModal({
            open: false,
            mode: 'create',
            homework: null,
        });
    }, []);

    const handleHomeworkSubmit = useCallback(async (formData) => {
        try {
            if (homeworkModal.mode === 'create') {
                await publishHomework({
                    title: formData.title,
                    description: formData.description,
                    deadline: formData.deadline,
                    isPublished: formData.isPublished,
                });
                toast.success('Үй тапшырма ийгиликтүү түзүлдү');
            } else {
                await updateHomework(homeworkModal.homework.id, {
                    title: formData.title,
                    description: formData.description,
                    deadline: formData.deadline,
                });
                toast.success('Үй тапшырма ийгиликтүү өзгөртүлдү');
            }
            closeHomeworkModal();
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Ката кетти';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        }
    }, [homeworkModal.mode, homeworkModal.homework, publishHomework, updateHomework, closeHomeworkModal]);

    const confirmDelete = async () => {
        if (!deleteModal.homeworkId || !selectedSessionId) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));

        try {
            await deleteSessionHomework(selectedSessionId, deleteModal.homeworkId);
            toast.success('Үй тапшырма ийгиликтүү өчүрүлдү');
            closeDeleteModal();
            // Refresh the homework list by triggering a refetch
            // This will be handled by the parent component
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Үй тапшырманы өчүрүүдө ката кетти';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
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
            closeReviewModal();
        }
    };

    const openAttachmentPreview = async (submissionId, attachmentUrl) => {
        const attachmentName = getAttachmentName(attachmentUrl);

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
            toast.error('Тиркемени ачуу мүмкүн болгон жок.');
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
                    Тиркемени жүктөө мүмкүн болгон жок.
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
                <div className="font-semibold text-edubot-ink dark:text-white">Бул файлды барак ичинде алдын ала көрүү колдоого алынбайт.</div>
                <div className="mt-2">Файлды жүктөп алып ачсаңыз болот.</div>
            </div>
        );
    };

    if (!selectedSessionId) {
        return (
            <EmptyState
                title="Үй тапшырма үчүн сессия тандаңыз"
                subtitle="Тапшырма жарыялоо, өзгөртүү жана студент жоопторун текшерүү үчүн алгач активдүү группадан бир сессияны тандаңыз."
                icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                className="dashboard-panel"
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DashboardMetricCard
                    label="Жалпы тапшырма"
                    value={homeworkStats.total}
                    icon={FiBookOpen}
                />
                <DashboardMetricCard
                    label="Активдүү"
                    value={homeworkStats.open}
                    icon={FiActivity}
                    tone="green"
                />
                <DashboardMetricCard
                    label="Жакында бүтөт"
                    value={homeworkStats.dueSoon}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label="Өтүп кеткен"
                    value={homeworkStats.overdue}
                    icon={FiAlertCircle}
                    tone="red"
                />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr),minmax(0,1.15fr)]">
                <DashboardInsetPanel
                    title="Жаңы үй тапшырма"
                    description="Студенттер үчүн жаңы үй тапшырма түзүңүз."
                    action={
                        <button
                            onClick={() => openHomeworkModal('create')}
                            disabled={!selectedSessionId}
                            className="dashboard-button-primary"
                        >
                            Үй тапшырма түзүү
                        </button>
                    }
                >
                    <div className="dashboard-panel-muted rounded-2xl px-4 py-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Дайындалат
                                </div>
                                <div className="mt-1 break-words text-sm font-semibold text-edubot-ink dark:text-white">
                                    {selectedGroup?.name || selectedGroup?.code || 'Группа тандалган жок'}
                                </div>
                            </div>
                            <div className="min-w-0 sm:text-right">
                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                    Сессия
                                </div>
                                <div className="mt-1 break-words text-sm font-semibold text-edubot-ink dark:text-white">
                                    {selectedSession?.title || `#${selectedSessionId}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title="Тапшырмалар тизмеси"
                    description="Издеп табыңыз, deadline абалы боюнча чыпкалап, керектүүсүн тандап текшерүүгө өтүңүз."
                    action={<StatusBadge tone="default">{publishedHomework.length}</StatusBadge>}
                >
                    <DashboardFilterBar className="mt-4" gridClassName="items-center lg:grid-cols-[minmax(0,1fr),180px] xl:grid-cols-[minmax(0,1fr),180px]">
                        <div className="relative min-w-0 w-full">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                            <input
                                value={homeworkQuery}
                                onChange={(e) => setHomeworkQuery(e.target.value)}
                                placeholder="Тапшырма издөө"
                                className="dashboard-field dashboard-field-icon h-12 w-full pl-10"
                            />
                        </div>
                        <select
                            value={homeworkFilter}
                            onChange={(e) => setHomeworkFilter(e.target.value)}
                            className="dashboard-select h-12 min-w-0 w-full"
                        >
                            <option value="all">Баары</option>
                            <option value="active">Активдүү</option>
                            <option value="dueSoon">Жакында бүтөт</option>
                            <option value="overdue">Өтүп кеткен</option>
                            <option value="noDeadline">Мөөнөт жок</option>
                        </select>
                    </DashboardFilterBar>

                    {loadingHomework && (
                        <div className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                            Үй тапшырмалар жүктөлүүдө...
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
                                            {item.title || item.name || 'Homework'}
                                        </div>
                                        <div className="mt-1 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                            {item.description || 'Түшүндүрмө кошула элек.'}
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
                                            title={item.isPublished ? 'Жарыялоону токтотуу' : 'Жарыялоо'}
                                        >
                                            {item.isPublished ? (
                                                <>
                                                    <FiCheckCircle className="h-3 w-3" />
                                                    Жарыяланган
                                                </>
                                            ) : (
                                                <>
                                                    <FiAlertCircle className="h-3 w-3" />
                                                    Жарыяланбаган
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(item.id, item.title || item.name || 'Үй тапшырма');
                                            }}
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition-all hover:scale-105 hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-500/50 dark:hover:bg-red-500/20"
                                            title="Үй тапшырманы өчүрүү"
                                        >
                                            <FiTrash2 className="h-3 w-3" />
                                            Өчүрүү
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 grid gap-1 text-xs text-edubot-muted dark:text-slate-400">
                                    <span>Deadline: {formatDisplayDate(resolveHomeworkDeadline(item))}</span>
                                    <span className="truncate">Session: {selectedSession?.title || `#${selectedSessionId}`}</span>
                                </div>
                            </div>
                        ))}
                        {!loadingHomework && filteredHomework.length === 0 && (
                            <div className="dashboard-panel-muted rounded-3xl p-6 text-sm text-edubot-muted dark:text-slate-400">
                                {publishedHomework.length === 0
                                    ? 'Бул сессия боюнча үй тапшырма азырынча жок.'
                                    : 'Издөө же фильтр боюнча тапшырма табылган жок.'}
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>
            </div>

            {selectedHomework ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.82fr),minmax(0,1.18fr)]">
                    <DashboardInsetPanel
                        title="Тандалган тапшырма"
                        description="Тапшырманын мазмуну жана негизги абалы."
                        action={
                            <button
                                type="button"
                                onClick={() => openHomeworkModal('edit', selectedHomework)}
                                className="dashboard-button-secondary"
                            >
                                <FiEdit3 className="h-4 w-4" />
                                Өзгөртүү
                            </button>
                        }
                    >
                        <div className="mt-4 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-lg font-semibold text-edubot-ink dark:text-white">
                                        {selectedHomework.title || selectedHomework.name || 'Homework'}
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                        {selectedHomework.description || 'Түшүндүрмө кошула элек.'}
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
                                    Deadline: {formatDisplayDate(resolveHomeworkDeadline(selectedHomework))}
                                </StatusBadge>
                                <StatusBadge tone="default">
                                    {students.length} студентке дайындалды
                                </StatusBadge>
                                <StatusBadge tone={submissionStats.needsReview > 0 ? 'amber' : 'default'}>
                                    {submissionStats.needsReview} текшерүү күтөт
                                </StatusBadge>
                            </div>

                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Жоопторду текшерүү"
                        description="Бул тизмеде тапшырма берилген бардык студенттер көрүнөт: ким тапшырды, ким текшерүүнү күтүп жатат жана ким дагы эле жөнөткөн жок."
                        action={<StatusBadge tone="default">{submissionStats.total} студент</StatusBadge>}
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Текшерүү керек
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                    {submissionStats.needsReview}
                                </div>
                            </div>
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Оңдоп келсин
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-amber-700 dark:text-amber-300">
                                    {submissionStats.needsRevision}
                                </div>
                            </div>
                            <div className="dashboard-panel-muted rounded-2xl p-4">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    Жөнөткөн жок
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-red-700 dark:text-red-300">
                                    {submissionStats.missing}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <StatusBadge tone="default">Күтүп турат: {submissionStats.pendingSubmission}</StatusBadge>
                            <StatusBadge tone="amber">Кеч тапшырган: {submissionStats.late}</StatusBadge>
                            <StatusBadge tone="green">Бекитилди: {submissionStats.approved}</StatusBadge>
                            <StatusBadge tone="red">Кайтарылды: {submissionStats.rejected}</StatusBadge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                            {[
                                { id: 'all', label: 'Баары' },
                                { id: 'needs_review', label: 'Текшерүү керек' },
                                { id: 'missing', label: 'Жөнөткөн жок' },
                                { id: 'needs_revision', label: 'Оңдотуу керек' },
                                { id: 'late', label: 'Кеч тапшырган' },
                            ].map((filterOption) => (
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
                                Текшерүү тизмеси жүктөлүүдө...
                            </div>
                        )}
                        {!loadingHomeworkSubmissions && homeworkSubmissions.length === 0 && (
                            <div className="mt-4 dashboard-panel-muted p-6 text-sm text-edubot-muted dark:text-slate-400">
                                Бул тапшырма үчүн студент тизмеси табылган жок.
                            </div>
                        )}
                        {!loadingHomeworkSubmissions &&
                            homeworkSubmissions.length > 0 &&
                            filteredReviewItems.length === 0 && (
                                <div className="mt-4 dashboard-panel-muted p-6 text-sm text-edubot-muted dark:text-slate-400">
                                    Тандалган фильтрге ылайык студент табылган жок.
                                </div>
                            )}
                        <div className="mt-4 grid gap-3">
                            {filteredReviewItems.map((item) => {
                                const reviewMeta = getReviewStateMeta(item, getSubmissionStatusMeta);
                                const submission = item.submission || null;
                                const previewText = submission ? getSubmissionPreview(submission) : '';
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
                                                            Кеч
                                                        </StatusBadge>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {submission
                                                        ? `Жөнөтүлгөн: ${formatDisplayDate(
                                                            submission.submittedAt ||
                                                            submission.createdAt,
                                                            '-'
                                                        )}`
                                                        : item.reviewState === 'missing'
                                                            ? 'Deadline өтүп кетти, бирок студент бул тапшырманы жөнөткөн жок.'
                                                            : 'Бул студент азырынча тапшырма жөнөтө элек.'}
                                                </div>
                                                {submission ? (
                                                    <>
                                                        <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                <FiFileText className="h-4 w-4" />
                                                                Жооп мазмуну
                                                            </div>
                                                            <p className="whitespace-pre-wrap break-words leading-6">
                                                                {previewText}
                                                            </p>
                                                        </div>
                                                        {hasAttachment && (
                                                            <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                    <FiPaperclip className="h-4 w-4" />
                                                                    Тиркелген файл
                                                                </div>
                                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate font-medium text-edubot-ink dark:text-white">
                                                                            {getAttachmentName(
                                                                                attachmentUrl
                                                                            )}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                                            LMSке жүктөлгөн файл же тышкы шилтеме
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
                                                                        Көрүү
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {submission.reviewComment ? (
                                                            <div className="mt-3 rounded-2xl border border-edubot-line/80 bg-white/80 px-3 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-500">
                                                                    <FiEdit3 className="h-4 w-4" />
                                                                    Пикир
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
                                                            <StatusBadge tone="red">Follow-up керек</StatusBadge>
                                                        )}
                                                        {item.reviewState === 'pending_submission' && (
                                                            <StatusBadge tone="default">Азырынча күтүп турабыз</StatusBadge>
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
                                                        Бекитүү
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
                                                        Оңдотуу
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
                                                        Кайтаруу
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
                    title="Тапшырма тандаңыз"
                    description="Тизменин ичинен бир тапшырманы тандасаңыз, мазмуну жана студент жооптору ушул жерде ачылат."
                >
                    <EmptyState
                        title="Тандалган тапшырма жок"
                        subtitle="Сол жактагы тизме аркылуу бир тапшырманы тандап, дароо текшерүү агымына өтүңүз."
                        icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                        className="py-6"
                    />
                </DashboardInsetPanel>
            )}

            <BasicModal
                isOpen={previewState.open}
                onClose={closePreview}
                title={previewState.title || 'Тиркеме'}
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
                            Жүктөп алуу
                        </button>
                    </div>
                </div>
            </BasicModal>

            <BasicModal
                isOpen={reviewModal.open}
                onClose={closeReviewModal}
                title={
                    reviewModal.status === 'approved'
                        ? 'Жоопту бекитүү'
                        : reviewModal.status === 'needs_revision'
                            ? 'Оңдотууга кайтаруу'
                            : 'Жоопту кайтаруу'
                }
                subtitle={
                    reviewModal.studentName
                        ? `${reviewModal.studentName} үчүн комментарий калтырыңыз.`
                        : 'Комментарий калтырыңыз.'
                }
                size="md"
            >
                <div className="space-y-4">
                    <div className="rounded-2xl border border-edubot-line/80 bg-white/70 p-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                        {reviewModal.status === 'approved'
                            ? 'Комментарий кааласаңыз кошуңуз. Бекитүү комментарийсиз да сакталат.'
                            : 'Бул аракет үчүн кыска түшүндүрмө жазыңыз. Студент эмнени оңдошу же эмнеге жооп кайтарылганы түшүнүктүү болушу керек.'}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                            Комментарий
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
                                    ? 'Мисалы: Жооп так жана толук.'
                                    : 'Мисалы: Негизги ойлор жетишпейт, тиркемени кайра текшерип жибериңиз.'
                            }
                            className="dashboard-field"
                        />
                        {['needs_revision', 'rejected'].includes(reviewModal.status) &&
                            !reviewModal.comment.trim() && (
                                <p className="text-xs text-red-600 dark:text-red-300">
                                    Бул аракет үчүн комментарий милдеттүү.
                                </p>
                            )}
                    </div>
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeReviewModal}
                            className="dashboard-button-secondary"
                        >
                            Жокко чыгаруу
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
                                ? 'Бекитүү'
                                : reviewModal.status === 'needs_revision'
                                    ? 'Оңдотууга жөнөтүү'
                                    : 'Кайтаруу'}
                        </button>
                    </div>
                </div>
            </BasicModal>

            <BasicModal
                isOpen={deleteModal.open}
                onClose={closeDeleteModal}
                title="Үй тапшырманы өчүрүү"
                subtitle={`"${deleteModal.homeworkTitle}" деген үй тапшырманы өчүрүүгө ишендиңиз. Бул аракет кайтарылбайт.`}
                size="md"
            >
                <div className="space-y-4">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        <div className="font-semibold">⚠️ Эскертүү</div>
                        <div className="mt-2">
                            Үй тапшырманы өчүрүүдөн кийин аны калыбына кайтаруу мүмкүн эмес. Бардык студент жооптору жана байланышкан маалыматтар жок болот.
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            disabled={deleteModal.loading}
                            className="dashboard-button-secondary"
                        >
                            Жокко чыгаруу
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={deleteModal.loading}
                            className="dashboard-button-primary bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:opacity-50"
                        >
                            {deleteModal.loading ? 'Өчүрүлүүдө...' : 'Өчүрүүгө макулмун'}
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

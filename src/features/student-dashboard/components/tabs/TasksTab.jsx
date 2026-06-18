import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    FiAlertCircle,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiCheckSquare,
    FiClock,
    FiEdit3,
    FiExternalLink,
    FiFileText,
    FiFilter,
    FiLink,
    FiPaperclip,
    FiSearch,
    FiSend,
} from 'react-icons/fi';
import {
    DashboardFilterBar,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    StatusBadge,
} from '../../../../components/ui/dashboard';
import BasicModal from '@shared/ui/BasicModal';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getTaskKey, resolveSessionHomeworkIds } from '../../utils/studentDashboard.helpers.js';
import {
    fetchStudentActivitySubmissionAttachmentPreview,
    fetchStudentHomeworkSubmissionAttachmentPreview,
} from '../../../student/api.js';
import { ActivityInteractiveForm, INTERACTIVE_ACTIVITY_TYPES } from '../ActivityInteractiveForm.jsx';
import { parseApiError } from '@shared/api/error';

const MAX_HOMEWORK_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_HOMEWORK_FILE_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
const ALLOWED_ACTIVITY_FILE_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

const STATUS_META = {
    overdue: {
        labelKey: 'studentDashboard.tasks.statuses.overdue',
        badgeClass:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        accentClass: 'border-red-300/90 dark:border-red-500/40',
        icon: FiAlertCircle,
    },
    pending: {
        labelKey: 'studentDashboard.tasks.statuses.pending',
        badgeClass:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        accentClass: 'border-amber-200/90 dark:border-amber-500/30',
        icon: FiClock,
    },
    submitted: {
        labelKey: 'studentDashboard.tasks.statuses.submitted',
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        accentClass: 'border-sky-200/90 dark:border-sky-500/30',
        icon: FiSend,
    },
    needs_revision: {
        labelKey: 'studentDashboard.tasks.statuses.needsRevision',
        badgeClass:
            'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
        accentClass: 'border-orange-200/90 dark:border-orange-500/30',
        icon: FiEdit3,
    },
    rejected: {
        labelKey: 'studentDashboard.tasks.statuses.rejected',
        badgeClass:
            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
        accentClass: 'border-rose-200/90 dark:border-rose-500/30',
        icon: FiAlertCircle,
    },
    completed: {
        labelKey: 'studentDashboard.tasks.statuses.completed',
        badgeClass:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        accentClass: 'border-emerald-200/90 dark:border-emerald-500/30',
        icon: FiCheckCircle,
    },
    unavailable: {
        labelKey: 'studentDashboard.tasks.statuses.unavailable',
        badgeClass:
            'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
        accentClass: 'border-slate-200/90 dark:border-slate-700',
        icon: FiFileText,
    },
};

const ACTIVITY_TYPE_LABEL_KEY = {
    discussion: 'studentDashboard.tasks.activityTypes.discussion',
    exercise: 'studentDashboard.tasks.activityTypes.exercise',
    quiz: 'studentDashboard.tasks.activityTypes.quiz',
    vocabulary: 'studentDashboard.tasks.activityTypes.vocabulary',
    fill_blank: 'studentDashboard.tasks.activityTypes.fillBlank',
    word_match: 'studentDashboard.tasks.activityTypes.wordMatch',
    listening: 'studentDashboard.tasks.activityTypes.listening',
    writing_correction: 'studentDashboard.tasks.activityTypes.writingCorrection',
    group_work: 'studentDashboard.tasks.activityTypes.groupWork',
};

const ACTIVITY_TYPE_META = {
    discussion: {
        icon: FiEdit3,
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        panelClass:
            'border-sky-200/80 bg-sky-50/70 dark:border-sky-500/20 dark:bg-sky-500/10',
    },
    exercise: {
        icon: FiCheckSquare,
        badgeClass:
            'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
        panelClass:
            'border-violet-200/80 bg-violet-50/70 dark:border-violet-500/20 dark:bg-violet-500/10',
    },
    quiz: {
        icon: FiCheckCircle,
        badgeClass:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        panelClass:
            'border-amber-200/80 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10',
    },
    group_work: {
        icon: FiBookOpen,
        badgeClass:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        panelClass:
            'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10',
    },
    vocabulary: {
        icon: FiFileText,
        badgeClass:
            'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300',
        panelClass:
            'border-purple-200/80 bg-purple-50/70 dark:border-purple-500/20 dark:bg-purple-500/10',
    },
    fill_blank: {
        icon: FiEdit3,
        badgeClass:
            'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300',
        panelClass:
            'border-teal-200/80 bg-teal-50/70 dark:border-teal-500/20 dark:bg-teal-500/10',
    },
    word_match: {
        icon: FiLink,
        badgeClass:
            'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
        panelClass:
            'border-indigo-200/80 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/10',
    },
    listening: {
        icon: FiBookOpen,
        badgeClass:
            'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
        panelClass:
            'border-cyan-200/80 bg-cyan-50/70 dark:border-cyan-500/20 dark:bg-cyan-500/10',
    },
    writing_correction: {
        icon: FiEdit3,
        badgeClass:
            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
        panelClass:
            'border-rose-200/80 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/10',
    },
};

const ACTIVITY_REVIEW_STATUS_LABEL = {
    submitted: 'studentDashboard.tasks.reviewStatuses.submitted',
    approved: 'studentDashboard.tasks.reviewStatuses.approved',
    needs_revision: 'studentDashboard.tasks.reviewStatuses.needsRevision',
    rejected: 'studentDashboard.tasks.reviewStatuses.rejected',
};

const formatTaskDate = (task = {}, t, language) => {
    const raw = task.dueAt || task.deadline || task.due || task.submittedAt;
    if (!raw) return t('studentDashboard.tasks.fallbacks.noDueDate');

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return String(raw);

    return parsed.toLocaleString(language || undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatSubmissionType = (submission = {}, t) => {
    if (submission.attachmentUrl) return t('studentDashboard.tasks.submissionTypes.attachment');
    if (submission.answerText) return t('studentDashboard.tasks.submissionTypes.text');
    return t('studentDashboard.tasks.submissionTypes.answer');
};

const formatSubmissionThreadLabel = (message = {}, t) => {
    if (message.authorRole === 'student') return t('studentDashboard.tasks.thread.student');
    if (message.kind === 'review') return t('studentDashboard.tasks.thread.teacher');
    return t('studentDashboard.tasks.thread.answer');
};

const getTaskCourse = (task = {}, t) => task.courseTitle || task.course || t('studentDashboard.tasks.fallbacks.course');

const getTaskTitle = (task = {}, t) => task.title || task.name || t('studentDashboard.tasks.fallbacks.taskTitle');

const getTaskDescription = (task = {}, t) =>
    task.description ||
    task.instructions ||
    task.prompt ||
    task.text ||
    t('studentDashboard.tasks.fallbacks.description');

const formatBytes = (value) => {
    if (!Number.isFinite(value) || value <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = value;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index += 1;
    }
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const validateSubmissionFile = (file, task = {}, t) => {
    if (!(file instanceof File)) return { valid: true };

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isActivityAttachment = task?.kind === 'activity';
    const allowedExtensions = isActivityAttachment ? ALLOWED_ACTIVITY_FILE_EXTENSIONS : ALLOWED_HOMEWORK_FILE_EXTENSIONS;
    if (!allowedExtensions.has(extension)) {
        return {
            valid: false,
            message: isActivityAttachment
                ? t('studentDashboard.tasks.validation.activityFileType')
                : t('studentDashboard.tasks.validation.homeworkFileType'),
        };
    }

    if (file.size > MAX_HOMEWORK_FILE_SIZE_BYTES) {
        return {
            valid: false,
            message: t('studentDashboard.tasks.validation.fileTooLarge', {
                size: formatBytes(MAX_HOMEWORK_FILE_SIZE_BYTES),
            }),
        };
    }

    return { valid: true };
};

const getNormalizedStatus = (task = {}) => {
    if (task.kind === 'activity') {
        const activityStatus = String(task.activityStatus || '').toLowerCase();
        const submissionStatus = String(
            task.mySubmission?.status || task.myAttempt?.status || task.submissionStatus || task.status || ''
        ).toLowerCase();

        if (submissionStatus === 'needs_revision') return 'needs_revision';
        if (submissionStatus === 'rejected') return 'rejected';
        if (submissionStatus === 'completed' || submissionStatus === 'approved' || task.myAttempt?.passed) {
            return 'completed';
        }
        if (submissionStatus === 'submitted' || task.mySubmission || task.myAttempt) return 'submitted';
        if (activityStatus === 'active') return 'pending';
        return 'unavailable';
    }

    const submissionStatus = String(
        task.mySubmission?.status || task.submissionStatus || task.status || ''
    ).toLowerCase();
    const { sessionId, homeworkId } = resolveSessionHomeworkIds(task);
    const canSubmit = Boolean(sessionId && homeworkId);
    const dueRaw = task.dueAt || task.deadline || task.due;
    const dueDate = dueRaw ? new Date(dueRaw) : null;
    const isDone = submissionStatus === 'completed' || submissionStatus === 'approved';
    const isSubmitted = submissionStatus === 'submitted';
    const isOverdue =
        !isDone &&
        !isSubmitted &&
        submissionStatus !== 'needs_revision' &&
        submissionStatus !== 'rejected' &&
        dueDate &&
        !Number.isNaN(dueDate.getTime()) &&
        dueDate.getTime() < Date.now();

    if (!canSubmit && !isDone) return 'unavailable';
    if (submissionStatus === 'needs_revision') return 'needs_revision';
    if (submissionStatus === 'rejected') return 'rejected';
    if (isDone) return 'completed';
    if (isSubmitted) return 'submitted';
    if (isOverdue) return 'overdue';
    return 'pending';
};

const detectPreviewKind = (contentType = '') => {
    const normalized = String(contentType || '').toLowerCase();
    if (normalized.startsWith('image/')) return 'image';
    if (normalized.startsWith('audio/')) return 'audio';
    if (normalized.includes('pdf')) return 'pdf';
    if (normalized.startsWith('text/')) return 'text';
    return 'download';
};

const TasksTab = ({ tasks, onSubmitHomework, submittingTaskState }) => {
    const { i18n, t } = useTranslation();
    const [drafts, setDrafts] = useState({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [expandedTaskId, setExpandedTaskId] = useState('');
    const [previewState, setPreviewState] = useState({
        open: false,
        title: '',
        objectUrl: '',
        kind: 'download',
        loading: false,
    });

    useEffect(
        () => () => {
            if (previewState.objectUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewState.objectUrl);
            }
        },
        [previewState.objectUrl]
    );

    const closePreview = useCallback(() => {
        setPreviewState((prev) => {
            if (prev.objectUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(prev.objectUrl);
            }
            return {
                open: false,
                title: '',
                objectUrl: '',
                kind: 'download',
                loading: false,
            };
        });
    }, []);

    const openAttachmentPreview = useCallback(
        async (kind, id, title) => {
            setPreviewState({
                open: true,
                title,
                objectUrl: '',
                kind: 'download',
                loading: true,
            });

            try {
                const result =
                    kind === 'activity'
                        ? await fetchStudentActivitySubmissionAttachmentPreview(id)
                        : await fetchStudentHomeworkSubmissionAttachmentPreview(id);
                const objectUrl = URL.createObjectURL(result.blob);
                const kind = detectPreviewKind(result.contentType);

                setPreviewState((prev) => {
                    if (prev.objectUrl?.startsWith('blob:')) {
                        URL.revokeObjectURL(prev.objectUrl);
                    }
                    return {
                        open: true,
                        title,
                        objectUrl,
                        kind,
                        loading: false,
                    };
                });
            } catch (error) {
                console.error('Failed to preview homework attachment', error);
                toast.error(parseApiError(error, t('studentDashboard.tasks.toasts.openAttachmentError')).message);
                closePreview();
            }
        },
        [closePreview, t]
    );

    const taskView = useMemo(
        () =>
            tasks.map((task) => {
                const key = getTaskKey(task);
                const status = getNormalizedStatus(task);
                const meta = STATUS_META[status] || STATUS_META.unavailable;
                const course = getTaskCourse(task, t);
                const title = getTaskTitle(task, t);
                const description = getTaskDescription(task, t);
                const ids = resolveSessionHomeworkIds(task);

                return {
                    task,
                    key,
                    status,
                    meta,
                    activityMeta:
                        task.kind === 'activity'
                            ? ACTIVITY_TYPE_META[task.activityType] || ACTIVITY_TYPE_META.discussion
                            : null,
                    course,
                    title,
                    description,
                    dateLabel: formatTaskDate(task, t, i18n.language),
                    canSubmit:
                        task.kind === 'activity'
                            ? task.activityStatus === 'active'
                            : Boolean(ids.sessionId && ids.homeworkId),
                    isDone: status === 'completed' || status === 'submitted',
                };
            }),
        [i18n.language, tasks, t]
    );

    const courseOptions = useMemo(
        () => [...new Set(taskView.map((item) => item.course))].sort((a, b) => a.localeCompare(b)),
        [taskView]
    );

    const stats = useMemo(() => {
        const total = taskView.length;
        const pending = taskView.filter((item) => item.status === 'pending').length;
        const overdue = taskView.filter((item) => item.status === 'overdue').length;
        const submitted = taskView.filter((item) => item.status === 'submitted').length;
        const needsRevision = taskView.filter((item) => item.status === 'needs_revision').length;
        const approved = taskView.filter((item) => item.status === 'completed').length;

        return { total, pending, overdue, submitted, needsRevision, approved };
    }, [taskView]);

    const filteredTasks = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const attentionStatuses = new Set(['pending', 'overdue', 'needs_revision', 'rejected']);

        return taskView.filter((item) => {
            if (statusFilter === 'attention' && !attentionStatuses.has(item.status)) return false;
            if (!['all', 'attention'].includes(statusFilter) && item.status !== statusFilter) return false;
            if (courseFilter !== 'all' && item.course !== courseFilter) return false;
            if (!normalizedQuery) return true;

            return [item.title, item.description, item.course].some((value) =>
                String(value).toLowerCase().includes(normalizedQuery)
            );
        });
    }, [courseFilter, query, statusFilter, taskView]);

    const updateDraft = (taskKey, field, value) => {
        setDrafts((prev) => ({
            ...prev,
            [taskKey]: {
                ...(prev[taskKey] || {}),
                [field]: value,
            },
        }));
    };

    const clearAttachmentDraft = (taskKey) => {
        setDrafts((prev) => ({
            ...prev,
            [taskKey]: {
                ...(prev[taskKey] || {}),
                file: null,
                link: '',
                removeAttachment: true,
                fileError: '',
            },
        }));
    };

    const handleFileChange = (taskKey, task, file) => {
        const nextFile = file || null;
        const validation = validateSubmissionFile(nextFile, task, t);

        if (!validation.valid) {
            updateDraft(taskKey, 'file', null);
            updateDraft(taskKey, 'fileError', validation.message);
            return;
        }

        updateDraft(taskKey, 'file', nextFile);
        updateDraft(taskKey, 'removeAttachment', false);
        updateDraft(taskKey, 'fileError', '');
    };

    const submitTask = async (item) => {
        if (!onSubmitHomework) return;
        const draft = drafts[item.key] || { text: '', link: '', file: null };
        const success = await onSubmitHomework(item.task, draft);
        if (success) {
            setDrafts((prev) => ({
                ...prev,
                [item.key]: { text: '', link: '', file: null, fileError: '', quizAnswers: {} },
            }));
            setExpandedTaskId('');
        }
    };

    return (
        <div className="space-y-6">
            <DashboardWorkspaceHero
                className="dashboard-panel"
                eyebrow={t('studentDashboard.tasks.eyebrow')}
                title={t('studentDashboard.tasks.title')}
                description={t('studentDashboard.tasks.description')}
                metrics={(
                    <>
                            <DashboardMetricCard label={t('studentDashboard.tasks.metrics.total')} value={stats.total} icon={FiBookOpen} />
                            <DashboardMetricCard
                                label={t('studentDashboard.tasks.metrics.pending')}
                                value={stats.pending}
                                tone="amber"
                                icon={FiClock}
                            />
                            <DashboardMetricCard
                                label={t('studentDashboard.tasks.metrics.overdue')}
                                value={stats.overdue}
                                tone="red"
                                icon={FiAlertCircle}
                            />
                            <DashboardMetricCard
                                label={t('studentDashboard.tasks.metrics.needsRevision')}
                                value={stats.needsRevision}
                                tone="amber"
                                icon={FiEdit3}
                            />
                            <DashboardMetricCard
                                label={t('studentDashboard.tasks.metrics.submitted')}
                                value={stats.submitted}
                                tone="blue"
                                icon={FiSend}
                            />
                            <DashboardMetricCard
                                label={t('studentDashboard.tasks.metrics.approved')}
                                value={stats.approved}
                                tone="green"
                                icon={FiCheckCircle}
                            />
                    </>
                )}
            >
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1.5fr),minmax(0,0.7fr),minmax(0,0.7fr)]">
                    <label className="relative block">
                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('studentDashboard.tasks.searchPlaceholder')}
                            className="dashboard-field dashboard-field-icon"
                        />
                    </label>

                    <label className="relative block">
                        <FiFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="dashboard-field dashboard-field-icon dashboard-select"
                        >
                            <option value="attention">{t('studentDashboard.tasks.filters.attention')}</option>
                            <option value="all">{t('studentDashboard.tasks.filters.allStatuses')}</option>
                            <option value="pending">{t('studentDashboard.tasks.statuses.pending')}</option>
                            <option value="submitted">{t('studentDashboard.tasks.filters.submitted')}</option>
                            <option value="needs_revision">{t('studentDashboard.tasks.statuses.needsRevision')}</option>
                            <option value="completed">{t('studentDashboard.tasks.filters.closed')}</option>
                            <option value="rejected">{t('studentDashboard.tasks.statuses.rejected')}</option>
                            <option value="overdue">{t('studentDashboard.tasks.statuses.overdue')}</option>
                            <option value="unavailable">{t('studentDashboard.tasks.statuses.unavailable')}</option>
                        </select>
                    </label>

                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="dashboard-field dashboard-select"
                    >
                        <option value="all">{t('studentDashboard.tasks.filters.allCourses')}</option>
                        {courseOptions.map((course) => (
                            <option key={course} value={course}>
                                {course}
                            </option>
                        ))}
                    </select>
                </DashboardFilterBar>

                <div className="space-y-4 pt-5">
                    {filteredTasks.length ? (
                        filteredTasks.map((item) => {
                            const draft = drafts[item.key] || {
                                text: '',
                                link: '',
                                file: null,
                                quizAnswers: {},
                            };
                            const hasTextDraft = Boolean((draft.text || '').trim());
                            const hasLinkDraft = Boolean((draft.link || '').trim());
                            const hasQuizDraft = Object.values(draft.quizAnswers || {}).some((value) =>
                                Array.isArray(value) ? value.length > 0 : Boolean(value)
                            );
                            const hasInteractiveDraft = draft.interactiveAnswers != null;
                            const hasDraftWork = hasTextDraft || hasLinkDraft || Boolean(draft.file) || hasQuizDraft || hasInteractiveDraft;
                            const isSubmitting = submittingTaskState?.key === item.key;
                            const isUploading = isSubmitting && submittingTaskState?.phase === 'uploading';
                            const isExpanded = expandedTaskId === item.key;
                            const StatusIcon = item.meta.icon;
                            const reviewComment = item.task.mySubmission?.reviewComment || '';
                            const reviewScore =
                                item.task.mySubmission?.score ?? item.task.myAttempt?.score ?? null;
                            const reviewedAt = item.task.mySubmission?.reviewedAt;
                            const submittedAt =
                                item.task.mySubmission?.updatedAt ||
                                item.task.mySubmission?.createdAt ||
                                item.task.myAttempt?.createdAt;
                            const submissionAttachment = item.task.mySubmission?.attachmentUrl || '';
                            const submissionText = item.task.mySubmission?.answerText || '';
                            const historyThread = Array.isArray(item.task.mySubmission?.historyMessages)
                                ? item.task.mySubmission.historyMessages
                                : [];
                            const ActivityIcon = item.activityMeta?.icon || FiBookOpen;
                            const isQuizTask = item.task.kind === 'activity' && item.task.taskType === 'quiz';
                            const hasQuizAttempt = Boolean(item.task.myAttempt);
                            const canResubmit =
                                item.task.kind === 'activity'
                                    ? item.task.taskType === 'quiz'
                                        ? item.task.activityStatus === 'active' && !item.task.myAttempt?.passed
                                        : item.task.activityStatus === 'active'
                                    : item.status === 'needs_revision' || item.status === 'rejected';

                            return (
                                <article
                                    key={item.key}
                                    className={`rounded-[1.5rem] border bg-white p-5 shadow-sm transition duration-300 dark:bg-slate-900 ${item.meta.accentClass}`}
                                >
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1 space-y-4">
                                            <div className="flex flex-wrap items-start gap-3">
                                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-edubot-dark dark:text-edubot-soft ${
                                                    item.task.kind === 'activity'
                                                        ? item.activityMeta?.panelClass
                                                        : 'bg-edubot-surfaceAlt dark:bg-slate-800'
                                                }`}>
                                                    <ActivityIcon className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                            {item.title}
                                                        </h3>
                                                        <StatusBadge tone={item.meta.tone || 'default'} className="gap-1">
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {t(item.meta.labelKey)}
                                                        </StatusBadge>
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-300">
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiBookOpen className="h-4 w-4" />
                                                            {item.course}
                                                        </span>
                                                        {item.task.kind === 'activity' ? (
                                                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                                                                item.activityMeta?.badgeClass
                                                            }`}>
                                                                <ActivityIcon className="h-3.5 w-3.5" />
                                                                {t(
                                                                    ACTIVITY_TYPE_LABEL_KEY[item.task.activityType] ||
                                                                        'studentDashboard.tasks.activityTypes.work'
                                                                )}
                                                            </span>
                                                        ) : null}
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiCalendar className="h-4 w-4" />
                                                            {item.dateLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm leading-6 text-edubot-muted dark:text-slate-300">
                                                {item.description}
                                            </p>

                                            {reviewComment || reviewScore !== null || reviewedAt ? (
                                                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/70">
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                        <span className="font-semibold text-edubot-ink dark:text-white">
                                                            {t('studentDashboard.tasks.review.currentResult')}
                                                        </span>
                                                        {reviewScore !== null && reviewScore !== undefined ? (
                                                            <span className="font-semibold text-edubot-ink dark:text-white">
                                                                {item.task.maxScore != null
                                                                    ? t('studentDashboard.tasks.review.scoreWithMax', { score: reviewScore, max: item.task.maxScore })
                                                                    : t('studentDashboard.tasks.review.score', { score: reviewScore })}
                                                            </span>
                                                        ) : null}
                                                        {reviewedAt ? (
                                                            <span className="text-edubot-muted dark:text-slate-400">
                                                                {t('studentDashboard.tasks.review.reviewedAt', {
                                                                    date: formatTaskDate({ submittedAt: reviewedAt }, t, i18n.language),
                                                                })}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    {reviewComment ? (
                                                        <p className="mt-2 leading-6 text-edubot-ink dark:text-slate-200">
                                                            {reviewComment}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            ) : null}

                                            {item.task.mySubmission ? (
                                                <div className="rounded-2xl border border-edubot-line/70 bg-white/80 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/70">
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                        <span className="font-semibold text-edubot-ink dark:text-white">
                                                            {t('studentDashboard.tasks.submission.latest')}
                                                        </span>
                                                        {submittedAt ? (
                                                            <span className="text-edubot-muted dark:text-slate-400">
                                                                {formatTaskDate({ submittedAt }, t, i18n.language)}
                                                            </span>
                                                        ) : null}
                                                        <span className="text-edubot-muted dark:text-slate-400">
                                                            {formatSubmissionType(item.task.mySubmission, t)}
                                                        </span>
                                                    </div>

                                                    {submissionText ? (
                                                        <p className="mt-2 line-clamp-3 leading-6 text-edubot-muted dark:text-slate-300">
                                                            {submissionText}
                                                        </p>
                                                    ) : null}

                                                    {submissionAttachment ? (
                                                        <div className="mt-3">
                                                            <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    openAttachmentPreview(
                                                                        item.task.kind === 'activity' ? 'activity' : 'homework',
                                                                        Number(item.task.id || item.task.homeworkId),
                                                                        t('studentDashboard.tasks.preview.attachmentTitle', {
                                                                            title: item.title,
                                                                        })
                                                                    );
                                                                }}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 font-medium text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200"
                                                            >
                                                                <FiPaperclip className="h-4 w-4" />
                                                                {t('studentDashboard.tasks.actions.openAttachment')}
                                                            </a>
                                                            {canResubmit ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => clearAttachmentDraft(item.key)}
                                                                    className="ml-3 inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 text-sm font-medium text-edubot-muted transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300"
                                                                >
                                                                    {t('studentDashboard.tasks.actions.removeAttachment')}
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    ) : null}

                                                    {historyThread.length ? (
                                                        <div className="mt-4 space-y-3 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                                {t('studentDashboard.tasks.thread.previousExchanges')}
                                                            </div>
                                                            {historyThread.map((message) => {
                                                                const isInstructor = message.authorRole !== 'student';
                                                                return (
                                                                    <div
                                                                        key={`task-thread-${item.key}-${message.id}`}
                                                                        className={`rounded-2xl border px-4 py-3 ${
                                                                            isInstructor
                                                                                ? 'border-amber-200/80 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10'
                                                                                : 'border-edubot-line/70 bg-edubot-surfaceAlt/60 dark:border-slate-700 dark:bg-slate-800/70'
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                                                                            <span className="font-semibold text-edubot-ink dark:text-white">
                                                                                {formatSubmissionThreadLabel(message, t)}
                                                                            </span>
                                                                            {message.createdAt ? (
                                                                                <span className="text-edubot-muted dark:text-slate-400">
                                                                                    {formatTaskDate({ submittedAt: message.createdAt }, t, i18n.language)}
                                                                                </span>
                                                                            ) : null}
                                                                            {message.status && message.authorRole !== 'student' ? (
                                                                                <span className="text-edubot-muted dark:text-slate-400">
                                                                                    {ACTIVITY_REVIEW_STATUS_LABEL[message.status]
                                                                                        ? t(ACTIVITY_REVIEW_STATUS_LABEL[message.status])
                                                                                        : message.status}
                                                                                </span>
                                                                            ) : null}
                                                                            {message.score !== null && message.score !== undefined ? (
                                                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                                                    {item.task.maxScore != null
                                                                                        ? t('studentDashboard.tasks.review.scoreWithMax', { score: message.score, max: item.task.maxScore })
                                                                                        : t('studentDashboard.tasks.review.score', { score: message.score })}
                                                                                </span>
                                                                            ) : null}
                                                                        </div>
                                                                        {message.body ? (
                                                                            <p className="mt-2 leading-6 text-edubot-ink dark:text-slate-200">
                                                                                {message.body}
                                                                            </p>
                                                                        ) : null}
                                                                        {message.attachmentUrl ? (
                                                                            <div className="mt-3">
                                                                                <a
                                                                                    href={message.attachmentUrl}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 font-medium text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200"
                                                                                >
                                                                                    <FiPaperclip className="h-4 w-4" />
                                                                                    {t('studentDashboard.tasks.actions.openAttachment')}
                                                                                </a>
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : item.task.myAttempt ? (
                                                <div className={`rounded-2xl border p-4 text-sm ${
                                                    item.task.myAttempt.passed
                                                        ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                                                        : 'border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10'
                                                }`}>
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <div className="font-semibold text-edubot-ink dark:text-white">
                                                                {item.task.myAttempt.passed
                                                                    ? t('studentDashboard.tasks.quiz.passedTitle')
                                                                    : t('studentDashboard.tasks.quiz.completedTitle')}
                                                            </div>
                                                            <div className="mt-1 text-sm text-edubot-muted dark:text-slate-300">
                                                                {item.task.myAttempt.passed
                                                                    ? t('studentDashboard.tasks.quiz.passedDescription')
                                                                    : item.task.activityStatus === 'active'
                                                                        ? t('studentDashboard.tasks.quiz.retryDescription')
                                                                        : t('studentDashboard.tasks.quiz.closedDescription')}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-right shadow-sm dark:border-slate-700 dark:bg-slate-950/50">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                                {t('studentDashboard.tasks.quiz.result')}
                                                            </div>
                                                            <div className="mt-1 text-2xl font-semibold text-edubot-ink dark:text-white">
                                                                {Math.round(Number(item.task.myAttempt.score) || 0)}%
                                                            </div>
                                                            <div className={`mt-1 text-xs font-semibold ${
                                                                item.task.myAttempt.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                                                            }`}>
                                                                {item.task.myAttempt.passed
                                                                    ? t('studentDashboard.tasks.quiz.passed')
                                                                    : t('studentDashboard.tasks.quiz.failed')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {submittedAt ? (
                                                        <div className="mt-3 text-xs text-edubot-muted dark:text-slate-400">
                                                            {t('studentDashboard.tasks.submission.submittedAt', {
                                                                date: formatTaskDate({ submittedAt }, t, i18n.language),
                                                            })}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="w-full xl:w-[22rem]">
                                            {item.canSubmit ? (
                                                <div className="dashboard-panel-muted p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                                {isQuizTask
                                                                    ? hasQuizAttempt
                                                                        ? t('studentDashboard.tasks.submitPanel.retakeQuizTitle')
                                                                        : t('studentDashboard.tasks.submitPanel.startQuizTitle')
                                                                    : canResubmit
                                                                        ? t('studentDashboard.tasks.submitPanel.resubmitTitle')
                                                                        : item.status === 'submitted'
                                                                            ? t('studentDashboard.tasks.submitPanel.updateTitle')
                                                                            : t('studentDashboard.tasks.submitPanel.submitTitle')}
                                                            </p>
                                                            <p className="mt-1 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                                                {isQuizTask
                                                                    ? hasQuizAttempt
                                                                        ? t('studentDashboard.tasks.submitPanel.retakeQuizDescription')
                                                                        : t('studentDashboard.tasks.submitPanel.startQuizDescription')
                                                                    : canResubmit
                                                                        ? t('studentDashboard.tasks.submitPanel.resubmitDescription')
                                                                        : item.status === 'submitted'
                                                                            ? t('studentDashboard.tasks.submitPanel.updateDescription')
                                                                            : t('studentDashboard.tasks.submitPanel.submitDescription')}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedTaskId((prev) =>
                                                                    prev === item.key ? '' : item.key
                                                                )
                                                            }
                                                            className="rounded-xl border border-edubot-line px-3 py-2 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200"
                                                        >
                                                            {isExpanded
                                                                ? t('studentDashboard.tasks.actions.collapse')
                                                                : isQuizTask
                                                                    ? hasQuizAttempt
                                                                        ? t('studentDashboard.tasks.actions.reopen')
                                                                        : t('studentDashboard.tasks.actions.start')
                                                                    : t('studentDashboard.tasks.actions.answer')}
                                                        </button>
                                                    </div>

                                                    {isExpanded ? (
                                                        <div className="mt-4 space-y-3">
                                                            {item.task.kind === 'activity' && INTERACTIVE_ACTIVITY_TYPES.has(item.task.activityType) ? (
                                                                <ActivityInteractiveForm
                                                                    task={item.task}
                                                                    answers={draft.interactiveAnswers ?? null}
                                                                    onChange={(next) => updateDraft(item.key, 'interactiveAnswers', next)}
                                                                />
                                                            ) : item.task.kind === 'activity' && item.task.taskType === 'quiz' ? (
                                                                <div className="space-y-4">
                                                                    {(item.task.questions || []).map((question, questionIndex) => {
                                                                        const isMultiple = question.questionMode === 'multiple_choice';
                                                                        const currentValue = draft.quizAnswers?.[question.id] || (isMultiple ? [] : '');
                                                                        return (
                                                                            <div key={question.id || questionIndex} className="rounded-2xl border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                                                                                <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                                                    {questionIndex + 1}. {question.prompt}
                                                                                </div>
                                                                                <div className="mt-3 space-y-2">
                                                                                    {(question.options || []).map((option, optionIndex) => {
                                                                                        const checked = isMultiple
                                                                                            ? Array.isArray(currentValue) && currentValue.includes(option.id)
                                                                                            : String(currentValue) === String(option.id);
                                                                                        return (
                                                                                            <label key={option.id || optionIndex} className="flex items-center gap-3 rounded-xl border border-edubot-line/70 px-3 py-2 text-sm text-edubot-ink dark:border-slate-700 dark:text-slate-200">
                                                                                                <input
                                                                                                    type={isMultiple ? 'checkbox' : 'radio'}
                                                                                                    name={`activity-${item.key}-${question.id}`}
                                                                                                    checked={checked}
                                                                                                    onChange={(e) => {
                                                                                                        const nextValue = isMultiple
                                                                                                            ? e.target.checked
                                                                                                                ? [...(Array.isArray(currentValue) ? currentValue : []), option.id]
                                                                                                                : (Array.isArray(currentValue) ? currentValue : []).filter((value) => String(value) !== String(option.id))
                                                                                                            : option.id;
                                                                                                        setDrafts((prev) => ({
                                                                                                            ...prev,
                                                                                                            [item.key]: {
                                                                                                                ...(prev[item.key] || {}),
                                                                                                                quizAnswers: {
                                                                                                                    ...((prev[item.key] || {}).quizAnswers || {}),
                                                                                                                    [question.id]: nextValue,
                                                                                                                },
                                                                                                            },
                                                                                                        }));
                                                                                                    }}
                                                                                                />
                                                                                                <span>{option.text}</span>
                                                                                            </label>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <textarea
                                                                        value={draft.text || ''}
                                                                        onChange={(e) =>
                                                                            updateDraft(item.key, 'text', e.target.value)
                                                                        }
                                                                        rows={4}
                                                                        placeholder={t('studentDashboard.tasks.fields.answerPlaceholder')}
                                                                        className="dashboard-field"
                                                                    />
                                                                    <label className="relative block">
                                                                        <FiLink className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                                                                        <input
                                                                            value={draft.link || ''}
                                                                            onChange={(e) =>
                                                                                updateDraft(item.key, 'link', e.target.value)
                                                                            }
                                                                            placeholder={t('studentDashboard.tasks.fields.linkPlaceholder')}
                                                                            className="dashboard-field dashboard-field-icon"
                                                                        />
                                                                    </label>
                                                                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-edubot-line px-4 py-3 text-sm text-edubot-muted transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-300">
                                                                        <span className="inline-flex items-center gap-2">
                                                                            <FiPaperclip className="h-4 w-4" />
                                                                            {draft.file?.name || t('studentDashboard.tasks.fields.filePlaceholder')}
                                                                        </span>
                                                                        <span className="text-xs font-semibold">
                                                                            {draft.file
                                                                                ? t('studentDashboard.tasks.actions.replaceFile')
                                                                                : t('studentDashboard.tasks.actions.chooseFile')}
                                                                        </span>
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            accept=".pdf,.doc,.docx"
                                                                            disabled={isSubmitting}
                                                                            onChange={(e) =>
                                                                                handleFileChange(
                                                                                    item.key,
                                                                                    item.task,
                                                                                    e.target.files?.[0] || null
                                                                                )
                                                                            }
                                                                        />
                                                                    </label>
                                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                                        {draft.file
                                                                            ? formatBytes(draft.file.size)
                                                                            : t('studentDashboard.tasks.fields.fileTypeHint')}
                                                                    </div>
                                                                    {draft.fileError ? (
                                                                        <div className="text-xs text-red-600 dark:text-red-300">
                                                                            {draft.fileError}
                                                                        </div>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                            <div
                                                                className={`rounded-2xl border px-3 py-2 text-xs ${
                                                                    isSubmitting
                                                                        ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200'
                                                                        : hasDraftWork
                                                                            ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'
                                                                            : 'border-edubot-line/70 bg-white/70 text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400'
                                                                }`}
                                                                role={isSubmitting ? 'status' : undefined}
                                                            >
                                                                {isSubmitting
                                                                    ? isUploading
                                                                        ? t('studentDashboard.tasks.draftStatus.uploading')
                                                                        : t('studentDashboard.tasks.draftStatus.submitting')
                                                                    : hasDraftWork
                                                                        ? t('studentDashboard.tasks.draftStatus.unsaved')
                                                                        : t('studentDashboard.tasks.draftStatus.empty')}
                                                            </div>
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                                    <p>
                                                                        {isQuizTask
                                                                            ? hasQuizAttempt
                                                                                ? t('studentDashboard.tasks.help.retakeQuiz')
                                                                                : t('studentDashboard.tasks.help.startQuiz')
                                                                            : t('studentDashboard.tasks.help.answerRequired')}
                                                                    </p>
                                                                    {isUploading ? (
                                                                        <p className="mt-1 text-edubot-orange dark:text-edubot-soft">
                                                                            {t('studentDashboard.tasks.actions.uploadingFile')}
                                                                        </p>
                                                                    ) : null}
                                                                    {isSubmitting && !isUploading ? (
                                                                        <p className="mt-1 text-edubot-orange dark:text-edubot-soft">
                                                                            {t('studentDashboard.tasks.actions.submittingTask')}
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => submitTask(item)}
                                                                    disabled={isSubmitting}
                                                                    className="dashboard-button-primary min-h-[44px]"
                                                                >
                                                                    <FiSend className="h-4 w-4" />
                                                                    {isUploading
                                                                        ? t('studentDashboard.tasks.actions.uploadingFile')
                                                                        : isSubmitting
                                                                            ? t('studentDashboard.tasks.actions.submitting')
                                                                            : isQuizTask
                                                                                ? hasQuizAttempt
                                                                                    ? t('studentDashboard.tasks.actions.retake')
                                                                                    : t('studentDashboard.tasks.actions.startQuiz')
                                                                                : t('studentDashboard.tasks.actions.submit')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-4 flex items-center gap-2 text-xs text-edubot-muted dark:text-slate-400">
                                                            <FiExternalLink className="h-4 w-4" />
                                                                {isQuizTask
                                                                    ? hasQuizAttempt
                                                                        ? t('studentDashboard.tasks.closedHints.retakeQuiz')
                                                                        : t('studentDashboard.tasks.closedHints.startQuiz')
                                                                    : canResubmit
                                                                ? t('studentDashboard.tasks.closedHints.resubmit')
                                                                : t('studentDashboard.tasks.closedHints.submit')}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="dashboard-panel-muted p-4">
                                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {t('studentDashboard.tasks.unavailable.title')}
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                                        {t('studentDashboard.tasks.unavailable.description')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="dashboard-panel-muted p-10 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                <FiSearch className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                {t('studentDashboard.tasks.empty.noResultTitle')}
                            </h3>
                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                {t('studentDashboard.tasks.empty.noResultDescription')}
                            </p>
                        </div>
                    )}
                </div>
            </DashboardWorkspaceHero>

            <BasicModal
                isOpen={previewState.open}
                onClose={closePreview}
                title={previewState.title || t('studentDashboard.tasks.preview.attachment')}
                size="2xl"
            >
                {previewState.loading ? (
                    <div className="flex min-h-[16rem] items-center justify-center text-sm text-edubot-muted dark:text-slate-400">
                        {t('common.loading')}...
                    </div>
                ) : !previewState.objectUrl ? (
                    <div className="flex min-h-[16rem] items-center justify-center text-sm text-edubot-muted dark:text-slate-400">
                        {t('studentDashboard.tasks.preview.unavailable')}
                    </div>
                ) : previewState.kind === 'image' ? (
                    <div className="flex justify-center">
                        <img
                            src={previewState.objectUrl}
                            alt={previewState.title}
                            className="max-h-[70vh] rounded-2xl object-contain"
                        />
                    </div>
                ) : previewState.kind === 'pdf' ? (
                    <iframe
                        src={previewState.objectUrl}
                        title={previewState.title}
                        className="h-[70vh] w-full rounded-2xl border border-edubot-line dark:border-slate-700"
                    />
                ) : previewState.kind === 'audio' ? (
                    <div className="flex min-h-[12rem] items-center justify-center">
                        <audio controls src={previewState.objectUrl} className="w-full max-w-xl" />
                    </div>
                ) : previewState.kind === 'text' ? (
                    <iframe
                        src={previewState.objectUrl}
                        title={previewState.title}
                        className="h-[60vh] w-full rounded-2xl border border-edubot-line dark:border-slate-700"
                    />
                ) : (
                    <div className="space-y-4 text-center">
                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.tasks.preview.directViewUnavailable')}
                        </p>
                        <a
                            href={previewState.objectUrl}
                            download
                            className="dashboard-button-primary inline-flex"
                        >
                            <FiPaperclip className="h-4 w-4" />
                            {t('studentDashboard.tasks.actions.download')}
                        </a>
                    </div>
                )}
            </BasicModal>
        </div>
    );
};

TasksTab.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSubmitHomework: PropTypes.func,
    submittingTaskState: PropTypes.shape({
        key: PropTypes.string,
        phase: PropTypes.oneOf(['uploading', 'submitting']),
    }),
};

TasksTab.defaultProps = {
    onSubmitHomework: undefined,
    submittingTaskState: null,
};

export default TasksTab;

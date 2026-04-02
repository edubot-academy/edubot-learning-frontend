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
import { getTaskKey, resolveSessionHomeworkIds } from '../../utils/studentDashboard.helpers.js';
import {
    fetchStudentActivitySubmissionAttachmentPreview,
    fetchStudentHomeworkSubmissionAttachmentPreview,
} from '../../../student/api.js';

const MAX_HOMEWORK_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_HOMEWORK_FILE_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
const ALLOWED_ACTIVITY_FILE_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

const STATUS_META = {
    overdue: {
        label: 'Мөөнөт өттү',
        badgeClass:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        accentClass: 'border-red-300/90 dark:border-red-500/40',
        icon: FiAlertCircle,
    },
    pending: {
        label: 'Күтүүдө',
        badgeClass:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        accentClass: 'border-amber-200/90 dark:border-amber-500/30',
        icon: FiClock,
    },
    submitted: {
        label: 'Жөнөтүлдү',
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        accentClass: 'border-sky-200/90 dark:border-sky-500/30',
        icon: FiSend,
    },
    needs_revision: {
        label: 'Оңдотуу керек',
        badgeClass:
            'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
        accentClass: 'border-orange-200/90 dark:border-orange-500/30',
        icon: FiEdit3,
    },
    rejected: {
        label: 'Кайтарылды',
        badgeClass:
            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
        accentClass: 'border-rose-200/90 dark:border-rose-500/30',
        icon: FiAlertCircle,
    },
    completed: {
        label: 'Бекитилди',
        badgeClass:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        accentClass: 'border-emerald-200/90 dark:border-emerald-500/30',
        icon: FiCheckCircle,
    },
    unavailable: {
        label: 'Туташкан эмес',
        badgeClass:
            'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
        accentClass: 'border-slate-200/90 dark:border-slate-700',
        icon: FiFileText,
    },
};

const ACTIVITY_TYPE_LABEL = {
    discussion: 'Талкуу',
    exercise: 'Көнүгүү',
    quiz: 'Квиз',
    group_work: 'Топтук иш',
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
};

const ACTIVITY_REVIEW_STATUS_LABEL = {
    submitted: 'Текшерилип жатат',
    approved: 'Бекитилди',
    needs_revision: 'Оңдотуу керек',
    rejected: 'Кайтарылды',
};

const formatTaskDate = (task = {}) => {
    const raw = task.dueAt || task.deadline || task.due || task.submittedAt;
    if (!raw) return 'Мөөнөт көрсөтүлгөн эмес';

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return String(raw);

    return parsed.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatSubmissionType = (submission = {}) => {
    if (submission.attachmentUrl) return 'Файл же шилтеме тиркелген';
    if (submission.answerText) return 'Текст жооп';
    return 'Жооп берилген';
};

const formatSubmissionThreadLabel = (message = {}) => {
    if (message.authorRole === 'student') return 'Сиз';
    if (message.kind === 'review') return 'Мугалим';
    return 'Жооп';
};

const getTaskCourse = (task = {}) => task.courseTitle || task.course || 'Белгисиз курс';

const getTaskTitle = (task = {}) => task.title || task.name || 'Тапшырма';

const getTaskDescription = (task = {}) =>
    task.description ||
    task.instructions ||
    task.prompt ||
    task.text ||
    'Тапшырма сүрөттөмөсү азырынча берилген эмес.';

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

const validateSubmissionFile = (file, task = {}) => {
    if (!(file instanceof File)) return { valid: true };

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isActivityAttachment = task?.kind === 'activity';
    const allowedExtensions = isActivityAttachment ? ALLOWED_ACTIVITY_FILE_EXTENSIONS : ALLOWED_HOMEWORK_FILE_EXTENSIONS;
    if (!allowedExtensions.has(extension)) {
        return {
            valid: false,
            message: isActivityAttachment
                ? 'Активдүүлүк үчүн PDF же Word файлын тандаңыз.'
                : 'Тапшырма үчүн PDF же Word файлын тандаңыз.',
        };
    }

    if (file.size > MAX_HOMEWORK_FILE_SIZE_BYTES) {
        return {
            valid: false,
            message: `Файл өтө чоң. Максималдуу көлөм ${formatBytes(MAX_HOMEWORK_FILE_SIZE_BYTES)}.`,
        };
    }

    return { valid: true };
};

const getNormalizedStatus = (task = {}) => {
    if (task.kind === 'activity') {
        if (task.activityStatus === 'done' && !task.mySubmission && !task.myAttempt) return 'unavailable';
        return String(task.status || '').toLowerCase() || 'pending';
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
                toast.error('Тиркемени ачуу мүмкүн болбоду');
                closePreview();
            }
        },
        [closePreview]
    );

    const taskView = useMemo(
        () =>
            tasks.map((task) => {
                const key = getTaskKey(task);
                const status = getNormalizedStatus(task);
                const meta = STATUS_META[status];
                const course = getTaskCourse(task);
                const title = getTaskTitle(task);
                const description = getTaskDescription(task);
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
                    dateLabel: formatTaskDate(task),
                    canSubmit:
                        task.kind === 'activity'
                            ? task.activityStatus === 'active'
                            : Boolean(ids.sessionId && ids.homeworkId),
                    isDone: status === 'completed' || status === 'submitted',
                };
            }),
        [tasks]
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

        return taskView.filter((item) => {
            if (statusFilter !== 'all' && item.status !== statusFilter) return false;
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
        const validation = validateSubmissionFile(nextFile, task);

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
                eyebrow="Student Tasks"
                title="Тапшырмалар иш мейкиндиги"
                description="Тапшырмалардын абалын көрүңүз, мөөнөттөрдү байкаңыз жана жоопторду ушул эле жерден жөнөтүңүз."
                metrics={(
                    <>
                            <DashboardMetricCard label="Жалпы" value={stats.total} icon={FiBookOpen} />
                            <DashboardMetricCard
                                label="Күтүүдө"
                                value={stats.pending}
                                tone="amber"
                                icon={FiClock}
                            />
                            <DashboardMetricCard
                                label="Мөөнөт өттү"
                                value={stats.overdue}
                                tone="red"
                                icon={FiAlertCircle}
                            />
                            <DashboardMetricCard
                                label="Оңдотуу керек"
                                value={stats.needsRevision}
                                tone="amber"
                                icon={FiEdit3}
                            />
                            <DashboardMetricCard
                                label="Текшерилип жатат"
                                value={stats.submitted}
                                tone="blue"
                                icon={FiSend}
                            />
                            <DashboardMetricCard
                                label="Бекитилди"
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
                            placeholder="Тапшырма же курс боюнча издөө"
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
                            <option value="all">Бардык статустар</option>
                            <option value="pending">Күтүүдө</option>
                            <option value="submitted">Жөнөтүлгөн</option>
                            <option value="needs_revision">Оңдотуу керек</option>
                            <option value="completed">Жабылган</option>
                            <option value="rejected">Кайтарылды</option>
                            <option value="overdue">Мөөнөт өттү</option>
                            <option value="unavailable">Туташкан эмес</option>
                        </select>
                    </label>

                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="dashboard-field dashboard-select"
                    >
                        <option value="all">Бардык курстар</option>
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
                            const submissionThread = Array.isArray(item.task.mySubmission?.messages)
                                ? item.task.mySubmission.messages
                                : [];
                            const latestStudentThreadMessage = item.task.mySubmission?.latestSubmissionMessage || null;
                            const latestReviewThreadMessage = item.task.mySubmission?.latestReviewMessage || null;
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
                                                            {item.meta.label}
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
                                                                {ACTIVITY_TYPE_LABEL[item.task.activityType] || 'Иш'}
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
                                                            Учурдагы жыйынтык
                                                        </span>
                                                        {reviewScore !== null && reviewScore !== undefined ? (
                                                            <span className="font-semibold text-edubot-ink dark:text-white">
                                                                Баа: {reviewScore}
                                                            </span>
                                                        ) : null}
                                                        {reviewedAt ? (
                                                            <span className="text-edubot-muted dark:text-slate-400">
                                                                Текшерилген: {formatTaskDate({ submittedAt: reviewedAt })}
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
                                                            Акыркы жооп
                                                        </span>
                                                        {submittedAt ? (
                                                            <span className="text-edubot-muted dark:text-slate-400">
                                                                {formatTaskDate({ submittedAt })}
                                                            </span>
                                                        ) : null}
                                                        <span className="text-edubot-muted dark:text-slate-400">
                                                            {formatSubmissionType(item.task.mySubmission)}
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
                                                                        `${item.title} — Тиркеме`
                                                                    );
                                                                }}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 font-medium text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200"
                                                            >
                                                                <FiPaperclip className="h-4 w-4" />
                                                                Тиркемени ачуу
                                                            </a>
                                                            {canResubmit ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => clearAttachmentDraft(item.key)}
                                                                    className="ml-3 inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 text-sm font-medium text-edubot-muted transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300"
                                                                >
                                                                    Тиркемени алып салуу
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    ) : null}

                                                    {historyThread.length ? (
                                                        <div className="mt-4 space-y-3 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                                Мурунку алмашуулар
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
                                                                                {formatSubmissionThreadLabel(message)}
                                                                            </span>
                                                                            {message.createdAt ? (
                                                                                <span className="text-edubot-muted dark:text-slate-400">
                                                                                    {formatTaskDate({ submittedAt: message.createdAt })}
                                                                                </span>
                                                                            ) : null}
                                                                            {message.status && message.authorRole !== 'student' ? (
                                                                                <span className="text-edubot-muted dark:text-slate-400">
                                                                                    {ACTIVITY_REVIEW_STATUS_LABEL[message.status] || message.status}
                                                                                </span>
                                                                            ) : null}
                                                                            {message.score !== null && message.score !== undefined ? (
                                                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                                                    Баа: {message.score}
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
                                                                                    Тиркемени ачуу
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
                                                                {item.task.myAttempt.passed ? 'Квиз ийгиликтүү тапшырылды' : 'Квиз аяктады'}
                                                            </div>
                                                            <div className="mt-1 text-sm text-edubot-muted dark:text-slate-300">
                                                                {item.task.myAttempt.passed
                                                                    ? 'Жыйынтык жакшы. Бул квиз жабылды.'
                                                                    : item.task.activityStatus === 'active'
                                                                        ? 'Жыйынтык жетишсиз. Кайра аракет кылсаңыз болот.'
                                                                        : 'Квиз жабылды. Жыйынтык ушул бойдон сакталды.'}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-right shadow-sm dark:border-slate-700 dark:bg-slate-950/50">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                                Натыйжа
                                                            </div>
                                                            <div className="mt-1 text-2xl font-semibold text-edubot-ink dark:text-white">
                                                                {Math.round(Number(item.task.myAttempt.score) || 0)}%
                                                            </div>
                                                            <div className={`mt-1 text-xs font-semibold ${
                                                                item.task.myAttempt.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                                                            }`}>
                                                                {item.task.myAttempt.passed ? 'Өттү' : 'Өткөн жок'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {submittedAt ? (
                                                        <div className="mt-3 text-xs text-edubot-muted dark:text-slate-400">
                                                            Тапшырылган убакыт: {formatTaskDate({ submittedAt })}
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
                                                                        ? 'Квизди кайра тапшыруу'
                                                                        : 'Квизди баштоо'
                                                                    : canResubmit
                                                                        ? 'Жоопту кайра жөнөтүү'
                                                                        : item.status === 'submitted'
                                                                            ? 'Жаңыртуу керек болсо кайра жөнөтүңүз'
                                                                            : 'Жооп жөнөтүү'}
                                                            </p>
                                                            <p className="mt-1 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                                                {isQuizTask
                                                                    ? hasQuizAttempt
                                                                        ? 'Мурунку жыйынтык жаңыланып, акыркы аракет сакталат.'
                                                                        : 'Суроолорго жооп берип, квизди ошол замат жөнөтүңүз.'
                                                                    : canResubmit
                                                                        ? 'Мугалимдин пикирин эске алып, жаңыртылган жоопту жибериңиз.'
                                                                        : item.status === 'submitted'
                                                                            ? 'Тапшырма текшерилип жатат. Зарыл болсо жоопту жаңыртып кайра жибере аласыз.'
                                                                            : 'Текст, шилтеме же файл кошуп тапшырыңыз.'}
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
                                                            {isExpanded ? 'Жыйуу' : isQuizTask ? (hasQuizAttempt ? 'Кайра ачуу' : 'Баштоо') : 'Жооп берүү'}
                                                        </button>
                                                    </div>

                                                    {isExpanded ? (
                                                        <div className="mt-4 space-y-3">
                                                            {item.task.kind === 'activity' && item.task.taskType === 'quiz' ? (
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
                                                                        placeholder="Жооп жазыңыз"
                                                                        className="dashboard-field"
                                                                    />
                                                                    <label className="relative block">
                                                                        <FiLink className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                                                                        <input
                                                                            value={draft.link || ''}
                                                                            onChange={(e) =>
                                                                                updateDraft(item.key, 'link', e.target.value)
                                                                            }
                                                                            placeholder="Шилтеме кошуу"
                                                                            className="dashboard-field dashboard-field-icon"
                                                                        />
                                                                    </label>
                                                                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-edubot-line px-4 py-3 text-sm text-edubot-muted transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-300">
                                                                        <span className="inline-flex items-center gap-2">
                                                                            <FiPaperclip className="h-4 w-4" />
                                                                            {draft.file?.name ||
                                                                                item.task.kind === 'activity'
                                                                                    ? 'PDF же Word кошуу'
                                                                                    : 'PDF же Word кошуу'}
                                                                        </span>
                                                                        <span className="text-xs font-semibold">
                                                                            {draft.file ? 'Алмаштыруу' : 'Файл тандоо'}
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
                                                                    {draft.file ? (
                                                                        <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                                            {formatBytes(draft.file.size)}
                                                                        </div>
                                                                    ) : null}
                                                                    {draft.fileError ? (
                                                                        <div className="text-xs text-red-600 dark:text-red-300">
                                                                            {draft.fileError}
                                                                        </div>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                                    <p>
                                                                        {isQuizTask
                                                                            ? hasQuizAttempt
                                                                                ? 'Жоопторду жаңыртып, квизди кайра тапшырыңыз.'
                                                                                : 'Ар бир суроого жооп берип, квизди жөнөтүңүз.'
                                                                            : 'Жооп, шилтеме же файлдын кеминде бири талап кылынат.'}
                                                                    </p>
                                                                    {isUploading ? (
                                                                        <p className="mt-1 text-edubot-orange dark:text-edubot-soft">
                                                                            {item.task.kind === 'activity' ? 'Файл жүктөлүүдө...' : 'Файл жүктөлүүдө...'}
                                                                        </p>
                                                                    ) : null}
                                                                    {isSubmitting && !isUploading ? (
                                                                        <p className="mt-1 text-edubot-orange dark:text-edubot-soft">
                                                                            Тапшырма жөнөтүлүүдө...
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
                                                                        ? 'Файл жүктөлүүдө...'
                                                                        : isSubmitting
                                                                            ? 'Жөнөтүлүүдө...'
                                                                            : isQuizTask
                                                                                ? hasQuizAttempt
                                                                                    ? 'Кайра тапшыруу'
                                                                                    : 'Квизди баштоо'
                                                                                : 'Жөнөтүү'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-4 flex items-center gap-2 text-xs text-edubot-muted dark:text-slate-400">
                                                            <FiExternalLink className="h-4 w-4" />
                                                            {isQuizTask
                                                                ? hasQuizAttempt
                                                                    ? 'Басып, квизди кайра тапшырыңыз'
                                                                    : 'Басып, квизди баштаңыз'
                                                                : canResubmit
                                                                ? 'Басып, оңдолгон жоопту кайра жөнөтүңүз'
                                                                : 'Басып, тапшырманы тез тапшырыңыз'}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="dashboard-panel-muted p-4">
                                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                        Submit туташкан эмес
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                                        Бул тапшырма үчүн API аркылуу түз жөнөтүү азырынча
                                                        жеткиликтүү эмес.
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
                                Натыйжа табылган жок
                            </h3>
                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                Фильтрлерди өзгөртүп көрүңүз же издөө талаасын тазалаңыз.
                            </p>
                        </div>
                    )}
                </div>
            </DashboardWorkspaceHero>

            <BasicModal
                isOpen={previewState.open}
                onClose={closePreview}
                title={previewState.title || 'Тиркеме'}
                size="2xl"
            >
                {previewState.loading ? (
                    <div className="flex min-h-[16rem] items-center justify-center text-sm text-edubot-muted dark:text-slate-400">
                        Жүктөлүүдө...
                    </div>
                ) : !previewState.objectUrl ? (
                    <div className="flex min-h-[16rem] items-center justify-center text-sm text-edubot-muted dark:text-slate-400">
                        Алдын ала көрүү жеткиликтүү эмес.
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
                            Бул файлды браузерде түз көрүү жеткиликтүү эмес.
                        </p>
                        <a
                            href={previewState.objectUrl}
                            download
                            className="dashboard-button-primary inline-flex"
                        >
                            <FiPaperclip className="h-4 w-4" />
                            Жүктөп алуу
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

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    FiAlertCircle,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
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
import { fetchStudentHomeworkSubmissionAttachmentPreview } from '../../../student/api.js';

const MAX_HOMEWORK_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_HOMEWORK_FILE_EXTENSIONS = new Set([
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'zip',
    'json',
    'txt',
    'csv',
    'jpg',
    'jpeg',
    'png',
    'webp',
]);

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

const validateHomeworkFile = (file) => {
    if (!(file instanceof File)) return { valid: true };

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_HOMEWORK_FILE_EXTENSIONS.has(extension)) {
        return {
            valid: false,
            message: 'Колдоого алынган файл түрүн тандаңыз: PDF, Word, Excel, PowerPoint, ZIP, TXT, CSV же сүрөт.',
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
        async (homeworkId, title) => {
            setPreviewState({
                open: true,
                title,
                objectUrl: '',
                kind: 'download',
                loading: true,
            });

            try {
                const result = await fetchStudentHomeworkSubmissionAttachmentPreview(homeworkId);
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
                    course,
                    title,
                    description,
                    dateLabel: formatTaskDate(task),
                    canSubmit: Boolean(ids.sessionId && ids.homeworkId),
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

    const handleFileChange = (taskKey, file) => {
        const nextFile = file || null;
        const validation = validateHomeworkFile(nextFile);

        if (!validation.valid) {
            updateDraft(taskKey, 'file', null);
            updateDraft(taskKey, 'fileError', validation.message);
            return;
        }

        updateDraft(taskKey, 'file', nextFile);
        updateDraft(taskKey, 'fileError', '');
    };

    const submitTask = async (item) => {
        if (!onSubmitHomework) return;
        const draft = drafts[item.key] || { text: '', link: '', file: null };
        const success = await onSubmitHomework(item.task, draft);
        if (success) {
            setDrafts((prev) => ({
                ...prev,
                [item.key]: { text: '', link: '', file: null, fileError: '' },
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
                            const draft = drafts[item.key] || { text: '', link: '' };
                            const isSubmitting = submittingTaskState?.key === item.key;
                            const isUploading = isSubmitting && submittingTaskState?.phase === 'uploading';
                            const isExpanded = expandedTaskId === item.key;
                            const StatusIcon = item.meta.icon;
                            const reviewComment = item.task.mySubmission?.reviewComment || '';
                            const reviewScore = item.task.mySubmission?.score;
                            const reviewedAt = item.task.mySubmission?.reviewedAt;
                            const submittedAt =
                                item.task.mySubmission?.updatedAt || item.task.mySubmission?.createdAt;
                            const submissionAttachment = item.task.mySubmission?.attachmentUrl || '';
                            const submissionText = item.task.mySubmission?.answerText || '';
                            const canResubmit =
                                item.status === 'needs_revision' || item.status === 'rejected';

                            return (
                                <article
                                    key={item.key}
                                    className={`rounded-[1.5rem] border bg-white p-5 shadow-sm transition duration-300 dark:bg-slate-900 ${item.meta.accentClass}`}
                                >
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1 space-y-4">
                                            <div className="flex flex-wrap items-start gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-dark dark:bg-slate-800 dark:text-edubot-soft">
                                                    <FiBookOpen className="h-5 w-5" />
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
                                                                        Number(item.task.id || item.task.homeworkId),
                                                                        `${item.title} — Тиркеме`
                                                                    );
                                                                }}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 font-medium text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200"
                                                            >
                                                                <FiPaperclip className="h-4 w-4" />
                                                                Тиркемени ачуу
                                                            </a>
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
                                                                {canResubmit ? 'Жоопту кайра жөнөтүү' : item.status === 'submitted' ? 'Жаңыртуу керек болсо кайра жөнөтүңүз' : 'Жооп жөнөтүү'}
                                                            </p>
                                                            <p className="mt-1 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                                                {canResubmit
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
                                                            {isExpanded ? 'Жыйуу' : 'Жооп берүү'}
                                                        </button>
                                                    </div>

                                                    {isExpanded ? (
                                                        <div className="mt-4 space-y-3">
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
                                                                        'PDF, Word, Excel, сүрөт же ZIP кошуу'}
                                                                </span>
                                                                <span className="text-xs font-semibold">
                                                                    {draft.file ? 'Алмаштыруу' : 'Файл тандоо'}
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.json,.txt,.csv,.jpg,.jpeg,.png,.webp"
                                                                    disabled={isSubmitting}
                                                                    onChange={(e) =>
                                                                        handleFileChange(
                                                                            item.key,
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
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                                    <p>Жооп, шилтеме же файлдын кеминде бири талап кылынат.</p>
                                                                    {isUploading ? (
                                                                        <p className="mt-1 text-edubot-orange dark:text-edubot-soft">
                                                                            Файл жүктөлүүдө...
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
                                                                            : 'Жөнөтүү'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-4 flex items-center gap-2 text-xs text-edubot-muted dark:text-slate-400">
                                                            <FiExternalLink className="h-4 w-4" />
                                                            {canResubmit
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

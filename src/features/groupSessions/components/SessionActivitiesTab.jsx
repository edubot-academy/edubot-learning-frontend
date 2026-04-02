import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    FiCheckCircle,
    FiClipboard,
    FiEdit3,
    FiEye,
    FiMessageSquare,
    FiPlus,
    FiSave,
    FiTrash2,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';

const ACTIVITY_TYPE_OPTIONS = [
    { value: 'discussion', label: 'Талкуу', icon: FiMessageSquare },
    { value: 'exercise', label: 'Көнүгүү', icon: FiEdit3 },
    { value: 'quiz', label: 'Квиз', icon: FiClipboard },
    { value: 'group_work', label: 'Топтук иш', icon: FiUsers },
];

const ACTIVITY_STATUS_OPTIONS = [
    { value: 'planned', label: 'Пландалды' },
    { value: 'active', label: 'Азыр жүрүп жатат' },
    { value: 'done', label: 'Аяктады' },
];

const typeMeta = Object.fromEntries(ACTIVITY_TYPE_OPTIONS.map((option) => [option.value, option]));

const statusMeta = {
    planned: {
        className:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        helper: 'Студентке көрүнбөйт',
    },
    active: {
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        helper: 'Студентке көрүнөт',
    },
    done: {
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        helper: 'Студентке көрүнөт, жабык',
    },
};

const createEmptyActivityOption = () => ({ text: '', isCorrect: false });
const createEmptyActivityQuestion = () => ({
    prompt: '',
    questionMode: 'single_choice',
    options: [createEmptyActivityOption(), createEmptyActivityOption()],
});
const createEmptyActivity = (type = 'discussion') => ({
    title: '',
    description: '',
    type,
    status: 'planned',
    questions: type === 'quiz' ? [createEmptyActivityQuestion()] : [],
});

const cloneActivity = (activity = {}) => ({
    id: activity.id || undefined,
    title: activity.title || '',
    description: activity.description || '',
    type: activity.type || 'discussion',
    status: activity.status || 'planned',
    questions:
        activity.type === 'quiz'
            ? (activity.questions || []).map((question) => ({
                  id: question.id || undefined,
                  prompt: question.prompt || '',
                  questionMode: question.questionMode || 'single_choice',
                  options: (question.options || []).map((option) => ({
                      id: option.id || undefined,
                      text: option.text || '',
                      isCorrect: Boolean(option.isCorrect),
                  })),
              }))
            : [],
});

const formatSavedAt = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('ky-KG', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const ActivityEditor = ({
    activity,
    label,
    onChange,
    onQuestionChange,
    onOptionChange,
    onAddQuestion,
    onRemoveQuestion,
    onAddOption,
    onRemoveOption,
    onCancel,
    onSave,
    saving,
    saveLabel,
}) => {
    const meta = typeMeta[activity.type] || typeMeta.discussion;

    return (
        <div className="rounded-[1.5rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                    <meta.icon className="h-4 w-4 text-edubot-orange" />
                    {label}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edubot-line bg-white px-4 py-2.5 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                        <FiX className="h-4 w-4" />
                        Жокко чыгаруу
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <FiCheckCircle className="h-4 w-4 animate-pulse" /> : <FiSave className="h-4 w-4" />}
                        {saving ? 'Сакталып жатат...' : saveLabel}
                    </button>
                </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.2fr),180px,220px]">
                <input
                    value={activity.title}
                    onChange={(event) => onChange('title', event.target.value)}
                    placeholder="Иштин аталышы"
                    className="dashboard-field"
                />
                <select
                    value={activity.type}
                    onChange={(event) => onChange('type', event.target.value)}
                    className="dashboard-field dashboard-select"
                >
                    {ACTIVITY_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={activity.status}
                    onChange={(event) => onChange('status', event.target.value)}
                    className="dashboard-field dashboard-select"
                >
                    {ACTIVITY_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                value={activity.description || ''}
                onChange={(event) => onChange('description', event.target.value)}
                rows={3}
                placeholder="Кыскача түшүндүрмө же эмне кылыш керек экенин жазыңыз."
                className="dashboard-field mt-3 min-h-[96px]"
            />

            <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-edubot-line bg-edubot-surfaceAlt/70 px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                    {meta.label}
                </span>
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusMeta[activity.status]?.className || statusMeta.planned.className
                    }`}
                >
                    {(ACTIVITY_STATUS_OPTIONS.find((option) => option.value === activity.status) || ACTIVITY_STATUS_OPTIONS[0]).label}
                </span>
                <span className="rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                    {statusMeta[activity.status]?.helper || statusMeta.planned.helper}
                </span>
            </div>

            {activity.type === 'quiz' && (
                <details open className="mt-4 rounded-[1.25rem] border border-edubot-line/80 bg-edubot-surface/60 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                Квиз суроолору
                            </div>
                            <div className="text-xs text-edubot-muted dark:text-slate-400">
                                {(activity.questions || []).length} суроо. Ар бир суроо үчүн жок дегенде эки вариант жана бир туура жооп керек.
                            </div>
                        </div>
                        <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                            Ачуу/жабуу
                        </span>
                    </summary>

                    <div className="mt-4 flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onAddQuestion}
                            className="inline-flex items-center gap-2 rounded-full border border-edubot-line bg-white px-3 py-2 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            <FiPlus className="h-4 w-4" />
                            Суроо кошуу
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {(activity.questions || []).map((question, questionIndex) => (
                            <div
                                key={`${activity.id || 'draft'}-question-${question.id || questionIndex}`}
                                className="rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                        Суроо #{questionIndex + 1}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveQuestion(questionIndex)}
                                        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                    >
                                        <FiTrash2 className="h-4 w-4" />
                                        Өчүрүү
                                    </button>
                                </div>

                                <textarea
                                    value={question.prompt}
                                    onChange={(event) => onQuestionChange(questionIndex, 'prompt', event.target.value)}
                                    rows={2}
                                    placeholder="Суроону жазыңыз"
                                    className="dashboard-field mt-3"
                                />

                                <div className="mt-3">
                                    <select
                                        value={question.questionMode || 'single_choice'}
                                        onChange={(event) => onQuestionChange(questionIndex, 'questionMode', event.target.value)}
                                        className="dashboard-field dashboard-select max-w-[240px]"
                                    >
                                        <option value="single_choice">Бир туура жооп</option>
                                        <option value="multiple_choice">Бир нече туура жооп</option>
                                    </select>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {(question.options || []).map((option, optionIndex) => (
                                        <div
                                            key={`${activity.id || 'draft'}-question-${questionIndex}-option-${option.id || optionIndex}`}
                                            className="grid gap-2 md:grid-cols-[auto,minmax(0,1fr),auto]"
                                        >
                                            <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edubot-line bg-white px-3 py-2 text-sm font-medium text-edubot-ink dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(option.isCorrect)}
                                                    onChange={(event) =>
                                                        onOptionChange(questionIndex, optionIndex, 'isCorrect', event.target.checked)
                                                    }
                                                    className="h-4 w-4 rounded border-edubot-line text-edubot-orange focus:ring-edubot-orange/30"
                                                />
                                                Туура
                                            </label>
                                            <input
                                                value={option.text}
                                                onChange={(event) => onOptionChange(questionIndex, optionIndex, 'text', event.target.value)}
                                                placeholder={`Вариант ${optionIndex + 1}`}
                                                className="dashboard-field min-w-[220px] flex-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => onRemoveOption(questionIndex, optionIndex)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                Өчүрүү
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onAddOption(questionIndex)}
                                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-edubot-line bg-white px-3 py-2 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    Вариант кошуу
                                </button>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
};

const SessionActivitiesTab = ({
    activities,
    canEdit,
    onCreateActivity,
    onUpdateActivity,
    onDeleteActivity,
    savedAt,
    creating,
    savingActivityId,
    deletingActivityId,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [createDraft, setCreateDraft] = useState(createEmptyActivity());
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState(null);

    useEffect(() => {
        if (editingId && !activities.some((activity) => String(activity.id) === String(editingId))) {
            setEditingId(null);
            setEditDraft(null);
        }
    }, [activities, editingId]);

    const activityStats = useMemo(() => ({
        total: activities.length,
        visible: activities.filter((activity) => activity.status === 'active' || activity.status === 'done').length,
        hidden: activities.filter((activity) => activity.status === 'planned').length,
        quiz: activities.filter((activity) => activity.type === 'quiz').length,
    }), [activities]);

    const updateDraft = (setter, field, value) => {
        setter((prev) => ({
            ...prev,
            [field]: value,
            ...(field === 'type'
                ? {
                      questions:
                          value === 'quiz'
                              ? Array.isArray(prev.questions) && prev.questions.length
                                  ? prev.questions
                                  : [createEmptyActivityQuestion()]
                              : [],
                  }
                : {}),
        }));
    };

    const updateQuestion = (setter, questionIndex, field, value) => {
        setter((prev) => ({
            ...prev,
            questions: (prev.questions || []).map((question, index) =>
                index === questionIndex
                    ? {
                          ...question,
                          [field]: value,
                          ...(field === 'questionMode' && value === 'single_choice'
                              ? {
                                    options: (() => {
                                        const options = Array.isArray(question.options) ? question.options : [];
                                        const firstCorrectIndex = options.findIndex((option) => Boolean(option.isCorrect));
                                        const preservedIndex = firstCorrectIndex >= 0 ? firstCorrectIndex : 0;
                                        return options.map((option, optionIndex) => ({
                                            ...option,
                                            isCorrect: optionIndex === preservedIndex,
                                        }));
                                    })(),
                                }
                              : {}),
                      }
                    : question
            ),
        }));
    };

    const updateOption = (setter, questionIndex, optionIndex, field, value) => {
        setter((prev) => ({
            ...prev,
            questions: (prev.questions || []).map((question, index) =>
                index === questionIndex
                    ? {
                          ...question,
                          options: (question.options || []).map((option, currentOptionIndex) => {
                              if (currentOptionIndex !== optionIndex) {
                                  return field === 'isCorrect' && value === true && question.questionMode !== 'multiple_choice'
                                      ? { ...option, isCorrect: false }
                                      : option;
                              }

                              return {
                                  ...option,
                                  [field]: value,
                                  ...(field === 'isCorrect' && value === true && question.questionMode !== 'multiple_choice'
                                      ? { isCorrect: true }
                                      : {}),
                              };
                          }),
                      }
                    : question
            ),
        }));
    };

    const addQuestion = (setter) => {
        setter((prev) => ({
            ...prev,
            questions: [...(prev.questions || []), createEmptyActivityQuestion()],
        }));
    };

    const removeQuestion = (setter, questionIndex) => {
        setter((prev) => ({
            ...prev,
            questions: (prev.questions || []).filter((_, index) => index !== questionIndex),
        }));
    };

    const addOption = (setter, questionIndex) => {
        setter((prev) => ({
            ...prev,
            questions: (prev.questions || []).map((question, index) =>
                index === questionIndex
                    ? {
                          ...question,
                          options: [...(question.options || []), createEmptyActivityOption()],
                      }
                    : question
            ),
        }));
    };

    const removeOption = (setter, questionIndex, optionIndex) => {
        setter((prev) => ({
            ...prev,
            questions: (prev.questions || []).map((question, index) =>
                index === questionIndex
                    ? {
                          ...question,
                          options: (question.options || []).filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex),
                      }
                    : question
            ),
        }));
    };

    const beginCreate = () => {
        setIsCreating(true);
        setCreateDraft(createEmptyActivity());
        setEditingId(null);
        setEditDraft(null);
    };

    const beginEdit = (activity) => {
        setEditingId(activity.id);
        setEditDraft(cloneActivity(activity));
        setIsCreating(false);
    };

    const saveCreate = async () => {
        const ok = await onCreateActivity(createDraft);
        if (ok !== false) {
            setIsCreating(false);
            setCreateDraft(createEmptyActivity());
        }
    };

    const saveEdit = async () => {
        if (!editingId) return;
        const ok = await onUpdateActivity(editingId, editDraft);
        if (ok !== false) {
            setEditingId(null);
            setEditDraft(null);
        }
    };

    return (
        <div className="space-y-4">
            <DashboardInsetPanel
                title="Сессия иштери"
                description="Бул бөлүм окуучу менен синхрондолот. Ар бир иш өзүнчө сакталат: пландалды — студентке көрүнбөйт, активдүү — көрүнөт, аяктады — көрүнөт бирок жабык."
            >
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-edubot-muted dark:text-slate-400">Жалпы</div>
                        <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{activityStats.total}</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">Көрүнөт</div>
                        <div className="mt-2 text-2xl font-semibold text-amber-800 dark:text-amber-100">{activityStats.visible}</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-500/30 dark:bg-sky-500/10">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">Жашыруун</div>
                        <div className="mt-2 text-2xl font-semibold text-sky-800 dark:text-sky-100">{activityStats.hidden}</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-edubot-muted dark:text-slate-400">Квиз</div>
                        <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{activityStats.quiz}</div>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                    <div className="text-sm text-edubot-muted dark:text-slate-300">
                        {savedAt
                            ? `Акыркы жаңыртуу: ${formatSavedAt(savedAt)}`
                            : 'Иштер азырынча кошула элек.'}
                    </div>
                    {canEdit ? (
                        <button
                            type="button"
                            onClick={beginCreate}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                        >
                            <FiPlus className="h-4 w-4" />
                            Иш кошуу
                        </button>
                    ) : null}
                </div>

                {isCreating ? (
                    <div className="mt-4">
                        <ActivityEditor
                            activity={createDraft}
                            label="Жаңы иш"
                            onChange={(field, value) => updateDraft(setCreateDraft, field, value)}
                            onQuestionChange={(questionIndex, field, value) => updateQuestion(setCreateDraft, questionIndex, field, value)}
                            onOptionChange={(questionIndex, optionIndex, field, value) => updateOption(setCreateDraft, questionIndex, optionIndex, field, value)}
                            onAddQuestion={() => addQuestion(setCreateDraft)}
                            onRemoveQuestion={(questionIndex) => removeQuestion(setCreateDraft, questionIndex)}
                            onAddOption={(questionIndex) => addOption(setCreateDraft, questionIndex)}
                            onRemoveOption={(questionIndex, optionIndex) => removeOption(setCreateDraft, questionIndex, optionIndex)}
                            onCancel={() => {
                                setIsCreating(false);
                                setCreateDraft(createEmptyActivity());
                            }}
                            onSave={saveCreate}
                            saving={creating}
                            saveLabel="Ишти сактоо"
                        />
                    </div>
                ) : null}

                {activities.length ? (
                    <div className="mt-4 space-y-4">
                        {activities.map((activity, index) => {
                            const meta = typeMeta[activity.type] || typeMeta.discussion;
                            const StatusIcon = meta.icon;
                            const isEditing = String(editingId) === String(activity.id);

                            if (isEditing && editDraft) {
                                return (
                                    <ActivityEditor
                                        key={`edit-${activity.id}`}
                                        activity={editDraft}
                                        label={`Иш #${index + 1}`}
                                        onChange={(field, value) => updateDraft(setEditDraft, field, value)}
                                        onQuestionChange={(questionIndex, field, value) => updateQuestion(setEditDraft, questionIndex, field, value)}
                                        onOptionChange={(questionIndex, optionIndex, field, value) => updateOption(setEditDraft, questionIndex, optionIndex, field, value)}
                                        onAddQuestion={() => addQuestion(setEditDraft)}
                                        onRemoveQuestion={(questionIndex) => removeQuestion(setEditDraft, questionIndex)}
                                        onAddOption={(questionIndex) => addOption(setEditDraft, questionIndex)}
                                        onRemoveOption={(questionIndex, optionIndex) => removeOption(setEditDraft, questionIndex, optionIndex)}
                                        onCancel={() => {
                                            setEditingId(null);
                                            setEditDraft(null);
                                        }}
                                        onSave={saveEdit}
                                        saving={String(savingActivityId) === String(activity.id)}
                                        saveLabel="Өзгөртүүнү сактоо"
                                    />
                                );
                            }

                            return (
                                <div
                                    key={`activity-${activity.id || index}`}
                                    className="rounded-[1.5rem] border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                <StatusIcon className="h-4 w-4 text-edubot-orange" />
                                                {activity.title}
                                            </div>
                                            {activity.description ? (
                                                <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                    {activity.description}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => beginEdit(activity)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edubot-line bg-white px-4 py-2.5 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                            >
                                                <FiEdit3 className="h-4 w-4" />
                                                Түзөтүү
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteActivity(activity.id)}
                                                disabled={String(deletingActivityId) === String(activity.id)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-500/10"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                {String(deletingActivityId) === String(activity.id) ? 'Өчүрүлүүдө...' : 'Өчүрүү'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-edubot-line bg-edubot-surfaceAlt/70 px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                                            {meta.label}
                                        </span>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta[activity.status]?.className || statusMeta.planned.className}`}>
                                            {(ACTIVITY_STATUS_OPTIONS.find((option) => option.value === activity.status) || ACTIVITY_STATUS_OPTIONS[0]).label}
                                        </span>
                                        <span className="rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                            {statusMeta[activity.status]?.helper || statusMeta.planned.helper}
                                        </span>
                                        {activity.type === 'quiz' ? (
                                            <span className="rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                {(activity.questions || []).length} суроо
                                            </span>
                                        ) : null}
                                    </div>

                                    {activity.type === 'quiz' ? (
                                        <div className="mt-4 rounded-[1.25rem] border border-edubot-line/80 bg-edubot-surface/60 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                        Квиз кыскача көрүнүшү
                                                    </div>
                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                        Оң жооптор бул жерде көрсөтүлбөйт. Студентке статус боюнча көрүнөт.
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center gap-2 rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                    <FiEye className="h-3.5 w-3.5" />
                                                    Көрүү режими
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4 rounded-[1.25rem] border border-dashed border-edubot-line/80 bg-edubot-surface/60 p-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                        Азырынча сессия иштери жок. Мисалы, талкуу, көнүгүү, топтук иш же квиз кошсоңуз болот.
                    </div>
                )}
            </DashboardInsetPanel>
        </div>
    );
};

const optionShape = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isCorrect: PropTypes.bool,
    text: PropTypes.string,
});

const questionShape = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.arrayOf(optionShape),
    prompt: PropTypes.string,
    questionMode: PropTypes.string,
});

SessionActivitiesTab.propTypes = {
    activities: PropTypes.arrayOf(
        PropTypes.shape({
            description: PropTypes.string,
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            questions: PropTypes.arrayOf(questionShape),
            status: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
        })
    ).isRequired,
    canEdit: PropTypes.bool.isRequired,
    creating: PropTypes.bool.isRequired,
    deletingActivityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onCreateActivity: PropTypes.func.isRequired,
    onDeleteActivity: PropTypes.func.isRequired,
    onUpdateActivity: PropTypes.func.isRequired,
    savedAt: PropTypes.string,
    savingActivityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

SessionActivitiesTab.defaultProps = {
    deletingActivityId: null,
    savedAt: '',
    savingActivityId: null,
};

export default SessionActivitiesTab;

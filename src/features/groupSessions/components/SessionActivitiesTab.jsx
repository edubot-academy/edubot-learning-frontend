import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    FiCheckCircle,
    FiClipboard,
    FiEdit3,
    FiEye,
    FiFileText,
    FiMessageSquare,
    FiPlus,
    FiSave,
    FiTrash2,
    FiUsers,
    FiX,
    FiZap,
} from 'react-icons/fi';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';
import { parseApiError } from '../../../shared/api/error';
import { acceptAiGeneration, generateAiFeedbackDraft, generateAiSessionQuizDraft, getAiLmsCapabilities, rejectAiGeneration } from '../../aiLms/api';
import AiGenerationDrawer from '../../aiLms/components/AiGenerationDrawer';
import { INTERACTIVE_ACTIVITY_TYPES as INTERACTIVE_TYPES } from '../../student-dashboard/components/ActivityInteractiveForm';

const ACTIVITY_TYPE_OPTIONS = [
    { value: 'discussion', labelKey: 'groupSessions.activities.types.discussion', icon: FiMessageSquare },
    { value: 'exercise', labelKey: 'groupSessions.activities.types.exercise', icon: FiEdit3 },
    { value: 'quiz', labelKey: 'groupSessions.activities.types.quiz', icon: FiClipboard },
    { value: 'group_work', labelKey: 'groupSessions.activities.types.groupWork', icon: FiUsers },
    { value: 'vocabulary', labelKey: 'groupSessions.activities.types.vocabulary', icon: FiFileText },
    { value: 'fill_blank', labelKey: 'groupSessions.activities.types.fillBlank', icon: FiEdit3 },
    { value: 'word_match', labelKey: 'groupSessions.activities.types.wordMatch', icon: FiFileText },
    { value: 'listening', labelKey: 'groupSessions.activities.types.listening', icon: FiMessageSquare },
    { value: 'writing_correction', labelKey: 'groupSessions.activities.types.writingCorrection', icon: FiEdit3 },
];

const ACTIVITY_STATUS_OPTIONS = [
    { value: 'planned', labelKey: 'groupSessions.activities.status.planned' },
    { value: 'active', labelKey: 'groupSessions.activities.status.active' },
    { value: 'done', labelKey: 'groupSessions.activities.status.done' },
];

const typeMeta = Object.fromEntries(ACTIVITY_TYPE_OPTIONS.map((option) => [option.value, option]));

const typeTone = {
    discussion: {
        chip: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        panel: 'border-sky-200/80 bg-sky-50/40 dark:border-sky-500/20 dark:bg-sky-500/5',
        helperKey: 'groupSessions.activities.typeHelp.discussion',
    },
    exercise: {
        chip: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
        panel: 'border-violet-200/80 bg-violet-50/40 dark:border-violet-500/20 dark:bg-violet-500/5',
        helperKey: 'groupSessions.activities.typeHelp.exercise',
    },
    quiz: {
        chip: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        panel: 'border-amber-200/80 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/5',
        helperKey: 'groupSessions.activities.typeHelp.quiz',
    },
    group_work: {
        chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        panel: 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5',
        helperKey: 'groupSessions.activities.typeHelp.groupWork',
    },
    vocabulary: {
        chip: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300',
        panel: 'border-purple-200/80 bg-purple-50/40 dark:border-purple-500/20 dark:bg-purple-500/5',
        helperKey: 'groupSessions.activities.typeHelp.vocabulary',
    },
    fill_blank: {
        chip: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300',
        panel: 'border-teal-200/80 bg-teal-50/40 dark:border-teal-500/20 dark:bg-teal-500/5',
        helperKey: 'groupSessions.activities.typeHelp.fillBlank',
    },
    word_match: {
        chip: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
        panel: 'border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-500/20 dark:bg-indigo-500/5',
        helperKey: 'groupSessions.activities.typeHelp.wordMatch',
    },
    listening: {
        chip: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
        panel: 'border-cyan-200/80 bg-cyan-50/40 dark:border-cyan-500/20 dark:bg-cyan-500/5',
        helperKey: 'groupSessions.activities.typeHelp.listening',
    },
    writing_correction: {
        chip: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
        panel: 'border-rose-200/80 bg-rose-50/40 dark:border-rose-500/20 dark:bg-rose-500/5',
        helperKey: 'groupSessions.activities.typeHelp.writingCorrection',
    },
};

const statusMeta = {
    planned: {
        className:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        helperKey: 'groupSessions.activities.statusHelp.planned',
    },
    active: {
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        helperKey: 'groupSessions.activities.statusHelp.active',
    },
    done: {
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        helperKey: 'groupSessions.activities.statusHelp.done',
    },
};

const submissionStatusLabelKey = {
    submitted: 'groupSessions.activities.submissionStatus.submitted',
    approved: 'groupSessions.activities.submissionStatus.approved',
    needs_revision: 'groupSessions.activities.submissionStatus.needsRevision',
    rejected: 'groupSessions.activities.submissionStatus.rejected',
};

const activityResponseFilterMeta = {
    all: { labelKey: 'groupSessions.activities.filters.all', helperKey: 'groupSessions.activities.filterHelp.all' },
    pending: { labelKey: 'groupSessions.activities.filters.pending', helperKey: 'groupSessions.activities.filterHelp.pending' },
    reviewed: { labelKey: 'groupSessions.activities.filters.reviewed', helperKey: 'groupSessions.activities.filterHelp.reviewed' },
    revision: { labelKey: 'groupSessions.activities.filters.revision', helperKey: 'groupSessions.activities.filterHelp.revision' },
    passed: { labelKey: 'groupSessions.activities.filters.passed', helperKey: 'groupSessions.activities.filterHelp.passed' },
    failed: { labelKey: 'groupSessions.activities.filters.failed', helperKey: 'groupSessions.activities.filterHelp.failed' },
    not_started: { labelKey: 'groupSessions.activities.filters.notStarted', helperKey: 'groupSessions.activities.filterHelp.notStarted' },
    missing_response: { labelKey: 'groupSessions.activities.filters.missingResponse', helperKey: 'groupSessions.activities.filterHelp.missingResponse' },
};

const createEmptyActivityOption = () => ({ text: '', isCorrect: false });
const createEmptyActivityQuestion = () => ({
    prompt: '',
    questionMode: 'single_choice',
    options: [createEmptyActivityOption(), createEmptyActivityOption()],
});
const DEFAULT_PAYLOAD = {
    vocabulary: { words: [] },
    fill_blank: { sentences: [] },
    word_match: { pairs: [] },
    listening: { audioUrl: '', prompt: '' },
    writing_correction: { prompt: '', rubric: '' },
};

const createEmptyActivity = (type = 'discussion') => ({
    title: '',
    description: '',
    type,
    status: 'planned',
    questions: type === 'quiz' ? [createEmptyActivityQuestion()] : [],
    payload: INTERACTIVE_TYPES.has(type) ? structuredClone(DEFAULT_PAYLOAD[type]) : null,
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
    payload: INTERACTIVE_TYPES.has(activity.type)
        ? (activity.payload ?? structuredClone(DEFAULT_PAYLOAD[activity.type]))
        : null,
});

const formatSavedAt = (value, language) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(language || undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatSubmissionThreadLabel = (message = {}, t) => {
    if (message.authorRole === 'student') {
        return message.authorName || t('groupSessions.activities.fallbacks.student');
    }
    return message.authorName || t('groupSessions.activities.fallbacks.instructor');
};

// ── Payload editors for interactive activity types ────────────────────────────
const PayloadEditor = ({ type, payload, onChange, t }) => {
    const fieldCls = 'dashboard-field';

    const updatePayload = (patch) => onChange({ ...payload, ...patch });

    if (type === 'vocabulary') {
        const words = Array.isArray(payload?.words) ? payload.words : [];
        return (
            <div className="mt-3 rounded-2xl border border-purple-200/70 bg-purple-50/40 p-4 dark:border-purple-500/20 dark:bg-purple-500/5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                    {t('groupSessions.activities.types.vocabulary')}
                </div>
                <div className="space-y-2">
                    {words.map((w, i) => (
                        <div key={i} className="flex gap-2">
                            <input value={w.word} onChange={(e) => { const next = [...words]; next[i] = { ...next[i], word: e.target.value }; updatePayload({ words: next }); }} placeholder={t('groupSessions.activities.payload.vocabulary.wordPlaceholder')} className={`${fieldCls} flex-1`} />
                            <input value={w.definition} onChange={(e) => { const next = [...words]; next[i] = { ...next[i], definition: e.target.value }; updatePayload({ words: next }); }} placeholder={t('groupSessions.activities.payload.vocabulary.definitionPlaceholder')} className={`${fieldCls} flex-1`} />
                            <button type="button" onClick={() => updatePayload({ words: words.filter((_, j) => j !== i) })} className="text-rose-500 hover:text-rose-600"><FiTrash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => updatePayload({ words: [...words, { word: '', definition: '' }] })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-300">
                    <FiPlus className="h-3.5 w-3.5" />{t('groupSessions.activities.payload.vocabulary.addWord')}
                </button>
            </div>
        );
    }

    if (type === 'fill_blank') {
        const sentences = Array.isArray(payload?.sentences) ? payload.sentences : [];
        return (
            <div className="mt-3 rounded-2xl border border-teal-200/70 bg-teal-50/40 p-4 dark:border-teal-500/20 dark:bg-teal-500/5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                    {t('groupSessions.activities.types.fillBlank')}
                </div>
                <div className="space-y-2">
                    {sentences.map((s, i) => (
                        <div key={i} className="flex gap-2">
                            <input value={s.sentence} onChange={(e) => { const next = [...sentences]; next[i] = { ...next[i], sentence: e.target.value }; updatePayload({ sentences: next }); }} placeholder={t('groupSessions.activities.payload.fillBlank.sentencePlaceholder')} className={`${fieldCls} flex-1`} />
                            <input value={s.answer} onChange={(e) => { const next = [...sentences]; next[i] = { ...next[i], answer: e.target.value }; updatePayload({ sentences: next }); }} placeholder={t('groupSessions.activities.payload.fillBlank.blankPlaceholder')} className={`${fieldCls} w-36`} />
                            <button type="button" onClick={() => updatePayload({ sentences: sentences.filter((_, j) => j !== i) })} className="text-rose-500 hover:text-rose-600"><FiTrash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => updatePayload({ sentences: [...sentences, { sentence: '', answer: '' }] })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-300">
                    <FiPlus className="h-3.5 w-3.5" />{t('groupSessions.activities.payload.fillBlank.addSentence')}
                </button>
            </div>
        );
    }

    if (type === 'word_match') {
        const pairs = Array.isArray(payload?.pairs) ? payload.pairs : [];
        return (
            <div className="mt-3 rounded-2xl border border-indigo-200/70 bg-indigo-50/40 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    {t('groupSessions.activities.types.wordMatch')}
                </div>
                <div className="space-y-2">
                    {pairs.map((p, i) => (
                        <div key={i} className="flex gap-2">
                            <input value={p.left} onChange={(e) => { const next = [...pairs]; next[i] = { ...next[i], left: e.target.value }; updatePayload({ pairs: next }); }} placeholder={t('groupSessions.activities.payload.wordMatch.leftPlaceholder')} className={`${fieldCls} flex-1`} />
                            <input value={p.right} onChange={(e) => { const next = [...pairs]; next[i] = { ...next[i], right: e.target.value }; updatePayload({ pairs: next }); }} placeholder={t('groupSessions.activities.payload.wordMatch.rightPlaceholder')} className={`${fieldCls} flex-1`} />
                            <button type="button" onClick={() => updatePayload({ pairs: pairs.filter((_, j) => j !== i) })} className="text-rose-500 hover:text-rose-600"><FiTrash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => updatePayload({ pairs: [...pairs, { left: '', right: '' }] })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 dark:text-indigo-300">
                    <FiPlus className="h-3.5 w-3.5" />{t('groupSessions.activities.payload.wordMatch.addPair')}
                </button>
            </div>
        );
    }

    if (type === 'listening') {
        return (
            <div className="mt-3 rounded-2xl border border-cyan-200/70 bg-cyan-50/40 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                    {t('groupSessions.activities.types.listening')}
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.payload.listening.audioUrlLabel')}</label>
                        <input value={payload?.audioUrl || ''} onChange={(e) => updatePayload({ audioUrl: e.target.value })} placeholder={t('groupSessions.activities.payload.listening.audioUrlPlaceholder')} className={fieldCls} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.payload.listening.promptLabel')}</label>
                        <textarea rows={3} value={payload?.prompt || ''} onChange={(e) => updatePayload({ prompt: e.target.value })} placeholder={t('groupSessions.activities.payload.listening.promptPlaceholder')} className={fieldCls} />
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'writing_correction') {
        return (
            <div className="mt-3 rounded-2xl border border-rose-200/70 bg-rose-50/40 p-4 dark:border-rose-500/20 dark:bg-rose-500/5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                    {t('groupSessions.activities.types.writingCorrection')}
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.payload.writingCorrection.promptLabel')}</label>
                        <textarea rows={3} value={payload?.prompt || ''} onChange={(e) => updatePayload({ prompt: e.target.value })} placeholder={t('groupSessions.activities.payload.writingCorrection.promptPlaceholder')} className={fieldCls} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.payload.writingCorrection.rubricLabel')}</label>
                        <textarea rows={2} value={payload?.rubric || ''} onChange={(e) => updatePayload({ rubric: e.target.value })} placeholder={t('groupSessions.activities.payload.writingCorrection.rubricPlaceholder')} className={fieldCls} />
                    </div>
                </div>
            </div>
        );
    }

    return null;
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
    aiQuizDraftEnabled,
    aiQuizDraft,
    aiQuizDrafting,
    aiQuizDraftError,
    onRequestAiQuizDraft,
    onUseAiQuizDraft,
    onCancelAiQuizDraft,
}) => {
    const { t } = useTranslation();
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
    const [quizBrief, setQuizBrief] = useState({
        topic: activity.title || '',
        questionCount: String(Math.max(3, activity.questions?.length || 3)),
        difficulty: '',
        questionMode: 'mixed',
        includeExplanations: false,
    });
    const meta = typeMeta[activity.type] || typeMeta.discussion;
    const currentStatusOption =
        ACTIVITY_STATUS_OPTIONS.find((option) => option.value === activity.status) ||
        ACTIVITY_STATUS_OPTIONS[0];
    const quizDraftOutput = aiQuizDraft || null;

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
                        {t('groupSessions.activities.actions.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <FiCheckCircle className="h-4 w-4 animate-pulse" /> : <FiSave className="h-4 w-4" />}
                        {saving ? t('groupSessions.activities.actions.saving') : saveLabel}
                    </button>
                </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.2fr),180px,220px]">
                <input
                    value={activity.title}
                    onChange={(event) => onChange('title', event.target.value)}
                    placeholder={t('groupSessions.activities.fields.title')}
                    className="dashboard-field"
                />
                <select
                    value={activity.type}
                    onChange={(event) => onChange('type', event.target.value)}
                    className="dashboard-field dashboard-select"
                >
                    {ACTIVITY_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
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
                            {t(option.labelKey)}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                value={activity.description || ''}
                onChange={(event) => onChange('description', event.target.value)}
                rows={3}
                placeholder={t('groupSessions.activities.fields.description')}
                className="dashboard-field mt-3 min-h-[96px]"
            />

            <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-edubot-line bg-edubot-surfaceAlt/70 px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                    {t(meta.labelKey)}
                </span>
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusMeta[activity.status]?.className || statusMeta.planned.className
                    }`}
                >
                    {t(currentStatusOption.labelKey)}
                </span>
                <span className="rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                    {t(statusMeta[activity.status]?.helperKey || statusMeta.planned.helperKey)}
                </span>
            </div>

            {INTERACTIVE_TYPES.has(activity.type) ? (
                <PayloadEditor
                    type={activity.type}
                    payload={activity.payload}
                    onChange={(value) => onChange('payload', value)}
                    t={t}
                />
            ) : activity.type !== 'quiz' ? (
                <div className="mt-3 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 text-xs leading-6 text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                    {t('groupSessions.activities.editor.reviewHint')}
                </div>
            ) : null}

            {activity.type === 'quiz' && (
                <details open className="mt-4 rounded-[1.25rem] border border-edubot-line/80 bg-edubot-surface/60 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                {t('groupSessions.activities.quiz.questionsTitle')}
                            </div>
                            <div className="text-xs text-edubot-muted dark:text-slate-400">
                                {t('groupSessions.activities.quiz.questionsHelp', {
                                    count: (activity.questions || []).length,
                                })}
                            </div>
                        </div>
                        <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                            {t('groupSessions.activities.actions.toggle')}
                        </span>
                    </summary>

                    {aiQuizDraftEnabled ? (
                        <section className="mt-4 rounded-[1.25rem] border border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-900 dark:bg-sky-950/30">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold text-edubot-ink dark:text-white">{t('ai.quizDraft')}</p>
                                    <p className="mt-1 text-edubot-muted dark:text-slate-300">{t('ai.quizDraftHelp')}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAiDrawerOpen(true)}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 dark:border-sky-700 dark:bg-slate-950 dark:text-sky-200"
                                >
                                    <FiZap className="h-4 w-4" />
                                    {aiQuizDraft ? t('ai.openPreview') : t('ai.openGenerator')}
                                </button>
                            </div>
                            <AiGenerationDrawer
                                isOpen={isAiDrawerOpen}
                                title={t('ai.quizDraft')}
                                description={t('ai.quizDraftHelp')}
                                onClose={() => setIsAiDrawerOpen(false)}
                                footer={(
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {aiQuizDraft ? (
                                            <>
                                                <button type="button" onClick={onCancelAiQuizDraft} className="dashboard-button-secondary">
                                                    {t('ai.cancelDraft')}
                                                </button>
                                                <button type="button" onClick={onUseAiQuizDraft} className="dashboard-button-primary">
                                                    {t('ai.useDraft')}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => onRequestAiQuizDraft(quizBrief)}
                                                disabled={aiQuizDrafting}
                                                className="dashboard-button-primary disabled:opacity-60"
                                            >
                                                {aiQuizDrafting ? t('ai.generating') : t('ai.suggestQuiz')}
                                            </button>
                                        )}
                                    </div>
                                )}
                            >
                                <div className="space-y-4">
                                    <div className="grid gap-2 text-xs text-edubot-muted dark:text-slate-300 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                                            <span className="font-semibold text-edubot-ink dark:text-white">{t('ai.quizDraftFlow.createsLabel')}</span>
                                            <span className="mt-1 block">{t('ai.quizDraftFlow.creates')}</span>
                                        </div>
                                        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                                            <span className="font-semibold text-edubot-ink dark:text-white">{t('ai.quizDraftFlow.appliesLabel')}</span>
                                            <span className="mt-1 block">{t('ai.quizDraftFlow.applies')}</span>
                                        </div>
                                        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                                            <span className="font-semibold text-edubot-ink dark:text-white">{t('ai.quizDraftFlow.nextLabel')}</span>
                                            <span className="mt-1 block">{t('ai.quizDraftFlow.next')}</span>
                                        </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <input value={quizBrief.topic} onChange={(event) => setQuizBrief((prev) => ({ ...prev, topic: event.target.value }))} placeholder={t('ai.quizBrief.topicPlaceholder')} className="dashboard-field" />
                                        <input type="number" min="1" max="20" value={quizBrief.questionCount} onChange={(event) => setQuizBrief((prev) => ({ ...prev, questionCount: event.target.value }))} aria-label={t('ai.quizBrief.questionCount')} className="dashboard-field" />
                                        <select value={quizBrief.difficulty} onChange={(event) => setQuizBrief((prev) => ({ ...prev, difficulty: event.target.value }))} className="dashboard-field dashboard-select">
                                            <option value="">{t('ai.quizBrief.difficultyAuto')}</option>
                                            <option value="beginner">{t('ai.homeworkBrief.difficultyBeginner')}</option>
                                            <option value="intermediate">{t('ai.homeworkBrief.difficultyIntermediate')}</option>
                                            <option value="advanced">{t('ai.homeworkBrief.difficultyAdvanced')}</option>
                                        </select>
                                        <select value={quizBrief.questionMode} onChange={(event) => setQuizBrief((prev) => ({ ...prev, questionMode: event.target.value }))} className="dashboard-field dashboard-select">
                                            <option value="mixed">{t('ai.quizBrief.modeMixed')}</option>
                                            <option value="single_choice">{t('groupSessions.activities.quiz.singleChoice')}</option>
                                            <option value="multiple_choice">{t('groupSessions.activities.quiz.multipleChoice')}</option>
                                        </select>
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-edubot-muted dark:text-slate-300">
                                        <input type="checkbox" checked={quizBrief.includeExplanations} onChange={(event) => setQuizBrief((prev) => ({ ...prev, includeExplanations: event.target.checked }))} className="h-4 w-4 rounded border-edubot-line text-edubot-orange focus:ring-edubot-orange" />
                                        {t('ai.quizBrief.includeExplanations')}
                                    </label>
                                    {quizDraftOutput ? (
                                        <div className="rounded-2xl border border-edubot-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                            <p className="font-semibold text-edubot-ink dark:text-white">{quizDraftOutput.title}</p>
                                            {quizDraftOutput.description ? <p className="mt-1 text-edubot-muted dark:text-slate-300">{quizDraftOutput.description}</p> : null}
                                            <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">{t('ai.questionCount', { count: quizDraftOutput.questions?.length ?? 0 })}</p>
                                            <div className="mt-3 space-y-3">
                                                {(quizDraftOutput.questions || []).map((question, questionIndex) => (
                                                    <div key={`${question.prompt || 'question'}-${questionIndex}`} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3 dark:border-sky-900 dark:bg-sky-950/30">
                                                        <p className="text-sm font-semibold text-edubot-ink dark:text-white">{questionIndex + 1}. {question.prompt}</p>
                                                        <ul className="mt-2 space-y-1 text-xs text-edubot-muted dark:text-slate-300">
                                                            {(question.options || []).map((option, optionIndex) => (
                                                                <li key={`${option.text || 'option'}-${optionIndex}`} className={option.isCorrect ? 'font-semibold text-emerald-700 dark:text-emerald-300' : ''}>
                                                                    {option.isCorrect ? `${t('ai.quizDraftCorrect')} ` : ''}{option.text}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    {aiQuizDraftError ? <p className="text-sm text-rose-600">{aiQuizDraftError}</p> : null}
                                </div>
                            </AiGenerationDrawer>
                        </section>
                    ) : null}

                    <div className="mt-4 flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onAddQuestion}
                            className="inline-flex items-center gap-2 rounded-full border border-edubot-line bg-white px-3 py-2 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            <FiPlus className="h-4 w-4" />
                            {t('groupSessions.activities.actions.addQuestion')}
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
                                        {t('groupSessions.activities.quiz.questionNumber', {
                                            number: questionIndex + 1,
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveQuestion(questionIndex)}
                                        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                    >
                                        <FiTrash2 className="h-4 w-4" />
                                        {t('groupSessions.activities.actions.delete')}
                                    </button>
                                </div>

                                <textarea
                                    value={question.prompt}
                                    onChange={(event) => onQuestionChange(questionIndex, 'prompt', event.target.value)}
                                    rows={2}
                                    placeholder={t('groupSessions.activities.quiz.questionPlaceholder')}
                                    className="dashboard-field mt-3"
                                />

                                <div className="mt-3">
                                    <select
                                        value={question.questionMode || 'single_choice'}
                                        onChange={(event) => onQuestionChange(questionIndex, 'questionMode', event.target.value)}
                                        className="dashboard-field dashboard-select max-w-[240px]"
                                    >
                                        <option value="single_choice">{t('groupSessions.activities.quiz.singleChoice')}</option>
                                        <option value="multiple_choice">{t('groupSessions.activities.quiz.multipleChoice')}</option>
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
                                                {t('groupSessions.activities.quiz.correct')}
                                            </label>
                                            <input
                                                value={option.text}
                                                onChange={(event) => onOptionChange(questionIndex, optionIndex, 'text', event.target.value)}
                                                placeholder={t('groupSessions.activities.quiz.optionPlaceholder', {
                                                    number: optionIndex + 1,
                                                })}
                                                className="dashboard-field min-w-[220px] flex-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => onRemoveOption(questionIndex, optionIndex)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                {t('groupSessions.activities.actions.delete')}
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
                                    {t('groupSessions.activities.actions.addOption')}
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
    onLoadResponses,
    onReviewSubmission,
    responsesByActivity,
    savedAt,
    creating,
    savingActivityId,
    deletingActivityId,
    loadingResponsesId,
    reviewingSubmissionId,
    activityResponseFilter,
    selectedSession,
}) => {
    const { i18n, t } = useTranslation();
    const [isCreating, setIsCreating] = useState(false);
    const [createDraft, setCreateDraft] = useState(createEmptyActivity());
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState(null);
    const [expandedResponsesId, setExpandedResponsesId] = useState(null);
    const [reviewDrafts, setReviewDrafts] = useState({});
    const [responseFilters, setResponseFilters] = useState({});
    const [reviewEditingIds, setReviewEditingIds] = useState({});
    const [aiDrafts, setAiDrafts] = useState({});
    const [aiDraftingId, setAiDraftingId] = useState(null);
    const [aiDraftErrors, setAiDraftErrors] = useState({});
    const [aiFeedbackDraftEnabled, setAiFeedbackDraftEnabled] = useState(false);
    const [aiSessionQuizDraftEnabled, setAiSessionQuizDraftEnabled] = useState(false);
    const [aiQuizDraft, setAiQuizDraft] = useState(null);
    const [aiQuizDraftingTarget, setAiQuizDraftingTarget] = useState('');
    const [aiQuizDraftError, setAiQuizDraftError] = useState('');

    useEffect(() => {
        if (editingId && !activities.some((activity) => String(activity.id) === String(editingId))) {
            setEditingId(null);
            setEditDraft(null);
        }
    }, [activities, editingId]);

    useEffect(() => {
        const courseId = selectedSession?.courseId;
        if (!selectedSession) {
            setAiFeedbackDraftEnabled(false);
            setAiSessionQuizDraftEnabled(false);
            return;
        }
        let cancelled = false;
        getAiLmsCapabilities(courseId)
            .then((capabilities) => {
                if (!cancelled) {
                    setAiFeedbackDraftEnabled(Boolean(capabilities?.feedbackDraft?.enabled));
                    setAiSessionQuizDraftEnabled(Boolean(capabilities?.lessonQuizDraft?.enabled));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAiFeedbackDraftEnabled(false);
                    setAiSessionQuizDraftEnabled(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [selectedSession]);

    useEffect(() => {
        setAiDrafts({});
        setAiDraftingId(null);
        setAiDraftErrors({});
        setAiQuizDraft(null);
        setAiQuizDraftingTarget('');
        setAiQuizDraftError('');
    }, [selectedSession?.id]);

    useEffect(() => {
        if (!expandedResponsesId) return;
        if (!activityResponseFilter || activityResponseFilter === 'all') return;
        setResponseFilters((prev) => ({
            ...prev,
            [expandedResponsesId]: activityResponseFilter,
        }));
    }, [activityResponseFilter, expandedResponsesId]);

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
                      payload: INTERACTIVE_TYPES.has(value)
                          ? structuredClone(DEFAULT_PAYLOAD[value])
                          : null,
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

    const quizDraftToActivity = (output, current) => {
        const questions = (output?.questions || [])
            .map((question) => {
                const options = (question.options || [])
                    .filter((option) => option?.text?.trim())
                    .map((option) => ({
                        text: option.text,
                        isCorrect: Boolean(option.isCorrect),
                    }));
                if (!options.some((option) => option.isCorrect) && options.length > 0) {
                    options[0].isCorrect = true;
                }
                return {
                    prompt: question.prompt || '',
                    questionMode: question.questionMode || 'single_choice',
                    options,
                };
            })
            .filter((question) => question.prompt.trim() && question.options.length >= 2);

        return {
            ...current,
            title: output?.title || current.title,
            description: output?.description || current.description,
            type: 'quiz',
            questions: questions.length ? questions : current.questions,
        };
    };

    const requestAiQuizDraft = async (target, brief = {}) => {
        const sessionId = selectedSession?.id;
        if (!sessionId) return;
        const current = target === 'edit' ? editDraft : createDraft;
        setAiQuizDraftingTarget(target);
        setAiQuizDraftError('');
        try {
            const draft = await generateAiSessionQuizDraft(sessionId, {
                language: i18n.language || 'ky',
                topic: brief.topic?.trim() || current?.title || selectedSession?.title || selectedSession?.sessionTitle || undefined,
                questionCount: Math.min(20, Math.max(1, Number(brief.questionCount) || current?.questions?.length || 3)),
                difficulty: brief.difficulty || undefined,
                questionMode: brief.questionMode === 'mixed' ? undefined : brief.questionMode,
                includeExplanations: Boolean(brief.includeExplanations),
            });
            setAiQuizDraft({ target, generationId: draft.generationId, output: draft.output || {} });
        } catch (error) {
            const parsed = parseApiError(error, t('ai.quizDraftFailed'));
            setAiQuizDraftError(parsed.requestId ? t('ai.requestId', { requestId: parsed.requestId }) : parsed.message);
        } finally {
            setAiQuizDraftingTarget('');
        }
    };

    const applyAiQuizDraft = async (target) => {
        if (!aiQuizDraft || aiQuizDraft.target !== target) return;
        const setter = target === 'edit' ? setEditDraft : setCreateDraft;
        try {
            await acceptAiGeneration(aiQuizDraft.generationId);
            setter((current) => quizDraftToActivity(aiQuizDraft.output, current || createEmptyActivity('quiz')));
            setAiQuizDraft(null);
            setAiQuizDraftError('');
        } catch {
            setAiQuizDraftError(t('ai.feedbackDraftActionFailed'));
        }
    };

    const cancelAiQuizDraft = async () => {
        if (!aiQuizDraft) return;
        try {
            await rejectAiGeneration(aiQuizDraft.generationId);
            setAiQuizDraft(null);
            setAiQuizDraftError('');
        } catch {
            setAiQuizDraftError(t('ai.feedbackDraftActionFailed'));
        }
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

    const toggleResponses = async (activityId) => {
        if (String(expandedResponsesId) === String(activityId)) {
            setExpandedResponsesId(null);
            return;
        }

        setExpandedResponsesId(String(activityId));
        setResponseFilters((prev) => ({
            ...prev,
            [activityId]: prev[activityId] || activityResponseFilter || 'all',
        }));
        if (!responsesByActivity?.[activityId]) {
            await onLoadResponses(activityId);
        }
    };

    const saveReviewDraft = async (activityId, rowId, draft) => {
        const ok = await onReviewSubmission(activityId, rowId, draft.status, draft.reviewComment, draft.score);
        if (ok !== false) {
            setReviewEditingIds((prev) => ({ ...prev, [rowId]: false }));
        }
    };

    const requestAiFeedbackDraft = async (rowId) => {
        setAiDraftingId(String(rowId));
        setAiDraftErrors((prev) => {
            const next = { ...prev };
            delete next[rowId];
            return next;
        });
        try {
            const draft = await generateAiFeedbackDraft(rowId, {
                submissionType: 'session_activity',
                language: i18n.language || 'ky',
                tone: 'encouraging',
                includeScoreSuggestion: true,
            });
            setAiDrafts((prev) => ({
                ...prev,
                [rowId]: {
                    generationId: draft.generationId,
                    output: draft.output || {},
                },
            }));
        } catch (error) {
            const parsed = parseApiError(error, t('ai.feedbackDraftFailed'));
            setAiDraftErrors((prev) => ({
                ...prev,
                [rowId]: parsed.requestId ? t('ai.requestId', { requestId: parsed.requestId }) : parsed.message,
            }));
        } finally {
            setAiDraftingId(null);
        }
    };

    const applyAiFeedbackDraft = async (rowId, draft) => {
        const aiDraft = aiDrafts[rowId];
        if (!aiDraft) return;
        try {
            await acceptAiGeneration(aiDraft.generationId);
            setReviewDrafts((prev) => ({
                ...prev,
                [rowId]: {
                    ...draft,
                    reviewComment: aiDraft.output?.feedback || draft.reviewComment || '',
                    score:
                        aiDraft.output?.suggestedScore === undefined || aiDraft.output?.suggestedScore === null
                            ? draft.score
                            : String(aiDraft.output.suggestedScore),
                },
            }));
            setAiDrafts((prev) => {
                const next = { ...prev };
                delete next[rowId];
                return next;
            });
            setAiDraftErrors((prev) => {
                const next = { ...prev };
                delete next[rowId];
                return next;
            });
        } catch {
            setAiDraftErrors((prev) => ({
                ...prev,
                [rowId]: t('ai.feedbackDraftActionFailed'),
            }));
        }
    };

    const cancelAiDraft = async (rowId) => {
        const aiDraft = aiDrafts[rowId];
        if (!aiDraft) return;
        try {
            await rejectAiGeneration(aiDraft.generationId);
            setAiDrafts((prev) => {
                const next = { ...prev };
                delete next[rowId];
                return next;
            });
            setAiDraftErrors((prev) => {
                const next = { ...prev };
                delete next[rowId];
                return next;
            });
        } catch {
            setAiDraftErrors((prev) => ({
                ...prev,
                [rowId]: t('ai.feedbackDraftActionFailed'),
            }));
        }
    };

    return (
        <div className="space-y-4">
            <DashboardInsetPanel
                title={t('groupSessions.activities.title')}
                description={t('groupSessions.activities.description')}
            >
                {activityResponseFilter && activityResponseFilter !== 'all' ? (
                    <div className="mt-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                            {t('groupSessions.activities.insightFocus')}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
                            {activityResponseFilterMeta[activityResponseFilter]?.labelKey
                                ? t(activityResponseFilterMeta[activityResponseFilter].labelKey)
                                : t('groupSessions.activities.focusFallback')}
                        </div>
                        <div className="mt-1 text-xs text-amber-700/90 dark:text-amber-200/90">
                            {activityResponseFilterMeta[activityResponseFilter]?.helperKey
                                ? t(activityResponseFilterMeta[activityResponseFilter].helperKey)
                                : t('groupSessions.activities.focusHelpFallback')}
                        </div>
                    </div>
                ) : null}
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.metrics.total')}</div>
                        <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{activityStats.total}</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">{t('groupSessions.activities.metrics.visible')}</div>
                        <div className="mt-2 text-2xl font-semibold text-amber-800 dark:text-amber-100">{activityStats.visible}</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-500/30 dark:bg-sky-500/10">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">{t('groupSessions.activities.metrics.hidden')}</div>
                        <div className="mt-2 text-2xl font-semibold text-sky-800 dark:text-sky-100">{activityStats.hidden}</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.metrics.quiz')}</div>
                        <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{activityStats.quiz}</div>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                    <div className="text-sm text-edubot-muted dark:text-slate-300">
                        {savedAt
                            ? t('groupSessions.activities.lastUpdated', {
                                date: formatSavedAt(savedAt, i18n.language),
                            })
                            : t('groupSessions.activities.empty.noActivitiesYet')}
                    </div>
                    {canEdit ? (
                        <button
                            type="button"
                            onClick={beginCreate}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                        >
                            <FiPlus className="h-4 w-4" />
                            {t('groupSessions.activities.actions.addActivity')}
                        </button>
                    ) : null}
                </div>

                {isCreating ? (
                    <div className="mt-4">
                        <ActivityEditor
                            activity={createDraft}
                            label={t('groupSessions.activities.editor.newActivity')}
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
                            saveLabel={t('groupSessions.activities.actions.saveActivity')}
                            aiQuizDraftEnabled={aiSessionQuizDraftEnabled}
                            aiQuizDraft={aiQuizDraft?.target === 'create' ? aiQuizDraft.output : null}
                            aiQuizDrafting={aiQuizDraftingTarget === 'create'}
                            aiQuizDraftError={aiQuizDraft?.target === 'create' ? aiQuizDraftError : ''}
                            onRequestAiQuizDraft={(brief) => requestAiQuizDraft('create', brief)}
                            onUseAiQuizDraft={() => applyAiQuizDraft('create')}
                            onCancelAiQuizDraft={cancelAiQuizDraft}
                        />
                    </div>
                ) : null}

                {activities.length ? (
                    <div className="mt-4 space-y-4">
                        {activities.map((activity, index) => {
                            const meta = typeMeta[activity.type] || typeMeta.discussion;
                            const tone = typeTone[activity.type] || typeTone.discussion;
                            const StatusIcon = meta.icon;
                            const isEditing = String(editingId) === String(activity.id);

                            if (isEditing && editDraft) {
                                return (
                                    <ActivityEditor
                                        key={`edit-${activity.id}`}
                                        activity={editDraft}
                                        label={t('groupSessions.activities.editor.activityNumber', { number: index + 1 })}
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
                                        saveLabel={t('groupSessions.activities.actions.saveChanges')}
                                        aiQuizDraftEnabled={aiSessionQuizDraftEnabled}
                                        aiQuizDraft={aiQuizDraft?.target === 'edit' ? aiQuizDraft.output : null}
                                        aiQuizDrafting={aiQuizDraftingTarget === 'edit'}
                                        aiQuizDraftError={aiQuizDraft?.target === 'edit' ? aiQuizDraftError : ''}
                                        onRequestAiQuizDraft={(brief) => requestAiQuizDraft('edit', brief)}
                                        onUseAiQuizDraft={() => applyAiQuizDraft('edit')}
                                        onCancelAiQuizDraft={cancelAiQuizDraft}
                                    />
                                );
                            }

                            return (
                                <div
                                    key={`activity-${activity.id || index}`}
                                    className={`rounded-[1.5rem] border p-4 dark:bg-slate-950 ${tone.panel}`}
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
                                                onClick={() => toggleResponses(activity.id)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edubot-line bg-white px-4 py-2.5 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                            >
                                                <FiEye className="h-4 w-4" />
                                                {t('groupSessions.activities.actions.responses')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => beginEdit(activity)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edubot-line bg-white px-4 py-2.5 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                            >
                                                <FiEdit3 className="h-4 w-4" />
                                                {t('groupSessions.activities.actions.edit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteActivity(activity.id)}
                                                disabled={String(deletingActivityId) === String(activity.id)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-500/10"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                {String(deletingActivityId) === String(activity.id)
                                                    ? t('groupSessions.activities.actions.deleting')
                                                    : t('groupSessions.activities.actions.delete')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
                                            {t(meta.labelKey)}
                                        </span>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta[activity.status]?.className || statusMeta.planned.className}`}>
                                            {t(
                                                (
                                                    ACTIVITY_STATUS_OPTIONS.find((option) => option.value === activity.status) ||
                                                    ACTIVITY_STATUS_OPTIONS[0]
                                                ).labelKey
                                            )}
                                        </span>
                                        <span className="rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                            {t(statusMeta[activity.status]?.helperKey || statusMeta.planned.helperKey)}
                                        </span>
                                        {activity.type === 'quiz' ? (
                                            <span className="rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                {t('groupSessions.activities.quiz.questionCount', {
                                                    count: (activity.questions || []).length,
                                                })}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                        {t(tone.helperKey)}
                                    </div>

                                    {activity.type === 'quiz' ? (
                                        <div className="mt-4 rounded-[1.25rem] border border-edubot-line/80 bg-edubot-surface/60 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {t('groupSessions.activities.quiz.summaryTitle')}
                                                    </div>
                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                        {t('groupSessions.activities.quiz.summaryDescription')}
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center gap-2 rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                    <FiEye className="h-3.5 w-3.5" />
                                                    {t('groupSessions.activities.quiz.viewMode')}
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}

                                    {String(expandedResponsesId) === String(activity.id) ? (
                                        <div className="mt-4 rounded-[1.25rem] border border-edubot-line/80 bg-edubot-surface/60 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                                            {String(loadingResponsesId) === String(activity.id) && !responsesByActivity?.[activity.id] ? (
                                                <div className="text-sm text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.loading')}</div>
                                            ) : !responsesByActivity?.[activity.id]?.items?.length ? (
                                                <div className="text-sm text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.empty.noResponses')}</div>
                                            ) : responsesByActivity?.[activity.id]?.mode === 'quiz' ? (
                                                (() => {
                                                    const activeFilter = responseFilters[activity.id] || 'all';
                                                    const rows = responsesByActivity[activity.id].items.filter((row) => {
                                                        if (activeFilter === 'passed') return row.passed;
                                                        if (activeFilter === 'failed') return !row.passed;
                                                        return true;
                                                    });
                                                    return (
                                                        <div className="space-y-3">
                                                            <div className="grid gap-3 md:grid-cols-3">
                                                                <div className="rounded-2xl border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                                                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.responses.student')}</div>
                                                                    <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{rows.length}</div>
                                                                </div>
                                                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{t('groupSessions.activities.responses.passed')}</div>
                                                                    <div className="mt-2 text-2xl font-semibold text-emerald-800 dark:text-emerald-100">{rows.filter((row) => row.passed).length}</div>
                                                                </div>
                                                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                                                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">{t('groupSessions.activities.responses.failed')}</div>
                                                                    <div className="mt-2 text-2xl font-semibold text-amber-800 dark:text-amber-100">{rows.filter((row) => !row.passed).length}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                                    {t('groupSessions.activities.responses.studentsShown', { count: rows.length })}
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {[
                                                                        ['all', t('groupSessions.activities.filters.all')],
                                                                        ['passed', t('groupSessions.activities.filters.passed')],
                                                                        ['failed', t('groupSessions.activities.filters.failed')],
                                                                    ].map(([value, label]) => (
                                                                        <button
                                                                            key={`${activity.id}-quiz-filter-${value}`}
                                                                            type="button"
                                                                            onClick={() => setResponseFilters((prev) => ({ ...prev, [activity.id]: value }))}
                                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                                                activeFilter === value
                                                                                    ? 'border-edubot-orange/40 bg-edubot-orange/10 text-edubot-orange'
                                                                                    : 'border-edubot-line/80 bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                                                                            }`}
                                                                        >
                                                                            {label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="overflow-hidden rounded-2xl border border-edubot-line/80 bg-white dark:border-slate-700 dark:bg-slate-950">
                                                                <div className="grid grid-cols-[minmax(0,1.5fr),120px,120px,120px] gap-3 border-b border-edubot-line/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                                                    <span>{t('groupSessions.activities.responses.student')}</span>
                                                                    <span>{t('groupSessions.activities.responses.attempt')}</span>
                                                                    <span>{t('groupSessions.activities.responses.answer')}</span>
                                                                    <span>{t('groupSessions.activities.responses.result')}</span>
                                                                </div>
                                                                <div className="divide-y divide-edubot-line/80 dark:divide-slate-700">
                                                                    {rows.map((row) => (
                                                                        <div key={`attempt-${row.studentId}`} className="grid grid-cols-[minmax(0,1.5fr),120px,120px,120px] gap-3 px-4 py-3 text-sm">
                                                                            <div className="min-w-0">
                                                                                <div className="font-semibold text-edubot-ink dark:text-white">{row.studentName}</div>
                                                                            </div>
                                                                            <div className="text-edubot-muted dark:text-slate-300">{row.attemptsCount}</div>
                                                                            <div className="text-edubot-muted dark:text-slate-300">{row.answeredCount}</div>
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <span className="rounded-full border border-edubot-line/80 bg-white px-2.5 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                                    {row.score}%
                                                                                </span>
                                                                                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${row.passed ? statusMeta.done.className : statusMeta.active.className}`}>
                                                                                    {row.passed
                                                                                        ? t('groupSessions.activities.responses.passedShort')
                                                                                        : t('groupSessions.activities.responses.failedShort')}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                (() => {
                                                    const activeFilter = responseFilters[activity.id] || 'all';
                                                    const rows = responsesByActivity[activity.id].items.filter((row) => {
                                                        if (activeFilter === 'pending') return row.status === 'submitted';
                                                        if (activeFilter === 'reviewed') return row.status !== 'submitted';
                                                        if (activeFilter === 'revision') return row.status === 'needs_revision' || row.status === 'rejected';
                                                        return true;
                                                    });
                                                    return (
                                                <div className="space-y-3">
                                                    <div className="grid gap-3 md:grid-cols-4">
                                                        <div className="rounded-2xl border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">{t('groupSessions.activities.responses.response')}</div>
                                                            <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{rows.length}</div>
                                                        </div>
                                                        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-500/30 dark:bg-sky-500/10">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">{t('groupSessions.activities.filters.pending')}</div>
                                                            <div className="mt-2 text-2xl font-semibold text-sky-800 dark:text-sky-100">{rows.filter((row) => row.status === 'submitted').length}</div>
                                                        </div>
                                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{t('groupSessions.activities.submissionStatus.approved')}</div>
                                                            <div className="mt-2 text-2xl font-semibold text-emerald-800 dark:text-emerald-100">{rows.filter((row) => row.status === 'approved').length}</div>
                                                        </div>
                                                        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-500/30 dark:bg-orange-500/10">
                                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">{t('groupSessions.activities.filters.revision')}</div>
                                                            <div className="mt-2 text-2xl font-semibold text-orange-800 dark:text-orange-100">{rows.filter((row) => row.status === 'needs_revision' || row.status === 'rejected').length}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                            {t('groupSessions.activities.responses.responsesShown', { count: rows.length })}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {[
                                                                ['all', t('groupSessions.activities.filters.all')],
                                                                ['pending', t('groupSessions.activities.filters.pending')],
                                                                ['reviewed', t('groupSessions.activities.filters.reviewed')],
                                                                ['revision', t('groupSessions.activities.filters.revision')],
                                                            ].map(([value, label]) => (
                                                                <button
                                                                    key={`${activity.id}-submission-filter-${value}`}
                                                                    type="button"
                                                                    onClick={() => setResponseFilters((prev) => ({ ...prev, [activity.id]: value }))}
                                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                                        activeFilter === value
                                                                            ? 'border-edubot-orange/40 bg-edubot-orange/10 text-edubot-orange'
                                                                            : 'border-edubot-line/80 bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                                                                    }`}
                                                                >
                                                                    {label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {rows.map((row) => {
                                                        const draft = reviewDrafts[row.id] || {
                                                            status: row.status,
                                                            reviewComment: row.reviewComment || '',
                                                            score: row.score ?? '',
                                                        };
                                                        const historyThread = Array.isArray(row.historyMessages) ? row.historyMessages : [];
                                                        const hasSavedReview =
                                                            row.status !== 'submitted' ||
                                                            row.score !== null ||
                                                            Boolean(row.reviewComment) ||
                                                            Boolean(row.reviewedAt);
                                                        const isEditingReview = Boolean(reviewEditingIds[row.id]) || !hasSavedReview;
                                                        const aiDraft = aiDrafts[row.id];
                                                        return (
                                                            <div key={`submission-${row.id}`} className="rounded-2xl border border-edubot-line/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <div>
                                                                        <div className="text-sm font-semibold text-edubot-ink dark:text-white">{row.studentName}</div>
                                                                        <div className="text-xs text-edubot-muted dark:text-slate-400">{row.updatedAt ? formatSavedAt(row.updatedAt, i18n.language) : ''}</div>
                                                                    </div>
                                                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta[row.status]?.className || statusMeta.planned.className}`}>
                                                                        {submissionStatusLabelKey[row.status]
                                                                            ? t(submissionStatusLabelKey[row.status])
                                                                            : row.status}
                                                                    </span>
                                                                </div>
                                                                {hasSavedReview && !isEditingReview ? (
                                                                    <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/70">
                                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                                            <span className="font-semibold text-edubot-ink dark:text-white">
                                                                                {t('groupSessions.activities.review.currentResult')}
                                                                            </span>
                                                                            {row.score !== null && row.score !== undefined ? (
                                                                                <span className="font-semibold text-edubot-ink dark:text-white">
                                                                                    {t('groupSessions.activities.review.score', { score: row.score })}
                                                                                </span>
                                                                            ) : null}
                                                                            {row.reviewedAt ? (
                                                                                <span className="text-edubot-muted dark:text-slate-400">
                                                                                    {t('groupSessions.activities.review.reviewedAt', {
                                                                                        date: formatSavedAt(row.reviewedAt, i18n.language),
                                                                                    })}
                                                                                </span>
                                                                            ) : null}
                                                                        </div>
                                                                        {row.reviewComment ? (
                                                                            <p className="mt-2 leading-6 text-edubot-ink dark:text-slate-200">
                                                                                {row.reviewComment}
                                                                            </p>
                                                                        ) : null}
                                                                        <div className="mt-3">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setReviewEditingIds((prev) => ({ ...prev, [row.id]: true }))}
                                                                                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-edubot-line bg-white px-4 py-2 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                                            >
                                                                                <FiEdit3 className="h-4 w-4" />
                                                                                {t('groupSessions.activities.review.editReview')}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                                {row.answerText ? (
                                                                    <p className="mt-3 text-sm leading-6 text-edubot-muted dark:text-slate-300">{row.answerText}</p>
                                                                ) : null}
                                                                {row.attachmentUrl ? (
                                                                    <a href={row.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 text-sm font-medium text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200">
                                                                        <FiFileText className="h-4 w-4" />
                                                                        {t('groupSessions.activities.actions.openAttachment')}
                                                                    </a>
                                                                ) : null}
                                                                {historyThread.length ? (
                                                                    <div className="mt-4 space-y-3 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                                                                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted dark:text-slate-400">
                                                                            {t('groupSessions.activities.review.previousThread')}
                                                                        </div>
                                                                        {historyThread.map((message) => {
                                                                            const isInstructor = message.authorRole !== 'student';
                                                                            return (
                                                                                <div
                                                                                    key={`submission-thread-${row.id}-${message.id}`}
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
                                                                                                {formatSavedAt(message.createdAt, i18n.language)}
                                                                                            </span>
                                                                                        ) : null}
                                                                                        {message.status && message.authorRole !== 'student' ? (
                                                                                            <span className={`rounded-full border px-2.5 py-1 font-semibold ${statusMeta[message.status]?.className || statusMeta.planned.className}`}>
                                                                                                {submissionStatusLabelKey[message.status]
                                                                                                    ? t(submissionStatusLabelKey[message.status])
                                                                                                    : message.status}
                                                                                            </span>
                                                                                        ) : null}
                                                                                        {message.score !== null && message.score !== undefined ? (
                                                                                            <span className="font-semibold text-edubot-ink dark:text-white">
                                                                                                {t('groupSessions.activities.review.score', { score: message.score })}
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                    {message.body ? (
                                                                                        <p className="mt-2 leading-6 text-edubot-ink dark:text-slate-200">
                                                                                            {message.body}
                                                                                        </p>
                                                                                    ) : null}
                                                                                    {message.attachmentUrl ? (
                                                                                        <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-edubot-line px-3 py-2 text-sm font-medium text-edubot-ink transition hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-200">
                                                                                            <FiFileText className="h-4 w-4" />
                                                                                            {t('groupSessions.activities.actions.openAttachment')}
                                                                                        </a>
                                                                                    ) : null}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : null}
                                                                {isEditingReview ? (
                                                                    <div className="mt-4 space-y-3">
                                                                        {aiFeedbackDraftEnabled ? (
                                                                        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => requestAiFeedbackDraft(row.id)}
                                                                                    disabled={String(aiDraftingId) === String(row.id) || String(reviewingSubmissionId) === String(row.id)}
                                                                                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-edubot-line bg-white px-4 py-2 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                                                >
                                                                                    <FiZap className="h-4 w-4" />
                                                                                    {String(aiDraftingId) === String(row.id) ? t('ai.generating') : t('ai.suggestFeedback')}
                                                                                </button>
                                                                                {aiDraft ? (
                                                                                    <>
                                                                                        <button type="button" onClick={() => applyAiFeedbackDraft(row.id, draft)} className="inline-flex min-h-10 items-center rounded-full border border-edubot-line bg-white px-4 py-2 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                                                                                            {t('ai.useDraft')}
                                                                                        </button>
                                                                                        <button type="button" onClick={() => cancelAiDraft(row.id)} className="inline-flex min-h-10 items-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 dark:border-red-500/30 dark:bg-slate-950 dark:text-red-300">
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
                                                                                        onChange={(event) => setAiDrafts((prev) => ({
                                                                                            ...prev,
                                                                                            [row.id]: {
                                                                                                ...prev[row.id],
                                                                                                output: {
                                                                                                    ...(prev[row.id]?.output || {}),
                                                                                                    feedback: event.target.value,
                                                                                                },
                                                                                            },
                                                                                        }))}
                                                                                        rows={3}
                                                                                        className="dashboard-field"
                                                                                        aria-label={t('ai.feedbackDraft')}
                                                                                    />
                                                                                    {aiDraft.output?.nextStep ? (
                                                                                        <p className="text-xs leading-5 text-edubot-muted dark:text-slate-300">{aiDraft.output.nextStep}</p>
                                                                                    ) : null}
                                                                                </div>
                                                                            ) : null}
                                                                            {aiDraftErrors[row.id] ? <p className="mt-2 text-xs text-red-600 dark:text-red-300">{aiDraftErrors[row.id]}</p> : null}
                                                                        </div>
                                                                        ) : null}
                                                                        <div className="grid gap-3 lg:grid-cols-[180px,120px,minmax(0,1fr),auto]">
                                                                            <select
                                                                                value={draft.status}
                                                                                onChange={(event) => setReviewDrafts((prev) => ({ ...prev, [row.id]: { ...draft, status: event.target.value } }))}
                                                                                className="dashboard-field dashboard-select"
                                                                            >
                                                                                <option value="submitted">{t('groupSessions.activities.submissionStatus.submitted')}</option>
                                                                                <option value="approved">{t('groupSessions.activities.review.approve')}</option>
                                                                                <option value="needs_revision">{t('groupSessions.activities.review.requestRevision')}</option>
                                                                                <option value="rejected">{t('groupSessions.activities.review.reject')}</option>
                                                                            </select>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max="1000"
                                                                                value={draft.score}
                                                                                onChange={(event) => setReviewDrafts((prev) => ({ ...prev, [row.id]: { ...draft, score: event.target.value } }))}
                                                                                placeholder={t('groupSessions.activities.review.scorePlaceholder')}
                                                                                className="dashboard-field"
                                                                            />
                                                                            <input
                                                                                value={draft.reviewComment}
                                                                                onChange={(event) => setReviewDrafts((prev) => ({ ...prev, [row.id]: { ...draft, reviewComment: event.target.value } }))}
                                                                                placeholder={t('groupSessions.activities.review.commentPlaceholder')}
                                                                                className="dashboard-field"
                                                                            />
                                                                            <div className="flex items-center gap-2">
                                                                                {hasSavedReview ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setReviewEditingIds((prev) => ({ ...prev, [row.id]: false }))}
                                                                                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-edubot-line bg-white px-4 py-2.5 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                                                    >
                                                                                        {t('groupSessions.activities.actions.collapse')}
                                                                                    </button>
                                                                                ) : null}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => saveReviewDraft(activity.id, row.id, draft)}
                                                                                    disabled={String(reviewingSubmissionId) === String(row.id)}
                                                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-edubot-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
                                                                                >
                                                                                    {String(reviewingSubmissionId) === String(row.id)
                                                                                        ? t('groupSessions.activities.actions.saving')
                                                                                        : t('groupSessions.activities.actions.save')}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                                {isEditingReview ? (
                                                                    <div className="mt-2 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                                                        {t('groupSessions.activities.review.requireFeedback')}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                    );
                                                })()
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4 rounded-[1.25rem] border border-dashed border-edubot-line/80 bg-edubot-surface/60 p-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                        {t('groupSessions.activities.empty.noActivities')}
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
    onLoadResponses: PropTypes.func.isRequired,
    onReviewSubmission: PropTypes.func.isRequired,
    onUpdateActivity: PropTypes.func.isRequired,
    loadingResponsesId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    responsesByActivity: PropTypes.object,
    reviewingSubmissionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    savedAt: PropTypes.string,
    savingActivityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    selectedSession: PropTypes.shape({
        courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    activityResponseFilter: PropTypes.string,
};

SessionActivitiesTab.defaultProps = {
    activityResponseFilter: 'all',
    deletingActivityId: null,
    loadingResponsesId: null,
    responsesByActivity: {},
    reviewingSubmissionId: null,
    savedAt: '',
    savingActivityId: null,
    selectedSession: null,
};

export default SessionActivitiesTab;

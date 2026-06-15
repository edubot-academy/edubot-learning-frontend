import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiTrash2, FiChevronUp, FiChevronDown, FiPlus } from 'react-icons/fi';
import { createEmptyQuestion, createEmptyQuiz, cloneQuiz, parseImportedQuiz } from '@utils/quizUtils';
import AiGenerationDrawer from '../../aiLms/components/AiGenerationDrawer';
import QuizRichInput from './QuizRichInput';
import InlineRichText from '@shared/ui/InlineRichText';

const LessonQuizEditor = ({
    quiz,
    onChange,
    disabled = false,
    aiDraftEnabled = false,
    aiDraft = null,
    aiDrafting = false,
    aiDraftError = '',
    onRequestAiDraft,
    onUseAiDraft,
    onCancelAiDraft,
}) => {
    const { t } = useTranslation();
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
    const [fillMode, setFillMode] = useState('manual');
    const [pasteText, setPasteText] = useState('');
    const [pasteError, setPasteError] = useState('');
    const safeQuiz = quiz ?? createEmptyQuiz();

    const updateQuiz = (updater) => {
        const cloned = cloneQuiz(safeQuiz);
        updater(cloned);
        onChange?.(cloned);
    };

    // ── Settings ──────────────────────────────────────────────────────────────

    const handlePassingScoreChange = (value) => {
        const numeric = Number(value);
        updateQuiz((q) => {
            q.passingScore = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0;
        });
    };

    const handleTimeLimitChange = (minutesValue) => {
        updateQuiz((q) => {
            const numeric = Number(minutesValue);
            q.timeLimitSeconds = (Number.isFinite(numeric) && numeric > 0)
                ? Math.round(numeric * 60)
                : null;
        });
    };

    // ── Question mutations ─────────────────────────────────────────────────────

    const handleQuestionPromptChange = (index, value) => {
        updateQuiz((q) => { q.questions[index].prompt = value; });
    };

    const handleExplanationChange = (index, value) => {
        updateQuiz((q) => { q.questions[index].explanation = value; });
    };

    const addQuestion = () => {
        updateQuiz((q) => { q.questions.push(createEmptyQuestion()); });
    };

    const removeQuestion = (index) => {
        updateQuiz((q) => {
            if (q.questions.length <= 1) return;
            q.questions.splice(index, 1);
        });
    };

    const moveQuestion = (index, direction) => {
        updateQuiz((q) => {
            const target = index + direction;
            if (target < 0 || target >= q.questions.length) return;
            [q.questions[index], q.questions[target]] = [q.questions[target], q.questions[index]];
        });
    };

    // ── Option mutations ───────────────────────────────────────────────────────

    const handleOptionTextChange = (questionIdx, optionIdx, value) => {
        updateQuiz((q) => {
            q.questions[questionIdx].options[optionIdx].text = value;
        });
    };

    const handleCorrectOptionChange = (questionIdx, optionIdx) => {
        updateQuiz((q) => {
            q.questions[questionIdx].options = q.questions[questionIdx].options.map((opt, idx) => ({
                ...opt,
                isCorrect: idx === optionIdx,
            }));
        });
    };

    const addOption = (questionIdx) => {
        updateQuiz((q) => {
            if (q.questions[questionIdx].options.length >= 6) return;
            q.questions[questionIdx].options.push({ text: '', isCorrect: false });
        });
    };

    const removeOption = (questionIdx, optionIdx) => {
        updateQuiz((q) => {
            if (q.questions[questionIdx].options.length <= 2) return;
            q.questions[questionIdx].options.splice(optionIdx, 1);
        });
    };

    // ── Paste import ───────────────────────────────────────────────────────────

    const handlePasteFill = () => {
        setPasteError('');
        const nextQuiz = parseImportedQuiz(pasteText.trim());
        if (!nextQuiz) {
            setPasteError(t('instructorDashboard.courseBuilder.quiz.paste.errorInvalidInput'));
            return;
        }
        onChange?.(nextQuiz);
        setPasteText('');
        toast.success(t('instructorDashboard.courseBuilder.quiz.paste.success'));
    };

    // ── Shared classes ─────────────────────────────────────────────────────────

    const inputClass =
        'w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-edubot-orange/40 focus:border-edubot-orange transition text-sm';

    return (
        <div className={`space-y-5 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>

            {/* ── Settings row ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t('instructorDashboard.courseBuilder.quiz.passingScore')}
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={safeQuiz.passingScore ?? 70}
                        onChange={(e) => handlePassingScoreChange(e.target.value)}
                        className={inputClass}
                        disabled={disabled}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t('instructorDashboard.courseBuilder.quiz.timeLimit')}
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={safeQuiz.timeLimitSeconds ? Math.round(safeQuiz.timeLimitSeconds / 60) : ''}
                        onChange={(e) => handleTimeLimitChange(e.target.value)}
                        className={inputClass}
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* ── Fill mode tabs ────────────────────────────────────────────── */}
            <section className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/70 dark:bg-amber-950/20">
                <div className="border-b border-amber-200 dark:border-amber-900/70 px-4 py-3 flex flex-wrap gap-2">
                    {['manual', 'paste'].map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => { setFillMode(mode); setPasteError(''); }}
                            disabled={disabled}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                fillMode === mode
                                    ? 'bg-amber-600 text-white'
                                    : 'text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40'
                            }`}
                        >
                            {t(`instructorDashboard.courseBuilder.quiz.fillMode.${mode}`)}
                        </button>
                    ))}
                </div>

                {fillMode === 'paste' && (
                    <div className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    {t('instructorDashboard.courseBuilder.quiz.paste.title')}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {t('instructorDashboard.courseBuilder.quiz.paste.help')}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-200"
                                onClick={handlePasteFill}
                                disabled={disabled || !pasteText.trim()}
                            >
                                {t('instructorDashboard.courseBuilder.quiz.paste.fill')}
                            </button>
                        </div>
                        <textarea
                            className="mt-3 min-h-36 w-full rounded-lg border border-amber-200 bg-white p-3 font-mono text-sm dark:border-amber-900 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                            value={pasteText}
                            onChange={(e) => { setPasteText(e.target.value); setPasteError(''); }}
                            placeholder={t('instructorDashboard.courseBuilder.quiz.paste.placeholder')}
                            disabled={disabled}
                        />
                        {pasteError ? (
                            <p className="mt-2 text-xs text-rose-600">{pasteError}</p>
                        ) : (
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                {t('instructorDashboard.courseBuilder.quiz.paste.supportedFormats')}
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* ── AI draft ──────────────────────────────────────────────────── */}
            {aiDraftEnabled && (
                <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-900 dark:bg-sky-950/30">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{t('ai.quizDraft')}</p>
                            <p className="text-slate-600 dark:text-slate-300">{t('ai.quizDraftHelp')}</p>
                        </div>
                        <button
                            type="button"
                            className="rounded border border-sky-300 bg-white px-3 py-1.5 text-sm font-medium text-sky-800 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-200"
                            onClick={() => setIsAiDrawerOpen(true)}
                            disabled={disabled}
                        >
                            {aiDraft ? t('ai.openPreview') : t('ai.openGenerator')}
                        </button>
                    </div>
                    <AiGenerationDrawer
                        isOpen={isAiDrawerOpen}
                        title={t('ai.quizDraft')}
                        description={t('ai.quizDraftHelp')}
                        onClose={() => setIsAiDrawerOpen(false)}
                        footer={(
                            <div className="flex flex-wrap justify-end gap-2">
                                {aiDraft ? (
                                    <>
                                        <button type="button" className="dashboard-button-secondary" onClick={onCancelAiDraft} disabled={disabled}>
                                            {t('ai.cancelDraft')}
                                        </button>
                                        <button type="button" className="dashboard-button-primary" onClick={onUseAiDraft} disabled={disabled}>
                                            {t('ai.useDraft')}
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" className="dashboard-button-primary disabled:opacity-60" onClick={onRequestAiDraft} disabled={disabled || aiDrafting}>
                                        {aiDrafting ? t('ai.generating') : t('ai.suggestQuiz')}
                                    </button>
                                )}
                            </div>
                        )}
                    >
                        <div className="space-y-4">
                            <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                                {['creates', 'applies', 'next'].map((key) => (
                                    <div key={key} className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                                        <span className="font-semibold text-slate-900 dark:text-white">{t(`ai.quizDraftFlow.${key}Label`)}</span>
                                        <span className="mt-1 block">{t(`ai.quizDraftFlow.${key}`)}</span>
                                    </div>
                                ))}
                            </div>
                            {aiDraft && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                    <p className="font-semibold text-slate-900 dark:text-white">{aiDraft.title}</p>
                                    {aiDraft.description && <p className="mt-1 text-slate-600 dark:text-slate-300">{aiDraft.description}</p>}
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        {t('ai.questionCount', { count: aiDraft.questions?.length ?? 0 })}
                                    </p>
                                    <div className="mt-3 space-y-3">
                                        {(aiDraft.questions || []).map((question, qi) => (
                                            <div key={`${question.prompt}-${qi}`} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3 dark:border-sky-900 dark:bg-sky-950/30">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{qi + 1}. {question.prompt}</p>
                                                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                                    {(question.options || []).map((opt, oi) => (
                                                        <li key={`${opt.text}-${oi}`} className={opt.isCorrect ? 'font-semibold text-emerald-700 dark:text-emerald-300' : ''}>
                                                            {opt.isCorrect ? `${t('ai.quizDraftCorrect')} ` : ''}{opt.text}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {aiDraftError && <p className="text-sm text-rose-600">{aiDraftError}</p>}
                        </div>
                    </AiGenerationDrawer>
                </section>
            )}

            {/* ── Questions ─────────────────────────────────────────────────── */}
            <div className="space-y-5">
                {safeQuiz.questions.map((question, qIdx) => (
                    <div
                        key={qIdx}
                        className="rounded-xl border border-edubot-teal/40 bg-white dark:bg-gray-800 shadow-sm"
                    >
                        {/* Question header */}
                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {t('instructorDashboard.courseBuilder.quiz.question', { number: qIdx + 1 })}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveQuestion(qIdx, -1)}
                                    disabled={disabled || qIdx === 0}
                                    className="h-7 w-7 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
                                    title="Move up"
                                >
                                    <FiChevronUp size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveQuestion(qIdx, 1)}
                                    disabled={disabled || qIdx === safeQuiz.questions.length - 1}
                                    className="h-7 w-7 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
                                    title="Move down"
                                >
                                    <FiChevronDown size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIdx)}
                                    disabled={disabled || safeQuiz.questions.length <= 1}
                                    className="h-7 w-7 rounded flex items-center justify-center text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                                    title={t('instructorDashboard.courseBuilder.actions.delete')}
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Question prompt */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    {t('instructorDashboard.courseBuilder.quiz.questionPlaceholder')}
                                </label>
                                <QuizRichInput
                                    value={question.prompt}
                                    onChange={(val) => handleQuestionPromptChange(qIdx, val)}
                                    placeholder={t('instructorDashboard.courseBuilder.quiz.questionPlaceholder')}
                                    disabled={disabled}
                                    className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-edubot-orange/40 focus-within:border-edubot-orange transition"
                                />
                                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                    {t('instructorDashboard.courseBuilder.quiz.richTextHint')}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                {question.options.map((option, oIdx) => (
                                    <div
                                        key={oIdx}
                                        className={`flex items-start gap-3 rounded-lg border p-2.5 transition ${
                                            option.isCorrect
                                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-200 dark:ring-emerald-800'
                                                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${qIdx}`}
                                            checked={option.isCorrect}
                                            onChange={() => handleCorrectOptionChange(qIdx, oIdx)}
                                            disabled={disabled}
                                            className="mt-2.5 accent-emerald-500 cursor-pointer"
                                        />
                                        <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                            <QuizRichInput
                                                value={option.text}
                                                onChange={(val) => handleOptionTextChange(qIdx, oIdx, val)}
                                                placeholder={t('instructorDashboard.courseBuilder.quiz.option', { number: oIdx + 1 })}
                                                disabled={disabled}
                                                className="text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeOption(qIdx, oIdx); }}
                                            disabled={disabled || question.options.length <= 2}
                                            className="mt-1.5 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-500 disabled:opacity-0 transition-colors"
                                            title={t('instructorDashboard.courseBuilder.actions.delete')}
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {question.options.length < 6 && (
                                <button
                                    type="button"
                                    onClick={() => addOption(qIdx)}
                                    disabled={disabled}
                                    className="flex items-center gap-1.5 text-sm text-edubot-orange hover:text-orange-600 transition-colors"
                                >
                                    <FiPlus size={14} />
                                    {t('instructorDashboard.courseBuilder.quiz.addOption')}
                                </button>
                            )}

                            {/* Explanation */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    {t('instructorDashboard.courseBuilder.quiz.explanation.label')}{' '}
                                    <span className="font-normal">{t('instructorDashboard.courseBuilder.quiz.explanation.hint')}</span>
                                </label>
                                <QuizRichInput
                                    value={question.explanation ?? ''}
                                    onChange={(val) => handleExplanationChange(qIdx, val)}
                                    placeholder={t('instructorDashboard.courseBuilder.quiz.explanation.placeholder')}
                                    disabled={disabled}
                                    className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-edubot-orange/40 focus-within:border-edubot-orange transition"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addQuestion}
                disabled={disabled}
                className="flex items-center gap-2 rounded-lg border border-dashed border-edubot-orange/50 px-4 py-2.5 text-sm font-medium text-edubot-orange hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors w-full justify-center"
            >
                <FiPlus size={15} />
                {t('instructorDashboard.courseBuilder.quiz.addQuestion')}
            </button>
        </div>
    );
};

export default LessonQuizEditor;

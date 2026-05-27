import InlineRichText from '@shared/ui/InlineRichText';
import { createEmptyQuestion, createEmptyQuiz, cloneQuiz } from '@utils/quizUtils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AiGenerationDrawer from '../../aiLms/components/AiGenerationDrawer';

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
    const safeQuiz = quiz ?? createEmptyQuiz();

    const updateQuiz = (updater) => {
        const cloned = cloneQuiz(safeQuiz);
        updater(cloned);
        onChange?.(cloned);
    };

    const appendFormattingToken = (value, type) => {
        if (type === 'bold') {
            return `${value || ''}${value ? ' ' : ''}**${t('instructorDashboard.courseBuilder.quiz.boldInsertSample')}**`;
        }

        return `${value || ''}${value ? ' ' : ''}\`${t('instructorDashboard.courseBuilder.quiz.codeInsertSample')}\``;
    };

    const handlePassingScoreChange = (value) => {
        const numeric = Number(value);
        updateQuiz((q) => {
            q.passingScore = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0;
        });
    };

    const handleTimeLimitChange = (minutesValue) => {
        updateQuiz((q) => {
            const numeric = Number(minutesValue);
            if (!Number.isFinite(numeric) || numeric <= 0) {
                q.timeLimitSeconds = null;
            } else {
                q.timeLimitSeconds = Math.round(numeric * 60);
            }
        });
    };

    const handleQuestionPromptChange = (index, value) => {
        updateQuiz((q) => {
            q.questions[index].prompt = value;
        });
    };

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

    const addQuestion = () => {
        updateQuiz((q) => {
            q.questions.push(createEmptyQuestion());
        });
    };

    const removeQuestion = (index) => {
        updateQuiz((q) => {
            if (q.questions.length <= 1) return;
            q.questions.splice(index, 1);
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

    const addPromptFormatting = (questionIdx, type) => {
        updateQuiz((q) => {
            q.questions[questionIdx].prompt = appendFormattingToken(
                q.questions[questionIdx].prompt,
                type
            );
        });
    };

    const addOptionFormatting = (questionIdx, optionIdx, type) => {
        updateQuiz((q) => {
            q.questions[questionIdx].options[optionIdx].text = appendFormattingToken(
                q.questions[questionIdx].options[optionIdx].text,
                type
            );
        });
    };

    return (
        <div className={`space-y-4 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">{t('instructorDashboard.courseBuilder.quiz.passingScore')}</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={safeQuiz.passingScore ?? 70}
                        onChange={(e) => handlePassingScoreChange(e.target.value)}
                        className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        value={
                            safeQuiz.timeLimitSeconds
                                ? Math.round(safeQuiz.timeLimitSeconds / 60)
                                : ''
                        }
                        onChange={(e) => handleTimeLimitChange(e.target.value)}
                        className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={disabled}
                    />
                </div>
            </div>

            <p className="text-xs text-slate-500">
                {t('instructorDashboard.courseBuilder.quiz.formattingHelp')}{' '}
                <code>**{t('instructorDashboard.courseBuilder.quiz.boldSample')}**</code>{' '}
                {t('instructorDashboard.courseBuilder.quiz.and')} <code>`{t('instructorDashboard.courseBuilder.quiz.codeSample')}`</code>.
            </p>

            {aiDraftEnabled ? (
                <section className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-900 dark:bg-sky-950/30">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {t('ai.quizDraft')}
                            </p>
                            <p className="text-slate-600 dark:text-slate-300">
                                {t('ai.quizDraftHelp')}
                            </p>
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
                                        <button
                                            type="button"
                                            className="dashboard-button-secondary"
                                            onClick={onCancelAiDraft}
                                            disabled={disabled}
                                        >
                                            {t('ai.cancelDraft')}
                                        </button>
                                        <button
                                            type="button"
                                            className="dashboard-button-primary"
                                            onClick={onUseAiDraft}
                                            disabled={disabled}
                                        >
                                            {t('ai.useDraft')}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        className="dashboard-button-primary disabled:opacity-60"
                                        onClick={onRequestAiDraft}
                                        disabled={disabled || aiDrafting}
                                    >
                                        {aiDrafting ? t('ai.generating') : t('ai.suggestQuiz')}
                                    </button>
                                )}
                            </div>
                        )}
                    >
                        <div className="space-y-4">
                            <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                                    <span className="font-semibold text-slate-900 dark:text-white">{t('ai.quizDraftFlow.createsLabel')}</span>
                                    <span className="mt-1 block">{t('ai.quizDraftFlow.creates')}</span>
                                </div>
                                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                                    <span className="font-semibold text-slate-900 dark:text-white">{t('ai.quizDraftFlow.appliesLabel')}</span>
                                    <span className="mt-1 block">{t('ai.quizDraftFlow.applies')}</span>
                                </div>
                                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                                    <span className="font-semibold text-slate-900 dark:text-white">{t('ai.quizDraftFlow.nextLabel')}</span>
                                    <span className="mt-1 block">{t('ai.quizDraftFlow.next')}</span>
                                </div>
                            </div>
                            {aiDraft ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                    <p className="font-semibold text-slate-900 dark:text-white">{aiDraft.title}</p>
                                    {aiDraft.description ? (
                                        <p className="mt-1 text-slate-600 dark:text-slate-300">{aiDraft.description}</p>
                                    ) : null}
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        {t('ai.questionCount', { count: aiDraft.questions?.length ?? 0 })}
                                    </p>
                                    <div className="mt-3 space-y-3">
                                        {(aiDraft.questions || []).map((question, questionIndex) => (
                                            <div key={`${question.prompt || 'question'}-${questionIndex}`} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3 dark:border-sky-900 dark:bg-sky-950/30">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{questionIndex + 1}. {question.prompt}</p>
                                                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
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
                            {aiDraftError ? <p className="text-sm text-rose-600">{aiDraftError}</p> : null}
                        </div>
                    </AiGenerationDrawer>
                </section>
            ) : null}

            <div className="space-y-6">
                {safeQuiz.questions.map((question, qIdx) => (
                    <div
                        key={qIdx}
                        className="border border-edubot-teal rounded p-4 bg-white dark:bg-gray-800 space-y-3"
                    >
                        <div className="flex justify-between items-center gap-3">
                            <h4 className="font-semibold">{t('instructorDashboard.courseBuilder.quiz.question', { number: qIdx + 1 })}</h4>
                            <button
                                type="button"
                                className="text-sm text-red-600 hover:underline disabled:text-gray-400"
                                onClick={() => removeQuestion(qIdx)}
                                disabled={disabled || safeQuiz.questions.length <= 1}
                            >
                                {t('instructorDashboard.courseBuilder.actions.delete')}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <textarea
                                className="w-full border rounded p-2 min-h-20 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t('instructorDashboard.courseBuilder.quiz.questionPlaceholder')}
                                value={question.prompt}
                                onChange={(e) => handleQuestionPromptChange(qIdx, e.target.value)}
                                disabled={disabled}
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                    onClick={() => addPromptFormatting(qIdx, 'bold')}
                                    disabled={disabled}
                                >
                                        + **{t('instructorDashboard.courseBuilder.quiz.boldSample')}**
                                </button>
                                <button
                                    type="button"
                                    className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                    onClick={() => addPromptFormatting(qIdx, 'code')}
                                    disabled={disabled}
                                >
                                        + `{t('instructorDashboard.courseBuilder.quiz.codeSample')}`
                                </button>
                            </div>

                            {question.prompt?.trim() && (
                                <div className="text-sm rounded border border-slate-200 bg-slate-50 p-2 dark:border-gray-600 dark:bg-gray-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-1">
                                        {t('instructorDashboard.courseBuilder.quiz.preview')}
                                    </p>
                                    <InlineRichText text={question.prompt} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {question.options.map((option, oIdx) => (
                                <label
                                    key={oIdx}
                                    className={`flex items-start gap-3 rounded border p-2 transition ${option.isCorrect
                                        ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-200 dark:bg-emerald-900/20'
                                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                                        } ${disabled ? '' : 'cursor-pointer'}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${qIdx}`}
                                        checked={option.isCorrect}
                                        onChange={() => handleCorrectOptionChange(qIdx, oIdx)}
                                        disabled={disabled}
                                        className="mt-2"
                                    />

                                    <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder={t('instructorDashboard.courseBuilder.quiz.option', {
                                                number: oIdx + 1,
                                            })}
                                            value={option.text}
                                            onChange={(e) =>
                                                handleOptionTextChange(qIdx, oIdx, e.target.value)
                                            }
                                            disabled={disabled}
                                        />

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addOptionFormatting(qIdx, oIdx, 'bold');
                                                }}
                                                disabled={disabled}
                                            >
                                                + **{t('instructorDashboard.courseBuilder.quiz.boldSample')}**
                                            </button>
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addOptionFormatting(qIdx, oIdx, 'code');
                                                }}
                                                disabled={disabled}
                                            >
                                                + `{t('instructorDashboard.courseBuilder.quiz.codeSample')}`
                                            </button>
                                        </div>

                                        {option.text?.trim() && (
                                            <div className="text-sm rounded border border-slate-200 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
                                                <InlineRichText text={option.text} />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="text-xs text-red-600 hover:underline disabled:text-gray-400 mt-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeOption(qIdx, oIdx);
                                        }}
                                        disabled={disabled || question.options.length <= 2}
                                    >
                                        {t('instructorDashboard.courseBuilder.actions.delete')}
                                    </button>
                                </label>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="text-sm text-edubot-orange hover:underline"
                            onClick={() => addOption(qIdx)}
                            disabled={disabled || question.options.length >= 6}
                        >
                            {t('instructorDashboard.courseBuilder.quiz.addOption')}
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="text-sm text-edubot-orange hover:underline"
                onClick={addQuestion}
                disabled={disabled}
            >
                {t('instructorDashboard.courseBuilder.quiz.addQuestion')}
            </button>
        </div>
    );
};

export default LessonQuizEditor;

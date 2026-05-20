import InlineRichText from '@shared/ui/InlineRichText';
import { createEmptyQuestion, createEmptyQuiz, cloneQuiz } from '@utils/quizUtils';
import { useTranslation } from 'react-i18next';

const LessonQuizEditor = ({ quiz, onChange, disabled = false }) => {
    const { t } = useTranslation();
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

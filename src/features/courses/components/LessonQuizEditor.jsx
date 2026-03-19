import InlineRichText from '@shared/ui/InlineRichText';
import React from 'react';
import { createEmptyQuestion, createEmptyQuiz, cloneQuiz } from '@utils/quizUtils';

const LessonQuizEditor = ({ quiz, onChange, disabled = false }) => {
    const safeQuiz = quiz ?? createEmptyQuiz();

    const updateQuiz = (updater) => {
        const cloned = cloneQuiz(safeQuiz);
        updater(cloned);
        onChange?.(cloned);
    };

    const appendFormattingToken = (value, type) => {
        if (type === 'bold') {
            return `${value || ''}${value ? ' ' : ''}**калың текст**`;
        }

        return `${value || ''}${value ? ' ' : ''}\`код\``;
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
                    <label className="block text-sm font-medium mb-1">Өтүү упайы (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={safeQuiz.passingScore ?? 70}
                        onChange={(e) => handlePassingScoreChange(e.target.value)}
                        className="w-full border rounded p-2"
                        disabled={disabled}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Убакыт лимити (мүнөт, бош болсо чексиз)
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
                        className="w-full border rounded p-2"
                        disabled={disabled}
                    />
                </div>
            </div>

            <p className="text-xs text-slate-500">
                Текст форматтоо: <code>**калың**</code> жана <code>`код`</code>. Төмөндө алдын ала
                көрүү чыгат.
            </p>

            <div className="space-y-6">
                {safeQuiz.questions.map((question, qIdx) => (
                    <div
                        key={qIdx}
                        className="border border-edubot-teal rounded p-4 bg-white space-y-3"
                    >
                        <div className="flex justify-between items-center gap-3">
                            <h4 className="font-semibold">Суроо {qIdx + 1}</h4>
                            <button
                                type="button"
                                className="text-sm text-red-600 hover:underline disabled:text-gray-400"
                                onClick={() => removeQuestion(qIdx)}
                                disabled={disabled || safeQuiz.questions.length <= 1}
                            >
                                Өчүрүү
                            </button>
                        </div>

                        <div className="space-y-2">
                            <textarea
                                className="w-full border rounded p-2 min-h-20"
                                placeholder="Суроонун тексти"
                                value={question.prompt}
                                onChange={(e) => handleQuestionPromptChange(qIdx, e.target.value)}
                                disabled={disabled}
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                                    onClick={() => addPromptFormatting(qIdx, 'bold')}
                                    disabled={disabled}
                                >
                                    + **калың**
                                </button>
                                <button
                                    type="button"
                                    className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                                    onClick={() => addPromptFormatting(qIdx, 'code')}
                                    disabled={disabled}
                                >
                                    + `код`
                                </button>
                            </div>

                            {question.prompt?.trim() && (
                                <div className="text-sm rounded border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                                        Алдын ала көрүү
                                    </p>
                                    <InlineRichText text={question.prompt} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {question.options.map((option, oIdx) => (
                                <label
                                    key={oIdx}
                                    className={`flex items-start gap-3 rounded border p-2 transition ${
                                        option.isCorrect
                                            ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-200'
                                            : 'bg-gray-50 border-gray-200'
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
                                            className="w-full border rounded p-2"
                                            placeholder={`Вариант ${oIdx + 1}`}
                                            value={option.text}
                                            onChange={(e) =>
                                                handleOptionTextChange(qIdx, oIdx, e.target.value)
                                            }
                                            disabled={disabled}
                                        />

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addOptionFormatting(qIdx, oIdx, 'bold');
                                                }}
                                                disabled={disabled}
                                            >
                                                + **калың**
                                            </button>
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addOptionFormatting(qIdx, oIdx, 'code');
                                                }}
                                                disabled={disabled}
                                            >
                                                + `код`
                                            </button>
                                        </div>

                                        {option.text?.trim() && (
                                            <div className="text-sm rounded border border-slate-200 bg-white p-2">
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
                                        Өчүрүү
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
                            + Вариант кошуу
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
                + Жаңы суроо кошуу
            </button>
        </div>
    );
};

export default LessonQuizEditor;

import React from 'react';
import { createEmptyQuestion, createEmptyQuiz, cloneQuiz } from '@utils/quizUtils';

const LessonQuizEditor = ({ quiz, onChange, disabled = false }) => {
    const safeQuiz = quiz ?? createEmptyQuiz();

    const updateQuiz = (updater) => {
        const cloned = cloneQuiz(safeQuiz);
        updater(cloned);
        onChange?.(cloned);
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

                        <input
                            className="w-full border rounded p-2"
                            placeholder="Суроонун тексти"
                            value={question.prompt}
                            onChange={(e) => handleQuestionPromptChange(qIdx, e.target.value)}
                            disabled={disabled}
                        />

                        <div className="space-y-3">
                            {question.options.map((option, oIdx) => (
                                <div
                                    key={oIdx}
                                    className="flex items-center gap-3 bg-gray-50 rounded p-2"
                                >
                                    <input
                                        type="radio"
                                        name={`question-${qIdx}`}
                                        checked={option.isCorrect}
                                        onChange={() => handleCorrectOptionChange(qIdx, oIdx)}
                                        disabled={disabled}
                                    />
                                    <input
                                        className="flex-1 border rounded p-2"
                                        placeholder={`Вариант ${oIdx + 1}`}
                                        value={option.text}
                                        onChange={(e) =>
                                            handleOptionTextChange(qIdx, oIdx, e.target.value)
                                        }
                                        disabled={disabled}
                                    />
                                    <button
                                        type="button"
                                        className="text-xs text-red-600 hover:underline disabled:text-gray-400"
                                        onClick={() => removeOption(qIdx, oIdx)}
                                        disabled={disabled || question.options.length <= 2}
                                    >
                                        Өчүрүү
                                    </button>
                                </div>
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

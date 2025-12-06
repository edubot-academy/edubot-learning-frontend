import Button from '@shared/ui/Button';
import React, { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

const LessonQuizPlayer = ({
    quiz,
    answers = {},
    onAnswerChange,
    onSubmit,
    onRetake,
    submitting = false,
    disabled = false,
    result = null,
    loading = false,
}) => {

    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [startQuiz, setStartQuiz] = useState(false);
    const [isShowAnswers, setIsShowAnswers] = useState(false);
    const [skippedQuestions, setSkippedQuestions] = useState([]);

    // reset index when quiz changes
    useEffect(() => {
        setActiveQuestionIndex(0);
        setStartQuiz(false);
        setIsShowAnswers(false);
        setSkippedQuestions([]);
    }, [quiz?.id]);

    // result answers
    const resultAnswersMap = useMemo(() => {
        if (!result?.answers) return {};
        return result.answers.reduce((acc, ans) => {
            acc[ans.questionId] = {
                ...ans,
                correctIds: Array.isArray(ans.correctOptionIds)
                    ? ans.correctOptionIds
                    : ans.correctOptionId
                        ? [ans.correctOptionId]
                        : [],
            };
            return acc;
        }, {});
    }, [result]);

    // current question
    const currentQuestion = useMemo(() => {
        if (!quiz?.questions) return null;
        return quiz.questions[activeQuestionIndex];
    }, [quiz?.questions, activeQuestionIndex]);

    const currentAnswerInfo = currentQuestion
        ? resultAnswersMap[currentQuestion.id]
        : null;

    const selectedOption = currentQuestion
        ? answers[currentQuestion.id]
        : null;

    const allAnswered =
        quiz?.questions?.every((q) => answers[q.id]) ?? false;

    const isLastQuestion =
        quiz?.questions &&
        activeQuestionIndex === quiz.questions.length - 1;

    // Function to handle skip question
    const handleSkipQuestion = () => {
        if (!currentQuestion) return;

        // Mark this question as skipped
        const questionId = currentQuestion.id;
        setSkippedQuestions(prev => [...prev, questionId]);

        // Move to next question
        if (!isLastQuestion) {
            setActiveQuestionIndex(prev => prev + 1);
        }
    };

    // Prepare answers for submission with skipped questions marked as wrong
    const prepareAnswersForSubmission = () => {
        if (!quiz?.questions) return [];

        return quiz.questions.map((question) => {
            const answerId = answers[question.id];
            const isSkipped = skippedQuestions.includes(question.id);

            // If question is skipped or not answered, return null optionId
            if (!answerId || isSkipped) {
                return {
                    questionId: question.id,
                    optionId: null, // null indicates no answer or skipped
                };
            }

            return {
                questionId: question.id,
                optionId: answerId,
            };
        });
    };

    // Handle quiz submission
    const handleSubmit = async () => {
        if (!onSubmit) return;

        const preparedAnswers = prepareAnswersForSubmission();

        // Check if all questions have answers (including null for skipped)
        const allQuestionsCovered = preparedAnswers.length === quiz?.questions?.length;

        if (!allQuestionsCovered) {
            toast.error('Все вопросы должны быть обработаны');
            return;
        }

        // Call the parent's onSubmit with prepared answers
        await onSubmit(preparedAnswers);
    };

    // summaries
    const questionSummaries = useMemo(() => {
        if (!quiz?.questions) return [];
        return quiz.questions.map((question) => {
            const answerInfo = resultAnswersMap[question.id];
            const selected = answerInfo
                ? question.options.find(
                    (opt) => opt.id === answerInfo.selectedOptionId
                )
                : undefined;
            const correctOptions = answerInfo
                ? question.options.filter((opt) =>
                    answerInfo.correctIds.includes(opt.id)
                )
                : [];
            const answeredCorrect =
                typeof answerInfo?.isCorrect === "boolean"
                    ? answerInfo.isCorrect
                    : answerInfo?.correct ?? null;

            return {
                question,
                selected,
                correctOptions,
                answeredCorrect,
                hasCorrectMeta: Boolean(answerInfo),
            };
        });
    }, [quiz?.questions, resultAnswersMap]);

    const handleRetake = () => {
        setActiveQuestionIndex(0);
        setStartQuiz(false);
        setSkippedQuestions([]);
        onRetake?.();
    };

    if (loading) {
        return (
            <div className="mb-6 bg-white rounded-lg shadow-md p-6 min-h-[200px] flex items-center justify-center">
                <p className="text-gray-500">Квиз жүктөлүүдө...</p>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500">Квиз табылган жок.</p>
            </div>
        );
    }

    // start screen
    if (!startQuiz && !result) {
        return (
            <div className="mb-6 bg-white rounded-lg shadow-md py-[20%] text-center">
                <h2 className="font-bold text-[200%] leading-[44px] tracking-[0.01em] mb-[5%]">
                    Начнем тест! Ты готов?
                </h2>
                <div className="flex justify-center gap-[16px]">
                    <Button variant="secondary">Назад</Button>
                    <Button onClick={() => setStartQuiz(true)}>Начать тест</Button>
                </div>
            </div>
        );
    }

    // quiz result screen
    if (result) {
        return (
            <div className="mb-6 bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-2xl font-bold">
                        {result.score}% ({result.correctAnswers}/
                        {result.totalQuestions}) правильно
                    </p>

                    <p className="text-gray-600">
                        {result.passed
                            ? "Вы показали глубокие знания!"
                            : "Не удалось пройти. Попробуйте снова."}
                    </p>

                    <div className="flex gap-4">
                        <Button onClick={handleRetake} variant="secondary">
                            Пройти заново
                        </Button>
                        <Button>Вернуться на главную</Button>
                    </div>
                </div>

                <div
                    onClick={() => setIsShowAnswers(!isShowAnswers)}
                    className="flex items-center gap-1 cursor-pointer mt-6 text-lg font-medium"
                >
                    <span>Посмотреть ответ</span>
                    {isShowAnswers ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>

                {isShowAnswers && (
                    <div className="space-y-3">
                        {questionSummaries.map(
                            ({ question, selected, correctOptions, answeredCorrect }, i) => (
                                <div
                                    key={question.id}
                                    className={`border rounded p-3 text-sm ${answeredCorrect
                                        ? "border-green-500 bg-green-50"
                                        : answeredCorrect === false
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-200 bg-gray-50"
                                        }`}
                                >
                                    <p className="font-medium flex items-center gap-2">
                                        {answeredCorrect ? (
                                            <FiCheckCircle className="text-green-600" />
                                        ) : answeredCorrect === false ? (
                                            <FiXCircle className="text-red-600" />
                                        ) : (
                                            <FiClock className="text-gray-400" />
                                        )}
                                        {i + 1}. {question.prompt}
                                    </p>

                                    <p>
                                        Ваш ответ:{" "}
                                        <span className="font-semibold bg-gray-100 px-1 rounded">
                                            {selected?.text || "Пропущено"}
                                        </span>
                                    </p>

                                    {(answeredCorrect === false || !selected) &&
                                        correctOptions.length > 0 && (
                                            <div className="text-sm text-green-700">
                                                <p>Правильный ответ:</p>
                                                <ul className="list-disc list-inside">
                                                    {correctOptions.map((opt) => (
                                                        <li key={opt.id}>{opt.text}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 space-y-4">
            {currentQuestion ? (
                <div className="space-y-4">
                    <p className="font-medium text-[20px] leading-[40px]">
                        {activeQuestionIndex + 1}. {currentQuestion.prompt}
                    </p>

                    <div className="space-y-2">
                        {currentQuestion.options.map((option) => {
                            const isSelected = selectedOption === option.id;

                            return (
                                <label
                                    key={option.id}
                                    className={`flex items-center gap-2 border rounded-xl p-4 cursor-pointer 
                                        ${isSelected
                                            ? "border-edubot-orange"
                                            : "border-gray-200"
                                        }
                                        ${disabled ? "opacity-70 cursor-not-allowed" : ""}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name={`quiz-${currentQuestion.id}`}
                                        value={option.id}
                                        checked={isSelected}
                                        onChange={() =>
                                            onAnswerChange?.(
                                                currentQuestion.id,
                                                option.id
                                            )
                                        }
                                    />
                                    <span>{option.text}</span>
                                </label>
                            );
                        })}
                    </div>

                    {isLastQuestion ? (
                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                onClick={handleSkipQuestion}
                            >
                                Пропустить
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? "Загрузка..." : "Завершить"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                onClick={handleSkipQuestion}
                            >
                                Пропустить
                            </Button>
                            <Button
                                onClick={() =>
                                    setActiveQuestionIndex((i) =>
                                        Math.min(quiz.questions.length - 1, i + 1)
                                    )
                                }
                                disabled={!selectedOption}
                            >
                                Далее
                            </Button>
                        </div>
                    )}

                    <div className="text-sm text-gray-500 mt-2">
                        Пропущенные вопросы: {skippedQuestions.length} из {quiz.questions?.length || 0}
                    </div>
                </div>
            ) : (
                <p>Вопросы не найдены.</p>
            )}
        </div>
    );
};

export default LessonQuizPlayer;
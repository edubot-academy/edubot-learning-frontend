import React, { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import Button from "./UI/Button";
import A_plus from "../assets/images/A+.png";
import B from "../assets/images/B.png";
import C from "../assets/images/C.png";

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

    useEffect(() => {
        setActiveQuestionIndex(0);
    }, [quiz?.id]);

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

    const allAnswered =
        quiz.questions?.every((question) => answers[question.id]) ?? false;

    const currentQuestion = useMemo(
        () => quiz.questions?.[activeQuestionIndex],
        [quiz.questions, activeQuestionIndex]
    );
    const currentAnswerInfo = currentQuestion
        ? resultAnswersMap[currentQuestion.id]
        : null;

    const selectedOption = currentQuestion
        ? answers[currentQuestion.id]
        : null;

    const isLastQuestion =
        quiz.questions && activeQuestionIndex === quiz.questions.length - 1;

    const questionSummaries = useMemo(() => {
        if (!quiz.questions) return [];
        return quiz.questions.map((question) => {
            const answerInfo = resultAnswersMap[question.id];
            const selected = answerInfo
                ? question.options.find((opt) => opt.id === answerInfo.selectedOptionId)
                : undefined;
            const correctOptions = answerInfo
                ? question.options.filter((opt) => answerInfo.correctIds.includes(opt.id))
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
    }, [quiz.questions, resultAnswersMap]);

    const handleRetake = () => {
        setActiveQuestionIndex(0);
        onRetake?.();
    };

    if (!startQuiz) {
        return (
            <div className="mb-6 bg-white rounded-lg shadow-md py-[20%] text-center">
                <div className="">
                    <h2 className="font-bold text-[200%] leading-[44px] tracking-[0.01em] mb-[5%]">Начнем тест! Ты готов?</h2>
                    <div className="flex justify-center gap-[16px]">
                        <Button children="Назад" variant="secondary" />
                        <Button children="Начать тест" onClick={() => setStartQuiz(!startQuiz)} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xl font-semibold">Квиз</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Өтүү упайы: {quiz.passingScore}%</span>
                    {quiz.timeLimitSeconds && (
                        <span className="flex items-center gap-1">
                            <FiClock /> {Math.round(quiz.timeLimitSeconds / 60)} мин
                        </span>
                    )}
                </div>
            </div> */}

            {!result && (
                currentQuestion ? (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <p className="font-medium text-[20px] leading-[40px]">
                                {activeQuestionIndex + 1 + " вопрос"}. {currentQuestion.prompt}
                            </p>
                            <div className="space-y-2">
                                {currentQuestion.options.map((option) => {
                                    const isSelected = selectedOption === option.id;
                                    const showResults = Boolean(result);
                                    const isCorrect =
                                        showResults && currentAnswerInfo
                                            ? currentAnswerInfo.correctIds.includes(option.id)
                                            : false;

                                    let stateClasses = "";
                                    if (showResults && currentAnswerInfo) {
                                        if (isCorrect) {
                                            stateClasses =
                                                "border-green-500 bg-green-50 text-green-700";
                                        } else if (isSelected) {
                                            stateClasses =
                                                "border-red-500 bg-red-50 text-red-700";
                                        }
                                    } else if (isSelected) {
                                        stateClasses = "border-2 border-edubot-orange";
                                    }

                                    return (
                                        <label
                                            key={option.id}
                                            className={`flex items-center gap-2 border rounded-xl p-4 cursor-pointer transition ${stateClasses ||
                                                "border-gray-200"} ${disabled ? "opacity-70 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`quiz-question-${currentQuestion.id}`}
                                                value={option.id}
                                                checked={isSelected}
                                                onChange={() =>
                                                    onAnswerChange?.(currentQuestion.id, option.id)
                                                }
                                                disabled={disabled || showResults}
                                            />
                                            <span>{option.text}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="px-3 py-2 rounded border text-sm disabled:opacity-60"
                                onClick={() =>
                                    setActiveQuestionIndex((prev) => Math.max(0, prev - 1))
                                }
                                disabled={activeQuestionIndex === 0 || disabled || submitting}
                            >
                                Артка
                            </button>
                            <div className="text-sm text-gray-500">
                                {activeQuestionIndex + 1}/{quiz.questions.length}
                            </div>
                            <button
                                type="button"
                                className="px-3 py-2 rounded border text-sm disabled:opacity-60"
                                onClick={() =>
                                    setActiveQuestionIndex((prev) =>
                                        Math.min(quiz.questions.length - 1, prev + 1)
                                    )
                                }
                                disabled={
                                    isLastQuestion ||
                                    !selectedOption ||
                                    disabled ||
                                    submitting
                                }
                            >
                                Кийинки
                            </button>
                        </div> */}
                        <div className="flex gap-4">
                            <Button variant="secondary" >Пропустить</Button>
                            {activeQuestionIndex + 1 === quiz.questions.length ?
                                < Button
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={Boolean(result) || disabled || submitting || !allAnswered}
                                    className="px-4 py-2 rounded bg-edubot-orange text-white disabled:opacity-60"
                                >
                                    {submitting ? "Загрузка..." : "Далее"}
                                </Button>
                                :
                                <Button onClick={() =>
                                    setActiveQuestionIndex((prev) =>
                                        Math.min(quiz.questions.length - 1, prev + 1)
                                    )}
                                    disabled={
                                        isLastQuestion ||
                                        !selectedOption ||
                                        disabled ||
                                        submitting
                                    }>Далее</Button>
                            }
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Квиз суроолору табылган жок.</p>
                )
            )}

            {result && (
                <div className="rounded p-4 gap-3 w-full flex flex-col">
                <div className="flex flex-col items-center text-center gap-3">
            
                    {/* Блок оценки */}
                    {result.passed ? (
                        <img src={A_plus} alt="grade" className="w-24" />
                    ) : result.score >= 70 ? (
                        <img src={B} alt="grade" className="w-24" />
                    ) : (
                        <img src={C} alt="grade" className="w-24" />
                    )}
            
                    {/* Основной текст */}
                    <p className="text-2xl font-bold">
                        {result.score}% , ({result.correctAnswers}/{result.totalQuestions}) правильно ответили
                    </p>
            
                    <p className="text-gray-600">
                        {result.passed
                            ? "Вы показали глубокие знания в области UX/UI-дизайна"
                            : "Жыйынтык өтө алган жок. Кайра аракет кылыңыз."}
                    </p>
            
                    {/* Кнопки */}
                    <div className="flex gap-4 mt-2">
                        <Button
                            onClick={handleRetake}
                            disabled={disabled}
                            variant="secondary"
                        >
                            Пройти заново
                        </Button>
            
                        <Button>
                            Вернуться на главную
                        </Button>
                    </div>
                </div>
            
                {/* Показ ответов */}
                <div
                    onClick={() => setIsShowAnswers(!isShowAnswers)}
                    className="flex items-center gap-1 cursor-pointer mt-6 text-lg font-medium"
                >
                    <span>Посмотреть ответ</span>
                    {isShowAnswers ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>
            </div>
            
            )
            }

            {/* {
                result && questionSummaries.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                            Суроолор боюнча жыйынтык
                        </h4>
                        {questionSummaries.map(({ question, selected, correctOptions, answeredCorrect }, idx) => (
                            <div
                                key={question.id}
                                className={`border rounded p-3 text-sm space-y-1 ${answeredCorrect === true
                                    ? "border-green-500 bg-green-50"
                                    : answeredCorrect === false
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <p className="font-medium flex items-center gap-2">
                                    {answeredCorrect === true ? (
                                        <FiCheckCircle className="text-green-600" />
                                    ) : answeredCorrect === false ? (
                                        <FiXCircle className="text-red-600" />
                                    ) : (
                                        <FiClock className="text-gray-400" />
                                    )}
                                    <span>
                                        {idx + 1}. {question.prompt}
                                    </span>
                                </p>
                                <p>
                                    Сиздин жообуңуз:{" "}
                                    <span
                                        className={`font-semibold px-1 rounded ${answeredCorrect === true
                                            ? "text-green-700 bg-green-100"
                                            : answeredCorrect === false
                                                ? "text-red-700 bg-red-100"
                                                : "text-gray-600 bg-gray-100"
                                            }`}
                                    >
                                        {selected?.text || "Жооп берилген жок"}
                                    </span>
                                </p>
                                {answeredCorrect === false && correctOptions.length > 0 && (
                                    <div className="text-sm text-green-700 space-y-1">
                                        <p>Туура жооп:</p>
                                        <ul className="list-disc list-inside">
                                            {correctOptions.map((opt) => (
                                                <li key={opt.id} className="font-semibold">
                                                    {opt.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            } */}

            {/* <div className="flex items-center gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={Boolean(result) || disabled || submitting || !allAnswered}
                    className="px-4 py-2 rounded bg-edubot-orange text-white disabled:opacity-60"
                >
                    {submitting ? "Жөнөтүлүүдө..." : "Квизди тапшыруу"}
                </button>
                {result && (
                    <button
                        type="button"
                        onClick={handleRetake}
                        className="px-4 py-2 rounded border border-edubot-orange text-edubot-orange hover:bg-orange-50"
                        disabled={disabled}
                    >
                        Кайра тапшыруу
                    </button>
                )}
            </div>
            {!disabled && !allAnswered && (
                <p className="text-xs text-gray-500">
                    Бардык суроолорго жооп бергенде гана жөнөтө аласыз.
                </p>
            )} */}
        </div >
    );
};

export default LessonQuizPlayer;

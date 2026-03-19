import InlineRichText from '@shared/ui/InlineRichText';
import Button from '@shared/ui/Button';
import Loader from '@shared/ui/Loader';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import grade_A from '../../../assets/images/grade_A.png';
import grade_B from '../../../assets/images/grade_B.png';
import grade_C from '../../../assets/images/grade_C.png';

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

    useEffect(() => {
        setActiveQuestionIndex(0);
        setStartQuiz(false);
        setIsShowAnswers(false);
        setSkippedQuestions([]);
    }, [quiz?.id]);

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

    const currentQuestion = useMemo(() => {
        if (!quiz?.questions) return null;
        return quiz.questions[activeQuestionIndex];
    }, [quiz?.questions, activeQuestionIndex]);

    const selectedOption = currentQuestion ? answers[currentQuestion.id] : null;
    const isLastQuestion = quiz?.questions && activeQuestionIndex === quiz.questions.length - 1;

    const handleSkipQuestion = () => {
        if (!currentQuestion) return;

        const questionId = currentQuestion.id;
        setSkippedQuestions((prev) => [...prev, questionId]);

        if (!isLastQuestion) {
            setActiveQuestionIndex((prev) => prev + 1);
        }
    };

    const prepareAnswersForSubmission = () => {
        if (!quiz?.questions) return [];

        return quiz.questions.map((question) => {
            const answerId = answers[question.id];
            const isSkipped = skippedQuestions.includes(question.id);

            if (!answerId || isSkipped) {
                return {
                    questionId: question.id,
                    optionId: null,
                };
            }

            return {
                questionId: question.id,
                optionId: answerId,
            };
        });
    };

    const handleSubmit = async () => {
        if (!onSubmit) return;

        const preparedAnswers = prepareAnswersForSubmission();
        const allQuestionsCovered = preparedAnswers.length === quiz?.questions?.length;

        if (!allQuestionsCovered) {
            toast.error('Все вопросы должны быть обработаны');
            return;
        }

        await onSubmit(preparedAnswers);
    };

    const questionSummaries = useMemo(() => {
        if (!quiz?.questions) return [];
        return quiz.questions.map((question) => {
            const answerInfo = resultAnswersMap[question.id];
            const selected = answerInfo
                ? question.options.find((opt) => opt.id === answerInfo.selectedOptionId)
                : undefined;
            const correctOptions = answerInfo
                ? question.options.filter((opt) => answerInfo.correctIds.includes(opt.id))
                : [];
            const answeredCorrect =
                typeof answerInfo?.isCorrect === 'boolean'
                    ? answerInfo.isCorrect
                    : (answerInfo?.correct ?? null);

            return {
                question,
                selected,
                correctOptions,
                answeredCorrect,
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
        return <Loader fullScreen />;
    }

    if (!quiz) {
        return (
            <div className="mb-6 rounded-lg shadow-md p-6">
                <p className="text-gray-500">Квиз табылган жок.</p>
            </div>
        );
    }

    if (!startQuiz && !result) {
        return (
            <div className="mb-6 rounded-lg shadow-md py-[20%] text-center">
                <h2 className="font-bold text-[200%] leading-[44px] tracking-[0.01em] mb-[5%]">
                    Тестти баштайбыз! Даярсыңбы?
                </h2>
                <div className="flex justify-center gap-[16px]">
                    <Button variant="secondary">Артка</Button>
                    <Button onClick={() => setStartQuiz(true)}>Тестти баштоо</Button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="mb-6 rounded-lg shadow-md p-6 space-y-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    {result.passed ? (
                        <img src={grade_A} alt="grade" className="w-24" />
                    ) : result.score >= 70 ? (
                        <img src={grade_B} alt="grade" className="w-24" />
                    ) : (
                        <img src={grade_C} alt="grade" className="w-24" />
                    )}

                    <p className="text-2xl font-bold">
                        {result.score}% ({result.correctAnswers}/{result.totalQuestions}) туура
                    </p>

                    <p className="text-gray-600">
                        {result.passed
                            ? 'Сиз терең билим көрсөттүңүз!'
                            : 'Өтө албай калдыңыз. Кайра аракет кылуу.'}
                    </p>

                    <div className="flex gap-4">
                        <Button onClick={handleRetake} variant="secondary">
                            Кайрадан өтүү.
                        </Button>
                        <Button>Башкы бетке кайтуу</Button>
                    </div>
                </div>

                <div
                    onClick={() => setIsShowAnswers(!isShowAnswers)}
                    className="flex items-center gap-1 cursor-pointer mt-6 text-lg font-medium"
                >
                    <span>Жоопторун көрүү</span>
                    {isShowAnswers ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>

                {isShowAnswers && (
                    <div className="space-y-3">
                        {questionSummaries.map(
                            ({ question, selected, correctOptions, answeredCorrect }, i) => (
                                <div
                                    key={question.id}
                                    className={`border rounded p-3 text-sm text-black ${
                                        answeredCorrect
                                            ? 'border-green-500 bg-green-50'
                                            : answeredCorrect === false
                                              ? 'border-red-500 bg-red-50'
                                              : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <p className="font-medium flex items-start gap-2">
                                        <span className="pt-0.5">
                                            {answeredCorrect ? (
                                                <FiCheckCircle className="text-green-600" />
                                            ) : answeredCorrect === false ? (
                                                <FiXCircle className="text-red-600" />
                                            ) : (
                                                <FiClock className="text-gray-400" />
                                            )}
                                        </span>
                                        <span>
                                            {i + 1}. <InlineRichText text={question.prompt} />
                                        </span>
                                    </p>

                                    <div className="mt-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                                            Сиздин жооп
                                        </p>
                                        <div
                                            className={`rounded border px-2 py-1 ${
                                                selected
                                                    ? 'border-amber-300 bg-amber-50'
                                                    : 'border-slate-200 bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {selected ? (
                                                <InlineRichText text={selected.text} />
                                            ) : (
                                                'Калтырылды'
                                            )}
                                        </div>
                                    </div>

                                    {(answeredCorrect === false || !selected) &&
                                        correctOptions.length > 0 && (
                                            <div className="text-sm text-green-700 mt-2">
                                                <p className="text-xs uppercase tracking-wide mb-1 text-green-800">
                                                    Туура жооп
                                                </p>
                                                <ul className="space-y-1">
                                                    {correctOptions.map((opt) => (
                                                        <li
                                                            key={opt.id}
                                                            className="rounded border border-green-300 bg-white px-2 py-1"
                                                        >
                                                            <InlineRichText text={opt.text} />
                                                        </li>
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
        <div className="mb-6 rounded-lg shadow-md p-6 space-y-4">
            {currentQuestion ? (
                <div className="space-y-4">
                    <p className="font-medium text-[20px] leading-[40px]">
                        {activeQuestionIndex + 1}. <InlineRichText text={currentQuestion.prompt} />
                    </p>

                    <div className="space-y-2">
                        {currentQuestion.options.map((option) => {
                            const isSelected = selectedOption === option.id;

                            return (
                                <label
                                    key={option.id}
                                    className={`flex items-start gap-2 border rounded-xl p-4 transition 
                                        ${
                                            isSelected
                                                ? 'border-edubot-orange bg-orange-50 ring-1 ring-orange-200'
                                                : 'border-gray-200 bg-white'
                                        }
                                        ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name={`quiz-${currentQuestion.id}`}
                                        value={option.id}
                                        checked={isSelected}
                                        onChange={() =>
                                            onAnswerChange?.(currentQuestion.id, option.id)
                                        }
                                        className="mt-1"
                                    />
                                    <span className="leading-6">
                                        <InlineRichText text={option.text} />
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {isLastQuestion ? (
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={handleSkipQuestion}>
                                Өткөрүү
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? <Loader fullScreen={false} /> : 'Жыйынтыктоо'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={handleSkipQuestion}>
                                Өткөрүү
                            </Button>
                            <Button
                                onClick={() =>
                                    setActiveQuestionIndex((i) =>
                                        Math.min(quiz.questions.length - 1, i + 1)
                                    )
                                }
                                disabled={!selectedOption}
                            >
                                Кийинкиси
                            </Button>
                        </div>
                    )}

                    <div className="text-sm text-gray-500 mt-2">
                        Калтырылкан суроолор: {skippedQuestions.length} из{' '}
                        {quiz.questions?.length || 0}
                    </div>
                </div>
            ) : (
                <p>Суроолор табылган жок.</p>
            )}
        </div>
    );
};

export default LessonQuizPlayer;

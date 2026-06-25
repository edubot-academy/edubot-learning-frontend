import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getNextQuestion, submitAnswer, completeAttempt } from '../api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cl = (obj, lang) => obj?.[lang] ?? obj?.ky ?? obj?.en ?? '';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getAttemptExpiry = (data) =>
    data?.expiresAt ??
    data?.attempt?.expiresAt ??
    data?.attemptExpiresAt ??
    data?.deadlineAt ??
    null;

const getQuestionNumber = (data) => {
    const directQuestionNumber = data?.questionNumber ?? data?.currentQuestionNumber;
    if (Number.isFinite(directQuestionNumber) && directQuestionNumber > 0) {
        return directQuestionNumber;
    }

    const answeredCount = data?.answeredCount ?? data?.currentIndex;
    if (Number.isFinite(answeredCount) && answeredCount >= 0) {
        return answeredCount + 1;
    }

    return null;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ current, total }) => {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-[#FF8C6E] to-[#E14219] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={current}
                aria-valuemax={total}
            />
        </div>
    );
};

// ─── Option button ────────────────────────────────────────────────────────────

const OptionButton = ({ option, lang, selected, disabled, onSelect }) => {
    const label = ['A', 'B', 'C', 'D'][option.order] ?? String.fromCharCode(65 + option.order);
    const isSelected = selected === option.id;

    return (
        <button
            type="button"
            onClick={() => !disabled && onSelect(option.id)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={[
                'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E14219]',
                isSelected
                    ? 'border-[#E14219] bg-orange-50 dark:bg-orange-950/30'
                    : 'border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/25',
                disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
        >
            <span className={[
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors',
                isSelected
                    ? 'bg-[#E14219] text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
            ].join(' ')}>
                {label}
            </span>
            <span className="pt-1 text-[#141619] dark:text-[#E8ECF3] text-sm leading-relaxed">
                {cl(option.text, lang)}
            </span>
        </button>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const QuestionSkeleton = () => (
    <div className="motion-safe:animate-pulse space-y-4">
        <div className="h-4 w-1/3 rounded-full bg-gray-100 dark:bg-white/10" />
        <div className="h-6 w-full rounded-full bg-gray-100 dark:bg-white/10" />
        <div className="h-6 w-4/5 rounded-full bg-gray-100 dark:bg-white/10" />
        <div className="mt-6 space-y-3">
            {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/10" />
            ))}
        </div>
    </div>
);

// ─── Time expired overlay ─────────────────────────────────────────────────────

const TimeExpiredOverlay = ({ t, onViewResults }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <span className="text-5xl mb-4 block">⏰</span>
            <h2 className="font-bold text-xl text-[#141619] dark:text-[#E8ECF3] mb-2">
                {t('assessment.test.expiredTitle')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {t('assessment.test.expiredMessage')}
            </p>
            <button
                type="button"
                onClick={onViewResults}
                className="w-full py-3 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white font-semibold"
            >
                {t('assessment.test.viewResults')}
            </button>
        </div>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const EnglishPlacementTestPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] ?? 'ky';
    const expiresAtStorageKey = `assessment-attempt:${attemptId}:expiresAt`;

    const [question, setQuestion] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(30);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [expired, setExpired] = useState(false);
    const [expiresAt, setExpiresAt] = useState(() => location.state?.expiresAt ?? sessionStorage.getItem(expiresAtStorageKey));
    const [timeLeft, setTimeLeft] = useState(null);

    const questionStartedAt = useRef(Date.now());
    const finalizingRef = useRef(false);

    // ─── Timer ────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!location.state?.expiresAt) return;
        setExpiresAt(location.state.expiresAt);
        sessionStorage.setItem(expiresAtStorageKey, location.state.expiresAt);
    }, [expiresAtStorageKey, location.state]);

    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft(null);
            return;
        }
        setTimeLeft(Math.max(0, Math.round((new Date(expiresAt) - Date.now()) / 1000)));
    }, [expiresAt]);

    useEffect(() => {
        if (timeLeft === null) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    return prev === null ? null : 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    useEffect(() => {
        if (timeLeft === 0 && !expired && !finalizingRef.current) {
            finalizingRef.current = true;
            setExpired(true);
            completeAttempt(attemptId).catch(() => null);
        }
    }, [timeLeft, expired, attemptId]);

    // ─── Load first question ──────────────────────────────────────────────────

    const loadNextQuestion = useCallback(async () => {
        setLoading(true);
        setSelectedOptionId(null);
        questionStartedAt.current = Date.now();
        try {
            const data = await getNextQuestion(attemptId);
            if (data.completed || !data.question) {
                sessionStorage.removeItem(expiresAtStorageKey);
                navigate(`/assessment/attempt/${attemptId}/result`, { replace: true });
                return;
            }

            const nextExpiresAt = getAttemptExpiry(data);
            if (nextExpiresAt) {
                setExpiresAt(nextExpiresAt);
                sessionStorage.setItem(expiresAtStorageKey, nextExpiresAt);
            }

            if (data.total) setTotalQuestions(data.total);
            const nextQuestionNumber = getQuestionNumber(data);
            if (nextQuestionNumber) {
                setQuestionNumber(nextQuestionNumber);
            }
            setQuestion(data);
        } catch {
            toast.error(t('assessment.test.submitError'));
        } finally {
            setLoading(false);
        }
    }, [attemptId, expiresAtStorageKey, navigate, t]);

    useEffect(() => {
        loadNextQuestion();
    }, [loadNextQuestion]);

    // ─── Submit answer ────────────────────────────────────────────────────────

    const handleNext = async () => {
        if (!selectedOptionId || submitting || !question) return;
        setSubmitting(true);

        const timeSpentSeconds = Math.round((Date.now() - questionStartedAt.current) / 1000);

        try {
            const result = await submitAnswer(attemptId, {
                questionId: question.id,
                selectedOptionId,
                timeSpentSeconds,
            });

            if (result.currentIndex >= result.total) {
                navigate(`/assessment/attempt/${attemptId}/result`, { replace: true });
                return;
            }

            setQuestionNumber(prev => prev + 1);
            await loadNextQuestion();
        } catch {
            toast.error(t('assessment.test.submitError'));
        } finally {
            setSubmitting(false);
        }
    };

    const isLast = questionNumber >= totalQuestions;
    const timerWarning = timeLeft !== null && timeLeft < 5 * 60;

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            {expired && (
                <TimeExpiredOverlay
                    t={t}
                    onViewResults={() => navigate(`/assessment/attempt/${attemptId}/result`, { replace: true })}
                />
            )}

            {/* Top bar: timer + progress */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#222222]/95 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 sm:px-6 lg:px-12">
                <div className="max-w-screen-md mx-auto space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                            {t('assessment.test.questionOf', { current: questionNumber, total: totalQuestions })}
                        </span>
                        {timeLeft !== null && (
                            <span className={[
                                'inline-flex items-center gap-1.5 font-mono font-semibold',
                                timerWarning ? 'text-red-500' : 'text-gray-600 dark:text-gray-300',
                            ].join(' ')}>
                                <ClockIcon />
                                {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                    <ProgressBar current={questionNumber - 1} total={totalQuestions} />
                </div>
            </div>

            {/* Question area */}
            <div className="px-4 py-10 sm:px-6 lg:px-12 max-w-screen-md mx-auto">
                {loading ? (
                    <QuestionSkeleton />
                ) : question ? (
                    <div>
                        {/* Skill / level badge */}
                        <div className="flex items-center gap-2 mb-5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {question.level}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 capitalize">
                                {question.skill}
                            </span>
                        </div>

                        {/* Question text */}
                        <h2 className="font-suisse font-semibold text-xl sm:text-2xl text-[#141619] dark:text-[#E8ECF3] leading-snug mb-8">
                            {cl(question.question, lang)}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {(question.options ?? [])
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map(option => (
                                    <OptionButton
                                        key={option.id}
                                        option={option}
                                        lang={lang}
                                        selected={selectedOptionId}
                                        disabled={submitting}
                                        onSelect={setSelectedOptionId}
                                    />
                                ))}
                        </div>

                        {/* Hint */}
                        {!selectedOptionId && (
                            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
                                {t('assessment.test.selectOption')}
                            </p>
                        )}

                        {/* Next / Finish */}
                        <div className="mt-8 flex justify-end">
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!selectedOptionId || submitting}
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white font-semibold shadow-md transition-all duration-200 hover:brightness-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E14219] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                            >
                                {submitting
                                    ? t('assessment.test.completing')
                                    : isLast
                                        ? t('assessment.test.finishBtn')
                                        : t('assessment.test.nextBtn')}
                                {!submitting && <ArrowRightIcon />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-400">{t('assessment.test.noAttempt')}</p>
                )}
            </div>
        </div>
    );
};

export default EnglishPlacementTestPage;

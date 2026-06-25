import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAttemptResult } from '../api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cl = (obj, lang) => obj?.[lang] ?? obj?.ky ?? obj?.en ?? '';

const pct = (value) => `${Math.round(value ?? 0)}%`;

// ─── CEFR level config ────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
    A0: { color: 'bg-gray-400',    text: 'text-gray-500',    ring: 'ring-gray-300 dark:ring-gray-600',    label: 'A0' },
    A1: { color: 'bg-blue-400',    text: 'text-blue-600',    ring: 'ring-blue-200 dark:ring-blue-800',    label: 'A1' },
    A2: { color: 'bg-teal-500',    text: 'text-teal-600',    ring: 'ring-teal-200 dark:ring-teal-800',    label: 'A2' },
    B1: { color: 'bg-green-500',   text: 'text-green-600',   ring: 'ring-green-200 dark:ring-green-800',  label: 'B1' },
    B2: { color: 'bg-orange-500',  text: 'text-orange-600',  ring: 'ring-orange-200 dark:ring-orange-800', label: 'B2' },
};

const SKILLS = ['grammar', 'vocabulary', 'reading', 'communication'];

const SKILL_COLORS = {
    grammar:       'bg-blue-500',
    vocabulary:    'bg-violet-500',
    reading:       'bg-teal-500',
    communication: 'bg-amber-500',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ExclamationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);

// ─── Level badge ──────────────────────────────────────────────────────────────

const LevelBadge = ({ level }) => {
    const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.A0;
    return (
        <div className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-full ring-8 ${cfg.ring} ${cfg.color} text-white shadow-lg`}>
            <span className="text-3xl font-bold">{cfg.label}</span>
        </div>
    );
};

// ─── Score circle (CSS arc) ───────────────────────────────────────────────────

const ScoreCircle = ({ score }) => {
    const value = Math.round(score ?? 0);
    const circumference = 2 * Math.PI * 44;
    const dash = (value / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden>
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-white/10" />
                <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference}`}
                />
                <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF8C6E" />
                        <stop offset="100%" stopColor="#E14219" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="absolute text-2xl font-bold text-[#141619] dark:text-[#E8ECF3]">{value}%</span>
        </div>
    );
};

// ─── Skill bar ────────────────────────────────────────────────────────────────

const SkillBar = ({ skill, score, label, isWeak, t }) => {
    const value = Math.round(score ?? 0);
    const barColor = SKILL_COLORS[skill] ?? 'bg-gray-400';

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-[#141619] dark:text-[#E8ECF3]">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">{pct(value)}</span>
                    {isWeak ? (
                        <span className="text-amber-500"><ExclamationIcon /></span>
                    ) : (
                        <span className="text-green-500"><CheckCircleIcon /></span>
                    )}
                </div>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColor} rounded-full transition-all duration-700`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {isWeak ? t('assessment.result.needsWorkLabel') : t('assessment.result.masteredLabel')}
            </p>
        </div>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ResultSkeleton = () => (
    <div className="motion-safe:animate-pulse space-y-6 max-w-screen-md mx-auto">
        <div className="flex gap-6 items-center">
            <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="h-5 w-1/2 rounded-full bg-gray-100 dark:bg-white/10" />
                <div className="h-4 w-3/4 rounded-full bg-gray-100 dark:bg-white/10" />
            </div>
        </div>
        {[0, 1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
                <div className="h-3 w-1/4 rounded-full bg-gray-100 dark:bg-white/10" />
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/10" />
            </div>
        ))}
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const EnglishPlacementResultPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] ?? 'ky';

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);

        getAttemptResult(attemptId)
            .then(data => {
                if (!cancelled) setResult(data);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [attemptId]);

    const level = result?.overallLevel ?? 'A0';
    const levelCfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.A0;
    const skillScores = result?.skillScores ?? {};
    const weakSkills = result?.weakSkills ?? [];
    const rec = result?.recommendation;

    const recTitle = rec
        ? (rec[`learningPathTitle${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ?? rec.learningPathTitleEn ?? '')
        : null;
    const recMessage = rec
        ? (rec[`message${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ?? rec.messageEn ?? '')
        : null;

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            {/* Hero */}
            <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-orange-50/50 via-white to-white dark:from-orange-950/10 dark:via-[#222222] dark:to-[#222222]">
                <div className="px-4 pt-12 pb-10 sm:px-6 lg:px-12 max-w-screen-md mx-auto text-center">
                    <h1 className="font-suisse font-bold text-2xl sm:text-3xl text-[#141619] dark:text-[#E8ECF3] mb-2">
                        {t('assessment.result.title')}
                    </h1>
                </div>
            </div>

            <div className="px-4 py-10 sm:px-6 lg:px-12 max-w-screen-md mx-auto space-y-8">
                {loading ? (
                    <ResultSkeleton />
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-4">{t('assessment.result.loadError')}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/15 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                            <RefreshIcon /> Retry
                        </button>
                    </div>
                ) : result ? (
                    <>
                        {/* Level + Score row */}
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                            <div className="text-center">
                                <LevelBadge level={level} />
                                <p className={`mt-3 font-bold text-lg ${levelCfg.text} dark:${levelCfg.text}`}>
                                    {t(`assessment.result.levels.${level}`)}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {t('assessment.result.yourLevel')}
                                </p>
                            </div>

                            <div className="w-px h-20 bg-gray-100 dark:bg-white/10 hidden sm:block" />
                            <div className="h-px w-20 bg-gray-100 dark:bg-white/10 block sm:hidden" />

                            <div className="text-center">
                                <ScoreCircle score={result.score} />
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    {t('assessment.result.score')}
                                </p>
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <p className="text-[#141619] dark:text-[#E8ECF3] text-sm leading-relaxed">
                                    {t(`assessment.result.levelDescriptions.${level}`)}
                                </p>
                            </div>
                        </div>

                        {/* Skill breakdown */}
                        <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                            <h2 className="font-semibold text-base mb-5 text-[#141619] dark:text-[#E8ECF3]">
                                {t('assessment.result.skillBreakdown')}
                            </h2>
                            <div className="space-y-5">
                                {SKILLS.map(skill => (
                                    <SkillBar
                                        key={skill}
                                        skill={skill}
                                        score={skillScores[skill] ?? 0}
                                        label={t(`assessment.result.skills.${skill}`)}
                                        isWeak={weakSkills.includes(skill)}
                                        t={t}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Weak skills */}
                        {weakSkills.length > 0 && (
                            <div className="p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20">
                                <h2 className="font-semibold text-sm text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                                    <ExclamationIcon />
                                    {t('assessment.result.weakSkills')}
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {weakSkills.map(skill => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                                        >
                                            {t(`assessment.result.skills.${skill}`)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendation */}
                        {rec && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-[#1a1a1a] border border-orange-100 dark:border-orange-900/30">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#E14219] mb-2">
                                    {t('assessment.result.recommendation')}
                                </p>
                                {recTitle && (
                                    <h2 className="font-bold text-lg text-[#141619] dark:text-[#E8ECF3] mb-2">
                                        {recTitle}
                                    </h2>
                                )}
                                {recMessage && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                                        {recMessage}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (rec.startLessonId) {
                                            navigate(`/lesson/${rec.startLessonId}`);
                                        } else if (rec.startModuleId) {
                                            navigate(`/module/${rec.startModuleId}`);
                                        } else {
                                            navigate('/courses');
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white font-semibold shadow-md hover:brightness-105 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E14219]"
                                >
                                    {t('assessment.result.startLearning')}
                                    <ArrowRightIcon />
                                </button>
                            </div>
                        )}

                        {/* Retake */}
                        <div className="text-center pt-2">
                            <Link
                                to="/assessment/start"
                                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-colors"
                            >
                                <RefreshIcon />
                                {t('assessment.result.retakeTest')}
                            </Link>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default EnglishPlacementResultPage;

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '@app/providers';
import { CAREER_INTENT, buildSignupUrl } from '../utils/careerLimits';

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconLock = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

const IconGlobe = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

const IconCheck = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const IconX = ({ className = 'w-3 h-3' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const IconBriefcase = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const IconSparkle = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
    </svg>
);

// ─── Score badge ───────────────────────────────────────────────────────────────

const scoreStyle = (score) => {
    if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    return 'bg-gray-100 dark:bg-white/5 text-[#3E424A] dark:text-[#a6adba] border-gray-200 dark:border-white/10';
};

// ─── Locked action button ──────────────────────────────────────────────────────

const LockedAction = ({ to, label, small }) => (
    <Link
        to={to}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-medium text-[#3E424A] dark:text-[#a6adba] hover:bg-gray-50 dark:hover:bg-white/8 transition-colors ${
            small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
    >
        <IconLock className="w-3 h-3 text-gray-400 flex-shrink-0" />
        {label}
    </Link>
);

// ─── Job match skeleton card ───────────────────────────────────────────────────

export const JobMatchCardSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <div className="h-5 w-2/3 bg-gray-200 dark:bg-white/10 rounded mb-2" />
                <div className="h-3.5 w-2/5 bg-gray-100 dark:bg-white/5 rounded" />
            </div>
            <div className="h-7 w-14 bg-gray-100 dark:bg-white/5 rounded-full ml-4" />
        </div>
        <div className="h-8 w-2/5 bg-gray-200 dark:bg-white/10 rounded mb-1" />
        <div className="h-3 w-1/4 bg-gray-100 dark:bg-white/5 rounded mb-4" />
        <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded mb-1" />
        <div className="h-3 w-4/5 bg-gray-100 dark:bg-white/5 rounded mb-4" />
        <div className="flex flex-wrap gap-1.5 mb-4">
            {[4, 5, 3, 6].map((w, i) => (
                <div key={i} className={`h-5 w-${w * 4} bg-gray-100 dark:bg-white/5 rounded-full`} />
            ))}
        </div>
        <div className="flex gap-2">
            <div className="h-8 flex-1 bg-gray-100 dark:bg-white/5 rounded-lg" />
            <div className="h-8 w-24 bg-gray-100 dark:bg-white/5 rounded-lg" />
        </div>
    </div>
);

// ─── JobMatchCard ──────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {import('../hooks/useJobMatches').JobMatch} props.match
 * @param {string} [props.draftId] — for locked action URLs
 */
const JobMatchCard = ({ match, draftId }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);

    const {
        id: jobId,
        title,
        company,
        location,
        isRemote,
        salaryMin,
        salaryMax,
        score,
        matchedSkills = [],
        missingSkills = [],
        explanation,
        asksCoverLetter,
        hiresInternationally,
    } = match;

    const salaryLabel = salaryMin && salaryMax
        ? `$${Number(salaryMin).toLocaleString()}–$${Number(salaryMax).toLocaleString()}`
        : salaryMin
        ? `From $${Number(salaryMin).toLocaleString()}`
        : null;

    const applyUrl   = buildSignupUrl({ intent: CAREER_INTENT.APPLY,         draftId, jobId });
    const coverUrl   = buildSignupUrl({ intent: CAREER_INTENT.COVER_LETTER,  draftId, jobId });
    const tailorUrl  = buildSignupUrl({ intent: CAREER_INTENT.TAILOR,        draftId, jobId });
    const interviewUrl = buildSignupUrl({ intent: CAREER_INTENT.INTERVIEW_PLAN, draftId, jobId });

    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden flex flex-col transition-shadow hover:shadow-md dark:hover:shadow-black/20">

            {/* ── Score bar ── */}
            <div
                className="h-1"
                style={{
                    background:
                        score >= 80 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                        score >= 60 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                      'linear-gradient(90deg, #E14219, #C2410C)',
                    width: `${score}%`,
                }}
            />

            <div className="p-6 flex flex-col flex-1">
                {/* ── Header: title + score ── */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-[#141619] dark:text-[#E8ECF3] leading-snug truncate">
                            {title}
                        </h3>
                        <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mt-0.5">
                            {company}
                            {location && <span className="text-xs ml-1.5 text-gray-400">· {location}</span>}
                        </p>
                    </div>

                    <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${scoreStyle(score)}`}>
                        {score}%
                    </span>
                </div>

                {/* ── Salary ── */}
                {salaryLabel ? (
                    <div className="mb-4">
                        <p className="text-2xl font-bold text-[#141619] dark:text-[#E8ECF3] leading-none">
                            {salaryLabel}
                        </p>
                        <p className="text-xs text-[#3E424A] dark:text-[#a6adba] mt-0.5">/ month · USD</p>
                    </div>
                ) : (
                    <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mb-4 italic">Salary not listed</p>
                )}

                {/* ── Badges ── */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {isRemote && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                            <IconGlobe className="w-3 h-3" />
                            {t('career.jobs.remote')}
                        </span>
                    )}
                    {hiresInternationally && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <IconCheck className="w-3 h-3" />
                            {t('career.jobs.hiresInternationally')}
                        </span>
                    )}
                </div>

                {/* ── Explanation ── */}
                {explanation && (
                    <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.03] px-4 py-3 mb-4">
                        <p className="text-xs font-semibold text-[#3E424A] dark:text-[#a6adba] mb-1 uppercase tracking-wide">
                            {score}% match — Why?
                        </p>
                        <p className="text-sm text-[#3E424A] dark:text-[#a6adba] leading-relaxed">
                            {explanation}
                        </p>
                    </div>
                )}

                {/* ── Skills ── */}
                {matchedSkills.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs font-semibold text-[#141619] dark:text-[#E8ECF3] mb-1.5">
                            {t('career.jobs.matchedSkills')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {matchedSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                                >
                                    <IconCheck className="w-3 h-3" />
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {missingSkills.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-[#141619] dark:text-[#E8ECF3] mb-1.5">
                            {t('career.jobs.missingSkills')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {missingSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-0.5 text-xs font-medium text-[#3E424A] dark:text-[#a6adba]"
                                >
                                    <IconX className="w-3 h-3 text-gray-400" />
                                    {skill}
                                </span>
                            ))}
                        </div>
                        {missingSkills.length > 0 && missingSkills.length <= 2 && (
                            <p className="mt-2 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                Missing{' '}
                                <span className="font-medium text-[#141619] dark:text-[#E8ECF3]">
                                    {missingSkills.join(', ')}
                                </span>
                                {' '}— EduBot can help you add{' '}
                                {missingSkills.length === 1 ? 'it' : 'them'} quickly.
                            </p>
                        )}
                    </div>
                )}

                {/* ── Cover letter prompt ── */}
                {asksCoverLetter && (
                    <div className="rounded-xl border border-[#E14219]/20 bg-[#E14219]/5 px-4 py-2.5 mb-4">
                        <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">
                            <span className="font-semibold text-[#141619] dark:text-[#E8ECF3]">Cover letter required</span>
                            {' '}— this job asks for one.
                        </p>
                    </div>
                )}

                {/* ── CTAs ── */}
                <div className="mt-auto pt-2">
                    {user ? (
                        /* Authenticated — real actions (wired in Phase 5) */
                        <div className="flex flex-wrap gap-2">
                            <button
                                disabled
                                title="Apply — coming in Phase 5"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-2.5 text-sm font-semibold text-white opacity-70 cursor-not-allowed"
                            >
                                <IconBriefcase className="w-4 h-4" />
                                {t('career.jobs.actions.apply')}
                            </button>
                            {asksCoverLetter && (
                                <button
                                    disabled
                                    title="Cover letter — coming in Phase 8"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] opacity-60 cursor-not-allowed"
                                >
                                    <IconSparkle className="w-4 h-4" />
                                    {t('career.jobs.actions.coverLetter')}
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Public — locked actions */
                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={applyUrl}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-2.5 text-sm font-semibold text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all"
                            >
                                <IconLock className="w-3.5 h-3.5" />
                                {t('career.jobs.actions.signupToApply')}
                            </Link>
                            <LockedAction to={tailorUrl}    label={t('career.jobs.actions.tailor')} small />
                            {asksCoverLetter && (
                                <LockedAction to={coverUrl} label={t('career.jobs.actions.coverLetter')} small />
                            )}
                            <LockedAction to={interviewUrl} label={t('career.jobs.actions.interviewPrep')} small />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobMatchCard;

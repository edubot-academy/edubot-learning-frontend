import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '@app/providers';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { useResumeDraft, DRAFT_STATUS } from '../hooks/useResumeDraft';
import { useJobMatches, JOB_MATCH_STATUS } from '../hooks/useJobMatches';
import { useCareerUsageStatus } from '../hooks/useCareerUsageStatus';
import ResumeBuilderForm, { ResumeBuilderError } from '../components/ResumeBuilderForm';
import ResumePreview from '../components/ResumePreview';
import ResumeReadinessScore from '../components/ResumeReadinessScore';
import JobMatchCard, { JobMatchCardSkeleton } from '../components/JobMatchCard';
import CareerSignupPrompt from '../components/CareerSignupPrompt';
import AiCreditsBadge from '../components/AiCreditsBadge';
import CareerLimitReachedModal from '../components/CareerLimitReachedModal';
import { CAREER_USAGE_KEYS, getUsageMetric, isCareerLimitReachedError, isUsageMetricExhausted } from '../utils/careerUsage';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrowRight = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
);

const IconPencil = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
);

const IconDocument = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const IconBriefcase = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

// ─── Static data ──────────────────────────────────────────────────────────────

const STEPS = [
    { number: 1, titleKey: 'career.public.steps.form',    descKey: 'career.public.steps.formDescription',    Icon: IconPencil },
    { number: 2, titleKey: 'career.public.steps.preview', descKey: 'career.public.steps.previewDescription', Icon: IconDocument },
    { number: 3, titleKey: 'career.public.steps.jobs',    descKey: 'career.public.steps.jobsDescription',    Icon: IconBriefcase },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const PublicResumeBuilderPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const { status, draft, error, generate, retry, reset, getSavedFormData } = useResumeDraft();
    const savedFormData = useMemo(() => getSavedFormData(), [getSavedFormData]);
    const { usage } = useCareerUsageStatus({ enabled: Boolean(user) });

    // Auto-fetch job matches once a draft is ready
    const { status: matchStatus, matches, refetch: refetchMatches } = useJobMatches(
        status === DRAFT_STATUS.READY ? draft?.id : null,
    );

    // Show up to 3 cards publicly, rest gated
    const PUBLIC_JOB_LIMIT = 3;
    const visibleMatches = user ? matches : matches.slice(0, PUBLIC_JOB_LIMIT);
    const hiddenCount    = user ? 0 : Math.max(0, matches.length - PUBLIC_JOB_LIMIT);

    // Lifted state so form + preview + score share the same template + extras
    const [selectedTemplate, setSelectedTemplate]   = useState('classic');
    const [lastFormData,     setLastFormData]        = useState(null);
    const [extras,           setExtras]              = useState({});
    const [extrasAdded,      setExtrasAdded]         = useState(false);

    const resultsRef = useRef(null);
    const recoveryState = location.state?.careerRecovery ?? null;
    const hasRecoveredFormData = !!savedFormData;
    const resumeUsageMetric = getUsageMetric(usage, CAREER_USAGE_KEYS.RESUME_GENERATIONS);
    const [limitModalOpen, setLimitModalOpen] = useState(false);

    // Merge generated resume header fields into formData so the score panel
    // recognises email/github/linkedin/location/experience/projects that the AI
    // already placed in the resume — even after a page refresh when extras resets.
    const enrichedFormData = useMemo(() => {
        const base = lastFormData ?? savedFormData ?? {};
        if (!draft?.generatedResume) return base;
        const header = draft.generatedResume?.header ?? {};
        const generatedResume = draft.generatedResume;
        return {
            ...base,
            email:      base.email      || header.email,
            github:     base.github     || header.github,
            linkedin:   base.linkedin   || header.linkedin,
            location:   base.location   || header.location,
            englishLevel: base.englishLevel,
            hasProjects: (generatedResume?.projects?.length ?? 0) > 0,
        };
    }, [lastFormData, savedFormData, draft]);

    const handleGenerate = useCallback((formData, templateId) => {
        setLastFormData(formData);
        setSelectedTemplate(templateId);
        setExtrasAdded(false);
        generate({ ...formData, extras }, templateId);
    }, [generate, extras]);

    const handleFormChange = useCallback((formData) => {
        setLastFormData(formData);
    }, []);

    const handleRetry = useCallback(() => {
        const saved = getSavedFormData();
        if (saved) {
            setLastFormData(saved);
        }
        retry(saved ?? {}, selectedTemplate);
    }, [getSavedFormData, retry, selectedTemplate]);

    const handleTemplateChange = useCallback((id) => {
        setSelectedTemplate(id);
        // No API call — template re-renders preview instantly from existing draft data
    }, []);

    const handleExtraChange = useCallback((key, value) => {
        setExtras((prev) => ({ ...prev, [key]: value }));
        setExtrasAdded(true);
    }, []);

    const handleRegenerate = useCallback(() => {
        if (!lastFormData) return;
        generate({ ...lastFormData, extras }, selectedTemplate);
        setExtrasAdded(false);
        // Scroll back to results
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }, [generate, lastFormData, extras, selectedTemplate]);

    const showResults = status === DRAFT_STATUS.READY || status === DRAFT_STATUS.GENERATING;
    const isResumeGenerationLocked = Boolean(user) && isUsageMetricExhausted(resumeUsageMetric);
    const hasLimitError = Boolean(error) && isCareerLimitReachedError(error);

    useEffect(() => {
        if (error && isCareerLimitReachedError(error)) {
            setLimitModalOpen(true);
        }
    }, [error]);

    useEffect(() => {
        if (status === DRAFT_STATUS.GENERATING) {
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [status]);

    return (
        <div className="bg-white dark:bg-[#141619] text-[#141619] dark:text-[#E8ECF3]">

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-[#0F1013] text-white px-6 py-28 sm:px-8 lg:px-12">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                    }}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[600px] w-[900px] rounded-full bg-[#E14219] opacity-[0.08] blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-4xl text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/70 backdrop-blur-sm mb-10">
                        <span className="h-2 w-2 rounded-full bg-[#FF8C6E]" />
                        EduBot Career — Free to try
                    </span>

                    <h1 className="font-suisse font-bold text-5xl leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                        {t('career.public.hero.title')}
                    </h1>

                    <p className="mt-8 text-xl leading-relaxed text-white/60 max-w-2xl mx-auto">
                        {t('career.public.hero.subtitle')}
                    </p>

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#builder"
                            className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-8 py-4 text-base font-semibold text-white shadow-lg hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95"
                        >
                            {t('career.public.hero.cta')}
                            <IconArrowRight />
                        </a>
                        <Link
                            to={CAREER_ROUTES.DASHBOARD}
                            className="inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white/80 hover:bg-white/10 hover:border-white/25 transition-all duration-300"
                        >
                            Go to Career Hub
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Trust strip ── */}
            <section className="border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0F1013] px-6 py-5">
                <div className="mx-auto max-w-5xl flex flex-wrap justify-center gap-x-10 gap-y-3">
                    {[
                        { full: 'English resume output',        short: 'English resume'    },
                        { full: 'ATS-safe formats',             short: 'ATS-safe format'   },
                        { full: 'Remote jobs from $2K/month',   short: 'From $2K/month'    },
                        { full: 'No account needed to preview', short: 'No signup to try'  },
                    ].map(({ full, short }) => (
                        <div key={full} className="flex items-center gap-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                            <IconCheck className="w-4 h-4 text-[#E14219] flex-shrink-0" />
                            <span className="hidden sm:inline">{full}</span>
                            <span className="sm:hidden">{short}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="px-6 py-24 sm:px-8 lg:px-12 bg-gray-50 dark:bg-[#141619]">
                <div className="mx-auto max-w-5xl">
                    <h2 className="font-suisse font-bold text-3xl sm:text-4xl text-center mb-16">
                        How it works
                    </h2>

                    {/* Desktop */}
                    <div className="hidden sm:grid sm:grid-cols-3 gap-0 relative">
                        <div className="absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-gray-200 via-[#E14219]/30 to-gray-200 dark:from-white/10 dark:via-[#E14219]/20 dark:to-white/10" />
                        {STEPS.map(({ number, titleKey, descKey, Icon }) => (
                            <div key={number} className="relative flex flex-col items-center text-center px-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E14219]/10 border border-[#E14219]/20 shadow-sm mb-5 relative z-10">
                                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-xs font-bold text-white shadow">
                                        {number}
                                    </span>
                                    <Icon className="w-7 h-7 text-[#E14219]" />
                                </div>
                                <p className="font-semibold text-base text-[#141619] dark:text-[#E8ECF3] mb-2">
                                    {t(titleKey)}
                                </p>
                                <p className="text-sm text-[#3E424A] dark:text-[#a6adba] leading-relaxed">
                                    {t(descKey)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden space-y-8">
                        {STEPS.map(({ number, titleKey, descKey, Icon }) => (
                            <div key={number} className="flex items-start gap-5">
                                <div className="relative flex-shrink-0">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E14219]/10 border border-[#E14219]/20 shadow-sm">
                                        <Icon className="w-6 h-6 text-[#E14219]" />
                                    </div>
                                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-[10px] font-bold text-white">
                                        {number}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-base text-[#141619] dark:text-[#E8ECF3]">{t(titleKey)}</p>
                                    <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">{t(descKey)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Builder ── */}
            <section id="builder" className="px-6 py-24 sm:px-8 lg:px-12 bg-white dark:bg-[#0F1013]">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <h2 className="font-suisse font-bold text-3xl sm:text-4xl">
                            {t('career.resume.builder.title')}
                        </h2>
                        <p className="mt-3 text-base text-[#3E424A] dark:text-[#a6adba] max-w-xl mx-auto">
                            Fill in a few fields and let AI write your English resume in seconds.
                        </p>
                        {user && resumeUsageMetric ? (
                            <div className="mt-4 flex justify-center">
                                <AiCreditsBadge
                                    metricKey={CAREER_USAGE_KEYS.RESUME_GENERATIONS}
                                    metric={resumeUsageMetric}
                                />
                            </div>
                        ) : null}
                    </div>

                    {recoveryState?.type === 'draft_expired' && (
                        <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-5 py-4">
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                {t('career.intent.recovery.title')}
                            </p>
                            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                                {hasRecoveredFormData
                                    ? t('career.intent.recovery.restored')
                                    : t('career.intent.recovery.empty')}
                            </p>
                        </div>
                    )}

                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
                        {status === DRAFT_STATUS.ERROR && !hasLimitError ? (
                            <ResumeBuilderError error={error} onRetry={handleRetry} />
                        ) : (
                            <ResumeBuilderForm
                                onGenerate={handleGenerate}
                                status={status}
                                savedFormData={savedFormData}
                                initialTemplate={selectedTemplate}
                                onTemplateChange={handleTemplateChange}
                                onFormChange={handleFormChange}
                                generateLocked={isResumeGenerationLocked}
                                lockedHint={isResumeGenerationLocked ? t('career.usage.lockedHint') : null}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* ── Results: Score + Preview (slides in after generation) ── */}
            {showResults && (
                <section
                    ref={resultsRef}
                    className="px-6 pb-24 sm:px-8 lg:px-12 bg-white dark:bg-[#0F1013]"
                >
                    <div className="mx-auto max-w-5xl">
                        {/* Generating banner */}
                        {status === DRAFT_STATUS.GENERATING && (
                            <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#E14219]/20 bg-[#E14219]/5 px-6 py-4 mb-8">
                                <svg className="w-5 h-5 animate-spin text-[#E14219]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-sm font-medium text-[#E14219]">AI is writing your resume…</span>
                            </div>
                        )}

                        {/* Two-column: Score (left) + Preview (right) */}
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Score panel */}
                            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                                <ResumeReadinessScore
                                    formData={enrichedFormData}
                                    apiScore={draft?.readinessScore ?? null}
                                    extras={extras}
                                    onExtraChange={handleExtraChange}
                                    onRegenerate={handleRegenerate}
                                    hasExtrasToRegenerate={extrasAdded}
                                />
                            </div>

                            {/* Preview panel */}
                            <div className="flex-1 min-w-0">
                                <ResumePreview
                                    draft={draft}
                                    formData={enrichedFormData}
                                    templateId={selectedTemplate}
                                    onTemplateChange={handleTemplateChange}
                                />
                            </div>
                        </div>

                        {/* Start over */}
                        {status === DRAFT_STATUS.READY && (
                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => { reset(); setLastFormData(null); setExtras({}); setExtrasAdded(false); }}
                                    className="text-sm text-[#3E424A] dark:text-[#a6adba] hover:text-[#141619] dark:hover:text-[#E8ECF3] transition-colors"
                                >
                                    Start over with a new resume
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <CareerLimitReachedModal
                open={limitModalOpen}
                onClose={() => setLimitModalOpen(false)}
                metricKey={CAREER_USAGE_KEYS.RESUME_GENERATIONS}
                metric={resumeUsageMetric}
            />

            {/* ── Job matches ── */}
            {showResults && status === DRAFT_STATUS.READY && (
                <section className="px-6 py-20 sm:px-8 lg:px-12 bg-gray-50 dark:bg-[#141619] border-t border-gray-100 dark:border-white/5">
                    <div className="mx-auto max-w-5xl">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="font-suisse font-bold text-2xl sm:text-3xl text-[#141619] dark:text-[#E8ECF3]">
                                    {t('career.jobs.title')}
                                </h2>
                                <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                    {t('career.jobs.subtitle')} — Remote · USD salaries
                                </p>
                            </div>
                            {matchStatus === JOB_MATCH_STATUS.LOADING && (
                                <span className="flex items-center gap-2 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                    <svg className="w-4 h-4 animate-spin text-[#E14219]" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Finding matches…
                                </span>
                            )}
                        </div>

                        {/* Loading skeletons */}
                        {matchStatus === JOB_MATCH_STATUS.LOADING && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <JobMatchCardSkeleton />
                                <JobMatchCardSkeleton />
                                <JobMatchCardSkeleton />
                            </div>
                        )}

                        {/* Error state */}
                        {matchStatus === JOB_MATCH_STATUS.ERROR && (
                            <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 px-6 py-8 text-center mb-8">
                                <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mb-3">
                                    {t('career.errors.matchFailed')}
                                </p>
                                <button
                                    type="button"
                                    onClick={refetchMatches}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] hover:bg-gray-50 transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Real job cards */}
                        {matchStatus === JOB_MATCH_STATUS.READY && visibleMatches.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                {visibleMatches.map((match) => (
                                    <JobMatchCard key={match.id ?? match.jobId} match={match} draftId={draft?.id} />
                                ))}
                            </div>
                        )}

                        {/* Empty state — API returned no matches */}
                        {matchStatus === JOB_MATCH_STATUS.READY && matches.length === 0 && (
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-6 py-12 text-center mb-8">
                                <p className="font-suisse font-semibold text-base text-[#141619] dark:text-[#E8ECF3] mb-2">
                                    Job matching coming soon
                                </p>
                                <p className="text-sm text-[#3E424A] dark:text-[#a6adba] max-w-sm mx-auto">
                                    We&apos;re building the job matching engine. Save your resume now and we&apos;ll notify you when matches are ready.
                                </p>
                            </div>
                        )}

                        {/* Signup prompt — shown for non-auth users after visible cards */}
                        {!user && matchStatus === JOB_MATCH_STATUS.READY && (
                            <CareerSignupPrompt draftId={draft?.id} hiddenCount={hiddenCount} />
                        )}

                        {/* Signup prompt — shown even while loading (proactively) for non-auth users */}
                        {!user && matchStatus === JOB_MATCH_STATUS.LOADING && (
                            <div className="mt-8">
                                <CareerSignupPrompt draftId={draft?.id} hiddenCount={0} />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── Bottom CTA (guests only) ── */}
            {!user && (
                <section className="px-6 py-14 sm:px-8 bg-gray-50 dark:bg-[#141619] border-t border-gray-100 dark:border-white/5">
                    <div className="mx-auto max-w-xl text-center">
                        <p className="text-base text-[#3E424A] dark:text-[#a6adba] mb-2">
                            Already have an account?
                        </p>
                        <Link
                            to={CAREER_ROUTES.DASHBOARD}
                            className="inline-flex items-center gap-2 text-base font-semibold text-[#E14219] hover:text-[#C2410C] transition-colors"
                        >
                            Go to Career Hub <IconArrowRight />
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
};

export default PublicResumeBuilderPage;

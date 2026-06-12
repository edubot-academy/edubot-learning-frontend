import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '@app/providers';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { useCareerIntent, INTENT_STATUS } from '../hooks/useCareerIntent';
import { getApplications } from '../api/applicationApi';
import { getCoverLetters } from '../api/coverLetterApi';
import { getJobMatchesByResume } from '../api/jobMatchApi';
import { getResumes } from '../api/resumeApi';
import { getCareerUsage } from '../api/usageApi';
import ApplicationKanbanBoard from '../components/ApplicationKanbanBoard';
import AiCreditsBadge from '../components/AiCreditsBadge';
import { CAREER_USAGE_KEYS, getCareerUpgradeUrl } from '../utils/careerUsage';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrowRight = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
);

const IconDocument = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const IconBriefcase = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const IconInbox = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
);

const IconSparkle = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

const IconRocket = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
);

const IconGlobe = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

const IconMail = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

const IconTarget = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
    </svg>
);

const IconCheckCircle = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.78-9.47a.75.75 0 10-1.06-1.06L9.25 10.94 7.28 8.97a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4-4z" clipRule="evenodd" />
    </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const METRIC_CARDS = [
    {
        key: 'resumeReadiness',
        Icon: IconDocument,
        link: CAREER_ROUTES.RESUMES,
        accent: 'orange',
    },
    {
        key: 'bestMatch',
        Icon: IconGlobe,
        link: CAREER_ROUTES.JOBS,
        accent: 'green',
    },
    {
        key: 'applications',
        Icon: IconInbox,
        link: CAREER_ROUTES.APPLICATIONS,
        accent: 'blue',
    },
    {
        key: 'aiCredits',
        Icon: IconSparkle,
        link: CAREER_ROUTES.USAGE,
        accent: 'purple',
    },
];

const ACCENT = {
    orange: 'bg-[#FFF3EF] dark:bg-[#E14219]/10 text-[#E14219]',
    green:  'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400',
    blue:   'bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400',
    purple: 'bg-violet-50 dark:bg-violet-900/15 text-violet-600 dark:text-violet-400',
};

const NAV_SECTIONS = [
    { label: 'Resumes',        to: CAREER_ROUTES.RESUMES,        Icon: IconDocument },
    { label: 'Jobs',           to: CAREER_ROUTES.JOBS,           Icon: IconBriefcase },
    { label: 'Applications',   to: CAREER_ROUTES.APPLICATIONS,   Icon: IconInbox },
    { label: 'Cover Letters',  to: CAREER_ROUTES.COVER_LETTERS,  Icon: IconMail },
    { label: 'Interview Prep', to: CAREER_ROUTES.INTERVIEW_PREP, Icon: IconTarget },
    { label: 'AI Usage',       to: CAREER_ROUTES.USAGE,          Icon: IconSparkle },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetricCard = ({ card, t }) => {
    const { Icon } = card;
    const accentClass = ACCENT[card.accent];

    return (
        <Link
            to={card.link}
            className="group relative flex flex-col gap-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <IconArrowRight className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-[#E14219] group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
            <div>
                <p className="text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                    {t(`career.dashboard.cards.${card.key}`)}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                        {card.value}
                    </span>
                    <span className="text-sm text-[#3E424A] dark:text-[#a6adba]">
                        {card.unit}
                    </span>
                </div>
            </div>
        </Link>
    );
};

const formatSalary = (job) => {
    if (!job?.salaryMin && !job?.salaryMax) return null;
    if (job.salaryMin && job.salaryMax) {
        return `$${Number(job.salaryMin).toLocaleString()}-$${Number(job.salaryMax).toLocaleString()}`;
    }
    return `From $${Number(job.salaryMin || job.salaryMax).toLocaleString()}`;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CareerDashboardPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const firstName = user?.firstName || user?.name?.split(' ')[0] || '';
    const [resumes, setResumes] = useState([]);
    const [matches, setMatches] = useState([]);
    const [applications, setApplications] = useState([]);
    const [coverLetters, setCoverLetters] = useState([]);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [error, setError] = useState(null);

    // Process any pending career intent (draft claim + redirect) on mount
    const { hasIntent, status: intentStatus } = useCareerIntent();
    const latestResume = resumes[0] ?? null;
    const intentResult = location.state?.careerIntentResult ?? null;
    const nextActionPath =
        intentResult?.nextPath && intentResult.nextPath !== CAREER_ROUTES.DASHBOARD
            ? intentResult.nextPath
            : intentResult?.resumeId
                ? CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', intentResult.resumeId)
                : CAREER_ROUTES.RESUMES;

    useEffect(() => {
        let mounted = true;

        Promise.all([
            getResumes(),
            getCareerUsage(),
            getApplications().catch(() => []),
            getCoverLetters().catch(() => []),
        ])
            .then(([resumeData, usageData, applicationData, coverLetterData]) => {
                if (!mounted) return;
                setResumes(Array.isArray(resumeData) ? resumeData : []);
                setUsage(usageData ?? null);
                setApplications(Array.isArray(applicationData) ? applicationData : []);
                setCoverLetters(Array.isArray(coverLetterData) ? coverLetterData : []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!latestResume?.id) {
            setMatches([]);
            return;
        }

        let mounted = true;
        setLoadingMatches(true);
        getJobMatchesByResume(latestResume.id)
            .then((data) => {
                if (!mounted) return;
                setMatches(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err);
            })
            .finally(() => {
                if (mounted) setLoadingMatches(false);
            });

        return () => {
            mounted = false;
        };
    }, [latestResume?.id]);

    const activeApplications = useMemo(
        () => applications.filter((item) => item.status !== 'rejected').length,
        [applications],
    );
    const bestMatch = matches[0] ?? null;
    const jobsById = useMemo(
        () => new Map(matches.map((item) => [item.jobId, item])),
        [matches],
    );
    const resumesById = useMemo(
        () => new Map(resumes.map((item) => [item.id, item])),
        [resumes],
    );
    const coverLettersById = useMemo(
        () => new Map(coverLetters.map((item) => [item.id, item])),
        [coverLetters],
    );
    const resumeGenerationUsage = usage?.usage?.resumeGenerations ?? null;
    const jobMatchUsage = usage?.usage?.jobMatchRequests ?? null;
    const coverLetterUsage = usage?.usage?.coverLetters ?? null;
    const recommendedNextStep = useMemo(() => {
        if (!latestResume) {
            return {
                title: t('career.dashboard.nextSteps.noResume'),
                subtitle: t('career.dashboard.emptyState.resumesSubtitle'),
                cta: t('career.dashboard.nextSteps.noResume'),
                to: CAREER_ROUTES.PUBLIC_BUILDER,
            };
        }

        if (!bestMatch) {
            return {
                title: t('career.dashboard.nextSteps.noMatches'),
                subtitle: t('career.dashboard.emptyState.jobsSubtitle'),
                cta: t('career.dashboard.nextSteps.noMatches'),
                to: CAREER_ROUTES.JOBS,
            };
        }

        if (activeApplications > 0) {
            return {
                title: t('career.dashboard.nextSteps.hasApplications', { count: activeApplications }),
                subtitle: bestMatch.company
                    ? `${bestMatch.title} · ${bestMatch.company}`
                    : bestMatch.title,
                cta: t('career.dashboard.cards.applications'),
                to: CAREER_ROUTES.APPLICATIONS,
            };
        }

        return {
            title: t('career.dashboard.nextSteps.noApplications', { salary: formatSalary(bestMatch) || '$2,000+' }),
            subtitle: bestMatch.company
                ? `${bestMatch.title} · ${bestMatch.company}`
                : bestMatch.title,
            cta: t('career.jobs.actions.apply'),
            to: CAREER_ROUTES.JOB_DETAIL.replace(':jobId', bestMatch.jobId),
        };
    }, [activeApplications, bestMatch, latestResume, t]);

    const metricCards = useMemo(() => ([
        {
            ...METRIC_CARDS[0],
            value: latestResume?.readinessScore ?? '—',
            unit: latestResume ? '/ 100' : '',
        },
        {
            ...METRIC_CARDS[1],
            value: bestMatch?.score != null ? `${bestMatch.score}%` : '—',
            unit: bestMatch?.salaryMax || bestMatch?.salaryMin ? 'top match' : '',
        },
        {
            ...METRIC_CARDS[2],
            value: activeApplications,
            unit: activeApplications === 1 ? 'active' : 'active',
        },
        {
            ...METRIC_CARDS[3],
            value: resumeGenerationUsage?.remaining ?? '—',
            unit: resumeGenerationUsage ? `/ ${resumeGenerationUsage.limit} left` : '',
        },
    ]), [activeApplications, bestMatch?.salaryMax, bestMatch?.salaryMin, bestMatch?.score, latestResume, resumeGenerationUsage]);

    if (hasIntent && intentStatus === INTENT_STATUS.CLAIMING) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#141619] flex items-center justify-center">
                <div className="text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] mx-auto mb-4 shadow-lg">
                        <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                    <p className="font-suisse font-semibold text-lg text-[#141619] dark:text-[#E8ECF3]">
                        Saving your resume…
                    </p>
                    <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mt-1">
                        Linking your draft to your new account.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] text-[#141619] dark:text-[#E8ECF3]">
            <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-12">

                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-10">
                    <div>
                        <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest mb-1.5">
                            EduBot Career
                        </p>
                        <h1 className="font-suisse font-bold text-3xl sm:text-4xl">
                            {firstName ? `${firstName}'s Career Hub` : t('career.dashboard.title')}
                        </h1>
                        <p className="mt-2 text-base text-[#3E424A] dark:text-[#a6adba] max-w-lg">
                            {t('career.dashboard.welcome.subtitle')}
                        </p>
                    </div>
                    <Link
                        to={recommendedNextStep.to}
                        className="inline-flex flex-shrink-0 items-center gap-2.5 self-start rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95"
                    >
                        <IconRocket className="w-4 h-4" />
                        {recommendedNextStep.cta}
                    </Link>
                </div>

                {intentResult?.type === 'claim_success' && (
                    <div className="mb-7 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-50 via-white to-orange-50 dark:from-emerald-900/15 dark:via-[#1a1a1a] dark:to-[#E14219]/10 p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                    <IconCheckCircle className="w-4 h-4" />
                                    {t('career.intent.success.badge')}
                                </div>
                                <h2 className="mt-3 font-suisse text-2xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                                    {t('career.intent.success.title')}
                                </h2>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-[#3E424A] dark:text-[#a6adba]">
                                    {t('career.intent.success.subtitle')}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2.5 text-sm">
                                    <span className="rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[#141619] dark:text-[#E8ECF3]">
                                        {t('career.intent.success.points.saved')}
                                    </span>
                                    <span className="rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[#141619] dark:text-[#E8ECF3]">
                                        {t('career.intent.success.points.jobs')}
                                    </span>
                                    <span className="rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[#141619] dark:text-[#E8ECF3]">
                                        {t('career.intent.success.points.tools')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5 sm:min-w-56">
                                <Link
                                    to={nextActionPath}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-[#C2410C] hover:to-[#C2410C] transition-colors"
                                >
                                    {t('career.intent.success.primaryCta')}
                                    <IconArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to={CAREER_ROUTES.JOBS}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] hover:border-[#E14219]/30 hover:text-[#E14219] transition-colors"
                                >
                                    {t('career.intent.success.secondaryCta')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Metric cards ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-7">
                    {metricCards.map((card) => (
                        <MetricCard key={card.key} card={card} t={t} />
                    ))}
                </div>

                <Link
                    to={recommendedNextStep.to}
                    className="group mb-10 flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3EF] text-[#E14219] dark:bg-[#E14219]/10">
                            <IconRocket className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                {t('career.dashboard.cards.nextStep')}
                            </p>
                            <p className="mt-1 text-xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                                {recommendedNextStep.title}
                            </p>
                            <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                {recommendedNextStep.subtitle}
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#E14219] group-hover:text-[#C2410C]">
                        {recommendedNextStep.cta}
                        <IconArrowRight className="w-4 h-4" />
                    </span>
                </Link>

                {/* ── Section navigation pills ── */}
                <div className="flex flex-wrap gap-2.5 mb-10">
                    {NAV_SECTIONS.map(({ label, to, Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] hover:border-[#E14219]/40 hover:text-[#E14219] transition-colors duration-200"
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* ── Main two-column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Left — Resume status */}
                    <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <IconDocument className="w-4 h-4 text-[#3E424A] dark:text-[#a6adba]" />
                                <p className="text-sm font-semibold">{t('career.dashboard.cards.savedResumes')}</p>
                            </div>
                            <Link
                                to={CAREER_ROUTES.RESUMES}
                                className="text-xs font-medium text-[#E14219] hover:text-[#C2410C] transition-colors"
                            >
                                View all
                            </Link>
                        </div>

                        {loading ? (
                            <div className="px-6 py-12 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                Loading resumes...
                            </div>
                        ) : latestResume ? (
                            <div className="px-6 py-5">
                                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-5 mb-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#E14219] mb-1">
                                                Latest resume
                                            </p>
                                            <h2 className="font-semibold text-lg text-[#141619] dark:text-[#E8ECF3]">
                                                {latestResume.name || 'My Resume'}
                                            </h2>
                                            <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                                {latestResume.generatedResume?.header?.role || latestResume.input?.targetRole || 'Resume'}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-3xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                                                {latestResume.readinessScore ?? '—'}
                                            </p>
                                            <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">Readiness score</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            to={CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', latestResume.id)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-2.5 text-sm font-semibold text-white"
                                        >
                                            Open resume
                                            <IconArrowRight />
                                        </Link>
                                        <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                            {latestResume.templateId || 'classic'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    {resumes.slice(0, 3).map((resume) => (
                                        <Link
                                            key={resume.id}
                                            to={CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', resume.id)}
                                            className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-white/10 px-4 py-3 hover:border-[#E14219]/30"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-[#141619] dark:text-[#E8ECF3]">{resume.name || 'My Resume'}</p>
                                                <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">
                                                    {resume.generatedResume?.header?.role || resume.input?.targetRole || 'Resume'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">{resume.readinessScore ?? '—'}</p>
                                                <p className="text-[11px] text-[#3E424A] dark:text-[#a6adba]">score</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                    <IconDocument className="w-8 h-8 text-gray-300 dark:text-white/20" />
                                </div>
                                <p className="text-base font-semibold text-[#141619] dark:text-[#E8ECF3]">
                                    {t('career.dashboard.emptyState.resumes')}
                                </p>
                                <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba] max-w-xs">
                                    {t('career.dashboard.emptyState.resumesSubtitle')}
                                </p>
                                <Link
                                    to={CAREER_ROUTES.PUBLIC_BUILDER}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95"
                                >
                                    {t('career.dashboard.nextSteps.noResume')}
                                    <IconArrowRight />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right — Job matches + quick actions */}
                    <div className="flex flex-col gap-4">

                        {/* Job matches */}
                        <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <IconGlobe className="w-4 h-4 text-[#3E424A] dark:text-[#a6adba]" />
                                    <p className="text-sm font-semibold">{t('career.jobs.title')}</p>
                                </div>
                                <span className="rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#3E424A] dark:text-[#a6adba]">
                                    {t('career.jobs.subtitle')}
                                </span>
                            </div>
                            {loadingMatches ? (
                                <div className="px-5 py-8 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                    Loading matches...
                                </div>
                            ) : bestMatch ? (
                                <div className="px-5 py-5">
                                    <Link
                                        to={CAREER_ROUTES.JOB_DETAIL.replace(':jobId', bestMatch.jobId)}
                                        className="block rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-4 hover:border-[#E14219]/30"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-[#141619] dark:text-[#E8ECF3]">{bestMatch.title}</p>
                                                <p className="mt-1 text-xs text-[#3E424A] dark:text-[#a6adba]">{bestMatch.company}</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                {bestMatch.score}%
                                            </span>
                                        </div>
                                        {(bestMatch.salaryMax || bestMatch.salaryMin) ? (
                                            <p className="mt-3 text-sm font-medium text-[#141619] dark:text-[#E8ECF3]">
                                                {bestMatch.salaryMin && bestMatch.salaryMax
                                                    ? `$${Number(bestMatch.salaryMin).toLocaleString()}-$${Number(bestMatch.salaryMax).toLocaleString()}`
                                                    : `From $${Number(bestMatch.salaryMin).toLocaleString()}`}
                                            </p>
                                        ) : null}
                                        <p className="mt-3 text-xs text-[#3E424A] dark:text-[#a6adba] line-clamp-3">
                                            {bestMatch.explanation}
                                        </p>
                                    </Link>

                                    {matches.slice(1, 3).length > 0 ? (
                                        <div className="mt-3 space-y-2">
                                            {matches.slice(1, 3).map((match) => (
                                                <Link
                                                    key={match.id}
                                                    to={CAREER_ROUTES.JOB_DETAIL.replace(':jobId', match.jobId)}
                                                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-white/10 px-3 py-2.5 hover:border-[#E14219]/30"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-[#141619] dark:text-[#E8ECF3]">{match.title}</p>
                                                        <p className="truncate text-xs text-[#3E424A] dark:text-[#a6adba]">{match.company}</p>
                                                    </div>
                                                    <span className="text-xs font-semibold text-[#E14219]">{match.score}%</span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                        <IconBriefcase className="w-6 h-6 text-gray-300 dark:text-white/20" />
                                    </div>
                                    <p className="text-xs font-medium text-[#3E424A] dark:text-[#a6adba]">
                                        {t('career.dashboard.emptyState.jobsSubtitle')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* AI Usage card */}
                        <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <IconSparkle className="w-4 h-4 text-violet-500" />
                                    <p className="text-sm font-semibold">{t('career.usage.title')}</p>
                                </div>
                                <span className="text-xs font-medium text-[#3E424A] dark:text-[#a6adba]">
                                    {usage?.plan || t('career.usage.plan.free')}
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                {[
                                    { key: CAREER_USAGE_KEYS.RESUME_GENERATIONS, metric: resumeGenerationUsage },
                                    { key: CAREER_USAGE_KEYS.JOB_MATCH_REQUESTS, metric: jobMatchUsage },
                                    { key: CAREER_USAGE_KEYS.COVER_LETTERS, metric: coverLetterUsage },
                                ].map(({ key, metric }) => (
                                    <div key={key}>
                                        {metric ? <AiCreditsBadge metricKey={key} metric={metric} compact /> : null}
                                    </div>
                                ))}
                            </div>
                            <Link
                                to={getCareerUpgradeUrl()}
                                className="mt-4 flex items-center justify-between text-xs font-medium text-[#E14219] hover:text-[#C2410C] transition-colors"
                            >
                                {t('career.usage.limitReached.upgradeCta')}
                                <IconArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                    <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">Applications pipeline</p>
                            <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                Saved, applied, interview, and final outcomes in one board.
                            </p>
                        </div>
                        <Link
                            to={CAREER_ROUTES.APPLICATIONS}
                            className="text-sm font-medium text-[#E14219] hover:text-[#C2410C]"
                        >
                            Open full tracker
                        </Link>
                    </div>
                    <div className="p-6">
                        <ApplicationKanbanBoard
                            applications={applications}
                            jobsById={jobsById}
                            resumesById={resumesById}
                            coverLettersById={coverLettersById}
                            readOnly
                            emptyMessage={t('career.dashboard.emptyState.applicationsSubtitle')}
                        />
                    </div>
                </div>

                {error ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-300">
                        Some dashboard data could not be loaded.
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default CareerDashboardPage;

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import JobMatchCard from '../components/JobMatchCard';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { createApplication, getApplications } from '../api/applicationApi';
import { getJobMatchesByResume, getJobs, getSavedJobs, removeSavedJob, saveJob } from '../api/jobMatchApi';
import { getResumes } from '../api/resumeApi';
import { useCareerUsageStatus } from '../hooks/useCareerUsageStatus';
import AiCreditsBadge from '../components/AiCreditsBadge';
import CareerLimitReachedModal from '../components/CareerLimitReachedModal';
import { CAREER_USAGE_KEYS, getUsageMetric, isCareerLimitReachedError, isUsageMetricExhausted } from '../utils/careerUsage';
import {
    CAREER_MARKETS,
    CAREER_WORK_MODES,
    filterJobsByMarket,
    filterJobsByWorkMode,
    getResumeJobMarketPreference,
    getResumeReadinessScore,
    getResumeWorkModePreference,
    isResumeReadyForJobActions,
} from '../utils/resumeMatch';

const JobMatchesPage = () => {
    const { t } = useTranslation();
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [matches, setMatches] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [saveBusyJobId, setSaveBusyJobId] = useState(null);
    const [applyBusyJobId, setApplyBusyJobId] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const [marketFilter, setMarketFilter] = useState('all');
    const [workModeFilter, setWorkModeFilter] = useState('remote_only');
    const { usage } = useCareerUsageStatus();
    const jobMatchMetric = getUsageMetric(usage, CAREER_USAGE_KEYS.JOB_MATCH_REQUESTS);
    const jobMatchLocked = isUsageMetricExhausted(jobMatchMetric);

    useEffect(() => {
        let mounted = true;
        Promise.all([getResumes(), getSavedJobs().catch(() => []), getApplications().catch(() => []), getJobs(12)])
            .then(([resumeData, savedData, applicationData, jobData]) => {
                if (!mounted) return;
                const nextResumes = Array.isArray(resumeData) ? resumeData : [];
                setResumes(nextResumes);
                setSelectedResumeId(nextResumes[0]?.id || '');
                setMarketFilter(getResumeJobMarketPreference(nextResumes[0]));
                setWorkModeFilter(getResumeWorkModePreference(nextResumes[0]));
                setSavedJobs(Array.isArray(savedData) ? savedData : []);
                setApplications(Array.isArray(applicationData) ? applicationData : []);
                setJobs(Array.isArray(jobData) ? jobData : []);
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
        let mounted = true;

        getJobs(12, { market: marketFilter, workMode: workModeFilter })
            .then((jobData) => {
                if (!mounted) return;
                setJobs(Array.isArray(jobData) ? jobData : []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err);
            });

        return () => {
            mounted = false;
        };
    }, [marketFilter, workModeFilter]);

    useEffect(() => {
        const selectedResume = resumes.find((resume) => resume.id === selectedResumeId) || null;
        const canFetchMatches = Boolean(selectedResumeId) && !jobMatchLocked && isResumeReadyForJobActions(selectedResume);

        if (!canFetchMatches) {
            setMatches([]);
            setLoadingMatches(false);
            return;
        }

        let mounted = true;
        setLoadingMatches(true);
        getJobMatchesByResume(selectedResumeId)
            .then((data) => {
                if (!mounted) return;
                setMatches(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (!mounted) return;
                if (isCareerLimitReachedError(err)) {
                    setLimitModalOpen(true);
                } else {
                    setError(err);
                }
            })
            .finally(() => {
                if (mounted) setLoadingMatches(false);
            });

        return () => {
            mounted = false;
        };
    }, [jobMatchLocked, resumes, selectedResumeId]);

    const applicationsByJobId = new Map();
    applications.forEach((item) => {
        if (!applicationsByJobId.has(item.jobId)) {
            applicationsByJobId.set(item.jobId, item);
        }
    });

    const savedJobIds = new Set(savedJobs.map((item) => item.jobId));
    const selectedResume = resumes.find((resume) => resume.id === selectedResumeId) || null;
    const selectedResumeReady = isResumeReadyForJobActions(selectedResume);
    const selectedResumeScore = getResumeReadinessScore(selectedResume);
    const filteredJobs = useMemo(
        () => filterJobsByWorkMode(filterJobsByMarket(jobs, marketFilter), workModeFilter),
        [jobs, marketFilter, workModeFilter],
    );
    const fallbackJobs = filteredJobs.map((job) => ({
        ...job,
        matchedSkills: [],
        missingSkills: [],
        explanation: '',
    }));
    const displayedItems = selectedResumeReady && matches.length > 0 ? matches : fallbackJobs;
    const gatingMessage = !selectedResumeId
        ? t('career.jobs.gating.noResume')
        : t('career.jobs.gating.incompleteResume');

    const handleToggleSave = async (jobId, isSaved) => {
        setSaveBusyJobId(jobId);
        setMessage(null);
        try {
            if (isSaved) {
                await removeSavedJob(jobId);
                setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
                setMessage('Job removed from saved.');
            } else {
                const saved = await saveJob(jobId);
                const job = jobs.find((item) => item.id === jobId);
                setSavedJobs((prev) => [{ ...saved, job }, ...prev.filter((item) => item.jobId !== jobId)]);
                setMessage('Job saved.');
            }
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Failed to update saved job.');
        } finally {
            setSaveBusyJobId(null);
        }
    };

    const handleApply = async (jobId) => {
        if (!selectedResumeId || !selectedResumeReady) return;
        setApplyBusyJobId(jobId);
        setMessage(null);
        try {
            const created = await createApplication({
                jobId,
                resumeId: selectedResumeId,
                status: 'applied',
                appliedAt: new Date().toISOString(),
            });
            setApplications((prev) => [created, ...prev.filter((item) => item.jobId !== jobId)]);
            setMessage('Application created.');
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Failed to create application.');
        } finally {
            setApplyBusyJobId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest mb-1.5">
                            EduBot Career
                        </p>
                        <h1 className="font-suisse font-bold text-3xl">{t('career.jobs.title')}</h1>
                        <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">{t('career.jobs.subtitle')}</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:items-end">
                        {jobMatchMetric ? (
                            <AiCreditsBadge metricKey={CAREER_USAGE_KEYS.JOB_MATCH_REQUESTS} metric={jobMatchMetric} />
                        ) : null}
                        <Link
                            to={CAREER_ROUTES.RESUMES}
                            className="text-sm font-medium text-[#E14219] hover:underline"
                        >
                            Open resumes
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-[#3E424A] dark:text-[#a6adba]">
                        Loading jobs...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-300">
                        {t('career.errors.matchFailed')}
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                        <div className="space-y-6">
                            {message ? (
                                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#3E424A] dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#a6adba]">
                                    {message}
                                </div>
                            ) : null}
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5">
                                <label className="block text-sm font-medium text-[#3E424A] dark:text-[#a6adba] mb-2">
                                    Match against resume
                                </label>
                                <select
                                    value={selectedResumeId}
                                    onChange={(e) => {
                                        const nextResumeId = e.target.value;
                                        const nextResume = resumes.find((resume) => resume.id === nextResumeId) || null;
                                        setSelectedResumeId(nextResumeId);
                                        setMarketFilter(getResumeJobMarketPreference(nextResume));
                                        setWorkModeFilter(getResumeWorkModePreference(nextResume));
                                    }}
                                    disabled={jobMatchLocked}
                                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                                >
                                    {resumes.length === 0 ? <option value="">No resumes yet</option> : null}
                                    {resumes.map((resume) => (
                                        <option key={resume.id} value={resume.id}>
                                            {resume.name}
                                        </option>
                                    ))}
                                </select>
                                {jobMatchLocked ? (
                                    <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                                        Credit limit reached. Upgrade to unlock more job match requests.
                                    </p>
                                ) : null}
                                <div className="mt-4">
                                    <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                        {t('career.jobs.gating.marketLabel')}
                                    </label>
                                    <select
                                        value={marketFilter}
                                        onChange={(e) => setMarketFilter(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                                    >
                                        {CAREER_MARKETS.map((market) => (
                                            <option key={market} value={market}>
                                                {t(`career.jobs.gating.markets.${market}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-4">
                                    <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                        {t('career.jobs.gating.workModeLabel')}
                                    </label>
                                    <select
                                        value={workModeFilter}
                                        onChange={(e) => setWorkModeFilter(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                                    >
                                        {CAREER_WORK_MODES.map((workMode) => (
                                            <option key={workMode} value={workMode}>
                                                {t(`career.jobs.gating.workModes.${workMode}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {!selectedResumeReady ? (
                                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
                                        <p className="font-medium">{t('career.jobs.gating.title')}</p>
                                        <p className="mt-1">{gatingMessage}</p>
                                        {selectedResumeId && selectedResumeScore != null ? (
                                            <p className="mt-2 text-xs">
                                                {t('career.resume.preview.score', { score: selectedResumeScore })}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>

                            {loadingMatches ? (
                                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                    Loading matches...
                                </div>
                            ) : displayedItems.length > 0 ? (
                                <div className="grid gap-4">
                                    {displayedItems.map((match) => {
                                        const itemJobId = match.jobId || match.id;
                                        const actionsLocked = !selectedResumeReady;

                                        return (
                                        <div key={match.id || itemJobId} className="space-y-2">
                                            <JobMatchCard
                                                match={{ ...match, id: itemJobId }}
                                                resumeId={selectedResumeId}
                                                actionsLocked={actionsLocked}
                                                actionLockReason={actionsLocked ? t('career.jobs.gating.actionLocked') : ''}
                                                isSaved={savedJobIds.has(itemJobId)}
                                                applicationStatus={applicationsByJobId.get(itemJobId)?.status || null}
                                                onToggleSave={handleToggleSave}
                                                onApply={handleApply}
                                                saveBusy={saveBusyJobId === itemJobId}
                                                applyBusy={applyBusyJobId === itemJobId}
                                            />
                                            <Link
                                                to={CAREER_ROUTES.JOB_DETAIL.replace(':jobId', itemJobId)}
                                                className="inline-flex text-sm font-medium text-[#E14219] hover:underline"
                                            >
                                                {t('career.jobs.actions.view')}
                                            </Link>
                                        </div>
                                    );})}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-8">
                                    <h2 className="font-semibold text-lg mb-2">{t('career.dashboard.emptyState.jobs')}</h2>
                                    <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        {jobMatchLocked
                                            ? t('career.usage.lockedHint')
                                            : t('career.dashboard.emptyState.jobsSubtitle')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5">
                                <h2 className="font-semibold text-lg mb-3">Saved jobs</h2>
                                {savedJobs.length === 0 ? (
                                    <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">No saved jobs yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {savedJobs.map((item) => (
                                            <Link key={item.id} to={CAREER_ROUTES.JOB_DETAIL.replace(':jobId', item.jobId)} className="block">
                                                <p className="font-medium">{item.job?.title}</p>
                                                <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">
                                                    {item.job?.company}
                                                    {applicationsByJobId.get(item.jobId)?.status ? ` · ${applicationsByJobId.get(item.jobId)?.status}` : ''}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5">
                                <h2 className="font-semibold text-lg mb-3">Published jobs</h2>
                                <div className="space-y-3">
                                    {jobs.map((job) => (
                                        <Link key={job.id} to={CAREER_ROUTES.JOB_DETAIL.replace(':jobId', job.id)} className="block">
                                            <p className="font-medium">{job.title}</p>
                                            <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">{job.company}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <CareerLimitReachedModal
                    open={limitModalOpen}
                    onClose={() => setLimitModalOpen(false)}
                    metricKey={CAREER_USAGE_KEYS.JOB_MATCH_REQUESTS}
                    metric={jobMatchMetric}
                />
            </div>
        </div>
    );
};

export default JobMatchesPage;

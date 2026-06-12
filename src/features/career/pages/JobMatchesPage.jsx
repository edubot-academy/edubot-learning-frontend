import { useEffect, useState } from 'react';
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
        if (!selectedResumeId || jobMatchLocked) {
            setMatches([]);
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
    }, [jobMatchLocked, selectedResumeId]);

    const applicationsByJobId = new Map();
    applications.forEach((item) => {
        if (!applicationsByJobId.has(item.jobId)) {
            applicationsByJobId.set(item.jobId, item);
        }
    });

    const savedJobIds = new Set(savedJobs.map((item) => item.jobId));

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
        if (!selectedResumeId) return;
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
                                    onChange={(e) => setSelectedResumeId(e.target.value)}
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
                            </div>

                            {loadingMatches ? (
                                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                    Loading matches...
                                </div>
                            ) : matches.length > 0 ? (
                                <div className="grid gap-4">
                                    {matches.map((match) => (
                                        <div key={match.id} className="space-y-2">
                                            <JobMatchCard
                                                match={{ ...match, id: match.jobId }}
                                                resumeId={selectedResumeId}
                                                isSaved={savedJobIds.has(match.jobId)}
                                                applicationStatus={applicationsByJobId.get(match.jobId)?.status || null}
                                                onToggleSave={handleToggleSave}
                                                onApply={handleApply}
                                                saveBusy={saveBusyJobId === match.jobId}
                                                applyBusy={applyBusyJobId === match.jobId}
                                            />
                                            <Link
                                                to={CAREER_ROUTES.JOB_DETAIL.replace(':jobId', match.jobId)}
                                                className="inline-flex text-sm font-medium text-[#E14219] hover:underline"
                                            >
                                                {t('career.jobs.actions.view')}
                                            </Link>
                                        </div>
                                    ))}
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

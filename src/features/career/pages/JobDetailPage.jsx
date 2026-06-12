import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { createApplication, getApplications } from '../api/applicationApi';
import { getResumes, tailorResumeForJob } from '../api/resumeApi';
import { getJobDetail, getSavedJobs, removeSavedJob, saveJob } from '../api/jobMatchApi';

const JobDetailPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        Promise.all([getJobDetail(jobId), getResumes(), getSavedJobs().catch(() => []), getApplications().catch(() => [])])
            .then(([jobData, resumeData, savedData, applicationData]) => {
                if (!mounted) return;
                setJob(jobData);
                const nextResumes = Array.isArray(resumeData) ? resumeData : [];
                setResumes(nextResumes);
                setSavedJobs(Array.isArray(savedData) ? savedData : []);
                setApplications(Array.isArray(applicationData) ? applicationData : []);
                setSelectedResumeId(nextResumes[0]?.id || '');
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
    }, [jobId]);

    const currentApplication = applications.find((item) => item.jobId === jobId) || null;
    const isSaved = savedJobs.some((item) => item.jobId === jobId);

    const handleSaveJob = async () => {
        setBusy(true);
        setMessage(null);
        try {
            if (isSaved) {
                await removeSavedJob(jobId);
                setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
                setMessage('Job removed from saved.');
            } else {
                const saved = await saveJob(jobId);
                setSavedJobs((prev) => [{ ...saved, job }, ...prev.filter((item) => item.jobId !== jobId)]);
                setMessage('Job saved.');
            }
        } catch {
            setMessage(t('career.errors.saveFailed'));
        } finally {
            setBusy(false);
        }
    };

    const handleTailor = async () => {
        if (!selectedResumeId) return;
        setBusy(true);
        setMessage(null);
        try {
            const tailored = await tailorResumeForJob(selectedResumeId, jobId);
            navigate(CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', tailored.id));
        } catch {
            setMessage(t('career.errors.saveFailed'));
        } finally {
            setBusy(false);
        }
    };

    const handleApply = async () => {
        if (!selectedResumeId || currentApplication) return;
        setBusy(true);
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
        } catch {
            setMessage(t('career.errors.saveFailed'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <Link to={CAREER_ROUTES.JOBS} className="text-sm text-[#E14219] hover:underline">
                    Back to jobs
                </Link>

                {loading ? (
                    <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-[#3E424A] dark:text-[#a6adba]">
                        Loading job...
                    </div>
                ) : error || !job ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-300">
                        Unable to load job.
                    </div>
                ) : (
                    <>
                        <div className="mt-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h1 className="font-suisse font-bold text-3xl">{job.title}</h1>
                                    <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        {job.company} {job.location ? `· ${job.location}` : ''}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">
                                        {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()}–$${job.salaryMax.toLocaleString()}` : 'Salary not listed'}
                                    </p>
                                    <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">USD / month</p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {job.isRemote ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{t('career.jobs.remote')}</span> : null}
                                {job.hiresInternationally ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t('career.jobs.hiresInternationally')}</span> : null}
                            </div>

                            <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-[#3E424A] dark:text-[#a6adba]">
                                {job.description || 'No description provided.'}
                            </p>

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-semibold mb-2">{t('career.jobs.matchedSkills')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(job.requiredSkills || []).map((skill) => (
                                            <span key={skill} className="rounded-full border border-gray-200 px-3 py-1 text-xs dark:border-white/10">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold mb-2">Preferred skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(job.preferredSkills || []).map((skill) => (
                                            <span key={skill} className="rounded-full border border-gray-200 px-3 py-1 text-xs dark:border-white/10">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6">
                            <div className="grid gap-4 sm:grid-cols-[1fr,auto,auto] sm:items-end">
                                <div>
                                    <label className="block text-sm font-medium text-[#3E424A] dark:text-[#a6adba] mb-2">
                                        Select resume for tailoring
                                    </label>
                                    <select
                                        value={selectedResumeId}
                                        onChange={(e) => setSelectedResumeId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                                    >
                                        {resumes.length === 0 ? <option value="">No resumes yet</option> : null}
                                        {resumes.map((resume) => (
                                            <option key={resume.id} value={resume.id}>{resume.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={handleSaveJob}
                                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] disabled:opacity-60"
                                >
                                    {isSaved ? 'Saved' : t('career.jobs.actions.save')}
                                </button>
                                <button
                                    type="button"
                                    disabled={busy || !selectedResumeId || Boolean(currentApplication)}
                                    onClick={handleApply}
                                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] disabled:opacity-60"
                                >
                                    {currentApplication ? currentApplication.status : t('career.jobs.actions.apply')}
                                </button>
                                <button
                                    type="button"
                                    disabled={busy || !selectedResumeId}
                                    onClick={handleTailor}
                                    className="rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                    {t('career.jobs.actions.tailor')}
                                </button>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {job.asksCoverLetter ? (
                                    <Link
                                        to={`${CAREER_ROUTES.COVER_LETTERS}?jobId=${jobId}${selectedResumeId ? `&resumeId=${selectedResumeId}` : ''}`}
                                        className="text-sm font-medium text-[#E14219] hover:underline"
                                    >
                                        Open cover letters
                                    </Link>
                                ) : null}
                                <Link
                                    to={`${CAREER_ROUTES.INTERVIEW_PREP}?jobId=${jobId}${selectedResumeId ? `&resumeId=${selectedResumeId}` : ''}`}
                                    className="text-sm font-medium text-[#E14219] hover:underline"
                                >
                                    Open interview prep
                                </Link>
                            </div>
                            {message ? <p className="mt-3 text-sm text-[#3E424A] dark:text-[#a6adba]">{message}</p> : null}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default JobDetailPage;

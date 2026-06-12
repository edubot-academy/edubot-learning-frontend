import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResumePreview from '../components/ResumePreview';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { getJobMatchesByResume, getJobs } from '../api/jobMatchApi';
import { downloadResume, getResume, tailorResumeForJob } from '../api/resumeApi';

const ResumeDetailPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { resumeId } = useParams();
    const [resume, setResume] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadMessage, setDownloadMessage] = useState(null);
    const [tailorMessage, setTailorMessage] = useState(null);
    const [tailorBusy, setTailorBusy] = useState(false);

    useEffect(() => {
        let mounted = true;
        Promise.all([getResume(resumeId), getJobMatchesByResume(resumeId).catch(() => []), getJobs(20).catch(() => [])])
            .then(([resumeData, matchData, jobData]) => {
                if (!mounted) return;
                setResume(resumeData);

                const matchedJobs = Array.isArray(matchData) ? matchData : [];
                const fallbackJobs = Array.isArray(jobData) ? jobData : [];
                const nextJobs = matchedJobs.length > 0 ? matchedJobs : fallbackJobs;

                setJobs(nextJobs);
                setSelectedJobId(nextJobs[0]?.jobId || nextJobs[0]?.id || '');
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
    }, [resumeId]);

    const handleDownload = async () => {
        setDownloadMessage(null);
        try {
            await downloadResume(resumeId);
        } catch (err) {
            const message = err?.response?.data?.message || t('career.errors.saveFailed');
            setDownloadMessage(message);
        }
    };

    const selectedJob = useMemo(
        () => jobs.find((item) => item.jobId === selectedJobId || item.id === selectedJobId) || null,
        [jobs, selectedJobId],
    );

    const handleTailor = async () => {
        if (!selectedJobId) return;
        setTailorBusy(true);
        setTailorMessage(null);
        try {
            const tailored = await tailorResumeForJob(resumeId, selectedJobId);
            navigate(CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', tailored.id));
        } catch (err) {
            setTailorMessage(err?.response?.data?.message || t('career.errors.saveFailed'));
        } finally {
            setTailorBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <Link to={CAREER_ROUTES.RESUMES} className="text-sm text-[#E14219] hover:underline">
                            Back to resumes
                        </Link>
                        <h1 className="mt-2 font-suisse font-bold text-3xl">
                            {resume?.name || 'Resume detail'}
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-[#3E424A] dark:text-[#a6adba]"
                    >
                        {t('career.resume.preview.download')}
                    </button>
                </div>

                {downloadMessage ? (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-300">
                        {downloadMessage}
                    </div>
                ) : null}

                {loading ? (
                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-[#3E424A] dark:text-[#a6adba]">
                        Loading resume...
                    </div>
                ) : error || !resume ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-300">
                        Unable to load resume.
                    </div>
                ) : (
                    <>
                        <div className="mb-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-2xl">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-[#E14219]">
                                        {t('career.jobs.actions.tailor')}
                                    </p>
                                    <h2 className="mt-2 font-suisse text-2xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                                        Tailor this resume for a specific job
                                    </h2>
                                    <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        Pick a matching role and create a job-specific version of this resume without overwriting the original.
                                    </p>
                                </div>
                                {selectedJob ? (
                                    <Link
                                        to={CAREER_ROUTES.JOB_DETAIL.replace(':jobId', selectedJob.jobId || selectedJob.id)}
                                        className="text-sm font-medium text-[#E14219] hover:underline"
                                    >
                                        Open selected job
                                    </Link>
                                ) : null}
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr,auto]">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                        Choose a job
                                    </label>
                                    <select
                                        value={selectedJobId}
                                        onChange={(event) => setSelectedJobId(event.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                                    >
                                        {jobs.length === 0 ? <option value="">No jobs available yet</option> : null}
                                        {jobs.map((job) => {
                                            const id = job.jobId || job.id;
                                            const score = job.score != null ? ` · ${job.score}% match` : '';
                                            return (
                                                <option key={id} value={id}>
                                                    {(job.title || 'Job') + ' - ' + (job.company || 'Unknown company') + score}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    disabled={tailorBusy || !selectedJobId}
                                    onClick={handleTailor}
                                    className="inline-flex items-center justify-center self-end rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                    {tailorBusy ? 'Tailoring...' : t('career.jobs.actions.tailor')}
                                </button>
                            </div>

                            {selectedJob ? (
                                <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-[#3E424A] dark:bg-white/[0.03] dark:text-[#a6adba]">
                                    <span className="font-medium text-[#141619] dark:text-[#E8ECF3]">
                                        {selectedJob.title || 'Job'}
                                    </span>
                                    {selectedJob.company ? ` · ${selectedJob.company}` : ''}
                                    {selectedJob.location ? ` · ${selectedJob.location}` : ''}
                                </div>
                            ) : null}

                            {tailorMessage ? (
                                <p className="mt-3 text-sm text-[#3E424A] dark:text-[#a6adba]">{tailorMessage}</p>
                            ) : null}
                        </div>

                        <ResumePreview
                            draft={{ id: resume.id, generatedResume: resume.generatedResume, readinessScore: resume.readinessScore }}
                            formData={resume.input}
                            templateId={resume.templateId}
                            resumeId={resume.id}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ResumeDetailPage;

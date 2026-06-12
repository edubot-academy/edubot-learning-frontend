import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { createCoverLetter, getCoverLetters, updateCoverLetter } from '../api/coverLetterApi';
import { getJobs } from '../api/jobMatchApi';
import { getResumes } from '../api/resumeApi';
import { useCareerUsageStatus } from '../hooks/useCareerUsageStatus';
import AiCreditsBadge from '../components/AiCreditsBadge';
import CareerLimitReachedModal from '../components/CareerLimitReachedModal';
import { CAREER_USAGE_KEYS, getUsageMetric, isCareerLimitReachedError, isUsageMetricExhausted } from '../utils/careerUsage';

const TONE_OPTIONS = ['professional', 'friendly', 'concise'];
const LENGTH_OPTIONS = ['short', 'full'];

const CoverLettersPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [coverLetters, setCoverLetters] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const [form, setForm] = useState({
        resumeId: '',
        jobId: '',
        tone: 'professional',
        length: 'full',
    });
    const { usage } = useCareerUsageStatus();
    const coverLetterMetric = getUsageMetric(usage, CAREER_USAGE_KEYS.COVER_LETTERS);
    const coverLetterLocked = isUsageMetricExhausted(coverLetterMetric);

    useEffect(() => {
        let mounted = true;
        Promise.all([getCoverLetters(), getJobs(30), getResumes()])
            .then(([coverLetterData, jobData, resumeData]) => {
                if (!mounted) return;
                setCoverLetters(Array.isArray(coverLetterData) ? coverLetterData : []);
                setJobs(Array.isArray(jobData) ? jobData : []);
                setResumes(Array.isArray(resumeData) ? resumeData : []);
                setForm((prev) => ({
                    ...prev,
                    resumeId: searchParams.get('resumeId') || '',
                    jobId: searchParams.get('jobId') || '',
                }));
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
    }, [searchParams]);

    const jobsById = useMemo(() => new Map(jobs.map((item) => [item.id, item])), [jobs]);
    const resumesById = useMemo(() => new Map(resumes.map((item) => [item.id, item])), [resumes]);

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!form.resumeId || !form.jobId || coverLetterLocked) return;
        setSubmitting(true);
        setMessage(null);
        try {
            const created = await createCoverLetter(form);
            setCoverLetters((prev) => [created, ...prev]);
            setMessage('Cover letter generated.');
        } catch (err) {
            if (isCareerLimitReachedError(err)) {
                setLimitModalOpen(true);
            } else {
                setMessage(err?.response?.data?.message || 'Failed to generate cover letter.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleFieldChange = (coverLetterId, field, value) => {
        setCoverLetters((prev) => prev.map((item) => (item.id === coverLetterId ? { ...item, [field]: value } : item)));
    };

    const handleSave = async (coverLetter) => {
        try {
            const saved = await updateCoverLetter(coverLetter.id, {
                content: coverLetter.content,
                tone: coverLetter.tone,
            });
            setCoverLetters((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Failed to update cover letter.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest mb-1.5">EduBot Career</p>
                        <h1 className="font-suisse font-bold text-3xl">Cover letters</h1>
                        <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                            Generate and refine role-specific English cover letters from your saved resumes.
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:items-end">
                        {coverLetterMetric ? (
                            <AiCreditsBadge metricKey={CAREER_USAGE_KEYS.COVER_LETTERS} metric={coverLetterMetric} />
                        ) : null}
                        <Link to={CAREER_ROUTES.JOBS} className="text-sm font-medium text-[#E14219] hover:underline">
                            Open jobs
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.05fr,1.65fr]">
                    <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5 space-y-4">
                        <h2 className="font-semibold text-lg">Generate cover letter</h2>
                        <select
                            value={form.resumeId}
                            onChange={(event) => setForm((prev) => ({ ...prev, resumeId: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                        >
                            <option value="">Select resume</option>
                            {resumes.map((resume) => (
                                <option key={resume.id} value={resume.id}>{resume.name}</option>
                            ))}
                        </select>
                        <select
                            value={form.jobId}
                            onChange={(event) => setForm((prev) => ({ ...prev, jobId: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                        >
                            <option value="">Select job</option>
                            {jobs.map((job) => (
                                <option key={job.id} value={job.id}>{job.title} - {job.company}</option>
                            ))}
                        </select>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <select
                                value={form.tone}
                                onChange={(event) => setForm((prev) => ({ ...prev, tone: event.target.value }))}
                                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                            >
                                {TONE_OPTIONS.map((tone) => (
                                    <option key={tone} value={tone}>{tone}</option>
                                ))}
                            </select>
                            <select
                                value={form.length}
                                onChange={(event) => setForm((prev) => ({ ...prev, length: event.target.value }))}
                                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                            >
                                {LENGTH_OPTIONS.map((length) => (
                                    <option key={length} value={length}>{length}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !form.resumeId || !form.jobId || coverLetterLocked}
                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {submitting ? 'Generating...' : 'Generate'}
                        </button>
                        {coverLetterLocked ? (
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                {t('career.usage.lockedHint')}
                            </p>
                        ) : null}
                        {message ? <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">{message}</p> : null}
                    </form>

                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
                            <h2 className="font-semibold text-lg">Saved cover letters</h2>
                        </div>
                        {loading ? (
                            <div className="px-5 py-8 text-sm text-[#3E424A] dark:text-[#a6adba]">Loading cover letters...</div>
                        ) : coverLetters.length === 0 ? (
                            <div className="px-5 py-8 text-sm text-[#3E424A] dark:text-[#a6adba]">No cover letters yet.</div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-white/10">
                                {coverLetters.map((coverLetter) => {
                                    const resume = resumesById.get(coverLetter.resumeId);
                                    const job = jobsById.get(coverLetter.jobId);
                                    return (
                                        <div key={coverLetter.id} className="px-5 py-4">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="font-medium text-[#141619] dark:text-[#E8ECF3]">
                                                        {job?.title || 'Job'} {job?.company ? `- ${job.company}` : ''}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                                        Resume: {resume?.name || 'Unknown'} · {coverLetter.tone}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={coverLetter.tone}
                                                        onChange={(event) => handleFieldChange(coverLetter.id, 'tone', event.target.value)}
                                                        className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm"
                                                    >
                                                        {TONE_OPTIONS.map((tone) => (
                                                            <option key={tone} value={tone}>{tone}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSave(coverLetter)}
                                                        className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm font-medium text-[#E14219]"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                            <textarea
                                                value={coverLetter.content || ''}
                                                onChange={(event) => handleFieldChange(coverLetter.id, 'content', event.target.value)}
                                                rows={10}
                                                className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm leading-6"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {error ? (
                            <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-300">
                                Some cover-letter data could not be loaded.
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
            <CareerLimitReachedModal
                open={limitModalOpen}
                onClose={() => setLimitModalOpen(false)}
                metricKey={CAREER_USAGE_KEYS.COVER_LETTERS}
                metric={coverLetterMetric}
            />
        </div>
    );
};

export default CoverLettersPage;

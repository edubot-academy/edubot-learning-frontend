import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { createApplication, getApplications } from '../api/applicationApi';
import { createCoverLetter, getCoverLetters, updateCoverLetter } from '../api/coverLetterApi';
import { getResumes, tailorResumeForJob } from '../api/resumeApi';
import { getJobDetail, getSavedJobs, removeSavedJob, saveJob } from '../api/jobMatchApi';
import { useCareerUsageStatus } from '../hooks/useCareerUsageStatus';
import CareerLimitReachedModal from '../components/CareerLimitReachedModal';
import { CAREER_USAGE_KEYS, getUsageMetric, isCareerLimitReachedError, isUsageMetricExhausted } from '../utils/careerUsage';
import { getResumeReadinessScore, getResumeSkills, isResumeReadyForJobActions } from '../utils/resumeMatch';

const TONE_OPTIONS = ['professional', 'friendly', 'concise'];
const LENGTH_OPTIONS = ['short', 'full'];

const buildInterviewQuestions = (job, matchedSkills, missingSkills) => {
    const role = job?.title || 'this role';
    const prompts = [
        `Why are you interested in ${role} at ${job?.company || 'this company'}?`,
        `Which project best shows you can succeed in ${role}?`,
        'Tell me about a time you solved a difficult technical problem.',
    ];

    if (matchedSkills[0]) {
        prompts.push(`Describe how you used ${matchedSkills[0]} in a real project.`);
    }

    if (missingSkills[0]) {
        prompts.push(`How would you ramp up quickly on ${missingSkills[0]} if hired?`);
    }

    return prompts.slice(0, 4);
};

const buildPrepChecklist = (job, matchedSkills, missingSkills) => [
    `Re-read the ${job?.title || 'job'} description and highlight the top 3 requirements.`,
    matchedSkills[0]
        ? `Prepare one impact story showing how you used ${matchedSkills[0]}.`
        : 'Prepare one impact story showing your strongest relevant work.',
    missingSkills[0]
        ? `Prepare a concise answer for the ${missingSkills[0]} gap and explain your plan to close it quickly.`
        : 'Prepare a concise answer for any skill gaps and how you learn fast.',
    job?.asksCoverLetter
        ? 'Keep your interview story aligned with the positioning in your cover letter.'
        : 'Keep your interview story aligned with the tone of your application.',
];

const JobDetailPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [coverLetters, setCoverLetters] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyAction, setBusyAction] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const [coverLetterForm, setCoverLetterForm] = useState({
        tone: 'professional',
        length: 'full',
    });
    const { usage } = useCareerUsageStatus();
    const coverLetterMetric = getUsageMetric(usage, CAREER_USAGE_KEYS.COVER_LETTERS);
    const coverLetterLocked = isUsageMetricExhausted(coverLetterMetric);

    useEffect(() => {
        let mounted = true;
        Promise.all([
            getJobDetail(jobId),
            getResumes(),
            getSavedJobs().catch(() => []),
            getApplications().catch(() => []),
            getCoverLetters().catch(() => []),
        ])
            .then(([jobData, resumeData, savedData, applicationData, coverLetterData]) => {
                if (!mounted) return;
                setJob(jobData);
                const nextResumes = Array.isArray(resumeData) ? resumeData : [];
                setResumes(nextResumes);
                setSavedJobs(Array.isArray(savedData) ? savedData : []);
                setApplications(Array.isArray(applicationData) ? applicationData : []);
                setCoverLetters(Array.isArray(coverLetterData) ? coverLetterData : []);
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
    const selectedResume = resumes.find((resume) => resume.id === selectedResumeId) || null;
    const resumeReadyForActions = isResumeReadyForJobActions(selectedResume);
    const resumeScore = getResumeReadinessScore(selectedResume);
    const resumeSkills = useMemo(() => getResumeSkills(selectedResume), [selectedResume]);
    const requiredSkills = Array.isArray(job?.requiredSkills) ? job.requiredSkills : [];
    const preferredSkills = Array.isArray(job?.preferredSkills) ? job.preferredSkills : [];
    const combinedSkills = [...new Set([...requiredSkills, ...preferredSkills].filter(Boolean))];
    const matchedSkills = combinedSkills.filter((skill) => resumeSkills.includes(skill));
    const missingSkills = combinedSkills.filter((skill) => !resumeSkills.includes(skill));
    const interviewQuestions = useMemo(
        () => buildInterviewQuestions(job, matchedSkills, missingSkills),
        [job, matchedSkills, missingSkills],
    );
    const prepChecklist = useMemo(
        () => buildPrepChecklist(job, matchedSkills, missingSkills),
        [job, matchedSkills, missingSkills],
    );
    const currentCoverLetter = useMemo(() => {
        if (!selectedResumeId) return null;
        return coverLetters.find((item) => item.jobId === jobId && item.resumeId === selectedResumeId) || null;
    }, [coverLetters, jobId, selectedResumeId]);

    const handleSaveJob = async () => {
        setBusyAction('save');
        setMessage(null);
        try {
            if (isSaved) {
                await removeSavedJob(jobId);
                setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
                setMessage(t('career.jobs.detail.unsaveSuccess'));
            } else {
                const saved = await saveJob(jobId);
                setSavedJobs((prev) => [{ ...saved, job }, ...prev.filter((item) => item.jobId !== jobId)]);
                setMessage(t('career.jobs.detail.saveSuccess'));
            }
        } catch {
            setMessage(t('career.errors.saveFailed'));
        } finally {
            setBusyAction('');
        }
    };

    const handleTailor = async () => {
        if (!selectedResumeId || !resumeReadyForActions) return;
        setBusyAction('tailor');
        setMessage(null);
        try {
            const tailored = await tailorResumeForJob(selectedResumeId, jobId);
            navigate(CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', tailored.id));
        } catch {
            setMessage(t('career.errors.saveFailed'));
        } finally {
            setBusyAction('');
        }
    };

    const handleApply = async () => {
        if (!selectedResumeId || !resumeReadyForActions || currentApplication) return;
        setBusyAction('apply');
        setMessage(null);
        try {
            const created = await createApplication({
                jobId,
                resumeId: selectedResumeId,
                status: 'applied',
                appliedAt: new Date().toISOString(),
            });
            setApplications((prev) => [created, ...prev.filter((item) => item.jobId !== jobId)]);
            setMessage(t('career.jobs.detail.applySuccess'));
        } catch {
            setMessage(t('career.errors.saveFailed'));
        } finally {
            setBusyAction('');
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!selectedResumeId || !resumeReadyForActions || coverLetterLocked) {
            if (coverLetterLocked) setLimitModalOpen(true);
            return;
        }
        setBusyAction('coverLetter');
        setMessage(null);
        try {
            const created = await createCoverLetter({
                resumeId: selectedResumeId,
                jobId,
                tone: coverLetterForm.tone,
                length: coverLetterForm.length,
            });
            setCoverLetters((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
            setMessage(t('career.jobs.detail.coverLetterSuccess'));
        } catch (err) {
            if (isCareerLimitReachedError(err)) {
                setLimitModalOpen(true);
            } else {
                setMessage(err?.response?.data?.message || t('career.errors.saveFailed'));
            }
        } finally {
            setBusyAction('');
        }
    };

    const handleCoverLetterChange = (field, value) => {
        if (!currentCoverLetter) return;
        setCoverLetters((prev) => prev.map((item) => (item.id === currentCoverLetter.id ? { ...item, [field]: value } : item)));
    };

    const handleCoverLetterSave = async () => {
        if (!currentCoverLetter) return;
        setBusyAction('coverLetterSave');
        setMessage(null);
        try {
            const saved = await updateCoverLetter(currentCoverLetter.id, {
                content: currentCoverLetter.content,
                tone: currentCoverLetter.tone,
            });
            setCoverLetters((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        } catch {
            setMessage(t('career.errors.saveFailed'));
        } finally {
            setBusyAction('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
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
                    <div className="mt-4 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-8">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h1 className="font-suisse font-bold text-3xl">{job.title}</h1>
                                        <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            {job.company} {job.location ? `· ${job.location}` : ''}
                                        </p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-2xl font-bold">
                                            {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()}-$${job.salaryMax.toLocaleString()}` : 'Salary not listed'}
                                        </p>
                                        <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">USD / month</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {job.isRemote ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{t('career.jobs.remote')}</span> : null}
                                    {job.hiresInternationally ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t('career.jobs.hiresInternationally')}</span> : null}
                                    {currentApplication ? (
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                            {t('career.jobs.detail.status')}: {currentApplication.status}
                                        </span>
                                    ) : null}
                                </div>

                                <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-[#3E424A] dark:text-[#a6adba]">
                                    {job.description || t('career.jobs.detail.noDescription')}
                                </p>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-semibold mb-2">{t('career.jobs.matchedSkills')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {requiredSkills.map((skill) => (
                                                <span key={skill} className="rounded-full border border-gray-200 px-3 py-1 text-xs dark:border-white/10">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-2">{t('career.jobs.detail.preferredSkills')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {preferredSkills.map((skill) => (
                                                <span key={skill} className="rounded-full border border-gray-200 px-3 py-1 text-xs dark:border-white/10">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold text-xl">{t('career.jobs.detail.workspaceTitle')}</h2>
                                        <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            {t('career.jobs.detail.workspaceSubtitle')}
                                        </p>
                                    </div>
                                    {job.applyUrl ? (
                                        <a
                                            href={job.applyUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-[#3E424A] dark:text-[#a6adba]"
                                        >
                                            {t('career.jobs.detail.applyExternal')}
                                        </a>
                                    ) : null}
                                </div>

                                <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                                {t('career.jobs.detail.resumeLabel')}
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

                                        {!resumeReadyForActions ? (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
                                                <p className="font-medium">{t('career.jobs.gating.title')}</p>
                                                <p className="mt-1">{selectedResumeId ? t('career.jobs.gating.incompleteResume') : t('career.jobs.gating.noResume')}</p>
                                                {selectedResumeId && resumeScore != null ? (
                                                    <p className="mt-2 text-xs">{t('career.resume.preview.score', { score: resumeScore })}</p>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <button
                                                type="button"
                                                disabled={busyAction === 'save'}
                                                onClick={handleSaveJob}
                                                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] disabled:opacity-60"
                                            >
                                                {busyAction === 'save' ? 'Saving...' : isSaved ? 'Saved' : t('career.jobs.actions.save')}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busyAction === 'apply' || !selectedResumeId || !resumeReadyForActions || Boolean(currentApplication)}
                                                onClick={handleApply}
                                                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] disabled:opacity-60"
                                            >
                                                {currentApplication ? currentApplication.status : t('career.jobs.actions.apply')}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busyAction === 'tailor' || !selectedResumeId || !resumeReadyForActions}
                                                onClick={handleTailor}
                                                className="rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                            >
                                                {t('career.jobs.actions.tailor')}
                                            </button>
                                        </div>

                                        {message ? <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">{message}</p> : null}
                                    </div>

                                    <div className="rounded-2xl bg-gray-50 px-4 py-4 dark:bg-white/[0.03]">
                                        <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">
                                            {resumeReadyForActions ? t('career.jobs.matchScore', { score: Math.max(35, Math.min(95, matchedSkills.length * 12 + (resumeScore || 0) / 2)) }) : t('career.jobs.gating.scoreLocked')}
                                        </p>
                                        <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            {matchedSkills.length > 0
                                                ? `${t('career.jobs.matchedSkills')}: ${matchedSkills.join(', ')}`
                                                : t('career.jobs.gating.noResume')}
                                        </p>
                                        {missingSkills.length > 0 ? (
                                            <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                                {t('career.jobs.missingSkills')}: {missingSkills.join(', ')}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5">
                                <h2 className="font-semibold text-lg">{t('career.jobs.detail.coverLetterTitle')}</h2>
                                <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                    {t('career.jobs.detail.coverLetterSubtitle')}
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                            {t('career.jobs.detail.coverLetterTone')}
                                        </label>
                                        <select
                                            value={currentCoverLetter?.tone || coverLetterForm.tone}
                                            onChange={(e) => currentCoverLetter
                                                ? handleCoverLetterChange('tone', e.target.value)
                                                : setCoverLetterForm((prev) => ({ ...prev, tone: e.target.value }))}
                                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                                        >
                                            {TONE_OPTIONS.map((tone) => (
                                                <option key={tone} value={tone}>{tone}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                            {t('career.jobs.detail.coverLetterLength')}
                                        </label>
                                        <select
                                            value={coverLetterForm.length}
                                            onChange={(e) => setCoverLetterForm((prev) => ({ ...prev, length: e.target.value }))}
                                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                                        >
                                            {LENGTH_OPTIONS.map((length) => (
                                                <option key={length} value={length}>{length}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="button"
                                        disabled={busyAction === 'coverLetter' || !selectedResumeId || !resumeReadyForActions || coverLetterLocked}
                                        onClick={handleGenerateCoverLetter}
                                        className="rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        {busyAction === 'coverLetter' ? 'Generating...' : t('career.jobs.actions.coverLetter')}
                                    </button>
                                    {currentCoverLetter ? (
                                        <button
                                            type="button"
                                            disabled={busyAction === 'coverLetterSave'}
                                            onClick={handleCoverLetterSave}
                                            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] disabled:opacity-60"
                                        >
                                            Save
                                        </button>
                                    ) : null}
                                </div>
                                {currentCoverLetter ? (
                                    <textarea
                                        value={currentCoverLetter.content || ''}
                                        onChange={(e) => handleCoverLetterChange('content', e.target.value)}
                                        rows={12}
                                        className="mt-4 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm leading-6"
                                    />
                                ) : (
                                    <div className="mt-4 rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm text-[#3E424A] dark:border-white/10 dark:text-[#a6adba]">
                                        {t('career.jobs.detail.coverLetterEmpty')}
                                    </div>
                                )}
                                {coverLetterLocked ? (
                                    <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                                        {t('career.usage.lockedHint')}
                                    </p>
                                ) : null}
                            </div>

                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-semibold text-lg">{t('career.jobs.detail.interviewTitle')}</h2>
                                        <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            {t('career.jobs.detail.interviewSubtitle')}
                                        </p>
                                    </div>
                                    <Link
                                        to={`${CAREER_ROUTES.INTERVIEW_PREP}?jobId=${jobId}${selectedResumeId ? `&resumeId=${selectedResumeId}` : ''}`}
                                        className="text-sm font-medium text-[#E14219] hover:underline"
                                    >
                                        {t('career.jobs.detail.interviewOpen')}
                                    </Link>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#3E424A] dark:text-[#a6adba]">
                                        Checklist
                                    </p>
                                    <div className="mt-3 space-y-2">
                                        {prepChecklist.map((item) => (
                                            <div key={item} className="rounded-xl bg-gray-50 px-3 py-3 text-sm text-[#3E424A] dark:bg-white/[0.03] dark:text-[#a6adba]">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#3E424A] dark:text-[#a6adba]">
                                        Practice prompts
                                    </p>
                                    <div className="mt-3 space-y-2">
                                        {interviewQuestions.map((item) => (
                                            <div key={item} className="rounded-xl border border-gray-200 px-3 py-3 text-sm text-[#141619] dark:border-white/10 dark:text-[#E8ECF3]">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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

export default JobDetailPage;

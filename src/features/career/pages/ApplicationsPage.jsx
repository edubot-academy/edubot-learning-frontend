import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { createApplication, getApplications, updateApplication } from '../api/applicationApi';
import { getCoverLetters } from '../api/coverLetterApi';
import { getJobs } from '../api/jobMatchApi';
import { getResumes } from '../api/resumeApi';
import ApplicationKanbanBoard from '../components/ApplicationKanbanBoard';

const STATUS_OPTIONS = ['saved', 'applied', 'interview', 'offer', 'rejected'];

const ApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [coverLetters, setCoverLetters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [form, setForm] = useState({
        jobId: '',
        resumeId: '',
        coverLetterId: '',
        status: 'saved',
        notes: '',
        appliedAt: '',
    });

    useEffect(() => {
        let mounted = true;
        Promise.all([
            getApplications(),
            getJobs(30),
            getResumes(),
            getCoverLetters().catch(() => []),
        ])
            .then(([applicationData, jobData, resumeData, coverLetterData]) => {
                if (!mounted) return;
                setApplications(Array.isArray(applicationData) ? applicationData : []);
                setJobs(Array.isArray(jobData) ? jobData : []);
                setResumes(Array.isArray(resumeData) ? resumeData : []);
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

    const jobsById = useMemo(() => new Map(jobs.map((item) => [item.id, item])), [jobs]);
    const resumesById = useMemo(() => new Map(resumes.map((item) => [item.id, item])), [resumes]);
    const coverLettersById = useMemo(() => new Map(coverLetters.map((item) => [item.id, item])), [coverLetters]);

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!form.jobId) return;
        setSubmitting(true);
        setMessage(null);
        try {
            const created = await createApplication({
                jobId: form.jobId,
                resumeId: form.resumeId || undefined,
                coverLetterId: form.coverLetterId || undefined,
                status: form.status,
                notes: form.notes || undefined,
                appliedAt: form.appliedAt || undefined,
            });
            setApplications((prev) => [created, ...prev]);
            setMessage('Application created.');
            setForm((prev) => ({ ...prev, notes: '', appliedAt: '' }));
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Failed to create application.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFieldChange = (applicationId, field, value) => {
        setApplications((prev) => prev.map((item) => (item.id === applicationId ? { ...item, [field]: value } : item)));
    };

    const handleSave = async (application) => {
        try {
            const saved = await updateApplication(application.id, {
                status: application.status,
                notes: application.notes || undefined,
                appliedAt: application.appliedAt || undefined,
            });
            setApplications((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Failed to update application.');
        }
    };

    const handleMove = async (applicationId, nextStatus) => {
        const previousApplications = applications;
        const currentApplication = previousApplications.find((item) => item.id === applicationId);

        if (!currentApplication || currentApplication.status === nextStatus) return;

        const nextAppliedAt =
            nextStatus === 'applied' && !currentApplication.appliedAt
                ? new Date().toISOString().slice(0, 10)
                : currentApplication.appliedAt;

        setMessage(null);
        setApplications((prev) =>
            prev.map((item) =>
                item.id === applicationId
                    ? { ...item, status: nextStatus, appliedAt: nextAppliedAt }
                    : item,
            ),
        );

        try {
            const saved = await updateApplication(applicationId, {
                status: nextStatus,
                notes: currentApplication.notes || undefined,
                appliedAt: nextAppliedAt || undefined,
            });
            setApplications((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        } catch (err) {
            setApplications(previousApplications);
            setMessage(err?.response?.data?.message || 'Failed to move application.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest mb-1.5">EduBot Career</p>
                        <h1 className="font-suisse font-bold text-3xl">Applications</h1>
                        <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                            Track saved, applied, and interview-stage roles in one place.
                        </p>
                    </div>
                    <Link to={CAREER_ROUTES.JOBS} className="text-sm font-medium text-[#E14219] hover:underline">
                        Browse jobs
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr,1.6fr]">
                    <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5 space-y-4">
                        <h2 className="font-semibold text-lg">New application</h2>
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
                        <select
                            value={form.resumeId}
                            onChange={(event) => setForm((prev) => ({ ...prev, resumeId: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                        >
                            <option value="">No resume</option>
                            {resumes.map((resume) => (
                                <option key={resume.id} value={resume.id}>{resume.name}</option>
                            ))}
                        </select>
                        <select
                            value={form.coverLetterId}
                            onChange={(event) => setForm((prev) => ({ ...prev, coverLetterId: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                        >
                            <option value="">No cover letter</option>
                            {coverLetters.map((coverLetter) => (
                                <option key={coverLetter.id} value={coverLetter.id}>
                                    {coverLettersById.get(coverLetter.id)?.tone || 'Cover letter'} - {coverLetter.id.slice(0, 8)}
                                </option>
                            ))}
                        </select>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <select
                                value={form.status}
                                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={form.appliedAt}
                                onChange={(event) => setForm((prev) => ({ ...prev, appliedAt: event.target.value }))}
                                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                            />
                        </div>
                        <textarea
                            value={form.notes}
                            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                            rows={5}
                            placeholder="Notes"
                            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !form.jobId}
                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {submitting ? 'Creating...' : 'Create application'}
                        </button>
                        {message ? <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">{message}</p> : null}
                    </form>

                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
                            <h2 className="font-semibold text-lg">Applications pipeline</h2>
                            <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                Move roles from saved to applied, interview, and final outcomes.
                            </p>
                        </div>
                        {loading ? (
                            <div className="px-5 py-8 text-sm text-[#3E424A] dark:text-[#a6adba]">Loading applications...</div>
                        ) : applications.length === 0 ? (
                            <div className="px-5 py-8 text-sm text-[#3E424A] dark:text-[#a6adba]">No applications yet.</div>
                        ) : (
                            <div className="p-5">
                                <ApplicationKanbanBoard
                                    applications={applications}
                                    jobsById={jobsById}
                                    resumesById={resumesById}
                                    coverLettersById={coverLettersById}
                                    onFieldChange={handleFieldChange}
                                    onMove={handleMove}
                                    onSave={handleSave}
                                />
                            </div>
                        )}
                        {error ? (
                            <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-300">
                                Some application data could not be loaded.
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationsPage;

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { getApplications } from '../api/applicationApi';
import { getJobs } from '../api/jobMatchApi';
import { getResumes } from '../api/resumeApi';
import { getCareerUsage } from '../api/usageApi';

const formatSalary = (job) => {
    if (!job?.salaryMin && !job?.salaryMax) return 'Salary not listed';
    if (job.salaryMin && job.salaryMax) {
        return `$${job.salaryMin.toLocaleString()}-$${job.salaryMax.toLocaleString()} / ${job.salaryPeriod || 'month'}`;
    }
    return `$${(job.salaryMax || job.salaryMin).toLocaleString()} / ${job.salaryPeriod || 'month'}`;
};

const getResumeSkills = (resume) => {
    const generatedSkills = Array.isArray(resume?.generatedResume?.skills) ? resume.generatedResume.skills : [];
    const inputSkills = Array.isArray(resume?.input?.skills) ? resume.input.skills : [];
    return [...new Set([...generatedSkills, ...inputSkills].filter(Boolean))];
};

const getEvidencePoints = (resume) => {
    const summary = resume?.generatedResume?.summary ? [resume.generatedResume.summary] : [];
    const experience = Array.isArray(resume?.generatedResume?.experience)
        ? resume.generatedResume.experience.flatMap((item) => item?.bullets || []).filter(Boolean)
        : [];
    const projects = Array.isArray(resume?.generatedResume?.projects)
        ? resume.generatedResume.projects.map((item) => item?.description).filter(Boolean)
        : [];

    return [...summary, ...experience, ...projects].slice(0, 6);
};

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

    return prompts.slice(0, 5);
};

const buildPrepChecklist = (job, matchedSkills, missingSkills, evidencePoints) => {
    return [
        `Re-read the ${job?.title || 'job'} description and highlight the top 3 requirements.`,
        matchedSkills[0]
            ? `Prepare one strong story showing your impact with ${matchedSkills[0]}.`
            : 'Prepare one strong story showing your most relevant technical impact.',
        evidencePoints[0]
            ? `Turn this resume evidence into a concise interview answer: "${evidencePoints[0]}".`
            : 'Write a 60-second introduction covering your background, stack, and target role.',
        missingSkills[0]
            ? `Prepare an honest answer for the ${missingSkills[0]} gap and explain your learning plan.`
            : 'Prepare a short answer for any skill gaps and how you close them quickly.',
        job?.asksCoverLetter
            ? 'Review your cover letter so your interview answers match the same positioning.'
            : 'Review your application materials to keep your interview story consistent.',
    ];
};

const InterviewPrepPage = () => {
    const [searchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [usage, setUsage] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        Promise.all([
            getApplications().catch(() => []),
            getJobs(50),
            getResumes(),
            getCareerUsage(),
        ])
            .then(([applicationData, jobData, resumeData, usageData]) => {
                if (!mounted) return;

                const nextApplications = Array.isArray(applicationData) ? applicationData : [];
                const nextJobs = Array.isArray(jobData) ? jobData : [];
                const nextResumes = Array.isArray(resumeData) ? resumeData : [];
                const interviewApplication = nextApplications.find((item) => item.status === 'interview');
                const queryJobId = searchParams.get('jobId') || '';
                const queryResumeId = searchParams.get('resumeId') || '';

                setApplications(nextApplications);
                setJobs(nextJobs);
                setResumes(nextResumes);
                setUsage(usageData ?? null);
                setSelectedJobId(queryJobId || interviewApplication?.jobId || nextJobs[0]?.id || '');
                setSelectedResumeId(queryResumeId || interviewApplication?.resumeId || nextResumes[0]?.id || '');
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

    const selectedJob = jobsById.get(selectedJobId) || null;
    const selectedResume = resumesById.get(selectedResumeId) || null;
    const resumeSkills = useMemo(() => getResumeSkills(selectedResume), [selectedResume]);
    const requiredSkills = Array.isArray(selectedJob?.requiredSkills) ? selectedJob.requiredSkills : [];
    const preferredSkills = Array.isArray(selectedJob?.preferredSkills) ? selectedJob.preferredSkills : [];
    const allJobSkills = [...new Set([...requiredSkills, ...preferredSkills].filter(Boolean))];
    const matchedSkills = allJobSkills.filter((skill) => resumeSkills.includes(skill));
    const missingSkills = allJobSkills.filter((skill) => !resumeSkills.includes(skill));
    const evidencePoints = useMemo(() => getEvidencePoints(selectedResume), [selectedResume]);
    const interviewQuestions = useMemo(
        () => buildInterviewQuestions(selectedJob, matchedSkills, missingSkills),
        [matchedSkills, missingSkills, selectedJob],
    );
    const prepChecklist = useMemo(
        () => buildPrepChecklist(selectedJob, matchedSkills, missingSkills, evidencePoints),
        [evidencePoints, matchedSkills, missingSkills, selectedJob],
    );
    const interviewApplications = useMemo(
        () => applications.filter((item) => item.status === 'interview'),
        [applications],
    );
    const interviewPlanUsage = usage?.usage?.interviewPlans ?? null;

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-12 text-[#141619] dark:bg-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest mb-1.5">EduBot Career</p>
                        <h1 className="font-suisse font-bold text-3xl">Interview prep</h1>
                        <p className="mt-2 max-w-2xl text-sm text-[#3E424A] dark:text-[#a6adba]">
                            Build a focused prep brief from your saved resume and target role. The dedicated AI interview-plan endpoint is not wired in the backend yet, so this page uses your current career data.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link to={CAREER_ROUTES.APPLICATIONS} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#3E424A] dark:border-white/10 dark:bg-white/5 dark:text-[#a6adba]">
                            Open applications
                        </Link>
                        <Link to={CAREER_ROUTES.COVER_LETTERS} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#3E424A] dark:border-white/10 dark:bg-white/5 dark:text-[#a6adba]">
                            Open cover letters
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-[#3E424A] dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#a6adba]">
                        Loading interview prep...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-300">
                        Unable to load interview prep data.
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1.05fr,1.65fr]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-[#1a1a1a]">
                                <h2 className="font-semibold text-lg">Prep context</h2>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">Target job</label>
                                        <select
                                            value={selectedJobId}
                                            onChange={(event) => setSelectedJobId(event.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                                        >
                                            <option value="">Select job</option>
                                            {jobs.map((job) => (
                                                <option key={job.id} value={job.id}>{job.title} - {job.company}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">Resume</label>
                                        <select
                                            value={selectedResumeId}
                                            onChange={(event) => setSelectedResumeId(event.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
                                        >
                                            <option value="">Select resume</option>
                                            {resumes.map((resume) => (
                                                <option key={resume.id} value={resume.id}>{resume.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-[#1a1a1a]">
                                <h2 className="font-semibold text-lg">Usage</h2>
                                <div className="mt-4 rounded-2xl bg-[#FFF3EF] p-4 dark:bg-[#E14219]/10">
                                    <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">Interview plans this month</p>
                                    <p className="mt-1 text-3xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                                        {interviewPlanUsage?.remaining ?? '—'}
                                        <span className="ml-2 text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                            / {interviewPlanUsage?.limit ?? '—'} left
                                        </span>
                                    </p>
                                    <p className="mt-2 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                        Current plan: {usage?.plan || 'free'}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-[#1a1a1a]">
                                <h2 className="font-semibold text-lg">Interview-stage applications</h2>
                                <div className="mt-4 space-y-3">
                                    {interviewApplications.length === 0 ? (
                                        <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            No applications are marked as interview yet. Use this page to prepare anyway.
                                        </p>
                                    ) : interviewApplications.map((application) => {
                                        const job = jobsById.get(application.jobId);
                                        const resume = resumesById.get(application.resumeId);
                                        return (
                                            <button
                                                key={application.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedJobId(application.jobId);
                                                    setSelectedResumeId(application.resumeId || '');
                                                }}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm transition hover:border-[#E14219]/40 dark:border-white/10"
                                            >
                                                <p className="font-medium text-[#141619] dark:text-[#E8ECF3]">{job?.title || 'Job'} {job?.company ? `- ${job.company}` : ''}</p>
                                                <p className="mt-1 text-xs text-[#3E424A] dark:text-[#a6adba]">Resume: {resume?.name || 'Not attached'}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold text-xl">
                                            {selectedJob?.title || 'Choose a job'} {selectedJob?.company ? `- ${selectedJob.company}` : ''}
                                        </h2>
                                        <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            {selectedJob ? `${formatSalary(selectedJob)}${selectedJob.location ? ` · ${selectedJob.location}` : ''}` : 'Select a job and resume to generate a prep brief.'}
                                        </p>
                                    </div>
                                    {selectedJob?.applyUrl ? (
                                        <a
                                            href={selectedJob.applyUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white"
                                        >
                                            Open application
                                        </a>
                                    ) : null}
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl bg-[#F6F7F8] p-4 dark:bg-white/5">
                                        <p className="text-sm font-semibold">Matched skills</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {matchedSkills.length === 0 ? (
                                                <span className="text-sm text-[#3E424A] dark:text-[#a6adba]">No overlap detected yet.</span>
                                            ) : matchedSkills.map((skill) => (
                                                <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-[#F6F7F8] p-4 dark:bg-white/5">
                                        <p className="text-sm font-semibold">Gaps to prepare for</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {missingSkills.length === 0 ? (
                                                <span className="text-sm text-[#3E424A] dark:text-[#a6adba]">No obvious gaps from saved data.</span>
                                            ) : missingSkills.map((skill) => (
                                                <span key={skill} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-2">
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
                                    <h2 className="font-semibold text-lg">Prep checklist</h2>
                                    <ul className="mt-4 space-y-3 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        {prepChecklist.map((item) => (
                                            <li key={item} className="rounded-xl bg-[#F6F7F8] px-4 py-3 leading-6 dark:bg-white/5">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
                                    <h2 className="font-semibold text-lg">Likely interview questions</h2>
                                    <ul className="mt-4 space-y-3 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        {interviewQuestions.map((item) => (
                                            <li key={item} className="rounded-xl bg-[#F6F7F8] px-4 py-3 leading-6 dark:bg-white/5">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
                                <h2 className="font-semibold text-lg">Resume evidence to practice</h2>
                                {selectedResume ? (
                                    <div className="mt-4">
                                        <div className="flex flex-wrap gap-2">
                                            {resumeSkills.slice(0, 10).map((skill) => (
                                                <span key={skill} className="rounded-full border border-gray-200 px-3 py-1 text-xs dark:border-white/10">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <ul className="mt-4 space-y-3 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            {evidencePoints.length === 0 ? (
                                                <li className="rounded-xl bg-[#F6F7F8] px-4 py-3 dark:bg-white/5">
                                                    Add stronger resume content to generate better interview evidence.
                                                </li>
                                            ) : evidencePoints.map((item) => (
                                                <li key={item} className="rounded-xl bg-[#F6F7F8] px-4 py-3 leading-6 dark:bg-white/5">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        Select a saved resume to review talking points.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPrepPage;

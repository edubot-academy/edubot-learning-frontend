import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { getResumes } from '../api/resumeApi';

const ResumeManagerPage = () => {
    const { t } = useTranslation();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        getResumes()
            .then((data) => {
                if (!mounted) return;
                setResumes(Array.isArray(data) ? data : []);
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest mb-1.5">
                            EduBot Career
                        </p>
                        <h1 className="font-suisse font-bold text-3xl">Saved resumes</h1>
                        <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                            Continue from your saved resumes and open a detailed view.
                        </p>
                    </div>
                    <Link
                        to={CAREER_ROUTES.PUBLIC_BUILDER}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white"
                    >
                        {t('career.dashboard.nextSteps.noResume')}
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-[#3E424A] dark:text-[#a6adba]">
                        Loading resumes...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-300">
                        {t('career.errors.saveFailed')}
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-8">
                        <h2 className="font-semibold text-lg mb-2">{t('career.dashboard.emptyState.resumes')}</h2>
                        <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">
                            {t('career.dashboard.emptyState.resumesSubtitle')}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {resumes.map((resume) => (
                            <Link
                                key={resume.id}
                                to={CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', resume.id)}
                                className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold text-lg">{resume.name || 'My Resume'}</h2>
                                        <p className="mt-1 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                            {resume.generatedResume?.header?.role || resume.input?.targetRole || 'Resume'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        <span>Score: {resume.readinessScore ?? '—'}</span>
                                        <span className="rounded-full bg-[#FFF3EF] px-3 py-1 text-[#E14219] dark:bg-[#E14219]/10">
                                            {resume.templateId || 'classic'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeManagerPage;

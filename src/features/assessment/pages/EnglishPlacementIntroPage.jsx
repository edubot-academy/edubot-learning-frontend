import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '@app/providers';

// ─── Icons ────────────────────────────────────────────────────────────────────

const QuestionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" aria-hidden>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const AcademicCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" aria-hidden>
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>
);

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" aria-hidden>
        <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

// ─── CEFR Level display ───────────────────────────────────────────────────────

const LEVELS = [
    { label: 'A0', color: 'bg-gray-400' },
    { label: 'A1', color: 'bg-blue-400' },
    { label: 'A2', color: 'bg-teal-500' },
    { label: 'B1', color: 'bg-green-500' },
    { label: 'B2', color: 'bg-orange-500' },
];

// ─── Feature card ─────────────────────────────────────────────────────────────

const FeatureCard = ({ icon, title, desc }) => (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
        <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#E14219] flex items-center justify-center">
            {icon}
        </span>
        <div>
            <p className="font-semibold text-[#141619] dark:text-[#E8ECF3] text-sm">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
        </div>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const EnglishPlacementIntroPage = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);

    const isStudent = user?.role === 'student';

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-orange-50/70 via-white to-white dark:from-orange-950/20 dark:via-[#222222] dark:to-[#222222]">
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    <svg viewBox="0 0 800 300" className="absolute right-0 top-0 h-full w-auto opacity-[0.04] dark:opacity-[0.07]" fill="currentColor">
                        <circle cx="680" cy="80" r="130" />
                        <circle cx="560" cy="220" r="90" />
                        <circle cx="750" cy="250" r="70" />
                    </svg>
                </div>

                <div className="relative px-4 pt-14 pb-12 sm:px-6 lg:px-12 max-w-screen-lg mx-auto">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 text-[#E14219] mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E14219] inline-block" />
                        {t('assessment.intro.badge')}
                    </span>

                    <div className="flex items-start gap-4 mb-6">
                        <span className="w-1 h-14 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] flex-shrink-0 mt-1" />
                        <div>
                            <h1 className="font-suisse font-bold text-3xl sm:text-4xl lg:text-5xl text-[#141619] dark:text-[#E8ECF3] leading-tight">
                                {t('assessment.intro.title')}
                            </h1>
                            <p className="font-suisse text-[#3E424A] dark:text-[#a6adba] text-base sm:text-lg mt-3 max-w-xl">
                                {t('assessment.intro.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* CEFR levels strip */}
                    <div className="flex items-center gap-2 mt-4 mb-8">
                        {LEVELS.map((lvl, i) => (
                            <div key={lvl.label} className="flex items-center gap-2">
                                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-sm ${lvl.color}`}>
                                    {lvl.label}
                                </span>
                                {i < LEVELS.length - 1 && (
                                    <svg viewBox="0 0 16 4" fill="none" className="w-4 text-gray-300 dark:text-white/20" aria-hidden>
                                        <path d="M0 2h16" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    {isStudent ? (
                        <Link
                            to="/assessment/start"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white font-semibold text-base shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E14219]"
                        >
                            {t('assessment.intro.startBtn')}
                            <ArrowRightIcon />
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-[#E14219] text-[#E14219] font-semibold text-base hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E14219]"
                        >
                            {t('assessment.intro.loginPrompt')}
                            <ArrowRightIcon />
                        </Link>
                    )}
                </div>
            </div>

            {/* Features */}
            <div className="px-4 py-12 sm:px-6 lg:px-12 max-w-screen-lg mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FeatureCard
                        icon={<QuestionIcon />}
                        title={t('assessment.intro.features.questions')}
                        desc={t('assessment.intro.features.questionsDesc')}
                    />
                    <FeatureCard
                        icon={<ClockIcon />}
                        title={t('assessment.intro.features.time')}
                        desc={t('assessment.intro.features.timeDesc')}
                    />
                    <FeatureCard
                        icon={<AcademicCapIcon />}
                        title={t('assessment.intro.features.levels')}
                        desc={t('assessment.intro.features.levelsDesc')}
                    />
                    <FeatureCard
                        icon={<MapIcon />}
                        title={t('assessment.intro.features.path')}
                        desc={t('assessment.intro.features.pathDesc')}
                    />
                </div>
            </div>
        </div>
    );
};

export default EnglishPlacementIntroPage;

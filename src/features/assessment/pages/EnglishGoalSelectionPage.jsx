import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { startAssessmentAttempt } from '../api';

// ─── Icons ────────────────────────────────────────────────────────────────────

const DailyLifeIcon = ({ className = 'w-7 h-7' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

const StudyAbroadIcon = ({ className = 'w-7 h-7' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>
);

const IeltsIcon = ({ className = 'w-7 h-7' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
    </svg>
);

const CareerIcon = ({ className = 'w-7 h-7' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
    </svg>
);

const SchoolIcon = ({ className = 'w-7 h-7' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

// ─── Goal config ──────────────────────────────────────────────────────────────

const GOALS = [
    { key: 'daily_life',     Icon: DailyLifeIcon,    color: 'blue' },
    { key: 'study_abroad',   Icon: StudyAbroadIcon,  color: 'violet' },
    { key: 'ielts_toefl',    Icon: IeltsIcon,        color: 'amber' },
    { key: 'work_career',    Icon: CareerIcon,       color: 'teal' },
    { key: 'school_support', Icon: SchoolIcon,       color: 'rose' },
];

const COLOR_MAP = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   icon: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-500',   sel: 'border-blue-500 dark:border-blue-400',   badge: 'bg-blue-500' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', icon: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-500', sel: 'border-violet-500 dark:border-violet-400', badge: 'bg-violet-500' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-950/30',  icon: 'text-amber-600 dark:text-amber-400',  ring: 'ring-amber-500',  sel: 'border-amber-500 dark:border-amber-400',  badge: 'bg-amber-500' },
    teal:   { bg: 'bg-teal-50 dark:bg-teal-950/30',    icon: 'text-teal-600 dark:text-teal-400',    ring: 'ring-teal-500',   sel: 'border-teal-500 dark:border-teal-400',   badge: 'bg-teal-500' },
    rose:   { bg: 'bg-rose-50 dark:bg-rose-950/30',    icon: 'text-rose-600 dark:text-rose-400',    ring: 'ring-rose-500',   sel: 'border-rose-500 dark:border-rose-400',   badge: 'bg-rose-500' },
};

// ─── Goal card ────────────────────────────────────────────────────────────────

const GoalCard = ({ goalKey, Icon, color, label, desc, selected, onSelect }) => {
    const c = COLOR_MAP[color];
    return (
        <button
            type="button"
            onClick={() => onSelect(goalKey)}
            aria-pressed={selected}
            className={[
                'relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 focus-visible:outline-none',
                'hover:shadow-md cursor-pointer',
                selected
                    ? `${c.sel} shadow-md`
                    : 'border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20',
                'bg-white dark:bg-white/5',
            ].join(' ')}
        >
            {/* check badge */}
            {selected && (
                <span className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white ${c.badge}`}>
                    <CheckIcon />
                </span>
            )}

            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${c.bg} ${c.icon}`}>
                <Icon />
            </span>

            <p className="font-semibold text-[#141619] dark:text-[#E8ECF3] text-base leading-snug">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
        </button>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const EnglishGoalSelectionPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleContinue = async () => {
        if (!selected || submitting) return;
        setSubmitting(true);
        try {
            const attempt = await startAssessmentAttempt(selected);
            navigate(`/assessment/attempt/${attempt.id}`, { state: { expiresAt: attempt.expiresAt } });
        } catch {
            toast.error(t('assessment.test.startError'));
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-orange-50/50 via-white to-white dark:from-orange-950/10 dark:via-[#222222] dark:to-[#222222]">
                <div className="px-4 pt-12 pb-10 sm:px-6 lg:px-12 max-w-screen-md mx-auto text-center">
                    <h1 className="font-suisse font-bold text-2xl sm:text-3xl text-[#141619] dark:text-[#E8ECF3]">
                        {t('assessment.goals.title')}
                    </h1>
                    <p className="text-[#3E424A] dark:text-[#a6adba] mt-2 text-base">
                        {t('assessment.goals.subtitle')}
                    </p>
                </div>
            </div>

            {/* Goal cards */}
            <div className="px-4 py-10 sm:px-6 lg:px-12 max-w-screen-md mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {GOALS.map(({ key, Icon, color }) => (
                        <GoalCard
                            key={key}
                            goalKey={key}
                            Icon={Icon}
                            color={color}
                            label={t(`assessment.goals.${key}.label`)}
                            desc={t(`assessment.goals.${key}.desc`)}
                            selected={selected === key}
                            onSelect={setSelected}
                        />
                    ))}
                </div>

                {/* Continue button */}
                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!selected || submitting}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white font-semibold text-base shadow-md transition-all duration-200 hover:brightness-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E14219] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                    >
                        {submitting ? t('assessment.test.starting') : t('assessment.goals.continueBtn')}
                        {!submitting && <ArrowRightIcon />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnglishGoalSelectionPage;

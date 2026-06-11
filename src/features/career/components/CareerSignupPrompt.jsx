import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildSignupUrl, CAREER_INTENT } from '../utils/careerLimits';

const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const IconArrowRight = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
);

const BENEFIT_KEYS = [
    'career.signup.prompt.features.save',
    'career.signup.prompt.features.download',
    'career.signup.prompt.features.tailor',
    'career.signup.prompt.features.coverLetter',
    'career.signup.prompt.features.track',
];

/**
 * Inline signup nudge shown below job matches for unauthenticated users.
 *
 * @param {Object} props
 * @param {string} [props.draftId]
 * @param {number} [props.hiddenCount] — number of job matches hidden behind the gate
 */
const CareerSignupPrompt = ({ draftId, hiddenCount = 0 }) => {
    const { t } = useTranslation();
    const signupUrl = buildSignupUrl({ intent: CAREER_INTENT.SAVE, draftId });

    return (
        <div className="relative overflow-hidden rounded-2xl bg-[#0F1013] border border-white/8 px-8 py-10 text-white">
            {/* Glow */}
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#E14219] opacity-[0.07] blur-3xl -translate-y-1/3 translate-x-1/4" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
                {/* Left: copy */}
                <div className="flex-1">
                    <h3 className="font-suisse font-bold text-xl sm:text-2xl text-white mb-2">
                        {t('career.signup.prompt.title')}
                    </h3>
                    <p className="text-sm text-white/60 mb-5 leading-relaxed">
                        {hiddenCount > 0
                            ? `${hiddenCount} more matching job${hiddenCount > 1 ? 's' : ''} are waiting — plus:`
                            : t('career.signup.prompt.subtitle')}
                    </p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {BENEFIT_KEYS.map((key) => (
                            <li key={key} className="flex items-center gap-2.5">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E14219]/20">
                                    <IconCheck className="w-3 h-3 text-[#FF8C6E]" />
                                </span>
                                <span className="text-sm text-white/75">{t(key)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: CTA */}
                <div className="flex-shrink-0 w-full sm:w-auto">
                    <Link
                        to={signupUrl}
                        className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-7 py-4 text-base font-semibold text-white shadow-lg hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95 w-full sm:w-auto whitespace-nowrap"
                    >
                        {t('career.signup.prompt.cta')}
                        <IconArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-center text-xs text-white/35 mt-2">
                        Free account · 30 seconds
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CareerSignupPrompt;

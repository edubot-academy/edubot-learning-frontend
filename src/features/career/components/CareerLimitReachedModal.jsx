import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AiCreditsBadge from './AiCreditsBadge';
import { getCareerUpgradeUrl } from '../utils/careerUsage';

const FEATURE_KEYS = [
    'career.usage.limitReached.features.moreResumes',
    'career.usage.limitReached.features.coverLetters',
    'career.usage.limitReached.features.tailored',
    'career.usage.limitReached.features.tracking',
];

const IconClose = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const CareerLimitReachedModal = ({ open, onClose, metricKey, metric }) => {
    const { t } = useTranslation();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141619]/55 px-4 py-8 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1a1a1a]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#E14219]">
                            Career Plus
                        </p>
                        <h2 className="mt-2 font-suisse text-2xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                            {t('career.usage.limitReached.title')}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-gray-200 p-2 text-gray-400 hover:text-gray-600 dark:border-white/10 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                        <IconClose />
                    </button>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#3E424A] dark:text-[#a6adba]">
                    {t('career.usage.limitReached.subtitle')}
                </p>

                {metricKey && metric ? (
                    <div className="mt-4">
                        <AiCreditsBadge metricKey={metricKey} metric={metric} />
                    </div>
                ) : null}

                <div className="mt-5 space-y-2 rounded-2xl bg-gray-50 px-4 py-4 dark:bg-white/[0.03]">
                    {FEATURE_KEYS.map((key) => (
                        <p key={key} className="text-sm text-[#141619] dark:text-[#E8ECF3]">
                            • {t(key)}
                        </p>
                    ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to={getCareerUpgradeUrl(metricKey)}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white"
                    >
                        {t('career.usage.limitReached.upgradeCta')}
                    </Link>
                    <Link
                        to="/contact"
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-[#3E424A] hover:border-[#E14219]/30 hover:text-[#E14219] dark:border-white/10 dark:text-[#a6adba]"
                    >
                        {t('career.usage.limitReached.contactCta')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CareerLimitReachedModal;

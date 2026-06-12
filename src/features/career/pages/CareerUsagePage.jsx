import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { getCareerPlans, getCareerUsage } from '../api/usageApi';
import AiCreditsBadge from '../components/AiCreditsBadge';
import { getCareerUpgradeUrl, getCareerUsageMetricLabelKey } from '../utils/careerUsage';

const CareerUsagePage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [usage, setUsage] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        Promise.all([getCareerUsage(), getCareerPlans()])
            .then(([usageData, planData]) => {
                if (!mounted) return;
                setUsage(usageData);
                setPlans(Array.isArray(planData) ? planData : []);
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

    const metrics = usage?.usage ? Object.entries(usage.usage) : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141619] px-6 py-12 text-[#141619] dark:text-[#E8ECF3] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest mb-1.5">
                    EduBot Career
                </p>
                <h1 className="font-suisse font-bold text-3xl">{t('career.usage.title')}</h1>
                <p className="mt-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                    Compare your current limits, review Career Plus, and upgrade when you need more AI actions.
                </p>

                {loading ? (
                    <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-[#3E424A] dark:text-[#a6adba]">
                        Loading usage...
                    </div>
                ) : error || !usage ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-300">
                        Unable to load usage.
                    </div>
                ) : (
                    <>
                        <div className="mt-6 rounded-2xl border border-[#E14219]/20 bg-gradient-to-r from-[#FFF3EF] via-white to-orange-50 p-6 dark:border-[#E14219]/20 dark:bg-gradient-to-r dark:from-[#E14219]/10 dark:via-[#1a1a1a] dark:to-[#1a1a1a]">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-[#E14219]">
                                        Career Plus
                                    </p>
                                    <h2 className="mt-2 font-suisse text-2xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                                        {t('career.usage.limitReached.upgradeCta')}
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        {t('career.usage.limitReached.subtitle')}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        to={getCareerUpgradeUrl(searchParams.get('metric') || undefined)}
                                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white"
                                    >
                                        {t('career.usage.limitReached.upgradeCta')}
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-[#3E424A] hover:border-[#E14219]/30 hover:text-[#E14219] dark:border-white/10 dark:text-[#a6adba]"
                                    >
                                        {t('career.usage.limitReached.contactCta')}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6">
                            <p className="text-sm text-[#3E424A] dark:text-[#a6adba]">
                                Plan: <span className="font-semibold text-[#141619] dark:text-[#E8ECF3]">{usage.plan}</span>
                            </p>
                            <p className="mt-1 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                Period start: {usage.periodStart}
                            </p>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {metrics.map(([key, value]) => (
                                <div key={key} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-5">
                                    <p className="text-sm font-medium text-[#3E424A] dark:text-[#a6adba]">
                                        {t(getCareerUsageMetricLabelKey(key))}
                                    </p>
                                    <div className="mt-3">
                                        <AiCreditsBadge metricKey={key} metric={value} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {plans.map((plan) => (
                                <div
                                    key={plan.plan}
                                    className={`rounded-2xl border bg-white p-5 dark:bg-[#1a1a1a] ${
                                        searchParams.get('plan') === plan.plan
                                            ? 'border-[#E14219] ring-2 ring-[#E14219]/15 dark:border-[#E14219]'
                                            : 'border-gray-100 dark:border-white/10'
                                    }`}
                                >
                                    <h2 className="font-semibold text-lg mb-3">{plan.plan}</h2>
                                    <div className="space-y-2 text-sm text-[#3E424A] dark:text-[#a6adba]">
                                        {Object.entries(plan.limits || {}).map(([key, limit]) => (
                                            <p key={key} className="flex items-center justify-between gap-4">
                                                <span>{t(getCareerUsageMetricLabelKey(key))}</span>
                                                <span className="font-medium text-[#141619] dark:text-[#E8ECF3]">{limit}</span>
                                            </p>
                                        ))}
                                    </div>
                                    {plan.plan === 'careerPlus' ? (
                                        <Link
                                            to="/contact"
                                            className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-2.5 text-sm font-semibold text-white"
                                        >
                                            {t('career.usage.limitReached.contactCta')}
                                        </Link>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CareerUsagePage;

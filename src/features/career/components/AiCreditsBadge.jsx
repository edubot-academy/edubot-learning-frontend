import { useTranslation } from 'react-i18next';
import { getCareerUsageMetricLabelKey, isUsageMetricExhausted } from '../utils/careerUsage';

const AiCreditsBadge = ({ metricKey, metric, compact = false }) => {
    const { t } = useTranslation();

    if (!metricKey || !metric) return null;

    const exhausted = isUsageMetricExhausted(metric);
    const label = t(getCareerUsageMetricLabelKey(metricKey));
    const usageLabel = exhausted
        ? t('career.usage.badge.exhausted')
        : t('career.usage.badge.remaining', { remaining: metric.remaining, limit: metric.limit });

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                exhausted
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'border-gray-200 bg-white text-[#3E424A] dark:border-white/10 dark:bg-white/5 dark:text-[#a6adba]'
            } ${compact ? 'text-xs' : 'text-sm'}`}
        >
            <span className="font-semibold text-[#141619] dark:text-[#E8ECF3]">{label}</span>
            <span>{usageLabel}</span>
        </div>
    );
};

export default AiCreditsBadge;

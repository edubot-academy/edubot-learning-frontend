export const CAREER_USAGE_KEYS = {
    RESUME_GENERATIONS: 'resumeGenerations',
    JOB_MATCH_REQUESTS: 'jobMatchRequests',
    COVER_LETTERS: 'coverLetters',
    INTERVIEW_PLANS: 'interviewPlans',
};

const METRIC_LABEL_KEYS = {
    [CAREER_USAGE_KEYS.RESUME_GENERATIONS]: 'career.usage.metrics.resumeGenerations',
    [CAREER_USAGE_KEYS.JOB_MATCH_REQUESTS]: 'career.usage.metrics.jobMatchRequests',
    [CAREER_USAGE_KEYS.COVER_LETTERS]: 'career.usage.metrics.coverLetters',
    [CAREER_USAGE_KEYS.INTERVIEW_PLANS]: 'career.usage.metrics.interviewPlans',
};

export const getUsageMetric = (usage, metricKey) => usage?.usage?.[metricKey] ?? null;

export const isUsageMetricExhausted = (metric) => {
    if (!metric) return false;
    if (metric.limit == null) return false;
    return Number(metric.remaining ?? 0) <= 0;
};

export const isCareerLimitReachedError = (error) => {
    const data = error?.response?.data;
    const message = String(data?.message || error?.message || '');
    return (
        data?.code === 'LIMIT_REACHED' ||
        data?.error === 'LIMIT_REACHED' ||
        message.includes('LIMIT_REACHED')
    );
};

export const getCareerUsageMetricLabelKey = (metricKey) =>
    METRIC_LABEL_KEYS[metricKey] || metricKey;

export const getCareerUpgradeUrl = (metricKey) => {
    const params = new URLSearchParams();
    params.set('plan', 'careerPlus');
    if (metricKey) params.set('metric', metricKey);
    return `/career/usage?${params.toString()}`;
};

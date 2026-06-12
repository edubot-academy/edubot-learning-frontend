import { useCallback, useEffect, useState } from 'react';
import { getCareerUsage } from '../api/usageApi';
import { getUsageMetric, isUsageMetricExhausted } from '../utils/careerUsage';

export const useCareerUsageStatus = ({ enabled = true } = {}) => {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(Boolean(enabled));
    const [error, setError] = useState(null);

    const refresh = useCallback(() => {
        if (!enabled) return Promise.resolve(null);

        setLoading(true);
        setError(null);

        return getCareerUsage()
            .then((data) => {
                setUsage(data ?? null);
                return data ?? null;
            })
            .catch((err) => {
                setError(err);
                return null;
            })
            .finally(() => setLoading(false));
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            setUsage(null);
            setLoading(false);
            setError(null);
            return;
        }

        refresh();
    }, [enabled, refresh]);

    const getMetric = useCallback((metricKey) => getUsageMetric(usage, metricKey), [usage]);
    const isLocked = useCallback((metricKey) => isUsageMetricExhausted(getMetric(metricKey)), [getMetric]);

    return {
        usage,
        loading,
        error,
        refresh,
        getMetric,
        isLocked,
    };
};

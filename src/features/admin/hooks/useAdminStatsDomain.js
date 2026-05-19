import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAdminStats } from '@services/api';
import { isForbiddenError, parseApiError } from '@shared/api/error';
import { useTranslation } from 'react-i18next';

export const useAdminStatsDomain = () => {
    const { t } = useTranslation();
    const [adminStats, setAdminStats] = useState(null);
    const [adminStatsLoading, setAdminStatsLoading] = useState(false);
    const [adminStatsLoaded, setAdminStatsLoaded] = useState(false);

    const loadAdminStats = useCallback(async () => {
        setAdminStatsLoading(true);
        try {
            const stats = await fetchAdminStats();
            setAdminStats(stats);
            setAdminStatsLoaded(true);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(parseApiError(error, t('adminStats.toasts.loadError')).message);
            }
        } finally {
            setAdminStatsLoading(false);
        }
    }, [t]);

    return {
        adminStats,
        adminStatsLoaded,
        adminStatsLoading,
        loadAdminStats,
    };
};

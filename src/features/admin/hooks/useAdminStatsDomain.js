import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAdminStats } from '@services/api';
import { isForbiddenError } from '@shared/api/error';

export const useAdminStatsDomain = () => {
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
                toast.error('Статистиканы жүктөөдө ката кетти');
            }
        } finally {
            setAdminStatsLoading(false);
        }
    }, []);

    return {
        adminStats,
        adminStatsLoaded,
        adminStatsLoading,
        loadAdminStats,
    };
};

import { useEffect } from 'react';

const TASK_REFRESH_INTERVAL_MS = 30000;

export const useStudentTaskRefresh = ({ activeTab, studentId, onRefreshTasks }) => {
    useEffect(() => {
        if (activeTab !== 'tasks' || !studentId) return undefined;

        const refreshTasksIfVisible = () => {
            if (document.visibilityState === 'visible') {
                onRefreshTasks({ silent: true });
            }
        };

        const handleWindowFocus = () => {
            refreshTasksIfVisible();
        };

        const intervalId = window.setInterval(() => {
            refreshTasksIfVisible();
        }, TASK_REFRESH_INTERVAL_MS);

        document.addEventListener('visibilitychange', refreshTasksIfVisible);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', refreshTasksIfVisible);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [activeTab, onRefreshTasks, studentId]);
};

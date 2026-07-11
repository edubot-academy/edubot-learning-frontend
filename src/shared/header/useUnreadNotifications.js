import { useEffect, useState } from 'react';
import { fetchUnreadNotificationsCount } from '@features/notifications/api';

export const useUnreadNotifications = (user) => {
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        if (!user) {
            setUnreadNotifications(0);
            return;
        }

        let cancelled = false;

        const loadUnreadNotifications = async () => {
            try {
                const unreadRes = await fetchUnreadNotificationsCount();
                if (!cancelled) {
                    setUnreadNotifications(unreadRes?.count ?? 0);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load unread notifications:', error);
                }
            }
        };

        loadUnreadNotifications();

        return () => {
            cancelled = true;
        };
    }, [user]);

    return unreadNotifications;
};

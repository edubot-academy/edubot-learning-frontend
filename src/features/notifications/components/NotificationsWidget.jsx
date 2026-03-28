import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    fetchNotifications,
    fetchUnreadNotificationsCount,
    markAllNotificationsRead,
} from '../api';
import Loader from '@shared/ui/Loader';
import {
    DashboardInsetPanel,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

const NotificationsWidget = ({ title = 'Билдирүүлөр', limit = 5, link = '/notifications' }) => {
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [listRes, unreadRes] = await Promise.all([
                fetchNotifications({ page: 1, limit }),
                fetchUnreadNotificationsCount(),
            ]);
            setItems(listRes.items || []);
            setUnreadCount(unreadRes?.count || 0);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            await load();
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    return (
        <DashboardInsetPanel
            title={title}
            description="Жаңылык жана эскертмелер"
        >
            <div className="mt-4 flex items-center justify-between gap-2 mb-3">
                <div>
                    <div className="inline-flex items-center gap-2 text-sm text-edubot-muted dark:text-slate-400">
                        <FiBell className="h-4 w-4 text-edubot-orange" />
                        Акыркы жаңыртуулар
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/40 text-gray-700 dark:text-[#E8ECF3]">
                            {unreadCount} жаңы
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleMarkAll}
                        className="dashboard-button-secondary"
                    >
                        <FiCheckCircle className="h-4 w-4" />
                        Баарын окулган деп белгилөө
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader fullScreen={false} />
            ) : items.length === 0 ? (
                <EmptyState
                    title="Азырынча билдирүүлөр жок"
                    subtitle="Жаңы окуялар болгондо бул жерден көрүнө баштайт."
                />
            ) : (
                <ul className="divide-y divide-edubot-line/70 dark:divide-slate-800">
                    {items.map((item) => (
                        <li key={item.id} className="py-3 text-sm">
                            <p className="text-edubot-ink dark:text-[#E8ECF3] line-clamp-2">
                                {item.message || item.subject}
                            </p>
                            <p className="text-xs text-edubot-muted dark:text-[#a6adba] mt-1">
                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-4 text-right">
                <Link to={link} className="text-sm font-semibold text-edubot-orange hover:underline">
                    Бардыгын көрүү
                </Link>
            </div>
        </DashboardInsetPanel>
    );
};

export default NotificationsWidget;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    fetchNotifications,
    fetchUnreadNotificationsCount,
    markAllNotificationsRead,
} from '../api';
import Loader from '@shared/ui/Loader';

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
        <div className="rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">Жаңылык жана эскертмелер</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-gray-700 dark:text-[#a6adba]">
                            {unreadCount} жаңы
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleMarkAll}
                        className="text-xs text-gray-500 dark:text-[#a6adba] hover:text-gray-800 dark:hover:text-white"
                    >
                        Баарын окулган деп белгилөө
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader fullScreen={false} />
            ) : items.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">Азырынча билдирүүлөр жок.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <li key={item.id} className="py-2 text-sm">
                            <p className="text-gray-800 dark:text-white line-clamp-2">
                                {item.message || item.subject}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-3 text-right">
                <Link to={link} className="text-sm text-blue-600 hover:underline">
                    Бардыгын көрүү
                </Link>
            </div>
        </div>
    );
};

export default NotificationsWidget;

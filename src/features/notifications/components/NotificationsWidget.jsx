import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    fetchNotifications,
    fetchUnreadNotificationsCount,
    markAllNotificationsRead,
} from '../api';

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
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">Жаңылык жана эскертмелер</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                            {unreadCount} жаңы
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleMarkAll}
                        className="text-xs text-gray-500 hover:text-gray-800"
                    >
                        Баарын окулган деп белгилөө
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">Жүктөлүүдө...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-gray-500">Азырынча билдирүүлөр жок.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <li key={item.id} className="py-2 text-sm">
                            <p className="text-gray-800 line-clamp-2">{item.message || item.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString()
                                    : ''}
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

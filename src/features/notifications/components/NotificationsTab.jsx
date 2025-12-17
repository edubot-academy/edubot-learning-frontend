import { useEffect, useMemo, useState } from 'react';
import {
    fetchNotifications,
    fetchUnreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
} from '../api';
import { Link } from 'react-router-dom';

const NotificationsTab = () => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const grouped = useMemo(() => {
        const groups = {};
        items.forEach((notif) => {
            const date = notif.createdAt ? new Date(notif.createdAt) : new Date();
            const label = date.toLocaleDateString();
            if (!groups[label]) groups[label] = [];
            groups[label].push(notif);
        });
        return groups;
    }, [items]);

    const load = async (nextPage = 1) => {
        setLoading(true);
        try {
            const [listRes, unreadRes] = await Promise.all([
                fetchNotifications({ page: nextPage, limit: 10 }),
                fetchUnreadNotificationsCount(),
            ]);
            const newItems = nextPage === 1 ? listRes.items : [...items, ...listRes.items];
            setItems(newItems);
            setPage(nextPage);
            setHasMore(nextPage < (listRes.totalPages || 1));
            setUnreadCount(unreadRes?.count || 0);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setItems((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            setItems((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <h2 className="text-xl font-semibold text-gray-900">Билдирүүлөр</h2>
                    {unreadCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {unreadCount} жаңы
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleMarkAll}
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    Баарын окулган деп белгилөө
                </button>
            </div>

            {loading && items.length === 0 ? (
                <p className="text-sm text-gray-500">Жүктөлүүдө...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-gray-500">Билдирүүлөр жок.</p>
            ) : (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([day, list]) => (
                        <div key={day} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-2 h-2 bg-orange-400 rounded-full" />
                                <span>{day}</span>
                            </div>
                            <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                                {list.map((notif) => {
                                    const isUnread = !notif.read;
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`p-3 sm:p-4 flex items-start gap-3 ${isUnread ? 'bg-orange-50' : 'bg-white'}`}
                                        >
                                            <div className="text-lg">
                                                {notif.icon || '💬'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-gray-800 line-clamp-2">
                                                        {notif.title || notif.subject || 'Билдирүү'}
                                                    </p>
                                                    {isUnread && (
                                                        <button
                                                            type="button"
                                                            className="text-xs text-blue-600"
                                                            onClick={() => handleMarkAsRead(notif.id)}
                                                        >
                                                            Окулду
                                                        </button>
                                                    )}
                                                </div>
                                                {notif.message && (
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                                        {notif.message}
                                                    </p>
                                                )}
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    {notif.createdAt &&
                                                        new Date(notif.createdAt).toLocaleString()}
                                                    {notif.link && (
                                                        <Link
                                                            to={notif.link}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Карап чыгуу
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => load(page + 1)}
                            disabled={loading}
                            className="w-full py-2 text-sm border rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                            {loading ? 'Жүктөлүүдө...' : 'Дагы билдирүүлөрдү жүктөө'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsTab;

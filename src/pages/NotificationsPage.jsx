import { useEffect, useMemo, useState } from 'react';
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from '@features/notifications/api';

const FILTERS = [
    { id: 'all', ky: 'Баары', ru: 'Все' },
    { id: 'sessions', ky: 'Сабактар', ru: 'Сессии' },
    { id: 'homework', ky: 'Тапшырмалар', ru: 'Домашки' },
    { id: 'attendance', ky: 'Катышуу', ru: 'Посещаемость' },
];

const NotificationsPage = () => {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const lang = 'ky';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchNotifications({ limit: 50 });
                setItems(res.items || res || []);
            } catch (error) {
                console.error('Failed to load notifications', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        if (filter === 'all') return items;
        return items.filter((n) => n.type === filter);
    }, [items, filter]);

    const handleRead = async (id) => {
        try {
            await markNotificationRead(id);
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        } catch (error) {
            console.error('Failed to mark notification read', error);
        }
    };

    const grouped = useMemo(() => {
        const list = filtered || [];
        return list.reduce((acc, item) => {
            const day = item.createdAt
                ? new Date(item.createdAt).toISOString().split('T')[0]
                : 'unknown';
            if (!acc[day]) acc[day] = [];
            acc[day].push(item);
            return acc;
        }, {});
    }, [filtered]);

    const filterCount = (id) =>
        id === 'all'
            ? items.length
            : items.filter((n) => n.type === id).length;

    return (
        <div className="pt-20 pb-10 max-w-5xl mx-auto px-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Билдирүүлөр</h1>
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-2 rounded-full text-sm ${
                                filter === f.id ? 'bg-emerald-600 text-white' : 'border border-gray-200'
                            }`}
                        >
                            {f[lang]} ({filterCount(f.id)})
                        </button>
                    ))}
                    <button
                        onClick={async () => {
                            await markAllNotificationsRead();
                            setItems((prev) => prev.map((n) => ({ ...n, read: true })));
                        }}
                        className="px-3 py-2 rounded border text-sm"
                    >
                        Баарын окулат
                    </button>
                </div>
            </div>
            {loading ? (
                <div className="space-y-2">
                    <div className="h-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-20 bg-gray-200 rounded animate-pulse" />
                </div>
            ) : filtered.length ? (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([day, list]) => (
                        <div key={day} className="space-y-2">
                            <p className="text-xs uppercase text-gray-500">{day}</p>
                            {list.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-3 border rounded-lg ${n.read ? 'bg-white' : 'bg-orange-50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900">{n.title || n.subject}</p>
                                        {!n.read && (
                                            <button
                                                onClick={() => handleRead(n.id)}
                                                className="text-xs text-emerald-600"
                                            >
                                                Окулду
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{n.message}</p>
                                    <p className="text-xs text-gray-500">
                                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-gray-500">Билдирүүлөр жок</div>
            )}
        </div>
    );
};

export default NotificationsPage;

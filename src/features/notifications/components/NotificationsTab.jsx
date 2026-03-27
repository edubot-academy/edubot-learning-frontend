import { useEffect, useMemo, useState } from 'react';
import {
    fetchNotifications,
    fetchUnreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
} from '../api';
import { Link } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBell, FiCheckCircle, FiInbox, FiLink2 } from 'react-icons/fi';

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
            const nextItems = Array.isArray(listRes?.items) ? listRes.items : [];
            setItems((prev) => (nextPage === 1 ? nextItems : [...prev, ...nextItems]));
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
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Notifications center"
                title="Билдирүүлөр"
                description="Акыркы активдүүлүк, эскертмелер жана окула элек жаңыртуулар ушул жерде топтолот."
                action={(
                    <button
                        type="button"
                        onClick={handleMarkAll}
                        className="dashboard-button-secondary"
                    >
                        <FiCheckCircle className="h-4 w-4" />
                        Баарын окулган деп белгилөө
                    </button>
                )}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label="Бардык билдирүүлөр"
                    value={items.length}
                    icon={FiInbox}
                />
                <DashboardMetricCard
                    label="Окула элек"
                    value={unreadCount}
                    icon={FiBell}
                    tone={unreadCount > 0 ? 'amber' : 'green'}
                />
                <DashboardMetricCard
                    label="Жүктөлгөн барак"
                    value={page}
                    icon={FiCheckCircle}
                    tone="blue"
                />
            </div>

            <DashboardInsetPanel
                title="Билдирүү тасмасы"
                description="Жаңы эскертмелер жогору жагында, эскилери күн боюнча топтолуп көрсөтүлөт."
            >
                <div className="mt-4">
                    {loading && items.length === 0 ? (
                        <div className="flex justify-center py-10">
                            <Loader fullScreen={false} />
                        </div>
                    ) : items.length === 0 ? (
                        <EmptyState
                            title="Билдирүүлөр жок"
                            subtitle="Жаңы окуя же жаңыртуу болгондо билдирүүлөр ушул жерде көрүнөт."
                            icon={<FiBell className="h-8 w-8 text-edubot-orange" />}
                            className="py-10"
                        />
                    ) : (
                        <div className="space-y-5">
                            {Object.entries(grouped).map(([day, list]) => (
                                <div key={day} className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        <span className="h-2 w-2 rounded-full bg-edubot-orange" />
                                        <span>{day}</span>
                                    </div>

                                    <div className="space-y-3">
                                        {list.map((notif) => {
                                            const isUnread = !notif.read;
                                            return (
                                                <div
                                                    key={notif.id}
                                                    className={`rounded-3xl border px-4 py-4 transition-all duration-300 ${
                                                        isUnread
                                                            ? 'border-edubot-orange/30 bg-edubot-orange/5 shadow-edubot-card dark:border-edubot-soft/30 dark:bg-edubot-soft/10'
                                                            : 'border-edubot-line/80 bg-white/90 hover:-translate-y-0.5 hover:border-edubot-orange/30 hover:shadow-edubot-card dark:border-slate-700 dark:bg-slate-950'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange dark:bg-slate-800 dark:text-edubot-soft">
                                                            <span className="text-lg">{notif.icon || '💬'}</span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                                        {notif.title || notif.subject || 'Билдирүү'}
                                                                    </p>
                                                                    {notif.message ? (
                                                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-300">
                                                                            {notif.message}
                                                                        </p>
                                                                    ) : null}
                                                                </div>

                                                                {isUnread ? (
                                                                    <button
                                                                        type="button"
                                                                        className="shrink-0 text-xs font-semibold text-edubot-orange hover:underline"
                                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                                    >
                                                                        Окулду
                                                                    </button>
                                                                ) : null}
                                                            </div>

                                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-edubot-muted dark:text-slate-400">
                                                                <span>
                                                                    {notif.createdAt
                                                                        ? new Date(notif.createdAt).toLocaleString()
                                                                        : ''}
                                                                </span>
                                                                {notif.link ? (
                                                                    <Link
                                                                        to={notif.link}
                                                                        className="inline-flex items-center gap-1 font-semibold text-edubot-orange hover:underline"
                                                                    >
                                                                        <FiLink2 className="h-3.5 w-3.5" />
                                                                        Карап чыгуу
                                                                    </Link>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {hasMore ? (
                                <button
                                    type="button"
                                    onClick={() => load(page + 1)}
                                    disabled={loading}
                                    className="dashboard-button-secondary w-full justify-center"
                                >
                                    {loading ? <Loader size={20} /> : 'Дагы билдирүүлөрдү жүктөө'}
                                </button>
                            ) : null}
                        </div>
                    )}
                </div>
            </DashboardInsetPanel>
        </div>
    );
};

export default NotificationsTab;

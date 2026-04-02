import { useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiLayers, FiSearch } from 'react-icons/fi';
import { fetchInstructorCourses, fetchCourseGroups, fetchHomework, fetchHomeworkSummary } from '@services/api';
import Loader from '@shared/ui/Loader';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    EmptyState,
} from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';

const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const getHomeworkErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    if (status === 401) return 'Сессия мөөнөтү бүттү. Кайра кириңиз.';
    if (status === 403) return 'Бул курс же группа сизге бекитилген эмес.';
    const message = error?.response?.data?.message || fallback;
    return Array.isArray(message) ? message.join(', ') : message;
};

const formatDisplayDate = (value, fallback = 'Мөөнөт коюлган эмес') => {
    if (!value) return fallback;
    const normalized =
        typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('ky-KG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getHomeworkStateMeta = (item) => {
    const queue = item?.queue || {};
    if (!item?.isPublished) {
        return {
            label: 'Жарыялана элек',
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }
    if (Number(queue.needsReviewCount || 0) > 0) {
        return {
            label: 'Текшерүү керек',
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (Number(queue.missingCount || 0) > 0) {
        return {
            label: 'Жөнөткөн жок',
            tone: 'red',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        return {
            label: 'Оңдотуу керек',
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }

    const status = String(item?.status || '').toLowerCase();
    const rawDeadline = item?.deadline || item?.dueAt || item?.dueDate;

    if (['completed', 'approved', 'reviewed', 'checked'].includes(status)) {
        return {
            label: 'Текшерилген',
            tone: 'green',
            badgeClass:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }

    if (!rawDeadline) {
        return {
            label: 'Мөөнөт жок',
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }

    const normalized =
        typeof rawDeadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDeadline)
            ? `${rawDeadline}T23:59:59`
            : rawDeadline;
    const deadlineMs = new Date(normalized).getTime();
    if (Number.isNaN(deadlineMs)) {
        return {
            label: 'Белгисиз',
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }

    const nowMs = Date.now();
    if (deadlineMs < nowMs) {
        return {
            label: 'Өтүп кеткен',
            tone: 'red',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }

    const daysLeft = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
        return {
            label: 'Жакында бүтөт',
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }

    return {
        label: 'Активдүү',
        tone: 'blue',
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    };
};

const getHomeworkQueueBadges = (item) => {
    const queue = item?.queue || {};
    const badges = [];

    if (!item?.isPublished) {
        badges.push({
            key: 'draft',
            label: 'Жарыялана элек',
            className:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        });
        return badges;
    }

    if (Number(queue.needsReviewCount || 0) > 0) {
        badges.push({
            key: 'needs_review',
            label: 'Текшерүү керек',
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        });
    }
    if (Number(queue.missingCount || 0) > 0) {
        badges.push({
            key: 'missing',
            label: 'Жөнөткөн жок',
            className:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        });
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        badges.push({
            key: 'needs_revision',
            label: 'Оңдотуу керек',
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        });
    }
    if (Number(queue.lateCount || 0) > 0) {
        badges.push({
            key: 'late',
            label: 'Кеч тапшырган',
            className:
                'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
        });
    }

    if (!badges.length) {
        badges.push({
            key: 'state',
            label: getHomeworkStateMeta(item).label,
            className: getHomeworkStateMeta(item).badgeClass,
        });
    }

    return badges;
};

const buildSessionHomeworkPath = (item) => {
    const courseId = item?.courseId || item?.session?.group?.course?.id;
    const groupId = item?.groupId || item?.session?.group?.id;
    const sessionId = item?.sessionId || item?.session?.id;
    const homeworkId = item?.id;
    const params = new URLSearchParams({ tab: 'sessions', workspaceTab: 'homework' });
    if (courseId) params.set('courseId', String(courseId));
    if (groupId) params.set('groupId', String(groupId));
    if (sessionId) params.set('sessionId', String(sessionId));
    if (homeworkId) params.set('homeworkId', String(homeworkId));
    return `/instructor?${params.toString()}`;
};

const getQueuePriority = (item) => {
    const queue = item?.queue || {};
    if (Number(queue.needsReviewCount || 0) > 0) return 0;
    if (Number(queue.missingCount || 0) > 0) return 1;
    if (Number(queue.needsRevisionCount || 0) > 0) return 2;
    if (Number(queue.lateCount || 0) > 0) return 3;
    return 4;
};

const matchesHomeworkQueueFilter = (item, filter) => {
    if (filter === 'all') return true;
    const queue = item?.queue || {};
    if (filter === 'текшерүү керек') return Number(queue.needsReviewCount || 0) > 0;
    if (filter === 'жөнөткөн жок') return Number(queue.missingCount || 0) > 0;
    if (filter === 'оңдотуу керек') return Number(queue.needsRevisionCount || 0) > 0;
    if (filter === 'кеч тапшырган') return Number(queue.lateCount || 0) > 0;
    return item.stateMeta.label.toLowerCase() === filter;
};

const InstructorHomework = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [limit, setLimit] = useState(20);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [summary, setSummary] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        const loadCourses = async () => {
            const response = await fetchInstructorCourses({ status: 'all' });
            setCourses(toArray(response?.courses || response));
        };
        loadCourses().catch((error) => {
            setCourses([]);
            toast.error(getHomeworkErrorMessage(error, 'Курстар жүктөлгөн жок.'));
        });
    }, [user]);

    useEffect(() => {
        if (!courseId) {
            setGroups([]);
            setGroupId('');
            return;
        }
        const loadGroups = async () => {
            const response = await fetchCourseGroups({ courseId: Number(courseId) });
            setGroups(toArray(response));
        };
        loadGroups().catch((error) => {
            setGroups([]);
            toast.error(getHomeworkErrorMessage(error, 'Группалар жүктөлгөн жок.'));
        });
    }, [courseId]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [summaryRes, homeworkRes] = await Promise.all([
                    fetchHomeworkSummary({
                        courseId: courseId || undefined,
                        groupId: groupId || undefined,
                    }),
                    fetchHomework({
                        courseId: courseId || undefined,
                        groupId: groupId || undefined,
                        limit,
                    }),
                ]);
                setSummary(summaryRes || null);
                setItems(toArray(homeworkRes));
            } finally {
                setLoading(false);
            }
        };
        load().catch((error) => {
            setSummary(null);
            setItems([]);
            toast.error(getHomeworkErrorMessage(error, 'Үй тапшырмалар жүктөлгөн жок.'));
        });
    }, [courseId, groupId, limit]);

    const enrichedItems = useMemo(
        () =>
            items.map((item) => ({
                ...item,
                stateMeta: getHomeworkStateMeta(item),
            })),
        [items]
    );

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return enrichedItems.filter((item) => {
            const matchesQuery =
                !normalizedQuery ||
                [
                    item.title,
                    item.name,
                    item.courseTitle,
                    item.course?.title,
                    item.groupName,
                    item.group?.name,
                    item.sessionTitle,
                    item.session?.title,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
            const matchesState = matchesHomeworkQueueFilter(item, statusFilter);
            return matchesQuery && matchesState;
        }).sort((left, right) => {
            const priorityDiff = getQueuePriority(left) - getQueuePriority(right);
            if (priorityDiff !== 0) return priorityDiff;
            const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Number.POSITIVE_INFINITY;
            const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Number.POSITIVE_INFINITY;
            return leftDeadline - rightDeadline;
        });
    }, [enrichedItems, query, statusFilter]);

    const stats = useMemo(
        () => ({
            total: summary?.total ?? items.length,
            actionRequired: summary?.actionRequired ?? 0,
            needsReview: summary?.needsReview ?? 0,
            missing: summary?.missing ?? 0,
            needsRevision: summary?.needsRevision ?? 0,
            overdue: summary?.overdue ?? enrichedItems.filter((item) => item.stateMeta.label === 'Өтүп кеткен').length,
        }),
        [summary, items.length, enrichedItems]
    );

    const applyQueueFilter = (nextFilter) => {
        setStatusFilter((current) => (current === nextFilter ? 'all' : nextFilter));
    };

    const metricCardClass = (isActive) =>
        isActive
            ? 'ring-2 ring-edubot-orange/60 ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
            : '';

    return (
        <div className="pt-24 p-4 md:p-6 max-w-7xl mx-auto space-y-5">
            <div className="dashboard-panel overflow-hidden p-6 md:p-8">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] xl:items-end">
                    <div className="space-y-4">
                        <div className="text-sm font-semibold uppercase tracking-[0.28em] text-edubot-orange">
                            Homework Queue
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-edubot-ink dark:text-white md:text-5xl">
                            Үй тапшырма кезеги
                        </h1>
                        <p className="max-w-3xl text-base leading-8 text-edubot-muted dark:text-slate-300 md:text-lg">
                            Бул жерден кайсы курс, группа жана сессия боюнча иш бар экенин табыңыз.
                            Толук текшерүү агымы тиешелүү сессиянын ичиндеги үй тапшырма бөлүгүндө ачылат.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className="text-left"
                        >
                            <DashboardMetricCard label="Жалпы" value={stats.total} icon={FiBookOpen} />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQueueFilter('текшерүү керек')}
                            className={`text-left ${metricCardClass(statusFilter === 'текшерүү керек')}`}
                        >
                            <DashboardMetricCard
                                label="Аракет керек"
                                value={stats.actionRequired}
                                icon={FiClock}
                                tone="amber"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQueueFilter('жөнөткөн жок')}
                            className={`text-left ${metricCardClass(statusFilter === 'жөнөткөн жок')}`}
                        >
                            <DashboardMetricCard
                                label="Жөнөткөн жок"
                                value={stats.missing}
                                icon={FiAlertCircle}
                                tone="red"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQueueFilter('оңдотуу керек')}
                            className={`text-left ${metricCardClass(statusFilter === 'оңдотуу керек')}`}
                        >
                            <DashboardMetricCard
                                label="Оңдотуу керек"
                                value={stats.needsRevision}
                                icon={FiCheckCircle}
                                tone="amber"
                            />
                        </button>
                    </div>
                </div>
            </div>

            <DashboardInsetPanel
                title="Фильтрлер"
                description="Кезекти курс, группа, абал жана издөө боюнча тарылтыңыз."
            >
                <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr),minmax(0,0.9fr),minmax(0,0.8fr),minmax(0,0.7fr)]">
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="dashboard-field dashboard-select"
                    >
                        <option value="">Бардык курстар</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title || course.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        className="dashboard-field dashboard-select"
                        disabled={!courseId}
                    >
                        <option value="">Бардык группалар</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name || group.code}
                            </option>
                        ))}
                    </select>

                    <div className="relative">
                        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Издөө"
                            className="dashboard-field dashboard-field-icon pl-10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="dashboard-field dashboard-select"
                    >
                        <option value="all">Баары</option>
                        <option value="текшерүү керек">Текшерүү керек</option>
                        <option value="жөнөткөн жок">Жөнөткөн жок</option>
                        <option value="оңдотуу керек">Оңдотуу керек</option>
                        <option value="кеч тапшырган">Кеч тапшырган</option>
                        <option value="жарыялана элек">Жарыялана элек</option>
                        <option value="активдүү">Активдүү</option>
                        <option value="жакында бүтөт">Жакында бүтөт</option>
                        <option value="өтүп кеткен">Өтүп кеткен</option>
                        <option value="текшерилген">Текшерилген</option>
                        <option value="мөөнөт жок">Мөөнөт жок</option>
                    </select>

                    <input
                        type="number"
                        min="1"
                        max="200"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value || 20))}
                        className="dashboard-field"
                        placeholder="Лимит"
                    />
                </div>
            </DashboardInsetPanel>

            {loading ? <Loader fullScreen={false} /> : null}

            {!loading && filteredItems.length === 0 ? (
                <DashboardInsetPanel
                    title="Тапшырмалар"
                    description="Тандалган фильтрлер боюнча жыйынтык бул жерде чыгат."
                >
                    <EmptyState
                        title="Үй тапшырмалар табылган жок"
                        subtitle="Курс же группа фильтрлерин өзгөртүп көрүңүз же издөө суроосун тазалаңыз."
                        icon={<FiLayers className="h-8 w-8 text-edubot-orange" />}
                        className="py-8"
                    />
                </DashboardInsetPanel>
            ) : (
                <DashboardInsetPanel
                    title="Кезектеги тапшырмалар"
                    description="Ар бир карточка тиешелүү сессияга өтүп, толук текшерүү агымын ачууга жардам берет."
                    action={
                        <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {filteredItems.length} жазуу
                        </span>
                    }
                >
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredItems.map((item) => (
                            <article
                                key={item.id || `${item.title}-${item.deadline || ''}`}
                                className="dashboard-panel-muted rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-edubot-card"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                            {item.title || item.name || 'Үй тапшырма'}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {getHomeworkQueueBadges(item).map((badge) => (
                                                <span
                                                    key={badge.key}
                                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="shrink-0 rounded-2xl border border-edubot-orange/20 bg-edubot-orange/10 px-3 py-2 text-right">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-edubot-orange">
                                            Аракет керек
                                        </div>
                                        <div className="mt-1 text-2xl font-semibold text-edubot-ink dark:text-white">
                                            {Number(item.queue?.needsReviewCount || 0) +
                                                Number(item.queue?.missingCount || 0) +
                                                Number(item.queue?.needsRevisionCount || 0)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-edubot-muted dark:text-slate-400">
                                        <FiClock className="h-4 w-4 text-edubot-orange" />
                                        <span className="font-medium text-edubot-ink dark:text-white">
                                            {item.sessionTitle || item.session?.title || 'Сессия көрсөтүлгөн эмес'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-edubot-muted dark:text-slate-400">
                                        <span className="inline-flex items-center gap-2">
                                            <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                                            {item.courseTitle || item.course?.title || '-'}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <FiLayers className="h-4 w-4 text-edubot-orange" />
                                            {item.groupName || item.group?.name || '-'}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                            {formatDisplayDate(item.deadline)}
                                        </span>
                                    </div>
                                    {item.description ? (
                                        <p className="line-clamp-2 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                            {item.description}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-full border border-edubot-line/70 bg-white/70 px-3 py-1.5 text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                        Текшерүү керек:{' '}
                                        <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.needsReviewCount || 0}</span>
                                    </span>
                                    <span className="rounded-full border border-edubot-line/70 bg-white/70 px-3 py-1.5 text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                        Жөнөткөн жок:{' '}
                                        <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.missingCount || 0}</span>
                                    </span>
                                    <span className="rounded-full border border-edubot-line/70 bg-white/70 px-3 py-1.5 text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                        Оңдотуу керек:{' '}
                                        <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.needsRevisionCount || 0}</span>
                                    </span>
                                    {(item.queue?.lateCount || 0) > 0 && (
                                        <span className="rounded-full border border-edubot-line/70 bg-white/70 px-3 py-1.5 text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                            Кеч тапшырган:{' '}
                                            <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.lateCount || 0}</span>
                                        </span>
                                    )}
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        to={buildSessionHomeworkPath(item)}
                                        className="dashboard-button-secondary"
                                    >
                                        Сессияда ачуу
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </DashboardInsetPanel>
            )}
        </div>
    );
};

export default InstructorHomework;

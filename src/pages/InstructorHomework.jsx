import { useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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
import {
    isCourseFeatureEnabled,
    TENANT_FEATURES,
} from '@shared/utils/tenantFeatures';
import { getDashboardPath } from '@shared/utils/navigation';
import { parseApiError } from '@shared/api/error';

const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const HOMEWORK_QUEUE_FILTERS = [
    'all',
    'needsReview',
    'missing',
    'needsRevision',
    'late',
    'draft',
    'active',
    'dueSoon',
    'overdue',
    'checked',
    'noDeadline',
];

const getHomeworkErrorMessage = (error, fallback, t) => {
    const status = error?.response?.status;
    if (status === 401) return t('instructorHomework.errors.unauthorized');
    if (status === 403) return t('instructorHomework.errors.forbidden');
    return parseApiError(error, fallback).message;
};

const formatDisplayDate = (value, fallback, language) => {
    if (!value) return fallback;
    const normalized =
        typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString(language || undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getHomeworkStateMeta = (item, t) => {
    const queue = item?.queue || {};
    if (!item?.isPublished) {
        return {
            key: 'draft',
            label: t('instructorHomework.states.draft'),
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }
    if (Number(queue.needsReviewCount || 0) > 0) {
        return {
            key: 'needsReview',
            label: t('instructorHomework.states.needsReview'),
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (Number(queue.missingCount || 0) > 0) {
        return {
            key: 'missing',
            label: t('instructorHomework.states.missing'),
            tone: 'red',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        return {
            key: 'needsRevision',
            label: t('instructorHomework.states.needsRevision'),
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }

    const status = String(item?.status || '').toLowerCase();
    const rawDeadline = item?.deadline || item?.dueAt || item?.dueDate;

    if (['completed', 'approved', 'reviewed', 'checked'].includes(status)) {
        return {
            key: 'checked',
            label: t('instructorHomework.states.checked'),
            tone: 'green',
            badgeClass:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }

    if (!rawDeadline) {
        return {
            key: 'noDeadline',
            label: t('instructorHomework.states.noDeadline'),
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
            key: 'unknown',
            label: t('instructorHomework.states.unknown'),
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }

    const nowMs = Date.now();
    if (deadlineMs < nowMs) {
        return {
            key: 'overdue',
            label: t('instructorHomework.states.overdue'),
            tone: 'red',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }

    const daysLeft = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
        return {
            key: 'dueSoon',
            label: t('instructorHomework.states.dueSoon'),
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }

    return {
        key: 'active',
        label: t('instructorHomework.states.active'),
        tone: 'blue',
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    };
};

const getHomeworkQueueBadges = (item, t) => {
    const queue = item?.queue || {};
    const badges = [];

    if (!item?.isPublished) {
        badges.push({
            key: 'draft',
            label: t('instructorHomework.states.draft'),
            className:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        });
        return badges;
    }

    if (Number(queue.needsReviewCount || 0) > 0) {
        badges.push({
            key: 'needs_review',
            label: t('instructorHomework.states.needsReview'),
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        });
    }
    if (Number(queue.missingCount || 0) > 0) {
        badges.push({
            key: 'missing',
            label: t('instructorHomework.states.missing'),
            className:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        });
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        badges.push({
            key: 'needs_revision',
            label: t('instructorHomework.states.needsRevision'),
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        });
    }
    if (Number(queue.lateCount || 0) > 0) {
        badges.push({
            key: 'late',
            label: t('instructorHomework.states.late'),
            className:
                'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
        });
    }

    if (!badges.length) {
        badges.push({
            key: 'state',
            label: getHomeworkStateMeta(item, t).label,
            className: getHomeworkStateMeta(item, t).badgeClass,
        });
    }

    return badges;
};

const buildSessionHomeworkPath = (item) => {
    const courseId = item?.courseId || item?.session?.group?.course?.id;
    const groupId = item?.groupId || item?.session?.group?.id;
    const sessionId = item?.sessionId || item?.session?.id;
    const homeworkId = item?.id;
    return getDashboardPath('instructor', 'sessions', {
        workspaceTab: 'homework',
        courseId,
        groupId,
        sessionId,
        homeworkId,
    });
};

const buildHomeworkDetailPath = (item) => {
    const sessionId = item?.sessionId || item?.session?.id;
    const homeworkId = item?.id;
    if (!sessionId || !homeworkId) return null;
    return `/instructor/sessions/${sessionId}/homework/${homeworkId}`;
};

const getQueuePriority = (item) => {
    const queue = item?.queue || {};
    if (Number(queue.needsReviewCount || 0) > 0) return 0;
    if (Number(queue.missingCount || 0) > 0) return 1;
    if (Number(queue.needsRevisionCount || 0) > 0) return 2;
    if (Number(queue.lateCount || 0) > 0) return 3;
    return 4;
};

const getQueueAction = (item, t) => {
    const queue = item?.queue || {};
    if (Number(queue.needsReviewCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.needsReview.label'),
            description: t('instructorHomework.queueActions.needsReview.description', { count: queue.needsReviewCount }),
            tone: 'amber',
        };
    }
    if (Number(queue.missingCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.missing.label'),
            description: t('instructorHomework.queueActions.missing.description', { count: queue.missingCount }),
            tone: 'red',
        };
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.needsRevision.label'),
            description: t('instructorHomework.queueActions.needsRevision.description', { count: queue.needsRevisionCount }),
            tone: 'amber',
        };
    }
    if (Number(queue.lateCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.late.label'),
            description: t('instructorHomework.queueActions.late.description', { count: queue.lateCount }),
            tone: 'amber',
        };
    }
    return {
        label: t('instructorHomework.queueActions.default.label'),
        description: t('instructorHomework.queueActions.default.description'),
        tone: 'default',
    };
};

const matchesHomeworkQueueFilter = (item, filter) => {
    if (filter === 'all') return true;
    const queue = item?.queue || {};
    if (filter === 'needsReview') return Number(queue.needsReviewCount || 0) > 0;
    if (filter === 'missing') return Number(queue.missingCount || 0) > 0;
    if (filter === 'needsRevision') return Number(queue.needsRevisionCount || 0) > 0;
    if (filter === 'late') return Number(queue.lateCount || 0) > 0;
    return item.stateMeta.key === filter;
};

const InstructorHomework = () => {
    const { t, i18n } = useTranslation();
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
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        const loadCourses = async () => {
            const response = await fetchInstructorCourses({ status: 'all' });
            setCourses(
                toArray(response?.courses || response).filter((course) =>
                    isCourseFeatureEnabled(course, TENANT_FEATURES.HOMEWORK)
                )
            );
        };
        loadCourses().catch((error) => {
            const message = getHomeworkErrorMessage(error, t('instructorHomework.errors.coursesLoad'), t);
            setCourses([]);
            setLoadError(message);
            toast.error(message);
        });
    }, [t, user]);

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
            const message = getHomeworkErrorMessage(error, t('instructorHomework.errors.groupsLoad'), t);
            setGroups([]);
            setLoadError(message);
            toast.error(message);
        });
    }, [courseId, t]);

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
                setLoadError('');
            } finally {
                setLoading(false);
            }
        };
        load().catch((error) => {
            const message = getHomeworkErrorMessage(error, t('instructorHomework.errors.homeworkLoad'), t);
            setSummary(null);
            setItems([]);
            setLoadError(message);
            toast.error(message);
        });
    }, [courseId, groupId, limit, t]);

    const courseById = useMemo(
        () => new Map(courses.map((course) => [String(course.id), course])),
        [courses]
    );

    const enrichedItems = useMemo(
        () =>
            items
                .filter((item) => {
                    const homeworkCourse =
                        item.course ||
                        courseById.get(String(item.courseId || item.session?.group?.course?.id || ''));
                    return isCourseFeatureEnabled(homeworkCourse, TENANT_FEATURES.HOMEWORK);
                })
                .map((item) => ({
                    ...item,
                    stateMeta: getHomeworkStateMeta(item, t),
                })),
        [courseById, items, t]
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
            overdue: summary?.overdue ?? enrichedItems.filter((item) => item.stateMeta.key === 'overdue').length,
        }),
        [summary, items.length, enrichedItems]
    );

    const nextActionItems = useMemo(
        () => filteredItems.filter((item) => getQueuePriority(item) < 4).slice(0, 3),
        [filteredItems]
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
                            {t('instructorHomework.hero.eyebrow')}
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-edubot-ink dark:text-white md:text-5xl">
                            {t('instructorHomework.hero.title')}
                        </h1>
                        <p className="max-w-3xl text-base leading-8 text-edubot-muted dark:text-slate-300 md:text-lg">
                            {t('instructorHomework.hero.description')}
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className="text-left"
                        >
                            <DashboardMetricCard label={t('instructorHomework.metrics.total')} value={stats.total} icon={FiBookOpen} />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQueueFilter('needsReview')}
                            className={`text-left ${metricCardClass(statusFilter === 'needsReview')}`}
                        >
                            <DashboardMetricCard
                                label={t('instructorHomework.metrics.actionRequired')}
                                value={stats.actionRequired}
                                icon={FiClock}
                                tone="amber"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQueueFilter('missing')}
                            className={`text-left ${metricCardClass(statusFilter === 'missing')}`}
                        >
                            <DashboardMetricCard
                                label={t('instructorHomework.metrics.missing')}
                                value={stats.missing}
                                icon={FiAlertCircle}
                                tone="red"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQueueFilter('needsRevision')}
                            className={`text-left ${metricCardClass(statusFilter === 'needsRevision')}`}
                        >
                            <DashboardMetricCard
                                label={t('instructorHomework.metrics.needsRevision')}
                                value={stats.needsRevision}
                                icon={FiCheckCircle}
                                tone="amber"
                            />
                        </button>
                    </div>
                </div>
            </div>

            <DashboardInsetPanel
                title={t('instructorHomework.filters.title')}
                description={t('instructorHomework.filters.description')}
            >
                {loadError ? (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                        <div className="font-semibold">{t('instructorHomework.errors.queueLoadTitle')}</div>
                        <p className="mt-1">{loadError}</p>
                    </div>
                ) : null}

                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-edubot-muted dark:text-slate-400">
                    <span className="rounded-full border border-edubot-line bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                        {t('instructorHomework.filters.status')}: <span className="font-semibold text-edubot-ink dark:text-white">{t(`instructorHomework.filterOptions.${statusFilter}`)}</span>
                    </span>
                    <span className="rounded-full border border-edubot-line bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                        {t('instructorHomework.filters.results')}: <span className="font-semibold text-edubot-ink dark:text-white">{filteredItems.length}</span>
                    </span>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr),minmax(0,0.9fr),minmax(0,0.8fr),minmax(0,0.7fr)]">
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="dashboard-field dashboard-select"
                    >
                        <option value="">{t('instructorHomework.filters.allCourses')}</option>
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
                        <option value="">{t('instructorHomework.filters.allGroups')}</option>
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
                            placeholder={t('instructorHomework.filters.searchPlaceholder')}
                            className="dashboard-field dashboard-field-icon pl-10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="dashboard-field dashboard-select"
                    >
                        {HOMEWORK_QUEUE_FILTERS.map((filter) => (
                            <option key={filter} value={filter}>
                                {t(`instructorHomework.filterOptions.${filter}`)}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        max="200"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value || 20))}
                        className="dashboard-field"
                        placeholder={t('instructorHomework.filters.limitPlaceholder')}
                    />
                </div>
            </DashboardInsetPanel>

            {loading ? <Loader fullScreen={false} /> : null}

            {!loading && nextActionItems.length > 0 ? (
                <DashboardInsetPanel
                    title={t('instructorHomework.nextActions.title')}
                    description={t('instructorHomework.nextActions.description')}
                    action={
                        <span className="rounded-full border border-edubot-orange/30 bg-edubot-orange/10 px-3 py-1 text-xs font-semibold text-edubot-orange">
                            {t('instructorHomework.nextActions.priorityCount', { count: nextActionItems.length })}
                        </span>
                    }
                >
                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                        {nextActionItems.map((item) => {
                            const action = getQueueAction(item, t);
                            const detailPath = buildHomeworkDetailPath(item);
                            return (
                                <Link
                                    key={item.id || `${item.title}-${item.deadline || ''}-next`}
                                    to={detailPath || buildSessionHomeworkPath(item)}
                                    className="rounded-2xl border border-edubot-line bg-white p-4 transition hover:border-edubot-orange hover:shadow-edubot-soft dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-orange">
                                        {action.label}
                                    </div>
                                    <div className="mt-2 font-semibold text-edubot-ink dark:text-white">
                                        {item.title || item.name || t('instructorHomework.fallbacks.homework')}
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                        {action.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </DashboardInsetPanel>
            ) : null}

            {!loading && filteredItems.length === 0 ? (
                <DashboardInsetPanel
                    title={t('instructorHomework.tasks.title')}
                    description={t('instructorHomework.tasks.description')}
                >
                    <EmptyState
                        title={t('instructorHomework.empty.title')}
                        subtitle={t('instructorHomework.empty.subtitle')}
                        icon={<FiLayers className="h-8 w-8 text-edubot-orange" />}
                        className="py-8"
                    />
                </DashboardInsetPanel>
            ) : (
                <DashboardInsetPanel
                    title={t('instructorHomework.queue.title')}
                    description={t('instructorHomework.queue.description')}
                    action={
                        <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {t('instructorHomework.queue.recordCount', { count: filteredItems.length })}
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
                                            {item.title || item.name || t('instructorHomework.fallbacks.homework')}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {getHomeworkQueueBadges(item, t).map((badge) => (
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
                                            {t('instructorHomework.card.actionRequired')}
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
                                            {item.sessionTitle || item.session?.title || t('instructorHomework.fallbacks.noSession')}
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
                                            {formatDisplayDate(
                                                item.deadline,
                                                t('instructorHomework.fallbacks.noDeadline'),
                                                i18n.language
                                            )}
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
                                        {t('instructorHomework.card.needsReview')}:{' '}
                                        <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.needsReviewCount || 0}</span>
                                    </span>
                                    <span className="rounded-full border border-edubot-line/70 bg-white/70 px-3 py-1.5 text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                        {t('instructorHomework.card.missing')}:{' '}
                                        <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.missingCount || 0}</span>
                                    </span>
                                    <span className="rounded-full border border-edubot-line/70 bg-white/70 px-3 py-1.5 text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                        {t('instructorHomework.card.needsRevision')}:{' '}
                                        <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.needsRevisionCount || 0}</span>
                                    </span>
                                    {(item.queue?.lateCount || 0) > 0 && (
                                        <span className="rounded-full border border-edubot-line/70 bg-white/70 px-3 py-1.5 text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                            {t('instructorHomework.card.late')}:{' '}
                                            <span className="font-semibold text-edubot-ink dark:text-white">{item.queue?.lateCount || 0}</span>
                                        </span>
                                    )}
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {buildHomeworkDetailPath(item) && (
                                        <Link
                                            to={buildHomeworkDetailPath(item)}
                                            className="dashboard-button-primary"
                                        >
                                            {t('instructorHomework.actions.viewDetail')}
                                        </Link>
                                    )}
                                    <Link
                                        to={buildSessionHomeworkPath(item)}
                                        className="dashboard-button-secondary"
                                    >
                                        {t('instructorHomework.actions.openSession')}
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

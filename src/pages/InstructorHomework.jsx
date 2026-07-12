import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiLayers, FiSearch } from 'react-icons/fi';
import {
    buildHomeworkDetailPath,
    buildSessionHomeworkPath,
    formatDisplayDate,
    getHomeworkQueueBadges,
    getQueueAction,
    HOMEWORK_QUEUE_FILTERS,
    useInstructorHomeworkPageModel,
} from '@features/homework/useInstructorHomeworkPageModel';
import Loader from '@shared/ui/Loader';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    EmptyState,
} from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';

const InstructorHomework = () => {
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    const {
        applyQueueFilter,
        courseId,
        courses,
        filteredItems,
        groupId,
        groups,
        limit,
        loadError,
        loading,
        nextActionItems,
        query,
        setCourseId,
        setGroupId,
        setLimit,
        setQuery,
        setStatusFilter,
        stats,
        statusFilter,
    } = useInstructorHomeworkPageModel({ user, t });

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

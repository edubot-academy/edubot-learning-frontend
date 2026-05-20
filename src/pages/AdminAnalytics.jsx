import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAdminOverviewAnalytics } from '@services/api';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FiAlertCircle, FiBarChart2, FiBookOpen, FiCheckCircle, FiRefreshCw, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { AnalyticsDataTable, AnalyticsLineChart } from '@components/analytics';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardWorkspaceHero,
} from '@components/ui/dashboard';
import MobileQuickActions from '@components/analytics/MobileQuickActions';
import { parseApiError } from '../shared/api/error';

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const AdminAnalyticsPage = () => {
    const { t } = useTranslation();
    const tRef = useRef(t);
    const [filters, setFilters] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);

    useEffect(() => {
        tRef.current = t;
    }, [t]);

    const requestFilters = useMemo(
        () => ({
            from: filters.from || undefined,
            to: filters.to || undefined,
        }),
        [filters.from, filters.to]
    );

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const overviewRes = await fetchAdminOverviewAnalytics(requestFilters);
            setOverview(overviewRes || null);
        } catch (error) {
            console.error(error);
            toast.error(parseApiError(error, tRef.current('adminAnalytics.toasts.loadError')).message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters]);

    useEffect(() => {
        loadAnalytics();
    }, [requestFilters.from, requestFilters.to, loadAnalytics]);

    return (
        <div className="min-h-screen bg-transparent px-4 pb-12 pt-24">
            <MobileQuickActions
                onRefresh={loadAnalytics}
                onFilter={() => {
                    document.getElementById('admin-analytics-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                currentPage="admin-analytics"
                loading={loading}
            />

            <div className="mx-auto max-w-6xl space-y-6 px-4 lg:px-6">
                <DashboardWorkspaceHero
                    eyebrow={t('adminAnalytics.hero.eyebrow')}
                    title={t('adminAnalytics.hero.title')}
                    description={t('adminAnalytics.hero.description')}
                    action={(
                        <button
                            type="button"
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="dashboard-button-primary disabled:opacity-60"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            {loading ? t('adminAnalytics.actions.loading') : t('adminAnalytics.actions.refresh')}
                        </button>
                    )}
                    metrics={(
                        <>
                            <DashboardMetricCard
                                label={t('adminAnalytics.metrics.totalUsers')}
                                value={metricNumber(overview?.summary?.totalUsers)}
                                icon={FiUsers}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label={t('adminAnalytics.metrics.students')}
                                value={metricNumber(overview?.summary?.totalStudents)}
                                icon={FiUsers}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label={t('adminAnalytics.metrics.courses')}
                                value={metricNumber(overview?.summary?.totalCourses)}
                                icon={FiBookOpen}
                                tone="amber"
                            />
                            <DashboardMetricCard
                                label={t('adminAnalytics.metrics.enrollments')}
                                value={metricNumber(overview?.summary?.totalEnrollments)}
                                icon={FiCheckCircle}
                                tone="red"
                            />
                        </>
                    )}
                >
                    <div id="admin-analytics-filters">
                        <DashboardFilterBar gridClassName="xl:grid-cols-[1fr_1fr_280px]">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">{t('adminAnalytics.filters.from')}</label>
                                <input
                                    type="date"
                                    value={filters.from || ''}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                                    className="dashboard-field w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">{t('adminAnalytics.filters.to')}</label>
                                <input
                                    type="date"
                                    value={filters.to || ''}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                                    className="dashboard-field w-full"
                                />
                            </div>
                            <div className="flex items-end">
                                <div className="w-full rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/75">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-edubot-orange/10 text-edubot-orange dark:bg-edubot-soft/10 dark:text-edubot-soft">
                                            <FiBarChart2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                {t('adminAnalytics.filters.status')}
                                            </p>
                                            <p className="mt-1 text-sm text-edubot-ink dark:text-white">
                                                {filters.from || filters.to
                                                    ? t('adminAnalytics.filters.rangeSelected')
                                                    : t('adminAnalytics.filters.allTime')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DashboardFilterBar>
                    </div>
                </DashboardWorkspaceHero>

                <DashboardInsetPanel
                    title={t('adminAnalytics.courseAnalytics.title')}
                    description={t('adminAnalytics.courseAnalytics.description')}
                >
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                        <DashboardMetricCard
                            label={t('adminAnalytics.courseAnalytics.metrics.topCourses')}
                            value={overview?.charts?.topCourses?.length || 0}
                            icon={FiTrendingUp}
                            tone="green"
                        />
                        <DashboardMetricCard
                            label={t('adminAnalytics.courseAnalytics.metrics.riskCourses')}
                            value={overview?.charts?.lowPerformingCourses?.length || 0}
                            icon={FiAlertCircle}
                            tone="amber"
                        />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <AnalyticsDataTable
                            title={t('adminAnalytics.courseAnalytics.topCourses.title')}
                            subtitle={t('adminAnalytics.courseAnalytics.topCourses.subtitle')}
                            columns={[
                                t('adminAnalytics.columns.course'),
                                t('adminAnalytics.columns.enrollments'),
                            ]}
                            data={overview?.charts?.topCourses?.map((item) => [
                                item.title || t('adminAnalytics.fallbacks.courseWithId', { id: item.courseId }),
                                metricNumber(item.enrollments),
                            ]) || []}
                            searchable
                            pagination
                            pageSize={5}
                        />
                        <AnalyticsDataTable
                            title={t('adminAnalytics.courseAnalytics.lowPerforming.title')}
                            subtitle={t('adminAnalytics.courseAnalytics.lowPerforming.subtitle')}
                            columns={[
                                t('adminAnalytics.columns.course'),
                                t('adminAnalytics.columns.completionRate'),
                                t('adminAnalytics.columns.averageProgress'),
                            ]}
                            data={overview?.charts?.lowPerformingCourses?.map((item) => [
                                item.title || t('adminAnalytics.fallbacks.courseWithId', { id: item.courseId }),
                                `${metricNumber(item.completionRate)}%`,
                                `${metricNumber(item.avgProgress)}%`,
                            ]) || []}
                            searchable
                            pagination
                            pageSize={5}
                        />
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title={t('adminAnalytics.trends.title')}
                    description={t('adminAnalytics.trends.description')}
                >
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                        <DashboardMetricCard
                            label={t('adminAnalytics.trends.metrics.enrollmentPoints')}
                            value={overview?.charts?.enrollmentsTrend?.length || 0}
                            icon={FiUsers}
                            tone="blue"
                        />
                        <DashboardMetricCard
                            label={t('adminAnalytics.trends.metrics.revenuePoints')}
                            value={overview?.charts?.revenueTrend?.length || 0}
                            icon={FiTrendingUp}
                            tone="green"
                        />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <AnalyticsLineChart
                            title={t('adminAnalytics.trends.enrollments.title')}
                            subtitle={t('adminAnalytics.trends.enrollments.subtitle')}
                            data={overview?.charts?.enrollmentsTrend || []}
                            labelKey="period"
                            dataKey="count"
                            color="edubot"
                            fillArea
                            height="320px"
                            showGrid
                            showLegend={false}
                        />

                        <AnalyticsLineChart
                            title={t('adminAnalytics.trends.revenue.title')}
                            subtitle={t('adminAnalytics.trends.revenue.subtitle')}
                            data={overview?.charts?.revenueTrend || []}
                            labelKey="period"
                            dataKey="amount"
                            color="green"
                            fillArea
                            height="320px"
                            showGrid
                            showLegend={false}
                        />
                    </div>
                </DashboardInsetPanel>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;

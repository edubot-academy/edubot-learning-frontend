import { SmoothTabTransition } from '@components/ui';
import {
    DashboardFilterBar,
    DashboardMetricCard,
    DashboardWorkspaceHero,
} from '@components/ui/dashboard';
import TrendCard from '../stats/TrendCard';
import TopCoursesTable from '../stats/TopCoursesTable';
import { useTranslation } from 'react-i18next';

const AdminStatsTab = ({ stats, loading, onRefresh }) => {
    const { t, i18n } = useTranslation();
    const totals = stats?.totals || {};
    const activity = stats?.activity || {};
    const revenue = stats?.revenue || {};
    const trends = stats?.trends || {};
    const topCourses = Array.isArray(stats?.topCourses) ? stats.topCourses : [];

    const formatNumber = (value) =>
        Number(value ?? 0).toLocaleString(i18n.language, {
            maximumFractionDigits: 0,
        });

    const formatPercent = (value) => `${Math.round(Number(value ?? 0))}%`;

    const formatCurrency = (value) =>
        t('adminStats.currency.kgs', {
            amount: Number(value ?? 0).toLocaleString(i18n.language, {
                maximumFractionDigits: 0,
            }),
        });

    return (
        <SmoothTabTransition isLoading={loading && !stats} isDataLoaded={!!stats}>
            <div className="space-y-6">
                <DashboardWorkspaceHero
                    eyebrow={t('adminStats.hero.eyebrow')}
                    title={t('adminStats.hero.title')}
                    description={t('adminStats.hero.description')}
                    action={(
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={loading}
                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? t('common.loading') : t('adminStats.actions.refresh')}
                        </button>
                    )}
                    metrics={(
                        <>
                            <DashboardMetricCard
                                label={t('adminStats.metrics.students')}
                                value={formatNumber(totals.students)}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label={t('adminStats.metrics.courses')}
                                value={formatNumber(totals.courses)}
                            />
                            <DashboardMetricCard
                                label={t('adminStats.metrics.publishedCourses')}
                                value={formatNumber(totals.publishedCourses)}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label={t('adminStats.metrics.totalEnrollments')}
                                value={formatNumber(totals.enrollments)}
                                tone="amber"
                            />
                            <DashboardMetricCard
                                label={t('adminStats.metrics.activeEnrollments')}
                                value={formatNumber(totals.activeEnrollments)}
                                tone="red"
                            />
                        </>
                    )}
                    metricsClassName="grid grid-cols-2 gap-3 lg:grid-cols-5"
                >
                    <DashboardFilterBar gridClassName="md:grid-cols-3">
                        <DashboardMetricCard
                            label={t('adminStats.metrics.totalRevenue')}
                            value={formatCurrency(revenue.total)}
                            tone="amber"
                        />
                        <DashboardMetricCard
                            label={t('adminStats.metrics.last30Days')}
                            value={formatCurrency(revenue.last30d)}
                            tone="blue"
                        />
                        <DashboardMetricCard
                            label={t('adminStats.metrics.courseCompletion')}
                            value={formatPercent(activity.courseCompletionRate)}
                            tone="green"
                        />
                    </DashboardFilterBar>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                {t('adminStats.metrics.activeStudents')}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                {formatNumber(activity.activeStudents7d || 0)}
                            </p>
                            <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                {t('adminStats.metrics.last7Days')}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                {t('adminStats.metrics.activeStudents')}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                {formatNumber(activity.activeStudents30d || 0)}
                            </p>
                            <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                {t('adminStats.metrics.last30Days')}
                            </p>
                        </div>
                    </div>
                </DashboardWorkspaceHero>

                <DashboardWorkspaceHero
                    eyebrow={t('adminStats.trends.eyebrow')}
                    title={t('adminStats.trends.title')}
                    description={t('adminStats.trends.description')}
                >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <TrendCard
                            title={t('adminStats.trends.dailySignups')}
                            series={trends.dailySignups7d}
                            color="#2563EB"
                            periodLabel={t('adminStats.trends.period7d')}
                        />
                        <TrendCard
                            title={t('adminStats.trends.dailyEnrollments')}
                            series={trends.dailyEnrollments7d}
                            color="#10B981"
                            periodLabel={t('adminStats.trends.period7d')}
                        />
                    </div>
                </DashboardWorkspaceHero>

                <TopCoursesTable
                    courses={topCourses}
                    formatNumber={formatNumber}
                    formatPercent={formatPercent}
                    formatCurrency={formatCurrency}
                    loading={loading}
                    t={t}
                />
            </div>
        </SmoothTabTransition>
    );
};

export default AdminStatsTab;

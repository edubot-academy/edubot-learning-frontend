import React from 'react';
import { SmoothTabTransition } from '@components/ui';
import {
    DashboardFilterBar,
    DashboardMetricCard,
    DashboardWorkspaceHero,
} from '@components/ui/dashboard';
import TrendCard from '../stats/TrendCard';
import TopCoursesTable from '../stats/TopCoursesTable';

const AdminStatsTab = ({ stats, loading, onRefresh }) => {
    const totals = stats?.totals || {};
    const growth = stats?.growth || {};
    const activity = stats?.activity || {};
    const revenue = stats?.revenue || {};
    const trends = stats?.trends || {};
    const topCourses = Array.isArray(stats?.topCourses) ? stats.topCourses : [];

    const formatNumber = (value) =>
        Number(value ?? 0).toLocaleString('ru-RU', {
            maximumFractionDigits: 0,
        });

    const formatPercent = (value) => `${Math.round(Number(value ?? 0))}%`;

    const formatCurrency = (value) =>
        `${Number(value ?? 0).toLocaleString('ru-RU', {
            maximumFractionDigits: 0,
        })} сом`;

    return (
        <SmoothTabTransition isLoading={loading && !stats} isDataLoaded={!!stats}>
            <div className="space-y-6">
                <DashboardWorkspaceHero
                    eyebrow="Акыркы 7 күн"
                    title="Платформанын статистикасы"
                    description="Жалпы көрсөткүчтөр, активдүүлүк, киреше жана өсүү тенденциялары."
                    action={(
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={loading}
                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Жүктөлүүдө...' : 'Жаңыртуу'}
                        </button>
                    )}
                    metrics={(
                        <>
                            <DashboardMetricCard label="Студенттер" value={formatNumber(totals.students)} tone="blue" />
                            <DashboardMetricCard label="Курстар" value={formatNumber(totals.courses)} />
                            <DashboardMetricCard label="Жарыяланган курстар" value={formatNumber(totals.publishedCourses)} tone="green" />
                            <DashboardMetricCard label="Жалпы каттоолор" value={formatNumber(totals.enrollments)} tone="amber" />
                            <DashboardMetricCard label="Активдүү каттоолор" value={formatNumber(totals.activeEnrollments)} tone="red" />
                        </>
                    )}
                    metricsClassName="grid grid-cols-2 gap-3 lg:grid-cols-5"
                >
                    <DashboardFilterBar gridClassName="md:grid-cols-3">
                        <DashboardMetricCard
                            label="Жалпы киреше"
                            value={formatCurrency(revenue.total)}
                            tone="amber"
                        />
                        <DashboardMetricCard
                            label="Акыркы 30 күн"
                            value={formatCurrency(revenue.last30d)}
                            tone="blue"
                        />
                        <DashboardMetricCard
                            label="Курс аяктоо"
                            value={formatPercent(activity.courseCompletionRate)}
                            tone="green"
                        />
                    </DashboardFilterBar>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">Активдүү студенттер</p>
                            <p className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                {formatNumber(activity.activeStudents7d || 0)}
                            </p>
                            <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">Акыркы 7 күн</p>
                        </div>
                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">Активдүү студенттер</p>
                            <p className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">
                                {formatNumber(activity.activeStudents30d || 0)}
                            </p>
                            <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">Акыркы 30 күн</p>
                        </div>
                    </div>
                </DashboardWorkspaceHero>

                <DashboardWorkspaceHero
                    eyebrow="TREND SNAPSHOT"
                    title="Тренддер"
                    description="Кыска мөөнөттүү өсүү жана катышуу өзгөрүүсү."
                >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <TrendCard
                            title="Күнүмдүк каттоо (студент)"
                            series={trends.dailySignups7d}
                            color="#2563EB"
                        />
                        <TrendCard
                            title="Күнүмдүк enrollments"
                            series={trends.dailyEnrollments7d}
                            color="#10B981"
                        />
                    </div>
                </DashboardWorkspaceHero>

                <TopCoursesTable
                    courses={topCourses}
                    formatNumber={formatNumber}
                    formatPercent={formatPercent}
                    formatCurrency={formatCurrency}
                    loading={loading}
                />
            </div>
        </SmoothTabTransition>
    );
};

export default AdminStatsTab;

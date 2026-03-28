import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAdminOverviewAnalytics } from '@services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiBarChart2, FiBookOpen, FiCheckCircle, FiRefreshCw, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { useSwipeNavigation } from '../hooks/useSwipeGestures';
import { AnalyticsDataTable, AnalyticsLineChart } from '@components/analytics';
import {
    DashboardFilterBar,
    DashboardMetricCard,
    DashboardWorkspaceHero,
} from '@components/ui/dashboard';
import MobileQuickActions from '@components/analytics/MobileQuickActions';

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const AdminAnalyticsPage = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);

    const analyticsPages = ['/admin/analytics', '/instructor/analytics', '/student/analytics'];
    const currentPageIndex = analyticsPages.indexOf('/admin/analytics');

    const swipeRef = useSwipeNavigation({
        goBack: () => navigate('/instructor/analytics'),
        goForward: () => navigate('/student/analytics'),
        pages: analyticsPages,
        currentIndex: currentPageIndex,
    });

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
            const message = error?.response?.data?.message || 'Analytics loading error';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters]);

    useEffect(() => {
        loadAnalytics();
    }, [requestFilters.from, requestFilters.to, loadAnalytics]);

    return (
        <div ref={swipeRef} className="min-h-screen bg-transparent px-4 pb-12 pt-24">
            <MobileQuickActions
                onRefresh={loadAnalytics}
                onExport={() => {
                    toast.success('Экспорт функциясы келечеки!');
                }}
                onFilter={() => {
                    toast.success('Фильтр функциясы келечеки!');
                }}
                onShare={() => {
                    toast.success('Бөлүшүү функциясы келечеки!');
                }}
                currentPage="admin-analytics"
                loading={loading}
            />

            <div className="mx-auto max-w-6xl space-y-6 px-4 lg:px-6">
                <DashboardWorkspaceHero
                    eyebrow="Analytics overview"
                    title="Административдик Аналитика"
                    description="Платформанын жалпы көрүнүшү, колдонуучулар метрикалары, курстардын жетишкендиги жана киреше боюнча маалымат."
                    action={(
                        <button
                            type="button"
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="dashboard-button-primary disabled:opacity-60"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            {loading ? 'Жүктөлүүдө...' : 'Жаңылоо'}
                        </button>
                    )}
                    metrics={(
                        <>
                            <DashboardMetricCard
                                label="Бардык колдонуучулар"
                                value={metricNumber(overview?.summary?.totalUsers)}
                                icon={FiUsers}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label="Окуучулар"
                                value={metricNumber(overview?.summary?.totalStudents)}
                                icon={FiUsers}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label="Курстар"
                                value={metricNumber(overview?.summary?.totalCourses)}
                                icon={FiBookOpen}
                                tone="amber"
                            />
                            <DashboardMetricCard
                                label="Катышуулар"
                                value={metricNumber(overview?.summary?.totalEnrollments)}
                                icon={FiCheckCircle}
                                tone="red"
                            />
                        </>
                    )}
                >
                    <DashboardFilterBar gridClassName="xl:grid-cols-[1fr_1fr_280px]">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">Күндөн</label>
                            <input
                                type="date"
                                value={filters.from || ''}
                                onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                                className="dashboard-field w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">Күнгө чейин</label>
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
                                            Фильтр абалы
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-ink dark:text-white">
                                            {filters.from || filters.to ? 'Күн аралыгы тандалды' : 'Бардык убакыт'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardFilterBar>
                </DashboardWorkspaceHero>

                <DashboardWorkspaceHero
                    eyebrow="COURSE PERFORMANCE"
                    title="Курс аналитикасы"
                    description="Эң күчтүү курстарды жана көңүл бурууну талап кылган курстарды салыштырыңыз."
                    metrics={(
                        <>
                            <DashboardMetricCard
                                label="Эң мыкты курс"
                                value={overview?.charts?.topCourses?.length || 0}
                                icon={FiTrendingUp}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label="Тобокел курстар"
                                value={overview?.charts?.lowPerformingCourses?.length || 0}
                                icon={FiAlertCircle}
                                tone="amber"
                            />
                        </>
                    )}
                    metricsClassName="grid grid-cols-2 gap-3"
                >
                    <div className="grid gap-6 lg:grid-cols-2">
                        <AnalyticsDataTable
                            title="Эң мыкты курстар"
                            subtitle="Окуучулар көп катышкан курстар"
                            columns={['Курс', 'Катышуулар']}
                            data={overview?.charts?.topCourses?.map((item) => [
                                item.title || `Курс #${item.courseId}`,
                                metricNumber(item.enrollments),
                            ]) || []}
                            searchable
                            pagination
                            pageSize={5}
                        />
                        <AnalyticsDataTable
                            title="Көңүл бурууну талап кылган курстар"
                            subtitle="Аяктоо жана орточо прогресс төмөн курстар"
                            columns={['Курс', 'Аяктоо деңгээли', 'Орточо прогресс']}
                            data={overview?.charts?.lowPerformingCourses?.map((item) => [
                                item.title || `Курс #${item.courseId}`,
                                `${metricNumber(item.completionRate)}%`,
                                `${metricNumber(item.avgProgress)}%`,
                            ]) || []}
                            searchable
                            pagination
                            pageSize={5}
                        />
                    </div>
                </DashboardWorkspaceHero>

                <DashboardWorkspaceHero
                    eyebrow="TREND REPORT"
                    title="Тренд отчету"
                    description="Катышуу жана киреше динамикасын убакыт боюнча караңыз."
                    metrics={(
                        <>
                            <DashboardMetricCard
                                label="Катышуу чекити"
                                value={overview?.charts?.enrollmentsTrend?.length || 0}
                                icon={FiUsers}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label="Киреше чекити"
                                value={overview?.charts?.revenueTrend?.length || 0}
                                icon={FiTrendingUp}
                                tone="green"
                            />
                        </>
                    )}
                    metricsClassName="grid grid-cols-2 gap-3"
                >
                    <div className="grid gap-6 lg:grid-cols-2">
                        <AnalyticsLineChart
                            title="Катышуу тренддери"
                            subtitle="Убакыттын ичиндеги окуучулардын катышуусу"
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
                            title="Киреше тренддери"
                            subtitle="Убакыттын ичиндеги платформанын кирешеси"
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
                </DashboardWorkspaceHero>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;

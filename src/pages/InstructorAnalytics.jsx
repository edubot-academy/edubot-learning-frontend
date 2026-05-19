import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    fetchInstructorOverviewAnalytics,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { isPlatformAdmin } from '@shared/utils/roles';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import {
    AnalyticsSection,
    AnalyticsDataTable,
    AnalyticsLineChart,
    AnalyticsDoughnutChart,
} from '@components/analytics';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '@components/ui/dashboard';
import { FiActivity, FiAlertCircle, FiBookOpen, FiCheckCircle, FiTarget, FiTrendingUp, FiUsers } from 'react-icons/fi';

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const formatAnalyticsDate = (value, language, fallback) => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString(language || undefined);
};

const InstructorAnalyticsPage = ({ embedded = false }) => {
    const { user } = useContext(AuthContext);
    const { i18n, t } = useTranslation();
    const [filters, setFilters] = useState({ from: '', to: '', course: '' });
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);

    const requestFilters = useMemo(
        () => ({
            from: filters.from || undefined,
            to: filters.to || undefined,
            instructorId: isPlatformAdmin(user?.role) ? undefined : user?.id,
        }),
        [filters.from, filters.to, user?.role, user?.id] // Only depend on actual values
    );

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const overviewRes = await fetchInstructorOverviewAnalytics(requestFilters);
            setOverview(overviewRes || null);
        } catch (error) {
            console.error(error);
            toast.error(parseApiError(error, t('instructorDashboard.analytics.toasts.loadError')).message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters, t]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const kpis = useMemo(
        () => ({
            totalCourses: metricNumber(overview?.summary?.totalCourses),
            publishedCourses: metricNumber(overview?.summary?.publishedCourses),
            totalStudents: metricNumber(overview?.summary?.totalStudents),
            totalEnrollments: metricNumber(overview?.summary?.totalEnrollments),
            averageCompletionRate: metricNumber(overview?.summary?.averageCompletionRate),
            atRiskStudents: overview?.charts?.atRiskStudents?.length || 0,
        }),
        [overview]
    );

    const teachingInsights = useMemo(() => {
        const insights = [];

        if (kpis.averageCompletionRate < 60) {
            insights.push({
                title: t('instructorDashboard.analytics.insights.completion.title'),
                message: t('instructorDashboard.analytics.insights.completion.message'),
                toneClass: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
                icon: FiTrendingUp,
            });
        }

        if (kpis.atRiskStudents > 5) {
            insights.push({
                title: t('instructorDashboard.analytics.insights.risk.title'),
                message: t('instructorDashboard.analytics.insights.risk.message', {
                    count: kpis.atRiskStudents,
                }),
                toneClass: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
                icon: FiAlertCircle,
            });
        }

        if (kpis.totalStudents < 10) {
            insights.push({
                title: t('instructorDashboard.analytics.insights.audience.title'),
                message: t('instructorDashboard.analytics.insights.audience.message'),
                toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
                icon: FiUsers,
            });
        }

        if (insights.length === 0) {
            insights.push({
                title: t('instructorDashboard.analytics.insights.stable.title'),
                message: t('instructorDashboard.analytics.insights.stable.message'),
                toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
                icon: FiCheckCircle,
            });
        }

        return insights;
    }, [kpis, t]);

    const unknown = t('instructorDashboard.analytics.fallbacks.unknown');
    const never = t('instructorDashboard.analytics.fallbacks.never');
    const getCourseTitle = useCallback(
        (item) =>
            item?.title ||
            item?.courseTitle ||
            t('instructorDashboard.analytics.fallbacks.courseWithId', {
                id: item?.courseId || '',
            }),
        [t]
    );
    const getStudentName = useCallback(
        (item) =>
            item?.studentName ||
            t('instructorDashboard.analytics.fallbacks.studentWithId', {
                id: item?.studentId || '',
            }),
        [t]
    );
    const getLessonTitle = useCallback(
        (item) =>
            item?.title ||
            t('instructorDashboard.analytics.fallbacks.lessonWithId', {
                id: item?.lessonId || '',
            }),
        [t]
    );

    return (
        <div
            className={
                embedded
                    ? 'space-y-6'
                    : 'min-h-screen bg-gray-50 px-4 pb-12 pt-24 dark:bg-[#1A1A1A]'
            }
        >
            <div className={embedded ? 'space-y-6' : 'mx-auto max-w-5xl space-y-6 px-4 lg:px-6'}>
                <DashboardSectionHeader
                    eyebrow={t('instructorDashboard.analytics.eyebrow')}
                    title={t('instructorDashboard.analytics.title')}
                    description={t('instructorDashboard.analytics.description')}
                    action={(
                        <button
                            type="button"
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="dashboard-button-primary"
                        >
                            {loading ? `${t('common.loading')}...` : t('analytics.common.refresh')}
                        </button>
                    )}
                />

                <DashboardInsetPanel
                    title={t('instructorDashboard.analytics.filters.title')}
                    description={t('instructorDashboard.analytics.filters.description')}
                >
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input
                            type="date"
                            value={filters.from || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                            className="dashboard-field"
                            placeholder={t('instructorDashboard.analytics.filters.fromPlaceholder')}
                        />
                        <input
                            type="date"
                            value={filters.to || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                            className="dashboard-field"
                            placeholder={t('instructorDashboard.analytics.filters.toPlaceholder')}
                        />
                    </div>
                </DashboardInsetPanel>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardMetricCard
                        label={t('instructorDashboard.analytics.metrics.totalCourses')}
                        value={kpis.totalCourses}
                        icon={FiBookOpen}
                    />
                    <DashboardMetricCard
                        label={t('instructorDashboard.analytics.metrics.students')}
                        value={kpis.totalStudents}
                        icon={FiUsers}
                        tone="green"
                    />
                    <DashboardMetricCard
                        label={t('instructorDashboard.analytics.metrics.averageCompletion')}
                        value={`${kpis.averageCompletionRate}%`}
                        icon={FiActivity}
                        tone="blue"
                    />
                    <DashboardMetricCard
                        label={t('instructorDashboard.analytics.metrics.atRiskStudents')}
                        value={kpis.atRiskStudents}
                        icon={FiTarget}
                        tone="amber"
                    />
                </div>

                <AnalyticsDataTable
                    title={t('instructorDashboard.analytics.coursePerformance.title')}
                    subtitle={t('instructorDashboard.analytics.coursePerformance.subtitle')}
                    columns={[
                        t('instructorDashboard.analytics.columns.course'),
                        t('instructorDashboard.analytics.columns.enrollments'),
                        t('instructorDashboard.analytics.columns.averageProgress'),
                        t('instructorDashboard.analytics.columns.completionRate'),
                    ]}
                    data={overview?.charts?.coursePerformance?.map((item) => [
                        getCourseTitle(item),
                        metricNumber(item.enrollments),
                        `${metricNumber(item.averageProgress)}%`,
                        `${metricNumber(item.completionRate)}%`,
                    ]) || []}
                    searchable
                    pagination
                    pageSize={10}
                />

                {/* At-Risk Students and Weak Lessons */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsDataTable
                        title={t('instructorDashboard.analytics.atRisk.title')}
                        subtitle={t('instructorDashboard.analytics.atRisk.subtitle')}
                        columns={[
                            t('instructorDashboard.analytics.columns.student'),
                            t('instructorDashboard.analytics.columns.course'),
                            t('instructorDashboard.analytics.columns.riskReason'),
                            t('instructorDashboard.analytics.columns.lastActivity'),
                        ]}
                        data={overview?.charts?.atRiskStudents?.map((item, index) => [
                            getStudentName(item),
                            getCourseTitle(item),
                            <span key={`risk-${item.studentId || item.courseId || index}`} className={`px-2 py-1 text-xs rounded-full ${item.riskReason?.includes('progress') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                item.riskReason?.includes('activity') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                }`}>
                                {item.riskReason || unknown}
                            </span>,
                            formatAnalyticsDate(item.lastActivity, i18n.language, never),
                        ]) || []}
                    />
                    <AnalyticsDataTable
                        title={t('instructorDashboard.analytics.weakLessons.title')}
                        subtitle={t('instructorDashboard.analytics.weakLessons.subtitle')}
                        columns={[
                            t('instructorDashboard.analytics.columns.lesson'),
                            t('instructorDashboard.analytics.columns.course'),
                            t('instructorDashboard.analytics.columns.completionRate'),
                        ]}
                        data={overview?.charts?.weakLessons?.map((item) => [
                            getLessonTitle(item),
                            getCourseTitle(item),
                            `${metricNumber(item.completionRate)}%`,
                        ]) || []}
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsLineChart
                        title={t('instructorDashboard.analytics.charts.performanceTrendTitle')}
                        subtitle={t('instructorDashboard.analytics.charts.performanceTrendSubtitle')}
                        data={overview?.charts?.performanceTrend || []}
                        labelKey="period"
                        dataKey="score"
                        color="blue"
                        fillArea={true}
                        height="256px"
                        showGrid={true}
                        showLegend={false}
                    />

                    <AnalyticsDoughnutChart
                        title={t('instructorDashboard.analytics.charts.courseCompletionTitle')}
                        subtitle={t('instructorDashboard.analytics.charts.courseCompletionSubtitle')}
                        data={overview?.charts?.coursePerformance?.map((item) => ({
                            label: getCourseTitle(item),
                            value: metricNumber(item.completionRate),
                        })) || []}
                        colors={['rgb(34, 197, 94)', 'rgb(251, 146, 60)', 'rgb(59, 130, 246)', 'rgb(168, 85, 247)', 'rgb(20, 184, 166)']}
                        height="256px"
                        showLegend={true}
                        centerText={`${kpis.averageCompletionRate}%`}
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsSection
                        title={t('instructorDashboard.analytics.teachingInsights.title')}
                        subtitle={t('instructorDashboard.analytics.teachingInsights.subtitle')}
                    >
                        <div className="space-y-3">
                            {teachingInsights.map((insight) => {
                                const InsightIcon = insight.icon;

                                return (
                                    <div key={insight.title} className={`rounded-xl border p-3 ${insight.toneClass}`}>
                                        <div className="flex items-start gap-3">
                                            <InsightIcon className="mt-0.5 h-5 w-5 shrink-0" />
                                            <div>
                                                <h4 className="font-medium">{insight.title}</h4>
                                                <p className="mt-1 text-sm opacity-85">{insight.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AnalyticsSection>
                </div>
            </div>
        </div>
    );
};


export default InstructorAnalyticsPage;

InstructorAnalyticsPage.propTypes = {
    embedded: PropTypes.bool,
};

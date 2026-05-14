import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchInstructorOverviewAnalytics,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { isPlatformAdmin } from '@shared/utils/roles';
import { toast } from 'react-hot-toast';
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

const InstructorAnalyticsPage = ({ embedded = false }) => {
    const { user } = useContext(AuthContext);
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
            const message = error?.response?.data?.message || 'Instructor analytics loading error';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters]);

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
                title: 'Аяктоо деңгээлин көтөрүү керек',
                message: 'Аяктоо көрсөткүчү 60%дан төмөн. Узун сабактарды кыска бөлүктөргө бөлүп, ар бир бөлүктөн кийин текшерүү суроосун кошуңуз.',
                toneClass: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
                icon: FiTrendingUp,
            });
        }

        if (kpis.atRiskStudents > 5) {
            insights.push({
                title: 'Эрте кийлигишүү керек',
                message: `${kpis.atRiskStudents} окуучу тобокелдикте. Акыркы активдүүлүгү жок же прогресси төмөн окуучуларга жеке тапшырма же билдирүү жөнөтүңүз.`,
                toneClass: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
                icon: FiAlertCircle,
            });
        }

        if (kpis.totalStudents < 10) {
            insights.push({
                title: 'Аудиторияны кеңейтүү мүмкүнчүлүгү бар',
                message: 'Окуучулар аз болгон курстарда кириш сабакты, курс сүрөттөмөсүн жана биринчи тапшырманы тактап чыгыңыз.',
                toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
                icon: FiUsers,
            });
        }

        if (insights.length === 0) {
            insights.push({
                title: 'Курстар туруктуу темпте жүрүп жатат',
                message: 'Аяктоо деңгээли жана тобокелдик көрсөткүчү нормалдуу. Эми эң начар сабактарды карап, мазмунду майда жакшыртуулар менен жаңыртыңыз.',
                toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
                icon: FiCheckCircle,
            });
        }

        return insights;
    }, [kpis]);

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
                    eyebrow="Analytics workspace"
                    title="Окутуучу аналитикасы"
                    description="Курстарыңыздын аткарылышын, коркунучтуу окуучуларды жана жетишкендик тренддерин ушул жерде караңыз."
                    action={(
                        <button
                            type="button"
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="dashboard-button-primary"
                        >
                            {loading ? 'Жүктөлүүдө...' : 'Жаңылоо'}
                        </button>
                    )}
                />

                <DashboardInsetPanel
                    title="Мезгил фильтри"
                    description="Белгилүү убакыт аралыгын тандасаңыз, аналитика ошол терезе боюнча кайра эсептелет."
                >
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input
                            type="date"
                            value={filters.from || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                            className="dashboard-field"
                            placeholder="Башталган күнү"
                        />
                        <input
                            type="date"
                            value={filters.to || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                            className="dashboard-field"
                            placeholder="Аягындашкан күнү"
                        />
                    </div>
                </DashboardInsetPanel>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardMetricCard
                        label="Бардык курстар"
                        value={kpis.totalCourses}
                        icon={FiBookOpen}
                    />
                    <DashboardMetricCard
                        label="Окуучулар"
                        value={kpis.totalStudents}
                        icon={FiUsers}
                        tone="green"
                    />
                    <DashboardMetricCard
                        label="Орточо аяктоо"
                        value={`${kpis.averageCompletionRate}%`}
                        icon={FiActivity}
                        tone="blue"
                    />
                    <DashboardMetricCard
                        label="Коркунучтуу окуучулар"
                        value={kpis.atRiskStudents}
                        icon={FiTarget}
                        tone="amber"
                    />
                </div>

                {/* Курстардын Жетишкендиги */}
                <AnalyticsDataTable
                    title="Курстардын Жетишкендиги"
                    subtitle="Сиздин курстардын кантип жетишкендиги"
                    columns={['Курс', 'Катышуулар', 'Орточо прогресс', 'Аяктоо деңгэли']}
                    data={overview?.charts?.coursePerformance?.map((item) => [
                        item.title || `Курс #${item.courseId}`,
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
                        title="Коркунучтуу Окуучулар"
                        subtitle="Кошумча жардам керек окуучулар"
                        columns={['Окуучу', 'Курс', 'Коркунуч себеби', 'Акыркы активдүүлүк']}
                        data={overview?.charts?.atRiskStudents?.map((item, index) => [
                            item.studentName || `Окуучу #${item.studentId}`,
                            item.courseTitle || `Курс #${item.courseId}`,
                            <span key={`risk-${item.studentId || item.courseId || index}`} className={`px-2 py-1 text-xs rounded-full ${item.riskReason?.includes('progress') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                item.riskReason?.includes('activity') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                }`}>
                                {item.riskReason || 'Белгисиз'}
                            </span>,
                            item.lastActivity ? new Date(item.lastActivity).toLocaleDateString() : 'Эч качан эмес',
                        ]) || []}
                    />
                    <AnalyticsDataTable
                        title="Начар Сабактар"
                        subtitle="Жакшыртууга муктаж сабактар"
                        columns={['Сабак', 'Курс', 'Аяктоо деңгэли']}
                        data={overview?.charts?.weakLessons?.map((item) => [
                            item.title || `Сабак #${item.lessonId}`,
                            item.courseTitle || `Курс #${item.courseId}`,
                            `${metricNumber(item.completionRate)}%`,
                        ]) || []}
                    />
                </div>

                {/* Отуу Жетишкендиги */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsLineChart
                        title="Окуу натыйжаларынын тренди"
                        subtitle="Тандалган мезгилдеги жалпы аткаруу баллы"
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
                        title="Курстар боюнча аяктоо үлүшү"
                        subtitle="Ар бир курстун аяктоо деңгээлин салыштыруу"
                        data={overview?.charts?.coursePerformance?.map((item) => ({
                            label: item.title || `Курс #${item.courseId}`,
                            value: metricNumber(item.completionRate),
                        })) || []}
                        colors={['rgb(34, 197, 94)', 'rgb(251, 146, 60)', 'rgb(59, 130, 246)', 'rgb(168, 85, 247)', 'rgb(20, 184, 166)']}
                        height="256px"
                        showLegend={true}
                        centerText={`${kpis.averageCompletionRate}%`}
                    />
                </div>

                {/* Teaching Insights */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsSection title="Окутуу боюнча сунуштар" subtitle="Метрикаларга негизделген кийинки аракеттер">
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

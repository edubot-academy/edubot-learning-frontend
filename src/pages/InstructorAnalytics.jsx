import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchInstructorOverviewAnalytics,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSwipeNavigation } from '../hooks/useSwipeGestures';
import {
    AnalyticsSummaryCard,
    AnalyticsSection,
    AnalyticsDataTable,
    DashboardPageHeader,
    ProgressList,
    EmptyAnalyticsState,
    AnalyticsLineChart,
    AnalyticsBarChart,
    AnalyticsDoughnutChart,
} from '@components/analytics';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '@components/ui/dashboard';
import { FiActivity, FiBookOpen, FiTarget, FiUsers } from 'react-icons/fi';

const toList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
};

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const InstructorAnalyticsPage = ({ embedded = false }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({ from: '', to: '', course: '' });
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);

    // Swipe navigation for mobile
    const analyticsPages = ['/instructor/analytics', '/admin/analytics', '/student/analytics'];
    const currentPageIndex = analyticsPages.indexOf('/instructor/analytics');

    const swipeRef = useSwipeNavigation({
        goBack: () => navigate('/admin/analytics'),
        goForward: () => navigate('/student/analytics'),
        pages: analyticsPages,
        currentIndex: currentPageIndex,
    });

    const requestFilters = useMemo(
        () => ({
            from: filters.from || undefined,
            to: filters.to || undefined,
            instructorId: user?.role === 'admin' ? undefined : user?.id,
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
    }, [requestFilters.from, requestFilters.to, requestFilters.instructorId]); // Depend on filter values

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

    return (
        <div
            ref={swipeRef}
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
                        data={overview?.charts?.atRiskStudents?.map((item) => [
                            item.studentName || `Окуучу #${item.studentId}`,
                            item.courseTitle || `Курс #${item.courseId}`,
                            <span className={`px-2 py-1 text-xs rounded-full ${item.riskReason?.includes('progress') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
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
                        title="Отуу Жетишкендиги Тренддери"
                        subtitle="Убакыттын ичиндеги негизги отуу метрикалары"
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
                        title="Курстардын Жетишкендик Бөлүштөрү"
                        subtitle="Сиздин курстардын кантип жетишкендиги"
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
                    <AnalyticsSection title="Отуу Корутулары" subtitle="Жакшыртуу үчүн жеке сунуштар">
                        <div className="space-y-3">
                            {kpis.averageCompletionRate < 60 && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Аяктоо Деңгэлин Жакшыртыңыз</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                Татаал темаларды бөлүп, интерактивдүү элементтерди кошуңуз.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {kpis.atRiskStudents > 5 && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div>
                                            <h4 className="font-medium text-orange-900 dark:text-orange-100">Коркунучтуу Окуучуларга Жардам Берңиз</h4>
                                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                                Кыйынчылыга учураган окуучуларга эрте жардам бериңиз.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {kpis.totalStudents < 10 && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="font-medium text-green-900 dark:text-green-100">Аудиторияны Кеңитңиз</h4>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                Курстарды жайылтып, катышууну көбөйтүңуз.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {kpis.averageCompletionRate >= 60 && kpis.atRiskStudents <= 5 && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="font-medium text-green-900 dark:text-green-100">Отуу Мыкты!</h4>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                Сиздин курстар жакшы натыйжаларды көрсөтүүдө. Улу иште!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
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

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchCourses,
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
import MobileQuickActions from '@components/analytics/MobileQuickActions';

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

const InstructorAnalyticsPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({ from: '', to: '', course: '' });
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
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

    useEffect(() => {
        let cancelled = false;
        const loadCourses = async () => {
            try {
                const res = await fetchCourses({ limit: 300 });
                if (cancelled) return;
                setCourses(toList(res));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error('Failed to load courses.');
            }
        };
        loadCourses();
        return () => {
            cancelled = true;
        };
    }, []);

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
        <div ref={swipeRef} className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] px-4 pb-12">
            {/* Mobile Quick Actions */}
            <MobileQuickActions
                onRefresh={loadAnalytics}
                onExport={() => {
                    // TODO: Implement export functionality
                    toast.success('Экспорт функциясы келечеки!');
                }}
                onFilter={() => {
                    // TODO: Open filter modal
                    toast.success('Фильтр функциясы келечеки!');
                }}
                onShare={() => {
                    // TODO: Implement share functionality
                    toast.success('Бөлүшүү функциясы келечеки!');
                }}
                currentPage="instructor-analytics"
                loading={loading}
            />

            <div className="max-w-5xl mx-auto px-4 lg:px-6 space-y-6">
                <DashboardPageHeader
                    title="Отуучу Аналитикасы"
                    subtitle="Отуу жетишкендиги, окуучулардын катышуусу, курс маалыматтары жана корутулар"
                    action={
                        <button
                            type="button"
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="px-4 py-2 sm:px-3 sm:py-2 rounded-lg bg-edubot-orange text-white font-medium hover:bg-edubot-orange/90 disabled:opacity-60 transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] min-w-[100px]"
                        >
                            {loading ? 'Жүктөлүүдө...' : 'Жаңылоо'}
                        </button>
                    }
                />

                {/* Фильтрлер Бөлүгү */}
                <AnalyticsSection className="bg-white dark:bg-gray-800">
                    <div className="grid sm:grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={filters.from || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-edubot-orange focus:border-edubot-orange"
                            placeholder="Башталган күнү"
                        />
                        <input
                            type="date"
                            value={filters.to || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-edubot-orange focus:border-edubot-orange"
                            placeholder="Аягындашкан күнү"
                        />
                    </div>
                </AnalyticsSection>

                {/* Жалпы Көрсөткүч Карталар */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsSummaryCard
                        title="Бардык Курстар"
                        value={kpis.totalCourses}
                        subtitle={`${kpis.publishedCourses} жарыяланган`}
                        color="edubot"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Окуучулар"
                        value={kpis.totalStudents}
                        subtitle="Бардык курстардагы окуучулар"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Орточо Аяктоо"
                        value={`${kpis.averageCompletionRate}%`}
                        subtitle="Курс аяктоо деңгэли"
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Коркунучтуу Окуучулар"
                        value={kpis.atRiskStudents}
                        subtitle="Жардам керек окуучулар"
                        color="orange"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        }
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

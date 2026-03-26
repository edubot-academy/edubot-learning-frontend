import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchAdminOverviewAnalytics,
    fetchCourses,
} from '@services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSwipeNavigation } from '../hooks/useSwipeGestures';
import {
    AnalyticsSummaryCard,
    AnalyticsSection,
    AnalyticsDataTable,
    DashboardPageHeader,
    AnalyticsLineChart,
    AnalyticsBarChart,
    ProgressList,
    EmptyAnalyticsState,
} from '@components/analytics';
import MobileQuickActions from '@components/analytics/MobileQuickActions';

const toList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
};

const firstDefined = (...values) => values.find((v) => v !== undefined && v !== null);

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const AdminAnalyticsPage = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ from: '', to: '', course: '', group: '' });
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [overview, setOverview] = useState(null);

    // Swipe navigation for mobile
    const analyticsPages = ['/admin/analytics', '/instructor/analytics', '/student/analytics'];
    const currentPageIndex = analyticsPages.indexOf('/admin/analytics');

    const swipeRef = useSwipeNavigation({
        goBack: () => navigate('/instructor/analytics'),
        goForward: () => navigate('/student/analytics'),
        pages: analyticsPages,
        currentIndex: currentPageIndex,
    });

    const loadFilterData = useCallback(async () => {
        try {
            const coursesRes = await fetchCourses({ limit: 300 });
            const coursesList = toList(coursesRes);
            setCourses(coursesList);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load courses filter.');
        }
    }, []);

    useEffect(() => {
        loadFilterData();
    }, [loadFilterData]);

    const requestFilters = useMemo(
        () => ({
            from: filters.from || undefined,
            to: filters.to || undefined,
        }),
        [filters.from, filters.to] // Only depend on the actual values, not the whole object
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
    }, [requestFilters.from, requestFilters.to]); // Depend on filter values, not the function

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
                currentPage="admin-analytics"
                loading={loading}
            />

            <div className="max-w-6xl mx-auto px-4 lg:px-6 space-y-6">
                <DashboardPageHeader
                    title="Административдик Аналитика"
                    subtitle="Платформанын жалпы көрүнүчү, колдонуучулар метрикалары, курстардын жетишкендиги жана киреше боюнча маалымат"
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
                        title="Бардык Колдонуучулар"
                        value={metricNumber(overview?.summary?.totalUsers)}
                        subtitle="Платформадагы жалпы колдонуучулар саны"
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Окуучулар"
                        value={metricNumber(overview?.summary?.totalStudents)}
                        subtitle="Платформанын активдүү окуучулары"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Курстар"
                        value={metricNumber(overview?.summary?.totalCourses)}
                        subtitle="Платформадагы курстар саны"
                        color="edubot"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Катышуулар"
                        value={metricNumber(overview?.summary?.totalEnrollments)}
                        subtitle="Бардык курстарга катышуулардын жалпы саны"
                        color="purple"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Курстардын Жетишкендиги */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsDataTable
                        title="Эң Мыкты Курстар"
                        subtitle="Окучулар көп катышкан курстар"
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
                        title="Начар Жетишкендиги Бар Курстар"
                        subtitle="Көңүл бурууну талап кылган курстар"
                        columns={['Курс', 'Аяктоо деңгэли', 'Орточо прогресс']}
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

                {/* Киреше жана Катышуу Тренддери */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsLineChart
                        title="Катышуу Тренддери"
                        subtitle="Убакыттын ичиндеги окуучулардын катышуусу"
                        data={overview?.charts?.enrollmentsTrend || []}
                        labelKey="period"
                        dataKey="count"
                        color="edubot"
                        fillArea={true}
                        height="320px"
                        showGrid={true}
                        showLegend={false}
                    />

                    <AnalyticsLineChart
                        title="Киреше Тренддери"
                        subtitle="Убакыттын ичиндеги платформанын кирешеси"
                        data={overview?.charts?.revenueTrend || []}
                        labelKey="period"
                        dataKey="amount"
                        color="green"
                        fillArea={true}
                        height="320px"
                        showGrid={true}
                        showLegend={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;

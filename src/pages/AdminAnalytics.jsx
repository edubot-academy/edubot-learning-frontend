import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchAdminOverviewAnalytics,
    fetchCourses,
} from '@services/api';
import { toast } from 'react-hot-toast';
import {
    AnalyticsSummaryCard,
    AnalyticsSection,
    AnalyticsChartCard,
    AnalyticsDataTable,
    DashboardPageHeader,
    ProgressList,
    EmptyAnalyticsState,
} from '@components/analytics';

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
    const [filters, setFilters] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [overview, setOverview] = useState(null);

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
        <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] px-4 pb-12">
            <div className="max-w-7xl mx-auto space-y-6">
                <DashboardPageHeader
                    title="Admin Analytics"
                    subtitle="Platform overview, user metrics, course performance, and insights"
                    action={
                        <button
                            type="button"
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-edubot-orange text-white font-medium hover:bg-edubot-orange/90 disabled:opacity-60 transition-colors"
                        >
                            {loading ? 'Жүктөлүүдө...' : 'Refresh'}
                        </button>
                    }
                />

                {/* Filters Section - Simplified for new API */}
                <AnalyticsSection className="bg-white dark:bg-gray-800">
                    <div className="grid sm:grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-edubot-orange focus:border-edubot-orange"
                            placeholder="From date"
                        />
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-edubot-orange focus:border-edubot-orange"
                            placeholder="To date"
                        />
                    </div>
                </AnalyticsSection>

                {/* Summary Cards - Using new backend structure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsSummaryCard
                        title="Total Users"
                        value={metricNumber(overview?.summary?.totalUsers)}
                        subtitle="Platform-wide user count"
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Total Students"
                        value={metricNumber(overview?.summary?.totalStudents)}
                        subtitle="Active learners"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Total Courses"
                        value={metricNumber(overview?.summary?.totalCourses)}
                        subtitle={`${metricNumber(overview?.summary?.publishedCourses)} published`}
                        color="edubot"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Total Enrollments"
                        value={metricNumber(overview?.summary?.totalEnrollments)}
                        subtitle="Course registrations"
                        color="purple"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Charts and Tables - Using new backend structure */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsDataTable
                        title="Top Courses"
                        subtitle="Best performing courses by enrollments"
                        columns={['Course', 'Enrollments']}
                        data={overview?.charts?.topCourses?.map((item) => [
                            item.title || `Course #${item.courseId}`,
                            metricNumber(item.enrollments),
                        ]) || []}
                        searchable
                        pagination
                        pageSize={5}
                    />
                    <AnalyticsDataTable
                        title="Low Performing Courses"
                        subtitle="Courses that may need attention"
                        columns={['Course', 'Completion Rate', 'Avg Progress']}
                        data={overview?.charts?.lowPerformingCourses?.map((item) => [
                            item.title || `Course #${item.courseId}`,
                            `${metricNumber(item.completionRate)}%`,
                            `${metricNumber(item.avgProgress)}%`,
                        ]) || []}
                        searchable
                        pagination
                        pageSize={5}
                    />
                </div>

                {/* Revenue and Enrollment Trends */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsChartCard
                        title="Enrollment Trends"
                        subtitle="Student enrollment over time"
                        height="h-80"
                    >
                        {overview?.charts?.enrollmentsTrend && overview.charts.enrollmentsTrend.length > 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p>Chart visualization coming soon</p>
                                    <p className="text-sm mt-2">TODO: Add enrollment trend chart</p>
                                    <div className="mt-4 text-xs text-gray-400">
                                        {overview.charts.enrollmentsTrend.slice(0, 3).map((item, idx) => (
                                            <div key={idx}>{item.period}: {item.count} enrollments</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyAnalyticsState title="No enrollment data available" />
                        )}
                    </AnalyticsChartCard>

                    <AnalyticsChartCard
                        title="Revenue Trends"
                        subtitle="Platform revenue over time"
                        height="h-80"
                    >
                        {overview?.charts?.revenueTrend && overview.charts.revenueTrend.length > 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Revenue chart coming soon</p>
                                    <p className="text-sm mt-2">TODO: Add revenue trend chart</p>
                                    <div className="mt-4 text-xs text-gray-400">
                                        {overview.charts.revenueTrend.slice(0, 3).map((item, idx) => (
                                            <div key={idx}>{item.period}: ${item.amount}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyAnalyticsState title="No revenue data available" />
                        )}
                    </AnalyticsChartCard>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;

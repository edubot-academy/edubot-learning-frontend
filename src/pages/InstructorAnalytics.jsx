import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchCourses,
    fetchInstructorOverviewAnalytics,
} from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    AnalyticsSummaryCard,
    AnalyticsSection,
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

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const InstructorAnalyticsPage = () => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [overview, setOverview] = useState(null);

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
        <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] px-4 pb-12">
            <div className="max-w-6xl mx-auto space-y-6">
                <DashboardPageHeader
                    title="Instructor Analytics"
                    subtitle="Teaching performance, student engagement, and course insights"
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
                            value={filters.from || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-edubot-orange focus:border-edubot-orange"
                            placeholder="From date"
                        />
                        <input
                            type="date"
                            value={filters.to || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-edubot-orange focus:border-edubot-orange"
                            placeholder="To date"
                        />
                    </div>
                </AnalyticsSection>

                {/* Summary Cards - Using new backend structure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsSummaryCard
                        title="Total Courses"
                        value={kpis.totalCourses}
                        subtitle={`${kpis.publishedCourses} published`}
                        color="edubot"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Total Students"
                        value={kpis.totalStudents}
                        subtitle="Across all courses"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Avg Completion"
                        value={`${kpis.averageCompletionRate}%`}
                        subtitle="Course completion rate"
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="At Risk Students"
                        value={kpis.atRiskStudents}
                        subtitle="Need intervention"
                        color="orange"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        }
                    />
                </div>

                {/* Course Performance Table */}
                <AnalyticsDataTable
                    title="Course Performance"
                    subtitle="How your courses are performing"
                    columns={['Course', 'Enrollments', 'Avg Progress', 'Completion Rate']}
                    data={overview?.charts?.coursePerformance?.map((item) => [
                        item.title || `Course #${item.courseId}`,
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
                        title="Students at Risk"
                        subtitle="Students who need additional support"
                        columns={['Student', 'Course', 'Risk Reason', 'Last Activity']}
                        data={overview?.charts?.atRiskStudents?.map((item) => [
                            item.studentName || `Student #${item.studentId}`,
                            item.courseTitle || `Course #${item.courseId}`,
                            <span className={`px-2 py-1 text-xs rounded-full ${item.riskReason?.includes('progress') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                item.riskReason?.includes('activity') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                }`}>
                                {item.riskReason || 'Unknown'}
                            </span>,
                            item.lastActivity ? new Date(item.lastActivity).toLocaleDateString() : 'Never',
                        ]) || []}
                    />
                    <AnalyticsDataTable
                        title="Weak Lessons"
                        subtitle="Lessons that may need improvement"
                        columns={['Lesson', 'Course', 'Completion Rate']}
                        data={overview?.charts?.weakLessons?.map((item) => [
                            item.title || `Lesson #${item.lessonId}`,
                            item.courseTitle || `Course #${item.courseId}`,
                            `${metricNumber(item.completionRate)}%`,
                        ]) || []}
                    />
                </div>

                {/* Performance Insights */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsSection title="Performance Trends" subtitle="Key teaching metrics over time">
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p>Performance charts coming soon</p>
                                <p className="text-sm mt-2">TODO: Add trend visualization</p>
                            </div>
                        </div>
                    </AnalyticsSection>

                    <AnalyticsSection title="Teaching Insights" subtitle="Personalized recommendations for improvement">
                        <div className="space-y-3">
                            {kpis.averageCompletionRate < 60 && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Improve Completion Rates</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                Consider breaking down complex topics and adding more interactive elements.
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
                                            <h4 className="font-medium text-orange-900 dark:text-orange-100">Support At-Risk Students</h4>
                                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                                Reach out to struggling students early and offer additional help.
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
                                            <h4 className="font-medium text-green-900 dark:text-green-100">Grow Your Audience</h4>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                Promote your courses to attract more students and increase engagement.
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
                                            <h4 className="font-medium text-green-900 dark:text-green-100">Excellent Teaching!</h4>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                Your courses are performing well. Keep up the great work!
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

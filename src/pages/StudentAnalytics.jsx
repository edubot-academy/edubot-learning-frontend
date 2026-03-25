import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchCourses, fetchStudentOverviewAnalytics } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    AnalyticsSummaryCard,
    AnalyticsSection,
    AnalyticsChartCard,
    DashboardPageHeader,
    ProgressList,
    EmptyAnalyticsState,
} from '@components/analytics';

const toList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const metricNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const StudentAnalyticsPage = ({ embedded = false }) => {
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
            studentId: user?.role === 'student' ? undefined : user?.id,
        }),
        [filters.from, filters.to, user?.role, user?.id] // Only depend on actual values
    );

    const loadOverview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchStudentOverviewAnalytics(requestFilters);
            setOverview(res || null);
        } catch (error) {
            console.error(error);
            const message = error?.response?.data?.message || 'Student analytics loading error';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    }, [requestFilters]);

    useEffect(() => {
        loadOverview();
    }, [requestFilters.from, requestFilters.to, requestFilters.studentId]); // Depend on filter values

    const kpis = useMemo(
        () => ({
            enrolledCourses: metricNumber(overview?.summary?.enrolledCourses),
            completedCourses: metricNumber(overview?.summary?.completedCourses),
            totalLessonsCompleted: metricNumber(overview?.summary?.totalLessonsCompleted),
            averageProgress: metricNumber(overview?.summary?.averageProgress),
        }),
        [overview]
    );

    const continueLearning = overview?.blocks?.continueLearning;
    const recentActivity = overview?.blocks?.recentActivity || [];
    const myCourses = overview?.blocks?.myCourses || [];

    return (
        <div
            className={
                embedded
                    ? 'space-y-6'
                    : 'pt-24 min-h-screen bg-gray-50 dark:bg-[#1A1A1A] px-4 pb-12'
            }
        >
            <div className={embedded ? 'space-y-6' : 'max-w-5xl mx-auto space-y-6'}>
                <DashboardPageHeader
                    title="Student Analytics"
                    subtitle="Track your learning progress, achievements, and study patterns"
                    action={
                        <button
                            type="button"
                            onClick={loadOverview}
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
                        title="Enrolled Courses"
                        value={kpis.enrolledCourses}
                        subtitle="Active courses"
                        color="edubot"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Completed Courses"
                        value={kpis.completedCourses}
                        subtitle="Finished learning"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Lessons Completed"
                        value={kpis.totalLessonsCompleted}
                        subtitle="Total lessons finished"
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Average Progress"
                        value={`${kpis.averageProgress}%`}
                        subtitle="Course completion rate"
                        color="purple"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    />
                </div>

                {/* Continue Learning Section */}
                {continueLearning && (
                    <AnalyticsSection title="Continue Learning" subtitle="Pick up where you left off">
                        <div className="p-4 bg-gradient-to-r from-edubot-orange/10 to-edubot-soft/10 dark:from-edubot-orange/20 dark:to-edubot-soft/20 border border-edubot-orange/30 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {continueLearning.courseTitle}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Last lesson: {continueLearning.lastLessonTitle}
                                    </p>
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                            <span className="font-medium text-edubot-orange">{continueLearning.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="h-2 bg-edubot-orange rounded-full transition-all duration-500"
                                                style={{ width: `${continueLearning.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <button className="ml-4 px-4 py-2 bg-edubot-orange text-white rounded-lg hover:bg-edubot-orange/90 transition-colors">
                                    Continue
                                </button>
                            </div>
                        </div>
                    </AnalyticsSection>
                )}

                {/* Course Progress and Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsSection title="My Courses" subtitle="Your enrolled courses and progress">
                        {myCourses.length > 0 ? (
                            <ProgressList
                                items={myCourses.map((course) => ({
                                    id: course.courseId,
                                    title: course.courseTitle,
                                    percentage: course.progress || 0,
                                    status: course.progress >= 100 ? 'Completed' : 'In Progress',
                                    description: `Enrolled ${new Date(course.enrolledAt).toLocaleDateString()}`,
                                }))}
                            />
                        ) : (
                            <EmptyAnalyticsState
                                title="No courses enrolled"
                                subtitle="Start learning by enrolling in courses"
                                icon={
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                }
                                action={
                                    <button className="px-4 py-2 bg-edubot-orange text-white rounded-lg hover:bg-edubot-orange/90 transition-colors">
                                        Browse Courses
                                    </button>
                                }
                            />
                        )}
                    </AnalyticsSection>

                    <AnalyticsSection title="Recent Activity" subtitle="Your latest learning activities">
                        {recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.slice(0, 5).map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'lesson' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            activity.type === 'quiz' ? 'bg-green-100 dark:bg-green-900/30' :
                                                'bg-purple-100 dark:bg-purple-900/30'
                                            }`}>
                                            {
                                                activity.type === 'lesson' ? (
                                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                ) : activity.type === 'quiz' ? (
                                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                )
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {activity.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {activity.courseTitle}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {new Date(activity.completedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyAnalyticsState
                                title="No recent activity"
                                subtitle="Start learning to see your activity here"
                                icon={
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                        )}
                    </AnalyticsSection>
                </div>

                {/* Learning Insights */}
                <AnalyticsSection title="Learning Insights" subtitle="Personalized recommendations to help you succeed">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Keep Learning</h4>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                {kpis.averageProgress > 50
                                    ? "You're making great progress! Continue with your current courses to maintain momentum."
                                    : "You're just getting started! Keep learning to build your knowledge and skills."
                                }
                            </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-green-900 dark:text-green-100">Stay Consistent</h4>
                            </div>
                            <p className="text-sm text-green-800 dark:text-green-200">
                                Regular study habits help you retain information better. Try to study a little every day.
                            </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Explore More</h4>
                            </div>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                                {kpis.enrolledCourses < 3
                                    ? "Discover new courses and expand your knowledge. Learning keeps your mind sharp!"
                                    : "You're exploring many topics! Consider focusing on completing some courses for deeper mastery."
                                }
                            </p>
                        </div>
                    </div>
                </AnalyticsSection>
            </div>
        </div>
    );
};


export default StudentAnalyticsPage;

StudentAnalyticsPage.propTypes = {
    embedded: PropTypes.bool,
};

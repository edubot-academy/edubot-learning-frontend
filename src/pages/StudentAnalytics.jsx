import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
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
    AnalyticsLineChart,
    AnalyticsBarChart,
    AnalyticsDoughnutChart,
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
    const navigate = useNavigate();
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
                    title="Окуучу Аналитикасы"
                    subtitle="Окуу прогрессиңизди, курс аяктоосуңузду, активдүүлүгүңүздү жана жеке корутуларыңызды көрүңүз"
                    action={
                        <button
                            type="button"
                            onClick={loadOverview}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-edubot-orange text-white font-medium hover:bg-edubot-orange/90 disabled:opacity-60 transition-colors"
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
                        title="Катышкан Курстар"
                        value={kpis.enrolledCourses}
                        subtitle="Активдүү катышуу"
                        color="edubot"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Аякталган Курстар"
                        value={kpis.completedCourses}
                        subtitle="Ийгиликтер"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Аякталган Сабактар"
                        value={kpis.totalLessonsCompleted}
                        subtitle="Окуу жетишкендиги"
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                    <AnalyticsSummaryCard
                        title="Орточо Прогресс"
                        value={`${kpis.averageProgress}%`}
                        subtitle="Жалпы окуу деңгэли"
                        color="purple"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        }
                    />
                </div>

                {/* Окууну Улантыруу */}
                {continueLearning && (
                    <AnalyticsSection title="Окууну Улантыруу" subtitle="Акыркы сабакка кайтуу">
                        <div className="bg-gradient-to-br from-edubot-orange to-edubot-orange/90 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold mb-2">{continueLearning.courseTitle}</h4>
                                    <p className="text-edubot-orange/90 mb-4">{continueLearning.lessonTitle}</p>
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Прогресс</span>
                                            <span>{continueLearning.progress}%</span>
                                        </div>
                                        <div className="w-full bg-white/20 rounded-full h-2">
                                            <div
                                                className="bg-white rounded-full h-2 transition-all duration-300"
                                                style={{ width: `${continueLearning.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="bg-white text-edubot-orange px-4 py-2 rounded-lg font-medium hover:bg-edubot-orange hover:text-white transition-colors"
                                        onClick={() => {
                                            // Navigate to the course or lesson
                                            if (continueLearning?.courseId) {
                                                navigate(`/courses/${continueLearning.courseId}`);
                                            }
                                        }}
                                    >
                                        Окууну Улантуу
                                    </button>
                                </div>
                                <div className="ml-6">
                                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnalyticsSection>
                )}

                {/* Менин Курстарым жана Акыркы Активдүүлүк */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsSection title="Менин Курстарым" subtitle="Бардык катышкан курстарым">
                        <ProgressList
                            items={myCourses.map((course) => ({
                                title: course.courseTitle || `Курс #${course.courseId}`,
                                subtitle: `Катышкан күнү: ${course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString() : 'Белгисиз'}`,
                                progress: course.progress || 0,
                                status: course.progress === 100 ? 'completed' : 'active',
                                action: {
                                    label: 'Улантуруу',
                                    onClick: () => console.log('Continue course:', course.courseId),
                                },
                            }))}
                            emptyState={{
                                title: 'Азырынча курстар жок',
                                subtitle: 'Биринчи курсуңузду баштоо үчүн каталогду караңыз',
                                action: 'Курстарды Көрүү',
                                onAction: () => console.log('Browse courses'),
                            }}
                        />
                    </AnalyticsSection>

                    <AnalyticsSection title="Акыркы Активдүүлүк" subtitle="Сиздин акыркы аракеттериңиз">
                        {recentActivity && recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.slice(0, 10).map((activity, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'lesson' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                            activity.type === 'quiz' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                activity.type === 'course' ? 'bg-edubot-orange/20 text-edubot-orange' :
                                                    'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                            }`}>
                                            {activity.type === 'lesson' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            )}
                                            {activity.type === 'quiz' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            )}
                                            {activity.type === 'course' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            )}
                                            {activity.type === 'other' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {activity.title || 'Активдүүлүк'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Белгисиз убакыт'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyAnalyticsState
                                title="Активдүүлүк жок"
                                subtitle="Азырынча аракеттериңиз жок"
                                icon={
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                        )}
                    </AnalyticsSection>
                </div>

                {/* Окуучу Прогресс Аналитикасы */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsBarChart
                        title="Курс Прогресс Көрүнүчүсү"
                        subtitle="Катышкан курстардагы прогрессиңиз"
                        data={myCourses.map((course) => ({
                            label: course.courseTitle || `Курс #${course.courseId}`,
                            value: metricNumber(course.progress || 0),
                        })) || []}
                        horizontal={true}
                        color="edubot"
                        height="300px"
                        showGrid={false}
                        showLegend={false}
                    />

                    <AnalyticsDoughnutChart
                        title="Окуу Активдүүлүк Бөлүштөрү"
                        subtitle="Окуу убактыңызды кантип өткөрөсүз"
                        data={recentActivity.reduce((acc, activity) => {
                            const type = activity.type || 'other';
                            const existing = acc.find(item => item.label === type);
                            if (existing) {
                                existing.value += 1;
                            } else {
                                acc.push({ label: type, value: 1 });
                            }
                            return acc;
                        }, []).map((item, index) => ({
                            label: item.label.charAt(0).toUpperCase() + item.label.slice(1),
                            value: item.value,
                        }))}
                        colors={['rgb(59, 130, 246)', 'rgb(34, 197, 94)', 'rgb(251, 146, 60)', 'rgb(168, 85, 247)']}
                        height="300px"
                        showLegend={true}
                    />
                </div>

                {/* Окуу Корутулары */}
                <AnalyticsSection title="Окуу Корутулары" subtitle="Ийгиликке жетүү үчүн жеке сунуштар">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Окууну Улантыруу</h4>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                {kpis.averageProgress > 50
                                    ? "Улуу прогресс көрсөтүүдөсүз! Активдүү окууну улантыңыз."
                                    : "Окууга жаңы баштадыңыз. Билим жана көндүмдөрүңүздү өнүктүрүңүз."}
                            </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-green-900 dark:text-green-100">Туруктуу Окуу</h4>
                            </div>
                            <p className="text-sm text-green-800 dark:text-green-200">
                                Туруктуу окуу адаттары маалыматты жакшыраак сактайт. Күнүнө аз убакыт окууга аракет кылыңыз.
                            </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Көбүрөөк Изилдөө</h4>
                            </div>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                                Жаңы курстарды ачып, билимиңизди кеңитүңүз. Окуу акылыңызды күчтөйт!
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

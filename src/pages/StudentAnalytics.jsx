import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchStudentOverviewAnalytics } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    AnalyticsSection,
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
import { FiAward, FiBookOpen, FiCalendar, FiTrendingUp, FiZap } from 'react-icons/fi';

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

const StudentAnalyticsPage = ({
    embedded = false,
    courseId,
    showHeader = true,
    showFilters = true,
}) => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);

    const requestFilters = useMemo(
        () => ({
            from: filters.from || undefined,
            to: filters.to || undefined,
            courseId: courseId || undefined,
            studentId: user?.role === 'student' ? undefined : user?.id,
        }),
        [courseId, filters.from, filters.to, user?.role, user?.id]
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
    }, [requestFilters.courseId, requestFilters.from, requestFilters.groupId, requestFilters.studentId, requestFilters.to]);

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
            <div className={embedded ? 'space-y-6' : 'max-w-4xl mx-auto px-4 lg:px-6 space-y-6'}>
                {showHeader ? (
                    <DashboardSectionHeader
                        eyebrow="Advanced Progress"
                        title="Тереңирээк прогресс"
                        description="Чыныгы окуу прогрессиңизди, акыркы активдүүлүгүңүздү жана кайсы курста улантуу керек экенин ушул жерден көрүңүз."
                        action={(
                            <button
                                type="button"
                                onClick={loadOverview}
                                disabled={loading}
                                className="dashboard-button-primary"
                            >
                                {loading ? 'Жүктөлүүдө...' : 'Жаңылоо'}
                            </button>
                        )}
                    />
                ) : null}

                {courseId ? (
                    <DashboardInsetPanel
                        title="Учурдагы контекст"
                        description="Тереңирээк прогресс учурда тандалган курс чыпкасы менен шайкеш иштейт."
                    >
                        <div className="flex flex-wrap gap-2">
                            {courseId ? (
                                <span className="rounded-full border border-edubot-line bg-white px-3 py-2 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                    Курс чыпкасы активдүү
                                </span>
                            ) : null}
                        </div>
                    </DashboardInsetPanel>
                ) : null}

                {showFilters ? (
                    <DashboardInsetPanel
                        title="Мезгил фильтри"
                        description="Көрсөткүчтөрдү белгилүү күн аралыгы боюнча чыпкалоо."
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
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardMetricCard
                        label="Катышкан курстар"
                        value={kpis.enrolledCourses}
                        icon={FiBookOpen}
                    />
                    <DashboardMetricCard
                        label="Аякталган курстар"
                        value={kpis.completedCourses}
                        icon={FiAward}
                        tone="green"
                    />
                    <DashboardMetricCard
                        label="Аякталган сабактар"
                        value={kpis.totalLessonsCompleted}
                        icon={FiZap}
                        tone="blue"
                    />
                    <DashboardMetricCard
                        label="Орточо прогресс"
                        value={`${kpis.averageProgress}%`}
                        icon={FiTrendingUp}
                        tone="amber"
                    />
                </div>

                {continueLearning && (
                    <AnalyticsSection title="Окууну улантуу" subtitle="Акыркы активдүү курс жана сабак">
                        <div className="rounded-3xl border border-edubot-line/80 bg-gradient-to-br from-edubot-orange via-edubot-soft to-edubot-orange p-6 text-white shadow-edubot-hover dark:border-edubot-soft/20">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold mb-2">{continueLearning.courseTitle}</h4>
                                    <p className="mb-4 text-white/80">{continueLearning.lessonTitle}</p>
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
                                        className="inline-flex min-h-[44px] min-w-[120px] touch-manipulation items-center justify-center rounded-2xl bg-white px-6 py-3 font-medium text-edubot-orange transition-all duration-200 hover:-translate-y-0.5 hover:bg-edubot-surface active:scale-95 sm:min-w-[100px] sm:px-4 sm:py-2"
                                        onClick={() => {
                                            if (continueLearning?.courseId) {
                                                navigate(`/courses/${continueLearning.courseId}`);
                                            }
                                        }}
                                    >
                                        Окууну Улантуу
                                    </button>
                                </div>
                                <div className="ml-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
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

                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsSection title="Курстар боюнча прогресс" subtitle="Катышып жаткан курстар жана алардын абалы">
                        <ProgressList
                            items={myCourses.map((course) => ({
                                title: course.courseTitle || `Курс #${course.courseId}`,
                                subtitle: `Катышкан күнү: ${course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString() : 'Белгисиз'}`,
                                progress: course.progress || 0,
                                status: course.progress === 100 ? 'completed' : 'active',
                                action: {
                                    label: 'Улантуруу',
                                    onClick: () => navigate(`/courses/${course.courseId}`),
                                },
                            }))}
                            emptyState={{
                                title: 'Азырынча курстар жок',
                                subtitle: 'Биринчи курсуңузду баштоо үчүн каталогду караңыз',
                                action: 'Курстарды Көрүү',
                                onAction: () => navigate('/courses'),
                            }}
                        />
                    </AnalyticsSection>

                    <AnalyticsSection title="Акыркы активдүүлүк" subtitle="Сиздин акыркы окуу аракеттериңиз">
                        {recentActivity && recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.slice(0, 10).map((activity, index) => (
                                    <div key={index} className="flex items-center gap-3 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${activity.type === 'lesson' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
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
                                            <p className="font-medium text-edubot-ink dark:text-gray-100">
                                                {activity.title || 'Активдүүлүк'}
                                            </p>
                                            <p className="text-sm text-edubot-muted dark:text-slate-400">
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

                <div className="grid lg:grid-cols-2 gap-6">
                    <AnalyticsBarChart
                        title="Курс прогресс көрүнүшү"
                        subtitle="Катышкан курстардагы реалдуу прогрессиңиз"
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
                        title="Активдүүлүк бөлүштүрүлүшү"
                        subtitle="Акыркы аракеттериңиз кайсы типке көбүрөөк туура келет"
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

                <DashboardInsetPanel
                    title="Бул барак эмнеге керек"
                    description="Бул жер мотивация баннерлеринен көрө, реалдуу окуу тарыхын жана прогрессти тереңирээк көрүү үчүн керек."
                >
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                <FiBookOpen className="h-4 w-4" />
                                Курстар
                            </div>
                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                Кайсы курстарда прогресс токтоп калганын тез байкайсыз.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                <FiCalendar className="h-4 w-4" />
                                Убакыт
                            </div>
                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                Белгилүү мезгил боюнча окуу активдүүлүгүн салыштыра аласыз.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                <FiTrendingUp className="h-4 w-4" />
                                Прогресс
                            </div>
                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                Жалпы көрсөткүчтөн тереңирээк деталдарды ушул жерден көрөсүз.
                            </p>
                        </div>
                    </div>
                </DashboardInsetPanel>
            </div>
        </div>
    );
};


export default StudentAnalyticsPage;

StudentAnalyticsPage.propTypes = {
    embedded: PropTypes.bool,
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showHeader: PropTypes.bool,
    showFilters: PropTypes.bool,
};

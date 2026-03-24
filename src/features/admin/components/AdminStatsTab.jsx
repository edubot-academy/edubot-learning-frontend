import Loader from '@shared/ui/Loader';
import MetricCard from '../stats/MetricCard';
import GrowthBadge from '../stats/GrowthBadge';
import TrendCard from '../stats/TrendCard';
import TopCoursesTable from '../stats/TopCoursesTable';

const AdminStatsTab = ({ stats, loading, onRefresh }) => {
    const totals = stats?.totals || {};
    const growth = stats?.growth || {};
    const activity = stats?.activity || {};
    const revenue = stats?.revenue || {};
    const trends = stats?.trends || {};
    const topCourses = Array.isArray(stats?.topCourses) ? stats.topCourses : [];

    const formatNumber = (value) =>
        Number(value ?? 0).toLocaleString('ru-RU', {
            maximumFractionDigits: 0,
        });

    const formatPercent = (value) => `${Math.round(Number(value ?? 0))}%`;

    const formatCurrency = (value) =>
        `${Number(value ?? 0).toLocaleString('ru-RU', {
            maximumFractionDigits: 0,
        })} сом`;

    if (loading && !stats) {
        return (
            <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <Loader fullScreen={false} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Акыркы 7 күн
                    </p>
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Платформанын статистикасы
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Жалпы көрсөткүчтөр, активдүүлүк жана тренддер
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <GrowthBadge label="Жаңы студенттер" value={growth.newStudents7d} tone="blue" />
                    <GrowthBadge label="Каттоолор" value={growth.enrollments7d} tone="emerald" />
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-[#E8ECF3] dark:border-gray-700 bg-white dark:bg-[#111111] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Жүктөлүүдө...' : 'Жаңыртуу'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <MetricCard label="Студенттер" value={formatNumber(totals.students)} />
                <MetricCard label="Курстар" value={formatNumber(totals.courses)} />
                <MetricCard label="Жарияланган курстар" value={formatNumber(totals.publishedCourses)} />
                <MetricCard label="Жалпы каттоолор" value={formatNumber(totals.enrollments)} />
                <MetricCard label="Активдүү каттоолор" value={formatNumber(totals.activeEnrollments)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    label="Даяр киреше (жалпы)"
                    value={formatCurrency(revenue.total)}
                    accent="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    sub="Бардык убакыт"
                />
                <MetricCard
                    label="Акыркы 30 күн"
                    value={formatCurrency(revenue.last30d)}
                    accent="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    sub="Ревеню"
                />
                <MetricCard
                    label="Курс аяктоо көрсөткүчү"
                    value={formatPercent(activity.courseCompletionRate)}
                    accent="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    sub={`Активдүү: ${formatNumber(activity.activeStudents7d || 0)} (7к) | ${formatNumber(
                        activity.activeStudents30d || 0
                    )} (30к)`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TrendCard
                    title="Күнүмдүк каттоо (студент)"
                    series={trends.dailySignups7d}
                    color="#2563EB"
                />
                <TrendCard
                    title="Күнүмдүк enrollments"
                    series={trends.dailyEnrollments7d}
                    color="#10B981"
                />
            </div>

            <TopCoursesTable
                courses={topCourses}
                formatNumber={formatNumber}
                formatPercent={formatPercent}
                formatCurrency={formatCurrency}
                loading={loading}
            />
        </div>
    );
};

export default AdminStatsTab;

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiUsers,
  FiCalendar,
  FiPercent,
  FiBarChart2,
  FiPieChart,
} from 'react-icons/fi';
import { DashboardMetricCard } from '../../../components/ui/dashboard';
import { 
  ATTENDANCE_STATUS_CONFIG, 
  getAttendanceRateColor, 
  getAttendanceRateBackground 
} from '../constants/attendanceConfig';
import {
  calculateAttendanceSummaryStatistics,
  categorizeStudentPerformance,
  getSessionPerformanceAnalysis,
} from '../utils/attendanceSummaryData';
import {
  formatAttendanceSessionDate,
  SUMMARY_ATTENDANCE_DATE_FORMAT,
} from '../utils/attendanceDateData';
import { getAttendanceSessionTitle } from '../utils/attendanceDisplayData';
import { getAttendanceStatusLabel } from '../utils/attendanceStatusData';

/**
 * Enhanced Attendance Summary with Data Visualization
 * Provides comprehensive attendance analytics with charts and insights
 */
const EnhancedAttendanceSummary = ({
  students = [],
  sessions = [],
  attendanceData = {},
  previousPeriodData = null,
  showTrends = false,
  showStudentBreakdown = false,
  showSessionBreakdown = false,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || undefined;

  const getSessionTitle = (session = {}) => getAttendanceSessionTitle(t, session);

  const formatSessionDate = (value) =>
    formatAttendanceSessionDate(value, {
      language,
      missingFallback: t('attendance.fallbacks.unknownDate'),
      invalidFallback: t('attendance.fallbacks.unknownDate'),
      formatOptions: SUMMARY_ATTENDANCE_DATE_FORMAT,
    });

  const statistics = useMemo(
    () =>
      calculateAttendanceSummaryStatistics({
        students,
        sessions,
        attendanceData,
        previousPeriodData,
        showTrends,
      }),
    [students, sessions, attendanceData, previousPeriodData, showTrends]
  );

  const studentPerformanceCategories = useMemo(
    () => categorizeStudentPerformance(students, statistics.studentStats),
    [students, statistics.studentStats]
  );

  const sessionPerformanceAnalysis = useMemo(
    () => getSessionPerformanceAnalysis(sessions, statistics.sessionStats),
    [sessions, statistics.sessionStats]
  );

  const getTrendMeta = (direction) => {
    switch (direction) {
      case 'up':
        return { Icon: FiTrendingUp, colorClass: 'text-green-600' };
      case 'down':
        return { Icon: FiTrendingDown, colorClass: 'text-red-600' };
      default:
        return { Icon: FiMinus, colorClass: 'text-gray-600' };
    }
  };

  const trendMeta = statistics.trends
    ? getTrendMeta(statistics.trends.attendanceRate.direction)
    : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
	        <DashboardMetricCard
	          label={t('attendance.summary.totalAttendance')}
          value={`${statistics.attendanceRate.toFixed(1)}%`}
          icon={FiPercent}
          tone={
            statistics.attendanceRate >= 75
              ? 'green'
              : statistics.attendanceRate >= 50
                ? 'amber'
                : 'red'
          }
        />

	        <DashboardMetricCard
	          label={t('attendance.status.present')}
          value={statistics.totals.present}
          icon={FiUsers}
          tone="green"
        />

	        <DashboardMetricCard
	          label={t('attendance.status.late')}
          value={statistics.totals.late}
          icon={FiCalendar}
          tone="amber"
        />

	        <DashboardMetricCard
	          label={t('attendance.status.absent')}
          value={statistics.totals.absent}
          icon={FiUsers}
          tone="red"
        />

	        <DashboardMetricCard
	          label={t('attendance.status.excused')}
          value={statistics.totals.excused}
          icon={FiCalendar}
          tone="blue"
        />
      </div>

      {/* Data Visualization Section */}
      {(showStudentBreakdown || showSessionBreakdown) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Distribution Chart */}
          <div className="dashboard-panel-muted rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiPieChart className="h-5 w-5 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
	                {t('attendance.summary.distribution')}
              </h3>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([status, config]) => {
                const count = statistics.totals[status] || 0;
                const percentage = statistics.totals.total > 0 ? (count / statistics.totals.total) * 100 : 0;
                
                if (count === 0) return null;

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <config.icon className={`h-4 w-4 ${config.textColor}`} />
                        <span className="font-medium text-gray-900 dark:text-white">
	                          {getAttendanceStatusLabel(t, status)}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${config.bgColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Performance Categories */}
          {showStudentBreakdown && (
            <div className="dashboard-panel-muted rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiBarChart2 className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
	                  {t('attendance.summary.studentCategoriesShort')}
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(studentPerformanceCategories).map(([category, data]) => {
                  if (data.count === 0) return null;

                  const categoryColors = {
                    excellent: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
                    good: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                    fair: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
                    poor: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
                    noData: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                  };

	                  const categoryLabels = {
	                    excellent: t('attendance.summary.categories.excellent'),
	                    good: t('attendance.summary.categories.good'),
	                    fair: t('attendance.summary.categories.fair'),
	                    poor: t('attendance.summary.categories.poor'),
	                    noData: t('attendance.summary.categories.noData'),
	                  };

                  const percentage = students.length > 0 ? (data.count / students.length) * 100 : 0;

                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {categoryLabels[category]}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">
	                            {t('attendance.summary.studentCount', { count: data.count })}
                          </span>
                          <span className="text-gray-500 dark:text-gray-500">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${categoryColors[category]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Performance Analysis */}
      {showSessionBreakdown && sessionPerformanceAnalysis.length > 0 && (
        <div className="dashboard-panel-muted rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiCalendar className="h-5 w-5 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
	              {t('attendance.summary.bySession')}
            </h3>
          </div>

          <div className="space-y-3">
            {sessionPerformanceAnalysis.slice(0, 10).map((session) => {
              const attendedCount = (session.present || 0) + (session.late || 0);
              const attendanceRate = session.attendanceRate || 0;
              const rateColor = getAttendanceRateColor(attendanceRate);
              const rateBackground = getAttendanceRateBackground(attendanceRate);

              return (
                <div key={session.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${rateBackground} ${rateColor}`}>
                        {attendanceRate.toFixed(1)}%
                      </div>
                      <div>
                        <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
	                          {getSessionTitle(session)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
	                          {formatSessionDate(session.startsAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {attendedCount}/{session.scheduledCount || 0}
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${rateBackground.replace('bg-', '').replace('/20', '')}`}
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trends Section */}
      {showTrends && statistics.trends && trendMeta && (
        <div className="dashboard-panel-muted rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <trendMeta.Icon className={`h-5 w-5 ${trendMeta.colorClass}`} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
	              {t('attendance.summary.trends')}
            </h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
	                {t('attendance.summary.attendanceRate')}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {statistics.trends.attendanceRate.current.toFixed(1)}%
                </span>

                <div className={`flex items-center gap-1 ${trendMeta.colorClass}`}>
                  <trendMeta.Icon className="h-4 w-4" />
                  <span className="text-xs">
                    {Math.abs(statistics.trends.attendanceRate.change).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className={`flex items-center justify-center p-4 rounded-lg ${getAttendanceRateBackground(statistics.trends.attendanceRate.current)}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getAttendanceRateColor(statistics.trends.attendanceRate.current)}`}>
                  {statistics.trends.attendanceRate.current.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
	                    {t('attendance.summary.currentPeriod')}
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg text-gray-500 dark:text-gray-400">
                  {statistics.trends.attendanceRate.previous.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
	                  {t('attendance.summary.previousPeriod')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

EnhancedAttendanceSummary.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fullName: PropTypes.string.isRequired,
      email: PropTypes.string,
    })
  ),
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      startsAt: PropTypes.string,
      sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  attendanceData: PropTypes.objectOf(
    PropTypes.objectOf(
      PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused'])
    )
  ),
  previousPeriodData: PropTypes.shape({
    attendanceRate: PropTypes.number,
  }),
  showTrends: PropTypes.bool,
  showStudentBreakdown: PropTypes.bool,
  showSessionBreakdown: PropTypes.bool,
  className: PropTypes.string,
};

EnhancedAttendanceSummary.defaultProps = {
  students: [],
  sessions: [],
  attendanceData: {},
  previousPeriodData: null,
  showTrends: false,
  showStudentBreakdown: false,
  showSessionBreakdown: false,
  className: '',
};

export default EnhancedAttendanceSummary;

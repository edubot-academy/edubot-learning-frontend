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
} from 'react-icons/fi';
import { DashboardMetricCard } from '../../../components/ui/dashboard';
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

/**
 * Attendance Summary Statistics Component
 * Provides comprehensive attendance analytics and insights
 */
const AttendanceSummary = ({
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

      {showTrends && statistics.trends && trendMeta && (
        <div className="dashboard-panel-muted rounded-2xl p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
	            {t('attendance.summary.trends')}
          </h3>

          <div className="grid gap-4 lg:grid-cols-3">
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
          </div>
        </div>
      )}

      {showStudentBreakdown && (
        <div className="dashboard-panel-muted rounded-2xl p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
	            {t('attendance.summary.studentCategories')}
          </h3>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {studentPerformanceCategories.excellent.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
	                {t('attendance.summary.categories.excellent')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {studentPerformanceCategories.good.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
	                {t('attendance.summary.categories.good')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {studentPerformanceCategories.fair.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
	                {t('attendance.summary.categories.fair')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {studentPerformanceCategories.poor.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
	                {t('attendance.summary.categories.poor')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {studentPerformanceCategories.noData.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
	                {t('attendance.summary.categories.noData')}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSessionBreakdown && sessionPerformanceAnalysis.length > 0 && (
        <div className="dashboard-panel-muted rounded-2xl p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
	            {t('attendance.summary.bySession')}
          </h3>

          <div className="space-y-3">
            {sessionPerformanceAnalysis.slice(0, 5).map((session) => {
              const attendedCount = (session.present || 0) + (session.late || 0);

              return (
                <div key={session.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
	                      {getSessionTitle(session)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
	                      {formatSessionDate(session.startsAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {attendedCount}/{session.scheduledCount || 0}
                    </div>

                    <div
                      className={`text-sm font-medium ${session.attendanceRate >= 75
                        ? 'text-green-600 dark:text-green-400'
                        : session.attendanceRate >= 50
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                      {(session.attendanceRate || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

AttendanceSummary.propTypes = {
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

AttendanceSummary.defaultProps = {
  students: [],
  sessions: [],
  attendanceData: {},
  previousPeriodData: null,
  showTrends: false,
  showStudentBreakdown: false,
  showSessionBreakdown: false,
  className: '',
};

export default AttendanceSummary;

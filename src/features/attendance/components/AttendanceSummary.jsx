import { useMemo } from 'react';
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
  const statistics = useMemo(() => {
    if (!students.length || !sessions.length) {
      return {
        totals: { present: 0, late: 0, absent: 0, excused: 0, not_scheduled: 0, total: 0 },
        percentages: { present: 0, late: 0, absent: 0, excused: 0, not_scheduled: 0 },
        attendanceRate: 0,
        scheduledTotal: 0,
        studentStats: {},
        sessionStats: {},
        trends: null,
      };
    }

    const totals = {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      not_scheduled: 0,
      total: 0,
    };

    const studentStats = {};
    const sessionStats = {};

    students.forEach((student) => {
      const studentTotal = {
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        not_scheduled: 0,
      };

      sessions.forEach((session) => {
        const rawStatus = attendanceData?.[student.id]?.[session.id];
        const status = rawStatus || 'not_scheduled';

        if (!totals[status] && totals[status] !== 0) return;

        totals[status] += 1;
        totals.total += 1;

        studentTotal[status] += 1;

        if (!sessionStats[session.id]) {
          sessionStats[session.id] = {
            present: 0,
            late: 0,
            absent: 0,
            excused: 0,
            not_scheduled: 0,
          };
        }

        sessionStats[session.id][status] += 1;
      });

      const attendedCount = studentTotal.present + studentTotal.late;
      const scheduledCount =
        studentTotal.present +
        studentTotal.late +
        studentTotal.absent +
        studentTotal.excused;

      studentStats[student.id] = {
        ...studentTotal,
        attendanceRate: scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0,
        scheduledCount,
      };
    });

    const scheduledTotal =
      totals.present + totals.late + totals.absent + totals.excused;

    const percentages = {
      present: scheduledTotal > 0 ? (totals.present / scheduledTotal) * 100 : 0,
      late: scheduledTotal > 0 ? (totals.late / scheduledTotal) * 100 : 0,
      absent: scheduledTotal > 0 ? (totals.absent / scheduledTotal) * 100 : 0,
      excused: scheduledTotal > 0 ? (totals.excused / scheduledTotal) * 100 : 0,
      not_scheduled: totals.total > 0 ? (totals.not_scheduled / totals.total) * 100 : 0,
    };

    const attendanceRate =
      scheduledTotal > 0
        ? ((totals.present + totals.late) / scheduledTotal) * 100
        : 0;

    Object.keys(sessionStats).forEach((sessionId) => {
      const sessionTotal = sessionStats[sessionId];
      const attendedCount = sessionTotal.present + sessionTotal.late;
      const scheduledCount =
        sessionTotal.present +
        sessionTotal.late +
        sessionTotal.absent +
        sessionTotal.excused;

      sessionStats[sessionId].attendanceRate =
        scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;
      sessionStats[sessionId].scheduledCount = scheduledCount;
    });

    let trends = null;
    if (showTrends && previousPeriodData) {
      const prevAttendanceRate = previousPeriodData.attendanceRate || 0;
      const currentAttendanceRate = attendanceRate;

      trends = {
        attendanceRate: {
          current: currentAttendanceRate,
          previous: prevAttendanceRate,
          change: currentAttendanceRate - prevAttendanceRate,
          direction:
            currentAttendanceRate > prevAttendanceRate
              ? 'up'
              : currentAttendanceRate < prevAttendanceRate
                ? 'down'
                : 'stable',
        },
      };
    }

    return {
      totals,
      percentages,
      attendanceRate,
      scheduledTotal,
      studentStats,
      sessionStats,
      trends,
    };
  }, [students, sessions, attendanceData, previousPeriodData, showTrends]);

  const studentPerformanceCategories = useMemo(() => {
    const categories = {
      excellent: { count: 0, students: [] },
      good: { count: 0, students: [] },
      fair: { count: 0, students: [] },
      poor: { count: 0, students: [] },
      noData: { count: 0, students: [] },
    };

    students.forEach((student) => {
      const stats = statistics.studentStats[student.id];

      if (!stats || stats.scheduledCount === 0) {
        categories.noData.count += 1;
        categories.noData.students.push(student);
      } else if (stats.attendanceRate >= 90) {
        categories.excellent.count += 1;
        categories.excellent.students.push(student);
      } else if (stats.attendanceRate >= 75) {
        categories.good.count += 1;
        categories.good.students.push(student);
      } else if (stats.attendanceRate >= 50) {
        categories.fair.count += 1;
        categories.fair.students.push(student);
      } else {
        categories.poor.count += 1;
        categories.poor.students.push(student);
      }
    });

    return categories;
  }, [students, statistics.studentStats]);

  const sessionPerformanceAnalysis = useMemo(() => {
    if (!sessions.length) return [];

    return sessions
      .map((session) => ({
        ...session,
        ...(statistics.sessionStats[session.id] || {
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
          not_scheduled: 0,
          attendanceRate: 0,
          scheduledCount: 0,
        }),
      }))
      .sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0));
  }, [sessions, statistics.sessionStats]);

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
          label="Жалпы катышуу"
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
          label="Катышты"
          value={statistics.totals.present}
          icon={FiUsers}
          tone="green"
        />

        <DashboardMetricCard
          label="Кечикти"
          value={statistics.totals.late}
          icon={FiCalendar}
          tone="amber"
        />

        <DashboardMetricCard
          label="Келген жок"
          value={statistics.totals.absent}
          icon={FiUsers}
          tone="red"
        />

        <DashboardMetricCard
          label="Себептүү"
          value={statistics.totals.excused}
          icon={FiCalendar}
          tone="blue"
        />
      </div>

      {showTrends && statistics.trends && trendMeta && (
        <div className="dashboard-panel-muted rounded-2xl p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Катышуу тенденциялары
          </h3>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Катышуу %:
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
            Студенттердин катышуу категориялары
          </h3>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {studentPerformanceCategories.excellent.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Мыкты (90-100%)
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {studentPerformanceCategories.good.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Жакшы (75-89%)
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {studentPerformanceCategories.fair.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Орточо (50-74%)
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {studentPerformanceCategories.poor.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Начар (&lt;50%)
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {studentPerformanceCategories.noData.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Маалымат жок
              </div>
            </div>
          </div>
        </div>
      )}

      {showSessionBreakdown && sessionPerformanceAnalysis.length > 0 && (
        <div className="dashboard-panel-muted rounded-2xl p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Сессиялар боюнча катышуу
          </h3>

          <div className="space-y-3">
            {sessionPerformanceAnalysis.slice(0, 5).map((session) => {
              const attendedCount = (session.present || 0) + (session.late || 0);

              return (
                <div key={session.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {session.title || `Сессия ${session.sessionIndex}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.startsAt
                        ? new Date(session.startsAt).toLocaleDateString('ky-KG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : 'Күнү белгисиз'}
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
const createStatusCounts = (includeTotal = false) => ({
  present: 0,
  late: 0,
  absent: 0,
  excused: 0,
  not_scheduled: 0,
  ...(includeTotal ? { total: 0 } : {}),
});

const getScheduledCount = (counts) =>
  counts.present + counts.late + counts.absent + counts.excused;

export const createEmptyAttendanceSummaryStatistics = () => ({
  totals: createStatusCounts(true),
  percentages: createStatusCounts(false),
  attendanceRate: 0,
  scheduledTotal: 0,
  studentStats: {},
  sessionStats: {},
  trends: null,
});

export const calculateAttendanceSummaryStatistics = ({
  students = [],
  sessions = [],
  attendanceData = {},
  previousPeriodData = null,
  showTrends = false,
} = {}) => {
  if (!students.length || !sessions.length) {
    return createEmptyAttendanceSummaryStatistics();
  }

  const totals = createStatusCounts(true);
  const studentStats = {};
  const sessionStats = {};

  students.forEach((student) => {
    const studentTotal = createStatusCounts(false);

    sessions.forEach((session) => {
      const status = attendanceData?.[student.id]?.[session.id] || 'not_scheduled';

      if (!Object.prototype.hasOwnProperty.call(totals, status)) return;

      totals[status] += 1;
      totals.total += 1;
      studentTotal[status] += 1;

      if (!sessionStats[session.id]) {
        sessionStats[session.id] = createStatusCounts(false);
      }

      sessionStats[session.id][status] += 1;
    });

    const attendedCount = studentTotal.present + studentTotal.late;
    const scheduledCount = getScheduledCount(studentTotal);

    studentStats[student.id] = {
      ...studentTotal,
      attendanceRate: scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0,
      scheduledCount,
    };
  });

  const scheduledTotal = getScheduledCount(totals);
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
    const scheduledCount = getScheduledCount(sessionTotal);

    sessionStats[sessionId].attendanceRate =
      scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;
    sessionStats[sessionId].scheduledCount = scheduledCount;
  });

  let trends = null;
  if (showTrends && previousPeriodData) {
    const previousAttendanceRate = previousPeriodData.attendanceRate || 0;
    const change = attendanceRate - previousAttendanceRate;

    trends = {
      attendanceRate: {
        current: attendanceRate,
        previous: previousAttendanceRate,
        change,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
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
};

export const categorizeStudentPerformance = (students = [], studentStats = {}) => {
  const categories = {
    excellent: { count: 0, students: [] },
    good: { count: 0, students: [] },
    fair: { count: 0, students: [] },
    poor: { count: 0, students: [] },
    noData: { count: 0, students: [] },
  };

  students.forEach((student) => {
    const stats = studentStats[student.id];
    let category = 'poor';

    if (!stats || stats.scheduledCount === 0) {
      category = 'noData';
    } else if (stats.attendanceRate >= 90) {
      category = 'excellent';
    } else if (stats.attendanceRate >= 75) {
      category = 'good';
    } else if (stats.attendanceRate >= 50) {
      category = 'fair';
    }

    categories[category].count += 1;
    categories[category].students.push(student);
  });

  return categories;
};

export const getSessionPerformanceAnalysis = (sessions = [], sessionStats = {}) => {
  if (!sessions.length) return [];

  return sessions
    .map((session) => ({
      ...session,
      ...(sessionStats[session.id] || {
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
};

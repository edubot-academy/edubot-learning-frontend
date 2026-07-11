import { DEFAULT_ATTENDANCE_STATUS } from './attendanceData';

const createCardStatusCounts = () => ({
  present: 0,
  late: 0,
  absent: 0,
  excused: 0,
  not_scheduled: 0,
  total: 0,
});

export const filterAttendanceCardStudents = ({
  students = [],
  sessions = [],
  attendanceData = {},
  searchQuery = '',
  statusFilter = 'all',
} = {}) => {
  const searchLower = searchQuery.toLowerCase();

  return students.filter((student) => {
    if (searchQuery) {
      const fullName = (student.fullName || '').toLowerCase();
      const email = (student.email || '').toLowerCase();

      if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }

    if (statusFilter !== 'all') {
      const studentStatuses = sessions.map(
        (session) => attendanceData[student.id]?.[session.id] || DEFAULT_ATTENDANCE_STATUS
      );
      return studentStatuses.some((status) => status === statusFilter);
    }

    return true;
  });
};

export const getAttendanceCardStudentStats = ({
  student,
  sessions = [],
  attendanceData = {},
} = {}) => {
  const stats = createCardStatusCounts();

  sessions.forEach((session) => {
    const status = attendanceData[student.id]?.[session.id] || DEFAULT_ATTENDANCE_STATUS;
    stats[status] = (stats[status] || 0) + 1;
    stats.total += 1;
  });

  const attendedCount = stats.present + stats.late;
  const scheduledCount = stats.present + stats.late + stats.absent + stats.excused;
  const attendanceRate = scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

  return { ...stats, attendanceRate };
};

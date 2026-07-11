import { DEFAULT_ATTENDANCE_STATUS } from './attendanceData';

export const LEGACY_ATTENDANCE_STATUS_CYCLE = Object.freeze([
  'present',
  'late',
  'absent',
  DEFAULT_ATTENDANCE_STATUS,
]);

export const getNextLegacyAttendanceStatus = (currentStatus) => {
  const currentIndex = LEGACY_ATTENDANCE_STATUS_CYCLE.indexOf(currentStatus);
  return LEGACY_ATTENDANCE_STATUS_CYCLE[
    (currentIndex + 1) % LEGACY_ATTENDANCE_STATUS_CYCLE.length
  ];
};

export const filterAndSortAttendanceTableStudents = ({
  students = [],
  sessions = [],
  attendanceData = {},
  filterQuery = '',
  statusFilter = 'all',
  sortConfig = { key: 'name', direction: 'asc' },
} = {}) => {
  let filtered = students.filter((student) =>
    (student.fullName || student.name || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (statusFilter !== 'all') {
    filtered = filtered.filter((student) => {
      const studentStatuses = sessions.map(
        (session) => attendanceData[student.id]?.[session.id] || DEFAULT_ATTENDANCE_STATUS
      );
      return studentStatuses.some((status) => status === statusFilter);
    });
  }

  filtered.sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';

    if (sortConfig.direction === 'asc') {
      return aValue.localeCompare(bValue);
    }
    return bValue.localeCompare(aValue);
  });

  return filtered;
};

export const getPaginatedAttendanceTableStudents = ({
  students = [],
  currentPage = 0,
  itemsPerPage = 25,
} = {}) => {
  const start = currentPage * itemsPerPage;
  return students.slice(start, start + itemsPerPage);
};

export const calculateAttendanceTableStatistics = ({
  students = [],
  sessions = [],
  attendanceData = {},
} = {}) => {
  const totals = {
    present: 0,
    late: 0,
    absent: 0,
    not_scheduled: 0,
    excused: 0,
    total: 0,
  };

  students.forEach((student) => {
    sessions.forEach((session) => {
      const status = attendanceData[student.id]?.[session.id] || DEFAULT_ATTENDANCE_STATUS;
      totals[status] += 1;
      totals.total += 1;
    });
  });

  const percentages = {};
  Object.keys(totals).forEach((key) => {
    if (key !== 'total') {
      percentages[key] = totals.total > 0 ? (totals[key] / totals.total) * 100 : 0;
    }
  });

  return { totals, percentages };
};

export const getAttendanceTableStudentStats = ({
  student,
  sessions = [],
  attendanceData = {},
} = {}) => {
  const studentStats = sessions.reduce((stats, session) => {
    const status = attendanceData[student.id]?.[session.id] || DEFAULT_ATTENDANCE_STATUS;
    stats[status] = (stats[status] || 0) + 1;
    return stats;
  }, {});

  const attendanceRate =
    sessions.length > 0 ? ((studentStats.present || 0) / sessions.length) * 100 : 0;

  return { studentStats, attendanceRate };
};

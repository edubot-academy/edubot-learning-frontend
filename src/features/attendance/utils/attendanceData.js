export const DEFAULT_ATTENDANCE_STATUS = 'not_scheduled';

export const ATTENDANCE_STATUSES = Object.freeze([
  'present',
  'late',
  'absent',
  DEFAULT_ATTENDANCE_STATUS,
  'excused',
]);

export const createEmptyAttendanceState = () => ({
  students: [],
  sessions: [],
  attendanceData: {},
  loading: false,
  error: null,
  lastUpdated: null,
});

export const createAttendanceDataFilters = () => ({
  statusFilter: 'all',
  searchQuery: '',
  dateRange: null,
});

export const createAttendanceTableFilters = () => ({
  ...createAttendanceDataFilters(),
  sessionFilter: 'all',
});

export const setAttendanceFilter = (filters, key, value) => ({
  ...filters,
  [key]: value,
});

export const hasActiveAttendanceFilters = (filters = {}) =>
  filters.statusFilter !== 'all' ||
  filters.searchQuery !== '' ||
  filters.dateRange !== null ||
  filters.sessionFilter !== 'all';

export const getAttendanceOverviewEndpoint = ({ groupId, adminMode = false }) => {
  if (adminMode) {
    return `/api/admin/groups/${groupId}/attendance-overview`;
  }
  return `/api/groups/${groupId}/attendance-overview`;
};

export const getAttendanceOverviewSearchParams = ({
  includeUnscheduled = true,
  dateRange = null,
} = {}) =>
  new URLSearchParams({
    includeUnscheduled: includeUnscheduled.toString(),
    ...(dateRange && {
      startDate: dateRange.start,
      endDate: dateRange.end,
    }),
  });

const createStatusCounts = (includeTotal = false) => ({
  present: 0,
  late: 0,
  absent: 0,
  not_scheduled: 0,
  excused: 0,
  ...(includeTotal ? { total: 0 } : {}),
});

export const normalizeAttendanceData = (rawData = {}) => {
  const normalized = {};

  Object.keys(rawData || {}).forEach((studentId) => {
    normalized[studentId] = {};
    Object.keys(rawData[studentId] || {}).forEach((sessionId) => {
      normalized[studentId][sessionId] = rawData[studentId][sessionId];
    });
  });

  return normalized;
};

export const setAttendanceRecord = (attendanceData = {}, studentId, sessionId, status) => ({
  ...attendanceData,
  [studentId]: {
    ...(attendanceData[studentId] || {}),
    [sessionId]: status,
  },
});

export const applyAttendanceUpdates = (attendanceData = {}, updates = []) =>
  updates.reduce(
    (nextAttendanceData, { studentId, sessionId, status }) =>
      setAttendanceRecord(nextAttendanceData, studentId, sessionId, status),
    attendanceData
  );

export const getAttendanceStatus = (attendanceData = {}, studentId, sessionId) =>
  attendanceData[studentId]?.[sessionId] || DEFAULT_ATTENDANCE_STATUS;

export const calculateAttendanceStatistics = ({
  students = [],
  sessions = [],
  attendanceData = {},
} = {}) => {
  const totals = createStatusCounts(true);
  const percentages = createStatusCounts(false);
  const studentStats = {};
  const sessionStats = {};

  if (!students.length || !sessions.length) {
    return { totals, percentages, studentStats, sessionStats };
  }

  students.forEach((student) => {
    const studentTotal = createStatusCounts(false);

    sessions.forEach((session) => {
      const status = getAttendanceStatus(attendanceData, student.id, session.id);

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
    studentStats[student.id] = {
      ...studentTotal,
      attendanceRate: sessions.length > 0 ? (attendedCount / sessions.length) * 100 : 0,
    };
  });

  ATTENDANCE_STATUSES.forEach((status) => {
    percentages[status] = totals.total > 0 ? (totals[status] / totals.total) * 100 : 0;
  });

  Object.keys(sessionStats).forEach((sessionId) => {
    const sessionTotal = sessionStats[sessionId];
    const attendedCount = sessionTotal.present + sessionTotal.late;
    sessionStats[sessionId].attendanceRate =
      students.length > 0 ? (attendedCount / students.length) * 100 : 0;
  });

  return { totals, percentages, studentStats, sessionStats };
};

export const filterAttendanceData = (data, filters = {}) => {
  const { students = [], sessions = [], attendanceData = {} } = data;
  const { searchQuery = '', statusFilter = 'all' } = filters;
  const searchLower = searchQuery.toLowerCase();

  const filteredStudents = students.filter((student) => {
    if (
      searchLower &&
      !student.name.toLowerCase().includes(searchLower) &&
      !student.email?.toLowerCase().includes(searchLower)
    ) {
      return false;
    }

    if (statusFilter !== 'all') {
      const studentStatuses = sessions.map((session) =>
        getAttendanceStatus(attendanceData, student.id, session.id)
      );
      return studentStatuses.includes(statusFilter);
    }

    return true;
  });

  return {
    ...data,
    students: filteredStudents,
  };
};

export const getAttendanceUpdateKey = (studentId, sessionId) => `${studentId}-${sessionId}`;

export const getAttendanceUpdateKeys = (updates = []) =>
  updates.map(({ studentId, sessionId }) => getAttendanceUpdateKey(studentId, sessionId));

export const addPendingAttendanceUpdates = (pendingUpdates, updateKeys) => {
  const nextPendingUpdates = new Set(pendingUpdates);
  updateKeys.forEach((key) => nextPendingUpdates.add(key));
  return nextPendingUpdates;
};

export const removePendingAttendanceUpdate = (pendingUpdates, updateKey) => {
  const nextPendingUpdates = new Set(pendingUpdates);
  nextPendingUpdates.delete(updateKey);
  return nextPendingUpdates;
};

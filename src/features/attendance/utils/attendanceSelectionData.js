import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import { DEFAULT_ATTENDANCE_STATUS } from './attendanceData';

const createSelectionStatusCounts = () => ({
  present: 0,
  late: 0,
  absent: 0,
  excused: 0,
  not_scheduled: 0,
  total: 0,
});

export const parseAttendanceCellKey = (cellKey) => {
  const [studentId, sessionId] = String(cellKey).split('-').map(Number);
  return { studentId, sessionId };
};

export const getSelectedAttendanceStatusCounts = ({
  selectedCells = new Set(),
  attendanceData = {},
} = {}) => {
  const counts = createSelectionStatusCounts();

  selectedCells.forEach((cellKey) => {
    const { studentId, sessionId } = parseAttendanceCellKey(cellKey);
    const status = attendanceData[studentId]?.[sessionId] || DEFAULT_ATTENDANCE_STATUS;

    if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] += 1;
      counts.total += 1;
    }
  });

  return counts;
};

export const getSelectedStudents = (students = [], selectedCells = new Set()) => {
  const studentIds = new Set();
  selectedCells.forEach((cellKey) => {
    const { studentId } = parseAttendanceCellKey(cellKey);
    studentIds.add(studentId);
  });

  return students.filter((student) => studentIds.has(student.id));
};

export const getSelectedSessions = (sessions = [], selectedCells = new Set()) => {
  const sessionIds = new Set();
  selectedCells.forEach((cellKey) => {
    const { sessionId } = parseAttendanceCellKey(cellKey);
    sessionIds.add(sessionId);
  });

  return sessions.filter((session) => sessionIds.has(session.id));
};

export const createBulkAttendanceUpdates = (selectedCells = new Set(), status) =>
  Array.from(selectedCells).map((cellKey) => ({
    ...parseAttendanceCellKey(cellKey),
    status,
  }));

export const createBulkAttendanceUpdatesForStatus = ({
  selectedCells = new Set(),
  attendanceData = {},
  fromStatus,
  toStatus,
} = {}) =>
  Array.from(selectedCells)
    .filter((cellKey) => {
      const { studentId, sessionId } = parseAttendanceCellKey(cellKey);
      const status = attendanceData[studentId]?.[sessionId] || DEFAULT_ATTENDANCE_STATUS;
      return status === fromStatus;
    })
    .map((cellKey) => ({
      ...parseAttendanceCellKey(cellKey),
      status: toStatus,
    }));

export const getSelectedStudentsWithAnyStatus = ({
  selectedStudents = [],
  selectedCells = new Set(),
  attendanceData = {},
  statuses = [],
} = {}) =>
  selectedStudents.filter((student) =>
    Array.from(selectedCells).some((cellKey) => {
      const { studentId, sessionId } = parseAttendanceCellKey(cellKey);
      if (studentId !== student.id) return false;

      const status = attendanceData[studentId]?.[sessionId] || DEFAULT_ATTENDANCE_STATUS;
      return statuses.includes(status);
    })
  );

export const getSelectedStudentsToNotify = ({
  selectedStudents = [],
  selectedCells = new Set(),
  attendanceData = {},
} = {}) =>
  getSelectedStudentsWithAnyStatus({
    selectedStudents,
    selectedCells,
    attendanceData,
    statuses: [SESSION_ATTENDANCE_STATUS.ABSENT, SESSION_ATTENDANCE_STATUS.LATE],
  });

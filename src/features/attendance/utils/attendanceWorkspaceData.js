import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';

const toList = (payload, keyedCollectionName) => {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.[keyedCollectionName])) return payload[keyedCollectionName];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const toCourseList = (payload) => toList(payload, 'courses');

export const toGroupList = (payload) => toList(payload, 'groups');

export const toSessionList = (payload) => toList(payload, 'sessions');

export const toAttendanceItems = (payload) => {
  if (Array.isArray(payload?.rows)) return payload.rows;
  return toList(payload, 'items');
};

export const toRosterList = (payload) => toList(payload, 'students');

export const isAttendanceCourseType = (course = {}) => {
  const type = String(course?.courseType || course?.type || '').toLowerCase();
  return type === 'offline' || type === 'online_live';
};

export const cloneRowsMap = (map) =>
  Object.fromEntries(
    Object.entries(map || {}).map(([key, value]) => [key, { ...value }])
  );

export const createSessionAttendanceRowsMap = ({
  rosterPayload,
  attendancePayload,
} = {}) => {
  const rosterItems = toRosterList(rosterPayload);
  const attendanceRows = toAttendanceItems(attendancePayload);

  const attendanceByStudentId = new Map(
    attendanceRows.map((item) => [
      Number(item.studentId || item.userId),
      {
        status: item.status,
        notes: item.notes || '',
        joinedAt: item.joinedAt || undefined,
        leftAt: item.leftAt || undefined,
      },
    ])
  );

  return rosterItems.reduce((nextRows, student) => {
    const studentId = Number(student.userId || student.id);
    if (!studentId) return nextRows;

    const existing = attendanceByStudentId.get(studentId);
    nextRows[studentId] = {
      studentId,
      fullName: student.fullName || student.user?.fullName || `#${studentId}`,
      status: existing?.status || SESSION_ATTENDANCE_STATUS.PRESENT,
      notes: existing?.notes || '',
      joinedAt: existing?.joinedAt,
      leftAt: existing?.leftAt,
    };

    return nextRows;
  }, {});
};

export const hasSessionAttendanceChanges = (rowsMap = {}, initialRowsMap = {}) => {
  const currentIds = Object.keys(rowsMap);
  const initialIds = Object.keys(initialRowsMap);

  if (currentIds.length !== initialIds.length) return currentIds.length > 0;

  return currentIds.some((studentId) => {
    const current = rowsMap[studentId];
    const initial = initialRowsMap[studentId];
    if (!current || !initial) return true;

    return (
      current.status !== initial.status ||
      (current.notes || '').trim() !== (initial.notes || '').trim() ||
      (current.joinedAt || '') !== (initial.joinedAt || '') ||
      (current.leftAt || '') !== (initial.leftAt || '')
    );
  });
};

export const calculateSessionAttendanceStats = (students = []) => {
  const present = students.filter(
    (student) => student.status === SESSION_ATTENDANCE_STATUS.PRESENT
  ).length;
  const late = students.filter(
    (student) => student.status === SESSION_ATTENDANCE_STATUS.LATE
  ).length;
  const absent = students.filter(
    (student) => student.status === SESSION_ATTENDANCE_STATUS.ABSENT
  ).length;
  const excused = students.filter(
    (student) => student.status === SESSION_ATTENDANCE_STATUS.EXCUSED
  ).length;

  const total = students.length;
  const rate = total ? Math.round(((present + late + excused) / total) * 100) : 0;

  return { present, late, absent, excused, total, rate };
};

export const filterSessionAttendanceReportItems = (students = [], reportFilter = 'all') => {
  if (reportFilter === 'all') return students;
  return students.filter((item) => String(item.status) === reportFilter);
};

export const setSessionAttendanceRowStatus = (rowsMap, studentId, status) => ({
  ...rowsMap,
  [studentId]: { ...rowsMap[studentId], status },
});

export const setSessionAttendanceRowNotes = (rowsMap, studentId, notes) => ({
  ...rowsMap,
  [studentId]: { ...rowsMap[studentId], notes },
});

import { describe, expect, it } from 'vitest';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
  calculateSessionAttendanceStats,
  cloneRowsMap,
  createSessionAttendanceRowsMap,
  filterSessionAttendanceReportItems,
  hasSessionAttendanceChanges,
  isAttendanceCourseType,
  setSessionAttendanceRowNotes,
  setSessionAttendanceRowStatus,
  toAttendanceItems,
  toCourseList,
  toGroupList,
  toRosterList,
  toSessionList,
} from './attendanceWorkspaceData';

describe('attendance workspace data utilities', () => {
  it('normalizes supported API collection payload shapes', () => {
    expect(toCourseList({ items: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    expect(toCourseList({ courses: [{ id: 2 }] })).toEqual([{ id: 2 }]);
    expect(toGroupList({ groups: [{ id: 3 }] })).toEqual([{ id: 3 }]);
    expect(toSessionList({ sessions: [{ id: 4 }] })).toEqual([{ id: 4 }]);
    expect(toAttendanceItems({ rows: [{ id: 5 }] })).toEqual([{ id: 5 }]);
    expect(toRosterList({ students: [{ id: 6 }] })).toEqual([{ id: 6 }]);
    expect(toCourseList({ data: [{ id: 7 }] })).toEqual([{ id: 7 }]);
    expect(toCourseList([{ id: 8 }])).toEqual([{ id: 8 }]);
    expect(toCourseList(null)).toEqual([]);
  });

  it('checks attendance-capable course types', () => {
    expect(isAttendanceCourseType({ courseType: 'offline' })).toBe(true);
    expect(isAttendanceCourseType({ type: 'ONLINE_LIVE' })).toBe(true);
    expect(isAttendanceCourseType({ type: 'self_paced' })).toBe(false);
  });

  it('creates session attendance rows from roster and attendance payloads', () => {
    const rowsMap = createSessionAttendanceRowsMap({
      rosterPayload: {
        students: [
          { userId: 10, fullName: 'Ada Lovelace' },
          { id: 11, user: { fullName: 'Grace Hopper' } },
          { id: null, fullName: 'Invalid' },
        ],
      },
      attendancePayload: {
        rows: [
          {
            studentId: 10,
            status: SESSION_ATTENDANCE_STATUS.LATE,
            notes: 'Joined late',
            joinedAt: '09:10',
          },
        ],
      },
    });

    expect(rowsMap).toEqual({
      10: {
        studentId: 10,
        fullName: 'Ada Lovelace',
        status: SESSION_ATTENDANCE_STATUS.LATE,
        notes: 'Joined late',
        joinedAt: '09:10',
        leftAt: undefined,
      },
      11: {
        studentId: 11,
        fullName: 'Grace Hopper',
        status: SESSION_ATTENDANCE_STATUS.PRESENT,
        notes: '',
        joinedAt: undefined,
        leftAt: undefined,
      },
    });
  });

  it('clones row maps and detects changed rows', () => {
    const original = {
      10: {
        status: SESSION_ATTENDANCE_STATUS.PRESENT,
        notes: '  same  ',
        joinedAt: '09:00',
      },
    };
    const cloned = cloneRowsMap(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[10]).not.toBe(original[10]);

    expect(
      hasSessionAttendanceChanges(
        { 10: { ...original[10], notes: 'same' } },
        original
      )
    ).toBe(false);
    expect(
      hasSessionAttendanceChanges(
        { 10: { ...original[10], status: SESSION_ATTENDANCE_STATUS.ABSENT } },
        original
      )
    ).toBe(true);
    expect(hasSessionAttendanceChanges({}, original)).toBe(false);
  });

  it('calculates session attendance stats and report filters', () => {
    const rows = [
      { studentId: 1, status: SESSION_ATTENDANCE_STATUS.PRESENT },
      { studentId: 2, status: SESSION_ATTENDANCE_STATUS.LATE },
      { studentId: 3, status: SESSION_ATTENDANCE_STATUS.ABSENT },
      { studentId: 4, status: SESSION_ATTENDANCE_STATUS.EXCUSED },
    ];

    expect(calculateSessionAttendanceStats(rows)).toEqual({
      present: 1,
      late: 1,
      absent: 1,
      excused: 1,
      total: 4,
      rate: 75,
    });
    expect(filterSessionAttendanceReportItems(rows, 'all')).toBe(rows);
    expect(filterSessionAttendanceReportItems(rows, SESSION_ATTENDANCE_STATUS.ABSENT)).toEqual([
      rows[2],
    ]);
  });

  it('updates row status and notes immutably', () => {
    const rowsMap = { 10: { studentId: 10, status: 'present', notes: '' } };

    expect(setSessionAttendanceRowStatus(rowsMap, 10, 'absent')).toEqual({
      10: { studentId: 10, status: 'absent', notes: '' },
    });
    expect(setSessionAttendanceRowNotes(rowsMap, 10, 'Needs follow-up')).toEqual({
      10: { studentId: 10, status: 'present', notes: 'Needs follow-up' },
    });
    expect(rowsMap).toEqual({ 10: { studentId: 10, status: 'present', notes: '' } });
  });
});

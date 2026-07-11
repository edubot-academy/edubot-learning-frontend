import { describe, expect, it } from 'vitest';
import {
  createBulkAttendanceUpdates,
  createBulkAttendanceUpdatesForStatus,
  getSelectedAttendanceStatusCounts,
  getSelectedSessions,
  getSelectedStudents,
  getSelectedStudentsToNotify,
  parseAttendanceCellKey,
} from './attendanceSelectionData';

const selectedCells = new Set(['1-10', '1-11', '2-10', '3-10']);
const students = [
  { id: 1, fullName: 'Ada Lovelace' },
  { id: 2, fullName: 'Grace Hopper' },
  { id: 4, fullName: 'Unselected' },
];
const sessions = [
  { id: 10, title: 'Session 1' },
  { id: 11, title: 'Session 2' },
  { id: 12, title: 'Unselected' },
];
const attendanceData = {
  1: { 10: 'present', 11: 'late' },
  2: { 10: 'absent' },
};

describe('attendance selection data utilities', () => {
  it('parses selected cell keys into numeric identifiers', () => {
    expect(parseAttendanceCellKey('12-34')).toEqual({ studentId: 12, sessionId: 34 });
  });

  it('counts selected cells by current status', () => {
    expect(getSelectedAttendanceStatusCounts({ selectedCells, attendanceData })).toEqual({
      present: 1,
      late: 1,
      absent: 1,
      excused: 0,
      not_scheduled: 1,
      total: 4,
    });
  });

  it('derives selected students and sessions from cell keys', () => {
    expect(getSelectedStudents(students, selectedCells)).toEqual([students[0], students[1]]);
    expect(getSelectedSessions(sessions, selectedCells)).toEqual([sessions[0], sessions[1]]);
  });

  it('creates bulk updates for selected cells', () => {
    expect(createBulkAttendanceUpdates(new Set(['1-10', '2-11']), 'excused')).toEqual([
      { studentId: 1, sessionId: 10, status: 'excused' },
      { studentId: 2, sessionId: 11, status: 'excused' },
    ]);
  });

  it('creates status-specific bulk updates', () => {
    expect(
      createBulkAttendanceUpdatesForStatus({
        selectedCells,
        attendanceData,
        fromStatus: 'absent',
        toStatus: 'present',
      })
    ).toEqual([{ studentId: 2, sessionId: 10, status: 'present' }]);
  });

  it('finds selected students with absent or late attendance', () => {
    expect(
      getSelectedStudentsToNotify({
        selectedStudents: students,
        selectedCells,
        attendanceData,
      })
    ).toEqual([students[0], students[1]]);
  });
});

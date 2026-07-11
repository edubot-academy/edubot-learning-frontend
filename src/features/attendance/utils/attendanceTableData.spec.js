import { describe, expect, it } from 'vitest';
import {
  calculateAttendanceTableStatistics,
  filterAndSortAttendanceTableStudents,
  getAttendanceTableStudentStats,
  getNextLegacyAttendanceStatus,
  getPaginatedAttendanceTableStudents,
  LEGACY_ATTENDANCE_STATUS_CYCLE,
} from './attendanceTableData';

const students = [
  { id: 1, fullName: 'Ada Lovelace', name: 'Ada' },
  { id: 2, fullName: 'Grace Hopper', name: 'Grace' },
  { id: 3, name: 'Alan Turing' },
];

const sessions = [
  { id: 10, title: 'Session 1' },
  { id: 11, title: 'Session 2' },
];

const attendanceData = {
  1: { 10: 'present', 11: 'late' },
  2: { 10: 'absent' },
};

describe('attendance table data utilities', () => {
  it('cycles legacy statuses in the existing order', () => {
    expect(LEGACY_ATTENDANCE_STATUS_CYCLE).toEqual([
      'present',
      'late',
      'absent',
      'not_scheduled',
    ]);
    expect(getNextLegacyAttendanceStatus('present')).toBe('late');
    expect(getNextLegacyAttendanceStatus('not_scheduled')).toBe('present');
  });

  it('filters by search query and status before sorting', () => {
    expect(
      filterAndSortAttendanceTableStudents({
        students,
        sessions,
        attendanceData,
        filterQuery: 'ada',
      })
    ).toEqual([students[0]]);

    expect(
      filterAndSortAttendanceTableStudents({
        students,
        sessions,
        attendanceData,
        statusFilter: 'not_scheduled',
        sortConfig: { key: 'name', direction: 'desc' },
      })
    ).toEqual([students[1], students[2]]);
  });

  it('returns the current page slice', () => {
    expect(
      getPaginatedAttendanceTableStudents({
        students,
        currentPage: 1,
        itemsPerPage: 2,
      })
    ).toEqual([students[2]]);
  });

  it('calculates legacy table totals and percentages', () => {
    expect(
      calculateAttendanceTableStatistics({
        students,
        sessions,
        attendanceData,
      })
    ).toEqual({
      totals: {
        present: 1,
        late: 1,
        absent: 1,
        not_scheduled: 3,
        excused: 0,
        total: 6,
      },
      percentages: {
        present: 16.666666666666664,
        late: 16.666666666666664,
        absent: 16.666666666666664,
        not_scheduled: 50,
        excused: 0,
      },
    });
  });

  it('calculates legacy student row stats using present over all sessions', () => {
    expect(
      getAttendanceTableStudentStats({
        student: students[0],
        sessions,
        attendanceData,
      })
    ).toEqual({
      studentStats: {
        present: 1,
        late: 1,
      },
      attendanceRate: 50,
    });
  });
});

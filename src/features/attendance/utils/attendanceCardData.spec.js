import { describe, expect, it } from 'vitest';
import {
  filterAttendanceCardStudents,
  getAttendanceCardStudentStats,
} from './attendanceCardData';

const students = [
  { id: 1, fullName: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, fullName: 'Grace Hopper', email: 'grace@example.com' },
  { id: 3, fullName: 'No Sessions', email: '' },
];

const sessions = [
  { id: 10, title: 'Session 1' },
  { id: 11, title: 'Session 2' },
];

const attendanceData = {
  1: { 10: 'present', 11: 'late' },
  2: { 10: 'absent' },
};

describe('attendance card data utilities', () => {
  it('filters students by full name or email search', () => {
    expect(
      filterAttendanceCardStudents({
        students,
        sessions,
        attendanceData,
        searchQuery: 'ada',
      })
    ).toEqual([students[0]]);

    expect(
      filterAttendanceCardStudents({
        students,
        sessions,
        attendanceData,
        searchQuery: 'grace@example',
      })
    ).toEqual([students[1]]);
  });

  it('filters students by matching any session status', () => {
    expect(
      filterAttendanceCardStudents({
        students,
        sessions,
        attendanceData,
        statusFilter: 'late',
      })
    ).toEqual([students[0]]);

    expect(
      filterAttendanceCardStudents({
        students,
        sessions,
        attendanceData,
        statusFilter: 'not_scheduled',
      })
    ).toEqual([students[1], students[2]]);
  });

  it('calculates per-student card stats with scheduled-rate denominator', () => {
    expect(
      getAttendanceCardStudentStats({
        student: students[0],
        sessions,
        attendanceData,
      })
    ).toEqual({
      present: 1,
      late: 1,
      absent: 0,
      excused: 0,
      not_scheduled: 0,
      total: 2,
      attendanceRate: 100,
    });

    expect(
      getAttendanceCardStudentStats({
        student: students[1],
        sessions,
        attendanceData,
      })
    ).toEqual({
      present: 0,
      late: 0,
      absent: 1,
      excused: 0,
      not_scheduled: 1,
      total: 2,
      attendanceRate: 0,
    });
  });
});

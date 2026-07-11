import { describe, expect, it } from 'vitest';
import {
  hasValidAdminAttendanceUpdateShape,
  hasValidGroupAttendanceUpdateShape,
  isValidOverviewStatus,
  validateAttendanceData,
} from './attendanceValidation';

describe('attendance validation helpers', () => {
  it('recognizes overview attendance statuses including not_scheduled', () => {
    expect(isValidOverviewStatus('present')).toBe(true);
    expect(isValidOverviewStatus('not_scheduled')).toBe(true);
    expect(isValidOverviewStatus('unknown')).toBe(false);
  });

  it('validates group and admin update shapes', () => {
    expect(
      hasValidGroupAttendanceUpdateShape({
        studentId: 1,
        sessionId: 2,
        status: 'excused',
      })
    ).toBe(true);
    expect(
      hasValidGroupAttendanceUpdateShape({
        studentId: 1,
        sessionId: 2,
        status: 'bad',
      })
    ).toBe(false);
    expect(
      hasValidAdminAttendanceUpdateShape({
        groupId: 3,
        studentId: 1,
        sessionId: 2,
        status: 'present',
      })
    ).toBe(true);
    expect(
      hasValidAdminAttendanceUpdateShape({
        studentId: 1,
        sessionId: 2,
        status: 'present',
      })
    ).toBe(false);
  });

  it('validates complete attendance payloads', () => {
    expect(
      validateAttendanceData({
        students: [{ id: 1, name: 'Ada' }],
        sessions: [{ id: 10, date: '2026-07-01' }],
        attendanceData: {
          1: {
            10: 'present',
          },
        },
      })
    ).toEqual({ isValid: true, errors: [], warnings: [] });
  });

  it('reports structural errors and dangling attendance references', () => {
    const result = validateAttendanceData({
      students: [{ id: 1, name: '' }],
      sessions: [{ id: 10 }],
      attendanceData: {
        2: {
          11: 'bad',
        },
      },
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Student at index 0 is missing valid name',
        'Invalid status "bad" for student 2, session 11',
      ])
    );
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        'Session at index 0 has no date or session index',
        "Attendance data contains student ID 2 that doesn't exist in students list",
        "Attendance data contains session ID 11 that doesn't exist in sessions list",
      ])
    );
  });
});

import { describe, expect, it, vi } from 'vitest';
import {
  getAttendanceSessionTitle,
  getAttendanceStudentInitials,
} from './attendanceDisplayData';

const t = vi.fn((key, values) => `${key}:${values.id}`);

describe('attendance display data utilities', () => {
  it('returns the session title before falling back to the translated id label', () => {
    expect(getAttendanceSessionTitle(t, { title: 'Week 1', sessionIndex: 1 })).toBe('Week 1');
    expect(getAttendanceSessionTitle(t, { sessionIndex: 2, id: 20 })).toBe(
      'attendance.fallbacks.sessionWithId:2'
    );
    expect(getAttendanceSessionTitle(t, { id: 30 })).toBe(
      'attendance.fallbacks.sessionWithId:30'
    );
  });

  it('supports legacy fallback ids where components only used sessionIndex', () => {
    expect(
      getAttendanceSessionTitle(t, { sessionIndex: 4, id: 40 }, { fallbackId: 4 })
    ).toBe('attendance.fallbacks.sessionWithId:4');
  });

  it('builds student initials from a display name or fallback', () => {
    expect(getAttendanceStudentInitials('Ada Lovelace')).toBe('AL');
    expect(getAttendanceStudentInitials('', 'Unknown Student')).toBe('US');
    expect(getAttendanceStudentInitials('  Grace   Hopper  ')).toBe('GH');
  });
});

import { describe, expect, it } from 'vitest';
import {
  getAttendanceStatusLabel,
  getAttendanceStatusTranslationKey,
} from './attendanceStatusData';

describe('attendance status data utilities', () => {
  it('maps API status values to translation key suffixes', () => {
    expect(getAttendanceStatusTranslationKey('not_scheduled')).toBe('notScheduled');
    expect(getAttendanceStatusTranslationKey('present')).toBe('present');
  });

  it('builds translated status labels', () => {
    const t = (key, options) => ({ key, options });

    expect(getAttendanceStatusLabel(t, 'not_scheduled', { defaultValue: 'fallback' })).toEqual({
      key: 'attendance.status.notScheduled',
      options: { defaultValue: 'fallback' },
    });
  });
});

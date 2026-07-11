import { describe, expect, it } from 'vitest';
import {
  formatAttendanceSessionDate,
  SHORT_ATTENDANCE_DATE_FORMAT,
  SUMMARY_ATTENDANCE_DATE_FORMAT,
} from './attendanceDateData';

describe('attendance date data utilities', () => {
  it('returns configured fallbacks for missing and invalid dates', () => {
    expect(
      formatAttendanceSessionDate(null, {
        missingFallback: 'No date',
        invalidFallback: 'Unknown',
      })
    ).toBe('No date');

    expect(
      formatAttendanceSessionDate('not-a-date', {
        missingFallback: 'No date',
        invalidFallback: 'Unknown',
      })
    ).toBe('Unknown');
  });

  it('formats short and summary attendance dates', () => {
    expect(
      formatAttendanceSessionDate('2026-07-11T10:00:00Z', {
        language: 'en-US',
        formatOptions: SHORT_ATTENDANCE_DATE_FORMAT,
      })
    ).toBe('Jul 11');

    expect(
      formatAttendanceSessionDate('2026-07-11T10:00:00Z', {
        language: 'en-US',
        formatOptions: SUMMARY_ATTENDANCE_DATE_FORMAT,
      })
    ).toBe('Jul 11, 2026');
  });
});

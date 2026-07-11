import { describe, expect, it } from 'vitest';
import {
  cloneAttendanceData,
  createAttendanceMatrixFromSessionResponses,
  normalizeLegacyAttendanceTableList,
  normalizeLegacySessionAttendanceItems,
} from './attendanceTableLoadData';

describe('attendance table load data utilities', () => {
  it('normalizes legacy table collection responses without changing precedence', () => {
    expect(normalizeLegacyAttendanceTableList([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(normalizeLegacyAttendanceTableList({ items: [{ id: 2 }] })).toEqual([{ id: 2 }]);
    expect(normalizeLegacyAttendanceTableList({ data: [{ id: 3 }] })).toEqual([{ id: 3 }]);
    expect(normalizeLegacyAttendanceTableList({ rows: [{ id: 4 }] })).toEqual([]);
    expect(normalizeLegacyAttendanceTableList(null)).toEqual([]);
  });

  it('normalizes session attendance rows using the legacy row precedence', () => {
    expect(normalizeLegacySessionAttendanceItems([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(normalizeLegacySessionAttendanceItems({ items: [{ id: 2 }] })).toEqual([{ id: 2 }]);
    expect(normalizeLegacySessionAttendanceItems({ rows: [{ id: 3 }] })).toEqual([{ id: 3 }]);
    expect(normalizeLegacySessionAttendanceItems({ data: [{ id: 4 }] })).toEqual([{ id: 4 }]);
    expect(normalizeLegacySessionAttendanceItems(null)).toEqual([]);
  });

  it('consolidates per-session attendance responses into the table matrix', () => {
    expect(
      createAttendanceMatrixFromSessionResponses({
        sessions: [{ id: 10 }, { id: 11 }],
        attendanceResults: [
          { items: [{ studentId: 1, status: 'present' }] },
          { rows: [{ userId: 2, status: 'absent' }, { status: 'late' }] },
        ],
      })
    ).toEqual({
      1: { 10: 'present' },
      2: { 11: 'absent' },
    });
  });

  it('uses caller-provided attendance item normalization when supplied', () => {
    expect(
      createAttendanceMatrixFromSessionResponses({
        sessions: [{ id: 20 }],
        attendanceResults: [{ students: [{ studentId: 5, status: 'late' }] }],
        normalizeAttendanceItems: (payload) => payload.students || [],
      })
    ).toEqual({
      5: { 20: 'late' },
    });
  });

  it('deep-clones the nested attendance data map one level down', () => {
    const original = { 1: { 10: 'present' } };
    const cloned = cloneAttendanceData(original);

    cloned[1][10] = 'absent';

    expect(original[1][10]).toBe('present');
    expect(cloned[1][10]).toBe('absent');
  });
});

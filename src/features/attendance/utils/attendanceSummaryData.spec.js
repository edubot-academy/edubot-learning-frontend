import { describe, expect, it } from 'vitest';
import {
  calculateAttendanceSummaryStatistics,
  categorizeStudentPerformance,
  createEmptyAttendanceSummaryStatistics,
  getSessionPerformanceAnalysis,
} from './attendanceSummaryData';

const students = [
  { id: 1, fullName: 'Ada Lovelace' },
  { id: 2, fullName: 'Grace Hopper' },
  { id: 3, fullName: 'Katherine Johnson' },
  { id: 4, fullName: 'No Data' },
];

const sessions = [
  { id: 10, title: 'Session 1' },
  { id: 11, title: 'Session 2' },
];

describe('attendance summary data utilities', () => {
  it('creates empty summary statistics', () => {
    expect(createEmptyAttendanceSummaryStatistics()).toEqual({
      totals: {
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        not_scheduled: 0,
        total: 0,
      },
      percentages: {
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        not_scheduled: 0,
      },
      attendanceRate: 0,
      scheduledTotal: 0,
      studentStats: {},
      sessionStats: {},
      trends: null,
    });
  });

  it('calculates scheduled attendance rates while retaining not scheduled totals', () => {
    const statistics = calculateAttendanceSummaryStatistics({
      students,
      sessions,
      attendanceData: {
        1: { 10: 'present', 11: 'late' },
        2: { 10: 'absent', 11: 'excused' },
        3: { 10: 'present' },
      },
      previousPeriodData: { attendanceRate: 50 },
      showTrends: true,
    });

    expect(statistics.totals).toEqual({
      present: 2,
      late: 1,
      absent: 1,
      excused: 1,
      not_scheduled: 3,
      total: 8,
    });
    expect(statistics.scheduledTotal).toBe(5);
    expect(statistics.attendanceRate).toBe(60);
    expect(statistics.percentages.present).toBe(40);
    expect(statistics.percentages.not_scheduled).toBe(37.5);
    expect(statistics.studentStats[1]).toMatchObject({
      present: 1,
      late: 1,
      attendanceRate: 100,
      scheduledCount: 2,
    });
    expect(statistics.studentStats[4].scheduledCount).toBe(0);
    expect(statistics.sessionStats[10]).toMatchObject({
      attendanceRate: 66.66666666666666,
      scheduledCount: 3,
    });
    expect(statistics.trends.attendanceRate).toEqual({
      current: 60,
      previous: 50,
      change: 10,
      direction: 'up',
    });
  });

  it('categorizes students by attendance performance', () => {
    const categories = categorizeStudentPerformance(students, {
      1: { attendanceRate: 100, scheduledCount: 2 },
      2: { attendanceRate: 80, scheduledCount: 2 },
      3: { attendanceRate: 50, scheduledCount: 2 },
      4: { attendanceRate: 0, scheduledCount: 0 },
    });

    expect(categories.excellent.students).toEqual([students[0]]);
    expect(categories.good.students).toEqual([students[1]]);
    expect(categories.fair.students).toEqual([students[2]]);
    expect(categories.noData.students).toEqual([students[3]]);
  });

  it('merges and sorts session performance analysis', () => {
    expect(
      getSessionPerformanceAnalysis(sessions, {
        10: { attendanceRate: 50, scheduledCount: 2 },
        11: { attendanceRate: 100, scheduledCount: 2 },
      })
    ).toEqual([
      { id: 11, title: 'Session 2', attendanceRate: 100, scheduledCount: 2 },
      { id: 10, title: 'Session 1', attendanceRate: 50, scheduledCount: 2 },
    ]);

    expect(getSessionPerformanceAnalysis([{ id: 99 }], {})).toEqual([
      {
        id: 99,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        not_scheduled: 0,
        attendanceRate: 0,
        scheduledCount: 0,
      },
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  addPendingAttendanceUpdates,
  applyAttendanceUpdates,
  calculateAttendanceStatistics,
  createAttendanceDataFilters,
  createAttendanceTableFilters,
  createEmptyAttendanceState,
  filterAttendanceData,
  getAttendanceOverviewEndpoint,
  getAttendanceOverviewSearchParams,
  getAttendanceStatus,
  getAttendanceUpdateKey,
  getAttendanceUpdateKeys,
  hasActiveAttendanceFilters,
  normalizeAttendanceData,
  removePendingAttendanceUpdate,
  setAttendanceFilter,
  setAttendanceRecord,
} from './attendanceData';

const students = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
];

const sessions = [
  { id: 10, title: 'Session 1' },
  { id: 11, title: 'Session 2' },
];

describe('attendance data utilities', () => {
  it('creates fresh default state and filter objects', () => {
    const firstState = createEmptyAttendanceState();
    const secondState = createEmptyAttendanceState();

    expect(firstState).toEqual({
      students: [],
      sessions: [],
      attendanceData: {},
      loading: false,
      error: null,
      lastUpdated: null,
    });
    expect(firstState).not.toBe(secondState);
    expect(firstState.students).not.toBe(secondState.students);

    expect(createAttendanceDataFilters()).toEqual({
      statusFilter: 'all',
      searchQuery: '',
      dateRange: null,
    });
    expect(createAttendanceTableFilters()).toEqual({
      statusFilter: 'all',
      searchQuery: '',
      dateRange: null,
      sessionFilter: 'all',
    });
  });

  it('updates filter objects and detects active filters', () => {
    const defaultFilters = createAttendanceTableFilters();
    const updated = setAttendanceFilter(defaultFilters, 'searchQuery', 'ada');

    expect(updated).toEqual({
      statusFilter: 'all',
      searchQuery: 'ada',
      dateRange: null,
      sessionFilter: 'all',
    });
    expect(defaultFilters.searchQuery).toBe('');
    expect(hasActiveAttendanceFilters(defaultFilters)).toBe(false);
    expect(hasActiveAttendanceFilters(updated)).toBe(true);
    expect(hasActiveAttendanceFilters({ ...defaultFilters, statusFilter: 'present' })).toBe(true);
    expect(hasActiveAttendanceFilters({ ...defaultFilters, dateRange: { start: '2026-07-01' } })).toBe(true);
    expect(hasActiveAttendanceFilters({ ...defaultFilters, sessionFilter: 10 })).toBe(true);
  });

  it('builds legacy overview endpoints and search params', () => {
    expect(getAttendanceOverviewEndpoint({ groupId: 7, adminMode: false })).toBe(
      '/api/groups/7/attendance-overview'
    );
    expect(getAttendanceOverviewEndpoint({ groupId: 7, adminMode: true })).toBe(
      '/api/admin/groups/7/attendance-overview'
    );

    expect(
      getAttendanceOverviewSearchParams({
        includeUnscheduled: false,
        dateRange: { start: '2026-07-01', end: '2026-07-31' },
      }).toString()
    ).toBe('includeUnscheduled=false&startDate=2026-07-01&endDate=2026-07-31');
  });

  it('normalizes nested attendance records defensively', () => {
    const raw = {
      1: { 10: 'present' },
      2: null,
    };

    expect(normalizeAttendanceData(raw)).toEqual({
      1: { 10: 'present' },
      2: {},
    });
  });

  it('sets and applies attendance updates immutably', () => {
    const original = { 1: { 10: 'present' } };
    const updated = setAttendanceRecord(original, 1, 11, 'late');

    expect(updated).toEqual({ 1: { 10: 'present', 11: 'late' } });
    expect(original).toEqual({ 1: { 10: 'present' } });

    expect(
      applyAttendanceUpdates(updated, [
        { studentId: 2, sessionId: 10, status: 'absent' },
        { studentId: 2, sessionId: 11, status: 'excused' },
      ])
    ).toEqual({
      1: { 10: 'present', 11: 'late' },
      2: { 10: 'absent', 11: 'excused' },
    });
  });

  it('returns not_scheduled for missing records', () => {
    expect(getAttendanceStatus({ 1: { 10: 'present' } }, 1, 11)).toBe('not_scheduled');
  });

  it('calculates totals, percentages, and attendance rates', () => {
    const statistics = calculateAttendanceStatistics({
      students,
      sessions,
      attendanceData: {
        1: { 10: 'present', 11: 'late' },
        2: { 10: 'absent' },
      },
    });

    expect(statistics.totals).toEqual({
      present: 1,
      late: 1,
      absent: 1,
      not_scheduled: 1,
      excused: 0,
      total: 4,
    });
    expect(statistics.percentages.present).toBe(25);
    expect(statistics.studentStats[1].attendanceRate).toBe(100);
    expect(statistics.studentStats[2].attendanceRate).toBe(0);
    expect(statistics.sessionStats[10].attendanceRate).toBe(50);
    expect(statistics.sessionStats[11].attendanceRate).toBe(50);
  });

  it('filters students by search query and status', () => {
    const data = {
      students,
      sessions,
      attendanceData: {
        1: { 10: 'present' },
        2: { 10: 'absent' },
      },
    };

    expect(filterAttendanceData(data, { searchQuery: 'ada', statusFilter: 'all' }).students).toEqual([
      students[0],
    ]);
    expect(filterAttendanceData(data, { searchQuery: '', statusFilter: 'absent' }).students).toEqual([
      students[1],
    ]);
  });

  it('builds and updates pending attendance update keys immutably', () => {
    expect(getAttendanceUpdateKey(1, 10)).toBe('1-10');
    expect(
      getAttendanceUpdateKeys([
        { studentId: 1, sessionId: 10 },
        { studentId: 2, sessionId: 11 },
      ])
    ).toEqual(['1-10', '2-11']);

    const original = new Set(['existing']);
    const withPending = addPendingAttendanceUpdates(original, ['1-10', '2-11']);

    expect([...original]).toEqual(['existing']);
    expect(withPending.has('existing')).toBe(true);
    expect(withPending.has('1-10')).toBe(true);
    expect(withPending.has('2-11')).toBe(true);

    const removed = removePendingAttendanceUpdate(withPending, '1-10');
    expect(removed.has('1-10')).toBe(false);
    expect(withPending.has('1-10')).toBe(true);
  });
});

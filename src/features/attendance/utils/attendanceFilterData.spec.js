import { describe, expect, it } from 'vitest';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
  createAttendanceRateRanges,
  createAttendanceStatusOptions,
  createEmptyAttendanceFilters,
  getActiveAttendanceDashboardFilterCount,
  getAttendanceQuickFilterClasses,
  hasActiveAttendanceDashboardFilters,
  setAttendanceFiltersValue,
} from './attendanceFilterData';
import { getAttendanceStatusTranslationKey } from './attendanceStatusData';

const t = (key) => key;

describe('attendance filter data utilities', () => {
  it('builds status translation keys and filter option lists', () => {
    expect(getAttendanceStatusTranslationKey('not_scheduled')).toBe('notScheduled');
    expect(getAttendanceStatusTranslationKey('present')).toBe('present');

    expect(createAttendanceStatusOptions(t)).toEqual([
      { value: 'all', label: 'attendance.filters.all', color: 'gray' },
      { value: 'present', label: 'attendance.status.present', color: 'green' },
      { value: 'late', label: 'attendance.status.late', color: 'amber' },
      { value: 'absent', label: 'attendance.status.absent', color: 'red' },
      { value: 'excused', label: 'attendance.status.excused', color: 'blue' },
      {
        value: 'not_scheduled',
        label: 'attendance.status.notScheduled',
        color: 'gray',
      },
    ]);

    expect(createAttendanceRateRanges(t)).toEqual([
      { value: 'all', label: 'attendance.filters.all' },
      { value: 'perfect', label: '100%', min: 100, max: 100 },
      { value: 'excellent', label: '90-100%', min: 90, max: 100 },
      { value: 'good', label: '75-90%', min: 75, max: 90 },
      { value: 'fair', label: '50-75%', min: 50, max: 75 },
      { value: 'poor', label: 'attendance.filters.rateBelow50', min: 0, max: 50 },
    ]);
  });

  it('creates and updates filter state immutably', () => {
    const defaultFilters = createEmptyAttendanceFilters();
    expect(defaultFilters).toEqual({
      searchQuery: '',
      statusFilter: 'all',
      dateRange: 'all',
      attendanceRateFilter: 'all',
      sessionFilter: 'all',
      customStartDate: '',
      customEndDate: '',
    });

    const updated = setAttendanceFiltersValue(
      {
        ...defaultFilters,
        customStartDate: '2026-07-01',
        customEndDate: '2026-07-31',
      },
      'dateRange',
      'this_week'
    );

    expect(updated).toEqual({
      ...defaultFilters,
      dateRange: 'this_week',
      customStartDate: '',
      customEndDate: '',
    });
    expect(defaultFilters.dateRange).toBe('all');
  });

  it('detects active filters and counts active fields', () => {
    const defaultFilters = createEmptyAttendanceFilters();
    expect(hasActiveAttendanceDashboardFilters(defaultFilters)).toBe(false);
    expect(getActiveAttendanceDashboardFilterCount(defaultFilters)).toBe(0);

    const activeFilters = {
      ...defaultFilters,
      searchQuery: 'ada',
      statusFilter: SESSION_ATTENDANCE_STATUS.ABSENT,
      dateRange: 'custom',
      customStartDate: '2026-07-01',
      attendanceRateFilter: 'poor',
      sessionFilter: 10,
    };

    expect(hasActiveAttendanceDashboardFilters(activeFilters)).toBe(true);
    expect(getActiveAttendanceDashboardFilterCount(activeFilters)).toBe(6);
  });

  it('returns quick-filter classes for active and inactive filters', () => {
    const inactiveClasses = getAttendanceQuickFilterClasses(createEmptyAttendanceFilters());
    expect(inactiveClasses.absent).toContain('hover:bg-red-50');
    expect(inactiveClasses.present).toContain('hover:bg-green-50');

    const activeClasses = getAttendanceQuickFilterClasses({
      statusFilter: SESSION_ATTENDANCE_STATUS.ABSENT,
      attendanceRateFilter: 'poor',
      dateRange: 'this_week',
    });

    expect(activeClasses.absent).toContain('bg-red-50');
    expect(activeClasses.poor).toContain('bg-amber-50');
    expect(activeClasses.thisWeek).toContain('bg-blue-50');
  });
});

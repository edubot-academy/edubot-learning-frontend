import { beforeEach, describe, expect, it, vi } from 'vitest';
import { attendanceCache } from './attendanceCache';

describe('attendanceCache', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('generates stable cache keys from group and filters', () => {
    expect(
      attendanceCache.generateKey(7, {
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        includeUnscheduled: false,
      })
    ).toBe('attendance_7_start_2026-07-01_end_2026-07-31_unsched_false');
  });

  it('stores and retrieves cache data before ttl expiry', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    attendanceCache.set('group_1', { students: [{ id: 1 }] }, 5000);

    vi.spyOn(Date, 'now').mockReturnValue(2000);

    expect(attendanceCache.get('group_1')).toEqual({ students: [{ id: 1 }] });
  });

  it('clears expired cache data', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    attendanceCache.set('group_1', { students: [] }, 100);

    vi.spyOn(Date, 'now').mockReturnValue(1200);

    expect(attendanceCache.get('group_1')).toBeNull();
    expect(localStorage.getItem('attendance_cache_group_1')).toBeNull();
  });

  it('clears corrupt cache JSON', () => {
    localStorage.setItem('attendance_cache_group_1', '{bad json');

    expect(attendanceCache.get('group_1')).toBeNull();
    expect(localStorage.getItem('attendance_cache_group_1')).toBeNull();
  });

  it('clears only attendance cache keys', () => {
    localStorage.setItem('attendance_cache_group_1', '{}');
    localStorage.setItem('attendance_cache_group_2', '{}');
    localStorage.setItem('other_key', 'kept');

    attendanceCache.clearAll();

    expect(localStorage.getItem('attendance_cache_group_1')).toBeNull();
    expect(localStorage.getItem('attendance_cache_group_2')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('kept');
  });
});

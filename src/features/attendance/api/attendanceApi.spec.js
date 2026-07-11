import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@shared/api/client';
import {
  adminExportAttendanceData,
  adminUpdateAttendance,
  exportAttendanceData,
  fetchAdminAttendanceOverview,
  fetchAttendanceOverview,
  fetchAttendanceStatistics,
  fetchAttendanceTrends,
  fetchStudentAttendanceHistory,
  updateAttendance,
} from './attendanceApi';

vi.mock('@shared/api/client', () => ({
  default: {
    request: vi.fn(),
    get: vi.fn(),
  },
}));

describe('attendanceApi requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.request.mockResolvedValue({ data: { ok: true } });
    api.get.mockResolvedValue({ data: new Blob(['csv']) });
  });

  it('fetches group attendance overview with the expected params', async () => {
    await expect(
      fetchAttendanceOverview(12, {
        includeUnscheduled: false,
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        sessionIds: [1, 2],
      })
    ).resolves.toEqual({ ok: true });

    expect(api.request).toHaveBeenCalledWith({
      url: '/groups/12/attendance-overview',
      method: 'GET',
      params: {
        includeUnscheduled: 'false',
        includeStats: 'true',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        sessionIds: '1,2',
      },
    });
  });

  it('fetches admin overview with group filters', async () => {
    await fetchAdminAttendanceOverview({ groupIds: [7, 8], includeStats: false });

    expect(api.request).toHaveBeenCalledWith({
      url: '/admin/attendance-overview',
      method: 'GET',
      params: {
        includeUnscheduled: 'true',
        includeStats: 'false',
        groupIds: '7,8',
      },
    });
  });

  it('sends validated group attendance updates as PATCH data', async () => {
    const updates = [{ studentId: 1, sessionId: 2, status: 'present' }];

    await updateAttendance(9, updates);

    expect(api.request).toHaveBeenCalledWith({
      url: '/groups/9/attendance',
      method: 'PATCH',
      data: { updates },
    });
  });

  it('sends validated admin attendance updates as PATCH data', async () => {
    const updates = [{ groupId: 3, studentId: 1, sessionId: 2, status: 'excused' }];

    await adminUpdateAttendance(updates);

    expect(api.request).toHaveBeenCalledWith({
      url: '/admin/attendance',
      method: 'PATCH',
      data: { updates },
    });
  });

  it('fetches group statistics with comparison params', async () => {
    await fetchAttendanceStatistics(5, { includeTrends: true, includeComparison: true });

    expect(api.request).toHaveBeenCalledWith({
      url: '/groups/5/attendance-statistics',
      method: 'GET',
      params: {
        includeTrends: 'true',
        includeComparison: 'true',
      },
    });
  });

  it('exports group attendance as a blob request', async () => {
    await exportAttendanceData(5, { format: 'excel', studentIds: [1, 2] });

    expect(api.get).toHaveBeenCalledWith('/groups/5/attendance-export', {
      params: {
        format: 'excel',
        includeUnscheduled: 'true',
        studentIds: '1,2',
      },
      responseType: 'blob',
    });
  });

  it('exports admin attendance as a blob request', async () => {
    await adminExportAttendanceData({ groupIds: [1], includeUnscheduled: false });

    expect(api.get).toHaveBeenCalledWith('/admin/attendance-export', {
      params: {
        format: 'csv',
        includeUnscheduled: 'false',
        groupIds: '1',
      },
      responseType: 'blob',
    });
  });

  it('fetches student history and trend endpoints with params', async () => {
    await fetchStudentAttendanceHistory(11, { groupId: 2, includeDetails: true });
    await fetchAttendanceTrends(null, { period: 'weekly', includeComparison: true });

    expect(api.request).toHaveBeenNthCalledWith(1, {
      url: '/students/11/attendance-history',
      method: 'GET',
      params: {
        groupId: 2,
        includeDetails: 'true',
      },
    });
    expect(api.request).toHaveBeenNthCalledWith(2, {
      url: '/admin/attendance-trends',
      method: 'GET',
      params: {
        period: 'weekly',
        includeComparison: 'true',
      },
    });
  });
});

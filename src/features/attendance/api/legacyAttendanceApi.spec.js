import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@shared/api/client';
import { fetchLegacyAttendanceOverview, updateLegacyAttendance } from './legacyAttendanceApi';

vi.mock('@shared/api/client', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('legacyAttendanceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { students: [] } });
    api.patch.mockResolvedValue({ data: { ok: true } });
  });

  it('fetches the legacy overview endpoint with existing query params', async () => {
    const signal = new AbortController().signal;

    await expect(
      fetchLegacyAttendanceOverview({
        groupId: 7,
        adminMode: true,
        includeUnscheduled: false,
        dateRange: { start: '2026-07-01', end: '2026-07-31' },
        signal,
      })
    ).resolves.toEqual({ students: [] });

    expect(api.get).toHaveBeenCalledWith('/api/admin/groups/7/attendance-overview', {
      params: expect.any(URLSearchParams),
      signal,
    });
    expect(api.get.mock.calls[0][1].params.toString()).toBe(
      'includeUnscheduled=false&startDate=2026-07-01&endDate=2026-07-31'
    );
  });

  it('patches legacy attendance updates without pre-validating payload shape', async () => {
    const updates = [{ studentId: 1, sessionId: 2, status: 'custom_status' }];

    await expect(updateLegacyAttendance(9, updates)).resolves.toEqual({ ok: true });

    expect(api.patch).toHaveBeenCalledWith('/groups/9/attendance', { updates });
  });
});

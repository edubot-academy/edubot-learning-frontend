import { describe, expect, it } from 'vitest';
import {
  getAdminExportParams,
  getAdminOverviewParams,
  getAdminStatisticsParams,
  getAttendanceTrendParams,
  getGroupExportParams,
  getGroupOverviewParams,
  getGroupStatisticsParams,
  getStudentHistoryParams,
} from './attendanceParams';

describe('attendance param helpers', () => {
  it('builds group overview params and drops admin-only filters', () => {
    expect(
      getGroupOverviewParams({
        groupIds: [1],
        studentIds: [2],
        includeUnscheduled: false,
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        sessionIds: [10, 11],
      })
    ).toEqual({
      includeUnscheduled: 'false',
      includeStats: 'true',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      sessionIds: '10,11',
    });
  });

  it('builds admin overview params with group filters', () => {
    expect(getAdminOverviewParams({ groupIds: [1, 2], includeStats: false })).toEqual({
      includeUnscheduled: 'true',
      includeStats: 'false',
      groupIds: '1,2',
    });
  });

  it('builds statistics params for group and admin endpoints', () => {
    expect(
      getGroupStatisticsParams({
        groupIds: [1],
        sessionIds: [2],
        includeTrends: true,
        includeComparison: true,
      })
    ).toEqual({
      includeTrends: 'true',
      includeComparison: 'true',
    });

    expect(getAdminStatisticsParams({ groupIds: [1], includeComparison: true })).toEqual({
      groupIds: '1',
      includeComparison: 'true',
    });
  });

  it('builds export params for group and admin endpoints', () => {
    expect(getGroupExportParams({ groupIds: [1], format: 'excel', studentIds: [2] })).toEqual({
      format: 'excel',
      includeUnscheduled: 'true',
      studentIds: '2',
    });

    expect(getAdminExportParams({ groupIds: [1], includeUnscheduled: false })).toEqual({
      format: 'csv',
      includeUnscheduled: 'false',
      groupIds: '1',
    });
  });

  it('builds student history and trend params', () => {
    expect(getStudentHistoryParams({ groupId: 2, includeDetails: true })).toEqual({
      groupId: 2,
      includeDetails: 'true',
    });

    expect(getAttendanceTrendParams({ period: 'weekly', includeComparison: true })).toEqual({
      period: 'weekly',
      includeComparison: 'true',
    });
  });
});

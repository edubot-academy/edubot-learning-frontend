import api from '@shared/api/client';
import {
  getAttendanceOverviewEndpoint,
  getAttendanceOverviewSearchParams,
} from '../utils/attendanceData';

export const fetchLegacyAttendanceOverview = async ({
  groupId,
  adminMode = false,
  includeUnscheduled = true,
  dateRange = null,
  signal,
}) => {
  const response = await api.get(getAttendanceOverviewEndpoint({ groupId, adminMode }), {
    params: getAttendanceOverviewSearchParams({ includeUnscheduled, dateRange }),
    signal,
  });

  return response.data;
};

export const updateLegacyAttendance = async (groupId, updates) => {
  const response = await api.patch(`/groups/${groupId}/attendance`, { updates });
  return response.data;
};

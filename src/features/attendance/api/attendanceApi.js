import api from '@shared/api/client';
import {
  hasValidAdminAttendanceUpdateShape,
  hasValidGroupAttendanceUpdateShape,
} from './attendanceValidation';
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

export { attendanceCache } from './attendanceCache';
export { downloadAttendanceFile } from './attendanceDownload';
export { validateAttendanceData } from './attendanceValidation';

/**
 * Attendance API Service
 * Handles all attendance-related API calls for both admin and instructor dashboards
 */

const requestData = async (config) => {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (error) {
    console.error(`API request failed: ${config.url}`, error);
    throw error;
  }
};

const getData = (url, params) => requestData({ url, method: 'GET', params });

const patchData = (url, data) => requestData({ url, method: 'PATCH', data });

/**
 * Get attendance overview for a group
 * @param {number|string} groupId - Group ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attendance overview data
 */
export const fetchAttendanceOverview = async (groupId, options = {}) => {
  return getData(`/groups/${groupId}/attendance-overview`, getGroupOverviewParams(options));
};

/**
 * Get attendance overview for admin (multiple groups)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Multi-group attendance data
 */
export const fetchAdminAttendanceOverview = async (options = {}) => {
  return getData('/admin/attendance-overview', getAdminOverviewParams(options));
};

/**
 * Update attendance records
 * @param {number|string} groupId - Group ID
 * @param {Array} updates - Array of attendance updates
 * @returns {Promise<Object>} Updated attendance data
 */
export const updateAttendance = async (groupId, updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('Updates must be a non-empty array');
  }

  const validUpdates = updates.every(hasValidGroupAttendanceUpdateShape);

  if (!validUpdates) {
    throw new Error('Invalid update format. Each update must include studentId, sessionId, and status');
  }

  return patchData(`/groups/${groupId}/attendance`, { updates });
};

/**
 * Bulk update attendance for admin
 * @param {Array} updates - Array of attendance updates with groupId
 * @returns {Promise<Object>} Updated attendance data
 */
export const adminUpdateAttendance = async (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('Updates must be a non-empty array');
  }

  const validUpdates = updates.every(hasValidAdminAttendanceUpdateShape);

  if (!validUpdates) {
    throw new Error('Invalid update format. Each update must include groupId, studentId, sessionId, and status');
  }

  return patchData('/admin/attendance', { updates });
};

/**
 * Get attendance statistics for a group
 * @param {number|string} groupId - Group ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attendance statistics
 */
export const fetchAttendanceStatistics = async (groupId, options = {}) => {
  return getData(`/groups/${groupId}/attendance-statistics`, getGroupStatisticsParams(options));
};

/**
 * Get attendance statistics for admin
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Admin attendance statistics
 */
export const fetchAdminAttendanceStatistics = async (options = {}) => {
  return getData('/admin/attendance-statistics', getAdminStatisticsParams(options));
};

/**
 * Export attendance data
 * @param {number|string} groupId - Group ID
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} Export file data
 */
export const exportAttendanceData = async (groupId, options = {}) => {
  try {
    const response = await api.get(`/groups/${groupId}/attendance-export`, {
      params: getGroupExportParams(options),
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

/**
 * Export attendance data for admin
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} Export file data
 */
export const adminExportAttendanceData = async (options = {}) => {
  try {
    const response = await api.get('/admin/attendance-export', {
      params: getAdminExportParams(options),
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Admin export failed:', error);
    throw error;
  }
};

/**
 * Get attendance history for a specific student
 * @param {number|string} studentId - Student ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Student attendance history
 */
export const fetchStudentAttendanceHistory = async (studentId, options = {}) => {
  return getData(`/students/${studentId}/attendance-history`, getStudentHistoryParams(options));
};

/**
 * Get attendance trends and analytics
 * @param {number|string} groupId - Group ID (optional for admin)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attendance trends data
 */
export const fetchAttendanceTrends = async (groupId, options = {}) => {
  const endpoint = groupId
    ? `/groups/${groupId}/attendance-trends`
    : '/admin/attendance-trends';

  return getData(endpoint, getAttendanceTrendParams(options));
};

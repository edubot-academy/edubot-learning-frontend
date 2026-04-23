/**
 * Attendance API Service
 * Handles all attendance-related API calls for both admin and instructor dashboards
 */

// Base API configuration
const API_BASE = import.meta.env?.VITE_API_BASE || '/api';

/**
 * Helper function to handle API responses
 */
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText || 'API request failed';

    // Handle specific error codes
    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in again');
    }
    if (response.status === 403) {
      throw new Error('Permission denied - You do not have access to this resource');
    }
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    if (response.status >= 500) {
      throw new Error('Server error - Please try again later');
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Helper function to make API requests with proper error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Get attendance overview for a group
 * @param {number|string} groupId - Group ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attendance overview data
 */
export const fetchAttendanceOverview = async (groupId, options = {}) => {
  const params = new URLSearchParams({
    includeUnscheduled: options.includeUnscheduled !== false ? 'true' : 'false',
    includeStats: options.includeStats !== false ? 'true' : 'false',
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.sessionIds && { sessionIds: options.sessionIds.join(',') }),
  });

  return apiRequest(`/groups/${groupId}/attendance-overview?${params}`);
};

/**
 * Get attendance overview for admin (multiple groups)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Multi-group attendance data
 */
export const fetchAdminAttendanceOverview = async (options = {}) => {
  const params = new URLSearchParams({
    includeUnscheduled: options.includeUnscheduled !== false ? 'true' : 'false',
    includeStats: options.includeStats !== false ? 'true' : 'false',
    ...(options.groupIds && { groupIds: options.groupIds.join(',') }),
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.sessionIds && { sessionIds: options.sessionIds.join(',') }),
  });

  return apiRequest(`/admin/attendance-overview?${params}`);
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

  // Validate update format
  const validUpdates = updates.every(update =>
    update.studentId &&
    update.sessionId &&
    ['present', 'late', 'absent', 'not_scheduled', 'excused'].includes(update.status)
  );

  if (!validUpdates) {
    throw new Error('Invalid update format. Each update must include studentId, sessionId, and status');
  }

  return apiRequest(`/groups/${groupId}/attendance`, {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
  });
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

  // Validate update format
  const validUpdates = updates.every(update =>
    update.groupId &&
    update.studentId &&
    update.sessionId &&
    ['present', 'late', 'absent', 'not_scheduled', 'excused'].includes(update.status)
  );

  if (!validUpdates) {
    throw new Error('Invalid update format. Each update must include groupId, studentId, sessionId, and status');
  }

  return apiRequest('/admin/attendance', {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
  });
};

/**
 * Get attendance statistics for a group
 * @param {number|string} groupId - Group ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attendance statistics
 */
export const fetchAttendanceStatistics = async (groupId, options = {}) => {
  const params = new URLSearchParams({
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.includeTrends && { includeTrends: 'true' }),
    ...(options.includeComparison && { includeComparison: 'true' }),
  });

  return apiRequest(`/groups/${groupId}/attendance-statistics?${params}`);
};

/**
 * Get attendance statistics for admin
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Admin attendance statistics
 */
export const fetchAdminAttendanceStatistics = async (options = {}) => {
  const params = new URLSearchParams({
    ...(options.groupIds && { groupIds: options.groupIds.join(',') }),
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.includeTrends && { includeTrends: 'true' }),
    ...(options.includeComparison && { includeComparison: 'true' }),
  });

  return apiRequest(`/admin/attendance-statistics?${params}`);
};

/**
 * Export attendance data
 * @param {number|string} groupId - Group ID
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} Export file data
 */
export const exportAttendanceData = async (groupId, options = {}) => {
  const params = new URLSearchParams({
    format: options.format || 'csv',
    includeUnscheduled: options.includeUnscheduled !== false ? 'true' : 'false',
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.sessionIds && { sessionIds: options.sessionIds.join(',') }),
    ...(options.studentIds && { studentIds: options.studentIds.join(',') }),
  });

  const token = localStorage.getItem('auth_token');
  const headers = {
    Authorization: token ? `Bearer ${token}` : '',
  };

  try {
    const response = await fetch(`${API_BASE}/groups/${groupId}/attendance-export?${params}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
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
  const params = new URLSearchParams({
    format: options.format || 'csv',
    includeUnscheduled: options.includeUnscheduled !== false ? 'true' : 'false',
    ...(options.groupIds && { groupIds: options.groupIds.join(',') }),
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.sessionIds && { sessionIds: options.sessionIds.join(',') }),
    ...(options.studentIds && { studentIds: options.studentIds.join(',') }),
  });

  const token = localStorage.getItem('auth_token');
  const headers = {
    Authorization: token ? `Bearer ${token}` : '',
  };

  try {
    const response = await fetch(`${API_BASE}/admin/attendance-export?${params}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
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
  const params = new URLSearchParams({
    ...(options.groupId && { groupId: options.groupId }),
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.includeDetails && { includeDetails: 'true' }),
  });

  return apiRequest(`/students/${studentId}/attendance-history?${params}`);
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

  const params = new URLSearchParams({
    ...(options.startDate && { startDate: options.startDate }),
    ...(options.endDate && { endDate: options.endDate }),
    ...(options.period && { period: options.period }), // 'weekly', 'monthly', 'quarterly'
    ...(options.includeComparison && { includeComparison: 'true' }),
  });

  return apiRequest(`${endpoint}?${params}`);
};

/**
 * Download attendance file
 * @param {Blob} blobData - File data from export API
 * @param {string} filename - Desired filename
 * @param {string} format - File format ('csv', 'excel', 'pdf')
 */
export const downloadAttendanceFile = (blobData, filename, format = 'csv') => {
  const extensions = {
    csv: 'csv',
    excel: 'xlsx',
    pdf: 'pdf',
  };

  const extension = extensions[format] || 'csv';
  const fullFilename = filename.includes('.') ? filename : `${filename}.${extension}`;

  const url = window.URL.createObjectURL(blobData);
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Validate attendance data
 * @param {Object} attendanceData - Attendance data to validate
 * @returns {Object} Validation result
 */
export const validateAttendanceData = (attendanceData) => {
  const errors = [];
  const warnings = [];

  // Check required fields
  if (!attendanceData.students || !Array.isArray(attendanceData.students)) {
    errors.push('Students data is required and must be an array');
  }

  if (!attendanceData.sessions || !Array.isArray(attendanceData.sessions)) {
    errors.push('Sessions data is required and must be an array');
  }

  if (!attendanceData.attendanceData || typeof attendanceData.attendanceData !== 'object') {
    errors.push('Attendance data is required and must be an object');
  }

  // Validate student data
  if (attendanceData.students) {
    attendanceData.students.forEach((student, index) => {
      if (!student.id) {
        errors.push(`Student at index ${index} is missing ID`);
      }
      if (!student.name || typeof student.name !== 'string') {
        errors.push(`Student at index ${index} is missing valid name`);
      }
    });
  }

  // Validate session data
  if (attendanceData.sessions) {
    attendanceData.sessions.forEach((session, index) => {
      if (!session.id) {
        errors.push(`Session at index ${index} is missing ID`);
      }
      if (!session.date && !session.sessionIndex) {
        warnings.push(`Session at index ${index} has no date or session index`);
      }
    });
  }

  // Validate attendance records
  if (attendanceData.attendanceData && attendanceData.students && attendanceData.sessions) {
    const validStatuses = ['present', 'late', 'absent', 'not_scheduled', 'excused'];

    Object.keys(attendanceData.attendanceData).forEach(studentId => {
      const studentExists = attendanceData.students.some(s => s.id.toString() === studentId);
      if (!studentExists) {
        warnings.push(`Attendance data contains student ID ${studentId} that doesn't exist in students list`);
      }

      Object.keys(attendanceData.attendanceData[studentId]).forEach(sessionId => {
        const sessionExists = attendanceData.sessions.some(s => s.id.toString() === sessionId);
        if (!sessionExists) {
          warnings.push(`Attendance data contains session ID ${sessionId} that doesn't exist in sessions list`);
        }

        const status = attendanceData.attendanceData[studentId][sessionId];
        if (!validStatuses.includes(status)) {
          errors.push(`Invalid status "${status}" for student ${studentId}, session ${sessionId}`);
        }
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Cache management for attendance data
 */
export const attendanceCache = {
  // Cache key generator
  generateKey: (groupId, options = {}) => {
    const keyParts = [`attendance_${groupId}`];

    if (options.startDate) keyParts.push(`start_${options.startDate}`);
    if (options.endDate) keyParts.push(`end_${options.endDate}`);
    if (options.includeUnscheduled !== undefined) keyParts.push(`unsched_${options.includeUnscheduled}`);

    return keyParts.join('_');
  },

  // Set cache
  set: (key, data, ttl = 300000) => { // 5 minutes default TTL
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`attendance_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache attendance data:', error);
    }
  },

  // Get cache
  get: (key) => {
    try {
      const item = localStorage.getItem(`attendance_cache_${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      // Check if cache is expired
      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`attendance_cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to retrieve cached attendance data:', error);
      return null;
    }
  },

  // Clear cache
  clear: (key) => {
    try {
      localStorage.removeItem(`attendance_cache_${key}`);
    } catch (error) {
      console.warn('Failed to clear attendance cache:', error);
    }
  },

  // Clear all cache
  clearAll: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('attendance_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear all attendance cache:', error);
    }
  },
};

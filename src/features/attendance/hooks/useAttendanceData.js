import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import {
  fetchLegacyAttendanceOverview,
  updateLegacyAttendance,
} from '../api/legacyAttendanceApi';
import {
  addPendingAttendanceUpdates,
  applyAttendanceUpdates,
  calculateAttendanceStatistics,
  createAttendanceDataFilters,
  createAttendanceTableFilters,
  createEmptyAttendanceState,
  filterAttendanceData,
  getAttendanceUpdateKey,
  getAttendanceUpdateKeys,
  hasActiveAttendanceFilters,
  normalizeAttendanceData,
  removePendingAttendanceUpdate,
  setAttendanceFilter,
  setAttendanceRecord,
} from '../utils/attendanceData';

/**
 * Hook for managing attendance data fetching and state
 * Reusable for both admin and instructor dashboards
 */
export const useAttendanceData = ({
  groupId,
  adminMode = false,
  includeUnscheduled = true,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}) => {
  const { t } = useTranslation();
  // State
  const [data, setData] = useState(createEmptyAttendanceState);

  const [filters, setFilters] = useState(createAttendanceDataFilters);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async (signal) => {
    if (!groupId) return;

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchLegacyAttendanceOverview({
        groupId,
        adminMode,
        includeUnscheduled,
        dateRange: filters.dateRange,
        signal,
      });
      
      // Normalize data structure
      const normalizedData = {
        students: result.students || [],
        sessions: result.sessions || [],
        attendanceData: normalizeAttendanceData(result.attendanceData || {}),
        loading: false,
        error: null,
        lastUpdated: new Date(),
      };

      setData(normalizedData);
      return normalizedData;

    } catch (error) {
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        const errorMessage = parseApiError(error, t('attendance.legacy.loadFailed')).message;
        console.error('Attendance data fetch error:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: { message: errorMessage },
        }));
        toast.error(errorMessage);
      }
    }
  }, [groupId, adminMode, includeUnscheduled, filters.dateRange, t]);

  // Update single attendance record
  const updateAttendanceRecord = useCallback((studentId, sessionId, status) => {
    setData(prev => {
      return {
        ...prev,
        attendanceData: setAttendanceRecord(prev.attendanceData, studentId, sessionId, status),
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Bulk update attendance records
  const bulkUpdateAttendance = useCallback((updates) => {
    setData(prev => {
      return {
        ...prev,
        attendanceData: applyAttendanceUpdates(prev.attendanceData, updates),
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Reset data
  const resetData = useCallback(() => {
    setData(createEmptyAttendanceState());
  }, []);

  // Computed values
  const statistics = useMemo(() => {
    return calculateAttendanceStatistics(data);
  }, [data]);

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    return filterAttendanceData(data, filters);
  }, [data, filters]);

  // Initial fetch
  useEffect(() => {
    const controller = new AbortController();
    fetchAttendanceData(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchAttendanceData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !groupId) return;

    const interval = setInterval(() => {
      const controller = new AbortController();
      fetchAttendanceData(controller.signal);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAttendanceData, groupId]);

  return {
    // Data
    data: filteredData,
    statistics,
    
    // State setters
    setFilters,
    
    // Actions
    refetch: fetchAttendanceData,
    updateAttendanceRecord,
    bulkUpdateAttendance,
    resetData,
    
    // Computed values
    isLoading: data.loading,
    hasError: !!data.error,
    isEmpty: !data.students.length,
    lastUpdated: data.lastUpdated,
  };
};

/**
 * Hook for attendance updates with optimistic updates
 */
export const useAttendanceUpdates = ({ groupId, onSuccess, onError }) => {
  const { t } = useTranslation();
  const [updating, setUpdating] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(new Set());

  // Single attendance update
  const updateAttendance = useCallback(async (studentId, sessionId, status) => {
    const updateKey = getAttendanceUpdateKey(studentId, sessionId);
    
    try {
      setUpdating(true);
      setPendingUpdates(prev => addPendingAttendanceUpdates(prev, [updateKey]));

      const result = await updateLegacyAttendance(groupId, [{ studentId, sessionId, status }]);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      toast.success(t('attendance.toasts.updateSuccess'));
      return result;

    } catch (error) {
      const errorMessage = parseApiError(error, t('attendance.toasts.updateFailed')).message;
      console.error('Attendance update error:', error);
      
      if (onError) {
        onError(error);
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
      setPendingUpdates(prev => removePendingAttendanceUpdate(prev, updateKey));
    }
  }, [groupId, onSuccess, onError, t]);

  // Bulk attendance update
  const bulkUpdateAttendance = useCallback(async (updates) => {
    if (!updates.length) return;

    try {
      setUpdating(true);
      
      // Add all updates to pending set
      const updateKeys = getAttendanceUpdateKeys(updates);
      setPendingUpdates(prev => addPendingAttendanceUpdates(prev, updateKeys));

      const result = await updateLegacyAttendance(groupId, updates);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      toast.success(t('attendance.toasts.bulkUpdateSuccess', { count: updates.length }));
      return result;

    } catch (error) {
      const errorMessage = parseApiError(error, t('attendance.toasts.updateFailed')).message;
      console.error('Bulk attendance update error:', error);
      
      if (onError) {
        onError(error);
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
      setPendingUpdates(new Set());
    }
  }, [groupId, onSuccess, onError, t]);

  // Check if specific cell is updating
  const isCellUpdating = useCallback((studentId, sessionId) => {
    return pendingUpdates.has(getAttendanceUpdateKey(studentId, sessionId));
  }, [pendingUpdates]);

  return {
    updateAttendance,
    bulkUpdateAttendance,
    isCellUpdating,
    isUpdating: updating,
    pendingUpdatesCount: pendingUpdates.size,
  };
};

/**
 * Hook for attendance filters and search
 */
export const useAttendanceFilters = () => {
  const [filters, setFilters] = useState(createAttendanceTableFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => setAttendanceFilter(prev, key, value));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(createAttendanceTableFilters());
  }, []);

  const hasActiveFilters = useMemo(() => {
    return hasActiveAttendanceFilters(filters);
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};

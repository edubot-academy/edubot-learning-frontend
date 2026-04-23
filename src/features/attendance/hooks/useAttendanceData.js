import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

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
  // State
  const [data, setData] = useState({
    students: [],
    sessions: [],
    attendanceData: {},
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const [filters, setFilters] = useState({
    statusFilter: 'all',
    searchQuery: '',
    dateRange: null,
  });

  // API endpoints based on mode
  const getApiEndpoint = useCallback(() => {
    if (adminMode) {
      return `/api/admin/groups/${groupId}/attendance-overview`;
    }
    return `/api/groups/${groupId}/attendance-overview`;
  }, [groupId, adminMode]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async (signal) => {
    if (!groupId) return;

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const endpoint = getApiEndpoint();
      const params = new URLSearchParams({
        includeUnscheduled: includeUnscheduled.toString(),
        ...(filters.dateRange && {
          startDate: filters.dateRange.start,
          endDate: filters.dateRange.end,
        }),
      });

      const response = await fetch(`${endpoint}?${params}`, { signal });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance data: ${response.statusText}`);
      }

      const result = await response.json();
      
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
      if (error.name !== 'AbortError') {
        const errorMessage = error.message || 'Failed to load attendance data';
        console.error('Attendance data fetch error:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: { message: errorMessage },
        }));
        toast.error(errorMessage);
      }
    }
  }, [groupId, adminMode, includeUnscheduled, filters.dateRange, getApiEndpoint]);

  // Normalize attendance data from API response
  const normalizeAttendanceData = useCallback((rawData) => {
    const normalized = {};
    
    Object.keys(rawData).forEach(studentId => {
      normalized[studentId] = {};
      Object.keys(rawData[studentId]).forEach(sessionId => {
        normalized[studentId][sessionId] = rawData[studentId][sessionId];
      });
    });
    
    return normalized;
  }, []);

  // Update single attendance record
  const updateAttendanceRecord = useCallback((studentId, sessionId, status) => {
    setData(prev => {
      const newAttendanceData = { ...prev.attendanceData };
      
      if (!newAttendanceData[studentId]) {
        newAttendanceData[studentId] = {};
      }
      
      newAttendanceData[studentId][sessionId] = status;
      
      return {
        ...prev,
        attendanceData: newAttendanceData,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Bulk update attendance records
  const bulkUpdateAttendance = useCallback((updates) => {
    setData(prev => {
      const newAttendanceData = { ...prev.attendanceData };
      
      updates.forEach(({ studentId, sessionId, status }) => {
        if (!newAttendanceData[studentId]) {
          newAttendanceData[studentId] = {};
        }
        newAttendanceData[studentId][sessionId] = status;
      });
      
      return {
        ...prev,
        attendanceData: newAttendanceData,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Reset data
  const resetData = useCallback(() => {
    setData({
      students: [],
      sessions: [],
      attendanceData: {},
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, []);

  // Computed values
  const statistics = useMemo(() => {
    const { students, sessions, attendanceData } = data;
    
    if (!students.length || !sessions.length) {
      return {
        totals: { present: 0, late: 0, absent: 0, not_scheduled: 0, excused: 0, total: 0 },
        percentages: { present: 0, late: 0, absent: 0, not_scheduled: 0, excused: 0 },
        studentStats: {},
        sessionStats: {},
      };
    }

    const totals = { present: 0, late: 0, absent: 0, not_scheduled: 0, excused: 0, total: 0 };
    const studentStats = {};
    const sessionStats = {};

    // Calculate totals and student stats
    students.forEach(student => {
      const studentTotal = { present: 0, late: 0, absent: 0, not_scheduled: 0, excused: 0 };
      
      sessions.forEach(session => {
        const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
        
        // Update totals
        totals[status]++;
        totals.total++;
        
        // Update student stats
        studentTotal[status]++;
        
        // Update session stats
        if (!sessionStats[session.id]) {
          sessionStats[session.id] = { present: 0, late: 0, absent: 0, not_scheduled: 0, excused: 0 };
        }
        sessionStats[session.id][status]++;
      });
      
      // Calculate student attendance rate
      const attendedCount = studentTotal.present + studentTotal.late;
      studentStats[student.id] = {
        ...studentTotal,
        attendanceRate: sessions.length > 0 ? (attendedCount / sessions.length) * 100 : 0,
      };
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(totals).forEach(key => {
      if (key !== 'total') {
        percentages[key] = totals.total > 0 ? (totals[key] / totals.total) * 100 : 0;
      }
    });

    // Calculate session attendance rates
    Object.keys(sessionStats).forEach(sessionId => {
      const sessionTotal = sessionStats[sessionId];
      const attendedCount = sessionTotal.present + sessionTotal.late;
      sessionStats[sessionId].attendanceRate = students.length > 0 
        ? (attendedCount / students.length) * 100 
        : 0;
    });

    return { totals, percentages, studentStats, sessionStats };
  }, [data]);

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    const { students, attendanceData } = data;
    
    let filteredStudents = students.filter(student => {
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        if (!student.name.toLowerCase().includes(searchLower) && 
            !student.email?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Status filter
      if (filters.statusFilter !== 'all') {
        const studentStatuses = data.sessions.map(session => 
          attendanceData[student.id]?.[session.id] || 'not_scheduled'
        );
        if (!studentStatuses.includes(filters.statusFilter)) {
          return false;
        }
      }
      
      return true;
    });

    return {
      ...data,
      students: filteredStudents,
    };
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
  const [updating, setUpdating] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(new Set());

  // Single attendance update
  const updateAttendance = useCallback(async (studentId, sessionId, status) => {
    const updateKey = `${studentId}-${sessionId}`;
    
    try {
      setUpdating(true);
      setPendingUpdates(prev => new Set(prev).add(updateKey));

      const response = await fetch(`/api/groups/${groupId}/attendance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: [{ studentId, sessionId, status }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update attendance: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      toast.success('Attendance updated successfully');
      return result;

    } catch (error) {
      const errorMessage = error.message || 'Failed to update attendance';
      console.error('Attendance update error:', error);
      
      if (onError) {
        onError(error);
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(updateKey);
        return newSet;
      });
    }
  }, [groupId, onSuccess, onError]);

  // Bulk attendance update
  const bulkUpdateAttendance = useCallback(async (updates) => {
    if (!updates.length) return;

    try {
      setUpdating(true);
      
      // Add all updates to pending set
      const updateKeys = updates.map(({ studentId, sessionId }) => `${studentId}-${sessionId}`);
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        updateKeys.forEach(key => newSet.add(key));
        return newSet;
      });

      const response = await fetch(`/api/groups/${groupId}/attendance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update attendance: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      toast.success(`${updates.length} attendance records updated`);
      return result;

    } catch (error) {
      const errorMessage = error.message || 'Failed to update attendance';
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
  }, [groupId, onSuccess, onError]);

  // Check if specific cell is updating
  const isCellUpdating = useCallback((studentId, sessionId) => {
    const updateKey = `${studentId}-${sessionId}`;
    return pendingUpdates.has(updateKey);
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
  const [filters, setFilters] = useState({
    statusFilter: 'all',
    searchQuery: '',
    dateRange: null,
    sessionFilter: 'all',
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      statusFilter: 'all',
      searchQuery: '',
      dateRange: null,
      sessionFilter: 'all',
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.statusFilter !== 'all' || 
           filters.searchQuery !== '' || 
           filters.dateRange !== null ||
           filters.sessionFilter !== 'all';
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};

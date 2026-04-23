import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { FiX, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
  PERFORMANCE_THRESHOLDS,
} from '../constants/attendanceConfig';
import { fetchGroupRoster } from '../../courseGroups/roster';
import { fetchCourseSessions } from '../../groupSessions/api';
import { fetchSessionAttendance, markSessionAttendanceBulk } from '../api';
import {
  handleAttendanceError,
  handleAttendanceSuccess,
  validateAndNormalizeResponse,
} from '../utils/errorHandling';
import {
  commonComponentProps,
  defaultProps,
} from '../types/propTypes';
import AttendanceFilters from './AttendanceFilters';
import EnhancedAttendanceSummary from './EnhancedAttendanceSummary';
import AttendanceCardView from './AttendanceCardView';
import VirtualizedAttendanceTable from './VirtualizedAttendanceTable';
import {
  AttendanceTableSkeleton,
  AttendanceCardSkeleton,
  AttendanceLoadingOverlay,
  AttendanceEmptyState,
  AttendanceErrorState,
} from './AttendanceLoadingStates';
import { useAccessibility } from '../hooks/useAccessibility';

const cloneAttendanceData = (data = {}) =>
  Object.fromEntries(
    Object.entries(data).map(([studentId, sessionsById]) => [
      studentId,
      { ...(sessionsById || {}) },
    ])
  );

const getDayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSessionInDateRange = (session, filters) => {
  const range = filters.dateRange || 'all';

  if (range === 'all') return true;
  if (!session.startsAt) return false;

  const sessionDate = new Date(session.startsAt);
  if (Number.isNaN(sessionDate.getTime())) return false;

  const today = getDayStart(new Date());
  const sessionDay = getDayStart(sessionDate);

  if (range === 'today') {
    return sessionDay.getTime() === today.getTime();
  }

  const dayOfWeek = today.getDay();
  const weekOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - weekOffset);

  if (range === 'this_week') {
    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);
    return sessionDay >= thisWeekStart && sessionDay < nextWeekStart;
  }

  if (range === 'last_week') {
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    return sessionDay >= lastWeekStart && sessionDay < thisWeekStart;
  }

  if (range === 'this_month') {
    return (
      sessionDay.getFullYear() === today.getFullYear() &&
      sessionDay.getMonth() === today.getMonth()
    );
  }

  if (range === 'custom') {
    const startDate = filters.customStartDate ? getDayStart(new Date(filters.customStartDate)) : null;
    const endDate = filters.customEndDate ? getDayStart(new Date(filters.customEndDate)) : null;

    if (startDate && Number.isNaN(startDate.getTime())) return false;
    if (endDate && Number.isNaN(endDate.getTime())) return false;

    return (!startDate || sessionDay >= startDate) && (!endDate || sessionDay <= endDate);
  }

  return true;
};

const getStudentAttendanceRate = (studentId, sessions, attendanceData) => {
  const stats = sessions.reduce(
    (result, session) => {
      const status = attendanceData[studentId]?.[session.id] || 'not_scheduled';

      if (
        status === SESSION_ATTENDANCE_STATUS.PRESENT ||
        status === SESSION_ATTENDANCE_STATUS.LATE
      ) {
        result.attended += 1;
        result.scheduled += 1;
      } else if (
        status === SESSION_ATTENDANCE_STATUS.ABSENT ||
        status === SESSION_ATTENDANCE_STATUS.EXCUSED
      ) {
        result.scheduled += 1;
      }

      return result;
    },
    { attended: 0, scheduled: 0 }
  );

  return stats.scheduled > 0 ? (stats.attended / stats.scheduled) * 100 : 0;
};

const matchesAttendanceRateFilter = (rate, filter) => {
  switch (filter || 'all') {
    case 'perfect':
      return rate === 100;
    case 'excellent':
      return rate >= 90 && rate <= 100;
    case 'good':
      return rate >= 75 && rate < 90;
    case 'fair':
      return rate >= 50 && rate < 75;
    case 'poor':
      return rate < 50;
    default:
      return true;
  }
};

/**
 * Unified Attendance Table Component
 * Consolidates all attendance table functionality into a single, optimized component
 * Supports multiple view modes: table, cards, virtualized
 * Includes comprehensive filtering, bulk operations, and accessibility features
 */
const UnifiedAttendanceTable = ({
  groupId,
  courseId = null,
  onAttendanceUpdate,
  className = '',
  viewMode = 'auto', // auto | table | cards | virtualized
  showAdvancedFilters = true,
  showStudentBreakdown = true,
  showSessionBreakdown = false,
}) => {
  // State management
  const [selectedViewMode, setSelectedViewMode] = useState(viewMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [savedAttendanceData, setSavedAttendanceData] = useState({});
  const [updatingCells, setUpdatingCells] = useState(new Set());
  const [pendingChanges, setPendingChanges] = useState(new Map());
  const [popupCell, setPopupCell] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    statusFilter: 'all',
    dateRange: 'all',
    attendanceRateFilter: 'all',
    sessionFilter: 'all',
    customStartDate: '',
    customEndDate: '',
  });

  // Data loading
  const loadData = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const [studentsRes, sessionsRes] = await Promise.all([
        fetchGroupRoster({ groupId, page: 1, limit: 200 }),
        fetchCourseSessions({ groupId }),
      ]);

      // Normalize API responses using utility
      const studentsList = validateAndNormalizeResponse(studentsRes);
      const sessionsList = validateAndNormalizeResponse(sessionsRes);

      setStudents(studentsList);
      setSessions(sessionsList);

      // Load attendance data for all sessions
      if (sessionsList.length > 0) {
        const attendancePromises = sessionsList.map((session) =>
          fetchSessionAttendance(session.id).catch(() => ({ items: [] }))
        );

        const attendanceResults = await Promise.all(attendancePromises);
        const consolidatedAttendance = {};

        attendanceResults.forEach((sessionAttendance, index) => {
          const sessionId = sessionsList[index]?.id;
          const attendanceItems = validateAndNormalizeResponse(sessionAttendance);

          attendanceItems.forEach((record) => {
            const studentId = record.studentId || record.userId;
            if (!studentId || !sessionId) return;

            if (!consolidatedAttendance[studentId]) {
              consolidatedAttendance[studentId] = {};
            }

            consolidatedAttendance[studentId][sessionId] = record.status;
          });
        });

        setAttendanceData(cloneAttendanceData(consolidatedAttendance));
        setSavedAttendanceData(cloneAttendanceData(consolidatedAttendance));
      } else {
        setAttendanceData({});
        setSavedAttendanceData({});
      }
      setPendingChanges(new Map());
    } catch (loadError) {
      handleAttendanceError(loadError, 'Жүктөөдө ката кетти');
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setSelectedViewMode(viewMode);
  }, [viewMode]);

  // Responsive view mode calculation
  const responsiveViewMode = useMemo(() => {
    if (selectedViewMode !== 'auto') return selectedViewMode;

    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const shouldUseVirtualization =
      students.length > PERFORMANCE_THRESHOLDS.VIRTUAL_SCROLLING_THRESHOLD;

    if (isMobile) return 'cards';
    if (shouldUseVirtualization) return 'virtualized';
    return 'table';
  }, [selectedViewMode, students.length]);

  // Status change handler with optimistic updates
  const handleStatusChange = useCallback(
    (studentId, sessionId, status) => {
      const cellKey = `${studentId}-${sessionId}`;

      // Update pending changes
      setPendingChanges((prev) => {
        const newChanges = new Map(prev);
        const savedStatus = savedAttendanceData[studentId]?.[sessionId] || 'not_scheduled';

        if (status === savedStatus) {
          newChanges.delete(cellKey);
        } else {
          newChanges.set(cellKey, { studentId, sessionId, status });
        }

        return newChanges;
      });

      // Optimistic update
      setAttendanceData((prev) => {
        const optimisticData = { ...prev };
        optimisticData[studentId] = { ...(optimisticData[studentId] || {}) };
        optimisticData[studentId][sessionId] = status;
        return optimisticData;
      });

    },
    [savedAttendanceData]
  );

  // Popup cell click handler
  const handleCellClick = useCallback(
    (studentId, sessionId) => {
      const student = students.find((s) => String(s.id) === String(studentId));
      const session = sessions.find((s) => String(s.id) === String(sessionId));
      const currentStatus = attendanceData[studentId]?.[sessionId] || 'not_scheduled';

      setPopupCell({
        studentId,
        sessionId,
        student,
        session,
        currentStatus,
      });
    },
    [students, sessions, attendanceData]
  );

  // Popup status select handler
  const handleStatusSelect = useCallback(
    (studentId, sessionId, status) => {
      const cellKey = `${studentId}-${sessionId}`;

      // Update pending changes instead of immediately saving
      setPendingChanges((prev) => {
        const newChanges = new Map(prev);
        const savedStatus = savedAttendanceData[studentId]?.[sessionId] || 'not_scheduled';
        if (status === savedStatus) {
          // If reverting to original value, remove from pending changes
          newChanges.delete(cellKey);
        } else {
          // Add or update pending change
          newChanges.set(cellKey, { studentId, sessionId, status });
        }
        return newChanges;
      });

      // Update local display immediately for better UX
      const optimisticData = { ...attendanceData };
      optimisticData[studentId] = { ...(optimisticData[studentId] || {}) };
      optimisticData[studentId][sessionId] = status;
      setAttendanceData(optimisticData);

      setPopupCell(null);
    },
    [attendanceData, savedAttendanceData]
  );

  // Bulk update handler
  const handleBulkUpdate = useCallback(
    async (updates) => {
      if (!Array.isArray(updates) || updates.length === 0) return;

      try {
        setUpdatingCells(new Set(updates.map((u) => `${u.studentId}-${u.sessionId}`)));

        // Group updates by session for API efficiency
        const updatesBySession = {};
        updates.forEach(({ studentId, sessionId, status }) => {
          if (!updatesBySession[sessionId]) {
            updatesBySession[sessionId] = [];
          }
          updatesBySession[sessionId].push({ studentId, status });
        });

        // Execute API calls
        const promises = Object.entries(updatesBySession).map(([sessionId, rows]) =>
          markSessionAttendanceBulk(Number(sessionId), {
            courseId: courseId ? Number(courseId) : undefined,
            rows,
          })
        );

        await Promise.all(promises);

        setSavedAttendanceData((prev) => {
          const next = { ...prev };
          updates.forEach(({ studentId, sessionId, status }) => {
            next[studentId] = { ...(next[studentId] || {}) };
            next[studentId][sessionId] = status;
          });
          return next;
        });

        // Clear pending changes
        setPendingChanges(new Map());

        // Notify parent
        if (onAttendanceUpdate) {
          onAttendanceUpdate();
        }

        handleAttendanceSuccess(`${updates.length} катышуу ийгиликтүү жаңыртылды!`);
      } catch (saveError) {
        handleAttendanceError(saveError, 'Катышууну сактоо мүмкүн болбоду');
      } finally {
        setUpdatingCells(new Set());
      }
    },
    [courseId, onAttendanceUpdate]
  );

  const unsavedUpdates = useMemo(() => {
    const updates = [];
    const validStatuses = new Set(Object.values(SESSION_ATTENDANCE_STATUS));

    students.forEach((student) => {
      sessions.forEach((session) => {
        const studentId = student.id;
        const sessionId = session.id;
        const currentStatus = attendanceData[studentId]?.[sessionId] || 'not_scheduled';
        const savedStatus = savedAttendanceData[studentId]?.[sessionId] || 'not_scheduled';

        if (currentStatus !== savedStatus && validStatuses.has(currentStatus)) {
          updates.push({ studentId, sessionId, status: currentStatus });
        }
      });
    });

    return updates;
  }, [students, sessions, attendanceData, savedAttendanceData]);

  const unsavedChangeCount = unsavedUpdates.length;

  // Save handler
  const handleSave = useCallback(async () => {
    const updates = pendingChanges.size > 0
      ? Array.from(pendingChanges.values())
        .filter(({ status }) => Object.values(SESSION_ATTENDANCE_STATUS).includes(status))
        .map(({ studentId, sessionId, status }) => ({
          studentId: Number(studentId),
          sessionId: Number(sessionId),
          status,
        }))
      : unsavedUpdates.map(({ studentId, sessionId, status }) => ({
        studentId: Number(studentId),
        sessionId: Number(sessionId),
        status,
      }));

    if (updates.length === 0) {
      toast('Сактоо үчүн өзгөртүүлөр жок');
      return;
    }

    await handleBulkUpdate(updates);
  }, [pendingChanges, unsavedUpdates, handleBulkUpdate]);

  const handleDiscardChanges = useCallback(() => {
    if (unsavedChangeCount === 0 && pendingChanges.size === 0) return;

    setAttendanceData(cloneAttendanceData(savedAttendanceData));
    setPendingChanges(new Map());
    setPopupCell(null);
  }, [unsavedChangeCount, pendingChanges.size, savedAttendanceData]);

  // Accessibility setup
  const accessibility = useAccessibility({
    students,
    sessions,
    attendanceData,
    onStatusChange: handleStatusChange,
    onSave: handleSave,
  });

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (
        filters.sessionFilter &&
        filters.sessionFilter !== 'all' &&
        String(session.id) !== String(filters.sessionFilter)
      ) {
        return false;
      }

      return isSessionInDateRange(session, filters);
    });
  }, [sessions, filters]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const fullName = student.fullName || student.name || '';
        const email = student.email || '';

        // Search filter
        if (filters.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          if (
            !fullName.toLowerCase().includes(searchLower) &&
            !email.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }

        // Status filter
        if (filters.statusFilter !== 'all') {
          const studentStatuses = filteredSessions.map(
            (session) => attendanceData[student.id]?.[session.id] || 'not_scheduled'
          );
          if (!studentStatuses.includes(filters.statusFilter)) {
            return false;
          }
        }

        const attendanceRate = getStudentAttendanceRate(
          student.id,
          filteredSessions,
          attendanceData
        );

        if (!matchesAttendanceRateFilter(attendanceRate, filters.attendanceRateFilter)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''));
  }, [students, filters, filteredSessions, attendanceData]);

  // Status config for popup and cells
  const statusConfig = {
    [SESSION_ATTENDANCE_STATUS.PRESENT]: {
      label: 'Катышты',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-200 dark:border-emerald-500/30',
      icon: FiCheckCircle,
    },
    [SESSION_ATTENDANCE_STATUS.LATE]: {
      label: 'Кечикти',
      bgColor: 'bg-amber-100 dark:bg-amber-900/40',
      textColor: 'text-amber-700 dark:text-amber-300',
      borderColor: 'border-amber-200 dark:border-amber-500/30',
      icon: FiClock,
    },
    [SESSION_ATTENDANCE_STATUS.ABSENT]: {
      label: 'Келген жок',
      bgColor: 'bg-red-100 dark:bg-red-900/40',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-500/30',
      icon: FiXCircle,
    },
    [SESSION_ATTENDANCE_STATUS.EXCUSED]: {
      label: 'Себептүү',
      bgColor: 'bg-blue-100 dark:bg-blue-900/40',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-500/30',
      icon: FiAlertCircle,
    },
    not_scheduled: {
      label: 'Күтүлүүдө',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-500 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700',
      icon: FiClock,
    },
  };

  // Content renderer based on view mode
  const renderContentView = () => {
    if (loading) {
      return responsiveViewMode === 'cards' ? (
        <AttendanceCardSkeleton cardCount={5} />
      ) : (
        <AttendanceTableSkeleton rowCount={10} columnCount={filteredSessions.length} />
      );
    }

    if (error) {
      return <AttendanceErrorState error={error} onRetry={loadData} />;
    }

    if (students.length === 0) {
      return (
        <AttendanceEmptyState
          type="students"
          title="Студенттер жок"
          subtitle="Бул группада студенттер жок же жүктөөдө ката кетти"
        />
      );
    }

    if (filteredStudents.length === 0) {
      return (
        <AttendanceEmptyState
          type="filtered"
          title="Натыйжалар жок"
          subtitle="Сиздин фильтриңизге ылайык натыйжалар табылган жок"
        />
      );
    }

    const commonProps = {
      students: filteredStudents,
      sessions: filteredSessions,
      attendanceData,
      onStatusChange: handleStatusChange,
    };

    switch (responsiveViewMode) {
      case 'cards':
        return <AttendanceCardView {...commonProps} />;

      case 'virtualized':
        return <VirtualizedAttendanceTable {...commonProps} containerHeight={600} />;

      default: {
        // Table view with inline implementation for better performance
        const minWidth = Math.max(800, 250 + (filteredSessions.length * 120) + 100);

        return (
          <div className="attendance-table-container w-full max-w-full min-w-0 overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="min-w-full align-middle">
              <table
                className="attendance-table w-full border-collapse"
                style={{ minWidth: `${minWidth}px` }}
              >
                <thead>
                  <tr>
                    <th className="attendance-table-sticky-corner min-w-[200px] max-w-[300px] border-r border-gray-200 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      Студент
                    </th>

                    {filteredSessions.map((session) => (
                      <th
                        key={session.id}
                        className="min-w-[70px] max-w-[100px] px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-xs truncate">
                            {session.title || `Сессия ${session.sessionIndex}`}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {session.startsAt
                              ? new Date(session.startsAt).toLocaleDateString('ky-KG', {
                                month: 'short',
                                day: 'numeric',
                              })
                              : '-'}
                          </div>
                        </div>
                      </th>
                    ))}

                    <th className="sticky right-0 z-10 border-l border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                      Жыйынтык
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const studentStats = filteredSessions.reduce((stats, session) => {
                      const status =
                        attendanceData[student.id]?.[session.id] || 'not_scheduled';
                      stats[status] = (stats[status] || 0) + 1;
                      return stats;
                    }, {});

                    const attendedCount =
                      (studentStats.present || 0) + (studentStats.late || 0);

                    const scheduledCount =
                      (studentStats.present || 0) +
                      (studentStats.late || 0) +
                      (studentStats.absent || 0) +
                      (studentStats.excused || 0);

                    const attendanceRate =
                      scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              {(student.fullName || student.name || 'Unknown')
                                .split(' ')
                                .filter(Boolean)
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate font-medium text-gray-900 dark:text-white">
                                {student.fullName || student.name}
                              </div>
                              {student.email && (
                                <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                                  {student.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {filteredSessions.map((session) => {
                          const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
                          const cellKey = `${student.id}-${session.id}`;
                          const isUpdating = updatingCells.has(cellKey);

                          const config = statusConfig[status] || statusConfig.not_scheduled;

                          const sessionDate = session.startsAt ? new Date(session.startsAt) : null;
                          const now = new Date();
                          const isSessionIncomplete =
                            sessionDate && !Number.isNaN(sessionDate.getTime())
                              ? sessionDate > now
                              : false;

                          return (
                            <td
                              key={session.id}
                              className={`attendance-cell p-2 text-center transition-colors ${isSessionIncomplete
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                                } ${isUpdating ? 'opacity-50' : ''
                                }`}
                              onClick={() =>
                                !isUpdating &&
                                !isSessionIncomplete &&
                                handleCellClick(student.id, session.id)
                              }
                              role={isSessionIncomplete ? 'presentation' : 'button'}
                              tabIndex={isSessionIncomplete ? -1 : 0}
                              aria-label={`Change attendance for ${student.fullName || student.name} in ${session.title || `Session ${session.sessionIndex}`
                                }`}
                            >
                              <div
                                className={`attendance-status inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-all duration-200 ${config.bgColor} ${config.textColor} ${config.borderColor} ${isSessionIncomplete ? 'grayscale' : ''
                                  }`}
                              >
                                {status === 'present' && '✓'}
                                {status === 'late' && '◦'}
                                {status === 'absent' && '✗'}
                                {status === 'excused' && '○'}
                                {status === 'not_scheduled' && '-'}
                              </div>

                            </td>
                          );
                        })}

                        <td className="sticky right-0 z-10 border-l border-gray-200 bg-white px-4 py-3 text-center dark:border-gray-700 dark:bg-gray-900">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {Math.round(attendanceRate)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {attendedCount}/{scheduledCount}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {popupCell && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Катышуу статусун тандаңыз
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPopupCell(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>{popupCell.student?.fullName || popupCell.student?.name}</strong>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {popupCell.session?.title || `Сессия ${popupCell.session?.sessionIndex}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            handleStatusSelect(popupCell.studentId, popupCell.sessionId, status)
                          }
                          className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-colors ${popupCell.currentStatus === status
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                            }`}
                        >
                          <Icon className={`mb-1 h-6 w-6 ${config.textColor}`} />
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className={`min-w-0 space-y-6 ${className}`}>
      {/* Summary Section */}
      <EnhancedAttendanceSummary
        students={students}
        sessions={sessions}
        attendanceData={attendanceData}
        showStudentBreakdown={showStudentBreakdown}
        showSessionBreakdown={showSessionBreakdown}
      />

      {/* Filters Section */}
      <AttendanceFilters
        students={students}
        sessions={sessions}
        filters={filters}
        onFiltersChange={setFilters}
        showAdvancedFilters={showAdvancedFilters}
      />

      {/* View Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {unsavedChangeCount > 0
            ? `${unsavedChangeCount} өзгөртүү сакталган эмес`
            : 'Өзгөртүү киргизилгенде сактоо баскычы активдүү болот'}
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setSelectedViewMode('table')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${responsiveViewMode === 'table'
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
          >
            Таблица
          </button>
          <button
            type="button"
            onClick={() => setSelectedViewMode('cards')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${responsiveViewMode === 'cards'
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
          >
            Карталар
          </button>
          {students.length > PERFORMANCE_THRESHOLDS.VIRTUAL_SCROLLING_THRESHOLD && (
            <button
              type="button"
              onClick={() => setSelectedViewMode('virtualized')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${responsiveViewMode === 'virtualized'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              Оптималдуу
            </button>
          )}
        </div>
      </div>

      {/* Table Actions */}
      <div className="sticky top-4 z-30 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Статусту өзгөртүү үчүн таблицадагы клетканы басыңыз.
            </div>

            {unsavedChangeCount > 0 && (
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {unsavedChangeCount} өзгөртүү сакталган эмес
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unsavedChangeCount > 0 && (
              <button
                type="button"
                onClick={handleDiscardChanges}
                disabled={loading}
                className="dashboard-button-secondary px-4 py-2 text-sm disabled:opacity-50"
              >
                Жокко чыгаруу
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || unsavedChangeCount === 0}
              className="dashboard-button-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Сакталууда...' : 'Сактоо'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderContentView()}

      {/* Loading Overlay */}
      <AttendanceLoadingOverlay
        isVisible={loading && !students.length}
        message="Катышуу маалыматы жүктөлүүдө..."
      />

      {/* Accessibility Announcements */}
      {accessibility.announcement && (
        <div role="status" aria-live="polite" className="sr-only">
          {accessibility.announcement}
        </div>
      )}
    </div>
  );
};

UnifiedAttendanceTable.propTypes = {
  ...commonComponentProps,
  // Override specific props for this component
  viewMode: PropTypes.oneOf(['auto', 'table', 'cards', 'virtualized']),
  showAdvancedFilters: PropTypes.bool,
  showStudentBreakdown: PropTypes.bool,
  showSessionBreakdown: PropTypes.bool,
};

UnifiedAttendanceTable.defaultProps = {
  ...defaultProps,
  // Override specific defaults for this component
  viewMode: 'auto',
  showAdvancedFilters: true,
  showStudentBreakdown: true,
  showSessionBreakdown: false,
};

export default UnifiedAttendanceTable;

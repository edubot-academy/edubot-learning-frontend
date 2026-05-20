import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import {
  DashboardInsetPanel,
  DashboardFilterBar,
  EmptyState,
  LoadingState
} from '../../../components/ui/dashboard';

const STATUS_CYCLE = ['present', 'late', 'absent', 'not_scheduled'];

/**
 * Main Attendance Table Component
 * Reusable for both admin and instructor dashboards
 */
const AttendanceTable = ({
  // Data props
  students = [],
  sessions = [],
  attendanceData = {},
  loading = false,
  error = null,

  // Configuration props
  groupName = '',
  showStudentAvatars = true,
  showSessionDates = true,
  allowBulkSelection = true,

  // Callback props
  onAttendanceChange,
  onBulkUpdate,
  // UI props
  className = '',
  emptyStateMessage,

  // Admin-specific props
  adminMode = false,
}) => {
  const { t } = useTranslation();
  // State management
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig] = useState({ key: 'name', direction: 'asc' });

  // Attendance status cycle order
  const statusIcons = {
    present: '✓',
    late: '◦',
    absent: '✗',
    not_scheduled: '-',
    excused: '○'
  };

  const statusLabels = {
    all: t('attendance.filters.all'),
    present: t('attendance.status.present'),
    late: t('attendance.status.late'),
    absent: t('attendance.status.absent'),
    not_scheduled: t('attendance.status.notScheduled'),
    excused: t('attendance.status.excused'),
  };

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student =>
      (student.fullName || student.name || '').toLowerCase().includes(filterQuery.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => {
        const studentStatuses = sessions.map(session =>
          attendanceData[student.id]?.[session.id] || 'not_scheduled'
        );
        return studentStatuses.some(status => status === statusFilter);
      });
    }

    // Sort students
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    return filtered;
  }, [students, filterQuery, statusFilter, sortConfig, sessions, attendanceData]);

  // Pagination
  const itemsPerPage = adminMode ? 50 : 25;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  // Calculate attendance statistics
  const statistics = useMemo(() => {
    const totals = {
      present: 0,
      late: 0,
      absent: 0,
      not_scheduled: 0,
      excused: 0,
      total: 0
    };

    students.forEach(student => {
      sessions.forEach(session => {
        const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
        totals[status]++;
        totals.total++;
      });
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(totals).forEach(key => {
      if (key !== 'total') {
        percentages[key] = totals.total > 0 ? (totals[key] / totals.total) * 100 : 0;
      }
    });

    return { totals, percentages };
  }, [students, sessions, attendanceData]);

  // Handle cell click - cycle through status
  const handleCellClick = useCallback((studentId, sessionId) => {
    const currentStatus = attendanceData[studentId]?.[sessionId] || 'not_scheduled';
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    // Create unique cell key
    const cellKey = `${studentId}-${sessionId}`;

    // Handle selection
    const newSelectedCells = new Set(selectedCells);
    if (newSelectedCells.has(cellKey)) {
      newSelectedCells.delete(cellKey);
    } else {
      newSelectedCells.add(cellKey);
    }
    setSelectedCells(newSelectedCells);

    // Call change handler
    if (onAttendanceChange) {
      onAttendanceChange(studentId, sessionId, nextStatus);
    }
  }, [attendanceData, selectedCells, onAttendanceChange]);

  // Handle bulk operations
  const handleBulkUpdate = useCallback((status) => {
    if (selectedCells.size === 0 || !onBulkUpdate) return;

    const updates = Array.from(selectedCells).map(cellKey => {
      const [studentId, sessionId] = cellKey.split('-').map(Number);
      return { studentId, sessionId, status };
    });

    onBulkUpdate(updates);
    setSelectedCells(new Set());
  }, [selectedCells, onBulkUpdate]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event, studentId, sessionId) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'ArrowDown':
        // Handle keyboard navigation between cells
        event.preventDefault();
        // Implementation would go here
        break;
      case ' ':
        // Space to toggle status
        event.preventDefault();
        handleCellClick(studentId, sessionId);
        break;
      default:
        break;
    }
  }, [handleCellClick]);

  // Loading state
  if (loading) {
    return (
      <DashboardInsetPanel
        title={t('attendance.legacy.overview')}
        description={t('attendance.legacy.loadingData')}
      >
        <LoadingState />
      </DashboardInsetPanel>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardInsetPanel
        title={t('attendance.legacy.overview')}
        description={t('attendance.legacy.loadError')}
      >
        <div className="text-red-600 dark:text-red-400">
          {error.message || t('attendance.legacy.loadFailed')}
        </div>
      </DashboardInsetPanel>
    );
  }

  // Empty state
  if (students.length === 0) {
    return (
      <DashboardInsetPanel
        title={t('attendance.legacy.overview')}
        description={emptyStateMessage || t('attendance.legacy.empty')}
      >
        <EmptyState
          title={t('attendance.empty.noStudentsTitle')}
          subtitle={t('attendance.legacy.noStudentsSubtitle')}
          icon={<FiSearch className="h-8 w-8" />}
        />
      </DashboardInsetPanel>
    );
  }

  return (
    <div className={`attendance-table-container ${className}`}>
      {/* Header with filters and controls */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {groupName || t('attendance.legacy.groupAttendance')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('attendance.legacy.counts', {
                students: students.length,
                sessions: sessions.length,
              })}
            </p>
          </div>

          <DashboardFilterBar className="w-full lg:w-auto">
            <div className="relative min-w-0 w-full lg:w-64">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={t('attendance.legacy.searchStudents')}
                className="dashboard-field dashboard-field-icon h-10 w-full pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dashboard-select h-10 min-w-0 w-full lg:w-32"
            >
              <option value="all">{statusLabels.all}</option>
              <option value="present">{statusLabels.present}</option>
              <option value="late">{statusLabels.late}</option>
              <option value="absent">{statusLabels.absent}</option>
              <option value="not_scheduled">{statusLabels.not_scheduled}</option>
            </select>
          </DashboardFilterBar>
        </div>
      </div>

      {/* Statistics row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.totals.present}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{statusLabels.present}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {statistics.totals.late}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{statusLabels.late}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {statistics.totals.absent}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{statusLabels.absent}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {statistics.totals.not_scheduled}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{statusLabels.not_scheduled}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(statistics.percentages.present || 0)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('attendance.metrics.rate')}</div>
        </div>
      </div>

      {/* Main table */}
      <div className="min-w-0 max-w-full overflow-x-auto">
        <table className="attendance-table">
          <thead>
            <tr>
              <th className="attendance-table-sticky-corner border-r border-gray-200 dark:border-gray-700">
                {t('attendance.legacy.studentName')}
              </th>
              {sessions.map(session => (
                <th key={session.id} className="min-w-[80px] text-center">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {showSessionDates
                        ? session.date
                        : t('attendance.fallbacks.sessionWithId', { id: session.sessionIndex })}
                    </div>
                    {session.title && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[100px]">
                        {session.title}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="sticky right-0 z-10 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 text-center">
                {t('attendance.metrics.total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map(student => {
              const studentStats = sessions.reduce((stats, session) => {
                const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
                stats[status] = (stats[status] || 0) + 1;
                return stats;
              }, {});

              const attendanceRate = sessions.length > 0
                ? ((studentStats.present || 0) / sessions.length) * 100
                : 0;

              return (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {showStudentAvatars && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                          {(student.fullName || student.name || t('common.userFallback'))
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {student.fullName || student.name}
                        </div>
                        {student.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {student.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {sessions.map(session => {
                    const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
                    const cellKey = `${student.id}-${session.id}`;
                    const isSelected = selectedCells.has(cellKey);

                    return (
                      <td
                        key={session.id}
                        className={`attendance-cell text-center p-2 ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleCellClick(student.id, session.id)}
                        onKeyDown={(e) => handleKeyDown(e, student.id, session.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={t('attendance.legacy.changeAttendanceAria', {
                          student: student.name || student.fullName || t('common.userFallback'),
                          session:
                            session.title ||
                            t('attendance.fallbacks.sessionWithId', {
                              id: session.sessionIndex,
                            }),
                        })}
                      >
                        <div className={`attendance-status ${status}`}>
                          {statusIcons[status]}
                        </div>
                      </td>
                    );
                  })}

                  <td className="sticky right-0 z-10 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(attendanceRate)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {studentStats.present || 0}/{sessions.length}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk action controls */}
      {selectedCells.size > 0 && allowBulkSelection && (
        <div className="sticky bottom-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('attendance.legacy.cellsSelected', { count: selectedCells.size })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkUpdate('present')}
                className="dashboard-button-secondary text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                {t('attendance.legacy.markPresent')}
              </button>
              <button
                onClick={() => handleBulkUpdate('late')}
                className="dashboard-button-secondary text-amber-600 border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {t('attendance.legacy.markLate')}
              </button>
              <button
                onClick={() => handleBulkUpdate('absent')}
                className="dashboard-button-secondary text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t('attendance.legacy.markAbsent')}
              </button>
              <button
                onClick={() => setSelectedCells(new Set())}
                className="dashboard-button-secondary"
              >
                {t('attendance.legacy.clearSelection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('attendance.legacy.paginationSummary', {
              start: currentPage * itemsPerPage + 1,
              end: Math.min((currentPage + 1) * itemsPerPage, filteredStudents.length),
              total: filteredStudents.length,
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="dashboard-button-secondary disabled:opacity-50"
            >
              <FiChevronLeft className="h-4 w-4" />
              {t('analytics.common.previous')}
            </button>
            <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="dashboard-button-secondary disabled:opacity-50"
            >
              {t('analytics.common.next')}
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

AttendanceTable.propTypes = {
  // Data props
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fullName: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
    })
  ).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    date: PropTypes.string,
    title: PropTypes.string,
    sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })).isRequired,
  attendanceData: PropTypes.objectOf(
    PropTypes.objectOf(PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused']))
  ),
  loading: PropTypes.bool,
  error: PropTypes.object,

  // Configuration props
  groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  groupName: PropTypes.string,
  showStudentAvatars: PropTypes.bool,
  showSessionDates: PropTypes.bool,
  allowBulkSelection: PropTypes.bool,

  // Callback props
  onAttendanceChange: PropTypes.func,
  onBulkUpdate: PropTypes.func,
  onFilterChange: PropTypes.func,

  // UI props
  className: PropTypes.string,
  emptyStateMessage: PropTypes.string,

  // Admin-specific props
  adminMode: PropTypes.bool,
  multiGroupView: PropTypes.bool,
};

export default AttendanceTable;

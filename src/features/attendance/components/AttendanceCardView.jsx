import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FiChevronDown, FiChevronUp, FiSearch, FiFilter } from 'react-icons/fi';
import { 
  ATTENDANCE_STATUS_CONFIG, 
  getNextStatus, 
  getStatusColorClasses,
  ATTENDANCE_DESIGN_SYSTEM,
  ACCESSIBILITY 
} from '../constants/attendanceConfig';
import AttendanceCell from './AttendanceCell';

/**
 * Mobile-Responsive Card View for Attendance
 * Optimized for mobile devices with touch-friendly interactions
 */
const AttendanceCardView = ({
  students = [],
  sessions = [],
  attendanceData = {},
  selectedCells = new Set(),
  onStatusChange,
  onSelectionChange,
  loading = false,
  className = '',
}) => {
  const [expandedStudents, setExpandedStudents] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const fullName = (student.fullName || '').toLowerCase();
        const email = (student.email || '').toLowerCase();
        if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const studentStatuses = sessions.map(session => 
          attendanceData[student.id]?.[session.id] || 'not_scheduled'
        );
        return studentStatuses.some(status => status === statusFilter);
      }

      return true;
    });
  }, [students, sessions, attendanceData, searchQuery, statusFilter]);

  // Toggle student card expansion
  const toggleStudentExpansion = useCallback((studentId) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  // Calculate student statistics
  const getStudentStats = useCallback((student) => {
    const stats = {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      not_scheduled: 0,
      total: 0,
    };

    sessions.forEach(session => {
      const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
      stats[status] = (stats[status] || 0) + 1;
      stats.total++;
    });

    const attendedCount = stats.present + stats.late;
    const scheduledCount = stats.present + stats.late + stats.absent + stats.excused;
    const attendanceRate = scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

    return { ...stats, attendanceRate };
  }, [sessions, attendanceData]);

  // Handle bulk selection for a student
  const handleStudentBulkSelect = useCallback((studentId, isSelected) => {
    const newSelectedCells = new Set(selectedCells);
    
    sessions.forEach(session => {
      const cellKey = `${studentId}-${session.id}`;
      if (isSelected) {
        newSelectedCells.add(cellKey);
      } else {
        newSelectedCells.delete(cellKey);
      }
    });

    onSelectionChange(newSelectedCells);
  }, [selectedCells, sessions, onSelectionChange]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`attendance-card-view ${className}`}>
      {/* Mobile Filters */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Студент издөө..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Баардык статус</option>
            {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Тазалоо
          </button>
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-4 p-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              Студенттер табылган жок
            </div>
          </div>
        ) : (
          filteredStudents.map(student => {
            const stats = getStudentStats(student);
            const isExpanded = expandedStudents.has(student.id);
            const isAllSelected = sessions.every(session => 
              selectedCells.has(`${student.id}-${session.id}`)
            );

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200"
              >
                {/* Student Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleStudentBulkSelect(student.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {(student.fullName || 'Unknown')
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {student.fullName}
                        </div>
                        {student.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {student.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStudentExpansion(student.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {isExpanded ? (
                        <FiChevronUp className="h-5 w-5" />
                      ) : (
                        <FiChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Student Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Катышуу %:</span>
                      <span className={`font-medium ${stats.attendanceRate >= 75 ? 'text-green-600' : stats.attendanceRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {Math.round(stats.attendanceRate)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Катышкан:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.present + stats.late}/{stats.present + stats.late + stats.absent + stats.excused}
                      </span>
                    </div>
                  </div>

                  {/* Quick Status Overview */}
                  <div className="flex gap-2 mt-3">
                    {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([status, config]) => {
                      const count = stats[status] || 0;
                      if (count === 0) return null;
                      
                      return (
                        <div
                          key={status}
                          className={`
                            flex items-center gap-1 px-2 py-1 rounded-full text-xs
                            ${config.bgColor} ${config.textColor}
                          `}
                        >
                          <config.icon className="h-3 w-3" />
                          {count}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Session Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-3">
                      {sessions.map(session => {
                        const currentStatus = attendanceData[student.id]?.[session.id] || 'not_scheduled';
                        const cellKey = `${student.id}-${session.id}`;
                        const isSelected = selectedCells.has(cellKey);

                        return (
                          <div key={session.id} className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {session.title || `Сессия ${session.sessionIndex}`}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {session.startsAt
                                  ? new Date(session.startsAt).toLocaleDateString('ky-KG', {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'Күнү жок'}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const newSelectedCells = new Set(selectedCells);
                                  if (isSelected) {
                                    newSelectedCells.delete(cellKey);
                                  } else {
                                    newSelectedCells.add(cellKey);
                                  }
                                  onSelectionChange(newSelectedCells);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />

                              <AttendanceCell
                                studentId={student.id}
                                studentName={student.fullName}
                                sessionId={session.id}
                                sessionTitle={session.title}
                                sessionDate={session.startsAt}
                                currentStatus={currentStatus}
                                isSelected={isSelected}
                                size="compact"
                                onStatusChange={onStatusChange}
                                onSelectionChange={onSelectionChange}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

AttendanceCardView.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fullName: PropTypes.string.isRequired,
      email: PropTypes.string,
    })
  ),
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      startsAt: PropTypes.string,
      sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  attendanceData: PropTypes.objectOf(
    PropTypes.objectOf(
      PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused'])
    )
  ),
  selectedCells: PropTypes.instanceOf(Set),
  onStatusChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

AttendanceCardView.defaultProps = {
  students: [],
  sessions: [],
  attendanceData: {},
  selectedCells: new Set(),
  onStatusChange: null,
  onSelectionChange: null,
  loading: false,
  className: '',
};

export default AttendanceCardView;

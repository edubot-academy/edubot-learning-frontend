import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiDownload, FiMail } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  ATTENDANCE_STATUS_CONFIG,
  ACCESSIBILITY,
  ATTENDANCE_DESIGN_SYSTEM
} from '../constants/attendanceConfig';

/**
 * Attendance Bulk Actions Component
 * Provides bulk operations for attendance management
 */
const AttendanceBulkActions = ({
  selectedCells = new Set(),
  students = [],
  sessions = [],
  attendanceData = {},
  onBulkUpdate,
  onExport,
  onNotifyParents,
  loading = false,
  className = '',
}) => {
  // Count selected cells by status
  const selectedByStatus = useMemo(() => {
    const counts = {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      not_scheduled: 0,
      total: 0,
    };

    selectedCells.forEach(cellKey => {
      const [studentId, sessionId] = cellKey.split('-').map(Number);
      const status = attendanceData[studentId]?.[sessionId] || 'not_scheduled';

      if (status in counts) {
        counts[status]++;
        counts.total++;
      }
    });

    return counts;
  }, [selectedCells, attendanceData]);

  // Get unique students and sessions from selection
  const selectedStudents = useMemo(() => {
    const studentIds = new Set();
    selectedCells.forEach(cellKey => {
      const [studentId] = cellKey.split('-').map(Number);
      studentIds.add(studentId);
    });

    return students.filter(student => studentIds.has(student.id));
  }, [selectedCells, students]);

  const selectedSessions = useMemo(() => {
    const sessionIds = new Set();
    selectedCells.forEach(cellKey => {
      const [, sessionId] = cellKey.split('-').map(Number);
      sessionIds.add(sessionId);
    });

    return sessions.filter(session => sessionIds.has(session.id));
  }, [selectedCells, sessions]);

  // Handle bulk status update
  const handleBulkStatusUpdate = useCallback(async (status) => {
    if (selectedCells.size === 0) return;

    const updates = Array.from(selectedCells).map(cellKey => {
      const [studentId, sessionId] = cellKey.split('-').map(Number);
      return { studentId, sessionId, status };
    });

    try {
      await onBulkUpdate(updates);
      toast.success(`${updates.length} катышуу жазылгасы "${status}" деп жаңыртылды`);
    } catch (error) {
      toast.error('Көп жаңыртуу мүмкүн болбоду');
    }
  }, [selectedCells, onBulkUpdate]);

  // Handle export
  const handleExport = useCallback(async (format = 'csv') => {
    if (selectedStudents.length === 0) {
      toast.error('Экспорт үчүн студенттерди тандаңыз');
      return;
    }

    try {
      const studentIds = selectedStudents.map(s => s.id);
      const sessionIds = selectedSessions.map(s => s.id);

      await onExport({
        studentIds,
        sessionIds,
        format,
        includeAttendanceData: true,
      });

      toast.success('Катышуу маалыматы экспорттолду');
    } catch (error) {
      toast.error('Экспорт мүмкүн болбоду');
    }
  }, [selectedStudents, selectedSessions, onExport]);

  // Handle parent notification
  const handleNotifyParents = useCallback(async () => {
    if (selectedStudents.length === 0) {
      toast.error('Билдирүү үчүн студенттерди тандаңыз');
      return;
    }

    // Count absent/late students for notification
    const absentOrLateStudents = selectedStudents.filter(student => {
      return selectedCells.some(cellKey => {
        const [studentId, sessionId] = cellKey.split('-').map(Number);
        if (studentId !== student.id) return false;

        const status = attendanceData[studentId]?.[sessionId] || 'not_scheduled';
        return status === SESSION_ATTENDANCE_STATUS.ABSENT || status === SESSION_ATTENDANCE_STATUS.LATE;
      });
    });

    if (absentOrLateStudents.length === 0) {
      toast.info('Билдирүү керек болгон студенттер жок');
      return;
    }

    try {
      await onNotifyParents({
        studentIds: absentOrLateStudents.map(s => s.id),
        sessions: selectedSessions,
        message: 'Баланыңыздын сессияга катышуусу жөнүндө маалымат',
      });

      toast.success(`${absentOrLateStudents.length} ата-энеге билдирүү жөнөтүлдү`);
    } catch (error) {
      toast.error('Билдирүү жөнөтүү мүмкүн болбоду');
    }
  }, [selectedStudents, selectedSessions, selectedCells, attendanceData, onNotifyParents]);

  // Quick action presets
  const quickActions = useMemo(() => [
    {
      key: 'mark_all_present',
      label: 'Баарын катышты деп белгиле',
      icon: ATTENDANCE_STATUS_CONFIG.present.icon,
      action: () => handleBulkStatusUpdate('present'),
      color: 'green',
      show: selectedByStatus.total > 0,
    },
    {
      key: 'mark_all_absent',
      label: 'Баарын келген жок деп белгиле',
      icon: ATTENDANCE_STATUS_CONFIG.absent.icon,
      action: () => handleBulkStatusUpdate('absent'),
      color: 'red',
      show: selectedByStatus.total > 0,
    },
    {
      key: 'clear_absent',
      label: 'Келген жокторду тазалоо',
      icon: ATTENDANCE_STATUS_CONFIG.present.icon,
      action: () => {
        const absentUpdates = Array.from(selectedCells)
          .filter(cellKey => {
            const [studentId, sessionId] = cellKey.split('-').map(Number);
            const status = attendanceData[studentId]?.[sessionId] || 'not_scheduled';
            return status === 'absent';
          })
          .map(cellKey => {
            const [studentId, sessionId] = cellKey.split('-').map(Number);
            return { studentId, sessionId, status: 'present' };
          });

        if (absentUpdates.length > 0) {
          onBulkUpdate(absentUpdates);
          toast.success(`${absentUpdates.length} келген жок катышуу тазаланды`);
        }
      },
      color: 'green',
      show: selectedByStatus.absent > 0,
    },
  ], [selectedByStatus.total, selectedByStatus.absent, selectedCells, attendanceData, onBulkUpdate]);

  if (selectedCells.size === 0) {
    return null;
  }

  return (
    <div className={`sticky bottom-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg ${className}`}>
      <div className="space-y-4">
        {/* Selection Summary */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedCells.size} клетка тандалды
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedStudents.length} студент • {selectedSessions.length} сессия
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="flex gap-4 text-xs">
            {selectedByStatus.present > 0 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ATTENDANCE_STATUS_CONFIG.present.icon />
                {selectedByStatus.present}
              </div>
            )}
            {selectedByStatus.late > 0 && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <ATTENDANCE_STATUS_CONFIG.late.icon />
                {selectedByStatus.late}
              </div>
            )}
            {selectedByStatus.absent > 0 && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <ATTENDANCE_STATUS_CONFIG.absent.icon />
                {selectedByStatus.absent}
              </div>
            )}
            {selectedByStatus.excused > 0 && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <ATTENDANCE_STATUS_CONFIG.excused.icon />
                {selectedByStatus.excused}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map(action => (
            action.show && (
              <button
                key={action.key}
                onClick={action.action}
                disabled={loading}
                className={`dashboard-button-secondary text-xs px-3 py-1.5 ${action.color === 'green'
                  ? 'text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  : action.color === 'red'
                    ? 'text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20'
                  } disabled:opacity-50`}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </button>
            )
          ))}
        </div>

        {/* Bulk Status Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleBulkStatusUpdate('present')}
            disabled={loading}
            className="dashboard-button-secondary text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
          >
            <ATTENDANCE_STATUS_CONFIG.present.icon className="h-4 w-4" />
            Катышты деп белгиле
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('late')}
            disabled={loading}
            className="dashboard-button-secondary text-amber-600 border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
          >
            <ATTENDANCE_STATUS_CONFIG.late.icon className="h-4 w-4" />
            Кечикти деп белгиле
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('absent')}
            disabled={loading}
            className="dashboard-button-secondary text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <ATTENDANCE_STATUS_CONFIG.absent.icon className="h-4 w-4" />
            Келген жок деп белгиле
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('excused')}
            disabled={loading}
            className="dashboard-button-secondary text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
          >
            <ATTENDANCE_STATUS_CONFIG.excused.icon className="h-4 w-4" />
            Себептүү деп белгиле
          </button>
        </div>

        {/* Advanced Actions */}
        <div className="flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => handleExport('csv')}
            disabled={loading || selectedStudents.length === 0}
            className="dashboard-button-secondary text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 disabled:opacity-50"
          >
            <FiDownload className="h-4 w-4" />
            CSV экспорт
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={loading || selectedStudents.length === 0}
            className="dashboard-button-secondary text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 disabled:opacity-50"
          >
            <FiDownload className="h-4 w-4" />
            Excel экспорт
          </button>
          <button
            onClick={handleNotifyParents}
            disabled={loading || selectedStudents.length === 0}
            className="dashboard-button-secondary text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
          >
            <FiMail className="h-4 w-4" />
            Ата-энеге билдирүү
          </button>
          <button
            onClick={() => {
              // Clear selection
              if (onBulkUpdate) {
                onBulkUpdate([]);
              }
            }}
            className="dashboard-button-secondary"
          >
            Тандоону тазалоо
          </button>
        </div>
      </div>
    </div>
  );
};

AttendanceBulkActions.propTypes = {
  selectedCells: PropTypes.instanceOf(Set).isRequired,
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string,
  })),
  sessions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    startsAt: PropTypes.string,
    sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  attendanceData: PropTypes.objectOf(
    PropTypes.objectOf(PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused']))
  ),
  onBulkUpdate: PropTypes.func.isRequired,
  onExport: PropTypes.func,
  onNotifyParents: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

AttendanceBulkActions.defaultProps = {
  students: [],
  sessions: [],
  attendanceData: {},
  onExport: null,
  onNotifyParents: null,
  loading: false,
  className: '',
};

export default AttendanceBulkActions;

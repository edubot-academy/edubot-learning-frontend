import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { FiDownload, FiMail } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
  ATTENDANCE_STATUS_CONFIG,
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
  const { t } = useTranslation();

  const getStatusLabel = useCallback((status) => {
    const key = status === 'not_scheduled' ? 'notScheduled' : status;
    return t(`attendance.status.${key}`, { defaultValue: status });
  }, [t]);

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
      toast.success(t('attendance.bulk.toasts.updateSuccess', {
        count: updates.length,
        status: getStatusLabel(status),
      }));
    } catch {
      toast.error(t('attendance.bulk.toasts.updateFailed'));
    }
  }, [selectedCells, onBulkUpdate, t, getStatusLabel]);

  // Handle export
  const handleExport = useCallback(async (format = 'csv') => {
    if (selectedStudents.length === 0) {
      toast.error(t('attendance.bulk.toasts.selectStudentsForExport'));
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

      toast.success(t('attendance.bulk.toasts.exportSuccess'));
    } catch {
      toast.error(t('attendance.bulk.toasts.exportFailed'));
    }
  }, [selectedStudents, selectedSessions, onExport, t]);

  // Handle parent notification
  const handleNotifyParents = useCallback(async () => {
    if (selectedStudents.length === 0) {
      toast.error(t('attendance.bulk.toasts.selectStudentsForNotification'));
      return;
    }

    // Count absent/late students for notification
    const absentOrLateStudents = selectedStudents.filter(student => {
      return Array.from(selectedCells).some(cellKey => {
        const [studentId, sessionId] = cellKey.split('-').map(Number);
        if (studentId !== student.id) return false;

        const status = attendanceData[studentId]?.[sessionId] || 'not_scheduled';
        return status === SESSION_ATTENDANCE_STATUS.ABSENT || status === SESSION_ATTENDANCE_STATUS.LATE;
      });
    });

    if (absentOrLateStudents.length === 0) {
      toast.info(t('attendance.bulk.toasts.noStudentsToNotify'));
      return;
    }

    try {
      await onNotifyParents({
        studentIds: absentOrLateStudents.map(s => s.id),
        sessions: selectedSessions,
        message: t('attendance.bulk.notificationMessage'),
      });

      toast.success(t('attendance.bulk.toasts.notifySuccess', {
        count: absentOrLateStudents.length,
      }));
    } catch {
      toast.error(t('attendance.bulk.toasts.notifyFailed'));
    }
  }, [selectedStudents, selectedSessions, selectedCells, attendanceData, onNotifyParents, t]);

  // Quick action presets
  const quickActions = useMemo(() => [
    {
      key: 'mark_all_present',
      label: t('attendance.bulk.quickActions.markAllPresent'),
      icon: ATTENDANCE_STATUS_CONFIG.present.icon,
      action: () => handleBulkStatusUpdate('present'),
      color: 'green',
      show: selectedByStatus.total > 0,
    },
    {
      key: 'mark_all_absent',
      label: t('attendance.bulk.quickActions.markAllAbsent'),
      icon: ATTENDANCE_STATUS_CONFIG.absent.icon,
      action: () => handleBulkStatusUpdate('absent'),
      color: 'red',
      show: selectedByStatus.total > 0,
    },
    {
      key: 'clear_absent',
      label: t('attendance.bulk.quickActions.clearAbsent'),
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
          toast.success(t('attendance.bulk.toasts.clearAbsentSuccess', {
            count: absentUpdates.length,
          }));
        }
      },
      color: 'green',
      show: selectedByStatus.absent > 0,
    },
  ], [selectedByStatus.total, selectedByStatus.absent, selectedCells, attendanceData, onBulkUpdate, handleBulkStatusUpdate, t]);

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
              {t('attendance.bulk.selection.cellsSelected', { count: selectedCells.size })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('attendance.bulk.selection.summary', {
                students: selectedStudents.length,
                sessions: selectedSessions.length,
              })}
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
            {t('attendance.bulk.actions.markPresent')}
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('late')}
            disabled={loading}
            className="dashboard-button-secondary text-amber-600 border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
          >
            <ATTENDANCE_STATUS_CONFIG.late.icon className="h-4 w-4" />
            {t('attendance.bulk.actions.markLate')}
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('absent')}
            disabled={loading}
            className="dashboard-button-secondary text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <ATTENDANCE_STATUS_CONFIG.absent.icon className="h-4 w-4" />
            {t('attendance.bulk.actions.markAbsent')}
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('excused')}
            disabled={loading}
            className="dashboard-button-secondary text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
          >
            <ATTENDANCE_STATUS_CONFIG.excused.icon className="h-4 w-4" />
            {t('attendance.bulk.actions.markExcused')}
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
            {t('attendance.bulk.actions.exportCsv')}
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={loading || selectedStudents.length === 0}
            className="dashboard-button-secondary text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 disabled:opacity-50"
          >
            <FiDownload className="h-4 w-4" />
            {t('attendance.bulk.actions.exportExcel')}
          </button>
          <button
            onClick={handleNotifyParents}
            disabled={loading || selectedStudents.length === 0}
            className="dashboard-button-secondary text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
          >
            <FiMail className="h-4 w-4" />
            {t('attendance.bulk.actions.notifyParents')}
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
            {t('attendance.bulk.actions.clearSelection')}
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

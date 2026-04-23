import { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { 
  getStatusConfig, 
  getNextStatus, 
  getStatusColorClasses, 
  CELL_SIZES,
  ACCESSIBILITY,
  ATTENDANCE_DESIGN_SYSTEM 
} from '../constants/attendanceConfig';

/**
 * Individual Attendance Cell Component
 * Handles single attendance status display and interaction
 */
const AttendanceCell = memo(({
  studentId,
  studentName,
  sessionId,
  sessionTitle,
  sessionDate,
  currentStatus,
  isSelected,
  isUpdating,
  isDisabled,
  size = 'default',
  onStatusChange,
  onSelectionChange,
  className = '',
}) => {
  const statusConfig = getStatusConfig(currentStatus);
  const colorClasses = getStatusColorClasses(currentStatus);
  const sizeConfig = CELL_SIZES[size];
  const Icon = statusConfig.icon;

  const isSessionIncomplete = sessionDate && new Date(sessionDate) > new Date();

  const handleClick = useCallback(() => {
    if (isDisabled || isUpdating || isSessionIncomplete) return;

    const nextStatus = getNextStatus(currentStatus);
    onStatusChange?.(studentId, sessionId, nextStatus);
    onSelectionChange?.(studentId, sessionId);
  }, [
    isDisabled,
    isUpdating,
    isSessionIncomplete,
    currentStatus,
    studentId,
    sessionId,
    onStatusChange,
    onSelectionChange,
  ]);

  const handleKeyDown = useCallback((event) => {
    if (isDisabled || isUpdating || isSessionIncomplete) return;

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        handleClick();
        break;
      default:
        break;
    }
  }, [isDisabled, isUpdating, isSessionIncomplete, handleClick]);

  const cellClasses = [
    'attendance-cell',
    'relative',
    'p-2',
    'text-center',
    'transition-all',
    ATTENDANCE_DESIGN_SYSTEM.transitions.normal,
    sizeConfig.width,
    sizeConfig.height,
    'rounded-lg',
    'border-2',
    colorClasses.bg,
    colorClasses.border,
    colorClasses.text,
    colorClasses.hover,
    // Selection state
    isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : '',
    // Disabled state
    isDisabled || isSessionIncomplete ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    // Loading state
    isUpdating ? 'animate-pulse' : '',
    className,
  ].filter(Boolean).join(' ');

  const ariaLabel = ACCESSIBILITY.labels.attendanceCell
    .replace('{studentName}', studentName)
    .replace('{sessionTitle}', sessionTitle || `Session ${sessionId}`);

  return (
    <td
      className={cellClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isDisabled || isSessionIncomplete ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || isSessionIncomplete}
      data-student-id={studentId}
      data-session-id={sessionId}
      data-status={currentStatus}
      data-selected={isSelected}
    >
      <div className="flex flex-col items-center justify-center space-y-1">
        {/* Status Icon */}
        <div
          className={`
            flex items-center justify-center
            ${isSessionIncomplete ? 'grayscale' : ''}
          `}
        >
          <Icon className={`${sizeConfig.fontSize} font-medium`} />
        </div>

        {/* Status Text for larger sizes */}
        {(size === 'large' || size === 'default') && (
          <span className={`${sizeConfig.fontSize} font-medium truncate`}>
            {statusConfig.shortLabel}
          </span>
        )}

        {/* Selection indicator */}
        {isSelected && !isUpdating && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}

        {/* Loading indicator */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </td>
  );
});

AttendanceCell.displayName = 'AttendanceCell';

AttendanceCell.propTypes = {
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  studentName: PropTypes.string.isRequired,
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sessionTitle: PropTypes.string,
  sessionDate: PropTypes.string,
  currentStatus: PropTypes.oneOf(['present', 'late', 'absent', 'excused', 'not_scheduled']),
  isSelected: PropTypes.bool,
  isUpdating: PropTypes.bool,
  isDisabled: PropTypes.bool,
  size: PropTypes.oneOf(['compact', 'default', 'large']),
  onStatusChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  className: PropTypes.string,
};

AttendanceCell.defaultProps = {
  currentStatus: 'not_scheduled',
  isSelected: false,
  isUpdating: false,
  isDisabled: false,
  size: 'default',
  onStatusChange: null,
  onSelectionChange: null,
  className: '',
};

export default AttendanceCell;

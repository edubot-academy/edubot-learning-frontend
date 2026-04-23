/**
 * Consolidated Attendance Feature Module
 * Centralizes all attendance-related exports for easy importing
 */

// Main unified component (recommended for all new usage)
export { default as UnifiedAttendanceTable } from './components/UnifiedAttendanceTable';

// Individual components (for advanced usage)
export { default as AttendanceFilters } from './components/AttendanceFilters';
export { default as AttendanceBulkActions } from './components/AttendanceBulkActions';
export { default as EnhancedAttendanceSummary } from './components/EnhancedAttendanceSummary';
export { default as AttendanceSummary } from './components/AttendanceSummary';
export { default as AttendanceCell } from './components/AttendanceCell';
export { default as AttendanceCardView } from './components/AttendanceCardView';
export { default as VirtualizedAttendanceTable } from './components/VirtualizedAttendanceTable';
export { default as AttendanceLoadingStates } from './components/AttendanceLoadingStates';

// Legacy components (deprecated - use UnifiedAttendanceTable instead)
export { default as AttendanceTableView } from './components/AttendanceTableView';
export { default as AttendanceTable } from './components/AttendanceTable';

// Hooks
export { useAccessibility, useLiveRegion, useFocusRestoration } from './hooks/useAccessibility';
export {
  useAttendanceData,
  useAttendanceUpdates,
  useAttendanceFilters,
} from './hooks/useAttendanceData';

// Constants and configuration
export {
  ATTENDANCE_STATUS_CONFIG,
  ATTENDANCE_STATUS_CYCLE,
  ATTENDANCE_DESIGN_SYSTEM,
  CELL_SIZES,
  PERFORMANCE_THRESHOLDS,
  ACCESSIBILITY,
  getStatusConfig,
  getNextStatus,
  getStatusColorClasses,
  getAttendanceRateColor,
  getAttendanceRateBackground,
} from './constants/attendanceConfig';

export {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
  Z_INDEX,
  COMPONENT_STYLES,
  BREAKPOINTS,
  LAYOUT,
  ANIMATIONS,
  getStatusClasses,
  getButtonClasses,
  getInputClasses,
} from './constants/designSystem';

// Utilities
export {
  getAttendanceErrorMessage,
  handleAttendanceError,
  handleAttendanceSuccess,
  validateAndNormalizeResponse,
  retryApiCall,
  debounce,
  formatStudentName,
  formatSessionTitle,
  formatDate,
  calculateAttendanceRate,
} from './utils/errorHandling';

// Types and PropTypes
export {
  studentShape,
  sessionShape,
  attendanceDataShape,
  attendanceRecordShape,
  filtersShape,
  statisticsShape,
  errorShape,
  apiResponseShape,
  courseShape,
  groupShape,
  commonComponentProps,
  filterComponentProps,
  cellComponentProps,
  summaryComponentProps,
  bulkActionsComponentProps,
  loadingStatesComponentProps,
  defaultProps,
  filterDefaults,
  cellDefaults,
  summaryDefaults,
} from './types/propTypes';

// API functions
export {
  fetchSessionAttendance,
  markSessionAttendanceBulk,
} from './api';
export {
  fetchAttendanceOverview,
  fetchAdminAttendanceOverview,
  updateAttendance,
  adminUpdateAttendance,
  fetchAttendanceStatistics,
  fetchAdminAttendanceStatistics,
  exportAttendanceData,
  adminExportAttendanceData,
  fetchStudentAttendanceHistory,
  fetchAttendanceTrends,
  downloadAttendanceFile,
  validateAttendanceData,
  attendanceCache,
} from './api/attendanceApi';

// Legacy constants (for backward compatibility)
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  NOT_SCHEDULED: 'not_scheduled',
  EXCUSED: 'excused',
};

export const ATTENDANCE_VIEW_MODE = {
  TABLE: 'table',
  SESSION: 'session',
};

/**
 * Recommended Usage:
 * 
 * // For most cases, use the unified component:
 * import { UnifiedAttendanceTable } from '@/features/attendance';
 * 
 * // For specific utilities:
 * import { handleAttendanceError, formatStudentName } from '@/features/attendance';
 * 
 * // For design system:
 * import { COLORS, COMPONENT_STYLES } from '@/features/attendance';
 * 
 * // For types:
 * import { studentShape, sessionShape } from '@/features/attendance';
 */

// Default export is the unified table component
export { default } from './components/UnifiedAttendanceTable';

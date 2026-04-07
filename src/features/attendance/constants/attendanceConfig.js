import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiMinus,
} from 'react-icons/fi';

/**
 * Unified Attendance Status Configuration
 * Ensures consistent styling and behavior across all attendance components
 */
export const ATTENDANCE_STATUS_CONFIG = {
  [SESSION_ATTENDANCE_STATUS.PRESENT]: {
    id: SESSION_ATTENDANCE_STATUS.PRESENT,
    label: 'Катышты',
    shortLabel: 'Катышты',
    icon: FiCheckCircle,
    simpleIcon: '✓',
    color: 'green',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-900/40',
    textColor: 'text-emerald-700',
    darkTextColor: 'dark:text-emerald-300',
    borderColor: 'border-emerald-200',
    darkBorderColor: 'dark:border-emerald-500/30',
    hoverBgColor: 'hover:bg-emerald-50',
    darkHoverBgColor: 'dark:hover:bg-emerald-900/20',
    tone: 'success',
    order: 1,
  },
  [SESSION_ATTENDANCE_STATUS.LATE]: {
    id: SESSION_ATTENDANCE_STATUS.LATE,
    label: 'Кечикти',
    shortLabel: 'Кечикти',
    icon: FiClock,
    simpleIcon: '◦',
    color: 'amber',
    bgColor: 'bg-amber-100',
    darkBgColor: 'dark:bg-amber-900/40',
    textColor: 'text-amber-700',
    darkTextColor: 'dark:text-amber-300',
    borderColor: 'border-amber-200',
    darkBorderColor: 'dark:border-amber-500/30',
    hoverBgColor: 'hover:bg-amber-50',
    darkHoverBgColor: 'dark:hover:bg-amber-900/20',
    tone: 'warning',
    order: 2,
  },
  [SESSION_ATTENDANCE_STATUS.ABSENT]: {
    id: SESSION_ATTENDANCE_STATUS.ABSENT,
    label: 'Келген жок',
    shortLabel: 'Келген жок',
    icon: FiXCircle,
    simpleIcon: '✗',
    color: 'red',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/40',
    textColor: 'text-red-700',
    darkTextColor: 'dark:text-red-300',
    borderColor: 'border-red-200',
    darkBorderColor: 'dark:border-red-500/30',
    hoverBgColor: 'hover:bg-red-50',
    darkHoverBgColor: 'dark:hover:bg-red-900/20',
    tone: 'danger',
    order: 3,
  },
  [SESSION_ATTENDANCE_STATUS.EXCUSED]: {
    id: SESSION_ATTENDANCE_STATUS.EXCUSED,
    label: 'Себептүү',
    shortLabel: 'Себептүү',
    icon: FiAlertCircle,
    simpleIcon: '○',
    color: 'blue',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-900/40',
    textColor: 'text-blue-700',
    darkTextColor: 'dark:text-blue-300',
    borderColor: 'border-blue-200',
    darkBorderColor: 'dark:border-blue-500/30',
    hoverBgColor: 'hover:bg-blue-50',
    darkHoverBgColor: 'dark:hover:bg-blue-900/20',
    tone: 'info',
    order: 4,
  },
  not_scheduled: {
    id: 'not_scheduled',
    label: 'Күтүлүүдө',
    shortLabel: 'Күтүлүүдө',
    icon: FiClock,
    simpleIcon: '-',
    color: 'gray',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-gray-800',
    textColor: 'text-gray-500',
    darkTextColor: 'dark:text-gray-400',
    borderColor: 'border-gray-200',
    darkBorderColor: 'dark:border-gray-700',
    hoverBgColor: 'hover:bg-gray-50',
    darkHoverBgColor: 'dark:hover:bg-gray-900/20',
    tone: 'default',
    order: 5,
  },
};

/**
 * Status cycle for single-click interactions
 */
export const ATTENDANCE_STATUS_CYCLE = [
  SESSION_ATTENDANCE_STATUS.PRESENT,
  SESSION_ATTENDANCE_STATUS.LATE,
  SESSION_ATTENDANCE_STATUS.ABSENT,
  SESSION_ATTENDANCE_STATUS.EXCUSED,
];

/**
 * Design system constants for attendance components
 */
export const ATTENDANCE_DESIGN_SYSTEM = {
  // Spacing
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },

  // Typography
  typography: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  },

  // Transitions
  transitions: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  // Z-index layers
  zIndex: {
    base: 'z-10',
    sticky: 'z-20',
    dropdown: 'z-30',
    modal: 'z-40',
    toast: 'z-50',
  },
};

/**
 * Cell size configurations for different view modes
 */
export const CELL_SIZES = {
  compact: {
    width: 'w-8',
    height: 'h-8',
    fontSize: 'text-xs',
  },
  default: {
    width: 'w-10',
    height: 'h-10',
    fontSize: 'text-sm',
  },
  large: {
    width: 'w-12',
    height: 'h-12',
    fontSize: 'text-base',
  },
};

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  VIRTUAL_SCROLLING_THRESHOLD: 100,
  PAGINATION_THRESHOLD: 50,
  DEBOUNCE_DELAY: 300,
  BATCH_SIZE: 25,
};

/**
 * Accessibility constants
 */
export const ACCESSIBILITY = {
  // ARIA labels
  labels: {
    attendanceCell: 'Change attendance status for {studentName} in {sessionTitle}',
    statusButton: 'Mark {studentName} as {status}',
    bulkAction: 'Mark selected students as {status}',
    clearSelection: 'Clear all selections',
    saveChanges: 'Save attendance changes',
  },

  // Keyboard shortcuts
  shortcuts: {
    cycleStatus: 'Space',
    selectMultiple: 'Shift + Click',
    clearSelection: 'Escape',
    saveChanges: 'Ctrl + S',
  },

  // Screen reader announcements
  announcements: {
    statusChanged: 'Attendance status changed to {status}',
    selectionCleared: 'Selection cleared',
    changesSaved: 'All changes saved successfully',
    error: 'Error: {message}',
  },
};

/**
 * Utility functions for attendance status
 */
export const getStatusConfig = (status) => {
  return ATTENDANCE_STATUS_CONFIG[status] || ATTENDANCE_STATUS_CONFIG.not_scheduled;
};

export const getNextStatus = (currentStatus) => {
  const currentIndex = ATTENDANCE_STATUS_CYCLE.indexOf(currentStatus);
  if (currentIndex === -1) return ATTENDANCE_STATUS_CYCLE[0];
  const nextIndex = (currentIndex + 1) % ATTENDANCE_STATUS_CYCLE.length;
  return ATTENDANCE_STATUS_CYCLE[nextIndex];
};

export const getStatusColorClasses = (status, isDark = false) => {
  const config = getStatusConfig(status);
  return {
    bg: isDark ? config.darkBgColor : config.bgColor,
    text: isDark ? config.darkTextColor : config.textColor,
    border: isDark ? config.darkBorderColor : config.borderColor,
    hover: isDark ? config.darkHoverBgColor : config.hoverBgColor,
  };
};

export const getAttendanceRateColor = (rate) => {
  if (rate >= 90) return 'text-green-600 dark:text-green-400';
  if (rate >= 75) return 'text-blue-600 dark:text-blue-400';
  if (rate >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

export const getAttendanceRateBackground = (rate) => {
  if (rate >= 90) return 'bg-green-100 dark:bg-green-900/20';
  if (rate >= 75) return 'bg-blue-100 dark:bg-blue-900/20';
  if (rate >= 50) return 'bg-amber-100 dark:bg-amber-900/20';
  return 'bg-red-100 dark:bg-red-900/20';
};

import PropTypes from 'prop-types';

/**
 * Comprehensive PropTypes definitions for attendance components
 * Ensures type safety and consistent data structures across the attendance feature
 */

// Base student shape
export const studentShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  fullName: PropTypes.string,
  name: PropTypes.string, // Legacy support
  email: PropTypes.string,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Alternative ID field
  user: PropTypes.shape({
    fullName: PropTypes.string,
    email: PropTypes.string,
  }),
});

// Session shape
export const sessionShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startsAt: PropTypes.string,
  endsAt: PropTypes.string,
  date: PropTypes.string, // Legacy support
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

// Attendance data shape
export const attendanceDataShape = PropTypes.objectOf(
  PropTypes.objectOf(
    PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused'])
  )
);

// Attendance record shape
export const attendanceRecordShape = PropTypes.shape({
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused']).isRequired,
  notes: PropTypes.string,
  joinedAt: PropTypes.string,
  leftAt: PropTypes.string,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Alternative
});

// Filter shape
export const filtersShape = PropTypes.shape({
  searchQuery: PropTypes.string,
  statusFilter: PropTypes.string,
  dateRange: PropTypes.string,
  attendanceRateFilter: PropTypes.string,
  sessionFilter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  customStartDate: PropTypes.string,
  customEndDate: PropTypes.string,
});

// Statistics shape
export const statisticsShape = PropTypes.shape({
  totals: PropTypes.shape({
    present: PropTypes.number,
    late: PropTypes.number,
    absent: PropTypes.number,
    excused: PropTypes.number,
    not_scheduled: PropTypes.number,
    total: PropTypes.number,
  }),
  percentages: PropTypes.shape({
    present: PropTypes.number,
    late: PropTypes.number,
    absent: PropTypes.number,
    excused: PropTypes.number,
    not_scheduled: PropTypes.number,
  }),
  attendanceRate: PropTypes.number,
  scheduledTotal: PropTypes.number,
  studentStats: PropTypes.object,
  sessionStats: PropTypes.object,
  trends: PropTypes.object,
});

// Error shape
export const errorShape = PropTypes.shape({
  message: PropTypes.string,
  response: PropTypes.shape({
    status: PropTypes.number,
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
      PropTypes.string,
    ]),
  }),
});

// API response shapes
export const apiResponseShape = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.shape({
    items: PropTypes.array,
    data: PropTypes.array,
    rows: PropTypes.array,
    total: PropTypes.number,
    page: PropTypes.number,
    limit: PropTypes.number,
  }),
]);

// Course shape
export const courseShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  name: PropTypes.string,
  courseType: PropTypes.string,
  type: PropTypes.string,
  status: PropTypes.string,
});

// Group shape
export const groupShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  code: PropTypes.string,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.string,
});

// Common component props
export const commonComponentProps = {
  // Data
  students: PropTypes.arrayOf(studentShape).isRequired,
  sessions: PropTypes.arrayOf(sessionShape).isRequired,
  attendanceData: attendanceDataShape,
  
  // Loading states
  loading: PropTypes.bool,
  error: errorShape,
  
  // Configuration
  groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  groupName: PropTypes.string,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
  // UI options
  className: PropTypes.string,
  viewMode: PropTypes.oneOf(['auto', 'table', 'cards', 'virtualized']),
  showAdvancedFilters: PropTypes.bool,
  showStudentBreakdown: PropTypes.bool,
  showSessionBreakdown: PropTypes.bool,
  
  // Callbacks
  onAttendanceUpdate: PropTypes.func,
  onFiltersChange: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onBulkUpdate: PropTypes.func,
};

// Filter component props
export const filterComponentProps = {
  students: PropTypes.arrayOf(studentShape),
  sessions: PropTypes.arrayOf(sessionShape),
  filters: filtersShape.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  showAdvancedFilters: PropTypes.bool,
};

// Cell component props
export const cellComponentProps = {
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  studentName: PropTypes.string.isRequired,
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sessionTitle: PropTypes.string,
  sessionDate: PropTypes.string,
  currentStatus: PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused']).isRequired,
  isSelected: PropTypes.bool,
  isUpdating: PropTypes.bool,
  size: PropTypes.oneOf(['compact', 'default', 'large']),
  onStatusChange: PropTypes.func.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  // Accessibility props
  'aria-label': PropTypes.string,
  'aria-pressed': PropTypes.bool,
  role: PropTypes.string,
  tabIndex: PropTypes.number,
};

// Summary component props
export const summaryComponentProps = {
  students: PropTypes.arrayOf(studentShape),
  sessions: PropTypes.arrayOf(sessionShape),
  attendanceData: attendanceDataShape,
  previousPeriodData: PropTypes.shape({
    attendanceRate: PropTypes.number,
  }),
  showTrends: PropTypes.bool,
  showStudentBreakdown: PropTypes.bool,
  showSessionBreakdown: PropTypes.bool,
  className: PropTypes.string,
};

// Bulk actions component props
export const bulkActionsComponentProps = {
  selectedCells: PropTypes.instanceOf(Set).isRequired,
  students: PropTypes.arrayOf(studentShape).isRequired,
  sessions: PropTypes.arrayOf(sessionShape).isRequired,
  attendanceData: attendanceDataShape,
  onBulkUpdate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

// Loading states component props
export const loadingStatesComponentProps = {
  isVisible: PropTypes.bool,
  message: PropTypes.string,
  rowCount: PropTypes.number,
  columnCount: PropTypes.number,
  cardCount: PropTypes.number,
  type: PropTypes.oneOf(['students', 'filtered', 'sessions']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onRetry: PropTypes.func,
};

// Default props
export const defaultProps = {
  groupName: '',
  courseId: null,
  attendanceData: {},
  loading: false,
  error: null,
  className: '',
  viewMode: 'auto',
  showAdvancedFilters: true,
  showStudentBreakdown: true,
  showSessionBreakdown: false,
  onAttendanceUpdate: null,
  onFiltersChange: null,
  onStatusChange: null,
  onSelectionChange: null,
  onBulkUpdate: null,
};

// Filter defaults
export const filterDefaults = {
  students: [],
  sessions: [],
  filters: {
    searchQuery: '',
    statusFilter: 'all',
    dateRange: 'all',
    attendanceRateFilter: 'all',
    sessionFilter: 'all',
    customStartDate: '',
    customEndDate: '',
  },
  className: '',
  showAdvancedFilters: false,
};

// Cell defaults
export const cellDefaults = {
  sessionTitle: '',
  sessionDate: null,
  isSelected: false,
  isUpdating: false,
  size: 'default',
  onStatusChange: null,
  onSelectionChange: null,
  onKeyDown: null,
};

// Summary defaults
export const summaryDefaults = {
  students: [],
  sessions: [],
  attendanceData: {},
  previousPeriodData: null,
  showTrends: false,
  showStudentBreakdown: false,
  showSessionBreakdown: false,
  className: '',
};

export default {
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
};

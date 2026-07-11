import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import { getAttendanceStatusTranslationKey } from './attendanceStatusData';

export const createEmptyAttendanceFilters = () => ({
  searchQuery: '',
  statusFilter: 'all',
  dateRange: 'all',
  attendanceRateFilter: 'all',
  sessionFilter: 'all',
  customStartDate: '',
  customEndDate: '',
});

export const createAttendanceStatusOptions = (t) => [
  { value: 'all', label: t('attendance.filters.all'), color: 'gray' },
  ...[
    SESSION_ATTENDANCE_STATUS.PRESENT,
    SESSION_ATTENDANCE_STATUS.LATE,
    SESSION_ATTENDANCE_STATUS.ABSENT,
    SESSION_ATTENDANCE_STATUS.EXCUSED,
    'not_scheduled',
  ].map((value) => ({
    value,
    label: t(`attendance.status.${getAttendanceStatusTranslationKey(value)}`),
    color:
      value === SESSION_ATTENDANCE_STATUS.PRESENT
        ? 'green'
        : value === SESSION_ATTENDANCE_STATUS.LATE
          ? 'amber'
          : value === SESSION_ATTENDANCE_STATUS.ABSENT
            ? 'red'
            : value === SESSION_ATTENDANCE_STATUS.EXCUSED
              ? 'blue'
              : 'gray',
  })),
];

export const createAttendanceRateRanges = (t) => [
  { value: 'all', label: t('attendance.filters.all') },
  { value: 'perfect', label: '100%', min: 100, max: 100 },
  { value: 'excellent', label: '90-100%', min: 90, max: 100 },
  { value: 'good', label: '75-90%', min: 75, max: 90 },
  { value: 'fair', label: '50-75%', min: 50, max: 75 },
  { value: 'poor', label: t('attendance.filters.rateBelow50'), min: 0, max: 50 },
];

export const setAttendanceFiltersValue = (filters = {}, key, value) => {
  const newFilters = { ...filters, [key]: value };

  if (key === 'statusFilter' && value === 'all') {
    newFilters.statusFilter = 'all';
  }

  if (key === 'dateRange' && value !== 'custom') {
    newFilters.customStartDate = '';
    newFilters.customEndDate = '';
  }

  return newFilters;
};

export const hasActiveAttendanceDashboardFilters = (filters = {}) =>
  (filters.searchQuery || '') !== '' ||
  (filters.statusFilter || 'all') !== 'all' ||
  (filters.dateRange || 'all') !== 'all' ||
  (filters.attendanceRateFilter || 'all') !== 'all' ||
  (filters.sessionFilter || 'all') !== 'all' ||
  ((filters.dateRange || 'all') === 'custom' &&
    ((filters.customStartDate || '') !== '' || (filters.customEndDate || '') !== ''));

export const getActiveAttendanceDashboardFilterCount = (filters = {}) => {
  let count = 0;

  if ((filters.searchQuery || '') !== '') count += 1;
  if ((filters.statusFilter || 'all') !== 'all') count += 1;
  if ((filters.dateRange || 'all') !== 'all') count += 1;
  if ((filters.attendanceRateFilter || 'all') !== 'all') count += 1;
  if ((filters.sessionFilter || 'all') !== 'all') count += 1;
  if (
    (filters.dateRange || 'all') === 'custom' &&
    ((filters.customStartDate || '') !== '' || (filters.customEndDate || '') !== '')
  ) {
    count += 1;
  }

  return count;
};

export const getAttendanceQuickFilterClasses = (filters = {}) => ({
  absent:
    (filters.statusFilter || 'all') === SESSION_ATTENDANCE_STATUS.ABSENT
      ? 'border-red-600 bg-red-50 text-red-700 shadow-edubot-soft dark:bg-red-900/30 dark:text-red-200'
      : 'border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
  poor:
    (filters.attendanceRateFilter || 'all') === 'poor'
      ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-edubot-soft dark:bg-amber-900/30 dark:text-amber-200'
      : 'border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20',
  thisWeek:
    (filters.dateRange || 'all') === 'this_week'
      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-edubot-soft dark:bg-blue-900/30 dark:text-blue-200'
      : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  present:
    (filters.statusFilter || 'all') === SESSION_ATTENDANCE_STATUS.PRESENT
      ? 'border-green-600 bg-green-50 text-green-700 shadow-edubot-soft dark:bg-green-900/30 dark:text-green-200'
      : 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
});

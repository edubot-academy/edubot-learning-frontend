import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import { DashboardFilterBar } from '../../../components/ui/dashboard';

/**
 * Advanced Attendance Filters Component
 * Provides comprehensive filtering and search capabilities
 */
const AttendanceFilters = ({
  sessions = [],
  filters = {},
  onFiltersChange,
  className = '',
  showAdvancedFilters = false,
}) => {
  const statusOptions = [
    { value: 'all', label: 'Баары', color: 'gray' },
    { value: SESSION_ATTENDANCE_STATUS.PRESENT, label: 'Катышты', color: 'green' },
    { value: SESSION_ATTENDANCE_STATUS.LATE, label: 'Кечикти', color: 'amber' },
    { value: SESSION_ATTENDANCE_STATUS.ABSENT, label: 'Келген жок', color: 'red' },
    { value: SESSION_ATTENDANCE_STATUS.EXCUSED, label: 'Себептүү', color: 'blue' },
    { value: 'not_scheduled', label: 'Пландалган эмес', color: 'gray' },
  ];

  const attendanceRateRanges = useMemo(() => {
    return [
      { value: 'all', label: 'Баары' },
      { value: 'perfect', label: '100%', min: 100, max: 100 },
      { value: 'excellent', label: '90-100%', min: 90, max: 100 },
      { value: 'good', label: '75-90%', min: 75, max: 90 },
      { value: 'fair', label: '50-75%', min: 50, max: 75 },
      { value: 'poor', label: '50%дан аз', min: 0, max: 50 },
    ];
  }, []);

  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value };

      if (key === 'statusFilter' && value === 'all') {
        newFilters.statusFilter = 'all';
      }

      if (key === 'dateRange' && value !== 'custom') {
        newFilters.customStartDate = '';
        newFilters.customEndDate = '';
      }

      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      searchQuery: '',
      statusFilter: 'all',
      dateRange: 'all',
      attendanceRateFilter: 'all',
      sessionFilter: 'all',
      customStartDate: '',
      customEndDate: '',
    });
  }, [onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return (
      (filters.searchQuery || '') !== '' ||
      (filters.statusFilter || 'all') !== 'all' ||
      (filters.dateRange || 'all') !== 'all' ||
      (filters.attendanceRateFilter || 'all') !== 'all' ||
      (filters.sessionFilter || 'all') !== 'all' ||
      ((filters.dateRange || 'all') === 'custom' &&
        ((filters.customStartDate || '') !== '' || (filters.customEndDate || '') !== ''))
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if ((filters.searchQuery || '') !== '') count++;
    if ((filters.statusFilter || 'all') !== 'all') count++;
    if ((filters.dateRange || 'all') !== 'all') count++;
    if ((filters.attendanceRateFilter || 'all') !== 'all') count++;
    if ((filters.sessionFilter || 'all') !== 'all') count++;
    if (
      (filters.dateRange || 'all') === 'custom' &&
      ((filters.customStartDate || '') !== '' || (filters.customEndDate || '') !== '')
    ) {
      count++;
    }

    return count;
  }, [filters]);

  const formatSessionDate = (startsAt) => {
    if (!startsAt) return 'Күнү жок';

    const date = new Date(startsAt);
    if (Number.isNaN(date.getTime())) return 'Күнү белгисиз';

    return date.toLocaleDateString('ky-KG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const quickFilterClasses = {
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
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <DashboardFilterBar
        gridClassName="items-center md:grid-cols-[minmax(16rem,1fr)_minmax(10rem,12rem)_minmax(10rem,12rem)_auto] xl:grid-cols-[minmax(18rem,1fr)_minmax(10rem,12rem)_minmax(10rem,12rem)_auto]"
      >
        <div className="relative min-w-0 w-full">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            placeholder="Студент издөө..."
            className="dashboard-field dashboard-field-icon min-h-12 w-full pl-10"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleFilterChange('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={filters.statusFilter || 'all'}
          onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
          className="dashboard-select min-h-12 min-w-0 w-full"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.attendanceRateFilter || 'all'}
          onChange={(e) => handleFilterChange('attendanceRateFilter', e.target.value)}
          className="dashboard-select min-h-12 min-w-0 w-full"
        >
          {attendanceRateRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="dashboard-button-secondary flex min-h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap"
          >
            <FiX />
            Тазалоо ({activeFilterCount})
          </button>
        )}
      </DashboardFilterBar>

      {showAdvancedFilters && (
        <div className="dashboard-panel-muted space-y-4 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <FiFilter />
            Кеңейтилген фильтрлер
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filters.dateRange === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Ыңгайлаштырылган күн аралыгы
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                    className="dashboard-field text-sm"
                  />
                  <input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                    className="dashboard-field text-sm"
                  />
                </div>
              </div>
            )}

            {sessions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Сессия фильтри
                </label>
                <select
                  value={filters.sessionFilter || 'all'}
                  onChange={(e) => handleFilterChange('sessionFilter', e.target.value)}
                  className="dashboard-select text-sm"
                >
                  <option value="all">Бардык сессиялар</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title || `Сессия ${session.sessionIndex}`}
                      {' - '}
                      {formatSessionDate(session.startsAt)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Тез фильтрлер
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleFilterChange('statusFilter', SESSION_ATTENDANCE_STATUS.ABSENT)
                }
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.absent}`}
              >
                Келген жокторду гана көрсөт
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('attendanceRateFilter', 'poor')}
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.poor}`}
              >
                Төмөн катышуу %
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('dateRange', 'this_week')}
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.thisWeek}`}
              >
                Бул жумадагы
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFilterChange('statusFilter', SESSION_ATTENDANCE_STATUS.PRESENT)
                }
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.present}`}
              >
                Катышкандарды гана көрсөт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AttendanceFilters.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      startsAt: PropTypes.string,
      sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  filters: PropTypes.shape({
    searchQuery: PropTypes.string,
    statusFilter: PropTypes.string,
    dateRange: PropTypes.string,
    attendanceRateFilter: PropTypes.string,
    sessionFilter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    customStartDate: PropTypes.string,
    customEndDate: PropTypes.string,
  }),
  onFiltersChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  showAdvancedFilters: PropTypes.bool,
};

AttendanceFilters.defaultProps = {
  sessions: [],
  filters: {},
  className: '',
  showAdvancedFilters: false,
};

export default AttendanceFilters;

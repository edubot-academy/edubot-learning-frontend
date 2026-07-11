import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import { DashboardFilterBar } from '../../../components/ui/dashboard';
import {
  createAttendanceRateRanges,
  createAttendanceStatusOptions,
  createEmptyAttendanceFilters,
  getActiveAttendanceDashboardFilterCount,
  getAttendanceQuickFilterClasses,
  hasActiveAttendanceDashboardFilters,
  setAttendanceFiltersValue,
} from '../utils/attendanceFilterData';
import { formatAttendanceSessionDate } from '../utils/attendanceDateData';
import { getAttendanceSessionTitle } from '../utils/attendanceDisplayData';

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
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || undefined;

  const statusOptions = useMemo(() => createAttendanceStatusOptions(t), [t]);

  const attendanceRateRanges = useMemo(() => createAttendanceRateRanges(t), [t]);

  const handleFilterChange = useCallback(
    (key, value) => {
      onFiltersChange(setAttendanceFiltersValue(filters, key, value));
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange(createEmptyAttendanceFilters());
  }, [onFiltersChange]);

  const hasActiveFilters = useMemo(
    () => hasActiveAttendanceDashboardFilters(filters),
    [filters]
  );

  const activeFilterCount = useMemo(
    () => getActiveAttendanceDashboardFilterCount(filters),
    [filters]
  );

  const formatSessionDate = useCallback(
    (startsAt) =>
      formatAttendanceSessionDate(startsAt, {
        language,
        missingFallback: t('attendance.fallbacks.noDate'),
        invalidFallback: t('attendance.fallbacks.unknownDate'),
      }),
    [language, t]
  );

  const quickFilterClasses = useMemo(
    () => getAttendanceQuickFilterClasses(filters),
    [filters]
  );

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
	            placeholder={t('attendance.filters.searchStudent')}
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
	            {t('attendance.filters.clearWithCount', { count: activeFilterCount })}
	          </button>
        )}
      </DashboardFilterBar>

      {showAdvancedFilters && (
        <div className="dashboard-panel-muted space-y-4 rounded-2xl p-4">
	          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
	            <FiFilter />
	            {t('attendance.filters.advanced')}
	          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filters.dateRange === 'custom' && (
              <div className="space-y-2">
	                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
	                  {t('attendance.filters.customDateRange')}
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
	                  {t('attendance.filters.sessionFilter')}
	                </label>
                <select
                  value={filters.sessionFilter || 'all'}
                  onChange={(e) => handleFilterChange('sessionFilter', e.target.value)}
                  className="dashboard-select text-sm"
                >
	                  <option value="all">{t('attendance.filters.allSessions')}</option>
	                  {sessions.map((session) => (
	                    <option key={session.id} value={session.id}>
	                      {getAttendanceSessionTitle(t, session, {
	                        fallbackId: session.sessionIndex,
	                      })}
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
	              {t('attendance.filters.quickFilters')}
	            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleFilterChange('statusFilter', SESSION_ATTENDANCE_STATUS.ABSENT)
                }
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.absent}`}
              >
	                {t('attendance.filters.onlyAbsent')}
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('attendanceRateFilter', 'poor')}
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.poor}`}
              >
	                {t('attendance.filters.lowAttendance')}
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('dateRange', 'this_week')}
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.thisWeek}`}
              >
	                {t('attendance.filters.thisWeek')}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFilterChange('statusFilter', SESSION_ATTENDANCE_STATUS.PRESENT)
                }
                className={`dashboard-button-secondary px-3 py-1 text-xs ${quickFilterClasses.present}`}
              >
	                {t('attendance.filters.onlyPresent')}
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

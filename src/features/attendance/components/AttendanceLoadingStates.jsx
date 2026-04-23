import { memo } from 'react';
import PropTypes from 'prop-types';
import { ATTENDANCE_DESIGN_SYSTEM } from '../constants/attendanceConfig';

/**
 * Enhanced Loading States for Attendance Components
 * Provides skeleton screens and loading indicators
 */

export const AttendanceTableSkeleton = memo(({ rowCount = 10, columnCount = 5 }) => {
  return (
    <div className="space-y-2">
      {/* Header Skeleton */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `200px repeat(${columnCount}, 80px) 100px` }}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {Array.from({ length: columnCount }).map((_, index) => (
          <div key={`header-${index}`} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Row Skeletons */}
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-2" style={{ gridTemplateColumns: `200px repeat(${columnCount}, 80px) 100px` }}>
          <div className="flex items-center gap-3 p-3">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
            </div>
          </div>
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="flex items-center justify-center p-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          ))}
          <div className="flex items-center justify-center p-2">
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8 mx-auto" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mx-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

AttendanceTableSkeleton.displayName = 'AttendanceTableSkeleton';

export const AttendanceCardSkeleton = memo(({ cardCount = 5 }) => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={`card-${index}`} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex gap-2">
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

AttendanceCardSkeleton.displayName = 'AttendanceCardSkeleton';

export const AttendanceStatsSkeleton = memo(() => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={`stat-${index}`} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-2 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
});

AttendanceStatsSkeleton.displayName = 'AttendanceStatsSkeleton';

export const AttendanceFilterSkeleton = memo(() => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
});

AttendanceFilterSkeleton.displayName = 'AttendanceFilterSkeleton';

/**
 * Loading overlay component
 */
export const AttendanceLoadingOverlay = memo(({ message = 'Жүктөө...', isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-900 dark:text-white font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
});

AttendanceLoadingOverlay.displayName = 'AttendanceLoadingOverlay';

/**
 * Progress indicator for bulk operations
 */
export const AttendanceProgressIndicator = memo(({ 
  current = 0, 
  total = 100, 
  message = 'Иштеп жатат...', 
  showPercentage = true 
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </span>
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {percentage}%
            </span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {current} / {total} аякталды
        </div>
      </div>
    </div>
  );
});

AttendanceProgressIndicator.displayName = 'AttendanceProgressIndicator';

/**
 * Empty state components
 */
export const AttendanceEmptyState = memo(({ 
  type = 'students', 
  title, 
  subtitle, 
  action = null 
}) => {
  const defaultContent = {
    students: {
      title: 'Студенттер жок',
      subtitle: 'Бул группада студенттер жок же жүктөөдө ката кетти',
    },
    sessions: {
      title: 'Сессиялар жок',
      subtitle: 'Бул курс үчүн сессиялар пландалган эмес',
    },
    data: {
      title: 'Маалымат жок',
      subtitle: 'Көрсөтүү үчүн маалымат жок',
    },
    filtered: {
      title: 'Натыйжалар жок',
      subtitle: 'Сиздин фильтриңизге ылайык натыйжалар табылган жок',
    },
  };

  const content = defaultContent[type] || defaultContent.data;

  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title || content.title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {subtitle || content.subtitle}
      </p>
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
});

AttendanceEmptyState.displayName = 'AttendanceEmptyState';

/**
 * Error state component
 */
export const AttendanceErrorState = memo(({ 
  error, 
  title = 'Ката кетти', 
  onRetry, 
  retryText = 'Кайта аракет кылуу' 
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-red-200 dark:bg-red-800 rounded-full" />
      </div>
      
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
        {title}
      </h3>
      
      <p className="text-red-600 dark:text-red-400 mb-6 max-w-md mx-auto">
        {error?.message || 'Белгисиз ката кетти. Кайта аракет кылыңыз.'}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {retryText}
        </button>
      )}
    </div>
  );
});

AttendanceErrorState.displayName = 'AttendanceErrorState';

AttendanceTableSkeleton.propTypes = {
  rowCount: PropTypes.number,
  columnCount: PropTypes.number,
};

AttendanceCardSkeleton.propTypes = {
  cardCount: PropTypes.number,
};

AttendanceLoadingOverlay.propTypes = {
  message: PropTypes.string,
  isVisible: PropTypes.bool,
};

AttendanceProgressIndicator.propTypes = {
  current: PropTypes.number,
  total: PropTypes.number,
  message: PropTypes.string,
  showPercentage: PropTypes.bool,
};

AttendanceEmptyState.propTypes = {
  type: PropTypes.oneOf(['students', 'sessions', 'data', 'filtered']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
};

AttendanceErrorState.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  title: PropTypes.string,
  onRetry: PropTypes.func,
  retryText: PropTypes.string,
};

export default {
  AttendanceTableSkeleton,
  AttendanceCardSkeleton,
  AttendanceStatsSkeleton,
  AttendanceFilterSkeleton,
  AttendanceLoadingOverlay,
  AttendanceProgressIndicator,
  AttendanceEmptyState,
  AttendanceErrorState,
};

import PropTypes from 'prop-types';

const ProgressList = ({
  items = [],
  loading = false,
  error = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-1/3 rounded bg-edubot-surfaceAlt dark:bg-slate-800"></div>
              <div className="h-4 w-16 rounded bg-edubot-surfaceAlt dark:bg-slate-800"></div>
            </div>
            <div className="h-2 rounded-full bg-edubot-surfaceAlt dark:bg-slate-800"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">Error loading data</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`rounded-2xl border border-dashed border-edubot-line/80 bg-edubot-surfaceAlt/40 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-edubot-muted dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const percentage = item.percentage || item.progress || 0;
        const color = item.color || getColorByPercentage(percentage);

        return (
          <div key={item.id || index} className="space-y-2 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="truncate text-sm font-medium text-edubot-ink dark:text-gray-100">
                  {item.title || item.name}
                </h4>
                {item.subtitle && (
                  <p className="truncate text-xs text-edubot-muted dark:text-slate-400">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <div className="ml-4 flex items-center">
                <span className={`text-sm font-medium ${color.text}`}>
                  {percentage}%
                </span>
                {item.status && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${color.badge}`}>
                    {item.status}
                  </span>
                )}
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-white/80 dark:bg-slate-800">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${color.bar}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>

            {item.description && (
              <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const getColorByPercentage = (percentage) => {
  if (percentage >= 80) {
    return {
      text: 'text-green-600 dark:text-green-400',
      bar: 'bg-green-500',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    };
  } else if (percentage >= 60) {
    return {
      text: 'text-edubot-orange dark:text-edubot-soft',
      bar: 'bg-edubot-orange',
      badge: 'bg-edubot-orange/10 dark:bg-edubot-orange/20 text-edubot-orange dark:text-edubot-soft',
    };
  } else if (percentage >= 40) {
    return {
      text: 'text-yellow-600 dark:text-yellow-400',
      bar: 'bg-yellow-500',
      badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    };
  } else {
    return {
      text: 'text-red-600 dark:text-red-400',
      bar: 'bg-red-500',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
  }
};

ProgressList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      percentage: PropTypes.number,
      progress: PropTypes.number,
      status: PropTypes.string,
      color: PropTypes.shape({
        text: PropTypes.string,
        bar: PropTypes.string,
        badge: PropTypes.string,
      }),
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
};

export default ProgressList;

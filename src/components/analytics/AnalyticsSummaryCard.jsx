import PropTypes from 'prop-types';

const AnalyticsSummaryCard = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  loading = false,
  error = false,
  className = '',
}) => {
  // Touch-friendly color classes with enhanced mobile styling
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-500',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-95',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-500',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30 active:scale-95',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'text-orange-500',
      hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30 active:scale-95',
    },
    edubot: {
      bg: 'bg-edubot-orange/10 dark:bg-edubot-orange/20',
      border: 'border-edubot-orange/30',
      text: 'text-edubot-orange dark:text-edubot-soft',
      icon: 'text-edubot-orange',
      hover: 'hover:bg-edubot-orange/20 dark:hover:bg-edubot-orange/30 active:scale-95',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-500',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95',
    },
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className={`rounded-3xl border border-edubot-line/80 bg-white/90 dark:border-slate-700 dark:bg-slate-950 p-6 shadow-edubot-card ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${currentColor.bg} rounded-2xl`}></div>
            <div className="h-4 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-16"></div>
          </div>
          <div className="h-8 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-3/4 mb-2"></div>
          <div className="h-4 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="text-red-600 dark:text-red-400 font-medium">Error loading data</div>
        <div className="text-sm text-red-500 dark:text-red-500 mt-1">Please try again</div>
      </div>
    );
  }

  return (
    <div className={`
      group relative overflow-hidden
      p-4 sm:p-6
      rounded-3xl
      border
      bg-white/90 dark:bg-slate-950
      border-edubot-line/80 dark:border-slate-700
      shadow-edubot-card
      transition-all duration-300
      ${currentColor.hover}
      transform hover:-translate-y-1
      min-h-[120px] sm:min-h-[140px]
      touch-manipulation
      ${className}
    `}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-edubot-orange/10 opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5 dark:to-edubot-soft/10" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-edubot-orange/10 blur-3xl transition-all duration-300 group-hover:scale-125 dark:bg-edubot-soft/10" />
      <div className="relative flex items-center justify-between mb-4">
        {icon && (
          <div className={`w-12 h-12 ${currentColor.bg} ${currentColor.border} border rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
            <div className={currentColor.icon}>
              {icon}
            </div>
          </div>
        )}
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
            <svg
              className={`w-4 h-4 mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {trend.value}
          </div>
        )}
      </div>

      <div className="relative space-y-1">
        <div className="text-2xl font-bold text-edubot-ink dark:text-gray-100">
          {value}
        </div>
        <div className="text-sm font-medium text-edubot-muted dark:text-slate-400">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-edubot-muted dark:text-slate-500">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

AnalyticsSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.shape({
    value: PropTypes.string.isRequired,
    isPositive: PropTypes.bool,
  }),
  icon: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green', 'orange', 'edubot', 'purple']),
  loading: PropTypes.bool,
  error: PropTypes.bool,
  className: PropTypes.string,
};

export default AnalyticsSummaryCard;

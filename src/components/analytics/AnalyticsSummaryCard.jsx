import React from 'react';
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
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-500',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-500',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'text-orange-500',
    },
    edubot: {
      bg: 'bg-edubot-orange/10 dark:bg-edubot-orange/20',
      border: 'border-edubot-orange/30',
      text: 'text-edubot-orange dark:text-edubot-soft',
      icon: 'text-edubot-orange',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-500',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl`}></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
            <div className={colors.icon}>
              {icon}
            </div>
          </div>
        )}
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
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

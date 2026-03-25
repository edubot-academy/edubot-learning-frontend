import React from 'react';
import PropTypes from 'prop-types';

const DashboardPageHeader = ({
  title,
  subtitle,
  action,
  loading = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-end gap-4 justify-between ${className}`}>
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
      
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

DashboardPageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default DashboardPageHeader;

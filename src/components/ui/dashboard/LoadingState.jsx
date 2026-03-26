import PropTypes from 'prop-types';

const LoadingState = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = (type) => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="flex justify-end">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          </div>
        );

      case 'stat':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg" />
            <div className="relative p-6 z-10">
              <div className="animate-pulse space-y-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="p-4">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'header':
        return (
          <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-xl border border-gray-300 dark:border-gray-600">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-3"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {count > 1 ? (
        <div className="space-y-4">
          {[...Array(count)].map((_, index) => (
            <div key={index}>{renderSkeleton(type)}</div>
          ))}
        </div>
      ) : (
        renderSkeleton(type)
      )}
    </div>
  );
};

LoadingState.propTypes = {
  type: PropTypes.oneOf(['card', 'stat', 'list', 'table', 'header', 'default']),
  count: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingState;

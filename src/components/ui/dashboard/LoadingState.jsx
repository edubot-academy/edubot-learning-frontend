import PropTypes from 'prop-types';

const LoadingState = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = (kind) => {
    switch (kind) {
      case 'card':
        return (
          <div className="dashboard-panel p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                <div className="h-3 w-5/6 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
              </div>
              <div className="flex justify-end">
                <div className="h-10 w-24 rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800" />
              </div>
            </div>
          </div>
        );

      case 'stat':
        return (
          <div className="dashboard-panel relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(241,126,34,0.12),transparent_32%)]" />
            <div className="relative z-10 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                <div className="h-4 w-2/3 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                <div className="h-8 w-1/2 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="dashboard-panel p-4">
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                  </div>
                  <div className="h-8 w-20 rounded-xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="dashboard-panel overflow-hidden">
            <div className="border-b border-edubot-line/80 p-4 dark:border-slate-700">
              <div className="animate-pulse h-6 w-1/3 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
            </div>
            <div className="divide-y divide-edubot-line/80 dark:divide-slate-700">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="p-4">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-4 flex-1 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                    <div className="h-4 w-24 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                    <div className="h-4 w-20 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'header':
        return (
          <div className="rounded-panel border border-slate-300/70 bg-gradient-to-r from-slate-200 via-orange-100 to-teal-100 p-6 shadow-edubot-soft dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
            <div className="animate-pulse">
              <div className="mb-3 h-4 w-1/4 rounded bg-white/60 dark:bg-slate-700" />
              <div className="mb-2 h-8 w-1/2 rounded bg-white/70 dark:bg-slate-700" />
              <div className="h-4 w-3/4 rounded bg-white/60 dark:bg-slate-700" />
            </div>
          </div>
        );

      default:
        return (
          <div className="animate-pulse space-y-4">
            <div className="h-4 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
            <div className="h-4 w-5/6 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
            <div className="h-4 w-4/6 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
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

import PropTypes from 'prop-types';

const AnalyticsSection = ({
  title,
  subtitle,
  children,
  action,
  loading = false,
  error = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  if (loading) {
    return (
      <div className={`overflow-hidden rounded-3xl border border-edubot-line/80 bg-white/90 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950 ${className}`}>
        <div className="border-b border-edubot-line/70 p-4 sm:p-6 dark:border-slate-700">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-1/3 rounded bg-edubot-surfaceAlt dark:bg-slate-800"></div>
            <div className="h-4 w-1/2 rounded bg-edubot-surfaceAlt dark:bg-slate-800"></div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            <div className="h-3 rounded bg-edubot-surfaceAlt sm:h-4 dark:bg-slate-800"></div>
            <div className="h-3 w-5/6 rounded bg-edubot-surfaceAlt sm:h-4 dark:bg-slate-800"></div>
            <div className="h-3 w-4/6 rounded bg-edubot-surfaceAlt sm:h-4 dark:bg-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`overflow-hidden rounded-3xl border border-red-200 bg-red-50/90 dark:border-red-500/30 dark:bg-red-500/10 ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Error loading section
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {subtitle || 'Unable to load data. Please try again.'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`group relative overflow-hidden rounded-3xl border border-edubot-line/80 bg-white/90 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-950 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-edubot-orange/8 opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5 dark:to-edubot-soft/10" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-edubot-orange/10 blur-3xl transition-all duration-300 group-hover:scale-125 dark:bg-edubot-soft/10" />
      {(title || subtitle || action) && (
        <div className={`relative border-b border-edubot-line/70 p-6 dark:border-slate-700 ${headerClassName}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-edubot-ink transition-colors duration-300 group-hover:text-edubot-orange dark:text-gray-100 dark:group-hover:text-edubot-soft">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className={`relative ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
};

AnalyticsSection.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  action: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
};

export default AnalyticsSection;

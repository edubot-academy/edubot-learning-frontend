import PropTypes from 'prop-types';

const DashboardPageHeader = ({
  title,
  subtitle,
  action,
  loading = false,
  className = '',
}) => {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-edubot-line/80 bg-white/90 p-6 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-950 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-edubot-orange/10 opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5 dark:to-edubot-soft/10" />
      <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-edubot-orange/10 blur-3xl transition-all duration-300 group-hover:scale-125 dark:bg-edubot-soft/10" />
      <div className="relative flex flex-wrap items-end gap-4 justify-between">
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-8 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-1/3"></div>
            <div className="h-4 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-1/2"></div>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-edubot-orange">
              Analytics overview
            </p>
            <h1 className="mt-2 text-3xl font-bold text-edubot-ink dark:text-gray-100">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-3xl text-sm text-edubot-muted dark:text-slate-400">
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

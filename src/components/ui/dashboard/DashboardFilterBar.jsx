import PropTypes from 'prop-types';

const DashboardFilterBar = ({
    children,
    title,
    description,
    activeCount = 0,
    clearLabel = 'Clear filters',
    onClear,
    actions,
    className = '',
    gridClassName = '',
}) => (
    <div
        className={`rounded-[28px] border border-edubot-line/80 bg-edubot-surfaceAlt/35 p-4 shadow-edubot-soft dark:border-slate-700 dark:bg-slate-900/60 ${className}`}
        aria-label={title || 'Dashboard filters'}
    >
        {(title || description || actions || onClear) && (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {(title || description) && (
                    <div className="min-w-0">
                        {title && (
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-edubot-ink dark:text-white">
                                    {title}
                                </h3>
                                {activeCount > 0 && (
                                    <span className="rounded-full bg-edubot-orange/10 px-2 py-0.5 text-xs font-semibold text-edubot-orange">
                                        {activeCount}
                                    </span>
                                )}
                            </div>
                        )}
                        {description && (
                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {(actions || onClear) && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {actions}
                        {onClear && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="rounded-xl border border-edubot-line bg-white px-3 py-2 text-sm font-semibold text-edubot-muted transition hover:border-edubot-orange hover:text-edubot-orange focus:outline-none focus:ring-2 focus:ring-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                            >
                                {clearLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>
        )}

        <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${gridClassName}`}>{children}</div>
    </div>
);

DashboardFilterBar.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    activeCount: PropTypes.number,
    clearLabel: PropTypes.string,
    onClear: PropTypes.func,
    actions: PropTypes.node,
    className: PropTypes.string,
    gridClassName: PropTypes.string,
};

export default DashboardFilterBar;

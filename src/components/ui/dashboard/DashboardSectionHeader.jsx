import PropTypes from 'prop-types';

const DashboardSectionHeader = ({
    eyebrow,
    title,
    description,
    action,
    metrics,
    className = '',
    metricsClassName = 'grid grid-cols-2 gap-3 sm:grid-cols-4',
}) => (
    <div className={`border-b border-edubot-line/70 px-6 py-5 dark:border-slate-700 ${className}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
                {eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange">
                        {eyebrow}
                    </p>
                ) : null}
                <h2 className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{title}</h2>
                {description ? (
                    <p className="mt-2 text-sm leading-6 text-edubot-muted dark:text-slate-300">
                        {description}
                    </p>
                ) : null}
            </div>

            {action || metrics ? (
                <div className="flex flex-col items-start gap-3 xl:items-end">
                    {action ? <div className="shrink-0">{action}</div> : null}
                    {metrics ? <div className={metricsClassName}>{metrics}</div> : null}
                </div>
            ) : null}
        </div>
    </div>
);

DashboardSectionHeader.propTypes = {
    eyebrow: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.node,
    metrics: PropTypes.node,
    className: PropTypes.string,
    metricsClassName: PropTypes.string,
};

export default DashboardSectionHeader;

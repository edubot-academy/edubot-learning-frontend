import PropTypes from 'prop-types';

const DashboardInsetPanel = ({ title, description, action, className = '', children }) => (
    <div className={`dashboard-panel-muted group p-4 ${className}`}>
        {(title || description || action) && (
            <div className="relative flex items-center justify-between gap-3">
                <div>
                    {title ? (
                        <h4 className="font-semibold text-edubot-ink transition-colors duration-300 group-hover:text-edubot-orange dark:text-white dark:group-hover:text-edubot-soft">
                            {title}
                        </h4>
                    ) : null}
                    {description ? (
                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{description}</p>
                    ) : null}
                </div>
                {action ? action : null}
            </div>
        )}
        <div className={`relative ${title || description || action ? 'mt-4' : ''}`}>{children}</div>
    </div>
);

DashboardInsetPanel.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    action: PropTypes.node,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default DashboardInsetPanel;

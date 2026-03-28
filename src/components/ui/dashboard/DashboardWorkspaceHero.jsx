import PropTypes from 'prop-types';
import DashboardSectionHeader from './DashboardSectionHeader';

const DashboardWorkspaceHero = ({
    eyebrow,
    title,
    description,
    action,
    metrics,
    metricsClassName,
    children,
    className = '',
}) => (
    <section className={`overflow-hidden rounded-3xl border border-edubot-line/80 bg-white/90 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950 ${className}`}>
        <DashboardSectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            action={action}
            metrics={metrics}
            metricsClassName={metricsClassName}
        />
        {children ? (
            <div className="border-t border-edubot-line/70 px-6 py-5 dark:border-slate-700">
                {children}
            </div>
        ) : null}
    </section>
);

DashboardWorkspaceHero.propTypes = {
    eyebrow: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.node,
    metrics: PropTypes.node,
    metricsClassName: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
};

export default DashboardWorkspaceHero;

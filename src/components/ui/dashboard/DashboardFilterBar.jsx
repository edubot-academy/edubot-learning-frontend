import PropTypes from 'prop-types';

const DashboardFilterBar = ({ children, className = '', gridClassName = '' }) => (
    <div className={`rounded-[28px] border border-edubot-line/80 bg-edubot-surfaceAlt/35 p-4 shadow-edubot-soft dark:border-slate-700 dark:bg-slate-900/60 ${className}`}>
        <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${gridClassName}`}>{children}</div>
    </div>
);

DashboardFilterBar.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    gridClassName: PropTypes.string,
};

export default DashboardFilterBar;

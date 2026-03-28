import PropTypes from 'prop-types';

const TONE_CLASSES = {
    default: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
};

const StatusBadge = ({ children, tone = 'default', className = '' }) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone] || TONE_CLASSES.default} ${className}`}>
        {children}
    </span>
);

StatusBadge.propTypes = {
    children: PropTypes.node.isRequired,
    tone: PropTypes.oneOf(['default', 'green', 'orange', 'amber', 'red', 'blue', 'indigo']),
    className: PropTypes.string,
};

export default StatusBadge;

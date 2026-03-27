import PropTypes from 'prop-types';

const formatMetricLabel = (label) => label.replace(/\s+%/g, '\u00A0%');

const TONE_CLASSES = {
    default:
        'border-edubot-line/80 bg-white/95 text-edubot-ink dark:border-slate-700 dark:bg-slate-900/90 dark:text-white',
    green:
        'border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    amber:
        'border-amber-200 bg-amber-50/90 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    red:
        'border-red-200 bg-red-50/90 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
    blue:
        'border-sky-200 bg-sky-50/90 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
};

const ICON_TONE_CLASSES = {
    default: 'bg-edubot-surfaceAlt text-edubot-orange dark:bg-slate-800 dark:text-edubot-soft',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
};

const DashboardMetricCard = ({ label, value, icon: Icon, tone = 'default', className = '' }) => (
    <div
        className={`group relative overflow-hidden rounded-panel border px-4 py-3.5 shadow-edubot-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-edubot-hover ${TONE_CLASSES[tone] || TONE_CLASSES.default} ${className}`}
    >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-edubot-orange/10 opacity-70 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5 dark:to-edubot-soft/10" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-edubot-orange/10 blur-2xl transition-all duration-300 group-hover:scale-125 group-hover:opacity-100 dark:bg-edubot-soft/10" />
        <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="relative min-w-0 flex-1 pr-1 text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.1em] opacity-75 sm:text-[11px]">
                {formatMetricLabel(label)}
            </div>
            {Icon ? (
                <div
                    className={`relative mt-2.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${
                        ICON_TONE_CLASSES[tone] || ICON_TONE_CLASSES.default
                    }`}
                >
                    <Icon className="h-4 w-4" />
                </div>
            ) : null}
        </div>
        <div className="relative mt-3 text-[1.8rem] font-semibold leading-none transition-transform duration-300 group-hover:translate-x-0.5 sm:text-[1.95rem]">
            {value}
        </div>
    </div>
);

DashboardMetricCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.elementType,
    tone: PropTypes.oneOf(['default', 'green', 'amber', 'red', 'blue']),
    className: PropTypes.string,
};

export default DashboardMetricCard;

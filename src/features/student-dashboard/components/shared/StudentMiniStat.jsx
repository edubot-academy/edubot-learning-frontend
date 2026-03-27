import PropTypes from 'prop-types';

const StudentMiniStat = ({ label, value, tone = 'default' }) => {
    const toneClasses = {
        default:
            'border-edubot-line/70 bg-white/80 text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-white',
        green:
            'border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
        amber:
            'border-amber-200 bg-amber-50/90 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
        blue:
            'border-sky-200 bg-sky-50/90 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 ${toneClasses[tone] || toneClasses.default}`}>
            <div className="text-xs font-medium uppercase tracking-[0.14em] opacity-75">{label}</div>
            <div className="mt-2 text-xl font-semibold">{value}</div>
        </div>
    );
};

StudentMiniStat.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    tone: PropTypes.string,
};

export default StudentMiniStat;

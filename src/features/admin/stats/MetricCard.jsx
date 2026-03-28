const MetricCard = ({ label, value, accent, sub }) => (
    <div
        className={`rounded-3xl border border-edubot-line/80 p-5 shadow-edubot-card ${accent || 'bg-white/90 dark:border-slate-700 dark:bg-slate-950'
            }`}
    >
        <p className={`text-sm ${accent ? 'text-white/80' : 'text-edubot-muted dark:text-slate-400'}`}>
            {label}
        </p>
        <p className={`text-2xl font-semibold mt-1 ${accent ? 'text-white' : 'text-edubot-ink dark:text-[#E8ECF3]'}`}>
            {value}
        </p>
        {sub ? (
            <p className={`text-xs mt-1 ${accent ? 'text-white/80' : 'text-edubot-muted dark:text-slate-400'}`}>
                {sub}
            </p>
        ) : null}
    </div>
);

export default MetricCard;

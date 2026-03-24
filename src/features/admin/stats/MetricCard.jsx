const MetricCard = ({ label, value, accent, sub }) => (
    <div
        className={`rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm ${accent || 'bg-white dark:bg-[#1B1B1B]'
            }`}
    >
        <p className={`text-sm ${accent ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
            {label}
        </p>
        <p className={`text-2xl font-semibold mt-1 ${accent ? 'text-white' : 'text-gray-900 dark:text-[#E8ECF3]'}`}>
            {value}
        </p>
        {sub ? (
            <p className={`text-xs mt-1 ${accent ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                {sub}
            </p>
        ) : null}
    </div>
);

export default MetricCard;

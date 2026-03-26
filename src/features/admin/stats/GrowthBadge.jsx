const GrowthBadge = ({ label, value, tone = 'blue' }) => {
    const toneMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
        emerald:
            'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
    };

    const classes = toneMap[tone] || toneMap.blue;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${classes}`}>
            <span className="inline-flex h-2 w-2 rounded-full bg-current" aria-hidden />
            <span className="font-medium">+{Number(value ?? 0).toLocaleString('ru-RU')}</span>
            <span className="text-xs opacity-70">{label}</span>
        </span>
    );
};

export default GrowthBadge;

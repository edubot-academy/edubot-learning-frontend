import { FiCalendar } from 'react-icons/fi';

const ICONS = {
    calendar: FiCalendar,
};

const StatTile = ({ icon = 'calendar', label, value, sub, tone = 'emerald' }) => {
    const IconComp = ICONS[icon] || FiCalendar;
    const toneMap = {
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        sky: 'bg-sky-50 text-sky-700',
        violet: 'bg-violet-50 text-violet-700',
        gray: 'bg-gray-100 text-gray-700',
    };
    return (
        <div className="rounded-2xl border border-white/70 bg-white/90 dark:bg-[#0f0f0f]/90 shadow-md p-4 space-y-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneMap[tone] || toneMap.gray}`}>
                <IconComp />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
        </div>
    );
};

export default StatTile;

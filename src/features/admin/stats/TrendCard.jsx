import Sparkline from './Sparkline';

const TrendCard = ({ title, series, color }) => {
    const safeSeries = Array.isArray(series) && series.length ? series : [{ date: '—', count: 0 }];
    const latest = safeSeries[safeSeries.length - 1];

    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-edubot-orange/5 via-transparent to-edubot-soft/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-6 z-10">
                <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" />

                <div className="w-10 h-10 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-xl mb-3 flex items-center justify-center">
                    <div className="w-5 h-5 bg-edubot-orange rounded-full animate-pulse" />
                </div>

                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                            {(latest?.count ?? 0).toLocaleString('ru-RU')}
                        </p>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        7 күн
                    </span>
                </div>

                <div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-edubot-orange to-edubot-soft rounded-full w-3/4 animate-pulse" />
                </div>

                <div className="mt-4">
                    <Sparkline series={safeSeries} color={color} />
                </div>

                <div className="flex justify-between text-[11px] text-gray-400 mt-2 gap-2">
                    {safeSeries.map((point, idx) => (
                        <span key={`${point.date}-${idx}`} className="truncate">
                            {point.date?.slice(5) || '—'}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendCard;

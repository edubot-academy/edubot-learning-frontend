import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useResourceProgress from '../hooks/useResourceProgress';
import { getResourceBySlug } from '../data/externalResources';

const STATUS_STYLE = {
    saved: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
    started: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40',
    completed: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
};

const FreeResourcesWidget = ({ userId }) => {
    const { t } = useTranslation();
    const { getAllEntries } = useResourceProgress();

    const entries = useMemo(() => {
        return getAllEntries()
            .filter((e) => e.slug)
            .sort((a, b) => {
                const order = { started: 0, saved: 1, completed: 2 };
                return (order[a.status] ?? 3) - (order[b.status] ?? 3);
            })
            .slice(0, 5);
    }, [getAllEntries]);

    if (!entries.length) return null;

    const statusLabel = (status) => {
        const key = `public.externalResources.status${status.charAt(0).toUpperCase()}${status.slice(1)}`;
        return t(key);
    };

    const completedCount = entries.filter((e) => e.status === 'completed').length;
    const startedCount = entries.filter((e) => e.status === 'started').length;

    return (
        <div className="dashboard-panel overflow-hidden">
            <div className="px-6 py-5 border-b border-edubot-line dark:border-slate-700/60">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-edubot-muted dark:text-slate-400">
                            {t('public.externalResources.myPlan')}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-edubot-muted dark:text-slate-400">
                            {startedCount > 0 && (
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                                    {startedCount} {t('public.externalResources.statusStarted').toLowerCase()}
                                </span>
                            )}
                            {completedCount > 0 && (
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    {completedCount} {t('public.externalResources.statusCompleted').toLowerCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <Link
                        to="/dashboard?tab=free-resources"
                        className="text-xs font-semibold text-[#E14219] dark:text-[#FF8C6E] hover:underline flex-shrink-0"
                    >
                        {t('public.externalResources.myPlanBrowse')} →
                    </Link>
                </div>
            </div>

            <div className="divide-y divide-edubot-line/60 dark:divide-slate-700/40">
                {entries.map((entry) => {
                    const staticRes = getResourceBySlug(entry.slug);
                    const weeksTotal = staticRes?.content?.studyPlan?.length ?? 0;
                    const weeksDone = entry.checkedWeeks?.length ?? 0;
                    const pct = weeksTotal > 0 ? Math.round((weeksDone / weeksTotal) * 100) : null;
                    return (
                        <Link
                            key={entry.slug}
                            to="/dashboard?tab=free-resources"
                            className="flex items-start gap-3 px-6 py-3.5 hover:bg-edubot-surfaceAlt dark:hover:bg-slate-800/50 transition-colors group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-edubot-ink dark:text-white truncate group-hover:text-[#E14219] dark:group-hover:text-[#FF8C6E] transition-colors">
                                    {entry.title || entry.slug}
                                </p>
                                <p className="text-xs text-edubot-muted dark:text-slate-400 truncate">{entry.provider}</p>
                                {pct !== null && (
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                            <div
                                                className="h-1.5 rounded-full bg-gradient-to-r from-[#FF8C6E] to-[#E14219] transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-edubot-muted dark:text-slate-400 w-9 text-right flex-shrink-0">
                                            {weeksDone}/{weeksTotal}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1.5 pt-0.5">
                                {entry.certificateUrl && (
                                    <span title="Certificate uploaded" className="text-base leading-none">🏆</span>
                                )}
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[entry.status] ?? STATUS_STYLE.saved}`}>
                                    {statusLabel(entry.status)}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default FreeResourcesWidget;

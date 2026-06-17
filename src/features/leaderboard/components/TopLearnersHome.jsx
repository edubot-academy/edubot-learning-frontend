import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiAward, FiBarChart2, FiStar, FiTrendingUp, FiZap } from 'react-icons/fi';
import { fetchHomepageLeaderboard } from '@services/api';
import Loader from '@shared/ui/Loader';

const MEDAL_STYLE = {
    1: { gradient: 'from-amber-400 to-yellow-300', text: 'text-amber-900', shadow: 'shadow-amber-300/60', cardBorder: 'border-amber-200 dark:border-amber-500/30', cardBg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10' },
    2: { gradient: 'from-slate-400 to-slate-300', text: 'text-slate-700', shadow: 'shadow-slate-300/60', cardBorder: 'border-slate-200 dark:border-slate-700', cardBg: 'bg-white dark:bg-slate-900/60' },
    3: { gradient: 'from-orange-500 to-amber-500', text: 'text-white', shadow: 'shadow-orange-300/60', cardBorder: 'border-orange-200 dark:border-orange-500/30', cardBg: 'bg-gradient-to-br from-orange-50/60 to-white dark:from-orange-500/10 dark:to-slate-900/60' },
};

const pickAchievement = (item, t) => {
    if (item?.progressPercent >= 100) return { Icon: FiBarChart2, label: t('public.home.leaderboard.badges.finisher') };
    if (Number(item?.streakDays) >= 5) return { Icon: FiZap, label: t('public.home.leaderboard.badges.streak', { count: item.streakDays }) };
    if (Number(item?.quizzesPassed) >= 10) return { Icon: FiAward, label: t('public.home.leaderboard.badges.quizChampion') };
    if (Number(item?.streakDays) >= 2) return { Icon: FiZap, label: t('public.home.leaderboard.badges.streak', { count: item.streakDays }) };
    return { Icon: FiStar, label: t('public.home.leaderboard.badges.topLearner') };
};

const Avatar = ({ src, name }) => {
    const initials = String(name || 'ED')
        .split(' ')
        .map((w) => w[0] || '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

    if (src) {
        return (
            <img
                src={src}
                alt={name || 'Student'}
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
        );
    }

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 font-bold text-white shadow-md shadow-orange-200/60">
            {initials}
        </div>
    );
};

const TopLearnerCard = ({ item, rank }) => {
    const { t } = useTranslation();
    const style = MEDAL_STYLE[rank] || MEDAL_STYLE[3];
    const { Icon: AchievementIcon, label: achievementLabel } = pickAchievement(item, t);
    const xp = Number(item?.xp || 0);
    const streak = Number(item?.streakDays || 0);

    return (
        <div className={`rounded-3xl border ${style.cardBorder} ${style.cardBg} p-5 shadow-sm`}>
            <div className="flex items-center gap-3">
                {/* Medal */}
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-sm font-bold shadow-md ${style.gradient} ${style.text} ${style.shadow}`}
                >
                    {rank}
                </div>
                <Avatar src={item?.avatarUrl} name={item?.fullName} />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                        {item?.fullName || t('public.home.leaderboard.defaultStudent')}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {xp.toLocaleString()} XP
                        {item?.progressPercent
                            ? ` · ${t('public.home.leaderboard.progress', { count: item.progressPercent })}`
                            : ''}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                    <AchievementIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {achievementLabel}
                </div>
                {streak >= 2 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        <FiZap className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {streak}d
                    </span>
                )}
            </div>
        </div>
    );
};

const TopLearnersHome = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fallbackMeta, setFallbackMeta] = useState({ fallback: false, message: '' });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetchHomepageLeaderboard();
                if (cancelled) return;
                setItems(res?.items || res || []);
                setFallbackMeta({ fallback: Boolean(res?._fallback), message: res?._fallbackMessage || '' });
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <section className="bg-white px-4 py-16 dark:bg-[#0d1117] md:px-10">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                            <FiTrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {t('public.home.leaderboard.eyebrow')}
                        </div>
                        <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                            {t('public.home.leaderboard.title')}
                        </h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                            {t('public.home.leaderboard.subtitle')}
                        </p>
                    </div>
                    <Link
                        to="/leaderboard"
                        className="inline-flex cursor-pointer items-center gap-2 self-start rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 md:self-auto"
                    >
                        {t('public.home.leaderboard.viewFull')}
                        <FiArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                </div>

                {/* Content */}
                <div className="mt-8">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader fullScreen={false} />
                        </div>
                    ) : fallbackMeta.fallback ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
                                {t('public.home.leaderboard.fallbackTitle')}
                            </p>
                            <p className="mt-1 text-sm">{t('public.home.leaderboard.fallbackBody')}</p>
                            {fallbackMeta.message && (
                                <p className="mt-1 text-xs opacity-70">{fallbackMeta.message}</p>
                            )}
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                            {t('public.home.leaderboard.empty')}
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-3">
                            {items.slice(0, 3).map((item, idx) => (
                                <TopLearnerCard
                                    key={item?.studentId || idx}
                                    item={item}
                                    rank={idx + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TopLearnersHome;

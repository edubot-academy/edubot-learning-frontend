import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FiArrowRight,
    FiAward,
    FiBarChart2,
    FiTarget,
    FiTrendingDown,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';
import { getDashboardPath } from '@shared/utils/navigation';

const asArray = (v) => (Array.isArray(v) ? v : []);

// ─── Avatar ──────────────────────────────────────────────────────────────────

export const LeaderboardAvatar = ({ src, name = '', size = 'md', ring = '' }) => {
    const dims = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
    };
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
                className={`${dims[size]} shrink-0 rounded-full object-cover ${ring}`}
            />
        );
    }

    return (
        <div
            className={`${dims[size]} shrink-0 rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 text-white flex items-center justify-center font-bold shadow-md shadow-orange-200/60 dark:shadow-none ${ring}`}
        >
            {initials}
        </div>
    );
};

// ─── Rank Badge ───────────────────────────────────────────────────────────────

const MEDAL = {
    1: { gradient: 'from-amber-400 to-yellow-300', text: 'text-amber-900', shadow: 'shadow-amber-300/70' },
    2: { gradient: 'from-slate-400 to-slate-300', text: 'text-slate-700', shadow: 'shadow-slate-300/70' },
    3: { gradient: 'from-orange-500 to-amber-500', text: 'text-white', shadow: 'shadow-orange-300/70' },
};

export const RankBadge = ({ rank }) => {
    const medal = MEDAL[rank];
    if (medal) {
        return (
            <div
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b ${medal.gradient} ${medal.text} text-sm font-bold shadow-md ${medal.shadow}`}
            >
                {rank}
            </div>
        );
    }
    return (
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {rank}
        </div>
    );
};

// ─── XP Bar ───────────────────────────────────────────────────────────────────

export const XpBar = ({ xp = 0, maxXp = 1 }) => {
    const pct = maxXp > 0 ? Math.min(100, Math.round((xp / maxXp) * 100)) : 0;
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-sm shadow-orange-300/60 motion-safe:transition-all motion-safe:duration-700"
                style={{ width: `${Math.max(3, pct)}%` }}
            />
        </div>
    );
};

// ─── Streak Badge ─────────────────────────────────────────────────────────────

export const StreakBadge = ({ days = 0 }) => {
    if (!days) return null;
    const cls =
        days >= 14
            ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 motion-safe:animate-pulse'
            : days >= 7
            ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
            <FiZap className="h-3 w-3 shrink-0" />
            {days}d
        </span>
    );
};

// ─── Rank Delta ───────────────────────────────────────────────────────────────

export const RankDelta = ({ delta }) => {
    if (!delta) return null;
    const up = delta > 0;
    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                up
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
            }`}
        >
            {up
                ? <FiTrendingUp className="h-3 w-3 shrink-0" />
                : <FiTrendingDown className="h-3 w-3 shrink-0" />
            }
            {up ? '+' : ''}{delta}
        </span>
    );
};

// ─── Podium ───────────────────────────────────────────────────────────────────

// Display order left→right: 2nd | 1st | 3rd
const PODIUM_DISPLAY_ORDER = [1, 0, 2];

const PODIUM_CONFIG = {
    0: { platformH: 'h-20 sm:h-28', avatarSize: 'lg', ringClass: 'ring-4 ring-offset-2 ring-amber-400/60 dark:ring-offset-slate-950', platformGrad: 'from-amber-400 to-amber-500', showCrown: true },
    1: { platformH: 'h-14 sm:h-20', avatarSize: 'md', ringClass: 'ring-2 ring-offset-1 ring-slate-300/60 dark:ring-offset-slate-950', platformGrad: 'from-slate-300 to-slate-400', showCrown: false },
    2: { platformH: 'h-10 sm:h-16', avatarSize: 'md', ringClass: 'ring-2 ring-offset-1 ring-orange-400/50 dark:ring-offset-slate-950', platformGrad: 'from-orange-400 to-orange-500', showCrown: false },
};

const PodiumSlot = ({ item, rank }) => {
    const { t } = useTranslation();
    const cfg = PODIUM_CONFIG[rank - 1] || PODIUM_CONFIG[2];
    const medal = MEDAL[rank] || MEDAL[3];
    const name = item?.fullName || t('public.leaderboard.defaultStudent');

    return (
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            {cfg.showCrown && (
                <FiAward className="h-6 w-6 text-amber-500 drop-shadow-sm" aria-hidden="true" />
            )}
            {!cfg.showCrown && <div className="h-6" />}

            <div className="relative">
                {rank === 1 && (
                    <span className="pointer-events-none absolute -inset-2 rounded-full bg-amber-400/25 motion-safe:animate-ping" aria-hidden="true" />
                )}
                <LeaderboardAvatar src={item?.avatarUrl} name={name} size={cfg.avatarSize} ring={cfg.ringClass} />
                <div
                    className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b text-xs font-bold shadow-sm ${medal.gradient} ${medal.text}`}
                >
                    {rank}
                </div>
            </div>

            <div className="w-full max-w-[88px] text-center">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={name}>
                    {name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {Number(item?.xp || 0).toLocaleString()} XP
                </p>
                {Number(item?.streakDays) > 0 && (
                    <div className="mt-1 flex justify-center">
                        <StreakBadge days={item.streakDays} />
                    </div>
                )}
            </div>

            <div className={`w-full rounded-t-xl ${cfg.platformH} bg-gradient-to-b ${cfg.platformGrad} flex items-start justify-center pt-2`}>
                <span className="text-lg font-bold text-white/30">{rank}</span>
            </div>
        </div>
    );
};

export const Podium = ({ items = [] }) => {
    const top3 = items.slice(0, 3);
    if (!top3.length) return null;

    return (
        <div className="flex items-end justify-center gap-2 px-2 sm:gap-4 sm:px-4">
            {PODIUM_DISPLAY_ORDER.map((idx) => {
                const item = top3[idx];
                if (!item) return <div key={idx} className="flex-1 max-w-[100px]" />;
                return <PodiumSlot key={idx} item={item} rank={idx + 1} />;
            })}
        </div>
    );
};

// ─── Leader Row ───────────────────────────────────────────────────────────────

export const LeaderRow = ({
    item,
    rank,
    isCurrentUser = false,
    maxXp = 1,
    embedded = false,
}) => {
    const { t } = useTranslation();
    const name = item?.fullName || item?.name || t('public.leaderboard.defaultStudent');
    const xp = Number(item?.xp || 0);
    const streak = Number(item?.streakDays || 0);
    const quizzes = Number(item?.quizzesPassed || 0);

    return (
        <div
            className={[
                'flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-md',
                isCurrentUser
                    ? 'border border-l-4 border-orange-300 border-l-orange-500 bg-orange-50/80 dark:border-orange-500/40 dark:border-l-orange-500 dark:bg-orange-500/10'
                    : embedded
                    ? 'border-gray-100 bg-gray-50 hover:border-gray-200 dark:border-gray-800 dark:bg-[#1A1A1A] dark:hover:border-gray-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700',
            ].join(' ')}
        >
            <RankBadge rank={rank} />
            <LeaderboardAvatar src={item?.avatarUrl} name={name} size="sm" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {name}
                    </p>
                    {isCurrentUser && (
                        <span className="shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {t('public.leaderboard.rank.youSuffix')}
                        </span>
                    )}
                    {quizzes > 0 && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {t('public.leaderboard.quizzes', { count: quizzes })}
                        </span>
                    )}
                </div>
                <div className="mt-1.5">
                    <XpBar xp={xp} maxXp={maxXp} />
                </div>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                    {xp.toLocaleString()}
                    <span className="ml-0.5 text-xs font-medium text-slate-400 dark:text-slate-500"> XP</span>
                </p>
                {streak > 0 && (
                    <div className="mt-0.5 flex justify-end">
                        <StreakBadge days={streak} />
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Leaderboard List ─────────────────────────────────────────────────────────

export const LeaderboardList = ({
    title,
    description,
    items = [],
    currentUserId = null,
    showPodium = true,
    embedded = false,
    footer = null,
}) => {
    const { t } = useTranslation();
    const maxXp = useMemo(
        () => Math.max(1, ...items.map((i) => Number(i?.xp || 0))),
        [items]
    );
    const podiumItems = showPodium ? items.slice(0, 3) : [];
    const rowItems = showPodium ? items.slice(3) : items;

    return (
        <section
            className={
                embedded
                    ? 'rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#222222]'
                    : 'rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950'
            }
        >
            {(title || description) && (
                <div className="px-5 pt-5">
                    {title && (
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                    )}
                    {description && (
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                    )}
                </div>
            )}

            {showPodium && podiumItems.length > 0 && (
                <div className="relative mt-6 overflow-hidden border-b border-slate-100 pb-6 dark:border-slate-800">
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.10),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.06),transparent_70%)]"
                        aria-hidden="true"
                    />
                    <p className="relative mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-amber-500 dark:text-amber-400">
                        {t('public.leaderboard.podium.championsTitle', { defaultValue: "This Week's Champions" })}
                    </p>
                    <Podium items={podiumItems} />
                </div>
            )}

            {rowItems.length > 0 ? (
                <div className="space-y-2 p-4">
                    {rowItems.map((item, idx) => {
                        const rank = (showPodium ? 3 : 0) + idx + 1;
                        const isCurrentUser =
                            currentUserId && Number(item?.studentId) === Number(currentUserId);
                        return (
                            <LeaderRow
                                key={item?.studentId || item?.id || idx}
                                item={item}
                                rank={rank}
                                isCurrentUser={isCurrentUser}
                                maxXp={maxXp}
                                embedded={embedded}
                            />
                        );
                    })}
                </div>
            ) : items.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    {t('public.leaderboard.emptyNotEnoughData')}
                </p>
            ) : null}

            {footer && (
                <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
                    {footer}
                </div>
            )}
        </section>
    );
};

// ─── Your Position Banner ─────────────────────────────────────────────────────

export const YourPositionBanner = ({
    rank = null,
    xp = 0,
    streak = 0,
    delta = null,
    targetGap = null,
    nextTargetName = '',
    percentile = null,
    embedded = false,
}) => {
    const { t } = useTranslation();
    const rankValue = rank ? `#${rank}` : t('public.leaderboard.rank.notYet');

    const tierText =
        rank === 1
            ? t('public.leaderboard.banner.leading', { defaultValue: 'Leading the board this week' })
            : percentile != null && percentile <= 10
            ? t('public.leaderboard.banner.top10', { defaultValue: 'Top 10% of learners' })
            : percentile != null && percentile <= 25
            ? t('public.leaderboard.banner.top25', { defaultValue: 'Top 25% of learners' })
            : percentile != null && percentile <= 50
            ? t('public.leaderboard.banner.aboveAvg', { defaultValue: 'Above average this week' })
            : null;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 p-5 text-white shadow-lg shadow-orange-300/30 dark:shadow-orange-900/30 sm:p-6">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_55%)]"
                aria-hidden="true"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
                        {t('public.leaderboard.metrics.myRank')}
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className={`font-bold ${embedded ? 'text-3xl' : 'text-4xl'}`}>
                            {rankValue}
                        </span>
                        {delta ? <RankDelta delta={delta} /> : null}
                    </div>
                    {tierText && (
                        <p className="mt-0.5 text-sm font-semibold text-white/85">
                            {tierText}
                        </p>
                    )}
                    {targetGap && nextTargetName ? (
                        <p className="mt-1 text-sm text-orange-100">
                            {t('public.leaderboard.near.targetGap', {
                                name: nextTargetName,
                                xp: targetGap,
                            })}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-100">
                            {t('public.leaderboard.metrics.thisWeekXp')}
                        </p>
                        <p className="mt-1 text-2xl font-bold tabular-nums">
                            {Number(xp).toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-100">
                            {t('public.leaderboard.metrics.streak')}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                            <FiZap className="h-5 w-5 text-amber-300" aria-hidden="true" />
                            <span className="text-2xl font-bold">{streak || 0}</span>
                            <span className="text-sm font-medium text-orange-100">d</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Near You Strip ───────────────────────────────────────────────────────────

export const NearYouStrip = ({
    items = [],
    currentUserId = null,
    targetGap = null,
    nextTargetName = '',
    embedded = false,
}) => {
    const { t } = useTranslation();
    const normalized = asArray(items);
    const maxXp = useMemo(
        () => Math.max(1, ...normalized.map((i) => Number(i?.xp || 0))),
        [normalized]
    );

    if (!normalized.length) return null;

    return (
        <section
            className={
                embedded
                    ? 'rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222]'
                    : 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950'
            }
        >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <FiTarget className="h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t('public.leaderboard.near.title')}
                    </h3>
                </div>
                {targetGap && nextTargetName ? (
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                        {t('public.leaderboard.near.xpLeft', { xp: targetGap })}
                    </span>
                ) : null}
            </div>
            <div className="space-y-2">
                {normalized.map((item, idx) => {
                    const isCurrentUser =
                        currentUserId && Number(item?.studentId) === Number(currentUserId);
                    return (
                        <LeaderRow
                            key={item?.studentId || item?.id || idx}
                            item={item}
                            rank={Number(item?.rank) || idx + 1}
                            isCurrentUser={isCurrentUser}
                            maxXp={maxXp}
                            embedded={embedded}
                        />
                    );
                })}
            </div>
        </section>
    );
};

// ─── Student of Week Card ─────────────────────────────────────────────────────

export const StudentOfWeekCard = ({ data = null }) => {
    const { t } = useTranslation();
    return (
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10">
            <div className="flex items-center gap-2">
                <FiAward className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                    {t('public.leaderboard.studentOfWeek')}
                </p>
            </div>
            {data?.fullName ? (
                <div className="mt-4 flex items-center gap-3">
                    <LeaderboardAvatar
                        src={data.avatarUrl}
                        name={data.fullName}
                        size="lg"
                        ring="ring-2 ring-offset-2 ring-amber-400/60 dark:ring-offset-transparent"
                    />
                    <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900 dark:text-white">
                            {data.fullName}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                            {Number(data.xp || 0).toLocaleString()} XP
                            {data.lessonsCompleted
                                ? ` · ${t('public.leaderboard.lessons', { count: data.lessonsCompleted })}`
                                : ''}
                        </p>
                        {Number(data.streakDays) > 0 && (
                            <div className="mt-1">
                                <StreakBadge days={data.streakDays} />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">
                    {t('public.leaderboard.spotlight.waitingLeader')}
                </p>
            )}
        </div>
    );
};

// ─── Public Join Panel ────────────────────────────────────────────────────────

export const PublicJoinPanel = ({ trustPoints = [] }) => {
    const { t } = useTranslation();
    const points = trustPoints.length
        ? trustPoints
        : asArray(t('public.leaderboard.publicTrustPoints', { returnObjects: true }));

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                {t('public.leaderboard.spotlight.eyebrow')}
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {t('public.leaderboard.spotlight.title')}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t('public.leaderboard.spotlight.description')}
            </p>
            {points.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {points.slice(0, 3).map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <FiZap className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
                            {point}
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                    to="/register"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                >
                    {t('public.leaderboard.spotlight.startNow')}
                    <FiArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                    to="/login"
                    className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                    {t('common.login')}
                </Link>
            </div>
        </div>
    );
};

// ─── My Skill Progress Grid ───────────────────────────────────────────────────

export const MySkillProgressGrid = ({ items = [], embedded = false }) => {
    const { t } = useTranslation();

    return (
        <section
            className={
                embedded
                    ? 'rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222]'
                    : 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950'
            }
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-sm">
                    <FiTarget className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        {t('public.leaderboard.skills.myProgressTitle')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('public.leaderboard.skills.myProgressDescription')}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {items.length ? (
                    items.map((item) => (
                        <article
                            key={item.id || item.slug || item.name}
                            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {item.name}
                                    </p>
                                    <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                        {t('public.leaderboard.skills.mastery', {
                                            count: item.progressPercent || 0,
                                        })}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-950/70 dark:text-slate-200">
                                    {item.xp || 0} XP
                                </span>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
                                    style={{
                                        width: `${Math.min(100, Math.max(0, Number(item.progressPercent || 0)))}%`,
                                    }}
                                />
                            </div>
                            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                    {t('public.leaderboard.skills.lessonRatio', {
                                        completed: item.completedLessons || 0,
                                        total: item.totalLessons || 0,
                                    })}
                                </span>
                                <span>
                                    {item.lastActivityAt
                                        ? t('public.leaderboard.skills.recentActivity')
                                        : t('public.leaderboard.skills.startNew')}
                                </span>
                            </div>
                        </article>
                    ))
                ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500 sm:col-span-2 2xl:col-span-3">
                        {t('public.leaderboard.skills.noPersonalProgress')}
                    </p>
                )}
            </div>
        </section>
    );
};

// ─── Skill Spotlight Grid ─────────────────────────────────────────────────────

const normalizeSkillKey = (v = '') =>
    String(v).trim().toLowerCase().replace(/[^\p{L}0-9]+/giu, '');

export const SkillSpotlightGrid = ({
    boards = [],
    personalProgress = [],
    featuredSlug = '',
    embedded = false,
}) => {
    const { t } = useTranslation();
    const cards = useMemo(() => boards.slice(0, 4), [boards]);
    const progressLookup = useMemo(
        () =>
            new Map(
                asArray(personalProgress)
                    .filter((item) => item?.slug || item?.name)
                    .map((item) => [normalizeSkillKey(item.slug || item.name), item])
            ),
        [personalProgress]
    );

    return (
        <section
            className={
                embedded
                    ? 'rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222]'
                    : 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950'
            }
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        {t('public.leaderboard.skillSpotlight.title')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('public.leaderboard.skillSpotlight.subtitle')}
                    </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {t('public.leaderboard.skillSpotlight.directionCount', { count: cards.length })}
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {cards.length ? (
                    cards.map((board, index) => {
                        const leader = board.items?.[0];
                        const personal =
                            progressLookup.get(normalizeSkillKey(board.slug || board.label)) ||
                            progressLookup.get(normalizeSkillKey(board.label));
                        const isFeatured =
                            featuredSlug &&
                            String(board.slug || '').toLowerCase() === String(featuredSlug).toLowerCase();
                        const personalPercent = Math.max(0, Math.min(100, Number(personal?.progressPercent || 0)));
                        const personalXp = Number(personal?.xp || 0);
                        const leaderXp = Number(leader?.xp || 0);
                        const xpGap = leader && personal ? Math.max(0, leaderXp - personalXp + 1) : null;

                        const nextHint = personal
                            ? personalPercent >= 100
                                ? t('public.leaderboard.skillSpotlight.hints.complete')
                                : xpGap && xpGap > 0
                                ? t('public.leaderboard.skillSpotlight.hints.xpGap', { xp: xpGap })
                                : t('public.leaderboard.skillSpotlight.hints.ready')
                            : t('public.leaderboard.skillSpotlight.hints.start');

                        return (
                            <article
                                key={board.slug || board.label || index}
                                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {board.label}
                                            </p>
                                            {isFeatured && (
                                                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                    {t('public.leaderboard.skillSpotlight.featured')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                            {personal
                                                ? t('public.leaderboard.skillSpotlight.personalPercent', { count: personalPercent })
                                                : t('public.leaderboard.skillSpotlight.personalPending')}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm dark:bg-slate-950/70 dark:text-slate-200">
                                        #{leader ? 1 : '-'}
                                    </span>
                                </div>

                                {leader && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <LeaderboardAvatar src={leader.avatarUrl} name={leader.fullName} size="sm" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                                {leader.fullName || t('public.leaderboard.skillSpotlight.noLeader')}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {leader.xp || 0} XP
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
                                        style={{ width: `${personalPercent}%` }}
                                    />
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                    {nextHint}
                                </p>

                                {xpGap && xpGap > 0 ? (
                                    <p className="mt-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                        +{xpGap} XP {t('public.leaderboard.skillSpotlight.hints.xpGap', { xp: '' }).replace(/\d+/, '').trim()}
                                    </p>
                                ) : null}
                            </article>
                        );
                    })
                ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500 sm:col-span-2">
                        {t('public.leaderboard.skillSpotlight.empty')}
                    </p>
                )}
            </div>
        </section>
    );
};

// ─── Achievement Cloud ────────────────────────────────────────────────────────

const RARITY_STYLE = {
    epic: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
    rare: 'border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10',
    common: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60',
};

const RARITY_ICON = {
    epic: FiZap,
    rare: FiAward,
    common: FiTarget,
};

export const AchievementCloud = ({ items = [], title = '', subtitle = '', embedded = false }) => {
    const { t } = useTranslation();
    const fallback = asArray(t('public.leaderboard.achievements.fallbackItems', { returnObjects: true }));
    const displayItems = items.length ? items : fallback;

    return (
        <section
            className={
                embedded
                    ? 'rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222]'
                    : 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950'
            }
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-sm">
                    <FiAward className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        {title || t('public.leaderboard.achievements.title')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subtitle || t('public.leaderboard.achievements.subtitle')}
                    </p>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {displayItems.map((item, idx) => {
                    const rarityKey = String(
                        item.rarity || (idx === 0 ? 'epic' : idx < 3 ? 'rare' : 'common')
                    ).toLowerCase();
                    const style = RARITY_STYLE[rarityKey] || RARITY_STYLE.common;
                    const RarityIcon = RARITY_ICON[rarityKey] || FiBarChart2;
                    return (
                        <article
                            key={item.id || item.title || idx}
                            className={`flex items-start gap-3 rounded-2xl border p-4 ${style}`}
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/85 text-slate-900 shadow-sm dark:bg-slate-900/70 dark:text-white">
                                <RarityIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {item.title || item.name}
                                    </p>
                                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                                        {t(`public.leaderboard.rarity.${rarityKey}`, { defaultValue: rarityKey.toUpperCase() })}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {item.description || t('public.leaderboard.achievements.defaultDescription')}
                                </p>
                                <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.16em] ${item.unlocked === false ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {item.unlocked === false
                                        ? t('public.leaderboard.achievements.locked')
                                        : t('public.leaderboard.achievements.unlocked')}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

// ─── Challenge Rail ───────────────────────────────────────────────────────────

const inferChallengeAction = (item = {}, t) => {
    const getDefaults = (kind = 'open') => {
        const map = {
            progress: { to: getDashboardPath('student', 'progress'), label: t('public.leaderboard.challenge.actions.progress') },
            course: { to: getDashboardPath('student', 'my-courses'), label: t('public.leaderboard.challenge.actions.course') },
            continue: { to: getDashboardPath('student', 'my-courses'), label: t('public.leaderboard.challenge.actions.continue') },
            leaderboard: { to: getDashboardPath('student', 'leaderboard'), label: t('public.leaderboard.challenge.actions.leaderboard') },
        };
        return map[kind] || { to: getDashboardPath('student', 'my-courses'), label: t('public.leaderboard.challenge.actions.open') };
    };

    if (item.actionPath || item.actionLabel || item.actionKind) {
        const d = getDefaults(item.actionKind);
        return { to: item.actionPath || d.to, label: item.actionLabel || d.label, kind: item.actionKind || 'open' };
    }

    const haystack = `${item.title || ''} ${item.detail || ''} ${item.value || ''}`.toLowerCase();
    const hasKw = (key) =>
        asArray(t(`public.leaderboard.challenge.keywords.${key}`, { returnObjects: true }))
            .some((kw) => haystack.includes(String(kw).toLowerCase()));

    if (hasKw('progress')) return { ...getDefaults('progress'), kind: 'progress' };
    if (hasKw('course')) return { ...getDefaults('course'), kind: 'course' };
    if (hasKw('continue')) return { ...getDefaults('continue'), kind: 'continue' };
    return { ...getDefaults('leaderboard'), kind: 'leaderboard' };
};

const CHALLENGE_META = {
    skill: { icon: FiBarChart2, badge: 'challenge.badges.skill', badgeCls: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200' },
    continue: { icon: FiZap, badge: 'challenge.badges.continue', badgeCls: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200' },
    progress: { icon: FiTarget, badge: 'challenge.badges.progress', badgeCls: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' },
    course: { icon: FiTrendingUp, badge: 'challenge.badges.course', badgeCls: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200' },
    leaderboard: { icon: FiBarChart2, badge: 'challenge.badges.leaderboard', badgeCls: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200' },
    open: { icon: FiArrowRight, badge: 'challenge.badges.leaderboard', badgeCls: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200' },
};

export const ChallengeRail = ({ items = [], embedded = false }) => {
    const { t } = useTranslation();
    const fallback = asArray(t('public.leaderboard.challenge.fallbackItems', { returnObjects: true }));
    const displayItems = items.length ? items : fallback;

    return (
        <section
            className={
                embedded
                    ? 'rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222]'
                    : 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950'
            }
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    <FiTarget className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        {t('public.leaderboard.challenge.title')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('public.leaderboard.challenge.subtitle')}
                    </p>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {displayItems.map((item, idx) => {
                    const progress = Number(item.progress || 0);
                    const target = Number(item.target || 0);
                    const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : null;
                    const highlighted = idx === 0;
                    const action = inferChallengeAction(item, t);
                    const meta = CHALLENGE_META[action.kind] || CHALLENGE_META.open;
                    const MetaIcon = meta.icon;

                    return (
                        <div
                            key={item.id || item.title || idx}
                            className={[
                                'rounded-2xl border p-4',
                                highlighted
                                    ? 'border-orange-200 bg-orange-50/80 dark:border-orange-500/30 dark:bg-orange-500/10'
                                    : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50',
                            ].join(' ')}
                        >
                            {highlighted && (
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                                    {t('public.leaderboard.challenge.bestStep')}
                                </p>
                            )}
                            <p className={`font-semibold text-slate-900 dark:text-white ${highlighted ? 'text-base' : 'text-sm'}`}>
                                {item.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {item.detail || item.value}
                            </p>

                            {target > 0 && (
                                <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span>{progress}/{target}</span>
                                        <span>{percent}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {item.reward && (
                                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
                                        {t('public.leaderboard.challenge.reward', { reward: item.reward })}
                                    </span>
                                )}
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badgeCls}`}>
                                    <MetaIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                                    {t(`public.leaderboard.${meta.badge}`)}
                                </span>
                            </div>

                            <div className="mt-3">
                                <Link
                                    to={action.to}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:bg-slate-900"
                                >
                                    {action.label}
                                    <FiArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// ─── PropTypes ────────────────────────────────────────────────────────────────

LeaderboardAvatar.propTypes = { src: PropTypes.string, name: PropTypes.string, size: PropTypes.oneOf(['sm', 'md', 'lg']), ring: PropTypes.string };
LeaderboardAvatar.defaultProps = { src: null, name: '', size: 'md', ring: '' };

RankBadge.propTypes = { rank: PropTypes.number };
RankBadge.defaultProps = { rank: null };

XpBar.propTypes = { xp: PropTypes.number, maxXp: PropTypes.number };
XpBar.defaultProps = { xp: 0, maxXp: 1 };

StreakBadge.propTypes = { days: PropTypes.number };
StreakBadge.defaultProps = { days: 0 };

RankDelta.propTypes = { delta: PropTypes.number };
RankDelta.defaultProps = { delta: null };

Podium.propTypes = { items: PropTypes.arrayOf(PropTypes.object) };
Podium.defaultProps = { items: [] };

LeaderRow.propTypes = {
    item: PropTypes.object,
    rank: PropTypes.number.isRequired,
    isCurrentUser: PropTypes.bool,
    maxXp: PropTypes.number,
    embedded: PropTypes.bool,
};
LeaderRow.defaultProps = { item: null, isCurrentUser: false, maxXp: 1, embedded: false };

LeaderboardList.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object),
    currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    showPodium: PropTypes.bool,
    embedded: PropTypes.bool,
    footer: PropTypes.node,
};
LeaderboardList.defaultProps = { title: '', description: '', items: [], currentUserId: null, showPodium: true, embedded: false, footer: null };

YourPositionBanner.propTypes = {
    rank: PropTypes.number,
    xp: PropTypes.number,
    streak: PropTypes.number,
    delta: PropTypes.number,
    targetGap: PropTypes.number,
    nextTargetName: PropTypes.string,
    percentile: PropTypes.number,
    embedded: PropTypes.bool,
};
YourPositionBanner.defaultProps = { rank: null, xp: 0, streak: 0, delta: null, targetGap: null, nextTargetName: '', percentile: null, embedded: false };

NearYouStrip.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    targetGap: PropTypes.number,
    nextTargetName: PropTypes.string,
    embedded: PropTypes.bool,
};
NearYouStrip.defaultProps = { items: [], currentUserId: null, targetGap: null, nextTargetName: '', embedded: false };

StudentOfWeekCard.propTypes = { data: PropTypes.object };
StudentOfWeekCard.defaultProps = { data: null };

PublicJoinPanel.propTypes = { trustPoints: PropTypes.arrayOf(PropTypes.string) };
PublicJoinPanel.defaultProps = { trustPoints: [] };

MySkillProgressGrid.propTypes = { items: PropTypes.arrayOf(PropTypes.object), embedded: PropTypes.bool };
MySkillProgressGrid.defaultProps = { items: [], embedded: false };

SkillSpotlightGrid.propTypes = {
    boards: PropTypes.arrayOf(PropTypes.shape({ slug: PropTypes.string, label: PropTypes.string, items: PropTypes.array })),
    personalProgress: PropTypes.arrayOf(PropTypes.object),
    featuredSlug: PropTypes.string,
    embedded: PropTypes.bool,
};
SkillSpotlightGrid.defaultProps = { boards: [], personalProgress: [], featuredSlug: '', embedded: false };

AchievementCloud.propTypes = { items: PropTypes.arrayOf(PropTypes.object), title: PropTypes.string, subtitle: PropTypes.string, embedded: PropTypes.bool };
AchievementCloud.defaultProps = { items: [], title: '', subtitle: '', embedded: false };

ChallengeRail.propTypes = { items: PropTypes.arrayOf(PropTypes.object), embedded: PropTypes.bool };
ChallengeRail.defaultProps = { items: [], embedded: false };

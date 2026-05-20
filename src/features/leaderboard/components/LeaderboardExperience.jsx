import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDashboardPath } from '@shared/utils/navigation';
import { FiArrowRight, FiAward, FiBarChart2, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';

const accentSets = [
    'from-orange-500/12 via-amber-400/8 to-transparent border-orange-200/70 dark:border-orange-500/20',
    'from-cyan-500/12 via-sky-400/8 to-transparent border-cyan-200/70 dark:border-cyan-500/20',
    'from-emerald-500/12 via-lime-400/8 to-transparent border-emerald-200/70 dark:border-emerald-500/20',
    'from-fuchsia-500/12 via-rose-400/8 to-transparent border-fuchsia-200/70 dark:border-fuchsia-500/20',
];

const getRarityLabel = (t, rarity) =>
    t(`public.leaderboard.rarity.${rarity}`, {
        defaultValue: String(rarity || '').toUpperCase(),
    });
const asArray = (value) => (Array.isArray(value) ? value : []);

export const LeaderboardAvatar = ({ src, name, size = 'md' }) => {
    const dimensions = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
    };
    const initials = String(name || 'ED')
        .split(' ')
        .map((chunk) => chunk[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    if (src) {
        return (
            <img src={src} alt={name} className={`${dimensions[size]} rounded-2xl object-cover`} />
        );
    }

    return (
        <div
            className={`${dimensions[size]} rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 text-white flex items-center justify-center font-semibold shadow-lg shadow-orange-200/60 dark:shadow-none`}
        >
            {initials}
        </div>
    );
};

export const RankBadge = ({ rank, label = null }) => {
    const { t } = useTranslation();
    const isTopThree = rank && rank <= 3;
    return (
        <div
            className={[
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                isTopThree
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-200/70 dark:shadow-none'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
            ].join(' ')}
        >
            <span>{rank ? `#${rank}` : t('public.leaderboard.rank.top')}</span>
            {label ? <span className="opacity-80">{label}</span> : null}
        </div>
    );
};

export const LeaderboardHero = ({
    userName,
    snapshot,
    xp = 0,
    streakDays = 0,
    levelLabel = '',
    title = '',
    description,
    embedded = false,
}) => {
    const { t } = useTranslation();
    const detailText =
        description ||
        (snapshot.rank
            ? t('public.leaderboard.hero.rankedDescription', {
                  rank: snapshot.rank,
                  xp: snapshot.targetGap,
              })
            : t('public.leaderboard.hero.unrankedDescription', { xp }));
    const nextActionTitle = snapshot.targetGap
        ? t('public.leaderboard.hero.nextActionWithGap', { xp: snapshot.targetGap })
        : t('public.leaderboard.hero.nextActionReady');
    const nextActionHint = snapshot.targetGap
        ? t('public.leaderboard.hero.nextActionHintWithGap')
        : t('public.leaderboard.hero.nextActionHintReady');
    const shellClassName = embedded
        ? 'relative overflow-hidden rounded-[28px] border border-gray-100 bg-white p-6 text-gray-900 shadow-sm dark:border-gray-800 dark:bg-[#222222] dark:text-[#E8ECF3] sm:p-8'
        : 'relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.28),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#111827_52%,_#1d4ed8_100%)] p-6 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.85)] sm:p-8';
    const glowClassName = embedded
        ? 'absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle,_rgba(59,130,246,0.12),_transparent_62%)]'
        : 'absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle,_rgba(255,255,255,0.22),_transparent_62%)]';
    const eyebrowClassName = embedded
        ? 'inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200'
        : 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100';
    const bodyTextClassName = embedded
        ? 'max-w-xl text-sm text-gray-600 dark:text-gray-300 sm:text-base'
        : 'max-w-xl text-sm text-slate-200 sm:text-base';
    const statPillClassName = embedded
        ? 'inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
        : 'inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur';
    const actionCardClassName = embedded
        ? 'rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1A1A1A]'
        : 'rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur';
    const actionLabelClassName = embedded
        ? 'text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400'
        : 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-200';
    const actionHintClassName = embedded
        ? 'mt-1 text-sm text-gray-600 dark:text-gray-300'
        : 'mt-1 text-sm text-slate-200';

    return (
        <section className={shellClassName}>
            <div className={glowClassName} />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl space-y-4">
                    <div className={eyebrowClassName}>
                        <FiZap className="shrink-0" />
                        {levelLabel || t('public.leaderboard.hero.levelLabel')}
                    </div>
                    <div className="space-y-2">
                        <h1
                            className={`text-3xl font-semibold leading-tight sm:text-4xl ${embedded ? 'text-gray-900 dark:text-[#E8ECF3]' : ''}`}
                        >
                            {title || t('public.leaderboard.hero.defaultTitle')}
                        </h1>
                        <p className={bodyTextClassName}>
                            {userName ? `${userName}, ` : ''}
                            {detailText}
                        </p>
                    </div>
                    <div
                        className={`flex flex-wrap gap-3 text-sm ${embedded ? '' : 'text-slate-100/90'}`}
                    >
                        <span className={statPillClassName}>
                            <FiBarChart2 className="shrink-0" />
                            {snapshot.rank
                                ? t('public.leaderboard.rank.yourRank', { rank: snapshot.rank })
                                : t('public.leaderboard.rank.calculating')}
                        </span>
                        <span className={statPillClassName}>
                            <FiTrendingUp className="shrink-0" />
                            {xp} XP
                        </span>
                        <span className={statPillClassName}>
                            <span className="text-base">🔥</span>
                            {t('public.leaderboard.units.dayStreak', { count: streakDays })}
                        </span>
                    </div>
                </div>

                <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                    <HeroMetricCard
                        label={t('public.leaderboard.hero.nextJump')}
                        value={
                            snapshot.targetGap
                                ? `${snapshot.targetGap} XP`
                                : t('public.leaderboard.hero.ready')
                        }
                        helper={
                            snapshot.nextTargetEntry
                                ? t('public.leaderboard.hero.closerToLeader', {
                                      name:
                                          snapshot.nextTargetEntry.fullName ||
                                          t('public.leaderboard.rank.leader'),
                                  })
                                : t('public.leaderboard.hero.newWin')
                        }
                        embedded={embedded}
                    />
                    <HeroMetricCard
                        label={t('public.leaderboard.hero.visibility')}
                        value={
                            snapshot.percentile
                                ? `%${snapshot.percentile}`
                                : t('public.leaderboard.rank.top')
                        }
                        helper={t('public.leaderboard.hero.weeklyMomentum')}
                        embedded={embedded}
                    />
                    <div className={actionCardClassName}>
                        <p className={actionLabelClassName}>
                            {t('public.leaderboard.hero.nextStep')}
                        </p>
                        <p
                            className={`mt-2 text-lg font-semibold leading-tight ${embedded ? 'text-gray-900 dark:text-[#E8ECF3]' : ''}`}
                        >
                            {nextActionTitle}
                        </p>
                        <p className={actionHintClassName}>{nextActionHint}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HeroMetricCard = ({ label, value, helper, embedded = false }) => (
    <div
        className={
            embedded
                ? 'rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1A1A1A]'
                : 'rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur'
        }
    >
        <p
            className={
                embedded
                    ? 'text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400'
                    : 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-200'
            }
        >
            {label}
        </p>
        <p
            className={
                embedded
                    ? 'mt-2 text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]'
                    : 'mt-2 text-2xl font-semibold text-white'
            }
        >
            {value}
        </p>
        <p
            className={
                embedded
                    ? 'mt-1 text-sm text-gray-600 dark:text-gray-300'
                    : 'mt-1 text-sm text-slate-200'
            }
        >
            {helper}
        </p>
    </div>
);

export const LeaderboardListCard = ({
    title,
    description,
    items,
    currentUserId = null,
    footer = null,
    embedded = false,
}) => {
    const { t } = useTranslation();

    return (
        <section
            className={
                embedded
                    ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6'
                    : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3
                        className={
                            embedded
                                ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                : 'text-lg font-semibold text-slate-900 dark:text-white'
                        }
                    >
                        {title}
                    </h3>
                    {description ? (
                        <p
                            className={
                                embedded
                                    ? 'mt-1 text-sm text-gray-500 dark:text-gray-400'
                                    : 'mt-1 text-sm text-slate-500 dark:text-slate-300'
                            }
                        >
                            {description}
                        </p>
                    ) : null}
                </div>
                <RankBadge
                    rank={items?.length ? 1 : null}
                    label={
                        items?.length
                            ? t('public.leaderboard.units.players', { count: items.length })
                            : t('common.empty')
                    }
                />
            </div>
            <div className="mt-5 space-y-3">
                {items?.length ? (
                    items.map((item, index) => {
                        const isCurrentUser =
                            currentUserId && Number(item?.studentId) === Number(currentUserId);
                        return (
                            <div
                                key={item?.studentId || item?.id || `${title}-${index}`}
                                className={[
                                    'flex items-center gap-4 rounded-[22px] border px-4 py-3 transition-colors',
                                    isCurrentUser
                                        ? embedded
                                            ? 'border-blue-100 bg-blue-50/80 dark:border-blue-500/20 dark:bg-blue-500/10'
                                            : 'border-orange-200 bg-orange-50/80 dark:border-orange-500/30 dark:bg-orange-500/10'
                                        : embedded
                                          ? 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-[#1A1A1A]'
                                          : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50',
                                ].join(' ')}
                            >
                                <RankBadge rank={index + 1} />
                                <LeaderboardAvatar
                                    src={item?.avatarUrl}
                                    name={item?.fullName || item?.name}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={
                                            embedded
                                                ? 'truncate font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                                : 'truncate font-semibold text-slate-900 dark:text-white'
                                        }
                                    >
                                        {item?.fullName ||
                                            item?.name ||
                                            t('public.leaderboard.defaultStudent')}
                                        {isCurrentUser
                                            ? t('public.leaderboard.rank.youSuffix')
                                            : ''}
                                    </p>
                                    <p
                                        className={
                                            embedded
                                                ? 'mt-1 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400'
                                                : 'mt-1 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-300'
                                        }
                                    >
                                        <span>{item?.xp || 0} XP</span>
                                        {Number(item?.progressPercent) > 0 ? (
                                            <span>
                                                {t('public.leaderboard.progress', {
                                                    count: item.progressPercent,
                                                })}
                                            </span>
                                        ) : null}
                                        {Number(item?.streakDays) > 0 ? (
                                            <span>
                                                {t('public.leaderboard.units.dayStreak', {
                                                    count: item.streakDays,
                                                })}
                                            </span>
                                        ) : null}
                                    </p>
                                </div>
                                {Number(item?.quizzesPassed) > 0 ? (
                                    <span
                                        className={
                                            embedded
                                                ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-900'
                                                : 'rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900'
                                        }
                                    >
                                        {t('public.leaderboard.quizzes', {
                                            count: item.quizzesPassed,
                                        })}
                                    </span>
                                ) : null}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                        {t('public.leaderboard.emptyNotEnoughData')}
                    </div>
                )}
            </div>
            {footer ? <div className="mt-4">{footer}</div> : null}
        </section>
    );
};

export const NearYouRail = ({
    items = [],
    currentUserId = null,
    targetGap = null,
    nextTargetName = '',
    embedded = false,
}) => {
    const { t } = useTranslation();
    const normalizedItems = Array.isArray(items) ? items : [];
    const currentUser = normalizedItems.find(
        (item) => currentUserId && Number(item?.studentId) === Number(currentUserId)
    );
    const currentXp = Number(currentUser?.xp || 0);

    return (
        <section
            className={
                embedded
                    ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6'
                    : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'
            }
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p
                        className={
                            embedded
                                ? 'text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300'
                                : 'text-xs font-semibold uppercase tracking-[0.18em] text-orange-500'
                        }
                    >
                        {t('public.leaderboard.near.eyebrow')}
                    </p>
                    <h3
                        className={
                            embedded
                                ? 'mt-2 text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                : 'mt-2 text-lg font-semibold text-slate-900 dark:text-white'
                        }
                    >
                        {t('public.leaderboard.near.title')}
                    </h3>
                    <p
                        className={
                            embedded
                                ? 'mt-1 text-sm text-gray-500 dark:text-gray-400'
                                : 'mt-1 text-sm text-slate-500 dark:text-slate-300'
                        }
                    >
                        {t('public.leaderboard.near.description')}
                    </p>
                    <p
                        className={
                            embedded
                                ? 'mt-3 text-sm font-medium text-gray-700 dark:text-gray-200'
                                : 'mt-3 text-sm font-medium text-slate-700 dark:text-slate-200'
                        }
                    >
                        {targetGap && nextTargetName
                            ? t('public.leaderboard.near.targetGap', {
                                  name: nextTargetName,
                                  xp: targetGap,
                              })
                            : t('public.leaderboard.near.noGap')}
                    </p>
                </div>
                <div
                    className={
                        embedded
                            ? 'rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-right text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200'
                            : 'rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-right text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200'
                    }
                >
                    {targetGap
                        ? t('public.leaderboard.near.xpLeft', { xp: targetGap })
                        : t('public.leaderboard.rank.calculating')}
                </div>
            </div>
            <div className="mt-5 space-y-3">
                {normalizedItems.length ? (
                    normalizedItems.map((item, index) => {
                        const isCurrentUser =
                            currentUserId && Number(item?.studentId) === Number(currentUserId);
                        const xpGap =
                            !isCurrentUser && currentXp
                                ? Math.max(0, Number(item?.xp || 0) - currentXp + 1)
                                : null;
                        return (
                            <div
                                key={item?.studentId || item?.id || index}
                                className={[
                                    'flex items-center gap-3 rounded-[22px] border px-4 py-3',
                                    isCurrentUser
                                        ? embedded
                                            ? 'border-blue-100 bg-blue-50/80 dark:border-blue-500/20 dark:bg-blue-500/10'
                                            : 'border-orange-200 bg-[linear-gradient(135deg,_rgba(251,146,60,0.16),_rgba(255,255,255,0.96))] dark:border-orange-500/30 dark:bg-orange-500/10'
                                        : embedded
                                          ? 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-[#1A1A1A]'
                                          : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50',
                                ].join(' ')}
                            >
                                <RankBadge rank={Number(item?.rank) || index + 1} />
                                <LeaderboardAvatar
                                    src={item?.avatarUrl}
                                    name={item?.fullName || item?.name}
                                    size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={
                                            embedded
                                                ? 'truncate font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                                : 'truncate font-semibold text-slate-900 dark:text-white'
                                        }
                                    >
                                        {item?.fullName ||
                                            item?.name ||
                                            t('public.leaderboard.defaultStudent')}
                                        {isCurrentUser
                                            ? t('public.leaderboard.rank.youSuffix')
                                            : ''}
                                    </p>
                                    <p
                                        className={
                                            embedded
                                                ? 'mt-1 text-sm text-gray-500 dark:text-gray-400'
                                                : 'mt-1 text-sm text-slate-500 dark:text-slate-300'
                                        }
                                    >
                                        {item?.xp || 0} XP
                                        {Number(item?.streakDays) > 0
                                            ? ` · ${t('public.leaderboard.units.dayStreak', { count: item?.streakDays })}`
                                            : ''}
                                    </p>
                                </div>
                                {isCurrentUser ? (
                                    <span
                                        className={
                                            embedded
                                                ? 'rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white'
                                                : 'rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white'
                                        }
                                    >
                                        {t('public.leaderboard.near.yourPoint')}
                                    </span>
                                ) : xpGap ? (
                                    <span
                                        className={
                                            embedded
                                                ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-900'
                                                : 'rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900'
                                        }
                                    >
                                        +{xpGap} XP
                                    </span>
                                ) : null}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                        {t('public.leaderboard.near.empty')}
                    </div>
                )}
            </div>
        </section>
    );
};

export const MySkillProgressGrid = ({ items = [], embedded = false }) => {
    const { t } = useTranslation();

    return (
        <section
            className={
                embedded
                    ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6'
                    : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'
            }
        >
            <div className="flex items-center gap-3">
                <div
                    className={
                        embedded
                            ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500'
                            : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200/60 dark:shadow-none'
                    }
                >
                    <FiTarget />
                </div>
                <div>
                    <h3
                        className={
                            embedded
                                ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                : 'text-lg font-semibold text-slate-900 dark:text-white'
                        }
                    >
                        {t('public.leaderboard.skills.myProgressTitle')}
                    </h3>
                    <p
                        className={
                            embedded
                                ? 'text-sm text-gray-500 dark:text-gray-400'
                                : 'text-sm text-slate-500 dark:text-slate-300'
                        }
                    >
                        {t('public.leaderboard.skills.myProgressDescription')}
                    </p>
                </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {items.length ? (
                    items.map((item) => (
                        <article
                            key={item.id || item.slug || item.name}
                            className={
                                embedded
                                    ? 'rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1A1A1A]'
                                    : 'rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60'
                            }
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p
                                        className={
                                            embedded
                                                ? 'text-base font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                                : 'text-base font-semibold text-slate-900 dark:text-white'
                                        }
                                    >
                                        {item.name}
                                    </p>
                                    <p
                                        className={
                                            embedded
                                                ? 'mt-1 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400'
                                                : 'mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400'
                                        }
                                    >
                                        {t('public.leaderboard.skills.mastery', {
                                            count: item.progressPercent || 0,
                                        })}
                                    </p>
                                </div>
                                <span
                                    className={
                                        embedded
                                            ? 'rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200'
                                            : 'rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-950/70 dark:text-slate-200'
                                    }
                                >
                                    {item.xp || 0} XP
                                </span>
                            </div>
                            <div
                                className={
                                    embedded
                                        ? 'mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800'
                                        : 'mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'
                                }
                            >
                                <div
                                    className={
                                        embedded
                                            ? 'h-full rounded-full bg-blue-500'
                                            : 'h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500'
                                    }
                                    style={{
                                        width: `${Math.min(100, Math.max(0, Number(item.progressPercent || 0)))}%`,
                                    }}
                                />
                            </div>
                            <div
                                className={
                                    embedded
                                        ? 'mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'
                                        : 'mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300'
                                }
                            >
                                <span>
                                    {t('public.leaderboard.skills.lessonRatio', {
                                        completed: item.completedLessons || 0,
                                        total: item.totalLessons || 0,
                                    })}
                                </span>
                                {item.lastActivityAt ? (
                                    <span>{t('public.leaderboard.skills.recentActivity')}</span>
                                ) : (
                                    <span>{t('public.leaderboard.skills.startNew')}</span>
                                )}
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300 sm:col-span-2 xl:col-span-3">
                        {t('public.leaderboard.skills.noPersonalProgress')}
                    </div>
                )}
            </div>
        </section>
    );
};

export const AchievementCloud = ({ items = [], title = '', subtitle = '', embedded = false }) => {
    const { t } = useTranslation();
    const fallbackItems = asArray(
        t('public.leaderboard.achievements.fallbackItems', { returnObjects: true })
    );

    return (
        <section
            className={
                embedded
                    ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6'
                    : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'
            }
        >
            <div className="flex items-center gap-3">
                <div
                    className={
                        embedded
                            ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500'
                            : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200/60 dark:shadow-none'
                    }
                >
                    <FiAward />
                </div>
                <div>
                    <h3
                        className={
                            embedded
                                ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                : 'text-lg font-semibold text-slate-900 dark:text-white'
                        }
                    >
                        {title || t('public.leaderboard.achievements.title')}
                    </h3>
                    <p
                        className={
                            embedded
                                ? 'text-sm text-gray-500 dark:text-gray-400'
                                : 'text-sm text-slate-500 dark:text-slate-300'
                        }
                    >
                        {subtitle || t('public.leaderboard.achievements.subtitle')}
                    </p>
                </div>
            </div>
            <div
                className={
                    embedded
                        ? 'mt-5 grid grid-cols-1 gap-3'
                        : 'mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
                }
            >
                {(items.length ? items : fallbackItems).map((item, index) => {
                    const rarityKey = String(
                        item.rarity || (index === 0 ? 'epic' : index < 3 ? 'rare' : 'common')
                    ).toLowerCase();
                    const rarityLabel = getRarityLabel(t, rarityKey);
                    const achievementTitle = item.title || item.name;
                    const achievementDescription =
                        item.description || t('public.leaderboard.achievements.defaultDescription');
                    return (
                        <article
                            key={item.id || item.title || index}
                            className={
                                embedded
                                    ? 'flex w-full min-w-0 flex-col rounded-[24px] border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-[#1A1A1A]'
                                    : `flex h-full min-h-[320px] flex-col rounded-[24px] border bg-gradient-to-br ${accentSets[index % accentSets.length]} p-5`
                            }
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span
                                    className={
                                        embedded
                                            ? 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                                            : 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-slate-900 shadow-sm dark:bg-slate-900/70 dark:text-white'
                                    }
                                >
                                    <FiAward />
                                </span>
                                <span
                                    className={
                                        embedded
                                            ? 'rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200'
                                            : 'rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-950/70 dark:text-slate-200'
                                    }
                                >
                                    {rarityLabel}
                                </span>
                            </div>
                            <div className="mt-5 min-w-0 space-y-2">
                                <p
                                    className={
                                        embedded
                                            ? 'break-words text-xl font-semibold leading-tight text-gray-900 dark:text-[#E8ECF3]'
                                            : 'line-clamp-2 text-xl font-semibold leading-tight text-slate-900 dark:text-white'
                                    }
                                >
                                    {achievementTitle}
                                </p>
                                <p
                                    className={
                                        embedded
                                            ? 'break-words text-sm leading-6 text-gray-500 dark:text-gray-400'
                                            : 'line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300'
                                    }
                                >
                                    {achievementDescription}
                                </p>
                            </div>
                            <div className="mt-auto pt-5">
                                <div
                                    className={
                                        embedded
                                            ? 'mb-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-800'
                                            : 'mb-4 space-y-2 border-t border-white/70 pt-4 dark:border-slate-800/70'
                                    }
                                >
                                    <p
                                        className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${item.unlocked === false ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-300'}`}
                                    >
                                        {item.unlocked === false
                                            ? t('public.leaderboard.achievements.locked')
                                            : t('public.leaderboard.achievements.unlocked')}
                                    </p>
                                    <p
                                        className={
                                            embedded
                                                ? 'text-xs leading-5 text-gray-500 dark:text-gray-400'
                                                : 'text-xs leading-5 text-slate-500 dark:text-slate-400'
                                        }
                                    >
                                        {t('public.leaderboard.achievements.progressSignal')}
                                    </p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

const inferChallengeAction = (item = {}, t) => {
    const getActionDefaults = (kind = 'open') => {
        switch (kind) {
            case 'progress':
                return {
                    to: getDashboardPath('student', 'progress'),
                    label: t('public.leaderboard.challenge.actions.progress'),
                };
            case 'course':
                return {
                    to: getDashboardPath('student', 'my-courses'),
                    label: t('public.leaderboard.challenge.actions.course'),
                };
            case 'continue':
                return {
                    to: getDashboardPath('student', 'my-courses'),
                    label: t('public.leaderboard.challenge.actions.continue'),
                };
            case 'leaderboard':
                return {
                    to: getDashboardPath('student', 'leaderboard'),
                    label: t('public.leaderboard.challenge.actions.leaderboard'),
                };
            default:
                return {
                    to: getDashboardPath('student', 'my-courses'),
                    label: t('public.leaderboard.challenge.actions.open'),
                };
        }
    };

    if (item.actionPath || item.actionLabel || item.actionKind) {
        const defaults = getActionDefaults(item.actionKind);
        return {
            to: item.actionPath || defaults.to,
            label: item.actionLabel || defaults.label,
            kind: item.actionKind || 'open',
        };
    }

    const haystack = `${item.title || ''} ${item.detail || ''} ${item.value || ''}`.toLowerCase();
    const hasKeyword = (key) =>
        t(`public.leaderboard.challenge.keywords.${key}`, { returnObjects: true })
            .some((keyword) => haystack.includes(String(keyword).toLowerCase()));

    if (hasKeyword('progress')) {
        return {
            to: getDashboardPath('student', 'progress'),
            label: t('public.leaderboard.challenge.actions.progress'),
            kind: 'progress',
        };
    }
    if (hasKeyword('course')) {
        return {
            to: getDashboardPath('student', 'my-courses'),
            label: t('public.leaderboard.challenge.actions.course'),
            kind: 'course',
        };
    }
    if (hasKeyword('continue')) {
        return {
            to: getDashboardPath('student', 'my-courses'),
            label: t('public.leaderboard.challenge.actions.continue'),
            kind: 'continue',
        };
    }

    return {
        to: getDashboardPath('student', 'leaderboard'),
        label: t('public.leaderboard.challenge.actions.leaderboard'),
        kind: 'leaderboard',
    };
};

const challengeActionMeta = (kind = 'open', t) => {
    switch (kind) {
        case 'skill':
            return {
                icon: FiBarChart2,
                badge: t('public.leaderboard.challenge.badges.skill'),
                badgeClassName:
                    'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200',
            };
        case 'continue':
            return {
                icon: FiZap,
                badge: t('public.leaderboard.challenge.badges.continue'),
                badgeClassName:
                    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
            };
        case 'progress':
            return {
                icon: FiTarget,
                badge: t('public.leaderboard.challenge.badges.progress'),
                badgeClassName:
                    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
            };
        case 'course':
            return {
                icon: FiTrendingUp,
                badge: t('public.leaderboard.challenge.badges.course'),
                badgeClassName:
                    'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200',
            };
        case 'leaderboard':
        default:
            return {
                icon: FiArrowRight,
                badge: t('public.leaderboard.challenge.badges.leaderboard'),
                badgeClassName:
                    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
            };
    }
};

export const PublicSpotlightPanel = ({ studentOfWeek = null, highlights = [], metrics = [] }) => {
    const { t } = useTranslation();
    const benefits = [
        {
            icon: FiBarChart2,
            title: t('public.leaderboard.spotlight.benefits.growth.title'),
            detail: t('public.leaderboard.spotlight.benefits.growth.detail'),
            accent: 'border-cyan-200 bg-cyan-50/80 dark:border-cyan-500/20 dark:bg-cyan-500/10',
        },
        {
            icon: FiZap,
            title: t('public.leaderboard.spotlight.benefits.momentum.title'),
            detail: t('public.leaderboard.spotlight.benefits.momentum.detail'),
            accent: 'border-orange-200 bg-orange-50/80 dark:border-orange-500/20 dark:bg-orange-500/10',
        },
        {
            icon: FiAward,
            title: t('public.leaderboard.spotlight.benefits.wins.title'),
            detail: t('public.leaderboard.spotlight.benefits.wins.detail'),
            accent: 'border-fuchsia-200 bg-fuchsia-50/80 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10',
        },
    ];
    const fallbackMetrics = asArray(
        t('public.leaderboard.spotlight.fallbackMetrics', { returnObjects: true })
    );
    const fallbackHighlights = asArray(
        t('public.leaderboard.spotlight.fallbackHighlights', { returnObjects: true })
    );

    return (
        <section className="w-full max-w-full overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_50%,_#eff6ff_100%)] p-4 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,_#1e293b_0%,_#334155_50%,_#1e3a8a_100%)] sm:p-6">
            <div className="flex min-w-0 flex-col items-start justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                        {t('public.leaderboard.spotlight.eyebrow')}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                        {t('public.leaderboard.spotlight.title')}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {t('public.leaderboard.spotlight.description')}
                    </p>
                </div>
                <div className="grid min-w-0 w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
                    <Link
                        to="/courses"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900 sm:w-auto"
                    >
                        {t('public.leaderboard.spotlight.openCourses')}
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:w-auto"
                    >
                        {t('public.leaderboard.spotlight.startNow')}
                    </Link>
                </div>
            </div>
            <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="min-w-0 space-y-4">
                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                        {(metrics.length ? metrics : fallbackMetrics)
                            .slice(0, 3)
                            .map((metric, index) => (
                                <div
                                    key={`${metric.label}-${index}`}
                                    className="min-w-0 w-full max-w-full rounded-[20px] border border-slate-200 bg-white/85 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                                >
                                    <p className="break-words text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                        {metric.label}
                                    </p>
                                    <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-900 dark:text-white">
                                        {metric.value}
                                    </p>
                                    <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-300">
                                        {metric.helper}
                                    </p>
                                </div>
                            ))}
                    </div>
                    <div className="min-w-0 rounded-[24px] border border-orange-200 bg-white/80 p-5 dark:border-orange-500/20 dark:bg-slate-900/60">
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-200">
                                    {t('public.leaderboard.studentOfWeek')}
                                </p>
                                <div className="mt-4 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                                    <LeaderboardAvatar
                                        src={studentOfWeek?.avatarUrl}
                                        name={studentOfWeek?.fullName}
                                        size="lg"
                                    />
                                    <div className="min-w-0 max-w-full">
                                        <p className="break-words text-xl font-semibold leading-tight text-slate-900 dark:text-white">
                                            {studentOfWeek?.fullName ||
                                                t('public.leaderboard.spotlight.waitingLeader')}
                                        </p>
                                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                                            {studentOfWeek
                                                ? `${studentOfWeek.xp || 0} XP · ${t('public.leaderboard.metrics.lessonsClosed', { count: studentOfWeek.lessonsCompleted || 0 })}`
                                                : t(
                                                      'public.leaderboard.spotlight.waitingLeaderDescription'
                                                  )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <span className="self-start rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                                {t('public.leaderboard.spotlight.growing')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        {(highlights.length ? highlights : fallbackHighlights)
                            .slice(0, 3)
                            .map((entry, index) => (
                                <div
                                    key={`${entry}-${index}`}
                                    className="rounded-[20px] border border-slate-200 bg-white/80 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                                >
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                        0{index + 1}
                                    </span>
                                    <p className="mt-2 font-medium leading-6">{entry}</p>
                                </div>
                            ))}
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-white/85 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {t('public.leaderboard.spotlight.whyJoin')}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-300">
                                    {t('public.leaderboard.spotlight.whyJoinDescription')}
                                </p>
                            </div>
                            <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                {t('public.leaderboard.spotlight.benefitsCount')}
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3">
                            {benefits.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className={`rounded-[20px] border p-4 ${item.accent}`}
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-slate-900 shadow-sm dark:bg-slate-950/70 dark:text-white">
                                                <Icon className="text-lg" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                    {item.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const ChallengeRail = ({ items = [], embedded = false }) => {
    const { t } = useTranslation();
    const fallbackItems = asArray(
        t('public.leaderboard.challenge.fallbackItems', { returnObjects: true })
    );

    return (
        <section
            className={
                embedded
                    ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6'
                    : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'
            }
        >
            <div className="flex items-center gap-3">
                <div
                    className={
                        embedded
                            ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500'
                            : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    }
                >
                    <FiTarget />
                </div>
                <div>
                    <h3
                        className={
                            embedded
                                ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                : 'text-lg font-semibold text-slate-900 dark:text-white'
                        }
                    >
                        {t('public.leaderboard.challenge.title')}
                    </h3>
                    <p
                        className={
                            embedded
                                ? 'text-sm text-gray-500 dark:text-gray-400'
                                : 'text-sm text-slate-500 dark:text-slate-300'
                        }
                    >
                        {t('public.leaderboard.challenge.subtitle')}
                    </p>
                </div>
            </div>
            <div className="mt-5 space-y-3">
                {(items.length ? items : fallbackItems).map((item, index) => {
                    const progress = Number(item.progress || 0);
                    const target = Number(item.target || 0);
                    const percent =
                        target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : null;
                    const highlighted = index === 0;
                    const action = inferChallengeAction(item, t);
                    const actionMeta = challengeActionMeta(action.kind, t);
                    const ActionIcon = actionMeta.icon;

                    return (
                        <div
                            key={item.id || item.title || index}
                            className={[
                                'rounded-[22px] border p-4',
                                highlighted
                                    ? embedded
                                        ? 'border-blue-100 bg-blue-50/80 dark:border-blue-500/20 dark:bg-blue-500/10'
                                        : 'border-orange-200 bg-[linear-gradient(135deg,_rgba(251,146,60,0.16),_rgba(255,255,255,0.96))] dark:border-orange-500/30 dark:bg-orange-500/10'
                                    : embedded
                                      ? 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-[#1A1A1A]'
                                      : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50',
                            ].join(' ')}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    {highlighted ? (
                                        <p
                                            className={
                                                embedded
                                                    ? 'text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300'
                                                    : 'text-xs font-semibold uppercase tracking-[0.18em] text-orange-500'
                                            }
                                        >
                                            {t('public.leaderboard.challenge.bestStep')}
                                        </p>
                                    ) : null}
                                    <p
                                        className={`font-semibold ${highlighted ? 'mt-1 text-lg' : ''} ${embedded ? 'text-gray-900 dark:text-[#E8ECF3]' : 'text-slate-900 dark:text-white'}`}
                                    >
                                        {item.title}
                                    </p>
                                    <p
                                        className={
                                            embedded
                                                ? 'mt-1 text-sm text-gray-500 dark:text-gray-400'
                                                : 'mt-1 text-sm text-slate-500 dark:text-slate-300'
                                        }
                                    >
                                        {item.detail || item.value}
                                    </p>
                                </div>
                                <FiArrowRight
                                    className={`mt-1 shrink-0 ${highlighted ? (embedded ? 'text-blue-600 dark:text-blue-300' : 'text-orange-500') : embedded ? 'text-gray-400 dark:text-gray-500' : 'text-slate-400'}`}
                                />
                            </div>
                            {target > 0 ? (
                                <div className="mt-4 space-y-2">
                                    <div
                                        className={
                                            embedded
                                                ? 'flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400'
                                                : 'flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400'
                                        }
                                    >
                                        <span>
                                            {progress}/{target}
                                        </span>
                                        <span>{percent}%</span>
                                    </div>
                                    <div
                                        className={
                                            embedded
                                                ? 'h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800'
                                                : 'h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'
                                        }
                                    >
                                        <div
                                            className={
                                                embedded
                                                    ? 'h-full rounded-full bg-blue-500'
                                                    : 'h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300'
                                            }
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            ) : null}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {item.reward ? (
                                    <div
                                        className={
                                            embedded
                                                ? 'inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200'
                                                : 'inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200'
                                        }
                                    >
                                        {t('public.leaderboard.challenge.reward', {
                                            reward: item.reward,
                                        })}
                                    </div>
                                ) : null}
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${actionMeta.badgeClassName}`}
                                >
                                    <ActionIcon className="shrink-0" />
                                    {actionMeta.badge}
                                </span>
                                <span
                                    className={
                                        embedded
                                            ? 'inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                            : 'inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                    }
                                >
                                    {t('public.leaderboard.challenge.availableNow')}
                                </span>
                            </div>
                            <div className="mt-4">
                                <Link
                                    to={action.to}
                                    className={
                                        embedded
                                            ? 'inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1A1A1A] dark:text-gray-100 dark:hover:bg-gray-900'
                                            : 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:bg-slate-900'
                                    }
                                >
                                    <ActionIcon className="shrink-0" />
                                    {action.label}
                                    <FiArrowRight className="shrink-0" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const normalizeSkillKey = (value = '') =>
    String(value)
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}0-9]+/giu, '');

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
                (Array.isArray(personalProgress) ? personalProgress : [])
                    .filter((item) => item?.slug || item?.name)
                    .map((item) => [normalizeSkillKey(item.slug || item.name), item])
            ),
        [personalProgress]
    );

    return (
        <section
            className={
                embedded
                    ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6'
                    : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'
            }
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3
                        className={
                            embedded
                                ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                : 'text-lg font-semibold text-slate-900 dark:text-white'
                        }
                    >
                        {t('public.leaderboard.skillSpotlight.title')}
                    </h3>
                    <p
                        className={
                            embedded
                                ? 'text-sm text-gray-500 dark:text-gray-400'
                                : 'text-sm text-slate-500 dark:text-slate-300'
                        }
                    >
                        {t('public.leaderboard.skillSpotlight.subtitle')}
                    </p>
                </div>
                <span
                    className={
                        embedded
                            ? 'rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                            : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }
                >
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
                            String(board.slug || '').toLowerCase() ===
                                String(featuredSlug).toLowerCase();
                        const personalPercent = Math.max(
                            0,
                            Math.min(100, Number(personal?.progressPercent || 0))
                        );
                        const personalXp = Number(personal?.xp || 0);
                        const leaderXp = Number(leader?.xp || 0);
                        const xpGap =
                            leader && personal ? Math.max(0, leaderXp - personalXp + 1) : null;
                        const remainingProgress = Math.max(0, 100 - personalPercent);
                        const nextHint = personal
                            ? personalPercent >= 100
                                ? t('public.leaderboard.skillSpotlight.hints.complete')
                                : xpGap && xpGap > 0
                                  ? t('public.leaderboard.skillSpotlight.hints.xpGap', {
                                        xp: xpGap,
                                    })
                                  : remainingProgress > 0
                                    ? t(
                                          'public.leaderboard.skillSpotlight.hints.remainingProgress',
                                          { count: remainingProgress }
                                      )
                                    : t('public.leaderboard.skillSpotlight.hints.ready')
                            : t('public.leaderboard.skillSpotlight.hints.start');

                        return (
                            <article
                                key={board.slug || board.label || index}
                                className={
                                    embedded
                                        ? 'rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1A1A1A]'
                                        : `rounded-[22px] border bg-gradient-to-br ${accentSets[index % accentSets.length]} p-4`
                                }
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p
                                                className={
                                                    embedded
                                                        ? 'text-base font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                                        : 'text-base font-semibold text-slate-900 dark:text-white'
                                                }
                                            >
                                                {board.label}
                                            </p>
                                            {isFeatured ? (
                                                <span
                                                    className={
                                                        embedded
                                                            ? 'rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-gray-100 dark:text-gray-900'
                                                            : 'rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-900'
                                                    }
                                                >
                                                    {t(
                                                        'public.leaderboard.skillSpotlight.featured'
                                                    )}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p
                                            className={
                                                embedded
                                                    ? 'mt-1 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400'
                                                    : 'mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400'
                                            }
                                        >
                                            {personal
                                                ? t(
                                                      'public.leaderboard.skillSpotlight.personalPercent',
                                                      { count: personalPercent }
                                                  )
                                                : t(
                                                      'public.leaderboard.skillSpotlight.personalPending'
                                                  )}
                                        </p>
                                    </div>
                                    <span
                                        className={
                                            embedded
                                                ? 'rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200'
                                                : 'rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-950/70 dark:text-slate-200'
                                        }
                                    >
                                        #{leader ? 1 : '-'}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-3">
                                    <LeaderboardAvatar
                                        src={leader?.avatarUrl}
                                        name={leader?.fullName}
                                        size="sm"
                                    />
                                    <div className="min-w-0">
                                        <p
                                            className={
                                                embedded
                                                    ? 'truncate font-semibold text-gray-900 dark:text-[#E8ECF3]'
                                                    : 'truncate font-semibold text-slate-900 dark:text-white'
                                            }
                                        >
                                            {leader?.fullName ||
                                                t('public.leaderboard.skillSpotlight.noLeader')}
                                        </p>
                                        <p
                                            className={
                                                embedded
                                                    ? 'text-sm text-gray-500 dark:text-gray-400'
                                                    : 'text-sm text-slate-600 dark:text-slate-300'
                                            }
                                        >
                                            {leader
                                                ? `${leader.xp || 0} XP · ${t('public.leaderboard.progress', { count: leader.progressPercent || 0 })}`
                                                : t('public.leaderboard.skillSpotlight.beFirst')}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={
                                        embedded
                                            ? 'mt-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800'
                                            : 'mt-4 overflow-hidden rounded-full bg-white/70 dark:bg-slate-950/50'
                                    }
                                >
                                    <div
                                        className={
                                            embedded
                                                ? 'h-2 rounded-full bg-blue-500'
                                                : 'h-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500'
                                        }
                                        style={{ width: `${personalPercent}%` }}
                                    />
                                </div>
                                <div
                                    className={
                                        embedded
                                            ? 'mt-3 flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400'
                                            : 'mt-3 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300'
                                    }
                                >
                                    <span>
                                        {personal
                                            ? `${personalXp} XP · ${t('public.leaderboard.skills.lessonRatio', { completed: personal?.completedLessons || 0, total: personal?.totalLessons || 0 })}`
                                            : t(
                                                  'public.leaderboard.skillSpotlight.noPersonalStats'
                                              )}
                                    </span>
                                    {xpGap && xpGap > 0 ? (
                                        <span
                                            className={
                                                embedded
                                                    ? 'font-semibold text-blue-700 dark:text-blue-300'
                                                    : 'font-semibold text-cyan-700 dark:text-cyan-300'
                                            }
                                        >
                                            +{xpGap} XP
                                        </span>
                                    ) : null}
                                </div>
                                <p
                                    className={
                                        embedded
                                            ? 'mt-3 text-sm leading-6 text-gray-700 dark:text-gray-200'
                                            : 'mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200'
                                    }
                                >
                                    {nextHint}
                                </p>
                            </article>
                        );
                    })
                ) : (
                    <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300 sm:col-span-2">
                        {t('public.leaderboard.skillSpotlight.empty')}
                    </div>
                )}
            </div>
        </section>
    );
};

HeroMetricCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    helper: PropTypes.string.isRequired,
    embedded: PropTypes.bool,
};

HeroMetricCard.defaultProps = {
    embedded: false,
};

LeaderboardAvatar.propTypes = {
    src: PropTypes.string,
    name: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

LeaderboardAvatar.defaultProps = {
    src: null,
    name: '',
    size: 'md',
};

RankBadge.propTypes = {
    rank: PropTypes.number,
    label: PropTypes.string,
};

RankBadge.defaultProps = {
    rank: null,
    label: null,
};

LeaderboardHero.propTypes = {
    userName: PropTypes.string,
    snapshot: PropTypes.shape({
        rank: PropTypes.number,
        percentile: PropTypes.number,
        targetGap: PropTypes.number,
        nextTargetEntry: PropTypes.object,
    }).isRequired,
    xp: PropTypes.number,
    streakDays: PropTypes.number,
    levelLabel: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    embedded: PropTypes.bool,
};

LeaderboardHero.defaultProps = {
    userName: '',
    xp: 0,
    streakDays: 0,
    levelLabel: '',
    title: '',
    description: '',
    embedded: false,
};

LeaderboardListCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object),
    currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    footer: PropTypes.node,
    embedded: PropTypes.bool,
};

LeaderboardListCard.defaultProps = {
    description: '',
    items: [],
    currentUserId: null,
    footer: null,
    embedded: false,
};

NearYouRail.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    targetGap: PropTypes.number,
    nextTargetName: PropTypes.string,
    embedded: PropTypes.bool,
};

NearYouRail.defaultProps = {
    items: [],
    currentUserId: null,
    targetGap: null,
    nextTargetName: '',
    embedded: false,
};

MySkillProgressGrid.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    embedded: PropTypes.bool,
};

MySkillProgressGrid.defaultProps = {
    items: [],
    embedded: false,
};

AchievementCloud.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    title: PropTypes.string,
    subtitle: PropTypes.string,
    embedded: PropTypes.bool,
};

AchievementCloud.defaultProps = {
    items: [],
    title: '',
    subtitle: '',
    embedded: false,
};

PublicSpotlightPanel.propTypes = {
    studentOfWeek: PropTypes.object,
    highlights: PropTypes.arrayOf(PropTypes.string),
    metrics: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            helper: PropTypes.string,
        })
    ),
};

PublicSpotlightPanel.defaultProps = {
    studentOfWeek: null,
    highlights: [],
    metrics: [],
};

ChallengeRail.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    embedded: PropTypes.bool,
};

ChallengeRail.defaultProps = {
    items: [],
    embedded: false,
};

SkillSpotlightGrid.propTypes = {
    boards: PropTypes.arrayOf(
        PropTypes.shape({
            slug: PropTypes.string,
            label: PropTypes.string,
            items: PropTypes.arrayOf(PropTypes.object),
        })
    ),
    personalProgress: PropTypes.arrayOf(PropTypes.object),
    featuredSlug: PropTypes.string,
    embedded: PropTypes.bool,
};

SkillSpotlightGrid.defaultProps = {
    boards: [],
    personalProgress: [],
    featuredSlug: '',
    embedded: false,
};

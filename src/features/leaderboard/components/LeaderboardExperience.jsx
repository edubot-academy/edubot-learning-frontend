import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getDashboardPath } from '@shared/utils/navigation';
import {
    FiArrowRight,
    FiAward,
    FiBarChart2,
    FiTarget,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';

const accentSets = [
    'from-orange-500/12 via-amber-400/8 to-transparent border-orange-200/70 dark:border-orange-500/20',
    'from-cyan-500/12 via-sky-400/8 to-transparent border-cyan-200/70 dark:border-cyan-500/20',
    'from-emerald-500/12 via-lime-400/8 to-transparent border-emerald-200/70 dark:border-emerald-500/20',
    'from-fuchsia-500/12 via-rose-400/8 to-transparent border-fuchsia-200/70 dark:border-fuchsia-500/20',
];

const rarityLabels = {
    common: 'Негизги',
    rare: 'Сейрек',
    epic: 'Өзгөчө',
    legendary: 'Легенда',
};

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
        return <img src={src} alt={name} className={`${dimensions[size]} rounded-2xl object-cover`} />;
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
            <span>{rank ? `#${rank}` : 'Top'}</span>
            {label ? <span className="opacity-80">{label}</span> : null}
        </div>
    );
};

export const LeaderboardHero = ({
    userName,
    snapshot,
    xp = 0,
    streakDays = 0,
    levelLabel = 'Momentum',
    title = 'Сиздин оюн талааңыз',
    description,
    embedded = false,
}) => {
    const detailText =
        description ||
        (snapshot.rank
            ? `Сиз азыр рейтингде #${snapshot.rank}. Дагы ${snapshot.targetGap} XP алсаңыз, кийинки орунга жакындайсыз.`
            : `Дагы бир нече аракет менен лидер тактасына чыгууга болот. Азыркы запас: ${xp} XP.`);
    const nextActionTitle = snapshot.targetGap ? `${snapshot.targetGap} XP үчүн 1 сабак + 1 тест` : 'Серияны улап, жаңы белги ачыңыз';
    const nextActionHint = snapshot.targetGap
        ? 'Эң кыска жол: бир сабакты жапкандан кийин дароо тест тапшырыңыз.'
        : 'Бүгүн кирип окусаңыз, туруктуулук сигналы күчөйт.';
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
                        {levelLabel}
                    </div>
                    <div className="space-y-2">
                        <h1 className={`text-3xl font-semibold leading-tight sm:text-4xl ${embedded ? 'text-gray-900 dark:text-[#E8ECF3]' : ''}`}>{title}</h1>
                        <p className={bodyTextClassName}>
                            {userName ? `${userName}, ` : ''}
                            {detailText}
                        </p>
                    </div>
                    <div className={`flex flex-wrap gap-3 text-sm ${embedded ? '' : 'text-slate-100/90'}`}>
                        <span className={statPillClassName}>
                            <FiBarChart2 className="shrink-0" />
                            {snapshot.rank ? `Сиздин орун: #${snapshot.rank}` : 'Орунуңуз эсептелип жатат'}
                        </span>
                        <span className={statPillClassName}>
                            <FiTrendingUp className="shrink-0" />
                            {xp} XP
                        </span>
                        <span className={statPillClassName}>
                            <span className="text-base">🔥</span>
                            {streakDays} күн серия
                        </span>
                    </div>
                </div>

                <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                    <HeroMetricCard
                        label="Кийинки секирик"
                        value={snapshot.targetGap ? `${snapshot.targetGap} XP` : 'Даяр'}
                        helper={snapshot.nextTargetEntry ? `${snapshot.nextTargetEntry.fullName || 'Лидер'}га жакындоо` : 'Жаңы жеңиш алыңыз'}
                        embedded={embedded}
                    />
                    <HeroMetricCard
                        label="Көрүнүү"
                        value={snapshot.percentile ? `%${snapshot.percentile}` : 'Top'}
                        helper="Жумалык импульс"
                        embedded={embedded}
                    />
                    <div className={actionCardClassName}>
                        <p className={actionLabelClassName}>Эми эмне кылуу керек</p>
                        <p className={`mt-2 text-lg font-semibold leading-tight ${embedded ? 'text-gray-900 dark:text-[#E8ECF3]' : ''}`}>{nextActionTitle}</p>
                        <p className={actionHintClassName}>{nextActionHint}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HeroMetricCard = ({ label, value, helper, embedded = false }) => (
    <div className={embedded ? 'rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1A1A1A]' : 'rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur'}>
        <p className={embedded ? 'text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400' : 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-200'}>{label}</p>
        <p className={embedded ? 'mt-2 text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'mt-2 text-2xl font-semibold text-white'}>{value}</p>
        <p className={embedded ? 'mt-1 text-sm text-gray-600 dark:text-gray-300' : 'mt-1 text-sm text-slate-200'}>{helper}</p>
    </div>
);

export const LeaderboardListCard = ({ title, description, items, currentUserId = null, footer = null, embedded = false }) => (
    <section className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6' : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'}>
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h3 className={embedded ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'text-lg font-semibold text-slate-900 dark:text-white'}>{title}</h3>
                {description ? <p className={embedded ? 'mt-1 text-sm text-gray-500 dark:text-gray-400' : 'mt-1 text-sm text-slate-500 dark:text-slate-300'}>{description}</p> : null}
            </div>
            <RankBadge rank={items?.length ? 1 : null} label={items?.length ? `${items.length} оюнчу` : 'Бош'} />
        </div>
        <div className="mt-5 space-y-3">
            {items?.length ? (
                items.map((item, index) => {
                    const isCurrentUser = currentUserId && Number(item?.studentId) === Number(currentUserId);
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
                            <LeaderboardAvatar src={item?.avatarUrl} name={item?.fullName || item?.name} />
                            <div className="min-w-0 flex-1">
                                <p className={embedded ? 'truncate font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'truncate font-semibold text-slate-900 dark:text-white'}>
                                    {item?.fullName || item?.name || 'Студент'}
                                    {isCurrentUser ? ' · Сиз' : ''}
                                </p>
                                <p className={embedded ? 'mt-1 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400' : 'mt-1 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-300'}>
                                    <span>{item?.xp || 0} XP</span>
                                    {Number(item?.progressPercent) > 0 ? <span>{item.progressPercent}% прогресс</span> : null}
                                    {Number(item?.streakDays) > 0 ? <span>{item.streakDays} күн серия</span> : null}
                                </p>
                            </div>
                            {Number(item?.quizzesPassed) > 0 ? (
                                <span className={embedded ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-900' : 'rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900'}>
                                    {item.quizzesPassed} тест
                                </span>
                            ) : null}
                        </div>
                    );
                })
            ) : (
                <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                    Азырынча маалымат жетишсиз.
                </div>
            )}
        </div>
        {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
);

export const NearYouRail = ({ items = [], currentUserId = null, targetGap = null, nextTargetName = '', embedded = false }) => {
    const normalizedItems = Array.isArray(items) ? items : [];
    const currentUser = normalizedItems.find((item) => currentUserId && Number(item?.studentId) === Number(currentUserId));
    const currentXp = Number(currentUser?.xp || 0);

    return (
        <section className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6' : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className={embedded ? 'text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300' : 'text-xs font-semibold uppercase tracking-[0.18em] text-orange-500'}>Жакынкы орундар</p>
                    <h3 className={embedded ? 'mt-2 text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'mt-2 text-lg font-semibold text-slate-900 dark:text-white'}>Сизге эң жакын атаандаштар</h3>
                    <p className={embedded ? 'mt-1 text-sm text-gray-500 dark:text-gray-400' : 'mt-1 text-sm text-slate-500 dark:text-slate-300'}>Кийинки орунга чыгуу үчүн кимди өтүү керек экенин ушул жерден көрөсүз.</p>
                    <p className={embedded ? 'mt-3 text-sm font-medium text-gray-700 dark:text-gray-200' : 'mt-3 text-sm font-medium text-slate-700 dark:text-slate-200'}>
                        {targetGap && nextTargetName ? `${nextTargetName}ди өтүү үчүн дагы ${targetGap} XP керек.` : 'Жакынкы орундар пайда болгондо айырма ушул жерден көрүнөт.'}
                    </p>
                </div>
                <div className={embedded ? 'rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-right text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200' : 'rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-right text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200'}>
                    {targetGap ? `${targetGap} XP калды` : 'Орун эсептелүүдө'}
                </div>
            </div>
            <div className="mt-5 space-y-3">
                {normalizedItems.length ? (
                    normalizedItems.map((item, index) => {
                        const isCurrentUser = currentUserId && Number(item?.studentId) === Number(currentUserId);
                        const xpGap = !isCurrentUser && currentXp ? Math.max(0, Number(item?.xp || 0) - currentXp + 1) : null;
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
                                <LeaderboardAvatar src={item?.avatarUrl} name={item?.fullName || item?.name} size="sm" />
                                <div className="min-w-0 flex-1">
                                    <p className={embedded ? 'truncate font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'truncate font-semibold text-slate-900 dark:text-white'}>
                                        {item?.fullName || item?.name || 'Студент'}
                                        {isCurrentUser ? ' · Сиз' : ''}
                                    </p>
                                    <p className={embedded ? 'mt-1 text-sm text-gray-500 dark:text-gray-400' : 'mt-1 text-sm text-slate-500 dark:text-slate-300'}>
                                        {item?.xp || 0} XP
                                        {Number(item?.streakDays) > 0 ? ` · ${item?.streakDays} күн серия` : ''}
                                    </p>
                                </div>
                                {isCurrentUser ? (
                                    <span className={embedded ? 'rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white' : 'rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white'}>
                                        Сиздин чекит
                                    </span>
                                ) : xpGap ? (
                                    <span className={embedded ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-900' : 'rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900'}>
                                        +{xpGap} XP
                                    </span>
                                ) : null}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                        Сизге жакын орундар азырынча табылган жок. Алгач рейтингге кирип алыңыз.
                    </div>
                )}
            </div>
        </section>
    );
};

export const MySkillProgressGrid = ({ items = [], embedded = false }) => (
    <section className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6' : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'}>
        <div className="flex items-center gap-3">
            <div className={embedded ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500' : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200/60 dark:shadow-none'}>
                <FiTarget />
            </div>
            <div>
                <h3 className={embedded ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'text-lg font-semibold text-slate-900 dark:text-white'}>Менин көндүм прогрессим</h3>
                <p className={embedded ? 'text-sm text-gray-500 dark:text-gray-400' : 'text-sm text-slate-500 dark:text-slate-300'}>Бул блок жеке өздөштүрүү прогрессин көрсөтөт. Рейтинг болсо төмөндө өзүнчө турат.</p>
            </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {items.length ? (
                items.map((item) => (
                    <article key={item.id || item.slug || item.name} className={embedded ? 'rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1A1A1A]' : 'rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60'}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className={embedded ? 'text-base font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'text-base font-semibold text-slate-900 dark:text-white'}>{item.name}</p>
                                <p className={embedded ? 'mt-1 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400' : 'mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400'}>{item.progressPercent || 0}% өздөштүрүү</p>
                            </div>
                            <span className={embedded ? 'rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200' : 'rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-950/70 dark:text-slate-200'}>
                                {item.xp || 0} XP
                            </span>
                        </div>
                        <div className={embedded ? 'mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800' : 'mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'}>
                            <div
                                className={embedded ? 'h-full rounded-full bg-blue-500' : 'h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500'}
                                style={{ width: `${Math.min(100, Math.max(0, Number(item.progressPercent || 0)))}%` }}
                            />
                        </div>
                        <div className={embedded ? 'mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400' : 'mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300'}>
                            <span>{item.completedLessons || 0}/{item.totalLessons || 0} сабак</span>
                            {item.lastActivityAt ? <span>Акыркы активдүүлүк бар</span> : <span>Жаңы баштоо</span>}
                        </div>
                    </article>
                ))
            ) : (
                <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300 sm:col-span-2 xl:col-span-3">
                    Азырынча жеке көндүм прогресси табылган жок. Биринчи сабактарды аяктагандан кийин бул жер толот.
                </div>
            )}
        </div>
    </section>
);

export const AchievementCloud = ({ items = [], title = 'Жетишкендиктер', subtitle = 'Көрүнүп турган сыйлыктар', embedded = false }) => (
    <section className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6' : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'}>
        <div className="flex items-center gap-3">
            <div className={embedded ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500' : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200/60 dark:shadow-none'}>
                <FiAward />
            </div>
            <div>
                <h3 className={embedded ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'text-lg font-semibold text-slate-900 dark:text-white'}>{title}</h3>
                <p className={embedded ? 'text-sm text-gray-500 dark:text-gray-400' : 'text-sm text-slate-500 dark:text-slate-300'}>{subtitle}</p>
            </div>
        </div>
        <div className={embedded ? 'mt-5 grid grid-cols-1 gap-3' : 'mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
            {(items.length ? items : [{ title: 'Алгачкы кадам' }, { title: 'Ылдам башталыш' }, { title: 'Тест жаркылыгы' }]).map((item, index) => {
                const rarityKey = String(item.rarity || (index === 0 ? 'epic' : index < 3 ? 'rare' : 'common')).toLowerCase();
                const rarityLabel = rarityLabels[rarityKey] || rarityKey.toUpperCase();
                const achievementTitle = item.title || item.name;
                const achievementDescription = item.description || 'Туруктуу өсүшүңүздү жана активдүүлүгүңүздү көрсөткөн өзгөчө учур.';
                return (
                    <article
                        key={item.id || item.title || index}
                        className={embedded ? 'flex w-full min-w-0 flex-col rounded-[24px] border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-[#1A1A1A]' : `flex h-full min-h-[320px] flex-col rounded-[24px] border bg-gradient-to-br ${accentSets[index % accentSets.length]} p-5`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <span className={embedded ? 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white' : 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-slate-900 shadow-sm dark:bg-slate-900/70 dark:text-white'}>
                                <FiAward />
                            </span>
                            <span className={embedded ? 'rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200' : 'rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-950/70 dark:text-slate-200'}>
                                {rarityLabel}
                            </span>
                        </div>
                        <div className="mt-5 min-w-0 space-y-2">
                            <p className={embedded ? 'break-words text-xl font-semibold leading-tight text-gray-900 dark:text-[#E8ECF3]' : 'line-clamp-2 text-xl font-semibold leading-tight text-slate-900 dark:text-white'}>{achievementTitle}</p>
                            <p className={embedded ? 'break-words text-sm leading-6 text-gray-500 dark:text-gray-400' : 'line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300'}>
                                {achievementDescription}
                            </p>
                        </div>
                        <div className="mt-auto pt-5">
                            <div className={embedded ? 'mb-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-800' : 'mb-4 space-y-2 border-t border-white/70 pt-4 dark:border-slate-800/70'}>
                                <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${item.unlocked === false ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-300'}`}>
                                    {item.unlocked === false ? 'Даярдалып жатат' : 'Ачылды'}
                                </p>
                                <p className={embedded ? 'text-xs leading-5 text-gray-500 dark:text-gray-400' : 'text-xs leading-5 text-slate-500 dark:text-slate-400'}>
                                    Бул жетишкендик окуудагы прогрессиңизди көрсөтөт.
                                </p>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    </section>
);

const inferChallengeAction = (item = {}) => {
    if (item.actionPath || item.actionLabel || item.actionKind) {
        return {
            to: item.actionPath || getDashboardPath('student', 'my-courses'),
            label: item.actionLabel || 'Ачуу',
            kind: item.actionKind || 'open',
        };
    }

    const haystack = `${item.title || ''} ${item.detail || ''} ${item.value || ''}`.toLowerCase();

    if (haystack.includes('тест')) {
        return { to: getDashboardPath('student', 'progress'), label: 'Прогрессти ачуу', kind: 'progress' };
    }
    if (haystack.includes('сабак') || haystack.includes('курс')) {
        return { to: getDashboardPath('student', 'my-courses'), label: 'Курстарга өтүү', kind: 'course' };
    }
    if (haystack.includes('серия') || haystack.includes('эртең')) {
        return { to: getDashboardPath('student', 'my-courses'), label: 'Окууну улантуу', kind: 'continue' };
    }

    return { to: getDashboardPath('student', 'leaderboard'), label: 'Рейтингге кайтуу', kind: 'leaderboard' };
};

const challengeActionMeta = (kind = 'open') => {
    switch (kind) {
        case 'skill':
            return {
                icon: FiBarChart2,
                badge: 'Көндүм',
                badgeClassName: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200',
            };
        case 'continue':
            return {
                icon: FiZap,
                badge: 'Серия',
                badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
            };
        case 'progress':
            return {
                icon: FiTarget,
                badge: 'Прогресс',
                badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
            };
        case 'course':
            return {
                icon: FiTrendingUp,
                badge: 'Курс',
                badgeClassName: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200',
            };
        case 'leaderboard':
        default:
            return {
                icon: FiArrowRight,
                badge: 'Рейтинг',
                badgeClassName: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
            };
    }
};

export const PublicSpotlightPanel = ({ studentOfWeek = null, highlights = [], metrics = [] }) => {
    const benefits = [
        {
            icon: FiBarChart2,
            title: 'Өсүштү дароо көрөсүз',
            detail: 'Ар бир сабак, тест жана активдүүлүк рейтингиңизге таасир этет.',
            accent: 'border-cyan-200 bg-cyan-50/80 dark:border-cyan-500/20 dark:bg-cyan-500/10',
        },
        {
            icon: FiZap,
            title: 'Темпти жоготпойсуз',
            detail: 'Серия, упай жана жакын атаандаштар окууну улантууга түрткү берет.',
            accent: 'border-orange-200 bg-orange-50/80 dark:border-orange-500/20 dark:bg-orange-500/10',
        },
        {
            icon: FiAward,
            title: 'Жеңиштер көрүнүп турат',
            detail: 'Жетишкендиктер окуудагы прогрессти так жана мотивациялуу көрсөтөт.',
            accent: 'border-fuchsia-200 bg-fuchsia-50/80 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10',
        },
    ];

    return (
        <section className="w-full max-w-full overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_50%,_#eff6ff_100%)] p-4 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,_#1e293b_0%,_#334155_50%,_#1e3a8a_100%)] sm:p-6">
            <div className="flex min-w-0 flex-col items-start justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">Аптанын өзөгү</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Рейтинг жөн эле тизме эмес</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Бул жерде туруктуу окуган, тесттерди жапкан жана бат өсүп жаткан студенттер көрүнөт. Сиз дагы бул тизмеге чыга аласыз.</p>
                </div>
                <div className="grid min-w-0 w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
                    <Link to="/courses" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900 sm:w-auto">Курстарды ачуу</Link>
                    <Link to="/register" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:w-auto">Азыр баштоо</Link>
                </div>
            </div>
            <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="min-w-0 space-y-4">
                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                        {(metrics.length
                            ? metrics
                            : [
                                { label: 'Бул жума', value: '10+', helper: 'Жигердүү студент' },
                                { label: 'Жеңиштер', value: '3', helper: 'Ачылган учурлар' },
                                { label: 'Өсүш', value: '120 XP', helper: 'Аптанын импульсу' },
                            ]
                        ).slice(0, 3).map((metric, index) => (
                            <div key={`${metric.label}-${index}`} className="min-w-0 w-full max-w-full rounded-[20px] border border-slate-200 bg-white/85 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                                <p className="break-words text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{metric.label}</p>
                                <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-900 dark:text-white">{metric.value}</p>
                                <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-300">{metric.helper}</p>
                            </div>
                        ))}
                    </div>
                    <div className="min-w-0 rounded-[24px] border border-orange-200 bg-white/80 p-5 dark:border-orange-500/20 dark:bg-slate-900/60">
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-200">Аптанын студенти</p>
                                <div className="mt-4 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                                    <LeaderboardAvatar src={studentOfWeek?.avatarUrl} name={studentOfWeek?.fullName} size="lg" />
                                    <div className="min-w-0 max-w-full">
                                        <p className="break-words text-xl font-semibold leading-tight text-slate-900 dark:text-white">{studentOfWeek?.fullName || 'Жаңы лидер күтүлүүдө'}</p>
                                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                                            {studentOfWeek ? `${studentOfWeek.xp || 0} XP · ${studentOfWeek.lessonsCompleted || 0} сабак жабылды` : 'Биринчи чоң секирикти жасап, бул жерге чыгууга аракет кылыңыз.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <span className="self-start rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">Өсүүдө</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        {(highlights.length ? highlights : [
                            'Бир жума ичинде туруктуу окуу',
                            'Тесттерден жогорку натыйжа',
                            'Өсүштү көрсөткөн жетишкендик',
                        ]).slice(0, 3).map((entry, index) => (
                            <div key={`${entry}-${index}`} className="rounded-[20px] border border-slate-200 bg-white/80 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">0{index + 1}</span>
                                <p className="mt-2 font-medium leading-6">{entry}</p>
                            </div>
                        ))}
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-white/85 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Эмне үчүн кошулуу керек?</p>
                                <p className="text-xs text-slate-500 dark:text-slate-300">Окуу кызыктуураак, ал эми өсүш айкыныраак болот.</p>
                            </div>
                            <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">3 артыкчылык</span>
                        </div>
                        <div className="mt-4 grid gap-3">
                            {benefits.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className={`rounded-[20px] border p-4 ${item.accent}`}>
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-slate-900 shadow-sm dark:bg-slate-950/70 dark:text-white">
                                                <Icon className="text-lg" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
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

export const ChallengeRail = ({ items = [], embedded = false }) => (
    <section className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6' : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'}>
        <div className="flex items-center gap-3">
            <div className={embedded ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500' : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'}>
                <FiTarget />
            </div>
            <div>
                <h3 className={embedded ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'text-lg font-semibold text-slate-900 dark:text-white'}>Жакынкы максаттар</h3>
                <p className={embedded ? 'text-sm text-gray-500 dark:text-gray-400' : 'text-sm text-slate-500 dark:text-slate-300'}>Эң аз аракет менен эң көп өсүш берген кадамдар</p>
            </div>
        </div>
        <div className="mt-5 space-y-3">
            {(items.length
                ? items
                : [
                    { title: '1 сабак аяктоо', detail: 'Минималдуу +20 XP' },
                    { title: '1 тестти ийгиликтүү бүтүрүү', detail: 'Рейтингге эң тез таасир' },
                    { title: 'Серияны үзбөө', detail: 'Эртең дагы кирип окуу' },
                ]
            ).map((item, index) => {
                const progress = Number(item.progress || 0);
                const target = Number(item.target || 0);
                const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : null;
                const highlighted = index === 0;
                const action = inferChallengeAction(item);
                const actionMeta = challengeActionMeta(action.kind);
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
                                {highlighted ? <p className={embedded ? 'text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300' : 'text-xs font-semibold uppercase tracking-[0.18em] text-orange-500'}>Эң пайдалуу кадам</p> : null}
                                <p className={`font-semibold ${highlighted ? 'mt-1 text-lg' : ''} ${embedded ? 'text-gray-900 dark:text-[#E8ECF3]' : 'text-slate-900 dark:text-white'}`}>{item.title}</p>
                                <p className={embedded ? 'mt-1 text-sm text-gray-500 dark:text-gray-400' : 'mt-1 text-sm text-slate-500 dark:text-slate-300'}>{item.detail || item.value}</p>
                            </div>
                            <FiArrowRight className={`mt-1 shrink-0 ${highlighted ? (embedded ? 'text-blue-600 dark:text-blue-300' : 'text-orange-500') : (embedded ? 'text-gray-400 dark:text-gray-500' : 'text-slate-400')}`} />
                        </div>
                        {target > 0 ? (
                            <div className="mt-4 space-y-2">
                                <div className={embedded ? 'flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400' : 'flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400'}>
                                    <span>{progress}/{target}</span>
                                    <span>{percent}%</span>
                                </div>
                                <div className={embedded ? 'h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800' : 'h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'}>
                                    <div
                                        className={embedded ? 'h-full rounded-full bg-blue-500' : 'h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300'}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {item.reward ? (
                                <div className={embedded ? 'inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200' : 'inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200'}>
                                    Сыйлык: {item.reward}
                                </div>
                            ) : null}
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${actionMeta.badgeClassName}`}>
                                <ActionIcon className="shrink-0" />
                                {actionMeta.badge}
                            </span>
                            <span className={embedded ? 'inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300' : 'inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300'}>
                                Азыр жасаса болот
                            </span>
                        </div>
                        <div className="mt-4">
                            <Link
                                to={action.to}
                                className={embedded ? 'inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#1A1A1A] dark:text-gray-100 dark:hover:bg-gray-900' : 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:bg-slate-900'}
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

const normalizeSkillKey = (value = '') =>
    String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9а-яөүңё]+/gi, '');

export const SkillSpotlightGrid = ({ boards = [], personalProgress = [], featuredSlug = '', embedded = false }) => {
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
        <section className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:p-6' : 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6'}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className={embedded ? 'text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'text-lg font-semibold text-slate-900 dark:text-white'}>Көндүм фокусу</h3>
                    <p className={embedded ? 'text-sm text-gray-500 dark:text-gray-400' : 'text-sm text-slate-500 dark:text-slate-300'}>Ар бир багытта лидер ким жана сизге кийинки өсүү чекити кайда экенин көрсөтөт.</p>
                </div>
                <span className={embedded ? 'rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200' : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'}>
                    {cards.length} багыт
                </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {cards.length ? (
                    cards.map((board, index) => {
                        const leader = board.items?.[0];
                        const personal =
                            progressLookup.get(normalizeSkillKey(board.slug || board.label)) ||
                            progressLookup.get(normalizeSkillKey(board.label));
                        const isFeatured = featuredSlug && String(board.slug || '').toLowerCase() === String(featuredSlug).toLowerCase();
                        const personalPercent = Math.max(0, Math.min(100, Number(personal?.progressPercent || 0)));
                        const personalXp = Number(personal?.xp || 0);
                        const leaderXp = Number(leader?.xp || 0);
                        const xpGap = leader && personal ? Math.max(0, leaderXp - personalXp + 1) : null;
                        const remainingProgress = Math.max(0, 100 - personalPercent);
                        const nextHint = personal
                            ? personalPercent >= 100
                                ? 'Бул багытта негиз бекем. Эми рейтингде көтөрүлүүгө басым жасаңыз.'
                                : xpGap && xpGap > 0
                                    ? `Лидерге жакындаш үчүн дагы ${xpGap} XP топтоңуз.`
                                    : remainingProgress > 0
                                        ? `Дагы ${remainingProgress}% өздөштүрсөңүз, бул багыт кыйла күчөйт.`
                                        : 'Бул багытта кийинки чоң кадамга даярсыз.'
                            : 'Бул багытта биринчи сабакты жаап, жеке прогрессти ачып алыңыз.';

                        return (
                            <article
                                key={board.slug || board.label || index}
                                className={embedded ? 'rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1A1A1A]' : `rounded-[22px] border bg-gradient-to-br ${accentSets[index % accentSets.length]} p-4`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={embedded ? 'text-base font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'text-base font-semibold text-slate-900 dark:text-white'}>{board.label}</p>
                                            {isFeatured ? <span className={embedded ? 'rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-gray-100 dark:text-gray-900' : 'rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-900'}>Тандалган багыт</span> : null}
                                        </div>
                                        <p className={embedded ? 'mt-1 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400' : 'mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400'}>
                                            {personal ? `Сиз: ${personalPercent}%` : 'Жеке прогресс күтүлүүдө'}
                                        </p>
                                    </div>
                                    <span className={embedded ? 'rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200' : 'rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-950/70 dark:text-slate-200'}>
                                        #{leader ? 1 : '-'}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-3">
                                    <LeaderboardAvatar src={leader?.avatarUrl} name={leader?.fullName} size="sm" />
                                    <div className="min-w-0">
                                        <p className={embedded ? 'truncate font-semibold text-gray-900 dark:text-[#E8ECF3]' : 'truncate font-semibold text-slate-900 dark:text-white'}>
                                            {leader?.fullName || 'Лидер табыла элек'}
                                        </p>
                                        <p className={embedded ? 'text-sm text-gray-500 dark:text-gray-400' : 'text-sm text-slate-600 dark:text-slate-300'}>
                                            {leader ? `${leader.xp || 0} XP · ${leader.progressPercent || 0}% прогресс` : 'Бул багытта биринчи болуп чыгыңыз'}
                                        </p>
                                    </div>
                                </div>
                                <div className={embedded ? 'mt-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800' : 'mt-4 overflow-hidden rounded-full bg-white/70 dark:bg-slate-950/50'}>
                                    <div
                                        className={embedded ? 'h-2 rounded-full bg-blue-500' : 'h-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500'}
                                        style={{ width: `${personalPercent}%` }}
                                    />
                                </div>
                                <div className={embedded ? 'mt-3 flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400' : 'mt-3 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300'}>
                                    <span>{personal ? `${personalXp} XP · ${personal?.completedLessons || 0}/${personal?.totalLessons || 0} сабак` : 'Жеке статистика чыга элек'}</span>
                                    {xpGap && xpGap > 0 ? <span className={embedded ? 'font-semibold text-blue-700 dark:text-blue-300' : 'font-semibold text-cyan-700 dark:text-cyan-300'}>+{xpGap} XP</span> : null}
                                </div>
                                <p className={embedded ? 'mt-3 text-sm leading-6 text-gray-700 dark:text-gray-200' : 'mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200'}>{nextHint}</p>
                            </article>
                        );
                    })
                ) : (
                    <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300 sm:col-span-2">
                        Көндүм боюнча маалыматтар жүктөлө элек.
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
    levelLabel: 'Momentum',
    title: 'Сиздин оюн талааңыз',
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
    title: 'Жетишкендиктер',
    subtitle: 'Көрүнүктүү сыйлыктар',
    embedded: false,
};

PublicSpotlightPanel.propTypes = {
    studentOfWeek: PropTypes.object,
    highlights: PropTypes.arrayOf(PropTypes.string),
    metrics: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        helper: PropTypes.string,
    })),
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
    boards: PropTypes.arrayOf(PropTypes.shape({
        slug: PropTypes.string,
        label: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.object),
    })),
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

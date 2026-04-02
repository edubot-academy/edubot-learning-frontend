import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import { SmoothTabTransition } from '@components/ui';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    DashboardWorkspaceHero,
} from '@components/ui/dashboard';
import {
    fetchFastProgressLeaderboard,
    fetchLeaderboardAchievements,
    fetchLeaderboardChallenges,
    fetchMyLeaderboardSummary,
    fetchMySkillProgress,
    fetchNearMeLeaderboard,
    fetchSkillLeaderboard,
    fetchSkills,
    fetchStudentOfWeek,
    fetchWeeklyLeaderboard,
} from '@services/api';
import { AuthContext } from '../../../context/AuthContext';
import {
    AchievementCloud,
    buildLeaderboardSnapshot,
    ChallengeRail,
    LeaderboardListCard,
    MySkillProgressGrid,
    NearYouRail,
    PublicSpotlightPanel,
    SkillSpotlightGrid,
} from './LeaderboardExperience';

const tabs = [
    { id: 'overview', label: 'Кыскача' },
    { id: 'weekly', label: 'Апталык рейтинг' },
];

const publicTabs = [
    { id: 'overview', label: 'Кыскача' },
    { id: 'weekly', label: 'Апталык рейтинг' },
];

const trackOptions = [
    { value: 'all', label: 'Бардыгы', helper: 'Жалпы рейтинг' },
    { value: 'video', label: 'Видео курстар', helper: 'Өз алдынча окуу' },
    { value: 'live', label: 'Түз эфир жана офлайн', helper: 'Сессиялык окуу' },
];

const LeaderboardHub = ({ embedded = false, initialTrack = 'all', lockTrack = false, publicMode = false }) => {
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [track, setTrack] = useState(initialTrack);
    const [weekly, setWeekly] = useState({ items: [], total: 0, page: 1, limit: 10 });
    const [fast, setFast] = useState({ items: [], total: 0, page: 1, limit: 10 });
    const [studentOfWeek, setStudentOfWeek] = useState(null);
    const [mySummary, setMySummary] = useState(null);
    const [nearMe, setNearMe] = useState(null);
    const [backendAchievements, setBackendAchievements] = useState(null);
    const [backendChallenges, setBackendChallenges] = useState(null);
    const [mySkillProgress, setMySkillProgress] = useState([]);
    const [skills, setSkills] = useState({});
    const [skillBoards, setSkillBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skillBoardsLoading, setSkillBoardsLoading] = useState(true);

    const skillQuery = searchParams.get('skill') || '';
    const normalizedSkillQuery = useMemo(() => String(skillQuery || '').trim().toLowerCase(), [skillQuery]);

    const trackMeta = useMemo(
        () => trackOptions.find((option) => option.value === track) || trackOptions[0],
        [track]
    );
    const visibleTabs = publicMode ? publicTabs : tabs;
    const canLoadPersonalizedData = Boolean(user) && !publicMode;
    const shouldLoadSkillData = !publicMode;

    useEffect(() => {
        if (!normalizedSkillQuery || publicMode) return;
        setActiveTab('skills');
    }, [normalizedSkillQuery, publicMode]);

    const loadSkillLeaderboards = useCallback(async (boards) => {
        setSkillBoardsLoading(true);
        try {
            const entries = await Promise.all(
                boards.map(async (board) => {
                    const data = await fetchSkillLeaderboard(board.slug, { page: 1, limit: 5 });
                    return [board.slug, Array.isArray(data?.items) ? data.items : data || []];
                })
            );
            setSkills(Object.fromEntries(entries));
        } finally {
            setSkillBoardsLoading(false);
        }
    }, []);

    const refreshSkillCatalog = useCallback(async () => {
        try {
            const catalog = await fetchSkills();
            const mapped = Array.isArray(catalog)
                ? catalog
                    .filter((skill) => skill.slug || skill.id)
                    .map((skill) => ({
                        slug: skill.slug || String(skill.id),
                        label: skill.name || skill.slug || `Көндүм ${skill.id}`,
                    }))
                : [];
            setSkillBoards(mapped);
        } catch (error) {
            console.warn('Skills catalog refresh failed', error);
            setSkillBoards([]);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const [weeklyRes, fastRes, sowRes, mySummaryRes, nearMeRes, achievementsRes, challengesRes, mySkillProgressRes] = await Promise.all([
                    fetchWeeklyLeaderboard({ page: 1, limit: 10, track }),
                    publicMode ? Promise.resolve({ items: [], total: 0, page: 1, limit: 10 }) : fetchFastProgressLeaderboard({ page: 1, limit: 10 }),
                    fetchStudentOfWeek({ track }),
                    canLoadPersonalizedData ? fetchMyLeaderboardSummary({ window: 'weekly', track }) : Promise.resolve(null),
                    canLoadPersonalizedData ? fetchNearMeLeaderboard({ limit: 5, window: 'weekly', track }) : Promise.resolve(null),
                    canLoadPersonalizedData ? fetchLeaderboardAchievements({ window: 'weekly', track }) : Promise.resolve({ items: [] }),
                    canLoadPersonalizedData ? fetchLeaderboardChallenges({ window: 'weekly', track }) : Promise.resolve({ items: [] }),
                    canLoadPersonalizedData ? fetchMySkillProgress().catch(() => []) : Promise.resolve([]),
                ]);
                if (cancelled) return;
                setWeekly(weeklyRes || { items: [], total: 0, page: 1, limit: 10 });
                setFast(fastRes || { items: [], total: 0, page: 1, limit: 10 });
                setStudentOfWeek(sowRes || null);
                setMySummary(mySummaryRes || null);
                setNearMe(nearMeRes || null);
                setBackendAchievements(achievementsRes || null);
                setBackendChallenges(challengesRes || null);
                setMySkillProgress(Array.isArray(mySkillProgressRes) ? mySkillProgressRes : []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        if (shouldLoadSkillData) {
            refreshSkillCatalog();
        } else {
            setSkillBoards([]);
            setSkills({});
            setSkillBoardsLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [canLoadPersonalizedData, publicMode, refreshSkillCatalog, shouldLoadSkillData, track]);

    useEffect(() => {
        if (!shouldLoadSkillData) return;
        loadSkillLeaderboards(skillBoards);
    }, [skillBoards, loadSkillLeaderboards, shouldLoadSkillData]);

    const skillBoardCards = useMemo(() => {
        const cards = skillBoards.map((board) => ({ ...board, items: skills[board.slug] || [] }));
        if (!normalizedSkillQuery) return cards;

        const matchIndex = cards.findIndex(
            (board) => String(board.slug || '').toLowerCase() === normalizedSkillQuery
        );
        if (matchIndex <= 0) return cards;

        const [selected] = cards.splice(matchIndex, 1);
        return [selected, ...cards];
    }, [skillBoards, skills, normalizedSkillQuery]);

    const currentUserWeeklyEntry = useMemo(() => {
        const items = Array.isArray(weekly?.items) ? weekly.items : [];
        return items.find((item) => Number(item.studentId) === Number(user?.id)) || null;
    }, [weekly, user]);

    const snapshot = useMemo(() => {
        const fallback = buildLeaderboardSnapshot({
            items: weekly?.items || [],
            user,
            xp: currentUserWeeklyEntry?.xp || 0,
            streakDays: currentUserWeeklyEntry?.streakDays || 0,
            label: `${trackMeta.label} такта`,
        });

        if (!mySummary) {
            return {
                ...fallback,
                nearYou: Array.isArray(nearMe?.items) ? nearMe.items : fallback.nearYou,
            };
        }

        return {
            ...fallback,
            rank: mySummary.rank ?? fallback.rank,
            percentile: mySummary.percentile ?? fallback.percentile,
            targetGap: mySummary?.nextTarget?.xpGap ?? fallback.targetGap,
            nextTargetEntry: mySummary?.nextTarget
                ? {
                    fullName: mySummary.nextTarget.label || `#${mySummary.nextTarget.rank || ''}`,
                    xp: mySummary.nextTarget.xp || null,
                }
                : fallback.nextTargetEntry,
            nearYou: Array.isArray(nearMe?.items) ? nearMe.items : fallback.nearYou,
            momentum: [
                mySummary.rankDelta
                    ? `${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta} орун өзгөрүү`
                    : fallback.momentum?.[0],
                mySummary.strongestSkill?.name ? `Күчтүү көндүм: ${mySummary.strongestSkill.name}` : fallback.momentum?.[1],
                fallback.momentum?.[2],
            ].filter(Boolean),
        };
    }, [weekly, user, currentUserWeeklyEntry, mySummary, nearMe, trackMeta]);

    const currentXp = mySummary?.windowXp ?? mySummary?.xp ?? currentUserWeeklyEntry?.xp ?? 0;
    const currentStreak = mySummary?.streakDays ?? currentUserWeeklyEntry?.streakDays ?? 0;
    const weeklyItems = Array.isArray(weekly?.items) ? weekly.items : [];
    const rankValue = snapshot.rank ? `#${snapshot.rank}` : 'Азырынча жок';
    const targetGapValue = snapshot.targetGap ? `${snapshot.targetGap} XP` : 'Жакында';

    const fallbackAchievementItems = useMemo(() => {
        const winners = weeklyItems.slice(0, 3);
        const items = [];

        if (studentOfWeek?.fullName) {
            items.push({
                id: 'sow',
                title: 'Аптанын студенти',
                description: `${studentOfWeek.fullName} бул аптада ${studentOfWeek.xp || 0} XP менен алдыга чыкты.`,
                rarity: 'epic',
            });
        }

        winners.forEach((winner, index) => {
            items.push({
                id: `winner-${winner.studentId || index}`,
                title: `${index + 1}-орундагы жеңүүчү`,
                description: `${winner.fullName || 'Студент'} жумалык таблицада күчтүү позицияда.`,
                rarity: index === 0 ? 'epic' : 'rare',
            });
        });

        if (snapshot.rank) {
            items.unshift({
                id: 'me',
                title: `Сиздин орун: #${snapshot.rank}`,
                description: snapshot.targetGap
                    ? `Дагы ${snapshot.targetGap} XP алсаңыз, кийинки орунга чыгууга болот.`
                    : 'Тактадагы ордуңуз бекемделип жатат.',
                rarity: 'rare',
            });
        }

        return items;
    }, [weeklyItems, studentOfWeek, snapshot]);

    const challengeItems = useMemo(() => {
        const items = Array.isArray(backendChallenges?.items) ? backendChallenges.items : [];
        return items.map((item) => ({
            ...item,
            detail: item.detail || item.value || '',
        }));
    }, [backendChallenges]);

    const achievementShareMeta = useMemo(() => ({
        displayName: user?.fullName || user?.name || 'EduBot студенти',
        rank: snapshot.rank || null,
        xp: currentXp || null,
        streakDays: currentStreak || null,
        trackLabel: trackMeta.label,
    }), [user, snapshot.rank, currentXp, currentStreak, trackMeta.label]);

    const achievementItems = useMemo(() => {
        const items = Array.isArray(backendAchievements?.items) ? backendAchievements.items : [];
        const normalize = (item) => ({
            ...item,
            title: item.title || item.name,
            description: item.description || 'Бул жетишкендик сиздин өсүшүңүздү жана активдүүлүгүңүздү көрсөтөт.',
            shareMeta: {
                ...achievementShareMeta,
                ...(item.shareMeta || {}),
            },
        });

        if (!items.length) return fallbackAchievementItems.map(normalize);

        return items.map(normalize);
    }, [backendAchievements, fallbackAchievementItems, achievementShareMeta]);

    const publicHighlights = useMemo(() => {
        const leaders = weeklyItems.slice(0, 3);
        const leaderNames = leaders.map((item) => item?.fullName).filter(Boolean);
        return [
            leaderNames.length ? `${leaderNames.join(', ')} бул жумада лидер болуп турат.` : null,
            studentOfWeek?.fullName ? `${studentOfWeek.fullName} туруктуу өсүш менен алдыга чыкты.` : null,
            'Жеңиштерди карточкага айландырып, социалдык тармакка бөлүшсө болот.',
        ].filter(Boolean);
    }, [weeklyItems, studentOfWeek]);

    const publicMetrics = useMemo(() => {
        const totalXp = weeklyItems.reduce((sum, item) => sum + Number(item?.xp || 0), 0);
        const totalLessons = weeklyItems.reduce((sum, item) => sum + Number(item?.lessonsCompleted || 0), 0);
        const shareReady = achievementItems.slice(0, 3).length;

        return [
            {
                label: 'Бул жума',
                value: weeklyItems.length ? `${weeklyItems.length}+` : 'Жаңы',
                helper: 'Жигердүү студент',
            },
            {
                label: 'Жалпы XP',
                value: totalXp || '0',
                helper: totalLessons ? `${totalLessons} сабак жабылды` : 'Өсүш эсептелүүдө',
            },
            {
                label: 'Бөлүшүү',
                value: `${shareReady}`,
                helper: 'Даяр жеңиш учуру',
            },
        ];
    }, [weekly, achievementItems]);

    const hasLeaderboardServiceIssue = Boolean(weekly?._fallback || fast?._fallback);
    const serviceIssueMessage = weekly?._fallbackMessage || fast?._fallbackMessage || 'Рейтинг сервиси убактылуу жеткиликсиз';

    const emptyWeeklyBoard = !hasLeaderboardServiceIssue && !loading && !(weekly?.items || []).length;
    const improvementItems = challengeItems.slice(0, 3);
    const strengthItems = mySkillProgress.slice(0, 3);

    const renderTrackSwitcher = () => {
        if (lockTrack) return null;
        return (
            <div className="max-w-full overflow-hidden rounded-3xl border border-edubot-line bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap gap-2 min-w-0">
                    {trackOptions.map((option) => {
                        const active = track === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setTrack(option.value)}
                                className={[
                                    'group min-w-0 flex-1 rounded-2xl px-4 py-3 text-left transition-all sm:min-w-[132px] sm:flex-none',
                                    active
                                        ? 'bg-edubot-orange text-white shadow-sm'
                                        : 'bg-edubot-surfaceAlt text-edubot-muted hover:bg-edubot-surface dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                                ].join(' ')}
                            >
                                <div className="text-sm font-semibold">{option.label}</div>
                                <div className={['mt-1 text-xs', active ? 'text-white/80' : 'text-edubot-muted/80 dark:text-slate-400'].join(' ')}>
                                    {option.helper}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (embedded && !publicMode) {
        return (
            <div className="space-y-6">
                <DashboardWorkspaceHero
                    eyebrow="Student Ranking"
                    title="Рейтинг"
                    description="Бул жумадагы ордуңузду, сизге жакын студенттерди жана кийинки тепкичке чыгуу үчүн канча калганыңызды ушул жерден көрүңүз."
                    metricsClassName="grid w-full max-w-3xl gap-3 md:grid-cols-2"
                    metrics={(
                        <>
                            <DashboardMetricCard label="Менин ордум" value={rankValue} valueClassName="text-base sm:text-lg break-words leading-snug" />
                            <DashboardMetricCard label="Жумалык XP" value={currentXp || 0} tone="amber" valueClassName="text-base sm:text-lg break-words leading-snug" />
                            <DashboardMetricCard label="Серия" value={currentStreak ? `${currentStreak} күн` : 'Жок'} tone="blue" valueClassName="text-base sm:text-lg break-words leading-snug" />
                            <DashboardMetricCard label="Кийинки максат" value={targetGapValue} tone="green" valueClassName="text-base sm:text-lg break-words leading-snug" />
                        </>
                    )}
                    className="animate-fade-in"
                >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr),minmax(0,0.85fr)]">
                        <div className="rounded-panel bg-edubot-hero p-6 text-white shadow-edubot-glow transition-all duration-300 hover:-translate-y-0.5">
                            <p className="dashboard-pill">This Week</p>
                            <h3 className="mt-4 text-2xl font-semibold">
                                {snapshot.rank
                                    ? `Сиз азыр ${rankValue} орундасыз`
                                    : 'Бул жумадагы рейтинг жаңы толуп жатат'}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-white/80">
                                {snapshot.nextTargetEntry?.fullName
                                    ? `${snapshot.nextTargetEntry.fullName}ди өтүү үчүн дагы ${targetGapValue} керек.`
                                    : 'Сабактарды жана тесттерди аяктап, алгач рейтингге кирип алыңыз.'}
                            </p>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                    <div className="text-xs uppercase tracking-[0.16em] text-white/65">Лидерлер</div>
                                    <div className="mt-2 text-xl font-semibold">{weeklyItems.length || 0}</div>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                    <div className="text-xs uppercase tracking-[0.16em] text-white/65">Аптанын студенти</div>
                                    <div className="mt-2 truncate text-sm font-semibold">{studentOfWeek?.fullName || 'Күтүүдө'}</div>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                    <div className="text-xs uppercase tracking-[0.16em] text-white/65">Өзгөрүү</div>
                                    <div className="mt-2 text-xl font-semibold">
                                        {mySummary?.rankDelta
                                            ? `${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta}`
                                            : '0'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DashboardInsetPanel
                            title="Кайсы рейтингди карап жатасыз"
                            description="Окуу форматына жараша рейтинг бөлүнүп көрүнөт."
                            className="transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <div className="space-y-4">
                                {renderTrackSwitcher()}
                                <div className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">{trackMeta.label}</p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{trackMeta.helper}</p>
                                </div>
                            </div>
                        </DashboardInsetPanel>
                    </div>
                </DashboardWorkspaceHero>

                {hasLeaderboardServiceIssue ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 animate-fade-in">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Рейтинг эскертүүсү</p>
                                <p className="mt-1 text-sm">Азыр чыныгы рейтинг маалыматы алынган жок. Ошондуктан бош блоктор көрүнүшү мүмкүн.</p>
                            </div>
                            <p className="text-xs font-medium text-amber-700/80 dark:text-amber-200/80">{serviceIssueMessage}</p>
                        </div>
                    </div>
                ) : null}

                <section className="dashboard-panel overflow-hidden animate-fade-in">
                    <DashboardSectionHeader
                        eyebrow="Weekly Board"
                        title="Бул жумадагы такта"
                        description="Лидерлерди жана сизге эң жакын орундарды бир карап алыңыз."
                    />
                    <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
                        <div className="transition-all duration-300 hover:-translate-y-0.5">
                            <LeaderboardListCard
                                title={`${trackMeta.label} лидерлери`}
                                description="Бул жумадагы активдүү студенттер."
                                items={weeklyItems}
                                currentUserId={user?.id}
                                embedded
                            />
                        </div>
                        <div className="transition-all duration-300 hover:-translate-y-0.5">
                            <NearYouRail
                                items={snapshot.nearYou || []}
                                currentUserId={user?.id}
                                targetGap={snapshot.targetGap}
                                nextTargetName={snapshot.nextTargetEntry?.fullName || ''}
                                embedded
                            />
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
                    <DashboardInsetPanel
                        title="Кантип тез өсөсүз"
                        description="Аз аракет менен көбүрөөк пайда бере турган кийинки кадамдар."
                        className="animate-fade-in transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <div className="space-y-3">
                            {(improvementItems.length ? improvementItems : [
                                { title: '1 сабак бүтүрүңүз', detail: 'Рейтингге түз таасир этет.' },
                                { title: '1 тест ийгиликтүү бүтүрүңүз', detail: 'Жумалык XP бат өсөт.' },
                                { title: 'Серияны үзбөңүз', detail: 'Туруктуу кайтып туруу маанилүү.' },
                            ]).map((item, index) => (
                                <div
                                    key={item.id || item.title || index}
                                    className="rounded-2xl border border-edubot-line bg-white/80 px-4 py-4 transition-all duration-300 hover:border-edubot-orange/40 hover:bg-edubot-soft/10 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange">Кадам {index + 1}</div>
                                    <p className="mt-2 text-base font-semibold text-edubot-ink dark:text-white">{item.title}</p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{item.detail || item.value || 'Бул аракет рейтингиңизге жардам берет.'}</p>
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Күчтүү жактарыңыз"
                        description="Кайсы көндүмдөрдө жеке өсүш жакшы болуп жатканын ушул жерден көрөсүз."
                        className="animate-fade-in transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <div className="space-y-3">
                            {(strengthItems.length ? strengthItems : achievementItems.slice(0, 3)).map((item, index) => (
                                <div
                                    key={item.id || item.slug || item.title || index}
                                    className="rounded-2xl border border-edubot-line bg-white/80 px-4 py-4 transition-all duration-300 hover:border-edubot-teal/40 hover:bg-edubot-surfaceAlt dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                                {item.name || item.title || 'Өсүү чекити'}
                                            </p>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {item.progressPercent !== undefined
                                                    ? `${item.progressPercent || 0}% өздөштүрүү · ${item.completedLessons || 0}/${item.totalLessons || 0} сабак`
                                                    : item.description || 'Жеке өсүшүңүздүн позитивдүү сигналы.'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-edubot-surfaceAlt px-3 py-1 text-xs font-semibold text-edubot-ink dark:bg-slate-800 dark:text-slate-200">
                                            {item.xp ? `${item.xp} XP` : 'Өсүү'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>
        );
    }

    const renderTab = () => {
        return (
            <SmoothTabTransition isLoading={loading} isDataLoaded={true}>
                <div className="py-16 flex justify-center">
                    {/* Content will be rendered here */}
                </div>
            </SmoothTabTransition>
        );
    };

    const supportingSkillsSection = skillBoardCards.length ? (
        <div className="space-y-6">
            <MySkillProgressGrid items={mySkillProgress.slice(0, 6)} embedded={embedded} />
            <SkillSpotlightGrid
                boards={skillBoardCards.slice(0, 4)}
                personalProgress={mySkillProgress}
                featuredSlug={normalizedSkillQuery}
                embedded={embedded}
            />
        </div>
    ) : null;

    const supportingWinsSection = (achievementItems.length || challengeItems.length) ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <AchievementCloud
                items={achievementItems.slice(0, 6)}
                title="Жетишкендиктер"
                subtitle="Окуудагы көрүнүктүү учурлар жана күчтүү жактарыңыз."
                embedded={embedded}
            />
            <ChallengeRail items={challengeItems} embedded={embedded} />
        </div>
    ) : null;

    const renderContent = () => {
        switch (activeTab) {
            case 'weekly':
                return (
                    <div className={publicMode ? 'space-y-6' : 'grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'}>
                        <LeaderboardListCard
                            title={publicMode ? 'Аптанын лидерлери' : `${trackMeta.label} лидерлери`}
                            description={`Азыркы 7 күн ичинде ${trackMeta.helper.toLowerCase()} боюнча эң активдүү студенттер.`}
                            items={weekly?.items || []}
                            currentUserId={user?.id}
                            embedded={embedded}
                        />
                        {publicMode ? (
                            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">Ачык рейтинг</p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Ачык таблица</h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    Бул бетте өз алдынча окуу форматындагы курстардын активдүү студенттери көрсөтүлөт. Таблица кыска, түшүнүктүү жана бөлүшүүгө ыңгайлуу болуп түзүлгөн.
                                </p>
                                {studentOfWeek?.fullName ? (
                                    <div className="mt-4 rounded-[22px] border border-orange-200 bg-orange-50/80 p-4 dark:border-orange-500/30 dark:bg-orange-500/10">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-200">Аптанын студенти</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{studentOfWeek.fullName}</p>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{studentOfWeek.xp || 0} XP · {studentOfWeek.lessonsCompleted || 0} сабак</p>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <LeaderboardListCard
                                title="Ылдам өсүш"
                                description={
                                    track === 'all'
                                        ? 'Кыска убакытта эң көп сабак жапкан студенттер.'
                                        : 'Бул блок азырынча жалпы платформа боюнча эсептелет. Бул фильтр үчүн backend түзүмүн кеңейтүү керек.'
                                }
                                items={fast?.items || []}
                                currentUserId={user?.id}
                                embedded={embedded}
                            />
                        )}
                    </div>
                );
            default:
                return publicMode ? (
                    <div className="space-y-6">
                        <PublicSpotlightPanel studentOfWeek={studentOfWeek} highlights={publicHighlights} metrics={publicMetrics} />
                        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                            <LeaderboardListCard
                                title="Бул жуманын алдыңкылары"
                                description="Туруктуу окуу, жапкан сабактар жана күчтүү темп менен айырмаланган студенттер."
                                items={weekly?.items || []}
                                currentUserId={null}
                                embedded={embedded}
                            />
                            <AchievementCloud
                                items={achievementItems.slice(0, 3)}
                                title="Бөлүшүүгө даяр учурлар"
                                subtitle="Жетишкендиктерди карточкага айландырып, башкаларга көрсөтүңүз."
                                embedded={embedded}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-6">
                                <LeaderboardListCard
                                    title={`${trackMeta.label} мыкты 10`}
                                    description={`Бул жумада кимдер активдүү экенин жана сиз кайсы орундарга жакын экениңизди ушул жерден көрөсүз.`}
                                    items={weekly?.items || []}
                                    currentUserId={user?.id}
                                    embedded={embedded}
                                    footer={
                                        embedded ? null : (
                                            <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-300">
                                                <span>Жумалык лидерлер жана сизге жакын орундар</span>
                                                <Link to="/student?tab=leaderboard" className="font-semibold text-orange-500">
                                                    Дашборддан ачуу
                                                </Link>
                                            </div>
                                        )
                                    }
                                />
                                <NearYouRail
                                    items={snapshot.nearYou || []}
                                    currentUserId={user?.id}
                                    targetGap={snapshot.targetGap}
                                    nextTargetName={snapshot.nextTargetEntry?.fullName || ''}
                                    embedded={embedded}
                                />
                            </div>
                            <div className="space-y-6">
                                {supportingWinsSection}
                            </div>
                        </div>
                        {skillBoardsLoading ? (
                            <div className="py-12 flex justify-center">
                                <Loader fullScreen={false} />
                            </div>
                        ) : supportingSkillsSection ? (
                            supportingSkillsSection
                        ) : (
                            <div className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#222222]' : 'rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22]'}>
                                <p className={embedded ? 'text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300' : 'text-sm font-semibold uppercase tracking-[0.18em] text-orange-500'}>Көндүмдөр күтүлүүдө</p>
                                <p className={embedded ? 'mt-2 text-sm text-gray-500 dark:text-gray-400' : 'mt-2 text-sm text-slate-500 dark:text-slate-300'}>
                                    Азырынча бул бөлүктө көрсөтө турган кошумча көндүм маалыматы жок.
                                </p>
                            </div>
                        )}
                        {!supportingWinsSection ? (
                            <div className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#222222]' : 'rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22]'}>
                                <p className={embedded ? 'text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300' : 'text-sm font-semibold uppercase tracking-[0.18em] text-orange-500'}>Кийинки кадам</p>
                                <p className={embedded ? 'mt-2 text-sm text-gray-500 dark:text-gray-400' : 'mt-2 text-sm text-slate-500 dark:text-slate-300'}>
                                    Рейтинг жакшыраак иштеши үчүн көбүрөөк чыныгы окуу активдүүлүгү чогулушу керек.
                                </p>
                            </div>
                        ) : null}
                    </div>
                );
        }
    };

    return (
        <div
            className={embedded
                ? 'w-full max-w-full space-y-8 overflow-x-hidden'
                : 'min-h-screen w-full max-w-full overflow-x-hidden bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_16%,_#f8fafc_100%)] px-4 py-10 text-slate-900 dark:bg-[linear-gradient(180deg,_#0b1120_0%,_#1a1f2e_16%,_#1e293b_100%)] dark:text-white md:px-8 xl:px-10'}
        >
            <div className={embedded ? 'w-full max-w-full min-w-0 space-y-8' : 'mx-auto w-full max-w-7xl min-w-0 space-y-8'}>
                <section className="dashboard-panel overflow-hidden">
                    <DashboardSectionHeader
                        eyebrow="Student Ranking"
                        title="Рейтинг"
                        description="Бул жумадагы ордуңузду, сизге жакын студенттерди жана алдыга чыгуу үчүн канча калганыңызды ушул жерден көрүңүз."
                        metrics={(
                            <>
                                <DashboardMetricCard label="Менин ордум" value={rankValue} />
                                <DashboardMetricCard label="Бул жумадагы XP" value={currentXp || 0} tone="amber" />
                                <DashboardMetricCard label="Серия" value={currentStreak ? `${currentStreak} күн` : 'Жок'} tone="blue" />
                                <DashboardMetricCard label="Кийинки максат" value={targetGapValue} tone="green" />
                            </>
                        )}
                    />

                    <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
                        <DashboardInsetPanel
                            title="Бул жумадагы абал"
                            description={`Тандалган багыт: ${trackMeta.label}. Бул бөлүк сиз кайсы орунда экениңизди жана кимге жакындап калганыңызды көрсөтөт.`}
                        >
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted">Жумалык такта</div>
                                    <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{weeklyItems.length || 0}</div>
                                    <div className="mt-1 text-sm text-edubot-muted dark:text-slate-400">активдүү студент</div>
                                </div>
                                <div className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted">Аптанын студенти</div>
                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {studentOfWeek?.fullName || 'Азырынча жок'}
                                    </div>
                                    <div className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{studentOfWeek?.xp || 0} XP</div>
                                </div>
                                <div className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted">Кийинки орун</div>
                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {snapshot.nextTargetEntry?.fullName || 'Күтүүдө'}
                                    </div>
                                    <div className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{targetGapValue}</div>
                                </div>
                            </div>
                        </DashboardInsetPanel>

                        <DashboardInsetPanel
                            title="Рейтинг кантип жакшырат"
                            description="Бул жер жөн гана атаандаштык эмес. Сабакты бүтүрүү, туруктуу окуу жана жумалык активдүүлүк позицияны жогорулатат."
                        >
                            <div className="space-y-3 text-sm text-edubot-muted dark:text-slate-400">
                                <p>Сабактарды бүтүргөн сайын жана туруктуу кайтып келген сайын позиция жогорулайт.</p>
                                <p>Тандалган багытты алмаштырсаңыз, видео жана сессиялык окуунун рейтинги өзүнчө көрүнөт.</p>
                                <p>Негизги максат: өзүңүзгө жакын студенттерден алдыга өтүү жана жеке темпти сактоо.</p>
                            </div>
                        </DashboardInsetPanel>
                    </div>
                </section>

                {hasLeaderboardServiceIssue ? (
                    <div className={embedded ? 'rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100' : 'rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Рейтинг эскертүүсү</p>
                                <p className="mt-1 text-sm">
                                    Азыр рейтинг сервисинен чыныгы маалымат алынган жок. Ошондуктан жасалма лидерлер көрсөтүлгөн жок, блоктор бош болушу мүмкүн.
                                </p>
                            </div>
                            <p className="text-xs font-medium text-amber-700/80 dark:text-amber-200/80">{serviceIssueMessage}</p>
                        </div>
                    </div>
                ) : null}

                {emptyWeeklyBoard ? (
                    <div className={embedded ? 'rounded-[24px] border border-gray-100 bg-white px-5 py-4 text-gray-700 shadow-sm dark:border-gray-800 dark:bg-[#222222] dark:text-gray-200' : 'rounded-[24px] border border-slate-200 bg-white/90 px-5 py-4 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200'}>
                        <p className={embedded ? 'text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300' : 'text-sm font-semibold uppercase tracking-[0.18em] text-orange-500'}>Рейтинг жаңы толуп жатат</p>
                        <p className="mt-1 text-sm">
                            Бул багыт боюнча азырынча рейтингке чыга турган жетиштүү активдүүлүк жок. Биринчи сабактарды аяктагандан кийин таблица толо баштайт.
                        </p>
                    </div>
                ) : null}

                    <div className="grid max-w-full min-w-0 gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
                        <div className="min-w-0 space-y-4">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-edubot-orange">Жумалык көрүнүш</p>
                                <h2 className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white sm:text-3xl">
                                    Сизге жакын орундар жана такта
                                </h2>
                                <p className="mt-2 max-w-3xl text-sm text-edubot-muted dark:text-slate-400 sm:text-base">
                                    Негизги көрүнүштү гана калтырдык: бул жумадагы лидерлер, сизге жакын студенттер жана кошумча колдоочу сигналдар.
                                    {mySummary?.rankDelta
                                        ? ` Учурдагы өзгөрүү: ${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta} орун.`
                                        : ''}
                                </p>
                            </div>
                            {renderTrackSwitcher()}
                        </div>
                        <div className="grid w-full max-w-full min-w-0 grid-cols-2 gap-2 rounded-3xl border border-edubot-line bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex sm:flex-wrap xl:w-auto xl:rounded-full">
                        {visibleTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={[
                                    'min-w-0 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4',
                                    activeTab === tab.id
                                        ? 'bg-edubot-orange text-white'
                                        : 'text-edubot-muted hover:bg-edubot-surfaceAlt dark:text-slate-300 dark:hover:bg-slate-800',
                                ].join(' ')}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <SmoothTabTransition isLoading={loading} isDataLoaded={true}>
                    {renderContent()}
                </SmoothTabTransition>
            </div>
        </div>
    );
};

LeaderboardHub.propTypes = {
    embedded: PropTypes.bool,
    initialTrack: PropTypes.oneOf(['all', 'video', 'live']),
    lockTrack: PropTypes.bool,
    publicMode: PropTypes.bool,
};

LeaderboardHub.defaultProps = {
    embedded: false,
    initialTrack: 'all',
    lockTrack: false,
    publicMode: false,
};

export default LeaderboardHub;

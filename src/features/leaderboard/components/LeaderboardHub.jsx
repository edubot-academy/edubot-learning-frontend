import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
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
    LeaderboardHero,
    LeaderboardListCard,
    MySkillProgressGrid,
    NearYouRail,
    PublicSpotlightPanel,
    SkillSpotlightGrid,
} from './LeaderboardExperience';

const tabs = [
    { id: 'overview', label: 'Кыскача' },
    { id: 'weekly', label: 'Апталык рейтинг' },
    { id: 'skills', label: 'Көндүмдөр' },
    { id: 'wins', label: 'Жетишкендиктер' },
];

const publicTabs = [
    { id: 'overview', label: 'Кыскача' },
    { id: 'weekly', label: 'Апталык рейтинг' },
];

const trackOptions = [
    { value: 'all', label: 'Бардыгы', helper: 'Жалпы рейтинг' },
    { value: 'video', label: 'Окуу форматы', helper: 'Өз алдынча окуу' },
    { value: 'live', label: 'Жандуу', helper: 'Жандуу жана офлайн сабактар' },
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

    const fallbackChallengeItems = useMemo(
        () => [
            {
                id: 'c1',
                title: 'Кийинки орунду алуу',
                detail: snapshot.targetGap
                    ? `Дагы ${snapshot.targetGap} XP алсаңыз, алдыдагы оюнчуга жакындайсыз.`
                    : 'Алдыңкы тактага чыгуу үчүн 2 кичине кадам жасаңыз.',
            },
            {
                id: 'c2',
                title: 'Күндүк импульс',
                detail: '1 сабак + 1 тест комбинациясы рейтингди бат түртөт.',
            },
            {
                id: 'c3',
                title: 'Көндүм багыты',
                detail: 'Тандалган көндүм боюнча мыктыларды карап, ошол багытты күчөтүңүз.',
            },
        ],
        [snapshot]
    );

    const fallbackAchievementItems = useMemo(() => {
        const winners = Array.isArray(weekly?.items) ? weekly.items.slice(0, 3) : [];
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
    }, [weekly, studentOfWeek, snapshot]);

    const challengeItems = useMemo(() => {
        const items = Array.isArray(backendChallenges?.items) ? backendChallenges.items : [];
        if (!items.length) return fallbackChallengeItems;

        return items.map((item) => ({
            ...item,
            detail: item.detail || item.value || '',
        }));
    }, [backendChallenges, fallbackChallengeItems]);

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
        const leaders = Array.isArray(weekly?.items) ? weekly.items.slice(0, 3) : [];
        const leaderNames = leaders.map((item) => item?.fullName).filter(Boolean);
        return [
            leaderNames.length ? `${leaderNames.join(', ')} бул жумада лидер болуп турат.` : null,
            studentOfWeek?.fullName ? `${studentOfWeek.fullName} туруктуу өсүш менен алдыга чыкты.` : null,
            'Жеңиштерди карточкага айландырып, социалдык тармакка бөлүшсө болот.',
        ].filter(Boolean);
    }, [weekly, studentOfWeek]);

    const publicMetrics = useMemo(() => {
        const weeklyItems = Array.isArray(weekly?.items) ? weekly.items : [];
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

    const renderTrackSwitcher = () => {
        if (lockTrack) return null;
        return (
        <div className={embedded ? 'max-w-full overflow-hidden rounded-[24px] border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-[#222222]' : 'max-w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70'}>
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
                                    ? embedded
                                        ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500 dark:text-white'
                                        : 'bg-slate-900 text-white shadow-lg shadow-slate-300/60 dark:bg-white dark:text-slate-900 dark:shadow-none'
                                    : embedded
                                        ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-[#1A1A1A] dark:text-gray-300 dark:hover:bg-gray-800'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800',
                            ].join(' ')}
                        >
                            <div className="text-sm font-semibold">{option.label}</div>
                            <div className={['mt-1 text-xs', active ? (embedded ? 'text-white/80' : 'text-white/75 dark:text-slate-600') : (embedded ? 'text-gray-400 dark:text-gray-500' : 'text-slate-400')].join(' ')}>
                                {option.helper}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
        );
    };

    const renderTab = () => {
        if (loading) {
            return (
                <div className="py-16 flex justify-center">
                    <Loader fullScreen={false} />
                </div>
            );
        }

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
            case 'skills':
                return (
                    <div className="space-y-6">
                        {skillBoardsLoading ? (
                            <div className="py-12 flex justify-center">
                                <Loader fullScreen={false} />
                            </div>
                        ) : skillBoardCards.length ? (
                            <>
                                <MySkillProgressGrid items={mySkillProgress.slice(0, 6)} embedded={embedded} />
                                <SkillSpotlightGrid boards={skillBoardCards} personalProgress={mySkillProgress} featuredSlug={normalizedSkillQuery} embedded={embedded} />
                                <div className="grid gap-6 xl:grid-cols-2">
                                    {skillBoardCards.slice(0, 4).map((board) => (
                                        <LeaderboardListCard
                                            key={board.slug}
                                            title={`${board.label} рейтинги`}
                                            description={normalizedSkillQuery && board.slug === normalizedSkillQuery ? `Тандалган багыт: ${board.label}. Жогоруда жеке прогрессиңиз көрүнөт.` : 'Бул багыттагы алдыңкы студенттер. Жогоруда жеке прогрессиңиз көрүнөт.'}
                                            items={board.items}
                                            currentUserId={user?.id}
                                            embedded={embedded}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#222222]' : 'rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22]'}>
                                <p className={embedded ? 'text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300' : 'text-sm font-semibold uppercase tracking-[0.18em] text-orange-500'}>Көндүмдөр күтүлүүдө</p>
                                <p className={embedded ? 'mt-2 text-sm text-gray-500 dark:text-gray-400' : 'mt-2 text-sm text-slate-500 dark:text-slate-300'}>
                                    Азырынча backend каталогунда көндүмдөр табылган жок. Көндүмдөр кошулганда бул жерде алардын рейтингдери жана жеке прогресс көрүнөт.
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'wins':
                return (
                    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                        <AchievementCloud
                            items={achievementItems}
                            title="Жетишкендиктер дубалы"
                            subtitle={`Бул жерде ${trackMeta.label.toLowerCase()} багыты боюнча упай, статус жана окуялар чыгат.`}
                            embedded={embedded}
                        />
                        <ChallengeRail items={challengeItems} embedded={embedded} />
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
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-6">
                            <LeaderboardListCard
                                title={`${trackMeta.label} мыкты 10`} 
                                description={`Жалпы көрүнүктүү прогресс ушул жерде. Азыр тандалган фокус: ${trackMeta.helper.toLowerCase()}.`}
                                items={weekly?.items || []}
                                currentUserId={user?.id}
                                embedded={embedded}
                                footer={
                                    embedded ? null : (
                                        <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-300">
                                            <span>Алдыңкы студенттер көрүнгөн формат</span>
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
                            <ChallengeRail items={challengeItems} embedded={embedded} />
                            <AchievementCloud
                                items={achievementItems}
                                title="Бөлүшүүгө даяр учурлар"
                                subtitle={`Бөлүшүүгө ылайыктуу эң күчтүү учурлар. Багыт: ${trackMeta.label}.`}
                                embedded={embedded}
                            />
                            <SkillSpotlightGrid boards={skillBoardCards} personalProgress={mySkillProgress} featuredSlug={normalizedSkillQuery} embedded={embedded} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className={embedded
                ? 'w-full max-w-full space-y-8 overflow-x-hidden'
                : 'min-h-screen w-full max-w-full overflow-x-hidden bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_16%,_#f8fafc_100%)] px-4 py-10 text-slate-900 dark:bg-[#0b1120] dark:text-white md:px-8 xl:px-10'}
        >
            <div className={embedded ? 'w-full max-w-full min-w-0 space-y-8' : 'mx-auto w-full max-w-7xl min-w-0 space-y-8'}>
                <LeaderboardHero
                    userName={user?.fullName || user?.name || ''}
                    snapshot={snapshot}
                    xp={currentXp}
                    streakDays={currentStreak}
                    embedded={embedded}
                    levelLabel={embedded ? 'Жеке кабинет рейтинги' : publicMode ? 'Ачык рейтинг' : 'Жаңыланган рейтинг'}
                    title={embedded ? 'Рейтинг жана жеңиш картасы' : publicMode ? 'Ачык рейтинг' : 'Рейтингди мотивацияга айландырган мейкиндик'}
                    description={
                        embedded
                            ? `Бул табда ${trackMeta.label.toLowerCase()} боюнча сизге жакын орундар, кайсы кадам тез өсүш алып келери жана кайсы жеңишти бөлүшсө болору көрүнөт.`
                            : publicMode
                                ? 'Бул ачык бетте аптанын лидерлери, күчтүү өсүш жана бөлүшүүгө татыктуу жеңиштер көрүнөт.'
                                : `Бул жерде жөн гана ким биринчи экени эмес, кайсы кадам сизди кийинки секирикке алып барары көрсөтүлөт. Азыркы фокус: ${trackMeta.helper.toLowerCase()}.`
                    }
                />

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
                            <p className={embedded ? 'text-sm font-semibold uppercase tracking-[0.26em] text-blue-600 dark:text-blue-300' : 'text-sm font-semibold uppercase tracking-[0.26em] text-orange-500'}>EduBot өсүү цикли</p>
                            <h2 className={embedded ? 'mt-2 text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3] sm:text-3xl' : 'mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl'}>
                                Кайра келтирген рейтинг тажрыйбасы
                            </h2>
                            <p className={embedded ? 'mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400 sm:text-base' : 'mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base'}>
                                Көрүнүктүү жеңиштер, өзгөчө көрүнгөн көндүмдөр жана кыска циклдеги максаттар студентти кайра кайтууга түртүшү керек.
                                {mySummary?.rankDelta
                                    ? ` Азырынча сиздин өзгөрүүңүз: ${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta} орун.`
                                    : ''}
                            </p>
                        </div>
                        {renderTrackSwitcher()}
                    </div>
                    <div className={embedded ? 'grid w-full max-w-full min-w-0 grid-cols-2 gap-2 rounded-[24px] border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-[#222222] sm:flex sm:flex-wrap xl:w-auto xl:rounded-full' : 'grid w-full max-w-full min-w-0 grid-cols-2 gap-2 rounded-[24px] border border-slate-200 bg-white/85 p-1 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:flex sm:flex-wrap xl:w-auto xl:rounded-full'}>
                        {visibleTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={[
                                    'min-w-0 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4',
                                    activeTab === tab.id
                                        ? embedded
                                            ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                                            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                        : embedded
                                            ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                                ].join(' ')}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {renderTab()}
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

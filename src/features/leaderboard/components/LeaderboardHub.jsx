import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { SmoothTabTransition } from '@components/ui';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import { getDashboardPath } from '@shared/utils/navigation';
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
    ChallengeRail,
    LeaderboardListCard,
    MySkillProgressGrid,
    NearYouRail,
    PublicSpotlightPanel,
    SkillSpotlightGrid,
} from './LeaderboardExperience';
import { buildLeaderboardSnapshot } from './leaderboardSnapshot';

const tabIds = ['overview', 'weekly', 'skills'];
const publicTabIds = ['overview', 'weekly'];
const trackIds = ['all', 'video', 'live'];
const asArray = (value) => (Array.isArray(value) ? value : []);

const panelClassName = (embedded) =>
    embedded
        ? 'rounded-[24px] border border-gray-100 bg-white px-5 py-4 text-gray-700 shadow-sm dark:border-gray-800 dark:bg-[#222222] dark:text-gray-200'
        : 'rounded-[24px] border border-slate-200 bg-white/90 px-5 py-4 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200';

const eyebrowClassName = (embedded) =>
    embedded
        ? 'text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300'
        : 'text-sm font-semibold uppercase tracking-[0.18em] text-orange-500';

const LeaderboardHub = ({ embedded = false, initialTrack = 'all', lockTrack = false, publicMode = false }) => {
    const { t } = useTranslation();
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
    const [loadError, setLoadError] = useState('');
    const [skillBoardsError, setSkillBoardsError] = useState('');

    const skillQuery = searchParams.get('skill') || '';
    const normalizedSkillQuery = useMemo(() => String(skillQuery || '').trim().toLowerCase(), [skillQuery]);

    const trackOptions = useMemo(() => trackIds.map((value) => ({
        value,
        label: t(`public.leaderboard.tracks.${value}.label`),
        helper: t(`public.leaderboard.tracks.${value}.helper`),
    })), [t]);
    const tabs = useMemo(() => tabIds.map((id) => ({
        id,
        label: t(`public.leaderboard.tabs.${id}`),
    })), [t]);
    const publicTabs = useMemo(() => publicTabIds.map((id) => ({
        id,
        label: t(`public.leaderboard.tabs.${id}`),
    })), [t]);
    const publicTrustPoints = useMemo(
        () => asArray(t('public.leaderboard.publicTrustPoints', { returnObjects: true })),
        [t]
    );

    const trackMeta = useMemo(
        () => trackOptions.find((option) => option.value === track) || trackOptions[0],
        [track, trackOptions]
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
        setSkillBoardsError('');
        try {
            const catalog = await fetchSkills();
            const mapped = Array.isArray(catalog)
                ? catalog
                    .filter((skill) => skill.slug || skill.id)
                    .map((skill) => ({
                        slug: skill.slug || String(skill.id),
                        label: skill.name || skill.slug || String(skill.id),
                    }))
                : [];
            setSkillBoards(mapped);
        } catch (error) {
            console.warn('Skills catalog refresh failed', error);
            setSkillBoardsError('public.leaderboard.skills.catalogUnavailable');
            setSkillBoards([]);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setLoadError('');
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
            } catch (error) {
                console.warn('Leaderboard refresh failed', error);
                if (!cancelled) {
                    setLoadError('public.leaderboard.errors.load');
                }
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
            label: t('public.leaderboard.snapshotLabel', { track: trackMeta.label }),
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
                    ? t('public.leaderboard.rankDelta', {
                        value: `${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta}`,
                    })
                    : fallback.momentum?.[0],
                mySummary.strongestSkill?.name
                    ? t('public.leaderboard.strongestSkill', { name: mySummary.strongestSkill.name })
                    : fallback.momentum?.[1],
                fallback.momentum?.[2],
            ].filter(Boolean),
        };
    }, [weekly, user, currentUserWeeklyEntry, mySummary, nearMe, trackMeta, t]);

    const currentXp = mySummary?.windowXp ?? mySummary?.xp ?? currentUserWeeklyEntry?.xp ?? 0;
    const currentStreak = mySummary?.streakDays ?? currentUserWeeklyEntry?.streakDays ?? 0;
    const weeklyItems = useMemo(() => (Array.isArray(weekly?.items) ? weekly.items : []), [weekly?.items]);
    const rankValue = snapshot.rank ? `#${snapshot.rank}` : t('public.leaderboard.rank.notYet');
    const targetGapValue = snapshot.targetGap ? `${snapshot.targetGap} XP` : t('public.leaderboard.rank.soon');

    const fallbackAchievementItems = useMemo(() => {
        const winners = weeklyItems.slice(0, 3);
        const items = [];

        if (studentOfWeek?.fullName) {
            items.push({
                id: 'sow',
                title: t('public.leaderboard.studentOfWeek'),
                description: t('public.leaderboard.achievements.studentOfWeekDescription', {
                    name: studentOfWeek.fullName,
                    xp: studentOfWeek.xp || 0,
                }),
                rarity: 'epic',
            });
        }

        winners.forEach((winner, index) => {
            items.push({
                id: `winner-${winner.studentId || index}`,
                title: t('public.leaderboard.achievements.rankWinner', { rank: index + 1 }),
                description: t('public.leaderboard.achievements.rankWinnerDescription', {
                    name: winner.fullName || t('public.leaderboard.defaultStudent'),
                }),
                rarity: index === 0 ? 'epic' : 'rare',
            });
        });

        if (snapshot.rank) {
            items.unshift({
                id: 'me',
                title: t('public.leaderboard.rank.yourRank', { rank: snapshot.rank }),
                description: snapshot.targetGap
                    ? t('public.leaderboard.achievements.nextRankGap', { xp: snapshot.targetGap })
                    : t('public.leaderboard.achievements.rankStable'),
                rarity: 'rare',
            });
        }

        return items;
    }, [weeklyItems, studentOfWeek, snapshot, t]);

    const challengeItems = useMemo(() => {
        const items = Array.isArray(backendChallenges?.items) ? backendChallenges.items : [];
        return items.map((item) => ({
            ...item,
            detail: item.detail || item.value || '',
        }));
    }, [backendChallenges]);

    const achievementItems = useMemo(() => {
        const items = Array.isArray(backendAchievements?.items) ? backendAchievements.items : [];
        const normalize = (item) => ({
            ...item,
            title: item.title || item.name,
            description: item.description || t('public.leaderboard.achievements.growthDescription'),
        });

        if (!items.length) return fallbackAchievementItems.map(normalize);

        return items.map(normalize);
    }, [backendAchievements, fallbackAchievementItems, t]);

    const publicHighlights = useMemo(() => {
        const leaders = weeklyItems.slice(0, 3);
        const leaderNames = leaders.map((item) => item?.fullName).filter(Boolean);
        return [
            leaderNames.length ? t('public.leaderboard.publicHighlights.leaders', { names: leaderNames.join(', ') }) : null,
            studentOfWeek?.fullName ? t('public.leaderboard.publicHighlights.studentOfWeek', { name: studentOfWeek.fullName }) : null,
            t('public.leaderboard.publicHighlights.progress'),
        ].filter(Boolean);
    }, [weeklyItems, studentOfWeek, t]);

    const publicMetrics = useMemo(() => {
        const totalXp = weeklyItems.reduce((sum, item) => sum + Number(item?.xp || 0), 0);
        const totalLessons = weeklyItems.reduce((sum, item) => sum + Number(item?.lessonsCompleted || 0), 0);
        const visibleAchievements = achievementItems.slice(0, 3).length;

        return [
            {
                label: t('public.leaderboard.metrics.thisWeek'),
                value: weeklyItems.length ? `${weeklyItems.length}+` : t('public.leaderboard.metrics.new'),
                helper: t('public.leaderboard.metrics.activeStudent'),
            },
            {
                label: t('public.leaderboard.metrics.totalXp'),
                value: totalXp || '0',
                helper: totalLessons
                    ? t('public.leaderboard.metrics.lessonsClosed', { count: totalLessons })
                    : t('public.leaderboard.metrics.growthCalculating'),
            },
            {
                label: t('public.leaderboard.achievements.title'),
                value: `${visibleAchievements}`,
                helper: t('public.leaderboard.metrics.visibleWin'),
            },
        ];
    }, [weeklyItems, achievementItems, t]);

    const heroMetrics = publicMode ? (
        <>
            {publicMetrics.map((metric, index) => (
                <DashboardMetricCard
                    key={`${metric.label}-${index}`}
                    label={metric.label}
                    value={metric.value}
                    tone={index === 1 ? 'amber' : index === 2 ? 'blue' : undefined}
                    valueClassName="text-base sm:text-lg break-words leading-snug"
                />
            ))}
        </>
    ) : (
        <>
            <DashboardMetricCard label={t('public.leaderboard.metrics.myRank')} value={rankValue} valueClassName="text-base sm:text-lg break-words leading-snug" />
            <DashboardMetricCard label={t('public.leaderboard.metrics.thisWeekXp')} value={currentXp || 0} tone="amber" valueClassName="text-base sm:text-lg break-words leading-snug" />
            <DashboardMetricCard label={t('public.leaderboard.metrics.streak')} value={currentStreak ? t('public.leaderboard.units.days', { count: currentStreak }) : t('public.leaderboard.rank.none')} tone="blue" valueClassName="text-base sm:text-lg break-words leading-snug" />
            <DashboardMetricCard label={t('public.leaderboard.metrics.nextGoal')} value={targetGapValue} tone="green" valueClassName="text-base sm:text-lg break-words leading-snug" />
        </>
    );

    const hasLeaderboardServiceIssue = Boolean(weekly?._fallback || fast?._fallback);
    const serviceIssueMessage = weekly?._fallbackMessage || fast?._fallbackMessage || t('public.leaderboard.errors.serviceUnavailable');

    const emptyWeeklyBoard = !hasLeaderboardServiceIssue && !loading && !(weekly?.items || []).length;
    const improvementItems = challengeItems.slice(0, 3);
    const strengthItems = mySkillProgress.slice(0, 3);

    const renderTrackSwitcher = () => {
        if (lockTrack) return null;
        return (
            <div className="max-w-full overflow-hidden rounded-3xl border border-edubot-line bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                <p id="leaderboard-track-label" className="sr-only">{t('public.leaderboard.trackSwitcherLabel')}</p>
                <div className="flex flex-wrap gap-2 min-w-0">
                    {trackOptions.map((option) => {
                        const active = track === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setTrack(option.value)}
                                aria-pressed={active}
                                aria-describedby="leaderboard-track-label"
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
                    eyebrow={t('public.leaderboard.header.studentEyebrow')}
                    title={t('public.leaderboard.header.studentTitle')}
                    description={t('public.leaderboard.header.studentDescription')}
                    metricsClassName="grid w-full max-w-3xl gap-3 md:grid-cols-2"
                    metrics={(
                        <>
                            <DashboardMetricCard label={t('public.leaderboard.metrics.myRank')} value={rankValue} valueClassName="text-base sm:text-lg break-words leading-snug" />
                            <DashboardMetricCard label={t('public.leaderboard.metrics.weeklyXp')} value={currentXp || 0} tone="amber" valueClassName="text-base sm:text-lg break-words leading-snug" />
                            <DashboardMetricCard label={t('public.leaderboard.metrics.streak')} value={currentStreak ? t('public.leaderboard.units.days', { count: currentStreak }) : t('public.leaderboard.rank.none')} tone="blue" valueClassName="text-base sm:text-lg break-words leading-snug" />
                            <DashboardMetricCard label={t('public.leaderboard.metrics.nextGoal')} value={targetGapValue} tone="green" valueClassName="text-base sm:text-lg break-words leading-snug" />
                        </>
                    )}
                    className="animate-fade-in"
                >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr),minmax(0,0.85fr)]">
                        <div className="rounded-panel bg-edubot-hero p-6 text-white shadow-edubot-glow transition-all duration-300 hover:-translate-y-0.5">
                            <p className="dashboard-pill">{t('public.leaderboard.metrics.thisWeek')}</p>
                            <h3 className="mt-4 text-2xl font-semibold">
                                {snapshot.rank
                                    ? t('public.leaderboard.embedded.currentRank', { rank: rankValue })
                                    : t('public.leaderboard.emptyBoardTitle')}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-white/80">
                                {snapshot.nextTargetEntry?.fullName
                                    ? t('public.leaderboard.embedded.passTarget', {
                                        name: snapshot.nextTargetEntry.fullName,
                                        gap: targetGapValue,
                                    })
                                    : t('public.leaderboard.embedded.enterBoardHint')}
                            </p>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                    <div className="text-xs uppercase tracking-[0.16em] text-white/65">{t('public.leaderboard.embedded.leaders')}</div>
                                    <div className="mt-2 text-xl font-semibold">{weeklyItems.length || 0}</div>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                    <div className="text-xs uppercase tracking-[0.16em] text-white/65">{t('public.leaderboard.studentOfWeek')}</div>
                                    <div className="mt-2 truncate text-sm font-semibold">{studentOfWeek?.fullName || t('public.leaderboard.rank.pending')}</div>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                    <div className="text-xs uppercase tracking-[0.16em] text-white/65">{t('public.leaderboard.embedded.change')}</div>
                                    <div className="mt-2 text-xl font-semibold">
                                        {mySummary?.rankDelta
                                            ? `${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta}`
                                            : '0'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DashboardInsetPanel
                            title={t('public.leaderboard.embedded.trackPanelTitle')}
                            description={t('public.leaderboard.embedded.trackPanelDescription')}
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

                {loadError ? (
                    <div className={panelClassName(embedded)} role="alert">
                        <p className={eyebrowClassName(embedded)}>{t('public.leaderboard.errors.loadTitle')}</p>
                        <p className="mt-1 text-sm">{t(loadError)}</p>
                    </div>
                ) : null}

                {hasLeaderboardServiceIssue ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 animate-fade-in">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">{t('public.leaderboard.fallbackTitle')}</p>
                                <p className="mt-1 text-sm">{t('public.leaderboard.serviceIssueBodyShort')}</p>
                            </div>
                            <p className="text-xs font-medium text-amber-700/80 dark:text-amber-200/80">{serviceIssueMessage}</p>
                        </div>
                    </div>
                ) : null}

                <section className="dashboard-panel overflow-hidden animate-fade-in">
                    <DashboardSectionHeader
                        eyebrow={t('public.leaderboard.embedded.weeklyBoardEyebrow')}
                        title={t('public.leaderboard.embedded.weeklyBoardTitle')}
                        description={t('public.leaderboard.embedded.weeklyBoardDescription')}
                    />
                    <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
                        <div className="transition-all duration-300 hover:-translate-y-0.5">
                            <LeaderboardListCard
                                title={t('public.leaderboard.weekly.trackLeaders', { track: trackMeta.label })}
                                description={t('public.leaderboard.embedded.activeStudentsDescription')}
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
                        title={t('public.leaderboard.embedded.growthPanelTitle')}
                        description={t('public.leaderboard.embedded.growthPanelDescription')}
                        className="animate-fade-in transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <div className="space-y-3">
                            {(improvementItems.length ? improvementItems : [
                                ...asArray(t('public.leaderboard.embedded.fallbackGrowthSteps', { returnObjects: true })),
                            ]).map((item, index) => (
                                <div
                                    key={item.id || item.title || index}
                                    className="rounded-2xl border border-edubot-line bg-white/80 px-4 py-4 transition-all duration-300 hover:border-edubot-orange/40 hover:bg-edubot-soft/10 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange">{t('public.leaderboard.embedded.stepLabel', { count: index + 1 })}</div>
                                    <p className="mt-2 text-base font-semibold text-edubot-ink dark:text-white">{item.title}</p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{item.detail || item.value || t('public.leaderboard.embedded.actionHelps')}</p>
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('public.leaderboard.embedded.strengthsTitle')}
                        description={t('public.leaderboard.embedded.strengthsDescription')}
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
                                                {item.name || item.title || t('public.leaderboard.embedded.growthPoint')}
                                            </p>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {item.progressPercent !== undefined
                                                    ? `${t('public.leaderboard.skills.mastery', { count: item.progressPercent || 0 })} · ${t('public.leaderboard.skills.lessonRatio', { completed: item.completedLessons || 0, total: item.totalLessons || 0 })}`
                                                    : item.description || t('public.leaderboard.embedded.positiveSignal')}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-edubot-surfaceAlt px-3 py-1 text-xs font-semibold text-edubot-ink dark:bg-slate-800 dark:text-slate-200">
                                            {item.xp ? `${item.xp} XP` : t('public.leaderboard.embedded.growth')}
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

    const supportingSkillsSection = skillBoardCards.length || mySkillProgress.length ? (
        <div className="space-y-6">
            <MySkillProgressGrid items={mySkillProgress.slice(0, 6)} embedded={embedded} />
            {skillBoardCards.length ? (
                <SkillSpotlightGrid
                    boards={skillBoardCards.slice(0, 4)}
                    personalProgress={mySkillProgress}
                    featuredSlug={normalizedSkillQuery}
                    embedded={embedded}
                />
            ) : null}
        </div>
    ) : null;

    const supportingWinsSection = (achievementItems.length || challengeItems.length) ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <AchievementCloud
                items={achievementItems.slice(0, 6)}
                title={t('public.leaderboard.achievements.title')}
                subtitle={t('public.leaderboard.embedded.achievementsSubtitle')}
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
                            title={publicMode ? t('public.leaderboard.weekly.title') : t('public.leaderboard.weekly.trackLeaders', { track: trackMeta.label })}
                            description={t('public.leaderboard.weekly.description', { helper: trackMeta.helper.toLowerCase() })}
                            items={weekly?.items || []}
                            currentUserId={user?.id}
                            embedded={embedded}
                        />
                        {publicMode ? (
                            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22] sm:p-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">{t('public.leaderboard.publicPanel.eyebrow')}</p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{t('public.leaderboard.publicPanel.title')}</h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    {t('public.leaderboard.publicPanel.description')}
                                </p>
                                {studentOfWeek?.fullName ? (
                                    <div className="mt-4 rounded-[22px] border border-orange-200 bg-orange-50/80 p-4 dark:border-orange-500/30 dark:bg-orange-500/10">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-200">{t('public.leaderboard.studentOfWeek')}</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{studentOfWeek.fullName}</p>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{studentOfWeek.xp || 0} XP · {t('public.leaderboard.lessons', { count: studentOfWeek.lessonsCompleted || 0 })}</p>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <LeaderboardListCard
                                title={t('public.leaderboard.embedded.fastGrowthTitle')}
                                description={
                                    track === 'all'
                                        ? t('public.leaderboard.embedded.fastGrowthDescription')
                                        : t('public.leaderboard.embedded.fastGrowthBackendGap')
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
                        {skillBoardsError ? (
                            <div className={panelClassName(embedded)} role="status">
                                <p className={eyebrowClassName(embedded)}>{t('public.leaderboard.skills.pendingTitle')}</p>
                                <p className="mt-1 text-sm">{t(skillBoardsError)}</p>
                            </div>
                        ) : null}
                        {skillBoardsLoading ? (
                            <div className="py-12 flex justify-center">
                                <Loader fullScreen={false} />
                            </div>
                        ) : supportingSkillsSection ? (
                            supportingSkillsSection
                        ) : (
                            <div className={panelClassName(embedded)}>
                                <p className={eyebrowClassName(embedded)}>{t('public.leaderboard.skills.pendingTitle')}</p>
                                <p className="mt-2 text-sm">
                                    {t('public.leaderboard.skills.noExtraData')}
                                </p>
                            </div>
                        )}
                    </div>
                );
            default:
                return publicMode ? (
                    <div className="space-y-6">
                        <PublicSpotlightPanel studentOfWeek={studentOfWeek} highlights={publicHighlights} metrics={publicMetrics} />
                        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                            <LeaderboardListCard
                                title={t('public.leaderboard.overview.topThisWeek')}
                                description={t('public.leaderboard.overview.topThisWeekDescription')}
                                items={weekly?.items || []}
                                currentUserId={null}
                                embedded={embedded}
                            />
                            <AchievementCloud
                                items={achievementItems.slice(0, 3)}
                                title={t('public.leaderboard.overview.highlights')}
                                subtitle={t('public.leaderboard.overview.highlightsDescription')}
                                embedded={embedded}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-6">
                                <LeaderboardListCard
                                    title={t('public.leaderboard.overview.trackTopTen', { track: trackMeta.label })}
                                    description={t('public.leaderboard.overview.trackTopTenDescription')}
                                    items={weekly?.items || []}
                                    currentUserId={user?.id}
                                    embedded={embedded}
                                    footer={
                                        embedded ? null : (
                                            <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-300">
                                                <span>{t('public.leaderboard.overview.footerSummary')}</span>
                                                <Link to={getDashboardPath('student', 'leaderboard')} className="font-semibold text-orange-500">
                                                    {t('public.leaderboard.overview.openDashboard')}
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
                        ) : skillBoardsError ? (
                            <div className={panelClassName(embedded)} role="status">
                                <p className={eyebrowClassName(embedded)}>{t('public.leaderboard.skills.pendingTitle')}</p>
                                <p className="mt-2 text-sm">{t(skillBoardsError)}</p>
                            </div>
                        ) : supportingSkillsSection ? (
                            supportingSkillsSection
                        ) : (
                            <div className={panelClassName(embedded)}>
                                <p className={eyebrowClassName(embedded)}>{t('public.leaderboard.skills.pendingTitle')}</p>
                                <p className="mt-2 text-sm">
                                    {t('public.leaderboard.skills.noExtraData')}
                                </p>
                            </div>
                        )}
                        {!supportingWinsSection ? (
                            <div className={embedded ? 'rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#222222]' : 'rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-[#161b22]'}>
                                <p className={embedded ? 'text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300' : 'text-sm font-semibold uppercase tracking-[0.18em] text-orange-500'}>{t('public.leaderboard.hero.nextStep')}</p>
                                <p className={embedded ? 'mt-2 text-sm text-gray-500 dark:text-gray-400' : 'mt-2 text-sm text-slate-500 dark:text-slate-300'}>
                                    {t('public.leaderboard.overview.moreActivityNeeded')}
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
                        eyebrow={publicMode ? t('public.leaderboard.header.publicEyebrow') : t('public.leaderboard.header.studentEyebrow')}
                        title={publicMode ? t('public.leaderboard.header.publicTitle') : t('public.leaderboard.header.studentTitle')}
                        description={publicMode
                            ? t('public.leaderboard.header.publicDescription')
                            : t('public.leaderboard.header.studentDescription')}
                        metrics={heroMetrics}
                    />

                    <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
                        <DashboardInsetPanel
                            title={publicMode ? t('public.leaderboard.explainer.publicTitle') : t('public.leaderboard.explainer.studentTitle')}
                            description={publicMode
                                ? t('public.leaderboard.explainer.publicDescription', { track: trackMeta.label })
                                : t('public.leaderboard.explainer.studentDescription', { track: trackMeta.label })}
                        >
                            {publicMode ? (
                                <div className="grid gap-3">
                                    {publicTrustPoints.map((point, index) => (
                                        <div key={point} className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted">0{index + 1}</div>
                                            <p className="mt-2 text-sm leading-6 text-edubot-ink dark:text-white">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted">{t('public.leaderboard.metrics.weeklyBoard')}</div>
                                        <div className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white">{weeklyItems.length || 0}</div>
                                        <div className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{t('public.leaderboard.metrics.activeStudent')}</div>
                                    </div>
                                    <div className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted">{t('public.leaderboard.studentOfWeek')}</div>
                                        <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                            {studentOfWeek?.fullName || t('public.leaderboard.rank.notYet')}
                                        </div>
                                        <div className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{studentOfWeek?.xp || 0} XP</div>
                                    </div>
                                    <div className="rounded-2xl border border-edubot-line bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-muted">{t('public.leaderboard.metrics.nextRank')}</div>
                                        <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                            {snapshot.nextTargetEntry?.fullName || t('public.leaderboard.rank.pending')}
                                        </div>
                                        <div className="mt-1 text-sm text-edubot-muted dark:text-slate-400">{targetGapValue}</div>
                                    </div>
                                </div>
                            )}
                        </DashboardInsetPanel>

                        <DashboardInsetPanel
                            title={t('public.leaderboard.improvement.title')}
                            description={t('public.leaderboard.improvement.description')}
                        >
                            <div className="space-y-3 text-sm text-edubot-muted dark:text-slate-400">
                                <p>{t('public.leaderboard.improvement.pointLessons')}</p>
                                <p>{t('public.leaderboard.improvement.pointTracks')}</p>
                                <p>{publicMode ? t('public.leaderboard.improvement.publicPoint') : t('public.leaderboard.improvement.studentPoint')}</p>
                                {publicMode ? (
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Link to="/courses" className="inline-flex rounded-2xl border border-edubot-line bg-white px-4 py-2 font-semibold text-edubot-ink transition hover:border-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                            {t('public.courses.title')}
                                        </Link>
                                        <Link to="/login" className="inline-flex rounded-2xl bg-edubot-orange px-4 py-2 font-semibold text-white transition hover:bg-edubot-orange/90">
                                            {t('common.login')}
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </DashboardInsetPanel>
                    </div>
                </section>

                {loadError ? (
                    <div className={panelClassName(embedded)} role="alert">
                        <p className={eyebrowClassName(embedded)}>{t('public.leaderboard.errors.loadTitle')}</p>
                        <p className="mt-1 text-sm">{t(loadError)}</p>
                    </div>
                ) : null}

                {hasLeaderboardServiceIssue ? (
                    <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100" role="status">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">{t('public.leaderboard.fallbackTitle')}</p>
                                <p className="mt-1 text-sm">
                                    {t('public.leaderboard.serviceIssueBody')}
                                </p>
                            </div>
                            <p className="text-xs font-medium text-amber-700/80 dark:text-amber-200/80">{serviceIssueMessage}</p>
                        </div>
                    </div>
                ) : null}

                {emptyWeeklyBoard ? (
                    <div className={panelClassName(embedded)} role="status">
                        <p className={eyebrowClassName(embedded)}>{t('public.leaderboard.emptyBoardTitle')}</p>
                        <p className="mt-1 text-sm">
                            {t('public.leaderboard.emptyBoardBody')}
                        </p>
                    </div>
                ) : null}

                    <div className="grid max-w-full min-w-0 gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
                        <div className="min-w-0 space-y-4">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-edubot-orange">{t('public.leaderboard.weeklyView.eyebrow')}</p>
                                <h2 className="mt-2 text-2xl font-semibold text-edubot-ink dark:text-white sm:text-3xl">
                                    {t('public.leaderboard.weeklyView.title')}
                                </h2>
                                <p className="mt-2 max-w-3xl text-sm text-edubot-muted dark:text-slate-400 sm:text-base">
                                    {t('public.leaderboard.weeklyView.description')}
                                    {mySummary?.rankDelta
                                        ? ` ${t('public.leaderboard.weeklyView.currentChange', {
                                            value: `${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta}`,
                                        })}`
                                        : ''}
                                </p>
                            </div>
                            {renderTrackSwitcher()}
                        </div>
                    <div className="grid w-full max-w-full min-w-0 grid-cols-2 gap-2 rounded-3xl border border-edubot-line bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex sm:flex-wrap xl:w-auto xl:rounded-full" role="tablist" aria-label={t('public.leaderboard.tabListLabel')}>
                        {visibleTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`leaderboard-panel-${tab.id}`}
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
                    <div id={`leaderboard-panel-${activeTab}`} role="tabpanel">
                        {renderContent()}
                    </div>
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

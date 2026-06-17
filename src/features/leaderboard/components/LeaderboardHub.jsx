import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { SmoothTabTransition } from '@components/ui';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import {
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
    LeaderboardList,
    MySkillProgressGrid,
    NearYouStrip,
    PublicJoinPanel,
    SkillSpotlightGrid,
    StudentOfWeekCard,
    YourPositionBanner,
} from './LeaderboardExperience';
import { buildLeaderboardSnapshot } from './leaderboardSnapshot';

const trackIds = ['all', 'video', 'live'];
const asArray = (v) => (Array.isArray(v) ? v : []);

const LeaderboardHub = ({
    embedded = false,
    initialTrack = 'all',
    lockTrack = false,
    publicMode = false,
}) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState('rankings');
    const [track, setTrack] = useState(initialTrack);

    const [weekly, setWeekly] = useState({ items: [], total: 0, page: 1, limit: 10 });
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
    const normalizedSkillQuery = useMemo(
        () => String(skillQuery || '').trim().toLowerCase(),
        [skillQuery]
    );

    const canLoadPersonalizedData = Boolean(user) && !publicMode;
    const shouldLoadSkillData = !publicMode;

    const tabs = useMemo(
        () =>
            [
                { id: 'rankings', label: t('public.leaderboard.tabs.rankings') },
                { id: 'skills', label: t('public.leaderboard.tabs.skills') },
            ].filter((tab) => publicMode ? tab.id === 'rankings' : true),
        [t, publicMode]
    );

    const trackOptions = useMemo(
        () =>
            trackIds.map((value) => ({
                value,
                label: t(`public.leaderboard.tracks.${value}.label`),
                helper: t(`public.leaderboard.tracks.${value}.helper`),
            })),
        [t]
    );

    const trackMeta = useMemo(
        () => trackOptions.find((o) => o.value === track) || trackOptions[0],
        [track, trackOptions]
    );

    const publicTrustPoints = useMemo(
        () => asArray(t('public.leaderboard.publicTrustPoints', { returnObjects: true })),
        [t]
    );

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
                    .filter((s) => s.slug || s.id)
                    .map((s) => ({ slug: s.slug || String(s.id), label: s.name || s.slug || String(s.id) }))
                : [];
            setSkillBoards(mapped);
        } catch {
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
                const [weeklyRes, sowRes, mySummaryRes, nearMeRes, achievementsRes, challengesRes, mySkillProgressRes] =
                    await Promise.all([
                        fetchWeeklyLeaderboard({ page: 1, limit: 10, track }),
                        fetchStudentOfWeek({ track }),
                        canLoadPersonalizedData ? fetchMyLeaderboardSummary({ window: 'weekly', track }) : Promise.resolve(null),
                        canLoadPersonalizedData ? fetchNearMeLeaderboard({ limit: 5, window: 'weekly', track }) : Promise.resolve(null),
                        canLoadPersonalizedData ? fetchLeaderboardAchievements({ window: 'weekly', track }) : Promise.resolve({ items: [] }),
                        canLoadPersonalizedData ? fetchLeaderboardChallenges({ window: 'weekly', track }) : Promise.resolve({ items: [] }),
                        canLoadPersonalizedData ? fetchMySkillProgress().catch(() => []) : Promise.resolve([]),
                    ]);
                if (cancelled) return;
                setWeekly(weeklyRes || { items: [], total: 0, page: 1, limit: 10 });
                setStudentOfWeek(sowRes || null);
                setMySummary(mySummaryRes || null);
                setNearMe(nearMeRes || null);
                setBackendAchievements(achievementsRes || null);
                setBackendChallenges(challengesRes || null);
                setMySkillProgress(Array.isArray(mySkillProgressRes) ? mySkillProgressRes : []);
            } catch {
                if (!cancelled) setLoadError('public.leaderboard.errors.load');
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

        return () => { cancelled = true; };
    }, [canLoadPersonalizedData, publicMode, refreshSkillCatalog, shouldLoadSkillData, track]);

    useEffect(() => {
        if (!shouldLoadSkillData) return;
        loadSkillLeaderboards(skillBoards);
    }, [skillBoards, loadSkillLeaderboards, shouldLoadSkillData]);

    const weeklyItems = useMemo(
        () => (Array.isArray(weekly?.items) ? weekly.items : []),
        [weekly?.items]
    );

    const currentUserEntry = useMemo(
        () => weeklyItems.find((item) => Number(item?.studentId) === Number(user?.id)) || null,
        [weeklyItems, user]
    );

    const snapshot = useMemo(() => {
        const fallback = buildLeaderboardSnapshot({
            items: weeklyItems,
            user,
            xp: currentUserEntry?.xp || 0,
            streakDays: currentUserEntry?.streakDays || 0,
            label: t('public.leaderboard.snapshotLabel', { track: trackMeta.label }),
            t,
        });

        if (!mySummary) {
            return { ...fallback, nearYou: Array.isArray(nearMe?.items) ? nearMe.items : fallback.nearYou };
        }

        return {
            ...fallback,
            rank: mySummary.rank ?? fallback.rank,
            percentile: mySummary.percentile ?? fallback.percentile,
            targetGap: mySummary?.nextTarget?.xpGap ?? fallback.targetGap,
            nextTargetEntry: mySummary?.nextTarget
                ? { fullName: mySummary.nextTarget.label || `#${mySummary.nextTarget.rank || ''}`, xp: mySummary.nextTarget.xp || null }
                : fallback.nextTargetEntry,
            nearYou: Array.isArray(nearMe?.items) ? nearMe.items : fallback.nearYou,
            momentum: [
                mySummary.rankDelta ? t('public.leaderboard.rankDelta', { value: `${mySummary.rankDelta > 0 ? '+' : ''}${mySummary.rankDelta}` }) : fallback.momentum?.[0],
                mySummary.strongestSkill?.name ? t('public.leaderboard.strongestSkill', { name: mySummary.strongestSkill.name }) : fallback.momentum?.[1],
                fallback.momentum?.[2],
            ].filter(Boolean),
        };
    }, [weeklyItems, user, currentUserEntry, mySummary, nearMe, trackMeta, t]);

    const currentXp = mySummary?.windowXp ?? mySummary?.xp ?? currentUserEntry?.xp ?? 0;
    const currentStreak = mySummary?.streakDays ?? currentUserEntry?.streakDays ?? 0;

    const skillBoardCards = useMemo(() => {
        const cards = skillBoards.map((b) => ({ ...b, items: skills[b.slug] || [] }));
        if (!normalizedSkillQuery) return cards;
        const matchIdx = cards.findIndex((b) => String(b.slug || '').toLowerCase() === normalizedSkillQuery);
        if (matchIdx <= 0) return cards;
        const [selected] = cards.splice(matchIdx, 1);
        return [selected, ...cards];
    }, [skillBoards, skills, normalizedSkillQuery]);

    const achievementItems = useMemo(() => {
        const items = Array.isArray(backendAchievements?.items) ? backendAchievements.items : [];
        const normalize = (item) => ({ ...item, title: item.title || item.name, description: item.description || t('public.leaderboard.achievements.growthDescription') });

        if (!items.length) {
            const winners = weeklyItems.slice(0, 3);
            const fallback = [];
            if (studentOfWeek?.fullName) {
                fallback.push({ id: 'sow', title: t('public.leaderboard.studentOfWeek'), description: t('public.leaderboard.achievements.studentOfWeekDescription', { name: studentOfWeek.fullName, xp: studentOfWeek.xp || 0 }), rarity: 'epic' });
            }
            winners.forEach((w, i) => {
                fallback.push({ id: `winner-${w.studentId || i}`, title: t('public.leaderboard.achievements.rankWinner', { rank: i + 1 }), description: t('public.leaderboard.achievements.rankWinnerDescription', { name: w.fullName || t('public.leaderboard.defaultStudent') }), rarity: i === 0 ? 'epic' : 'rare' });
            });
            if (snapshot.rank) {
                fallback.unshift({ id: 'me', title: t('public.leaderboard.rank.yourRank', { rank: snapshot.rank }), description: snapshot.targetGap ? t('public.leaderboard.achievements.nextRankGap', { xp: snapshot.targetGap }) : t('public.leaderboard.achievements.rankStable'), rarity: 'rare' });
            }
            return fallback.map(normalize);
        }
        return items.map(normalize);
    }, [backendAchievements, weeklyItems, studentOfWeek, snapshot, t]);

    const challengeItems = useMemo(() => {
        const items = Array.isArray(backendChallenges?.items) ? backendChallenges.items : [];
        return items.map((item) => ({ ...item, detail: item.detail || item.value || '' }));
    }, [backendChallenges]);

    const hasServiceIssue = Boolean(weekly?._fallback);
    const serviceIssueMessage = weekly?._fallbackMessage || t('public.leaderboard.errors.serviceUnavailable');

    // ── Track Switcher ────────────────────────────────────────────────────────
    const renderTrackSwitcher = () => {
        if (lockTrack) return null;
        return (
            <div
                className="inline-flex flex-wrap rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
                role="group"
                aria-label={t('public.leaderboard.trackSwitcherLabel')}
            >
                {trackOptions.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTrack(opt.value)}
                        aria-pressed={track === opt.value}
                        title={opt.helper}
                        className={[
                            'cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                            track === opt.value
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white',
                        ].join(' ')}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        );
    };

    // ── Status Messages ───────────────────────────────────────────────────────
    const renderAlerts = () => (
        <>
            {loadError && (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                    {t(loadError)}
                </div>
            )}
            {hasServiceIssue && (
                <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">{t('public.leaderboard.fallbackTitle')}</p>
                    <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-100">{serviceIssueMessage}</p>
                </div>
            )}
        </>
    );

    // ── Skills Tab Content ────────────────────────────────────────────────────
    const renderSkillsTab = () => {
        if (skillBoardsLoading) {
            return (
                <div className="flex min-h-[300px] items-center justify-center">
                    <Loader fullScreen={false} />
                </div>
            );
        }
        if (skillBoardsError) {
            return (
                <div role="status" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-orange-500">{t('public.leaderboard.skills.pendingTitle')}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(skillBoardsError)}</p>
                </div>
            );
        }
        const hasSkillData = skillBoardCards.length > 0 || mySkillProgress.length > 0;
        if (!hasSkillData) {
            return (
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-orange-500">{t('public.leaderboard.skills.pendingTitle')}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('public.leaderboard.skills.noExtraData')}</p>
                </div>
            );
        }
        return (
            <div className="space-y-6">
                <MySkillProgressGrid items={mySkillProgress.slice(0, 6)} embedded={embedded} />
                {skillBoardCards.length > 0 && (
                    <SkillSpotlightGrid
                        boards={skillBoardCards.slice(0, 4)}
                        personalProgress={mySkillProgress}
                        featuredSlug={normalizedSkillQuery}
                        embedded={embedded}
                    />
                )}
            </div>
        );
    };

    // ── Rankings Tab Content ──────────────────────────────────────────────────
    const renderRankingsTab = () => {
        const listTitle = publicMode
            ? t('public.leaderboard.overview.topThisWeek')
            : t('public.leaderboard.weekly.trackLeaders', { track: trackMeta.label });
        const listDescription = t('public.leaderboard.weekly.description', {
            helper: trackMeta.helper.toLowerCase(),
        });

        const listFooter =
            !embedded && !publicMode ? (
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span>{t('public.leaderboard.overview.footerSummary')}</span>
                    <Link
                        to="/leaderboard"
                        className="cursor-pointer font-semibold text-orange-500 hover:text-orange-600"
                    >
                        {t('public.leaderboard.overview.openDashboard')}
                    </Link>
                </div>
            ) : null;

        if (publicMode) {
            return (
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <LeaderboardList
                        title={listTitle}
                        description={listDescription}
                        items={weeklyItems}
                        currentUserId={null}
                        showPodium
                        embedded={embedded}
                    />
                    <div className="space-y-4">
                        <StudentOfWeekCard data={studentOfWeek} />
                        <PublicJoinPanel trustPoints={publicTrustPoints} />
                    </div>
                </div>
            );
        }

        const hasWinsData = achievementItems.length > 0 || challengeItems.length > 0;

        return (
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <LeaderboardList
                        title={listTitle}
                        description={listDescription}
                        items={weeklyItems}
                        currentUserId={user?.id}
                        showPodium={!embedded}
                        embedded={embedded}
                        footer={listFooter}
                    />
                    {snapshot.nearYou?.length > 0 && (
                        <NearYouStrip
                            items={snapshot.nearYou}
                            currentUserId={user?.id}
                            targetGap={snapshot.targetGap}
                            nextTargetName={snapshot.nextTargetEntry?.fullName || ''}
                            embedded={embedded}
                        />
                    )}
                </div>
                {!embedded && hasWinsData && (
                    <div className="space-y-6">
                        <AchievementCloud
                            items={achievementItems.slice(0, 4)}
                            title={t('public.leaderboard.achievements.title')}
                            subtitle={t('public.leaderboard.embedded.achievementsSubtitle')}
                        />
                        {challengeItems.length > 0 && (
                            <ChallengeRail items={challengeItems} />
                        )}
                    </div>
                )}
            </div>
        );
    };

    // ── Embedded view (student dashboard tab) ─────────────────────────────────
    if (embedded && !publicMode) {
        return (
            <div className="space-y-6">
                <YourPositionBanner
                    rank={snapshot.rank}
                    xp={currentXp}
                    streak={currentStreak}
                    delta={mySummary?.rankDelta}
                    targetGap={snapshot.targetGap}
                    nextTargetName={snapshot.nextTargetEntry?.fullName || ''}
                    percentile={snapshot.percentile}
                    embedded
                />

                {renderTrackSwitcher()}
                {renderAlerts()}

                {loading ? (
                    <div className="flex min-h-[320px] items-center justify-center">
                        <Loader fullScreen={false} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <LeaderboardList
                            title={t('public.leaderboard.embedded.weeklyBoardTitle')}
                            description={t('public.leaderboard.embedded.weeklyBoardDescription')}
                            items={weeklyItems}
                            currentUserId={user?.id}
                            showPodium={false}
                            embedded
                        />
                        {snapshot.nearYou?.length > 0 && (
                            <NearYouStrip
                                items={snapshot.nearYou}
                                currentUserId={user?.id}
                                targetGap={snapshot.targetGap}
                                nextTargetName={snapshot.nextTargetEntry?.fullName || ''}
                                embedded
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ── Full page view ────────────────────────────────────────────────────────
    return (
        <div
            className={
                embedded
                    ? 'w-full max-w-full overflow-x-hidden'
                    : 'min-h-screen w-full overflow-x-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_16%,#f8fafc_100%)] px-4 py-10 text-slate-900 dark:bg-[linear-gradient(180deg,#0b1120_0%,#1a1f2e_16%,#1e293b_100%)] dark:text-white md:px-8 xl:px-10'
            }
        >
            <div className={embedded ? 'w-full space-y-6' : 'mx-auto w-full max-w-7xl space-y-6'}>

                {/* Header */}
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                            {publicMode
                                ? t('public.leaderboard.header.publicEyebrow')
                                : t('public.leaderboard.header.studentEyebrow')}
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                            {publicMode
                                ? t('public.leaderboard.header.publicTitle')
                                : t('public.leaderboard.header.studentTitle')}
                        </h1>
                    </div>

                    {/* Your Position Banner (authenticated only) */}
                    {!publicMode && (
                        <YourPositionBanner
                            rank={snapshot.rank}
                            xp={currentXp}
                            streak={currentStreak}
                            delta={mySummary?.rankDelta}
                            targetGap={snapshot.targetGap}
                            nextTargetName={snapshot.nextTargetEntry?.fullName || ''}
                            percentile={snapshot.percentile}
                        />
                    )}

                    {/* Controls row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {renderTrackSwitcher()}

                        {/* Tabs (hidden for public since there's only one) */}
                        {!publicMode && tabs.length > 1 && (
                            <div
                                className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
                                role="tablist"
                                aria-label={t('public.leaderboard.tabListLabel')}
                            >
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab.id}
                                        aria-controls={`leaderboard-panel-${tab.id}`}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={[
                                            'cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                                            activeTab === tab.id
                                                ? 'bg-orange-500 text-white'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white',
                                        ].join(' ')}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {renderAlerts()}

                {/* Tab content */}
                <SmoothTabTransition isLoading={loading} isDataLoaded>
                    <div
                        id={`leaderboard-panel-${activeTab}`}
                        role="tabpanel"
                        tabIndex={0}
                        aria-labelledby={`leaderboard-tab-${activeTab}`}
                    >
                        {loading ? (
                            <div className="flex min-h-[480px] items-center justify-center">
                                <Loader fullScreen={false} />
                            </div>
                        ) : activeTab === 'skills' ? (
                            renderSkillsTab()
                        ) : (
                            renderRankingsTab()
                        )}
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

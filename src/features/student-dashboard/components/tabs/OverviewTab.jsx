import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import {
    buildLeaderboardSnapshot,
    LeaderboardListCard,
    ChallengeRail,
    AchievementCloud,
} from '../../../../features/leaderboard/components/LeaderboardExperience';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '../../../../components/ui/dashboard';
import StudentHeroPill from '../shared/StudentHeroPill.jsx';
import StudentMiniStat from '../shared/StudentMiniStat.jsx';
import {
    resolveCourseType,
    isOnlineLiveOffering,
    isStudentJoinWindowOpen,
    courseTypeLabel,
    formatCountdown,
    formatSessionDate,
    resolveInstructorName,
} from '../../utils/studentDashboard.helpers.js';
import {
    FiActivity,
    FiAlertCircle,
    FiArrowRight,
    FiAward,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiFlag,
    FiPlay,
    FiTrendingUp,
    FiUsers,
    FiZap,
} from 'react-icons/fi';

const OverviewTab = ({
    student,
    summary,
    courses,
    offerings,
    tasks,
    attendanceStats,
    attendanceEnabled,
    engagement,
    leaderboardItems,
    leaderboardMeta,
    milestoneItems,
    badgeItems,
    progressItems,
    onEnrollCourse,
    enrollingCourseId,
}) => {
    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const upcoming = useMemo(
        () =>
            offerings
                .filter((item) => item.startAt && new Date(item.startAt).getTime() >= nowMs)
                .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                .slice(0, 4),
        [offerings, nowMs]
    );

    const pendingHomework = useMemo(
        () =>
            tasks
                .filter((task) => {
                    const status = String(task.submissionStatus || task.status || '').toLowerCase();
                    return status !== 'completed' && status !== 'approved' && status !== 'submitted';
                })
                .slice(0, 4),
        [tasks]
    );

    const recommendedCourse = useMemo(() => {
        const progressMap = new Map(
            (progressItems || []).map((item) => [String(item.courseId || item.courseTitle), item])
        );

        return (
            courses
                .map((course) => {
                    const key = String(course.id ?? course.courseId ?? course.title ?? '');
                    const progressItem = progressMap.get(key);
                    const progressPercent =
                        progressItem?.progressPercent ??
                        Math.max(
                            0,
                            Math.min(100, Math.round(Number(course.progressPercent ?? course.progress ?? 0)))
                        );

                    return {
                        ...course,
                        progressPercent,
                        progressItem,
                    };
                })
                .sort((a, b) => (a.progressPercent || 0) - (b.progressPercent || 0))[0] || null
        );
    }, [courses, progressItems]);

    const leaderboardSnapshot = useMemo(
        () =>
            buildLeaderboardSnapshot({
                items: leaderboardItems,
                user: { id: student.id, fullName: student.name },
                xp: engagement?.xp || 0,
                streakDays: engagement?.streak || 0,
                badges: badgeItems,
                label: 'Dashboard',
            }),
        [leaderboardItems, student, engagement, badgeItems]
    );

    const hasLeaderboardPreviewIssue = Boolean(leaderboardMeta?.fallback);
    const emptyLeaderboardPreview = !hasLeaderboardPreviewIssue && !(leaderboardItems || []).length;

    const leaderboardChallenges = useMemo(
        () => [
            {
                id: 'overview-rank',
                title: leaderboardSnapshot.rank
                    ? `#${leaderboardSnapshot.rank} орунду бекемдөө`
                    : 'Алгачкы рейтингге чыгуу',
                detail: leaderboardSnapshot.targetGap
                    ? `Дагы ${leaderboardSnapshot.targetGap} XP кийинки тепкичке жеткирет.`
                    : '1 сабак жана 1 тапшырма сизди таблицага алып кирет.',
            },
            {
                id: 'overview-streak',
                title: `${engagement?.streak || 0} күндүк серияны сактоо`,
                detail: 'Эртең дагы кирсеңиз, туруктуулук сигналы күчөйт.',
            },
            {
                id: 'overview-homework',
                title: 'Ачык тапшырманы жабуу',
                detail: pendingHomework.length
                    ? `${pendingHomework.length} тапшырма күтүп турат.`
                    : 'Азырынча тапшырма жок, темп жакшы.',
            },
        ],
        [leaderboardSnapshot, engagement?.streak, pendingHomework.length]
    );

    const activeCourses =
        Number(summary?.stats?.activeCourses || 0) || Number(courses.length || 0) || 0;
    const lessonsCompleted =
        Number(summary?.stats?.lessonsCompleted || 0) ||
        progressItems.reduce((acc, item) => acc + Number(item.lessonsCompleted || 0), 0);
    const weeklyTime = summary?.stats?.timeThisWeek || '—';
    const welcomeName = student.name?.split(' ')[0] || 'Студент';

    return (
        <div className="space-y-6">
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow="Student Overview"
                    title={`Кош келиңиз, ${welcomeName}!`}
                    description="Негизги окуу абалы, жакынкы сабактар жана тез аракеттер ушул бетке топтолду."
                    metrics={
                        <>
                            <DashboardMetricCard
                                label="Активдүү курстар"
                                value={activeCourses}
                                icon={FiBookOpen}
                            />
                            <DashboardMetricCard
                                label="Бүткөн сабак"
                                value={lessonsCompleted}
                                icon={FiCheckCircle}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label="Күтүп турган"
                                value={pendingHomework.length}
                                icon={FiClock}
                                tone="amber"
                            />
                            <DashboardMetricCard
                                label="XP"
                                value={engagement?.xp || 0}
                                icon={FiZap}
                            />
                        </>
                    }
                />

                <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1.4fr),minmax(0,0.6fr)]">
                    <div className="rounded-panel bg-edubot-hero p-6 text-white shadow-edubot-glow">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="dashboard-pill">Daily Snapshot</p>
                                <h3 className="mt-4 text-2xl font-semibold">
                                    Окуу ритмиңиз жакшы жүрүп жатат
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-white/80">
                                    Бул жумада{' '}
                                    <span className="font-semibold text-white">{weeklyTime}</span>{' '}
                                    окуу убактысы топтолду. Азыркы серияңыз{' '}
                                    <span className="font-semibold text-white">
                                        {engagement?.streak || 0} күн
                                    </span>
                                    , ал эми деңгээлиңиз{' '}
                                    <span className="font-semibold text-white">
                                        {engagement?.level || 1}
                                    </span>
                                    .
                                </p>
                                {student.lastLesson ? (
                                    <p className="mt-4 text-sm text-white/75">
                                        Акыркы сабак:{' '}
                                        <span className="font-semibold text-white">
                                            {student.lastLesson.lesson}
                                        </span>{' '}
                                        · {student.lastLesson.course}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:w-[22rem] lg:grid-cols-1">
                                <StudentHeroPill label="Катышуу" value={attendanceEnabled ? `${attendanceStats?.rate || 0}%` : 'Off'} />
                                <StudentHeroPill label="Badge" value={badgeItems.length} />
                                <StudentHeroPill
                                    label="Рейтинг"
                                    value={
                                        leaderboardSnapshot.rank
                                            ? `#${leaderboardSnapshot.rank}`
                                            : 'Tracked'
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <DashboardInsetPanel
                        title="Азыркы фокус"
                        description="Кайсы курска азыр кайрылуу керек."
                    >
                        {recommendedCourse ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-semibold text-edubot-ink dark:text-white">
                                        {recommendedCourse.title || recommendedCourse.courseTitle}
                                    </p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        Прогресс: {recommendedCourse.progressPercent || 0}%
                                    </p>
                                </div>

                                <div className="h-3 rounded-full bg-edubot-surfaceAlt dark:bg-slate-800">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-edubot-orange to-edubot-soft"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(0, recommendedCourse.progressPercent || 0)
                                            )}%`,
                                        }}
                                    />
                                </div>

                                {recommendedCourse.id || recommendedCourse.courseId ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEnrollCourse?.(
                                                recommendedCourse.id || recommendedCourse.courseId
                                            )
                                        }
                                        disabled={Boolean(enrollingCourseId)}
                                        className="dashboard-button-primary w-full"
                                    >
                                        <FiArrowRight className="h-4 w-4" />
                                        {enrollingCourseId ===
                                        (recommendedCourse.id || recommendedCourse.courseId)
                                            ? 'Иштелүүдө...'
                                            : 'Курска өтүү'}
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="text-sm text-edubot-muted dark:text-slate-400">
                                Азырынча курс маалыматтары жетиштүү эмес.
                            </div>
                        )}
                    </DashboardInsetPanel>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                <div className="space-y-4">
                    <section className="dashboard-panel overflow-hidden">
                        <DashboardSectionHeader
                            eyebrow="Upcoming Sessions"
                            title="Жакынкы сабактар"
                            description="Кийинки сессиялар, join терезеси жана окуу контексти."
                            metricsClassName="grid grid-cols-2 gap-3 sm:grid-cols-2"
                            metrics={
                                <>
                                    <DashboardMetricCard
                                        label="Жакынкы сессия"
                                        value={upcoming.length}
                                        icon={FiCalendar}
                                        tone="blue"
                                    />
                                    <DashboardMetricCard
                                        label="Live курстар"
                                        value={
                                            upcoming.filter((item) =>
                                                isOnlineLiveOffering(item)
                                            ).length
                                        }
                                        icon={FiUsers}
                                    />
                                </>
                            }
                        />

                        <div className="space-y-3 p-6">
                            {upcoming.length ? (
                                upcoming.map((item) => {
                                    const type = resolveCourseType(item);
                                    const joinUrl =
                                        item.joinLink || item.link || item.joinUrl || '';
                                    const joinAllowed =
                                        !isOnlineLiveOffering(item) ||
                                        isStudentJoinWindowOpen(item, nowMs);
                                    const countdown = item.startAt
                                        ? formatCountdown(new Date(item.startAt).getTime(), nowMs)
                                        : null;

                                    return (
                                        <div
                                            key={item.id || `${item.courseId}-${item.startAt}`}
                                            className="dashboard-panel-muted p-4"
                                        >
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                                            {item.courseTitle ||
                                                                item.course?.title ||
                                                                'Сабак'}
                                                        </p>
                                                        <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                                            {courseTypeLabel(type)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                        {formatSessionDate(item.startAt)}
                                                    </p>
                                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                        {resolveInstructorName(item)}
                                                        {type === 'offline'
                                                            ? ` · ${
                                                                  item.location ||
                                                                  item.room ||
                                                                  'Класс али дайындала элек'
                                                              }`
                                                            : ''}
                                                    </p>
                                                </div>

                                                <div className="lg:w-[18rem]">
                                                    {type === 'online_live' ? (
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-400">
                                                                Башталышына
                                                            </div>
                                                            <div className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                                {countdown}
                                                            </div>
                                                            {joinUrl && joinAllowed ? (
                                                                <a
                                                                    href={joinUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="dashboard-button-primary w-full"
                                                                >
                                                                    Кошулуу
                                                                </a>
                                                            ) : (
                                                                <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                                                    <FiAlertCircle className="h-4 w-4" />
                                                                    Кошулуу 10 мүнөт калганда ачылат
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                            Offline сессия. Жайгашкан жерди алдын ала текшериңиз.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="dashboard-panel-muted p-8 text-center text-sm text-edubot-muted dark:text-slate-400">
                                    Жакынкы сабактар азырынча жок.
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <DashboardInsetPanel
                            title="Ачык тапшырмалар"
                            description="Жакын арада жабуу керек болгон иштер."
                        >
                            <div className="space-y-3">
                                {pendingHomework.length ? (
                                    pendingHomework.map((task, index) => (
                                        <div
                                            key={task.id || task.taskId || index}
                                            className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <p className="font-medium text-edubot-ink dark:text-white">
                                                {task.title || 'Тапшырма'}
                                            </p>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {task.courseTitle || task.course || 'Курс көрсөтүлгөн эмес'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                        Азырынча ачык тапшырма жок.
                                    </div>
                                )}
                            </div>
                        </DashboardInsetPanel>

                        <DashboardInsetPanel
                            title="Milestone"
                            description="Кыска мөөнөттөгү окуу чекиттери."
                        >
                            <div className="space-y-3">
                                {milestoneItems.length ? (
                                    milestoneItems.slice(0, 3).map((item) => (
                                        <div
                                            key={item.id || item.title}
                                            className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange dark:bg-slate-800 dark:text-edubot-soft">
                                                    <FiFlag className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-edubot-ink dark:text-white">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                        {item.value}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                        Milestone табылган жок.
                                    </div>
                                )}
                            </div>
                        </DashboardInsetPanel>
                    </div>

                    <NotificationsWidget />
                </div>

                <div className="space-y-4">
                    <DashboardInsetPanel
                        title="XP & Level"
                        description="Азыркы энергия жана кийинки тепкич."
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-2xl font-bold text-edubot-orange">
                                        {engagement?.xp || 0} XP
                                    </p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        Деңгээл {engagement?.level || 1}
                                        {leaderboardSnapshot.rank
                                            ? ` · #${leaderboardSnapshot.rank} орун`
                                            : ''}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-edubot-surface px-3 py-2 text-right dark:bg-slate-900">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-edubot-muted dark:text-slate-400">
                                        Next push
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {leaderboardSnapshot.targetGap
                                            ? `${leaderboardSnapshot.targetGap} XP`
                                            : 'Баштаңыз'}
                                    </p>
                                </div>
                            </div>
                            <div className="h-2 rounded-full bg-edubot-surfaceAlt dark:bg-slate-800">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-edubot-orange to-edubot-soft"
                                    style={{
                                        width: `${Math.round(
                                            ((engagement?.currentLevelXp || 0) /
                                                Math.max(1, engagement?.nextLevelGap || 1)) *
                                                100
                                        )}%`,
                                    }}
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <StudentMiniStat
                                    label="Серия"
                                    value={`${engagement?.streak || 0} күн`}
                                    tone="amber"
                                />
                                <StudentMiniStat
                                    label="Катышуу"
                                    value={attendanceEnabled ? `${attendanceStats?.rate || 0}%` : 'Off'}
                                    tone={attendanceEnabled && attendanceStats?.rate >= 85 ? 'green' : 'default'}
                                />
                            </div>
                        </div>
                    </DashboardInsetPanel>

                    <div className="space-y-3">
                        {hasLeaderboardPreviewIssue ? (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                                <p className="font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
                                    Рейтинг эскертүүсү
                                </p>
                                <p className="mt-1">
                                    Азыр кыска preview үчүн чыныгы рейтинг алынган жок. Жасалма
                                    студенттер көрсөтүлгөн жок.
                                </p>
                                {leaderboardMeta?.message ? (
                                    <p className="mt-2 text-xs opacity-80">{leaderboardMeta.message}</p>
                                ) : null}
                            </div>
                        ) : null}

                        {emptyLeaderboardPreview ? (
                            <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-[#222222] dark:text-slate-300">
                                Бул кыска preview үчүн азырынча рейтинг маалыматтары толо элек.
                            </div>
                        ) : null}

                        <LeaderboardListCard
                            title="Сизге жакын рейтинг"
                            description="Сизге реалдуу жакын орундар."
                            items={leaderboardSnapshot.nearYou}
                            currentUserId={student.id}
                            embedded
                        />
                    </div>

                    <ChallengeRail items={leaderboardChallenges} embedded />

                    <AchievementCloud
                        items={badgeItems}
                        title="Жетишкендиктер"
                        subtitle="Ачылган badge’дерди бөлүшүү же сактап калуу."
                        embedded
                        shareMeta={{
                            displayName: student.name,
                            rank: leaderboardSnapshot.rank || null,
                            xp: engagement?.xp || null,
                            streakDays: engagement?.streak || null,
                            trackLabel: 'Dashboard',
                        }}
                    />

                    <DashboardInsetPanel
                        title="Тез абал"
                        description="Кыскача окуу ден соолугу."
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <StudentMiniStat label="Курстар" value={courses.length} tone="blue" />
                            <StudentMiniStat label="Сабактар" value={lessonsCompleted} tone="green" />
                            <StudentMiniStat label="Upcoming" value={upcoming.length} tone="default" />
                            <StudentMiniStat label="Badge" value={badgeItems.length} tone="amber" />
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>
        </div>
    );
};

OverviewTab.propTypes = {
    student: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
        streak: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        lastLesson: PropTypes.shape({
            lesson: PropTypes.string,
            course: PropTypes.string,
        }),
    }).isRequired,
    summary: PropTypes.object,
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    offerings: PropTypes.arrayOf(PropTypes.object).isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
        totalSessions: PropTypes.number,
        present: PropTypes.number,
        absent: PropTypes.number,
    }).isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    engagement: PropTypes.shape({
        xp: PropTypes.number,
        streak: PropTypes.number,
        level: PropTypes.number,
        currentLevelXp: PropTypes.number,
        nextLevelGap: PropTypes.number,
    }).isRequired,
    leaderboardItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    leaderboardMeta: PropTypes.shape({
        fallback: PropTypes.bool,
        message: PropTypes.string,
    }),
    milestoneItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    badgeItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    progressItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    onEnrollCourse: PropTypes.func,
    enrollingCourseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

OverviewTab.defaultProps = {
    summary: null,
    leaderboardMeta: undefined,
    onEnrollCourse: undefined,
    enrollingCourseId: null,
};

export default OverviewTab;

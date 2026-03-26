import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import {
    buildLeaderboardSnapshot,
    LeaderboardListCard,
    ChallengeRail,
    AchievementCloud,
} from '../../../../features/leaderboard/components/LeaderboardExperience';
import StudentStatCard from '../shared/StudentStatCard.jsx';
import {
    resolveCourseType,
    isOnlineLiveOffering,
    isStudentJoinWindowOpen,
    courseTypeLabel,
    formatCountdown,
    formatSessionDate,
    resolveInstructorName,
} from '../../utils/studentDashboard.helpers.js';

const OverviewTab = ({
    student,
    stats,
    offerings,
    tasks,
    announcements,
    attendanceStats,
    attendanceEnabled,
    engagement,
    leaderboardItems,
    leaderboardMeta,
    badgeItems,
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
        () => tasks.filter((task) => task.status !== 'completed').slice(0, 4),
        [tasks]
    );
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
                    : '1 сабак жана 1 тест сизди таблицага алып кирет.',
            },
            {
                id: 'overview-streak',
                title: `${engagement?.streak || 0} күндүк серияны сактоо`,
                detail: 'Эртең дагы кирсеңиз, туруктуулук сигналы күчөйт.',
            },
            {
                id: 'overview-homework',
                title: 'Ачык тапшырманы жабуу',
                detail: pendingHomework?.length
                    ? `${pendingHomework.length} тапшырма күтүп турат.`
                    : 'Азырынча тапшырма жок, ушул темпти сактаңыз.',
            },
        ],
        [leaderboardSnapshot, engagement?.streak, pendingHomework?.length]
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
                <div className="bg-gradient-to-r from-edubot-orange to-edubot-soft text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-edubot-orange/20">
                    <p className="text-sm uppercase tracking-wide opacity-80">
                        Streak: {engagement?.streak || 0} күн
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                        Кош келиңиз, {student.name.split(' ')[0]}!
                    </h2>
                    {student.lastLesson && (
                        <p className="mt-3 text-sm sm:text-base opacity-90">
                            Акыркы сабак: <strong>{student.lastLesson.lesson}</strong> (
                            {student.lastLesson.course})
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StudentStatCard label="Активдүү курстар" value={stats?.activeCourses || 0} />
                    <StudentStatCard label="Жалпы сабактар" value={stats?.lessonsCompleted || 0} />
                    <StudentStatCard label="Күтүүдө тапшырма" value={pendingHomework?.length || 0} />
                    {attendanceEnabled ? (
                        <StudentStatCard label="Катышуу" value={`${attendanceStats?.rate || 0}%`} />
                    ) : null}
                </div>

                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Жакынкы сабактар
                        </h3>
                        <span className="text-xs text-gray-500">{(upcoming || []).length} даана</span>
                    </div>
                    <div className="space-y-2">
                        {(upcoming || []).map((item) => {
                            const type = resolveCourseType(item);
                            const joinUrl = item.joinLink || item.link || item.joinUrl || '';
                            const joinAllowed =
                                !isOnlineLiveOffering(item) || isStudentJoinWindowOpen(item, nowMs);
                            const countdown = item.startAt
                                ? formatCountdown(new Date(item.startAt).getTime(), nowMs)
                                : null;
                            return (
                                <div
                                    key={item.id || `${item.courseId}-${item.startAt}`}
                                    className="rounded-2xl border border-gray-100 dark:border-gray-700 p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                            {item.courseTitle || item.course?.title || 'Сабак'}
                                        </p>
                                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                            {courseTypeLabel(type)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatSessionDate(item.startAt)}
                                    </p>
                                    {type === 'offline' && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {item.location || item.room || 'Класс али дайындала элек'} •{' '}
                                            {resolveInstructorName(item)}
                                        </p>
                                    )}
                                    {type === 'online_live' && (
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-blue-700 dark:text-blue-300">
                                                Калган убакыт: {countdown}
                                            </span>
                                            {joinUrl && joinAllowed ? (
                                                <a
                                                    href={joinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 rounded-full text-xs bg-blue-600 text-white"
                                                >
                                                    Кошулуу
                                                </a>
                                            ) : (
                                                <span className="text-xs text-amber-600">
                                                    Кошулуу 10 мүнөт калганда ачылат
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {!(upcoming || []).length && (
                            <p className="text-sm text-gray-500">Жакынкы класстар жок.</p>
                        )}
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Тапшырмалар
                        </h3>
                        {(pendingHomework || []).map((task) => (
                            <div
                                key={task.id || task.taskId}
                                className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                            >
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {task.title}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {task.courseTitle}
                                </p>
                            </div>
                        ))}
                        {(!pendingHomework || pendingHomework.length === 0) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Тапшырмалар жок.</p>
                        )}
                    </div>
                    <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            Жарыялар
                        </h3>
                        {(announcements || []).map((item) => (
                            <div
                                key={item.id || item.title}
                                className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                            >
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {item.body || item.message || 'Жаңы жаңылык'}
                                </p>
                            </div>
                        ))}
                        {!(announcements || []).length && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Жаңылыктар жок.</p>
                        )}
                    </div>
                </section>
                <NotificationsWidget />
            </div>

            <div className="space-y-4">
                <section className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">XP & Level</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{engagement?.xp || 0} XP</p>
                            <p className="text-sm text-gray-500">
                                Деңгэел {engagement?.level || 1}
                                {leaderboardSnapshot.rank ? ` · #${leaderboardSnapshot.rank} орун` : ''}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-blue-50 px-3 py-2 text-right dark:bg-blue-900/30">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Next push</p>
                            <p className="mt-1 text-sm font-semibold text-blue-700 dark:text-blue-200">
                                {leaderboardSnapshot.targetGap ? `${leaderboardSnapshot.targetGap} XP` : 'Баштаңыз'}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 mt-4">
                        <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                                width: `${Math.round(
                                    ((engagement?.currentLevelXp || 0) /
                                        Math.max(1, engagement?.nextLevelGap || 1)) *
                                    100
                                )}%`,
                            }}
                        />
                    </div>
                </section>

                <div className="space-y-3">
                    {hasLeaderboardPreviewIssue ? (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                            <p className="font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Рейтинг эскертүүсү</p>
                            <p className="mt-1">Азыр кыска preview үчүн чыныгы рейтинг алынган жок. Жасалма студенттер көрсөтүлгөн жок.</p>
                            {leaderboardMeta?.message ? <p className="mt-2 text-xs opacity-80">{leaderboardMeta.message}</p> : null}
                        </div>
                    ) : null}
                    {emptyLeaderboardPreview ? (
                        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-[#222222] dark:text-slate-300">
                            Бул кыска preview үчүн азырынча рейтинг маалыматтары толо элек.
                        </div>
                    ) : null}
                    <LeaderboardListCard
                        title="Сизге жакын рейтинг"
                        description="Жөн гана лидерлер эмес, сизге реалдуу жакын орундар да көрүнүшү керек."
                        items={leaderboardSnapshot.nearYou}
                        currentUserId={student.id}
                        embedded
                    />
                </div>

                <ChallengeRail items={leaderboardChallenges} embedded />

                <AchievementCloud
                    items={badgeItems}
                    title="Жетишкендиктерди бөлүшүү"
                    subtitle="Сиз ачкан жетишкендиктерди story, post же шилтеме катары бөлүшсөңүз болот."
                    embedded
                    shareMeta={{
                        displayName: student.name,
                        rank: leaderboardSnapshot.rank || null,
                        xp: engagement?.xp || null,
                        streakDays: engagement?.streak || null,
                        trackLabel: 'Dashboard',
                    }}
                />
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
    stats: PropTypes.shape({
        activeCourses: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        lessonsCompleted: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        timeThisWeek: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        pendingTasks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
    offerings: PropTypes.arrayOf(PropTypes.object).isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    announcements: PropTypes.arrayOf(PropTypes.object).isRequired,
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
    badgeItems: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default OverviewTab;

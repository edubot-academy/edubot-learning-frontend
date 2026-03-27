import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    FiActivity,
    FiAward,
    FiBarChart2,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronUp,
    FiFlag,
    FiPlay,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '../../../../components/ui/dashboard';
import StudentHeroPill from '../shared/StudentHeroPill.jsx';
import StudentMiniStat from '../shared/StudentMiniStat.jsx';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';

const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mins}:${secs}`;
};

const getProgressTone = (value) => {
    if (value >= 80) return 'green';
    if (value >= 40) return 'blue';
    return 'amber';
};

const getProgressLabel = (value) => {
    if (value >= 100) return 'Аяктады';
    if (value >= 80) return 'Финишке жакын';
    if (value >= 40) return 'Туруктуу жүрүүдө';
    return 'Көңүл буруу керек';
};

const getLessonKindLabel = (kind) => {
    if (kind === 'quiz') return 'Квиз';
    if (kind === 'article') return 'Макала';
    if (kind === 'code') return 'Код';
    return 'Видео';
};

const ProgressTab = ({
    items,
    attendanceStats,
    attendanceEnabled,
    engagement,
    leaderboardItems,
    leaderboardMeta,
    milestoneItems,
    badgeItems,
}) => {
    const [expandedCourseId, setExpandedCourseId] = useState('');

    if (!items.length) {
        return (
            <div className="space-y-6">
                <section className="dashboard-panel overflow-hidden">
                    <DashboardSectionHeader
                        eyebrow="Student Progress"
                        title="Прогресс жана сертификаттар"
                        description="Окуу темпи, жетишкендиктер жана кийинки кадамдар ушул жерде көрсөтүлөт."
                    />
                    <div className="p-6">
                        <StudentPanelEmpty
                            icon={FiTrendingUp}
                            title="Азырынча катталган курстар жок"
                            description="Курс кошулганда, бул жерден прогрессти, milestone жана сертификат абалын көрөсүз."
                        />
                    </div>
                </section>
            </div>
        );
    }

    const totalCourses = items.length;
    const averageProgress = Math.round(
        items.reduce((acc, item) => acc + Number(item.progressPercent || 0), 0) / totalCourses
    );
    const completedCourses = items.filter((item) => Number(item.progressPercent || 0) >= 100).length;
    const certificateCount = items.filter((item) => item.hasCertificate).length;
    const courseToFocus =
        items.find((item) => Number(item.progressPercent || 0) < 100) || items[0];
    const totalCompletedLessons = items.reduce((acc, item) => acc + Number(item.lessonsCompleted || 0), 0);
    const totalLessons = items.reduce((acc, item) => acc + Number(item.lessonsTotal || 0), 0);
    const leaderboardLabel =
        leaderboardMeta?.studentRank || leaderboardMeta?.rank
            ? `#${leaderboardMeta.studentRank || leaderboardMeta.rank}`
            : leaderboardItems.length
              ? `Top ${leaderboardItems.length}`
              : 'Tracked';

    return (
        <div className="space-y-6">
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow="Student Progress"
                    title="Прогресс жана сертификаттар"
                    description="Окуу траекторияңызды, туруктуулукту жана кайсы курска азыр көңүл буруу керек экенин тез көрүңүз."
                    metrics={
                        <>
                            <DashboardMetricCard label="Орточо прогресс" value={`${averageProgress}%`} icon={FiTrendingUp} tone={getProgressTone(averageProgress)} />
                            <DashboardMetricCard label="XP" value={engagement.xp} icon={FiZap} />
                            <DashboardMetricCard label="Серия" value={`${engagement.streak} күн`} icon={FiActivity} tone="amber" />
                            <DashboardMetricCard label="Сертификат" value={certificateCount} icon={FiAward} tone="green" />
                        </>
                    }
                />

                <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                    <div className="rounded-panel bg-edubot-hero p-6 text-white shadow-edubot-glow">
                        <p className="dashboard-pill">Learning Health</p>
                        <div className="mt-4 grid gap-5 lg:grid-cols-[auto,1fr] lg:items-center">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/10 text-center shadow-lg backdrop-blur-sm">
                                <div>
                                    <div className="text-3xl font-bold">{averageProgress}%</div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/70">
                                        overall
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-semibold">Негизги фокус</h3>
                                <p className="mt-2 text-sm leading-6 text-white/80">
                                    Азыр эң чоң өсүү мүмкүнчүлүгү{' '}
                                    <span className="font-semibold text-white">
                                        {courseToFocus.courseTitle}
                                    </span>{' '}
                                    курсунда. Бул жерде {courseToFocus.lessonsCompleted}/
                                    {courseToFocus.lessonsTotal || '—'} сабак бүтүп, жалпы прогресс{' '}
                                    {courseToFocus.progressPercent}% болуп турат.
                                </p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <StudentHeroPill label="Курстар" value={totalCourses} />
                                    <StudentHeroPill label="Бүткөн сабак" value={`${totalCompletedLessons}/${totalLessons || '—'}`} />
                                    <StudentHeroPill label="Рейтинг" value={leaderboardLabel} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <DashboardInsetPanel
                            title="Окуу импульсу"
                            description="Кыскача көрсөткүчтөр жана momentum."
                        >
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                <StudentMiniStat
                                    label="Бүткөн курстар"
                                    value={completedCourses}
                                    tone="green"
                                />
                                <StudentMiniStat
                                    label="Катышуу"
                                    value={
                                        attendanceEnabled ? `${attendanceStats.rate}%` : 'Эсептелбейт'
                                    }
                                    tone={attendanceEnabled && attendanceStats.rate >= 85 ? 'green' : 'amber'}
                                />
                                <StudentMiniStat
                                    label="Badge"
                                    value={badgeItems.length}
                                    tone="blue"
                                />
                                <StudentMiniStat
                                    label="Milestone"
                                    value={milestoneItems.length}
                                    tone="default"
                                />
                            </div>
                        </DashboardInsetPanel>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const itemKey = String(item.courseId || item.courseTitle || index);
                        const isExpanded =
                            expandedCourseId === itemKey || (!expandedCourseId && index === 0);
                        const progressTone = getProgressTone(item.progressPercent);
                        const remainingLessons = Math.max(
                            0,
                            Number(item.lessonsTotal || 0) - Number(item.lessonsCompleted || 0)
                        );

                        return (
                            <section key={itemKey} className="dashboard-panel overflow-hidden">
                                <div className="p-5">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange dark:bg-slate-800 dark:text-edubot-soft">
                                                    <FiBookOpen className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-xl font-semibold text-edubot-ink dark:text-white">
                                                        {item.courseTitle}
                                                    </h3>
                                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-300">
                                                        <span>{item.lessonsCompleted}/{item.lessonsTotal || '—'} сабак</span>
                                                        <span>{remainingLessons} калган</span>
                                                        <span>{getProgressLabel(item.progressPercent)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                    <span className="font-medium text-edubot-ink dark:text-white">
                                                        Прогресс
                                                    </span>
                                                    <span className="font-semibold text-edubot-orange">
                                                        {item.progressPercent}%
                                                    </span>
                                                </div>
                                                <div className="h-3 rounded-full bg-edubot-surfaceAlt dark:bg-slate-800">
                                                    <div
                                                        className={`h-3 rounded-full ${
                                                            progressTone === 'green'
                                                                ? 'bg-gradient-to-r from-emerald-500 to-edubot-green'
                                                                : progressTone === 'blue'
                                                                  ? 'bg-gradient-to-r from-edubot-teal to-sky-500'
                                                                  : 'bg-gradient-to-r from-edubot-orange to-edubot-soft'
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                Math.max(0, item.progressPercent)
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full xl:w-[22rem]">
                                            <DashboardInsetPanel
                                                title="Кийинки аракет"
                                                description={
                                                    item.resumeLesson
                                                        ? 'Акыркы токтогон жерден улантыңыз.'
                                                        : 'Курс кыймылын улантуу үчүн кийинки сабакты тандаңыз.'
                                                }
                                                action={
                                                    item.hasCertificate ? (
                                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                            Сертификат даяр
                                                        </span>
                                                    ) : null
                                                }
                                            >
                                                {item.resumeLesson ? (
                                                    <Link
                                                        to={
                                                            item.courseId
                                                                ? `/courses/${item.courseId}?resumeLessonId=${item.resumeLesson.lessonId || ''}${item.resumeLesson.lastVideoTime ? `&resumeTime=${Math.floor(item.resumeLesson.lastVideoTime)}` : ''}`
                                                                : '#'
                                                        }
                                                        className="dashboard-button-primary w-full"
                                                    >
                                                        <FiPlay className="shrink-0" />
                                                        <span className="truncate">
                                                            Улантуу: {item.resumeLesson.lessonTitle}
                                                            {item.resumeLesson.lastVideoTime
                                                                ? ` (${formatTime(item.resumeLesson.lastVideoTime)})`
                                                                : ''}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                        Улантуучу сабак азырынча табылган жок.
                                                    </div>
                                                )}
                                            </DashboardInsetPanel>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <StudentMiniStat
                                            label="Бүткөн"
                                            value={item.lessonsCompleted}
                                            tone="green"
                                        />
                                        <StudentMiniStat
                                            label="Калды"
                                            value={remainingLessons}
                                            tone="amber"
                                        />
                                        <StudentMiniStat
                                            label="Секция"
                                            value={item.sections.length}
                                            tone="blue"
                                        />
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                                        <div className="text-sm text-edubot-muted dark:text-slate-400">
                                            Секциялар жана сабак деталдары
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedCourseId((prev) =>
                                                    prev === itemKey ? '' : itemKey
                                                )
                                            }
                                            className="dashboard-button-secondary inline-flex items-center gap-2"
                                        >
                                            {isExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                                            {isExpanded ? 'Жашыруу' : 'Кеңейтүү'}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded ? (
                                    <div className="border-t border-edubot-line/70 p-5 dark:border-slate-700">
                                        {item.sections.length ? (
                                            <div className="space-y-3">
                                                {item.sections.map((section) => {
                                                    const completedInSection = section.lessons.filter(
                                                        (lesson) => lesson.completed
                                                    ).length;
                                                    return (
                                                        <div
                                                            key={section.sectionId || section.sectionTitle}
                                                            className="dashboard-panel-muted p-4"
                                                        >
                                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="font-semibold text-edubot-ink dark:text-white">
                                                                        {section.sectionTitle}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                                        {completedInSection}/{section.lessons.length} сабак
                                                                        бүттү
                                                                    </p>
                                                                </div>
                                                                <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                                                    {Math.round(
                                                                        (completedInSection /
                                                                            Math.max(
                                                                                1,
                                                                                section.lessons.length
                                                                            )) *
                                                                            100
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>

                                                            <div className="mt-4 space-y-2">
                                                                {section.lessons.map((lesson) => {
                                                                    const isQuiz = lesson.kind === 'quiz';
                                                                    const quizBadge = isQuiz
                                                                        ? lesson.quizPassed === true
                                                                            ? {
                                                                                  label: 'Квиз өттү',
                                                                                  className:
                                                                                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
                                                                              }
                                                                            : lesson.quizPassed === false
                                                                              ? {
                                                                                    label: 'Квиз өтпөдү',
                                                                                    className:
                                                                                        'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
                                                                                }
                                                                              : null
                                                                        : null;

                                                                    return (
                                                                        <div
                                                                            key={lesson.lessonId || lesson.lessonTitle}
                                                                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                                                        >
                                                                            <div className="flex min-w-0 items-start gap-3">
                                                                                <span
                                                                                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                                                                                        lesson.completed
                                                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                                                                            : 'border border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400'
                                                                                    }`}
                                                                                >
                                                                                    {lesson.completed ? '✓' : ''}
                                                                                </span>
                                                                                <div className="min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                        <p className="text-sm font-medium text-edubot-ink dark:text-white">
                                                                                            {lesson.lessonTitle}
                                                                                        </p>
                                                                                        <span className="rounded-full bg-edubot-surfaceAlt px-2.5 py-1 text-[11px] font-semibold uppercase text-edubot-ink dark:bg-slate-800 dark:text-slate-200">
                                                                                            {getLessonKindLabel(lesson.kind)}
                                                                                        </span>
                                                                                        {quizBadge ? (
                                                                                            <span
                                                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${quizBadge.className}`}
                                                                                            >
                                                                                                {quizBadge.label}
                                                                                                {typeof lesson.quizScore ===
                                                                                                'number'
                                                                                                    ? ` (${lesson.quizScore}%)`
                                                                                                    : ''}
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                    {!lesson.completed &&
                                                                                    lesson.lastVideoTime ? (
                                                                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                                                            Акыркы убакыт:{' '}
                                                                                            {formatTime(
                                                                                                lesson.lastVideoTime
                                                                                            )}
                                                                                        </p>
                                                                                    ) : null}
                                                                                </div>
                                                                            </div>

                                                                            <span className="text-xs font-medium text-edubot-muted dark:text-slate-400">
                                                                                {lesson.completed
                                                                                    ? 'Бүткөн'
                                                                                    : 'Жүрүштө'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="dashboard-panel-muted p-8 text-center text-sm text-edubot-muted dark:text-slate-400">
                                                Бул курс боюнча сабактар табылган жок.
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </section>
                        );
                    })}
                </div>

                <div className="space-y-4">
                    <DashboardInsetPanel
                        title="Milestone"
                        description="Жакынкы жетишкендик жана туруктуулук чекиттери."
                    >
                        <div className="space-y-3">
                            {milestoneItems.map((item) => (
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
                                                {item.value || 'Максат прогресси көрсөтүлөт'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Жетишкендик белгилери"
                        description="Азыркы жетишкендик badge’дер."
                    >
                        <div className="flex flex-wrap gap-2">
                            {badgeItems.map((badge) => (
                                <span
                                    key={badge.id || badge.title}
                                    className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                                >
                                    <FiAward className="h-3.5 w-3.5" />
                                    {badge.title || badge.name}
                                </span>
                            ))}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Рейтинг көрүнүшү"
                        description="Класс ичиндеги салыштырмалуу абал."
                    >
                        <div className="space-y-3">
                            <StudentMiniStat label="Учурдагы орун" value={leaderboardLabel} tone="blue" />
                            <StudentMiniStat
                                label="Tracked learners"
                                value={leaderboardItems.length || 0}
                                tone="default"
                            />
                            {attendanceEnabled ? (
                                <StudentMiniStat
                                    label="Катышуу таасири"
                                    value={`${attendanceStats.rate}%`}
                                    tone={attendanceStats.rate >= 85 ? 'green' : 'amber'}
                                />
                            ) : null}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Сертификат даярдыгы"
                        description="Кайсы курстар финишке жеткенин байкаңыз."
                    >
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div
                                    key={item.courseId || item.courseTitle || index}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-edubot-ink dark:text-white">
                                            {item.courseTitle}
                                        </p>
                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                            {item.progressPercent}% бүткөн
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            item.hasCertificate
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        {item.hasCertificate ? 'Даяр' : 'Даяр эмес'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>
        </div>
    );
};


ProgressTab.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
    }).isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    engagement: PropTypes.shape({
        xp: PropTypes.number,
        streak: PropTypes.number,
    }).isRequired,
    leaderboardItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    leaderboardMeta: PropTypes.shape({
        rank: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        studentRank: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    milestoneItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    badgeItems: PropTypes.arrayOf(PropTypes.object).isRequired,
};

ProgressTab.defaultProps = {
    leaderboardMeta: undefined,
};

export default ProgressTab;

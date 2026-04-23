import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '../../../../components/ui/dashboard';
import StudentHeroPill from '../shared/StudentHeroPill.jsx';
import {
    courseTypeLabel,
    formatCountdown,
    formatSessionDate,
    isOnlineLiveOffering,
    isStudentJoinWindowOpen,
    resolveCourseType,
    resolveInstructorName,
} from '../../utils/studentDashboard.helpers.js';
import {
    FiAlertCircle,
    FiArrowRight,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiMapPin,
    FiPlayCircle,
    FiRadio,
} from 'react-icons/fi';

const getSessionTitle = (item) =>
    item.sessionTitle ||
    item.title ||
    (Number.isFinite(Number(item.sessionIndex)) ? `Сессия ${Number(item.sessionIndex) + 1}` : 'Сессия');

const OverviewTab = ({
    student,
    summary,
    courses,
    offerings,
    tasks,
    attendanceStats,
    attendanceEnabled,
    progressItems,
    onOpenCourse,
    openingCourseId,
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
                .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
        [offerings, nowMs]
    );

    const nextSession = upcoming[0] || null;

    const homeworkNeedingAction = useMemo(
        () =>
            tasks.filter((task) => {
                const status = String(task.submissionStatus || task.status || '').toLowerCase();
                return (
                    status !== 'completed' &&
                    status !== 'approved' &&
                    status !== 'submitted'
                );
            }),
        [tasks]
    );

    const activeCourses =
        Number(summary?.stats?.activeCourses || 0) || Number(courses.length || 0) || 0;
    const lessonsCompleted =
        Number(summary?.stats?.lessonsCompleted || 0) ||
        progressItems.reduce((acc, item) => acc + Number(item.lessonsCompleted || 0), 0);
    const upcomingCount =
        Number(summary?.stats?.upcomingSessions || 0) || Number(upcoming.length || 0);
    const availableRecordings = Number(summary?.stats?.availableRecordings || 0) || 0;

    const progressMap = useMemo(
        () => new Map((progressItems || []).map((item) => [String(item.courseId || item.courseTitle), item])),
        [progressItems]
    );

    const modalityBuckets = useMemo(() => {
        const video = [];
        const delivery = [];

        courses.forEach((course) => {
            const type = String(resolveCourseType(course)).toLowerCase();
            if (type === 'video') {
                video.push(course);
            } else if (type === 'offline' || type === 'online_live') {
                delivery.push(course);
            }
        });

        return { video, delivery };
    }, [courses]);

    const videoCourses = modalityBuckets.video;
    const deliveryCourses = modalityBuckets.delivery;
    const hasVideoLearning = videoCourses.length > 0;
    const hasDeliveryLearning = deliveryCourses.length > 0 || upcoming.length > 0;

    const recommendedVideoCourse = useMemo(() => {
        return (
            videoCourses
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
                .filter((course) => Number(course.progressPercent || 0) < 100)
                .sort((a, b) => (a.progressPercent || 0) - (b.progressPercent || 0))[0] || null
        );
    }, [progressMap, videoCourses]);

    const recentVideoProgress = useMemo(
        () =>
            progressItems
                .filter((item) => String(resolveCourseType(item)).toLowerCase() === 'video')
                .sort((a, b) => Number(b.progressPercent || 0) - Number(a.progressPercent || 0))
                .slice(0, 3),
        [progressItems]
    );

    const welcomeName = student.name?.split(' ')[0] || 'Студент';

    const heroCopy = useMemo(() => {
        if (hasVideoLearning && hasDeliveryLearning) {
            return {
                title: 'Окуу жана сессиялар бир жерде',
                description:
                    'Өз алдынча видеокурстарыңызды улантып, жакынкы live же offline сабактарыңызды өткөрүп жибербей көзөмөлдөңүз.',
            };
        }
        if (hasDeliveryLearning) {
            return {
                title: 'Кийинки сессияңызга даярданыңыз',
                description:
                    'Жакынкы сабак, join же жайгашкан жер, жана ошол сессияга тиешелүү тапшырмалар бул жерден көрүнөт.',
            };
        }
        return {
            title: 'Окууну улантууга даярсыз',
            description:
                'Акыркы токтогон жериңизден улантып, видеокурстардагы прогрессиңизди ишенимдүү көзөмөлдөңүз.',
        };
    }, [hasDeliveryLearning, hasVideoLearning]);

    return (
        <div className="space-y-6">
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow="Student Overview"
                    title={`Кош келиңиз, ${welcomeName}!`}
                    description="Бүгүнкү негизги окуу аракеттери, жакынкы сессиялар жана прогресс ушул бетке топтолду."
                    metrics={
                        <>
                            <DashboardMetricCard label="Активдүү курстар" value={activeCourses} icon={FiBookOpen} />
                            <DashboardMetricCard label="Бүткөн сабак" value={lessonsCompleted} icon={FiCheckCircle} tone="green" />
                            <DashboardMetricCard label="Кийинки сессиялар" value={upcomingCount} icon={FiCalendar} tone="blue" />
                            <DashboardMetricCard label="Аракет керек" value={homeworkNeedingAction.length} icon={FiClock} tone="amber" />
                        </>
                    }
                />

                <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                    <div className="rounded-panel bg-edubot-hero p-6 text-white shadow-edubot-glow">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="dashboard-pill">Today&apos;s Focus</p>
                                <h3 className="mt-4 text-2xl font-semibold">{heroCopy.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-white/80">{heroCopy.description}</p>
                                {nextSession ? (
                                    <p className="mt-4 text-sm text-white/80">
                                        Кийинки сессия:{' '}
                                        <span className="font-semibold text-white">
                                            {getSessionTitle(nextSession)}
                                        </span>{' '}
                                        · {formatSessionDate(nextSession.startAt || nextSession.startsAt)}
                                    </p>
                                ) : recommendedVideoCourse ? (
                                    <p className="mt-4 text-sm text-white/80">
                                        Улантууга ылайыктуу курс:{' '}
                                        <span className="font-semibold text-white">
                                            {recommendedVideoCourse.title || recommendedVideoCourse.courseTitle}
                                        </span>{' '}
                                        · {recommendedVideoCourse.progressPercent || 0}%
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:w-[22rem] lg:grid-cols-1">
                                <StudentHeroPill label="Видео курстар" value={videoCourses.length} />
                                <StudentHeroPill label="Сессия курстары" value={deliveryCourses.length || upcoming.length} />
                                <StudentHeroPill
                                    label="Катышуу"
                                    value={attendanceEnabled ? `${attendanceStats?.rate || 0}%` : '—'}
                                />
                            </div>
                        </div>
                    </div>

                    <DashboardInsetPanel
                        title={hasDeliveryLearning ? 'Кийинки негизги аракет' : 'Улантуу чекити'}
                        description={
                            hasDeliveryLearning
                                ? 'Жакынкы сабак же дароо көңүл бурууга тийиш болгон иш.'
                                : 'Өз алдынча окууда азыр кайсы курска кайрылуу керек.'
                        }
                    >
                        {nextSession ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-semibold text-edubot-ink dark:text-white">
                                        {getSessionTitle(nextSession)}
                                    </p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        {nextSession.courseTitle || 'Курс'} · {formatSessionDate(nextSession.startAt || nextSession.startsAt)}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <StudentHeroPill
                                        label="Формат"
                                        value={courseTypeLabel(resolveCourseType(nextSession))}
                                    />
                                    <StudentHeroPill
                                        label="Башталышына"
                                        value={formatCountdown(new Date(nextSession.startAt || nextSession.startsAt).getTime(), nowMs)}
                                    />
                                </div>

                                {isOnlineLiveOffering(nextSession) ? (
                                    nextSession.liveJoinUrl && isStudentJoinWindowOpen(nextSession, nowMs) ? (
                                        <a
                                            href={nextSession.liveJoinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="dashboard-button-primary w-full"
                                        >
                                            <FiRadio className="h-4 w-4" />
                                            Сабакка кошулуу
                                        </a>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                            <FiAlertCircle className="h-4 w-4" />
                                            Кошулуу шилтемеси 10 мүнөт мурун ачылат
                                        </div>
                                    )
                                ) : (
                                    <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                        {nextSession.location || 'Оффлайн сессия. Жайгашкан жер кийин көрсөтүлөт.'}
                                    </div>
                                )}
                            </div>
                        ) : recommendedVideoCourse ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-semibold text-edubot-ink dark:text-white">
                                        {recommendedVideoCourse.title || recommendedVideoCourse.courseTitle}
                                    </p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        Прогресс: {recommendedVideoCourse.progressPercent || 0}%
                                    </p>
                                </div>

                                <div className="h-3 rounded-full bg-edubot-surfaceAlt dark:bg-slate-800">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-edubot-orange to-edubot-soft"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(0, recommendedVideoCourse.progressPercent || 0)
                                            )}%`,
                                        }}
                                    />
                                </div>

                                {recommendedVideoCourse.id || recommendedVideoCourse.courseId ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onOpenCourse?.(
                                                recommendedVideoCourse.id || recommendedVideoCourse.courseId
                                            )
                                        }
                                        disabled={Boolean(openingCourseId)}
                                        className="dashboard-button-primary w-full"
                                    >
                                        <FiArrowRight className="h-4 w-4" />
                                        {openingCourseId ===
                                        (recommendedVideoCourse.id || recommendedVideoCourse.courseId)
                                            ? 'Иштелүүдө...'
                                            : 'Окууну улантуу'}
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="text-sm text-edubot-muted dark:text-slate-400">
                                Азырынча негизги аракет табылган жок.
                            </div>
                        )}
                    </DashboardInsetPanel>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                <div className="space-y-4">
                    {hasDeliveryLearning ? (
                        <section className="dashboard-panel overflow-hidden">
                            <DashboardSectionHeader
                                eyebrow="Live / Offline Learning"
                                title="Жакынкы сессиялар"
                                description="Түз эфир же оффлайн окуудагы кийинки сессиялар жана алардын контексти."
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
                                            label="Жазуулар"
                                            value={availableRecordings}
                                            icon={FiPlayCircle}
                                        />
                                    </>
                                }
                            />

                            <div className="space-y-3 p-6">
                                {upcoming.length ? (
                                    upcoming.slice(0, 4).map((item) => {
                                        const type = resolveCourseType(item);
                                        const joinUrl =
                                            item.liveJoinUrl || item.joinLink || item.link || item.joinUrl || '';
                                        const joinAllowed =
                                            !isOnlineLiveOffering(item) ||
                                            isStudentJoinWindowOpen(item, nowMs);
                                        const countdown = item.startAt || item.startsAt
                                            ? formatCountdown(new Date(item.startAt || item.startsAt).getTime(), nowMs)
                                            : null;

                                        return (
                                            <div
                                                key={item.id || `${item.courseId}-${item.startAt || item.startsAt}`}
                                                className="dashboard-panel-muted p-4"
                                            >
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                                                {getSessionTitle(item)}
                                                            </p>
                                                            <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                                                {courseTypeLabel(type)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                            {formatSessionDate(item.startAt || item.startsAt)}
                                                        </p>
                                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                            {item.courseTitle || item.course?.title || 'Курс'}
                                                            {resolveInstructorName(item)
                                                                ? ` · ${resolveInstructorName(item)}`
                                                                : ''}
                                                        </p>
                                                        {type === 'offline' ? (
                                                            <p className="mt-1 inline-flex items-center gap-2 text-sm text-edubot-muted dark:text-slate-400">
                                                                <FiMapPin className="h-4 w-4" />
                                                                {item.location || item.room || 'Жайгашкан жер көрсөтүлгөн эмес'}
                                                            </p>
                                                        ) : null}
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
                    ) : null}

                    {hasVideoLearning ? (
                        <section className="dashboard-panel overflow-hidden">
                            <DashboardSectionHeader
                                eyebrow="Video Learning"
                                title="Видео курстардагы прогресс"
                                description="Өз алдынча окууда улантууга ылайыктуу курстар жана учурдагы прогресс."
                            />

                            <div className="grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-3">
                                {(recentVideoProgress.length ? recentVideoProgress : progressItems.slice(0, 3)).map((item, index) => (
                                    <div
                                        key={item.courseId || item.courseTitle || index}
                                        className="dashboard-panel-muted p-4"
                                    >
                                        <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                            {item.courseTitle}
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {item.lessonsCompleted}/{item.lessonsTotal || '—'} сабак бүттү
                                        </p>
                                        <div className="mt-4 h-2 rounded-full bg-edubot-surfaceAlt dark:bg-slate-800">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-edubot-orange to-edubot-soft"
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, Number(item.progressPercent || 0)))}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                            <span className="text-edubot-muted dark:text-slate-400">
                                                Прогресс
                                            </span>
                                            <span className="font-semibold text-edubot-orange">
                                                {item.progressPercent || 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <NotificationsWidget />
                </div>

                <div className="space-y-4">
                    <DashboardInsetPanel
                        title="Аракет керек болгон тапшырмалар"
                        description="Жакын арада көңүл буруу керек болгон үй тапшырмалары."
                    >
                        <div className="space-y-3">
                            {homeworkNeedingAction.length ? (
                                homeworkNeedingAction.slice(0, 4).map((task, index) => (
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
                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                            {task.meta?.label || task.statusLabel || task.status || 'Күтүүдө'}
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
                        title="Окуу форматы"
                        description="Катышып жаткан курстар боюнча негизги багыттар."
                    >
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <StudentHeroPill label="Видео курстар" value={videoCourses.length} />
                            <StudentHeroPill label="Сессия курстары" value={deliveryCourses.length || upcoming.length} />
                            <StudentHeroPill label="Жазуулар" value={availableRecordings} />
                            <StudentHeroPill
                                label="Катышуу"
                                value={attendanceEnabled ? `${attendanceStats.rate}%` : 'Эсептелбейт'}
                            />
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
        lastLesson: PropTypes.object,
    }).isRequired,
    summary: PropTypes.object,
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    offerings: PropTypes.arrayOf(PropTypes.object).isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
    }).isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    progressItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    onOpenCourse: PropTypes.func,
    openingCourseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

OverviewTab.defaultProps = {
    summary: null,
    onOpenCourse: undefined,
    openingCourseId: null,
};

export default OverviewTab;

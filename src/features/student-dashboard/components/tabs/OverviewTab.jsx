import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import FreeResourcesWidget from '@features/externalResources/components/FreeResourcesWidget';
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
    getStudentLiveRefreshInterval,
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

const getSessionTitle = (item, t) =>
    item.sessionTitle ||
    item.title ||
    (Number.isFinite(Number(item.sessionIndex))
        ? t('studentDashboard.overview.sessionTitleWithNumber', { number: Number(item.sessionIndex) + 1 })
        : t('studentDashboard.overview.sessionFallback'));

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
    const { t } = useTranslation();
    const [nowMs, setNowMs] = useState(Date.now());

    const liveRefreshInterval = useMemo(
        () => getStudentLiveRefreshInterval(offerings, nowMs),
        [offerings, nowMs]
    );

    useEffect(() => {
        const timer = setInterval(() => setNowMs(Date.now()), liveRefreshInterval);
        return () => clearInterval(timer);
    }, [liveRefreshInterval]);

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

    const welcomeName = student.name?.split(' ')[0] || t('studentDashboard.data.fallbacks.student');

    const heroCopy = useMemo(() => {
        if (hasVideoLearning && hasDeliveryLearning) {
            return {
                title: t('studentDashboard.overview.hero.mixed.title'),
                description: t('studentDashboard.overview.hero.mixed.description'),
            };
        }
        if (hasDeliveryLearning) {
            return {
                title: t('studentDashboard.overview.hero.delivery.title'),
                description: t('studentDashboard.overview.hero.delivery.description'),
            };
        }
        return {
            title: t('studentDashboard.overview.hero.video.title'),
            description: t('studentDashboard.overview.hero.video.description'),
        };
    }, [hasDeliveryLearning, hasVideoLearning, t]);

    return (
        <div className="space-y-6">
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow={t('studentDashboard.overview.eyebrow')}
                    title={t('studentDashboard.overview.title', { name: welcomeName })}
                    description={t('studentDashboard.overview.description')}
                    metrics={
                        <>
                            <DashboardMetricCard label={t('studentDashboard.overview.metrics.activeCourses')} value={activeCourses} icon={FiBookOpen} />
                            <DashboardMetricCard label={t('studentDashboard.overview.metrics.completedLessons')} value={lessonsCompleted} icon={FiCheckCircle} tone="green" />
                            <DashboardMetricCard label={t('studentDashboard.overview.metrics.upcomingSessions')} value={upcomingCount} icon={FiCalendar} tone="blue" />
                            <DashboardMetricCard label={t('studentDashboard.overview.metrics.needsAction')} value={homeworkNeedingAction.length} icon={FiClock} tone="amber" />
                        </>
                    }
                />

                <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                    <div className="rounded-panel bg-edubot-hero p-6 text-white shadow-edubot-glow">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="dashboard-pill">{t('studentDashboard.overview.focusLabel')}</p>
                                <h3 className="mt-4 text-2xl font-semibold">{heroCopy.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-white/80">{heroCopy.description}</p>
                                {nextSession ? (
                                    <p className="mt-4 text-sm text-white/80">
                                        {t('studentDashboard.overview.nextSessionLabel')}{' '}
                                        <span className="font-semibold text-white">
                                            {getSessionTitle(nextSession, t)}
                                        </span>{' '}
                                        · {formatSessionDate(nextSession.startAt || nextSession.startsAt)}
                                    </p>
                                ) : recommendedVideoCourse ? (
                                    <p className="mt-4 text-sm text-white/80">
                                        {t('studentDashboard.overview.recommendedCourseLabel')}{' '}
                                        <span className="font-semibold text-white">
                                            {recommendedVideoCourse.title || recommendedVideoCourse.courseTitle}
                                        </span>{' '}
                                        · {recommendedVideoCourse.progressPercent || 0}%
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:w-[22rem] lg:grid-cols-1">
                                <StudentHeroPill label={t('studentDashboard.overview.pills.videoCourses')} value={videoCourses.length} />
                                <StudentHeroPill label={t('studentDashboard.overview.pills.sessionCourses')} value={deliveryCourses.length || upcoming.length} />
                                <StudentHeroPill
                                    label={t('studentDashboard.overview.pills.attendance')}
                                    value={attendanceEnabled ? `${attendanceStats?.rate || 0}%` : '—'}
                                />
                            </div>
                        </div>
                    </div>

                    <DashboardInsetPanel
                        title={hasDeliveryLearning
                            ? t('studentDashboard.overview.nextAction.deliveryTitle')
                            : t('studentDashboard.overview.nextAction.videoTitle')}
                        description={
                            hasDeliveryLearning
                                ? t('studentDashboard.overview.nextAction.deliveryDescription')
                                : t('studentDashboard.overview.nextAction.videoDescription')
                        }
                    >
                        {nextSession ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-semibold text-edubot-ink dark:text-white">
                                        {getSessionTitle(nextSession, t)}
                                    </p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        {nextSession.courseTitle || t('studentDashboard.data.fallbacks.course')} · {formatSessionDate(nextSession.startAt || nextSession.startsAt)}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <StudentHeroPill
                                        label={t('studentDashboard.overview.labels.format')}
                                        value={courseTypeLabel(resolveCourseType(nextSession))}
                                    />
                                    <StudentHeroPill
                                        label={t('studentDashboard.overview.labels.startsIn')}
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
                                            {t('studentDashboard.overview.actions.joinLesson')}
                                        </a>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                            <FiAlertCircle className="h-4 w-4" />
                                            {t('studentDashboard.overview.joinOpensSoon')}
                                        </div>
                                    )
                                ) : (
                                    <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                        {nextSession.location || t('studentDashboard.overview.fallbacks.offlineLocationLater')}
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
                                        {t('studentDashboard.overview.progressLabel', {
                                            value: recommendedVideoCourse.progressPercent || 0,
                                        })}
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
                                            ? t('common.loadingEllipsis')
                                            : t('studentDashboard.overview.actions.continueLearning')}
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="text-sm text-edubot-muted dark:text-slate-400">
                                {t('studentDashboard.overview.nextAction.empty')}
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
                                eyebrow={t('studentDashboard.overview.sessions.eyebrow')}
                                title={t('studentDashboard.overview.sessions.title')}
                                description={t('studentDashboard.overview.sessions.description')}
                                metricsClassName="grid grid-cols-2 gap-3 sm:grid-cols-2"
                                metrics={
                                    <>
                                        <DashboardMetricCard
                                            label={t('studentDashboard.overview.metrics.upcomingSession')}
                                            value={upcoming.length}
                                            icon={FiCalendar}
                                            tone="blue"
                                        />
                                        <DashboardMetricCard
                                            label={t('studentDashboard.overview.metrics.recordings')}
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
                                                                {getSessionTitle(item, t)}
                                                            </p>
                                                            <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                                                {courseTypeLabel(type)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                            {formatSessionDate(item.startAt || item.startsAt)}
                                                        </p>
                                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                            {item.courseTitle || item.course?.title || t('studentDashboard.data.fallbacks.course')}
                                                            {resolveInstructorName(item)
                                                                ? ` · ${resolveInstructorName(item)}`
                                                                : ''}
                                                        </p>
                                                        {type === 'offline' ? (
                                                            <p className="mt-1 inline-flex items-center gap-2 text-sm text-edubot-muted dark:text-slate-400">
                                                                <FiMapPin className="h-4 w-4" />
                                                                {item.location || item.room || t('studentDashboard.overview.fallbacks.locationMissing')}
                                                            </p>
                                                        ) : null}
                                                    </div>

                                                    <div className="lg:w-[18rem]">
                                                        {type === 'online_live' ? (
                                                            <div className="space-y-2">
                                                                <div className="text-xs font-medium uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-400">
                                                                    {t('studentDashboard.overview.labels.startsIn')}
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
                                                                        {t('studentDashboard.overview.actions.join')}
                                                                    </a>
                                                                ) : (
                                                                    <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                                                        <FiAlertCircle className="h-4 w-4" />
                                                                        {t('studentDashboard.overview.joinOpensSoon')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                                {t('studentDashboard.overview.fallbacks.offlineCheckLocation')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="dashboard-panel-muted p-8 text-center text-sm text-edubot-muted dark:text-slate-400">
                                        {t('studentDashboard.overview.sessions.empty')}
                                    </div>
                                )}
                            </div>
                        </section>
                    ) : null}

                    {hasVideoLearning ? (
                        <section className="dashboard-panel overflow-hidden">
                            <DashboardSectionHeader
                                eyebrow={t('studentDashboard.overview.videoProgress.eyebrow')}
                                title={t('studentDashboard.overview.videoProgress.title')}
                                description={t('studentDashboard.overview.videoProgress.description')}
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
                                            {t('studentDashboard.overview.videoProgress.lessonsCompleted', {
                                                completed: item.lessonsCompleted,
                                                total: item.lessonsTotal || '—',
                                            })}
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
                                                {t('studentDashboard.overview.videoProgress.progress')}
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
                        title={t('studentDashboard.overview.homework.title')}
                        description={t('studentDashboard.overview.homework.description')}
                    >
                        <div className="space-y-3">
                            {homeworkNeedingAction.length ? (
                                homeworkNeedingAction.slice(0, 4).map((task, index) => (
                                    <div
                                        key={task.id || task.taskId || index}
                                        className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <p className="font-medium text-edubot-ink dark:text-white">
                                            {task.title || t('studentDashboard.overview.fallbacks.task')}
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {task.courseTitle || task.course || t('studentDashboard.overview.fallbacks.courseMissing')}
                                        </p>
                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                            {task.meta?.label || task.statusLabel || task.status || t('studentDashboard.overview.fallbacks.pending')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-edubot-muted dark:text-slate-400">
                                    {t('studentDashboard.overview.homework.empty')}
                                </div>
                            )}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('studentDashboard.overview.learningFormat.title')}
                        description={t('studentDashboard.overview.learningFormat.description')}
                    >
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <StudentHeroPill label={t('studentDashboard.overview.pills.videoCourses')} value={videoCourses.length} />
                            <StudentHeroPill label={t('studentDashboard.overview.pills.sessionCourses')} value={deliveryCourses.length || upcoming.length} />
                            <StudentHeroPill label={t('studentDashboard.overview.pills.recordings')} value={availableRecordings} />
                            <StudentHeroPill
                                label={t('studentDashboard.overview.pills.attendance')}
                                value={attendanceEnabled ? `${attendanceStats.rate}%` : t('studentDashboard.overview.fallbacks.notCalculated')}
                            />
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>

            <FreeResourcesWidget userId={student.id} />

            <div className="mx-4 mb-6 rounded-2xl border border-[#E14219]/20 bg-gradient-to-r from-[#1a0f0a] to-[#141619] dark:from-[#1a0f0a] dark:to-[#0e0e0e] px-6 py-5 sm:mx-6 lg:mx-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-[#E14219] uppercase tracking-widest">
                            EduBot Career
                        </p>
                        <p className="font-suisse font-semibold text-[#E8ECF3] text-base">
                            {t('career.public.hero.title')}
                        </p>
                        <p className="text-xs text-[#a6adba] max-w-md leading-5">
                            {t('career.public.hero.subtitle')}
                        </p>
                    </div>
                    <Link
                        to="/career"
                        className="shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        {t('career.dashboard.nextSteps.noResume')}
                    </Link>
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

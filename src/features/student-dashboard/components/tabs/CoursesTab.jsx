import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    FiBookOpen,
    FiCalendar,
    FiClock,
    FiFilter,
    FiFolder,
    FiMapPin,
    FiPlayCircle,
    FiSearch,
    FiVideo,
} from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '../../../../components/ui/dashboard';
import StudentMiniStat from '../shared/StudentMiniStat.jsx';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';
import {
    resolveInstructorName,
    resolveCourseType,
    formatSessionDate,
    resolveRecordings,
} from '../../utils/studentDashboard.helpers.js';
import { getDashboardPath } from '@shared/utils/navigation';

const getProgressTone = (value) => {
    if (value >= 80) return 'green';
    if (value >= 40) return 'blue';
    return 'amber';
};

const COURSE_TYPE_LABEL_KEYS = {
    video: 'studentDashboard.courses.courseTypes.video',
    offline: 'studentDashboard.courses.courseTypes.offline',
    online_live: 'studentDashboard.courses.courseTypes.onlineLive',
};

const getCourseTypeLabel = (type, t) =>
    t(COURSE_TYPE_LABEL_KEYS[type] || 'studentDashboard.courses.courseTypes.video');

const getCourseModeLabel = (item, t) => {
    if (item.courseType === 'video') return t('studentDashboard.courses.courseModes.selfPaced');
    if (item.groupName) return item.groupName;
    if (item.courseType === 'offline') return t('studentDashboard.courses.courseModes.offlineGroup');
    return t('studentDashboard.courses.courseModes.liveGroup');
};

const CoursesTab = ({ courses, offeringsByCourse }) => {
    const { i18n, t } = useTranslation();
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const courseView = useMemo(
        () =>
            courses.map((course) => {
                const courseId = String(course.id ?? course.courseId ?? '');
                const cover = course.coverImageUrl || course.coverImage || course.cover || '';
                const instructor = resolveInstructorName(course);
                const progressValue = Math.max(
                    0,
                    Math.min(100, Math.round(Number(course.progressPercent ?? course.progress ?? 0)))
                );
                const linkedOfferings = offeringsByCourse.get(courseId) || [];
                const nextSession = linkedOfferings
                    .filter((item) => item.startAt)
                    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];
                const courseType = resolveCourseType(course);
                const recordingsCount = linkedOfferings.reduce(
                    (acc, row) => acc + resolveRecordings(row).length,
                    0
                );
                const groupName = course.groupName || course.group?.name || course.offering?.groupName || null;

                return {
                    course,
                    courseId,
                    cover,
                    instructor,
                    progressValue,
                    linkedOfferings,
                    nextSession,
                    courseType,
                    recordingsCount,
                    groupName,
                    lessonsLabel:
                        course.lessonsCount ||
                        course.lessonCount ||
                        course.totalLessons ||
                        '—',
                };
            }),
        [courses, offeringsByCourse]
    );

    const stats = useMemo(() => {
        const total = courseView.length;
        const averageProgress = total
            ? Math.round(
                  courseView.reduce((acc, item) => acc + Number(item.progressValue || 0), 0) / total
              )
            : 0;
        const liveCourses = courseView.filter((item) => item.courseType === 'online_live').length;
        const offlineCourses = courseView.filter((item) => item.courseType === 'offline').length;

        return { total, averageProgress, liveCourses, offlineCourses };
    }, [courseView]);

    const filteredCourses = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return courseView.filter((item) => {
            if (typeFilter !== 'all' && item.courseType !== typeFilter) return false;
            if (!normalizedQuery) return true;

            return [item.course.title, item.instructor, item.course.description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });
    }, [courseView, query, typeFilter]);

    if (!courses.length) {
        return (
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow={t('studentDashboard.courses.eyebrow')}
                    title={t('studentDashboard.courses.title')}
                    description={t('studentDashboard.courses.emptyHeroDescription')}
                />
                <div className="p-6">
                    <StudentPanelEmpty
                        icon={FiFolder}
                        title={t('studentDashboard.courses.empty.title')}
                        description={t('studentDashboard.courses.empty.description')}
                    />
                </div>
            </section>
        );
    }

    return (
        <div className="space-y-6">
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow={t('studentDashboard.courses.eyebrow')}
                    title={t('studentDashboard.courses.title')}
                    description={t('studentDashboard.courses.description')}
                    metrics={
                        <>
                            <DashboardMetricCard label={t('studentDashboard.courses.metrics.courses')} value={stats.total} icon={FiBookOpen} />
                            <DashboardMetricCard
                                label={t('studentDashboard.courses.metrics.averageProgress')}
                                value={`${stats.averageProgress}%`}
                                icon={FiPlayCircle}
                                tone={getProgressTone(stats.averageProgress)}
                            />
                            <DashboardMetricCard
                                label={t('studentDashboard.courses.metrics.live')}
                                value={stats.liveCourses}
                                icon={FiVideo}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label={t('studentDashboard.courses.metrics.offline')}
                                value={stats.offlineCourses}
                                icon={FiMapPin}
                                tone="amber"
                            />
                        </>
                    }
                />

                <div className="grid gap-3 border-b border-edubot-line/70 px-6 py-5 dark:border-slate-700 lg:grid-cols-[minmax(0,1.4fr),minmax(0,0.8fr)]">
                    <label className="relative block">
                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('studentDashboard.courses.searchPlaceholder')}
                            className="dashboard-field dashboard-field-icon"
                        />
                    </label>

                    <label className="relative block">
                        <FiFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="dashboard-field dashboard-field-icon dashboard-select"
                        >
                            <option value="all">{t('studentDashboard.courses.filters.allTypes')}</option>
                            <option value="video">{t('studentDashboard.courses.courseTypes.video')}</option>
                            <option value="offline">{t('studentDashboard.courses.courseTypes.offline')}</option>
                            <option value="online_live">{t('studentDashboard.courses.courseTypes.onlineLive')}</option>
                        </select>
                    </label>
                </div>

                <div className="grid gap-4 p-6 xl:grid-cols-2">
                    {filteredCourses.length ? (
                        filteredCourses.map((item) => {
                            const progressTone = getProgressTone(item.progressValue);
                            const isVideoCourse = item.courseType === 'video';
                            const resolvedGroupId = item.course.groupId || item.course.group?.id;
                            const primaryLink = isVideoCourse
                                ? (item.courseId ? `/courses/${item.courseId}` : '#')
                                : getDashboardPath('student', 'schedule', {
                                    courseId: item.courseId,
                                    groupId: item.course.groupId || item.groupName ? resolvedGroupId : undefined,
                                });
                            const primaryActionLabel = isVideoCourse
                                ? t('studentDashboard.courses.actions.openCourse')
                                : t('studentDashboard.courses.actions.openSchedule');

                            return (
                                <article
                                    key={item.courseId || item.course.title}
                                    className="dashboard-panel-muted overflow-hidden p-0"
                                >
                                    <div className="relative h-44 overflow-hidden">
                                        {item.cover ? (
                                            <img
                                                src={item.cover}
                                                alt={item.course.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-edubot-surfaceAlt text-sm font-semibold text-edubot-muted dark:bg-slate-800 dark:text-slate-300">
                                                {t('studentDashboard.courses.noImage')}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                                            <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                                                {getCourseTypeLabel(item.courseType, t)}
                                            </span>
                                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                {isVideoCourse ? `${item.progressValue}%` : getCourseTypeLabel(item.courseType, t)}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-5 left-5 right-5">
                                            <p className="text-sm text-white/75">{item.instructor}</p>
                                            <h3 className="mt-1 text-xl font-semibold text-white">
                                                {item.course.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5">
                                        <div>
                                            {isVideoCourse ? (
                                                <>
                                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                        <span className="font-medium text-edubot-ink dark:text-white">
                                                            {t('studentDashboard.courses.progress')}
                                                        </span>
                                                        <span className="font-semibold text-edubot-orange">
                                                            {item.progressValue}%
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
                                                            style={{ width: `${item.progressValue}%` }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/70 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                                                    {t('studentDashboard.courses.scheduledCourseNotice')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <StudentMiniStat label={t('studentDashboard.courses.stats.lessons')} value={item.lessonsLabel} />
                                            <StudentMiniStat
                                                label={item.courseType === 'video'
                                                    ? t('studentDashboard.courses.stats.format')
                                                    : t('studentDashboard.courses.stats.group')}
                                                value={getCourseModeLabel(item, t)}
                                                tone={item.courseType === 'video' ? 'amber' : 'blue'}
                                            />
                                            <StudentMiniStat
                                                label={item.courseType === 'video'
                                                    ? t('studentDashboard.courses.stats.nextStatus')
                                                    : t('studentDashboard.courses.stats.upcoming')}
                                                value={
                                                    item.courseType === 'video'
                                                        ? item.course.nextLesson?.title
                                                            ? t('studentDashboard.courses.statuses.continue')
                                                            : t('studentDashboard.courses.statuses.completed')
                                                        : item.nextSession
                                                            ? formatSessionDate(item.nextSession.startAt, {
                                                                  language: i18n.language,
                                                                  fallback: t('studentDashboard.courses.fallbacks.unknownTime'),
                                                              })
                                                            : t('studentDashboard.courses.statuses.pending')
                                                }
                                                tone="green"
                                            />
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),minmax(0,0.8fr)]">
                                            <DashboardInsetPanel
                                                title={t('studentDashboard.courses.nextStep.title')}
                                                description={
                                                    item.courseType === 'video'
                                                        ? t('studentDashboard.courses.nextStep.videoDescription')
                                                        : t('studentDashboard.courses.nextStep.groupDescription')
                                                }
                                            >
                                                {item.courseType === 'video' ? (
                                                    item.course.nextLesson ? (
                                                        <div className="space-y-2 text-sm">
                                                            <div className="inline-flex items-center gap-2 text-edubot-ink dark:text-white">
                                                                <FiPlayCircle className="h-4 w-4 text-edubot-orange" />
                                                                {item.course.nextLesson.title}
                                                            </div>
                                                            <div className="text-edubot-muted dark:text-slate-400">
                                                                {t('studentDashboard.courses.nextStep.selfPacedHint')}
                                                            </div>
                                                            <div className="text-edubot-muted dark:text-slate-400">
                                                                {t('studentDashboard.courses.nextStep.instructor', {
                                                                    instructor: item.instructor,
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                            {t('studentDashboard.courses.nextStep.videoCompleted')}
                                                        </div>
                                                    )
                                                ) : item.nextSession ? (
                                                    <div className="space-y-2 text-sm">
                                                        <div className="inline-flex items-center gap-2 text-edubot-ink dark:text-white">
                                                            <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                                            {formatSessionDate(item.nextSession.startAt, {
                                                                language: i18n.language,
                                                                fallback: t('studentDashboard.courses.fallbacks.unknownTime'),
                                                            })}
                                                        </div>
                                                        <div className="text-edubot-muted dark:text-slate-400">
                                                            {item.courseType === 'offline'
                                                                ? t('studentDashboard.courses.nextStep.location', {
                                                                      location:
                                                                          item.nextSession.location ||
                                                                          item.nextSession.room ||
                                                                          t('studentDashboard.courses.nextStep.noClassroom'),
                                                                  })
                                                                : t('studentDashboard.courses.nextStep.liveWaiting')}
                                                        </div>
                                                        <div className="text-edubot-muted dark:text-slate-400">
                                                            {t('studentDashboard.courses.nextStep.instructor', {
                                                                instructor: resolveInstructorName(item.nextSession || item.course),
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : item.course.offering?.scheduleNote ? (
                                                    <div className="space-y-2 text-sm">
                                                        <div className="inline-flex items-center gap-2 text-edubot-ink dark:text-white">
                                                            <FiClock className="h-4 w-4 text-edubot-orange" />
                                                            {t('studentDashboard.courses.nextStep.schedulePending')}
                                                        </div>
                                                        <div className="text-edubot-muted dark:text-slate-400">
                                                            {item.course.offering.scheduleNote}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                        {item.courseType === 'video'
                                                            ? t('studentDashboard.courses.nextStep.openCourseHint')
                                                            : t('studentDashboard.courses.nextStep.noUpcomingSession')}
                                                    </div>
                                                )}
                                            </DashboardInsetPanel>

                                            <DashboardInsetPanel
                                                title={t('studentDashboard.courses.quickAccess.title')}
                                                description={t('studentDashboard.courses.quickAccess.description')}
                                            >
                                                <div className="space-y-3">
                                                    <Link
                                                        to={primaryLink}
                                                        className="dashboard-button-primary w-full"
                                                    >
                                                        <FiPlayCircle className="h-4 w-4" />
                                                        {primaryActionLabel}
                                                    </Link>
                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                        {item.courseType === 'online_live'
                                                            ? t('studentDashboard.courses.quickAccess.liveHint')
                                                            : item.courseType === 'offline'
                                                              ? t('studentDashboard.courses.quickAccess.offlineHint')
                                                              : t('studentDashboard.courses.quickAccess.videoHint')}
                                                    </div>
                                                </div>
                                            </DashboardInsetPanel>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <StudentPanelEmpty
                            icon={FiSearch}
                            title={t('studentDashboard.courses.empty.noResultTitle')}
                            description={t('studentDashboard.courses.empty.noResultDescription')}
                            className="xl:col-span-2"
                        />
                    )}
                </div>
            </section>
        </div>
    );
};

CoursesTab.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    offeringsByCourse: PropTypes.instanceOf(Map).isRequired,
};

export default CoursesTab;

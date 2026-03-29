import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
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
    courseTypeLabel,
    formatSessionDate,
    resolveRecordings,
} from '../../utils/studentDashboard.helpers.js';

const fallbackCover =
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';

const getProgressTone = (value) => {
    if (value >= 80) return 'green';
    if (value >= 40) return 'blue';
    return 'amber';
};

const getCourseModeLabel = (item) => {
    if (item.courseType === 'video') return 'Өз алдынча';
    if (item.groupName) return item.groupName;
    if (item.courseType === 'offline') return 'Оффлайн топ';
    return 'Түз эфир тобу';
};

const CoursesTab = ({ courses, offeringsByCourse }) => {
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const courseView = useMemo(
        () =>
            courses.map((course) => {
                const courseId = String(course.id ?? course.courseId ?? '');
                const cover =
                    course.coverImageUrl || course.coverImage || course.cover || fallbackCover;
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
                    eyebrow="My Courses"
                    title="Менин курстарым"
                    description="Бул жерде активдүү курстар, кийинки сессиялар жана окуу темпи көрүнөт."
                />
                <div className="p-6">
                    <StudentPanelEmpty
                        icon={FiFolder}
                        title="Сизде активдүү курстар жок"
                        description="Жаңы курс кошулганда, бул жерде окуу жол картасыңыз көрүнөт."
                    />
                </div>
            </section>
        );
    }

    return (
        <div className="space-y-6">
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow="My Courses"
                    title="Менин курстарым"
                    description="Курс прогрессин, мугалимди, кийинки сабакты жана жазууларды бир экрандан башкарыңыз."
                    metrics={
                        <>
                            <DashboardMetricCard label="Курстар" value={stats.total} icon={FiBookOpen} />
                            <DashboardMetricCard
                                label="Орточо прогресс"
                                value={`${stats.averageProgress}%`}
                                icon={FiPlayCircle}
                                tone={getProgressTone(stats.averageProgress)}
                            />
                            <DashboardMetricCard
                                label="Live"
                                value={stats.liveCourses}
                                icon={FiVideo}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label="Offline"
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
                            placeholder="Курс же мугалим боюнча издөө"
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
                            <option value="all">Бардык типтер</option>
                            <option value="video">Видео</option>
                            <option value="offline">Оффлайн</option>
                            <option value="online_live">Онлайн түз эфир</option>
                        </select>
                    </label>
                </div>

                <div className="grid gap-4 p-6 xl:grid-cols-2">
                    {filteredCourses.length ? (
                        filteredCourses.map((item) => {
                            const progressTone = getProgressTone(item.progressValue);
                            const isVideoCourse = item.courseType === 'video';
                            const scheduleParams = new URLSearchParams({ tab: 'schedule' });
                            if (item.courseId) {
                                scheduleParams.set('courseId', String(item.courseId));
                            }
                            if (item.course.groupId || item.groupName) {
                                const resolvedGroupId = item.course.groupId || item.course.group?.id;
                                if (resolvedGroupId) {
                                    scheduleParams.set('groupId', String(resolvedGroupId));
                                }
                            }
                            const primaryLink = isVideoCourse
                                ? (item.courseId ? `/courses/${item.courseId}` : '#')
                                : `/student?${scheduleParams.toString()}`;
                            const primaryActionLabel = isVideoCourse
                                ? 'Курсту ачуу'
                                : 'Расписаниени ачуу';

                            return (
                                <article
                                    key={item.courseId || item.course.title}
                                    className="dashboard-panel-muted overflow-hidden p-0"
                                >
                                    <div className="relative h-44 overflow-hidden">
                                        <img
                                            src={item.cover}
                                            alt={item.course.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                                            <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                                                {courseTypeLabel(item.courseType)}
                                            </span>
                                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                {isVideoCourse ? `${item.progressValue}%` : courseTypeLabel(item.courseType)}
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
                                                            Прогресс
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
                                                    Бул курс график менен өтөт. Негизги маалыматтар расписание жана катышуу бөлүмдөрүндө көрсөтүлөт.
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <StudentMiniStat label="Сабактар" value={item.lessonsLabel} />
                                            <StudentMiniStat
                                                label={item.courseType === 'video' ? 'Формат' : 'Топ'}
                                                value={getCourseModeLabel(item)}
                                                tone={item.courseType === 'video' ? 'amber' : 'blue'}
                                            />
                                            <StudentMiniStat
                                                label={item.courseType === 'video' ? 'Кийинки абал' : 'Алдыдагы'}
                                                value={
                                                    item.courseType === 'video'
                                                        ? item.course.nextLesson?.title
                                                            ? 'Улантуу'
                                                            : 'Аяктады'
                                                        : item.nextSession
                                                            ? formatSessionDate(item.nextSession.startAt)
                                                            : 'Күтүүдө'
                                                }
                                                tone="green"
                                            />
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),minmax(0,0.8fr)]">
                                            <DashboardInsetPanel
                                                title="Кийинки кадам"
                                                description={
                                                    item.courseType === 'video'
                                                        ? 'Кийинки видео сабак же уланта турган жериңиз.'
                                                        : 'Жакынкы сессия же топ боюнча маалымат.'
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
                                                                Видео курс өз темпиңизде өтүлөт. Курсту ачып, окууну улантыңыз.
                                                            </div>
                                                            <div className="text-edubot-muted dark:text-slate-400">
                                                                Мугалим: {item.instructor}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                            Бул видео курстун бардык сабактары аяктаган окшойт.
                                                        </div>
                                                    )
                                                ) : item.nextSession ? (
                                                    <div className="space-y-2 text-sm">
                                                        <div className="inline-flex items-center gap-2 text-edubot-ink dark:text-white">
                                                            <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                                            {formatSessionDate(item.nextSession.startAt)}
                                                        </div>
                                                        <div className="text-edubot-muted dark:text-slate-400">
                                                            {item.courseType === 'offline'
                                                                ? `Жайгашкан жери: ${
                                                                      item.nextSession.location ||
                                                                      item.nextSession.room ||
                                                                      'Класс али дайындала элек'
                                                                  }`
                                                                : 'Онлайн түз эфир сабагы күтүп турат'}
                                                        </div>
                                                        <div className="text-edubot-muted dark:text-slate-400">
                                                            Мугалим:{' '}
                                                            {resolveInstructorName(item.nextSession || item.course)}
                                                        </div>
                                                    </div>
                                                ) : item.course.offering?.scheduleNote ? (
                                                    <div className="space-y-2 text-sm">
                                                        <div className="inline-flex items-center gap-2 text-edubot-ink dark:text-white">
                                                            <FiClock className="h-4 w-4 text-edubot-orange" />
                                                            График такталып жатат
                                                        </div>
                                                        <div className="text-edubot-muted dark:text-slate-400">
                                                            {item.course.offering.scheduleNote}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                        {item.courseType === 'video'
                                                            ? 'Курсту ачып, кийинки сабакты улантыңыз.'
                                                            : 'Жакынкы сессия азырынча дайындалган жок.'}
                                                    </div>
                                                )}
                                            </DashboardInsetPanel>

                                            <DashboardInsetPanel
                                                title="Ыкчам кирүү"
                                                description="Курсту ачып, окууну улантыңыз."
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
                                                            ? 'Түз эфир сабактары үчүн расписание жана жазуулар бөлүмүн колдонуңуз.'
                                                            : item.courseType === 'offline'
                                                              ? 'Оффлайн сабактар үчүн расписание жана катышуу бөлүмүн ачыңыз.'
                                                              : 'Видео сабактарды токтогон жериңизден уланта аласыз.'}
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
                            title="Курс табылган жок"
                            description="Издөө сөзүн же фильтрди өзгөртүп көрүңүз."
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import StudentAnalyticsPage from '../../../../pages/StudentAnalytics';
import {
    FiAward,
    FiBookOpen,
    FiChevronDown,
    FiChevronUp,
    FiMapPin,
    FiPlay,
    FiRadio,
    FiTrendingUp,
} from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '../../../../components/ui/dashboard';
import StudentHeroPill from '../shared/StudentHeroPill.jsx';
import StudentMiniStat from '../shared/StudentMiniStat.jsx';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';
import { downloadCourseCertificatePdf } from '../../../courses/api.js';
import {
    resolveCourseType,
} from '../../utils/studentDashboard.helpers.js';

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

const COURSE_TYPE_LABEL_KEYS = {
    video: 'studentDashboard.progress.courseTypes.video',
    offline: 'studentDashboard.progress.courseTypes.offline',
    online_live: 'studentDashboard.progress.courseTypes.onlineLive',
};

const getCourseTypeLabel = (type, t) =>
    t(COURSE_TYPE_LABEL_KEYS[type] || 'studentDashboard.progress.courseTypes.video');

const getProgressLabel = (value, t) => {
    if (value >= 100) return t('studentDashboard.progress.progressLabels.completed');
    if (value >= 80) return t('studentDashboard.progress.progressLabels.nearFinish');
    if (value >= 40) return t('studentDashboard.progress.progressLabels.steady');
    return t('studentDashboard.progress.progressLabels.needsAttention');
};

const getCertificateBadge = (status) => {
    if (status === 'issued') {
        return {
            labelKey: 'studentDashboard.progress.certificateBadges.ready',
            className:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }
    if (status === 'pending_approval') {
        return {
            labelKey: 'studentDashboard.progress.certificateBadges.pending',
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (status === 'rejected') {
        return {
            labelKey: 'studentDashboard.progress.certificateBadges.rejected',
            className:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    if (status === 'revoked') {
        return {
            labelKey: 'studentDashboard.progress.certificateBadges.revoked',
            className:
                'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        };
    }
    return null;
};

const getLessonKindLabel = (kind, t) => {
    if (kind === 'quiz') return t('studentDashboard.progress.lessonKinds.quiz');
    if (kind === 'article') return t('studentDashboard.progress.lessonKinds.article');
    if (kind === 'code') return t('studentDashboard.progress.lessonKinds.code');
    return t('studentDashboard.progress.lessonKinds.video');
};

const ProgressTab = ({
    items,
    courses,
    attendanceStats,
    attendanceEnabled,
    courseId,
}) => {
    const { t } = useTranslation();
    const [expandedCourseId, setExpandedCourseId] = useState('');

    if (!items.length) {
        return (
            <div className="space-y-6">
                <section className="dashboard-panel overflow-hidden">
                    <DashboardSectionHeader
                        eyebrow={t('studentDashboard.progress.eyebrow')}
                        title={t('studentDashboard.progress.title')}
                        description={t('studentDashboard.progress.emptyHeroDescription')}
                    />
                    <div className="p-6">
                        <StudentPanelEmpty
                            icon={FiTrendingUp}
                            title={t('studentDashboard.progress.empty.title')}
                            description={t('studentDashboard.progress.empty.description')}
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
    const courseTypeMap = new Map(
        (courses || []).map((course) => [String(course.id ?? course.courseId), resolveCourseType(course)])
    );
    const videoCourseCount = (courses || []).filter(
        (course) => String(resolveCourseType(course)).toLowerCase() === 'video'
    ).length;
    const deliveryCourseCount = (courses || []).filter((course) => {
        const type = String(resolveCourseType(course)).toLowerCase();
        return type === 'offline' || type === 'online_live';
    }).length;

    return (
        <div className="space-y-6">
            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow={t('studentDashboard.progress.eyebrow')}
                    title={t('studentDashboard.progress.title')}
                    description={t('studentDashboard.progress.description')}
                    metrics={
                        <>
                            <DashboardMetricCard label={t('studentDashboard.progress.metrics.averageProgress')} value={`${averageProgress}%`} icon={FiTrendingUp} tone={getProgressTone(averageProgress)} />
                            <DashboardMetricCard label={t('studentDashboard.progress.metrics.activeCourses')} value={totalCourses} icon={FiBookOpen} />
                            <DashboardMetricCard label={t('studentDashboard.progress.metrics.completedCourses')} value={completedCourses} icon={FiAward} tone="blue" />
                            <DashboardMetricCard label={t('studentDashboard.progress.metrics.certificates')} value={certificateCount} icon={FiAward} tone="green" />
                        </>
                    }
                />

                <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1.35fr),minmax(0,0.65fr)]">
                    <div className="rounded-panel bg-edubot-hero p-6 text-white shadow-edubot-glow">
                        <p className="dashboard-pill">{t('studentDashboard.progress.hero.pill')}</p>
                        <div className="mt-4 grid gap-5 lg:grid-cols-[auto,1fr] lg:items-center">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/10 text-center shadow-lg backdrop-blur-sm">
                                <div>
                                    <div className="text-3xl font-bold">{averageProgress}%</div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/70">
                                        {t('studentDashboard.progress.hero.totalProgress')}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-semibold">{t('studentDashboard.progress.hero.focusTitle')}</h3>
                                <p className="mt-2 text-sm leading-6 text-white/80">
                                    {t('studentDashboard.progress.hero.focusDescription', {
                                        course: courseToFocus.courseTitle,
                                        completed: courseToFocus.lessonsCompleted,
                                        total: courseToFocus.lessonsTotal || '—',
                                        progress: courseToFocus.progressPercent,
                                    })}
                                </p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <StudentHeroPill label={t('studentDashboard.progress.hero.courses')} value={totalCourses} />
                                    <StudentHeroPill label={t('studentDashboard.progress.hero.completedLessons')} value={`${totalCompletedLessons}/${totalLessons || '—'}`} />
                                    <StudentHeroPill label={t('studentDashboard.progress.hero.certificates')} value={certificateCount} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <DashboardInsetPanel
                            title={t('studentDashboard.progress.formats.title')}
                            description={t('studentDashboard.progress.formats.description')}
                        >
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                <StudentMiniStat
                                    label={t('studentDashboard.progress.formats.videoCourses')}
                                    value={videoCourseCount}
                                    tone="blue"
                                />
                                <StudentMiniStat
                                    label={t('studentDashboard.progress.formats.sessionCourses')}
                                    value={deliveryCourseCount}
                                    tone="default"
                                />
                                <StudentMiniStat
                                    label={t('studentDashboard.progress.formats.attendance')}
                                    value={attendanceEnabled ? `${attendanceStats.rate}%` : t('studentDashboard.progress.formats.notCalculated')}
                                    tone={attendanceEnabled && attendanceStats.rate >= 85 ? 'green' : 'amber'}
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
                        const certificateBadge = getCertificateBadge(item.certificateStatus);
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
                                                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-300">
                                                        <span>
                                                            {t('studentDashboard.progress.courseCard.lessonCount', {
                                                                completed: item.lessonsCompleted,
                                                                total: item.lessonsTotal || '—',
                                                            })}
                                                        </span>
                                                        <span>
                                                            {t('studentDashboard.progress.courseCard.remaining', {
                                                                count: remainingLessons,
                                                            })}
                                                        </span>
                                                        <span>{getProgressLabel(item.progressPercent, t)}</span>
                                                        {courseTypeMap.get(String(item.courseId)) ? (
                                                            <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-[11px] font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                                                {getCourseTypeLabel(courseTypeMap.get(String(item.courseId)), t)}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                    <span className="font-medium text-edubot-ink dark:text-white">
                                                        {t('studentDashboard.progress.progress')}
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
                                                title={t('studentDashboard.progress.nextAction.title')}
                                                description={
                                                    item.resumeLesson
                                                        ? t('studentDashboard.progress.nextAction.resumeDescription')
                                                        : t('studentDashboard.progress.nextAction.pickLessonDescription')
                                                }
                                                action={
                                                    certificateBadge ? (
                                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${certificateBadge.className}`}>
                                                            {t(certificateBadge.labelKey)}
                                                        </span>
                                                    ) : null
                                                }
                                            >
                                                <div className="space-y-2">
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
                                                                {t('studentDashboard.progress.actions.continueLesson', {
                                                                    lesson: item.resumeLesson.lessonTitle,
                                                                })}
                                                                {item.resumeLesson.lastVideoTime
                                                                    ? ` (${formatTime(item.resumeLesson.lastVideoTime)})`
                                                                    : ''}
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <div className="rounded-2xl border border-dashed border-edubot-line/80 bg-slate-50 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                                                            {t('studentDashboard.progress.nextAction.noResumeLesson')}
                                                        </div>
                                                    )}
                                                    {item.certificateStatus === 'issued' && item.certificateDownloadUrl ? (
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    downloadCourseCertificatePdf(
                                                                        item.certificateDownloadUrl,
                                                                        `certificate-${item.courseId}.pdf`,
                                                                    )
                                                                }
                                                                className="dashboard-button-secondary w-full justify-center"
                                                            >
                                                                <FiAward className="shrink-0" />
                                                                {t('studentDashboard.progress.actions.downloadPdf')}
                                                            </button>
                                                            {item.certificateVerificationUrl ? (
                                                                <a
                                                                    href={item.certificateVerificationUrl}
                                                                    className="dashboard-button-secondary w-full justify-center"
                                                                >
                                                                    {t('studentDashboard.progress.actions.verify')}
                                                                </a>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </DashboardInsetPanel>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <StudentMiniStat
                                            label={t('studentDashboard.progress.stats.completed')}
                                            value={item.lessonsCompleted}
                                            tone="green"
                                        />
                                        <StudentMiniStat
                                            label={t('studentDashboard.progress.stats.remaining')}
                                            value={remainingLessons}
                                            tone="amber"
                                        />
                                        <StudentMiniStat
                                            label={t('studentDashboard.progress.stats.sections')}
                                            value={item.sections.length}
                                            tone="blue"
                                        />
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                                        <div className="text-sm text-edubot-muted dark:text-slate-400">
                                            {t('studentDashboard.progress.sections.title')}
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
                                            {isExpanded
                                                ? t('studentDashboard.progress.actions.hide')
                                                : t('studentDashboard.progress.actions.expand')}
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
                                                                        {t('studentDashboard.progress.sections.completedCount', {
                                                                            completed: completedInSection,
                                                                            total: section.lessons.length,
                                                                        })}
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
                                                                                  labelKey: 'studentDashboard.progress.quiz.passed',
                                                                                  className:
                                                                                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
                                                                              }
                                                                            : lesson.quizPassed === false
                                                                              ? {
                                                                                    labelKey: 'studentDashboard.progress.quiz.failed',
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
                                                                                            {getLessonKindLabel(lesson.kind, t)}
                                                                                        </span>
                                                                                        {quizBadge ? (
                                                                                            <span
                                                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${quizBadge.className}`}
                                                                                            >
                                                                                                {t(quizBadge.labelKey)}
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
                                                                                            {t('studentDashboard.progress.lesson.lastTime', {
                                                                                                time: formatTime(lesson.lastVideoTime),
                                                                                            })}
                                                                                        </p>
                                                                                    ) : null}
                                                                                </div>
                                                                            </div>

                                                                            <span className="text-xs font-medium text-edubot-muted dark:text-slate-400">
                                                                                {lesson.completed
                                                                                    ? t('studentDashboard.progress.lesson.completed')
                                                                                    : t('studentDashboard.progress.lesson.inProgress')}
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
                                                {t('studentDashboard.progress.empty.noLessons')}
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
                        title={t('studentDashboard.progress.certificateReadiness.title')}
                        description={t('studentDashboard.progress.certificateReadiness.description')}
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
                                            {t('studentDashboard.progress.certificateReadiness.percentComplete', {
                                                progress: item.progressPercent,
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            item.certificateStatus === 'issued'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                                : item.certificateStatus === 'pending_approval'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                                                    : item.certificateStatus === 'rejected'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        {item.certificateStatus === 'issued'
                                            ? t('studentDashboard.progress.certificateReadiness.ready')
                                            : item.certificateStatus === 'pending_approval'
                                                ? t('studentDashboard.progress.certificateReadiness.pending')
                                                : item.certificateStatus === 'rejected'
                                                    ? t('studentDashboard.progress.certificateReadiness.rejected')
                                                    : t('studentDashboard.progress.certificateReadiness.notReady')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('studentDashboard.progress.sessionFormats.title')}
                        description={t('studentDashboard.progress.sessionFormats.description')}
                    >
                        <div className="space-y-3 text-sm leading-6 text-edubot-muted dark:text-slate-300">
                            <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                <div className="flex items-center gap-2 font-semibold text-edubot-ink dark:text-white">
                                    <FiRadio className="h-4 w-4" />
                                    {t('studentDashboard.progress.sessionFormats.onlineLive')}
                                </div>
                                <p className="mt-2">
                                    {t('studentDashboard.progress.sessionFormats.onlineLiveDescription')}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                <div className="flex items-center gap-2 font-semibold text-edubot-ink dark:text-white">
                                    <FiMapPin className="h-4 w-4" />
                                    {t('studentDashboard.progress.sessionFormats.offline')}
                                </div>
                                <p className="mt-2">
                                    {t('studentDashboard.progress.sessionFormats.offlineDescription')}
                                </p>
                            </div>
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>

            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow={t('studentDashboard.progress.advanced.eyebrow')}
                    title={t('studentDashboard.progress.advanced.title')}
                    description={t('studentDashboard.progress.advanced.description')}
                />
                <div className="p-6">
                    <StudentAnalyticsPage
                        embedded
                        courseId={courseId}
                        showHeader={false}
                        showFilters={false}
                    />
                </div>
            </section>
        </div>
    );
};


ProgressTab.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    courses: PropTypes.arrayOf(PropTypes.object),
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
    }).isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ProgressTab.defaultProps = {
    courses: [],
    courseId: undefined,
};

export default ProgressTab;

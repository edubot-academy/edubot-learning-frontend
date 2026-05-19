import { useMemo, useState } from 'react';
import {
    FiAlertTriangle,
    FiBookOpen,
    FiChevronDown,
    FiClock,
    FiEye,
    FiFileText,
    FiLayers,
    FiPlayCircle,
} from 'react-icons/fi';
import { formatReadTime } from '@utils/lessonUtils';
import { formatDuration } from '@utils/timeUtils';
import { useTranslation } from 'react-i18next';

const LESSON_KIND_COLORS = {
    video: 'bg-sky-100 text-sky-700',
    article: 'bg-emerald-100 text-emerald-700',
    quiz: 'bg-amber-100 text-amber-800',
    code: 'bg-violet-100 text-violet-700',
};

const stripHtml = (value = '') =>
    String(value)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const getLessonDurationLabel = (lesson, t) => {
    if (!lesson) return null;
    if (lesson.kind === 'article') return formatReadTime(lesson.duration);
    if (lesson.kind === 'video') return formatDuration(lesson.duration);
    if (lesson.kind === 'quiz') return t('instructorDashboard.courseBuilder.lessonKinds.quiz');
    if (lesson.kind === 'code') return t('instructorDashboard.courseBuilder.preview.practice');
    return null;
};

const CoursePreviewPanel = ({
    course,
    sections,
    getSectionTitle,
    onBack,
    actions = [],
    coverAlt = 'cover',
}) => {
    const { t } = useTranslation();
    const [openSections, setOpenSections] = useState({});

    const normalizedSections = useMemo(() => sections || [], [sections]);

    const stats = useMemo(() => {
        const lessons = normalizedSections.flatMap((section) => section.lessons || []);
        const lessonCount = lessons.length;
        const previewCount = lessons.filter((lesson) => lesson.previewVideo).length;
        const videoCount = lessons.filter((lesson) => lesson.kind === 'video').length;
        const articleCount = lessons.filter((lesson) => lesson.kind === 'article').length;
        const quizCount = lessons.filter((lesson) => lesson.kind === 'quiz').length;
        const codeCount = lessons.filter((lesson) => lesson.kind === 'code').length;
        const totalDurationSeconds = lessons.reduce((acc, lesson) => {
            const duration = Number(lesson?.duration);
            return acc + (Number.isFinite(duration) && duration > 0 ? duration : 0);
        }, 0);

        return {
            sectionCount: normalizedSections.length,
            lessonCount,
            previewCount,
            mixLabel: t('instructorDashboard.courseBuilder.preview.mixLabel', {
                video: videoCount,
                article: articleCount,
                quiz: quizCount,
                code: codeCount,
            }),
            totalDurationLabel: formatDuration(totalDurationSeconds) || '—',
        };
    }, [normalizedSections, t]);

    const warnings = useMemo(() => {
        const items = [];

        if (!course?.title?.trim()) items.push(t('instructorDashboard.courseBuilder.preview.warnings.missingCourseTitle'));
        if (!stripHtml(course?.description || '').trim()) items.push(t('instructorDashboard.courseBuilder.preview.warnings.missingDescription'));
        if (!course?.coverImageUrl) items.push(t('instructorDashboard.courseBuilder.preview.warnings.missingCover'));
        if (normalizedSections.length === 0) items.push(t('instructorDashboard.courseBuilder.preview.warnings.noSections'));

        if (stats.previewCount === 0) {
            items.push(t('instructorDashboard.courseBuilder.preview.warnings.noPreviewLessons'));
        }

        normalizedSections.forEach((section, sIdx) => {
            const sectionTitle = getSectionTitle(section, sIdx);
            if (!String(sectionTitle || '').trim()) {
                items.push(t('instructorDashboard.courseBuilder.preview.warnings.sectionMissingTitle', { section: sIdx + 1 }));
            }

            const lessonList = section.lessons || [];
            if (lessonList.length === 0) {
                items.push(t('instructorDashboard.courseBuilder.preview.warnings.sectionNoLessons', { section: sIdx + 1 }));
            }

            lessonList.forEach((lesson, lIdx) => {
                const params = { section: sIdx + 1, lesson: lIdx + 1 };
                if (!lesson?.title?.trim()) {
                    items.push(t('instructorDashboard.courseBuilder.preview.warnings.lessonMissingTitle', params));
                }

                if (lesson?.kind === 'video' && !lesson?.videoKey && !lesson?.videoUrl) {
                    items.push(t('instructorDashboard.courseBuilder.preview.warnings.lessonMissingVideo', params));
                }

                if (lesson?.kind === 'video' || lesson?.kind === 'article') {
                    if (!lesson?.duration || Number(lesson.duration) <= 0) {
                        items.push(t('instructorDashboard.courseBuilder.preview.warnings.lessonMissingDuration', params));
                    }
                }

                if (lesson?.kind === 'article' && !stripHtml(lesson?.content || '').trim()) {
                    items.push(t('instructorDashboard.courseBuilder.preview.warnings.lessonMissingArticleText', params));
                }

                if (lesson?.kind === 'quiz') {
                    const qCount = lesson?.quiz?.questions?.length || 0;
                    if (qCount === 0) {
                        items.push(t('instructorDashboard.courseBuilder.preview.warnings.lessonMissingQuizQuestions', params));
                    }
                }

                if (lesson?.kind === 'code') {
                    const tests = lesson?.challenge?.tests || [];
                    if (!lesson?.challenge || tests.length === 0) {
                        items.push(t('instructorDashboard.courseBuilder.preview.warnings.lessonMissingCodeTests', params));
                    }
                }
            });
        });

        return items;
    }, [course, getSectionTitle, normalizedSections, stats.previewCount, t]);

    const hasBlockingWarnings = warnings.length > 0;

    const learningOutcomes = useMemo(
        () =>
            String(course?.learningOutcomesText || '')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
        [course?.learningOutcomesText]
    );

    const toggleSection = (sectionIdx) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionIdx]: !prev[sectionIdx],
        }));
    };

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                <div className="grid gap-5 md:grid-cols-[1.4fr,1fr]">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <FiBookOpen className="h-3.5 w-3.5" />
                            {t('instructorDashboard.courseBuilder.preview.eyebrow')}
                        </p>
                        <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {course?.title || t('instructorDashboard.courseBuilder.preview.fallbacks.courseTitle')}
                        </h3>
                        {course?.subtitle && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {course.subtitle}
                            </p>
                        )}
                        <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {course?.description || t('instructorDashboard.courseBuilder.preview.fallbacks.description')}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {course?.isPaid
                                    ? t('instructorDashboard.courseBuilder.preview.price', { price: course?.price || 0 })
                                    : t('instructorDashboard.courseBuilder.preview.freeCourse')}
                            </span>
                            {course?.level && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {t('instructorDashboard.courseBuilder.preview.level', { level: course.level })}
                                </span>
                            )}
                            {course?.languageCode && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {t('instructorDashboard.courseBuilder.preview.language', { language: course.languageCode.toUpperCase() })}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        {course?.coverImageUrl ? (
                            <img
                                src={course.coverImageUrl}
                                alt={coverAlt}
                                className="h-full max-h-56 w-full rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                                {t('instructorDashboard.courseBuilder.preview.fallbacks.cover')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('instructorDashboard.courseBuilder.preview.stats.sections')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.sectionCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('instructorDashboard.courseBuilder.preview.stats.lessons')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.lessonCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('instructorDashboard.courseBuilder.preview.stats.totalTime')}</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.totalDurationLabel}
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('instructorDashboard.courseBuilder.preview.stats.previewLessons')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.previewCount}</p>
                </div>
            </div>

            {warnings.length > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
                    <div className="flex items-start gap-3">
                        <FiAlertTriangle className="mt-0.5 h-5 w-5 text-amber-700 dark:text-amber-300" />
                        <div className="w-full">
                            <p className="font-semibold text-amber-800 dark:text-amber-200">
                                {t('instructorDashboard.courseBuilder.preview.warningTitle', { count: warnings.length })}
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
                                {warnings.slice(0, 8).map((warning, idx) => (
                                    <li key={`${warning}-${idx}`}>{warning}</li>
                                ))}
                            </ul>
                            {warnings.length > 8 && (
                                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                    {t('instructorDashboard.courseBuilder.preview.moreWarnings', { count: warnings.length - 8 })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {t('instructorDashboard.courseBuilder.preview.structure')}
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <FiLayers className="h-3.5 w-3.5" />
                        {stats.mixLabel}
                    </span>
                </div>

                <div className="mt-4 space-y-3">
                    {normalizedSections.map((section, sIdx) => {
                        const lessonList = section.lessons || [];
                        const isOpen = openSections[sIdx] ?? true;
                        const sectionPanelId = `course-preview-section-${sIdx}`;

                        return (
                            <div
                                key={sIdx}
                                className="rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-[#151515]"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleSection(sIdx)}
                                    aria-expanded={isOpen}
                                    aria-controls={sectionPanelId}
                                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {getSectionTitle(section, sIdx) ||
                                                t('instructorDashboard.courseBuilder.fallbacks.section', { number: sIdx + 1 })}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('instructorDashboard.courseBuilder.preview.lessonCount', { count: lessonList.length })}
                                        </p>
                                    </div>
                                    <FiChevronDown
                                        className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isOpen && (
                                    <div
                                        id={sectionPanelId}
                                        className="space-y-2 border-t border-slate-200 px-3 py-3 dark:border-slate-700"
                                    >
                                        {lessonList.map((lesson, lIdx) => {
                                            const kind = lesson.kind || 'video';
                                            const durationLabel = getLessonDurationLabel(lesson, t);

                                            return (
                                                <div
                                                    key={lIdx}
                                                    className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#101010]"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                                                            {lesson.title ||
                                                                t('instructorDashboard.courseBuilder.fallbacks.lesson', { number: lIdx + 1 })}
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 ${LESSON_KIND_COLORS[kind] || 'bg-slate-100 text-slate-700'}`}
                                                            >
                                                                {t(`instructorDashboard.courseBuilder.lessonKinds.${kind}`, { defaultValue: kind })}
                                                            </span>
                                                            {durationLabel && (
                                                                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                                    <FiClock className="h-3.5 w-3.5" />
                                                                    {durationLabel}
                                                                </span>
                                                            )}
                                                            {lesson.previewVideo && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                                                                    <FiEye className="h-3.5 w-3.5" />
                                                                    {t('instructorDashboard.courseBuilder.preview.previewBadge')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 text-slate-400">
                                                        {kind === 'video' ? (
                                                            <FiPlayCircle className="h-4 w-4" />
                                                        ) : (
                                                            <FiFileText className="h-4 w-4" />
                                                        )}
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {lessonList.length === 0 && (
                                            <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-500 dark:bg-[#101010] dark:text-slate-400">
                                                {t('instructorDashboard.courseBuilder.preview.emptySection')}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {normalizedSections.length === 0 && (
                        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                            {t('instructorDashboard.courseBuilder.preview.emptyCourse')}
                        </p>
                    )}
                </div>
            </div>

            {learningOutcomes.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                    <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
                        {t('instructorDashboard.courseBuilder.preview.learningOutcomes')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {learningOutcomes.map((line, idx) => (
                            <span
                                key={idx}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                                {line}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="sticky bottom-4 z-10 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-slate-700 dark:bg-[#111111]/95">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100"
                >
                    {t('instructorDashboard.courseBuilder.actions.back')}
                </button>
                {actions.map((action, idx) => (
                    <button
                        type="button"
                        key={`${action.label}-${idx}`}
                        onClick={action.onClick}
                        data-action-intent={action.intent}
                        disabled={action.disabled || (action.requiresClean && hasBlockingWarnings)}
                        aria-disabled={action.disabled || (action.requiresClean && hasBlockingWarnings)}
                        title={
                            action.requiresClean && hasBlockingWarnings
                                ? t('instructorDashboard.courseBuilder.preview.fixWarningsTitle')
                                : action.title
                        }
                        className={
                            action.className ||
                            'rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white disabled:opacity-60'
                        }
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CoursePreviewPanel;

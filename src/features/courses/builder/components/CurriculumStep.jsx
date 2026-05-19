// Curriculum Step component
// Shared between CreateCourse and EditInstructorCourse
// Extracted from Step 2 JSX in both components

import { LESSON_KIND_OPTIONS } from "../../../../constants/lessons";
import LessonQuizEditor from '../../components/LessonQuizEditor';
import LessonChallengeEditor from '../../components/LessonChallengeEditor';
import ArticleEditor from '../../components/ArticleEditor';
import LessonCardHeader from '../../components/LessonCardHeader';
import LessonMetaFields from '../../components/LessonMetaFields';
import LessonAssetsPanel from '../../components/LessonAssetsPanel';
import ConfirmationModal from '../../../../shared/ui/ConfirmationModal';
import { CURRICULUM_WORKSPACE_SECTIONS } from '../constants';
import { minutesInputToSeconds, secondsToMinutesInput } from '../../../../utils/timeUtils';
import { useTranslation } from 'react-i18next';

/**
 * Curriculum Step component
 * Renders the curriculum building interface (Step 2)
 * @param {Object} props - Component props
 * @param {Array} props.curriculum - Curriculum state (sections with lessons)
 * @param {Object} props.curriculumStats - Curriculum statistics
 * @param {boolean} props.isUploading - Whether any files are uploading
 * @param {Object} props.expandedSections - Expanded sections state
 * @param {boolean} props.singleSectionFocus - Single section focus mode
 * @param {number} props.dragSectionIndex - Dragging section index
 * @param {Object} props.dragLesson - Dragging lesson info
 * @param {Array} props.skillOptions - Available skill options
 * @param {boolean} props.skillsLoading - Skills loading state
 * @param {string} props.courseId - Course ID
 * @param {Function} props.handleAddSection - Add section handler
 * @param {Function} props.handleUpdateSectionTitle - Update section title handler
 * @param {Function} props.handleUpdateSectionSkill - Update section skill handler
 * @param {Function} props.handleDeleteSection - Delete section handler
 * @param {Function} props.handleAddLesson - Add lesson handler
 * @param {Function} props.handleUpdateLesson - Update lesson handler
 * @param {Function} props.handleDeleteLesson - Delete lesson handler
 * @param {Function} props.handleQuizChange - Quiz change handler
 * @param {Function} props.handleChallengeChange - Challenge change handler
 * @param {Function} props.handleFileUpload - File upload handler
 * @param {Function} props.handleSectionDrop - Section drop handler
 * @param {Function} props.handleMoveSection - Accessible section move handler
 * @param {Function} props.handleLessonDrop - Lesson drop handler
 * @param {Function} props.handleMoveLesson - Accessible lesson move handler
 * @param {Function} props.openSection - Open section handler
 * @param {Function} props.expandAllSections - Expand all sections handler
 * @param {Function} props.collapseAllSections - Collapse all sections handler
 * @param {Function} props.setSingleSectionFocus - Set single section focus handler
 * @param {Function} props.jumpToNextInvalidLesson - Jump to next invalid lesson handler
 * @param {Function} props.loadSkillsList - Load skills list handler
 * @param {Function} props.handleCurriculumSubmit - Curriculum submit handler
 * @param {Object} props.confirmDelete - Delete confirmation state
 * @param {Function} props.setConfirmDelete - Set delete confirmation handler
 * @param {Function} props.handleConfirmedDelete - Confirmed delete handler
 * @param {boolean} props.disabled - Whether form is disabled
 * @param {boolean} props.saving - Whether saving is in progress
 * @returns {JSX.Element} - Curriculum building interface
 */
export const CurriculumStep = ({
    curriculum,
    curriculumStats,
    isUploading,
    expandedSections,
    setExpandedSections,
    singleSectionFocus,
    dragSectionIndex,
    setDragSectionIndex,
    dragLesson,
    setDragLesson,
    skillOptions,
    skillsLoading,
    courseId,
    handleAddSection,
    handleUpdateSectionTitle,
    handleUpdateSectionSkill,
    handleAddLesson,
    handleUpdateLesson,
    handleQuizChange,
    handleChallengeChange,
    handleFileUpload,
    handleSectionDrop,
    handleMoveSection,
    handleLessonDrop,
    handleMoveLesson,
    openSection,
    expandAllSections,
    collapseAllSections,
    setSingleSectionFocus,
    jumpToNextInvalidLesson,
    loadSkillsList,
    handleCurriculumSubmit,
    confirmDelete,
    setConfirmDelete,
    handleConfirmedDelete,
    disabled = false,
    saving = false,
}) => {
    const { t } = useTranslation();
    const lessonKindOptions = LESSON_KIND_OPTIONS.map((option) => ({
        ...option,
        label: t(`instructorDashboard.courseBuilder.lessonKinds.${option.value}`, {
            defaultValue: option.label,
        }),
    }));

    const getLessonIssue = (lesson) => {
        if (!lesson.title?.trim()) return t('instructorDashboard.courseBuilder.lessonIssues.missingTitle');

        // Check for video using multiple possible property names
        const hasVideo = lesson.videoKey || lesson.videoUrl || lesson.video || lesson.videoFile || lesson.videoPath || lesson.videoSrc;
        if (lesson.kind === 'video' && !hasVideo) return t('instructorDashboard.courseBuilder.lessonIssues.missingVideo');

        if (
            lesson.kind === 'article' &&
            (!lesson.content?.trim() || !lesson.duration || lesson.duration <= 0)
        ) {
            return t('instructorDashboard.courseBuilder.lessonIssues.incompleteArticle');
        }

        if (lesson.kind === 'quiz') {
            // Quiz validation would be handled by the quiz editor
            return null;
        }

        if (lesson.kind === 'code') {
            // Challenge validation would be handled by the challenge editor
            return null;
        }

        return null;
    };

    const getSectionIssueCount = (section) =>
        section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count + 1 : count), 0);

    const getSectionReadyCount = (section) =>
        section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count : count + 1), 0);

    const validationIssues = curriculum.flatMap((section, sectionIndex) =>
        (section.lessons || [])
            .map((lesson, lessonIndex) => ({
                id: `lesson-${sectionIndex}-${lessonIndex}`,
                issue: getLessonIssue(lesson),
                sectionIndex,
                lessonIndex,
            }))
            .filter((item) => Boolean(item.issue))
    );

    const scrollToSection = (sectionIdx) => {
        openSection(sectionIdx);
        requestAnimationFrame(() => {
            document
                .getElementById(`section-${sectionIdx}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const scrollToLessonIssue = (event, item) => {
        event.preventDefault();
        openSection(item.sectionIndex);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document
                    .getElementById(item.id)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    };

    const generateSectionChips = (sections) => {
        return sections.map((section, sIdx) => {
            const hasIssues = getSectionIssueCount(section) > 0;
            const label =
                section.sectionTitle?.trim() ||
                section.title?.trim() ||
                t('instructorDashboard.courseBuilder.fallbacks.section', { number: sIdx + 1 });
            return {
                id: sIdx,
                label,
                hasIssues,
            };
        });
    };

    const sectionChips = generateSectionChips(curriculum);

    const handleDeleteAsset = (sectionIndex, lessonIndex, type) => {
        if (type === 'video') {
            handleUpdateLesson(sectionIndex, lessonIndex, 'videoKey', '');
            handleUpdateLesson(sectionIndex, lessonIndex, 'videoUrl', '');
            handleUpdateLesson(sectionIndex, lessonIndex, 'previewVideo', false);
            return;
        }

        handleUpdateLesson(sectionIndex, lessonIndex, 'resourceKey', '');
        handleUpdateLesson(sectionIndex, lessonIndex, 'resourceUrl', '');
        handleUpdateLesson(sectionIndex, lessonIndex, 'resourceName', '');
    };

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <div
                className="sticky top-20 z-20 rounded-2xl border border-gray-200 bg-white/90 dark:border-gray-700 dark:bg-gray-800/90 backdrop-blur px-4 py-3 shadow-sm"
                data-workspace-section={CURRICULUM_WORKSPACE_SECTIONS.VALIDATION_AND_SAVE.id}
            >
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">{t('instructorDashboard.courseBuilder.curriculum.workspaceMode')}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t('instructorDashboard.courseBuilder.curriculum.stats.sectionsLessons', {
                                sections: curriculumStats.totalSections,
                                lessons: curriculumStats.totalLessons,
                            })}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('instructorDashboard.courseBuilder.curriculum.stats.readiness', {
                                ready: curriculumStats.readyLessons,
                                total: curriculumStats.totalLessons,
                                percent: curriculumStats.completionPercent,
                            })}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <button
                            onClick={() => expandAllSections(curriculum.length)}
                            disabled={disabled}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            {t('instructorDashboard.courseBuilder.actions.expandAll')}
                        </button>
                        <button
                            onClick={() => collapseAllSections(curriculum.length)}
                            disabled={disabled}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            {t('instructorDashboard.courseBuilder.actions.collapseAll')}
                        </button>
                        <button
                            onClick={() => {
                                setSingleSectionFocus((prev) => {
                                    const nextMode = !prev;
                                    if (nextMode) {
                                        const firstOpen = curriculum.findIndex((_, idx) => expandedSections[idx] ?? idx === 0);
                                        const openIdx = firstOpen >= 0 ? firstOpen : 0;
                                        const nextExpanded = {};
                                        for (let idx = 0; idx < curriculum.length; idx += 1) {
                                            nextExpanded[idx] = idx === openIdx;
                                        }
                                        setExpandedSections(nextExpanded);
                                    }
                                    return nextMode;
                                });
                            }}
                            disabled={disabled}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${singleSectionFocus
                                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {singleSectionFocus
                                ? t('instructorDashboard.courseBuilder.actions.singleSectionOn')
                                : t('instructorDashboard.courseBuilder.actions.singleSectionOff')}
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('instructorDashboard.courseBuilder.curriculum.saveHint')}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <button
                            onClick={handleAddSection}
                            disabled={disabled}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            {t('instructorDashboard.courseBuilder.actions.addSection')}
                        </button>
                        <button
                            onClick={jumpToNextInvalidLesson}
                            disabled={disabled}
                            className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                        >
                            {t('instructorDashboard.courseBuilder.actions.findNextIssue')}
                        </button>
                        <button
                            onClick={handleCurriculumSubmit}
                            disabled={isUploading || saving || disabled}
                            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-blue-950"
                        >
                            {saving
                                ? t('instructorDashboard.courseBuilder.actions.saving')
                                : t('instructorDashboard.courseBuilder.actions.saveAndContinue')}
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {sectionChips.map((chip) => (
                        <button
                            key={`section-chip-${chip.id}`}
                            type="button"
                            onClick={() => scrollToSection(chip.id)}
                            disabled={disabled}
                            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${chip.hasIssues
                                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200'
                                }`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Curriculum Sections */}
            <h3 className="text-xl font-semibold mb-4">{t('instructorDashboard.courseBuilder.curriculum.title')}</h3>
            {validationIssues.length > 0 && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                    <p className="font-semibold">{t('instructorDashboard.courseBuilder.curriculum.validationTitle')}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {validationIssues.slice(0, 6).map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(event) => scrollToLessonIssue(event, item)}
                                className="rounded-full border border-amber-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100"
                            >
                                {t('instructorDashboard.courseBuilder.curriculum.issueChip', {
                                    section: item.sectionIndex + 1,
                                    lesson: item.lessonIndex + 1,
                                    issue: item.issue,
                                })}
                            </a>
                        ))}
                    </div>
                </div>
            )}
            {curriculum.map((section, sIdx) => (
                <details
                    id={`section-${sIdx}`}
                    key={section.id ?? section.tempId ?? `section-${sIdx}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleSectionDrop(sIdx)}
                    open={expandedSections[sIdx] ?? sIdx === 0}
                    onToggle={(event) => {
                        const isOpen = event.currentTarget.open;
                        if (singleSectionFocus && isOpen) {
                            const next = {};
                            for (let idx = 0; idx < curriculum.length; idx += 1) next[idx] = idx === sIdx;
                            setExpandedSections(next);
                            return;
                        }
                        setExpandedSections((prevExpanded) => ({
                            ...prevExpanded,
                            [sIdx]: isOpen,
                        }));
                    }}
                    className={`mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-sm transition dark:border-gray-700 dark:bg-gray-800/80 ${dragSectionIndex === sIdx ? 'opacity-80 ring-2 ring-amber-300 dark:ring-amber-600' : ''
                        }`}
                    data-workspace-section={CURRICULUM_WORKSPACE_SECTIONS.STRUCTURE.id}
                >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white px-4 py-3 dark:from-slate-800 dark:to-slate-700">
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {section.sectionTitle ||
                                    section.title ||
                                    t('instructorDashboard.courseBuilder.fallbacks.section', {
                                        number: sIdx + 1,
                                    })}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t('instructorDashboard.courseBuilder.curriculum.sectionSummary', {
                                    lessons: section.lessons.length,
                                    ready: getSectionReadyCount(section),
                                    total: section.lessons.length,
                                })}
                                {getSectionIssueCount(section) > 0 ? (
                                    <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                                        {t('instructorDashboard.courseBuilder.curriculum.issueCount', {
                                            count: getSectionIssueCount(section),
                                        })}
                                    </span>
                                ) : (
                                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                                        {t('instructorDashboard.courseBuilder.status.ready')}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleMoveSection?.(sIdx, 'up');
                                }}
                                disabled={disabled || sIdx === 0}
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-300"
                                aria-label={t('instructorDashboard.courseBuilder.aria.moveSectionUp', {
                                    title:
                                        section.sectionTitle ||
                                        section.title ||
                                        t('instructorDashboard.courseBuilder.fallbacks.section', {
                                            number: sIdx + 1,
                                        }),
                                })}
                            >
                                {t('instructorDashboard.courseBuilder.actions.up')}
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleMoveSection?.(sIdx, 'down');
                                }}
                                disabled={disabled || sIdx === curriculum.length - 1}
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-300"
                                aria-label={t('instructorDashboard.courseBuilder.aria.moveSectionDown', {
                                    title:
                                        section.sectionTitle ||
                                        section.title ||
                                        t('instructorDashboard.courseBuilder.fallbacks.section', {
                                            number: sIdx + 1,
                                        }),
                                })}
                            >
                                {t('instructorDashboard.courseBuilder.actions.down')}
                            </button>
                            <button
                                type="button"
                                draggable
                                onDragStart={() => setDragSectionIndex(sIdx)}
                                onDragEnd={() => setDragSectionIndex(null)}
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                                disabled={disabled}
                                className="group relative cursor-grab rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-300"
                                title={t('instructorDashboard.courseBuilder.aria.dragSection')}
                                aria-label={t('instructorDashboard.courseBuilder.aria.dragSection')}
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 16 16"
                                    className="h-4 w-4"
                                    fill="currentColor"
                                >
                                    <circle cx="5" cy="4" r="1.1" />
                                    <circle cx="11" cy="4" r="1.1" />
                                    <circle cx="5" cy="8" r="1.1" />
                                    <circle cx="11" cy="8" r="1.1" />
                                    <circle cx="5" cy="12" r="1.1" />
                                    <circle cx="11" cy="12" r="1.1" />
                                </svg>
                                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-100 dark:text-slate-900">
                                    {t('instructorDashboard.courseBuilder.aria.dragSection')}
                                </span>
                            </button>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{t('instructorDashboard.courseBuilder.actions.toggle')}</span>
                        </div>
                    </summary>
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
                            <div className="flex-1 flex flex-col gap-3">
                                <input
                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                    value={section.sectionTitle || section.title || ''}
                                    onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                                    placeholder={t('instructorDashboard.courseBuilder.placeholders.sectionTitle')}
                                    disabled={disabled}
                                />
                                <div className="flex flex-col sm:flex-row gap-2 items-start">
                                    <select
                                        className="flex-1 p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                        value={section.skillId || ''}
                                        onChange={(e) => handleUpdateSectionSkill(sIdx, e.target.value)}
                                        disabled={disabled}
                                    >
                                        {skillOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={loadSkillsList}
                                        disabled={disabled || skillsLoading}
                                        className="px-4 py-3 text-sm rounded-lg border bg-white dark:bg-[#222222] disabled:opacity-50"
                                    >
                                        {skillsLoading ? '...' : t('instructorDashboard.courseBuilder.actions.refresh')}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('instructorDashboard.courseBuilder.curriculum.skillHelper')}
                                </p>
                            </div>
                            <div className="flex md:flex-col gap-2 md:items-end">
                                <button
                                    onClick={() =>
                                        setConfirmDelete({
                                            type: 'section',
                                            sectionIndex: sIdx,
                                            title: section.sectionTitle || section.title,
                                        })
                                    }
                                    disabled={disabled}
                                    className="px-4 py-3 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/30 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    {t('instructorDashboard.courseBuilder.actions.delete')}
                                </button>
                            </div>
                        </div>
                        {section.lessons.map((lesson, lIdx) => {
                            const lessonIssue = getLessonIssue(lesson);
                            return (
                                <div
                                    id={`lesson-${sIdx}-${lIdx}`}
                                    key={lesson.id ?? lesson.tempId ?? `lesson-${sIdx}-${lIdx}`}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => handleLessonDrop(sIdx, lIdx)}
                                    className={`mb-4 rounded-xl border p-3 transition ${lessonIssue
                                        ? 'border-rose-200 bg-rose-50/70 dark:border-rose-900/70 dark:bg-rose-950/20'
                                        : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800'
                                        } ${dragLesson?.sectionIdx === sIdx && dragLesson?.lessonIdx === lIdx
                                            ? 'ring-2 ring-sky-300 dark:ring-sky-700 opacity-80'
                                            : ''
                                        }`}
                                    data-workspace-section={CURRICULUM_WORKSPACE_SECTIONS.LESSON_CONTENT.id}
                                >
                                    <LessonCardHeader
                                        lessonIndex={lIdx}
                                        lessonKind={lesson.kind}
                                        lessonIssue={lessonIssue}
                                        onDragStart={() => setDragLesson({ sectionIdx: sIdx, lessonIdx: lIdx })}
                                        onDragEnd={() => setDragLesson(null)}
                                        onDelete={() =>
                                            setConfirmDelete({
                                                type: 'lesson',
                                                sectionIndex: sIdx,
                                                lessonIndex: lIdx,
                                                title: lesson.title,
                                            })
                                        }
                                        disabled={disabled}
                                    />
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {t('instructorDashboard.courseBuilder.curriculum.lessonOrder')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveLesson?.(sIdx, lIdx, 'up')}
                                            disabled={disabled || lIdx === 0}
                                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-300"
                                            aria-label={t('instructorDashboard.courseBuilder.aria.moveLessonUp', {
                                                title:
                                                    lesson.title ||
                                                    t('instructorDashboard.courseBuilder.fallbacks.lesson', {
                                                        number: lIdx + 1,
                                                    }),
                                            })}
                                        >
                                            {t('instructorDashboard.courseBuilder.actions.up')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveLesson?.(sIdx, lIdx, 'down')}
                                            disabled={disabled || lIdx === section.lessons.length - 1}
                                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-300"
                                            aria-label={t('instructorDashboard.courseBuilder.aria.moveLessonDown', {
                                                title:
                                                    lesson.title ||
                                                    t('instructorDashboard.courseBuilder.fallbacks.lesson', {
                                                        number: lIdx + 1,
                                                    }),
                                            })}
                                        >
                                            {t('instructorDashboard.courseBuilder.actions.down')}
                                        </button>
                                    </div>
                                    <LessonMetaFields
                                        title={lesson.title}
                                        kind={lesson.kind || 'video'}
                                        kindOptions={lessonKindOptions}
                                        onTitleChange={(value) => handleUpdateLesson(sIdx, lIdx, 'title', value)}
                                        onKindChange={(value) => handleUpdateLesson(sIdx, lIdx, 'kind', value)}
                                        disabled={disabled}
                                    />

                                    {/* Article Content */}
                                    {lesson.kind === 'article' && (
                                        <>
                                            <label className="block mb-1 font-medium">
                                                {t('instructorDashboard.courseBuilder.curriculum.articleText')}
                                            </label>
                                            <ArticleEditor
                                                value={lesson.content || ''}
                                                onChange={(val) =>
                                                    handleUpdateLesson(sIdx, lIdx, 'content', val)
                                                }
                                                placeholder={t('instructorDashboard.courseBuilder.placeholders.articleText')}
                                                disabled={disabled}
                                            />
                                            <label className="block mb-1 font-medium">
                                                {t('instructorDashboard.courseBuilder.curriculum.readingTime')}
                                            </label>
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                className="w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                                value={secondsToMinutesInput(lesson.duration)}
                                                onChange={(e) => {
                                                    handleUpdateLesson(
                                                        sIdx,
                                                        lIdx,
                                                        'duration',
                                                        minutesInputToSeconds(e.target.value)
                                                    );
                                                }}
                                                placeholder={t('instructorDashboard.courseBuilder.placeholders.minutesExample')}
                                                disabled={disabled}
                                            />
                                        </>
                                    )}

                                    {/* Quiz Editor */}
                                    {lesson.kind === 'quiz' && (
                                        <LessonQuizEditor
                                            quiz={lesson.quiz}
                                            onChange={(newQuiz) =>
                                                handleQuizChange(sIdx, lIdx, newQuiz)
                                            }
                                            disabled={disabled}
                                        />
                                    )}

                                    {/* Challenge Editor */}
                                    {lesson.kind === 'code' && (
                                        <LessonChallengeEditor
                                            challenge={lesson.challenge}
                                            onChange={(newChallenge) =>
                                                handleChallengeChange(sIdx, lIdx, newChallenge)
                                            }
                                            disabled={disabled}
                                        />
                                    )}

                                    {/* File Upload */}
                                    <LessonAssetsPanel
                                        kind={lesson.kind}
                                        onVideoFile={(file) => {
                                            handleFileUpload(courseId, sIdx, lIdx, 'video', file);
                                        }}
                                        videoExists={Boolean(lesson.videoUrl || lesson.videoKey)}
                                        videoProgress={lesson.uploadProgress?.video || 0}
                                        onVideoDelete={() => handleDeleteAsset(sIdx, lIdx, 'video')}
                                        previewVideo={Boolean(lesson.previewVideo)}
                                        onPreviewVideoChange={(checked) =>
                                            handleUpdateLesson(sIdx, lIdx, 'previewVideo', checked)
                                        }
                                        previewLabel={t('instructorDashboard.courseBuilder.assets.previewVideo')}
                                        onResourceFile={(file) => {
                                            handleFileUpload(courseId, sIdx, lIdx, 'resource', file);
                                        }}
                                        resourceExists={Boolean(lesson.resourceUrl || lesson.resourceKey)}
                                        resourceProgress={lesson.uploadProgress?.resource || 0}
                                        onResourceDelete={() => handleDeleteAsset(sIdx, lIdx, 'resource')}
                                    />

                                </div>
                            );
                        })}
                        <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-[#151515]/95">
                            <div className="flex-1">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {t('instructorDashboard.courseBuilder.curriculum.sectionFooter', {
                                        ready: getSectionReadyCount(section),
                                        total: section.lessons.length,
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAddLesson(sIdx)}
                                    disabled={disabled}
                                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                >
                                    {t('instructorDashboard.courseBuilder.actions.addLesson')}
                                </button>
                                <button
                                    onClick={handleCurriculumSubmit}
                                    disabled={disabled || isUploading}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200 transition-colors"
                                >
                                    {t('instructorDashboard.courseBuilder.actions.saveAll')}
                                </button>
                            </div>
                        </div>
                    </div>
                </details>
            ))}

            <ConfirmationModal
                isOpen={Boolean(confirmDelete.type)}
                onClose={() => setConfirmDelete({ type: null, sectionIndex: null, lessonIndex: null, title: '' })}
                onConfirm={handleConfirmedDelete}
                title={
                    confirmDelete.type === 'section'
                        ? t('instructorDashboard.courseBuilder.confirmDelete.sectionTitle')
                        : t('instructorDashboard.courseBuilder.confirmDelete.lessonTitle')
                }
                message={
                    confirmDelete.type === 'section'
                        ? t('instructorDashboard.courseBuilder.confirmDelete.sectionMessage', {
                            title:
                                confirmDelete.title ||
                                t('instructorDashboard.courseBuilder.fallbacks.section', {
                                    number: confirmDelete.sectionIndex + 1,
                                }),
                        })
                        : t('instructorDashboard.courseBuilder.confirmDelete.lessonMessage', {
                            title:
                                confirmDelete.title ||
                                t('instructorDashboard.courseBuilder.fallbacks.lesson', {
                                    number: confirmDelete.lessonIndex + 1,
                                }),
                        })
                }
                confirmLabel={t('instructorDashboard.courseBuilder.confirmDelete.confirm')}
                confirmVariant="danger"
            />
        </div>
    );
};

export default CurriculumStep;

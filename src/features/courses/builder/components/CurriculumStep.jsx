// Curriculum Step component
// Shared between CreateCourse and EditInstructorCourse
// Extracted from Step 2 JSX in both components

import React from 'react';
import { LESSON_KIND_OPTIONS } from "../../../../constants/lessons";
import LessonQuizEditor from '../../components/LessonQuizEditor';
import LessonChallengeEditor from '../../components/LessonChallengeEditor';
import ArticleEditor from '../../components/ArticleEditor';
import CourseBuilderStepNav from '../../components/CourseBuilderStepNav';
import LessonCardHeader from '../../components/LessonCardHeader';
import LessonMetaFields from '../../components/LessonMetaFields';
import LessonAssetsPanel from '../../components/LessonAssetsPanel';
import { minutesInputToSeconds, secondsToMinutesInput } from '../../../../utils/timeUtils';

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
 * @param {Function} props.handleLessonDrop - Lesson drop handler
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
    handleDeleteSection,
    handleAddLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleQuizChange,
    handleChallengeChange,
    handleFileUpload,
    handleSectionDrop,
    handleLessonDrop,
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
    const getLessonIssue = (lesson) => {
        if (!lesson.title?.trim()) return 'Аталыш жок';

        // Check for video using multiple possible property names
        const hasVideo = lesson.videoKey || lesson.videoUrl || lesson.video || lesson.videoFile || lesson.videoPath || lesson.videoSrc;
        if (lesson.kind === 'video' && !hasVideo) return 'Видео жүктөлгөн эмес.';

        if (
            lesson.kind === 'article' &&
            (!lesson.content?.trim() || !lesson.duration || lesson.duration <= 0)
        ) {
            return 'Макала толук эмес';
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

    const scrollToSection = (sectionIdx) => {
        openSection(sectionIdx);
        requestAnimationFrame(() => {
            document
                .getElementById(`section-${sectionIdx}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const reorderExpandedMap = (prevMap, count, fromIdx, toIdx) => {
        const flags = Array.from({ length: count }, (_, idx) => Boolean(prevMap[idx] ?? idx === 0));
        const [moved] = flags.splice(fromIdx, 1);
        flags.splice(toIdx, 0, moved);
        return flags.reduce((acc, flag, idx) => {
            acc[idx] = flag;
            return acc;
        }, {});
    };

    const generateSectionChips = (sections) => {
        return sections.map((section, sIdx) => {
            const hasIssues = getSectionIssueCount(section) > 0;
            const label = section.sectionTitle?.trim() || section.title?.trim() || `Бөлүм ${sIdx + 1}`;
            return {
                id: sIdx,
                label,
                hasIssues,
            };
        });
    };

    const sectionChips = generateSectionChips(curriculum);

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <div className="sticky top-20 z-20 rounded-2xl border border-gray-200 bg-white/90 dark:border-gray-700 dark:bg-gray-800/90 backdrop-blur px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">Курулуш режими</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Бөлүмдөр: {curriculumStats.totalSections} • Сабактар: {curriculumStats.totalLessons}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Даярдык: {curriculumStats.readyLessons}/{curriculumStats.totalLessons} ({curriculumStats.completionPercent}%)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => expandAllSections(curriculum.length)}
                            disabled={disabled}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Баарын ачуу
                        </button>
                        <button
                            onClick={() => collapseAllSections(curriculum.length)}
                            disabled={disabled}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Баарын жабуу
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
                            {singleSectionFocus ? 'Single focus: ON' : 'Single focus: OFF'}
                        </button>
                        <button
                            onClick={handleAddSection}
                            disabled={disabled}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            + Бөлүм кошуу
                        </button>
                        <button
                            onClick={jumpToNextInvalidLesson}
                            disabled={disabled}
                            className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                        >
                            Кийинки катаны табуу
                        </button>
                        <button
                            onClick={handleCurriculumSubmit}
                            disabled={isUploading || saving || disabled}
                            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-blue-950"
                        >
                            {saving ? 'Сакталууда...' : 'Сактоо жане улантуу'}
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
            <h3 className="text-xl font-semibold mb-4">Окуу мазмуну</h3>
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
                >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white px-4 py-3 dark:from-slate-800 dark:to-slate-700">
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {section.sectionTitle || section.title || `Section ${sIdx + 1}`}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {section.lessons.length} сабак · {getSectionReadyCount(section)}/{section.lessons.length} даяр
                                {getSectionIssueCount(section) > 0 ? (
                                    <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                                        {getSectionIssueCount(section)} маселе
                                    </span>
                                ) : (
                                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                                        Даяр
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
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
                                title="Бөлүмдү жылдыруу"
                                aria-label="Бөлүмдү жылдыруу"
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
                                    Бөлүмдү жылдыруу
                                </span>
                            </button>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Ачуу/жабуу</span>
                        </div>
                    </summary>
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
                            <div className="flex-1 flex flex-col gap-3">
                                <input
                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                    value={section.sectionTitle || section.title || ''}
                                    onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                                    placeholder="Бөлүм аталышы"
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
                                        {skillsLoading ? '...' : 'Жаңыртуу'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Skill тандаңыз — ушул бөлүмгө байланышкан лидерборддордо прогресс эсептелет.
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
                                    Өчүрүү
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
                                    <LessonMetaFields
                                        title={lesson.title}
                                        kind={lesson.kind || 'video'}
                                        kindOptions={LESSON_KIND_OPTIONS}
                                        onTitleChange={(value) => handleUpdateLesson(sIdx, lIdx, 'title', value)}
                                        onKindChange={(value) => handleUpdateLesson(sIdx, lIdx, 'kind', value)}
                                        disabled={disabled}
                                    />

                                    {/* Article Content */}
                                    {lesson.kind === 'article' && (
                                        <>
                                            <label className="block mb-1 font-medium">
                                                Макала тексти
                                            </label>
                                            <ArticleEditor
                                                value={lesson.content || ''}
                                                onChange={(val) =>
                                                    handleUpdateLesson(sIdx, lIdx, 'content', val)
                                                }
                                                placeholder="Сабактын негизги тексти"
                                                disabled={disabled}
                                            />
                                            <label className="block mb-1 font-medium">
                                                Окуу убактысы (мүнөт)
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
                                                placeholder="мисалы: 5"
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
                                        previewLabel="Превью видеосун белгилөө"
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
                                    Бул бөлүмдө сабактарды толтуруп, анан жалпы сактоону басыңыз.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAddLesson(sIdx)}
                                    disabled={disabled}
                                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                >
                                    + Сабак кошуу
                                </button>
                                <button
                                    onClick={handleCurriculumSubmit}
                                    disabled={disabled || isUploading}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200 transition-colors"
                                >
                                    Жалпы сактоо
                                </button>
                            </div>
                        </div>
                    </div>
                </details>
            ))}

            {/* Delete Confirmation Modal */}
            {confirmDelete.type && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-sm w-full border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ырастоо</h4>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            {confirmDelete.type === 'section' ? (
                                <span>
                                    "{confirmDelete.title || `Бөлүм ${confirmDelete.sectionIndex + 1}`}" бөлүмүн жана андагы бардык сабактарды өчүрүүнү чын мен каалайсызбы? Бул кайтарылгыс.
                                </span>
                            ) : (
                                <span>
                                    "{confirmDelete.title || `Сабак ${confirmDelete.lessonIndex + 1}`}" сабагын өчүрүүнү чын мен каалайсызбы? Бул кайтарылгыс.
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete({ type: null, sectionIndex: null, lessonIndex: null, title: '' })}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Жокко
                            </button>
                            <button
                                onClick={handleConfirmedDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Ооба, өчүрүү
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumStep;

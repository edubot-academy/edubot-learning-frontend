// Curriculum operations for useCourseBuilder hook
// Extracted from CreateCourse.jsx and EditInstructorCourse.jsx

import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

import {
    getLessonIssue,
    getFirstInvalidLessonTarget,
    getCurriculumStats,
    validateCurriculumStructure,
} from '../validation';
import {
    addSection,
    updateSectionTitle,
    updateSectionSkill,
    removeSection,
    reorderSections,
    addLessonToSection,
    updateLessonInSection,
    removeLessonFromSection,
    reorderLessonsInSection,
    updateLessonQuiz,
    updateLessonChallenge,
    normalizeSkillValue,
    reorderExpandedMap,
    handleLessonKindChange,
    buildLessonPayload,
    createEmptyLesson,
} from '../utils';

import {
    createSection,
    updateSection,
    createLesson,
    updateLesson,
    deleteLesson as deleteLessonApi,
    uploadLessonFile,
    upsertLessonQuiz,
    upsertLessonChallenge,
} from '../../api';

import { getVideoDuration } from '../../../../utils/videoUtils';
import { ensureQuizShape, normalizeQuizForApi } from '../../../../utils/quizUtils';
import { ensureChallengeShape, normalizeChallengeForApi } from '../../../../utils/challengeUtils';
import { isForbiddenError, parseApiError } from '../../../../shared/api/error';

/**
 * Curriculum operations hook
 * @param {Object} courseBuilderState - Main course builder state
 * @returns {Object} - Curriculum operations
 */
export const useCourseBuilderCurriculum = (courseBuilderState) => {
    const {
        curriculum,
        setCurriculum,
        expandedSections,
        setExpandedSections,
        singleSectionFocus,
        dragSectionIndex,
        setDragSectionIndex,
        dragLesson,
        setDragLesson,
        originalSections,
        deletedLessons,
        setDeletedLessons,
        saving,
        setSaving,
        mode,
        courseId,
        navigate,
    } = courseBuilderState;

    // Refs for dirty tracking (edit mode)
    const dirtySectionIdsRef = useRef(new Set());
    const dirtyLessonIdsRef = useRef(new Set());

    // Mark section as dirty (edit mode)
    const markSectionDirtyByIndex = useCallback((sectionIndex, sourceSections = curriculum) => {
        const section = sourceSections?.[sectionIndex];
        if (section?.id) dirtySectionIdsRef.current.add(section.id);
    }, [curriculum]);

    // Mark lesson as dirty (edit mode)
    const markLessonDirtyByIndex = useCallback((sectionIndex, lessonIndex, sourceSections = curriculum) => {
        const lesson = sourceSections?.[sectionIndex]?.lessons?.[lessonIndex];
        if (lesson?.id) dirtyLessonIdsRef.current.add(lesson.id);
    }, [curriculum]);

    // Section operations
    const handleAddSection = useCallback(() => {
        setCurriculum(addSection(curriculum));
    }, [curriculum, setCurriculum]);

    const handleUpdateSectionTitle = useCallback((index, title) => {
        setCurriculum((prev) => {
            const updated = updateSectionTitle(prev, index, title);
            markSectionDirtyByIndex(index, updated);
            return updated;
        });
    }, [setCurriculum, markSectionDirtyByIndex]);

    const handleUpdateSectionSkill = useCallback((index, skillId) => {
        setCurriculum((prev) => {
            const updated = updateSectionSkill(prev, index, skillId);
            markSectionDirtyByIndex(index, updated);
            return updated;
        });
    }, [setCurriculum, markSectionDirtyByIndex]);

    const handleDeleteSection = useCallback((sectionIndex) => {
        // Validation: must have at least one section
        if (curriculum.length === 1) {
            toast.error('Кеминде бир бөлүм болушу керек.');
            return;
        }

        setCurriculum(removeSection(curriculum, sectionIndex));
    }, [curriculum, setCurriculum]);

    // Lesson operations
    const handleAddLesson = useCallback((sectionIndex) => {
        const updated = [...curriculum];
        updated[sectionIndex].lessons.push(createEmptyLesson());
        setCurriculum(updated);
    }, [curriculum, setCurriculum]);

    const handleUpdateLesson = useCallback((sectionIndex, lessonIndex, field, value) => {
        setCurriculum((prev) => {
            let updated = updateLessonInSection(prev, sectionIndex, lessonIndex, field, value);

            // Handle kind-specific logic
            if (field === 'kind') {
                updated[sectionIndex].lessons[lessonIndex] = handleLessonKindChange(
                    updated[sectionIndex].lessons[lessonIndex],
                    value
                );
            }

            markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            markSectionDirtyByIndex(sectionIndex, updated);
            return updated;
        });
    }, [setCurriculum, markLessonDirtyByIndex, markSectionDirtyByIndex]);

    const handleDeleteLesson = useCallback((sectionIndex, lessonIndex) => {
        // Validation: first section must have at least one lesson
        if (sectionIndex === 0 && curriculum[sectionIndex].lessons.length === 1) {
            toast.error('Кеминде бир сабак болушу керек.');
            return;
        }

        setCurriculum((prev) => {
            const updated = removeLessonFromSection(prev, sectionIndex, lessonIndex);
            const lesson = curriculum[sectionIndex].lessons[lessonIndex];

            // Track deleted lesson for edit mode
            if (lesson?.id && mode === 'edit') {
                setDeletedLessons((prevDeleted) => [
                    ...prevDeleted,
                    { sectionId: curriculum[sectionIndex].id, lessonId: lesson.id },
                ]);
                dirtyLessonIdsRef.current.delete(lesson.id);
            }

            markSectionDirtyByIndex(sectionIndex, updated);
            return updated;
        });
    }, [curriculum, setCurriculum, mode, setDeletedLessons, markSectionDirtyByIndex]);

    // Quiz and challenge operations
    const handleQuizChange = useCallback((sectionIndex, lessonIndex, newQuiz) => {
        setCurriculum((prev) => {
            const updated = updateLessonQuiz(prev, sectionIndex, lessonIndex, ensureQuizShape(newQuiz));
            markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            return updated;
        });
    }, [setCurriculum, markLessonDirtyByIndex]);

    const handleChallengeChange = useCallback((sectionIndex, lessonIndex, newChallenge) => {
        setCurriculum((prev) => {
            const updated = updateLessonChallenge(prev, sectionIndex, lessonIndex, ensureChallengeShape(newChallenge));
            markLessonDirtyByIndex(sectionIndex, lessonIndex, updated);
            return updated;
        });
    }, [setCurriculum, markLessonDirtyByIndex]);

    // Drag and drop operations
    const handleSectionDrop = useCallback((targetIdx) => {
        if (dragSectionIndex === null || dragSectionIndex === targetIdx) return;

        setCurriculum((prev) => {
            const next = reorderSections(prev, dragSectionIndex, targetIdx);
            setExpandedSections((prevExpanded) =>
                reorderExpandedMap(prevExpanded, prev.length, dragSectionIndex, targetIdx)
            );

            // Mark affected sections as dirty in edit mode
            if (mode === 'edit') {
                const minIndex = Math.min(dragSectionIndex, targetIdx);
                const maxIndex = Math.max(dragSectionIndex, targetIdx);

                for (let i = minIndex; i <= maxIndex; i++) {
                    if (next[i]?.id) {
                        dirtySectionIdsRef.current.add(next[i].id);
                    }
                }
            }

            return next;
        });
        setDragSectionIndex(null);
    }, [dragSectionIndex, setCurriculum, setExpandedSections, mode]);

    const handleLessonDrop = useCallback((sectionIdx, targetLessonIdx) => {
        if (!dragLesson || dragLesson.sectionIdx !== sectionIdx) return;
        if (dragLesson.lessonIdx === targetLessonIdx) return;

        setCurriculum((prev) => {
            const next = reorderLessonsInSection(prev, sectionIdx, dragLesson.lessonIdx, targetLessonIdx);

            // Mark affected lessons as dirty in edit mode
            if (mode === 'edit') {
                const minIndex = Math.min(dragLesson.lessonIdx, targetLessonIdx);
                const maxIndex = Math.max(dragLesson.lessonIdx, targetLessonIdx);

                for (let i = minIndex; i <= maxIndex; i++) {
                    const lesson = next[sectionIdx].lessons[i];
                    if (lesson?.id) {
                        dirtyLessonIdsRef.current.add(lesson.id);
                    }
                }
            }

            return next;
        });
        setDragLesson(null);
    }, [dragLesson, setCurriculum, mode]);

    // File upload operations
    const handleFileUpload = useCallback(async (courseId, sectionIndex, lessonIndex, type, file) => {
        if (!file || !courseId) {
            return;
        }

        // Auto-save section if it doesn't have an ID
        let sectionId = curriculum[sectionIndex]?.id;
        if (!sectionId) {
            try {
                const sectionPayload = {
                    title: curriculum[sectionIndex].sectionTitle || `Бөлүм ${sectionIndex + 1}`,
                    order: sectionIndex,
                    skillId: normalizeSkillValue(curriculum[sectionIndex].skillId),
                };

                const createdSection = await createSection(courseId, sectionPayload);
                sectionId = createdSection.id;

                // Update the section with the new ID
                setCurriculum((prev) => {
                    const updated = [...prev];
                    updated[sectionIndex].id = sectionId;
                    return updated;
                });

                toast.success('Бөлүм автоматтык түрдө сакталды');
            } catch (error) {
                console.error('Failed to create section:', error);
                toast.error('Бөлүмдү түзүүдө ката кетти. Адегенде кол менен сактаңыз.');
                return;
            }
        }

        // Check if file already exists
        const lesson = curriculum[sectionIndex].lessons[lessonIndex];
        const keyProp = type === 'video' ? 'videoKey' : 'resourceKey';
        if (lesson[keyProp]) return;

        // Set uploading state
        setCurriculum((prev) => {
            const updated = [...prev];
            updated[sectionIndex].lessons[lessonIndex].uploading[type] = true;
            return updated;
        });

        try {
            const key = await uploadLessonFile(
                courseId,
                sectionId,
                type,
                file,
                lessonIndex,
                (percent) => {
                    setCurriculum((prev) => {
                        const updated = [...prev];
                        updated[sectionIndex].lessons[lessonIndex].uploadProgress[type] = percent;
                        return updated;
                    });
                }
            );

            // Extract video duration
            if (type === 'video') {
                try {
                    const duration = await getVideoDuration(file);
                    handleUpdateLesson(sectionIndex, lessonIndex, 'duration', duration);
                } catch (err) {
                    console.warn('Failed to extract video duration', err);
                }
            }

            // Update lesson with file key
            handleUpdateLesson(sectionIndex, lessonIndex, keyProp, key);

            if (type === 'resource') {
                handleUpdateLesson(sectionIndex, lessonIndex, 'resourceName', file.name);
            }
        } catch (err) {
            toast.error(err.message || 'Файл жүктөөдө ката кетти.');
        } finally {
            // Clear uploading state
            setCurriculum((prev) => {
                const updated = [...prev];
                updated[sectionIndex].lessons[lessonIndex].uploading[type] = false;
                return updated;
            });
        }
    }, [courseId, curriculum, setCurriculum, handleUpdateLesson]);

    // UI operations
    const openSection = useCallback((sectionIdx) => {
        if (singleSectionFocus) {
            const next = {};
            for (let idx = 0; idx < curriculum.length; idx += 1) next[idx] = idx === sectionIdx;
            setExpandedSections(next);
            return;
        }
        setExpandedSections((prev) => ({ ...prev, [sectionIdx]: true }));
    }, [singleSectionFocus, curriculum.length, setExpandedSections]);

    const expandInvalidSections = useCallback((indexes) => {
        if (!indexes.length) return;
        setExpandedSections((prev) => {
            const next = { ...prev };
            indexes.forEach((idx) => {
                next[idx] = true;
            });
            return next;
        });
    }, [setExpandedSections]);

    const jumpToNextInvalidLesson = useCallback(() => {
        const target = getFirstInvalidLessonTarget(curriculum);
        if (!target) {
            toast.success('Текшериле турган ката жок.');
            return;
        }
        openSection(target.sIdx);
        requestAnimationFrame(() => {
            document
                .getElementById(`lesson-${target.sIdx}-${target.lIdx}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        toast.error(`Текшерүү керек: ${target.issue}`);
    }, [curriculum, openSection]);

    const expandAllSections = useCallback((count) => {
        const next = {};
        for (let idx = 0; idx < count; idx += 1) next[idx] = true;
        setExpandedSections(next);
    }, [setExpandedSections]);

    const collapseAllSections = useCallback((count) => {
        const next = {};
        for (let idx = 0; idx < count; idx += 1) next[idx] = false;
        setExpandedSections(next);
    }, [setExpandedSections]);

    // Curriculum save operations
    const handleCurriculumSubmit = useCallback(async () => {
        setSaving(true);
        try {
            const { validateCurriculumStructure } = await import('../validation');
            const { errors, invalidSectionIndexes } = validateCurriculumStructure(curriculum);

            if (errors.length > 0) {
                expandInvalidSections(invalidSectionIndexes);
                const target = getFirstInvalidLessonTarget(curriculum);
                if (target) {
                    openSection(target.sIdx);
                    requestAnimationFrame(() => {
                        document
                            .getElementById(`lesson-${target.sIdx}-${target.lIdx}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                    toast.error(`Текшерүү керек: ${target.issue}`);
                } else {
                    toast.error('Айрым сабактар толук эмес.');
                }
                return false;
            }

            // Handle different modes
            if (mode === 'create') {
                // Create mode - save all sections and lessons
                for (const [sIdx, section] of curriculum.entries()) {
                    let sec;

                    // Create section
                    sec = await createSection(courseId, {
                        title: section.sectionTitle || section.title || `Бөлүм ${sIdx + 1}`,
                        order: sIdx,
                        skillId: normalizeSkillValue(section.skillId),
                    });

                    // Update the section with the new ID
                    setCurriculum((prev) => {
                        const updated = [...prev];
                        updated[sIdx].id = sec.id;
                        return updated;
                    });

                    // Save lessons
                    for (const [lIdx, lesson] of section.lessons.entries()) {
                        const isArticle = lesson.kind === 'article';
                        const isQuiz = lesson.kind === 'quiz';
                        const isCode = lesson.kind === 'code';

                        const lessonPayload = {
                            title: lesson.title.trim(),
                            kind: lesson.kind || 'video',
                            content: isArticle ? lesson.content?.trim() || undefined : undefined,
                            videoKey: lesson.kind === 'video' ? lesson.videoKey : undefined,
                            resourceKey: lesson.resourceKey,
                            resourceName: lesson.resourceName?.trim() || undefined,
                            previewVideo: lesson.kind === 'video' ? lesson.previewVideo : false,
                            order: lIdx,
                            duration:
                                lesson.kind === 'video'
                                    ? lesson.duration
                                    : isArticle
                                        ? lesson.duration
                                        : undefined,
                        };

                        const createdLesson = await createLesson(courseId, sec.id, lessonPayload);

                        // Store the lesson ID
                        setCurriculum((prev) => {
                            const updated = [...prev];
                            updated[sIdx].lessons[lIdx].id = createdLesson.id;
                            return updated;
                        });

                        // Save quiz if needed
                        if (isQuiz && lesson.quiz) {
                            const quizPayload = normalizeQuizForApi(ensureQuizShape(lesson.quiz));
                            await upsertLessonQuiz(courseId, sec.id, createdLesson.id, quizPayload);
                        }

                        // Save challenge if needed
                        if (isCode && lesson.challenge) {
                            const challengePayload = normalizeChallengeForApi(
                                ensureChallengeShape(lesson.challenge)
                            );
                            await upsertLessonChallenge(
                                courseId,
                                sec.id,
                                createdLesson.id,
                                challengePayload
                            );
                        }
                    }
                }
            } else {
                // Edit mode - handle updates and deletions
                // Update or create sections
                for (const [sIdx, section] of curriculum.entries()) {
                    let sec;

                    if (section.id && dirtySectionIdsRef.current.has(section.id)) {
                        // Update existing section
                        sec = await updateSection(courseId, section.id, {
                            title: section.sectionTitle || section.title,
                            order: sIdx,
                            skillId: normalizeSkillValue(section.skillId),
                        });
                        dirtySectionIdsRef.current.delete(section.id);
                    } else if (!section.id) {
                        // Create new section
                        sec = await createSection(courseId, {
                            title: section.sectionTitle || section.title || `Бөлүм ${sIdx + 1}`,
                            order: sIdx,
                            skillId: normalizeSkillValue(section.skillId),
                        });

                        // Update the section with the new ID
                        setCurriculum((prev) => {
                            const updated = [...prev];
                            updated[sIdx].id = sec.id;
                            return updated;
                        });
                    } else {
                        sec = section;
                    }

                    // Update or create lessons
                    for (const [lIdx, lesson] of section.lessons.entries()) {
                        const isArticle = lesson.kind === 'article';
                        const isQuiz = lesson.kind === 'quiz';
                        const isCode = lesson.kind === 'code';

                        const lessonPayload = {
                            title: lesson.title.trim(),
                            kind: lesson.kind || 'video',
                            content: isArticle ? lesson.content?.trim() || undefined : undefined,
                            videoKey: lesson.kind === 'video' ? lesson.videoKey : undefined,
                            resourceKey: lesson.resourceKey,
                            resourceName: lesson.resourceName?.trim() || undefined,
                            previewVideo: lesson.kind === 'video' ? lesson.previewVideo : false,
                            order: lIdx,
                            duration:
                                lesson.kind === 'video'
                                    ? lesson.duration
                                    : isArticle
                                        ? lesson.duration
                                        : undefined,
                        };

                        let updatedLesson;

                        if (lesson.id && dirtyLessonIdsRef.current.has(lesson.id)) {
                            // Update existing lesson
                            updatedLesson = await updateLesson(courseId, sec.id, lesson.id, lessonPayload);
                            dirtyLessonIdsRef.current.delete(lesson.id);
                        } else if (!lesson.id) {
                            // Create new lesson
                            updatedLesson = await createLesson(courseId, sec.id, lessonPayload);

                            // Store the lesson ID
                            setCurriculum((prev) => {
                                const updated = [...prev];
                                updated[sIdx].lessons[lIdx].id = updatedLesson.id;
                                return updated;
                            });
                        } else {
                            updatedLesson = lesson;
                        }

                        // Save quiz if needed
                        if (isQuiz && lesson.quiz) {
                            const quizPayload = normalizeQuizForApi(ensureQuizShape(lesson.quiz));
                            await upsertLessonQuiz(courseId, sec.id, updatedLesson.id, quizPayload);
                        }

                        // Save challenge if needed
                        if (isCode && lesson.challenge) {
                            const challengePayload = normalizeChallengeForApi(
                                ensureChallengeShape(lesson.challenge)
                            );
                            await upsertLessonChallenge(
                                courseId,
                                sec.id,
                                updatedLesson.id,
                                challengePayload
                            );
                        }
                    }
                }

                // Delete lessons marked for deletion
                for (const { sectionId, lessonId } of deletedLessons) {
                    try {
                        await deleteLessonApi(courseId, sectionId, lessonId);
                    } catch (error) {
                        console.warn('Failed to delete lesson:', error);
                    }
                }

                // Clear deleted lessons after successful save
                setDeletedLessons([]);
            }

            toast.success(mode === 'create' ? 'Мазмун сакталды!' : 'Бардык өзгөрүүлөр сакталды!');
            return true; // Indicate success
        } catch (err) {
            console.error(err);
            if (isForbiddenError(err)) {
                navigate('/unauthorized');
                return false;
            }
            toast.error(parseApiError(err, mode === 'create' ? 'Мазмунду сактоодо ката кетти.' : 'Өзгөрүүлөрдү сактоодо ката кетти.').message);
            return false;
        } finally {
            setSaving(false);
        }
    }, [curriculum, courseId, mode, navigate, setSaving, setCurriculum, setDeletedLessons, expandInvalidSections, openSection, getFirstInvalidLessonTarget]);

    // Validation
    const validateCurriculum = useCallback(() => {
        const { errors, invalidSectionIndexes } = validateCurriculumStructure(curriculum);
        return {
            isValid: errors.length === 0,
            errors,
            invalidSectionIndexes,
        };
    }, [curriculum]);

    // Get curriculum statistics
    const getStats = useCallback(() => {
        return getCurriculumStats(curriculum);
    }, [curriculum]);

    return {
        // Section operations
        handleAddSection,
        handleUpdateSectionTitle,
        handleUpdateSectionSkill,
        handleDeleteSection,

        // Lesson operations
        handleAddLesson,
        handleUpdateLesson,
        handleDeleteLesson,

        // Content operations
        handleQuizChange,
        handleChallengeChange,
        handleFileUpload,

        // Drag and drop
        handleSectionDrop,
        handleLessonDrop,

        // UI operations
        openSection,
        expandInvalidSections,
        expandAllSections,
        collapseAllSections,
        jumpToNextInvalidLesson,

        // Save operations
        handleCurriculumSubmit,

        // Validation
        validateCurriculum,
        getStats,

        // Access to refs (for save operations)
        dirtySectionIdsRef,
        dirtyLessonIdsRef,
    };
};

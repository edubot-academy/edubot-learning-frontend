// Curriculum validation logic
// Extracted from CreateCourse.jsx getLessonIssue() and EditInstructorCourse.jsx getLessonIssue()
// Combined and normalized for consistency

import { validateQuiz } from '../../../../utils/quizUtils';
import { ensureChallengeShape, normalizeChallengeForApi } from '../../../../utils/challengeUtils';

/**
 * Validates a lesson and returns an error message if invalid
 * @param {Object} lesson - Lesson object
 * @returns {string|null} - Error message or null if valid
 */
export const getLessonIssue = (lesson) => {
    if (!lesson.title?.trim()) return 'Аталыш жок';

    // Check for video using multiple possible property names (from both components)
    const hasVideo = lesson.videoKey || lesson.videoUrl || lesson.video || lesson.videoFile || lesson.videoPath || lesson.videoSrc;
    if (lesson.kind === 'video' && !hasVideo) return 'Видео жүктөлгөн эмес.';

    // Article validation
    if (
        lesson.kind === 'article' &&
        (!lesson.content?.trim() || !lesson.duration || lesson.duration <= 0)
    ) {
        return 'Макала толук эмес';
    }

    // Quiz validation
    if (lesson.kind === 'quiz') {
        const quizErr = validateQuiz(lesson.quiz);
        if (quizErr) return 'Квиз толук эмес';
    }

    // Code challenge validation
    if (lesson.kind === 'code') {
        try {
            normalizeChallengeForApi(ensureChallengeShape(lesson.challenge));
        } catch {
            return 'Код тапшырма толук эмес';
        }
    }

    return null;
};

/**
 * Counts the number of lessons with issues in a section
 * @param {Object} section - Section object with lessons array
 * @returns {number} - Number of lessons with issues
 */
export const getSectionIssueCount = (section) =>
    section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count + 1 : count), 0);

/**
 * Counts the number of ready (valid) lessons in a section
 * @param {Object} section - Section object with lessons array
 * @returns {number} - Number of valid lessons
 */
export const getSectionReadyCount = (section) =>
    section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count : count + 1), 0);

/**
 * Finds the first invalid lesson in the curriculum
 * @param {Array} curriculum - Array of sections
 * @returns {Object|null} - Target object with sIdx, lIdx, issue or null if all valid
 */
export const getFirstInvalidLessonTarget = (curriculum) => {
    for (let sIdx = 0; sIdx < curriculum.length; sIdx += 1) {
        const section = curriculum[sIdx];

        // Skip validation for empty sections (more lenient approach)
        if (!section.lessons || section.lessons.length === 0) {
            continue;
        }

        for (let lIdx = 0; lIdx < section.lessons.length; lIdx += 1) {
            const issue = getLessonIssue(section.lessons[lIdx]);
            if (issue) return { sIdx, lIdx, issue };
        }
    }
    return null;
};

/**
 * Checks if the entire curriculum is valid
 * @param {Array} curriculum - Array of sections
 * @returns {boolean} - True if all lessons are valid
 */
export const isCurriculumValid = (curriculum) => {
    for (const section of curriculum) {
        for (const lesson of section.lessons) {
            if (getLessonIssue(lesson)) return false;
        }
    }
    return true;
};

/**
 * Gets curriculum statistics
 * @param {Array} curriculum - Array of sections
 * @returns {Object} - Statistics object
 */
export const getCurriculumStats = (curriculum) => {
    const totalLessons = curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
    const readyLessons = curriculum.reduce((acc, section) => acc + getSectionReadyCount(section), 0);
    const completionPercent = totalLessons > 0 ? Math.round((readyLessons / totalLessons) * 100) : 0;

    return {
        totalLessons,
        readyLessons,
        completionPercent,
        totalSections: curriculum.length,
        hasIssues: readyLessons < totalLessons,
    };
};

/**
 * Validates section-specific constraints
 * @param {Array} curriculum - Array of sections
 * @returns {Object} - Validation result with errors and valid sections
 */
export const validateCurriculumStructure = (curriculum) => {
    const errors = [];
    const invalidSectionIndexes = [];

    // Must have at least one section
    if (curriculum.length === 0) {
        errors.push('Кеминде бир бөлүм болушу керек');
        return { errors, invalidSectionIndexes, isValid: false };
    }

    // Check each section
    curriculum.forEach((section, index) => {
        // Section must have a title (check both possible field names)
        const sectionTitle = section.sectionTitle || section.title;
        if (!sectionTitle?.trim()) {
            errors.push(`Бөлүм ${index + 1}: Аталыш жок`);
            invalidSectionIndexes.push(index);
        }

        // Only validate lessons if the section has lessons
        // Allow empty sections during editing (more lenient approach)
        if (section.lessons && section.lessons.length > 0) {
            // Check each lesson in the section
            section.lessons.forEach((lesson, lessonIndex) => {
                const lessonIssue = getLessonIssue(lesson);
                if (lessonIssue) {
                    errors.push(`Бөлүм ${index + 1}, Сабак ${lessonIndex + 1}: ${lessonIssue}`);
                    invalidSectionIndexes.push(index);
                }
            });
        }
    });

    return {
        errors,
        invalidSectionIndexes,
        isValid: errors.length === 0,
    };
};

// Lesson-specific utility functions
// Extracted from lesson operations in CreateCourse.jsx and EditInstructorCourse.jsx

import { createEmptyQuiz } from '../../../../utils/quizUtils';
import { createEmptyChallenge } from '../../../../utils/challengeUtils';

/**
 * Creates a lesson payload for API submission
 * @param {Object} lesson - Lesson object
 * @param {number} lessonIndex - Lesson order index
 * @returns {Object} - API-ready lesson payload
 */
export const buildLessonPayload = (lesson, lessonIndex) => {
    const isArticle = lesson.kind === 'article';
    const isVideo = lesson.kind === 'video';

    return {
        title: lesson.title.trim(),
        kind: lesson.kind || 'video',
        content: isArticle ? lesson.content?.trim() || undefined : undefined,
        videoKey: isVideo ? lesson.videoKey : undefined,
        resourceKey: lesson.resourceKey,
        resourceName: lesson.resourceName?.trim() || undefined,
        previewVideo: isVideo ? lesson.previewVideo : false,
        order: lessonIndex,
        duration: isVideo || isArticle ? lesson.duration : undefined,
    };
};

/**
 * Initializes lesson kind-specific data
 * @param {Object} lesson - Lesson object
 * @param {string} kind - Lesson kind
 * @returns {Object} - Updated lesson object
 */
export const initializeLessonKindData = (lesson, kind) => {
    const updated = { ...lesson };

    switch (kind) {
        case 'article':
            updated.previewVideo = false;
            break;
        case 'quiz':
            updated.previewVideo = false;
            updated.videoKey = '';
            if (!updated.quiz) {
                updated.quiz = createEmptyQuiz();
            }
            break;
        case 'code':
            updated.previewVideo = false;
            updated.videoKey = '';
            if (!updated.challenge) {
                updated.challenge = createEmptyChallenge();
            }
            break;
        default:
            // video or other
            break;
    }

    return updated;
};

/**
 * Validates lesson kind change and updates lesson accordingly
 * @param {Object} lesson - Current lesson object
 * @param {string} newKind - New lesson kind
 * @returns {Object} - Updated lesson object
 */
export const handleLessonKindChange = (lesson, newKind) => {
    let updated = { ...lesson, kind: newKind };

    // Reset kind-specific properties when changing
    if (newKind === 'article') {
        updated.previewVideo = false;
    } else if (newKind === 'quiz') {
        updated.previewVideo = false;
        updated.videoKey = '';
        updated.quiz = updated.quiz || createEmptyQuiz();
    } else if (newKind === 'code') {
        updated.previewVideo = false;
        updated.videoKey = '';
        updated.challenge = updated.challenge || createEmptyChallenge();
    }

    return updated;
};

/**
 * Checks if lesson has required content based on its kind
 * @param {Object} lesson - Lesson object
 * @returns {boolean} - True if lesson has required content
 */
export const hasLessonContent = (lesson) => {
    switch (lesson.kind) {
        case 'video':
            return Boolean(lesson.videoKey || lesson.videoUrl || lesson.video);
        case 'article':
            return Boolean(lesson.content?.trim() && lesson.duration && lesson.duration > 0);
        case 'quiz':
            return Boolean(lesson.quiz);
        case 'code':
            return Boolean(lesson.challenge);
        default:
            return false;
    }
};

/**
 * Gets lesson display name
 * @param {Object} lesson - Lesson object
 * @param {number} index - Lesson index
 * @returns {string} - Display name
 */
export const getLessonDisplayName = (lesson, index) => {
    const title = lesson.title?.trim();
    return title || `Сабак ${index + 1}`;
};

/**
 * Checks if lesson is complete (ready for submission)
 * @param {Object} lesson - Lesson object
 * @returns {boolean} - True if lesson is complete
 */
export const isLessonComplete = (lesson) => {
    // Must have a title
    if (!lesson.title?.trim()) return false;

    // Must have content based on kind
    if (!hasLessonContent(lesson)) return false;

    return true;
};

/**
 * Gets lesson status for UI display
 * @param {Object} lesson - Lesson object
 * @returns {Object} - Status object with text and severity
 */
export const getLessonStatus = (lesson) => {
    if (!lesson.title?.trim()) {
        return { text: 'Аталыш жок', severity: 'error' };
    }

    if (!hasLessonContent(lesson)) {
        switch (lesson.kind) {
            case 'video':
                return { text: 'Видео жүктөлгөн эмес', severity: 'error' };
            case 'article':
                return { text: 'Макала толук эмес', severity: 'error' };
            case 'quiz':
                return { text: 'Квиз толук эмес', severity: 'error' };
            case 'code':
                return { text: 'Код тапшырма толук эмес', severity: 'error' };
            default:
                return { text: 'Мазмун жок', severity: 'error' };
        }
    }

    return { text: 'Даяр', severity: 'success' };
};

/**
 * Gets lesson kind display label
 * @param {string} kind - Lesson kind
 * @returns {string} - Display label
 */
export const getLessonKindLabel = (kind) => {
    const labels = {
        video: 'Видео',
        article: 'Макала',
        quiz: 'Квиз',
        code: 'Код тапшырма',
    };
    return labels[kind] || kind;
};

/**
 * Checks if lesson supports preview video
 * @param {string} kind - Lesson kind
 * @returns {boolean} - True if supports preview video
 */
export const supportsPreviewVideo = (kind) => {
    return kind === 'video';
};

/**
 * Gets lesson duration in human-readable format
 * @param {Object} lesson - Lesson object
 * @returns {string} - Duration text
 */
export const getLessonDurationText = (lesson) => {
    if (!lesson.duration || lesson.duration <= 0) return '';

    const minutes = Math.floor(lesson.duration / 60);
    const seconds = lesson.duration % 60;

    if (minutes === 0) return `${seconds}с`;
    if (seconds === 0) return `${minutes}м`;
    return `${minutes}м ${seconds}с`;
};

/**
 * Compares two lessons for equality (ignoring transient state)
 * @param {Object} lesson1 - First lesson
 * @param {Object} lesson2 - Second lesson
 * @returns {boolean} - True if lessons are equal in content
 */
export const areLessonsEqual = (lesson1, lesson2) => {
    const normalize = (lesson) => ({
        title: lesson.title?.trim() || '',
        kind: lesson.kind || 'video',
        content: lesson.content?.trim() || '',
        videoKey: lesson.videoKey || '',
        resourceKey: lesson.resourceKey || '',
        resourceName: lesson.resourceName?.trim() || '',
        previewVideo: Boolean(lesson.previewVideo),
        duration: lesson.duration,
        // Note: quiz and challenge comparison would require deeper logic
    });

    const normalized1 = normalize(lesson1);
    const normalized2 = normalize(lesson2);

    return JSON.stringify(normalized1) === JSON.stringify(normalized2);
};

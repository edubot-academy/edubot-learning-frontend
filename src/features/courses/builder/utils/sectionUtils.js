// Section-specific utility functions
// Extracted from section operations in CreateCourse.jsx and EditInstructorCourse.jsx

import { createEmptyLesson } from './courseBuilderUtils';

/**
 * Adds a new section to the curriculum
 * @param {Array} curriculum - Current curriculum array
 * @returns {Array} - Updated curriculum with new section
 */
export const addSection = (curriculum) => {
    return [
        ...curriculum,
        {
            sectionTitle: `Бөлүм ${curriculum.length + 1}`,
            skillId: '',
            lessons: [],
        },
    ];
};

/**
 * Updates section title
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index to update
 * @param {string} title - New title
 * @returns {Array} - Updated curriculum
 */
export const updateSectionTitle = (curriculum, sectionIndex, title) => {
    const updated = [...curriculum];
    updated[sectionIndex].sectionTitle = title;
    return updated;
};

/**
 * Updates section skill assignment
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index to update
 * @param {string|number} skillId - New skill ID
 * @returns {Array} - Updated curriculum
 */
export const updateSectionSkill = (curriculum, sectionIndex, skillId) => {
    const updated = [...curriculum];
    updated[sectionIndex].skillId = skillId;
    return updated;
};

/**
 * Removes a section from the curriculum
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index to remove
 * @returns {Array} - Updated curriculum
 */
export const removeSection = (curriculum, sectionIndex) => {
    return curriculum.filter((_, i) => i !== sectionIndex);
};

/**
 * Reorders sections by moving one section to a new position
 * @param {Array} curriculum - Current curriculum array
 * @param {number} fromIndex - Source section index
 * @param {number} toIndex - Target section index
 * @returns {Array} - Updated curriculum with reordered sections
 */
export const reorderSections = (curriculum, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return curriculum;
    
    const updated = [...curriculum];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    return updated;
};

/**
 * Adds a lesson to a specific section
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index to add lesson to
 * @returns {Array} - Updated curriculum with new lesson
 */
export const addLessonToSection = (curriculum, sectionIndex) => {
    const updated = [...curriculum];
    updated[sectionIndex].lessons.push(createEmptyLesson());
    return updated;
};

/**
 * Updates a lesson in a section
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @param {string} field - Field name to update
 * @param {*} value - New value
 * @returns {Array} - Updated curriculum
 */
export const updateLessonInSection = (curriculum, sectionIndex, lessonIndex, field, value) => {
    const updated = [...curriculum];
    const lesson = updated[sectionIndex].lessons[lessonIndex];
    lesson[field] = value;

    // Handle kind-specific logic
    if (field === 'kind') {
        if (value === 'article') {
            lesson.previewVideo = false;
        }
        if (value === 'quiz') {
            lesson.previewVideo = false;
            lesson.videoKey = '';
        }
        if (value === 'code') {
            lesson.previewVideo = false;
            lesson.videoKey = '';
        }
    }

    return updated;
};

/**
 * Removes a lesson from a section
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @returns {Array} - Updated curriculum with lesson removed
 */
export const removeLessonFromSection = (curriculum, sectionIndex, lessonIndex) => {
    const updated = [...curriculum];
    updated[sectionIndex].lessons.splice(lessonIndex, 1);
    return updated;
};

/**
 * Reorders lessons within a section
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} fromLessonIndex - Source lesson index
 * @param {number} toLessonIndex - Target lesson index
 * @returns {Array} - Updated curriculum with reordered lessons
 */
export const reorderLessonsInSection = (curriculum, sectionIndex, fromLessonIndex, toLessonIndex) => {
    if (fromLessonIndex === toLessonIndex) return curriculum;
    
    const updated = [...curriculum];
    const lessons = [...updated[sectionIndex].lessons];
    const [moved] = lessons.splice(fromLessonIndex, 1);
    lessons.splice(toLessonIndex, 0, moved);
    updated[sectionIndex] = { ...updated[sectionIndex], lessons };
    return updated;
};

/**
 * Updates lesson upload progress
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @param {string} type - Upload type ('video' or 'resource')
 * @param {number} percent - Progress percentage (0-100)
 * @returns {Array} - Updated curriculum
 */
export const updateLessonUploadProgress = (curriculum, sectionIndex, lessonIndex, type, percent) => {
    const updated = [...curriculum];
    updated[sectionIndex].lessons[lessonIndex].uploadProgress[type] = percent;
    return updated;
};

/**
 * Sets lesson uploading state
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @param {string} type - Upload type ('video' or 'resource')
 * @param {boolean} uploading - Upload state
 * @returns {Array} - Updated curriculum
 */
export const setLessonUploading = (curriculum, sectionIndex, lessonIndex, type, uploading) => {
    const updated = [...curriculum];
    updated[sectionIndex].lessons[lessonIndex].uploading[type] = uploading;
    return updated;
};

/**
 * Updates lesson quiz data
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @param {Object} quiz - Quiz data
 * @returns {Array} - Updated curriculum
 */
export const updateLessonQuiz = (curriculum, sectionIndex, lessonIndex, quiz) => {
    const updated = [...curriculum];
    updated[sectionIndex].lessons[lessonIndex].quiz = quiz;
    return updated;
};

/**
 * Updates lesson challenge data
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @param {Object} challenge - Challenge data
 * @returns {Array} - Updated curriculum
 */
export const updateLessonChallenge = (curriculum, sectionIndex, lessonIndex, challenge) => {
    const updated = [...curriculum];
    updated[sectionIndex].lessons[lessonIndex].challenge = challenge;
    return updated;
};

/**
 * Gets section by index safely
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @returns {Object|null} - Section object or null if not found
 */
export const getSectionByIndex = (curriculum, sectionIndex) => {
    return curriculum[sectionIndex] || null;
};

/**
 * Gets lesson by section and lesson index safely
 * @param {Array} curriculum - Current curriculum array
 * @param {number} sectionIndex - Section index
 * @param {number} lessonIndex - Lesson index
 * @returns {Object|null} - Lesson object or null if not found
 */
export const getLessonByIndex = (curriculum, sectionIndex, lessonIndex) => {
    const section = getSectionByIndex(curriculum, sectionIndex);
    return section?.lessons[lessonIndex] || null;
};

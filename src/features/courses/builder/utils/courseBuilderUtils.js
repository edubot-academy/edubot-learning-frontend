// General course builder utility functions
// Extracted from common patterns in CreateCourse.jsx and EditInstructorCourse.jsx

import { DEFAULT_LESSON, DEFAULT_SECTION } from '../constants';
import { getCourseInfoErrors, validateCurriculumStructure } from '../validation';

/**
 * Normalizes skill value for API compatibility
 * Handles both string and numeric skill IDs
 * @param {string|number} value - Skill value to normalize
 * @returns {string|number|undefined} - Normalized value
 */
export const normalizeSkillValue = (value) => {
    if (!value) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
};

/**
 * Converts skill value to string for form inputs
 * @param {string|number|undefined|null} value - Skill value
 * @returns {string} - String representation
 */
export const toSkillValue = (value) => {
    if (value === undefined || value === null) return '';
    return String(value);
};

/**
 * Resolves section skill value from various possible properties
 * Used in EditInstructorCourse for backward compatibility
 * @param {Object} sectionLike - Object with skill properties
 * @param {Array} options - Skill options array
 * @returns {string} - Resolved skill value
 */
export const resolveSectionSkillValue = (sectionLike, options = []) => {
    const optionSet = new Set(options.map((o) => o.value));
    const candidates = [
        sectionLike?.skillId,
        sectionLike?.skill?.id,
        sectionLike?.skillSlug,
        sectionLike?.skill?.slug,
    ]
        .map(toSkillValue)
        .filter(Boolean);
    const match = candidates.find((val) => optionSet.has(val));
    return match ?? (candidates[0] || '');
};

/**
 * Creates a comparable skill value for change detection
 * @param {string|number} value - Skill value
 * @returns {string|number|null} - Comparable value
 */
export const toComparableSectionSkill = (value) => normalizeSkillValue(value) ?? null;

/**
 * Prepares learning outcomes text for API
 * Converts textarea string to array format
 * @param {string} text - Learning outcomes text (newline separated)
 * @returns {Array|string} - Array of outcomes or empty string
 */
export const prepareLearningOutcomes = (text) => {
    const outcomes = text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    return outcomes.length > 0 ? outcomes : undefined;
};

/**
 * Prepares course info for API submission
 * Normalizes and formats course data
 * @param {Object} courseInfo - Course information object
 * @returns {Object} - API-ready course data
 */
export const prepareCourseInfoForApi = (courseInfo) => {
    return {
        title: courseInfo.title,
        description: courseInfo.description,
        categoryId: parseInt(courseInfo.categoryId, 10),
        price: Number(courseInfo.isPaid ? courseInfo.price : 0),
        subtitle: courseInfo.subtitle || undefined,
        languageCode: courseInfo.languageCode || 'ky',
        learningOutcomes: prepareLearningOutcomes(courseInfo.learningOutcomesText || ''),
        aiAssistantEnabled: Boolean(courseInfo.aiAssistantEnabled),
        isPaid: Boolean(courseInfo.isPaid),
    };
};

/**
 * Creates an empty lesson object
 * @returns {Object} - Default lesson structure
 */
export const createEmptyLesson = () => ({
    ...DEFAULT_LESSON,
    tempId: generateTempId(),
    uploading: { ...DEFAULT_LESSON.uploading },
    uploadProgress: { ...DEFAULT_LESSON.uploadProgress },
    resources: [...(DEFAULT_LESSON.resources || [])],
});

/**
 * Creates an empty section object
 * @param {number} index - Section index for title generation
 * @returns {Object} - Default section structure
 */
export const createEmptySection = (index = 1) => ({
    ...DEFAULT_SECTION,
    tempId: generateTempId(),
    sectionTitle: `Бөлүм ${index}`,
    lessons: [...DEFAULT_SECTION.lessons],
});

/**
 * Updates expanded sections map for drag and drop reordering
 * @param {Object} prevMap - Previous expanded sections map
 * @param {number} count - Total number of sections
 * @param {number} fromIdx - Source index
 * @param {number} toIdx - Target index
 * @returns {Object} - Updated expanded sections map
 */
export const reorderExpandedMap = (prevMap, count, fromIdx, toIdx) => {
    const flags = Array.from({ length: count }, (_, idx) => Boolean(prevMap[idx] ?? idx === 0));
    const [moved] = flags.splice(fromIdx, 1);
    flags.splice(toIdx, 0, moved);
    return flags.reduce((acc, flag, idx) => {
        acc[idx] = flag;
        return acc;
    }, {});
};

/**
 * Generates section chips data for navigation
 * @param {Array} sections - Array of sections
 * @param {Function} getIssueCount - Function to get issue count
 * @returns {Array} - Section chip data
 */
export const generateSectionChips = (sections, getIssueCount) => {
    return sections.map((section, sIdx) => {
        const hasIssues = getIssueCount(section) > 0;
        const label = section.sectionTitle?.trim() || section.title?.trim() || `Бөлүм ${sIdx + 1}`;
        return {
            id: sIdx,
            label,
            hasIssues,
        };
    });
};

/**
 * Checks if any lessons are currently uploading
 * @param {Array} curriculum - Array of sections
 * @returns {boolean} - True if any lesson is uploading
 */
export const isAnyLessonUploading = (curriculum) => {
    return curriculum.some((section) =>
        section.lessons.some((lesson) => lesson.uploading?.video || lesson.uploading?.resource)
    );
};

/**
 * Generates a unique ID for temporary items
 * @returns {string} - Unique ID
 */
export const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Deep clones an object safely
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const safeClone = (obj) => {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('Failed to clone object:', error);
        return obj;
    }
};

/**
 * Gets step items with completion status
 * @param {number} currentStep - Current step number
 * @param {Object} courseInfo - Course information
 * @param {Array} curriculum - Curriculum array
 * @returns {Array} - Step items with completion status
 */
export const getStepItems = (currentStep, courseInfo, curriculum) => {
    const step1Completed = currentStep > 1 || (currentStep === 1 && Object.keys(getCourseInfoErrors(courseInfo)).length === 0);
    const step2Completed = currentStep > 2 || (currentStep === 2 && validateCurriculumStructure(curriculum));

    return [
        {
            key: 'info',
            label: 'Курс маалыматы',
            completed: step1Completed,
            enabled: true, // Always allow navigation
        },
        {
            key: 'curriculum',
            label: 'Окуу мазмуну',
            completed: step2Completed,
            enabled: true, // Always allow navigation
        },
        {
            key: 'media',
            label: 'Медиа жане баскаруу',
            completed: currentStep > 2,
            enabled: true, // Always allow navigation
        },
    ];
};

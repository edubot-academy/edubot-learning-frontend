// Main export file for course builder
// Provides easy access to all hooks, components, utilities, and constants

// Hooks
export { useCourseBuilder, useCourseBuilderInfo, useCourseBuilderCurriculum } from './hooks';

// Components
export { CourseInfoStep, CurriculumStep, PreviewStep } from './components';

// Validation
export {
    getCourseInfoErrors,
    isCourseInfoValid,
    validateCourseInfoField,
    getAllCourseInfoFieldsTouched,
    getLessonIssue,
    getSectionIssueCount,
    getSectionReadyCount,
    getFirstInvalidLessonTarget,
    isCurriculumValid,
    getCurriculumStats,
    validateCurriculumStructure,
} from './validation';

// Utilities
export {
    normalizeSkillValue,
    toSkillValue,
    resolveSectionSkillValue,
    toComparableSectionSkill,
    prepareLearningOutcomes,
    prepareCourseInfoForApi,
    createEmptyLesson,
    createEmptySection,
    reorderExpandedMap,
    generateSectionChips,
    isAnyLessonUploading,
    generateTempId,
    safeClone,
    addSection,
    updateSectionTitle,
    updateSectionSkill,
    removeSection,
    reorderSections,
    addLessonToSection,
    updateLessonInSection,
    removeLessonFromSection,
    reorderLessonsInSection,
    updateLessonUploadProgress,
    setLessonUploading,
    updateLessonQuiz,
    updateLessonChallenge,
    getSectionByIndex,
    getLessonByIndex,
    buildLessonPayload,
    initializeLessonKindData,
    handleLessonKindChange,
    hasLessonContent,
    getLessonDisplayName,
    isLessonComplete,
    getLessonStatus,
    getLessonKindLabel,
    supportsPreviewVideo,
    getLessonDurationText,
    areLessonsEqual,
    validateFileForUpload,
    validateCoverImage,
    handleFileUpload,
    handleLessonFileUpload,
    createFilePreviewUrl,
    revokeFilePreviewUrl,
    getFileExtension,
    formatFileSize,
    isVideoFile,
    isImageFile,
} from './utils';

// Constants
export {
    DEFAULT_COURSE_INFO,
    DEFAULT_CURRICULUM,
    DEFAULT_LESSON,
    DEFAULT_SECTION,
    STEP_ITEMS,
} from './constants';

// Step items function (from utils to avoid circular import)
export { getStepItems } from './utils';

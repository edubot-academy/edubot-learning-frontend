// Export all utility functions for easy importing

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
    getStepItems,
} from './courseBuilderUtils';

export {
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
} from './sectionUtils';

export {
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
} from './lessonUtils';

export {
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
} from './fileUploadUtils';

// Export all validation functions for easy importing

export {
    getCourseInfoErrors,
    isCourseInfoValid,
    validateCourseInfoField,
    getAllCourseInfoFieldsTouched,
} from './courseInfoValidation';

export {
    getLessonIssue,
    getSectionIssueCount,
    getSectionReadyCount,
    getFirstInvalidLessonTarget,
    isCurriculumValid,
    getCurriculumStats,
    validateCurriculumStructure,
} from './curriculumValidation';

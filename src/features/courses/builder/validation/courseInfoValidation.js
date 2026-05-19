import i18n from '../../../../i18n';

// Course info validation logic
// Extracted from CreateCourse.jsx getCourseInfoErrors() and EditInstructorCourse.jsx getCourseInfoErrors()
// Combined and normalized for consistency

/**
 * Validates course information and returns error messages
 * @param {Object} info - Course information object
 * @returns {Object} - Errors object with field names as keys
 */
export const getCourseInfoErrors = (info = {}, t = i18n.t.bind(i18n)) => {
    const errors = {};

    // Title validation
    if (!info.title?.trim()) {
        errors.title = t('instructorDashboard.courseBuilder.validation.titleRequired');
    } else if (info.title.length > 200) {
        errors.title = t('instructorDashboard.courseBuilder.validation.maxChars', { max: 200 });
    }

    // Subtitle validation
    if (info.subtitle && info.subtitle.length > 255) {
        errors.subtitle = t('instructorDashboard.courseBuilder.validation.maxChars', { max: 255 });
    }

    // Description validation
    if (!info.description?.trim()) {
        errors.description = t('instructorDashboard.courseBuilder.validation.descriptionRequired');
    }

    // Category validation
    if (!info.categoryId) {
        errors.categoryId = t('instructorDashboard.courseBuilder.validation.categoryRequired');
    }

    // Language validation
    if (!info.languageCode) {
        errors.languageCode = t('instructorDashboard.courseBuilder.validation.languageRequired');
    }

    // Price validation (only for paid courses)
    if (info.isPaid && (!Number.isFinite(Number(info.price)) || Number(info.price) <= 0)) {
        errors.price = t('instructorDashboard.courseBuilder.validation.pricePositive');
    }

    return errors;
};

/**
 * Checks if course info has any validation errors
 * @param {Object} info - Course information object
 * @returns {boolean} - True if valid, false if has errors
 */
export const isCourseInfoValid = (info, t) => {
    const errors = getCourseInfoErrors(info, t);
    return Object.keys(errors).length === 0;
};

/**
 * Validates a specific field in course info
 * @param {Object} info - Course information object
 * @param {string} fieldName - Field name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateCourseInfoField = (info, fieldName, t) => {
    const errors = getCourseInfoErrors(info, t);
    return errors[fieldName] || null;
};

/**
 * Gets all fields that should be marked as touched for validation display
 * @returns {Object} - Object with all relevant fields set to true
 */
export const getAllCourseInfoFieldsTouched = () => ({
    title: true,
    subtitle: true,
    description: true,
    categoryId: true,
    price: true,
    languageCode: true,
});

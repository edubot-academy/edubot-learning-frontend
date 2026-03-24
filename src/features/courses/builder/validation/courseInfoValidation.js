// Course info validation logic
// Extracted from CreateCourse.jsx getCourseInfoErrors() and EditInstructorCourse.jsx getCourseInfoErrors()
// Combined and normalized for consistency

/**
 * Validates course information and returns error messages
 * @param {Object} info - Course information object
 * @returns {Object} - Errors object with field names as keys
 */
export const getCourseInfoErrors = (info = {}) => {
    const errors = {};

    // Title validation
    if (!info.title?.trim()) {
        errors.title = 'Курс аталышы милдеттүү';
    } else if (info.title.length > 200) {
        errors.title = 'Максимум 200 символ';
    }

    // Subtitle validation
    if (info.subtitle && info.subtitle.length > 255) {
        errors.subtitle = 'Максимум 255 символ';
    }

    // Description validation
    if (!info.description?.trim()) {
        errors.description = 'Сүрөттөмө милдеттүү';
    }

    // Category validation
    if (!info.categoryId) {
        errors.categoryId = 'Категория тандаңыз';
    }

    // Language validation
    if (!info.languageCode) {
        errors.languageCode = 'Тилди тандаңыз';
    }

    // Price validation (only for paid courses)
    if (info.isPaid && (!Number.isFinite(Number(info.price)) || Number(info.price) <= 0)) {
        errors.price = 'Акы төлөнүүчү курс үчүн баа 0дөн чоң болушу керек';
    }

    return errors;
};

/**
 * Checks if course info has any validation errors
 * @param {Object} info - Course information object
 * @returns {boolean} - True if valid, false if has errors
 */
export const isCourseInfoValid = (info) => {
    const errors = getCourseInfoErrors(info);
    return Object.keys(errors).length === 0;
};

/**
 * Validates a specific field in course info
 * @param {Object} info - Course information object
 * @param {string} fieldName - Field name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateCourseInfoField = (info, fieldName) => {
    const errors = getCourseInfoErrors(info);
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

/**
 * Creates a courses lookup map from courses array
 * @param {Array} courses - Array of course objects
 * @returns {Object} Map with course.id as key
 */
export const createCoursesById = (courses) => {
    return courses.reduce((acc, course) => {
        acc[course.id] = course;
        return acc;
    }, {});
};

/**
 * Builds course counts from enrollment data
 * @param {Array} courseIds - Array of course IDs
 * @param {Object} enrollmentsMap - Map of studentId to array of enrolled course IDs
 * @returns {Object} Map with courseId as key and count as value
 */
export const buildCourseCounts = (courseIds, enrollmentsMap) => {
    const counts = {};
    
    courseIds.forEach((courseId) => {
        counts[courseId] = 0;

        Object.entries(enrollmentsMap).forEach(([studentId, studentCourseIds]) => {
            if (Array.isArray(studentCourseIds) && studentCourseIds.includes(courseId)) {
                counts[courseId] += 1;
            }
        });
    });

    return counts;
};

/**
 * Builds set of enrolled student IDs
 * @param {Object} enrollmentsMap - Map of studentId to array of enrolled course IDs
 * @returns {Set} Set of student IDs who have enrollments
 */
export const buildEnrolledStudentSet = (enrollmentsMap) => {
    const enrolledSet = new Set();

    Object.values(enrollmentsMap).forEach((studentCourseIds) => {
        if (Array.isArray(studentCourseIds)) {
            studentCourseIds.forEach((courseId) => {
                // Note: This function needs studentId, but current implementation only has courseIds
                // This is a limitation in the original code that we're preserving
            });
        }
    });

    // Original logic from the component - this needs to be fixed in the hook
    Object.entries(enrollmentsMap).forEach(([studentId, studentCourseIds]) => {
        if (Array.isArray(studentCourseIds) && studentCourseIds.length > 0) {
            enrolledSet.add(Number(studentId));
        }
    });

    return enrolledSet;
};

/**
 * Calculates pagination page numbers to display
 * @param {number} totalPages - Total number of pages
 * @param {number} currentPage - Current page number
 * @returns {Array} Array of page numbers to display
 */
export const calculateVisiblePages = (totalPages, currentPage) => {
    return [...Array(totalPages).keys()].filter(
        (index) =>
            index + 1 === 1 ||
            index + 1 === totalPages ||
            Math.abs(index + 1 - currentPage) <= 2
    );
};

/**
 * Filters published courses from courses array
 * @param {Array} courses - Array of course objects
 * @returns {Array} Filtered array of published courses
 */
export const filterPublishedCourses = (courses) => {
    return courses.filter((course) => course?.isPublished);
};

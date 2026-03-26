/**
 * @typedef {Object} InstructorProfile
 * @property {string} id - Instructor ID
 * @property {string} fullName - Instructor's full name
 * @property {string} email - Instructor's email
 * @property {string} bio - Biography/description
 * @property {string} title - Professional title
 * @property {number} yearsOfExperience - Years of experience
 * @property {number} numberOfStudents - Total number of students
 * @property {string[]} expertiseTags - Array of expertise tags
 * @property {string} expertiseTagsText - Comma-separated expertise tags
 * @property {Object} socialLinks - Social media links
 * @property {string} socialLinks.linkedin - LinkedIn URL
 * @property {string} socialLinks.github - GitHub URL
 * @property {string} socialLinks.website - Personal website URL
 */

/**
 * @typedef {Object} Course
 * @property {string} id - Course ID
 * @property {string} title - Course title
 * @property {string} description - Course description
 * @property {boolean} isPublished - Publication status
 * @property {boolean} aiAssistantEnabled - AI assistant status
 * @property {string} categoryId - Category ID
 * @property {Object} category - Category information
 * @property {string} category.name - Category name
 * @property {number} studentCount - Number of enrolled students
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 * @property {string} coverImageUrl - Cover image URL
 * @property {number} price - Course price
 */

/**
 * @typedef {Object} Offering
 * @property {string} id - Offering ID
 * @property {string} title - Offering title
 * @property {string} modality - Modality (ONLINE, OFFLINE, HYBRID)
 * @property {string} visibility - Visibility (PUBLIC, PRIVATE, UNLISTED)
 * @property {string} startAt - Start date/time
 * @property {string} endAt - End date/time
 * @property {string} scheduleNote - Schedule notes
 * @property {Object[]} scheduleBlocks - Schedule blocks
 * @property {string} scheduleBlocks.day - Day of week
 * @property {string} scheduleBlocks.startTime - Start time
 * @property {string} scheduleBlocks.endTime - End time
 * @property {number} capacity - Capacity limit
 * @property {number} enrolledCount - Number of enrolled students
 * @property {number} seatsRemaining - Remaining seats
 * @property {string} status - Status (DRAFT, ACTIVE, COMPLETED, ARCHIVED)
 * @property {boolean} isFeatured - Featured status
 * @property {string} companyId - Company ID
 * @property {Object} company - Company information
 * @property {string} company.name - Company name
 * @property {Course} course - Associated course
 */

/**
 * @typedef {Object} Student
 * @property {string} id - Student ID
 * @property {string} fullName - Student's full name
 * @property {string} email - Student's email
 * @property {string} phoneNumber - Phone number
 * @property {string} enrolledAt - Enrollment date
 * @property {number} progressPercent - Progress percentage
 * @property {boolean} completed - Completion status
 * @property {string} lastViewedLessonId - Last viewed lesson ID
 * @property {number} lastVideoTime - Last video time
 * @property {Object[]} tests - Test results
 * @property {Object} tests.sectionId - Section ID
 * @property {Object} tests.lessonId - Lesson ID
 * @property {boolean} tests.passed - Test passed status
 * @property {number} tests.score - Test score
 * @property {string} tests.attemptedAt - Attempt date
 */

/**
 * @typedef {Object} NavItem
 * @property {string} id - Navigation item ID
 * @property {string} label - Display label
 * @property {React.Component} icon - Icon component
 * @property {string} category - Category (primary, secondary, analytics, admin)
 * @property {number} priority - Priority order
 */

/**
 * @typedef {Object} DeliveryCourseForm
 * @property {string} courseType - Course type (offline, online_live)
 * @property {string} title - Course title
 * @property {string} description - Course description
 * @property {string} categoryId - Category ID
 * @property {string} price - Course price
 * @property {string} languageCode - Language code (ky, ru, en)
 */

/**
 * @typedef {Object} OfferingForm
 * @property {string} courseId - Course ID
 * @property {string} title - Offering title
 * @property {string} modality - Modality
 * @property {string} visibility - Visibility
 * @property {string} startAt - Start date/time
 * @property {string} endAt - End date/time
 * @property {string} scheduleNote - Schedule notes
 * @property {Object[]} scheduleBlocks - Schedule blocks
 * @property {string} capacity - Capacity
 * @property {string} priceOverride - Price override
 * @property {string} companyId - Company ID
 * @property {string} status - Status
 * @property {boolean} isFeatured - Featured status
 */

/**
 * @typedef {Object} EnrollStudentForm
 * @property {string} userId - User ID
 * @property {string} discountPercentage - Discount percentage
 */

/**
 * @typedef {Object} CourseStudentsMeta
 * @property {string} title - Course title
 * @property {number} lessonCount - Number of lessons
 * @property {number} studentCount - Number of students
 * @property {number} page - Current page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 * @property {number} limit - Page limit
 */

// Export types for use in components
export const INSTRUCTOR_TYPES = {
    PROFILE: 'InstructorProfile',
    COURSE: 'Course',
    OFFERING: 'Offering',
    STUDENT: 'Student',
    NAV_ITEM: 'NavItem',
    DELIVERY_COURSE_FORM: 'DeliveryCourseForm',
    OFFERING_FORM: 'OfferingForm',
    ENROLL_STUDENT_FORM: 'EnrollStudentForm',
    COURSE_STUDENTS_META: 'CourseStudentsMeta',
};

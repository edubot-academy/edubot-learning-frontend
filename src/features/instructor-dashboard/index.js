// Main Components
export { default as InstructorDashboardHeader } from './components/InstructorDashboardHeader.jsx';
export { default as InstructorOverviewSection } from './components/InstructorOverviewSection.jsx';
export { default as CoursesSection } from './components/CoursesSection.jsx';
export { default as StudentsSection } from './components/StudentsSection.jsx';
export { default as ProfileSection } from './components/ProfileSection.jsx';
export { default as AiSection } from './components/AiSection.jsx';
export { default as OfferingsSection } from './components/OfferingsSection.jsx';
export { default as ChatTab } from './components/ChatTab.jsx';

// UI Components
export { default as InstructorStatCard } from './components/InstructorStatCard.jsx';
export { default as InstructorQuickActionCard } from './components/InstructorQuickActionCard.jsx';
export { default as InstructorEmptyState } from './components/InstructorEmptyState.jsx';
export { default as OfferingCard } from './components/OfferingCard.jsx';

// Shared Components
export { default as InstructorLink } from './components/shared/InstructorLink.jsx';
export { default as InstructorButton } from './components/shared/InstructorButton.jsx';

// Modal Components
export { default as CreateDeliveryCourseModal } from './components/modals/CreateDeliveryCourseModal.jsx';
export { default as CreateOfferingModal } from './components/modals/CreateOfferingModal.jsx';
export { default as EnrollStudentModal } from './components/modals/EnrollStudentModal.jsx';

// Hooks
export {
    useDeliveryCourse,
    useStudentManagement,
    useOfferingsManagement,
    useInstructorNavigation,
    useInstructorProfile,
    useInstructorCourses,
} from './hooks';

// Utils
export { NAV_ITEMS, formatDateTimeForInput } from './utils/instructorDashboard.constants.js';

// Types (for documentation and IDE support)
export * as INSTRUCTOR_TYPES from './types/index.js';

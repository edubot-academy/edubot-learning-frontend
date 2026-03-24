# Instructor Dashboard Architecture

## 📁 Structure Overview

```
src/features/instructor-dashboard/
├── components/
│   ├── main/           # Primary section components
│   ├── shared/         # Reusable UI components
│   └── modals/         # Modal components
├── hooks/              # Custom hooks for business logic
├── utils/              # Constants and helper functions
└── index.js           # Barrel exports
```

## 🧩 Components Architecture

### Main Components
- **InstructorDashboardHeader** - Dashboard header with navigation and user info
- **InstructorOverviewSection** - Overview tab with stats and quick actions
- **CoursesSection** - Course management with delivery course modal
- **StudentsSection** - Student management with filtering and pagination
- **ProfileSection** - Instructor profile display and editing
- **AiSection** - AI assistant management and configuration
- **OfferingsSection** - Course offerings with complex modals

### UI Components
- **InstructorStatCard** - Reusable statistics display card
- **InstructorQuickActionCard** - Quick action buttons with gradients
- **InstructorEmptyState** - Empty state placeholder component
- **OfferingCard** - Individual offering display component

### Shared Components
- **InstructorLink** - Styled link component with variants
- **InstructorButton** - Styled button component with loading states

### Modal Components
- **CreateDeliveryCourseModal** - Offline/Live course creation modal
- **CreateOfferingModal** - Course offering management modal
- **EnrollStudentModal** - Student enrollment with search modal

## 🎣 Custom Hooks

### useInstructorNavigation
- Handles tab navigation and URL synchronization
- Manages active tab state
- Provides tab selection handlers

### useInstructorProfile
- Manages instructor profile data
- Handles profile loading and error states
- Processes expertise tags and social links

### useInstructorCourses
- Manages course data and loading states
- Provides course statistics (published, pending, AI-enabled)
- Handles course data fetching

### useStudentManagement
- Manages student courses and individual course students
- Handles pagination, search, and filtering
- Provides student data loading and error handling

### useOfferingsManagement
- Manages course offerings data
- Provides offerings statistics and summaries
- Handles offerings loading and refresh functionality

### useDeliveryCourse
- Manages delivery course modal state
- Handles course creation flow
- Manages categories and form data

## 🛠️ Utilities

### instructorDashboard.constants.js
- **NAV_ITEMS** - Navigation configuration with icons and categories
- **formatDateTimeForInput** - Date formatting helper for form inputs

## 🔄 Data Flow

### Profile Data
```
useInstructorProfile → InstructorOverviewSection, ProfileSection
```

### Course Data
```
useInstructorCourses → CoursesSection, InstructorOverviewSection, AiSection
```

### Student Data
```
useStudentManagement → StudentsSection
```

### Offerings Data
```
useOfferingsManagement → OfferingsSection
```

### Navigation
```
useInstructorNavigation → InstructorDashboard (tab management)
```

## 🎨 Component Patterns

### 1. Presentational Components
- Focus on UI rendering only
- Receive data via props
- No business logic or API calls

### 2. Container Components
- Manage state and business logic
- Handle API calls and data fetching
- Pass data to presentational components

### 3. Custom Hooks
- Extract reusable business logic
- Provide clean API for components
- Handle complex state management

## 🔧 Best Practices

### Component Organization
- Group related components together
- Use descriptive naming conventions
- Separate concerns (UI vs logic)

### Hook Usage
- Extract complex logic into custom hooks
- Keep components focused on rendering
- Reuse hooks across components

### State Management
- Use local state for UI concerns
- Lift state up when needed
- Use custom hooks for complex state

### Error Handling
- Handle errors at the hook level
- Provide user-friendly error messages
- Implement loading states

## 🚀 Performance Considerations

### Memoization
- Use `useMemo` for expensive calculations
- Use `useCallback` for function references
- Prevent unnecessary re-renders

### Lazy Loading
- Consider code splitting for large components
- Use dynamic imports for optional features

### Data Fetching
- Implement proper loading states
- Handle concurrent requests
- Cache data when appropriate

## 🧪 Testing Recommendations

### Unit Tests
- Test custom hooks independently
- Test presentational components with props
- Mock API calls in tests

### Integration Tests
- Test component interactions
- Test data flow through hooks
- Test user workflows

### E2E Tests
- Test complete user journeys
- Test modal flows
- Test navigation and URL sync

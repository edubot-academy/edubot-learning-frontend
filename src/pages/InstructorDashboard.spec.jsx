import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../context/AuthContext';
import InstructorDashboard from './InstructorDashboard';

vi.mock('@services/api', () => ({
    fetchInstructorProfile: vi.fn().mockResolvedValue({ id: 10, fullName: 'Instructor' }),
    updateInstructorProfile: vi.fn().mockResolvedValue({ id: 10, fullName: 'Instructor' }),
    listOfferingsForCourse: vi.fn().mockResolvedValue([]),
    fetchInstructorStudentCourses: vi.fn().mockResolvedValue({ courses: [] }),
    fetchCourseStudents: vi.fn().mockResolvedValue({ students: [], total: 0, totalPages: 1 }),
    fetchCourseCertificateSettings: vi.fn().mockResolvedValue({}),
    fetchCourseCertificates: vi.fn().mockResolvedValue([]),
    updateCourseCertificateSettings: vi.fn().mockResolvedValue({}),
    issueCourseCertificate: vi.fn().mockResolvedValue({}),
    approveCertificate: vi.fn().mockResolvedValue({}),
    rejectCertificate: vi.fn().mockResolvedValue({}),
    revokeCertificate: vi.fn().mockResolvedValue({}),
    regenerateCourseCertificates: vi.fn().mockResolvedValue({ regeneratedCount: 0 }),
    createCourse: vi.fn().mockResolvedValue({ id: 1 }),
    fetchCategories: vi.fn().mockResolvedValue([]),
    fetchInstructorCourses: vi.fn().mockResolvedValue({ courses: [] }),
    updateCourse: vi.fn().mockResolvedValue({}),
    fetchUserProfile: vi.fn().mockResolvedValue({}),
    logoutUser: vi.fn().mockResolvedValue({}),
}));

vi.mock('@features/courses/api', () => ({
    markCoursePending: vi.fn().mockResolvedValue({}),
    uploadCourseCertificateSecondaryLogo: vi.fn().mockResolvedValue({}),
    saveCourseCertificateSignatureAsset: vi.fn().mockResolvedValue({}),
}));

vi.mock('../hooks/useDashboardSwipeGestures', () => ({
    default: vi.fn(),
}));

vi.mock('@features/instructor-dashboard', async () => {
    const { INSTRUCTOR_DASHBOARD_TABS } = await import('@shared/constants/dashboardTabs');
    const makeSection = (testId) => {
        const SectionMock = () => <div data-testid={testId} />;
        SectionMock.displayName = `SectionMock(${testId})`;
        return SectionMock;
    };

    return {
        InstructorOverviewSection: makeSection('overview-tab'),
        CoursesSection: makeSection('courses-tab'),
        GroupsSection: makeSection('groups-tab'),
        StudentsSection: makeSection('students-tab'),
        CertificatesSection: makeSection('certificates-tab'),
        ProfileSection: makeSection('profile-tab'),
        AiSection: makeSection('ai-tab'),
        OfferingsSection: makeSection('offerings-tab'),
        INSTRUCTOR_WORKSPACE_GROUP_BY_ID: {
            overview: { id: 'overview', label: 'Overview', tabs: [INSTRUCTOR_DASHBOARD_TABS.OVERVIEW, INSTRUCTOR_DASHBOARD_TABS.ANALYTICS] },
            courses: { id: 'courses', label: 'Courses', tabs: [INSTRUCTOR_DASHBOARD_TABS.STUDENTS, INSTRUCTOR_DASHBOARD_TABS.GROUPS] },
        },
        NAV_ITEMS: [
            { id: INSTRUCTOR_DASHBOARD_TABS.OVERVIEW, label: 'Overview', workspaceGroup: 'overview' },
            { id: INSTRUCTOR_DASHBOARD_TABS.STUDENTS, label: 'Students', workspaceGroup: 'courses' },
            { id: INSTRUCTOR_DASHBOARD_TABS.GROUPS, label: 'Groups', workspaceGroup: 'courses' },
            { id: INSTRUCTOR_DASHBOARD_TABS.SESSIONS, label: 'Sessions' },
            { id: INSTRUCTOR_DASHBOARD_TABS.ANALYTICS, label: 'Analytics', workspaceGroup: 'overview' },
            { id: INSTRUCTOR_DASHBOARD_TABS.HOMEWORK, label: 'Homework' },
        ],
    };
});

vi.mock('../components/ui/dashboard', () => ({
    DashboardHeader: () => <div data-testid="dashboard-header" />,
    DashboardTabs: () => <div data-testid="dashboard-tabs" />,
    DashboardLayout: ({ children }) => <main>{children}</main>,
}));

vi.mock('../shared/ui/Loader', () => ({
    default: () => <div data-testid="loader" />,
}));

vi.mock('./SessionWorkspace', () => ({
    default: () => <div data-testid="sessions-tab" />,
}));

vi.mock('./InstructorAnalytics', () => ({
    default: () => <div data-testid="analytics-tab" />,
}));

vi.mock('./InstructorHomework', () => ({
    default: () => <div data-testid="homework-tab" />,
}));

vi.mock('./Attendance', () => ({
    default: () => <div data-testid="attendance-tab" />,
}));

vi.mock('./InternalLeaderboard', () => ({
    default: () => <div data-testid="leaderboard-tab" />,
}));

vi.mock('@features/notifications/components/NotificationsTab', () => ({
    default: () => <div data-testid="notifications-tab" />,
}));

vi.mock('@features/instructor-dashboard/components/ChatTab.jsx', () => ({
    default: () => <div data-testid="chat-tab" />,
}));

const instructorUser = {
    id: 10,
    role: 'instructor',
    fullName: 'Instructor',
};

const renderDashboard = (entry = '/instructor') =>
    render(
        <AuthContext.Provider value={{ user: instructorUser }}>
            <MemoryRouter initialEntries={[entry]}>
                <InstructorDashboard />
            </MemoryRouter>
        </AuthContext.Provider>
    );

describe('InstructorDashboard tabs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        ['/instructor', 'overview-tab'],
        ['/instructor?tab=students', 'students-tab'],
        ['/instructor?tab=groups', 'groups-tab'],
        ['/instructor?tab=sessions', 'sessions-tab'],
        ['/instructor?tab=analytics', 'analytics-tab'],
        ['/instructor?tab=homework', 'homework-tab'],
    ])('renders %s as %s', async (entry, testId) => {
        renderDashboard(entry);

        expect(await screen.findByTestId(testId)).toBeInTheDocument();
    });
});

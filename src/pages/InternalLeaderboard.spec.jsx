import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import { AuthContext } from '../context/AuthContext';
import InternalLeaderboard from './InternalLeaderboard';

const apiMocks = vi.hoisted(() => ({
    fetchCourses: vi.fn(),
    fetchInternalCourseLeaderboard: vi.fn(),
    fetchInternalHomepageLeaderboard: vi.fn(),
    fetchInstructorCourses: vi.fn(),
    fetchInternalStudentOfWeek: vi.fn(),
    fetchInternalWeeklyLeaderboard: vi.fn(),
    fetchStudentCourses: vi.fn(),
}));

vi.mock('@services/api', () => apiMocks);

const renderPage = (user = { id: 7, role: 'admin', fullName: 'Admin User' }) =>
    render(
        <AuthContext.Provider value={{ user }}>
            <InternalLeaderboard />
        </AuthContext.Provider>
    );

const defaultCourses = [
    { id: 11, title: 'React Basics' },
    { id: 22, title: 'Node Basics' },
];

describe('InternalLeaderboard', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        await i18n.changeLanguage('ky');
        apiMocks.fetchCourses.mockResolvedValue({ items: defaultCourses });
        apiMocks.fetchInstructorCourses.mockResolvedValue({ items: defaultCourses });
        apiMocks.fetchStudentCourses.mockResolvedValue({ items: defaultCourses });
        apiMocks.fetchInternalWeeklyLeaderboard.mockResolvedValue({
            items: [{ studentId: 1, fullName: 'Aida Student', xp: 140, progressPercent: 80 }],
            total: 1,
        });
        apiMocks.fetchInternalHomepageLeaderboard.mockResolvedValue({
            items: [{ studentId: 2, fullName: 'Bek Student', xp: 120 }],
        });
        apiMocks.fetchInternalStudentOfWeek.mockResolvedValue({
            studentId: 3,
            fullName: 'Chyngyz Student',
            xp: 220,
        });
        apiMocks.fetchInternalCourseLeaderboard.mockResolvedValue({
            items: [{ studentId: 4, fullName: 'Course Leader', xp: 300, quizzesPassed: 2 }],
            total: 1,
        });
    });

    it('renders admin framing and loads platform course leaderboard data', async () => {
        renderPage({ id: 1, role: 'admin', fullName: 'Admin User' });

        expect(await screen.findByRole('heading', { name: /платформа рейтинги/i })).toBeInTheDocument();
        expect(screen.getByText(/Платформа боюнча жумалык активдүүлүктү/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(apiMocks.fetchCourses).toHaveBeenCalled();
            expect(apiMocks.fetchInternalCourseLeaderboard).toHaveBeenCalledWith(11, {
                track: 'all',
                limit: 10,
            });
        });

        expect(screen.getByText('Aida Student')).toBeInTheDocument();
        expect(screen.getByText('Chyngyz Student')).toBeInTheDocument();
        expect(screen.getByText('Course Leader')).toBeInTheDocument();
    });

    it('uses role-specific course loaders and copy for instructors and students', async () => {
        const { unmount } = renderPage({ id: 15, role: 'instructor', fullName: 'Instructor User' });

        expect(await screen.findByRole('heading', { name: /студенттердин рейтинги/i })).toBeInTheDocument();
        await waitFor(() => {
            expect(apiMocks.fetchInstructorCourses).toHaveBeenCalledWith({ status: 'approved' });
        });

        unmount();
        vi.clearAllMocks();
        apiMocks.fetchStudentCourses.mockResolvedValue({ items: defaultCourses });
        apiMocks.fetchInternalWeeklyLeaderboard.mockResolvedValue({ items: [], total: 0 });
        apiMocks.fetchInternalHomepageLeaderboard.mockResolvedValue({ items: [] });
        apiMocks.fetchInternalStudentOfWeek.mockResolvedValue(null);
        apiMocks.fetchInternalCourseLeaderboard.mockResolvedValue({ items: [], total: 0 });

        renderPage({ id: 42, role: 'student', fullName: 'Student User' });

        expect(await screen.findByRole('heading', { name: /менин ички рейтингим/i })).toBeInTheDocument();
        await waitFor(() => {
            expect(apiMocks.fetchStudentCourses).toHaveBeenCalledWith(42);
        });
    });

    it('reloads leaderboard and selected course board when track changes', async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByText('Course Leader');
        await user.click(screen.getByRole('button', { name: /жандуу/i }));

        await waitFor(() => {
            expect(apiMocks.fetchInternalWeeklyLeaderboard).toHaveBeenLastCalledWith({
                track: 'live',
                limit: 10,
            });
            expect(apiMocks.fetchInternalHomepageLeaderboard).toHaveBeenLastCalledWith({ track: 'live' });
            expect(apiMocks.fetchInternalStudentOfWeek).toHaveBeenLastCalledWith({ track: 'live' });
            expect(apiMocks.fetchInternalCourseLeaderboard).toHaveBeenLastCalledWith(11, {
                track: 'live',
                limit: 10,
            });
        });
    });

    it('loads a newly selected course board from the course selector', async () => {
        const user = userEvent.setup();
        apiMocks.fetchInternalCourseLeaderboard
            .mockResolvedValueOnce({ items: [{ studentId: 4, fullName: 'React Leader', xp: 300 }], total: 1 })
            .mockResolvedValueOnce({ items: [{ studentId: 5, fullName: 'Node Leader', xp: 260 }], total: 1 });

        renderPage();

        await screen.findByText('React Leader');
        await user.selectOptions(screen.getByLabelText(/курс/i), '22');

        await waitFor(() => {
            expect(apiMocks.fetchInternalCourseLeaderboard).toHaveBeenLastCalledWith(22, {
                track: 'all',
                limit: 10,
            });
        });
        expect(await screen.findByText('Node Leader')).toBeInTheDocument();
    });

    it('shows failure states for courses, leaderboard, and course board', async () => {
        apiMocks.fetchCourses.mockRejectedValue(new Error('courses unavailable'));
        apiMocks.fetchInternalWeeklyLeaderboard.mockRejectedValue(new Error('leaderboard unavailable'));
        apiMocks.fetchInternalHomepageLeaderboard.mockRejectedValue(new Error('homepage unavailable'));
        apiMocks.fetchInternalStudentOfWeek.mockRejectedValue(new Error('student unavailable'));
        apiMocks.fetchInternalCourseLeaderboard.mockRejectedValue(new Error('course board unavailable'));

        renderPage();

        expect(await screen.findByText(/курстарды жүктөө мүмкүн болгон жок/i)).toBeInTheDocument();
        expect(await screen.findByRole('alert')).toHaveTextContent(/ички рейтинг маалыматтарын жүктөө мүмкүн болгон жок/i);
        expect(screen.getByText(/курс тандалган жок/i)).toBeInTheDocument();
    });

    it('does not render a placeholder student when student-of-week payload is empty', async () => {
        apiMocks.fetchInternalStudentOfWeek.mockResolvedValue({});

        renderPage();

        const panel = await screen.findByText('Аптанын студенти жок');
        expect(panel).toBeInTheDocument();
        expect(screen.queryByText(/^Студент$/)).not.toBeInTheDocument();
    });
});

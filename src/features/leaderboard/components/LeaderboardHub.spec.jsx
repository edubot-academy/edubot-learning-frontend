import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../context/AuthContext';
import LeaderboardHub from './LeaderboardHub';

const apiMocks = vi.hoisted(() => ({
    fetchFastProgressLeaderboard: vi.fn(),
    fetchLeaderboardAchievements: vi.fn(),
    fetchLeaderboardChallenges: vi.fn(),
    fetchMyLeaderboardSummary: vi.fn(),
    fetchMySkillProgress: vi.fn(),
    fetchNearMeLeaderboard: vi.fn(),
    fetchSkillLeaderboard: vi.fn(),
    fetchSkills: vi.fn(),
    fetchStudentOfWeek: vi.fn(),
    fetchWeeklyLeaderboard: vi.fn(),
}));

vi.mock('@services/api', () => apiMocks);

vi.mock('react-ga4', () => ({
    default: {
        event: vi.fn(),
    },
}));

const renderHub = (props = {}, user = { id: 42, fullName: 'Test Student' }) =>
    render(
        <MemoryRouter>
            <AuthContext.Provider value={{ user }}>
                <LeaderboardHub {...props} />
            </AuthContext.Provider>
        </MemoryRouter>
    );

describe('LeaderboardHub', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.fetchWeeklyLeaderboard.mockResolvedValue({
            items: [],
            total: 0,
            _fallback: true,
            _fallbackMessage: 'Leaderboard temporarily unavailable',
        });
        apiMocks.fetchFastProgressLeaderboard.mockResolvedValue({ items: [], total: 0 });
        apiMocks.fetchStudentOfWeek.mockResolvedValue(null);
        apiMocks.fetchMyLeaderboardSummary.mockResolvedValue(null);
        apiMocks.fetchNearMeLeaderboard.mockResolvedValue(null);
        apiMocks.fetchLeaderboardAchievements.mockResolvedValue({ items: [] });
        apiMocks.fetchLeaderboardChallenges.mockResolvedValue({ items: [] });
        apiMocks.fetchMySkillProgress.mockResolvedValue([]);
        apiMocks.fetchSkillLeaderboard.mockResolvedValue({ items: [] });
        apiMocks.fetchSkills.mockResolvedValue([]);
    });

    it('shows a service warning instead of fake leaderboard entries on fallback', async () => {
        renderHub();

        expect(await screen.findByText(/Рейтинг эскертүүсү/i)).toBeInTheDocument();
        expect(screen.getByText('Leaderboard temporarily unavailable')).toBeInTheDocument();
    });

    it('shows personal skill progress separately from leaderboard ranking', async () => {
        apiMocks.fetchMySkillProgress.mockResolvedValue([
            { id: 1, name: 'React', progressPercent: 64, completedLessons: 7, totalLessons: 11, xp: 180 },
        ]);

        const user = userEvent.setup();
        renderHub();

        await screen.findByText(/Рейтинг эскертүүсү/i);
        await user.click(screen.getByRole('button', { name: /көндүмдөр/i }));

        expect(await screen.findByText(/Менин көндүм прогрессим/i)).toBeInTheDocument();
        expect(screen.getByText(/64% өздөштүрүү/i)).toBeInTheDocument();
        expect(screen.getAllByText(/7\/11 сабак/i).length).toBeGreaterThan(0);
    });

    it('locks public leaderboard to video track', async () => {
        const user = userEvent.setup();
        renderHub({ initialTrack: 'video', lockTrack: true, publicMode: true }, null);

        await screen.findByText(/Рейтинг эскертүүсү/i);

        expect(apiMocks.fetchWeeklyLeaderboard).toHaveBeenCalledWith({
            page: 1,
            limit: 10,
            track: 'video',
        });
        expect(screen.queryByRole('button', { name: /бардыгы/i })).not.toBeInTheDocument();
        expect(screen.getByText(/Бул ачык бетте аптанын лидерлери, күчтүү өсүш жана бөлүшүүгө татыктуу жеңиштер көрүнөт/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /апталык рейтинг/i }));
        expect(await screen.findByRole('heading', { name: /Аптанын лидерлери/i })).toBeInTheDocument();
    });

    it('does not call authenticated leaderboard endpoints in public mode', async () => {
        renderHub({ initialTrack: 'video', lockTrack: true, publicMode: true }, null);

        await screen.findByText(/Рейтинг эскертүүсү/i);

        expect(apiMocks.fetchMyLeaderboardSummary).not.toHaveBeenCalled();
        expect(apiMocks.fetchNearMeLeaderboard).not.toHaveBeenCalled();
        expect(apiMocks.fetchLeaderboardAchievements).not.toHaveBeenCalled();
        expect(apiMocks.fetchLeaderboardChallenges).not.toHaveBeenCalled();
        expect(apiMocks.fetchMySkillProgress).not.toHaveBeenCalled();
        expect(apiMocks.fetchSkills).not.toHaveBeenCalled();
        expect(apiMocks.fetchSkillLeaderboard).not.toHaveBeenCalled();
    });

    it('reloads leaderboard data with the selected track', async () => {
        const user = userEvent.setup();
        renderHub();

        await screen.findByText(/Рейтинг эскертүүсү/i);
        await user.click(screen.getByRole('button', { name: /жандуу/i }));

        await waitFor(() => {
            expect(apiMocks.fetchWeeklyLeaderboard).toHaveBeenLastCalledWith({
                page: 1,
                limit: 10,
                track: 'live',
            });
        });
        expect(apiMocks.fetchMyLeaderboardSummary).toHaveBeenLastCalledWith({
            window: 'weekly',
            track: 'live',
        });
    });
});

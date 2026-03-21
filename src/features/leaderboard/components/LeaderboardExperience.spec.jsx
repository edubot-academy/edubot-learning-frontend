import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import { vi } from 'vitest';
import { ShareAchievementButton } from './LeaderboardExperience';
import { createLeaderboardShare } from '../api';

vi.mock('../api', () => ({
    createLeaderboardShare: vi.fn(),
}));

vi.mock('react-ga4', () => ({
    default: {
        event: vi.fn(),
    },
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ShareAchievementButton', () => {
    let openMock;
    let clipboardWriteTextMock;

    beforeEach(() => {
        vi.clearAllMocks();
        openMock = vi.fn(() => ({}));
        clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);
        createLeaderboardShare.mockResolvedValue({
            token: 'share-token',
            publicUrl: 'https://api.edubot.test/leaderboard/share/public/share-token',
        });
        window.localStorage.clear();
        Object.defineProperty(window, 'open', {
            configurable: true,
            value: openMock,
        });
        Object.defineProperty(navigator, 'share', {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(navigator, 'canShare', {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: clipboardWriteTextMock,
            },
        });
    });

    it('opens a share modal with explicit social targets', async () => {
        const user = userEvent.setup();
        render(<ShareAchievementButton title="React Hero" text="7 күн серия" />);

        await user.click(screen.getByRole('button', { name: /бөлүшүү картасы/i }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /барак шилтемесин көчүрүү/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /үлгү png жүктөп алуу/i })).toBeInTheDocument();
    });

    it('uses current public page url for unauthenticated share', async () => {
        const user = userEvent.setup();
        render(<ShareAchievementButton title="React Hero" text="7 күн серия" />);

        await user.click(screen.getByRole('button', { name: /бөлүшүү картасы/i }));
        await user.click(screen.getByRole('button', { name: /барак шилтемесин көчүрүү/i }));

        expect(createLeaderboardShare).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Шилтеме көчүрүлдү');
        });
    });

    it('opens a Telegram share intent with the canonical public share url', async () => {
        window.localStorage.setItem(
            'user',
            JSON.stringify({ id: 1, fullName: 'Demo User', role: 'student' })
        );
        const user = userEvent.setup();
        render(<ShareAchievementButton title="React Hero" text="7 күн серия" meta={{ rank: 3 }} />);

        await user.click(screen.getByRole('button', { name: /бөлүшүү картасы/i }));
        await user.click(screen.getByRole('button', { name: /telegram/i }));

        await waitFor(() => {
            expect(createLeaderboardShare).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'React Hero',
                    text: '7 күн серия',
                    rank: 3,
                })
            );
        });

        await waitFor(() => {
            expect(openMock).toHaveBeenCalledWith(
                expect.stringContaining(encodeURIComponent('https://api.edubot.test/leaderboard/share/public/share-token')),
                '_blank',
                'noopener,noreferrer'
            );
        });
        expect(toast.success).toHaveBeenCalledWith('Telegram бөлүшүүсү ачылды');
    });
});

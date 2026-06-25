import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ParentDashboard from './ParentDashboard';

vi.mock('@features/parent/api', () => ({
    getParentProfile: vi.fn(),
    updateGuardianConsent: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('@shared/ui/Loader', () => ({
    default: () => <div data-testid="loader" />,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

const { getParentProfile } = await import('@features/parent/api');

describe('ParentDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders revoked consent separately from pending consent', async () => {
        getParentProfile.mockResolvedValue({
            fullName: 'Parent User',
            guardianLinks: [
                {
                    id: 1,
                    studentId: 25,
                    studentName: 'Student Name',
                    relationship: 'mother',
                    consentStatus: 'revoked',
                },
            ],
        });

        render(<ParentDashboard />);

        expect(await screen.findByText('parent.dashboard.badge.revoked')).toBeInTheDocument();
        expect(screen.getByText('parent.dashboard.revokedNotice')).toBeInTheDocument();
        expect(screen.queryByText('parent.dashboard.consentNotice')).not.toBeInTheDocument();
    });
});

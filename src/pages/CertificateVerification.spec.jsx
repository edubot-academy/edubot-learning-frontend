import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CertificateVerification from './CertificateVerification';

const apiMocks = vi.hoisted(() => ({
    fetchCertificateVerification: vi.fn(),
}));

vi.mock('@features/courses/api', () => apiMocks);

const renderPage = (initialEntry = '/certificates/cert-123/verify', routePath = '/certificates/:publicId/verify') =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path={routePath} element={<CertificateVerification />} />
            </Routes>
        </MemoryRouter>
    );

describe('CertificateVerification', () => {
    let clipboardWriteTextMock;

    beforeEach(() => {
        vi.clearAllMocks();
        clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: clipboardWriteTextMock,
            },
        });
    });

    it('renders issued certificate trust details and copies the verification link', async () => {
        const user = userEvent.setup();
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: clipboardWriteTextMock,
            },
        });
        apiMocks.fetchCertificateVerification.mockResolvedValue({
            publicId: 'cert-123',
            status: 'issued',
            primaryBrandName: 'EduBot Learning',
            certificateTitle: 'Frontend Foundations',
            studentFullName: 'Aida Student',
            courseTitle: 'React Basics',
            issuerDisplayName: 'Nurbek Mentor',
            issuerTitle: 'Lead Instructor',
            issuedAt: '2026-05-13T10:00:00.000Z',
            verificationUrl: 'https://edubot.test/certificates/cert-123/verify',
        });

        renderPage();

        expect(await screen.findByText('Тастыкталды')).toBeInTheDocument();
        expect(screen.getByText('Frontend Foundations')).toBeInTheDocument();
        expect(screen.getByText('Aida Student')).toBeInTheDocument();
        expect(screen.getByText('React Basics')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /шилтемени көчүрүү/i }));

        expect(clipboardWriteTextMock).toHaveBeenCalledWith(
            'https://edubot.test/certificates/cert-123/verify'
        );
        expect(await screen.findByRole('button', { name: /көчүрүлдү/i })).toBeInTheDocument();
    });

    it('shows revoked guidance and revoked date when certificate is no longer valid', async () => {
        apiMocks.fetchCertificateVerification.mockResolvedValue({
            publicId: 'cert-456',
            status: 'revoked',
            certificateTitle: 'Data Course',
            revokedAt: '2026-05-12T08:00:00.000Z',
        });

        renderPage('/certificates/cert-456/verify');

        expect(await screen.findByText('Жокко чыгарылды')).toBeInTheDocument();
        expect(screen.getByText(/жарактуу эмес/i)).toBeInTheDocument();
        expect(screen.getAllByText(/жокко чыгарылган/i).length).toBeGreaterThan(0);
    });

    it('surfaces verification fetch failures with support recovery actions', async () => {
        apiMocks.fetchCertificateVerification.mockRejectedValue(new Error('not found'));

        renderPage('/certificates/missing/verify');

        expect(await screen.findByRole('alert')).toHaveTextContent(/тастыктоо мүмкүн болгон жок/i);
        expect(screen.getByRole('link', { name: /колдоо менен байланышуу/i })).toHaveAttribute('href', '/contact');
        expect(screen.getByRole('link', { name: /башкы бетке кайтуу/i })).toHaveAttribute('href', '/');
    });

    it('shows a copy fallback when verification URL is missing', async () => {
        const user = userEvent.setup();
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: clipboardWriteTextMock,
            },
        });
        apiMocks.fetchCertificateVerification.mockResolvedValue({
            publicId: 'cert-no-url',
            status: 'issued',
            certificateTitle: 'Certificate without URL',
            verificationUrl: '',
        });

        renderPage('/certificates/cert-no-url/verify');

        await screen.findByText('Certificate without URL');
        await user.click(screen.getByRole('button', { name: /шилтемени көчүрүү/i }));

        expect(screen.getByText(/текшерүү шилтемеси азыр көрсөтүлгөн эмес/i)).toBeInTheDocument();
        expect(clipboardWriteTextMock).not.toHaveBeenCalled();
    });

    it('does not call the API when the route has no certificate id', async () => {
        renderPage('/', '/');

        expect(await screen.findByRole('alert')).toHaveTextContent(/идентификатору табылган жок/i);
        await waitFor(() => {
            expect(apiMocks.fetchCertificateVerification).not.toHaveBeenCalled();
        });
    });
});

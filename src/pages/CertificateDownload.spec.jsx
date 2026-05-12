import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CertificateDownload from './CertificateDownload';

const apiMocks = vi.hoisted(() => ({
    downloadCourseCertificatePdf: vi.fn(),
}));

vi.mock('@features/courses/api', () => apiMocks);

const renderPage = ({
    initialEntry = '/certificates/cert-123/download',
    routePath = '/certificates/:publicId/download',
    strict = false,
} = {}) => {
    const ui = (
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path={routePath} element={<CertificateDownload />} />
            </Routes>
        </MemoryRouter>
    );

    return render(strict ? <StrictMode>{ui}</StrictMode> : ui);
};

describe('CertificateDownload', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('starts the certificate PDF download once and shows the ready state', async () => {
        apiMocks.downloadCourseCertificatePdf.mockResolvedValue(true);

        renderPage({ strict: true });

        await waitFor(() => {
            expect(apiMocks.downloadCourseCertificatePdf).toHaveBeenCalledTimes(1);
        });
        expect(apiMocks.downloadCourseCertificatePdf).toHaveBeenCalledWith(
            '/certificates/cert-123/download',
            'certificate-cert-123.pdf'
        );
        expect(await screen.findByText(/файл браузер аркылуу жүктөлүшү керек/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /текшерүү барагын ачуу/i })).toHaveAttribute(
            'href',
            '/certificates/cert-123/verify'
        );
    });

    it('shows an error and allows retry when the download fails', async () => {
        const user = userEvent.setup();
        apiMocks.downloadCourseCertificatePdf
            .mockRejectedValueOnce(new Error('blocked'))
            .mockResolvedValueOnce(true);

        renderPage();

        expect(await screen.findByText(/сертификатты азыр жүктөй алган жокпуз/i)).toBeInTheDocument();
        expect(screen.getByText(/pdf жүктөлгөн жок/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /кайра жүктөө/i }));

        await waitFor(() => {
            expect(apiMocks.downloadCourseCertificatePdf).toHaveBeenCalledTimes(2);
        });
        expect(await screen.findByText(/файл браузер аркылуу жүктөлүшү керек/i)).toBeInTheDocument();
    });

    it('handles a missing public id without calling the download API', async () => {
        renderPage({ initialEntry: '/', routePath: '/' });

        expect(await screen.findByText(/сертификатты азыр жүктөй алган жокпуз/i)).toBeInTheDocument();
        expect(screen.getByText(/идентификатору табылган жок/i)).toBeInTheDocument();
        expect(apiMocks.downloadCourseCertificatePdf).not.toHaveBeenCalled();
        expect(screen.getByRole('link', { name: /текшерүү барагын ачуу/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('button', { name: /кайра жүктөө/i })).toBeDisabled();
    });
});

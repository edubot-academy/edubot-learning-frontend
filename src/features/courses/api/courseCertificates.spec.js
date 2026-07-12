import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    approveCertificate,
    downloadCourseCertificatePdf,
    fetchCertificateVerification,
    fetchCourseCertificateSettings,
    fetchCourseCertificates,
    getDownloadFilename,
    issueCourseCertificate,
    rejectCertificate,
    revokeCertificate,
    updateCourseCertificateSettings,
} from './courseCertificates';
import api from '@shared/api/client';

vi.mock('@shared/api/client', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('course certificate API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('parses download filenames from content disposition headers', () => {
        expect(getDownloadFilename("attachment; filename*=UTF-8''certificate%20one.pdf")).toBe(
            'certificate one.pdf'
        );
        expect(getDownloadFilename('attachment; filename="basic.pdf"')).toBe('basic.pdf');
        expect(getDownloadFilename(null, 'fallback.pdf')).toBe('fallback.pdf');
    });

    it('fetches and updates course certificate settings', async () => {
        api.get.mockResolvedValueOnce({ data: { enabled: true } });
        api.patch.mockResolvedValueOnce({ data: { enabled: false } });

        await expect(fetchCourseCertificateSettings(10)).resolves.toEqual({ enabled: true });
        await expect(updateCourseCertificateSettings(10, { enabled: false })).resolves.toEqual({
            enabled: false,
        });

        expect(api.get).toHaveBeenCalledWith('/courses/10/certificate-settings');
        expect(api.patch).toHaveBeenCalledWith('/courses/10/certificate-settings', {
            enabled: false,
        });
    });

    it('fetches course certificates and public verification records', async () => {
        api.get
            .mockResolvedValueOnce({ data: [{ id: 1 }] })
            .mockResolvedValueOnce({ data: { publicId: 'cert-1' } });

        await expect(fetchCourseCertificates(10)).resolves.toEqual([{ id: 1 }]);
        await expect(fetchCertificateVerification('cert-1')).resolves.toEqual({
            publicId: 'cert-1',
        });

        expect(api.get).toHaveBeenNthCalledWith(1, '/courses/10/certificates');
        expect(api.get).toHaveBeenNthCalledWith(2, '/certificates/cert-1/verify');
    });

    it('posts certificate issue and review actions', async () => {
        api.post.mockResolvedValue({ data: { ok: true } });

        await issueCourseCertificate(10, { studentId: 1 });
        await approveCertificate(20, { issuerTitle: 'Lead' });
        await rejectCertificate(21);
        await revokeCertificate(22);

        expect(api.post).toHaveBeenNthCalledWith(1, '/courses/10/certificates/issue', {
            studentId: 1,
        });
        expect(api.post).toHaveBeenNthCalledWith(2, '/certificates/20/approve', {
            issuerTitle: 'Lead',
        });
        expect(api.post).toHaveBeenNthCalledWith(3, '/certificates/21/reject', {});
        expect(api.post).toHaveBeenNthCalledWith(4, '/certificates/22/revoke', {});
    });

    it('downloads certificate PDFs using server-provided filenames', async () => {
        api.get.mockResolvedValueOnce({
            data: new Blob(['pdf'], { type: 'application/pdf' }),
            headers: {
                'content-disposition': 'attachment; filename="issued.pdf"',
            },
        });

        await expect(downloadCourseCertificatePdf('/certificates/cert-1/download')).resolves.toBe(true);

        const link = document.querySelector('a');
        expect(api.get).toHaveBeenCalledWith('/certificates/cert-1/download', {
            responseType: 'blob',
        });
        expect(link).toBeNull();
        expect(URL.createObjectURL).toHaveBeenCalled();
    });
});

import api from '@shared/api/client';
import toast from 'react-hot-toast';
import i18n from '../../../i18n';

export const fetchCourseCertificateSettings = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/certificate-settings`);
    return response.data;
};

export const updateCourseCertificateSettings = async (courseId, payload) => {
    const response = await api.patch(`/courses/${courseId}/certificate-settings`, payload);
    return response.data;
};

export const saveCourseCertificateSignatureAsset = async (courseId, file) => {
    const formData = new FormData();
    formData.append('signature', file);
    const response = await api.post(
        `/courses/${courseId}/certificate-settings/upload-signature`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const uploadCourseCertificateSecondaryLogo = async (courseId, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post(
        `/courses/${courseId}/certificate-settings/upload-secondary-logo`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const fetchCourseCertificates = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/certificates`);
    return response.data;
};

export const getDownloadFilename = (contentDisposition, fallback = 'certificate.pdf') => {
    if (!contentDisposition || typeof contentDisposition !== 'string') return fallback;

    const utfMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
        try {
            return decodeURIComponent(utfMatch[1]).replace(/["']/g, '');
        } catch {
            return utfMatch[1].replace(/["']/g, '');
        }
    }

    const basicMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    return basicMatch?.[1] ? basicMatch[1].trim() : fallback;
};

export const downloadCourseCertificatePdf = async (
    downloadUrl,
    fallbackFilename = 'certificate.pdf',
) => {
    try {
        const response = await api.get(downloadUrl, {
            responseType: 'blob',
        });
        const blob =
            response.data instanceof Blob
                ? response.data
                : new Blob([response.data], { type: 'application/pdf' });
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = getDownloadFilename(
            response.headers?.['content-disposition'],
            fallbackFilename,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
        return true;
    } catch (error) {
        console.error('Error downloading certificate PDF:', error);
        toast.error(i18n.t('courseApi.toasts.certificatePdfDownloadFailed'));
        throw error;
    }
};

export const issueCourseCertificate = async (courseId, payload) => {
    const response = await api.post(`/courses/${courseId}/certificates/issue`, payload);
    return response.data;
};

export const approveCertificate = async (certificateId, payload = {}) => {
    const response = await api.post(`/certificates/${certificateId}/approve`, payload);
    return response.data;
};

export const rejectCertificate = async (certificateId, payload = {}) => {
    const response = await api.post(`/certificates/${certificateId}/reject`, payload);
    return response.data;
};

export const revokeCertificate = async (certificateId, payload = {}) => {
    const response = await api.post(`/certificates/${certificateId}/revoke`, payload);
    return response.data;
};

export const fetchCertificateVerification = async (publicId) => {
    const response = await api.get(`/certificates/${publicId}/verify`);
    return response.data;
};

export const regenerateCourseCertificates = async (courseId, payload = {}) => {
    const response = await api.post(`/courses/${courseId}/certificates/regenerate`, payload);
    return response.data;
};

export const fetchCourseCertificatePreviewHtml = async (courseId, payload = {}) => {
    const response = await api.post(`/courses/${courseId}/certificate-preview`, payload, {
        responseType: 'text',
    });
    return response.data;
};

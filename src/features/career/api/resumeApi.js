import api from '@shared/api/client';

export const createResumeDraft = async ({ sessionId, input, templateId }) => {
    const res = await api.post('/career/resume-drafts', { sessionId, input, templateId }, {
        skipAuthRedirect: true,
    });
    return res.data;
};

export const getResumeDraft = async (draftId) => {
    const res = await api.get(`/career/resume-drafts/${draftId}`, {
        skipAuthRedirect: true,
    });
    return res.data;
};

export const generateResumeDraft = async (draftId) => {
    const res = await api.post(`/career/resume-drafts/${draftId}/generate`, {}, {
        skipAuthRedirect: true,
    });
    return res.data;
};

export const parseResumeDraft = async (draftId, rawText) => {
    const res = await api.post(`/career/resume-drafts/${draftId}/parse`, { rawText }, {
        skipAuthRedirect: true,
    });
    return res.data;
};

export const claimResumeDraft = async (draftId) => {
    const res = await api.post(`/career/resume-drafts/${draftId}/claim`, {});
    return res.data;
};

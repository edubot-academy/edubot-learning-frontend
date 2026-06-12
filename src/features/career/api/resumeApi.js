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

export const getResumes = async () => {
    const res = await api.get('/career/resumes');
    return res.data;
};

export const getResume = async (resumeId) => {
    const res = await api.get(`/career/resumes/${resumeId}`);
    return res.data;
};

export const createResume = async (payload) => {
    const res = await api.post('/career/resumes', payload);
    return res.data;
};

export const updateResume = async (resumeId, payload) => {
    const res = await api.patch(`/career/resumes/${resumeId}`, payload);
    return res.data;
};

export const downloadResume = async (resumeId) => {
    const res = await api.get(`/career/resumes/${resumeId}/download`);
    return res.data;
};

export const tailorResumeForJob = async (resumeId, jobId) => {
    const res = await api.post(`/career/resumes/${resumeId}/tailor/${jobId}`, {});
    return res.data;
};

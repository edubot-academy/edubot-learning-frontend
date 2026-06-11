import api from '@shared/api/client';

export const getJobMatchesByDraft = async (draftId) => {
    const res = await api.get('/career/job-matches', {
        params: { draftId },
        skipAuthRedirect: true,
    });
    return res.data;
};

export const getJobMatchesByResume = async (resumeId) => {
    const res = await api.get('/career/job-matches', { params: { resumeId } });
    return res.data;
};

export const getJobDetail = async (jobId) => {
    const res = await api.get(`/career/jobs/${jobId}`, { skipAuthRedirect: true });
    return res.data;
};

export const saveJob = async (jobId) => {
    const res = await api.post(`/career/jobs/${jobId}/save`, {});
    return res.data;
};

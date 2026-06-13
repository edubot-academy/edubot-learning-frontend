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

export const removeSavedJob = async (jobId) => {
    const res = await api.delete(`/career/jobs/${jobId}/save`);
    return res.data;
};

export const getJobs = async (limit, filters = {}) => {
    const params = {};

    if (limit) {
        params.limit = limit;
    }

    if (filters.market) {
        params.market = filters.market;
    }

    if (filters.workMode) {
        params.workMode = filters.workMode;
    }

    const res = await api.get('/career/jobs', {
        params: Object.keys(params).length > 0 ? params : undefined,
        skipAuthRedirect: true,
    });
    return res.data;
};

export const getSavedJobs = async () => {
    const res = await api.get('/career/jobs/saved');
    return res.data;
};

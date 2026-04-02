import api, { clean } from '../../shared/api/client';

const ensurePositiveInt = (value, fieldName) => {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) {
        throw new Error(`${fieldName} must be a positive integer`);
    }
    return numeric;
};

export const fetchHomework = async ({ courseId, groupId, limit } = {}) => {
    const { data } = await api.get('/homework', {
        params: clean({ courseId, groupId, limit }),
    });
    return data;
};

export const fetchHomeworkSummary = async ({ courseId, groupId } = {}) => {
    const { data } = await api.get('/homework/summary', {
        params: clean({ courseId, groupId }),
    });
    return data;
};

export const fetchSessionHomework = async (sessionId, { includeUnpublished = false } = {}) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.get(`/group-sessions/${validSessionId}/homework`, {
        params: clean({ includeUnpublished }),
    });
    return data;
};

export const createSessionHomework = async (sessionId, payload) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.post(`/group-sessions/${validSessionId}/homework`, payload);
    return data;
};

export const updateSessionHomework = async (sessionId, homeworkId, payload) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    const { data } = await api.patch(
        `/group-sessions/${validSessionId}/homework/${validHomeworkId}`,
        payload
    );
    return data;
};

export const submitSessionHomework = async (sessionId, homeworkId, payload) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    const { data } = await api.post(
        `/group-sessions/${validSessionId}/homework/${validHomeworkId}/submissions`,
        payload
    );
    return data;
};

export const uploadSessionHomeworkAttachment = async (sessionId, homeworkId, file) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    if (!(file instanceof File)) {
        throw new Error('file must be a File');
    }

    const form = new FormData();
    form.append('file', file);

    const { data } = await api.post(
        `/group-sessions/${validSessionId}/homework/${validHomeworkId}/submissions/upload`,
        form,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
        }
    );
    return data;
};

export const fetchSessionHomeworkSubmissions = async (sessionId, homeworkId) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    const { data } = await api.get(
        `/group-sessions/${validSessionId}/homework/${validHomeworkId}/submissions`
    );
    return data;
};

export const fetchSessionHomeworkReviewRoster = async (sessionId, homeworkId) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    const { data } = await api.get(
        `/group-sessions/${validSessionId}/homework/${validHomeworkId}/review-roster`
    );
    return data;
};

export const fetchSessionHomeworkAttachmentBlob = async (sessionId, homeworkId, submissionId) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    const validSubmissionId = ensurePositiveInt(submissionId, 'submissionId');
    const { data, headers } = await api.get(
        `/group-sessions/${validSessionId}/homework/${validHomeworkId}/submissions/${validSubmissionId}/attachment`,
        {
            responseType: 'blob',
        }
    );
    return {
        blob: data,
        contentType: headers['content-type'] || data?.type || '',
    };
};

export const reviewSessionHomeworkSubmission = async (
    sessionId,
    homeworkId,
    submissionId,
    payload
) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    const validSubmissionId = ensurePositiveInt(submissionId, 'submissionId');
    const { data } = await api.patch(
        `/group-sessions/${validSessionId}/homework/${validHomeworkId}/submissions/${validSubmissionId}`,
        payload
    );
    return data;
};

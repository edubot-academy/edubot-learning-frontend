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

export const fetchSessionHomework = async (sessionId) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.get(`/course-sessions/${validSessionId}/homework`);
    return data;
};

export const createSessionHomework = async (sessionId, payload) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const { data } = await api.post(`/course-sessions/${validSessionId}/homework`, payload);
    return data;
};

export const fetchSessionHomeworkSubmissions = async (sessionId, homeworkId) => {
    const validSessionId = ensurePositiveInt(sessionId, 'sessionId');
    const validHomeworkId = ensurePositiveInt(homeworkId, 'homeworkId');
    const { data } = await api.get(
        `/course-sessions/${validSessionId}/homework/${validHomeworkId}/submissions`
    );
    return data;
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
        `/course-sessions/${validSessionId}/homework/${validHomeworkId}/submissions/${validSubmissionId}`,
        payload
    );
    return data;
};

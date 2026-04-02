import api, { clean } from '../../shared/api/client';
import { COURSE_SESSION_STATUS } from '@shared/contracts';

const VALID_SESSION_STATUS = new Set(
    [
        COURSE_SESSION_STATUS.SCHEDULED,
        COURSE_SESSION_STATUS.COMPLETED,
        COURSE_SESSION_STATUS.CANCELLED,
    ].filter(Boolean)
);

const ensurePositiveInt = (value, fieldName) => {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) {
        throw new Error(`${fieldName} must be a positive integer`);
    }
    return numeric;
};

const ensureIsoDateTime = (value, fieldName) => {
    if (value === undefined || value === null || value === '') return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid datetime`);
    }
    return date.toISOString();
};

const ensureNonEmptyString = (value, fieldName) => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${fieldName} is required`);
    }
    return value.trim();
};

const normalizeMaterials = (materials) => {
    if (materials === undefined) return undefined;
    if (!Array.isArray(materials)) {
        throw new Error('materials must be an array');
    }

    return materials.map((item, index) => {
        const title = ensureNonEmptyString(item?.title, `materials[${index}].title`);
        const url = ensureNonEmptyString(item?.url, `materials[${index}].url`);
        return clean({
            title,
            url,
            storageKey:
                item?.storageKey !== undefined && item?.storageKey !== null && String(item.storageKey).trim()
                    ? String(item.storageKey).trim()
                    : undefined,
        });
    });
};

const normalizeActivities = (activities) => {
    if (activities === undefined) return undefined;
    if (!Array.isArray(activities)) {
        throw new Error('activities must be an array');
    }

    const validTypes = new Set(['discussion', 'exercise', 'quiz', 'group_work']);
    const validStatuses = new Set(['planned', 'active', 'done']);

    return activities
        .map((activity, index) => {
            const title = ensureNonEmptyString(activity?.title, `activities[${index}].title`);
            const type = String(activity?.type || '').trim();
            const status = String(activity?.status || '').trim();
            const description = String(activity?.description || '').trim();

            if (!validTypes.has(type)) {
                throw new Error(`activities[${index}].type must be one of: ${Array.from(validTypes).join(', ')}`);
            }
            if (!validStatuses.has(status)) {
                throw new Error(`activities[${index}].status must be one of: ${Array.from(validStatuses).join(', ')}`);
            }

            const questions =
                type === 'quiz'
                    ? (() => {
                          if (!Array.isArray(activity?.questions) || !activity.questions.length) {
                              throw new Error(`activities[${index}].questions must contain at least one question`);
                          }

                          return activity.questions.map((question, questionIndex) => {
                              const prompt = ensureNonEmptyString(
                                  question?.prompt,
                                  `activities[${index}].questions[${questionIndex}].prompt`
                              );

                              if (!Array.isArray(question?.options) || question.options.length < 2) {
                                  throw new Error(
                                      `activities[${index}].questions[${questionIndex}].options must contain at least two options`
                                  );
                              }

                              const options = question.options
                                  .map((option, optionIndex) => ({
                                      id:
                                          option?.id !== undefined && option?.id !== null
                                              ? ensurePositiveInt(option.id, `activities[${index}].questions[${questionIndex}].options[${optionIndex}].id`)
                                              : undefined,
                                      text: ensureNonEmptyString(
                                          option?.text,
                                          `activities[${index}].questions[${questionIndex}].options[${optionIndex}].text`
                                      ),
                                      isCorrect: Boolean(option?.isCorrect),
                                  }))
                                  .filter(Boolean);

                              if (!options.some((option) => option.isCorrect)) {
                                  throw new Error(
                                      `activities[${index}].questions[${questionIndex}] must have at least one correct option`
                                  );
                              }

                              return { prompt, options };
                          });
                      })()
                    : undefined;

            return clean({
                id:
                    activity?.id !== undefined && activity?.id !== null
                        ? ensurePositiveInt(activity.id, `activities[${index}].id`)
                        : undefined,
                title,
                description: description || undefined,
                type,
                status,
                questions: questions?.map((question, questionIndex) =>
                    clean({
                        id:
                            question?.id !== undefined && question?.id !== null
                                ? ensurePositiveInt(question.id, `activities[${index}].questions[${questionIndex}].id`)
                                : undefined,
                        prompt: question.prompt,
                        questionMode:
                            activity.questions?.[questionIndex]?.questionMode === 'multiple_choice'
                                ? 'multiple_choice'
                                : 'single_choice',
                        options: question.options,
                    })
                ),
            });
        });
};

const normalizeActivity = (activity) => {
    const normalized = normalizeActivities([activity]);
    return normalized?.[0];
};

const normalizeSessionPayload = (payload = {}, { partial = false } = {}) => {
    if (!payload || typeof payload !== 'object') {
        throw new Error('payload must be an object');
    }

    if (!partial && payload.groupId === undefined) {
        throw new Error('groupId is required');
    }
    if (!partial && payload.sessionIndex === undefined) {
        throw new Error('sessionIndex is required');
    }
    if (!partial && payload.title === undefined) {
        throw new Error('title is required');
    }
    if (!partial && payload.startsAt === undefined) {
        throw new Error('startsAt is required');
    }
    if (!partial && payload.endsAt === undefined) {
        throw new Error('endsAt is required');
    }

    const normalized = clean({
        groupId:
            payload.groupId !== undefined
                ? ensurePositiveInt(payload.groupId, 'groupId')
                : undefined,
        sessionIndex:
            payload.sessionIndex !== undefined
                ? ensurePositiveInt(payload.sessionIndex, 'sessionIndex')
                : undefined,
        title:
            payload.title !== undefined ? ensureNonEmptyString(payload.title, 'title') : undefined,
        startsAt: ensureIsoDateTime(payload.startsAt, 'startsAt'),
        endsAt: ensureIsoDateTime(payload.endsAt, 'endsAt'),
        status:
            payload.status !== undefined
                ? (() => {
                      if (!VALID_SESSION_STATUS.has(payload.status)) {
                          throw new Error(
                              `status must be one of: ${Array.from(VALID_SESSION_STATUS).join(', ')}`
                          );
                      }
                      return payload.status;
                  })()
                : undefined,
        recordingUrl: payload.recordingUrl,
        materials: normalizeMaterials(payload.materials),
    });

    if (payload.notes !== undefined) {
        normalized.notes = String(payload.notes || '').trim();
    }

    return normalized;
};

export const createCourseSession = async (payload) => {
    const { data } = await api.post('/group-sessions', normalizeSessionPayload(payload));
    return data;
};

export const updateCourseSession = async (id, patch) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const { data } = await api.patch(
        `/group-sessions/${sessionId}`,
        normalizeSessionPayload(patch, { partial: true })
    );
    return data;
};

export const fetchCourseSession = async (id) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const { data } = await api.get(`/group-sessions/${sessionId}`);
    return data;
};

export const fetchCourseSessions = async ({ groupId } = {}) => {
    const { data } = await api.get('/group-sessions', {
        params: clean({
            groupId: groupId !== undefined ? ensurePositiveInt(groupId, 'groupId') : undefined,
        }),
    });
    return data;
};

export const uploadSessionMaterial = async (id, file) => {
    const sessionId = ensurePositiveInt(id, 'id');
    if (!(file instanceof File)) {
        throw new Error('file is required');
    }

    const form = new FormData();
    form.append('file', file);

    const { data } = await api.post(`/group-sessions/${sessionId}/materials/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const fetchSessionActivities = async (id) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const { data } = await api.get(`/group-sessions/${sessionId}/activities`);
    return data;
};

export const fetchSessionInsights = async (id) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const { data } = await api.get(`/group-sessions/${sessionId}/insights`);
    return data;
};

export const createSessionActivity = async (id, activity) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const { data } = await api.post(`/group-sessions/${sessionId}/activities`, normalizeActivity(activity));
    return data;
};

export const updateSessionActivity = async (id, activityId, activity) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const normalizedActivityId = ensurePositiveInt(activityId, 'activityId');
    const { data } = await api.patch(
        `/group-sessions/${sessionId}/activities/${normalizedActivityId}`,
        normalizeActivity(activity)
    );
    return data;
};

export const deleteSessionActivity = async (id, activityId) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const normalizedActivityId = ensurePositiveInt(activityId, 'activityId');
    const { data } = await api.post(`/group-sessions/${sessionId}/activities/${normalizedActivityId}/delete`);
    return data;
};

export const fetchSessionActivityResponses = async (id, activityId) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const normalizedActivityId = ensurePositiveInt(activityId, 'activityId');
    const { data } = await api.get(`/group-sessions/${sessionId}/activities/${normalizedActivityId}/responses`);
    return data;
};

export const reviewSessionActivitySubmission = async (id, activityId, submissionId, payload) => {
    const sessionId = ensurePositiveInt(id, 'id');
    const normalizedActivityId = ensurePositiveInt(activityId, 'activityId');
    const normalizedSubmissionId = ensurePositiveInt(submissionId, 'submissionId');
    const { data } = await api.patch(
        `/group-sessions/${sessionId}/activities/${normalizedActivityId}/submissions/${normalizedSubmissionId}`,
        clean({
            status: payload?.status,
            score: payload?.score !== undefined && payload?.score !== null ? Number(payload.score) : undefined,
            reviewComment:
                payload?.reviewComment !== undefined && payload?.reviewComment !== null
                    ? String(payload.reviewComment || '').trim()
                    : undefined,
        })
    );
    return data;
};

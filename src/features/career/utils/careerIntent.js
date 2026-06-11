import { CAREER_INTENT } from './careerLimits';

const ALL_INTENTS = new Set(Object.values(CAREER_INTENT));

/**
 * Extract career intent params from a URL search string.
 * Returns null if no valid career intent is present.
 */
export const parseCareerIntent = (locationSearch) => {
    if (!locationSearch) return null;
    const params = new URLSearchParams(locationSearch);
    const intent  = params.get('intent');
    const draftId = params.get('draftId') ?? undefined;
    const jobId   = params.get('jobId')   ?? undefined;

    if (!intent || !ALL_INTENTS.has(intent)) return null;
    return { intent, draftId, jobId };
};

export const isCareerIntent = (locationSearch) => !!parseCareerIntent(locationSearch);

/**
 * Determine the /career sub-path to navigate to after intent processing.
 */
export const getCareerRedirectPath = ({ intent, jobId } = {}) => {
    switch (intent) {
        case CAREER_INTENT.APPLY:
        case CAREER_INTENT.COVER_LETTER:
        case CAREER_INTENT.TAILOR:
        case CAREER_INTENT.INTERVIEW_PLAN:
            return jobId ? `/career/jobs/${jobId}` : '/career/jobs';
        case CAREER_INTENT.DOWNLOAD:
            return '/career/resumes';
        case CAREER_INTENT.VIEW_MORE_JOBS:
            return '/career/jobs';
        case CAREER_INTENT.SAVE:
        default:
            return '/career';
    }
};

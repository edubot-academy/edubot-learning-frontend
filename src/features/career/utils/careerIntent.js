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
export const getCareerRedirectPath = ({ intent, jobId, resumeId } = {}) => {
    switch (intent) {
        case CAREER_INTENT.APPLY:
        case CAREER_INTENT.TAILOR:
            return jobId ? `/career/jobs/${jobId}` : '/career/jobs';
        case CAREER_INTENT.COVER_LETTER: {
            const params = new URLSearchParams();
            if (jobId) params.set('jobId', jobId);
            if (resumeId) params.set('resumeId', resumeId);
            const query = params.toString();
            return query ? `/career/cover-letters?${query}` : '/career/cover-letters';
        }
        case CAREER_INTENT.INTERVIEW_PLAN: {
            const params = new URLSearchParams();
            if (jobId) params.set('jobId', jobId);
            if (resumeId) params.set('resumeId', resumeId);
            const query = params.toString();
            return query ? `/career/interview-prep?${query}` : '/career/interview-prep';
        }
        case CAREER_INTENT.DOWNLOAD:
            return resumeId ? `/career/resumes/${resumeId}` : '/career/resumes';
        case CAREER_INTENT.SAVE:
            return resumeId ? `/career/resumes/${resumeId}` : '/career';
        case CAREER_INTENT.VIEW_MORE_JOBS:
            return '/career/jobs';
        default:
            return '/career';
    }
};

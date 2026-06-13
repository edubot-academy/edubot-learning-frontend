import { parseSkillsString } from './resumeValidation';

export const MATCH_READINESS_THRESHOLD = 70;
export const CAREER_MARKETS = ['local', 'central_asia', 'russian_speaking', 'eu', 'us', 'middle_east', 'all'];
export const CAREER_WORK_MODES = ['remote_only', 'any'];

export const getResumeSkills = (resume) => {
    const inputSkills = Array.isArray(resume?.input?.skills)
        ? resume.input.skills
        : parseSkillsString(resume?.input?.skills || '');
    const generatedSkills = Array.isArray(resume?.generatedResume?.skills) ? resume.generatedResume.skills : [];

    return [...new Set([...inputSkills, ...generatedSkills].map((skill) => `${skill || ''}`.trim()).filter(Boolean))];
};

export const getResumeTargetRole = (resume) =>
    resume?.input?.targetRole || resume?.generatedResume?.header?.role || '';

export const getResumeReadinessScore = (resume) => {
    const score = resume?.readinessScore ?? resume?.generatedResume?.readinessScore ?? null;
    return Number.isFinite(score) ? score : null;
};

export const getResumeJobMarketPreference = (resume) => resume?.input?.jobMarketPreference || 'all';
export const getResumeWorkModePreference = (resume) => resume?.input?.workModePreference || 'remote_only';

export const isResumeReadyForJobActions = (resume) => {
    const score = getResumeReadinessScore(resume);
    const targetRole = getResumeTargetRole(resume);
    const skills = getResumeSkills(resume);

    return Boolean(targetRole?.trim()) && skills.length >= 3 && (score == null || score >= MATCH_READINESS_THRESHOLD);
};

export const inferJobMarket = (job) => {
    const haystack = `${job?.location || ''} ${job?.description || ''}`.toLowerCase();

    if (/(bishkek|kyrgyz|кыргыз|kyrgyzstan|\bkg\b)/.test(haystack)) return 'local';
    if (/(almaty|astana|kazakh|казах|kazakhstan|\bkz\b|tajik|uzbek|turkmen)/.test(haystack)) return 'central_asia';
    if (/(russia|moscow|saint petersburg|cis|russian-speaking|русск|минск|belarus|armenia|georgia)/.test(haystack)) return 'russian_speaking';
    if (/(germany|france|spain|italy|netherlands|europe|eu\b|poland|portugal|ireland)/.test(haystack)) return 'eu';
    if (/(united states|usa\b|u\.s\.|new york|california|texas|florida)/.test(haystack)) return 'us';
    if (/(uae|dubai|abu dhabi|saudi|riyadh|doha|qatar|oman|middle east)/.test(haystack)) return 'middle_east';
    return 'all';
};

export const filterJobsByMarket = (jobs, market) => {
    if (!Array.isArray(jobs) || market === 'all') return Array.isArray(jobs) ? jobs : [];

    return jobs.filter((job) => {
        const inferred = inferJobMarket(job);

        if (market === 'local') {
            return inferred === 'local';
        }

        if (market === 'central_asia') {
            return inferred === 'local' || inferred === 'central_asia';
        }

        if (market === 'russian_speaking') {
            return inferred === 'local' || inferred === 'central_asia' || inferred === 'russian_speaking';
        }

        return inferred === market;
    });
};

export const filterJobsByWorkMode = (jobs, workMode) => {
    if (!Array.isArray(jobs) || workMode === 'any') return Array.isArray(jobs) ? jobs : [];
    return jobs.filter((job) => job?.isRemote);
};

export const MAX_RESUME_SKILLS = 100;
export const MAX_EXPERIENCE_BULLETS = 20;
export const MAX_EXPERIENCE_BULLET_LENGTH = 500;

export const parseSkillsString = (skills) => {
    if (Array.isArray(skills)) {
        return skills
            .map((s) => `${s || ''}`.trim())
            .filter(Boolean);
    }

    if (!skills?.trim()) return [];
    return skills
        .split(/[,;|]+/)
        .map((s) => s.trim())
        .filter(Boolean);
};

export const formatSkillsForInput = (skills) =>
    Array.isArray(skills) ? skills.join(', ') : (skills ?? '');

const normalizeExperienceBullet = (line) =>
    `${line ?? ''}`
        .replace(/^\s*[-*•]+\s*/, '')
        .trim();

const splitExperienceSentences = (description) =>
    `${description ?? ''}`
        .replace(/\r\n/g, '\n')
        .replace(/([.!?])(?=[A-Z0-9])/g, '$1\n')
        .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
        .map((line) => line.trim())
        .filter(Boolean);

export const parseExperienceDescription = (description) =>
    `${description ?? ''}`.includes('\n')
        ? `${description ?? ''}`
            .split(/\r?\n+/)
            .map(normalizeExperienceBullet)
            .filter(Boolean)
        : splitExperienceSentences(description)
        .map(normalizeExperienceBullet)
        .filter(Boolean);

export const normalizeExperienceEntries = (experience) => {
    if (!Array.isArray(experience)) return [];

    return experience
        .map((item) => ({
            title: `${item?.title ?? ''}`.trim(),
            company: `${item?.company ?? ''}`.trim(),
            period: `${item?.period ?? ''}`.trim(),
            description: `${item?.description ?? ''}`.trim(),
        }))
        .filter((item) => item.title || item.company || item.period || item.description);
};

export const validateResumeForm = ({ name, targetRole, skills, experience }, options = {}) => {
    const errors = {};
    const warnings = [];
    const maxSkills = options.maxSkills ?? MAX_RESUME_SKILLS;

    if (!targetRole?.trim()) {
        errors.targetRole = 'Required — helps AI match the right job keywords.';
    }

    const skillList = parseSkillsString(skills);
    if (skillList.length < 3) {
        errors.skills = 'Add at least 3 skills to generate a useful resume.';
    } else if (Number.isFinite(maxSkills) && skillList.length > maxSkills) {
        errors.skills = `Add no more than ${maxSkills} skills.`;
    }

    if (!name?.trim()) {
        warnings.push('name');
    }

    const rawExperience = Array.isArray(experience) ? experience : [];
    const experienceErrors = rawExperience.map((entry) => {
        const normalizedEntry = {
            title: `${entry?.title ?? ''}`.trim(),
            company: `${entry?.company ?? ''}`.trim(),
            period: `${entry?.period ?? ''}`.trim(),
            description: `${entry?.description ?? ''}`.trim(),
        };
        const isEmpty = !normalizedEntry.title
            && !normalizedEntry.company
            && !normalizedEntry.period
            && !normalizedEntry.description;

        const bullets = parseExperienceDescription(entry.description);
        const entryErrors = {};

        if (isEmpty) return entryErrors;

        if (bullets.length > MAX_EXPERIENCE_BULLETS) {
            entryErrors.description = `Add no more than ${MAX_EXPERIENCE_BULLETS} bullet lines for one experience entry.`;
        } else if (bullets.some((bullet) => bullet.length > MAX_EXPERIENCE_BULLET_LENGTH)) {
            entryErrors.description = `Each bullet line must be ${MAX_EXPERIENCE_BULLET_LENGTH} characters or fewer.`;
        }

        return entryErrors;
    });

    if (experienceErrors.some((entry) => Object.keys(entry).length > 0)) {
        errors.experience = experienceErrors;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings,
    };
};

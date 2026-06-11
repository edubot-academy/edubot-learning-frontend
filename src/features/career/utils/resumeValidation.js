export const parseSkillsString = (skillsStr) => {
    if (!skillsStr?.trim()) return [];
    return skillsStr
        .split(/[,;|]+/)
        .map((s) => s.trim())
        .filter(Boolean);
};

export const validateResumeForm = ({ name, targetRole, skills }) => {
    const errors = {};
    const warnings = [];

    if (!targetRole?.trim()) {
        errors.targetRole = 'Required — helps AI match the right job keywords.';
    }

    const skillList = parseSkillsString(skills);
    if (skillList.length < 3) {
        errors.skills = 'Add at least 3 skills to generate a useful resume.';
    }

    if (!name?.trim()) {
        warnings.push('name');
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings,
    };
};

import { parseSkillsString } from './resumeValidation';

// ─── Locked action intents ────────────────────────────────────────────────────

export const CAREER_INTENT = {
    SAVE:           'save_resume',
    DOWNLOAD:       'download_resume',
    APPLY:          'apply_job',
    COVER_LETTER:   'cover_letter',
    TAILOR:         'tailor_resume',
    INTERVIEW_PLAN: 'interview_plan',
    VIEW_MORE_JOBS: 'view_more_jobs',
};

export const buildSignupUrl = ({ intent, draftId, jobId } = {}) => {
    const params = new URLSearchParams();
    if (intent)  params.set('intent', intent);
    if (draftId) params.set('draftId', draftId);
    if (jobId)   params.set('jobId', jobId);
    const qs = params.toString();
    return qs ? `/register?${qs}` : '/register';
};

// ─── Client-side readiness score ─────────────────────────────────────────────

/**
 * Calculates an estimated resume readiness score (0–100) from the form data
 * that the user has filled in. This updates live without hitting the API.
 *
 * @param {Object} formData — { name, targetRole, skills, context, extras }
 * @returns {{ score: number, strong: string[], missing: Suggestion[], ats: Suggestion[] }}
 */
export const calculateReadinessScore = (formData = {}) => {
    const { name, targetRole, skills, extras = {} } = formData;
    const skills_ = parseSkillsString(skills);
    let score = 0;
    const strong = [];
    const missing = [];
    const ats = [];

    // Target role (required, 15 pts)
    if (targetRole?.trim()) {
        score += 15;
        strong.push(`Target role "${targetRole}" is clear`);
    } else {
        missing.push({ key: 'targetRole', label: 'Add target role', required: true });
    }

    // Skills (15 pts at 3+, +8 at 6+)
    if (skills_.length >= 6) {
        score += 23;
        strong.push(`${skills_.length} skills listed — strong signal`);
    } else if (skills_.length >= 3) {
        score += 15;
        strong.push(`${skills_.length} skills listed`);
        ats.push({ key: 'moreSkills', label: `Add ${6 - skills_.length} more skills to improve matches` });
    } else if (skills_.length > 0) {
        score += 5;
        missing.push({ key: 'skills', label: `Add ${3 - skills_.length} more skill${3 - skills_.length > 1 ? 's' : ''} (minimum 3)` });
    } else {
        missing.push({ key: 'skills', label: 'Add at least 3 skills', required: true });
    }

    // Name (5 pts)
    if (name?.trim()) {
        score += 5;
    } else {
        missing.push({ key: 'name', label: 'Add your full name', placeholder: 'Alex Smith' });
    }

    // Extras — inline fix fields
    if (extras.email?.trim()) {
        score += 8;
        strong.push('Email address provided');
    } else {
        missing.push({ key: 'email', label: 'Add email address', placeholder: 'alex@example.com', inputType: 'email' });
    }

    if (extras.github?.trim()) {
        score += 10;
        strong.push('GitHub profile linked');
    } else {
        ats.push({ key: 'github', label: 'Add GitHub — required by most tech recruiters', placeholder: 'github.com/yourname', inputType: 'url' });
    }

    if (extras.linkedin?.trim()) {
        score += 5;
        strong.push('LinkedIn profile linked');
    } else {
        missing.push({ key: 'linkedin', label: 'Add LinkedIn profile', placeholder: 'linkedin.com/in/yourname', inputType: 'url' });
    }

    if (extras.englishLevel) {
        score += 8;
        strong.push(`English level: ${extras.englishLevel}`);
    } else {
        missing.push({ key: 'englishLevel', label: 'Add English level — critical for international jobs', inputType: 'select', options: ['A2', 'B1', 'B2', 'C1', 'C2', 'Native'] });
    }

    if (extras.location?.trim()) {
        score += 5;
        strong.push('Location provided (Remote OK)');
    } else {
        missing.push({ key: 'location', label: 'Add location', placeholder: 'Bishkek, Kyrgyzstan' });
    }

    if (extras.experience?.trim()) {
        score += 12;
        strong.push('Work experience added');
    } else {
        ats.push({ key: 'experience', label: 'Add work experience or internship (optional)', placeholder: 'e.g. Junior Developer at Acme — 2023' });
    }

    if (extras.projects?.trim()) {
        score += 9;
        strong.push('Personal projects included');
    } else {
        ats.push({ key: 'projects', label: 'Add a personal or academic project', placeholder: 'e.g. Portfolio site — React + Tailwind' });
    }

    return { score: Math.min(score, 100), strong, missing, ats };
};

export const scoreColor = (score) => {
    if (score >= 80) return { ring: '#22c55e', text: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score >= 55) return { ring: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500' };
    return { ring: '#E14219', text: 'text-orange-500', bg: 'bg-[#E14219]' };
};

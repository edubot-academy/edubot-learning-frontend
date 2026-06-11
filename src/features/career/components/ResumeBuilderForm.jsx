import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BEGINNER_CHIPS, getSkillSuggestions, TEMPLATES, DEFAULT_TEMPLATE_ID } from '../constants/careerCopy';
import { validateResumeForm, parseSkillsString } from '../utils/resumeValidation';
import { DRAFT_STATUS } from '../hooks/useResumeDraft';

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconSpinner = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`${className} animate-spin`}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const IconPlus = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

const IconWarning = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

const IconRefresh = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const IconSparkle = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
    </svg>
);

// ─── Template previews ─────────────────────────────────────────────────────────

const ClassicPreview = () => (
    <div className="h-full w-full flex flex-col gap-1 p-3 text-current">
        <div className="h-2.5 w-3/5 bg-current rounded opacity-60" />
        <div className="h-1.5 w-2/5 bg-current rounded opacity-30" />
        <div className="h-px w-full bg-current opacity-15 my-1.5" />
        <div className="h-1.5 w-1/3 bg-current rounded opacity-45 mb-1" />
        <div className="h-1.5 w-full bg-current rounded opacity-15" />
        <div className="h-1.5 w-[90%] bg-current rounded opacity-15" />
        <div className="h-1.5 w-[75%] bg-current rounded opacity-15" />
        <div className="h-1.5 w-1/3 bg-current rounded opacity-45 mt-2 mb-1" />
        <div className="h-1.5 w-full bg-current rounded opacity-15" />
        <div className="h-1.5 w-[85%] bg-current rounded opacity-15" />
    </div>
);

const ModernPreview = () => (
    <div className="h-full w-full flex gap-2.5 p-3 text-current">
        <div className="w-[38%] flex flex-col gap-1 border-r border-current border-opacity-10 pr-2.5">
            <div className="w-8 h-8 rounded-full bg-current opacity-20 mx-auto mb-1.5" />
            <div className="h-1.5 w-full bg-current rounded opacity-35" />
            <div className="h-1.5 w-4/5 bg-current rounded opacity-20" />
            <div className="h-px w-full bg-current opacity-10 my-1.5" />
            <div className="h-1.5 w-full bg-current rounded opacity-15" />
            <div className="h-1.5 w-[85%] bg-current rounded opacity-15" />
            <div className="h-1.5 w-[70%] bg-current rounded opacity-15" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
            <div className="h-1.5 w-1/2 bg-current rounded opacity-45 mb-1" />
            <div className="h-1.5 w-full bg-current rounded opacity-15" />
            <div className="h-1.5 w-[90%] bg-current rounded opacity-15" />
            <div className="h-1.5 w-[75%] bg-current rounded opacity-15" />
            <div className="h-1.5 w-1/2 bg-current rounded opacity-45 mt-2 mb-1" />
            <div className="h-1.5 w-full bg-current rounded opacity-15" />
            <div className="h-1.5 w-[80%] bg-current rounded opacity-15" />
        </div>
    </div>
);

const ProjectsFirstPreview = () => (
    <div className="h-full w-full flex flex-col gap-1 p-3 text-current">
        <div className="h-2.5 w-3/5 bg-current rounded opacity-60" />
        <div className="h-px w-full bg-current opacity-15 my-1.5" />
        <div className="flex gap-1.5 mb-1.5">
            {[0.38, 0.30, 0.34].map((w, i) => (
                <div key={i} className="h-2 bg-current rounded-full opacity-25" style={{ width: `${w * 100}%` }} />
            ))}
        </div>
        <div className="h-1.5 w-1/3 bg-current rounded opacity-45 mb-1" />
        <div className="h-1.5 w-full bg-current rounded opacity-15" />
        <div className="h-1.5 w-[85%] bg-current rounded opacity-15" />
        <div className="h-1.5 w-1/3 bg-current rounded opacity-45 mt-2 mb-1" />
        <div className="h-1.5 w-[90%] bg-current rounded opacity-15" />
        <div className="h-1.5 w-[70%] bg-current rounded opacity-15" />
    </div>
);

const MinimalPreview = () => (
    <div className="h-full w-full flex flex-col gap-1 p-3 text-current">
        <div className="flex items-baseline gap-2 mb-1.5">
            <div className="h-3 w-2/5 bg-current rounded opacity-70" />
            <div className="h-1.5 flex-1 bg-current rounded opacity-20" />
        </div>
        <div className="h-1.5 w-full bg-current rounded opacity-20" />
        <div className="h-px w-full bg-current opacity-15 my-2" />
        <div className="h-1.5 w-1/4 bg-current rounded opacity-50 mb-1" />
        <div className="h-1.5 w-full bg-current rounded opacity-15" />
        <div className="h-1.5 w-[90%] bg-current rounded opacity-15" />
        <div className="h-px w-full bg-current opacity-15 my-2" />
        <div className="h-1.5 w-1/4 bg-current rounded opacity-50 mb-1" />
        <div className="h-1.5 w-full bg-current rounded opacity-15" />
    </div>
);

const TechPreview = () => (
    <div className="h-full w-full flex flex-col gap-1 p-3 text-current">
        <div className="flex items-center gap-2 mb-1.5">
            <div className="h-2.5 w-2/5 bg-current rounded opacity-60" />
            <div className="h-1.5 flex-1 bg-current rounded opacity-25" />
        </div>
        <div className="h-px w-full bg-current opacity-15" />
        <div className="flex gap-1.5 my-1.5">
            {[0.28, 0.24, 0.22, 0.18].map((w, i) => (
                <div key={i} className="h-2 bg-current rounded opacity-25" style={{ width: `${w * 100}%` }} />
            ))}
        </div>
        <div className="h-px w-full bg-current opacity-15" />
        <div className="h-1.5 w-1/3 bg-current rounded opacity-45 mt-1.5 mb-1" />
        <div className="h-1.5 w-full bg-current rounded opacity-15" />
        <div className="h-1.5 w-[85%] bg-current rounded opacity-15" />
    </div>
);

const TEMPLATE_PREVIEWS = {
    classic:       ClassicPreview,
    modern:        ModernPreview,
    projects_first: ProjectsFirstPreview,
    minimal:       MinimalPreview,
    tech:          TechPreview,
};

// ─── Input component ───────────────────────────────────────────────────────────

const Field = ({ label, hint, error, children }) => (
    <div>
        <div className="flex items-baseline justify-between mb-2">
            <label className="block text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">
                {label}
            </label>
            {hint && !error && (
                <span className="text-xs text-[#3E424A] dark:text-[#a6adba]">{hint}</span>
            )}
        </div>
        {children}
        {error && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <IconWarning className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
            </p>
        )}
    </div>
);

const inputClass = (hasError) =>
    `w-full rounded-xl border px-4 py-3.5 text-base placeholder-gray-400 dark:placeholder-gray-600 bg-white dark:bg-white/5 transition-colors focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-amber-400 dark:border-amber-500/50 focus:ring-amber-400/20 focus:border-amber-400 text-[#141619] dark:text-[#E8ECF3]'
            : 'border-gray-200 dark:border-white/10 focus:ring-[#E14219]/20 focus:border-[#E14219]/50 text-[#141619] dark:text-[#E8ECF3]'
    }`;

// ─── ResumeBuilderForm ─────────────────────────────────────────────────────────

const ResumeBuilderForm = ({ onGenerate, status, savedFormData }) => {
    const { t } = useTranslation();

    const [form, setForm] = useState({
        name:       '',
        targetRole: '',
        skills:     '',
        context:    [], // selected chip IDs
    });
    const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATE_ID);
    const [errors, setErrors]   = useState({});
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Restore saved form data on mount
    useEffect(() => {
        if (savedFormData) {
            setForm((prev) => ({
                ...prev,
                name:       savedFormData.name       ?? '',
                targetRole: savedFormData.targetRole ?? '',
                skills:     savedFormData.skills     ?? '',
                context:    savedFormData.context    ?? [],
            }));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const skillSuggestions = useMemo(
        () => getSkillSuggestions(form.targetRole),
        [form.targetRole],
    );

    const currentSkills = useMemo(
        () => parseSkillsString(form.skills),
        [form.skills],
    );

    const isLoading = status === DRAFT_STATUS.CREATING || status === DRAFT_STATUS.GENERATING;

    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (submitted || touched[field]) {
            setTouched((prev) => ({ ...prev, [field]: true }));
        }
    };

    const blur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

    // Re-validate on change when submitted once
    useEffect(() => {
        if (!submitted) return;
        const { errors: e } = validateResumeForm(form);
        setErrors(e);
    }, [form, submitted]);

    const toggleChip = (chipId) => {
        setForm((prev) => ({
            ...prev,
            context: prev.context.includes(chipId)
                ? prev.context.filter((id) => id !== chipId)
                : [...prev.context, chipId],
        }));
    };

    const addSkillSuggestion = (skill) => {
        if (currentSkills.includes(skill)) return;
        setForm((prev) => ({
            ...prev,
            skills: prev.skills
                ? `${prev.skills.trimEnd().replace(/,\s*$/, '')}, ${skill}`
                : skill,
        }));
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        setSubmitted(true);
        const { isValid, errors: validationErrors } = validateResumeForm(form);
        setErrors(validationErrors);
        if (!isValid) return;
        onGenerate(form, selectedTemplate);
    };

    const loadingLabel =
        status === DRAFT_STATUS.CREATING   ? 'Creating draft...' :
        status === DRAFT_STATUS.GENERATING ? 'AI is writing your resume...' :
        t('career.resume.builder.generateButton');

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="p-7 sm:p-10 space-y-8">

                {/* ── Name + Target Role ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                        label={t('career.resume.builder.nameLabel')}
                        hint="Optional"
                        error={touched.name && errors.name}
                    >
                        <input
                            type="text"
                            value={form.name}
                            onChange={set('name')}
                            onBlur={blur('name')}
                            placeholder={t('career.resume.builder.namePlaceholder')}
                            disabled={isLoading}
                            className={inputClass(touched.name && errors.name)}
                            autoComplete="name"
                        />
                    </Field>

                    <Field
                        label={t('career.resume.builder.roleLabel')}
                        hint="e.g. Frontend Developer"
                        error={(touched.targetRole || submitted) && errors.targetRole}
                    >
                        <input
                            type="text"
                            value={form.targetRole}
                            onChange={set('targetRole')}
                            onBlur={blur('targetRole')}
                            placeholder={t('career.resume.builder.rolePlaceholder')}
                            disabled={isLoading}
                            className={inputClass((touched.targetRole || submitted) && errors.targetRole)}
                        />
                    </Field>
                </div>

                {/* ── Skills ── */}
                <Field
                    label={t('career.resume.builder.skillsLabel')}
                    hint="Separate with commas"
                    error={(touched.skills || submitted) && errors.skills}
                >
                    <input
                        type="text"
                        value={form.skills}
                        onChange={set('skills')}
                        onBlur={blur('skills')}
                        placeholder={t('career.resume.builder.skillsPlaceholder')}
                        disabled={isLoading}
                        className={inputClass((touched.skills || submitted) && errors.skills)}
                    />

                    {/* Skill suggestions — appear when targetRole is filled */}
                    {skillSuggestions.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-[#3E424A] dark:text-[#a6adba] mb-2">
                                Suggested for <span className="font-medium text-[#E14219]">{form.targetRole}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {skillSuggestions.map((skill) => {
                                    const added = currentSkills.includes(skill);
                                    return (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => addSkillSuggestion(skill)}
                                            disabled={isLoading || added}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                                                added
                                                    ? 'border border-[#E14219]/30 bg-[#E14219]/8 text-[#E14219] dark:text-[#FF8C6E] cursor-default'
                                                    : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[#3E424A] dark:text-[#a6adba] hover:border-[#E14219]/40 hover:text-[#E14219] hover:bg-[#E14219]/5 active:scale-95'
                                            }`}
                                        >
                                            {added ? (
                                                <IconCheck className="w-3 h-3" />
                                            ) : (
                                                <IconPlus className="w-3 h-3" />
                                            )}
                                            {skill}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Field>

                {/* ── Quick option chips ── */}
                <div>
                    <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3] mb-3">
                        Quick options
                        <span className="ml-2 text-xs font-normal text-[#3E424A] dark:text-[#a6adba]">
                            — helps AI understand your situation
                        </span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                        {BEGINNER_CHIPS.map(({ id, label }) => {
                            const active = form.context.includes(id);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => toggleChip(id)}
                                    disabled={isLoading}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
                                        active
                                            ? 'border border-[#E14219] bg-gradient-to-b from-[#FF8C6E]/15 to-[#E14219]/10 text-[#E14219] dark:text-[#FF8C6E] shadow-sm'
                                            : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[#3E424A] dark:text-[#a6adba] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/8'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Template selector ── */}
                <div>
                    <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3] mb-4">
                        {t('career.resume.templates.title')}
                        <span className="ml-2 text-xs font-normal text-[#3E424A] dark:text-[#a6adba]">
                            — {t('career.resume.templates.subtitle')}
                        </span>
                    </p>
                    <div className="grid grid-cols-5 gap-3">
                        {TEMPLATES.map((tpl) => {
                            const Preview = TEMPLATE_PREVIEWS[tpl.id];
                            const active  = selectedTemplate === tpl.id;
                            return (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => setSelectedTemplate(tpl.id)}
                                    disabled={isLoading}
                                    className={`relative flex flex-col rounded-xl overflow-hidden border transition-all duration-200 group text-left ${
                                        active
                                            ? 'border-[#E14219] ring-2 ring-[#E14219]/20 shadow-sm'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                                >
                                    <div className="h-28 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 overflow-hidden">
                                        <Preview />
                                    </div>
                                    {tpl.isDefault && (
                                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white rounded-md leading-none tracking-wide">
                                            DEFAULT
                                        </span>
                                    )}
                                    <div className="px-3 py-2.5 bg-white dark:bg-[#1a1a1a]">
                                        <p className="text-xs font-bold text-[#141619] dark:text-[#E8ECF3] truncate">
                                            {t(tpl.labelKey)}
                                        </p>
                                        <p className="text-[11px] text-[#3E424A] dark:text-[#a6adba] mt-0.5 truncate">
                                            {t(tpl.bestForKey)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Name warning ── */}
                {!form.name.trim() && (touched.targetRole || submitted) && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-4 py-3">
                        <IconWarning className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            No name provided — the resume will use a placeholder. You can add it now or after generation.
                        </p>
                    </div>
                )}

                {/* ── Submit button ── */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-6 py-4 text-base font-semibold text-white shadow-md hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-[0.99] disabled:opacity-80 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {isLoading ? (
                        <>
                            <IconSpinner className="w-5 h-5" />
                            {loadingLabel}
                        </>
                    ) : (
                        <>
                            <IconSparkle className="w-5 h-5" />
                            {t('career.resume.builder.generateButton')}
                        </>
                    )}
                </button>

                {isLoading && (
                    <p className="text-center text-sm text-[#3E424A] dark:text-[#a6adba]">
                        This usually takes 10–30 seconds. Please don&apos;t close this tab.
                    </p>
                )}

            </div>
        </form>
    );
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const ResumeBuilderError = ({ error, onRetry }) => {
    const isServiceDown =
        error?.code === 'ERR_NETWORK' ||
        error?.response?.status === 503 ||
        error?.response?.status === 404;

    return (
        <div className="p-7 sm:p-10">
            <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 px-6 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10 mx-auto mb-4">
                    <IconWarning className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-suisse font-semibold text-lg text-[#141619] dark:text-[#E8ECF3] mb-2">
                    {isServiceDown ? 'Resume generation coming soon' : 'Generation failed'}
                </h3>
                <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mb-6 max-w-sm mx-auto">
                    {isServiceDown
                        ? 'The AI service is not available yet — the backend API is still in development. Your form data has been saved.'
                        : (error?.response?.data?.message ?? 'Something went wrong. Your form data has been saved — try again.')}
                </p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-semibold text-[#141619] dark:text-[#E8ECF3] hover:bg-gray-50 dark:hover:bg-white/8 transition-colors"
                >
                    <IconRefresh className="w-4 h-4" />
                    Try again
                </button>
            </div>
        </div>
    );
};

// ─── Success state ─────────────────────────────────────────────────────────────

export const ResumeBuilderSuccess = ({ draft, onReset }) => (
    <div className="p-7 sm:p-10">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-6 py-8 text-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] mx-auto mb-4 shadow-lg">
                <IconCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-suisse font-bold text-xl text-[#141619] dark:text-[#E8ECF3] mb-2">
                Your resume is ready!
            </h3>
            <p className="text-sm text-[#3E424A] dark:text-[#a6adba] max-w-sm mx-auto">
                Resume generated successfully
                {draft?.readinessScore != null && (
                    <> — readiness score: <span className="font-semibold text-[#E14219]">{draft.readinessScore}/100</span></>
                )}
                . Full preview and download coming in Phase 3.
            </p>
        </div>

        {draft?.id && (
            <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-5 py-4 flex items-center justify-between gap-4 mb-6">
                <div>
                    <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">Draft ID</p>
                    <p className="text-sm font-mono font-medium text-[#141619] dark:text-[#E8ECF3] mt-0.5 truncate">
                        {draft.id}
                    </p>
                </div>
                <span className="flex-shrink-0 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Generated
                </span>
            </div>
        )}

        <button
            type="button"
            onClick={onReset}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-3.5 text-sm font-semibold text-[#3E424A] dark:text-[#a6adba] hover:bg-gray-50 dark:hover:bg-white/8 transition-colors"
        >
            Start over with a new resume
        </button>
    </div>
);

export default ResumeBuilderForm;

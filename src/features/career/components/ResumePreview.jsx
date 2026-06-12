import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '@app/providers';
import { CAREER_INTENT, buildSignupUrl } from '../utils/careerLimits';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { createResume } from '../api/resumeApi';

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconLock = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

const IconDownload = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const IconBookmark = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
);

const IconGlobe = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);

// ─── Data normaliser ──────────────────────────────────────────────────────────
// The AI returns { header: { name, role, email, … }, summary, skills, … }.
// Legacy/saved resumes may already be flat. Normalise to the flat shape all
// layout components expect so the layouts never need to know about nesting.
const normalizeResume = (raw) => {
    if (!raw || typeof raw !== 'object') return raw;
    if (!raw.header) return raw; // already flat or no header block
    const { header = {}, ...rest } = raw;
    return {
        name:       header.name,
        targetRole: header.role,
        email:      header.email,
        phone:      header.phone,
        location:   header.location,
        linkedin:   header.linkedin,
        github:     header.github,
        portfolio:  header.portfolio,
        ...rest,
    };
};

// ─── Resume section renderers ─────────────────────────────────────────────────

const SectionHeader = ({ children }) => (
    <div className="flex items-center gap-3 mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 whitespace-nowrap">
            {children}
        </h3>
        <div className="flex-1 h-px bg-gray-200" />
    </div>
);

const SkillPill = ({ skill }) => (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-0.5 text-[11px] font-medium text-gray-700">
        {skill}
    </span>
);

const ExperienceItem = ({ item }) => (
    <div className="mb-4 last:mb-0">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div>
                <span className="font-semibold text-[13px] text-gray-900">{item.title}</span>
                {item.company && (
                    <span className="text-[12px] text-gray-600"> — {item.company}</span>
                )}
                {item.location && (
                    <span className="text-[11px] text-gray-400 ml-1.5">({item.location})</span>
                )}
            </div>
            {item.period && (
                <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{item.period}</span>
            )}
        </div>
        {Array.isArray(item.bullets) && item.bullets.length > 0 && (
            <ul className="mt-1.5 space-y-1">
                {item.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-gray-700 leading-relaxed">
                        <span className="mt-[5px] h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
                        {b}
                    </li>
                ))}
            </ul>
        )}
        {item.description && !Array.isArray(item.bullets) && (
            <p className="mt-1 text-[12px] text-gray-600 leading-relaxed">{item.description}</p>
        )}
    </div>
);

const ProjectItem = ({ item }) => {
    // AI returns stack as a string; saved resumes may use tech as an array
    const techItems = Array.isArray(item.tech)
        ? item.tech
        : item.stack
        ? item.stack.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
        : [];
    return (
        <div className="mb-3 last:mb-0">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-gray-900">{item.name}</span>
                    {item.link && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-blue-600">
                            <IconGlobe />
                            {item.link}
                        </span>
                    )}
                </div>
            </div>
            {item.description && (
                <p className="mt-0.5 text-[12px] text-gray-700 leading-relaxed">{item.description}</p>
            )}
            {techItems.length > 0 && (
                <p className="mt-0.5 text-[11px] text-gray-500">
                    <span className="font-medium">Tech:</span> {techItems.join(', ')}
                </p>
            )}
        </div>
    );
};

// ─── Template renderers ───────────────────────────────────────────────────────

const ClassicLayout = ({ resume }) => (
    <div className="font-[Georgia,_'Times_New_Roman',_serif] text-gray-900">
        {/* Header */}
        <div className="mb-4">
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none">
                {resume.name || 'Your Name'}
            </h1>
            {resume.targetRole && (
                <p className="text-[13px] text-gray-600 mt-0.5">{resume.targetRole}</p>
            )}
            {/* Contact row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {[
                    resume.email,
                    resume.location,
                    resume.github,
                    resume.linkedin,
                ].filter(Boolean).map((val, i) => (
                    <span key={i} className="text-[11px] text-gray-500">{val}</span>
                ))}
            </div>
        </div>
        <div className="h-px bg-gray-900 mb-4" />

        {resume.summary && (
            <div className="mb-5">
                <SectionHeader>Summary</SectionHeader>
                <p className="text-[12px] text-gray-700 leading-relaxed">{resume.summary}</p>
            </div>
        )}

        {resume.skills?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Skills</SectionHeader>
                <div className="flex flex-wrap gap-1.5">
                    {resume.skills.map((s, i) => <SkillPill key={i} skill={s} />)}
                </div>
            </div>
        )}

        {resume.experience?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Experience</SectionHeader>
                {resume.experience.map((item, i) => <ExperienceItem key={i} item={item} />)}
            </div>
        )}

        {resume.projects?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Projects</SectionHeader>
                {resume.projects.map((item, i) => <ProjectItem key={i} item={item} />)}
            </div>
        )}

        {resume.education?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Education</SectionHeader>
                {resume.education.map((item, i) => (
                    <div key={i} className="flex justify-between gap-4 flex-wrap mb-1">
                        <div>
                            <span className="font-semibold text-[13px] text-gray-900">{item.degree}</span>
                            {item.institution && <span className="text-[12px] text-gray-600"> — {item.institution}</span>}
                        </div>
                        {item.year && <span className="text-[11px] text-gray-400">{item.year}</span>}
                    </div>
                ))}
            </div>
        )}

        {resume.languages?.length > 0 && (
            <div>
                <SectionHeader>Languages</SectionHeader>
                <p className="text-[12px] text-gray-700">
                    {resume.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(' · ')}
                </p>
            </div>
        )}
    </div>
);

const ModernLayout = ({ resume }) => (
    <div className="flex gap-0 text-gray-900">
        {/* Left column */}
        <div className="w-[38%] flex-shrink-0 bg-gray-50 p-5 rounded-l-sm">
            <h1 className="text-[18px] font-bold leading-tight">{resume.name || 'Your Name'}</h1>
            {resume.targetRole && <p className="text-[11px] text-gray-500 mt-0.5 mb-3">{resume.targetRole}</p>}

            <div className="space-y-0.5 mb-4">
                {[resume.email, resume.location, resume.github, resume.linkedin].filter(Boolean).map((v, i) => (
                    <p key={i} className="text-[10px] text-gray-600 truncate">{v}</p>
                ))}
            </div>

            {resume.skills?.length > 0 && (
                <>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Skills</p>
                    <div className="space-y-1">
                        {resume.skills.map((s, i) => (
                            <p key={i} className="text-[11px] text-gray-700">{s}</p>
                        ))}
                    </div>
                </>
            )}

            {resume.languages?.length > 0 && (
                <div className="mt-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Languages</p>
                    {resume.languages.map((l, i) => (
                        <p key={i} className="text-[11px] text-gray-700">{l.name}{l.level ? ` · ${l.level}` : ''}</p>
                    ))}
                </div>
            )}
        </div>

        {/* Right column */}
        <div className="flex-1 p-5">
            {resume.summary && (
                <div className="mb-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Summary</p>
                    <p className="text-[12px] text-gray-700 leading-relaxed">{resume.summary}</p>
                </div>
            )}
            {resume.experience?.length > 0 && (
                <div className="mb-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Experience</p>
                    {resume.experience.map((item, i) => <ExperienceItem key={i} item={item} />)}
                </div>
            )}
            {resume.projects?.length > 0 && (
                <div className="mb-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Projects</p>
                    {resume.projects.map((item, i) => <ProjectItem key={i} item={item} />)}
                </div>
            )}
            {resume.education?.length > 0 && (
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Education</p>
                    {resume.education.map((item, i) => (
                        <div key={i} className="flex justify-between gap-4 mb-1">
                            <div>
                                <span className="font-semibold text-[13px]">{item.degree}</span>
                                {item.institution && <span className="text-[12px] text-gray-600"> — {item.institution}</span>}
                            </div>
                            {item.year && <span className="text-[11px] text-gray-400">{item.year}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const ProjectsFirstLayout = ({ resume }) => (
    <div className="font-[Georgia,_'Times_New_Roman',_serif] text-gray-900">
        <div className="mb-4">
            <h1 className="text-[22px] font-bold">{resume.name || 'Your Name'}</h1>
            {resume.targetRole && <p className="text-[12px] text-gray-600 mt-0.5">{resume.targetRole}</p>}
            <div className="flex flex-wrap gap-x-3 mt-1.5">
                {[resume.email, resume.github, resume.linkedin, resume.location].filter(Boolean).map((v, i) => (
                    <span key={i} className="text-[11px] text-gray-500">{v}</span>
                ))}
            </div>
        </div>
        <div className="h-px bg-gray-900 mb-4" />

        {resume.skills?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Skills</SectionHeader>
                <div className="flex flex-wrap gap-1.5">
                    {resume.skills.map((s, i) => <SkillPill key={i} skill={s} />)}
                </div>
            </div>
        )}

        {resume.projects?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Projects</SectionHeader>
                {resume.projects.map((item, i) => <ProjectItem key={i} item={item} />)}
            </div>
        )}

        {resume.education?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Education</SectionHeader>
                {resume.education.map((item, i) => (
                    <div key={i} className="flex justify-between gap-4 mb-1">
                        <div>
                            <span className="font-semibold text-[13px]">{item.degree}</span>
                            {item.institution && <span className="text-[12px] text-gray-600"> — {item.institution}</span>}
                        </div>
                        {item.year && <span className="text-[11px] text-gray-400">{item.year}</span>}
                    </div>
                ))}
            </div>
        )}

        {resume.experience?.length > 0 && (
            <div className="mb-5">
                <SectionHeader>Experience</SectionHeader>
                {resume.experience.map((item, i) => <ExperienceItem key={i} item={item} />)}
            </div>
        )}

        {resume.languages?.length > 0 && (
            <div>
                <SectionHeader>Languages</SectionHeader>
                <p className="text-[12px] text-gray-700">
                    {resume.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(' · ')}
                </p>
            </div>
        )}
    </div>
);

// Minimal and Tech share the same base layout (slight variations in heading style)
const MinimalLayout = ({ resume }) => (
    <div className="font-['Inter',_sans-serif] text-gray-900">
        <div className="mb-3">
            <h1 className="text-[20px] font-semibold tracking-tight">{resume.name || 'Your Name'}</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
                {[resume.email, resume.github, resume.linkedin, resume.location].filter(Boolean).join(' · ')}
            </p>
        </div>
        <div className="h-px bg-gray-300 mb-4" />

        {resume.experience?.length > 0 && (
            <div className="mb-4">
                <p className="text-[11px] font-semibold text-gray-700 mb-2.5">Experience</p>
                {resume.experience.map((item, i) => <ExperienceItem key={i} item={item} />)}
                <div className="h-px bg-gray-200 mt-4" />
            </div>
        )}

        {resume.projects?.length > 0 && (
            <div className="mb-4">
                <p className="text-[11px] font-semibold text-gray-700 mb-2.5">Projects</p>
                {resume.projects.map((item, i) => <ProjectItem key={i} item={item} />)}
                <div className="h-px bg-gray-200 mt-4" />
            </div>
        )}

        {resume.skills?.length > 0 && (
            <div className="mb-4">
                <p className="text-[11px] font-semibold text-gray-700 mb-1.5">Skills</p>
                <p className="text-[12px] text-gray-600">{resume.skills.join(', ')}</p>
            </div>
        )}

        {resume.education?.length > 0 && (
            <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1.5">Education</p>
                {resume.education.map((item, i) => (
                    <div key={i} className="flex justify-between text-[12px]">
                        <span className="font-medium">{item.degree}{item.institution ? ` — ${item.institution}` : ''}</span>
                        {item.year && <span className="text-gray-400">{item.year}</span>}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const TechLayout = ({ resume }) => (
    <div className="font-['Inter',_sans-serif] text-gray-900">
        <div className="mb-2">
            <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-[20px] font-bold">{resume.name || 'Your Name'}</h1>
                {resume.targetRole && <span className="text-[13px] text-gray-500">— {resume.targetRole}</span>}
            </div>
            <div className="h-px bg-gray-800 my-2" />
            <p className="text-[11px] text-gray-500">
                {[resume.github, resume.linkedin, resume.location, resume.email].filter(Boolean).join(' | ')}
            </p>
        </div>

        {resume.skills?.length > 0 && (
            <div className="my-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                    {resume.skills.map((s, i) => <SkillPill key={i} skill={s} />)}
                </div>
                <div className="h-px bg-gray-200 mt-3" />
            </div>
        )}

        {resume.projects?.length > 0 && (
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2">Projects</p>
                <div className="h-px bg-gray-200 mb-3" />
                {resume.projects.map((item, i) => <ProjectItem key={i} item={item} />)}
            </div>
        )}

        {resume.experience?.length > 0 && (
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2">Experience</p>
                <div className="h-px bg-gray-200 mb-3" />
                {resume.experience.map((item, i) => <ExperienceItem key={i} item={item} />)}
            </div>
        )}

        {resume.education?.length > 0 && (
            <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5">Education</p>
                {resume.education.map((item, i) => (
                    <div key={i} className="flex justify-between text-[12px]">
                        <span>{item.degree}{item.institution ? ` — ${item.institution}` : ''}</span>
                        {item.year && <span className="text-gray-400">{item.year}</span>}
                    </div>
                ))}
            </div>
        )}

        {resume.languages?.length > 0 && (
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1">Languages</p>
                <p className="text-[12px] text-gray-600">
                    {resume.languages.map((l) => `${l.name}${l.level ? ` ${l.level}` : ''}`).join(' · ')}
                </p>
            </div>
        )}
    </div>
);

const LAYOUT_MAP = {
    classic:       ClassicLayout,
    modern:        ModernLayout,
    projects_first: ProjectsFirstLayout,
    minimal:       MinimalLayout,
    tech:          TechLayout,
};

// ─── Skeleton state (before generation or API-only text) ──────────────────────

const ResumeTextFallback = ({ text }) => (
    <pre className="whitespace-pre-wrap font-mono text-[11px] text-gray-700 leading-relaxed">
        {text}
    </pre>
);

const ResumeSkeleton = ({ formData }) => {
    const skills = (typeof formData?.skills === 'string'
        ? formData.skills.split(/[,;|]+/).map((s) => s.trim()).filter(Boolean)
        : formData?.skills ?? []);

    return (
        <div className="animate-pulse space-y-4">
            <div>
                <div className="h-6 w-2/5 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-1/4 bg-gray-100 rounded mb-2" />
                <div className="h-2 w-3/5 bg-gray-100 rounded" />
            </div>
            <div className="h-px bg-gray-200" />
            {formData?.targetRole && (
                <div>
                    <div className="h-2 w-1/6 bg-gray-200 rounded mb-2" />
                    <div className="h-2 w-full bg-gray-100 rounded mb-1" />
                    <div className="h-2 w-4/5 bg-gray-100 rounded" />
                </div>
            )}
            {skills.length > 0 && (
                <div>
                    <div className="h-2 w-1/6 bg-gray-200 rounded mb-2" />
                    <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 6).map((s, i) => (
                            <span key={i} className="h-5 rounded-full bg-gray-100 px-3 text-[11px] text-gray-600 flex items-center">{s}</span>
                        ))}
                    </div>
                </div>
            )}
            <div className="space-y-1">
                {[0.9, 0.8, 0.85, 0.7].map((w, i) => (
                    <div key={i} className="h-2 bg-gray-100 rounded" style={{ width: `${w * 100}%` }} />
                ))}
            </div>
        </div>
    );
};

// ─── Locked action button ──────────────────────────────────────────────────────

const LockedButton = ({ intent, draftId, label, icon: Icon }) => (
    <Link
        to={buildSignupUrl({ intent, draftId })}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] hover:bg-gray-50 dark:hover:bg-white/8 transition-colors"
    >
        <Icon className="w-4 h-4 text-[#3E424A] dark:text-[#a6adba]" />
        {label}
        <IconLock className="w-3 h-3 text-gray-400 dark:text-gray-600 ml-0.5" />
    </Link>
);

// ─── ResumePreview ─────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Object|null} props.draft — draft object from useResumeDraft
 * @param {Object} props.formData — current form data (used for skeleton / fallback)
 * @param {string} props.templateId — selected template id
 * @param {function} props.onTemplateChange — called when user switches template
 */
const ResumePreview = ({ draft, formData, templateId = 'classic', onTemplateChange, resumeId = null }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [actionState, setActionState] = useState({ saving: false, downloading: false, message: null });

    const resume = normalizeResume(draft?.generatedResume ?? null);
    const Layout = LAYOUT_MAP[templateId] ?? ClassicLayout;

    const ensureSavedResume = async () => {
        if (resumeId) {
            return { id: resumeId };
        }

        if (!draft?.id) {
            throw new Error('Resume draft is missing');
        }

        return createResume({
            name: draft.generatedResume?.header?.name || formData?.targetRole || 'My Resume',
            templateId,
            input: formData,
            generatedResume: draft.generatedResume,
            readinessScore: draft.readinessScore,
            sourceDraftId: draft.id,
        });
    };

    const handleSave = async () => {
        setActionState({ saving: true, downloading: false, message: null });
        try {
            const savedResume = await ensureSavedResume();
            navigate(CAREER_ROUTES.RESUME_DETAIL.replace(':resumeId', savedResume.id));
        } catch (error) {
            setActionState({
                saving: false,
                downloading: false,
                message: error?.response?.data?.message || t('career.errors.saveFailed'),
            });
            return;
        }
        setActionState({ saving: false, downloading: false, message: null });
    };

    const handleDownload = () => {
        setActionState({
            saving: false,
            downloading: false,
            message: t('career.resume.preview.pdfComingSoon'),
        });
    };

    return (
        <div>
            {/* ── Action bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-suisse font-semibold text-lg text-[#141619] dark:text-[#E8ECF3]">
                        {t('career.resume.preview.title')}
                    </h3>
                    {draft?.readinessScore != null && (
                        <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mt-0.5">
                            {t('career.resume.preview.score', { score: draft.readinessScore })}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                    {user ? (
                        <>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={actionState.saving || actionState.downloading}
                                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <IconBookmark className="w-4 h-4" />
                                {actionState.saving ? 'Saving...' : t('career.resume.preview.save')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={actionState.saving || actionState.downloading}
                                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <IconDownload className="w-4 h-4" />
                                {actionState.downloading ? 'Preparing...' : t('career.resume.preview.download')}
                            </button>
                        </>
                    ) : (
                        <>
                            <LockedButton
                                intent={CAREER_INTENT.SAVE}
                                draftId={draft?.id}
                                label={t('career.resume.preview.lockedSave')}
                                icon={IconBookmark}
                            />
                            <LockedButton
                                intent={CAREER_INTENT.DOWNLOAD}
                                draftId={draft?.id}
                                label={t('career.resume.preview.lockedDownload')}
                                icon={IconDownload}
                            />
                        </>
                    )}
                </div>
            </div>

            {actionState.message ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-300">
                    {actionState.message}
                </div>
            ) : null}

            {/* ── Template selector ── */}
            {onTemplateChange && (
                <div className="mb-4">
                    <p className="text-xs text-[#3E424A] dark:text-[#a6adba] mb-2 font-medium">
                        Switch layout — preview updates instantly
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {Object.keys(LAYOUT_MAP).map((id) => (
                            <button
                                key={id}
                                onClick={() => onTemplateChange(id)}
                                className={`cursor-pointer flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                                    templateId === id
                                        ? 'bg-[#E14219] text-white'
                                        : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[#3E424A] dark:text-[#a6adba] hover:bg-gray-50 dark:hover:bg-white/8'
                                }`}
                            >
                                {id.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Paper ── */}
            <div className="relative rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-lg">
                {/* ATS English badge */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                    <span className="text-[11px] text-gray-400 dark:text-gray-600 font-medium">
                        English · ATS-safe · {templateId.replace('_', ' ')} format
                    </span>
                    {draft?.id && (
                        <span className="text-[10px] font-mono text-gray-300 dark:text-gray-700">
                            {draft.id.slice(0, 8)}…
                        </span>
                    )}
                </div>

                {/* Resume paper */}
                <div className="bg-white p-8 min-h-[500px]">
                    {resume && typeof resume === 'string' ? (
                        <ResumeTextFallback text={resume} />
                    ) : resume && typeof resume === 'object' ? (
                        <Layout resume={resume} />
                    ) : (
                        <ResumeSkeleton formData={formData} />
                    )}
                </div>

                {/* Public overlay hint at bottom */}
                {!user && resume && (
                    <div className="border-t border-gray-100 bg-gradient-to-r from-white via-orange-50/30 to-white px-5 py-3">
                        <p className="text-center text-xs text-[#3E424A]">
                            ✓ Preview available for free.{' '}
                            <Link
                                to={buildSignupUrl({ intent: CAREER_INTENT.SAVE, draftId: draft?.id })}
                                className="font-semibold text-[#E14219] hover:underline"
                            >
                                Create an account
                            </Link>
                            {' '}to save and download PDF.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumePreview;

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '@app/providers';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { useResumeDraft, DRAFT_STATUS } from '../hooks/useResumeDraft';
import { useJobMatches, JOB_MATCH_STATUS } from '../hooks/useJobMatches';
import { useCareerUsageStatus } from '../hooks/useCareerUsageStatus';
import ResumePreview from '../components/ResumePreview';
import ResumeReadinessScore from '../components/ResumeReadinessScore';
import JobMatchCard, { JobMatchCardSkeleton } from '../components/JobMatchCard';
import CareerSignupPrompt from '../components/CareerSignupPrompt';
import AiCreditsBadge from '../components/AiCreditsBadge';
import CareerLimitReachedModal from '../components/CareerLimitReachedModal';
import { CAREER_USAGE_KEYS, getUsageMetric, isCareerLimitReachedError, isUsageMetricExhausted } from '../utils/careerUsage';
import { buildSignupUrl, CAREER_INTENT } from '../utils/careerLimits';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrowRight = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
);

const IconSparkle = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
    </svg>
);

const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const IconGlobe = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z" />
    </svg>
);

const IconBolt = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M14.3 2.3a.6.6 0 00-1-.5L4.6 12a.75.75 0 00.57 1.23h4.9l-1.4 8.2a.6.6 0 001.05.5L18.4 12a.75.75 0 00-.57-1.23h-4.9l1.37-8.47z" />
    </svg>
);

const IconClose = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const IconLock = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

const IconSpinner = ({ className = 'w-4 h-4' }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_CHIPS = [
    'Frontend Developer',
    'Full-Stack Developer',
    'Backend Developer',
    'UI/UX Designer',
    'Data Analyst',
];

const STREAM_LABELS = [
    'Writing your summary…',
    'Selecting skills that match remote roles…',
    'Framing your experience for US recruiters…',
    'Highlighting your projects…',
    'Adding education…',
];

const TEMPLATE_META = {
    classic:        { label: 'Classic',       best: 'Safest for any ATS portal' },
    modern:         { label: 'Modern',        best: 'Polished two-column' },
    projects_first: { label: 'Projects First', best: 'When projects beat history' },
    minimal:        { label: 'Minimal',       best: 'Senior, content-first' },
    tech:           { label: 'Tech',          best: 'Highlights stack + GitHub' },
};

const KNOWN_TECH_SKILLS = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Python', 'Django', 'Flask', 'Express', 'Redux', 'Next.js', 'Tailwind CSS', 'CSS',
    'HTML', 'Git', 'Docker', 'Redis', 'GraphQL', 'REST API', 'SQL', 'Figma', 'Java',
    'Go', 'Kotlin', 'Swift', 'Vue', 'Angular', 'Sass', 'Jest', 'CI/CD', 'AWS',
    'Firebase', 'Pandas', 'Tableau', 'Excel', 'Webflow', 'Vite', 'Zustand',
    'Spring Boot', 'FastAPI', 'Flutter', 'Dart', 'Kubernetes',
];

const BTN_PRIMARY = 'cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-[#C2410C] hover:to-[#C2410C] active:scale-[0.98] disabled:opacity-70';

const SAMPLE_PASTE = `Nurlan Asanov
nurlan.asanov@gmail.com · Bishkek, Kyrgyzstan

Junior web developer who loves building clean, fast websites and picks up new tools quickly. Looking for my first remote role.

Skills: JavaScript, React, HTML, CSS, Git, Node.js, MongoDB

Experience
Frontend Developer Intern — CodeLab (2024 - Present)
- Built landing pages in React used by 5,000+ visitors
- Fixed 30+ UI bugs and improved the mobile layout

Freelance Web Developer — Self-employed (2023 - 2024)
- Delivered 6 small-business websites end to end
- Set up hosting, domains and analytics for clients

Education
BSc Computer Science — Kyrgyz National University (2020 - 2024)`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseResumeText(text) {
    const raw = (text || '').replace(/\r/g, '');
    const lines = raw.split('\n').map((l) => l.trim());
    const nonEmpty = lines.filter(Boolean);
    const out = {};

    const nameLine = nonEmpty.find(
        (l) =>
            !/[@\d]/.test(l) &&
            l.split(/\s+/).length <= 4 &&
            /^[A-Za-zА-Яа-яЁё''.\- ]+$/.test(l) &&
            !/skills|experience|education|summary/i.test(l),
    );
    if (nameLine) out.name = nameLine;

    const foundSkills = KNOWN_TECH_SKILLS.filter((t) =>
        new RegExp('(^|[^\\w])' + t.replace(/[.+]/g, '\\$&') + '($|[^\\w])', 'i').test(raw),
    );
    if (foundSkills.length) out.skills = foundSkills;

    const expEntries = [];
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (!/\b(19|20)\d{2}\b/.test(l) || l.length > 100 || !/[A-Za-zА-Яа-я]/.test(l)) continue;
        if (/university|bachelor|college|degree/i.test(l)) continue;
        const period = (l.match(/\(?\b(19|20)\d{2}\b\s*[–\-—to]*\s*(?:(19|20)\d{2}|present|now)?\)?/i) || [''])[0]
            .replace(/[()]/g, '').trim();
        const head = l.replace(period, '').replace(/[—–\-|,()]+\s*$/, '').trim();
        const parts = head.split(/\s+[—–\-@|]\s+|,\s+/);
        const title = (parts[0] || head).trim();
        const company = parts.length >= 2 ? parts.slice(1).join(', ').trim() : '';
        const bullets = [];
        let j = i + 1;
        while (j < lines.length && /^[-•*·]/.test(lines[j])) {
            bullets.push(lines[j].replace(/^[-•*·]\s*/, '').trim());
            j++;
        }
        expEntries.push({ title, company, period, description: bullets.join('\n') });
    }
    if (expEntries.length) out.experience = expEntries.slice(0, 4);

    return out;
}

function splitSkillsString(str) {
    return (str || '').split(/[,;|\n]+/).map((s) => s.trim()).filter(Boolean);
}

// ─── Template thumbnail ──────────────────────────────────────────────────────

function TemplateThumb({ id, active, onClick }) {
    const meta = TEMPLATE_META[id] || {};
    const bar = (w, dark) => (
        <div className="h-1 rounded-full" style={{ width: w, background: dark ? '#9aa1ab' : '#d8dce1' }} />
    );
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex-shrink-0 w-[112px] text-left rounded-xl border p-2 transition-all ${
                active
                    ? 'border-[#E14219] ring-2 ring-[#E14219]/20 bg-white'
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
            <div className="h-[78px] rounded-md bg-gray-50 border border-gray-100 p-2 overflow-hidden">
                {id === 'modern' ? (
                    <div className="flex gap-1.5 h-full">
                        <div className="w-1/3 bg-gray-200/70 rounded-sm p-1 space-y-1">
                            {bar('100%', 1)}{bar('70%')}{bar('80%')}
                        </div>
                        <div className="flex-1 space-y-1 pt-0.5">
                            {bar('60%', 1)}{bar('100%')}{bar('90%')}{bar('95%')}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {bar('55%', 1)}
                        <div className="h-px bg-gray-200 my-1" />
                        {bar('100%')}{bar('92%')}{bar(id === 'projects_first' ? '85%' : '78%')}{bar('88%')}
                    </div>
                )}
            </div>
            <p className={`mt-1.5 text-[11.5px] font-semibold truncate ${active ? 'text-[#E14219]' : 'text-[#141619]'}`}>
                {meta.label}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{meta.best}</p>
        </button>
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ roleText, setRoleText, onGenerate, template, setTemplate, busy, locked, lockedHint }) {
    return (
        <section className="relative overflow-hidden bg-[#0F1013] text-white px-6 pt-14 pb-12 sm:px-8">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
                    backgroundSize: '54px 54px',
                }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[420px] w-[760px] rounded-full bg-[#E14219] opacity-[0.10] blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF8C6E] animate-pulse" />
                    EduBot Career — free to try, no signup
                </span>

                <h1 className="font-suisse font-bold text-[34px] leading-[1.08] tracking-tight sm:text-[52px]">
                    Land a remote job<br className="hidden sm:block" /> at a US company.
                </h1>
                <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-white/60 max-w-lg mx-auto">
                    Type your role to see a live example in seconds, then make it yours by pasting your old resume or filling a few fields. English, ATS-safe, built for remote USD jobs.
                </p>

                <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="mt-8">
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 max-w-xl mx-auto">
                        <div className="flex flex-1 items-center gap-2.5 pl-3">
                            <span className="text-[#E14219] flex-shrink-0">
                                <IconSparkle className="w-5 h-5" />
                            </span>
                            <input
                                value={roleText}
                                onChange={(e) => setRoleText(e.target.value)}
                                placeholder="What role are you applying for?"
                                autoFocus
                                disabled={busy}
                                className="w-full bg-transparent py-3 text-[15px] text-[#141619] placeholder:text-gray-400 outline-none disabled:opacity-60"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={busy || locked}
                            className={`${BTN_PRIMARY} sm:px-7`}
                        >
                            {busy ? (
                                <><IconSpinner className="w-4 h-4" /> Writing…</>
                            ) : (
                                <>Generate my resume <IconArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                    {lockedHint && (
                        <p className="mt-3 text-xs text-amber-400">{lockedHint}</p>
                    )}
                </form>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {ROLE_CHIPS.map((chip) => (
                        <button
                            key={chip}
                            type="button"
                            onClick={() => setRoleText(chip)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            {chip}
                        </button>
                    ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                        <IconGlobe className="w-4 h-4 text-[#FF8C6E]" />
                        Type in Русский or Кыргызча → English resume
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <IconCheck className="w-4 h-4 text-[#FF8C6E]" />
                        ATS-safe
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <IconBolt className="w-4 h-4 text-[#FF8C6E]" />
                        Ready in ~10–30s
                    </span>
                </div>

                <div className="mt-10">
                    <p className="text-[12px] font-medium text-white/50 mb-3">
                        Pick a look — you can switch anytime
                    </p>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 justify-start sm:justify-center px-1">
                        {Object.keys(TEMPLATE_META).map((id) => (
                            <TemplateThumb
                                key={id}
                                id={id}
                                active={template === id}
                                onClick={() => setTemplate(id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Make it yours panel ─────────────────────────────────────────────────────

function MakeYoursPanel({ open, onClose, onApply, busy }) {
    const [tab, setTab] = useState('paste');
    const [paste, setPaste] = useState('');
    const [name, setName] = useState('');
    const [skills, setSkills] = useState('');
    const [english, setEnglish] = useState('B2');
    const [exp, setExp] = useState('');

    if (!open) return null;

    const handlePasteApply = () => onApply(parseResumeText(paste));

    const handleTypeApply = () => {
        const data = {};
        if (name.trim()) data.name = name.trim();
        const sk = splitSkillsString(skills);
        if (sk.length) data.skills = sk;
        if (exp.trim()) {
            const lines = exp.split('\n').map((l) => l.trim());
            const entries = [];
            for (let i = 0; i < lines.length; i++) {
                const l = lines[i];
                if (!l) continue;
                if (/\b(19|20)\d{2}\b/.test(l) || (entries.length === 0 && !/^[-•*·]/.test(l))) {
                    const period = (l.match(/\(?\b(19|20)\d{2}\b[^)]*\)?/i) || [''])[0]
                        .replace(/[()]/g, '').trim();
                    const head = l.replace(period, '').replace(/[—–\-|,()]+\s*$/, '').trim();
                    const parts = head.split(/\s+[—–\-@|]\s+|,\s+/);
                    entries.push({
                        title: (parts[0] || head).trim(),
                        company: parts.length >= 2 ? parts.slice(1).join(', ').trim() : '',
                        period,
                        description: '',
                    });
                } else if (entries.length > 0 && /^[-•*·]/.test(l)) {
                    const last = entries[entries.length - 1];
                    const bullet = l.replace(/^[-•*·]\s*/, '');
                    last.description = last.description ? `${last.description}\n${bullet}` : bullet;
                }
            }
            if (entries.length) data.experience = entries.slice(0, 4);
        }
        data.englishLevel = english;
        onApply(data);
    };

    const inputCls = 'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[14px] text-[#141619] outline-none focus:ring-2 focus:ring-[#E14219]/20 focus:border-[#E14219]/50';

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div onClick={onClose} className="absolute inset-0 bg-[#0F1013]/50 backdrop-blur-sm" />
            <div className="relative z-10 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-4">
                    <div>
                        <h3 className="font-suisse font-bold text-lg text-[#141619]">Make it yours</h3>
                        <p className="text-[12.5px] text-[#3E424A]">Swap the example for your real details.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#141619]"
                    >
                        <IconClose />
                    </button>
                </div>

                <div className="flex gap-1 mx-6 mt-6 rounded-xl bg-gray-100 p-1">
                    {[['paste', 'Paste your resume'], ['type', 'Type it in']].map(([k, l]) => (
                        <button
                            key={k}
                            type="button"
                            onClick={() => setTab(k)}
                            className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors ${
                                tab === k ? 'bg-white text-[#141619] shadow-sm' : 'text-[#3E424A]'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {tab === 'paste' ? (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[12.5px] font-semibold text-[#141619]">
                                    Paste your old resume or LinkedIn
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setPaste(SAMPLE_PASTE)}
                                    className="text-[11.5px] font-medium text-[#E14219] hover:underline"
                                >
                                    Use a sample
                                </button>
                            </div>
                            <textarea
                                value={paste}
                                onChange={(e) => setPaste(e.target.value)}
                                rows={9}
                                placeholder="Paste plain text — name, skills, experience…"
                                className={`${inputCls} resize-none font-mono text-[12px] leading-relaxed`}
                            />
                            <p className="mt-2 text-[11.5px] text-gray-400">
                                We&apos;ll extract your name, skills and experience. Fix anything in the editor after signing up.
                            </p>
                            <button
                                type="button"
                                onClick={handlePasteApply}
                                disabled={!paste.trim() || busy}
                                className={`${BTN_PRIMARY} w-full mt-4`}
                            >
                                <IconSparkle className="w-4 h-4" />
                                {busy ? 'Generating…' : 'Fill from my resume'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12.5px] font-semibold mb-1.5 text-[#141619]">Full name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Nurlan Asanov"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-[12.5px] font-semibold mb-1.5 text-[#141619]">
                                    Your skills{' '}
                                    <span className="font-normal text-gray-400">— comma separated</span>
                                </label>
                                <input
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="React, JavaScript, CSS, Git"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-[12.5px] font-semibold mb-1.5 text-[#141619]">English level</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['A2', 'B1', 'B2', 'C1', 'Native'].map((l) => (
                                        <button
                                            key={l}
                                            type="button"
                                            onClick={() => setEnglish(l)}
                                            className={`rounded-lg border px-2 py-2 text-[12px] font-semibold transition-colors ${
                                                english === l
                                                    ? 'border-[#E14219] bg-[#E14219]/8 text-[#E14219]'
                                                    : 'border-gray-200 text-[#3E424A] hover:border-gray-300'
                                            }`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12.5px] font-semibold mb-1.5 text-[#141619]">
                                    Experience{' '}
                                    <span className="font-normal text-gray-400">— optional</span>
                                </label>
                                <textarea
                                    value={exp}
                                    onChange={(e) => setExp(e.target.value)}
                                    rows={4}
                                    placeholder={
                                        'Frontend Intern — CodeLab (2024 - Present)\n- Built landing pages in React'
                                    }
                                    className={`${inputCls} resize-none text-[12.5px]`}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleTypeApply}
                                disabled={(!name.trim() && !skills.trim()) || busy}
                                className={`${BTN_PRIMARY} w-full`}
                            >
                                <IconCheck className="w-4 h-4" />
                                {busy ? 'Generating…' : 'Use my details'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Editor gate (guests only) ────────────────────────────────────────────────

function EditorGate({ draftId, roleText }) {
    const signupUrl = buildSignupUrl({ intent: CAREER_INTENT.SAVE, draftId });
    const values = [
        'Edit every line, inline on the paper',
        'Switch between 5 ATS-safe templates',
        'Tailor your resume to any job description',
        'Auto-saved — pick up where you left off',
    ];
    const line = (w, c = '#e5e7eb') => <div className="h-2 rounded" style={{ width: w, background: c }} />;

    return (
        <section className="px-6 py-16 sm:px-8 bg-[#0F1013]">
            <div className="mx-auto max-w-5xl">
                <div className="relative rounded-3xl border border-white/10 overflow-hidden">
                    {/* Faux editor blurred */}
                    <div
                        className="grid grid-cols-[1fr_1.3fr_0.8fr] h-[300px] select-none"
                        style={{ filter: 'blur(3px)', opacity: 0.5 }}
                        aria-hidden="true"
                    >
                        <div className="bg-[#1a1c20] p-4 space-y-3 border-r border-white/5">
                            {line('40%', '#3a3d44')}{line('90%', '#2a2d33')}
                            {line('80%', '#2a2d33')}{line('60%', '#2a2d33')}
                            <div className="h-6" />
                            {line('45%', '#3a3d44')}{line('85%', '#2a2d33')}{line('70%', '#2a2d33')}
                        </div>
                        <div className="bg-gray-300 p-5">
                            <div className="bg-white rounded h-full p-4 space-y-2">
                                {line('50%', '#cbd0d6')}{line('30%')}
                                <div className="h-2" />
                                {line('100%')}{line('92%')}{line('85%')}
                                <div className="h-3" />
                                {line('40%', '#cbd0d6')}{line('95%')}{line('88%')}
                            </div>
                        </div>
                        <div className="bg-[#1a1c20] p-4 space-y-3 border-l border-white/5">
                            <div className="h-16 w-16 rounded-full border-4 border-[#E14219]/40 mx-auto" />
                            {line('80%', '#2a2d33')}{line('60%', '#2a2d33')}{line('70%', '#2a2d33')}
                        </div>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0F1013]/60 via-[#0F1013]/80 to-[#0F1013] px-6">
                        <div className="text-center max-w-md">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 mb-4">
                                <IconLock className="w-3 h-3" /> The full editor
                            </span>
                            <h3 className="font-suisse font-bold text-2xl sm:text-3xl text-white">
                                Your draft is saved.<br />Sign in to keep editing.
                            </h3>
                            <ul className="mt-5 inline-flex flex-col gap-2 text-left">
                                {values.map((v) => (
                                    <li key={v} className="flex items-center gap-2.5 text-[13.5px] text-white/75">
                                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E14219]/20 text-[#FF8C6E]">
                                            <IconCheck className="w-3 h-3" />
                                        </span>
                                        {v}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-7">
                                <a
                                    href={signupUrl}
                                    className={BTN_PRIMARY + ' px-7 py-3.5 text-[15px]'}
                                >
                                    Create free account — keep editing <IconArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                            <p className="mt-3 text-[12px] text-white/40">
                                Free forever · {roleText || 'Your'} draft carried straight into the editor
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PublicResumeBuilderPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const { status, draft, error, generate, retry, reset, getSavedFormData } = useResumeDraft();
    const recoveryState = location.state?.careerRecovery ?? null;
    const savedFormData = useMemo(
        () =>
            recoveryState?.type === 'draft_expired'
                ? getSavedFormData({ allowGuestFallback: true, migrateGuestFallback: true })
                : getSavedFormData(),
        [getSavedFormData, recoveryState?.type],
    );

    const { usage } = useCareerUsageStatus({ enabled: Boolean(user) });
    const resumeUsageMetric = getUsageMetric(usage, CAREER_USAGE_KEYS.RESUME_GENERATIONS);
    const isResumeGenerationLocked = Boolean(user) && isUsageMetricExhausted(resumeUsageMetric);

    const { status: matchStatus, matches, refetch: refetchMatches } = useJobMatches(
        status === DRAFT_STATUS.READY ? draft?.id : null,
    );
    const PUBLIC_JOB_LIMIT = 3;
    const visibleMatches = user ? matches : matches.slice(0, PUBLIC_JOB_LIMIT);
    const hiddenCount = user ? 0 : Math.max(0, matches.length - PUBLIC_JOB_LIMIT);

    const [roleText, setRoleText] = useState(() => savedFormData?.targetRole || '');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [lastFormData, setLastFormData] = useState(null);
    const [extras, setExtras] = useState({});
    const [extrasAdded, setExtrasAdded] = useState(false);
    const [isYours, setIsYours] = useState(false);
    const [makeYoursOpen, setMakeYoursOpen] = useState(false);
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const [streamLabel, setStreamLabel] = useState('');

    const resultsRef = useRef(null);
    const streamTimerRef = useRef(null);

    const isGenerating = status === DRAFT_STATUS.CREATING || status === DRAFT_STATUS.GENERATING;

    // Rotate streaming labels during generation
    useEffect(() => {
        if (isGenerating) {
            let idx = 0;
            setStreamLabel(STREAM_LABELS[0]);
            streamTimerRef.current = setInterval(() => {
                idx = (idx + 1) % STREAM_LABELS.length;
                setStreamLabel(STREAM_LABELS[idx]);
            }, 2800);
        } else {
            clearInterval(streamTimerRef.current);
            setStreamLabel('');
        }
        return () => clearInterval(streamTimerRef.current);
    }, [isGenerating]);

    useEffect(() => {
        if (error && isCareerLimitReachedError(error)) setLimitModalOpen(true);
    }, [error]);

    useEffect(() => {
        if (isGenerating) {
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [isGenerating]);

    const enrichedFormData = useMemo(() => {
        const base = lastFormData ?? savedFormData ?? {};
        if (!draft?.generatedResume) return base;
        const header = draft.generatedResume?.header ?? {};
        return {
            ...base,
            email:      base.email      || header.email,
            github:     base.github     || header.github,
            linkedin:   base.linkedin   || header.linkedin,
            location:   base.location   || header.location,
            englishLevel: base.englishLevel,
            hasProjects: (draft.generatedResume?.projects?.length ?? 0) > 0,
        };
    }, [lastFormData, savedFormData, draft]);

    const runGenerate = useCallback((formData, templateId) => {
        setLastFormData(formData);
        setSelectedTemplate(templateId);
        setExtrasAdded(false);
        generate({ ...formData, extras }, templateId);
    }, [generate, extras]);

    const handleHeroSubmit = useCallback(() => {
        const role = roleText.trim() || 'Frontend Developer';
        setIsYours(false);
        runGenerate(
            { name: 'Edubot Learning', targetRole: role, language: 'en', skills: [], experience: [], context: ['want_remote'] },
            selectedTemplate,
        );
    }, [roleText, selectedTemplate, runGenerate]);

    const handleMakeYoursApply = useCallback((parsed) => {
        const role = roleText.trim() || lastFormData?.targetRole || 'Frontend Developer';
        setIsYours(true);
        setMakeYoursOpen(false);
        runGenerate(
            {
                name:       parsed.name || lastFormData?.name || '',
                targetRole: role,
                skills:     parsed.skills || lastFormData?.skills || [],
                experience: parsed.experience || [],
                language:   'en',
                context:    ['want_remote'],
            },
            selectedTemplate,
        );
    }, [roleText, lastFormData, selectedTemplate, runGenerate]);

    const handleExtraChange = useCallback((key, value) => {
        setExtras((prev) => ({ ...prev, [key]: value }));
        setExtrasAdded(true);
    }, []);

    const handleRegenerate = useCallback(() => {
        if (!lastFormData) return;
        generate({ ...lastFormData, extras }, selectedTemplate);
        setExtrasAdded(false);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }, [generate, lastFormData, extras, selectedTemplate]);

    const handleReset = useCallback(() => {
        reset();
        setLastFormData(null);
        setExtras({});
        setExtrasAdded(false);
        setIsYours(false);
        setRoleText('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reset]);

    const showResults = status !== DRAFT_STATUS.IDLE;
    const hasLimitError = Boolean(error) && isCareerLimitReachedError(error);
    const badgeIsYours = isYours || Boolean(user);

    return (
        <div className="bg-white dark:bg-[#141619] text-[#141619] dark:text-[#E8ECF3]">

            <Hero
                roleText={roleText}
                setRoleText={setRoleText}
                onGenerate={handleHeroSubmit}
                template={selectedTemplate}
                setTemplate={setSelectedTemplate}
                busy={isGenerating}
                locked={isResumeGenerationLocked}
                lockedHint={isResumeGenerationLocked ? t('career.usage.lockedHint') : null}
            />

            {/* Recovery notice */}
            {recoveryState?.type === 'draft_expired' && (
                <div className="px-6 sm:px-8 pt-6">
                    <div className="mx-auto max-w-5xl rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-5 py-4">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            {t('career.intent.recovery.title')}
                        </p>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                            {savedFormData
                                ? t('career.intent.recovery.restored')
                                : t('career.intent.recovery.empty')}
                        </p>
                    </div>
                </div>
            )}

            {/* Usage credits badge (auth users) */}
            {user && resumeUsageMetric && (
                <div className="px-6 sm:px-8 pt-5">
                    <div className="mx-auto max-w-5xl flex justify-center">
                        <AiCreditsBadge
                            metricKey={CAREER_USAGE_KEYS.RESUME_GENERATIONS}
                            metric={resumeUsageMetric}
                        />
                    </div>
                </div>
            )}

            {/* Results */}
            {showResults && (
                <section ref={resultsRef} className="px-6 py-12 sm:px-8 bg-white dark:bg-[#0F1013] scroll-mt-4">
                    <div className="mx-auto max-w-5xl">

                        {/* Status header */}
                        <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
                            <div>
                                <h2 className="font-suisse font-bold text-2xl sm:text-[28px]">
                                    {isGenerating
                                        ? 'Building your example…'
                                        : badgeIsYours
                                        ? 'Your resume'
                                        : 'Your example resume'}
                                </h2>
                                <p className="text-[13.5px] text-[#3E424A] dark:text-[#a6adba] mt-1">
                                    {isGenerating ? (
                                        <span className="inline-flex items-center gap-2">
                                            <IconSpinner className="w-4 h-4 text-[#E14219]" />
                                            {streamLabel || 'Starting…'}
                                        </span>
                                    ) : badgeIsYours
                                        ? 'Your details · English · ATS-safe. Switch templates or improve your score below.'
                                        : `An example for ${roleText.trim() || 'your role'}. Make it yours to drop in your real details.`}
                                </p>
                            </div>
                            {status === DRAFT_STATUS.READY && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-[13px] text-gray-400 hover:text-[#141619] dark:hover:text-[#E8ECF3]"
                                >
                                    Start over
                                </button>
                            )}
                        </div>

                        {/* Error */}
                        {status === DRAFT_STATUS.ERROR && !hasLimitError && (
                            <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 px-6 py-5">
                                <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mb-3">
                                    {error?.response?.data?.message ??
                                        'Generation failed. Your form data has been saved — try again.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => retry(lastFormData ?? {}, selectedTemplate)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] hover:bg-gray-50 transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* "This is an example" banner */}
                        {status === DRAFT_STATUS.READY && !badgeIsYours && (
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-[#E14219]/25 bg-gradient-to-r from-[#FF8C6E]/[0.12] to-transparent dark:from-[#FF8C6E]/[0.08] dark:to-transparent px-5 py-4">
                                <div className="flex-1">
                                    <p className="font-suisse font-semibold text-[15px] text-[#141619] dark:text-[#E8ECF3]">
                                        This is an example — make it yours
                                    </p>
                                    <p className="text-[12.5px] text-[#3E424A] dark:text-[#a6adba] mt-0.5">
                                        Paste your old resume or type a few details. Takes about 20 seconds.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMakeYoursOpen(true)}
                                    className={`${BTN_PRIMARY} flex-shrink-0`}
                                >
                                    <IconSparkle className="w-4 h-4" /> Make it mine
                                </button>
                            </div>
                        )}

                        {/* "Now it's yours" banner */}
                        {status === DRAFT_STATUS.READY && isYours && !user && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-500/5 px-5 py-3">
                                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600">
                                    <IconCheck className="w-4 h-4" />
                                </span>
                                <p className="text-[13px] text-[#141619] dark:text-[#E8ECF3]">
                                    <span className="font-semibold">Now it&apos;s yours.</span> Finish experience &amp; projects in the editor after signing up.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setMakeYoursOpen(true)}
                                    className="ml-auto flex-shrink-0 whitespace-nowrap text-[12.5px] font-medium text-[#E14219] hover:underline"
                                >
                                    Edit details
                                </button>
                            </div>
                        )}

                        {/* Two-column: score + preview — visible during generating and ready */}
                        {(isGenerating || status === DRAFT_STATUS.READY) && (
                            <div className="flex flex-col lg:flex-row gap-6 items-start">
                                {/* Score panel */}
                                <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 order-2 lg:order-1">
                                    {isGenerating ? (
                                        <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm p-5 flex items-center gap-4">
                                            <div className="relative flex-shrink-0 w-[110px] h-[110px]">
                                                <svg width="110" height="110" className="-rotate-90">
                                                    <circle cx="55" cy="55" r="49" fill="none" stroke="#eef0f3" strokeWidth="10" />
                                                    <circle cx="55" cy="55" r="49" fill="none" stroke="#E0A100" strokeWidth="10"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${0.22 * 2 * Math.PI * 49} ${2 * Math.PI * 49}`}
                                                        style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.2,0.8,0.2,1)' }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="font-suisse font-bold text-[28px] leading-none tabular-nums text-[#E0A100]">22</span>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">of 100</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-suisse font-bold text-[14px] text-[#141619] dark:text-[#E8ECF3]">Readiness score</p>
                                                <p className="text-[12px] text-[#3E424A] dark:text-[#a6adba] mt-1">Updating as sections fill in…</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <ResumeReadinessScore
                                            formData={enrichedFormData}
                                            apiScore={draft?.readinessScore ?? null}
                                            extras={extras}
                                            onExtraChange={handleExtraChange}
                                            onRegenerate={handleRegenerate}
                                            hasExtrasToRegenerate={extrasAdded}
                                        />
                                    )}
                                </div>

                                {/* Preview */}
                                <div className="flex-1 min-w-0 w-full order-1 lg:order-2">
                                    {/* Template strip */}
                                    <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                                        <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#3E424A] dark:text-[#a6adba]">
                                            Template
                                        </span>
                                        {Object.entries(TEMPLATE_META).map(([id, meta]) => (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => setSelectedTemplate(id)}
                                                className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                                    selectedTemplate === id
                                                        ? 'bg-[#141619] dark:bg-white text-white dark:text-[#141619]'
                                                        : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[#3E424A] dark:text-[#a6adba] hover:border-gray-300 dark:hover:border-white/20'
                                                }`}
                                            >
                                                {meta.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Paper */}
                                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 shadow-lg overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={`flex-shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                                                    badgeIsYours
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                                }`}>
                                                    {badgeIsYours ? 'YOUR DRAFT' : 'EXAMPLE'}
                                                </span>
                                                <span className="truncate text-[11px] font-medium text-gray-400">
                                                    English · ATS-safe · {TEMPLATE_META[selectedTemplate]?.label}
                                                </span>
                                            </div>
                                            <span className="flex-shrink-0 text-[10px] font-mono text-gray-300 dark:text-gray-600">A4</span>
                                        </div>
                                        {isGenerating ? (
                                            <div className="bg-white dark:bg-[#1a1a1a] p-7 sm:p-9 min-h-[520px]">
                                                <div className="space-y-2 animate-pulse">
                                                    <div className="h-5 w-44 bg-gray-100 dark:bg-white/5 rounded" />
                                                    <div className="h-3 w-28 bg-gray-100 dark:bg-white/5 rounded" />
                                                    <div className="h-px bg-gray-200 dark:bg-white/10 my-3" />
                                                    <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded" />
                                                    <div className="h-3 w-5/6 bg-gray-100 dark:bg-white/5 rounded" />
                                                    <div className="h-3 w-4/5 bg-gray-100 dark:bg-white/5 rounded" />
                                                </div>
                                                <div className="flex items-center gap-2 mt-6">
                                                    <IconSpinner className="w-4 h-4 text-[#E14219]" />
                                                    <p className="text-[13px] text-[#3E424A] dark:text-[#a6adba]">
                                                        {streamLabel || 'Preparing your resume…'}
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-[12px] text-gray-400">
                                                    Usually 10–30 seconds. Please don&apos;t close this tab.
                                                </p>
                                            </div>
                                        ) : (
                                            <ResumePreview
                                                draft={draft}
                                                formData={enrichedFormData}
                                                templateId={selectedTemplate}
                                                paperOnly
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Editor gate — guests only, after first generation */}
            {!user && status === DRAFT_STATUS.READY && (
                <EditorGate draftId={draft?.id} roleText={roleText} />
            )}

            {/* Job matches */}
            {status === DRAFT_STATUS.READY && (
                <section className="px-6 py-16 sm:px-8 bg-gray-50 dark:bg-[#141619] border-t border-gray-100 dark:border-white/5">
                    <div className="mx-auto max-w-5xl">
                        <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
                            <div>
                                <h2 className="font-suisse font-bold text-2xl sm:text-[28px]">
                                    {t('career.jobs.title')}
                                </h2>
                                <p className="text-[13.5px] text-[#3E424A] dark:text-[#a6adba] mt-1">
                                    {t('career.jobs.subtitle')} — Remote · USD salaries
                                </p>
                            </div>
                            {matchStatus === JOB_MATCH_STATUS.LOADING && (
                                <span className="flex items-center gap-2 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                    <IconSpinner className="w-4 h-4 text-[#E14219]" />
                                    Finding matches…
                                </span>
                            )}
                        </div>

                        {matchStatus === JOB_MATCH_STATUS.LOADING && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <JobMatchCardSkeleton /><JobMatchCardSkeleton /><JobMatchCardSkeleton />
                            </div>
                        )}

                        {matchStatus === JOB_MATCH_STATUS.ERROR && (
                            <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 px-6 py-8 text-center mb-8">
                                <p className="text-sm text-[#3E424A] dark:text-[#a6adba] mb-3">
                                    {t('career.errors.matchFailed')}
                                </p>
                                <button
                                    type="button"
                                    onClick={refetchMatches}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-[#3E424A] dark:text-[#a6adba] hover:bg-gray-50 transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {matchStatus === JOB_MATCH_STATUS.READY && visibleMatches.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                {visibleMatches.map((match) => (
                                    <JobMatchCard key={match.id ?? match.jobId} match={match} draftId={draft?.id} />
                                ))}
                            </div>
                        )}

                        {matchStatus === JOB_MATCH_STATUS.READY && matches.length === 0 && (
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-6 py-12 text-center mb-8">
                                <p className="font-suisse font-semibold text-base mb-2">Job matching coming soon</p>
                                <p className="text-sm text-[#3E424A] dark:text-[#a6adba] max-w-sm mx-auto">
                                    We&apos;re building the job matching engine. Save your resume now and we&apos;ll notify you when matches are ready.
                                </p>
                            </div>
                        )}

                        {!user && matchStatus === JOB_MATCH_STATUS.READY && (
                            <CareerSignupPrompt draftId={draft?.id} hiddenCount={hiddenCount} />
                        )}
                        {!user && matchStatus === JOB_MATCH_STATUS.LOADING && (
                            <div className="mt-8">
                                <CareerSignupPrompt draftId={draft?.id} hiddenCount={0} />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Footer — guests only */}
            {!user && (
                <footer className="px-6 py-10 bg-white dark:bg-[#141619] border-t border-gray-100 dark:border-white/5">
                    <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-gray-400">
                        <p>EduBot Career — English resumes &amp; remote jobs for developers in Kyrgyzstan.</p>
                        <Link
                            to={CAREER_ROUTES.DASHBOARD}
                            className="font-semibold text-[#E14219] hover:underline"
                        >
                            Already have an account? Go to Career Hub →
                        </Link>
                    </div>
                </footer>
            )}

            <MakeYoursPanel
                open={makeYoursOpen}
                onClose={() => setMakeYoursOpen(false)}
                onApply={handleMakeYoursApply}
                busy={isGenerating}
            />

            <CareerLimitReachedModal
                open={limitModalOpen}
                onClose={() => setLimitModalOpen(false)}
                metricKey={CAREER_USAGE_KEYS.RESUME_GENERATIONS}
                metric={resumeUsageMetric}
            />
        </div>
    );
};

export default PublicResumeBuilderPage;

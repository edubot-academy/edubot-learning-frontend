import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../../config';
import { DashboardWorkspaceHero } from '../../../../components/ui/dashboard';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';
import useResourceProgress from '@features/externalResources/hooks/useResourceProgress';
import { getResourceBySlug } from '@features/externalResources/data/externalResources';
import {
    generateAiStudyPlan,
    explainConcept,
    generatePracticeTasks,
    uploadResourceCertificate,
} from '@features/externalResources/api';
import { FiBookmark, FiBookOpen, FiCheckCircle, FiGlobe } from 'react-icons/fi';

const STATUS_COLOR = {
    saved: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
    started: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40',
    completed: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
};

const Spinner = ({ size = 'w-4 h-4' }) => (
    <svg className={`animate-spin ${size}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
);

const AiCard = ({ color, title, children }) => {
    const colorMap = {
        orange: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800/40',
        blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30',
        green: 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30',
    };
    const titleColorMap = {
        orange: 'text-[#E14219]',
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-700 dark:text-green-400',
    };
    return (
        <div className={`rounded-xl border p-3 ${colorMap[color]}`}>
            <p className={`text-xs font-semibold mb-2 ${titleColorMap[color]}`}>{title}</p>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <ReactMarkdown
                    components={{
                        p: ({ children: c }) => <p className="mb-2 last:mb-0">{c}</p>,
                        strong: ({ children: c }) => <strong className="font-semibold text-gray-800 dark:text-gray-200">{c}</strong>,
                        em: ({ children: c }) => <em className="italic">{c}</em>,
                        ul: ({ children: c }) => <ul className="list-disc list-inside space-y-1 mb-2">{c}</ul>,
                        ol: ({ children: c }) => <ol className="list-decimal list-inside space-y-1 mb-2">{c}</ol>,
                        li: ({ children: c }) => <li className="leading-relaxed">{c}</li>,
                        code: ({ children: c }) => <code className="bg-black/5 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono">{c}</code>,
                    }}
                >
                    {children}
                </ReactMarkdown>
            </div>
        </div>
    );
};

const TopicPills = ({ weeks, lang, selected, onSelect, allLabel }) => {
    if (!weeks?.length) return null;
    const pillCls = (active) =>
        `px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
            active
                ? 'bg-[#E14219] border-[#E14219] text-white'
                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#E14219]/50 hover:text-[#E14219]'
        }`;
    return (
        <div className="flex flex-wrap gap-1.5">
            <button className={pillCls(selected === null)} onClick={() => onSelect(null)}>{allLabel}</button>
            {weeks.map((w) => {
                const title = w.title?.[lang] ?? w.title?.ky ?? w.title?.en ?? `Week ${w.week}`;
                return (
                    <button key={w.week} className={pillCls(selected === title)} onClick={() => onSelect(title)}>
                        {title}
                    </button>
                );
            })}
        </div>
    );
};

const ResourceDetailPanel = ({
    entry, lang, t,
    startResource, completeResource, toggleWeek,
    updateNotes, removeResource, setCertificateUrl, saveAiContent,
}) => {
    const slug = entry?.slug;
    const staticResource = slug ? getResourceBySlug(slug) : null;
    const studyPlan = staticResource?.content?.studyPlan ?? [];

    // '' is used as the map key for "All topics" (null cannot be an object key)
    const [planTopic, setPlanTopic] = useState(null);
    const [practiceTopic, setPracticeTopic] = useState(null);
    const planKey = planTopic ?? '';
    const practiceKey = practiceTopic ?? '';

    const cachedPlan = entry?.aiCache?.plans?.[planKey] ?? null;
    const cachedTasks = entry?.aiCache?.tasks?.[practiceKey] ?? null;

    const [aiPlan, setAiPlan] = useState(() => cachedPlan);
    const [aiPlanSaved, setAiPlanSaved] = useState(() => !!cachedPlan);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(false);
    const [conceptInput, setConceptInput] = useState('');
    const [conceptResult, setConceptResult] = useState(null);
    const [conceptLoading, setConceptLoading] = useState(false);
    const [conceptError, setConceptError] = useState(false);
    const [practiceTasks, setPracticeTasks] = useState(() => cachedTasks);
    const [practiceLoading, setPracticeLoading] = useState(false);
    const [practiceError, setPracticeError] = useState(false);
    const [certUploading, setCertUploading] = useState(false);

    // Reset when switching to a different resource
    useEffect(() => {
        setPlanTopic(null);
        setPracticeTopic(null);
        setAiError(false);
        setConceptInput('');
        setConceptResult(null);
        setConceptError(false);
        setPracticeError(false);
    }, [slug]);

    const handleStart = useCallback(() => {
        startResource(slug, { title: entry.title, provider: entry.provider });
        toast.success(t('public.externalResources.startToast', { title: entry.title }));
    }, [startResource, slug, entry, t]);

    const handleComplete = useCallback(() => {
        completeResource(slug);
        toast.success(t('public.externalResources.completeToast', { title: entry.title }));
    }, [completeResource, slug, entry, t]);

    const handleAiStudyPlan = async () => {
        if (aiPlan) { setAiPlan(null); setAiPlanSaved(false); return; }
        setAiLoading(true); setAiError(false);
        try {
            const plan = await generateAiStudyPlan(slug, lang, planTopic);
            if (!plan?.trim()) throw new Error('empty');
            setAiPlan(plan);
            setAiPlanSaved(false);
        }
        catch { setAiError(true); }
        finally { setAiLoading(false); }
    };

    const handleSaveAiPlan = () => {
        if (!aiPlan) return;
        saveAiContent(slug, 'plans', planKey, aiPlan);
        setAiPlanSaved(true);
        toast.success(t('public.externalResources.aiPlanSaved'));
    };

    const handleConceptExplain = async () => {
        const concept = conceptInput.trim();
        if (!concept) return;
        // Show cached explanation instantly if available
        const cached = entry?.aiCache?.explanations?.[concept];
        if (cached) { setConceptResult(cached); return; }
        setConceptLoading(true); setConceptError(false); setConceptResult(null);
        try {
            const result = await explainConcept(slug, concept, lang);
            if (!result?.trim()) throw new Error('empty');
            setConceptResult(result);
            saveAiContent(slug, 'explanations', concept, result);
        }
        catch { setConceptError(true); }
        finally { setConceptLoading(false); }
    };

    const [practiceTasksSaved, setPracticeTasksSaved] = useState(() => !!cachedTasks);

    const handlePracticeTasks = async () => {
        if (practiceTasks) { setPracticeTasks(null); setPracticeTasksSaved(false); return; }
        setPracticeLoading(true); setPracticeError(false);
        try {
            const tasks = await generatePracticeTasks(slug, lang, practiceTopic);
            if (!tasks?.trim()) throw new Error('empty');
            setPracticeTasks(tasks);
            setPracticeTasksSaved(false);
        }
        catch { setPracticeError(true); }
        finally { setPracticeLoading(false); }
    };

    const handleSavePracticeTasks = () => {
        if (!practiceTasks) return;
        saveAiContent(slug, 'tasks', practiceKey, practiceTasks);
        setPracticeTasksSaved(true);
        toast.success(t('public.externalResources.aiPlanSaved'));
    };

    const handleCertUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCertUploading(true);
        try {
            const updated = await uploadResourceCertificate(slug, file);
            if (updated?.certificateUrl) setCertificateUrl(slug, updated.certificateUrl);
            toast.success(t('public.externalResources.certUploaded'));
        } catch {
            toast.error(t('public.externalResources.certUploadError'));
        } finally {
            setCertUploading(false);
            e.target.value = '';
        }
    };

    const handleOfficialLink = () => {
        window.open(`${API_BASE_URL}/external-resources/${slug}/go`, '_blank', 'noopener,noreferrer');
    };

    const weeksTotal = studyPlan.length;
    const weeksDone = entry?.checkedWeeks?.length ?? 0;

    return (
        <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
            {/* Title block */}
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium mb-1">{entry.provider}</p>
                <h2 className="text-lg font-bold text-[#141619] dark:text-[#E8ECF3] leading-snug">{entry.title}</h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.level && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                            {t(`public.externalResources.levels.${entry.level}`, { defaultValue: entry.level })}
                        </span>
                    )}
                    {entry.priceLabel && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                            {entry.priceLabel}
                        </span>
                    )}
                    {weeksTotal > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300">
                            {t('studentDashboard.freeResources.detail.weekProgress', { done: weeksDone, total: weeksTotal })}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar — only render when there are weeks to show */}
            {weeksTotal > 0 && (
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#FF8C6E] to-[#E14219] transition-all duration-500"
                        style={{ width: `${Math.round((weeksDone / weeksTotal) * 100)}%` }}
                    />
                </div>
            )}

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
                {entry.status !== 'started' && entry.status !== 'completed' && (
                    <button onClick={handleStart} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all">
                        🚀 {t('public.externalResources.start')}
                    </button>
                )}
                {entry.status === 'started' && (
                    <button onClick={handleComplete} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-700 dark:hover:border-green-600 dark:hover:text-green-400 transition-all">
                        ✓ {t('public.externalResources.markComplete')}
                    </button>
                )}
                {entry.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                        🎉 {t('public.externalResources.statusCompleted')}
                    </span>
                )}
                <button
                    onClick={handleOfficialLink}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-[#E14219] hover:text-[#E14219] transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    {t('studentDashboard.freeResources.detail.officialSite')}
                </button>
                <Link
                    to={`/resources/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-[#E14219] hover:text-[#E14219] dark:hover:border-[#FF8C6E] dark:hover:text-[#FF8C6E] transition-all"
                >
                    {t('studentDashboard.freeResources.detail.edubotGuide')} →
                </Link>
            </div>

            <hr className="border-gray-100 dark:border-white/10" />

            {/* Study plan checklist */}
            {studyPlan.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        {t('public.externalResources.studyPlan')}
                    </p>
                    <ol className="flex flex-col gap-2">
                        {studyPlan.map((week) => {
                            const done = entry?.checkedWeeks?.includes(week.week);
                            const langCode = lang?.split('-')[0] ?? 'ky';
                            const title = week.title?.[langCode] ?? week.title?.ky ?? week.title?.en ?? '';
                            return (
                                <li key={week.week} className="flex items-start gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => toggleWeek(slug, week.week)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all mt-0.5 ${done ? 'bg-green-500 text-white' : 'bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white'}`}
                                    >
                                        {done ? '✓' : week.week}
                                    </button>
                                    <span className={`text-sm leading-snug pt-0.5 ${done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {title || t('studentDashboard.freeResources.detail.weekTodo', { n: week.week })}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            )}

            {/* Notes */}
            <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t('studentDashboard.freeResources.detail.notesLabel')}
                </p>
                <textarea
                    rows={3}
                    value={entry?.notes ?? ''}
                    onChange={(e) => updateNotes(slug, e.target.value)}
                    placeholder={t('studentDashboard.freeResources.detail.notesPlaceholder')}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm text-gray-700 dark:text-gray-300 px-3 py-2.5 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#E14219]/30 placeholder-gray-400 dark:placeholder-gray-600 transition-all"
                />
            </div>

            <hr className="border-gray-100 dark:border-white/10" />

            {/* AI companion */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    ✨ {t('studentDashboard.freeResources.detail.aiSection')}
                </p>

                {/* Study plan */}
                <TopicPills
                    weeks={studyPlan}
                    lang={lang}
                    selected={planTopic}
                    onSelect={(topic) => {
                        const key = topic ?? '';
                        const cached = entry?.aiCache?.plans?.[key] ?? null;
                        setPlanTopic(topic);
                        setAiPlan(cached);
                        setAiPlanSaved(!!cached);
                        setAiError(false);
                    }}
                    allLabel={t('public.externalResources.topicAll')}
                />
                <button
                    onClick={handleAiStudyPlan}
                    disabled={aiLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 border border-dashed border-[#E14219]/50 text-[#E14219] hover:bg-[#E14219]/5 dark:hover:bg-[#E14219]/10 transition-all disabled:opacity-50"
                >
                    {aiLoading ? <><Spinner />{t('public.externalResources.aiPlanLoading')}</> : aiPlan ? <>✕ {t('public.externalResources.aiPlanHide')}</> : <>✨ {t('public.externalResources.aiPlanCta')}</>}
                </button>
                {aiError && <p className="text-xs text-red-500 text-center">{t('public.externalResources.aiPlanError')}</p>}
                {aiPlan && (
                    <>
                        <AiCard color="orange" title={`✨ ${t('public.externalResources.aiPlanTitle')}`}>{aiPlan}</AiCard>
                        <button
                            onClick={handleSaveAiPlan}
                            disabled={aiPlanSaved}
                            className={`self-end text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${aiPlanSaved ? 'text-green-600 dark:text-green-400 cursor-default' : 'text-[#E14219] border border-[#E14219]/40 hover:bg-[#E14219]/5'}`}
                        >
                            {aiPlanSaved ? `✓ ${t('public.externalResources.aiPlanSaved')}` : `💾 ${t('public.externalResources.aiPlanSave')}`}
                        </button>
                    </>
                )}

                {/* Concept explainer */}
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        🔍 {t('public.externalResources.aiConceptCta')}
                    </p>
                    {studyPlan.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {studyPlan.map((w) => {
                                const title = w.title?.[lang] ?? w.title?.ky ?? w.title?.en ?? `Week ${w.week}`;
                                return (
                                    <button
                                        key={w.week}
                                        onClick={() => { setConceptInput(title); setConceptResult(null); setConceptError(false); }}
                                        className="px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        {title}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={conceptInput}
                            onChange={(e) => { setConceptInput(e.target.value); setConceptResult(null); setConceptError(false); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleConceptExplain()}
                            placeholder={t('public.externalResources.aiConceptPlaceholder')}
                            className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219]/30 placeholder-gray-400"
                        />
                        <button
                            onClick={handleConceptExplain}
                            disabled={conceptLoading || !conceptInput.trim()}
                            className="flex-shrink-0 rounded-xl px-3 py-2 text-xs font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white disabled:opacity-40 hover:from-[#C2410C] hover:to-[#C2410C] transition-all"
                        >
                            {conceptLoading ? <Spinner size="w-3.5 h-3.5" /> : t('public.externalResources.aiConceptGenerate')}
                        </button>
                    </div>
                    {conceptError && <p className="text-xs text-red-500">{t('public.externalResources.aiConceptError')}</p>}
                    {conceptResult && (
                        <AiCard color="blue" title={`🔍 ${t('public.externalResources.aiConceptTitle')}: ${conceptInput}`}>
                            {conceptResult}
                        </AiCard>
                    )}
                </div>

                {/* Practice tasks */}
                {!practiceTasks && (
                    <TopicPills
                        weeks={studyPlan}
                        lang={lang}
                        selected={practiceTopic}
                        onSelect={(topic) => {
                            const key = topic ?? '';
                            const cached = entry?.aiCache?.tasks?.[key] ?? null;
                            setPracticeTopic(topic);
                            setPracticeTasks(cached);
                            setPracticeTasksSaved(!!cached);
                        }}
                        allLabel={t('public.externalResources.topicAll')}
                    />
                )}
                <button
                    onClick={handlePracticeTasks}
                    disabled={practiceLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 border border-dashed border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all disabled:opacity-50"
                >
                    {practiceLoading ? <><Spinner />{t('public.externalResources.aiTasksLoading')}</> : practiceTasks ? <>✕ {t('public.externalResources.aiTasksHide')}</> : <>📝 {t('public.externalResources.aiTasksCta')}</>}
                </button>
                {practiceError && <p className="text-xs text-red-500 text-center">{t('public.externalResources.aiTasksError')}</p>}
                {practiceTasks && (
                    <>
                        <AiCard color="green" title={`📝 ${t('public.externalResources.aiTasksTitle')}`}>{practiceTasks}</AiCard>
                        <button
                            onClick={handleSavePracticeTasks}
                            disabled={practiceTasksSaved}
                            className={`self-end text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${practiceTasksSaved ? 'text-green-600 dark:text-green-400 cursor-default' : 'text-green-700 border border-green-500/40 hover:bg-green-50/50'}`}
                        >
                            {practiceTasksSaved ? `✓ ${t('public.externalResources.aiPlanSaved')}` : `💾 ${t('public.externalResources.aiPlanSave')}`}
                        </button>
                    </>
                )}
            </div>

            {/* Certificate */}
            {entry.status === 'completed' && (
                <>
                    <hr className="border-gray-100 dark:border-white/10" />
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                            {t('public.externalResources.certSectionTitle')}
                        </p>
                        {entry.certificateUrl ? (
                            <div className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 px-4 py-3 flex-wrap">
                                <span className="text-xl">🏆</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">{t('public.externalResources.certUploaded')}</p>
                                    <a href={entry.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 dark:text-green-500 hover:underline truncate block">
                                        {t('public.externalResources.certView')}
                                    </a>
                                </div>
                                <label className="cursor-pointer text-xs text-gray-500 hover:text-[#E14219] transition-colors">
                                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="sr-only" disabled={certUploading} onChange={handleCertUpload} />
                                    {certUploading ? t('public.externalResources.certUploading') : t('public.externalResources.certReplace')}
                                </label>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${certUploading ? 'border-gray-200 opacity-60 cursor-not-allowed' : 'border-[#E14219]/30 hover:border-[#E14219]/60 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'}`}>
                                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="sr-only" disabled={certUploading} onChange={handleCertUpload} />
                                <span className="text-xl">{certUploading ? '⏳' : '📄'}</span>
                                <p className="text-sm font-semibold text-[#E14219]">
                                    {certUploading ? t('public.externalResources.certUploading') : t('public.externalResources.certUploadCta')}
                                </p>
                                <p className="text-xs text-gray-400 text-center">{t('public.externalResources.certUploadHint')}</p>
                            </label>
                        )}
                    </div>
                </>
            )}

            {/* Remove from plan */}
            <button
                onClick={() => removeResource(slug)}
                className="self-start text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors mt-1"
            >
                {t('studentDashboard.freeResources.detail.removeFromPlan')}
            </button>
        </div>
    );
};

const FreeResourcesTab = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] ?? 'ky';

    const {
        getAllEntries, progressLoading,
        startResource, completeResource, toggleWeek,
        updateNotes, removeResource, setCertificateUrl, saveAiContent,
    } = useResourceProgress();

    const allEntries = useMemo(() => {
        return getAllEntries()
            .filter((e) => e.title)
            .sort((a, b) => {
                const order = { started: 0, saved: 1, completed: 2 };
                return (order[a.status] ?? 3) - (order[b.status] ?? 3);
            });
    }, [getAllEntries]);

    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedSlug, setSelectedSlug] = useState(null);

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return allEntries;
        return allEntries.filter((e) => e.status === statusFilter);
    }, [allEntries, statusFilter]);

    useEffect(() => {
        if (filtered.length && !filtered.find((e) => e.slug === selectedSlug)) {
            setSelectedSlug(filtered[0].slug);
        }
    }, [filtered, selectedSlug]);

    const selectedEntry = useMemo(() => filtered.find((e) => e.slug === selectedSlug) ?? null, [filtered, selectedSlug]);

    const savedCount = allEntries.filter((e) => e.status === 'saved').length;
    const startedCount = allEntries.filter((e) => e.status === 'started').length;
    const completedCount = allEntries.filter((e) => e.status === 'completed').length;

    const statusLabel = (status) => {
        const map = { saved: t('public.externalResources.statusSaved'), started: t('public.externalResources.statusStarted'), completed: t('public.externalResources.statusCompleted') };
        return map[status] ?? status;
    };

    if (progressLoading) {
        return (
            <div className="flex items-center justify-center min-h-[20rem]">
                <Spinner size="w-6 h-6" />
            </div>
        );
    }

    if (!allEntries.length) {
        return (
            <DashboardWorkspaceHero
                className="dashboard-panel"
                eyebrow={t('studentDashboard.freeResources.eyebrow')}
                title={t('studentDashboard.freeResources.title')}
                description={t('studentDashboard.freeResources.description')}
            >
                <div className="p-6">
                    <StudentPanelEmpty
                        icon={FiGlobe}
                        title={t('studentDashboard.freeResources.empty.title')}
                        description={t('studentDashboard.freeResources.empty.description')}
                    >
                        <Link
                            to="/resources"
                            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all mt-4"
                        >
                            {t('studentDashboard.freeResources.empty.cta')} →
                        </Link>
                    </StudentPanelEmpty>
                </div>
            </DashboardWorkspaceHero>
        );
    }

    return (
        <div className="space-y-4">
            <DashboardWorkspaceHero
                className="dashboard-panel"
                eyebrow={t('studentDashboard.freeResources.eyebrow')}
                title={t('studentDashboard.freeResources.title')}
                description={t('studentDashboard.freeResources.description')}
                metrics={
                    <div className="flex gap-3">
                        {[
                            { label: t('studentDashboard.freeResources.metrics.saved'), value: savedCount, icon: FiBookOpen, iconCls: 'text-edubot-orange dark:text-edubot-soft' },
                            { label: t('studentDashboard.freeResources.metrics.inProgress'), value: startedCount, icon: FiGlobe, iconCls: 'text-amber-500 dark:text-amber-400' },
                            { label: t('studentDashboard.freeResources.metrics.completed'), value: completedCount, icon: FiCheckCircle, iconCls: 'text-emerald-600 dark:text-emerald-400' },
                        ].map(({ label, value, icon: Icon, iconCls }) => (
                            <div key={label} className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 min-w-[72px]">
                                <Icon className={`w-4 h-4 ${iconCls}`} />
                                <span className="text-[1.7rem] font-semibold leading-none text-edubot-ink dark:text-white mt-1">{value}</span>
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 whitespace-nowrap mt-1">{label}</span>
                            </div>
                        ))}
                    </div>
                }
            />

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2 px-1">
                {['all', 'started', 'saved', 'completed'].map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setStatusFilter(f)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                            statusFilter === f
                                ? 'bg-[#E14219] text-white'
                                : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[#E14219] hover:text-[#E14219]'
                        }`}
                    >
                        {t(`studentDashboard.freeResources.filters.${f}`)}
                    </button>
                ))}
            </div>

            {/* Two-panel layout */}
            <div className="dashboard-panel overflow-hidden grid grid-cols-1 lg:grid-cols-[200px,minmax(0,1fr)] min-h-[32rem]">
                {/* Left: resource list */}
                <div className="border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/10 overflow-y-auto">
                    {filtered.length ? (
                        filtered.map((entry) => {
                            const staticRes = getResourceBySlug(entry.slug);
                            const weeksTotal = staticRes?.content?.studyPlan?.length ?? 0;
                            const weeksDone = entry.checkedWeeks?.length ?? 0;
                            const pct = weeksTotal > 0 ? Math.round((weeksDone / weeksTotal) * 100) : null;
                            const isSelected = entry.slug === selectedSlug;

                            return (
                                <button
                                    key={entry.slug}
                                    type="button"
                                    onClick={() => setSelectedSlug(entry.slug)}
                                    className={`w-full text-left px-3 py-2.5 border-b border-gray-100 dark:border-white/10 last:border-b-0 transition-colors group flex flex-col gap-1 ${
                                        isSelected
                                            ? 'bg-orange-50/60 dark:bg-orange-900/10'
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-xs font-semibold leading-snug ${isSelected ? 'text-[#E14219]' : 'text-[#141619] dark:text-[#E8ECF3] group-hover:text-[#E14219]'} transition-colors`}>
                                            {entry.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                                            {entry.certificateUrl && <span className="text-sm leading-none">🏆</span>}
                                            {entry.status === 'saved' && <FiBookmark className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />}
                                            {entry.status === 'started' && <FiBookOpen className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />}
                                            {entry.status === 'completed' && <FiCheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{entry.provider}</p>
                                    {pct > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-1.5 rounded-full bg-gradient-to-r from-[#FF8C6E] to-[#E14219] transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 w-9 text-right">{pct}%</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-4 py-8 text-sm text-center text-gray-400 dark:text-gray-500">
                            {t('studentDashboard.freeResources.empty.description')}
                        </div>
                    )}
                </div>

                {/* Right: detail panel */}
                <div className="p-5 overflow-y-auto max-h-[calc(100vh-14rem)]">
                    {selectedEntry ? (
                        <ResourceDetailPanel
                            key={selectedEntry.slug}
                            entry={selectedEntry}
                            lang={lang}
                            t={t}
                            startResource={startResource}
                            completeResource={completeResource}
                            toggleWeek={toggleWeek}
                            updateNotes={updateNotes}
                            removeResource={removeResource}
                            setCertificateUrl={setCertificateUrl}
                            saveAiContent={saveAiContent}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                            {t('studentDashboard.freeResources.empty.description')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreeResourcesTab;

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiCopy, FiXCircle, FiZap } from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardSectionHeader,
} from '@components/ui/dashboard';
import {
    generateAiLiveQuizDraft,
    generateAiFreeFormContent,
    acceptAiGeneration,
    rejectAiGeneration,
} from '@features/aiLms/api';

const ResultPanel = ({ result, onAccept, onReject, accepting, rejecting, t }) => {
    const handleCopy = () => {
        const text = typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2);
        navigator.clipboard.writeText(text).then(() =>
            toast.success(t('instructorDashboard.aiGenerator.result.toasts.copied'))
        );
    };

    const displayText =
        typeof result.content === 'string'
            ? result.content
            : JSON.stringify(result.content, null, 2);

    return (
        <div className="rounded-2xl border border-edubot-orange/30 bg-orange-50/40 p-4 dark:border-slate-600 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                    {t('instructorDashboard.aiGenerator.result.title')}
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded-lg border border-edubot-line px-2.5 py-1 text-xs font-medium text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-400"
                    >
                        <FiCopy className="h-3 w-3" />
                        {t('instructorDashboard.aiGenerator.result.copy')}
                    </button>
                    {result.id && (
                        <>
                            <button
                                type="button"
                                disabled={accepting || rejecting}
                                onClick={onAccept}
                                className="flex items-center gap-1 rounded-lg bg-green-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                            >
                                <FiCheckCircle className="h-3 w-3" />
                                {t('instructorDashboard.aiGenerator.result.accept')}
                            </button>
                            <button
                                type="button"
                                disabled={accepting || rejecting}
                                onClick={onReject}
                                className="flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800"
                            >
                                <FiXCircle className="h-3 w-3" />
                                {t('instructorDashboard.aiGenerator.result.reject')}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-white/80 p-3 text-xs text-edubot-ink dark:bg-slate-950 dark:text-slate-200">
                {displayText}
            </pre>
        </div>
    );
};

const AiGeneratorTab = () => {
    const { t } = useTranslation();
    const [mode, setMode] = useState('liveQuiz');

    const [liveQuizForm, setLiveQuizForm] = useState({ topic: '', questionCount: 5, difficulty: 'medium' });
    const [freeFormForm, setFreeFormForm] = useState({ topic: '', contentType: 'explanation' });
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [accepting, setAccepting] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    const handleGenerateLiveQuiz = async (e) => {
        e.preventDefault();
        if (!liveQuizForm.topic.trim()) return;
        setGenerating(true);
        setResult(null);
        try {
            const data = await generateAiLiveQuizDraft(liveQuizForm);
            setResult(data);
        } catch {
            toast.error(t('instructorDashboard.aiGenerator.toasts.error'));
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateFreeForm = async (e) => {
        e.preventDefault();
        if (!freeFormForm.topic.trim()) return;
        setGenerating(true);
        setResult(null);
        try {
            const data = await generateAiFreeFormContent(freeFormForm);
            setResult(data);
        } catch {
            toast.error(t('instructorDashboard.aiGenerator.toasts.error'));
        } finally {
            setGenerating(false);
        }
    };

    const handleAccept = async () => {
        if (!result?.id) return;
        setAccepting(true);
        try {
            await acceptAiGeneration(result.id);
            toast.success(t('instructorDashboard.aiGenerator.result.toasts.accepted'));
            setResult(null);
        } catch {
            toast.error(t('instructorDashboard.aiGenerator.toasts.error'));
        } finally {
            setAccepting(false);
        }
    };

    const handleReject = async () => {
        if (!result?.id) return;
        setRejecting(true);
        try {
            await rejectAiGeneration(result.id);
            toast.success(t('instructorDashboard.aiGenerator.result.toasts.rejected'));
            setResult(null);
        } catch {
            toast.error(t('instructorDashboard.aiGenerator.toasts.error'));
        } finally {
            setRejecting(false);
        }
    };

    const inputCls =
        'w-full rounded-xl border border-edubot-line bg-white px-3 py-2 text-sm text-edubot-ink placeholder-edubot-muted focus:border-edubot-orange focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white';
    const labelCls = 'block text-xs font-medium text-edubot-muted dark:text-slate-400 mb-1';

    const modes = [
        { id: 'liveQuiz', label: t('instructorDashboard.aiGenerator.liveQuizTab') },
        { id: 'freeForm', label: t('instructorDashboard.aiGenerator.freeFormTab') },
    ];

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('instructorDashboard.aiGenerator.eyebrow')}
                title={t('instructorDashboard.nav.aiGenerator')}
                description={
                    mode === 'liveQuiz'
                        ? t('instructorDashboard.aiGenerator.liveQuiz.description')
                        : t('instructorDashboard.aiGenerator.freeForm.description')
                }
            />

            <div className="flex gap-2">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => { setMode(m.id); setResult(null); }}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                            mode === m.id
                                ? 'border-edubot-orange bg-edubot-orange text-white'
                                : 'border-edubot-line bg-white text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {mode === 'liveQuiz' && (
                <DashboardInsetPanel
                    title={t('instructorDashboard.aiGenerator.liveQuiz.title')}
                    description={t('instructorDashboard.aiGenerator.liveQuiz.description')}
                >
                    <form onSubmit={handleGenerateLiveQuiz} className="mt-4 space-y-4">
                        <div>
                            <label className={labelCls}>
                                {t('instructorDashboard.aiGenerator.liveQuiz.topicLabel')}
                            </label>
                            <input
                                type="text"
                                value={liveQuizForm.topic}
                                onChange={(e) => setLiveQuizForm((f) => ({ ...f, topic: e.target.value }))}
                                placeholder={t('instructorDashboard.aiGenerator.liveQuiz.topicPlaceholder')}
                                className={inputCls}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>
                                    {t('instructorDashboard.aiGenerator.liveQuiz.questionCountLabel')}
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={liveQuizForm.questionCount}
                                    onChange={(e) => setLiveQuizForm((f) => ({ ...f, questionCount: Number(e.target.value) }))}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>
                                    {t('instructorDashboard.aiGenerator.liveQuiz.difficultyLabel')}
                                </label>
                                <select
                                    value={liveQuizForm.difficulty}
                                    onChange={(e) => setLiveQuizForm((f) => ({ ...f, difficulty: e.target.value }))}
                                    className={inputCls}
                                >
                                    {['easy', 'medium', 'hard'].map((d) => (
                                        <option key={d} value={d}>
                                            {t(`instructorDashboard.aiGenerator.liveQuiz.difficulty.${d}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={generating || !liveQuizForm.topic.trim()}
                            className="flex items-center gap-1.5 rounded-xl bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-edubot-orange/90 disabled:opacity-50"
                        >
                            <FiZap className="h-4 w-4" />
                            {generating
                                ? t('instructorDashboard.aiGenerator.liveQuiz.generating')
                                : t('instructorDashboard.aiGenerator.liveQuiz.generate')}
                        </button>
                    </form>
                </DashboardInsetPanel>
            )}

            {mode === 'freeForm' && (
                <DashboardInsetPanel
                    title={t('instructorDashboard.aiGenerator.freeForm.title')}
                    description={t('instructorDashboard.aiGenerator.freeForm.description')}
                >
                    <form onSubmit={handleGenerateFreeForm} className="mt-4 space-y-4">
                        <div>
                            <label className={labelCls}>
                                {t('instructorDashboard.aiGenerator.freeForm.topicLabel')}
                            </label>
                            <input
                                type="text"
                                value={freeFormForm.topic}
                                onChange={(e) => setFreeFormForm((f) => ({ ...f, topic: e.target.value }))}
                                placeholder={t('instructorDashboard.aiGenerator.freeForm.topicPlaceholder')}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>
                                {t('instructorDashboard.aiGenerator.freeForm.typeLabel')}
                            </label>
                            <select
                                value={freeFormForm.contentType}
                                onChange={(e) => setFreeFormForm((f) => ({ ...f, contentType: e.target.value }))}
                                className={inputCls}
                            >
                                {['explanation', 'exercise', 'worksheet'].map((type) => (
                                    <option key={type} value={type}>
                                        {t(`instructorDashboard.aiGenerator.freeForm.types.${type}`)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={generating || !freeFormForm.topic.trim()}
                            className="flex items-center gap-1.5 rounded-xl bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-edubot-orange/90 disabled:opacity-50"
                        >
                            <FiZap className="h-4 w-4" />
                            {generating
                                ? t('instructorDashboard.aiGenerator.freeForm.generating')
                                : t('instructorDashboard.aiGenerator.freeForm.generate')}
                        </button>
                    </form>
                </DashboardInsetPanel>
            )}

            {result && (
                <ResultPanel
                    result={result}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    accepting={accepting}
                    rejecting={rejecting}
                    t={t}
                />
            )}
        </div>
    );
};

export default AiGeneratorTab;

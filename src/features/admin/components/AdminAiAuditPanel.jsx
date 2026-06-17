import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { DashboardInsetPanel } from '@components/ui/dashboard';
import { getAdminAiUsage, getAdminAiAuditLogs, getAdminAiGeneration } from '@features/aiLms/api';

const FEATURES = [
    'feedback_draft', 'lesson_quiz_draft', 'homework_draft',
    'lesson_kit', 'worksheet_draft', 'course_draft', 'message_draft',
];

const USAGE_STATUSES = ['reserved', 'succeeded', 'failed'];

const toArray = (v) =>
    Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : Array.isArray(v?.data) ? v.data : [];

const fmtDate = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

// ── Usage stats panel ─────────────────────────────────────────────────────────
const UsagePanel = ({ scopeParams }) => {
    const { t } = useTranslation();
    const [feature, setFeature] = useState('');
    const [status, setStatus] = useState('');
    const [rows, setRows] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const params = { ...scopeParams, limit: 50 };
            if (feature) params.feature = feature;
            if (status) params.status = status;
            const data = await getAdminAiUsage(params);
            setRows(toArray(data));
        } catch {
            toast.error(t('adminAiLms.usage.toasts.error'));
        } finally {
            setLoading(false);
        }
    };

    const selectCls = 'dashboard-select text-sm';

    return (
        <DashboardInsetPanel
            title={t('adminAiLms.usage.title')}
            description={t('adminAiLms.usage.description')}
        >
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <select value={feature} onChange={(e) => setFeature(e.target.value)} className={selectCls}>
                    <option value="">{t('adminAiLms.usage.filters.allFeatures')}</option>
                    {FEATURES.map((f) => (
                        <option key={f} value={f}>{t(`adminAiLms.features.${f}`)}</option>
                    ))}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                    <option value="">{t('adminAiLms.usage.filters.allStatuses')}</option>
                    {USAGE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-edubot-orange px-4 py-2 text-xs font-semibold text-white hover:bg-edubot-orange/90 disabled:opacity-50"
                >
                    <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {t('adminAiLms.usage.load')}
                </button>
            </div>

            {rows === null ? null : rows.length === 0 ? (
                <p className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                    {t('adminAiLms.usage.empty')}
                </p>
            ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-edubot-line/70 dark:border-slate-700">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-edubot-line/70 bg-edubot-surfaceAlt/60 dark:border-slate-700 dark:bg-slate-900/60">
                                {['id', 'scope', 'feature', 'status', 'period', 'daily', 'tokens'].map((col) => (
                                    <th key={col} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                        {t(`adminAiLms.usage.table.${col}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-edubot-line/50 dark:divide-slate-800">
                            {rows.map((row) => (
                                <tr key={row.id} className="bg-white/80 hover:bg-edubot-surfaceAlt/40 dark:bg-slate-950 dark:hover:bg-slate-900/60">
                                    <td className="px-3 py-2 font-mono text-edubot-muted dark:text-slate-400">{row.id}</td>
                                    <td className="px-3 py-2 text-edubot-ink dark:text-slate-200">
                                        {row.scopeType}
                                        {row.companyId ? ` · c${row.companyId}` : ''}
                                        {row.userId ? ` · u${row.userId}` : ''}
                                    </td>
                                    <td className="px-3 py-2 text-edubot-ink dark:text-slate-200">{row.feature}</td>
                                    <td className="px-3 py-2">
                                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                            row.status === 'succeeded'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                : row.status === 'failed'
                                                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                                                    : 'border-edubot-line/80 bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-edubot-muted dark:text-slate-400">
                                        {row.periodStart ? `${row.periodStart} – ${row.periodEnd}` : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums text-edubot-ink dark:text-slate-200">
                                        {row.dailyCount ?? '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums text-edubot-ink dark:text-slate-200">
                                        {row.totalTokens ?? '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardInsetPanel>
    );
};

// ── Generation detail inline block ────────────────────────────────────────────
const GenerationDetail = ({ generationId, onClose, t }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const load = async () => {
        if (loaded) return;
        setLoading(true);
        try {
            const result = await getAdminAiGeneration(generationId);
            setData(result);
            setLoaded(true);
        } catch {
            toast.error(t('adminAiLms.generation.toasts.error'));
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const outputText = data?.output
        ? typeof data.output === 'string'
            ? data.output
            : JSON.stringify(data.output, null, 2)
        : null;

    return (
        <div className="mt-3 rounded-2xl border border-edubot-orange/30 bg-orange-50/40 p-4 dark:border-slate-600 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                    {t('adminAiLms.generation.title')} #{generationId}
                </p>
                <button type="button" onClick={onClose} className="text-xs text-edubot-muted hover:text-edubot-orange dark:text-slate-400">
                    {t('adminAiLms.generation.close')}
                </button>
            </div>
            {loading ? (
                <div className="h-8 animate-pulse rounded-xl bg-edubot-surfaceAlt dark:bg-slate-800" />
            ) : !data ? (
                <p className="text-xs text-edubot-muted dark:text-slate-400">{t('adminAiLms.generation.notFound')}</p>
            ) : (
                <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {['id', 'feature', 'status', 'model', 'tokens', 'createdAt'].map((field) => {
                            const val = field === 'tokens' ? data.totalTokens : field === 'createdAt' ? fmtDate(data.createdAt) : data[field];
                            return val !== undefined && val !== null ? (
                                <div key={field} className="rounded-xl border border-edubot-line/60 bg-white/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                                    <p className="text-edubot-muted dark:text-slate-400">{t(`adminAiLms.generation.fields.${field}`)}</p>
                                    <p className="mt-0.5 font-semibold text-edubot-ink dark:text-white">{String(val)}</p>
                                </div>
                            ) : null;
                        })}
                    </div>
                    {outputText && (
                        <div>
                            <p className="mb-1 font-semibold text-edubot-muted dark:text-slate-400">{t('adminAiLms.generation.outputLabel')}</p>
                            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-white/80 p-3 text-xs text-edubot-ink dark:bg-slate-950 dark:text-slate-200">
                                {outputText}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Audit log panel ───────────────────────────────────────────────────────────
const AuditPanel = ({ scopeParams }) => {
    const { t } = useTranslation();
    const [feature, setFeature] = useState('');
    const [action, setAction] = useState('');
    const [rows, setRows] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedGenerationId, setExpandedGenerationId] = useState(null);

    const load = async () => {
        setLoading(true);
        setExpandedGenerationId(null);
        try {
            const params = { ...scopeParams, limit: 50 };
            if (feature) params.feature = feature;
            if (action.trim()) params.action = action.trim();
            const data = await getAdminAiAuditLogs(params);
            setRows(toArray(data));
        } catch {
            toast.error(t('adminAiLms.audit.toasts.error'));
        } finally {
            setLoading(false);
        }
    };

    const toggleGeneration = (id) => {
        setExpandedGenerationId((prev) => (prev === id ? null : id));
    };

    const selectCls = 'dashboard-select text-sm';

    return (
        <DashboardInsetPanel
            title={t('adminAiLms.audit.title')}
            description={t('adminAiLms.audit.description')}
        >
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <select value={feature} onChange={(e) => setFeature(e.target.value)} className={selectCls}>
                    <option value="">{t('adminAiLms.audit.filters.allFeatures')}</option>
                    {FEATURES.map((f) => (
                        <option key={f} value={f}>{t(`adminAiLms.features.${f}`)}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder={t('adminAiLms.audit.filters.action')}
                    className="dashboard-field w-44 text-sm"
                />
                <button
                    type="button"
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-edubot-orange px-4 py-2 text-xs font-semibold text-white hover:bg-edubot-orange/90 disabled:opacity-50"
                >
                    <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {t('adminAiLms.audit.load')}
                </button>
            </div>

            {rows === null ? null : rows.length === 0 ? (
                <p className="mt-4 text-sm text-edubot-muted dark:text-slate-400">
                    {t('adminAiLms.audit.empty')}
                </p>
            ) : (
                <div className="mt-4 space-y-1">
                    <div className="grid grid-cols-[60px_minmax(0,1.4fr)_minmax(0,1fr)_80px_minmax(0,1fr)_70px_130px] gap-3 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                        {['id', 'action', 'feature', 'generation', 'scope', 'user', 'date'].map((col) => (
                            <span key={col}>{t(`adminAiLms.audit.table.${col}`)}</span>
                        ))}
                    </div>
                    {rows.map((row) => (
                        <div key={row.id}>
                            <div className="grid grid-cols-[60px_minmax(0,1.4fr)_minmax(0,1fr)_80px_minmax(0,1fr)_70px_130px] gap-3 rounded-2xl border border-edubot-line/50 bg-white/80 px-3 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                                <span className="font-mono text-edubot-muted dark:text-slate-400">{row.id}</span>
                                <span className="truncate font-medium text-edubot-ink dark:text-slate-200">{row.action}</span>
                                <span className="truncate text-edubot-muted dark:text-slate-400">{row.feature || '—'}</span>
                                <span>
                                    {row.generationId ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleGeneration(row.generationId)}
                                            className="inline-flex items-center gap-1 text-edubot-orange hover:underline"
                                        >
                                            #{row.generationId}
                                            {expandedGenerationId === row.generationId
                                                ? <FiChevronUp className="h-3 w-3" />
                                                : <FiChevronDown className="h-3 w-3" />}
                                        </button>
                                    ) : '—'}
                                </span>
                                <span className="text-edubot-muted dark:text-slate-400">
                                    {row.scopeType}
                                    {row.companyId ? ` c${row.companyId}` : ''}
                                </span>
                                <span className="text-edubot-muted dark:text-slate-400">{row.userId ?? '—'}</span>
                                <span className="text-edubot-muted dark:text-slate-400">{fmtDate(row.createdAt)}</span>
                            </div>
                            {expandedGenerationId === row.generationId && row.generationId && (
                                <GenerationDetail
                                    generationId={row.generationId}
                                    onClose={() => setExpandedGenerationId(null)}
                                    t={t}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </DashboardInsetPanel>
    );
};

// ── Exported panel ────────────────────────────────────────────────────────────
const AdminAiAuditPanel = ({ scopeParams }) => (
    <div className="space-y-6">
        <UsagePanel scopeParams={scopeParams} />
        <AuditPanel scopeParams={scopeParams} />
    </div>
);

export default AdminAiAuditPanel;

import PropTypes from 'prop-types';
import { FiCalendar, FiClock, FiRefreshCw, FiX } from 'react-icons/fi';

const formatDateTime = (value, timeZone) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('ky-KG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timeZone || 'Asia/Bishkek',
    });
};

const formatDateLabel = (value, timeZone) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('ky-KG', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: timeZone || 'Asia/Bishkek',
    });
};

const GenerateGroupSessionsModal = ({
    group,
    form,
    onChange,
    onClose,
    onPreview,
    onGenerate,
    preview,
    previewLoading,
    generating,
}) => {
    const previewItems = Array.isArray(preview?.items) ? preview.items : [];
    const hasPreview = Boolean(preview);
    const canGenerate = previewItems.some((item) => item.kind === 'new');
    const groupedPreviewItems = previewItems.reduce((acc, item) => {
        const key = formatDateLabel(item.startsAt, group?.timezone);
        const existing = acc.find((entry) => entry.label === key);
        if (existing) {
            existing.items.push(item);
            return acc;
        }
        acc.push({ label: key, items: [item] });
        return acc;
    }, []);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
                <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))] sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange dark:border-edubot-orange/25 dark:bg-slate-900/60">
                                <FiCalendar className="h-3.5 w-3.5" />
                                Session generation
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]">
                                    Сессияларды түзүү
                                </h2>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {group?.name || 'Тандалган группа'} үчүн дефолт графиктен чыныгы сессияларды алдын ала көрүп, анан гана түзөсүз.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
                            aria-label="Жабуу"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5 sm:px-7">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                        <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/25 p-5 dark:border-slate-700 dark:bg-slate-900/30">
                            <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                <FiClock className="h-4 w-4 text-edubot-orange" />
                                Диапазон
                            </div>
                            <p className="mt-2 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                Бул preview мурда бар сессияларды өткөрүп жиберет. Жаңы сессиялар гана түзүлөт.
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="text-sm text-edubot-ink dark:text-white">
                                    <span className="mb-1.5 inline-block font-medium">Башталышы</span>
                                    <input
                                        type="date"
                                        value={form.fromDate}
                                        onChange={(e) => onChange('fromDate', e.target.value)}
                                        className="dashboard-field"
                                    />
                                </label>
                                <label className="text-sm text-edubot-ink dark:text-white">
                                    <span className="mb-1.5 inline-block font-medium">Аягы</span>
                                    <input
                                        type="date"
                                        value={form.toDate}
                                        onChange={(e) => onChange('toDate', e.target.value)}
                                        className="dashboard-field"
                                    />
                                </label>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/60">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                        Блоктор
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-edubot-ink dark:text-white">
                                        {Array.isArray(group?.scheduleBlocks) ? group.scheduleBlocks.length : 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/60">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                        Жаңы сессия
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-300">
                                        {preview?.newCount ?? '—'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/60">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                        Бар болгон
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-edubot-ink dark:text-white">
                                        {preview?.existingCount ?? '—'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <span className="rounded-full border border-edubot-line/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-400">
                                    1. Алдын ала көрүү
                                </span>
                                <button
                                    type="button"
                                    onClick={onPreview}
                                    disabled={previewLoading || generating}
                                    className="dashboard-button-secondary"
                                >
                                    <FiRefreshCw className={`h-4 w-4 ${previewLoading ? 'animate-spin' : ''}`} />
                                    Алдын ала көрүү
                                </button>
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                    hasPreview
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                                        : 'border-edubot-line/70 bg-white/80 text-edubot-muted dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-400'
                                }`}>
                                    2. Сессияларды түзүү
                                </span>
                                <button
                                    type="button"
                                    onClick={onGenerate}
                                    disabled={!canGenerate || previewLoading || generating}
                                    className={hasPreview ? 'dashboard-button-primary' : 'dashboard-button-secondary'}
                                >
                                    <FiCalendar className="h-4 w-4" />
                                    {generating ? 'Түзүлүп жатат...' : 'Сессияларды түзүү'}
                                </button>
                            </div>
                        </section>

                        <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/25 p-5 dark:border-slate-700 dark:bg-slate-900/30">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-edubot-ink dark:text-white">
                                        Preview
                                    </h3>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        Диапазондогу сессиялар ушундай түзүлөт.
                                    </p>
                                </div>
                                {preview?.total ? (
                                    <span className="rounded-full border border-edubot-line/70 bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                                        {preview.total} жазуу
                                    </span>
                                ) : null}
                            </div>

                            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                                {!preview && !previewLoading ? (
                                    <div className="rounded-2xl border border-dashed border-edubot-line/70 px-4 py-10 text-center text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                        Диапазонду тандап, алдын ала көрүүнү басыңыз.
                                    </div>
                                ) : null}

                                {previewLoading ? (
                                    <div className="rounded-2xl border border-edubot-line/70 px-4 py-10 text-center text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                        Preview даярдалып жатат...
                                    </div>
                                ) : null}

                                {preview && !previewItems.length ? (
                                    <div className="rounded-2xl border border-edubot-line/70 px-4 py-10 text-center text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                        Бул диапазондо сессия табылган жок.
                                    </div>
                                ) : null}

                                {groupedPreviewItems.map((entry) => (
                                    <div key={entry.label} className="space-y-2">
                                        <div className="sticky top-0 z-[1] rounded-full border border-edubot-line/70 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-edubot-muted backdrop-blur dark:border-slate-700 dark:bg-slate-950/85 dark:text-slate-400">
                                            {entry.label}
                                        </div>
                                        <div className="space-y-3">
                                            {entry.items.map((item) => (
                                                <div
                                                    key={`${item.kind}-${item.sessionId || item.sessionIndex}-${item.startsAt}`}
                                                    className={`rounded-2xl border px-4 py-3 ${
                                                        item.kind === 'new'
                                                            ? 'border-emerald-200 bg-emerald-50/80 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10'
                                                            : 'border-edubot-line/70 bg-white/55 dark:border-slate-700 dark:bg-slate-950/45'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-semibold ${item.kind === 'new' ? 'text-emerald-900 dark:text-emerald-100' : 'text-edubot-ink dark:text-white'}`}>
                                                                {item.title}
                                                            </p>
                                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                                {formatDateTime(item.startsAt, group?.timezone)} - {formatDateTime(item.endsAt, group?.timezone)}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                item.kind === 'new'
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            {item.kind === 'new' ? 'Жаңы' : 'Мурунтан бар'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

GenerateGroupSessionsModal.propTypes = {
    group: PropTypes.shape({
        name: PropTypes.string,
        timezone: PropTypes.string,
        scheduleBlocks: PropTypes.array,
    }),
    form: PropTypes.shape({
        fromDate: PropTypes.string,
        toDate: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onPreview: PropTypes.func.isRequired,
    onGenerate: PropTypes.func.isRequired,
    preview: PropTypes.shape({
        total: PropTypes.number,
        newCount: PropTypes.number,
        existingCount: PropTypes.number,
        items: PropTypes.arrayOf(PropTypes.object),
    }),
    previewLoading: PropTypes.bool,
    generating: PropTypes.bool,
};

GenerateGroupSessionsModal.defaultProps = {
    group: null,
    preview: null,
    previewLoading: false,
    generating: false,
};

export default GenerateGroupSessionsModal;

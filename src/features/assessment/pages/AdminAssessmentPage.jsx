import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    fetchAdminAnalytics,
    fetchAdminQuestions,
    fetchAdminTests,
    fetchAdminLearningPaths,
} from '../api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cl = (obj, lang) => obj?.[lang] ?? obj?.ky ?? obj?.en ?? '';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
);

const DatabaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
    </svg>
);

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden>
        <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400" aria-hidden>
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

// ─── Metric card ──────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, sub }) => (
    <div className="p-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold text-[#141619] dark:text-[#E8ECF3]">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
);

// ─── Level distribution bar ───────────────────────────────────────────────────

const LEVEL_COLORS = {
    A0: 'bg-gray-400', A1: 'bg-blue-400', A2: 'bg-teal-500', B1: 'bg-green-500', B2: 'bg-orange-500',
};

const LevelBar = ({ level, count, max }) => {
    const w = max > 0 ? Math.round((count / max) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="w-8 text-xs font-bold text-gray-500 dark:text-gray-400">{level}</span>
            <div className="flex-1 h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${LEVEL_COLORS[level] ?? 'bg-gray-400'} rounded-full`} style={{ width: `${w}%` }} />
            </div>
            <span className="w-8 text-xs text-gray-400 dark:text-gray-500 text-right">{count}</span>
        </div>
    );
};

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS = [
    { key: 'analytics', Icon: ChartBarIcon },
    { key: 'questions', Icon: DatabaseIcon },
    { key: 'tests',     Icon: ClipboardIcon },
    { key: 'paths',     Icon: MapIcon },
];

const LEVEL_OPTIONS = ['A0', 'A1', 'A2', 'B1', 'B2'];
const SKILL_OPTIONS = ['grammar', 'vocabulary', 'reading', 'communication'];

// ─── Analytics tab ────────────────────────────────────────────────────────────

const AnalyticsTab = ({ t }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchAdminAnalytics()
            .then(d => { if (!cancelled) setData(d); })
            .catch(() => { if (!cancelled) setData(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 motion-safe:animate-pulse">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-white/10" />
                ))}
            </div>
        );
    }

    if (!data) {
        return <p className="text-center py-12 text-gray-400">{t('assessment.admin.analytics.noData')}</p>;
    }

    const levelDist = data.levelDistribution ?? {};
    const maxCount = Math.max(...Object.values(levelDist), 1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label={t('assessment.admin.analytics.totalAttempts')} value={data.totalAttempts ?? 0} />
                <MetricCard label={t('assessment.admin.analytics.completed')} value={data.completedAttempts ?? 0} />
                <MetricCard
                    label={t('assessment.admin.analytics.averageScore')}
                    value={data.avgScore != null ? `${Math.round(data.avgScore)}%` : '—'}
                />
                <MetricCard label={t('assessment.admin.analytics.inProgress')} value={(data.totalAttempts ?? 0) - (data.completedAttempts ?? 0)} />
            </div>

            {Object.keys(levelDist).length > 0 && (
                <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <h3 className="font-semibold text-sm text-[#141619] dark:text-[#E8ECF3] mb-4">
                        {t('assessment.admin.analytics.levelDistribution')}
                    </h3>
                    <div className="space-y-3">
                        {LEVEL_OPTIONS.map(lvl => (
                            <LevelBar key={lvl} level={lvl} count={levelDist[lvl] ?? 0} max={maxCount} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Questions tab ────────────────────────────────────────────────────────────

const QuestionsTab = ({ t, lang }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [levelFilter, setLevelFilter] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [search, setSearch] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        fetchAdminQuestions({ level: levelFilter || undefined, skill: skillFilter || undefined })
            .then(data => setItems(Array.isArray(data) ? data : (data?.data ?? [])))
            .catch(() => toast.error(t('assessment.admin.questions.loadError')))
            .finally(() => setLoading(false));
    }, [levelFilter, skillFilter]);

    useEffect(() => { load(); }, [load]);

    const filtered = search
        ? items.filter(q => {
            const text = cl(q.question, lang)?.toLowerCase() ?? '';
            return text.includes(search.toLowerCase());
        })
        : items;

    const selectCls = 'h-9 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-sm text-[#141619] dark:text-[#E8ECF3] px-3 focus:outline-none focus:ring-2 focus:ring-[#E14219]';

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('assessment.admin.questions.search')}
                        className="h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-sm text-[#141619] dark:text-[#E8ECF3] focus:outline-none focus:ring-2 focus:ring-[#E14219] w-56"
                    />
                </div>
                <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className={selectCls}>
                    <option value="">{t('assessment.admin.questions.filterByLevel')}</option>
                    {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className={selectCls}>
                    <option value="">{t('assessment.admin.questions.filterBySkill')}</option>
                    {SKILL_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-16">
                                {t('assessment.admin.questions.level')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-28">
                                {t('assessment.admin.questions.skill')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {t('assessment.admin.questions.question')}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-20">
                                {t('assessment.admin.questions.difficulty')}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-20">
                                {t('assessment.admin.questions.active')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="motion-safe:animate-pulse">
                                    <td className="px-4 py-3"><div className="h-4 w-10 rounded bg-gray-100 dark:bg-white/10" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/10" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-full rounded bg-gray-100 dark:bg-white/10" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-8 mx-auto rounded bg-gray-100 dark:bg-white/10" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-8 mx-auto rounded bg-gray-100 dark:bg-white/10" /></td>
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                                    {t('assessment.admin.questions.noQuestions')}
                                </td>
                            </tr>
                        ) : (
                            filtered.map(q => (
                                <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${LEVEL_COLORS[q.level] ?? 'bg-gray-400'}`}>
                                            {q.level}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{q.skill}</td>
                                    <td className="px-4 py-3 text-[#141619] dark:text-[#E8ECF3] line-clamp-2 max-w-xs">
                                        {cl(q.question, lang)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block w-2 h-2 rounded-full ${q.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Tests tab ────────────────────────────────────────────────────────────────

const TestsTab = ({ t }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchAdminTests()
            .then(d => { if (!cancelled) setItems(Array.isArray(d) ? d : (d?.data ?? [])); })
            .catch(() => null)
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="space-y-3">{[0, 1].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-white/10 motion-safe:animate-pulse" />)}</div>;
    }

    if (items.length === 0) {
        return <p className="text-center py-12 text-gray-400 text-sm">{t('assessment.admin.tests.noTests')}</p>;
    }

    return (
        <div className="space-y-3">
            {items.map(test => (
                <div key={test.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <div>
                        <p className="font-medium text-[#141619] dark:text-[#E8ECF3]">{test.titleEn}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                            {test.subject} · {test.type}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">
                                {t('assessment.admin.tests.questionCount', { count: test.questionCount })}
                            </p>
                            {test.timeLimitMinutes && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {t('assessment.admin.tests.timeLimit', { min: test.timeLimitMinutes })}
                                </p>
                            )}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${test.isActive ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                            {test.isActive ? t('assessment.admin.tests.active') : t('assessment.admin.tests.inactive')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Paths tab ────────────────────────────────────────────────────────────────

const PathsTab = ({ t }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchAdminLearningPaths()
            .then(d => { if (!cancelled) setItems(Array.isArray(d) ? d : (d?.data ?? [])); })
            .catch(() => null)
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="space-y-3">{[0, 1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/10 motion-safe:animate-pulse" />)}</div>;
    }

    if (items.length === 0) {
        return <p className="text-center py-12 text-gray-400 text-sm">{t('assessment.admin.paths.noPaths')}</p>;
    }

    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36">
                            {t('assessment.admin.paths.goal')}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-16">
                            {t('assessment.admin.paths.level')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {items.map(path => (
                        <tr key={path.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-[#141619] dark:text-[#E8ECF3]">{path.titleEn}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{path.goal?.replace('_', ' ')}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${LEVEL_COLORS[path.level] ?? 'bg-gray-400'}`}>
                                    {path.level}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const AdminAssessmentPage = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] ?? 'ky';
    const [activeTab, setActiveTab] = useState('analytics');

    const tabCls = (key) => [
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E14219]',
        activeTab === key
            ? 'bg-white dark:bg-white/10 text-[#E14219] shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-[#141619] dark:hover:text-[#E8ECF3]',
    ].join(' ');

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-orange-50/40 via-white to-white dark:from-orange-950/10 dark:via-[#222222] dark:to-[#222222]">
                <div className="px-4 pt-10 pb-6 sm:px-6 lg:px-12 max-w-screen-xl mx-auto">
                    <div className="flex items-start gap-3 mb-2">
                        <span className="w-1 h-8 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] flex-shrink-0 mt-1" />
                        <div>
                            <h1 className="font-suisse font-bold text-2xl sm:text-3xl text-[#141619] dark:text-[#E8ECF3]">
                                {t('assessment.admin.title')}
                            </h1>
                            <p className="text-[#3E424A] dark:text-[#a6adba] text-sm mt-1">
                                {t('assessment.admin.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-8 sm:px-6 lg:px-12 max-w-screen-xl mx-auto">
                {/* Tab nav */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-50 dark:bg-white/5 mb-8 w-fit">
                    {TABS.map(({ key, Icon }) => (
                        <button key={key} type="button" onClick={() => setActiveTab(key)} className={tabCls(key)}>
                            <Icon />
                            {t(`assessment.admin.tabs.${key}`)}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === 'analytics' && <AnalyticsTab t={t} />}
                {activeTab === 'questions' && <QuestionsTab t={t} lang={lang} />}
                {activeTab === 'tests'     && <TestsTab t={t} />}
                {activeTab === 'paths'     && <PathsTab t={t} />}
            </div>
        </div>
    );
};

export default AdminAssessmentPage;

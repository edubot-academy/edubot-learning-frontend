import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    DashboardMetricCard,
    DashboardSectionHeader,
    DashboardInsetPanel,
    EmptyState,
} from '@components/ui/dashboard';
import {
    FiBookOpen,
    FiCheck,
    FiEdit3,
    FiExternalLink,
    FiGlobe,
    FiLink,
    FiLink2,
    FiPlus,
    FiStar,
    FiTrash2,
    FiX,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Loader from '@shared/ui/Loader';
import {
    fetchAllExternalResourcesAdmin,
    createExternalResourceAdmin,
    updateExternalResourceAdmin,
    deleteExternalResourceAdmin,
    fetchCourseLinkedResources,
    linkResourceToCourse,
    unlinkResourceFromCourse,
    aiAutofillResource,
} from '@features/externalResources/api';
import {
    buildCategoryOptions,
    formatCategoryKey,
    formatCategoryLabel,
    resolveLabel,
} from '@features/externalResources/data/externalResources';
import { parseApiError } from '@shared/api/error';
import ConfirmationModal from '@shared/ui/ConfirmationModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGS = ['ky', 'en', 'ru'];

const BLANK_FORM = {
    slug: '',
    title: '',
    provider: '',
    providerKey: '',
    url: '',
    coverImageUrl: '',
    category: 'programming',
    level: 'beginner',
    language: 'English',
    priceLabel: { ky: 'Акысыз', en: 'Free', ru: 'Бесплатно' },
    certificateLabel: { ky: '', en: '', ru: '' },
    certificateCost: '',
    canAuditFree: true,
    durationLabel: { ky: '', en: '', ru: '' },
    isFeatured: false,
    isPublished: false,
    sortOrder: 0,
};

const initLocalizedLabel = (value, fallback = '') => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return {
            ky: value.ky ?? fallback,
            en: value.en ?? fallback,
            ru: value.ru ?? fallback,
        };
    }

    const resolvedKy = resolveLabel(value, 'ky') ?? fallback;
    const resolvedEn = resolveLabel(value, 'en') ?? fallback;
    const resolvedRu = resolveLabel(value, 'ru') ?? fallback;

    return {
        ky: resolvedKy,
        en: resolvedEn,
        ru: resolvedRu,
    };
};

const initContentEdit = (content) => ({
    shortDescription: { ky: '', en: '', ru: '', ...(content?.shortDescription ?? {}) },
    whatYouWillLearnLines: {
        ky: (content?.whatYouWillLearn?.ky ?? []).join('\n'),
        en: (content?.whatYouWillLearn?.en ?? []).join('\n'),
        ru: (content?.whatYouWillLearn?.ru ?? []).join('\n'),
    },
    whoIsItForLines: {
        ky: (content?.whoIsItFor?.ky ?? []).join('\n'),
        en: (content?.whoIsItFor?.en ?? []).join('\n'),
        ru: (content?.whoIsItFor?.ru ?? []).join('\n'),
    },
    whyRecommended: { ky: '', en: '', ru: '', ...(content?.whyRecommended ?? {}) },
    difficultyNotesLines: {
        ky: (content?.difficultyNotes?.ky ?? []).join('\n'),
        en: (content?.difficultyNotes?.en ?? []).join('\n'),
        ru: (content?.difficultyNotes?.ru ?? []).join('\n'),
    },
    studyPlan: (content?.studyPlan ?? []).map((w) => ({
        week: w.week,
        title: { ky: '', en: '', ru: '', ...(w.title ?? {}) },
        description: { ky: '', en: '', ru: '', ...(w.description ?? {}) },
    })),
    relatedCourseSlugs: content?.relatedCourseSlugs ?? [],
});

const splitLines = (str) => str.split('\n').map((s) => s.trim()).filter(Boolean);

const buildContent = (ce) => ({
    shortDescription: ce.shortDescription,
    whatYouWillLearn: {
        ky: splitLines(ce.whatYouWillLearnLines.ky),
        en: splitLines(ce.whatYouWillLearnLines.en),
        ru: splitLines(ce.whatYouWillLearnLines.ru),
    },
    whoIsItFor: {
        ky: splitLines(ce.whoIsItForLines.ky),
        en: splitLines(ce.whoIsItForLines.en),
        ru: splitLines(ce.whoIsItForLines.ru),
    },
    whyRecommended: ce.whyRecommended,
    studyPlan: ce.studyPlan,
    difficultyNotes: {
        ky: splitLines(ce.difficultyNotesLines.ky),
        en: splitLines(ce.difficultyNotesLines.en),
        ru: splitLines(ce.difficultyNotesLines.ru),
    },
    relatedCourseSlugs: ce.relatedCourseSlugs,
});

// ─── Field helpers ────────────────────────────────────────────────────────────

const FieldLabel = ({ children, required }) => (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const Field = ({ className = '', children }) => (
    <div className={className}>{children}</div>
);

const LangTabs = ({ active, onChange }) => (
    <div className="flex gap-1 mb-3">
        {LANGS.map((l) => (
            <button
                key={l}
                type="button"
                onClick={() => onChange(l)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                    active === l
                        ? 'bg-[#E14219] text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
                }`}
            >
                {l}
            </button>
        ))}
    </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

const ResourceModal = ({ resource, categoryOptions = [], onClose, onSave, t }) => {
    const isEdit = !!resource;
    const categorySuggestions = buildCategoryOptions([
        ...categoryOptions.map((category) => category.key),
        resource?.category,
    ]).filter((category) => category.key !== 'all');
    const [tab, setTab] = useState('basic');
    const [lang, setLang] = useState('en');
    const [form, setForm] = useState(() =>
        isEdit
            ? {
                  slug: resource.slug,
                  title: resource.title ?? '',
                  provider: resource.provider ?? '',
                  providerKey: resource.providerKey ?? '',
                  url: resource.url ?? '',
                  coverImageUrl: resource.coverImageUrl ?? '',
                  category: resource.category ?? 'programming',
                  level: resource.level ?? 'beginner',
                  language: resource.language ?? 'English',
                  priceLabel: initLocalizedLabel(resource.priceLabel, ''),
                  certificateLabel: initLocalizedLabel(resource.certificateLabel, ''),
                  certificateCost: resource.certificateCost ?? '',
                  canAuditFree: resource.canAuditFree ?? true,
                  durationLabel: initLocalizedLabel(resource.durationLabel, ''),
                  isFeatured: resource.isFeatured ?? false,
                  isPublished: resource.isPublished ?? false,
                  sortOrder: resource.sortOrder ?? 0,
              }
            : { ...BLANK_FORM }
    );
    const [content, setContent] = useState(() => initContentEdit(resource?.content));
    const [saving, setSaving] = useState(false);
    const [autofillUrl, setAutofillUrl] = useState(isEdit ? (resource.url ?? '') : '');
    const [autofilling, setAutofilling] = useState(false);
    const [autofillError, setAutofillError] = useState('');
    const [fillMode, setFillMode] = useState('url');
    const [pasteText, setPasteText] = useState('');
    const [pasteError, setPasteError] = useState('');

    const applyResourceData = (data) => {
        setForm((prev) => ({
            ...prev,
            slug: data.slug ?? prev.slug,
            title: data.title ?? prev.title,
            provider: data.provider ?? prev.provider,
            providerKey: data.providerKey ?? prev.providerKey,
            url: data.url ?? prev.url,
            coverImageUrl: data.coverImageUrl ?? prev.coverImageUrl,
            category: data.category ?? prev.category,
            level: data.level ?? prev.level,
            language: data.language ?? prev.language,
            priceLabel: data.priceLabel ? initLocalizedLabel(data.priceLabel, '') : prev.priceLabel,
            certificateLabel: data.certificateLabel ? initLocalizedLabel(data.certificateLabel, '') : prev.certificateLabel,
            certificateCost: data.certificateCost ?? prev.certificateCost,
            canAuditFree: data.canAuditFree ?? prev.canAuditFree,
            durationLabel: data.durationLabel ? initLocalizedLabel(data.durationLabel, '') : prev.durationLabel,
        }));
        const c = data.content ?? {};
        setContent({
            shortDescription: { ky: '', en: '', ru: '', ...(c.shortDescription ?? {}) },
            whatYouWillLearnLines: {
                ky: (c.whatYouWillLearn?.ky ?? []).join('\n'),
                en: (c.whatYouWillLearn?.en ?? []).join('\n'),
                ru: (c.whatYouWillLearn?.ru ?? []).join('\n'),
            },
            whoIsItForLines: {
                ky: (c.whoIsItFor?.ky ?? []).join('\n'),
                en: (c.whoIsItFor?.en ?? []).join('\n'),
                ru: (c.whoIsItFor?.ru ?? []).join('\n'),
            },
            whyRecommended: { ky: '', en: '', ru: '', ...(c.whyRecommended ?? {}) },
            difficultyNotesLines: {
                ky: (c.difficultyNotes?.ky ?? []).join('\n'),
                en: (c.difficultyNotes?.en ?? []).join('\n'),
                ru: (c.difficultyNotes?.ru ?? []).join('\n'),
            },
            studyPlan: (c.studyPlan ?? []).map((w) => ({
                week: w.week,
                title: { ky: '', en: '', ru: '', ...(w.title ?? {}) },
                description: { ky: '', en: '', ru: '', ...(w.description ?? {}) },
            })),
            relatedCourseSlugs: c.relatedCourseSlugs ?? [],
        });
    };

    const handleAutofill = async () => {
        const url = autofillUrl.trim();
        if (!url) return;
        setAutofilling(true);
        setAutofillError('');
        try {
            const data = await aiAutofillResource(url);
            applyResourceData({ ...data, url: data.url ?? url });
        } catch (err) {
            setAutofillError(err?.response?.data?.message ?? err?.message ?? t('adminExtResources.autofill.error'));
        } finally {
            setAutofilling(false);
        }
    };

    const handlePasteFill = () => {
        setPasteError('');
        let data;
        try {
            data = JSON.parse(pasteText.trim());
        } catch {
            setPasteError(t('adminExtResources.paste.errorInvalidJson'));
            return;
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            setPasteError(t('adminExtResources.paste.errorInvalidJson'));
            return;
        }
        applyResourceData(data);
        setPasteText('');
    };

    const setF = (key, val) => setForm((p) => ({ ...p, [key]: val }));
    const setFL = (field, val) => setForm((p) => ({ ...p, [field]: { ...p[field], [lang]: val } }));
    const setCL = (field, val) => setContent((p) => ({ ...p, [field]: { ...p[field], [lang]: val } }));
    const setCLines = (field, val) => setContent((p) => ({ ...p, [field]: { ...p[field], [lang]: val } }));

    const addWeek = () =>
        setContent((p) => ({
            ...p,
            studyPlan: [
                ...p.studyPlan,
                { week: p.studyPlan.length + 1, title: { ky: '', en: '', ru: '' }, description: { ky: '', en: '', ru: '' } },
            ],
        }));

    const removeWeek = (idx) =>
        setContent((p) => ({
            ...p,
            studyPlan: p.studyPlan
                .filter((_, i) => i !== idx)
                .map((w, i) => ({ ...w, week: i + 1 })),
        }));

    const setWeekField = (idx, field, val) =>
        setContent((p) => ({
            ...p,
            studyPlan: p.studyPlan.map((w, i) =>
                i === idx ? { ...w, [field]: { ...w[field], [lang]: val } } : w
            ),
        }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                category: formatCategoryKey(form.category) || 'programming',
                sortOrder: Number(form.sortOrder) || 0,
                content: buildContent(content),
            };
            if (!isEdit) {
                await onSave('create', payload);
            } else {
                const { slug: _slug, ...patch } = payload;
                await onSave('update', resource.id, patch);
            }
        } finally {
            setSaving(false);
        }
    };

    const TABS = [
        { id: 'basic', label: t('adminExtResources.tabs.basic') },
        { id: 'description', label: t('adminExtResources.tabs.description') },
        { id: 'curriculum', label: t('adminExtResources.tabs.curriculum') },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6">
            <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700/60">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                            {isEdit ? t('adminExtResources.actions.edit') : t('adminExtResources.create.title')}
                        </p>
                        <h2 className="text-base font-bold text-edubot-ink dark:text-white">
                            {isEdit ? resource.title : t('adminExtResources.actions.addNew')}
                        </h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Fill strip — AI Autofill (URL) or Paste JSON */}
                <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-b border-orange-100 dark:border-orange-800/30">
                    {/* Mode toggle */}
                    <div className="flex gap-1 mb-2.5">
                        <button
                            type="button"
                            onClick={() => { setFillMode('url'); setAutofillError(''); setPasteError(''); }}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                                fillMode === 'url'
                                    ? 'bg-[#E14219] text-white'
                                    : 'text-[#E14219] hover:bg-orange-100 dark:hover:bg-orange-900/30'
                            }`}
                        >
                            ✨ {t('adminExtResources.autofill.modeUrl')}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setFillMode('paste'); setAutofillError(''); setPasteError(''); }}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                                fillMode === 'paste'
                                    ? 'bg-[#E14219] text-white'
                                    : 'text-[#E14219] hover:bg-orange-100 dark:hover:bg-orange-900/30'
                            }`}
                        >
                            📋 {t('adminExtResources.autofill.modePaste')}
                        </button>
                    </div>

                    {fillMode === 'url' && (
                        <>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={autofillUrl}
                                    onChange={(e) => { setAutofillUrl(e.target.value); setAutofillError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAutofill()}
                                    placeholder={t('adminExtResources.autofill.placeholder')}
                                    className="flex-1 min-w-0 rounded-xl border border-orange-200 dark:border-orange-700/40 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219]/30 placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleAutofill}
                                    disabled={autofilling || !autofillUrl.trim()}
                                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] disabled:opacity-50 transition-all"
                                >
                                    {autofilling ? (
                                        <>
                                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            {t('adminExtResources.autofill.loading')}
                                        </>
                                    ) : (
                                        <>✨ {t('adminExtResources.autofill.generate')}</>
                                    )}
                                </button>
                            </div>
                            {autofillError && <p className="mt-1.5 text-xs text-red-500">{autofillError}</p>}
                        </>
                    )}

                    {fillMode === 'paste' && (
                        <>
                            <p className="text-xs text-orange-700 dark:text-orange-300 mb-1.5">
                                {t('adminExtResources.paste.title')}
                            </p>
                            <textarea
                                rows={5}
                                value={pasteText}
                                onChange={(e) => { setPasteText(e.target.value); setPasteError(''); }}
                                placeholder={t('adminExtResources.paste.placeholder')}
                                className="w-full rounded-xl border border-orange-200 dark:border-orange-700/40 bg-white dark:bg-slate-800 text-xs text-gray-700 dark:text-gray-300 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#E14219]/30 placeholder-gray-400 resize-none"
                                spellCheck={false}
                            />
                            <div className="flex items-center justify-between mt-1.5">
                                {pasteError
                                    ? <p className="text-xs text-red-500">{pasteError}</p>
                                    : <span />
                                }
                                <button
                                    type="button"
                                    onClick={handlePasteFill}
                                    disabled={!pasteText.trim()}
                                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] disabled:opacity-50 transition-all"
                                >
                                    📋 {t('adminExtResources.paste.fill')}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Tab bar */}
                <div className="flex gap-0 px-6 pt-4 border-b border-gray-100 dark:border-slate-700/60">
                    {TABS.map((tb) => (
                        <button
                            key={tb.id}
                            type="button"
                            onClick={() => setTab(tb.id)}
                            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                                tab === tb.id
                                    ? 'border-[#E14219] text-[#E14219]'
                                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'
                            }`}
                        >
                            {tb.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="overflow-y-auto max-h-[65vh] px-6 py-5">

                        {/* ── BASIC tab ── */}
                        {tab === 'basic' && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {!isEdit && (
                                    <Field>
                                        <FieldLabel required>{t('adminExtResources.fields.slug')}</FieldLabel>
                                        <input required value={form.slug} onChange={(e) => setF('slug', e.target.value)} className="dashboard-field" placeholder="harvard-cs50" />
                                    </Field>
                                )}
                                <Field className={isEdit ? '' : ''}>
                                    <FieldLabel required>{t('adminExtResources.fields.title')}</FieldLabel>
                                    <input required value={form.title} onChange={(e) => setF('title', e.target.value)} className="dashboard-field" placeholder="CS50: Introduction to Computer Science" />
                                </Field>
                                <Field>
                                    <FieldLabel required>{t('adminExtResources.fields.provider')}</FieldLabel>
                                    <input required value={form.provider} onChange={(e) => setF('provider', e.target.value)} className="dashboard-field" placeholder="Harvard University" />
                                </Field>
                                <Field>
                                    <FieldLabel required>{t('adminExtResources.fields.providerKey')}</FieldLabel>
                                    <input required value={form.providerKey} onChange={(e) => setF('providerKey', e.target.value)} className="dashboard-field" placeholder="harvard" />
                                </Field>
                                <Field className="sm:col-span-2">
                                    <FieldLabel required>{t('adminExtResources.fields.url')}</FieldLabel>
                                    <input required type="url" value={form.url} onChange={(e) => setF('url', e.target.value)} className="dashboard-field" placeholder="https://cs50.harvard.edu/x/" />
                                </Field>
                                <Field className="sm:col-span-2">
                                    <FieldLabel>{t('adminExtResources.fields.coverImageUrl')}</FieldLabel>
                                    <input type="url" value={form.coverImageUrl} onChange={(e) => setF('coverImageUrl', e.target.value)} className="dashboard-field" placeholder="https://..." />
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.category')}</FieldLabel>
                                    <input
                                        list="external-resource-category-options"
                                        value={form.category}
                                        onChange={(e) => setF('category', e.target.value)}
                                        className="dashboard-field"
                                        placeholder="programming"
                                    />
                                    <datalist id="external-resource-category-options">
                                        {categorySuggestions.map((category) => (
                                            <option key={category.key} value={category.key}>
                                                {formatCategoryLabel(category.key)}
                                            </option>
                                        ))}
                                    </datalist>
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.level')}</FieldLabel>
                                    <select value={form.level} onChange={(e) => setF('level', e.target.value)} className="dashboard-select w-full">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.language')}</FieldLabel>
                                    <input value={form.language} onChange={(e) => setF('language', e.target.value)} className="dashboard-field" placeholder="English" />
                                </Field>
                                <Field className="sm:col-span-2">
                                    <LangTabs active={lang} onChange={setLang} />
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.priceLabel')}</FieldLabel>
                                    <input
                                        value={form.priceLabel[lang] ?? ''}
                                        onChange={(e) => setFL('priceLabel', e.target.value)}
                                        className="dashboard-field"
                                        placeholder={lang === 'ky' ? 'Акысыз' : lang === 'ru' ? 'Бесплатно' : 'Free'}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.durationLabel')}</FieldLabel>
                                    <input
                                        value={form.durationLabel[lang] ?? ''}
                                        onChange={(e) => setFL('durationLabel', e.target.value)}
                                        className="dashboard-field"
                                        placeholder={lang === 'ky' ? '12 апта' : lang === 'ru' ? '12 недель' : '12 weeks'}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.certificateLabel')}</FieldLabel>
                                    <input
                                        value={form.certificateLabel[lang] ?? ''}
                                        onChange={(e) => setFL('certificateLabel', e.target.value)}
                                        className="dashboard-field"
                                        placeholder={lang === 'ky' ? 'Сертификат бар' : lang === 'ru' ? 'Сертификат есть' : 'Certificate available'}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.certificateCost')}</FieldLabel>
                                    <input value={form.certificateCost} onChange={(e) => setF('certificateCost', e.target.value)} className="dashboard-field" placeholder="$49" />
                                </Field>
                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.sortOrder')}</FieldLabel>
                                    <input type="number" min="0" value={form.sortOrder} onChange={(e) => setF('sortOrder', e.target.value)} className="dashboard-field" />
                                </Field>
                                <Field className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.canAuditFree} onChange={(e) => setF('canAuditFree', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-edubot-orange focus:ring-edubot-orange" />
                                        <span className="text-sm font-medium text-edubot-ink dark:text-white">{t('adminExtResources.fields.canAuditFree')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.isPublished} onChange={(e) => setF('isPublished', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-edubot-orange focus:ring-edubot-orange" />
                                        <span className="text-sm font-medium text-edubot-ink dark:text-white">{t('adminExtResources.fields.isPublished')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setF('isFeatured', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-edubot-orange focus:ring-edubot-orange" />
                                        <span className="text-sm font-medium text-edubot-ink dark:text-white">{t('adminExtResources.fields.isFeatured')}</span>
                                    </label>
                                </Field>
                            </div>
                        )}

                        {/* ── DESCRIPTION tab ── */}
                        {tab === 'description' && (
                            <div className="flex flex-col gap-5">
                                <LangTabs active={lang} onChange={setLang} />

                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.shortDescription')}</FieldLabel>
                                    <textarea
                                        rows={3}
                                        value={content.shortDescription[lang]}
                                        onChange={(e) => setCL('shortDescription', e.target.value)}
                                        className="dashboard-field resize-none"
                                        placeholder={t('adminExtResources.fields.shortDescriptionPlaceholder')}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.whatYouWillLearn')}</FieldLabel>
                                    <p className="text-xs text-edubot-muted dark:text-slate-500 mb-1.5">{t('adminExtResources.fields.listHint')}</p>
                                    <textarea
                                        rows={5}
                                        value={content.whatYouWillLearnLines[lang]}
                                        onChange={(e) => setCLines('whatYouWillLearnLines', e.target.value)}
                                        className="dashboard-field resize-y font-mono text-xs"
                                        placeholder="C programming&#10;Algorithms&#10;Web development"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.whoIsItFor')}</FieldLabel>
                                    <p className="text-xs text-edubot-muted dark:text-slate-500 mb-1.5">{t('adminExtResources.fields.listHint')}</p>
                                    <textarea
                                        rows={4}
                                        value={content.whoIsItForLines[lang]}
                                        onChange={(e) => setCLines('whoIsItForLines', e.target.value)}
                                        className="dashboard-field resize-y font-mono text-xs"
                                        placeholder="Complete beginners&#10;Career changers"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.whyRecommended')}</FieldLabel>
                                    <textarea
                                        rows={4}
                                        value={content.whyRecommended[lang]}
                                        onChange={(e) => setCL('whyRecommended', e.target.value)}
                                        className="dashboard-field resize-none"
                                        placeholder={t('adminExtResources.fields.whyRecommendedPlaceholder')}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>{t('adminExtResources.fields.difficultyNotes')}</FieldLabel>
                                    <p className="text-xs text-edubot-muted dark:text-slate-500 mb-1.5">{t('adminExtResources.fields.listHint')}</p>
                                    <textarea
                                        rows={3}
                                        value={content.difficultyNotesLines[lang]}
                                        onChange={(e) => setCLines('difficultyNotesLines', e.target.value)}
                                        className="dashboard-field resize-y font-mono text-xs"
                                        placeholder="Lectures in English&#10;5–10 hours per week"
                                    />
                                </Field>
                            </div>
                        )}

                        {/* ── CURRICULUM tab ── */}
                        {tab === 'curriculum' && (
                            <div className="flex flex-col gap-4">
                                <LangTabs active={lang} onChange={setLang} />

                                {content.studyPlan.length === 0 && (
                                    <p className="text-sm text-edubot-muted dark:text-slate-500 text-center py-4">
                                        {t('adminExtResources.curriculum.empty')}
                                    </p>
                                )}

                                {content.studyPlan.map((week, idx) => (
                                    <div key={idx} className="rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-[#E14219] uppercase tracking-wide">
                                                {t('adminExtResources.curriculum.week')} {week.week}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeWeek(idx)}
                                                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                            >
                                                <FiTrash2 className="h-3.5 w-3.5" />
                                                {t('adminExtResources.curriculum.remove')}
                                            </button>
                                        </div>
                                        <div>
                                            <FieldLabel>{t('adminExtResources.curriculum.weekTitle')}</FieldLabel>
                                            <input
                                                value={week.title[lang] ?? ''}
                                                onChange={(e) => setWeekField(idx, 'title', e.target.value)}
                                                className="dashboard-field"
                                                placeholder={lang === 'ky' ? 'C тилине киришүү' : lang === 'ru' ? 'Введение в C' : 'Intro to C'}
                                            />
                                        </div>
                                        <div>
                                            <FieldLabel>{t('adminExtResources.curriculum.weekDescription')}</FieldLabel>
                                            <textarea
                                                rows={2}
                                                value={week.description[lang] ?? ''}
                                                onChange={(e) => setWeekField(idx, 'description', e.target.value)}
                                                className="dashboard-field resize-none text-xs"
                                                placeholder={lang === 'ky' ? 'Негизги темалар...' : lang === 'ru' ? 'Основные темы...' : 'Key topics...'}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addWeek}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E14219]/30 text-[#E14219] text-sm font-semibold py-3 hover:border-[#E14219]/60 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    {t('adminExtResources.curriculum.addWeek')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-slate-700/60">
                        <button type="button" onClick={onClose} className="dashboard-button-secondary">
                            <FiX className="h-4 w-4" />
                            {t('adminExtResources.actions.cancel')}
                        </button>
                        <button type="submit" disabled={saving} className="dashboard-button-primary disabled:opacity-60">
                            {saving ? <Loader fullScreen={false} /> : isEdit ? <FiCheck className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
                            {isEdit ? t('adminExtResources.actions.save') : t('adminExtResources.actions.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ─── Main tab component ───────────────────────────────────────────────────────

    const AdminExternalResourcesTab = ({ courses = [] }) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] ?? 'ky';

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeWorkflow, setActiveWorkflow] = useState('catalog');

    // Modal state — null = closed, 'new' = create form, resource object = edit form
    const [modalResource, setModalResource] = useState(undefined);
    const isModalOpen = modalResource !== undefined;

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [linkCourseId, setLinkCourseId] = useState('');
    const [linkedResources, setLinkedResources] = useState([]);
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkingId, setLinkingId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setResources(await fetchAllExternalResourcesAdmin());
        } catch (err) {
            toast.error(parseApiError(err, t('adminExtResources.errors.loadFailed')).message);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { load(); }, [load]);

    // Close modal on Escape
    useEffect(() => {
        if (!isModalOpen) return;
        const handler = (e) => { if (e.key === 'Escape') setModalResource(undefined); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isModalOpen]);

    const handleModalSave = async (mode, ...args) => {
        try {
            if (mode === 'create') {
                const created = await createExternalResourceAdmin(args[0]);
                setResources((prev) => [created, ...prev]);
                toast.success(t('adminExtResources.created'));
            } else {
                const [id, patch] = args;
                const updated = await updateExternalResourceAdmin(id, patch);
                setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                toast.success(t('adminExtResources.saved'));
            }
            setModalResource(undefined);
        } catch (err) {
            toast.error(parseApiError(err, t('adminExtResources.errors.saveFailed')).message);
            throw err; // keep modal open so user can fix
        }
    };

    const handleToggle = async (resource, field) => {
        try {
            const updated = await updateExternalResourceAdmin(resource.id, { [field]: !resource[field] });
            setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        } catch (err) {
            toast.error(parseApiError(err, t('adminExtResources.errors.saveFailed')).message);
        }
    };

    const handleDelete = (resource) => setDeleteTarget(resource);

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteExternalResourceAdmin(deleteTarget.id);
            setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            toast.success(t('adminExtResources.deleted'));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(parseApiError(err, t('adminExtResources.errors.deleteFailed')).message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const loadLinkedResources = useCallback(async (courseId) => {
        if (!courseId) { setLinkedResources([]); return; }
        setLinkLoading(true);
        try { setLinkedResources(await fetchCourseLinkedResources(courseId)); }
        catch { setLinkedResources([]); }
        finally { setLinkLoading(false); }
    }, []);

    useEffect(() => { loadLinkedResources(linkCourseId); }, [linkCourseId, loadLinkedResources]);

    const isLinked = (resourceId) => linkedResources.some((r) => r.id === resourceId);
    const categoryOptions = buildCategoryOptions(resources.map((resource) => resource.category));

    const handleToggleLink = async (resource) => {
        if (!linkCourseId) return;
        setLinkingId(resource.id);
        try {
            if (isLinked(resource.id)) {
                await unlinkResourceFromCourse(Number(linkCourseId), resource.id);
                setLinkedResources((prev) => prev.filter((r) => r.id !== resource.id));
                toast.success(t('adminExtResources.unlinked'));
            } else {
                await linkResourceToCourse(Number(linkCourseId), resource.id);
                setLinkedResources((prev) => [...prev, resource]);
                toast.success(t('adminExtResources.linked'));
            }
        } catch (err) {
            toast.error(parseApiError(err, t('adminExtResources.errors.linkFailed')).message);
        } finally {
            setLinkingId(null);
        }
    };

    const publishedCount = resources.filter((r) => r.isPublished).length;
    const featuredCount = resources.filter((r) => r.isFeatured).length;

    const WORKFLOWS = [
        { id: 'catalog', label: t('adminExtResources.workflows.catalog') },
        { id: 'linking', label: t('adminExtResources.workflows.linking') },
    ];

    return (
        <div className="space-y-6">
            {isModalOpen && (
                <ResourceModal
                    resource={modalResource === null ? null : modalResource}
                    categoryOptions={categoryOptions}
                    onClose={() => setModalResource(undefined)}
                    onSave={handleModalSave}
                    t={t}
                />
            )}

            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title={t('adminExtResources.confirmDelete', { title: deleteTarget?.title ?? '' })}
                confirmLabel={t('adminExtResources.actions.delete')}
                confirmVariant="danger"
                loading={deleteLoading}
            />

            <DashboardSectionHeader
                eyebrow={t('adminExtResources.eyebrow')}
                title={t('adminExtResources.title')}
                description={t('adminExtResources.description')}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard label={t('adminExtResources.metrics.total')} value={resources.length} icon={FiGlobe} />
                <DashboardMetricCard label={t('adminExtResources.metrics.published')} value={publishedCount} icon={FiBookOpen} tone={publishedCount ? 'green' : 'default'} />
                <DashboardMetricCard label={t('adminExtResources.metrics.featured')} value={featuredCount} icon={FiStar} tone={featuredCount ? 'blue' : 'default'} />
            </div>

            {/* Workflow switcher */}
            <div className="rounded-2xl border border-edubot-line/80 bg-white/90 p-4 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-wrap gap-2">
                    {WORKFLOWS.map((wf) => (
                        <button
                            key={wf.id}
                            type="button"
                            onClick={() => setActiveWorkflow(wf.id)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                wf.id === activeWorkflow
                                    ? 'border-edubot-orange bg-edubot-orange text-white'
                                    : 'border-edubot-line bg-white text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                        >
                            {wf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Catalog ── */}
            {activeWorkflow === 'catalog' && (
                <DashboardInsetPanel
                    title={t('adminExtResources.list.title')}
                    description={t('adminExtResources.list.description')}
                    action={
                        <button
                            type="button"
                            onClick={() => setModalResource(null)}
                            className="dashboard-button-primary"
                        >
                            <FiPlus className="h-4 w-4" />
                            {t('adminExtResources.actions.addNew')}
                        </button>
                    }
                >
                    {loading ? (
                        <div className="mt-6 flex justify-center"><Loader fullScreen={false} /></div>
                    ) : resources.length ? (
                        <div className="mt-4 space-y-3">
                            {resources.map((resource) => (
                                <article
                                    key={resource.id}
                                    className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                                >
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-edubot-ink dark:text-white truncate">{resource.title}</p>
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                    {resource.category}
                                                </span>
                                                {resource.isPublished ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                        {t('adminExtResources.status.published')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                        {t('adminExtResources.status.draft')}
                                                    </span>
                                                )}
                                                {resource.isFeatured && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                                                        <FiStar className="h-3 w-3" />
                                                        {t('adminExtResources.status.featured')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {resource.provider} · {resource.level} · {resolveLabel(resource.priceLabel, currentLang)}
                                                {resource.certificateCost ? ` · 🏅 ${resource.certificateCost}` : ''}
                                                {resource.canAuditFree === false ? ` · ${t('adminExtResources.status.paidOnly')}` : ''}
                                            </p>
                                            <p className="mt-0.5 text-xs text-edubot-muted/70 dark:text-slate-500">
                                                {resource.content?.studyPlan?.length
                                                    ? t('adminExtResources.curriculum.weeksCount', { n: resource.content.studyPlan.length })
                                                    : t('adminExtResources.curriculum.noWeeks')}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => handleToggle(resource, 'isPublished')} className={`dashboard-button-secondary ${resource.isPublished ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                                <FiGlobe className="h-4 w-4" />
                                                {resource.isPublished ? t('adminExtResources.actions.unpublish') : t('adminExtResources.actions.publish')}
                                            </button>
                                            <button type="button" onClick={() => handleToggle(resource, 'isFeatured')} className={`dashboard-button-secondary ${resource.isFeatured ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                <FiStar className="h-4 w-4" />
                                                {resource.isFeatured ? t('adminExtResources.actions.unfeature') : t('adminExtResources.actions.feature')}
                                            </button>
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="dashboard-button-secondary">
                                                <FiExternalLink className="h-4 w-4" />
                                            </a>
                                            <button type="button" onClick={() => setModalResource(resource)} className="dashboard-button-secondary">
                                                <FiEdit3 className="h-4 w-4" />
                                                {t('adminExtResources.actions.edit')}
                                            </button>
                                            <button type="button" onClick={() => handleDelete(resource)} className="dashboard-button-secondary">
                                                <FiTrash2 className="h-4 w-4" />
                                                {t('adminExtResources.actions.delete')}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4">
                            <EmptyState title={t('adminExtResources.empty.title')} subtitle={t('adminExtResources.empty.subtitle')} />
                        </div>
                    )}
                </DashboardInsetPanel>
            )}

            {/* ── Course linking ── */}
            {activeWorkflow === 'linking' && (
                <DashboardInsetPanel
                    title={t('adminExtResources.linking.title')}
                    description={t('adminExtResources.linking.description')}
                >
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-edubot-muted dark:text-slate-400">{t('adminExtResources.linking.selectCourse')}</label>
                            <select value={linkCourseId} onChange={(e) => setLinkCourseId(e.target.value)} className="dashboard-select mt-1 w-full">
                                <option value="">{t('adminExtResources.linking.chooseCourse')}</option>
                                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        {linkCourseId && (
                            linkLoading ? (
                                <div className="flex justify-center py-4"><Loader fullScreen={false} /></div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                        {t('adminExtResources.linking.resourcesLabel')} ({linkedResources.length} {t('adminExtResources.linking.linked')})
                                    </p>
                                    {resources.length ? resources.map((resource) => {
                                        const linked = isLinked(resource.id);
                                        return (
                                            <div
                                                key={resource.id}
                                                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                                                    linked
                                                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/10'
                                                        : 'border-edubot-line/60 bg-white dark:border-slate-700 dark:bg-slate-900/40'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-edubot-ink dark:text-white truncate">{resource.title}</p>
                                                    <p className="text-xs text-edubot-muted dark:text-slate-400">{resource.provider} · {resource.category}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleLink(resource)}
                                                    disabled={linkingId === resource.id}
                                                    className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                                                        linked
                                                            ? 'border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                            : 'border-edubot-line bg-white text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {linked ? <FiLink2 className="h-3 w-3" /> : <FiLink className="h-3 w-3" />}
                                                    {linked ? t('adminExtResources.actions.unlink') : t('adminExtResources.actions.link')}
                                                </button>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-sm text-edubot-muted dark:text-slate-400">{t('adminExtResources.empty.title')}</p>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </DashboardInsetPanel>
            )}
        </div>
    );
};

export default AdminExternalResourcesTab;

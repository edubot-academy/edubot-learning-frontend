
import React from 'react';
import toast from 'react-hot-toast';
import { updateCompany, deleteCompany, uploadCompanyLogo } from '@services/api';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '@shared/api/error';

// ---- Stable defaults (do NOT inline arrays in props/defaults) ----
const DEFAULT_KEYS = [
    'name',
    'about',
    'logoUrl',
    'website',
    'email',
    'phone',
    'contactName',
    'contactEmail',
    'contactPhone',
    'address',
    'city',
    'country',
    'telegram',
    'whatsapp',
    'instagram',
    'taxId',
    'notes',
];

/** Extendable field registry */
const FIELD_META = {
    name: { labelKey: 'company.fields.name', type: 'text', required: true },
    about: { labelKey: 'company.fields.about', type: 'textarea' },
    logoUrl: { labelKey: 'company.fields.logo', type: 'image' },
    website: { labelKey: 'company.fields.website', type: 'url', placeholder: 'https://example.com' },
    email: { labelKey: 'company.fields.email', type: 'email' },
    phone: { labelKey: 'company.fields.phone', type: 'tel', placeholder: '+996 555 123 456' },
    // Contact person
    contactName: { labelKey: 'company.fields.contactName', type: 'text' },
    contactEmail: { labelKey: 'company.fields.contactEmail', type: 'email' },
    contactPhone: { labelKey: 'company.fields.contactPhone', type: 'tel' },
    // Address
    address: { labelKey: 'company.fields.address', type: 'textarea' },
    city: { labelKey: 'company.fields.city', type: 'text' },
    country: { labelKey: 'company.fields.country', type: 'text' },
    // Socials
    telegram: { labelKey: 'company.fields.telegram', type: 'text', placeholder: '@company' },
    whatsapp: { labelKey: 'company.fields.whatsapp', type: 'tel' },
    instagram: { labelKey: 'company.fields.instagram', type: 'text' },
    // Legal
    taxId: { labelKey: 'company.fields.taxId', type: 'text' },
    notes: { labelKey: 'company.fields.notes', type: 'textarea' },
};

const FIELD_SECTIONS = [
    {
        id: 'brand',
        titleKey: 'company.settings.sections.brand.title',
        descriptionKey: 'company.settings.sections.brand.description',
        fields: ['logoUrl', 'name', 'about', 'website'],
    },
    {
        id: 'contact',
        titleKey: 'company.settings.sections.contact.title',
        descriptionKey: 'company.settings.sections.contact.description',
        fields: ['email', 'phone', 'contactName', 'contactEmail', 'contactPhone'],
    },
    {
        id: 'location',
        titleKey: 'company.settings.sections.location.title',
        descriptionKey: 'company.settings.sections.location.description',
        fields: ['address', 'city', 'country'],
    },
    {
        id: 'channels',
        titleKey: 'company.settings.sections.channels.title',
        descriptionKey: 'company.settings.sections.channels.description',
        fields: ['telegram', 'whatsapp', 'instagram'],
    },
    {
        id: 'legal',
        titleKey: 'company.settings.sections.legal.title',
        descriptionKey: 'company.settings.sections.legal.description',
        fields: ['taxId', 'notes'],
    },
];

const getSectionsForKeys = (keys) =>
    FIELD_SECTIONS.map((section) => ({
        ...section,
        fields: section.fields.filter((field) => keys.includes(field)),
    })).filter((section) => section.fields.length);

const getFieldId = (companyId, key) => `company-${companyId || 'new'}-${key}`;

export default function CompanySettings({
    company,
    onSaved,
    editableKeys, // pass if you want to restrict; otherwise we use DEFAULT_KEYS
    allowDelete = true,
}) {
    const { t } = useTranslation();
    // ---- FIX: make keys stable (avoid default [] recreation) ----
    const keys = React.useMemo(() => {
        const k = (editableKeys && editableKeys.length ? editableKeys : DEFAULT_KEYS).filter(
            (x) => FIELD_META[x]
        );
        // normalize order/signature to keep memos stable
        return Array.from(new Set(k));
    }, [editableKeys]);

    const initial = React.useMemo(() => {
        const base = {};
        for (const k of keys) base[k] = company?.[k] ?? '';
        return base;
    }, [company, keys]);

    const [edit, setEdit] = React.useState(false);
    const [form, setForm] = React.useState(initial);
    const [saving, setSaving] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [errors, setErrors] = React.useState({});
    const sections = React.useMemo(() => getSectionsForKeys(keys), [keys]);

    // keep form in sync when company/keys change
    React.useEffect(() => {
        setForm(initial);
    }, [initial]);

    const dirty = React.useMemo(
        () => JSON.stringify(form) !== JSON.stringify(initial),
        [form, initial]
    );

    const validate = () => {
        const v = {};
        if (keys.includes('name') && !form.name?.trim()) {
            v.name = t('company.settings.validation.nameRequired');
        }
        if (keys.includes('email') && form.email?.trim()) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(form.email.trim())) v.email = t('company.settings.validation.email');
        }
        if (keys.includes('website') && form.website?.trim()) {
            try {
                new URL(form.website.trim());
            } catch {
                v.website = t('company.settings.validation.website');
            }
        }
        return v;
    };

    async function onSave(e) {
        e?.preventDefault?.();
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) {
            toast.error(t('company.settings.toasts.reviewFields'));
            return;
        }
        if (!dirty) {
            setEdit(false);
            return;
        }

        try {
            setSaving(true);
            const payload = {};
            for (const k of keys) payload[k] = form[k];
            const updated = await updateCompany(company.id, payload);
            toast.success(t('company.settings.toasts.saved'));
            setEdit(false);
            onSaved?.(updated);
        } catch (error) {
            toast.error(parseApiError(error, t('company.settings.toasts.saveError')).message);
        } finally {
            setSaving(false);
        }
    }

    const onCancel = () => {
        setForm(initial);
        setErrors({});
        setEdit(false);
    };

    function onDelete() {
        if (!allowDelete) return;
        setDeleteConfirmOpen(true);
    }

    async function confirmDelete() {
        if (!allowDelete) return;

        try {
            setDeleting(true);
            await deleteCompany(company.id);
            toast.success(t('company.settings.toasts.deleted'));
            window.location.href = '/companies';
        } catch (error) {
            toast.error(parseApiError(error, t('company.settings.toasts.deleteError')).message);
        } finally {
            setDeleting(false);
        }
    }

    // Logo upload (same flow as course cover -> /companies/:id/upload-logo)
    async function handleLogoFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setSaving(true);
            const logoUrl = await uploadCompanyLogo(company.id, file);
            if (logoUrl) {
                setForm((s) => ({ ...s, logoUrl }));
                toast.success(t('company.settings.toasts.logoUploaded'));
            } else {
                toast.error(t('company.settings.toasts.logoUploadFailed'));
            }
        } catch (error) {
            toast.error(parseApiError(error, t('company.settings.toasts.logoUploadError')).message);
        } finally {
            setSaving(false);
            e.target.value = '';
        }
    }

    // ---------- Read-only item renderer (improved UI) ----------
    const ViewCell = ({ k }) => {
        const meta = FIELD_META[k];
        const label = t(meta.labelKey);
        const val = company?.[k]; // use source of truth for read-only
        if (k === 'logoUrl') {
            const url = val || '';
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 dark:text-[#a6adba] w-40 shrink-0">
                        {label}
                    </div>
                    {url ? (
                        /^https?:\/\//i.test(String(url)) ? (
                            <img
                                src={url}
                                alt={t('company.settings.logoAlt')}
                                className="h-14 w-auto object-contain rounded"
                            />
                        ) : (
                            <span className="text-sm break-words">{String(url)}</span>
                        )
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </div>
            );
        }

        // Smart linkers
        if (k === 'website' && val) {
            const href = String(val).startsWith('http') ? val : `https://${val}`;
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 dark:text-[#a6adba] w-40 shrink-0">
                        {label}
                    </div>
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline break-all"
                    >
                        {href}
                    </a>
                </div>
            );
        }
        if (k === 'email' && val) {
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 dark:text-[#a6adba] w-40 shrink-0">
                        {label}
                    </div>
                    <a href={`mailto:${val}`} className="text-blue-600 hover:underline break-all">
                        {val}
                    </a>
                </div>
            );
        }
        if ((k === 'phone' || k === 'contactPhone' || k === 'whatsapp') && val) {
            const phone = String(val);
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 dark:text-[#a6adba] w-40 shrink-0">
                        {label}
                    </div>
                    <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                        {phone}
                    </a>
                </div>
            );
        }
        if (k === 'telegram' && val) {
            const v = String(val).startsWith('@') ? String(val).slice(1) : String(val);
            const href = String(val).startsWith('http') ? String(val) : `https://t.me/${v}`;
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 dark:text-[#a6adba] w-40 shrink-0">
                        {label}
                    </div>
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                    >
                        <span>@{v}</span>
                    </a>
                </div>
            );
        }
        if (k === 'instagram' && val) {
            const v = String(val).replace(/^@/, '');
            const href = String(val).startsWith('http')
                ? String(val)
                : `https://instagram.com/${v}`;
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 dark:text-[#a6adba] w-40 shrink-0">
                        {label}
                    </div>
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline break-all"
                    >
                        @{v}
                    </a>
                </div>
            );
        }

        // Multiline for textarea
        if (meta.type === 'textarea') {
            return (
                <div className="border rounded p-3 md:col-span-2">
                    <div className="text-xs text-gray-500 dark:text-[#a6adba] mb-1">
                        {label}
                    </div>
                    <div className="whitespace-pre-wrap break-words text-sm">
                        {val || <span className="text-gray-400">—</span>}
                    </div>
                </div>
            );
        }

        // Default text cell
        return (
            <div className="border rounded p-3">
                <div className="text-xs text-gray-500 dark:text-[#a6adba] mb-1">{label}</div>
                <div className="break-words text-sm">
                    {val || <span className="text-gray-400">—</span>}
                </div>
            </div>
        );
    };

    const renderField = (k) => {
        const meta = FIELD_META[k];
        const label = t(meta.labelKey);
        const invalid = !!errors[k];
        const fieldId = getFieldId(company?.id, k);
        const errorId = `${fieldId}-error`;

        if (meta.type === 'textarea') {
            return (
                <div key={k} className="md:col-span-2">
                    <label
                        htmlFor={fieldId}
                        className="text-sm font-medium text-gray-700 dark:text-slate-200"
                    >
                        {label}
                        {meta.required && ' *'}
                    </label>
                    <textarea
                        id={fieldId}
                        rows={4}
                        className={`dashboard-field mt-1 min-h-28 ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        value={form[k] ?? ''}
                        onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}
                        aria-invalid={invalid || undefined}
                        aria-describedby={invalid ? errorId : undefined}
                    />
                    {invalid && (
                        <span id={errorId} className="mt-1 block text-xs text-red-600">
                            {errors[k]}
                        </span>
                    )}
                </div>
            );
        }

        if (meta.type === 'image') {
            return (
                <div key={k} className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                        {label}
                    </span>
                    <div className="mt-2 grid gap-3 rounded-xl border border-edubot-line/80 bg-edubot-surfaceAlt/40 p-3 dark:border-slate-700 dark:bg-slate-900/60 md:grid-cols-[8rem_1fr]">
                        <div className="flex h-24 items-center justify-center rounded-lg border border-edubot-line bg-white dark:border-slate-700 dark:bg-slate-950">
                            {form.logoUrl ? (
                                <img
                                    src={form.logoUrl}
                                    alt={t('company.settings.logoPreviewAlt')}
                                    className="max-h-20 max-w-full rounded object-contain"
                                />
                            ) : (
                                <span className="text-gray-400">{t('company.settings.noLogo')}</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor={`${fieldId}-file`}
                                className="block text-xs font-semibold text-edubot-muted dark:text-slate-400"
                            >
                                {t('company.settings.uploadLogoFile')}
                            </label>
                            <input
                                id={`${fieldId}-file`}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                onChange={handleLogoFile}
                                className="block w-full text-sm text-edubot-muted file:mr-3 file:rounded-lg file:border-0 file:bg-edubot-orange file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white dark:text-slate-400"
                            />
                            <label
                                htmlFor={fieldId}
                                className="block text-xs font-semibold text-edubot-muted dark:text-slate-400"
                            >
                                {t('company.settings.pasteLogoUrl')}
                            </label>
                            <input
                                id={fieldId}
                                className="dashboard-field"
                                // l10n-audit-ignore: URL format example
                                placeholder={'https://...'}
                                value={form.logoUrl ?? ''}
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, logoUrl: e.target.value }))
                                }
                            />
                        </div>
                    </div>
                </div>
            );
        }

        const inputType = ['email', 'tel', 'url', 'text'].includes(meta.type) ? meta.type : 'text';
        return (
            <div key={k}>
                <label
                    htmlFor={fieldId}
                    className="text-sm font-medium text-gray-700 dark:text-slate-200"
                >
                    {label}
                    {meta.required && ' *'}
                </label>
                <input
                    id={fieldId}
                    type={inputType}
                    className={`dashboard-field mt-1 ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    value={form[k] ?? ''}
                    onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}
                    placeholder={meta.placeholder || ''}
                    aria-invalid={invalid || undefined}
                    aria-describedby={invalid ? errorId : undefined}
                />
                {invalid && (
                    <span id={errorId} className="mt-1 block text-xs text-red-600">
                        {errors[k]}
                    </span>
                )}
            </div>
        );
    };

    // ---------- UI ----------
    return (
        <>
            <div className="rounded-2xl border border-edubot-line bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-edubot-ink dark:text-white">
                            {t('company.settings.title')}
                        </h2>
                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                            {t('company.settings.subtitle')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {edit ? (
                            <>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="dashboard-button-secondary"
                                >
                                    {t('company.settings.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={onSave}
                                    disabled={saving}
                                    className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? t('company.settings.saving')
                                        : t('company.settings.saveChanges')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setEdit(true)}
                                    className="dashboard-button-secondary"
                                >
                                    {t('company.settings.editProfile')}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* READ-ONLY */}
                {!edit && (
                    <div className="mt-5 space-y-5">
                        {sections.map((section) => (
                            <section
                                key={section.id}
                                aria-labelledby={`company-section-${section.id}`}
                            >
                                <div className="mb-3">
                                    <h3
                                        id={`company-section-${section.id}`}
                                        className="text-sm font-semibold text-edubot-ink dark:text-white"
                                    >
                                        {t(section.titleKey)}
                                    </h3>
                                    <p className="text-xs text-edubot-muted dark:text-slate-400">
                                        {t(section.descriptionKey)}
                                    </p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {section.fields.map((k) => (
                                        <ViewCell key={k} k={k} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {/* EDIT MODE */}
                {edit && (
                    <form onSubmit={onSave} className="mt-5 space-y-5">
                        {sections.map((section) => (
                            <section
                                key={section.id}
                                aria-labelledby={`company-edit-section-${section.id}`}
                                className="rounded-2xl border border-edubot-line/80 p-4 dark:border-slate-700"
                            >
                                <div className="mb-4">
                                    <h3
                                        id={`company-edit-section-${section.id}`}
                                        className="text-sm font-semibold text-edubot-ink dark:text-white"
                                    >
                                        {t(section.titleKey)}
                                    </h3>
                                    <p className="text-xs text-edubot-muted dark:text-slate-400">
                                        {t(section.descriptionKey)}
                                    </p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {section.fields.map((k) => renderField(k))}
                                </div>
                            </section>
                        ))}

                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="dashboard-button-secondary"
                            >
                                {t('company.settings.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? t('company.settings.saving')
                                    : t('company.settings.saveChanges')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            {allowDelete && (
                <section className="mt-5 rounded-2xl border border-red-200 bg-red-50/70 p-4 dark:border-red-500/30 dark:bg-red-950/20">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-100">
                                {t('company.settings.dangerTitle')}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-red-700 dark:text-red-200">
                                {t('company.settings.dangerSubtitle')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={deleting || edit}
                            className="dashboard-button-secondary border-red-300 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:text-red-200 dark:hover:bg-red-500/10"
                        >
                            {deleting
                                ? t('company.settings.deleting')
                                : t('company.settings.deleteCompany')}
                        </button>
                    </div>
                </section>
            )}
            <ConfirmationModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={t('company.settings.deleteTitle')}
                message={t('company.settings.deleteMessage', { name: company?.name || '' })}
                confirmLabel={t('company.settings.deleteCompany')}
                cancelLabel={t('company.settings.cancel')}
                confirmVariant="danger"
                loading={deleting}
            />
        </>
    );
}

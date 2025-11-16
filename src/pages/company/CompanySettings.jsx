import React from 'react';
import toast from 'react-hot-toast';
import { updateCompany, deleteCompany, uploadCompanyLogo } from '../../services/api';

// ---- Stable defaults (do NOT inline arrays in props/defaults) ----
const DEFAULT_KEYS = [
    'name', 'about', 'logoUrl', 'website', 'email', 'phone',
    'contactName', 'contactEmail', 'contactPhone',
    'address', 'city', 'country',
    'telegram', 'whatsapp', 'instagram',
    'taxId', 'notes',
];

/** Extendable field registry (KY/RU labels) */
const FIELD_META = {
    name: { label: 'Аты / Название', type: 'text', required: true },
    about: { label: 'Сүрөттөмө / Описание', type: 'textarea' },
    logoUrl: { label: 'Логотип (URL)', type: 'image' },
    website: { label: 'Вебсайт', type: 'url', placeholder: 'https://example.com' },
    email: { label: 'Email', type: 'email' },
    phone: { label: 'Телефон', type: 'tel', placeholder: '+996 555 123 456' },
    // Contact person
    contactName: { label: 'Контакт адам / Контактное лицо', type: 'text' },
    contactEmail: { label: 'Контакт Email', type: 'email' },
    contactPhone: { label: 'Контакт Телефон', type: 'tel' },
    // Address
    address: { label: 'Дарек / Адрес', type: 'textarea' },
    city: { label: 'Шаар / Город', type: 'text' },
    country: { label: 'Өлкө / Страна', type: 'text' },
    // Socials
    telegram: { label: 'Telegram', type: 'text', placeholder: '@company' },
    whatsapp: { label: 'WhatsApp', type: 'tel' },
    instagram: { label: 'Instagram', type: 'text' },
    // Legal
    taxId: { label: 'Салык номери / ИНН', type: 'text' },
    notes: { label: 'Эскертмелер / Заметки', type: 'textarea' },
};

export default function CompanySettings({
    company,
    onSaved,
    editableKeys,         // pass if you want to restrict; otherwise we use DEFAULT_KEYS
    allowDelete = true,
}) {
    // ---- FIX: make keys stable (avoid default [] recreation) ----
    const keys = React.useMemo(() => {
        const k = (editableKeys && editableKeys.length ? editableKeys : DEFAULT_KEYS).filter((x) => FIELD_META[x]);
        // normalize order/signature to keep memos stable
        return Array.from(new Set(k));
    }, [editableKeys ? editableKeys.join('|') : 'DEFAULT']);

    const initial = React.useMemo(() => {
        const base = {};
        for (const k of keys) base[k] = company?.[k] ?? '';
        return base;
    }, [company, keys.join('|')]);

    const [edit, setEdit] = React.useState(false);
    const [form, setForm] = React.useState(initial);
    const [saving, setSaving] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [errors, setErrors] = React.useState({});

    // keep form in sync when company/keys change
    React.useEffect(() => { setForm(initial); }, [initial]);

    const dirty = React.useMemo(
        () => JSON.stringify(form) !== JSON.stringify(initial),
        [form, initial]
    );

    const validate = () => {
        const v = {};
        if (keys.includes('name') && !form.name?.trim()) v.name = 'Аты зарыл / Требуется название';
        if (keys.includes('email') && form.email?.trim()) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(form.email.trim())) v.email = 'Email туура эмес / Неверный email';
        }
        if (keys.includes('website') && form.website?.trim()) {
            try { new URL(form.website.trim()); } catch { v.website = 'URL туура эмес / Неверный URL'; }
        }
        return v;
    };

    async function onSave(e) {
        e?.preventDefault?.();
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) { toast.error('Текшерип чыгыңыз / Проверьте поля'); return; }
        if (!dirty) { setEdit(false); return; }

        try {
            setSaving(true);
            const payload = {};
            for (const k of keys) payload[k] = form[k];
            const updated = await updateCompany(company.id, payload);
            toast.success('Сакталды / Сохранено.');
            setEdit(false);
            onSaved?.(updated);
        } catch {
            toast.error('Сактоо катасы / Ошибка сохранения.');
        } finally {
            setSaving(false);
        }
    }

    const onCancel = () => { setForm(initial); setErrors({}); setEdit(false); };

    async function onDelete() {
        if (!allowDelete) return;
        if (!window.confirm('Бул компанияны өчүрүүгө ишенимдүүсүзбү? / Удалить компанию?')) return;
        try { setDeleting(true); await deleteCompany(company.id); toast.success('Компания өчүрүлдү'); window.location.href = '/companies'; }
        catch { toast.error('Өчүрүү катасы'); }
        finally { setDeleting(false); }
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
                toast.success('Логотип жүктөлдү / Сохранён.');
            } else {
                toast.error('Жүктөө ийгиликсиз болду / Upload failed.');
            }
        } catch {
            toast.error('Логотип жүктөө катасы / Ошибка загрузки.');
        } finally {
            setSaving(false);
            e.target.value = '';
        }
    }

    // ---------- Read-only item renderer (improved UI) ----------
    const ViewCell = ({ k }) => {
        const meta = FIELD_META[k];
        const val = company?.[k]; // use source of truth for read-only
        if (k === 'logoUrl') {
            const url = val || '';
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-40 shrink-0">{meta.label}</div>
                    {url ? (
                        /^https?:\/\//i.test(String(url)) ? (
                            <img src={url} alt="Logo" className="h-14 w-auto object-contain rounded" />
                        ) : (
                            <span className="text-sm break-words">{String(url)}</span>
                        )
                    ) : <span className="text-gray-400">—</span>}
                </div>
            );
        }

        // Smart linkers
        if (k === 'website' && val) {
            const href = String(val).startsWith('http') ? val : `https://${val}`;
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-40 shrink-0">{meta.label}</div>
                    <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                        {href}
                    </a>
                </div>
            );
        }
        if (k === 'email' && val) {
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-40 shrink-0">{meta.label}</div>
                    <a href={`mailto:${val}`} className="text-blue-600 hover:underline break-all">{val}</a>
                </div>
            );
        }
        if ((k === 'phone' || k === 'contactPhone' || k === 'whatsapp') && val) {
            const phone = String(val);
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-40 shrink-0">{meta.label}</div>
                    <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
                </div>
            );
        }
        if (k === 'telegram' && val) {
            const v = String(val).startsWith('@') ? String(val).slice(1) : String(val);
            const href = String(val).startsWith('http') ? String(val) : `https://t.me/${v}`;
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-40 shrink-0">{meta.label}</div>
                    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                        <span>@{v}</span>
                    </a>
                </div>
            );
        }
        if (k === 'instagram' && val) {
            const v = String(val).replace(/^@/, '');
            const href = String(val).startsWith('http') ? String(val) : `https://instagram.com/${v}`;
            return (
                <div className="border rounded p-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-40 shrink-0">{meta.label}</div>
                    <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">@{v}</a>
                </div>
            );
        }

        // Multiline for textarea
        if (meta.type === 'textarea') {
            return (
                <div className="border rounded p-3 md:col-span-2">
                    <div className="text-xs text-gray-500 mb-1">{meta.label}</div>
                    <div className="whitespace-pre-wrap break-words text-sm">{val || <span className="text-gray-400">—</span>}</div>
                </div>
            );
        }

        // Default text cell
        return (
            <div className="border rounded p-3">
                <div className="text-xs text-gray-500 mb-1">{meta.label}</div>
                <div className="break-words text-sm">{val || <span className="text-gray-400">—</span>}</div>
            </div>
        );
    };

    // ---------- UI ----------
    return (
        <div className="bg-white rounded shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Компания</h2>
                <div className="flex items-center gap-2">
                    {edit ? (
                        <>
                            <button onClick={onCancel} className="px-3 py-2 rounded border">Жокко чыгаруу</button>
                            <button onClick={onSave} disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {saving ? 'Сакталууда…' : 'Сактоо'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setEdit(true)} className="px-3 py-2 rounded border">Түзөтүү</button>
                            {allowDelete && (
                                <button onClick={onDelete} disabled={deleting} className={`px-3 py-2 rounded ${deleting ? 'text-gray-400' : 'text-red-600 hover:text-red-700'}`}>
                                    {deleting ? 'Өчүрүлүүдө…' : 'Компанияны өчүрүү'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* READ-ONLY */}
            {!edit && (
                <div className="grid md:grid-cols-2 gap-4">
                    {/* put logo first if present */}
                    {keys.includes('logoUrl') && <ViewCell k="logoUrl" />}
                    {/* name always near top */}
                    {keys.includes('name') && <ViewCell k="name" />}
                    {/* then rest */}
                    {keys.filter(k => !['logoUrl', 'name'].includes(k)).map((k) => (
                        <ViewCell key={k} k={k} />
                    ))}
                </div>
            )}

            {/* EDIT MODE */}
            {edit && (
                <form onSubmit={onSave} className="grid md:grid-cols-2 gap-4">
                    {keys.map((k) => {
                        const meta = FIELD_META[k];
                        const invalid = !!errors[k];

                        if (meta.type === 'textarea') {
                            return (
                                <label key={k} className="md:col-span-2 flex flex-col">
                                    <span className="text-sm text-gray-700 mb-1">{meta.label}{meta.required && ' *'}</span>
                                    <textarea
                                        rows={4}
                                        className={`border rounded px-3 py-2 ${invalid ? 'border-red-500' : 'border-gray-300'}`}
                                        value={form[k] ?? ''}
                                        onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}
                                    />
                                    {invalid && <span className="text-xs text-red-600 mt-1">{errors[k]}</span>}
                                </label>
                            );
                        }

                        if (meta.type === 'image') {
                            return (
                                <div key={k} className="flex flex-col gap-2">
                                    <span className="text-sm text-gray-700">{meta.label}</span>
                                    {form.logoUrl ? (
                                        <img src={form.logoUrl} alt="Logo" className="h-14 w-auto object-contain rounded" />
                                    ) : (
                                        <div className="h-14 border rounded flex items-center justify-center text-gray-500">—</div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                            onChange={handleLogoFile}
                                        />
                                        <input
                                            className="border rounded px-3 py-2 flex-1"
                                            placeholder="https://…"
                                            value={form.logoUrl ?? ''}
                                            onChange={(e) => setForm((s) => ({ ...s, logoUrl: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            );
                        }

                        // default inputs
                        const inputType = ['email', 'tel', 'url', 'text'].includes(meta.type) ? meta.type : 'text';
                        return (
                            <label key={k} className="flex flex-col">
                                <span className="text-sm text-gray-700 mb-1">{meta.label}{meta.required && ' *'}</span>
                                <input
                                    type={inputType}
                                    className={`border rounded px-3 py-2 ${invalid ? 'border-red-500' : 'border-gray-300'}`}
                                    value={form[k] ?? ''}
                                    onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}
                                    placeholder={meta.placeholder || ''}
                                />
                                {invalid && <span className="text-xs text-red-600 mt-1">{errors[k]}</span>}
                            </label>
                        );
                    })}

                    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                        <button type="button" onClick={onCancel} className="px-3 py-2 rounded border">Жокко чыгаруу</button>
                        <button type="submit" disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {saving ? 'Сакталууда…' : 'Сактоо'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

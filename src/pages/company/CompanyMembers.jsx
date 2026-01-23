import React from 'react';
import toast from 'react-hot-toast';
import {
    listCompanyMembers,
    addCompanyMember,
    removeCompanyMember,
    setCompanyMemberRole,
    fetchUsers,
} from '@services/api';

const ROLES = [
    { value: 'company_admin', label: 'Админ' },
    { value: 'instructor', label: 'Окутуучу' },
    { value: 'assistant', label: 'Ассистент' },
];

export default function CompanyMembers({ companyId }) {
    const [items, setItems] = React.useState([]);
    const [role, setRole] = React.useState('instructor');

    // search UI state
    const [q, setQ] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [searching, setSearching] = React.useState(false);
    const [activeIdx, setActiveIdx] = React.useState(-1); // keyboard highlight
    const [selected, setSelected] = React.useState(null); // {id, fullName, email, avatarUrl?}

    const load = async () => {
        try {
            setItems(await listCompanyMembers(companyId));
        } catch {
            toast.error('Мүчөлөрдү жүктөөдө ката.');
        }
    };
    React.useEffect(() => {
        load();
    }, [companyId]);

    // Debounced user search via fetchUsers({ search })
    React.useEffect(() => {
        if (selected) {
            setResults([]);
            setSearching(false);
            setActiveIdx(-1);
            return;
        }
        if (!q.trim()) {
            setResults([]);
            setActiveIdx(-1);
            setSelected(null);
            return;
        }
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetchUsers({ page: 1, limit: 8, search: q.trim() });
                const arr = Array.isArray(res) ? res : (res?.data ?? []);
                // exclude existing members by userId
                const memberIds = new Set(items.map((m) => m.userId));
                const cleaned = arr
                    .filter((u) => !memberIds.has(u.id))
                    .map((u) => ({
                        id: u.id,
                        fullName: u.fullName,
                        email: u.email,
                        avatarUrl: u.avatarUrl,
                    }));
                setResults(cleaned);
                setActiveIdx(cleaned.length ? 0 : -1);
            } catch {
                setResults([]);
                setActiveIdx(-1);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [q, items, selected]);

    const onPick = (u) => {
        setSelected(u);
        setQ(u.fullName || u.email || `#${u.id}`);
        setResults([]);
        setSearching(false);
        setActiveIdx(-1);
    };

    const onAdd = async (e) => {
        e?.preventDefault?.();
        const userId = selected?.id;
        if (!userId) return toast.error('Колдонуучуну тандаңыз.');
        try {
            await addCompanyMember(companyId, { userId, role });
            toast.success('Мүчө кошулду.');
            setSelected(null);
            setQ('');
            setRole('instructor');
            await load();
        } catch {
            toast.error('Кошууда ката.');
        }
    };

    const onRemove = async (memberId) => {
        if (!confirm('Өчүрүүгө ишенимдүүбү?')) return;
        try {
            await removeCompanyMember(companyId, memberId);
            toast.success('Өчүрүлдү.');
            load();
        } catch {
            toast.error('Өчүрүү катасы.');
        }
    };

    const onSetRole = async (memberId, newRole) => {
        try {
            await setCompanyMemberRole(companyId, memberId, newRole);
            setItems((prev) =>
                prev.map((m) => (m.userId === memberId ? { ...m, role: newRole } : m))
            );
            toast.success('Роль өзгөртүлдү.');
        } catch {
            toast.error('Роль өзгөртүү катасы.');
        }
    };

    // Keyboard control for dropdown: ↑/↓ to move, Enter to pick, Esc to close
    const onKeyDown = (e) => {
        if (!results.length) {
            if (e.key === 'Escape') setResults([]);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => (i - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const u = results[activeIdx] || results[0];
            if (u) onPick(u);
        } else if (e.key === 'Escape') {
            setResults([]);
            setActiveIdx(-1);
        }
    };

    return (
        <div className="bg-white dark:bg-[#141619] rounded shadow p-4 space-y-4">
            {/* Add member */}
            <form onSubmit={onAdd} className="space-y-2">
                <div className="grid md:grid-cols-3 gap-2">
                    <div className="relative">
                        <input
                            className="border rounded px-3 py-2 w-full text-black dark:text-white bg-white dark:bg-[#222222]"
                            placeholder="Аты же Email боюнча издөө…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value);
                                setSelected(null);
                            }}
                            onKeyDown={onKeyDown}
                            onBlur={() =>
                                setTimeout(() => {
                                    setResults([]);
                                    setSearching(false);
                                }, 120)
                            }
                            autoComplete="off"
                        />
                        {(results.length > 0 || searching) && (
                            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-72 overflow-auto">
                                {searching && (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                        Изделүүдө…
                                    </div>
                                )}
                                {!searching &&
                                    results.map((u, i) => (
                                        <button
                                            type="button"
                                            key={u.id}
                                            onClick={() => onPick(u)}
                                            className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 ${i === activeIdx ? 'bg-gray-50' : ''}`}
                                        >
                                            {u.avatarUrl ? (
                                                <img
                                                    src={u.avatarUrl}
                                                    alt=""
                                                    className="h-6 w-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-6 w-6 rounded-full bg-gray-200" />
                                            )}
                                            <div className="flex-1">
                                                <div className="text-sm">
                                                    {u.fullName || `#${u.id}`}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {u.email || '—'}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">#{u.id}</div>
                                        </button>
                                    ))}
                                {!searching && results.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                        Туура келген колдонуучу жок.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <select
                        className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-[#222222]"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>

                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={!selected}
                    >
                        Кошуу
                    </button>
                </div>

                <div className="text-xs text-gray-500">
                    Колдонуучуну тандап, ролду белгилеңиз. Enter басыңыз — биринчи натыйжа тандалат.
                </div>
            </form>

            {/* Members table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Колдонуучу</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Роль</th>
                            <th className="p-2">Аракеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((m) => (
                            <tr key={m.userId} className="border-b">
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        {m.avatarUrl ? (
                                            <img
                                                src={m.avatarUrl}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-6 w-6 rounded-full bg-gray-200" />
                                        )}
                                        <div>{m.fullName || `#${m.userId}`}</div>
                                    </div>
                                </td>
                                <td className="p-2">{m.email || '—'}</td>
                                <td className="p-2">
                                    <select
                                        className="border rounded px-2 py-1 text-black dark:text-white bg-white dark:bg-[#222222]"
                                        value={m.role}
                                        onChange={(e) => onSetRole(m.userId, e.target.value)}
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-2">
                                    <button
                                        onClick={() => onRemove(m.userId)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Өчүрүү
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500">
                                    Мүчөлөр табылган жок.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

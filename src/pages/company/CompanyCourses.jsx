import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '@shared/ui/Loader';
import {
    listCompanyCourses,
    fetchCourses,
    assignCourseToCompany, // ✅ rename from setCourseCompany for clarity
    unassignCourseFromCompany, // ✅ new
    // clearCourseCompany,           // ❌ no longer used here
} from '@services/api';

export default function CompanyCourses({ companyId, canManage = true }) {
    const [qInput, setQInput] = React.useState('');
    const [q, setQ] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState({ items: [], totalPages: 1, total: 0 });
    const [loading, setLoading] = React.useState(false);

    const [adding, setAdding] = React.useState(false);
    const [searchQ, setSearchQ] = React.useState('');
    const [searching, setSearching] = React.useState(false);
    const [results, setResults] = React.useState([]);
    const [attachingId, setAttachingId] = React.useState(null);

    React.useEffect(() => {
        const t = setTimeout(() => setQ(qInput.trim()), 350);
        return () => clearTimeout(t);
    }, [qInput]);

    const loadCompanyCourses = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await listCompanyCourses(companyId, { page, q });
            setData(res || { items: [], totalPages: 1, total: 0 });
        } catch {
            toast.error('Курстарды жүктөөдө ката кетти.');
        } finally {
            setLoading(false);
        }
    }, [companyId, page, q]);

    React.useEffect(() => {
        loadCompanyCourses();
    }, [loadCompanyCourses]);

    // ✅ Detach only THIS company from the course (many-to-many safe)
    const onDetach = async (courseId) => {
        if (!window.confirm('Бул курсту ушул компаниядан ажыратасызбы?')) return;
        try {
            await unassignCourseFromCompany(courseId, companyId); // ✅ pass both ids
            toast.success('Курс компаниядан ажыратылды.');
            await loadCompanyCourses();
        } catch {
            toast.error('Ажыратууда ката кетти.');
        }
    };

    // Attach this company to a course (many-to-many)
    const onAttach = async (courseId) => {
        try {
            setAttachingId(courseId);
            await assignCourseToCompany(courseId, companyId); // ✅ assign endpoint
            toast.success('Курс компанияга байланыштырылды.');
            setResults((prev) => prev.filter((c) => c.id !== courseId));
            await loadCompanyCourses();
        } catch {
            toast.error('Байланыштырууда ката кетти.');
        } finally {
            setAttachingId(null);
        }
    };

    // Debounced search; don’t exclude courses “belonging to other companies”
    // anymore — many-to-many allows multiple links. Just exclude the ones
    // already linked to THIS company (data.items).
    React.useEffect(() => {
        if (!adding) return;

        const controller = new AbortController();
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const excludeIds = (data?.items || []).map((c) => c.id);
                const excludeCsv =
                    Array.isArray(excludeIds) && excludeIds.length
                        ? excludeIds.join(',')
                        : undefined;
                const raw = await fetchCourses(
                    { q: searchQ?.trim() || '', limit: 20, excludeIds: excludeCsv }, // ✅ keep it simple
                    { signal: controller.signal }
                );
                const arr = Array.isArray(raw) ? raw : raw?.items || raw?.courses || [];
                setResults(arr);
            } catch (e) {
                if (e?.name !== 'AbortError') setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(t);
        };
    }, [adding, searchQ, data]);

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-4">
            {/* Header + Search */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Компания курстары</h1>
                <div className="flex items-center gap-2">
                    <input
                        value={qInput}
                        onChange={(e) => setQInput(e.target.value)}
                        placeholder="Издөө… / Поиск…"
                        className="border rounded px-3 py-1 text-black dark:text-white bg-white dark:bg-[#222222]"
                    />
                    {canManage && (
                        <button
                            onClick={() => {
                                setAdding((s) => !s);
                                setSearchQ('');
                                setResults([]);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                            {adding ? 'Жабуу' : 'Курс кошуу'}
                        </button>
                    )}
                </div>
            </div>

            {/* Drawer for attaching */}
            {adding && canManage && (
                <div className="border rounded p-3 space-y-3 bg-white">
                    <div className="font-medium">Курс кошуу / Привязать курс к компании</div>
                    <input
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        placeholder="Курс издө… (аты боюнча)"
                        className="border rounded px-3 py-1 w-full"
                    />
                    {searching ? (
                        <div className="text-sm text-gray-500 dark:text-[#a6adba]">Изделүүдө…</div>
                    ) : results.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-[#a6adba]">
                            Көрсөтүү үчүн курс табылган жок.
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {results.map((c) => {
                                const disabled = attachingId === c.id;
                                return (
                                    <li
                                        key={c.id}
                                        className="border rounded p-2 flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium">{c.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-[#a6adba]">
                                                {c.instructor?.fullName || '—'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onAttach(c.id)}
                                            disabled={disabled}
                                            className={`px-3 py-1 rounded text-white ${
                                                disabled
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                        >
                                            {disabled ? '...' : 'Байланыштыруу'}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* Company course list */}
            {loading ? (
                <Loader fullScreen={false} />
            ) : (
                <>
                    <div className="text-sm text-gray-600 dark:text-[#a6adba]">
                        Бардыгы: <b>{data.total}</b>
                    </div>

                    <ul className="space-y-3">
                        {(data.items || []).map((c) => (
                            <li
                                key={c.id}
                                className="border rounded p-3 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{c.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-[#a6adba]">
                                        {c.instructor?.fullName || '—'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        to={`/courses/${c.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Көрүү
                                    </Link>
                                    {canManage && (
                                        <button
                                            onClick={() => onDetach(c.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Ажыратуу
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Pagination */}
                    <div className="flex gap-2 justify-center mt-4">
                        {Array.from({ length: data.totalPages || 1 }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : ''}`}
                                disabled={p === page}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

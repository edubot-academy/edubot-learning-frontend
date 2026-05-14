import { Link } from 'react-router-dom';
import { useCatalogRouteState } from '@features/offerings/useCatalogRouteState';
import { usePublicCatalog } from '@features/offerings/usePublicCatalog';

export default function Catalog() {
    const { catalogQuery, page, q, setPage, setQ } = useCatalogRouteState();
    const { data, error, loading } = usePublicCatalog({ page, q: catalogQuery });

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Каталог</h1>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Курстарды изде…"
                    className="border rounded px-3 py-1 text-black dark:text-white bg-white dark:bg-[#222222]"
                />
            </div>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                    Каталог жүктөлгөн жок. Кайра аракет кылып көрүңүз.
                </div>
            )}

            {loading && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300" role="status">
                    Каталог жүктөлүүдө...
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data.items || []).map((c) => (
                    <Link
                        to={`/courses/${c.id}`}
                        key={c.id}
                        className="block border rounded shadow hover:shadow-md transition"
                    >
                        {c.coverImageUrl && (
                            <img
                                src={c.coverImageUrl}
                                alt={c.title}
                                className="w-full h-40 object-cover rounded-t"
                            />
                        )}
                        <div className="p-3">
                            <div className="font-semibold line-clamp-2">{c.title}</div>
                            <div className="text-sm text-gray-600">
                                {c.instructor?.fullName || '—'}
                            </div>
                            {/* Optional: durationInHours, price */}
                        </div>
                    </Link>
                ))}
            </div>

            {!loading && !(data.items || []).length && !error && (
                <div className="rounded border border-gray-200 p-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    Курстар табылган жок.
                </div>
            )}

            <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : ''}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}

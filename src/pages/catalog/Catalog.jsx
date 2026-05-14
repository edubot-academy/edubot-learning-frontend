import { Link } from 'react-router-dom';
import { useCatalogRouteState } from '@features/offerings/useCatalogRouteState';
import { usePublicCatalog } from '@features/offerings/usePublicCatalog';

const getVisibleCatalogPages = (currentPage, totalPages) => {
    const normalizedTotal = Math.max(1, Number(totalPages || 1));
    const normalizedCurrent = Math.min(Math.max(1, Number(currentPage || 1)), normalizedTotal);
    const pages = new Set([1, normalizedTotal, normalizedCurrent]);

    for (let offset = -1; offset <= 1; offset += 1) {
        const nextPage = normalizedCurrent + offset;
        if (nextPage > 1 && nextPage < normalizedTotal) {
            pages.add(nextPage);
        }
    }

    return [...pages].sort((a, b) => a - b);
};

export default function Catalog() {
    const { catalogQuery, page, q, setPage, setQ } = useCatalogRouteState();
    const { data, error, loading, retry } = usePublicCatalog({ page, q: catalogQuery });
    const items = data.items || [];
    const totalPages = Math.max(1, Number(data.totalPages || 1));
    const resultLabel = loading
        ? 'Каталог жүктөлүүдө...'
        : error
          ? 'Каталог жүктөлгөн жок.'
          : items.length
            ? `${items.length} курс табылды`
            : 'Курстар табылган жок';
    const currentCatalogPage = Math.min(Math.max(1, Number(page || 1)), totalPages);
    const visiblePages = getVisibleCatalogPages(currentCatalogPage, totalPages);

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Каталог</h1>
                <div role="search">
                    <label htmlFor="catalog-search" className="sr-only">
                        Курстарды издөө
                    </label>
                    <input
                        id="catalog-search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Курстарды изде…"
                        className="border rounded px-3 py-1 text-black dark:text-white bg-white dark:bg-[#222222]"
                        aria-describedby="catalog-result-status"
                    />
                </div>
            </div>

            <p id="catalog-result-status" className="mb-4 text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
                {resultLabel}
            </p>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                    <p className="font-semibold">Каталог жүктөлгөн жок.</p>
                    <p className="mt-1">Кайра аракет кылып көрүңүз.</p>
                    <button
                        type="button"
                        onClick={retry}
                        className="mt-3 rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Кайра жүктөө
                    </button>
                </div>
            )}

            {loading && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300" role="status">
                    Каталог жүктөлүүдө...
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((c) => (
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

            {!loading && !items.length && !error && (
                <div className="rounded border border-gray-200 p-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    {catalogQuery ? 'Бул издөө боюнча курстар табылган жок.' : 'Азырынча каталогдо курстар жок.'}
                </div>
            )}

            {totalPages > 1 && (
                <nav className="mt-4 flex justify-center gap-2" aria-label="Каталог барактары">
                    <button
                        type="button"
                        onClick={() => setPage(currentCatalogPage - 1)}
                        disabled={currentCatalogPage <= 1}
                        className="px-3 py-1 border rounded disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Мурунку
                    </button>
                    {visiblePages.map((p, index) => {
                        const previousPage = visiblePages[index - 1];
                        const showGap = previousPage && p - previousPage > 1;

                        return (
                            <span key={p} className="flex items-center gap-2">
                                {showGap && <span className="px-1 text-gray-500" aria-hidden="true">...</span>}
                                <button
                                    type="button"
                                    onClick={() => setPage(p)}
                                    aria-current={p === currentCatalogPage ? 'page' : undefined}
                                    aria-label={`${p}-барак`}
                                    className={`px-3 py-1 border rounded ${p === currentCatalogPage ? 'bg-blue-600 text-white' : ''}`}
                                >
                                    {p}
                                </button>
                            </span>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setPage(currentCatalogPage + 1)}
                        disabled={currentCatalogPage >= totalPages}
                        className="px-3 py-1 border rounded disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Кийинки
                    </button>
                </nav>
            )}
        </div>
    );
}

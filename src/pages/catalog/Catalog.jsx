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

const formatCatalogPrice = (course) => {
    if (course.price === 0 || course.isPaid === false) return 'Акысыз';
    if (course.price) return `${course.price} сом`;
    return 'Баасы көрсөтүлгөн эмес';
};

const getCourseTypeLabel = (course) => {
    if (course.courseType === 'offline') return 'Оффлайн';
    if (course.courseType === 'online_live') return 'Онлайн live';
    return 'Видео курс';
};

const getDurationLabel = (course) => {
    if (course.durationInHours) return `${course.durationInHours} саат`;
    if (course.totalLessons) return `${course.totalLessons} сабак`;
    if (course.lessonsCount) return `${course.lessonsCount} сабак`;
    return 'Узактыгы көрсөтүлгөн эмес';
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
            ? catalogQuery
                ? `"${catalogQuery}" боюнча ${items.length} курс табылды`
                : `${items.length} курс көрсөтүлүүдө`
            : 'Курстар табылган жок';
    const currentCatalogPage = Math.min(Math.max(1, Number(page || 1)), totalPages);
    const visiblePages = getVisibleCatalogPages(currentCatalogPage, totalPages);

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Каталог</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Курс аталышы, багыты же окутуучу боюнча издеңиз.
                    </p>
                </div>
                <div role="search" className="w-full max-w-md">
                    <label htmlFor="catalog-search" className="mb-1 block text-sm font-medium">
                        Курстарды издөө
                    </label>
                    <input
                        id="catalog-search"
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Курстарды изде…"
                        className="w-full rounded-lg border px-3 py-2 text-black bg-white dark:text-white dark:bg-[#222222]"
                        aria-describedby="catalog-search-help catalog-result-status"
                    />
                    <p id="catalog-search-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Издөө дароо эмес, кыска тыныгуудан кийин жаңыланат.
                    </p>
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
                        className="block overflow-hidden rounded-lg border bg-white shadow transition hover:shadow-md dark:border-gray-800 dark:bg-[#1f1f1f]"
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
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {c.instructor?.fullName || '—'}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                                    {formatCatalogPrice(c)}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {getCourseTypeLabel(c)}
                                </span>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                                    {getDurationLabel(c)}
                                </span>
                            </div>
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

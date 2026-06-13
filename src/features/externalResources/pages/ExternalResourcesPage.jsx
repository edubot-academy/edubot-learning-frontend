import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExternalResourceCard from '../components/ExternalResourceCard';
import ExternalResourceFilters from '../components/ExternalResourceFilters';
import { fetchExternalResources } from '../api';
import { buildCategoryOptions, getResourcesByCategory } from '../data/externalResources';

const PAGE_SIZE = 20;

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

// ─── Data hook ────────────────────────────────────────────────────────────────
const useResources = (category, page) => {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setError(false);
        setResult(null);

        fetchExternalResources({ category, limit: PAGE_SIZE, offset: page * PAGE_SIZE })
            .then((res) => {
                if (!cancelled) setResult(res);
            })
            .catch(() => {
                if (!cancelled) {
                    const fallback = getResourcesByCategory(category);
                    setResult({ data: fallback, total: fallback.length });
                    setError(true);
                }
            });

        return () => { cancelled = true; };
    }, [category, page]);

    return {
        items: result?.data ?? null,
        total: result?.total ?? 0,
        loading: result === null && !error,
        error,
    };
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPageChange, loading }) => {
    if (totalPages <= 1) return null;

    const btnBase = 'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed';
    const btnInactive = `${btnBase} border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-400 hover:border-[#E14219]/50 hover:text-[#E14219] dark:hover:border-[#FF8C6E]/50 dark:hover:text-[#FF8C6E]`;
    const btnActive = `${btnBase} bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white shadow-md cursor-default`;

    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
        const relevant = new Set(
            [0, totalPages - 1, page, page - 1, page + 1].filter((p) => p >= 0 && p < totalPages)
        );
        const sorted = [...relevant].sort((a, b) => a - b);
        const result = [];
        let prev = -1;
        for (const p of sorted) {
            if (prev !== -1 && p - prev > 1) result.push('ellipsis');
            result.push(p);
            prev = p;
        }
        return result;
    };

    return (
        <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0 || loading}
                aria-label="Previous page"
                className={btnInactive}
            >
                <ChevronLeftIcon />
            </button>

            {getPageNumbers().map((p, i) =>
                p === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => p !== page && onPageChange(p)}
                        disabled={loading}
                        aria-label={`Page ${p + 1}`}
                        aria-current={p === page ? 'page' : undefined}
                        className={p === page ? btnActive : btnInactive}
                    >
                        {p + 1}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages - 1 || loading}
                aria-label="Next page"
                className={btnInactive}
            >
                <ChevronRightIcon />
            </button>
        </nav>
    );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden motion-safe:animate-pulse">
        <div className="h-36 bg-gray-100 dark:bg-white/10" />
        <div className="p-4 flex flex-col gap-3">
            <div className="h-4 w-3/4 rounded-full bg-gray-100 dark:bg-white/10" />
            <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-white/10" />
            <div className="h-3 w-2/3 rounded-full bg-gray-100 dark:bg-white/10" />
            <div className="flex gap-2 pt-1">
                <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/10" />
                <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/10" />
            </div>
        </div>
        <div className="px-4 pb-4">
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-white/10" />
        </div>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const ExternalResourcesPage = () => {
    const { t } = useTranslation();
    const gridRef = useRef(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [page, setPage] = useState(0);
    const [categories, setCategories] = useState(() =>
        buildCategoryOptions(getResourcesByCategory('all').map((resource) => resource.category))
    );
    const { items, total, loading } = useResources(activeCategory, page);

    useEffect(() => {
        let cancelled = false;

        fetchExternalResources({ limit: 1, offset: 0 })
            .then(async ({ total }) => {
                const limit = Math.max(total || 0, 1);
                const { data } = await fetchExternalResources({ limit, offset: 0 });
                if (cancelled) return;
                setCategories(buildCategoryOptions(data.map((resource) => resource.category)));
            })
            .catch(() => {
                if (cancelled) return;
                setCategories(
                    buildCategoryOptions(getResourcesByCategory('all').map((resource) => resource.category))
                );
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const rangeFrom = page * PAGE_SIZE + 1;
    const rangeTo = Math.min((page + 1) * PAGE_SIZE, total);

    const scrollToGrid = () => {
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setPage(0);
        scrollToGrid();
    };

    const handlePageChange = (p) => {
        setPage(p);
        scrollToGrid();
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            {/* Hero header */}
            <div className="relative overflow-hidden border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-orange-50/70 via-white to-white dark:from-orange-950/20 dark:via-[#222222] dark:to-[#222222]">
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    <svg viewBox="0 0 800 200" className="absolute right-0 top-0 h-full w-auto opacity-[0.04] dark:opacity-[0.06]" fill="currentColor">
                        <circle cx="700" cy="60" r="120" />
                        <circle cx="600" cy="160" r="80" />
                        <circle cx="760" cy="180" r="60" />
                    </svg>
                </div>
                <div className="relative px-4 pt-12 pb-10 sm:px-6 lg:px-12 max-w-screen-xl mx-auto">
                    <div className="flex items-start gap-4 mb-4">
                        <span className="w-1 h-10 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] flex-shrink-0 mt-1" />
                        <div>
                            <h1 className="font-suisse font-bold text-3xl sm:text-4xl text-[#141619] dark:text-[#E8ECF3] leading-tight">
                                {t('public.externalResources.pageTitle')}
                            </h1>
                            <p className="font-suisse text-[#3E424A] dark:text-[#a6adba] text-base mt-2 max-w-2xl">
                                {total > 0
                                    ? t('public.externalResources.pageSubtitle', { count: total })
                                    : t('public.externalResources.homeSectionSubtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-6">
                        <ExternalResourceFilters
                            categories={categories.map((category) => category.key)}
                            active={activeCategory}
                            onChange={handleCategoryChange}
                            total={total}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 py-8 sm:px-6 lg:px-12 max-w-screen-xl mx-auto">

                {/* Result count */}
                <div ref={gridRef} className="mb-6 h-5">
                    {!loading && total > 0 && (
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            {rangeFrom}–{rangeTo} <span className="mx-0.5 opacity-50">/</span> {total}
                        </p>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : items?.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-base">
                            {t('public.externalResources.emptyCategory')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-3 gap-6">
                        {items.map((resource) => (
                            <ExternalResourceCard key={resource.id ?? resource.slug} {...resource} />
                        ))}
                    </div>
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default ExternalResourcesPage;

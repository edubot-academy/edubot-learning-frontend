import React from 'react';
import { listCompanies, createCompany } from '@services/api';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '@shared/ui/Loader';
import { EmptyState } from '@components/ui/dashboard';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '@shared/api/error';

const PAGE_SIZE = 12;

const getPageNumbers = (current, total) => {
    const totalPages = Math.max(1, Number(total) || 1);
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const pages = new Set([1, totalPages, current - 1, current, current + 1]);
    if (current <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }
    if (current >= totalPages - 2) {
        pages.add(totalPages - 1);
        pages.add(totalPages - 2);
        pages.add(totalPages - 3);
    }

    return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
};

const getCompanyMeta = (company) =>
    [
        company.city || company.country
            ? [company.city, company.country].filter(Boolean).join(', ')
            : null,
        company.email || null,
        company.phone || null,
    ].filter(Boolean);

export default function CompanyList() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryFromUrl = searchParams.get('q') || '';
    const pageFromUrl = Math.max(1, Number(searchParams.get('page')) || 1);
    const [qInput, setQInput] = React.useState(queryFromUrl);
    const [data, setData] = React.useState({ items: [], totalPages: 1, total: 0 });
    const [loading, setLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState(false);
    const [newName, setNewName] = React.useState('');
    const [creating, setCreating] = React.useState(false);
    const [reloadKey, setReloadKey] = React.useState(0);
    const requestSeqRef = React.useRef(0);

    React.useEffect(() => {
        setQInput(queryFromUrl);
    }, [queryFromUrl]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            const nextQuery = qInput.trim();
            if (nextQuery === queryFromUrl.trim()) return;

            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (nextQuery) next.set('q', nextQuery);
                else next.delete('q');
                next.delete('page');
                return next;
            });
        }, 350);

        return () => clearTimeout(timeout);
    }, [qInput, queryFromUrl, setSearchParams]);

    const refreshCompanies = React.useCallback(() => {
        setReloadKey((value) => value + 1);
    }, []);

    const loadCompanies = React.useCallback(async () => {
        const requestSeq = requestSeqRef.current + 1;
        requestSeqRef.current = requestSeq;
        setLoading(true);
        setLoadError(false);
        try {
            const nextData = await listCompanies({
                page: pageFromUrl,
                limit: PAGE_SIZE,
                q: queryFromUrl,
            });
            if (requestSeqRef.current === requestSeq) {
                setData(nextData || { items: [], totalPages: 1, total: 0 });
            }
        } catch (error) {
            if (requestSeqRef.current === requestSeq) {
                setLoadError(true);
                toast.error(parseApiError(error, t('company.list.toasts.loadError')).message);
            }
        } finally {
            if (requestSeqRef.current === requestSeq) {
                setLoading(false);
            }
        }
    }, [pageFromUrl, queryFromUrl, t]);

    React.useEffect(() => {
        loadCompanies();
    }, [loadCompanies, reloadKey]);

    const setPage = (nextPage) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (nextPage > 1) next.set('page', String(nextPage));
            else next.delete('page');
            return next;
        });
    };

    const onCreate = async (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) {
            toast.error(t('company.list.toasts.nameRequired'));
            return;
        }

        try {
            setCreating(true);
            await createCompany({ name });
            setNewName('');
            setQInput('');
            setSearchParams(new URLSearchParams());
            toast.success(t('company.list.toasts.created'));
            refreshCompanies();
        } catch (error) {
            toast.error(parseApiError(error, t('company.list.toasts.createError')).message);
        } finally {
            setCreating(false);
        }
    };

    const companies = data.items || [];
    const totalPages = Math.max(1, Number(data.totalPages) || 1);
    const pageNumbers = getPageNumbers(pageFromUrl, totalPages);
    const hasSearch = Boolean(queryFromUrl.trim());

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4">
            <div className="rounded-2xl border border-edubot-line bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-edubot-ink dark:text-white">
                            {t('company.list.title')}
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-edubot-muted dark:text-slate-400">
                            {t('company.list.subtitle')}
                        </p>
                    </div>
                    <div className="rounded-xl border border-edubot-line bg-edubot-surfaceAlt px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                            {t('company.list.results')}
                        </div>
                        <div className="mt-1 text-lg font-bold text-edubot-ink dark:text-white">
                            {data.total ?? companies.length}
                        </div>
                    </div>
                </div>
            </div>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <div className="rounded-2xl border border-edubot-line bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor="company-list-search"
                                className="text-sm font-semibold text-edubot-ink dark:text-white"
                            >
                                {t('company.list.searchLabel')}
                            </label>
                            <input
                                id="company-list-search"
                                value={qInput}
                                onChange={(e) => setQInput(e.target.value)}
                                placeholder={t('company.list.searchPlaceholder')}
                                className="dashboard-field mt-2"
                            />
                        </div>
                        {hasSearch ? (
                            <button
                                type="button"
                                className="dashboard-button-secondary"
                                onClick={() => {
                                    setQInput('');
                                    setSearchParams(new URLSearchParams());
                                }}
                            >
                                {t('company.list.clear')}
                            </button>
                        ) : null}
                    </div>
                    <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                        {t('company.list.searchHint')}
                    </p>
                </div>

                <form
                    onSubmit={onCreate}
                    className="rounded-2xl border border-edubot-line bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                >
                    <h2 className="text-sm font-semibold text-edubot-ink dark:text-white">
                        {t('company.list.createTitle')}
                    </h2>
                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                        {t('company.list.createHint')}
                    </p>
                    <label htmlFor="company-create-name" className="sr-only">
                        {t('company.fields.name')}
                    </label>
                    <input
                        id="company-create-name"
                        className="dashboard-field mt-3"
                        placeholder={t('company.fields.name')}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        disabled={creating}
                    />
                    <button
                        className="dashboard-button-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={creating || !newName.trim()}
                    >
                        {creating ? t('company.list.creating') : t('company.list.createAction')}
                    </button>
                </form>
            </section>

            <section className="rounded-2xl border border-edubot-line bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-edubot-ink dark:text-white">
                            {t('company.list.directoryTitle')}
                        </h2>
                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                            {hasSearch
                                ? t('company.list.filteredBy', { query: queryFromUrl })
                                : t('company.list.directorySubtitle')}
                        </p>
                    </div>
                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                        {t('company.list.pageOf', { page: pageFromUrl, totalPages })}
                    </div>
                </div>

                {loading ? (
                    <Loader fullScreen={false} />
                ) : loadError ? (
                    <EmptyState
                        variant="error"
                        title={t('company.list.loadErrorTitle')}
                        subtitle={t('company.list.loadErrorSubtitle')}
                        action={{ label: t('company.list.retry'), onClick: loadCompanies }}
                    />
                ) : companies.length ? (
                    <ul className="grid gap-3 md:grid-cols-2">
                        {companies.map((company) => {
                            const meta = getCompanyMeta(company);
                            return (
                                <li
                                    key={company.id}
                                    className="rounded-2xl border border-edubot-line/80 p-4 transition hover:border-edubot-orange/50 hover:bg-edubot-surfaceAlt/40 dark:border-slate-700 dark:hover:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="break-words text-base font-semibold text-edubot-ink dark:text-white">
                                                {company.name}
                                            </h3>
                                            {company.about ? (
                                                <p className="mt-1 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                                    {company.about}
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                    {t('company.list.noDescription')}
                                                </p>
                                            )}
                                        </div>
                                        <span className="shrink-0 rounded-full bg-edubot-surfaceAlt px-2.5 py-1 text-xs font-semibold text-edubot-muted dark:bg-slate-800 dark:text-slate-300">
                                            #{company.id}
                                        </span>
                                    </div>

                                    {meta.length ? (
                                        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-edubot-muted dark:text-slate-400">
                                            {meta.map((item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full bg-edubot-surfaceAlt px-2 py-0.5 dark:bg-slate-800"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className="mt-4 flex justify-end">
                                        <Link
                                            to={`/companies/${company.id}`}
                                            className="dashboard-button-secondary"
                                        >
                                            {t('company.list.openWorkspace')}
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <EmptyState
                        variant={hasSearch ? 'discovery' : 'default'}
                        title={
                            hasSearch
                                ? t('company.list.emptySearchTitle')
                                : t('company.list.emptyTitle')
                        }
                        subtitle={
                            hasSearch
                                ? t('company.list.emptySearchSubtitle')
                                : t('company.list.emptySubtitle')
                        }
                        action={
                            hasSearch
                                ? {
                                      label: t('company.list.clearSearch'),
                                      onClick: () => setQInput(''),
                                  }
                                : undefined
                        }
                    />
                )}

                {!loading && !loadError && totalPages > 1 ? (
                    <nav
                        className="mt-6 flex items-center justify-center gap-2"
                        aria-label={t('company.list.paginationLabel')}
                    >
                        <button
                            type="button"
                            onClick={() => setPage(Math.max(1, pageFromUrl - 1))}
                            disabled={pageFromUrl <= 1}
                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t('company.list.previous')}
                        </button>
                        {pageNumbers.map((pageNumber, index) => {
                            const previous = pageNumbers[index - 1];
                            const showGap = previous && pageNumber - previous > 1;
                            return (
                                <React.Fragment key={pageNumber}>
                                    {showGap ? (
                                        <span
                                            className="px-1 text-sm text-edubot-muted"
                                            aria-hidden="true"
                                        >
                                            ...
                                        </span>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setPage(pageNumber)}
                                        aria-current={
                                            pageNumber === pageFromUrl ? 'page' : undefined
                                        }
                                        disabled={pageNumber === pageFromUrl}
                                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                            pageNumber === pageFromUrl
                                                ? 'border-edubot-orange bg-edubot-orange text-white'
                                                : 'border-edubot-line bg-white text-edubot-ink hover:bg-edubot-surfaceAlt dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setPage(Math.min(totalPages, pageFromUrl + 1))}
                            disabled={pageFromUrl >= totalPages}
                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t('company.list.next')}
                        </button>
                    </nav>
                ) : null}
            </section>
        </div>
    );
}

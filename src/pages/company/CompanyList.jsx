import React from 'react';
import { listCompanies, createCompany } from '@services/api';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '@shared/ui/Loader';
import { EmptyState } from '@components/ui/dashboard';

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
        } catch {
            if (requestSeqRef.current === requestSeq) {
                setLoadError(true);
                toast.error('Could not load companies.');
            }
        } finally {
            if (requestSeqRef.current === requestSeq) {
                setLoading(false);
            }
        }
    }, [pageFromUrl, queryFromUrl]);

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
            toast.error('Company name is required.');
            return;
        }

        try {
            setCreating(true);
            await createCompany({ name });
            setNewName('');
            setQInput('');
            setSearchParams(new URLSearchParams());
            toast.success('Company created.');
            refreshCompanies();
        } catch {
            toast.error('Could not create company.');
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
                            Tenant companies
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-edubot-muted dark:text-slate-400">
                            Manage tenant workspaces, open company operations, and create new
                            tenants with clear ownership.
                        </p>
                    </div>
                    <div className="rounded-xl border border-edubot-line bg-edubot-surfaceAlt px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                            Results
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
                                Search companies
                            </label>
                            <input
                                id="company-list-search"
                                value={qInput}
                                onChange={(e) => setQInput(e.target.value)}
                                placeholder="Search by company name"
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
                                Clear
                            </button>
                        ) : null}
                    </div>
                    <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                        Search is saved in the URL so this filtered view can be reopened.
                    </p>
                </div>

                <form
                    onSubmit={onCreate}
                    className="rounded-2xl border border-edubot-line bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                >
                    <h2 className="text-sm font-semibold text-edubot-ink dark:text-white">
                        Create tenant
                    </h2>
                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                        Create the company first, then configure contacts, members, courses, and CRM
                        links inside the workspace.
                    </p>
                    <label htmlFor="company-create-name" className="sr-only">
                        Company name
                    </label>
                    <input
                        id="company-create-name"
                        className="dashboard-field mt-3"
                        placeholder="Company name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        disabled={creating}
                    />
                    <button
                        className="dashboard-button-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={creating || !newName.trim()}
                    >
                        {creating ? 'Creating...' : 'Create company'}
                    </button>
                </form>
            </section>

            <section className="rounded-2xl border border-edubot-line bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-edubot-ink dark:text-white">
                            Company directory
                        </h2>
                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                            {hasSearch
                                ? `Filtered by "${queryFromUrl}".`
                                : 'All tenant workspaces available to your role.'}
                        </p>
                    </div>
                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                        Page {pageFromUrl} of {totalPages}
                    </div>
                </div>

                {loading ? (
                    <Loader fullScreen={false} />
                ) : loadError ? (
                    <EmptyState
                        variant="error"
                        title="Companies could not be loaded"
                        subtitle="The tenant directory is unavailable. Retry the request before creating or opening tenants."
                        action={{ label: 'Retry', onClick: loadCompanies }}
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
                                                    No description yet.
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
                                            Open workspace
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <EmptyState
                        variant={hasSearch ? 'discovery' : 'default'}
                        title={hasSearch ? 'No companies match this search' : 'No companies yet'}
                        subtitle={
                            hasSearch
                                ? 'Clear the search or try a different company name.'
                                : 'Create the first tenant company to start assigning members and courses.'
                        }
                        action={
                            hasSearch
                                ? { label: 'Clear search', onClick: () => setQInput('') }
                                : undefined
                        }
                    />
                )}

                {!loading && !loadError && totalPages > 1 ? (
                    <nav
                        className="mt-6 flex items-center justify-center gap-2"
                        aria-label="Company pages"
                    >
                        <button
                            type="button"
                            onClick={() => setPage(Math.max(1, pageFromUrl - 1))}
                            disabled={pageFromUrl <= 1}
                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
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
                            Next
                        </button>
                    </nav>
                ) : null}
            </section>
        </div>
    );
}

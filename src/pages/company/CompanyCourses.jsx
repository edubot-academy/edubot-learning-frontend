
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '@shared/ui/Loader';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import { AuthContext } from '../../context/AuthContext';
import {
    listCompanyCourses,
    fetchCourses,
    assignCourseToCompany,
    unassignCourseFromCompany,
    getCompany,
} from '@services/api';
import { DashboardInsetPanel, EmptyState } from '@components/ui/dashboard';
import {
    getCourseTypeTenantDisabledMessage,
    isCourseTypeAllowedForTenant,
} from '@shared/utils/tenantFeatures';
import { isPlatformAdmin } from '@shared/utils/roles';

const PAGE_SIZE = 20;
const ATTACH_SEARCH_LIMIT = 25;

const COURSE_TYPE_LABELS = {
    video: 'Video',
    online_live: 'Online live',
    offline: 'Offline',
};

const getCourseTypeLabel = (course) => {
    const type = String(course?.courseType || course?.type || '').toLowerCase();
    return COURSE_TYPE_LABELS[type] || 'Course';
};

const getCourseStatusLabel = (course) => {
    if (course?.status) return String(course.status).replace(/_/g, ' ');
    if (typeof course?.isPublished === 'boolean') return course.isPublished ? 'Published' : 'Draft';
    return 'Status unknown';
};

const getCoursePriceLabel = (course) => {
    if (course?.isPaid === false) return 'Free';
    const price = course?.price;
    if (price === null || price === undefined || price === '') return 'Price not set';
    const numericPrice = Number(price);
    if (Number.isFinite(numericPrice)) return numericPrice > 0 ? `${numericPrice} KGS` : 'Free';
    return String(price);
};

const CourseMeta = ({ course, restricted = false }) => (
    <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-edubot-surfaceAlt px-2 py-0.5 text-edubot-muted dark:bg-slate-800 dark:text-slate-300">
            {getCourseTypeLabel(course)}
        </span>
        <span className="rounded-full bg-edubot-surfaceAlt px-2 py-0.5 text-edubot-muted dark:bg-slate-800 dark:text-slate-300">
            {getCourseStatusLabel(course)}
        </span>
        <span className="rounded-full bg-edubot-surfaceAlt px-2 py-0.5 text-edubot-muted dark:bg-slate-800 dark:text-slate-300">
            {getCoursePriceLabel(course)}
        </span>
        {restricted ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700 dark:bg-red-500/10 dark:text-red-200">
                Disabled for tenant
            </span>
        ) : null}
    </div>
);

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

    return [...pages]
        .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
        .sort((a, b) => a - b);
};

export default function CompanyCourses({ company, companyId, canManage }) {
    const { user } = React.useContext(AuthContext);
    const { id: routeCompanyId } = useParams();
    const resolvedCompanyId = companyId ?? Number(routeCompanyId);
    const [resolvedCompany, setResolvedCompany] = React.useState(company ?? null);
    const [qInput, setQInput] = React.useState('');
    const [q, setQ] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState({ items: [], totalPages: 1, total: 0 });
    const [loading, setLoading] = React.useState(false);
    const [loadError, setLoadError] = React.useState(false);

    const [adding, setAdding] = React.useState(false);
    const [searchQ, setSearchQ] = React.useState('');
    const [searching, setSearching] = React.useState(false);
    const [searchError, setSearchError] = React.useState(false);
    const [searchRetryKey, setSearchRetryKey] = React.useState(0);
    const [results, setResults] = React.useState([]);
    const [attachingId, setAttachingId] = React.useState(null);
    const [detachingId, setDetachingId] = React.useState(null);
    const [pendingDetachId, setPendingDetachId] = React.useState(null);
    const courseListRequestSeqRef = React.useRef(0);
    const effectiveCompany = company ?? resolvedCompany;
    const effectiveCanManage =
        Boolean(effectiveCompany) &&
        (typeof canManage === 'boolean'
            ? canManage
            : ['owner', 'company_admin'].includes(effectiveCompany.role) || isPlatformAdmin(user));
    const assignedCourses = data.items || [];
    const totalPages = Math.max(1, Number(data.totalPages) || 1);
    const totalCourses = Number(data.total) || assignedCourses.length;
    const pageNumbers = getPageNumbers(page, totalPages);

    React.useEffect(() => {
        setResolvedCompany(company ?? null);
    }, [company]);

    React.useEffect(() => {
        if (company || !Number.isFinite(resolvedCompanyId)) return;

        let ignore = false;
        (async () => {
            try {
                const nextCompany = await getCompany(resolvedCompanyId);
                if (!ignore) setResolvedCompany(nextCompany);
            } catch {
                if (!ignore) setResolvedCompany(null);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [company, resolvedCompanyId]);

    React.useEffect(() => {
        const t = setTimeout(() => setQ(qInput.trim()), 350);
        return () => clearTimeout(t);
    }, [qInput]);

    const loadCompanyCourses = React.useCallback(async () => {
        const requestSeq = courseListRequestSeqRef.current + 1;
        courseListRequestSeqRef.current = requestSeq;

        if (!Number.isFinite(resolvedCompanyId)) {
            setLoadError(true);
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadError(false);
        try {
            const res = await listCompanyCourses(resolvedCompanyId, { page, limit: PAGE_SIZE, q });
            if (courseListRequestSeqRef.current === requestSeq) {
                setData(res || { items: [], totalPages: 1, total: 0 });
            }
        } catch {
            if (courseListRequestSeqRef.current === requestSeq) {
                setLoadError(true);
                toast.error('Could not load tenant courses.');
            }
        } finally {
            if (courseListRequestSeqRef.current === requestSeq) {
                setLoading(false);
            }
        }
    }, [resolvedCompanyId, page, q]);

    React.useEffect(() => {
        loadCompanyCourses();
    }, [loadCompanyCourses]);

    const onDetach = (courseId) => {
        setPendingDetachId(courseId);
    };

    const confirmDetach = async () => {
        if (!pendingDetachId || !effectiveCanManage) return;

        try {
            setDetachingId(pendingDetachId);
            await unassignCourseFromCompany(pendingDetachId, resolvedCompanyId);
            toast.success('Course detached from tenant.');
            setPendingDetachId(null);
            await loadCompanyCourses();
        } catch {
            toast.error('Could not detach course.');
        } finally {
            setDetachingId(null);
        }
    };

    const onAttach = async (courseId) => {
        if (!effectiveCanManage) return;

        const course = results.find((item) => item.id === courseId);
        if (course && !isCourseTypeAllowedForTenant(effectiveCompany, course.courseType)) {
            toast.error(getCourseTypeTenantDisabledMessage(course.courseType));
            return;
        }

        try {
            setAttachingId(courseId);
            await assignCourseToCompany(courseId, resolvedCompanyId);
            toast.success('Course attached to tenant.');
            setResults((prev) => prev.filter((c) => c.id !== courseId));
            await loadCompanyCourses();
        } catch {
            toast.error('Could not attach course.');
        } finally {
            setAttachingId(null);
        }
    };

    React.useEffect(() => {
        if (!adding) return;

        const controller = new AbortController();
        const t = setTimeout(async () => {
            setSearching(true);
            setSearchError(false);
            try {
                const excludeIds = (data?.items || []).map((c) => c.id);
                const excludeCsv =
                    Array.isArray(excludeIds) && excludeIds.length
                        ? excludeIds.join(',')
                        : undefined;
                const raw = await fetchCourses(
                    {
                        q: searchQ?.trim() || '',
                        limit: ATTACH_SEARCH_LIMIT,
                        excludeIds: excludeCsv,
                    },
                    { signal: controller.signal }
                );
                const arr = Array.isArray(raw) ? raw : raw?.items || raw?.courses || [];
                setResults(arr);
            } catch (e) {
                if (e?.name !== 'AbortError') {
                    setResults([]);
                    setSearchError(true);
                }
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(t);
        };
    }, [adding, searchQ, data, searchRetryKey]);

    return (
        <DashboardInsetPanel
            title="Tenant courses"
            description="Review assigned courses first. Open add mode only when you need to attach another course to this tenant."
        >
            <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-edubot-line/80 bg-edubot-surfaceAlt/40 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                Assigned courses: {totalCourses}
                            </div>
                            <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                Search below filters courses already attached to this tenant.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label htmlFor="company-course-filter" className="sr-only">
                                Filter assigned courses
                            </label>
                            <input
                                id="company-course-filter"
                                value={qInput}
                                onChange={(e) => {
                                    setQInput(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Filter assigned courses"
                                className="dashboard-field"
                            />
                            {effectiveCanManage && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAdding((s) => !s);
                                        setSearchQ('');
                                        setResults([]);
                                        setSearchError(false);
                                    }}
                                    className={
                                        adding
                                            ? 'dashboard-button-secondary'
                                            : 'dashboard-button-primary'
                                    }
                                    aria-expanded={adding}
                                    aria-controls="company-course-attach-panel"
                                >
                                    {adding ? 'Close add mode' : 'Add course'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {adding && effectiveCanManage && (
                    <div
                        id="company-course-attach-panel"
                        className="space-y-3 rounded-2xl border border-edubot-orange/40 bg-orange-50/60 p-4 dark:border-edubot-soft/40 dark:bg-orange-950/10"
                    >
                        <div>
                            <div className="font-medium text-edubot-ink dark:text-white">
                                Attach a new course
                            </div>
                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                This search finds courses that are not already attached to this
                                tenant.
                            </p>
                        </div>
                        <label htmlFor="company-course-attach-search" className="sr-only">
                            Search course to attach
                        </label>
                        <input
                            id="company-course-attach-search"
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            placeholder="Search course title to attach"
                            className="dashboard-field w-full"
                        />
                        {results.length ? (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-edubot-muted dark:text-slate-400">
                                <span>
                                    Showing up to {ATTACH_SEARCH_LIMIT} matching courses. Narrow the
                                    search for more precise assignment.
                                </span>
                                <span>{results.length} results</span>
                            </div>
                        ) : null}
                        {searching ? (
                            <div className="text-sm text-edubot-muted dark:text-slate-400">
                                Searching...
                            </div>
                        ) : searchError ? (
                            <EmptyState
                                variant="error"
                                title="Course search failed"
                                subtitle="Try the search again or refresh the tenant course list."
                                action={{
                                    label: 'Retry search',
                                    onClick: () => setSearchRetryKey((value) => value + 1),
                                }}
                            />
                        ) : results.length === 0 ? (
                            searchQ.trim() ? (
                                <EmptyState
                                    title="No courses found"
                                    subtitle="Try a different search term."
                                />
                            ) : (
                                <p className="text-sm text-edubot-muted dark:text-slate-400">
                                    Search for a course title to attach it to this tenant.
                                </p>
                            )
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-edubot-line/80 dark:border-slate-700">
                                <table className="min-w-[42rem] w-full text-left text-sm">
                                    <thead className="bg-white/70 text-xs uppercase tracking-wide text-edubot-muted dark:bg-slate-950 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Course</th>
                                            <th className="px-4 py-3 font-semibold">Instructor</th>
                                            <th className="px-4 py-3 font-semibold text-right">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                        {results.map((c) => {
                                            const courseTypeDisabled =
                                                !isCourseTypeAllowedForTenant(
                                                    effectiveCompany,
                                                    c.courseType
                                                );
                                            const disabled =
                                                attachingId === c.id || courseTypeDisabled;
                                            return (
                                                <tr
                                                    key={c.id}
                                                    className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-edubot-ink dark:text-white">
                                                            {c.title}
                                                        </div>
                                                        <CourseMeta
                                                            course={c}
                                                            restricted={courseTypeDisabled}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                        {c.instructor?.fullName || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => onAttach(c.id)}
                                                            disabled={disabled}
                                                            title={
                                                                courseTypeDisabled
                                                                    ? getCourseTypeTenantDisabledMessage(
                                                                          c.courseType
                                                                      )
                                                                    : undefined
                                                            }
                                                            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {attachingId === c.id
                                                                ? '...'
                                                                : courseTypeDisabled
                                                                  ? 'Disabled'
                                                                  : 'Attach'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <Loader fullScreen={false} />
                ) : loadError ? (
                    <EmptyState
                        variant="error"
                        title="Could not load tenant courses"
                        subtitle="The assignments list is unavailable. Retry before changing course links."
                        action={{ label: 'Retry', onClick: loadCompanyCourses }}
                    />
                ) : (
                    <>
                        {assignedCourses.length ? (
                            <div className="overflow-x-auto rounded-2xl border border-edubot-line/80 dark:border-slate-700">
                                <table className="min-w-[42rem] w-full text-left text-sm">
                                    <thead className="bg-edubot-surfaceAlt/70 text-xs uppercase tracking-wide text-edubot-muted dark:bg-slate-900 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Course</th>
                                            <th className="px-4 py-3 font-semibold">Instructor</th>
                                            <th className="px-4 py-3 font-semibold text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                        {assignedCourses.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-edubot-ink dark:text-white">
                                                        {c.title}
                                                    </div>
                                                    <CourseMeta course={c} />
                                                </td>
                                                <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                    {c.instructor?.fullName || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/courses/${c.id}`}
                                                            className="dashboard-button-secondary"
                                                        >
                                                            View
                                                        </Link>
                                                        {effectiveCanManage && (
                                                            <button
                                                                onClick={() => onDetach(c.id)}
                                                                disabled={detachingId === c.id}
                                                                className="dashboard-button-secondary text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {detachingId === c.id
                                                                    ? 'Detaching...'
                                                                    : 'Detach'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                title="No linked courses"
                                subtitle={
                                    effectiveCanManage
                                        ? 'Attach a course to make it available for this tenant.'
                                        : 'No courses are linked to this tenant yet.'
                                }
                            />
                        )}

                        {totalPages > 1 ? (
                            <nav
                                className="mt-4 flex flex-wrap items-center justify-center gap-2"
                                aria-label="Tenant course pages"
                            >
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page <= 1}
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
                                                    pageNumber === page ? 'page' : undefined
                                                }
                                                disabled={pageNumber === page}
                                                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                                    pageNumber === page
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
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page >= totalPages}
                                    className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        ) : null}
                    </>
                )}
            </div>
            <ConfirmationModal
                isOpen={Boolean(pendingDetachId)}
                onClose={() => setPendingDetachId(null)}
                onConfirm={confirmDetach}
                title="Detach course"
                message="Detach this course from the tenant? Current students may lose tenant-level access depending on backend policy."
                confirmLabel="Detach"
                cancelLabel="Cancel"
                confirmVariant="danger"
                loading={Boolean(detachingId)}
            />
        </DashboardInsetPanel>
    );
}

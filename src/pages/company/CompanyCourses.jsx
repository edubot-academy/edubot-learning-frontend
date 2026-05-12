/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '@shared/ui/Loader';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import {
    listCompanyCourses,
    fetchCourses,
    assignCourseToCompany, // ✅ rename from setCourseCompany for clarity
    unassignCourseFromCompany, // ✅ new
    // clearCourseCompany,           // ❌ no longer used here
} from '@services/api';
import { DashboardInsetPanel, EmptyState } from '@components/ui/dashboard';
import {
    getCourseTypeTenantDisabledMessage,
    isCourseTypeAllowedForTenant,
} from '@shared/utils/tenantFeatures';

export default function CompanyCourses({ company, companyId, canManage = true }) {
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
    const [detachingId, setDetachingId] = React.useState(null);
    const [pendingDetachId, setPendingDetachId] = React.useState(null);

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
    const onDetach = (courseId) => {
        setPendingDetachId(courseId);
    };

    const confirmDetach = async () => {
        if (!pendingDetachId) return;

        try {
            setDetachingId(pendingDetachId);
            await unassignCourseFromCompany(pendingDetachId, companyId); // ✅ pass both ids
            toast.success('Курс компаниядан ажыратылды.');
            setPendingDetachId(null);
            await loadCompanyCourses();
        } catch {
            toast.error('Ажыратууда ката кетти.');
        } finally {
            setDetachingId(null);
        }
    };

    // Attach this company to a course (many-to-many)
    const onAttach = async (courseId) => {
        const course = results.find((item) => item.id === courseId);
        if (course && !isCourseTypeAllowedForTenant(company, course.courseType)) {
            toast.error(getCourseTypeTenantDisabledMessage(course.courseType));
            return;
        }

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
        <DashboardInsetPanel
            title="Tenant courses"
            description="Attach and detach courses that are available in this tenant workspace."
        >
        <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm text-edubot-muted dark:text-slate-400">
                    Total linked courses: <b>{data.total}</b>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                        value={qInput}
                        onChange={(e) => setQInput(e.target.value)}
                        placeholder="Search courses"
                        className="dashboard-field"
                    />
                    {canManage && (
                        <button
                            onClick={() => {
                                setAdding((s) => !s);
                                setSearchQ('');
                                setResults([]);
                            }}
                            className="dashboard-button-primary"
                        >
                            {adding ? 'Close' : 'Add course'}
                        </button>
                    )}
                </div>
            </div>

            {adding && canManage && (
                <div className="space-y-3 rounded-2xl border border-edubot-line/80 bg-edubot-surfaceAlt/40 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="font-medium text-edubot-ink dark:text-white">Attach course</div>
                    <input
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        placeholder="Search by course title"
                        className="dashboard-field w-full"
                    />
                    {searching ? (
                        <div className="text-sm text-edubot-muted dark:text-slate-400">Searching...</div>
                    ) : results.length === 0 ? (
                        searchQ.trim() ? (
                            <EmptyState title="No courses found" subtitle="Try a different search term." />
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
                                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                            {results.map((c) => {
                                const courseTypeDisabled = !isCourseTypeAllowedForTenant(company, c.courseType);
                                const disabled = attachingId === c.id || courseTypeDisabled;
                                return (
                                    <tr
                                        key={c.id}
                                        className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900"
                                    >
                                        <td className="px-4 py-3 font-medium text-edubot-ink dark:text-white">{c.title}</td>
                                        <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">{c.instructor?.fullName || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => onAttach(c.id)}
                                                disabled={disabled}
                                                title={courseTypeDisabled ? getCourseTypeTenantDisabledMessage(c.courseType) : undefined}
                                                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {attachingId === c.id ? '...' : courseTypeDisabled ? 'Disabled' : 'Attach'}
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
            ) : (
                <>
                    {(data.items || []).length ? (
                        <div className="overflow-x-auto rounded-2xl border border-edubot-line/80 dark:border-slate-700">
                            <table className="min-w-[42rem] w-full text-left text-sm">
                                <thead className="bg-edubot-surfaceAlt/70 text-xs uppercase tracking-wide text-edubot-muted dark:bg-slate-900 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Course</th>
                                        <th className="px-4 py-3 font-semibold">Instructor</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                    {(data.items || []).map((c) => (
                                        <tr key={c.id} className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900">
                                            <td className="px-4 py-3 font-medium text-edubot-ink dark:text-white">{c.title}</td>
                                            <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">{c.instructor?.fullName || '-'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/courses/${c.id}`} className="dashboard-button-secondary">
                                                        View
                                                    </Link>
                                                    {canManage && (
                                                <button
                                                    onClick={() => onDetach(c.id)}
                                                    disabled={detachingId === c.id}
                                                    className="dashboard-button-secondary text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {detachingId === c.id ? 'Detaching...' : 'Detach'}
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
                        <EmptyState title="No linked courses" subtitle="Attach a course to make it available for this tenant." />
                    )}

                    <div className="flex gap-2 justify-center mt-4">
                        {Array.from({ length: data.totalPages || 1 }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                    p === page
                                        ? 'border-edubot-orange bg-edubot-orange text-white'
                                        : 'border-edubot-line bg-white text-edubot-ink hover:bg-edubot-surfaceAlt dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                                }`}
                                disabled={p === page}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
        <ConfirmationModal
            isOpen={Boolean(pendingDetachId)}
            onClose={() => setPendingDetachId(null)}
            onConfirm={confirmDetach}
            title="Detach course"
            message="Бул курсту ушул компаниядан ажыратасызбы?"
            confirmLabel="Detach"
            cancelLabel="Cancel"
            confirmVariant="danger"
            loading={Boolean(detachingId)}
        />
        </DashboardInsetPanel>
    );
}

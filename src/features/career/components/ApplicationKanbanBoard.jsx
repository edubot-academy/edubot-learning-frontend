import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_ROUTES } from '../constants/careerRoutes';

const KANBAN_COLUMNS = [
    { key: 'saved', title: 'Saved' },
    { key: 'applied', title: 'Applied' },
    { key: 'interview', title: 'Interview' },
    { key: 'offer', title: 'Offer' },
    { key: 'rejected', title: 'Rejected' },
];

const STATUS_OPTIONS = ['saved', 'applied', 'interview', 'offer', 'rejected'];

const STATUS_STYLES = {
    saved: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
    applied: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    interview: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
};

const formatStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const formatSalary = (job) => {
    if (!job?.salaryMin && !job?.salaryMax) return null;
    if (job.salaryMin && job.salaryMax) {
        return `$${Number(job.salaryMin).toLocaleString()}-$${Number(job.salaryMax).toLocaleString()}`;
    }
    return `From $${Number(job.salaryMin || job.salaryMax).toLocaleString()}`;
};

const ApplicationKanbanBoard = ({
    applications = [],
    jobsById,
    resumesById,
    coverLettersById,
    onFieldChange,
    onMove,
    onSave,
    readOnly = false,
    emptyMessage = 'No applications yet.',
}) => {
    const [draggedId, setDraggedId] = useState(null);
    const [hoveredColumn, setHoveredColumn] = useState(null);

    const columns = useMemo(
        () =>
            KANBAN_COLUMNS.map((column) => ({
                ...column,
                items: applications.filter((item) => item.status === column.key),
            })),
        [applications],
    );

    const handleDragStart = (applicationId) => {
        if (readOnly) return;
        setDraggedId(applicationId);
    };

    const handleDrop = (status) => {
        if (readOnly || !draggedId) return;
        onMove?.(draggedId, status);
        setDraggedId(null);
        setHoveredColumn(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setHoveredColumn(null);
    };

    return (
        <div className="grid gap-4 xl:grid-cols-5">
            {columns.map((column) => (
                <div
                    key={column.key}
                    onDragOver={(event) => {
                        if (readOnly) return;
                        event.preventDefault();
                        setHoveredColumn(column.key);
                    }}
                    onDragLeave={() => {
                        if (hoveredColumn === column.key) setHoveredColumn(null);
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        handleDrop(column.key);
                    }}
                    className={`rounded-2xl border bg-gray-50 dark:bg-white/[0.03] overflow-hidden transition-colors ${
                        hoveredColumn === column.key
                            ? 'border-[#E14219] dark:border-[#E14219]'
                            : 'border-gray-100 dark:border-white/10'
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 px-4 py-3">
                        <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">{column.title}</p>
                        <span className="rounded-full bg-white dark:bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#3E424A] dark:text-[#a6adba]">
                            {column.items.length}
                        </span>
                    </div>

                    <div className="space-y-3 p-3 min-h-[220px]">
                        {column.items.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 px-4 py-6 text-center text-xs text-[#3E424A] dark:text-[#a6adba]">
                                {readOnly ? emptyMessage : `Drag a card here to mark it as ${column.title.toLowerCase()}.`}
                            </div>
                        ) : (
                            column.items.map((application) => {
                                const job = jobsById.get(application.jobId);
                                const resume = resumesById.get(application.resumeId);
                                const coverLetter = coverLettersById.get(application.coverLetterId);
                                const salary = formatSalary(job);

                                return (
                                    <div
                                        key={application.id}
                                        draggable={!readOnly}
                                        onDragStart={() => handleDragStart(application.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 shadow-sm transition-opacity ${
                                            draggedId === application.id ? 'opacity-50' : 'opacity-100'
                                        } ${readOnly ? '' : 'cursor-grab active:cursor-grabbing'}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">
                                                    {job?.title || 'Job'}
                                                </p>
                                                <p className="mt-1 truncate text-xs text-[#3E424A] dark:text-[#a6adba]">
                                                    {job?.company || 'Unknown company'}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    STATUS_STYLES[application.status] || STATUS_STYLES.saved
                                                }`}
                                            >
                                                {formatStatusLabel(application.status)}
                                            </span>
                                        </div>

                                        {salary ? (
                                            <p className="mt-3 text-sm font-medium text-[#141619] dark:text-[#E8ECF3]">
                                                {salary}
                                            </p>
                                        ) : null}

                                        <p className="mt-2 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                            Resume: {resume?.name || 'None'}
                                            {coverLetter ? ` · CL ${coverLetter.id.slice(0, 8)}` : ''}
                                        </p>

                                        {application.appliedAt ? (
                                            <p className="mt-1 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                                Applied: {application.appliedAt}
                                            </p>
                                        ) : null}

                                        {!readOnly ? (
                                            <>
                                                <div className="mt-3 flex gap-2">
                                                    <select
                                                        value={application.status}
                                                        onChange={(event) =>
                                                            onFieldChange?.(application.id, 'status', event.target.value)
                                                        }
                                                        className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm"
                                                    >
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <option key={status} value={status}>
                                                                {formatStatusLabel(status)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSave?.(application)}
                                                        className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm font-medium text-[#E14219]"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={application.notes || ''}
                                                    onChange={(event) => onFieldChange?.(application.id, 'notes', event.target.value)}
                                                    rows={3}
                                                    placeholder="Notes"
                                                    className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm"
                                                />
                                            </>
                                        ) : application.notes ? (
                                            <p className="mt-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] px-3 py-2 text-xs text-[#3E424A] dark:text-[#a6adba]">
                                                {application.notes}
                                            </p>
                                        ) : null}

                                        <Link
                                            to={job?.jobId ? CAREER_ROUTES.JOB_DETAIL.replace(':jobId', job.jobId) : CAREER_ROUTES.JOBS}
                                            className="mt-3 inline-flex items-center text-xs font-medium text-[#E14219] hover:text-[#C2410C]"
                                        >
                                            Open job
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApplicationKanbanBoard;

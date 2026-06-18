import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    FiArrowLeft,
    FiCalendar,
    FiChevronDown,
    FiChevronUp,
    FiClock,
    FiDownload,
    FiMessageSquare,
    FiRotateCcw,
    FiSend,
    FiUser,
} from 'react-icons/fi';
import {
    addSubmissionComment,
    exportSessionHomeworkGradesCsv,
    fetchSessionHomeworkAttachmentBlob,
    fetchSessionHomeworkDetail,
    fetchSessionHomeworkReviewRoster,
    fetchSubmissionComments,
    reviewSessionHomeworkSubmission,
} from '@features/homework/api';
import { DashboardInsetPanel, EmptyState, StatusBadge } from '../components/ui/dashboard';
import Loader from '@shared/ui/Loader';
import { parseApiError } from '@shared/api/error';

const REVIEW_STATE_META = {
    pending_submission: { tone: 'default', filterKey: 'pending_submission' },
    missing: { tone: 'red', filterKey: 'missing' },
    needs_review: { tone: 'amber', filterKey: 'needs_review' },
    approved: { tone: 'green', filterKey: 'approved' },
    rejected: { tone: 'red', filterKey: 'rejected' },
    needs_revision: { tone: 'amber', filterKey: 'needs_revision' },
};

const formatDate = (value, fallback, language) => {
    if (!value) return fallback;
    const normalized = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T12:00:00`
        : value;
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(language || undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Header ──────────────────────────────────────────────────────────────────

function HomeworkDetailHeader({ homework, sessionId, homeworkId, onExport, exporting }) {
    const { t, i18n } = useTranslation();
    const statusKey = homework.isPublished ? 'live' : 'draft';

    return (
        <div className="dashboard-panel overflow-hidden p-6 md:p-8 mb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white md:text-3xl">
                            {homework.title}
                        </h1>
                        <StatusBadge tone={homework.isPublished ? 'green' : 'default'}>
                            {t(`instructorHomeworkDetail.header.${statusKey}`)}
                        </StatusBadge>
                    </div>
                    {homework.description && (
                        <p className="text-sm leading-6 text-edubot-muted dark:text-slate-400 max-w-2xl">
                            {homework.description}
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-edubot-muted dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                            <FiCalendar className="h-4 w-4 text-edubot-orange" />
                            {homework.dueAt
                                ? t('instructorHomeworkDetail.header.dueDate', {
                                    date: formatDate(homework.dueAt, '', i18n.language),
                                })
                                : t('instructorHomeworkDetail.header.noDueDate')}
                        </span>
                        {homework.maxScore !== null && homework.maxScore !== undefined && (
                            <span className="inline-flex items-center gap-1.5 font-mono">
                                {t('instructorHomeworkDetail.header.maxScore', { count: homework.maxScore })}
                            </span>
                        )}
                    </div>
                    {Array.isArray(homework.rubricCriteria) && homework.rubricCriteria.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-orange mr-1">
                                {t('instructorHomeworkDetail.header.rubric')}:
                            </span>
                            {homework.rubricCriteria.map((c) => (
                                <span
                                    key={c.name}
                                    className="rounded-full border border-edubot-line bg-white px-2.5 py-1 text-xs font-medium text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                    {c.name} · {c.maxPoints}pt
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onExport}
                    disabled={exporting}
                    className="dashboard-button-secondary inline-flex items-center gap-2 shrink-0"
                >
                    <FiDownload className="h-4 w-4" />
                    {t('instructorHomeworkDetail.header.exportCsv')}
                </button>
            </div>
        </div>
    );
}

// ─── Grading Panel ────────────────────────────────────────────────────────────

function GradingPanel({ entry, sessionId, homeworkId, maxScore, rubricCriteria, onDone }) {
    const { t } = useTranslation();
    const sub = entry.submission;
    const [score, setScore] = useState(sub?.score ?? '');
    const [comment, setComment] = useState(sub?.reviewComment ?? '');
    const [criteriaScores, setCriteriaScores] = useState(sub?.criteriaScores ?? {});
    const [submitting, setSubmitting] = useState(false);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    const [downloadingAttachment, setDownloadingAttachment] = useState(false);
    const commentListRef = useRef(null);

    useEffect(() => {
        if (!sub?.id) return;
        setCommentsLoading(true);
        fetchSubmissionComments(sessionId, homeworkId, sub.id)
            .then(setComments)
            .catch(() => setComments([]))
            .finally(() => setCommentsLoading(false));
    }, [sessionId, homeworkId, sub?.id]);

    useEffect(() => {
        if (commentListRef.current) {
            commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
        }
    }, [comments]);

    const handleReview = useCallback(async (status) => {
        if (!sub?.id) return;
        setSubmitting(true);
        try {
            await reviewSessionHomeworkSubmission(sessionId, homeworkId, sub.id, {
                status,
                score: score !== '' ? Number(score) : undefined,
                reviewComment: comment || undefined,
                criteriaScores: Object.keys(criteriaScores).length > 0 ? criteriaScores : undefined,
            });
            const key =
                status === 'approved'
                    ? 'approveSuccess'
                    : status === 'rejected'
                    ? 'rejectedSuccess'
                    : 'revisionSuccess';
            toast.success(t(`instructorHomeworkDetail.grading.${key}`));
            onDone();
        } catch (err) {
            toast.error(parseApiError(err, t('instructorHomeworkDetail.grading.reviewError')).message);
        } finally {
            setSubmitting(false);
        }
    }, [sessionId, homeworkId, sub?.id, score, comment, criteriaScores, t, onDone]);

    const handleSendComment = useCallback(async () => {
        if (!newComment.trim() || !sub?.id) return;
        setSendingComment(true);
        try {
            const created = await addSubmissionComment(sessionId, homeworkId, sub.id, newComment.trim());
            setComments((prev) => [...prev, created]);
            setNewComment('');
        } catch {
            toast.error(t('instructorHomeworkDetail.grading.commentError'));
        } finally {
            setSendingComment(false);
        }
    }, [sessionId, homeworkId, sub?.id, newComment, t]);

    const handleDownloadAttachment = useCallback(async () => {
        if (!sub?.id) return;
        setDownloadingAttachment(true);
        try {
            const { blob, contentType } = await fetchSessionHomeworkAttachmentBlob(sessionId, homeworkId, sub.id);
            const url = URL.createObjectURL(new Blob([blob], { type: contentType || blob?.type || '' }));
            const a = document.createElement('a');
            const rawName = String(sub.attachmentName || sub.fileName || sub.attachmentUrl || `submission-${sub.id}`);
            a.href = url;
            a.download = rawName.split('/').filter(Boolean).pop() || `submission-${sub.id}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            toast.error(t('instructorHomeworkDetail.grading.attachmentError'));
        } finally {
            setDownloadingAttachment(false);
        }
    }, [sessionId, homeworkId, sub?.id, sub?.attachmentName, sub?.fileName, sub?.attachmentUrl, t]);

    return (
        <div className="mt-4 space-y-5 rounded-2xl border border-edubot-line bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            {/* Answer text */}
            {sub?.answerText ? (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-orange">
                        {t('instructorHomeworkDetail.grading.answerTitle')}
                    </p>
                    <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-6 text-edubot-ink dark:bg-slate-800 dark:text-white whitespace-pre-wrap">
                        {sub.answerText}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-edubot-muted dark:text-slate-400">
                    {t('instructorHomeworkDetail.grading.noAnswer')}
                </p>
            )}

            {/* Attachment */}
            {sub?.attachmentUrl && (
                <button
                    type="button"
                    onClick={handleDownloadAttachment}
                    disabled={downloadingAttachment}
                    className="inline-flex items-center gap-2 text-sm font-medium text-edubot-orange underline-offset-4 hover:underline"
                >
                    <FiDownload className="h-4 w-4" />
                    {t('instructorHomeworkDetail.grading.attachment')}
                </button>
            )}

            {/* Rubric sliders */}
            {Array.isArray(rubricCriteria) && rubricCriteria.length > 0 && (
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-orange">
                        {t('instructorHomeworkDetail.grading.rubricTitle')}
                    </p>
                    <div className="space-y-3">
                        {rubricCriteria.map((c) => (
                            <div key={c.name}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-edubot-ink dark:text-white">{c.name}</span>
                                    <span className="text-sm font-mono text-edubot-muted dark:text-slate-400">
                                        {criteriaScores[c.name] ?? 0} / {c.maxPoints}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={c.maxPoints}
                                    step={1}
                                    value={criteriaScores[c.name] ?? 0}
                                    onChange={(e) =>
                                        setCriteriaScores((prev) => ({ ...prev, [c.name]: Number(e.target.value) }))
                                    }
                                    className="w-full accent-edubot-orange"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Score + Comment */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-edubot-orange">
                        {t('instructorHomeworkDetail.grading.score')}
                        {maxScore !== null && maxScore !== undefined && ` / ${maxScore}`}
                    </label>
                    <input
                        type="number"
                        min={0}
                        max={maxScore ?? undefined}
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="dashboard-field w-full"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-edubot-orange">
                        {t('instructorHomeworkDetail.grading.feedback')}
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        className="dashboard-field w-full resize-none"
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => handleReview('approved')}
                    disabled={submitting || !sub?.id}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                    {t('instructorHomeworkDetail.grading.approve')}
                </button>
                <button
                    type="button"
                    onClick={() => handleReview('needs_revision')}
                    disabled={submitting || !sub?.id}
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                >
                    <FiRotateCcw className="mr-1.5 inline h-3.5 w-3.5" />
                    {t('instructorHomeworkDetail.grading.revision')}
                </button>
                <button
                    type="button"
                    onClick={() => handleReview('rejected')}
                    disabled={submitting || !sub?.id}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                    {t('instructorHomeworkDetail.grading.reject')}
                </button>
            </div>

            {/* Comment thread */}
            {sub?.id && (
                <div>
                    <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-orange">
                        <FiMessageSquare className="h-3.5 w-3.5" />
                        {t('instructorHomeworkDetail.grading.commentsTitle')}
                    </p>
                    {commentsLoading ? (
                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                            {t('instructorHomeworkDetail.grading.loading')}
                        </p>
                    ) : (
                        <div
                            ref={commentListRef}
                            className="mb-3 max-h-40 space-y-2 overflow-y-auto"
                        >
                            {comments.length === 0 ? (
                                <p className="text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorHomeworkDetail.grading.noComments')}
                                </p>
                            ) : (
                                comments.map((c) => (
                                    <div
                                        key={c.id}
                                        className="rounded-xl border border-edubot-line bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        <p className="text-edubot-ink dark:text-white">{c.body}</p>
                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-500">
                                            {new Date(c.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                            placeholder={t('instructorHomeworkDetail.grading.commentPlaceholder')}
                            className="dashboard-field flex-1"
                        />
                        <button
                            type="button"
                            onClick={handleSendComment}
                            disabled={!newComment.trim() || sendingComment}
                            className="dashboard-button-secondary inline-flex items-center gap-1.5 shrink-0"
                        >
                            <FiSend className="h-4 w-4" />
                            {t('instructorHomeworkDetail.grading.send')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Roster Row ───────────────────────────────────────────────────────────────

function RosterRow({ entry, sessionId, homeworkId, maxScore, rubricCriteria, onGraded }) {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const meta = REVIEW_STATE_META[entry.reviewState] || REVIEW_STATE_META.pending_submission;

    const handleDone = useCallback(() => {
        setOpen(false);
        onGraded();
    }, [onGraded]);

    return (
        <div className="dashboard-panel-muted rounded-3xl p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <FiUser className="h-4 w-4 shrink-0 text-edubot-orange" />
                        <span className="font-semibold text-edubot-ink dark:text-white">
                            {entry.fullName || entry.email || `Student #${entry.studentId}`}
                        </span>
                        {entry.email && entry.fullName && (
                            <span className="text-xs text-edubot-muted dark:text-slate-400">{entry.email}</span>
                        )}
                        {entry.isLate && (
                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                                {t('instructorHomeworkDetail.roster.late')}
                            </span>
                        )}
                        <StatusBadge tone={meta.tone}>
                            {t(`instructorHomeworkDetail.filters.${entry.reviewState}`)}
                        </StatusBadge>
                    </div>
                    {entry.submission?.score !== null && entry.submission?.score !== undefined && (
                        <p className="mt-1 text-xs font-mono text-edubot-muted dark:text-slate-400">
                            {t('instructorHomeworkDetail.roster.score', {
                                score: entry.submission.score,
                                max: maxScore ?? '—',
                            })}
                        </p>
                    )}
                    {entry.deadline && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-edubot-muted dark:text-slate-400">
                            <FiClock className="h-3.5 w-3.5" />
                            {formatDate(entry.deadline, '', i18n.language)}
                        </p>
                    )}
                </div>
                {entry.hasSubmission && (
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="dashboard-button-secondary inline-flex shrink-0 items-center gap-1.5"
                    >
                        {open
                            ? <><FiChevronUp className="h-4 w-4" />{t('instructorHomeworkDetail.roster.closeGrading')}</>
                            : <><FiChevronDown className="h-4 w-4" />{t('instructorHomeworkDetail.roster.openGrading')}</>
                        }
                    </button>
                )}
            </div>

            {open && (
                <GradingPanel
                    entry={entry}
                    sessionId={sessionId}
                    homeworkId={homeworkId}
                    maxScore={maxScore}
                    rubricCriteria={rubricCriteria}
                    onDone={handleDone}
                />
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ALL_FILTER = 'all';
const STATE_FILTERS = ['all', 'pending_submission', 'missing', 'needs_review', 'approved', 'rejected', 'needs_revision'];

const InstructorHomeworkDetail = () => {
    const { t } = useTranslation();
    const { sessionId, homeworkId } = useParams();

    const [homework, setHomework] = useState(null);
    const [roster, setRoster] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stateFilter, setStateFilter] = useState(ALL_FILTER);
    const [exporting, setExporting] = useState(false);
    const [rosterVersion, setRosterVersion] = useState(0);

    const loadData = useCallback(async () => {
        if (!sessionId || !homeworkId) return;
        setLoading(true);
        try {
            const [hwData, rosterData] = await Promise.all([
                fetchSessionHomeworkDetail(sessionId, homeworkId),
                fetchSessionHomeworkReviewRoster(sessionId, homeworkId),
            ]);
            setHomework(hwData);
            setRoster(Array.isArray(rosterData?.items) ? rosterData.items : []);
            setSummary(rosterData?.summary ?? null);
        } catch (err) {
            toast.error(parseApiError(err, t('instructorHomeworkDetail.errors.load')).message);
        } finally {
            setLoading(false);
        }
    }, [sessionId, homeworkId, t]);

    useEffect(() => { loadData(); }, [loadData, rosterVersion]);

    const handleGraded = useCallback(() => setRosterVersion((v) => v + 1), []);

    const handleExport = useCallback(async () => {
        if (!sessionId || !homeworkId) return;
        setExporting(true);
        try {
            const { blob, contentType } = await exportSessionHomeworkGradesCsv(sessionId, homeworkId);
            const url = URL.createObjectURL(new Blob([blob], { type: contentType }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `homework-${homeworkId}-grades.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error(t('instructorHomeworkDetail.header.exportError'));
        } finally {
            setExporting(false);
        }
    }, [sessionId, homeworkId, t]);

    const filtered = useMemo(() => {
        if (stateFilter === ALL_FILTER) return roster;
        return roster.filter((r) => r.reviewState === stateFilter);
    }, [roster, stateFilter]);

    const filterCount = useCallback((key) => {
        if (key === ALL_FILTER) return roster.length;
        return roster.filter((r) => r.reviewState === key).length;
    }, [roster]);

    if (loading) return <Loader fullScreen={false} />;

    return (
        <div className="pt-24 p-4 md:p-6 max-w-7xl mx-auto space-y-5">
            {/* Back link */}
            <Link
                to="/instructor"
                className="inline-flex items-center gap-1.5 text-sm text-edubot-muted hover:text-edubot-ink dark:text-slate-400 dark:hover:text-white transition-colors"
            >
                <FiArrowLeft className="h-4 w-4" />
                {t('instructorHomeworkDetail.back')}
            </Link>

            {/* Header */}
            {homework && (
                <HomeworkDetailHeader
                    homework={homework}
                    sessionId={sessionId}
                    homeworkId={homeworkId}
                    onExport={handleExport}
                    exporting={exporting}
                />
            )}

            {/* Summary stats */}
            {summary && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {[
                        { key: 'total', value: summary.total },
                        { key: 'toReview', value: summary.needsReview },
                        { key: 'approved', value: summary.approved },
                        { key: 'rejected', value: summary.rejected },
                        { key: 'needsRevision', value: summary.needsRevision },
                        { key: 'missing', value: summary.missing },
                    ].map((s) => (
                        <div key={s.key} className="dashboard-panel-muted rounded-2xl p-3 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-edubot-muted dark:text-slate-400">
                                {t(`instructorHomeworkDetail.stats.${s.key}`)}
                            </p>
                            <p className="mt-1 text-2xl font-semibold font-mono text-edubot-ink dark:text-white">
                                {s.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter tabs + roster */}
            <DashboardInsetPanel
                title={t('instructorHomeworkDetail.roster.title')}
                description={t('instructorHomeworkDetail.roster.description')}
                action={
                    <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {filtered.length}
                    </span>
                }
            >
                <div className="mt-3 flex flex-wrap gap-2 mb-4">
                    {STATE_FILTERS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setStateFilter(key)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                                stateFilter === key
                                    ? 'bg-edubot-orange text-white border-edubot-orange'
                                    : 'border-edubot-line bg-white text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                        >
                            {t(`instructorHomeworkDetail.filters.${key}`)}
                            <span className="ml-1.5 opacity-70">{filterCount(key)}</span>
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        title={t('instructorHomeworkDetail.roster.noStudents')}
                        subtitle={t('instructorHomeworkDetail.roster.noStudentsSubtitle')}
                        className="py-8"
                    />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((entry) => (
                            <RosterRow
                                key={entry.studentId}
                                entry={entry}
                                sessionId={Number(sessionId)}
                                homeworkId={Number(homeworkId)}
                                maxScore={homework?.maxScore ?? null}
                                rubricCriteria={homework?.rubricCriteria ?? null}
                                onGraded={handleGraded}
                            />
                        ))}
                    </div>
                )}
            </DashboardInsetPanel>
        </div>
    );
};

export default InstructorHomeworkDetail;

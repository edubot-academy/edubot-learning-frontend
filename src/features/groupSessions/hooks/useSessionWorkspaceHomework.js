import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    createSessionHomework,
    deleteSessionHomework,
    fetchSessionHomework,
    fetchSessionHomeworkReviewRoster,
    reviewSessionHomeworkSubmission,
    updateSessionHomework,
} from '@services/api';
import {
    getWorkspaceErrorMessage,
    getWorkspaceErrorStatusMessages,
    resolveHomeworkDeadline,
    toArray,
} from '@features/groupSessions/utils/sessionWorkspace.helpers';

const getHomeworkDeadlineMeta = (item, nowMs, t) => {
    const raw = resolveHomeworkDeadline(item);
    if (!raw) {
        return {
            label: t('groupSessions.workspace.homework.deadlineStates.noDeadline'),
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
            sortValue: Number.MAX_SAFE_INTEGER,
            key: 'noDeadline',
        };
    }

    const normalized = typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T23:59:59` : raw;
    const deadlineMs = new Date(normalized).getTime();
    if (Number.isNaN(deadlineMs)) {
        return {
            label: t('groupSessions.workspace.homework.deadlineStates.unknown'),
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
            sortValue: Number.MAX_SAFE_INTEGER - 1,
            key: 'unknown',
        };
    }

    const daysLeft = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
    if (deadlineMs < nowMs) {
        return {
            label: t('groupSessions.workspace.homework.deadlineStates.overdue'),
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
            sortValue: deadlineMs,
            key: 'overdue',
        };
    }
    if (daysLeft <= 3) {
        return {
            label: t('groupSessions.workspace.homework.deadlineStates.dueSoon'),
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
            sortValue: deadlineMs,
            key: 'dueSoon',
        };
    }

    return {
        label: t('groupSessions.workspace.homework.deadlineStates.active'),
        badgeClass:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        sortValue: deadlineMs,
        key: 'active',
    };
};

export const useSessionWorkspaceHomework = ({
    nowMs,
    pendingRouteSelectionRef,
    selectedSessionId,
    students,
    onRefreshInsights,
}) => {
    const { t } = useTranslation();
    const workspaceErrorStatusMessages = useMemo(() => getWorkspaceErrorStatusMessages(t), [t]);
    const [publishedHomework, setPublishedHomework] = useState([]);
    const [homeworkLoadedSessionId, setHomeworkLoadedSessionId] = useState('');
    const [loadingHomework, setLoadingHomework] = useState(false);
    const [savingHomework, setSavingHomework] = useState(false);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState('');
    const [homeworkSubmissions, setHomeworkSubmissions] = useState([]);
    const [loadingHomeworkSubmissions, setLoadingHomeworkSubmissions] = useState(false);
    const [reviewingSubmissionId, setReviewingSubmissionId] = useState('');
    const [updatingHomework, setUpdatingHomework] = useState(false);
    const [homeworkQuery, setHomeworkQuery] = useState('');
    const [homeworkFilter, setHomeworkFilter] = useState('all');

    const refreshHomeworkList = async () => {
        const refreshed = await fetchSessionHomework(Number(selectedSessionId), { includeUnpublished: true });
        const items = toArray(refreshed);
        setPublishedHomework(items);
        setHomeworkLoadedSessionId(String(selectedSessionId));
        setSelectedHomeworkId((prev) => {
            if (prev && items.some((item) => String(item.id) === String(prev))) return prev;
            return items[0]?.id ? String(items[0].id) : '';
        });
        return items;
    };

    useEffect(() => {
        setSelectedHomeworkId('');
        setHomeworkSubmissions([]);
        setPublishedHomework([]);
        setHomeworkLoadedSessionId('');

        if (!selectedSessionId) {
            return undefined;
        }

        let cancelled = false;
        const loadSessionHomework = async () => {
            setLoadingHomework(true);
            try {
                const response = await fetchSessionHomework(Number(selectedSessionId), { includeUnpublished: true });
                if (cancelled) return;
                const items = toArray(response);
                setPublishedHomework(items);
                setHomeworkLoadedSessionId(String(selectedSessionId));
                setSelectedHomeworkId((prev) => {
                    const pendingHomeworkId = pendingRouteSelectionRef.current.homeworkId;
                    if (
                        pendingHomeworkId &&
                        items.some((item) => String(item.id) === String(pendingHomeworkId))
                    ) {
                        pendingRouteSelectionRef.current.homeworkId = '';
                        return String(pendingHomeworkId);
                    }
                    if (prev && items.some((item) => String(item.id) === String(prev))) return prev;
                    return items[0]?.id ? String(items[0].id) : '';
                });
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.homework.toasts.loadError'), workspaceErrorStatusMessages));
                setPublishedHomework([]);
                setHomeworkLoadedSessionId('');
                setSelectedHomeworkId('');
            } finally {
                if (!cancelled) setLoadingHomework(false);
            }
        };

        loadSessionHomework();
        return () => {
            cancelled = true;
        };
    }, [pendingRouteSelectionRef, selectedSessionId, t, workspaceErrorStatusMessages]);

    const selectedHomework = useMemo(
        () =>
            publishedHomework.find((item) => String(item.id) === String(selectedHomeworkId)) || null,
        [publishedHomework, selectedHomeworkId]
    );

    useEffect(() => {
        if (
            !selectedSessionId ||
            homeworkLoadedSessionId !== String(selectedSessionId) ||
            !selectedHomework
        ) {
            setHomeworkSubmissions([]);
            return undefined;
        }

        let cancelled = false;
        const loadReviewRoster = async () => {
            setLoadingHomeworkSubmissions(true);
            try {
                const response = await fetchSessionHomeworkReviewRoster(
                    Number(selectedSessionId),
                    Number(selectedHomework.id)
                );
                if (cancelled) return;
                setHomeworkSubmissions(toArray(response?.items));
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.homework.toasts.reviewRosterLoadError'), workspaceErrorStatusMessages));
                setHomeworkSubmissions([]);
            } finally {
                if (!cancelled) setLoadingHomeworkSubmissions(false);
            }
        };

        loadReviewRoster();
        return () => {
            cancelled = true;
        };
    }, [homeworkLoadedSessionId, selectedHomework, selectedSessionId, t, workspaceErrorStatusMessages]);

    const homeworkCards = useMemo(
        () =>
            publishedHomework
                .map((item) => ({
                    ...item,
                    deadlineMeta: getHomeworkDeadlineMeta(item, nowMs, t),
                }))
                .sort((a, b) => a.deadlineMeta.sortValue - b.deadlineMeta.sortValue),
        [publishedHomework, nowMs, t]
    );

    const filteredHomework = useMemo(() => {
        const query = homeworkQuery.trim().toLowerCase();
        return homeworkCards.filter((item) => {
            const matchesQuery =
                !query ||
                [item.title, item.name, item.description]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));
            const matchesFilter = homeworkFilter === 'all' || item.deadlineMeta.key === homeworkFilter;
            return matchesQuery && matchesFilter;
        });
    }, [homeworkCards, homeworkFilter, homeworkQuery]);

    const homeworkStats = useMemo(() => {
        const overdue = homeworkCards.filter((item) => item.deadlineMeta.key === 'overdue').length;
        const dueSoon = homeworkCards.filter((item) => item.deadlineMeta.key === 'dueSoon').length;
        const open = homeworkCards.filter((item) =>
            ['active', 'dueSoon', 'noDeadline', 'unknown'].includes(item.deadlineMeta.key)
        ).length;
        return {
            total: homeworkCards.length,
            open,
            dueSoon,
            overdue,
        };
    }, [homeworkCards]);

    const selectedHomeworkMeta = useMemo(
        () => (selectedHomework ? getHomeworkDeadlineMeta(selectedHomework, nowMs, t) : null),
        [selectedHomework, nowMs, t]
    );

    const submissionStats = useMemo(() => {
        const approved = homeworkSubmissions.filter((item) => item.reviewState === 'approved').length;
        const rejected = homeworkSubmissions.filter((item) => item.reviewState === 'rejected').length;
        const needsRevision = homeworkSubmissions.filter(
            (item) => item.reviewState === 'needs_revision'
        ).length;
        const missing = homeworkSubmissions.filter((item) => item.reviewState === 'missing').length;
        const needsReview = homeworkSubmissions.filter(
            (item) => item.reviewState === 'needs_review'
        ).length;
        const pendingSubmission = homeworkSubmissions.filter(
            (item) => item.reviewState === 'pending_submission'
        ).length;
        const late = homeworkSubmissions.filter((item) => Boolean(item.isLate)).length;
        return {
            total: homeworkSubmissions.length,
            approved,
            rejected,
            needsRevision,
            missing,
            needsReview,
            pendingSubmission,
            late,
        };
    }, [homeworkSubmissions]);

    const publishHomework = async (homework = {}) => {
        const title = String(homework.title || '').trim();
        const description = String(homework.description || '').trim();

        if (!title) {
            toast.error(t('groupSessions.workspace.homework.validation.titleRequired'));
            return false;
        }
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.homework.validation.selectSessionFirst'));
            return false;
        }

        const assignedStudentIds = students.map((student) => student.id);
        setSavingHomework(true);
        try {
            await createSessionHomework(Number(selectedSessionId), {
                title,
                description: description || undefined,
                deadline: homework.deadline || undefined,
                isPublished: homework.isPublished ?? true,
                assignedStudentIds,
            });

            await refreshHomeworkList();
            await onRefreshInsights?.();
            toast.success(t('groupSessions.workspace.homework.toasts.published'));
            return true;
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.homework.toasts.publishError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setSavingHomework(false);
        }
    };

    const updateHomework = async (homeworkId, updates) => {
        if (!selectedSessionId) return false;

        setUpdatingHomework(true);
        try {
            await updateSessionHomework(Number(selectedSessionId), Number(homeworkId), updates);
            await refreshHomeworkList();
            await onRefreshInsights?.();
            return true;
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.homework.toasts.updateError'), workspaceErrorStatusMessages));
            throw error;
        } finally {
            setUpdatingHomework(false);
        }
    };

    const reviewHomeworkSubmission = async (submissionId, status, reviewComment = '', score = null) => {
        if (!selectedSessionId || !selectedHomeworkId || !submissionId) return false;
        setReviewingSubmissionId(String(submissionId));
        try {
            const scoreValue = score !== null && score !== '' && !Number.isNaN(Number(score))
                ? Number(score)
                : undefined;
            await reviewSessionHomeworkSubmission(
                Number(selectedSessionId),
                Number(selectedHomeworkId),
                Number(submissionId),
                {
                    status,
                    reviewComment: String(reviewComment || '').trim() || undefined,
                    ...(scoreValue !== undefined ? { score: scoreValue } : {}),
                }
            );
            const refreshed = await fetchSessionHomeworkReviewRoster(
                Number(selectedSessionId),
                Number(selectedHomeworkId)
            );
            setHomeworkSubmissions(toArray(refreshed?.items));
            await onRefreshInsights?.();
            toast.success(t('groupSessions.workspace.homework.toasts.reviewUpdated'));
            return true;
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.homework.toasts.reviewError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setReviewingSubmissionId('');
        }
    };

    const toggleHomeworkPublish = async (homeworkId, currentStatus) => {
        if (!selectedSessionId || !homeworkId) return false;

        try {
            await updateSessionHomework(Number(selectedSessionId), Number(homeworkId), {
                isPublished: !currentStatus,
            });

            await refreshHomeworkList();
            await onRefreshInsights?.();
            toast.success(!currentStatus
                ? t('groupSessions.workspace.homework.toasts.published')
                : t('groupSessions.workspace.homework.toasts.unpublished'));
            return true;
        } catch (error) {
            console.error(error);
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.homework.toasts.statusError'), workspaceErrorStatusMessages));
            return false;
        }
    };

    const removeHomework = async (sessionId, homeworkId) => {
        if (!sessionId || !homeworkId) return false;

        await deleteSessionHomework(sessionId, homeworkId);
        if (String(sessionId) === String(selectedSessionId)) {
            await refreshHomeworkList();
            await onRefreshInsights?.();
        }
        return true;
    };

    return {
        deleteSessionHomework: removeHomework,
        filteredHomework,
        homeworkFilter,
        homeworkQuery,
        homeworkStats,
        homeworkSubmissions,
        loadingHomework,
        loadingHomeworkSubmissions,
        publishHomework,
        publishedHomework,
        reviewHomeworkSubmission,
        reviewingSubmissionId,
        savingHomework,
        selectedHomework,
        selectedHomeworkId,
        selectedHomeworkMeta,
        setHomeworkFilter,
        setHomeworkQuery,
        setSelectedHomeworkId,
        submissionStats,
        toggleHomeworkPublish,
        updatingHomework,
        updateHomework,
    };
};

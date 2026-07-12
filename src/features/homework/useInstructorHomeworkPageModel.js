import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchCourseGroups } from '@features/courseGroups/api';
import { fetchInstructorCourses } from '@features/courses/api/instructorCourses';
import { fetchHomework, fetchHomeworkSummary } from '@features/homework/api';
import {
    isCourseFeatureEnabled,
    TENANT_FEATURES,
} from '@shared/utils/tenantFeatures';
import { getDashboardPath } from '@shared/utils/navigation';
import { parseApiError } from '@shared/api/error';
import { toArray } from '@shared/api/response';

export const HOMEWORK_QUEUE_FILTERS = [
    'all',
    'needsReview',
    'missing',
    'needsRevision',
    'late',
    'draft',
    'active',
    'dueSoon',
    'overdue',
    'checked',
    'noDeadline',
];

export const getHomeworkErrorMessage = (error, fallback, t) => {
    const status = error?.response?.status;
    if (status === 401) return t('instructorHomework.errors.unauthorized');
    if (status === 403) return t('instructorHomework.errors.forbidden');
    return parseApiError(error, fallback).message;
};

export const formatDisplayDate = (value, fallback, language) => {
    if (!value) return fallback;
    const normalized =
        typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString(language || undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const getHomeworkStateMeta = (item, t) => {
    const queue = item?.queue || {};
    if (!item?.isPublished) {
        return {
            key: 'draft',
            label: t('instructorHomework.states.draft'),
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }
    if (Number(queue.needsReviewCount || 0) > 0) {
        return {
            key: 'needsReview',
            label: t('instructorHomework.states.needsReview'),
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (Number(queue.missingCount || 0) > 0) {
        return {
            key: 'missing',
            label: t('instructorHomework.states.missing'),
            tone: 'red',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        return {
            key: 'needsRevision',
            label: t('instructorHomework.states.needsRevision'),
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }

    const status = String(item?.status || '').toLowerCase();
    const rawDeadline = item?.deadline || item?.dueAt || item?.dueDate;

    if (['completed', 'approved', 'reviewed', 'checked'].includes(status)) {
        return {
            key: 'checked',
            label: t('instructorHomework.states.checked'),
            tone: 'green',
            badgeClass:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }

    if (!rawDeadline) {
        return {
            key: 'noDeadline',
            label: t('instructorHomework.states.noDeadline'),
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }

    const normalized =
        typeof rawDeadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDeadline)
            ? `${rawDeadline}T23:59:59`
            : rawDeadline;
    const deadlineMs = new Date(normalized).getTime();
    if (Number.isNaN(deadlineMs)) {
        return {
            key: 'unknown',
            label: t('instructorHomework.states.unknown'),
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }

    const nowMs = Date.now();
    if (deadlineMs < nowMs) {
        return {
            key: 'overdue',
            label: t('instructorHomework.states.overdue'),
            tone: 'red',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }

    const daysLeft = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
        return {
            key: 'dueSoon',
            label: t('instructorHomework.states.dueSoon'),
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }

    return {
        key: 'active',
        label: t('instructorHomework.states.active'),
        tone: 'blue',
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    };
};

export const getHomeworkQueueBadges = (item, t) => {
    const queue = item?.queue || {};
    const badges = [];

    if (!item?.isPublished) {
        badges.push({
            key: 'draft',
            label: t('instructorHomework.states.draft'),
            className:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        });
        return badges;
    }

    if (Number(queue.needsReviewCount || 0) > 0) {
        badges.push({
            key: 'needs_review',
            label: t('instructorHomework.states.needsReview'),
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        });
    }
    if (Number(queue.missingCount || 0) > 0) {
        badges.push({
            key: 'missing',
            label: t('instructorHomework.states.missing'),
            className:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        });
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        badges.push({
            key: 'needs_revision',
            label: t('instructorHomework.states.needsRevision'),
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        });
    }
    if (Number(queue.lateCount || 0) > 0) {
        badges.push({
            key: 'late',
            label: t('instructorHomework.states.late'),
            className:
                'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
        });
    }

    if (!badges.length) {
        const stateMeta = getHomeworkStateMeta(item, t);
        badges.push({
            key: 'state',
            label: stateMeta.label,
            className: stateMeta.badgeClass,
        });
    }

    return badges;
};

export const buildSessionHomeworkPath = (item) => {
    const courseId = item?.courseId || item?.session?.group?.course?.id;
    const groupId = item?.groupId || item?.session?.group?.id;
    const sessionId = item?.sessionId || item?.session?.id;
    const homeworkId = item?.id;
    return getDashboardPath('instructor', 'sessions', {
        workspaceTab: 'homework',
        courseId,
        groupId,
        sessionId,
        homeworkId,
    });
};

export const buildHomeworkDetailPath = (item) => {
    const sessionId = item?.sessionId || item?.session?.id;
    const homeworkId = item?.id;
    if (!sessionId || !homeworkId) return null;
    return `/instructor/sessions/${sessionId}/homework/${homeworkId}`;
};

export const getQueuePriority = (item) => {
    const queue = item?.queue || {};
    if (Number(queue.needsReviewCount || 0) > 0) return 0;
    if (Number(queue.missingCount || 0) > 0) return 1;
    if (Number(queue.needsRevisionCount || 0) > 0) return 2;
    if (Number(queue.lateCount || 0) > 0) return 3;
    return 4;
};

export const getQueueAction = (item, t) => {
    const queue = item?.queue || {};
    if (Number(queue.needsReviewCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.needsReview.label'),
            description: t('instructorHomework.queueActions.needsReview.description', { count: queue.needsReviewCount }),
            tone: 'amber',
        };
    }
    if (Number(queue.missingCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.missing.label'),
            description: t('instructorHomework.queueActions.missing.description', { count: queue.missingCount }),
            tone: 'red',
        };
    }
    if (Number(queue.needsRevisionCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.needsRevision.label'),
            description: t('instructorHomework.queueActions.needsRevision.description', { count: queue.needsRevisionCount }),
            tone: 'amber',
        };
    }
    if (Number(queue.lateCount || 0) > 0) {
        return {
            label: t('instructorHomework.queueActions.late.label'),
            description: t('instructorHomework.queueActions.late.description', { count: queue.lateCount }),
            tone: 'amber',
        };
    }
    return {
        label: t('instructorHomework.queueActions.default.label'),
        description: t('instructorHomework.queueActions.default.description'),
        tone: 'default',
    };
};

export const matchesHomeworkQueueFilter = (item, filter) => {
    if (filter === 'all') return true;
    const queue = item?.queue || {};
    if (filter === 'needsReview') return Number(queue.needsReviewCount || 0) > 0;
    if (filter === 'missing') return Number(queue.missingCount || 0) > 0;
    if (filter === 'needsRevision') return Number(queue.needsRevisionCount || 0) > 0;
    if (filter === 'late') return Number(queue.lateCount || 0) > 0;
    return item.stateMeta.key === filter;
};

export const useInstructorHomeworkPageModel = ({ user, t }) => {
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [limit, setLimit] = useState(20);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [summary, setSummary] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        const loadCourses = async () => {
            const response = await fetchInstructorCourses({ status: 'all' });
            setCourses(
                toArray(response?.courses || response).filter((course) =>
                    isCourseFeatureEnabled(course, TENANT_FEATURES.HOMEWORK)
                )
            );
        };
        loadCourses().catch((error) => {
            const message = getHomeworkErrorMessage(error, t('instructorHomework.errors.coursesLoad'), t);
            setCourses([]);
            setLoadError(message);
            toast.error(message);
        });
    }, [t, user]);

    useEffect(() => {
        if (!courseId) {
            setGroups([]);
            setGroupId('');
            return;
        }
        const loadGroups = async () => {
            const response = await fetchCourseGroups({ courseId: Number(courseId) });
            setGroups(toArray(response));
        };
        loadGroups().catch((error) => {
            const message = getHomeworkErrorMessage(error, t('instructorHomework.errors.groupsLoad'), t);
            setGroups([]);
            setLoadError(message);
            toast.error(message);
        });
    }, [courseId, t]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [summaryRes, homeworkRes] = await Promise.all([
                    fetchHomeworkSummary({
                        courseId: courseId || undefined,
                        groupId: groupId || undefined,
                    }),
                    fetchHomework({
                        courseId: courseId || undefined,
                        groupId: groupId || undefined,
                        limit,
                    }),
                ]);
                setSummary(summaryRes || null);
                setItems(toArray(homeworkRes));
                setLoadError('');
            } finally {
                setLoading(false);
            }
        };
        load().catch((error) => {
            const message = getHomeworkErrorMessage(error, t('instructorHomework.errors.homeworkLoad'), t);
            setSummary(null);
            setItems([]);
            setLoadError(message);
            toast.error(message);
        });
    }, [courseId, groupId, limit, t]);

    const courseById = useMemo(
        () => new Map(courses.map((course) => [String(course.id), course])),
        [courses]
    );

    const enrichedItems = useMemo(
        () =>
            items
                .filter((item) => {
                    const homeworkCourse =
                        item.course ||
                        courseById.get(String(item.courseId || item.session?.group?.course?.id || ''));
                    return isCourseFeatureEnabled(homeworkCourse, TENANT_FEATURES.HOMEWORK);
                })
                .map((item) => ({
                    ...item,
                    stateMeta: getHomeworkStateMeta(item, t),
                })),
        [courseById, items, t]
    );

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return enrichedItems.filter((item) => {
            const matchesQuery =
                !normalizedQuery ||
                [
                    item.title,
                    item.name,
                    item.courseTitle,
                    item.course?.title,
                    item.groupName,
                    item.group?.name,
                    item.sessionTitle,
                    item.session?.title,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
            const matchesState = matchesHomeworkQueueFilter(item, statusFilter);
            return matchesQuery && matchesState;
        }).sort((left, right) => {
            const priorityDiff = getQueuePriority(left) - getQueuePriority(right);
            if (priorityDiff !== 0) return priorityDiff;
            const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Number.POSITIVE_INFINITY;
            const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Number.POSITIVE_INFINITY;
            return leftDeadline - rightDeadline;
        });
    }, [enrichedItems, query, statusFilter]);

    const stats = useMemo(
        () => ({
            total: summary?.total ?? items.length,
            actionRequired: summary?.actionRequired ?? 0,
            needsReview: summary?.needsReview ?? 0,
            missing: summary?.missing ?? 0,
            needsRevision: summary?.needsRevision ?? 0,
            overdue: summary?.overdue ?? enrichedItems.filter((item) => item.stateMeta.key === 'overdue').length,
        }),
        [summary, items.length, enrichedItems]
    );

    const nextActionItems = useMemo(
        () => filteredItems.filter((item) => getQueuePriority(item) < 4).slice(0, 3),
        [filteredItems]
    );

    const applyQueueFilter = (nextFilter) => {
        setStatusFilter((current) => (current === nextFilter ? 'all' : nextFilter));
    };

    return {
        applyQueueFilter,
        courseId,
        courses,
        filteredItems,
        groupId,
        groups,
        limit,
        loadError,
        loading,
        nextActionItems,
        query,
        setCourseId,
        setGroupId,
        setLimit,
        setQuery,
        setStatusFilter,
        stats,
        statusFilter,
    };
};

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    buildHomeworkDetailPath,
    buildSessionHomeworkPath,
    getHomeworkQueueBadges,
    getHomeworkStateMeta,
    getQueueAction,
    getQueuePriority,
    matchesHomeworkQueueFilter,
} from './useInstructorHomeworkPageModel';

const t = (key, params = {}) => {
    if (params.count !== undefined) {
        return `${key}:${params.count}`;
    }
    return key;
};

describe('instructor homework page model helpers', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-12T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('classifies homework state by publication, queue, review status, and deadline', () => {
        expect(getHomeworkStateMeta({ isPublished: false }, t).key).toBe('draft');
        expect(
            getHomeworkStateMeta({
                isPublished: true,
                queue: { needsReviewCount: 1 },
            }, t).key
        ).toBe('needsReview');
        expect(getHomeworkStateMeta({ isPublished: true, status: 'checked' }, t).key).toBe('checked');
        expect(getHomeworkStateMeta({ isPublished: true, deadline: '2026-07-10' }, t).key).toBe('overdue');
        expect(getHomeworkStateMeta({ isPublished: true, deadline: '2026-07-14' }, t).key).toBe('dueSoon');
        expect(getHomeworkStateMeta({ isPublished: true, deadline: '2026-08-01' }, t).key).toBe('active');
    });

    it('builds queue badges and prioritizes action queues', () => {
        const item = {
            isPublished: true,
            queue: {
                needsReviewCount: 2,
                missingCount: 1,
                needsRevisionCount: 1,
                lateCount: 1,
            },
        };

        expect(getHomeworkQueueBadges(item, t).map((badge) => badge.key)).toEqual([
            'needs_review',
            'missing',
            'needs_revision',
            'late',
        ]);
        expect(getQueuePriority(item)).toBe(0);
        expect(getQueueAction(item, t)).toMatchObject({
            label: 'instructorHomework.queueActions.needsReview.label',
            description: 'instructorHomework.queueActions.needsReview.description:2',
        });
    });

    it('matches queue filters against queue counts and derived state', () => {
        const item = {
            stateMeta: { key: 'overdue' },
            queue: {
                needsRevisionCount: 1,
            },
        };

        expect(matchesHomeworkQueueFilter(item, 'all')).toBe(true);
        expect(matchesHomeworkQueueFilter(item, 'needsRevision')).toBe(true);
        expect(matchesHomeworkQueueFilter(item, 'overdue')).toBe(true);
        expect(matchesHomeworkQueueFilter(item, 'missing')).toBe(false);
    });

    it('builds homework navigation targets from nested session data', () => {
        const item = {
            id: 99,
            session: {
                id: 12,
                group: {
                    id: 7,
                    course: { id: 3 },
                },
            },
        };

        expect(buildHomeworkDetailPath(item)).toBe('/instructor/sessions/12/homework/99');
        expect(buildSessionHomeworkPath(item)).toBe(
            '/instructor?tab=sessions&workspaceTab=homework&courseId=3&groupId=7&sessionId=12&homeworkId=99'
        );
    });
});

import { describe, expect, it } from 'vitest';
import {
    applyWorkspaceGroups,
    getWorkspaceGroupIdForTab,
} from './workspaceGroups';

describe('workspaceGroups', () => {
    const groups = Object.freeze({
        DAILY: Object.freeze({
            id: 'daily',
            tabs: Object.freeze(['overview', 'attendance']),
        }),
        REFERENCE: Object.freeze({
            id: 'reference',
            tabs: Object.freeze(['courses']),
        }),
    });

    it('returns the owning workspace group for a tab', () => {
        expect(getWorkspaceGroupIdForTab(groups, 'attendance')).toBe('daily');
        expect(getWorkspaceGroupIdForTab(groups, 'courses')).toBe('reference');
    });

    it('returns null for unknown tabs or missing groups', () => {
        expect(getWorkspaceGroupIdForTab(groups, 'missing')).toBeNull();
        expect(getWorkspaceGroupIdForTab(null, 'courses')).toBeNull();
        expect(getWorkspaceGroupIdForTab(groups, '')).toBeNull();
    });

    it('adds workspaceGroup metadata without changing the original item shape', () => {
        const items = [
            { id: 'overview', label: 'Overview' },
            { id: 'courses', label: 'Courses' },
            { id: 'unknown', label: 'Unknown' },
        ];

        expect(applyWorkspaceGroups(items, groups)).toEqual([
            { id: 'overview', label: 'Overview', workspaceGroup: 'daily' },
            { id: 'courses', label: 'Courses', workspaceGroup: 'reference' },
            { id: 'unknown', label: 'Unknown', workspaceGroup: null },
        ]);
        expect(items[0]).toEqual({ id: 'overview', label: 'Overview' });
    });
});

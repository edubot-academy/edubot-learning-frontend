import { describe, expect, it } from 'vitest';
import {
    getCommunicationPath,
    getDashboardPath,
    getUserMenuItems,
    getUserNavigationPaths,
} from './navigation';

describe('navigation helpers', () => {
    it('builds dashboard paths for known roles and platform admins', () => {
        expect(getDashboardPath('student')).toBe('/student');
        expect(getDashboardPath('instructor')).toBe('/instructor');
        expect(getDashboardPath('assistant')).toBe('/assistant');
        expect(getDashboardPath('admin')).toBe('/admin');
        expect(getDashboardPath('superadmin')).toBe('/admin');
    });

    it('falls back to the generic dashboard for unsupported roles', () => {
        expect(getDashboardPath('mentor')).toBe('/dashboard');
        expect(getDashboardPath(null)).toBe('/dashboard');
    });

    it('appends tab and query params without dropping valid falsy values', () => {
        expect(getDashboardPath('instructor', 'sessions', { courseId: 42, page: 0 })).toBe(
            '/instructor?tab=sessions&courseId=42&page=0'
        );
        expect(getDashboardPath('student', 'my courses')).toBe('/student?tab=my%20courses');
        expect(getDashboardPath('admin', null, { tenantId: 'abc', empty: '', missing: undefined })).toBe(
            '/admin?tenantId=abc'
        );
    });

    it('returns role-aware overview and communication destinations', () => {
        expect(getUserNavigationPaths({ role: 'admin' }).dashboardOverview).toBe('/admin?tab=stats');
        expect(getUserNavigationPaths({ role: 'superadmin' }).dashboardOverview).toBe('/admin?tab=stats');
        expect(getUserNavigationPaths({ role: 'instructor' }).dashboardOverview).toBe('/instructor?tab=overview');
        expect(getCommunicationPath('student')).toBe('/student?tab=chat');
        expect(getCommunicationPath('instructor')).toBe('/instructor?tab=chat');
        expect(getCommunicationPath('admin')).toBe('/admin?tab=notifications');
        expect(getCommunicationPath('assistant')).toBe('/assistant');
        expect(getCommunicationPath('mentor')).toBeNull();
    });

    it('exposes menu links that match role-specific dashboard paths', () => {
        const adminItems = getUserMenuItems('admin');
        expect(adminItems).toContainEqual({ id: 'courses', labelKey: 'nav.courses', path: '/admin?tab=courses' });
        expect(adminItems).toContainEqual({ id: 'notifications', labelKey: 'nav.notifications', path: '/admin?tab=notifications' });
        expect(adminItems).toContainEqual({ id: 'chat', labelKey: 'nav.chat', path: '/admin?tab=notifications' });

        const studentItems = getUserMenuItems('student');
        expect(studentItems).toContainEqual({ id: 'my-courses', labelKey: 'nav.myCourses', path: '/student?tab=my-courses' });
        expect(studentItems).toContainEqual({ id: 'chat', labelKey: 'nav.chat', path: '/student?tab=chat' });
    });
});

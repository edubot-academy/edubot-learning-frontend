import { describe, expect, it } from 'vitest';
import {
    ADMIN_DASHBOARD_TABS,
    DASHBOARD_TABS_BY_ROLE,
    INSTRUCTOR_DASHBOARD_TABS,
    STUDENT_DASHBOARD_TABS,
} from './dashboardTabs';
import { NAV_ITEMS as ADMIN_NAV_ITEMS, ADMIN_TABS } from '@features/admin/utils/adminPanel.constants';
import { NAV_ITEMS as INSTRUCTOR_NAV_ITEMS } from '@features/instructor-dashboard/utils/instructorDashboard.constants';
import { NAV_ITEMS as STUDENT_NAV_ITEMS } from '@features/student-dashboard/utils/studentDashboard.constants';

const values = (tabMap) => Object.values(tabMap);
const ids = (items) => items.map((item) => item.id);

describe('dashboard tab constants', () => {
    it('keeps role tab maps available for every dashboard role', () => {
        expect(DASHBOARD_TABS_BY_ROLE.student).toBe(STUDENT_DASHBOARD_TABS);
        expect(DASHBOARD_TABS_BY_ROLE.instructor).toBe(INSTRUCTOR_DASHBOARD_TABS);
        expect(DASHBOARD_TABS_BY_ROLE.admin).toBe(ADMIN_DASHBOARD_TABS);
        expect(DASHBOARD_TABS_BY_ROLE.superadmin).toBe(ADMIN_DASHBOARD_TABS);
    });

    it('keeps student navigation IDs backed by student tab constants', () => {
        expect(ids(STUDENT_NAV_ITEMS).sort()).toEqual(values(STUDENT_DASHBOARD_TABS).sort());
    });

    it('keeps instructor navigation IDs backed by instructor tab constants', () => {
        expect(ids(INSTRUCTOR_NAV_ITEMS).sort()).toEqual(values(INSTRUCTOR_DASHBOARD_TABS).sort());
    });

    it('keeps admin navigation and valid tabs backed by admin tab constants', () => {
        expect(ids(ADMIN_NAV_ITEMS).sort()).toEqual(values(ADMIN_DASHBOARD_TABS).sort());
        expect([...ADMIN_TABS].sort()).toEqual(values(ADMIN_DASHBOARD_TABS).sort());
    });
});

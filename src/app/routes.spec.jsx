import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DashboardTabRedirect } from './routes';

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const renderRedirect = ({ initialEntry, routePath, dashboardPath, tab }) =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path={routePath} element={<DashboardTabRedirect dashboardPath={dashboardPath} tab={tab} />} />
                <Route path={`${dashboardPath}`} element={<LocationProbe />} />
            </Routes>
        </MemoryRouter>
    );

describe('DashboardTabRedirect', () => {
    it.each([
        ['/instructor/sessions?courseId=12', '/instructor/sessions', '/instructor', 'sessions', '/instructor?courseId=12&tab=sessions'],
        ['/instructor/analytics', '/instructor/analytics', '/instructor', 'analytics', '/instructor?tab=analytics'],
        ['/instructor/homework?sessionId=8', '/instructor/homework', '/instructor', 'homework', '/instructor?sessionId=8&tab=homework'],
        ['/student/analytics?from=2026-05-01', '/student/analytics', '/student', 'progress', '/student?from=2026-05-01&tab=progress'],
        ['/admin/analytics?tenantId=acme', '/admin/analytics', '/admin', 'analytics', '/admin?tenantId=acme&tab=analytics'],
    ])('redirects %s to %s preserving existing query params', async (
        initialEntry,
        routePath,
        dashboardPath,
        tab,
        expectedLocation
    ) => {
        renderRedirect({ initialEntry, routePath, dashboardPath, tab });

        expect(await screen.findByTestId('location')).toHaveTextContent(expectedLocation);
    });

    it('replaces an existing tab query with the configured target tab', async () => {
        renderRedirect({
            initialEntry: '/instructor/sessions?tab=overview&courseId=12',
            routePath: '/instructor/sessions',
            dashboardPath: '/instructor',
            tab: 'sessions',
        });

        expect(await screen.findByTestId('location')).toHaveTextContent('/instructor?tab=sessions&courseId=12');
    });
});

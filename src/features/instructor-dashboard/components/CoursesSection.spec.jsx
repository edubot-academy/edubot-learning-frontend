import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CoursesSection from './CoursesSection.jsx';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        i18n: { language: 'en' },
        t: (key, values) => (values?.price ? `${key}:${values.price}` : key),
    }),
}));

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
};

const renderSection = (props) =>
    render(
        <MemoryRouter initialEntries={['/instructor?tab=courses']}>
            <CoursesSection
                courses={[]}
                deliveryCourseModals={null}
                {...props}
            />
            <LocationProbe />
        </MemoryRouter>
    );

describe('CoursesSection', () => {
    it('renders skeleton cards while the initial course list is loading', () => {
        const { container } = renderSection({ loading: true });

        expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
    });

    it('navigates to course creation from the empty state action', () => {
        renderSection({ loading: false });

        fireEvent.click(screen.getByRole('button', {
            name: 'instructorDashboard.coursesSection.actions.createCourse',
        }));

        expect(screen.getByTestId('location')).toHaveTextContent('/instructor/course/create');
    });

    it('renders video course view, edit, and draft submission actions', () => {
        renderSection({
            courses: [{
                id: 12,
                title: 'Video Course',
                courseType: 'video',
                status: 'draft',
                isPublished: false,
                price: 99,
                studentsCount: 3,
                updatedAt: '2026-01-10T00:00:00.000Z',
            }],
            submittingCourseId: 12,
        });

        expect(screen.getByRole('link', {
            name: 'instructorDashboard.coursesSection.actions.view',
        })).toHaveAttribute('href', '/courses/12');
        expect(screen.getByRole('link', {
            name: 'instructorDashboard.coursesSection.actions.edit',
        })).toHaveAttribute('href', '/instructor/courses/edit/12');
        expect(screen.getByRole('button', {
            name: 'instructorDashboard.coursesSection.actions.submitting',
        })).toBeDisabled();
    });

    it('routes delivery courses to group management and opens the edit modal action', () => {
        const onOpenDeliveryEditModal = vi.fn();
        const deliveryCourse = {
            id: 34,
            title: 'Live Cohort',
            courseType: 'online_live',
            status: 'approved',
            isPublished: true,
            category: { name: 'English' },
        };

        renderSection({
            courses: [deliveryCourse],
            onOpenDeliveryEditModal,
        });

        expect(screen.getByRole('link', {
            name: 'instructorDashboard.coursesSection.actions.manage',
        }).getAttribute('href')).toContain('tab=groups');

        fireEvent.click(screen.getByRole('button', {
            name: 'instructorDashboard.coursesSection.actions.edit',
        }));

        expect(onOpenDeliveryEditModal).toHaveBeenCalledWith(deliveryCourse);
    });
});

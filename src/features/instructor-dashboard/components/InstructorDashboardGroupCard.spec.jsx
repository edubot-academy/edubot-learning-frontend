import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import InstructorDashboardGroupCard from './InstructorDashboardGroupCard.jsx';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, values) => {
            if (values?.student) return `${key}:${values.student}`;
            if (values?.defaultValue) return values.defaultValue;
            return key;
        },
    }),
}));

const renderCard = (props = {}) => {
    const group = {
        id: 21,
        name: 'Morning Live',
        code: 'ENG-2026-07-G01',
        deliveryMode: 'group',
        status: 'active',
        location: 'Room 4',
        timezone: 'Asia/Bishkek',
        scheduleBlocks: [{ day: 'monday', startTime: '09:00', endTime: '10:00' }],
        ...props.group,
    };

    return render(
        <MemoryRouter>
            <InstructorDashboardGroupCard
                canEnroll
                group={group}
                hasLoadedIndividualStudent={false}
                individualStudent={null}
                onOpenEditModal={vi.fn()}
                onOpenEnrollModal={vi.fn()}
                onOpenGenerateModal={vi.fn()}
                sessionsPath="/instructor?tab=sessions"
                {...props}
            />
        </MemoryRouter>
    );
};

describe('InstructorDashboardGroupCard', () => {
    it('renders group details and wires primary actions', () => {
        const onOpenEditModal = vi.fn();
        const onOpenEnrollModal = vi.fn();
        const onOpenGenerateModal = vi.fn();

        renderCard({
            onOpenEditModal,
            onOpenEnrollModal,
            onOpenGenerateModal,
        });

        expect(screen.getByText('Morning Live')).toBeInTheDocument();
        expect(screen.getByText('monday · 09:00–10:00')).toBeInTheDocument();
        expect(screen.getByRole('link', {
            name: 'instructorDashboard.groupsSection.actions.manageSessions',
        })).toHaveAttribute('href', '/instructor?tab=sessions');

        fireEvent.click(screen.getByRole('button', {
            name: 'instructorDashboard.groupsSection.actions.generateSessions',
        }));
        fireEvent.click(screen.getByRole('button', {
            name: 'instructorDashboard.groupsSection.actions.addStudent',
        }));
        fireEvent.click(screen.getByRole('button', {
            name: 'instructorDashboard.groupsSection.actions.edit',
        }));

        expect(onOpenGenerateModal).toHaveBeenCalledWith(expect.objectContaining({ id: 21 }));
        expect(onOpenEnrollModal).toHaveBeenCalledWith(expect.objectContaining({ id: 21 }));
        expect(onOpenEditModal).toHaveBeenCalledWith(expect.objectContaining({ id: 21 }));
    });

    it('shows individual student state and disables enrollment once occupied', () => {
        renderCard({
            canEnroll: true,
            group: {
                deliveryMode: 'individual',
                activeStudentCount: 1,
            },
            hasLoadedIndividualStudent: true,
            individualStudent: { fullName: 'Aida Student' },
        });

        expect(screen.getByText('instructorDashboard.groupsSection.card.individualStudent:Aida Student')).toBeInTheDocument();
        expect(screen.getByRole('button', {
            name: 'instructorDashboard.groupsSection.actions.addIndividualStudent',
        })).toBeDisabled();
    });

    it('disables enrollment when course readiness blocks enrollment', () => {
        renderCard({ canEnroll: false });

        expect(screen.getByRole('button', {
            name: 'instructorDashboard.groupsSection.actions.addStudent',
        })).toBeDisabled();
    });
});

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createCourseGroup,
    createIndividualCourseGroup,
    updateCourseGroup,
} from '@features/courseGroups/api';
import { enrollUserInCourse } from '@features/enrollments/api';
import { toast } from 'react-hot-toast';
import { useInstructorGroupMutations } from './useInstructorGroupMutations';

vi.mock('@features/courseGroups/api', () => ({
    createCourseGroup: vi.fn(),
    createIndividualCourseGroup: vi.fn(),
    updateCourseGroup: vi.fn(),
}));

vi.mock('@features/enrollments/api', () => ({
    enrollUserInCourse: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    toast: Object.assign(vi.fn(), {
        error: vi.fn(),
        success: vi.fn(),
    }),
}));

const t = (key, values) => (values?.count ? `${key}:${values.count}` : key);
const selectedCourse = {
    id: 7,
    courseType: 'online_live',
};
const groupForm = {
    code: 'LIVE-2026-07-G01',
    deliveryMode: 'group',
    endDate: '',
    instructorId: '',
    location: '',
    meetingProvider: '',
    meetingUrl: '',
    name: 'Live Group',
    scheduleBlocks: [{ day: 'mon', startTime: '09:00', endTime: '10:00' }],
    scheduleNote: '',
    seatLimit: '',
    startDate: '2026-07-15',
    status: 'planned',
    timezone: 'Asia/Bishkek',
};

describe('useInstructorGroupMutations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createCourseGroup.mockResolvedValue({ id: 20 });
        createIndividualCourseGroup.mockResolvedValue({ group: { id: 21 } });
        updateCourseGroup.mockResolvedValue({});
        enrollUserInCourse.mockResolvedValue({});
    });

    it('creates a group, reloads groups, and reports success', async () => {
        const loadGroups = vi.fn().mockResolvedValue();
        const onCreateSuccess = vi.fn();
        const { result } = renderHook(() =>
            useInstructorGroupMutations({
                createForm: groupForm,
                loadGroups,
                onCreateSuccess,
                selectedCourse,
                t,
            })
        );

        await act(async () => {
            await result.current.handleCreateGroup();
        });

        expect(createCourseGroup).toHaveBeenCalledWith(expect.objectContaining({
            code: 'LIVE-2026-07-G01',
            courseId: 7,
            deliveryMode: 'group',
            name: 'Live Group',
        }));
        expect(loadGroups).toHaveBeenCalledWith(7);
        expect(onCreateSuccess).toHaveBeenCalledWith({ id: 20 });
        expect(toast.success).toHaveBeenCalledWith(
            'instructorDashboard.groupsSection.toasts.groupCreated'
        );
        expect(result.current.savingGroup).toBe(false);
    });

    it('does not create a group when validation fails', async () => {
        const { result } = renderHook(() =>
            useInstructorGroupMutations({
                createForm: { ...groupForm, name: '' },
                selectedCourse,
                t,
            })
        );

        await act(async () => {
            await result.current.handleCreateGroup();
        });

        expect(createCourseGroup).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
            'instructorDashboard.groupsSection.toasts.groupNameAndCodeRequired'
        );
    });

    it('updates a group, reloads the selected course, and reports success', async () => {
        const loadGroups = vi.fn().mockResolvedValue();
        const onUpdateSuccess = vi.fn();
        const { result } = renderHook(() =>
            useInstructorGroupMutations({
                editForm: groupForm,
                editingGroupId: '30',
                loadGroups,
                onUpdateSuccess,
                selectedCourseId: '7',
                t,
            })
        );

        await act(async () => {
            await result.current.handleUpdateGroup();
        });

        expect(updateCourseGroup).toHaveBeenCalledWith(30, expect.objectContaining({
            code: 'LIVE-2026-07-G01',
            name: 'Live Group',
        }));
        expect(loadGroups).toHaveBeenCalledWith('7');
        expect(onUpdateSuccess).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
            'instructorDashboard.groupsSection.toasts.groupUpdated'
        );
        expect(result.current.savingGroupUpdate).toBe(false);
    });

    it('enrolls a student, closes local UI, and reloads roster and groups', async () => {
        const loadGroups = vi.fn().mockResolvedValue();
        const loadGroupStudents = vi.fn().mockResolvedValue();
        const onEnrollSuccess = vi.fn();
        const enrollGroup = { id: 40 };
        const { result } = renderHook(() =>
            useInstructorGroupMutations({
                enrollForm: { discountPercentage: '10', userId: '50' },
                enrollGroup,
                loadGroups,
                loadGroupStudents,
                onEnrollSuccess,
                selectedCourse,
                t,
            })
        );

        await act(async () => {
            await result.current.handleEnrollStudent();
        });

        expect(enrollUserInCourse).toHaveBeenCalledWith(50, 7, {
            courseType: 'online_live',
            discountPercentage: 10,
            groupId: 40,
        });
        expect(onEnrollSuccess).toHaveBeenCalledWith(enrollGroup);
        expect(loadGroupStudents).toHaveBeenCalledWith(enrollGroup);
        expect(loadGroups).toHaveBeenCalledWith(7);
        expect(toast.success).toHaveBeenCalledWith(
            'instructorDashboard.groupsSection.toasts.studentAdded'
        );
        expect(result.current.enrolling).toBe(false);
    });
});

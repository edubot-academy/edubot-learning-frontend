import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import { fetchCategories } from '@features/categories/api';
import {
    createCourse,
    markCoursePending,
    updateCourse,
} from '@features/courses/api';
import { useDeliveryCourse } from './useDeliveryCourse';

vi.mock('react-i18next', () => {
    const t = (key) => key;
    return {
        initReactI18next: {
            init: vi.fn(),
            type: '3rdParty',
        },
        useTranslation: () => ({ t }),
    };
});

vi.mock('react-hot-toast', () => {
    const toastMock = {
        error: vi.fn(),
        success: vi.fn(),
    };
    return {
        default: toastMock,
        toast: toastMock,
    };
});

vi.mock('@features/categories/api', () => ({
    fetchCategories: vi.fn(),
}));

vi.mock('@features/courses/api', () => ({
    createCourse: vi.fn(),
    markCoursePending: vi.fn(),
    updateCourse: vi.fn(),
}));

describe('useDeliveryCourse', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchCategories.mockResolvedValue([{ id: 1, name: 'Offline' }]);
    });

    it('loads categories and opens the create modal', async () => {
        const { result } = renderHook(() => useDeliveryCourse());

        await act(async () => {
            await result.current.openDeliveryModal();
        });

        expect(fetchCategories).toHaveBeenCalledTimes(1);
        expect(result.current.deliveryCategories).toEqual([{ id: 1, name: 'Offline' }]);
        expect(result.current.showDeliveryModal).toBe(true);
    });

    it('creates a delivery course with normalized payload and notifies the caller', async () => {
        const createdCourse = { id: 10, title: 'Live English' };
        createCourse.mockResolvedValue(createdCourse);
        const onCreated = vi.fn();
        const { result } = renderHook(() => useDeliveryCourse({ onCreated }));

        let created;
        await act(async () => {
            created = await result.current.handleCreateDeliveryCourse({
                title: 'Live English',
                description: 'Speaking course',
                categoryId: '1',
                price: '200',
                languageCode: 'en',
                courseType: 'online_live',
            });
        });

        expect(created).toBe(true);
        expect(createCourse).toHaveBeenCalledWith({
            title: 'Live English',
            description: 'Speaking course',
            categoryId: 1,
            price: 200,
            languageCode: 'en',
            courseType: 'online_live',
            isPaid: true,
        });
        expect(onCreated).toHaveBeenCalledWith(createdCourse);
        expect(toast.success).toHaveBeenCalledWith(
            'instructorDashboard.shell.toasts.deliveryCourseCreated'
        );
        expect(result.current.creatingDeliveryCourse).toBe(false);
    });

    it('rejects create requests with missing required fields', async () => {
        const { result } = renderHook(() => useDeliveryCourse());

        let created;
        await act(async () => {
            created = await result.current.handleCreateDeliveryCourse({
                title: '',
                description: 'Missing title',
                categoryId: '1',
            });
        });

        expect(created).toBe(false);
        expect(createCourse).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
            'instructorDashboard.shell.toasts.requiredFields'
        );
    });

    it('opens the edit modal with normalized course state', async () => {
        const { result } = renderHook(() => useDeliveryCourse());

        await act(async () => {
            await result.current.openDeliveryEditModal({
                id: 12,
                title: 'Offline Math',
                description: 'Group class',
                category: { id: 2 },
                price: 300,
                isPublished: true,
                status: 'approved',
            });
        });

        expect(result.current.showEditDeliveryModal).toBe(true);
        expect(result.current.editingDeliveryCourse).toEqual({
            id: 12,
            courseType: 'offline',
            title: 'Offline Math',
            description: 'Group class',
            categoryId: 2,
            price: 300,
            languageCode: 'ky',
            status: 'approved',
            isPublished: true,
        });
    });

    it('updates approved courses and marks them pending for review', async () => {
        updateCourse.mockResolvedValue({ id: 12, title: 'Updated' });
        markCoursePending.mockResolvedValue({ id: 12, status: 'pending' });
        const onUpdated = vi.fn();
        const { result } = renderHook(() => useDeliveryCourse({ onUpdated }));

        await act(async () => {
            await result.current.openDeliveryEditModal({
                id: 12,
                title: 'Offline Math',
                description: 'Group class',
                categoryId: 2,
                status: 'approved',
                isPublished: false,
            });
        });

        let updated;
        await act(async () => {
            updated = await result.current.handleUpdateDeliveryCourse({
                title: 'Updated',
                description: 'Updated description',
                categoryId: '2',
                price: '0',
                languageCode: '',
                courseType: 'offline',
            });
        });

        expect(updated).toBe(true);
        expect(updateCourse).toHaveBeenCalledWith(12, {
            title: 'Updated',
            description: 'Updated description',
            categoryId: 2,
            price: 0,
            languageCode: 'ky',
            courseType: 'offline',
            isPaid: false,
        });
        expect(markCoursePending).toHaveBeenCalledWith(12);
        expect(onUpdated).toHaveBeenCalledWith({
            courseId: 12,
            requiresReview: true,
            reviewCourse: { id: 12, status: 'pending' },
            updatedCourse: { id: 12, title: 'Updated' },
        });
        expect(result.current.showEditDeliveryModal).toBe(false);
    });

    it('submits a course for approval and resets the submitting id', async () => {
        markCoursePending.mockResolvedValue({ id: 25, status: 'pending' });
        const onSubmittedForApproval = vi.fn();
        const { result } = renderHook(() =>
            useDeliveryCourse({ onSubmittedForApproval })
        );

        let submitted;
        await act(async () => {
            submitted = await result.current.handleSubmitCourseForApproval(25);
        });

        expect(submitted).toBe(true);
        expect(markCoursePending).toHaveBeenCalledWith(25);
        expect(onSubmittedForApproval).toHaveBeenCalledWith({
            courseId: 25,
            pendingCourse: { id: 25, status: 'pending' },
        });
        expect(result.current.submittingCourseId).toBeNull();
    });
});

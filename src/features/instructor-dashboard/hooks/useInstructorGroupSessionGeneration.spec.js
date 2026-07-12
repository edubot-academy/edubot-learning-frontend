import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    fetchCourseGroupSessionGenerationPreview,
    generateCourseGroupSessions,
} from '@features/courseGroups/api';
import { toast } from 'react-hot-toast';
import { useInstructorGroupSessionGeneration } from './useInstructorGroupSessionGeneration';

vi.mock('@features/courseGroups/api', () => ({
    fetchCourseGroupSessionGenerationPreview: vi.fn(),
    generateCourseGroupSessions: vi.fn(),
}));

vi.mock('react-hot-toast', () => {
    const toastMock = vi.fn();
    toastMock.error = vi.fn();
    toastMock.success = vi.fn();
    return { toast: toastMock };
});

const t = (key, values) => (values?.count ? `${key}:${values.count}` : key);

const group = {
    id: 44,
    endDate: '2099-02-01',
    scheduleBlocks: [{ day: 'mon', startTime: '10:00', endTime: '11:00' }],
    startDate: '2099-01-01',
};

describe('useInstructorGroupSessionGeneration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchCourseGroupSessionGenerationPreview.mockResolvedValue({ sessions: [] });
        generateCourseGroupSessions.mockResolvedValue({ createdCount: 0 });
    });

    it('blocks opening generation when the group has no default schedule', () => {
        const { result } = renderHook(() => useInstructorGroupSessionGeneration({ t }));

        act(() => {
            result.current.handleOpenGenerateModal({ id: 1, scheduleBlocks: [] });
        });

        expect(result.current.showGenerateModal).toBe(false);
        expect(fetchCourseGroupSessionGenerationPreview).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
            'instructorDashboard.groupsSection.toasts.defaultScheduleRequired'
        );
    });

    it('opens generation and loads a preview for the computed date range', async () => {
        fetchCourseGroupSessionGenerationPreview.mockResolvedValue({ sessions: [{ id: 1 }] });
        const { result } = renderHook(() => useInstructorGroupSessionGeneration({ t }));

        act(() => {
            result.current.handleOpenGenerateModal(group);
        });

        expect(result.current.showGenerateModal).toBe(true);
        expect(result.current.generationGroup).toEqual(group);
        expect(result.current.generationForm).toEqual({
            fromDate: '2099-01-01',
            toDate: '2099-02-01',
        });

        await waitFor(() => {
            expect(result.current.generationPreview).toEqual({ sessions: [{ id: 1 }] });
        });
        expect(fetchCourseGroupSessionGenerationPreview).toHaveBeenCalledWith(44, {
            fromDate: '2099-01-01',
            toDate: '2099-02-01',
        });
        expect(result.current.previewLoading).toBe(false);
    });

    it('ignores a stale preview when the form changes before the request resolves', async () => {
        let resolvePreview;
        fetchCourseGroupSessionGenerationPreview.mockReturnValue(
            new Promise((resolve) => {
                resolvePreview = resolve;
            })
        );
        const { result } = renderHook(() => useInstructorGroupSessionGeneration({ t }));

        act(() => {
            result.current.handleOpenGenerateModal(group);
        });
        act(() => {
            result.current.handleGenerationFormChange('fromDate', '2099-01-02');
        });
        await act(async () => {
            resolvePreview({ sessions: [{ id: 9 }] });
        });

        expect(result.current.generationPreview).toBeNull();
        expect(result.current.previewLoading).toBe(false);
        expect(result.current.generationForm.fromDate).toBe('2099-01-02');
    });

    it('generates sessions, reports success, and closes the modal', async () => {
        fetchCourseGroupSessionGenerationPreview.mockResolvedValue({ sessions: [] });
        generateCourseGroupSessions.mockResolvedValue({ createdCount: 3 });
        const { result } = renderHook(() => useInstructorGroupSessionGeneration({ t }));

        act(() => {
            result.current.handleOpenGenerateModal(group);
        });
        await waitFor(() => {
            expect(result.current.previewLoading).toBe(false);
        });

        await act(async () => {
            await result.current.handleGenerateSessions();
        });

        expect(generateCourseGroupSessions).toHaveBeenCalledWith(44, {
            fromDate: '2099-01-01',
            toDate: '2099-02-01',
        });
        expect(toast.success).toHaveBeenCalledWith(
            'instructorDashboard.groupsSection.toasts.sessionsCreated:3'
        );
        expect(result.current.showGenerateModal).toBe(false);
        expect(result.current.generationGroup).toBeNull();
        expect(result.current.generationPreview).toBeNull();
    });
});

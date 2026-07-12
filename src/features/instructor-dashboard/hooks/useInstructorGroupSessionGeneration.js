import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';
import {
    fetchCourseGroupSessionGenerationPreview,
    generateCourseGroupSessions,
} from '@features/courseGroups/api';
import {
    buildGenerationRange,
    getGenerateSessionsToastMeta,
    getNextGenerationFormState,
    getOpenGenerateSessionsValidationKey,
} from '@features/instructor-dashboard/utils/groupCourses';

export const useInstructorGroupSessionGeneration = ({ t } = {}) => {
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generationGroup, setGenerationGroup] = useState(null);
    const [generationForm, setGenerationForm] = useState({ fromDate: '', toDate: '' });
    const [generationPreview, setGenerationPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [generatingSessions, setGeneratingSessions] = useState(false);
    const generationPreviewRequestRef = useRef(0);

    const loadGenerationPreview = useCallback(async (group, form) => {
        if (!group?.id) return;
        const requestId = generationPreviewRequestRef.current + 1;
        generationPreviewRequestRef.current = requestId;
        setPreviewLoading(true);
        try {
            const data = await fetchCourseGroupSessionGenerationPreview(Number(group.id), form);
            if (generationPreviewRequestRef.current !== requestId) return;
            setGenerationPreview(data);
        } catch (error) {
            if (generationPreviewRequestRef.current !== requestId) return;
            console.error('Failed to load generation preview', error);
            toast.error(
                parseApiError(
                    error,
                    t?.('instructorDashboard.generateSessions.toasts.previewFailed') ??
                        'Failed to load generation preview'
                ).message
            );
            setGenerationPreview(null);
        } finally {
            if (generationPreviewRequestRef.current === requestId) {
                setPreviewLoading(false);
            }
        }
    }, [t]);

    const handleOpenGenerateModal = useCallback((group) => {
        const validationKey = getOpenGenerateSessionsValidationKey(group);
        if (validationKey) {
            toast.error(t?.(validationKey) ?? validationKey);
            return;
        }

        const nextRange = buildGenerationRange(group);
        generationPreviewRequestRef.current += 1;
        setGenerationGroup(group);
        setGenerationForm(nextRange);
        setGenerationPreview(null);
        setShowGenerateModal(true);
        loadGenerationPreview(group, nextRange);
    }, [loadGenerationPreview, t]);

    const handleGenerateSessions = useCallback(async () => {
        if (!generationGroup?.id) return;

        setGeneratingSessions(true);
        try {
            const result = await generateCourseGroupSessions(Number(generationGroup.id), generationForm);
            const toastMeta = getGenerateSessionsToastMeta(result);
            if (toastMeta.type === 'success') {
                toast.success(t?.(toastMeta.key, { count: toastMeta.count }) ?? toastMeta.key);
            } else {
                toast(t?.(toastMeta.key) ?? toastMeta.key, {
                    icon: 'ℹ️',
                });
            }
            setShowGenerateModal(false);
            setGenerationGroup(null);
            setGenerationPreview(null);
        } catch (error) {
            console.error('Failed to generate sessions', error);
            toast.error(
                parseApiError(
                    error,
                    t?.('instructorDashboard.generateSessions.toasts.generateFailed') ??
                        'Failed to generate sessions'
                ).message
            );
        } finally {
            setGeneratingSessions(false);
        }
    }, [generationForm, generationGroup, t]);

    const handleGenerationFormChange = useCallback((field, value) => {
        setGenerationForm((prev) => {
            const nextState = getNextGenerationFormState(prev, field, value);
            if (nextState.changed) {
                generationPreviewRequestRef.current += 1;
                setGenerationPreview(null);
                setPreviewLoading(false);
            }
            return nextState.form;
        });
    }, []);

    const handleCloseGenerateModal = useCallback(() => {
        generationPreviewRequestRef.current += 1;
        setShowGenerateModal(false);
        setGenerationGroup(null);
        setGenerationPreview(null);
        setPreviewLoading(false);
    }, []);

    const handlePreviewGeneration = useCallback(() => {
        loadGenerationPreview(generationGroup, generationForm);
    }, [generationForm, generationGroup, loadGenerationPreview]);

    return {
        generatingSessions,
        generationForm,
        generationGroup,
        generationPreview,
        handleCloseGenerateModal,
        handleGenerateSessions,
        handleGenerationFormChange,
        handleOpenGenerateModal,
        handlePreviewGeneration,
        previewLoading,
        showGenerateModal,
    };
};

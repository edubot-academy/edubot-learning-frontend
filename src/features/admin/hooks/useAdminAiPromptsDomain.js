import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    addCourseAiPrompt,
    deleteCourseAiPrompt,
    fetchCourseAiPrompts,
    updateCourseAiPrompt,
} from '@services/api';
import { isForbiddenError, parseApiError } from '@shared/api/error';

export const useAdminAiPromptsDomain = ({ requestConfirmation }) => {
    const { t } = useTranslation();
    const [aiPromptCourseId, setAiPromptCourseId] = useState(null);
    const [aiPrompts, setAiPrompts] = useState([]);
    const [aiPromptsLoading, setAiPromptsLoading] = useState(false);
    const [newPromptText, setNewPromptText] = useState('');
    const [newPromptLanguage, setNewPromptLanguage] = useState('ky');
    const [newPromptOrder, setNewPromptOrder] = useState(0);
    const [newPromptIsActive, setNewPromptIsActive] = useState(true);

    const loadPromptsForCourse = useCallback(async (courseId) => {
        if (!courseId) {
            setAiPrompts([]);
            return;
        }

        setAiPromptsLoading(true);
        try {
            const res = await fetchCourseAiPrompts(courseId);
            setAiPrompts(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(parseApiError(error, t('adminAiPrompts.toasts.loadError')).message);
            }
        } finally {
            setAiPromptsLoading(false);
        }
    }, [t]);

    const handleCreatePrompt = useCallback(async () => {
        if (!newPromptText.trim()) return;
        if (!aiPromptCourseId) {
            toast.error(t('adminAiPrompts.toasts.selectCourse'));
            return;
        }

        try {
            await addCourseAiPrompt(aiPromptCourseId, {
                text: newPromptText.trim(),
                language: newPromptLanguage,
                order: Number(newPromptOrder),
                isActive: newPromptIsActive,
            });
            setNewPromptText('');
            setNewPromptLanguage('ky');
            setNewPromptOrder(0);
            setNewPromptIsActive(true);
            toast.success(t('adminAiPrompts.toasts.created'));
            loadPromptsForCourse(aiPromptCourseId);
        } catch (error) {
            toast.error(parseApiError(error, t('adminAiPrompts.toasts.createError')).message);
        }
    }, [
        aiPromptCourseId,
        loadPromptsForCourse,
        newPromptIsActive,
        newPromptLanguage,
        newPromptOrder,
        newPromptText,
        t,
    ]);

    const handleUpdatePrompt = useCallback(async (promptId, updates) => {
        try {
            await updateCourseAiPrompt(promptId, updates);
            setAiPrompts((prev) =>
                prev.map((prompt) => (prompt.id === promptId ? { ...prompt, ...updates } : prompt))
            );
            toast.success(t('adminAiPrompts.toasts.updated'));
        } catch (error) {
            toast.error(parseApiError(error, t('adminAiPrompts.toasts.updateError')).message);
        }
    }, [t]);

    const handleDeletePrompt = useCallback(
        async (promptId) => {
            requestConfirmation({
                title: t('adminAiPrompts.confirm.deleteTitle'),
                message: t('adminAiPrompts.confirm.deleteMessage'),
                confirmLabel: t('adminAiPrompts.actions.delete'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCourseAiPrompt(promptId);
                        setAiPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));
                        toast.success(t('adminAiPrompts.toasts.deleted'));
                    } catch (error) {
                        toast.error(
                            parseApiError(error, t('adminAiPrompts.toasts.deleteError')).message
                        );
                    }
                },
            });
        },
        [requestConfirmation, t]
    );

    return {
        aiPromptCourseId,
        aiPrompts,
        aiPromptsLoading,
        handleCreatePrompt,
        handleDeletePrompt,
        handleUpdatePrompt,
        loadPromptsForCourse,
        newPromptIsActive,
        newPromptLanguage,
        newPromptOrder,
        newPromptText,
        setAiPromptCourseId,
        setNewPromptIsActive,
        setNewPromptLanguage,
        setNewPromptOrder,
        setNewPromptText,
    };
};

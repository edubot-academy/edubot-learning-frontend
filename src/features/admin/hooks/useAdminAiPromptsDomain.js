import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
    addCourseAiPrompt,
    deleteCourseAiPrompt,
    fetchCourseAiPrompts,
    updateCourseAiPrompt,
} from '@services/api';
import { isForbiddenError } from '@shared/api/error';

export const useAdminAiPromptsDomain = ({ requestConfirmation }) => {
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
                toast.error('AI промпттарды жүктөөдө ката кетти');
            }
        } finally {
            setAiPromptsLoading(false);
        }
    }, []);

    const handleCreatePrompt = useCallback(async () => {
        if (!newPromptText.trim()) return;
        if (!aiPromptCourseId) {
            toast.error('AI промпт кошуу үчүн курс тандаңыз');
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
            toast.success('AI промпт ийгиликтүү кошулду');
            loadPromptsForCourse(aiPromptCourseId);
        } catch {
            toast.error('AI промпт кошууда ката кетти');
        }
    }, [
        aiPromptCourseId,
        loadPromptsForCourse,
        newPromptIsActive,
        newPromptLanguage,
        newPromptOrder,
        newPromptText,
    ]);

    const handleUpdatePrompt = useCallback(async (promptId, updates) => {
        try {
            await updateCourseAiPrompt(promptId, updates);
            setAiPrompts((prev) =>
                prev.map((prompt) => (prompt.id === promptId ? { ...prompt, ...updates } : prompt))
            );
            toast.success('AI промпт ийгиликтүү жаңыртылды');
        } catch {
            toast.error('AI промптти жаңыртууда ката кетти');
        }
    }, []);

    const handleDeletePrompt = useCallback(
        async (promptId) => {
            requestConfirmation({
                title: 'AI промптти өчүрүү',
                message: 'Бул AI промптти өчүрүүгө ишенимдүүсүзбү?',
                confirmLabel: 'Өчүрүү',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCourseAiPrompt(promptId);
                        setAiPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));
                        toast.success('AI промпт ийгиликтүү өчүрүлдү');
                    } catch {
                        toast.error('AI промптти өчүрүүдө ката кетти');
                    }
                },
            });
        },
        [requestConfirmation]
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

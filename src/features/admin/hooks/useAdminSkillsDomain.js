import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { createSkill, deleteSkill, fetchSkills, updateSkill } from '@services/api';
import { isForbiddenError, parseApiError } from '@shared/api/error';
import { useTranslation } from 'react-i18next';

export const useAdminSkillsDomain = ({ requestConfirmation }) => {
    const { t } = useTranslation();
    const [skills, setSkills] = useState([]);
    const [newSkillName, setNewSkillName] = useState('');

    const loadSkillsList = useCallback(async () => {
        try {
            const res = await fetchSkills();
            setSkills(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(parseApiError(error, t('adminSkills.toasts.loadError')).message);
            }
        }
    }, [t]);

    const handleCreateSkill = useCallback(async () => {
        if (!newSkillName.trim()) return;

        try {
            const created = await createSkill({ name: newSkillName.trim() });
            setSkills((prev) => [...prev, created]);
            setNewSkillName('');
            toast.success(t('adminSkills.toasts.created'));
        } catch (error) {
            toast.error(parseApiError(error, t('adminSkills.toasts.createError')).message);
        }
    }, [newSkillName, t]);

    const handleUpdateSkill = useCallback(async (skillId, newName) => {
        if (!newName.trim()) return;

        try {
            await updateSkill(skillId, { name: newName.trim() });
            setSkills((prev) =>
                prev.map((skill) =>
                    skill.id === skillId ? { ...skill, name: newName.trim() } : skill
                )
            );
            toast.success(t('adminSkills.toasts.updated'));
        } catch (error) {
            toast.error(parseApiError(error, t('adminSkills.toasts.updateError')).message);
        }
    }, [t]);

    const handleDeleteSkill = useCallback(
        async (skillId) => {
            requestConfirmation({
                title: t('adminSkills.confirm.deleteTitle'),
                message: t('adminSkills.confirm.deleteMessage'),
                confirmLabel: t('adminSkills.actions.delete'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteSkill(skillId);
                        setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
                        toast.success(t('adminSkills.toasts.deleted'));
                    } catch (error) {
                        toast.error(
                            parseApiError(error, t('adminSkills.toasts.deleteError')).message
                        );
                    }
                },
            });
        },
        [requestConfirmation, t]
    );

    return {
        handleCreateSkill,
        handleDeleteSkill,
        handleUpdateSkill,
        loadSkillsList,
        newSkillName,
        setNewSkillName,
        skills,
    };
};

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { createSkill, deleteSkill, fetchSkills, updateSkill } from '@services/api';
import { isForbiddenError } from '@shared/api/error';

export const useAdminSkillsDomain = ({ requestConfirmation }) => {
    const [skills, setSkills] = useState([]);
    const [newSkillName, setNewSkillName] = useState('');

    const loadSkillsList = useCallback(async () => {
        try {
            const res = await fetchSkills();
            setSkills(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Скиллдерди жүктөөдө ката кетти');
            }
        }
    }, []);

    const handleCreateSkill = useCallback(async () => {
        if (!newSkillName.trim()) return;

        try {
            const created = await createSkill({ name: newSkillName.trim() });
            setSkills((prev) => [...prev, created]);
            setNewSkillName('');
            toast.success('Скилл ийгиликтүү кошулду');
        } catch {
            toast.error('Скилл кошууда ката кетти');
        }
    }, [newSkillName]);

    const handleUpdateSkill = useCallback(async (skillId, newName) => {
        if (!newName.trim()) return;

        try {
            await updateSkill(skillId, { name: newName.trim() });
            setSkills((prev) =>
                prev.map((skill) =>
                    skill.id === skillId ? { ...skill, name: newName.trim() } : skill
                )
            );
            toast.success('Скилл ийгиликтүү жаңыртылды');
        } catch {
            toast.error('Скиллди жаңыртууда ката кетти');
        }
    }, []);

    const handleDeleteSkill = useCallback(
        async (skillId) => {
            requestConfirmation({
                title: 'Скиллди өчүрүү',
                message: 'Бул скилди өчүрүүгө ишенимдүүсүзбү?',
                confirmLabel: 'Өчүрүү',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteSkill(skillId);
                        setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
                        toast.success('Скилл ийгиликтүү өчүрүлдү');
                    } catch {
                        toast.error('Скилди өчүрүүдө ката кетти');
                    }
                },
            });
        },
        [requestConfirmation]
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

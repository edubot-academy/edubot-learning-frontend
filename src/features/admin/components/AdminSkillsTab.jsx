/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiCheckCircle, FiEdit3, FiPlus, FiSave, FiTag, FiTrash2, FiX } from 'react-icons/fi';

const AdminSkillsTab = ({
    skills,
    newSkillName,
    setNewSkillName,
    onCreateSkill,
    onUpdateSkill,
    onDeleteSkill,
}) => {
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [editingSkillName, setEditingSkillName] = useState('');

    const normalizedSkills = useMemo(
        () => skills.filter((skill) => typeof skill?.name === 'string' && skill.name.trim()),
        [skills]
    );

    const uniqueInitials = useMemo(
        () => new Set(normalizedSkills.map((skill) => skill.name.trim().charAt(0).toUpperCase())).size,
        [normalizedSkills]
    );

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Skills catalog"
                title="Скиллдер"
                description="Курс жана талант маалыматтарында колдонулуучу скиллдерди ушул жерден башкарыңыз."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label="Бардык скиллдер"
                    value={normalizedSkills.length}
                    icon={FiTag}
                />
                <DashboardMetricCard
                    label="Топтолгон баш тамгалар"
                    value={uniqueInitials}
                    icon={FiCheckCircle}
                    tone={uniqueInitials ? 'green' : 'default'}
                />
                <DashboardMetricCard
                    label="Редакция режиминде"
                    value={editingSkillId ? '1' : '0'}
                    icon={FiEdit3}
                    tone={editingSkillId ? 'blue' : 'default'}
                />
            </div>

            <DashboardInsetPanel
                title="Жаңы скилл"
                description="Кыска, стандартташкан аталыш колдонуңуз."
            >
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="dashboard-field flex-1"
                        placeholder="Жаңы скиллдин аталышы"
                    />
                    <button type="button" onClick={onCreateSkill} className="dashboard-button-primary self-start">
                        <FiPlus className="h-4 w-4" />
                        Кошуу
                    </button>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title="Скилл тизмеси"
                description="Бардык активдүү скиллдер."
            >
                {normalizedSkills.length ? (
                    <div className="mt-4 grid gap-3">
                        {normalizedSkills.map((skill) => (
                            <div
                                key={skill.id}
                                className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                {editingSkillId === skill.id ? (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <input
                                            value={editingSkillName}
                                            onChange={(e) => setEditingSkillName(e.target.value)}
                                            className="dashboard-field flex-1"
                                            placeholder="Скиллдин аталышы"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onUpdateSkill(skill.id, editingSkillName);
                                                    setEditingSkillId(null);
                                                    setEditingSkillName('');
                                                }}
                                                className="dashboard-button-primary"
                                            >
                                                <FiSave className="h-4 w-4" />
                                                Сактоо
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingSkillId(null);
                                                    setEditingSkillName('');
                                                }}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiX className="h-4 w-4" />
                                                Жокко чыгаруу
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <span className="font-medium text-edubot-ink dark:text-white">{skill.name}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingSkillId(skill.id);
                                                    setEditingSkillName(skill.name);
                                                }}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiEdit3 className="h-4 w-4" />
                                                Өзгөртүү
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteSkill(skill.id)}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                Өчүрүү
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyState
                            title="Скиллдер жок"
                            subtitle="Азырынча скилл каталогу бош."
                        />
                    </div>
                )}
            </DashboardInsetPanel>
        </div>
    );
};

export default AdminSkillsTab;

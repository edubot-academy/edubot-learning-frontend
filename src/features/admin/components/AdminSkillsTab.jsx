
import { useMemo, useState } from 'react';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiCheckCircle, FiEdit3, FiPlus, FiSave, FiTag, FiTrash2, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AdminSkillsTab = ({
    skills,
    newSkillName,
    setNewSkillName,
    onCreateSkill,
    onUpdateSkill,
    onDeleteSkill,
}) => {
    const { t } = useTranslation();
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
                eyebrow={t('adminSkills.eyebrow')}
                title={t('adminSkills.title')}
                description={t('adminSkills.description')}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label={t('adminSkills.metrics.total')}
                    value={normalizedSkills.length}
                    icon={FiTag}
                />
                <DashboardMetricCard
                    label={t('adminSkills.metrics.initials')}
                    value={uniqueInitials}
                    icon={FiCheckCircle}
                    tone={uniqueInitials ? 'green' : 'default'}
                />
                <DashboardMetricCard
                    label={t('adminSkills.metrics.editMode')}
                    value={editingSkillId ? '1' : '0'}
                    icon={FiEdit3}
                    tone={editingSkillId ? 'blue' : 'default'}
                />
            </div>

            <DashboardInsetPanel
                title={t('adminSkills.create.title')}
                description={t('adminSkills.create.description')}
            >
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="dashboard-field flex-1"
                        placeholder={t('adminSkills.create.placeholder')}
                    />
                    <button
                        type="button"
                        onClick={onCreateSkill}
                        className="dashboard-button-primary self-start"
                    >
                        <FiPlus className="h-4 w-4" />
                        {t('adminSkills.actions.add')}
                    </button>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('adminSkills.list.title')}
                description={t('adminSkills.list.description')}
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
                                            placeholder={t('adminSkills.create.placeholder')}
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
                                                {t('company.settings.saveChanges')}
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
                                                {t('company.settings.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <span className="font-medium text-edubot-ink dark:text-white">
                                                {skill.name}
                                            </span>
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
                                                {t('company.settings.editProfile')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteSkill(skill.id)}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                {t('adminSkills.actions.delete')}
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
                            title={t('adminSkills.empty.title')}
                            subtitle={t('adminSkills.empty.subtitle')}
                        />
                    </div>
                )}
            </DashboardInsetPanel>
        </div>
    );
};

export default AdminSkillsTab;

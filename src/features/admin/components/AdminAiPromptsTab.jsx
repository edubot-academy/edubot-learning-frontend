
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import Loader from '@shared/ui/Loader';
import { FiCheckCircle, FiEdit3, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';

const LANGUAGES = ['ky', 'ru', 'en'];
const ORDER_OPTIONS = [0, 1, 2];

const AdminAiPromptsTab = ({
    courses,
    aiPromptCourseId,
    setAiPromptCourseId,
    newPromptText,
    setNewPromptText,
    newPromptLanguage,
    setNewPromptLanguage,
    newPromptOrder,
    setNewPromptOrder,
    newPromptIsActive,
    setNewPromptIsActive,
    aiPrompts,
    aiPromptsLoading,
    onCreatePrompt,
    onUpdatePrompt,
    onDeletePrompt,
}) => {
    const { t } = useTranslation();
    const [editingPromptId, setEditingPromptId] = useState(null);
    const [editingPrompt, setEditingPrompt] = useState({
        text: '',
        language: 'ky',
        order: 0,
        isActive: true,
    });

    const activePrompts = aiPrompts.filter((prompt) => prompt.isActive).length;

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('adminAiPrompts.eyebrow')}
                title={t('adminAiPrompts.title')}
                description={t('adminAiPrompts.description')}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label={t('adminAiPrompts.metrics.total')}
                    value={aiPrompts.length}
                    icon={FiEdit3}
                />
                <DashboardMetricCard
                    label={t('adminAiPrompts.metrics.active')}
                    value={activePrompts}
                    icon={FiCheckCircle}
                    tone={activePrompts ? 'green' : 'default'}
                />
                <DashboardMetricCard
                    label={t('adminAiPrompts.metrics.selectedCourse')}
                    value={aiPromptCourseId ? '1' : '0'}
                    icon={FiPlus}
                    tone={aiPromptCourseId ? 'blue' : 'default'}
                />
            </div>

            <DashboardInsetPanel
                title={t('adminAiPrompts.create.title')}
                description={t('adminAiPrompts.create.description')}
            >
                <div className="mt-4 space-y-4">
                    <select
                        value={aiPromptCourseId || ''}
                        onChange={(e) => setAiPromptCourseId(e.target.value)}
                        className="dashboard-select w-full"
                    >
                        <option value="">{t('adminAiPrompts.create.selectCourse')}</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                        <input
                            type="text"
                            value={newPromptText}
                            onChange={(e) => setNewPromptText(e.target.value)}
                            className="dashboard-field"
                            placeholder={t('adminAiPrompts.create.promptPlaceholder')}
                        />
                        <select
                            value={newPromptLanguage}
                            onChange={(e) => setNewPromptLanguage(e.target.value)}
                            className="dashboard-select"
                        >
                            {LANGUAGES.map((language) => (
                                <option key={language} value={language}>
                                    {t(`adminAiPrompts.languages.${language}`)}
                                </option>
                            ))}
                        </select>
                        <select
                            value={newPromptOrder}
                            onChange={(e) => setNewPromptOrder(e.target.value)}
                            className="dashboard-select"
                        >
                            {ORDER_OPTIONS.map((order) => (
                                <option key={order} value={order}>
                                    {t(`adminAiPrompts.order.${order}`)}
                                </option>
                            ))}
                        </select>
                        <label className="inline-flex items-center gap-2 rounded-2xl border border-edubot-line/70 bg-white/80 px-3 py-3 text-sm text-edubot-ink dark:border-slate-700 dark:bg-slate-900/80 dark:text-white">
                            <input
                                type="checkbox"
                                checked={newPromptIsActive}
                                onChange={(e) => setNewPromptIsActive(e.target.checked)}
                                className="h-4 w-4"
                            />
                            {t('adminAiPrompts.status.active')}
                        </label>
                    </div>

                    <button type="button" onClick={onCreatePrompt} className="dashboard-button-primary">
                        <FiPlus className="h-4 w-4" />
                        {t('adminAiPrompts.actions.add')}
                    </button>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('adminAiPrompts.list.title')}
                description={t('adminAiPrompts.list.description')}
            >
                {aiPromptsLoading ? (
                    <div className="py-6">
                        <Loader fullScreen={false} />
                    </div>
                ) : aiPrompts.length ? (
                    <div className="mt-4 space-y-3">
                        {aiPrompts.map((aiPrompt) => (
                            <div
                                key={aiPrompt.id}
                                className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    {editingPromptId === aiPrompt.id ? (
                                        <div className="grid flex-1 gap-3">
                                            <input
                                                type="text"
                                                value={editingPrompt.text}
                                                onChange={(e) =>
                                                    setEditingPrompt((prev) => ({ ...prev, text: e.target.value }))
                                                }
                                                className="dashboard-field"
                                                placeholder={t('adminAiPrompts.create.editPlaceholder')}
                                            />
                                            <div className="grid gap-3 md:grid-cols-[auto_auto_auto]">
                                                <select
                                                    value={editingPrompt.language}
                                                    onChange={(e) =>
                                                        setEditingPrompt((prev) => ({ ...prev, language: e.target.value }))
                                                    }
                                                    className="dashboard-select"
                                                >
                                                    {LANGUAGES.map((language) => (
                                                        <option key={language} value={language}>
                                                            {t(`adminAiPrompts.languages.${language}`)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={editingPrompt.order}
                                                    onChange={(e) =>
                                                        setEditingPrompt((prev) => ({ ...prev, order: Number(e.target.value) }))
                                                    }
                                                    className="dashboard-select"
                                                >
                                                    {ORDER_OPTIONS.map((order) => (
                                                        <option key={order} value={order}>
                                                            {t(`adminAiPrompts.order.${order}`)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <label className="inline-flex items-center gap-2 rounded-2xl border border-edubot-line/70 bg-white/80 px-3 py-3 text-sm text-edubot-ink dark:border-slate-700 dark:bg-slate-900/80 dark:text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPrompt.isActive}
                                                        onChange={(e) =>
                                                            setEditingPrompt((prev) => ({ ...prev, isActive: e.target.checked }))
                                                        }
                                                        className="h-4 w-4"
                                                    />
                                                    {t('adminAiPrompts.status.active')}
                                                </label>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onUpdatePrompt(aiPrompt.id, editingPrompt);
                                                        setEditingPromptId(null);
                                                    }}
                                                    className="dashboard-button-primary"
                                                >
                                                    <FiSave className="h-4 w-4" />
                                                    {t('adminAiPrompts.actions.save')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingPromptId(null);
                                                        setEditingPrompt({
                                                            text: '',
                                                            language: 'ky',
                                                            order: 0,
                                                            isActive: true,
                                                        });
                                                    }}
                                                    className="dashboard-button-secondary"
                                                >
                                                    <FiX className="h-4 w-4" />
                                                    {t('adminAiPrompts.actions.cancel')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="min-w-0">
                                                <p className="font-medium text-edubot-ink dark:text-white">{aiPrompt.text}</p>
                                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                    {t('adminAiPrompts.promptMeta', {
                                                        language: aiPrompt.language,
                                                        order: aiPrompt.order,
                                                        status: aiPrompt.isActive
                                                            ? t('adminAiPrompts.status.active')
                                                            : t('adminAiPrompts.status.inactive'),
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingPromptId(aiPrompt.id);
                                                        setEditingPrompt({
                                                            text: aiPrompt.text,
                                                            language: aiPrompt.language,
                                                            order: Number(aiPrompt.order || 0),
                                                            isActive: Boolean(aiPrompt.isActive),
                                                        });
                                                    }}
                                                    className="dashboard-button-secondary"
                                                >
                                                    <FiEdit3 className="h-4 w-4" />
                                                    {t('adminAiPrompts.actions.edit')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDeletePrompt(aiPrompt.id)}
                                                    className="dashboard-button-secondary"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                    {t('adminAiPrompts.actions.delete')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyState
                            title={t('adminAiPrompts.empty.title')}
                            subtitle={t('adminAiPrompts.empty.subtitle')}
                        />
                    </div>
                )}
            </DashboardInsetPanel>
        </div>
    );
};

export default AdminAiPromptsTab;

/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import Loader from '@shared/ui/Loader';
import { FiCheckCircle, FiEdit3, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';

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
            eyebrow="AI prompts"
            title="AI промпттар"
            description="Курс боюнча жардамчыга берилген системалык промпттарды бул жерден башкарыңыз."
        />

        <div className="grid gap-4 md:grid-cols-3">
            <DashboardMetricCard
                label="Бардык промпттар"
                value={aiPrompts.length}
                icon={FiEdit3}
            />
            <DashboardMetricCard
                label="Активдүү"
                value={activePrompts}
                icon={FiCheckCircle}
                tone={activePrompts ? 'green' : 'default'}
            />
            <DashboardMetricCard
                label="Тандалган курс"
                value={aiPromptCourseId ? '1' : '0'}
                icon={FiPlus}
                tone={aiPromptCourseId ? 'blue' : 'default'}
            />
        </div>

        <DashboardInsetPanel
            title="Курс жана жаңы промпт"
            description="Алгач курс тандап, андан кийин жаңы промпт кошуңуз."
        >
            <div className="mt-4 space-y-4">
                <select
                    value={aiPromptCourseId || ''}
                    onChange={(e) => setAiPromptCourseId(e.target.value)}
                    className="dashboard-select w-full"
                >
                    <option value="">Курс тандаңыз</option>
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
                        placeholder="Промпт текстин киргизиңиз"
                    />
                    <select
                        value={newPromptLanguage}
                        onChange={(e) => setNewPromptLanguage(e.target.value)}
                        className="dashboard-select"
                    >
                        <option value="ky">Кыргызча</option>
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                    </select>
                    <select
                        value={newPromptOrder}
                        onChange={(e) => setNewPromptOrder(e.target.value)}
                        className="dashboard-select"
                    >
                        <option value="0">Жогорку</option>
                        <option value="1">Ортосу</option>
                        <option value="2">Аягы</option>
                    </select>
                    <label className="inline-flex items-center gap-2 rounded-2xl border border-edubot-line/70 bg-white/80 px-3 py-3 text-sm text-edubot-ink dark:border-slate-700 dark:bg-slate-900/80 dark:text-white">
                        <input
                            type="checkbox"
                            checked={newPromptIsActive}
                            onChange={(e) => setNewPromptIsActive(e.target.checked)}
                            className="h-4 w-4"
                        />
                        Активдүү
                    </label>
                </div>

                <button type="button" onClick={onCreatePrompt} className="dashboard-button-primary">
                    <FiPlus className="h-4 w-4" />
                    Промпт кошуу
                </button>
            </div>
        </DashboardInsetPanel>

        <DashboardInsetPanel
            title="Промпт тизмеси"
            description="Тандалган курс үчүн учурдагы промпттар."
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
                                            placeholder="Промпт тексти"
                                        />
                                        <div className="grid gap-3 md:grid-cols-[auto_auto_auto]">
                                            <select
                                                value={editingPrompt.language}
                                                onChange={(e) =>
                                                    setEditingPrompt((prev) => ({ ...prev, language: e.target.value }))
                                                }
                                                className="dashboard-select"
                                            >
                                                <option value="ky">Кыргызча</option>
                                                <option value="ru">Русский</option>
                                                <option value="en">English</option>
                                            </select>
                                            <select
                                                value={editingPrompt.order}
                                                onChange={(e) =>
                                                    setEditingPrompt((prev) => ({ ...prev, order: Number(e.target.value) }))
                                                }
                                                className="dashboard-select"
                                            >
                                                <option value={0}>Жогорку</option>
                                                <option value={1}>Ортосу</option>
                                                <option value={2}>Аягы</option>
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
                                                Активдүү
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
                                                Сактоо
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
                                                Жокко чыгаруу
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="min-w-0">
                                            <p className="font-medium text-edubot-ink dark:text-white">{aiPrompt.text}</p>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                Тил: {aiPrompt.language} · Тартип: {aiPrompt.order} · {aiPrompt.isActive ? 'Активдүү' : 'Өчүрүлгөн'}
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
                                                Өзгөртүү
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeletePrompt(aiPrompt.id)}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                Өчүрүү
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
                        title="AI промпттар табылган жок"
                        subtitle="Бул курс үчүн азырынча промпт кошула элек."
                    />
                </div>
            )}
        </DashboardInsetPanel>
    </div>
    );
};

export default AdminAiPromptsTab;

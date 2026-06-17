import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import {
    listQuizTemplates,
    createQuizTemplate,
    deleteQuizTemplate,
    duplicateQuizTemplate,
} from '@features/quizTemplates/api';
import {
    listLessonPlanTemplates,
    createLessonPlanTemplate,
    updateLessonPlanTemplate,
    deleteLessonPlanTemplate,
} from '@features/lessonPlanTemplates/api';

const toArray = (v) =>
    Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : Array.isArray(v?.data) ? v.data : [];

const TemplatesTab = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('quiz');

    const [quizTemplates, setQuizTemplates] = useState([]);
    const [loadingQuiz, setLoadingQuiz] = useState(true);
    const [newQuizName, setNewQuizName] = useState('');
    const [creatingQuiz, setCreatingQuiz] = useState(false);

    const [lessonPlans, setLessonPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ title: '', content: '' });
    const [savingPlan, setSavingPlan] = useState(false);

    const loadQuizTemplates = useCallback(async () => {
        setLoadingQuiz(true);
        try {
            const data = await listQuizTemplates();
            setQuizTemplates(toArray(data));
        } finally {
            setLoadingQuiz(false);
        }
    }, []);

    const loadLessonPlans = useCallback(async () => {
        setLoadingPlans(true);
        try {
            const data = await listLessonPlanTemplates();
            setLessonPlans(toArray(data));
        } finally {
            setLoadingPlans(false);
        }
    }, []);

    useEffect(() => {
        loadQuizTemplates();
        loadLessonPlans();
    }, [loadQuizTemplates, loadLessonPlans]);

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        if (!newQuizName.trim()) return;
        setCreatingQuiz(true);
        try {
            const created = await createQuizTemplate({ name: newQuizName.trim() });
            setQuizTemplates((prev) => [created, ...prev]);
            setNewQuizName('');
        } catch {
            toast.error(t('instructorDashboard.templates.quizTemplates.toasts.createFailed'));
        } finally {
            setCreatingQuiz(false);
        }
    };

    const handleDeleteQuiz = async (id) => {
        try {
            await deleteQuizTemplate(id);
            setQuizTemplates((prev) => prev.filter((q) => q.id !== id));
        } catch {
            toast.error(t('instructorDashboard.templates.quizTemplates.toasts.deleteFailed'));
        }
    };

    const handleDuplicateQuiz = async (id) => {
        try {
            const duped = await duplicateQuizTemplate(id);
            setQuizTemplates((prev) => [duped, ...prev]);
            toast.success(t('instructorDashboard.templates.quizTemplates.toasts.duplicated'));
        } catch {
            toast.error(t('instructorDashboard.templates.quizTemplates.toasts.createFailed'));
        }
    };

    const startNewPlan = () => {
        setEditingPlan('new');
        setPlanForm({ title: '', content: '' });
    };

    const startEditPlan = (plan) => {
        setEditingPlan(plan.id);
        setPlanForm({ title: plan.title || plan.name || '', content: plan.content || '' });
    };

    const cancelEditPlan = () => {
        setEditingPlan(null);
        setPlanForm({ title: '', content: '' });
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        if (!planForm.title.trim()) return;
        setSavingPlan(true);
        try {
            if (editingPlan === 'new') {
                const created = await createLessonPlanTemplate(planForm);
                setLessonPlans((prev) => [created, ...prev]);
            } else {
                const updated = await updateLessonPlanTemplate(editingPlan, planForm);
                setLessonPlans((prev) => prev.map((p) => (p.id === editingPlan ? updated : p)));
            }
            cancelEditPlan();
        } catch {
            toast.error(
                editingPlan === 'new'
                    ? t('instructorDashboard.templates.lessonPlanTemplates.toasts.createFailed')
                    : t('instructorDashboard.templates.lessonPlanTemplates.toasts.updateFailed')
            );
        } finally {
            setSavingPlan(false);
        }
    };

    const handleDeletePlan = async (id) => {
        try {
            await deleteLessonPlanTemplate(id);
            setLessonPlans((prev) => prev.filter((p) => p.id !== id));
        } catch {
            toast.error(t('instructorDashboard.templates.lessonPlanTemplates.toasts.deleteFailed'));
        }
    };

    const tabs = [
        { id: 'quiz', label: t('instructorDashboard.templates.quizTab') },
        { id: 'lessonPlan', label: t('instructorDashboard.templates.lessonPlanTab') },
    ];

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('instructorDashboard.templates.eyebrow')}
                title={t('instructorDashboard.nav.templates')}
                description={
                    activeTab === 'quiz'
                        ? t('instructorDashboard.templates.quizTemplates.description')
                        : t('instructorDashboard.templates.lessonPlanTemplates.description')
                }
            />

            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                            activeTab === tab.id
                                ? 'border-edubot-orange bg-edubot-orange text-white'
                                : 'border-edubot-line bg-white text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'quiz' && (
                <DashboardInsetPanel
                    title={t('instructorDashboard.templates.quizTemplates.title')}
                    description={t('instructorDashboard.templates.quizTemplates.description')}
                >
                    <form onSubmit={handleCreateQuiz} className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={newQuizName}
                            onChange={(e) => setNewQuizName(e.target.value)}
                            placeholder={t('instructorDashboard.templates.quizTemplates.createPlaceholder')}
                            className="flex-1 rounded-xl border border-edubot-line bg-white px-3 py-2 text-sm text-edubot-ink placeholder-edubot-muted focus:border-edubot-orange focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={creatingQuiz || !newQuizName.trim()}
                            className="flex items-center gap-1.5 rounded-xl bg-edubot-orange px-4 py-2 text-xs font-semibold text-white hover:bg-edubot-orange/90 disabled:opacity-50"
                        >
                            <FiPlus className="h-3.5 w-3.5" />
                            {t('instructorDashboard.templates.quizTemplates.create')}
                        </button>
                    </form>

                    <div className="mt-4 space-y-2">
                        {loadingQuiz ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 animate-pulse rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                                ))}
                            </div>
                        ) : quizTemplates.length === 0 ? (
                            <EmptyState
                                title={t('instructorDashboard.templates.quizTemplates.empty.title')}
                                subtitle={t('instructorDashboard.templates.quizTemplates.empty.subtitle')}
                                icon={<FiCopy className="h-8 w-8 text-edubot-orange" />}
                            />
                        ) : (
                            quizTemplates.map((tmpl) => (
                                <div
                                    key={tmpl.id}
                                    className="flex items-center justify-between rounded-2xl border border-edubot-line/70 bg-white/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <p className="text-sm font-medium text-edubot-ink dark:text-white">
                                        {tmpl.name || tmpl.title}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDuplicateQuiz(tmpl.id)}
                                            className="text-xs text-edubot-muted hover:text-edubot-orange dark:text-slate-400"
                                        >
                                            {t('instructorDashboard.templates.quizTemplates.actions.duplicate')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteQuiz(tmpl.id)}
                                            className="text-xs text-red-500 hover:text-red-600"
                                        >
                                            {t('instructorDashboard.templates.quizTemplates.actions.delete')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DashboardInsetPanel>
            )}

            {activeTab === 'lessonPlan' && (
                <DashboardInsetPanel
                    title={t('instructorDashboard.templates.lessonPlanTemplates.title')}
                    description={t('instructorDashboard.templates.lessonPlanTemplates.description')}
                >
                    <div className="mt-4">
                        {editingPlan ? (
                            <form onSubmit={handleSavePlan} className="space-y-3 rounded-2xl border border-edubot-orange/40 bg-edubot-surfaceAlt/60 p-4 dark:border-slate-600 dark:bg-slate-900/70">
                                <input
                                    type="text"
                                    value={planForm.title}
                                    onChange={(e) => setPlanForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder={t('instructorDashboard.templates.lessonPlanTemplates.titlePlaceholder')}
                                    className="w-full rounded-xl border border-edubot-line bg-white px-3 py-2 text-sm text-edubot-ink placeholder-edubot-muted focus:border-edubot-orange focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                <textarea
                                    rows={5}
                                    value={planForm.content}
                                    onChange={(e) => setPlanForm((p) => ({ ...p, content: e.target.value }))}
                                    placeholder={t('instructorDashboard.templates.lessonPlanTemplates.contentPlaceholder')}
                                    className="w-full rounded-xl border border-edubot-line bg-white px-3 py-2 text-sm text-edubot-ink placeholder-edubot-muted focus:border-edubot-orange focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={savingPlan || !planForm.title.trim()}
                                        className="rounded-xl bg-edubot-orange px-4 py-2 text-xs font-semibold text-white hover:bg-edubot-orange/90 disabled:opacity-50"
                                    >
                                        {editingPlan === 'new'
                                            ? t('instructorDashboard.templates.lessonPlanTemplates.save')
                                            : t('instructorDashboard.templates.lessonPlanTemplates.update')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEditPlan}
                                        className="rounded-xl border border-edubot-line px-4 py-2 text-xs font-semibold text-edubot-muted hover:border-edubot-orange dark:border-slate-700 dark:text-slate-400"
                                    >
                                        {t('instructorDashboard.templates.lessonPlanTemplates.actions.cancel')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={startNewPlan}
                                className="flex items-center gap-1.5 rounded-xl border border-dashed border-edubot-line px-4 py-2 text-xs font-semibold text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-600 dark:text-slate-400"
                            >
                                <FiPlus className="h-3.5 w-3.5" />
                                {t('instructorDashboard.templates.lessonPlanTemplates.new')}
                            </button>
                        )}
                    </div>

                    <div className="mt-4 space-y-2">
                        {loadingPlans ? (
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                                ))}
                            </div>
                        ) : lessonPlans.length === 0 && !editingPlan ? (
                            <EmptyState
                                title={t('instructorDashboard.templates.lessonPlanTemplates.empty.title')}
                                subtitle={t('instructorDashboard.templates.lessonPlanTemplates.empty.subtitle')}
                                icon={<FiCopy className="h-8 w-8 text-edubot-orange" />}
                            />
                        ) : (
                            lessonPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="rounded-2xl border border-edubot-line/70 bg-white/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-edubot-ink dark:text-white">
                                                {plan.title || plan.name}
                                            </p>
                                            {plan.content && (
                                                <p className="mt-1 line-clamp-2 text-xs text-edubot-muted dark:text-slate-400">
                                                    {plan.content}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEditPlan(plan)}
                                                className="text-xs text-edubot-muted hover:text-edubot-orange dark:text-slate-400"
                                            >
                                                {t('instructorDashboard.templates.lessonPlanTemplates.actions.edit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                                            >
                                                <FiTrash2 className="h-3 w-3" />
                                                {t('instructorDashboard.templates.lessonPlanTemplates.actions.delete')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DashboardInsetPanel>
            )}
        </div>
    );
};

export default TemplatesTab;

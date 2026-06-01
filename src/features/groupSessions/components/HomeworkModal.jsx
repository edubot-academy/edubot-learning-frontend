import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiEdit3, FiFileText, FiPaperclip, FiX, FiZap } from 'react-icons/fi';

const formatHomeworkDraftDescription = (output, rubricLabel) => {
  const normalized = normalizeHomeworkDraftOutput(output);
  const description = normalized?.description || '';
  const rubric = Array.isArray(normalized?.rubric)
    ? normalized.rubric
      .map((item) => {
        const criterion = item?.criterion || item?.label || '';
        const points = item?.points ?? item?.score ?? '';
        return [criterion, points ? `(${points})` : ''].filter(Boolean).join(' ');
      })
      .filter(Boolean)
    : [];

  if (!rubric.length) return description;
  return [description, `${rubricLabel}:\n${rubric.map((item) => `- ${item}`).join('\n')}`]
    .filter(Boolean)
    .join('\n\n');
};

const normalizeHomeworkDraftOutput = (output) => {
  if (!output) return output;
  let nested = null;
  if (typeof output.description === 'string' && output.description.trim().startsWith('{')) {
    try {
      nested = JSON.parse(output.description);
    } catch {
      nested = null;
    }
  }
  const merged = nested && (nested.description || nested.title)
    ? { ...output, ...nested }
    : output;
  return {
    ...merged,
    description: String(merged.description || '').replace(/\\n/g, '\n').replace(/\\"/g, '"').trim(),
    maxScore: Number(merged.maxScore) > 0 ? Number(merged.maxScore) : null,
  };
};

const GENERIC_HOMEWORK_TOPICS = new Set([
  'homework',
  'assignment',
  'task',
  'practice',
  'test',
  '\u04af\u0439 \u0442\u0430\u043f\u0448\u044b\u0440\u043c\u0430',
  '\u0442\u0430\u043f\u0448\u044b\u0440\u043c\u0430',
  '\u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0430',
  '\u0434\u043e\u043c\u0430\u0448\u043d\u0435\u0435 \u0437\u0430\u0434\u0430\u043d\u0438\u0435',
  '\u0437\u0430\u0434\u0430\u043d\u0438\u0435',
]);

const getHomeworkTopicIssueKey = (value) => {
  const topic = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!topic) return 'required';
  if (topic.length < 6) return 'tooShort';
  if (/^[\d\W_]+$/.test(topic) || /(.)\1{4,}/.test(topic)) return 'meaningless';
  if (GENERIC_HOMEWORK_TOPICS.has(topic)) return 'generic';
  return '';
};

const HomeworkModal = ({
  isOpen,
  onClose,
  onSubmit,
  homework,
  mode,
  loading,
  selectedSession,
  aiDraftEnabled,
  aiDraft,
  aiDraftLoading,
  aiDraftError,
  onRequestAiDraft,
  onUseAiDraft,
  onCancelAiDraft,
}) => {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
  const modalTitle = isEdit
    ? t('groupSessions.homeworkModal.header.editTitle')
    : t('groupSessions.homeworkModal.header.createTitle');
  const submitButtonText = isEdit
    ? t('groupSessions.homeworkModal.actions.update')
    : t('groupSessions.homeworkModal.actions.create');
  const defaultValues = useMemo(() => ({
    title: homework?.title || '',
    description: homework?.description || '',
    deadline: homework?.deadline || '',
    isPublished: homework?.isPublished || false,
  }), [homework?.title, homework?.description, homework?.deadline, homework?.isPublished]);

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [createMode, setCreateMode] = useState('manual');
  const [aiTopicTouched, setAiTopicTouched] = useState(false);
  const [aiBrief, setAiBrief] = useState({
    topic: defaultValues.title || selectedSession?.title || '',
    instructions: '',
    difficulty: '',
    maxScore: '',
    includeRubric: true,
  });
  const aiTopicIssueKey = getHomeworkTopicIssueKey(aiBrief.topic);
  const canGenerateAiDraft = !aiTopicIssueKey && !loading && !aiDraftLoading;
  const normalizedAiDraftOutput = useMemo(
    () => normalizeHomeworkDraftOutput(aiDraft?.output),
    [aiDraft?.output]
  );

  // Reset form when homework changes
  useEffect(() => {
    setFormData(defaultValues);
    setErrors({});
    setCreateMode('manual');
  }, [defaultValues, mode]);

  useEffect(() => {
    setAiBrief({
      topic: defaultValues.title || selectedSession?.title || '',
      instructions: '',
      difficulty: '',
      maxScore: '',
      includeRubric: true,
    });
    setAiTopicTouched(false);
    setCreateMode('manual');
  }, [defaultValues.title, isOpen, selectedSession?.id, selectedSession?.title]);

  useEffect(() => {
    if (aiDraft) {
      setCreateMode('ai');
    }
  }, [aiDraft]);

  if (!isOpen || typeof document === 'undefined') return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('groupSessions.homeworkModal.validation.titleRequired');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('groupSessions.homeworkModal.validation.descriptionRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline || null,
      isPublished: formData.isPublished,
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && !aiTopicTouched) {
      setAiBrief((current) => ({ ...current, topic: value || selectedSession?.title || '' }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUseAiDraft = async () => {
    if (!aiDraft?.output) return;
    const accepted = await onUseAiDraft?.();
    if (!accepted) return;
    setFormData((current) => ({
      ...current,
      title: normalizedAiDraftOutput?.title || current.title,
      description: formatHomeworkDraftDescription(normalizedAiDraftOutput, t('ai.rubric')) || current.description,
      isPublished: false,
    }));
    setCreateMode('manual');
  };

  const handleAiBriefChange = (field, value) => {
    if (field === 'topic') {
      setAiTopicTouched(true);
    }
    setAiBrief((current) => ({ ...current, [field]: value }));
  };

  const openAiBrief = () => {
    if (!aiBrief.topic.trim()) {
      setAiBrief((current) => ({ ...current, topic: formData.title || selectedSession?.title || '' }));
      setAiTopicTouched(Boolean(formData.title));
    }
  };

  const handleRequestAiDraft = () => {
    if (!canGenerateAiDraft) return;
    onRequestAiDraft?.({
      topic: aiBrief.topic.trim(),
      instructions: aiBrief.instructions.trim(),
      difficulty: aiBrief.difficulty.trim(),
      maxScore: aiBrief.maxScore,
      includeRubric: aiBrief.includeRubric,
    });
  };

  const formatDeadlineForInput = (deadline) => {
    if (!deadline) return '';
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
        {/* Header */}
        <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange dark:border-edubot-orange/25 dark:bg-slate-900/60">
                <FiEdit3 className="h-3 w-3" />
                {isEdit
                  ? t('groupSessions.homeworkModal.header.editEyebrow')
                  : t('groupSessions.homeworkModal.header.createEyebrow')}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]">
                  {modalTitle}
                </h2>
                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                  {isEdit
                    ? t('groupSessions.homeworkModal.header.editDescription')
                    : t('groupSessions.homeworkModal.header.createDescription')
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
              aria-label={t('common.closeMenu')}
            >
              <FiX className="text-xl leading-none" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
            {aiDraftEnabled && !isEdit ? (
              <div className="inline-grid w-full max-w-md grid-cols-2 gap-1 rounded-lg border border-edubot-line/80 bg-edubot-surfaceAlt/60 p-1 dark:border-slate-700 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => setCreateMode('manual')}
                  className={`min-h-10 rounded-md px-3 text-sm font-semibold transition ${createMode === 'manual' ? 'bg-white text-edubot-ink shadow-sm dark:bg-slate-800 dark:text-white' : 'text-edubot-muted hover:text-edubot-ink dark:text-slate-400 dark:hover:text-white'}`}
                >
                  {t('ai.manualMode')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateMode('ai');
                    openAiBrief();
                  }}
                  className={`min-h-10 rounded-md px-3 text-sm font-semibold transition ${createMode === 'ai' ? 'bg-white text-edubot-ink shadow-sm dark:bg-slate-800 dark:text-white' : 'text-edubot-muted hover:text-edubot-ink dark:text-slate-400 dark:hover:text-white'}`}
                >
                  {t('ai.aiDraftMode')}
                </button>
              </div>
            ) : null}
            {/* Basic Information */}
            {createMode === 'manual' ? (
            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
              <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                <FiFileText className="h-4 w-4 text-edubot-orange" />
                {t('groupSessions.homeworkModal.sections.basic')}
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">
                    {t('groupSessions.homeworkModal.fields.title')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('groupSessions.homeworkModal.placeholders.title')}
                    className={`dashboard-field ${errors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">
                    {t('groupSessions.homeworkModal.fields.description')} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('groupSessions.homeworkModal.placeholders.description')}
                    rows={4}
                    className={`dashboard-field resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>
              </div>
            </section>
            ) : null}

            {/* AI homework draft */}
            {aiDraftEnabled && !isEdit && createMode === 'ai' ? (
	              <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
	                <div className="flex flex-wrap items-center justify-between gap-3">
	                  <div>
	                    <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
	                      <FiZap className="h-4 w-4 text-edubot-orange" />
	                      {t('ai.homeworkDraft')}
	                    </div>
	                    <p className="mt-1 max-w-xl text-xs text-amber-800 dark:text-amber-200">
	                      {t('ai.homeworkBrief.collapsedHelp')}
	                    </p>
	                  </div>
	                </div>
	                  <>
		                <div className="mt-4 grid gap-3 md:grid-cols-2">
		                  <label className="block text-sm">
	                    <span className="mb-1 block font-semibold text-edubot-ink dark:text-white">
	                      {t('ai.homeworkBrief.topic')} *
	                    </span>
	                    <input
	                      type="text"
	                      value={aiBrief.topic}
	                      onChange={(event) => handleAiBriefChange('topic', event.target.value)}
	                      placeholder={t('ai.homeworkBrief.topicPlaceholder')}
	                      className="dashboard-field"
	                      maxLength={160}
		                      disabled={loading || aiDraftLoading}
		                    />
		                    {aiTopicIssueKey ? (
		                      <p className="mt-1 text-xs text-red-600 dark:text-red-300">
		                        {t(`ai.homeworkBrief.topicIssues.${aiTopicIssueKey}`)}
		                      </p>
		                    ) : null}
		                  </label>
	                  <label className="block text-sm md:col-span-2">
	                    <span className="mb-1 block font-semibold text-edubot-ink dark:text-white">
	                      {t('ai.homeworkBrief.instructions')}
	                    </span>
	                    <textarea
	                      value={aiBrief.instructions}
	                      onChange={(event) => handleAiBriefChange('instructions', event.target.value)}
	                      placeholder={t('ai.homeworkBrief.instructionsPlaceholder')}
	                      rows={3}
	                      className="dashboard-field resize-none"
	                      disabled={loading || aiDraftLoading}
	                    />
	                  </label>
	                  <label className="block text-sm">
	                    <span className="mb-1 block font-semibold text-edubot-ink dark:text-white">
	                      {t('ai.homeworkBrief.difficulty')}
	                    </span>
	                    <select
	                      value={aiBrief.difficulty}
	                      onChange={(event) => handleAiBriefChange('difficulty', event.target.value)}
	                      className="dashboard-select"
	                      disabled={loading || aiDraftLoading}
	                    >
	                      <option value="">{t('ai.homeworkBrief.difficultyAuto')}</option>
	                      <option value="Beginner">{t('ai.homeworkBrief.difficultyBeginner')}</option>
	                      <option value="Intermediate">{t('ai.homeworkBrief.difficultyIntermediate')}</option>
	                      <option value="Advanced">{t('ai.homeworkBrief.difficultyAdvanced')}</option>
	                    </select>
	                  </label>
	                  <label className="block text-sm">
	                    <span className="mb-1 block font-semibold text-edubot-ink dark:text-white">
	                      {t('ai.homeworkBrief.maxScore')}
	                    </span>
	                    <input
	                      type="number"
	                      min="0"
	                      max="1000"
	                      value={aiBrief.maxScore}
	                      onChange={(event) => handleAiBriefChange('maxScore', event.target.value)}
	                      placeholder={t('ai.homeworkBrief.maxScorePlaceholder')}
	                      className="dashboard-field"
	                      disabled={loading || aiDraftLoading}
	                    />
	                  </label>
	                  <label className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-white/70 px-4 py-3 text-sm font-semibold text-edubot-ink dark:border-amber-500/30 dark:bg-slate-950/40 dark:text-white">
	                    <input
	                      type="checkbox"
	                      checked={aiBrief.includeRubric}
	                      onChange={(event) => handleAiBriefChange('includeRubric', event.target.checked)}
	                      className="h-4 w-4"
	                      disabled={loading || aiDraftLoading}
	                    />
	                    {t('ai.homeworkBrief.includeRubric')}
	                  </label>
	                </div>
		                <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
		                  {t('ai.homeworkBrief.help')}
		                </p>
		                <div className="mt-4 flex flex-wrap justify-end gap-2">
		                  <button
		                    type="button"
		                    onClick={handleRequestAiDraft}
		                    disabled={!canGenerateAiDraft}
		                    className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
		                  >
		                    <FiZap className="h-4 w-4" />
		                    {aiDraftLoading ? t('ai.generating') : t('ai.suggestHomework')}
		                  </button>
		                </div>
		              </>
	                {aiDraft ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-white/80 text-sm dark:border-amber-500/30 dark:bg-slate-950/70">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-100 px-4 py-3 dark:border-amber-500/20">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                          {t('ai.homeworkDraftReady')}
                        </div>
                        <p className="mt-1 break-words font-semibold text-edubot-ink dark:text-white">
                          {normalizedAiDraftOutput?.title || '-'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={handleUseAiDraft} className="dashboard-button-secondary min-w-0 whitespace-normal text-sm leading-tight">
                          {t('ai.useInManualForm')}
                        </button>
                        <button type="button" onClick={onCancelAiDraft} className="dashboard-button-secondary min-w-0 whitespace-normal text-sm leading-tight text-red-600">
                          {t('ai.cancelDraft')}
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-auto p-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-edubot-muted dark:text-slate-300">
                        {formatHomeworkDraftDescription(normalizedAiDraftOutput, t('ai.rubric')) || '-'}
                      </p>
                    </div>
                  </div>
                ) : null}
                {aiDraftError ? <p className="mt-3 text-xs text-red-600 dark:text-red-300">{aiDraftError}</p> : null}
              </section>
            ) : null}

            {/* Schedule */}
            {createMode === 'manual' ? (
            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
              <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                <FiCalendar className="h-4 w-4 text-edubot-orange" />
                {t('groupSessions.homeworkModal.sections.deadline')}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">
                  {t('groupSessions.homeworkModal.fields.deadline')}
                </label>
                <input
                  type="datetime-local"
                  value={formatDeadlineForInput(formData.deadline)}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="dashboard-field"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                  {t('groupSessions.homeworkModal.deadlineHelp')}
                </p>
              </div>
            </section>
            ) : null}

            {/* Publishing Options */}
            {createMode === 'manual' ? (
            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
              <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                <FiPaperclip className="h-4 w-4 text-edubot-orange" />
                {t('groupSessions.homeworkModal.sections.publishing')}
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                    className="h-4 w-4 rounded border-edubot-line text-edubot-orange focus:ring-edubot-orange disabled:opacity-50"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium text-edubot-ink dark:text-white">
                    {t('groupSessions.homeworkModal.fields.publishNow')}
                  </span>
                </label>
                <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                  {formData.isPublished
                    ? t('groupSessions.homeworkModal.publishHelp.published')
                    : t('groupSessions.homeworkModal.publishHelp.draft')
                  }
                </p>
              </div>
            </section>
            ) : null}

            {/* Session Context */}
            {selectedSession && createMode === 'manual' && (
              <section className="rounded-[1.75rem] border border-edubot-line/70 bg-slate-900 px-5 py-5 text-white dark:border-slate-700 dark:bg-slate-800">
                <div className="text-sm font-semibold text-white">
                  {t('groupSessions.homeworkModal.sections.context')}
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div>
                    <span className="font-semibold text-white">
                      {t('groupSessions.homeworkModal.context.session')}:
                    </span>{' '}
                    {selectedSession.title ||
                      t('groupSessions.homeworkModal.fallbacks.sessionWithId', {
                        id: selectedSession.sessionIndex || selectedSession.id,
                      })}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edubot-line/70 bg-white/95 px-6 py-4 dark:border-slate-700 dark:bg-[#151922]/95">
            <p className="text-sm text-edubot-muted dark:text-slate-400">
              {t('groupSessions.homeworkModal.escapeHint')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="dashboard-button-secondary"
                onClick={onClose}
                disabled={loading}
              >
                {t('groupSessions.homeworkModal.actions.cancel')}
              </button>
              {createMode === 'ai' ? (
                <button
                  type="button"
                  className="dashboard-button-secondary"
                  onClick={() => setCreateMode('manual')}
                >
                  {t('ai.manualMode')}
                </button>
              ) : null}
              {createMode === 'manual' ? (
              <button
                type="submit"
                disabled={loading}
                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t('groupSessions.homeworkModal.actions.saving') : submitButtonText}
              </button>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

HomeworkModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  homework: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    deadline: PropTypes.string,
    isPublished: PropTypes.bool,
  }),
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedSession: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  aiDraftEnabled: PropTypes.bool,
  aiDraft: PropTypes.shape({
    generationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    output: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      rubric: PropTypes.arrayOf(PropTypes.object),
    }),
  }),
  aiDraftLoading: PropTypes.bool,
  aiDraftError: PropTypes.string,
  onRequestAiDraft: PropTypes.func,
  onUseAiDraft: PropTypes.func,
  onCancelAiDraft: PropTypes.func,
};

HomeworkModal.defaultProps = {
  homework: null,
  selectedSession: null,
  aiDraftEnabled: false,
  aiDraft: null,
  aiDraftLoading: false,
  aiDraftError: '',
  onRequestAiDraft: undefined,
  onUseAiDraft: undefined,
  onCancelAiDraft: undefined,
};

export default HomeworkModal;

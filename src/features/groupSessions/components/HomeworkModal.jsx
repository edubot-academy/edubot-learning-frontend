import PropTypes from 'prop-types';
import { createPortal, useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiEdit3, FiFileText, FiPaperclip, FiX } from 'react-icons/fi';

const HomeworkModal = ({
  isOpen,
  onClose,
  onSubmit,
  homework,
  mode,
  loading,
  selectedSession,
}) => {
  const isEdit = mode === 'edit';
  const modalTitle = isEdit ? 'Үй тапшырманы өзгөртүү' : 'Жаңы үй тапшырма';
  const submitButtonText = isEdit ? 'Өзгөртүү' : 'Түзүү';
  const defaultValues = useMemo(() => ({
    title: homework?.title || '',
    description: homework?.description || '',
    deadline: homework?.deadline || '',
    isPublished: homework?.isPublished || false,
  }), [homework?.title, homework?.description, homework?.deadline, homework?.isPublished]);

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  // Reset form when homework changes
  useEffect(() => {
    setFormData(defaultValues);
    setErrors({});
  }, [defaultValues, mode]);

  if (!isOpen || typeof document === 'undefined') return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Тапшырма аталышын киргизиңиз';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Тапшырма сүрөттөмөн киргизиңиз';
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
                {isEdit ? 'Edit' : 'Create'}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]">
                  {modalTitle}
                </h2>
                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                  {isEdit
                    ? 'Тандалган үй тапшырманы өзгөртүңүз'
                    : 'Жаңы үй тапшырма түзүп, студенттерге жөнөтүңүз'
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
              aria-label="Жабуу"
            >
              <FiX className="text-xl leading-none" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
            {/* Basic Information */}
            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
              <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                <FiFileText className="h-4 w-4 text-edubot-orange" />
                Негизги маалымат
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">
                    Тапшырма аталышы *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Тапшырма аталышын киргизиңиз"
                    className={`dashboard-field ${errors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">
                    Тапшырма сүрөттөмө *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Тапшырманы толук сүрөттөңүз..."
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

            {/* Schedule */}
            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
              <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                <FiCalendar className="h-4 w-4 text-edubot-orange" />
                Мөөнөт
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-white">
                  Мөөнөт убактысы (ыктыярчы)
                </label>
                <input
                  type="datetime-local"
                  value={formatDeadlineForInput(formData.deadline)}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="dashboard-field"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                  Мөөнөт коюлбаса, студенттер каалаган убакта тапшырманы жөнөтө алышат
                </p>
              </div>
            </section>

            {/* Publishing Options */}
            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
              <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                <FiPaperclip className="h-4 w-4 text-edubot-orange" />
                Жарыялоо опциялары
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
                    Дароо жарыялоо
                  </span>
                </label>
                <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                  {formData.isPublished
                    ? 'Үй тапшырма дароо студенттерге көрүнөт'
                    : 'Үй тапшырма караңгы режимде сакталат, кийин жарыялай аласыз'
                  }
                </p>
              </div>
            </section>

            {/* Session Context */}
            {selectedSession && (
              <section className="rounded-[1.75rem] border border-edubot-line/70 bg-slate-900 px-5 py-5 text-white dark:border-slate-700 dark:bg-slate-800">
                <div className="text-sm font-semibold text-white">Контекст</div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div>
                    <span className="font-semibold text-white">Сессия:</span>{' '}
                    {selectedSession.title || `Session #${selectedSession.sessionIndex || selectedSession.id}`}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edubot-line/70 bg-white/95 px-6 py-4 dark:border-slate-700 dark:bg-[#151922]/95">
            <p className="text-sm text-edubot-muted dark:text-slate-400">
              Бардык өзгөртүүлөрдү сактап, жабуу үчүн Escape басыңыз.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="dashboard-button-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Жокко чыгаруу
              </button>
              <button
                type="submit"
                disabled={loading}
                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Сакталууда...' : submitButtonText}
              </button>
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
};

HomeworkModal.defaultProps = {
  homework: null,
  selectedSession: null,
};

export default HomeworkModal;

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiEdit3, FiSave } from 'react-icons/fi';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';

const formatSavedAt = (value, language) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(language || undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const SessionNotesTab = ({
    canEdit,
    hasChanges,
    notes,
    onChange,
    onSave,
    savedAt,
    saving,
}) => {
    const { i18n, t } = useTranslation();

    return (
        <div className="space-y-4">
            <DashboardInsetPanel
                title={t('groupSessions.notes.title')}
                description={t('groupSessions.notes.description')}
            >
            {canEdit ? (
                <div className="mt-4 space-y-4">
                    <div
                        className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
                            hasChanges
                                ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                                : notes.trim()
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                                  : 'border-edubot-line/80 bg-edubot-surface/70 text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300'
                        }`}
                    >
                        {hasChanges
                            ? t('groupSessions.notes.status.unsaved')
                            : notes.trim()
                              ? t('groupSessions.notes.status.saved')
                              : t('groupSessions.notes.status.empty')}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-sm text-edubot-muted dark:text-slate-300">
                            {saving
                                ? t('groupSessions.notes.saveState.saving')
                                : hasChanges
                                  ? t('groupSessions.notes.saveState.ready')
                                  : savedAt
                                    ? t('groupSessions.notes.saveState.lastSaved', {
                                        date: formatSavedAt(savedAt, i18n.language),
                                    })
                                    : t('groupSessions.notes.saveState.notCreated')}
                        </div>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving || !hasChanges}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? <FiCheckCircle className="h-4 w-4 animate-pulse" /> : <FiSave className="h-4 w-4" />}
                            {saving ? t('groupSessions.notes.actions.saving') : t('groupSessions.notes.actions.save')}
                        </button>
                    </div>

                    <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-edubot-ink dark:text-white">
                            <FiEdit3 className="h-4 w-4" />
                            {t('groupSessions.notes.field.label')}
                        </span>
                        <textarea
                            value={notes}
                            onChange={(event) => onChange(event.target.value)}
                            rows={12}
                            placeholder={t('groupSessions.notes.field.placeholder')}
                            className="w-full rounded-[1.25rem] border border-edubot-line bg-white px-4 py-3 text-sm text-edubot-ink outline-none transition placeholder:text-edubot-muted focus:border-edubot-orange focus:ring-2 focus:ring-edubot-orange/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                        />
                    </label>
                </div>
            ) : (
                <div className="mt-4 rounded-[1.25rem] border border-dashed border-edubot-line/80 bg-edubot-surface/60 p-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                    {t('groupSessions.notes.empty.selectSession')}
                </div>
            )}
            </DashboardInsetPanel>
        </div>
    );
};

SessionNotesTab.propTypes = {
    canEdit: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    notes: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    savedAt: PropTypes.string,
    saving: PropTypes.bool.isRequired,
};

SessionNotesTab.defaultProps = {
    savedAt: '',
};

export default SessionNotesTab;

import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit3 } from 'react-icons/fi';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';

const UNMARKED_ATTENDANCE_STATUS = '__unmarked__';

const getSessionStatusLabel = (status, t) =>
    t(`groupSessions.workspace.attendance.sessionStatus.${status}`, {
        defaultValue: status,
    });

const SessionAttendanceTab = ({
    applyAttendanceStatus,
    attendanceFilter,
    attendanceQuery,
    attendanceRows,
    attendanceStats,
    canImportZoomAttendance,
    filteredStudents,
    hasAttendanceChanges,
    importZoomAttendanceToSession,
    importingAttendance,
    loadingStudents,
    saveAttendance,
    savingAttendance,
    selectedCourseId,
    selectedGroup,
    selectedSession,
    selectedSessionId,
    selectedSessionMode,
    setAttendanceFilter,
    setAttendanceQuery,
    students,
    updateNotes,
    updateStatus,
    toSessionTime,
}) => {
    const { t } = useTranslation();
    const statusOptions = useMemo(
        () => [
            {
                value: UNMARKED_ATTENDANCE_STATUS,
                label: t('groupSessions.workspace.attendance.filters.unmarked'),
            },
            ...Object.values(SESSION_ATTENDANCE_STATUS).map((status) => ({
                value: status,
                label: getSessionStatusLabel(status, t),
            })),
        ],
        [t]
    );

    const sessionModeLabel = selectedSessionMode
        ? t(`groupSessions.workspace.attendance.sessionModes.${selectedSessionMode}`, { defaultValue: '' })
        : '';

    return (
        <>
            <DashboardInsetPanel
                title={t('groupSessions.workspace.attendance.title')}
                description={t('groupSessions.workspace.attendance.description')}
            >
            <div className="mt-4 space-y-4">
                <div className="grid gap-3 rounded-[1.25rem] border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/80 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                            {selectedSession?.title || t('groupSessions.workspace.attendance.fallbacks.session', {
                                value: selectedSession?.sessionIndex || selectedSession?.id || '-',
                            })}
                        </p>
                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                            {selectedGroup?.name || selectedGroup?.code || t('groupSessions.workspace.attendance.fallbacks.group')} • {selectedSession?.startsAt ? toSessionTime(selectedSession.startsAt) : t('groupSessions.workspace.attendance.fallbacks.noTime')}
                            {sessionModeLabel ? ` • ${sessionModeLabel}` : ''}
                        </p>
                    </div>
                    <div className="grid gap-2 sm:grid-flow-col sm:auto-cols-max sm:justify-start lg:justify-end">
                        {canImportZoomAttendance ? (
                            <button
                                type="button"
                                onClick={importZoomAttendanceToSession}
                                disabled={importingAttendance || !selectedSessionId}
                                className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            >
                                {importingAttendance
                                    ? t('groupSessions.workspace.attendance.actions.importingZoom')
                                    : t('groupSessions.workspace.attendance.actions.importZoom')}
                            </button>
                        ) : null}
                        <button
                            onClick={saveAttendance}
                            disabled={
                                savingAttendance ||
                                loadingStudents ||
                                !selectedCourseId ||
                                !selectedSessionId ||
                                !hasAttendanceChanges
                            }
                            className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-2xl bg-edubot-orange px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(241,126,34,0.25)] transition hover:-translate-y-0.5 hover:bg-edubot-soft disabled:cursor-not-allowed disabled:opacity-60 dark:bg-edubot-orange dark:text-slate-950 dark:hover:bg-edubot-soft"
                        >
                            {savingAttendance
                                ? t('groupSessions.workspace.attendance.actions.saving')
                                : hasAttendanceChanges
                                  ? t('groupSessions.workspace.attendance.actions.save')
                                  : t('groupSessions.workspace.attendance.actions.noChanges')}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
                        <input
                            value={attendanceQuery}
                            onChange={(e) => setAttendanceQuery(e.target.value)}
                            placeholder={t('groupSessions.workspace.attendance.filters.searchPlaceholder')}
                            className="dashboard-field"
                        />
                        <select
                            value={attendanceFilter}
                            onChange={(e) => setAttendanceFilter(e.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            <option value="all">{t('groupSessions.workspace.attendance.filters.all')}</option>
                            <option value="unmarked">{t('groupSessions.workspace.attendance.filters.unmarked')}</option>
                            <option value={SESSION_ATTENDANCE_STATUS.PRESENT}>{getSessionStatusLabel(SESSION_ATTENDANCE_STATUS.PRESENT, t)}</option>
                            <option value={SESSION_ATTENDANCE_STATUS.LATE}>{getSessionStatusLabel(SESSION_ATTENDANCE_STATUS.LATE, t)}</option>
                            <option value={SESSION_ATTENDANCE_STATUS.ABSENT}>{getSessionStatusLabel(SESSION_ATTENDANCE_STATUS.ABSENT, t)}</option>
                            <option value={SESSION_ATTENDANCE_STATUS.EXCUSED}>{getSessionStatusLabel(SESSION_ATTENDANCE_STATUS.EXCUSED, t)}</option>
                            <option value="changed">{t('groupSessions.workspace.attendance.filters.changed')}</option>
                        </select>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <button
                            type="button"
                            onClick={() =>
                                applyAttendanceStatus(
                                    filteredStudents.map((student) => student.id),
                                    SESSION_ATTENDANCE_STATUS.PRESENT
                                )
                            }
                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            disabled={!selectedSessionId}
                        >
                            {t('groupSessions.workspace.attendance.bulk.present')}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                applyAttendanceStatus(
                                    filteredStudents.map((student) => student.id),
                                    SESSION_ATTENDANCE_STATUS.LATE
                                )
                            }
                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            disabled={!selectedSessionId}
                        >
                            {t('groupSessions.workspace.attendance.bulk.late')}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                applyAttendanceStatus(
                                    filteredStudents.map((student) => student.id),
                                    SESSION_ATTENDANCE_STATUS.ABSENT
                                )
                            }
                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            disabled={!selectedSessionId}
                        >
                            {t('groupSessions.workspace.attendance.bulk.absent')}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                applyAttendanceStatus(
                                    filteredStudents.map((student) => student.id),
                                    UNMARKED_ATTENDANCE_STATUS
                                )
                            }
                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            disabled={!selectedSessionId}
                        >
                            {t('groupSessions.workspace.attendance.bulk.clearVisible')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-edubot-muted dark:text-slate-400">
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        {t('groupSessions.workspace.attendance.counters.visible', { count: filteredStudents.length })}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        {t('groupSessions.workspace.attendance.counters.unmarked', { count: attendanceStats.unmarked })}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        {t('groupSessions.workspace.attendance.counters.unsaved', {
                            value: hasAttendanceChanges
                                ? t('groupSessions.workspace.attendance.values.yes')
                                : t('groupSessions.workspace.attendance.values.no'),
                        })}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        {t('groupSessions.workspace.attendance.counters.marked', {
                            marked: attendanceStats.marked,
                            total: attendanceStats.total,
                        })}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        {t('groupSessions.workspace.attendance.counters.presentRate', { value: attendanceStats.presentRate })}
                    </span>
                </div>
            </div>
            </DashboardInsetPanel>

        <div
            className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
                hasAttendanceChanges
                    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
            }`}
        >
            {hasAttendanceChanges
                ? t('groupSessions.workspace.attendance.unsavedMessage')
                : t('groupSessions.workspace.attendance.savedMessage')}
        </div>

        {!selectedSessionId ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                {t('groupSessions.workspace.attendance.empty.selectSession')}
            </div>
        ) : loadingStudents ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                {t('groupSessions.workspace.attendance.empty.loadingStudents')}
            </div>
        ) : students.length === 0 ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                {t('groupSessions.workspace.attendance.empty.noStudents')}
            </div>
        ) : filteredStudents.length === 0 ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                {t('groupSessions.workspace.attendance.empty.noFilteredStudents')}
            </div>
        ) : (
            <div className="space-y-3">
                {filteredStudents.map((student) => {
                    const currentStatus = attendanceRows[student.id]?.status;

                    return (
                        <article
                            key={student.id}
                            className="rounded-[1.25rem] border border-edubot-line/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950"
                        >
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,220px),220px,minmax(0,1fr)] lg:items-center">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-sm font-bold text-edubot-dark dark:bg-slate-800 dark:text-edubot-soft">
                                    {student.fullName
                                        .split(' ')
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((part) => part[0]?.toUpperCase())
                                        .join('') || 'S'}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                            {student.fullName}
                                        </h3>
                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                            {t('groupSessions.workspace.attendance.studentStatusHelper')}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="relative">
                                        <FiEdit3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                                        <select
                                            value={currentStatus}
                                            onChange={(e) => updateStatus(student.id, e.target.value)}
                                            className="dashboard-field pl-11"
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <input
                                        value={attendanceRows[student.id]?.notes || ''}
                                        onChange={(e) => updateNotes(student.id, e.target.value)}
                                        className="dashboard-field"
                                        placeholder={t('groupSessions.workspace.attendance.notesPlaceholder')}
                                    />
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        )}
        </>
    );
};

SessionAttendanceTab.propTypes = {
    applyAttendanceStatus: PropTypes.func.isRequired,
    attendanceFilter: PropTypes.string.isRequired,
    attendanceQuery: PropTypes.string.isRequired,
    attendanceRows: PropTypes.object.isRequired,
    attendanceStats: PropTypes.shape({
        presentRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        marked: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        unmarked: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    canImportZoomAttendance: PropTypes.bool.isRequired,
    filteredStudents: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            fullName: PropTypes.string.isRequired,
        })
    ).isRequired,
    hasAttendanceChanges: PropTypes.bool.isRequired,
    importZoomAttendanceToSession: PropTypes.func.isRequired,
    importingAttendance: PropTypes.bool.isRequired,
    loadingStudents: PropTypes.bool.isRequired,
    saveAttendance: PropTypes.func.isRequired,
    savingAttendance: PropTypes.bool.isRequired,
    selectedCourseId: PropTypes.string,
    selectedGroup: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
    }),
    selectedSession: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        startsAt: PropTypes.string,
    }),
    selectedSessionId: PropTypes.string,
    selectedSessionMode: PropTypes.string.isRequired,
    setAttendanceFilter: PropTypes.func.isRequired,
    setAttendanceQuery: PropTypes.func.isRequired,
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            fullName: PropTypes.string.isRequired,
        })
    ).isRequired,
    toSessionTime: PropTypes.func.isRequired,
    updateNotes: PropTypes.func.isRequired,
    updateStatus: PropTypes.func.isRequired,
};

SessionAttendanceTab.defaultProps = {
    selectedCourseId: '',
    selectedGroup: null,
    selectedSession: null,
    selectedSessionId: '',
};

export default SessionAttendanceTab;

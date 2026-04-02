import PropTypes from 'prop-types';
import { FiEdit3 } from 'react-icons/fi';
import {
    ATTENDANCE_STATUS,
    SESSION_ATTENDANCE_STATUS,
} from '@shared/contracts';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';

const statusMeta = {
    [ATTENDANCE_STATUS.PRESENT]: { label: 'Катышты', className: 'bg-emerald-100 text-emerald-700' },
    [ATTENDANCE_STATUS.LATE]: { label: 'Кечикти', className: 'bg-amber-100 text-amber-700' },
    [ATTENDANCE_STATUS.ABSENT]: { label: 'Келген жок', className: 'bg-red-100 text-red-700' },
};

const sessionStatusLabels = {
    [SESSION_ATTENDANCE_STATUS.PRESENT]: 'Катышты',
    [SESSION_ATTENDANCE_STATUS.LATE]: 'Кечикти',
    [SESSION_ATTENDANCE_STATUS.ABSENT]: 'Келген жок',
    [SESSION_ATTENDANCE_STATUS.EXCUSED]: 'Уруксат менен',
};

const sessionStatusMap = {
    [SESSION_ATTENDANCE_STATUS.PRESENT]: ATTENDANCE_STATUS.PRESENT,
    [SESSION_ATTENDANCE_STATUS.LATE]: ATTENDANCE_STATUS.LATE,
    [SESSION_ATTENDANCE_STATUS.ABSENT]: ATTENDANCE_STATUS.ABSENT,
    [SESSION_ATTENDANCE_STATUS.EXCUSED]: ATTENDANCE_STATUS.ABSENT,
};

const UNMARKED_ATTENDANCE_STATUS = '__unmarked__';

const statusOptions = [
    { value: UNMARKED_ATTENDANCE_STATUS, label: 'Белгилене элек' },
    ...Object.values(SESSION_ATTENDANCE_STATUS).map((status) => ({
        value: status,
        label: sessionStatusLabels[status] || statusMeta[sessionStatusMap[status] || ATTENDANCE_STATUS.ABSENT]?.label || status,
    })),
];

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
}) => (
    <>
        <DashboardInsetPanel
            title="Катышуу"
            description="Сессия боюнча катышууну белгилеп, bulk аракеттер менен тез өзгөртүп сактаңыз."
        >
            <div className="mt-4 space-y-4">
                <div className="grid gap-3 rounded-[1.25rem] border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/80 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                            {selectedSession?.title || `Сессия #${selectedSession?.sessionIndex || selectedSession?.id || '—'}`}
                        </p>
                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                            {selectedGroup?.name || selectedGroup?.code || 'Группа'} • {selectedSession?.startsAt ? toSessionTime(selectedSession.startsAt) : 'Убакыт жок'}
                            {selectedSessionMode === 'upcoming' ? ' • Күтүүдө' : ''}
                            {selectedSessionMode === 'live' ? ' • Түз эфирде' : ''}
                            {selectedSessionMode === 'completed' ? ' • Аяктаган' : ''}
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
                                {importingAttendance ? 'Импорттолууда...' : 'Zoom импорттоо'}
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
                                ? 'Сакталууда...'
                                : hasAttendanceChanges
                                  ? 'Катышууну сактоо'
                                  : 'Өзгөртүү жок'}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
                        <input
                            value={attendanceQuery}
                            onChange={(e) => setAttendanceQuery(e.target.value)}
                            placeholder="Студент издөө"
                            className="dashboard-field"
                        />
                        <select
                            value={attendanceFilter}
                            onChange={(e) => setAttendanceFilter(e.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            <option value="all">Баары</option>
                            <option value="unmarked">Белгилене элек</option>
                            <option value={SESSION_ATTENDANCE_STATUS.PRESENT}>Катышты</option>
                            <option value={SESSION_ATTENDANCE_STATUS.LATE}>Кечикти</option>
                            <option value={SESSION_ATTENDANCE_STATUS.ABSENT}>Келген жок</option>
                            <option value={SESSION_ATTENDANCE_STATUS.EXCUSED}>Уруксат менен</option>
                            <option value="changed">Өзгөртүлгөндөр</option>
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
                            Баары катышты
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
                            Баары кечикти
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
                            Баары жок
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
                            Көрсөтүлгөндөрдү тазалоо
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-edubot-muted dark:text-slate-400">
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Көрсөтүлгөндөр: {filteredStudents.length}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Белгилене элек: {attendanceStats.unmarked}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Сакталбаган: {hasAttendanceChanges ? 'ооба' : 'жок'}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Белгиленгендер: {attendanceStats.marked}/{attendanceStats.total}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Катышуу үлүшү: {attendanceStats.presentRate}%
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
                ? 'Өзгөртүүлөр али сактала элек. Сактоо баскычы учурдагы сессия үчүн бардык белгилөөлөрдү сактайт.'
                : 'Катышуу абалы сакталган. Bulk аракеттер издөө жана фильтрден өткөн студенттерге гана колдонулат.'}
        </div>

        {!selectedSessionId ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                Катышууну белгилөө үчүн адегенде сессияны тандаңыз.
            </div>
        ) : loadingStudents ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                Студенттер жүктөлүүдө...
            </div>
        ) : students.length === 0 ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                Студент табылган жок.
            </div>
        ) : filteredStudents.length === 0 ? (
            <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                Бул фильтр боюнча студент табылган жок.
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
                                            Ушул сессия үчүн катышуу статусун тандаңыз.
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
                                        placeholder="Эскертүү"
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

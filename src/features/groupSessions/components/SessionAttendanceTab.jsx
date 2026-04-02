import PropTypes from 'prop-types';
import { FiActivity, FiEdit3 } from 'react-icons/fi';
import {
    ATTENDANCE_STATUS,
    SESSION_ATTENDANCE_STATUS,
} from '@shared/contracts';
import { DashboardInsetPanel, StatusBadge } from '../../../components/ui/dashboard';

const statusMeta = {
    [ATTENDANCE_STATUS.PRESENT]: { label: 'Катышты', className: 'bg-emerald-100 text-emerald-700' },
    [ATTENDANCE_STATUS.LATE]: { label: 'Кечикти', className: 'bg-amber-100 text-amber-700' },
    [ATTENDANCE_STATUS.ABSENT]: { label: 'Келген жок', className: 'bg-red-100 text-red-700' },
};

const sessionStatusMap = {
    [SESSION_ATTENDANCE_STATUS.PRESENT]: ATTENDANCE_STATUS.PRESENT,
    [SESSION_ATTENDANCE_STATUS.LATE]: ATTENDANCE_STATUS.LATE,
    [SESSION_ATTENDANCE_STATUS.ABSENT]: ATTENDANCE_STATUS.ABSENT,
    [SESSION_ATTENDANCE_STATUS.EXCUSED]: ATTENDANCE_STATUS.ABSENT,
};

const statusOptions = Object.values(SESSION_ATTENDANCE_STATUS).map((status) => ({
    value: status,
    label: statusMeta[sessionStatusMap[status] || ATTENDANCE_STATUS.ABSENT]?.label || status,
}));

const SessionAttendanceTab = ({
    applyAttendanceStatus,
    attendanceFilter,
    attendanceQuery,
    attendanceRows,
    attendanceStats,
    filteredStudents,
    hasAttendanceChanges,
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
    studentStreaks,
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
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/80">
                    <div>
                        <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                            {selectedSession?.title || `Session #${selectedSession?.sessionIndex || selectedSession?.id || '—'}`}
                        </p>
                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                            {selectedGroup?.name || selectedGroup?.code || 'Группа'} • {selectedSession?.startsAt ? toSessionTime(selectedSession.startsAt) : 'Убакыт жок'}
                            {selectedSessionMode === 'upcoming' ? ' • Күтүүдө' : ''}
                            {selectedSessionMode === 'live' ? ' • Түз эфирде' : ''}
                            {selectedSessionMode === 'completed' ? ' • Аяктаган' : ''}
                        </p>
                    </div>
                    <button
                        onClick={saveAttendance}
                        disabled={
                            savingAttendance ||
                            loadingStudents ||
                            !selectedCourseId ||
                            !selectedSessionId ||
                            !hasAttendanceChanges
                        }
                        className="dashboard-button-primary"
                    >
                        {savingAttendance
                            ? 'Сакталууда...'
                            : hasAttendanceChanges
                              ? 'Катышууну сактоо'
                              : 'Өзгөртүү жок'}
                    </button>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),auto]">
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
                            <option value={SESSION_ATTENDANCE_STATUS.PRESENT}>Катышты</option>
                            <option value={SESSION_ATTENDANCE_STATUS.LATE}>Кечикти</option>
                            <option value={SESSION_ATTENDANCE_STATUS.ABSENT}>Келген жок</option>
                            <option value={SESSION_ATTENDANCE_STATUS.EXCUSED}>Уруксат менен</option>
                            <option value="changed">Өзгөртүлгөндөр</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                applyAttendanceStatus(
                                    filteredStudents.map((student) => student.id),
                                    SESSION_ATTENDANCE_STATUS.PRESENT
                                )
                            }
                            className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                            Баарын катышты
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                applyAttendanceStatus(
                                    filteredStudents.map((student) => student.id),
                                    SESSION_ATTENDANCE_STATUS.LATE
                                )
                            }
                            className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                            Баарын кечикти
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                applyAttendanceStatus(
                                    filteredStudents.map((student) => student.id),
                                    SESSION_ATTENDANCE_STATUS.ABSENT
                                )
                            }
                            className="rounded-2xl border border-edubot-line bg-white px-4 py-3 text-sm font-semibold text-edubot-ink transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                            Баарын жок
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-edubot-muted dark:text-slate-400">
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Көрсөтүлгөндөр: {filteredStudents.length}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Сакталбаган: {hasAttendanceChanges ? 'ооба' : 'жок'}
                    </span>
                    <span className="rounded-full bg-edubot-surface px-3 py-1 dark:bg-slate-900">
                        Катышуу даярдыгы: {attendanceStats.presentRate}%
                    </span>
                </div>
            </div>
        </DashboardInsetPanel>

        <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-edubot-muted dark:text-slate-400">
                Ар бир студентти ушул сессиянын контекстинде белгилеңиз. Bulk аракеттер учурдагы фильтрге жараша иштейт.
            </div>
            {hasAttendanceChanges ? (
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Өзгөртүүлөр али сактала элек
                </div>
            ) : null}
        </div>

        {loadingStudents ? (
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
            <div className="grid gap-4 xl:grid-cols-2">
                {filteredStudents.map((student) => {
                    const currentStatus = attendanceRows[student.id]?.status;
                    const streak = studentStreaks[student.id] || 0;

                    return (
                        <article
                            key={student.id}
                            className="rounded-[1.5rem] border border-edubot-line/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-sm font-bold text-edubot-dark dark:bg-slate-800 dark:text-edubot-soft">
                                    {student.fullName
                                        .split(' ')
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((part) => part[0]?.toUpperCase())
                                        .join('') || 'S'}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                            {student.fullName}
                                        </h3>
                                        <StatusBadge tone="default" className="gap-1">
                                            <FiActivity className="h-3.5 w-3.5" />
                                            {streak} күн streak
                                        </StatusBadge>
                                    </div>

                                    <div className="mt-4 grid gap-3">
                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                Катышуу
                                            </p>
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
                                            <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                                Статус тизмеден тандалат, ошондуктан кокус басуу азаят.
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                Эскертүү
                                            </p>
                                            <input
                                                value={attendanceRows[student.id]?.notes || ''}
                                                onChange={(e) => updateNotes(student.id, e.target.value)}
                                                className="dashboard-field"
                                                placeholder="Эскертүү"
                                            />
                                        </div>
                                    </div>
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
    }).isRequired,
    filteredStudents: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            fullName: PropTypes.string.isRequired,
        })
    ).isRequired,
    hasAttendanceChanges: PropTypes.bool.isRequired,
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
    studentStreaks: PropTypes.object.isRequired,
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

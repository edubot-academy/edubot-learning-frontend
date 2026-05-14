import { useContext } from 'react';
import PropTypes from 'prop-types';
import {
    FiAlertCircle,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiEdit3,
    FiFileText,
    FiLayers,
    FiLock,
    FiMapPin,
    FiUsers,
    FiXCircle,
} from 'react-icons/fi';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
    DashboardFilterBar,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    StatusBadge,
} from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';
import {
    UnifiedAttendanceTable,
    useAttendanceWorkspace,
} from '../features/attendance';

const statusOptions = [
    { value: SESSION_ATTENDANCE_STATUS.PRESENT, label: 'Катышты', icon: FiCheckCircle },
    { value: SESSION_ATTENDANCE_STATUS.LATE, label: 'Кечикти', icon: FiClock },
    { value: SESSION_ATTENDANCE_STATUS.ABSENT, label: 'Келген жок', icon: FiXCircle },
    { value: SESSION_ATTENDANCE_STATUS.EXCUSED, label: 'Себептүү', icon: FiAlertCircle },
];

const statusMeta = {
    [SESSION_ATTENDANCE_STATUS.PRESENT]: {
        label: 'Катышты',
        cardClass:
            'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10',
        tone: 'green',
    },
    [SESSION_ATTENDANCE_STATUS.LATE]: {
        label: 'Кечикти',
        cardClass:
            'border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10',
        tone: 'amber',
    },
    [SESSION_ATTENDANCE_STATUS.ABSENT]: {
        label: 'Келген жок',
        cardClass:
            'border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10',
        tone: 'red',
    },
    [SESSION_ATTENDANCE_STATUS.EXCUSED]: {
        label: 'Себептүү',
        cardClass:
            'border-sky-200 bg-sky-50/80 dark:border-sky-500/30 dark:bg-sky-500/10',
        tone: 'sky',
    },
};

const getStudentInitials = (fullName = '') =>
    fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'S';

const formatDateTime = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleString('ky-KG', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const noticeClassNames = {
    info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

const OperationalNotice = ({ tone = 'info', title, message, action }) => (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${noticeClassNames[tone] || noticeClassNames.info}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <div className="font-semibold">{title}</div>
                {message ? <p className="mt-1 opacity-90">{message}</p> : null}
            </div>
            {action}
        </div>
    </div>
);

const AttendancePage = ({ embedded = false }) => {
    const { user } = useContext(AuthContext);
    const {
        adminEditMode,
        attendanceDisabled,
        attendanceStats,
        courses,
        filteredReportItems,
        groups,
        handleNotesChange,
        handleStatusChange,
        handleSubmitAttendance,
        hasAttendanceChanges,
        initialRowsMap,
        isAdminOverrideMode,
        loadRosterAndAttendance,
        loadingCourses,
        loadingGroups,
        loadingSessions,
        loadingStage,
        loadingStudents,
        reportFilter,
        savingAttendance,
        selectedCourse,
        selectedCourseId,
        selectedGroup,
        selectedGroupId,
        selectedSession,
        selectedSessionId,
        sessions,
        setAdminEditMode,
        setReportFilter,
        setRowsMap,
        setSelectedCourseId,
        setSelectedGroupId,
        setSelectedSessionId,
        setViewMode,
        students,
        viewMode,
        workspaceNotice,
    } = useAttendanceWorkspace(user);

    return (
        <div className={embedded ? 'min-w-0 space-y-6' : 'mx-auto max-w-7xl min-w-0 space-y-6 px-4 pb-12 pt-24'}>
            {!embedded && (
                <div className="max-w-2xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-edubot-ink dark:text-white sm:text-[2.5rem]">
                            Катышуу
                        </h1>
                        <p className="mt-2 text-lg text-edubot-muted dark:text-slate-400">
                            Студенттердин сессияларга катышуусун башкарыңыз жана көзөмөлдөңүз.
                        </p>
                    </div>
                </div>
            )}

            {selectedGroupId && (
                <div className="mb-4 flex justify-end">
                    <div className="inline-flex rounded-lg border border-edubot-line bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'table'
                                ? 'bg-edubot-orange text-white'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            Таблица көрүнүшү
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('session')}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'session'
                                ? 'bg-edubot-orange text-white'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            Сессия көрүнүшү
                        </button>
                    </div>
                </div>
            )}

            {/* Course and Group Selection for Both Views */}
            {(viewMode === 'table' || viewMode === 'session') && (
                <div className="dashboard-panel-muted flex flex-wrap items-center gap-3 p-4">
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 inline-flex items-center gap-2 font-medium">
                            <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                            Курс
                        </span>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="dashboard-field"
                            disabled={loadingCourses}
                        >
                            <option value="">Курс тандаңыз</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title || course.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 inline-flex items-center gap-2 font-medium">
                            <FiLayers className="h-4 w-4 text-edubot-orange" />
                            Группа
                        </span>
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="dashboard-field"
                            disabled={loadingGroups || !selectedCourseId}
                        >
                            <option value="">Группа тандаңыз</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name} {group.code ? `• ${group.code}` : ''}
                                </option>
                            ))}
                        </select>
                    </label>

                    {selectedCourse && selectedGroup && (
                        <div className="flex items-center gap-2 text-sm text-edubot-ink dark:text-white">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-edubot-orange dark:bg-slate-900">
                                Тандалган
                            </span>
                            <span className="font-medium">{selectedCourse.title || selectedCourse.name}</span>
                            <span className="text-edubot-muted dark:text-slate-400">
                                {selectedGroup.name}
                                {selectedGroup.code ? ` • ${selectedGroup.code}` : ''}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'table' && !selectedGroupId ? (
                <div className="dashboard-panel-muted p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                        <FiLayers className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                        Группа тандаңыз
                    </h3>
                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                        Таблица көрүнүшү үчүн адегенде группа тандаңыз.
                    </p>
                </div>
            ) : viewMode === 'table' && selectedGroupId ? (
                <UnifiedAttendanceTable
                    groupId={selectedGroupId}
                    groupName={selectedGroup?.name || selectedGroup?.code}
                    courseId={selectedCourseId}
                    onAttendanceUpdate={() => {
                        loadRosterAndAttendance();
                    }}
                />
            ) : null}

            {viewMode === 'session' && (
                <>
                    <DashboardWorkspaceHero
                        className="dashboard-panel"
                        eyebrow="Attendance Workspace"
                        title="Сессия боюнча катышуу"
                        description="Эми катышуу курс/күн эмес, так группа жана сессия боюнча башкарылат."
                        metrics={
                            <>
                                <DashboardMetricCard label="Студент" value={attendanceStats.total} icon={FiUsers} />
                                <DashboardMetricCard
                                    label="Катышты"
                                    value={attendanceStats.present}
                                    tone="green"
                                    icon={FiCheckCircle}
                                />
                                <DashboardMetricCard
                                    label="Кечикти"
                                    value={attendanceStats.late}
                                    tone="amber"
                                    icon={FiClock}
                                />
                                <DashboardMetricCard
                                    label="Катышуу %"
                                    value={`${attendanceStats.rate}%`}
                                    icon={FiCalendar}
                                />
                            </>
                        }
                    >
                        <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1fr),auto]">
                            <label className="text-sm text-edubot-ink dark:text-white">
                                <span className="mb-1.5 inline-flex items-center gap-2 font-medium">
                                    <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                    Сессия
                                </span>
                                <select
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                    className="dashboard-field"
                                    disabled={loadingSessions || !selectedGroupId}
                                >
                                    <option value="">Сессия тандаңыз</option>
                                    {sessions.map((session) => (
                                        <option key={session.id} value={session.id}>
                                            {`#${session.sessionIndex || session.id} • ${session.title || 'Сабак'}`}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="flex items-end gap-2">
                                {isAdminOverrideMode ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (adminEditMode && hasAttendanceChanges) {
                                                setRowsMap(initialRowsMap);
                                            }
                                            setAdminEditMode((prev) => !prev);
                                        }}
                                        disabled={!selectedSessionId || loadingStudents || savingAttendance}
                                        className="dashboard-button-secondary min-h-[48px] w-full"
                                    >
                                        {adminEditMode ? (
                                            <>
                                                <FiLock className="h-4 w-4" />
                                                Өзгөртүү режимин жабуу
                                            </>
                                        ) : (
                                            <>
                                                <FiEdit3 className="h-4 w-4" />
                                                Өзгөртүү режимин ачуу
                                            </>
                                        )}
                                    </button>
                                ) : null}

                                <button
                                    onClick={handleSubmitAttendance}
                                    disabled={
                                        savingAttendance ||
                                        loadingStudents ||
                                        !hasAttendanceChanges ||
                                        !selectedCourseId ||
                                        !selectedGroupId ||
                                        !selectedSessionId ||
                                        attendanceDisabled ||
                                        (isAdminOverrideMode && !adminEditMode)
                                    }
                                    title={attendanceDisabled ? 'Attendance is disabled for this tenant.' : undefined}
                                    className="dashboard-button-primary-lg w-full"
                                >
                                    <FiCheckCircle className="h-4 w-4" />
                                    {savingAttendance
                                        ? 'Сакталууда...'
                                        : hasAttendanceChanges
                                            ? 'Катышууну сактоо'
                                            : 'Өзгөртүү жок'}
                                </button>
                            </div>
                        </DashboardFilterBar>

                        <div className="grid gap-4 pt-5">
                            {loadingStage ? (
                                <OperationalNotice
                                    tone="info"
                                    title="Жүктөө жүрүп жатат"
                                    message={loadingStage}
                                />
                            ) : null}

                            {workspaceNotice ? (
                                <OperationalNotice
                                    tone={workspaceNotice.tone}
                                    title={workspaceNotice.title}
                                    message={workspaceNotice.message}
                                    action={
                                        hasAttendanceChanges && !savingAttendance ? (
                                            <button
                                                type="button"
                                                onClick={handleSubmitAttendance}
                                                className="dashboard-button-secondary !min-h-0 !px-3 !py-2"
                                            >
                                                Сактоо
                                            </button>
                                        ) : null
                                    }
                                />
                            ) : null}

                            {isAdminOverrideMode ? (
                                <div className="dashboard-panel-muted flex flex-wrap items-start gap-3 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        {adminEditMode ? <FiEdit3 className="h-4 w-4" /> : <FiLock className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                            {adminEditMode ? 'Admin override режими ачык' : 'Admin режиминде окуу гана'}
                                        </div>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {adminEditMode
                                                ? 'Азыр катышууну оңдоого болот. Бүткөндөн кийин өзгөртүүлөрдү сактап, режимди кайра жабыңыз.'
                                                : 'Админ үчүн бул экран негизинен маалымат көрүүчү. Өзгөртүү керек болсо, адегенде өзгөртүү режимин ачыңыз.'}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {selectedCourse && selectedGroup && selectedSession ? (
                                <div className="dashboard-panel-muted flex flex-wrap items-center gap-3 p-4">
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-edubot-orange dark:bg-slate-900">
                                        Активдүү сессия
                                    </span>
                                    <div className="text-sm text-edubot-ink dark:text-white">
                                        <span className="font-semibold">{selectedCourse.title || selectedCourse.name}</span>
                                        <span className="ml-2 text-edubot-muted dark:text-slate-400">
                                            {selectedGroup.name}
                                            {selectedGroup.code ? ` • ${selectedGroup.code}` : ''}
                                        </span>
                                        <span className="ml-2 text-edubot-muted dark:text-slate-400">
                                            {selectedSession.title || `Сессия #${selectedSession.id}`}
                                        </span>
                                        <span className="ml-2 text-edubot-muted dark:text-slate-400">
                                            {formatDateTime(selectedSession.startsAt)}
                                        </span>
                                    </div>
                                </div>
                            ) : null}

                            {loadingStudents ? (
                                <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                                    Сессиянын катышуу тизмеси жүктөлүүдө...
                                </div>
                            ) : !selectedCourseId ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiBookOpen className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        Курс тандаңыз
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        Катышууну көрүү үчүн адегенде offline же live курс тандаңыз.
                                    </p>
                                </div>
                            ) : !selectedGroupId ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiLayers className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        Группа тандаңыз
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        Бул курс боюнча катышуу группа аркылуу жүргүзүлөт.
                                    </p>
                                </div>
                            ) : !selectedSessionId ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiCalendar className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        Сессия тандаңыз
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        Катышуу так бир сессияга сакталат.
                                    </p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiUsers className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        Студент табылган жок
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        Тандалган группа үчүн катышуу тизмеси азырынча бош.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 xl:grid-cols-2">
                                    {students.map((student) => {
                                        const meta =
                                            statusMeta[student.status] || statusMeta[SESSION_ATTENDANCE_STATUS.PRESENT];

                                        return (
                                            <article
                                                key={student.studentId}
                                                className={`rounded-[1.5rem] border p-5 transition duration-300 ${meta.cardClass}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-edubot-dark shadow-sm dark:bg-slate-900 dark:text-edubot-soft">
                                                        {getStudentInitials(student.fullName)}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                                                {student.fullName}
                                                            </h3>
                                                            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                                                        </div>

                                                        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,1.1fr]">
                                                            <div>
                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                                    Статус
                                                                </p>
                                                                <div className="relative">
                                                                    <FiEdit3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                                                                    <select
                                                                        value={student.status}
                                                                        onChange={(e) =>
                                                                            handleStatusChange(student.studentId, e.target.value)
                                                                        }
                                                                        className="dashboard-field pl-11"
                                                                        disabled={isAdminOverrideMode && !adminEditMode}
                                                                    >
                                                                        {statusOptions.map((option) => (
                                                                            <option key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <label className="block">
                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                                    Эскертүү
                                                                </p>
                                                                <textarea
                                                                    value={student.notes}
                                                                    onChange={(e) =>
                                                                        handleNotesChange(student.studentId, e.target.value)
                                                                    }
                                                                    placeholder="Кыскача эскертүү калтырыңыз"
                                                                    rows={3}
                                                                    className="dashboard-field"
                                                                    disabled={isAdminOverrideMode && !adminEditMode}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </DashboardWorkspaceHero>

                    <DashboardWorkspaceHero
                        className="dashboard-panel"
                        eyebrow="Attendance Summary"
                        title="Тандалган сессиянын жыйынтыгы"
                        description="Төмөнкү блок тандалган сессиядагы реалдуу катышуу абалын жыйынтыктап көрсөтөт."
                        metrics={
                            <>
                                <DashboardMetricCard label="Жалпы" value={attendanceStats.total} icon={FiFileText} />
                                <DashboardMetricCard
                                    label="Катышты"
                                    value={attendanceStats.present}
                                    tone="green"
                                    icon={FiCheckCircle}
                                />
                                <DashboardMetricCard
                                    label="Себептүү"
                                    value={attendanceStats.excused}
                                    tone="sky"
                                    icon={FiAlertCircle}
                                />
                                <DashboardMetricCard
                                    label="Келген жок"
                                    value={attendanceStats.absent}
                                    tone="red"
                                    icon={FiXCircle}
                                />
                            </>
                        }
                    >
                        <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.4fr)]">
                            <label className="text-sm text-edubot-ink dark:text-white">
                                <span className="mb-1.5 block font-medium">Статус</span>
                                <select
                                    value={reportFilter}
                                    onChange={(e) => setReportFilter(e.target.value)}
                                    className="dashboard-field"
                                >
                                    <option value="all">Баары</option>
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="dashboard-panel-muted flex flex-wrap items-center gap-3 p-4">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiMapPin className="h-4 w-4 text-edubot-orange" />
                                    {selectedGroup?.location || 'Локация көрсөтүлгөн эмес'}
                                </span>
                                <span className="text-sm text-edubot-muted dark:text-slate-400">
                                    {selectedGroup?.timezone || 'Timezone жок'}
                                </span>
                                <span className="text-sm text-edubot-muted dark:text-slate-400">
                                    {selectedSession ? formatDateTime(selectedSession.startsAt) : 'Сессия тандалган эмес'}
                                </span>
                            </div>
                        </DashboardFilterBar>

                        <div className="space-y-4 pt-5">
                            {filteredReportItems.length === 0 ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiFileText className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        Жазуу табылган жок
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        Сессияны же статус фильтрин өзгөртүп кайра аракет кылыңыз.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredReportItems.map((item) => {
                                        const meta =
                                            statusMeta[item.status] || statusMeta[SESSION_ATTENDANCE_STATUS.PRESENT];

                                        return (
                                            <article
                                                key={item.studentId}
                                                className="dashboard-panel-muted flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-edubot-ink dark:text-white">
                                                            {item.fullName}
                                                        </h3>
                                                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-400">
                                                        {item.joinedAt ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <FiClock className="h-4 w-4" />
                                                                Кирди: {formatDateTime(item.joinedAt)}
                                                            </span>
                                                        ) : null}
                                                        {item.leftAt ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <FiClock className="h-4 w-4" />
                                                                Чыкты: {formatDateTime(item.leftAt)}
                                                            </span>
                                                        ) : null}
                                                        {item.notes ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <FiAlertCircle className="h-4 w-4" />
                                                                {item.notes}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </DashboardWorkspaceHero>
                </>
            )}
        </div>
    );
};

AttendancePage.propTypes = {
    embedded: PropTypes.bool,
};

export default AttendancePage;

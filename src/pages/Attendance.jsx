import { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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
import { getDeliveryModeLabel } from '@shared/i18n/enumLabels';

const statusOptions = [
    { value: SESSION_ATTENDANCE_STATUS.PRESENT, labelKey: 'attendance.status.present', icon: FiCheckCircle },
    { value: SESSION_ATTENDANCE_STATUS.LATE, labelKey: 'attendance.status.late', icon: FiClock },
    { value: SESSION_ATTENDANCE_STATUS.ABSENT, labelKey: 'attendance.status.absent', icon: FiXCircle },
    { value: SESSION_ATTENDANCE_STATUS.EXCUSED, labelKey: 'attendance.status.excused', icon: FiAlertCircle },
];

const statusMeta = {
    [SESSION_ATTENDANCE_STATUS.PRESENT]: {
        labelKey: 'attendance.status.present',
        cardClass:
            'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10',
        tone: 'green',
    },
    [SESSION_ATTENDANCE_STATUS.LATE]: {
        labelKey: 'attendance.status.late',
        cardClass:
            'border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10',
        tone: 'amber',
    },
    [SESSION_ATTENDANCE_STATUS.ABSENT]: {
        labelKey: 'attendance.status.absent',
        cardClass:
            'border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10',
        tone: 'red',
    },
    [SESSION_ATTENDANCE_STATUS.EXCUSED]: {
        labelKey: 'attendance.status.excused',
        cardClass:
            'border-sky-200 bg-sky-50/80 dark:border-sky-500/30 dark:bg-sky-500/10',
        tone: 'sky',
    },
};

const getDeliveryModeBadgeClass = (value) =>
    value === 'individual'
        ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200';

const getStudentInitials = (fullName = '') =>
    fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'S';

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
    const { t, i18n } = useTranslation();
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
    const localizedStatusOptions = useMemo(
        () =>
            statusOptions.map((option) => ({
                ...option,
                label: t(option.labelKey),
            })),
        [t]
    );
    const getStatusLabel = (status) => t(statusMeta[status]?.labelKey || 'attendance.status.present');
    const formatSessionDateTime = (value) => {
        if (!value) return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return String(value);
        return parsed.toLocaleString(i18n.resolvedLanguage || i18n.language || 'ky', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={embedded ? 'min-w-0 space-y-6' : 'mx-auto max-w-7xl min-w-0 space-y-6 px-4 pb-12 pt-24'}>
            {!embedded && (
                <div className="max-w-2xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-edubot-ink dark:text-white sm:text-[2.5rem]">
                            {t('attendance.page.title')}
                        </h1>
                        <p className="mt-2 text-lg text-edubot-muted dark:text-slate-400">
                            {t('attendance.page.description')}
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
                            {t('attendance.view.table')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('session')}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'session'
                                ? 'bg-edubot-orange text-white'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {t('attendance.view.session')}
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
                            {t('attendance.filters.course')}
                        </span>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="dashboard-field"
                            disabled={loadingCourses}
                        >
                            <option value="">{t('attendance.placeholders.course')}</option>
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
                            {t('attendance.filters.group')}
                        </span>
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="dashboard-field"
                            disabled={loadingGroups || !selectedCourseId}
                        >
                            <option value="">{t('attendance.placeholders.group')}</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name} {group.code ? `• ${group.code}` : ''} · {getDeliveryModeLabel(group.deliveryMode, t)}
                                </option>
                            ))}
                        </select>
                    </label>

                    {selectedCourse && selectedGroup && (
                        <div className="flex items-center gap-2 text-sm text-edubot-ink dark:text-white">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-edubot-orange dark:bg-slate-900">
                                {t('attendance.labels.selected')}
                            </span>
                            <span className="font-medium">{selectedCourse.title || selectedCourse.name}</span>
                            <span className="text-edubot-muted dark:text-slate-400">
                                {selectedGroup.name}
                                {selectedGroup.code ? ` • ${selectedGroup.code}` : ''}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getDeliveryModeBadgeClass(selectedGroup.deliveryMode)}`}>
                                {getDeliveryModeLabel(selectedGroup.deliveryMode, t)}
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
                        {t('attendance.empty.selectGroupTitle')}
                    </h3>
                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                        {t('attendance.empty.selectGroupForTable')}
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
                        eyebrow={t('attendance.workspace.eyebrow')}
                        title={t('attendance.workspace.title')}
                        description={t('attendance.workspace.description')}
                        metrics={
                            <>
                                <DashboardMetricCard label={t('attendance.metrics.students')} value={attendanceStats.total} icon={FiUsers} />
                                <DashboardMetricCard
                                    label={t('attendance.status.present')}
                                    value={attendanceStats.present}
                                    tone="green"
                                    icon={FiCheckCircle}
                                />
                                <DashboardMetricCard
                                    label={t('attendance.status.late')}
                                    value={attendanceStats.late}
                                    tone="amber"
                                    icon={FiClock}
                                />
                                <DashboardMetricCard
                                    label={t('attendance.metrics.rate')}
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
                                    {t('attendance.filters.session')}
                                </span>
                                <select
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                    className="dashboard-field"
                                    disabled={loadingSessions || !selectedGroupId}
                                >
                                    <option value="">{t('attendance.placeholders.session')}</option>
                                    {sessions.map((session) => (
                                        <option key={session.id} value={session.id}>
                                            {`#${session.sessionIndex || session.id} • ${session.title || t('attendance.fallbacks.lesson')}`}
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
                                                {t('attendance.actions.closeEditMode')}
                                            </>
                                        ) : (
                                            <>
                                                <FiEdit3 className="h-4 w-4" />
                                                {t('attendance.actions.openEditMode')}
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
                                    title={attendanceDisabled ? t('attendance.toasts.disabled') : undefined}
                                    className="dashboard-button-primary-lg w-full"
                                >
                                    <FiCheckCircle className="h-4 w-4" />
                                    {savingAttendance
                                        ? t('attendance.actions.saving')
                                        : hasAttendanceChanges
                                            ? t('attendance.actions.saveAttendance')
                                            : t('attendance.actions.noChanges')}
                                </button>
                            </div>
                        </DashboardFilterBar>

                        <div className="grid gap-4 pt-5">
                            {loadingStage ? (
                                <OperationalNotice
                                    tone="info"
                                    title={t('attendance.loading.title')}
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
                                                {t('attendance.actions.save')}
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
                                            {adminEditMode
                                                ? t('attendance.admin.overrideOpen')
                                                : t('attendance.admin.readOnly')}
                                        </div>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {adminEditMode
                                                ? t('attendance.admin.overrideOpenDescription')
                                                : t('attendance.admin.readOnlyDescription')}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {selectedCourse && selectedGroup && selectedSession ? (
                                <div className="dashboard-panel-muted flex flex-wrap items-center gap-3 p-4">
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-edubot-orange dark:bg-slate-900">
                                        {t('attendance.labels.activeSession')}
                                    </span>
                                    <div className="text-sm text-edubot-ink dark:text-white">
                                        <span className="font-semibold">{selectedCourse.title || selectedCourse.name}</span>
                                        <span className="ml-2 text-edubot-muted dark:text-slate-400">
                                            {selectedGroup.name}
                                            {selectedGroup.code ? ` • ${selectedGroup.code}` : ''}
                                        </span>
                                        <span className="ml-2 text-edubot-muted dark:text-slate-400">
                                            {selectedSession.title ||
                                                t('attendance.fallbacks.sessionWithId', {
                                                    id: selectedSession.id,
                                                })}
                                        </span>
                                        <span className="ml-2 text-edubot-muted dark:text-slate-400">
                                            {formatSessionDateTime(selectedSession.startsAt)}
                                        </span>
                                    </div>
                                </div>
                            ) : null}

                            {loadingStudents ? (
                                <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                                    {t('attendance.loading.roster')}
                                </div>
                            ) : !selectedCourseId ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiBookOpen className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        {t('attendance.empty.selectCourseTitle')}
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        {t('attendance.empty.selectCourseDescription')}
                                    </p>
                                </div>
                            ) : !selectedGroupId ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiLayers className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        {t('attendance.empty.selectGroupTitle')}
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        {t('attendance.empty.selectGroupDescription')}
                                    </p>
                                </div>
                            ) : !selectedSessionId ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiCalendar className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        {t('attendance.empty.selectSessionTitle')}
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        {t('attendance.empty.selectSessionDescription')}
                                    </p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="dashboard-panel-muted p-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                        <FiUsers className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                        {t('attendance.empty.noStudentsTitle')}
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        {t('attendance.empty.noStudentsDescription')}
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
                                                            <StatusBadge tone={meta.tone}>{getStatusLabel(student.status)}</StatusBadge>
                                                        </div>

                                                        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,1.1fr]">
                                                            <div>
                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                                    {t('attendance.filters.status')}
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
                                                                        {localizedStatusOptions.map((option) => (
                                                                            <option key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <label className="block">
                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                                    {t('attendance.fields.notes')}
                                                                </p>
                                                                <textarea
                                                                    value={student.notes}
                                                                    onChange={(e) =>
                                                                        handleNotesChange(student.studentId, e.target.value)
                                                                    }
                                                                    placeholder={t('attendance.placeholders.notes')}
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
                        eyebrow={t('attendance.summary.eyebrow')}
                        title={t('attendance.summary.title')}
                        description={t('attendance.summary.description')}
                        metrics={
                            <>
                                <DashboardMetricCard label={t('attendance.metrics.total')} value={attendanceStats.total} icon={FiFileText} />
                                <DashboardMetricCard
                                    label={t('attendance.status.present')}
                                    value={attendanceStats.present}
                                    tone="green"
                                    icon={FiCheckCircle}
                                />
                                <DashboardMetricCard
                                    label={t('attendance.status.excused')}
                                    value={attendanceStats.excused}
                                    tone="sky"
                                    icon={FiAlertCircle}
                                />
                                <DashboardMetricCard
                                    label={t('attendance.status.absent')}
                                    value={attendanceStats.absent}
                                    tone="red"
                                    icon={FiXCircle}
                                />
                            </>
                        }
                    >
                        <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.4fr)]">
                            <label className="text-sm text-edubot-ink dark:text-white">
                                <span className="mb-1.5 block font-medium">{t('attendance.filters.status')}</span>
                                <select
                                    value={reportFilter}
                                    onChange={(e) => setReportFilter(e.target.value)}
                                    className="dashboard-field"
                                >
                                    <option value="all">{t('attendance.filters.all')}</option>
                                    {localizedStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="dashboard-panel-muted flex flex-wrap items-center gap-3 p-4">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiMapPin className="h-4 w-4 text-edubot-orange" />
                                    {selectedGroup?.location || t('attendance.fallbacks.location')}
                                </span>
                                <span className="text-sm text-edubot-muted dark:text-slate-400">
                                    {selectedGroup?.timezone || t('attendance.fallbacks.timezone')}
                                </span>
                                <span className="text-sm text-edubot-muted dark:text-slate-400">
                                    {selectedSession
                                        ? formatSessionDateTime(selectedSession.startsAt)
                                        : t('attendance.fallbacks.noSession')}
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
                                        {t('attendance.empty.noRecordsTitle')}
                                    </h3>
                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                        {t('attendance.empty.noRecordsDescription')}
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
                                                        <StatusBadge tone={meta.tone}>{getStatusLabel(item.status)}</StatusBadge>
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-400">
                                                        {item.joinedAt ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <FiClock className="h-4 w-4" />
                                                                {t('attendance.labels.joinedAt', {
                                                                    time: formatSessionDateTime(item.joinedAt),
                                                                })}
                                                            </span>
                                                        ) : null}
                                                        {item.leftAt ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <FiClock className="h-4 w-4" />
                                                                {t('attendance.labels.leftAt', {
                                                                    time: formatSessionDateTime(item.leftAt),
                                                                })}
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

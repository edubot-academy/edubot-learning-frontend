import { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
    FiAlertCircle,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiDownload,
    FiEdit3,
    FiFileText,
    FiUsers,
    FiXCircle,
} from 'react-icons/fi';
import { ATTENDANCE_STATUS } from '@shared/contracts';
import {
    fetchCourseAttendance,
    fetchCourseStudents,
    fetchInstructorProfile,
    markAttendanceSession,
} from '@services/api';
import { DashboardMetricCard, DashboardSectionHeader } from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';

const todayLocal = () => new Date().toISOString().slice(0, 10);

const statusOptions = [
    { value: ATTENDANCE_STATUS.PRESENT, label: 'Катышты', icon: FiCheckCircle },
    { value: ATTENDANCE_STATUS.LATE, label: 'Кечикти', icon: FiClock },
    { value: ATTENDANCE_STATUS.ABSENT, label: 'Келген жок', icon: FiXCircle },
];

const statusMeta = {
    [ATTENDANCE_STATUS.PRESENT]: {
        label: 'Катышты',
        cardClass:
            'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10',
        badgeClass:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        tone: 'green',
    },
    [ATTENDANCE_STATUS.LATE]: {
        label: 'Кечикти',
        cardClass:
            'border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10',
        badgeClass:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        textClass: 'text-amber-700 dark:text-amber-300',
        tone: 'amber',
    },
    [ATTENDANCE_STATUS.ABSENT]: {
        label: 'Келген жок',
        cardClass:
            'border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10',
        badgeClass:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        textClass: 'text-red-700 dark:text-red-300',
        tone: 'red',
    },
};

const toCourseList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.courses)) return payload.courses;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

const toStudentList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const isAttendanceCourseType = (course = {}) => {
    const type = String(course?.courseType || course?.type || '').toLowerCase();
    return type === 'offline' || type === 'online_live';
};

const getAttendanceErrorMessage = (error) => {
    const status = error?.response?.status;
    if (status === 401) return 'Сессия мөөнөтү бүттү. Кайра кириңиз.';
    if (status === 403) return 'Бул аракетке уруксатыңыз жок.';
    if (status === 404) return 'Курс табылган жок.';
    if (status === 400) {
        const message = error?.response?.data?.message;
        if (Array.isArray(message)) return message.join(', ');
        return message || 'Текшерүү катасы: студент курсқа жазылганын текшериңиз.';
    }

    const fallback = error?.response?.data?.message || 'Сервер катасы болду.';
    return Array.isArray(fallback) ? fallback.join(', ') : fallback;
};

const getStudentInitials = (fullName = '') =>
    fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'S';

const formatReportDate = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const AttendancePage = ({ embedded = false }) => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [sessionDate, setSessionDate] = useState(todayLocal());
    const [rowsMap, setRowsMap] = useState({});
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    const [reportFrom, setReportFrom] = useState('');
    const [reportTo, setReportTo] = useState('');
    const [reportItems, setReportItems] = useState([]);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportFilter, setReportFilter] = useState('all');

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        let cancelled = false;

        const loadCourses = async () => {
            setLoadingCourses(true);
            try {
                const response = await fetchInstructorProfile(user.id);
                if (cancelled) return;
                const list = toCourseList(response?.courses || response);
                const eligibleCourses = list.filter(isAttendanceCourseType);
                setCourses(eligibleCourses);
                if (eligibleCourses.length > 0) setSelectedCourseId(String(eligibleCourses[0].id));
                else setSelectedCourseId('');
            } catch (error) {
                console.error('Failed to load courses', error);
                toast.error('Курстарды жүктөө мүмкүн болгон жок.');
            } finally {
                if (!cancelled) setLoadingCourses(false);
            }
        };

        loadCourses();
        return () => {
            cancelled = true;
        };
    }, [user]);

    useEffect(() => {
        if (!selectedCourseId) return;
        let cancelled = false;

        const loadStudents = async () => {
            setLoadingStudents(true);
            try {
                const response = await fetchCourseStudents(Number(selectedCourseId), {
                    page: 1,
                    limit: 200,
                });
                if (cancelled) return;

                const students = toStudentList(response);
                const nextRows = {};
                students.forEach((student) => {
                    const id = student.userId || student.id;
                    if (!id) return;
                    nextRows[id] = {
                        userId: Number(id),
                        fullName: student.fullName || student.user?.fullName || `#${id}`,
                        status: ATTENDANCE_STATUS.PRESENT,
                        notes: '',
                    };
                });
                setRowsMap(nextRows);
            } catch (error) {
                console.error('Failed to load students', error);
                toast.error(getAttendanceErrorMessage(error));
                setRowsMap({});
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        };

        loadStudents();
        return () => {
            cancelled = true;
        };
    }, [selectedCourseId]);

    const selectedCourse = useMemo(
        () => courses.find((course) => String(course.id) === String(selectedCourseId)) || null,
        [courses, selectedCourseId]
    );

    const students = useMemo(() => Object.values(rowsMap), [rowsMap]);

    const attendanceStats = useMemo(() => {
        const present = students.filter((student) => student.status === ATTENDANCE_STATUS.PRESENT).length;
        const late = students.filter((student) => student.status === ATTENDANCE_STATUS.LATE).length;
        const absent = students.filter((student) => student.status === ATTENDANCE_STATUS.ABSENT).length;
        const total = students.length;
        const rate = total ? Math.round(((present + late) / total) * 100) : 0;

        return { present, late, absent, total, rate };
    }, [students]);

    const filteredReportItems = useMemo(() => {
        if (reportFilter === 'all') return reportItems;
        return reportItems.filter((item) => String(item.status) === reportFilter);
    }, [reportFilter, reportItems]);

    const reportStats = useMemo(() => {
        const present = reportItems.filter((item) => item.status === ATTENDANCE_STATUS.PRESENT).length;
        const late = reportItems.filter((item) => item.status === ATTENDANCE_STATUS.LATE).length;
        const absent = reportItems.filter((item) => item.status === ATTENDANCE_STATUS.ABSENT).length;
        const total = reportItems.length;

        return { present, late, absent, total };
    }, [reportItems]);

    const handleStatusChange = (userId, status) => {
        setRowsMap((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], status },
        }));
    };

    const handleNotesChange = (userId, notes) => {
        setRowsMap((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], notes },
        }));
    };

    const handleSubmitAttendance = async () => {
        if (!selectedCourseId || !sessionDate) {
            toast.error('Курс жана дата тандаңыз.');
            return;
        }
        if (students.length === 0) {
            toast.error('Катышуу үчүн студенттер табылган жок.');
            return;
        }

        setSavingAttendance(true);
        try {
            const rows = students.map((student) => ({
                userId: student.userId,
                status: student.status,
                notes: student.notes?.trim() || undefined,
            }));

            const response = await markAttendanceSession({
                courseId: Number(selectedCourseId),
                sessionDate,
                rows,
            });

            toast.success(response?.message || 'Катышуу ийгиликтүү сакталды');
        } catch (error) {
            console.error('Failed to mark attendance', error);
            toast.error(getAttendanceErrorMessage(error));
        } finally {
            setSavingAttendance(false);
        }
    };

    const handleLoadReport = async () => {
        if (!selectedCourseId) {
            toast.error('Курс тандаңыз.');
            return;
        }

        setLoadingReport(true);
        try {
            const response = await fetchCourseAttendance({
                courseId: Number(selectedCourseId),
                from: reportFrom || undefined,
                to: reportTo || undefined,
            });
            setReportItems(response?.items || []);
        } catch (error) {
            console.error('Failed to load attendance report', error);
            toast.error(getAttendanceErrorMessage(error));
            setReportItems([]);
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <div className={embedded ? 'space-y-6' : 'pt-24 mx-auto max-w-7xl space-y-6 px-4 pb-12'}>
            {!embedded && (
                <div className="max-w-2xl">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E8ECF3]">Катышуу</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#a6adba]">
                        Сабактагы катышууну белгилөө жана отчетту заманбап башкаруу интерфейсинде көрүү.
                    </p>
                </div>
            )}

            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow="Attendance Workspace"
                    title="Катышууну белгилөө"
                    description="Курсту тандап, сабактагы катышууну тез белгилеп сактаңыз."
                    metrics={
                        <>
                            <DashboardMetricCard
                                label="Студент"
                                value={attendanceStats.total}
                                icon={FiUsers}
                            />
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
                />

                <div className="grid gap-3 border-b border-edubot-line/70 px-6 py-5 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr),auto] dark:border-slate-700">
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
                            <FiCalendar className="h-4 w-4 text-edubot-orange" />
                            Сессия датасы
                        </span>
                        <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="dashboard-field"
                        />
                    </label>

                    <div className="flex items-end">
                        <button
                            onClick={handleSubmitAttendance}
                            disabled={savingAttendance || loadingStudents || !selectedCourseId}
                            className="dashboard-button-primary-lg w-full"
                        >
                            <FiCheckCircle className="h-4 w-4" />
                            {savingAttendance ? 'Сакталууда...' : 'Катышууну сактоо'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 p-6">
                    {selectedCourse ? (
                        <div className="dashboard-panel-muted flex flex-wrap items-center gap-3 p-4">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-edubot-orange dark:bg-slate-900">
                                Активдүү курс
                            </span>
                            <div className="text-sm text-edubot-ink dark:text-white">
                                <span className="font-semibold">{selectedCourse.title || selectedCourse.name}</span>
                                <span className="ml-2 text-edubot-muted dark:text-slate-400">
                                    {sessionDate}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {loadingStudents ? (
                        <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                            Студенттер жүктөлүүдө...
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
                                Тандалган курс үчүн катышуу тизмеси азырынча бош.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 xl:grid-cols-2">
                            {students.map((student) => {
                                const meta = statusMeta[student.status] || statusMeta[ATTENDANCE_STATUS.PRESENT];

                                return (
                                    <article
                                        key={student.userId}
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
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
                                                    >
                                                        {meta.label}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,1.1fr]">
                                                    <div>
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                            Статус
                                                        </p>
                                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                                            {statusOptions.map((option) => {
                                                                const Icon = option.icon;
                                                                const active = student.status === option.value;
                                                                return (
                                                                    <button
                                                                        key={option.value}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleStatusChange(student.userId, option.value)
                                                                        }
                                                                        className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                                                                            active
                                                                                ? 'border-edubot-orange bg-white text-edubot-orange shadow-sm dark:bg-slate-900'
                                                                                : 'border-transparent bg-white/70 text-edubot-ink hover:border-edubot-line dark:bg-slate-900/60 dark:text-slate-200'
                                                                        }`}
                                                                    >
                                                                        <Icon className="h-4 w-4" />
                                                                        {option.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <label className="block">
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                            Эскертүү
                                                        </p>
                                                        <div className="relative">
                                                            <FiEdit3 className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-edubot-muted" />
                                                            <textarea
                                                                value={student.notes}
                                                                onChange={(e) =>
                                                                    handleNotesChange(student.userId, e.target.value)
                                                                }
                                                                placeholder="Кыскача эскертүү калтырыңыз"
                                                                rows={3}
                                                                className="dashboard-field dashboard-field-icon"
                                                            />
                                                        </div>
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
            </section>

            <section className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow="Attendance Report"
                    title="Катышуу отчету"
                    description="Белгиленген катышууларды күн аралыгы боюнча чыгарып, тез талдаңыз."
                    metrics={
                        <>
                            <DashboardMetricCard label="Жазуу" value={reportStats.total} icon={FiFileText} />
                            <DashboardMetricCard
                                label="Катышты"
                                value={reportStats.present}
                                tone="green"
                                icon={FiCheckCircle}
                            />
                            <DashboardMetricCard
                                label="Кечикти"
                                value={reportStats.late}
                                tone="amber"
                                icon={FiClock}
                            />
                            <DashboardMetricCard
                                label="Келген жок"
                                value={reportStats.absent}
                                tone="red"
                                icon={FiAlertCircle}
                            />
                        </>
                    }
                />

                <div className="grid gap-3 border-b border-edubot-line/70 px-6 py-5 lg:grid-cols-[minmax(0,0.8fr),minmax(0,0.8fr),minmax(0,0.9fr),auto] dark:border-slate-700">
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 block font-medium">Күндөн</span>
                        <input
                            type="date"
                            value={reportFrom}
                            onChange={(e) => setReportFrom(e.target.value)}
                            className="dashboard-field"
                        />
                    </label>
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 block font-medium">Күнгө чейин</span>
                        <input
                            type="date"
                            value={reportTo}
                            onChange={(e) => setReportTo(e.target.value)}
                            className="dashboard-field"
                        />
                    </label>
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-1.5 block font-medium">Статус</span>
                        <select
                            value={reportFilter}
                            onChange={(e) => setReportFilter(e.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            <option value="all">Баары</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex items-end">
                        <button
                            onClick={handleLoadReport}
                            disabled={loadingReport || !selectedCourseId}
                            className="dashboard-button-secondary min-h-[48px] w-full dark:bg-slate-900"
                        >
                            <FiDownload className="h-4 w-4" />
                            {loadingReport ? 'Жүктөлүүдө...' : 'Отчетту жүктөө'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    {loadingReport ? (
                        <div className="dashboard-panel-muted p-10 text-center text-sm text-edubot-muted dark:text-slate-400">
                            Отчет жүктөлүүдө...
                        </div>
                    ) : filteredReportItems.length === 0 ? (
                        <div className="dashboard-panel-muted p-10 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                                <FiFileText className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                Отчет табылган жок
                            </h3>
                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                Күн аралыгын же фильтрди өзгөртүп кайра аракет кылыңыз.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredReportItems.map((item) => {
                                const meta = statusMeta[item.status] || {
                                    badgeClass:
                                        'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                                    label: item.status || '-',
                                };

                                return (
                                    <article
                                        key={item.id || `${item.userId}-${item.sessionDate}`}
                                        className="dashboard-panel-muted flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-edubot-ink dark:text-white">
                                                    {item.user?.fullName || item.fullName || `#${item.userId}`}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
                                                >
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-400">
                                                <span className="inline-flex items-center gap-2">
                                                    <FiCalendar className="h-4 w-4" />
                                                    {formatReportDate(item.sessionDate)}
                                                </span>
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
            </section>
        </div>
    );
};

export default AttendancePage;

AttendancePage.propTypes = {
    embedded: PropTypes.bool,
};

import { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
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
    fetchSessionAttendance,
    markSessionAttendanceBulk,
} from '../features/attendance/api';
import { fetchCourses, fetchInstructorCourses } from '../features/courses/api';
import { fetchCourseGroups } from '../features/courseGroups/api';
import { fetchGroupRoster } from '../features/courseGroups/roster';
import { fetchCourseSessions } from '../features/groupSessions/api';
import {
    DashboardFilterBar,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    StatusBadge,
} from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';

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

const toCourseList = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.courses)) return payload.courses;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

const toGroupList = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.groups)) return payload.groups;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

const toSessionList = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.sessions)) return payload.sessions;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

const toAttendanceItems = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
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
    if (status === 404) return 'Тандалган группа же сессия табылган жок.';
    if (status === 400) {
        const message = error?.response?.data?.message;
        if (Array.isArray(message)) return message.join(', ');
        return message || 'Текшерүү катасы болду.';
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

const formatDateTime = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const AttendancePage = ({ embedded = false }) => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [rowsMap, setRowsMap] = useState({});
    const [initialRowsMap, setInitialRowsMap] = useState({});
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [reportFilter, setReportFilter] = useState('all');
    const [adminEditMode, setAdminEditMode] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        let cancelled = false;

        const loadCourses = async () => {
            setLoadingCourses(true);
            try {
                const response =
                    user.role === 'instructor'
                        ? await fetchInstructorCourses({ page: 1, limit: 200, status: 'approved' })
                        : await fetchCourses({ limit: 200 });
                if (cancelled) return;
                const eligibleCourses = toCourseList(response).filter(isAttendanceCourseType);
                setCourses(eligibleCourses);
                setSelectedCourseId((prev) => {
                    if (prev && eligibleCourses.some((course) => String(course.id) === String(prev))) {
                        return prev;
                    }
                    return eligibleCourses[0]?.id ? String(eligibleCourses[0].id) : '';
                });
            } catch (error) {
                console.error('Failed to load attendance courses', error);
                toast.error('Катышуу үчүн курстар жүктөлгөн жок.');
                if (!cancelled) {
                    setCourses([]);
                    setSelectedCourseId('');
                }
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
        if (!selectedCourseId) {
            setGroups([]);
            setSelectedGroupId('');
            return;
        }

        let cancelled = false;

        const loadGroups = async () => {
            setLoadingGroups(true);
            try {
                const response = await fetchCourseGroups({ courseId: Number(selectedCourseId) });
                if (cancelled) return;
                const items = toGroupList(response);
                setGroups(items);
                setSelectedGroupId((prev) => {
                    if (prev && items.some((group) => String(group.id) === String(prev))) return prev;
                    return items[0]?.id ? String(items[0].id) : '';
                });
            } catch (error) {
                console.error('Failed to load attendance groups', error);
                toast.error('Группалар жүктөлгөн жок.');
                if (!cancelled) {
                    setGroups([]);
                    setSelectedGroupId('');
                }
            } finally {
                if (!cancelled) setLoadingGroups(false);
            }
        };

        loadGroups();
        return () => {
            cancelled = true;
        };
    }, [selectedCourseId]);

    useEffect(() => {
        if (!selectedGroupId) {
            setSessions([]);
            setSelectedSessionId('');
            setRowsMap({});
            return;
        }

        let cancelled = false;

        const loadSessions = async () => {
            setLoadingSessions(true);
            try {
                const response = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
                if (cancelled) return;
                const items = toSessionList(response);
                setSessions(items);
                setSelectedSessionId((prev) => {
                    if (prev && items.some((session) => String(session.id) === String(prev))) return prev;
                    return items[0]?.id ? String(items[0].id) : '';
                });
            } catch (error) {
                console.error('Failed to load attendance sessions', error);
                toast.error('Сессиялар жүктөлгөн жок.');
                if (!cancelled) {
                    setSessions([]);
                    setSelectedSessionId('');
                }
            } finally {
                if (!cancelled) setLoadingSessions(false);
            }
        };

        loadSessions();
        return () => {
            cancelled = true;
        };
    }, [selectedGroupId]);

    useEffect(() => {
        if (!selectedGroupId) {
            setRowsMap({});
            setInitialRowsMap({});
            return;
        }

        let cancelled = false;

        const loadRosterAndAttendance = async () => {
            setLoadingStudents(true);
            try {
                const [studentsRes, attendanceRes] = await Promise.all([
                    fetchGroupRoster({
                        groupId: Number(selectedGroupId),
                        page: 1,
                        limit: 200,
                    }),
                    selectedSessionId
                        ? fetchSessionAttendance(Number(selectedSessionId))
                        : Promise.resolve([]),
                ]);
                if (cancelled) return;

                const attendanceRows = toAttendanceItems(attendanceRes);
                const attendanceByStudentId = new Map(
                    attendanceRows.map((item) => [
                        Number(item.studentId || item.userId),
                        {
                            status: item.status,
                            notes: item.notes || '',
                            joinedAt: item.joinedAt || undefined,
                            leftAt: item.leftAt || undefined,
                        },
                    ])
                );

                const nextRows = {};
                studentsRes.forEach((student) => {
                    const studentId = Number(student.userId || student.id);
                    if (!studentId) return;
                    const existing = attendanceByStudentId.get(studentId);
                    nextRows[studentId] = {
                        studentId,
                        fullName: student.fullName || student.user?.fullName || `#${studentId}`,
                        status: existing?.status || SESSION_ATTENDANCE_STATUS.PRESENT,
                        notes: existing?.notes || '',
                        joinedAt: existing?.joinedAt,
                        leftAt: existing?.leftAt,
                    };
                });
                setRowsMap(nextRows);
                setInitialRowsMap(nextRows);
            } catch (error) {
                console.error('Failed to load session attendance workspace', error);
                toast.error(getAttendanceErrorMessage(error));
                if (!cancelled) {
                    setRowsMap({});
                    setInitialRowsMap({});
                }
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        };

        loadRosterAndAttendance();
        return () => {
            cancelled = true;
        };
    }, [selectedGroupId, selectedSessionId]);

    const selectedCourse = useMemo(
        () => courses.find((course) => String(course.id) === String(selectedCourseId)) || null,
        [courses, selectedCourseId]
    );

    const selectedGroup = useMemo(
        () => groups.find((group) => String(group.id) === String(selectedGroupId)) || null,
        [groups, selectedGroupId]
    );

    const selectedSession = useMemo(
        () => sessions.find((session) => String(session.id) === String(selectedSessionId)) || null,
        [sessions, selectedSessionId]
    );

    const isAdminOverrideMode = user?.role === 'admin';
    const students = useMemo(() => Object.values(rowsMap), [rowsMap]);

    const hasAttendanceChanges = useMemo(() => {
        const currentIds = Object.keys(rowsMap);
        const initialIds = Object.keys(initialRowsMap);
        if (currentIds.length !== initialIds.length) return currentIds.length > 0;

        return currentIds.some((studentId) => {
            const current = rowsMap[studentId];
            const initial = initialRowsMap[studentId];
            if (!current || !initial) return true;

            return (
                current.status !== initial.status ||
                (current.notes || '').trim() !== (initial.notes || '').trim() ||
                (current.joinedAt || '') !== (initial.joinedAt || '') ||
                (current.leftAt || '') !== (initial.leftAt || '')
            );
        });
    }, [rowsMap, initialRowsMap]);

    const attendanceStats = useMemo(() => {
        const present = students.filter(
            (student) => student.status === SESSION_ATTENDANCE_STATUS.PRESENT
        ).length;
        const late = students.filter(
            (student) => student.status === SESSION_ATTENDANCE_STATUS.LATE
        ).length;
        const absent = students.filter(
            (student) => student.status === SESSION_ATTENDANCE_STATUS.ABSENT
        ).length;
        const excused = students.filter(
            (student) => student.status === SESSION_ATTENDANCE_STATUS.EXCUSED
        ).length;
        const total = students.length;
        const rate = total ? Math.round(((present + late + excused) / total) * 100) : 0;

        return { present, late, absent, excused, total, rate };
    }, [students]);

    const filteredReportItems = useMemo(() => {
        if (reportFilter === 'all') return students;
        return students.filter((item) => String(item.status) === reportFilter);
    }, [reportFilter, students]);

    const handleStatusChange = (studentId, status) => {
        setRowsMap((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], status },
        }));
    };

    const handleNotesChange = (studentId, notes) => {
        setRowsMap((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes },
        }));
    };

    const handleSubmitAttendance = async () => {
        if (!selectedCourseId || !selectedSessionId) {
            toast.error('Курс, группа жана сессия тандаңыз.');
            return;
        }
        if (isAdminOverrideMode && !adminEditMode) {
            toast('Адегенде өзгөртүү режимин ачыңыз.');
            return;
        }
        if (!hasAttendanceChanges) {
            toast('Өзгөртүү жок.');
            return;
        }
        if (students.length === 0) {
            toast.error('Бул группа үчүн студент табылган жок.');
            return;
        }

        setSavingAttendance(true);
        try {
            const rows = students.map((student) => ({
                studentId: student.studentId,
                status: student.status,
                joinedAt: student.joinedAt,
                leftAt: student.leftAt,
                notes: student.notes?.trim() || undefined,
            }));

            const response = await markSessionAttendanceBulk(Number(selectedSessionId), {
                courseId: Number(selectedCourseId),
                rows,
            });

            setInitialRowsMap(rowsMap);
            toast.success(response?.message || 'Катышуу ийгиликтүү сакталды.');
        } catch (error) {
            console.error('Failed to save session attendance', error);
            toast.error(getAttendanceErrorMessage(error));
        } finally {
            setSavingAttendance(false);
        }
    };

    return (
        <div className={embedded ? 'space-y-6' : 'mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-24'}>
            {!embedded && (
                <div className="max-w-2xl">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E8ECF3]">Катышуу</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#a6adba]">
                        Курсту, группаны жана сессияны тандап, катышууну ошол сессиянын курамына
                        жараша сактаңыз.
                    </p>
                </div>
            )}

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
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1fr),minmax(0,1fr),minmax(0,1.15fr),auto]">
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
                                (isAdminOverrideMode && !adminEditMode)
                            }
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
                                                        <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                                            Статус тизмеден тандалат, ошондуктан кокус басуу азаят.
                                                        </p>
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
        </div>
    );
};

export default AttendancePage;

AttendancePage.propTypes = {
    embedded: PropTypes.bool,
};

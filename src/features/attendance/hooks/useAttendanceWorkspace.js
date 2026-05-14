import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
    fetchSessionAttendance,
    markSessionAttendanceBulk,
} from '../api';
import { fetchCourses, fetchInstructorCourses } from '../../courses/api';
import { fetchCourseGroups } from '../../courseGroups/api';
import { fetchGroupRoster } from '../../courseGroups/roster';
import { fetchCourseSessions } from '../../groupSessions/api';
import { isPlatformAdmin } from '@shared/utils/roles';
import {
    isCourseFeatureEnabled,
    TENANT_FEATURES,
} from '@shared/utils/tenantFeatures';

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

const toRosterList = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.students)) return payload.students;
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

const cloneRowsMap = (map) =>
    Object.fromEntries(
        Object.entries(map || {}).map(([key, value]) => [key, { ...value }])
    );

export const useAttendanceWorkspace = (user) => {
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
    const [workspaceNotice, setWorkspaceNotice] = useState(null);
    const [reportFilter, setReportFilter] = useState('all');
    const [adminEditMode, setAdminEditMode] = useState(false);
    const [viewMode, setViewMode] = useState('table');

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

                const eligibleCourses = toCourseList(response).filter(
                    (course) =>
                        isAttendanceCourseType(course) &&
                        isCourseFeatureEnabled(course, TENANT_FEATURES.ATTENDANCE)
                );
                setCourses(eligibleCourses);
                setWorkspaceNotice(null);

                setSelectedCourseId((prev) => {
                    if (prev && eligibleCourses.some((course) => String(course.id) === String(prev))) {
                        return prev;
                    }
                    return eligibleCourses[0]?.id ? String(eligibleCourses[0].id) : '';
                });
            } catch (error) {
                console.error('Failed to load attendance courses', error);
                const message = 'Катышуу үчүн курстар жүктөлгөн жок.';
                toast.error(message);
                if (!cancelled) {
                    setWorkspaceNotice({ tone: 'error', title: 'Курстар жүктөлгөн жок', message });
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
                setWorkspaceNotice(null);

                setSelectedGroupId((prev) => {
                    if (prev && items.some((group) => String(group.id) === String(prev))) return prev;
                    return items[0]?.id ? String(items[0].id) : '';
                });
            } catch (error) {
                console.error('Failed to load attendance groups', error);
                const message = 'Группалар жүктөлгөн жок.';
                toast.error(message);
                if (!cancelled) {
                    setWorkspaceNotice({ tone: 'error', title: 'Группалар жүктөлгөн жок', message });
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
            setInitialRowsMap({});
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
                setWorkspaceNotice(null);

                setSelectedSessionId((prev) => {
                    if (prev && items.some((session) => String(session.id) === String(prev))) return prev;
                    return items[0]?.id ? String(items[0].id) : '';
                });
            } catch (error) {
                console.error('Failed to load attendance sessions', error);
                const message = 'Сессиялар жүктөлгөн жок.';
                toast.error(message);
                if (!cancelled) {
                    setWorkspaceNotice({ tone: 'error', title: 'Сессиялар жүктөлгөн жок', message });
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

    const loadRosterAndAttendance = useCallback(async () => {
        if (!selectedGroupId) {
            setRowsMap({});
            setInitialRowsMap({});
            return;
        }

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

            const rosterItems = toRosterList(studentsRes);
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
            rosterItems.forEach((student) => {
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
            setInitialRowsMap(cloneRowsMap(nextRows));
            setWorkspaceNotice(null);
        } catch (error) {
            console.error('Failed to load session attendance workspace', error);
            const message = getAttendanceErrorMessage(error);
            toast.error(message);
            setWorkspaceNotice({ tone: 'error', title: 'Катышуу тизмеси жүктөлгөн жок', message });
            setRowsMap({});
            setInitialRowsMap({});
        } finally {
            setLoadingStudents(false);
        }
    }, [selectedGroupId, selectedSessionId]);

    useEffect(() => {
        loadRosterAndAttendance();
    }, [loadRosterAndAttendance]);

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

    const isAdminOverrideMode = isPlatformAdmin(user);
    const attendanceDisabled = selectedCourse
        ? !isCourseFeatureEnabled(selectedCourse, TENANT_FEATURES.ATTENDANCE)
        : false;
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
        setWorkspaceNotice({
            tone: 'warning',
            title: 'Сакталбаган өзгөртүү бар',
            message: 'Катышуу статусун өзгөрттүңүз. Сактоо баскычын басмайынча өзгөрүү серверге кетпейт.',
        });
        setRowsMap((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], status },
        }));
    };

    const handleNotesChange = (studentId, notes) => {
        setWorkspaceNotice({
            tone: 'warning',
            title: 'Сакталбаган өзгөртүү бар',
            message: 'Эскертүү өзгөрдү. Сактоо баскычын басмайынча өзгөрүү серверге кетпейт.',
        });
        setRowsMap((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes },
        }));
    };

    const handleSubmitAttendance = async () => {
        if (!selectedCourseId || !selectedSessionId) {
            setWorkspaceNotice({
                tone: 'warning',
                title: 'Толук тандоо керек',
                message: 'Катышууну сактоо үчүн курс, группа жана сессия тандаңыз.',
            });
            toast.error('Курс, группа жана сессия тандаңыз.');
            return;
        }

        if (isAdminOverrideMode && !adminEditMode) {
            setWorkspaceNotice({
                tone: 'warning',
                title: 'Өзгөртүү режими жабык',
                message: 'Админ катары катышууну өзгөртүү үчүн адегенде өзгөртүү режимин ачыңыз.',
            });
            toast('Адегенде өзгөртүү режимин ачыңыз.');
            return;
        }

        if (attendanceDisabled) {
            toast.error('Attendance is disabled for this tenant.');
            return;
        }

        if (!hasAttendanceChanges) {
            setWorkspaceNotice({
                tone: 'info',
                title: 'Өзгөртүү жок',
                message: 'Учурдагы катышуу тизмеси сакталган абал менен бирдей.',
            });
            toast('Өзгөртүү жок.');
            return;
        }

        if (students.length === 0) {
            setWorkspaceNotice({
                tone: 'warning',
                title: 'Студент жок',
                message: 'Бул группа үчүн сактай турган катышуу тизмеси бош.',
            });
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

            setInitialRowsMap(cloneRowsMap(rowsMap));
            const message = response?.message || 'Катышуу ийгиликтүү сакталды.';
            setWorkspaceNotice({ tone: 'success', title: 'Катышуу сакталды', message });
            toast.success(message);
        } catch (error) {
            console.error('Failed to save session attendance', error);
            const message = getAttendanceErrorMessage(error);
            setWorkspaceNotice({ tone: 'error', title: 'Катышуу сакталган жок', message });
            toast.error(message);
        } finally {
            setSavingAttendance(false);
        }
    };

    const loadingStage = loadingCourses
        ? 'Курстар жүктөлүүдө...'
        : loadingGroups
            ? 'Группалар жүктөлүүдө...'
            : loadingSessions
                ? 'Сессиялар жүктөлүүдө...'
                : loadingStudents
                    ? 'Катышуу тизмеси жүктөлүүдө...'
                    : '';

    return {
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
    };
};

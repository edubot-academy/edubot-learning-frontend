import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
    fetchCourseAttendance,
    fetchSessionAttendance,
    markSessionAttendanceBulk,
} from '@services/api';
import { fetchGroupRoster } from '@features/courseGroups/roster';
import {
    getWorkspaceErrorMessage,
    toArray,
} from '@features/groupSessions/utils/sessionWorkspace.helpers';

export const UNMARKED_ATTENDANCE_STATUS = '__unmarked__';

const buildBlankAttendanceRows = (roster) => {
    const next = {};
    roster.forEach((student) => {
        next[student.id] = {
            studentId: student.id,
            status: UNMARKED_ATTENDANCE_STATUS,
            notes: '',
            joinedAt: undefined,
            leftAt: undefined,
        };
    });
    return next;
};

const hydrateRowsFromAttendanceItems = (rows, items) => {
    const next = { ...rows };
    items.forEach((item) => {
        const studentId = Number(item.studentId || item.userId);
        if (!next[studentId]) return;
        next[studentId] = {
            ...next[studentId],
            status: item.status,
            notes: item.notes || '',
            joinedAt: item.joinedAt || undefined,
            leftAt: item.leftAt || undefined,
        };
    });
    return next;
};

export const useSessionWorkspaceAttendance = ({
    selectedCourseId,
    selectedGroupId,
    selectedSessionId,
    onNotice,
    onRefreshInsights,
}) => {
    const [students, setStudents] = useState([]);
    const [attendanceRows, setAttendanceRows] = useState({});
    const [initialAttendanceRows, setInitialAttendanceRows] = useState({});
    const [, setAttendanceHistory] = useState([]);
    const [attendanceQuery, setAttendanceQuery] = useState('');
    const [attendanceFilter, setAttendanceFilter] = useState('all');
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    useEffect(() => {
        if (!selectedCourseId || !selectedGroupId) {
            setStudents([]);
            setAttendanceRows({});
            setInitialAttendanceRows({});
            return;
        }

        let cancelled = false;
        const loadStudentsAndHistory = async () => {
            setLoadingStudents(true);
            try {
                const [studentsRes, attendanceRes] = await Promise.all([
                    fetchGroupRoster({
                        groupId: Number(selectedGroupId),
                        page: 1,
                        limit: 200,
                    }),
                    fetchCourseAttendance({
                        courseId: Number(selectedCourseId),
                        groupId: Number(selectedGroupId),
                    }),
                ]);
                if (cancelled) return;

                const normalized = studentsRes.map((item) => ({
                    id: Number(item.userId || item.id),
                    fullName: item.fullName || item.user?.fullName || `#${item.userId || item.id}`,
                }));
                setStudents(normalized);

                const rowState = buildBlankAttendanceRows(normalized);
                setAttendanceRows(rowState);
                setInitialAttendanceRows(rowState);
                setAttendanceHistory(attendanceRes?.items || []);
            } catch (error) {
                console.error(error);
                toast.error(getWorkspaceErrorMessage(error, 'Сессия маалыматтарын жүктөө катасы.'));
                setStudents([]);
                setAttendanceRows({});
                setInitialAttendanceRows({});
                setAttendanceHistory([]);
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        };

        loadStudentsAndHistory();
        return () => {
            cancelled = true;
        };
    }, [selectedCourseId, selectedGroupId]);

    useEffect(() => {
        const blankRows = buildBlankAttendanceRows(students);
        setAttendanceRows(blankRows);
        setInitialAttendanceRows(blankRows);

        if (!selectedSessionId) return;

        let cancelled = false;
        const hydrateSessionAttendance = async () => {
            try {
                const res = await fetchSessionAttendance(Number(selectedSessionId));
                if (cancelled) return;
                const items = toArray(res);
                if (!items.length) return;

                let hydratedRows = null;
                setAttendanceRows((prev) => {
                    hydratedRows = hydrateRowsFromAttendanceItems(prev, items);
                    return hydratedRows;
                });
                if (hydratedRows) setInitialAttendanceRows(hydratedRows);
            } catch (error) {
                console.error(error);
            }
        };

        hydrateSessionAttendance();
        return () => {
            cancelled = true;
        };
    }, [selectedSessionId, students]);

    const attendanceStats = useMemo(() => {
        const values = Object.values(attendanceRows);
        const present = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.PRESENT).length;
        const late = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.LATE).length;
        const absent = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.ABSENT).length;
        const excused = values.filter((r) => r.status === SESSION_ATTENDANCE_STATUS.EXCUSED).length;
        const marked = values.filter((r) => r.status && r.status !== UNMARKED_ATTENDANCE_STATUS).length;
        const unmarked = Math.max(0, values.length - marked);
        return {
            total: values.length,
            present,
            late,
            absent,
            excused,
            marked,
            unmarked,
            presentRate: marked ? Math.round((present / marked) * 100) : 0,
        };
    }, [attendanceRows]);

    const hasAttendanceChanges = useMemo(() => {
        const currentIds = Object.keys(attendanceRows);
        const initialIds = Object.keys(initialAttendanceRows);
        if (currentIds.length !== initialIds.length) return currentIds.length > 0;

        return currentIds.some((studentId) => {
            const current = attendanceRows[studentId];
            const initial = initialAttendanceRows[studentId];
            if (!current || !initial) return true;

            return (
                current.status !== initial.status ||
                (current.notes || '').trim() !== (initial.notes || '').trim() ||
                (current.joinedAt || '') !== (initial.joinedAt || '') ||
                (current.leftAt || '') !== (initial.leftAt || '')
            );
        });
    }, [attendanceRows, initialAttendanceRows]);

    const filteredStudents = useMemo(() => {
        const query = attendanceQuery.trim().toLowerCase();

        return students.filter((student) => {
            const row = attendanceRows[student.id];
            const status = row?.status;
            const initial = initialAttendanceRows[student.id];
            const matchesQuery =
                !query ||
                [student.fullName, student.email, student.phone]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));

            if (!matchesQuery) return false;

            if (attendanceFilter === 'all') return true;
            if (attendanceFilter === 'unmarked') return !status || status === UNMARKED_ATTENDANCE_STATUS;
            if (attendanceFilter === 'changed') {
                return (
                    status !== initial?.status ||
                    (row?.notes || '').trim() !== (initial?.notes || '').trim()
                );
            }

            return status === attendanceFilter;
        });
    }, [attendanceFilter, attendanceQuery, attendanceRows, initialAttendanceRows, students]);

    const updateStatus = (studentId, status) => {
        setAttendanceRows((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }));
    };

    const updateNotes = (studentId, notes) => {
        setAttendanceRows((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                notes,
            },
        }));
    };

    const applyAttendanceStatus = (studentIds, status) => {
        setAttendanceRows((prev) => {
            const next = { ...prev };
            studentIds.forEach((studentId) => {
                if (!next[studentId]) return;
                next[studentId] = {
                    ...next[studentId],
                    status,
                };
            });
            return next;
        });
    };

    const hydrateAttendanceRows = useCallback((items) => {
        setAttendanceRows((prev) => hydrateRowsFromAttendanceItems(prev, items));
    }, []);

    const saveAttendance = async () => {
        if (!selectedSessionId) {
            onNotice?.({
                tone: 'warning',
                title: 'Сессия тандалган эмес',
                message: 'Катышууну сактоо үчүн активдүү сессияны тандаңыз.',
            });
            toast.error('Катышууну сактоо үчүн сессияны тандаңыз.');
            return;
        }

        const unmarkedCount = Object.values(attendanceRows).filter(
            (row) => !row.status || row.status === UNMARKED_ATTENDANCE_STATUS
        ).length;
        if (unmarkedCount > 0) {
            const message = `Адегенде ${unmarkedCount} студент үчүн катышуу статусун тандаңыз.`;
            onNotice?.({
                tone: 'warning',
                title: 'Катышуу толук белгиленген эмес',
                message,
            });
            toast.error(message);
            return;
        }

        if (!hasAttendanceChanges) {
            onNotice?.({
                tone: 'info',
                title: 'Өзгөртүү жок',
                message: 'Катышуу тизмеси сакталган абал менен бирдей.',
            });
            toast('Өзгөртүү жок.');
            return;
        }

        const rows = Object.values(attendanceRows).map((row) => ({
            studentId: row.studentId,
            status: row.status,
            notes: row.notes?.trim() || undefined,
            joinedAt: row.joinedAt,
            leftAt: row.leftAt,
        }));

        setSavingAttendance(true);
        try {
            await markSessionAttendanceBulk(Number(selectedSessionId), {
                rows,
            });
            onNotice?.({
                tone: 'success',
                title: 'Катышуу сакталды',
                message: 'Катышуу ушул активдүү сессия үчүн жаңыртылды.',
            });
            toast.success('Катышуу ушул сессия үчүн сакталды.');

            const refreshed = await fetchCourseAttendance({
                courseId: Number(selectedCourseId),
                groupId: Number(selectedGroupId),
            });
            setAttendanceHistory(refreshed?.items || []);
            setInitialAttendanceRows(attendanceRows);
            await onRefreshInsights?.();
        } catch (error) {
            const message = getWorkspaceErrorMessage(error, 'Катышууну сактоо катасы');
            onNotice?.({ tone: 'error', title: 'Катышуу сакталган жок', message });
            toast.error(message);
        } finally {
            setSavingAttendance(false);
        }
    };

    return {
        applyAttendanceStatus,
        attendanceFilter,
        attendanceQuery,
        attendanceRows,
        attendanceStats,
        filteredStudents,
        hasAttendanceChanges,
        hydrateAttendanceRows,
        loadingStudents,
        saveAttendance,
        savingAttendance,
        setAttendanceFilter,
        setAttendanceHistory,
        setAttendanceQuery,
        students,
        updateNotes,
        updateStatus,
    };
};

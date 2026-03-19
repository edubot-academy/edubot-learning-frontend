import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { ATTENDANCE_STATUS } from '@shared/contracts';
import {
    fetchCourseAttendance,
    fetchCourseStudents,
    fetchCourses,
    markAttendanceSession,
} from '@services/api';

const todayLocal = () => new Date().toISOString().slice(0, 10);

const statusOptions = [
    { value: ATTENDANCE_STATUS.PRESENT, label: 'Катышты' },
    { value: ATTENDANCE_STATUS.LATE, label: 'Кечикти' },
    { value: ATTENDANCE_STATUS.ABSENT, label: 'Келген жок' },
];

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

const AttendancePage = ({ embedded = false }) => {
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

    useEffect(() => {
        let cancelled = false;
        const loadCourses = async () => {
            setLoadingCourses(true);
            try {
                const response = await fetchCourses({ limit: 200 });
                if (cancelled) return;
                const list = toCourseList(response);
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
    }, []);

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

    const students = useMemo(() => Object.values(rowsMap), [rowsMap]);

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
        <div className={embedded ? 'space-y-6' : 'pt-24 max-w-7xl mx-auto px-4 pb-12 space-y-6'}>
            {!embedded && (
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E8ECF3]">Катышуу</h1>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        Сабактагы катышууну белгилөө жана отчетту көрүү.
                    </p>
                </div>
            )}

            <section className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                    Катышууну белгилөө
                </h2>

                <div className="grid md:grid-cols-3 gap-3">
                    <label className="text-sm text-gray-700 dark:text-[#E8ECF3]">
                        <span className="block mb-1">Курс</span>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
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

                    <label className="text-sm text-gray-700 dark:text-[#E8ECF3]">
                        <span className="block mb-1">Сессия датасы</span>
                        <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                        />
                    </label>

                    <div className="flex items-end">
                        <button
                            onClick={handleSubmitAttendance}
                            disabled={savingAttendance || loadingStudents || !selectedCourseId}
                            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                        >
                            {savingAttendance ? 'Сакталууда...' : 'Катышууну сактоо'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-[#a6adba] border-b border-gray-100 dark:border-gray-800">
                                <th className="py-2 pr-3">Студент</th>
                                <th className="py-2 pr-3">Статус</th>
                                <th className="py-2 pr-3">Эскертүү</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr
                                    key={student.userId}
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3 text-gray-800 dark:text-gray-200">
                                        {student.fullName}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <select
                                            value={student.status}
                                            onChange={(e) =>
                                                handleStatusChange(student.userId, e.target.value)
                                            }
                                            className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#0E0E0E]"
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-2 pr-3">
                                        <input
                                            value={student.notes}
                                            onChange={(e) =>
                                                handleNotesChange(student.userId, e.target.value)
                                            }
                                            placeholder="Эскертүү"
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#0E0E0E]"
                                        />
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && !loadingStudents && (
                                <tr>
                                    <td colSpan={3} className="py-6 text-center text-gray-500">
                                        Студент табылган жок.
                                    </td>
                                </tr>
                            )}
                            {loadingStudents && (
                                <tr>
                                    <td colSpan={3} className="py-6 text-center text-gray-500">
                                        Студенттер жүктөлүүдө...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                    Катышуу отчету
                </h2>

                <div className="grid md:grid-cols-4 gap-3">
                    <label className="text-sm text-gray-700 dark:text-[#E8ECF3]">
                        <span className="block mb-1">Күндөн</span>
                        <input
                            type="date"
                            value={reportFrom}
                            onChange={(e) => setReportFrom(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                        />
                    </label>
                    <label className="text-sm text-gray-700 dark:text-[#E8ECF3]">
                        <span className="block mb-1">Күнгө чейин</span>
                        <input
                            type="date"
                            value={reportTo}
                            onChange={(e) => setReportTo(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                        />
                    </label>
                    <div className="flex items-end">
                        <button
                            onClick={handleLoadReport}
                            disabled={loadingReport || !selectedCourseId}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-[#E8ECF3] disabled:opacity-60"
                        >
                            {loadingReport ? 'Жүктөлүүдө...' : 'Отчетту жүктөө'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-[#a6adba] border-b border-gray-100 dark:border-gray-800">
                                <th className="py-2 pr-3">Дата</th>
                                <th className="py-2 pr-3">Студент</th>
                                <th className="py-2 pr-3">Статус</th>
                                <th className="py-2 pr-3">Эскертүү</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportItems.map((item) => (
                                <tr
                                    key={item.id || `${item.userId}-${item.sessionDate}`}
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3">{item.sessionDate || '-'}</td>
                                    <td className="py-2 pr-3">
                                        {item.user?.fullName || item.fullName || `#${item.userId}`}
                                    </td>
                                    <td className="py-2 pr-3">{item.status || '-'}</td>
                                    <td className="py-2 pr-3">{item.notes || '-'}</td>
                                </tr>
                            ))}
                            {reportItems.length === 0 && !loadingReport && (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-500">
                                        Отчет табылган жок.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AttendancePage;

AttendancePage.propTypes = {
    embedded: PropTypes.bool,
};

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiCheckSquare, FiBookOpen, FiInbox, FiUsers, FiUserPlus } from 'react-icons/fi';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import SessionList from '@features/liveCourses/components/SessionList';
import RosterTable from '@features/liveCourses/components/RosterTable';
import AttendanceSummary from '@features/liveCourses/components/AttendanceSummary';
import HomeworkCard from '@features/liveCourses/components/HomeworkCard';
import StudentSearchCombobox from '@features/liveCourses/components/StudentSearchCombobox';
import Modal from '@shared/ui/Modal';
import {
    listCourseSessions,
    markSessionComplete,
    bulkSaveAttendance,
    listAssignments,
    listSubmissions,
    reviewSubmission,
    fetchInstructorLiveDashboard,
    fetchCourseDetails,
    rescheduleSession,
    cancelSession,
    fetchCourseRoster,
    fetchUsers,
    enrollUserInCourse,
} from '@services/api';

const TEXT = {
    ky: {
        title: 'Курс башкаруу',
        tabs: {
            sessions: 'Сабактар',
            attendance: 'Катышуу',
            homework: 'Тапшырмалар',
            submissions: 'Жөнөтүүлөр',
            students: 'Студенттер',
        },
        markComplete: 'Бүткөн деп белгилөө',
        saveAttendance: 'Катышууну сактоо',
        review: 'Ревью',
    },
    ru: {
        title: 'Управление курсом',
        tabs: {
            sessions: 'Сессии',
            attendance: 'Посещаемость',
            homework: 'Домашки',
            submissions: 'Отправки',
            students: 'Студенты',
        },
        markComplete: 'Отметить выполненным',
        saveAttendance: 'Сохранить посещаемость',
        review: 'Проверить',
    },
};

const InstructorCourseManage = () => {
    const { id } = useParams();
    const [lang] = useState('ky');
    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);
    const [course, setCourse] = useState(null);
    const [roster, setRoster] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [addingStudent, setAddingStudent] = useState(false);
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);
    const summaryCards = useMemo(() => {
        if (!course) return [];
        const formatDate = (date) => {
            if (!date) return '—';
            try {
                return new Date(date).toLocaleDateString('ky-KG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            } catch {
                return date;
            }
        };
        return [
            {
                title: 'Курс түрү',
                value: course.courseType || 'video',
                sub: course.languageCode ? `Тил: ${course.languageCode.toUpperCase()}` : '',
            },
            {
                title: 'График',
                value: `${formatDate(course.startDate)} → ${formatDate(course.endDate)}`,
                sub: course.daysOfWeek?.length
                    ? `Күндөр: ${course.daysOfWeek.join(', ')}`
                    : 'Күндөр көрсөтүлө элек',
            },
            {
                title: 'Убакыт / Таймзона',
                value: course.hoursPerDay ? `${course.hoursPerDay} саат/күндү` : '—',
                sub: course.timezone || 'Таймзона белгисиз',
            },
            {
                title: 'Жайгашуу / Шилтеме',
                value:
                    course.courseType === 'offline'
                        ? course.location || 'Дарек жок'
                        : course.meetingUrl || 'Шилтеме жок',
                sub: course.seatLimit ? `Орундар: ${course.seatLimit}` : '',
            },
            {
                title: 'Баасы',
                value:
                    course.isPaid && Number(course.price) > 0 ? `${course.price} с` : 'Акысыз',
                sub: course.isPublished ? 'Жарыяланды' : 'Дагы жарыяланбайт',
            },
        ];
    }, [course, lang]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [sessionRes, attendanceRes, courseRes, rosterRes] = await Promise.all([
                    listCourseSessions(id),
                    fetchInstructorLiveDashboard(id),
                    fetchCourseDetails(id),
                    fetchCourseRoster(id),
                ]);
                const normalizeSession = (s) => {
                    const toDate = (value) => {
                        if (!value) return '';
                        try {
                            return new Date(value).toISOString().split('T')[0];
                        } catch {
                            return value;
                        }
                    };
                    const toTime = (value) => {
                        if (!value) return '';
                        try {
                            const date = new Date(value);
                            const hh = `${date.getHours()}`.padStart(2, '0');
                            const mm = `${date.getMinutes()}`.padStart(2, '0');
                            return `${hh}:${mm}`;
                        } catch {
                            return value;
                        }
                    };
                    const startSource = s.startAt || s.startsAt;
                    const endSource = s.endAt || s.endsAt;
                    return {
                        ...s,
                        date: s.date || (startSource ? toDate(startSource) : ''),
                        startTime: s.startTime || (startSource ? toTime(startSource) : ''),
                        endTime: s.endTime || (endSource ? toTime(endSource) : ''),
                    };
                };
                const normalizedSessions = (Array.isArray(sessionRes) ? sessionRes : sessionRes?.items || []).map(normalizeSession);
                setSessions(normalizedSessions);
                setCourse(courseRes || null);
                const rosterFromCourse =
                    rosterRes?.items ||
                    rosterRes ||
                    courseRes?.students ||
                    courseRes?.enrollments ||
                    courseRes?.roster ||
                    [];
                const rosterArray = Array.isArray(rosterFromCourse) ? rosterFromCourse : [];
                setRoster(rosterArray);
                const initialAttendance = {};
                rosterArray.forEach((student) => {
                    if (student?.id) {
                        initialAttendance[student.id] = 'present';
                    }
                });
                const attendanceData = attendanceRes || {};
                setAttendance({ ...initialAttendance, ...(attendanceData || {}) });
            } catch (error) {
                console.error('Failed to load course manage data', error);
                toast.error('Маалымат жүктөлбөдү');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    useEffect(() => {
        const handle = setTimeout(async () => {
            if (!searchQuery || searchQuery.length < 2) {
                setSearchResults([]);
                setSelectedStudent(null);
                return;
            }
            setSearchLoading(true);
            try {
                const res = await fetchUsers({ search: searchQuery, limit: 10, role: 'student' });
                const items = Array.isArray(res?.data) ? res.data : res || [];
                setSearchResults(items);
            } catch (error) {
                console.error('Failed to search students', error);
                toast.error('Студенттерди издөө мүмкүн болбоду');
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => clearTimeout(handle);
    }, [searchQuery]);

    useEffect(() => {
        const loadAssignments = async () => {
            if (!id) return;
            try {
                const data = await listAssignments(id);
                setAssignments(Array.isArray(data) ? data : data?.items || []);
            } catch (error) {
                console.error('Failed to load assignments', error);
            }
        };
        loadAssignments();
    }, [id]);

    const handleComplete = async (sessionId) => {
        try {
            await markSessionComplete(id, sessionId);
            setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: 'completed' } : s)));
            toast.success('Сабак бүткөн деп белгиленди');
        } catch (error) {
            console.error('Failed to mark complete', error);
            toast.error('Белгилөө мүмкүн болбоду');
        }
    };

    const combineDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        return new Date(`${dateStr}T${timeStr}:00Z`).toISOString();
    };

    const handleSessionChange = async (sessionId, patch) => {
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s)));
        const current = sessions.find((s) => s.id === sessionId) || {};
        const payload = {
            date: patch.date || current.date,
            startTime: patch.startTime || current.startTime,
            endTime: patch.endTime || current.endTime,
            status: patch.status || current.status,
            title: patch.title || current.title,
        };
        const startsAt = combineDateTime(payload.date, payload.startTime);
        const endsAt = combineDateTime(payload.date, payload.endTime);
        try {
            if (patch.status === 'cancelled') {
                await cancelSession(id, sessionId);
                toast.success('Сабак жокко чыгарылды');
                return;
            }

            await rescheduleSession(id, sessionId, {
                ...payload,
                startsAt,
                endsAt,
            });
            toast.success('Сабак жаңыртылды');
        } catch (error) {
            console.error('Failed to update session', error);
            toast.error('Сабак жаңыртылбады');
        }
    };

    const handleSaveAttendance = async () => {
        const sessionId = sessions[0]?.id;
        if (!sessionId) {
            toast.error('Сабак табылган жок');
            return;
        }
        const rosterIds = new Set(
            (roster || [])
                .map((s) => Number(s.id))
                .filter((id) => Number.isInteger(id) && id > 0)
        );
        const records = Object.entries(attendance || {})
            .map(([studentId, status]) => ({
                studentId: Number(studentId),
                status,
            }))
            .filter(
                (rec) => rosterIds.has(rec.studentId) && rec.status
            );
        if (!records.length) {
            toast.error('Катышууну белгилеңиз');
            return;
        }
        try {
            await bulkSaveAttendance(id, sessionId, { records });
            toast.success('Катышуу сакталды');
        } catch (error) {
            console.error('Failed to save attendance', error);
            toast.error('Катышуу сакталган жок');
        }
    };

    const handleLoadSubmissions = async (assignmentId) => {
        try {
            const data = await listSubmissions(id, assignmentId);
            setSubmissions(Array.isArray(data) ? data : data?.items || []);
        } catch (error) {
            console.error('Failed to load submissions', error);
        }
    };

    const handleReview = async (submissionId, status) => {
        if (!assignments[0]) return;
        try {
            await reviewSubmission(id, assignments[0].id, submissionId, { status });
            toast.success('Жооп жаңыртылды');
            setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status } : s)));
        } catch (error) {
            console.error('Failed to review submission', error);
            toast.error('Жаңыртуу мүмкүн болбоду');
        }
    };

    const renderAttendanceTable = () => (
        <div className="space-y-3">
            {roster.map((student) => {
                const fullName =
                    student.fullName ||
                    [student.firstName, student.lastName].filter(Boolean).join(' ') ||
                    student.name ||
                    student.email;
                return (
                    <div key={student.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{fullName}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                        <select
                            value={attendance[student.id] || 'present'}
                            onChange={(e) =>
                                setAttendance((prev) => ({
                                    ...prev,
                                    [student.id]: e.target.value,
                                }))
                            }
                            className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                        >
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                );
            })}
            <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {copy.saveAttendance}
            </button>
        </div>
    );

    const renderSubmissions = () => (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {assignments.map((a) => (
                    <button
                        key={a.id}
                        onClick={() => handleLoadSubmissions(a.id)}
                        className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm"
                    >
                        {a.title}
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                {submissions.map((sub) => (
                    <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{sub.studentName}</p>
                            <p className="text-xs text-gray-500">{sub.status}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleReview(sub.id, 'approved')}
                                className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReview(sub.id, 'needs_changes')}
                                className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm"
                            >
                                {copy.review}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        if (activeTab === 'details') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {summaryCards.map((card, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4 shadow-sm"
                        >
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {card.title}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {card.value}
                            </p>
                            {card.sub && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {card.sub}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
        if (activeTab === 'sessions')
            return (
                <SessionList
                    sessions={sessions}
                    onAdd={() =>
                        setSessions((prev) => [
                            ...prev,
                            {
                                id: Date.now(),
                                title: 'New session',
                                date: '',
                                startTime: '10:00',
                                endTime: '11:00',
                                status: 'scheduled',
                            },
                        ])
                    }
                    onChange={handleSessionChange}
                    onCancel={(id) => handleSessionChange(id, { status: 'cancelled' })}
                    onComplete={handleComplete}
                    lang={lang}
                />
            );
        if (activeTab === 'attendance')
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>{renderAttendanceTable()}</div>
                    <AttendanceSummary stats={attendance} lang={lang} />
                </div>
            );
        if (activeTab === 'homework')
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignments.map((a) => (
                        <HomeworkCard key={a.id} homework={{ ...a, tag: 'new', description: a.description || a.title }} lang={lang} />
                    ))}
                </div>
            );
        if (activeTab === 'submissions') return renderSubmissions();
        const seatUsage = `${roster.length}${course?.seatLimit ? `/${course.seatLimit}` : ''}`;
        const handleAddStudent = (student) => {
            if (!student?.id) return;
            setSelectedStudent(student);
        };

        const handleSaveStudent = async () => {
            if (!selectedStudent?.id) {
                toast.error('Студентти тандаңыз');
                return;
            }
            if (course?.seatLimit && roster.length >= course.seatLimit) {
                toast.error('Орундар толду');
                return;
            }
            setAddingStudent(true);
            try {
                await enrollUserInCourse(selectedStudent.id, id);
                setRoster((prev) => {
                    if (prev.some((s) => s.id === selectedStudent.id)) return prev;
                    return [...prev, selectedStudent];
                });
                setAttendance((prev) => ({
                    ...prev,
                    [selectedStudent.id]: prev[selectedStudent.id] || 'present',
                }));
                toast.success('Студент кошулду');
                setAddModalOpen(false);
                setSelectedStudent(null);
                setSearchQuery('');
                setSearchResults([]);
            } catch (error) {
                console.error('Failed to enroll student', error);
                toast.error('Кошуу мүмкүн болбоду');
            } finally {
                setAddingStudent(false);
            }
        };
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                        <FiUserPlus className="text-xl text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {course?.seatLimit
                                ? `Орун: ${seatUsage}. Студент кошуу үчүн басыңыз.`
                                : 'Студент кошуу үчүн басыңыз.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAddModalOpen(true)}
                        className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                    >
                        Студент кошуу
                    </button>
                </div>
                <RosterTable roster={roster} seatUsage={seatUsage} onRemove={() => {}} lang={lang} />

                <Modal
                    isOpen={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    title="Студент кошуу"
                    initialFocus={false}
                >
                    <div className="space-y-4">
                        <StudentSearchCombobox
                            query={searchQuery}
                            setQuery={setSearchQuery}
                            results={searchResults}
                            loading={searchLoading}
                            onSelect={handleAddStudent}
                            lang={lang}
                            autoFocus
                        />
                        {selectedStudent && (
                            <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {selectedStudent.fullName ||
                                        [selectedStudent.firstName, selectedStudent.lastName]
                                            .filter(Boolean)
                                            .join(' ') ||
                                        selectedStudent.name ||
                                        selectedStudent.email}
                                </p>
                                <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setAddModalOpen(false)}
                                className="px-4 py-2 rounded border border-gray-200 text-sm"
                            >
                                Жабуу
                            </button>
                            <button
                                type="button"
                                disabled={addingStudent}
                                onClick={handleSaveStudent}
                                className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {addingStudent ? 'Кошулууда...' : 'Сактоо'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };

    return (
        <div className="pt-20 pb-10 max-w-6xl mx-auto px-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.title}</h1>
                    {loading && <p className="text-sm text-gray-500">Жүктөлүүдө...</p>}
                </div>
            </div>
            <div className="grid lg:grid-cols-[260px_1fr] gap-4 items-start">
                <DashboardSidebar
                    items={[
                        { id: 'details', label: 'Курс маалыматтары', icon: FiBookOpen },
                        { id: 'sessions', label: copy.tabs.sessions, icon: FiCalendar },
                        { id: 'attendance', label: copy.tabs.attendance, icon: FiCheckSquare },
                        { id: 'homework', label: copy.tabs.homework, icon: FiBookOpen },
                        { id: 'submissions', label: copy.tabs.submissions, icon: FiInbox },
                        { id: 'students', label: copy.tabs.students, icon: FiUsers },
                    ]}
                    activeId={activeTab}
                    onSelect={setActiveTab}
                    defaultOpen
                    className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-700"
                />
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-5 shadow-sm">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default InstructorCourseManage;

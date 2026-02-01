import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FiCalendar,
    FiCheckSquare,
    FiBookOpen,
    FiInbox,
    FiUsers,
    FiUserPlus,
    FiHome,
    FiSettings,
} from 'react-icons/fi';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';
import SessionList from '@features/liveCourses/components/SessionList';
import RosterTable from '@features/liveCourses/components/RosterTable';
import AttendanceSummary from '@features/liveCourses/components/AttendanceSummary';
import HomeworkCard from '@features/liveCourses/components/HomeworkCard';
import StudentSearchCombobox from '@features/liveCourses/components/StudentSearchCombobox';
import Modal from '@shared/ui/Modal';
import {
    listCourseSessions,
    generateCourseSessions,
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
    fetchCourseOverview,
    releaseSessionHomework,
    presignAssignmentUpload,
} from '@services/api';

const TEXT = {
    ky: {
        title: 'Курс башкаруу',
        tabs: {
            overview: 'Кыскача',
            sessions: 'Сабактар',
            attendance: 'Катышуу',
            homework: 'Тапшырмалар',
            submissions: 'Жөнөтүүлөр',
            students: 'Студенттер',
            settings: 'Орнотуулар',
        },
        markComplete: 'Бүткөн деп белгилөө',
        saveAttendance: 'Катышууну сактоо',
        review: 'Ревью',
        assignments: {
            create: 'Тапшырма түзүү',
            publish: 'Жарыялоо',
            draftTab: 'Драфттар',
            publishedTab: 'Жарыяланган',
            title: 'Аталыш',
            description: 'Сүрөттөмө',
            dueAt: 'Дедлайн',
            releaseAt: 'Жарыялоо убактысы',
            points: 'Балл',
            session: 'Сабак',
            status: 'Статус',
            publishNow: 'Дароо жарыялоо',
            useTemplate: 'Шаблон кылуу',
            badgeDraft: 'Драфт',
            badgePublished: 'Жарыяланган',
            attachments: 'Файлдар (URL)',
        },
    },
    ru: {
        title: 'Управление курсом',
        tabs: {
            overview: 'Обзор',
            sessions: 'Сессии',
            attendance: 'Посещаемость',
            homework: 'Домашки',
            submissions: 'Отправки',
            students: 'Студенты',
            settings: 'Настройки',
        },
        markComplete: 'Отметить выполненным',
        saveAttendance: 'Сохранить посещаемость',
        review: 'Проверить',
        assignments: {
            create: 'Создать задание',
            publish: 'Опубликовать',
            draftTab: 'Черновики',
            publishedTab: 'Опубликованные',
            title: 'Название',
            description: 'Описание',
            dueAt: 'Дедлайн',
            releaseAt: 'Время публикации',
            points: 'Баллы',
            session: 'Сессия',
            status: 'Статус',
            publishNow: 'Опубликовать сейчас',
            useTemplate: 'Использовать как шаблон',
            badgeDraft: 'Черновик',
            badgePublished: 'Опубликовано',
            attachments: 'Файлы (URL)',
        },
    },
};

const InstructorCourseManage = () => {
    const { id } = useParams();
    const [lang] = useState('ky');
    const [activeTab, setActiveTab] = useState('overview');
    const [sessions, setSessions] = useState([]);
    const [course, setCourse] = useState(null);
    const [overview, setOverview] = useState(null);
    const [roster, setRoster] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [generateMode, setGenerateMode] = useState('append');
    const [titlePrefix, setTitlePrefix] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [addingStudent, setAddingStudent] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [assignmentFilter, setAssignmentFilter] = useState('all'); // all | draft | published
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        dueAt: '',
        releaseAt: '',
        points: '',
        sessionId: '',
        status: 'draft',
        attachments: [],
    });
    const [viewMode, setViewMode] = useState('list');
    const [reviewModal, setReviewModal] = useState({ open: false, submission: null });
    const [releasingId, setReleasingId] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [attendanceSessionId, setAttendanceSessionId] = useState('');
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [uploadingAssignmentFiles, setUploadingAssignmentFiles] = useState(false);
    const [uploadingReviewFiles, setUploadingReviewFiles] = useState(false);
    const [assignmentFileUrls, setAssignmentFileUrls] = useState([]);
    const [reviewFiles, setReviewFiles] = useState([]);
    const [sessionStatusFilter, setSessionStatusFilter] = useState('all');
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState({});
    const [calendarPage, setCalendarPage] = useState(0);
    const CALENDAR_PAGE_SIZE = 10;
    const [settingsTabMessage] = useState({
        ky: 'Жакында бул жерден курстун орнотууларын жаңырта аласыз.',
        ru: 'Скоро здесь появятся настройки курса.',
    });
    const [initLoaded, setInitLoaded] = useState(false);
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);
    const loadAssignments = useCallback(async () => {
        if (!id) return;
        try {
            const data = await listAssignments(id);
            setAssignments(Array.isArray(data) ? data : data?.items || []);
        } catch (error) {
            console.error('Failed to load assignments', error);
        }
    }, [id]);
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
                const [sessionRes, attendanceRes, courseRes, rosterRes, overviewRes] = await Promise.all([
                    listCourseSessions(id),
                    fetchInstructorLiveDashboard(id),
                    fetchCourseDetails(id),
                    fetchCourseRoster(id),
                    fetchCourseOverview(id),
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
                setAttendanceSessionId((normalizedSessions[0] && normalizedSessions[0].id) || '');
                setCourse(courseRes || null);
                setOverview(overviewRes || null);
                const attendanceItems = Array.isArray(attendanceRes?.items)
                    ? attendanceRes.items
                    : Array.isArray(attendanceRes)
                      ? attendanceRes
                      : attendanceRes?.records || [];
                setAttendanceHistory(attendanceItems);
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
                setInitLoaded(true);
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
        loadAssignments();
    }, [id, loadAssignments]);

    useEffect(() => {
        if (sessions.length && !attendanceSessionId) {
            setAttendanceSessionId(sessions[0].id);
        }
    }, [sessions, attendanceSessionId]);

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

    const handleReleaseHomework = async (sessionId) => {
        setReleasingId(sessionId);
        try {
            await releaseSessionHomework(sessionId, id);
            toast.success(lang === 'ru' ? 'Домашка выпущена' : 'Тапшырма чыгарылды');
        } catch (error) {
            console.error('Failed to release homework', error);
            toast.error(lang === 'ru' ? 'Не удалось выпустить' : 'Чыгаруу мүмкүн болбоду');
        } finally {
            setReleasingId(null);
        }
    };

    const nextSession = useMemo(() => {
        if (!sessions.length) return null;
        const sorted = [...sessions].sort(
            (a, b) => new Date(a.startsAt || a.startAt || a.date) - new Date(b.startsAt || b.startAt || b.date)
        );
        return sorted.find((s) => s.status !== 'completed') || sorted[0];
    }, [sessions]);

    const handleGenerateSessions = async (mode = 'append') => {
        if (!course?.startDate || !course?.endDate || !course?.daysOfWeek?.length) {
            toast.error('Алгач курс даталарын толтуруңуз');
            return;
        }
        if (mode === 'replace' && !window.confirm('Бардык сабактарды алмаштырабызбы?')) {
            return;
        }
        setGenerating(true);
        try {
            await generateCourseSessions(id, {
                startDate: course.startDate,
                endDate: course.endDate,
                daysOfWeek: course.daysOfWeek,
                hoursPerDay: course.hoursPerDay,
                timezone: course.timezone,
                defaultStartTime: course.dailyStartTime || course.defaultStartTime,
                mode,
                titlePrefix: titlePrefix || undefined,
            });
            const refreshed = await listCourseSessions(id);
            const normalized = (Array.isArray(refreshed) ? refreshed : refreshed?.items || []).map((s) => ({
                ...s,
                date: s.date || s.startsAt || s.startAt || '',
            }));
            setSessions(normalized);
            toast.success('Сабактар жаңыртылды');
        } catch (error) {
            console.error('Failed to generate sessions', error);
            toast.error('Сабактарды түзүү мүмкүн болбоду');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveAttendance = async () => {
        const sessionId = attendanceSessionId || sessions[0]?.id;
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

    const handleCreateAssignment = async () => {
        if (!newAssignment.title?.trim()) {
            toast.error(lang === 'ru' ? 'Введите название' : 'Аталышты киргизиңиз');
            return;
        }
        try {
            const payload = {
                title: newAssignment.title.trim(),
                description: newAssignment.description?.trim() || '',
                dueAt: newAssignment.dueAt || undefined,
                releaseAt: newAssignment.releaseAt || undefined,
                points: newAssignment.points ? Number(newAssignment.points) : undefined,
                sessionId: newAssignment.sessionId ? Number(newAssignment.sessionId) : undefined,
                attachments: Array.isArray(newAssignment.attachments)
                    ? newAssignment.attachments.filter(Boolean)
                    : [],
            };
            const created = await upsertAssignment(id, payload);
            if (newAssignment.status === 'published' && created?.id) {
                await publishAssignment(created.id);
            }
            toast.success(lang === 'ru' ? 'Задание сохранено' : 'Тапшырма сакталды');
            setAssignmentModalOpen(false);
            setNewAssignment({
                title: '',
                description: '',
                dueAt: '',
                releaseAt: '',
                points: '',
                sessionId: '',
                status: 'draft',
                attachments: [],
                uploadedAttachments: [],
            });
            setAssignmentFileUrls([]);
            await loadAssignments();
        } catch (error) {
            console.error('Failed to create assignment', error);
            toast.error(lang === 'ru' ? 'Не удалось сохранить' : 'Сактоо мүмкүн болбоду');
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

    const handlePublishAssignment = async (assignmentId) => {
        if (!assignmentId) return;
        try {
            await publishAssignment(assignmentId);
            toast.success(lang === 'ru' ? 'Опубликовано' : 'Жарыяланды');
            await loadAssignments();
        } catch (error) {
            console.error('Failed to publish assignment', error);
            toast.error(lang === 'ru' ? 'Не удалось' : 'Ийгиликсиз');
        }
    };

    const handleReview = async (submissionId, status, comment) => {
        if (!assignments[0]) return;
        try {
            await reviewSubmission(id, assignments[0].id, submissionId, { status, comment });
            toast.success('Жооп жаңыртылды');
            setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status } : s)));
        } catch (error) {
            console.error('Failed to review submission', error);
            toast.error('Жаңыртуу мүмкүн болбоду');
        }
    };

    const attendanceStats = useMemo(() => {
        const total = roster.filter((r) => r?.id).length || 0;
        if (!total) {
            return { present: 0, late: 0, absent: 0 };
        }
        const counts = Object.values(attendance || {}).reduce(
            (acc, status) => {
                if (status === 'late') acc.late += 1;
                else if (status === 'absent') acc.absent += 1;
                else acc.present += 1;
                return acc;
            },
            { present: 0, late: 0, absent: 0 }
        );
        const pct = (value) => Math.min(100, Math.round((value / total) * 100));
        return {
            present: pct(counts.present),
            late: pct(counts.late),
            absent: pct(counts.absent),
        };
    }, [attendance, roster]);

    const attendanceBySession = useMemo(() => {
        if (!attendanceHistory.length) return [];
        const grouped = attendanceHistory.reduce((acc, row) => {
            const key = row.sessionId || row.sessionTitle || 'unknown';
            if (!acc[key]) {
                acc[key] = { sessionId: row.sessionId, sessionTitle: row.sessionTitle || `Session ${row.sessionId}`, present: 0, late: 0, absent: 0 };
            }
            if (row.status === 'late') acc[key].late += 1;
            else if (row.status === 'absent') acc[key].absent += 1;
            else acc[key].present += 1;
            return acc;
        }, {});
        return Object.values(grouped);
    }, [attendanceHistory]);

    const formatRelativeBadge = (dateStr) => {
        try {
            const target = new Date(dateStr);
            const diffMs = target - new Date();
            const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
            if (Number.isNaN(days)) return '';
            if (days === 0) return lang === 'ru' ? 'сегодня' : 'бүгүн';
            if (days > 0) return lang === 'ru' ? `через ${days} д.` : `${days} күндөн кийин`;
            return lang === 'ru' ? `${Math.abs(days)} д. назад` : `${Math.abs(days)} күн мурун`;
        } catch {
            return '';
        }
    };

    const uploadWithPresign = async ({ presignFn, payload, file, progressKey }) => {
        try {
            const { key, url, maxFileSize } = await presignFn(payload);
            if (maxFileSize && file.size > maxFileSize) {
                throw new Error('FILE_TOO_LARGE');
            }
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', url);
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                xhr.upload.onprogress = (event) => {
                    if (progressKey && event.lengthComputable) {
                        const pct = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress((prev) => ({ ...prev, [progressKey]: pct }));
                    }
                };
                xhr.onload = () => resolve();
                xhr.onerror = () => reject(new Error('UPLOAD_FAILED'));
                xhr.send(file);
            });
            return key;
        } catch (error) {
            console.error('Upload failed', error);
            throw error;
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
        <div className="space-y-3">
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
            {submissions.length ? (
                <div className="space-y-2">
                    {submissions.map((sub) => (
                        <div
                            key={sub.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {sub.studentName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {lang === 'ru' ? 'Статус' : 'Статус'}: {sub.status}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {lang === 'ru' ? 'Отправлено' : 'Жөнөтүлдү'}:{' '}
                                        {sub.submittedAt || sub.createdAt || '—'}
                                        {sub.reviewedAt && ` · ${lang === 'ru' ? 'Каралды' : 'Каралды'}: ${sub.reviewedAt}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setReviewComment('');
                                        setReviewModal({ open: true, submission: sub });
                                    }}
                                    className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm"
                                >
                                    {copy.review}
                                </button>
                            </div>
                            {sub.text && (
                                <p className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    {sub.text}
                                </p>
                            )}
                            {sub.link && (
                                <a
                                    href={sub.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-600 underline"
                                >
                                    {sub.link}
                                </a>
                            )}
                            {Array.isArray(sub.attachments) && sub.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {sub.attachments.map((att, idx) => (
                                        <a
                                            key={`${att}-${idx}`}
                                            href={att}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 underline"
                                        >
                                            {att}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-gray-500">
                    {lang === 'ru' ? 'Нет отправок' : 'Жөнөтүүлөр жок'}
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        if (activeTab === 'overview') {
            const metrics = [
                {
                    label: lang === 'ru' ? 'Записей' : 'Катышуучулар',
                    value: overview?.enrollments ?? roster.length ?? 0,
                },
                {
                    label: lang === 'ru' ? 'Запланировано занятий' : 'Пландалган сабактар',
                    value:
                        overview?.scheduledSessions ??
                        sessions.filter((s) => s.status !== 'completed').length ??
                        0,
                },
                {
                    label: lang === 'ru' ? 'Завершено занятий' : 'Бүткөн сабактар',
                    value:
                        overview?.completedSessions ??
                        sessions.filter((s) => s.status === 'completed').length ??
                        0,
                },
                {
                    label: lang === 'ru' ? 'Черновики домашних' : 'Драфт тапшырмалар',
                    value: overview?.draftAssignments ?? assignments.filter((a) => a.status === 'draft').length ?? 0,
                },
                {
                    label: lang === 'ru' ? 'Ожидают проверки' : 'Каралууда',
                    value:
                        overview?.pendingSubmissions ??
                        submissions.filter((s) => s.status === 'pending').length ??
                        0,
                },
            ];
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {metrics.map((m, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4"
                            >
                                <p className="text-xs text-gray-500">{m.label}</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {m.value}
                                </p>
                            </div>
                        ))}
                    </div>
                    {nextSession && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase text-gray-500">Кийинки сабак</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {nextSession.title || 'Session'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {nextSession.date || nextSession.startsAt} · {nextSession.startTime || ''} —{' '}
                                    {nextSession.endTime || ''}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('attendance')}
                                    className="px-4 py-2 rounded border border-gray-200 text-sm"
                                >
                                    {lang === 'ru' ? 'Посещаемость' : 'Катышуу'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleComplete(nextSession.id)}
                                    className="px-4 py-2 rounded bg-emerald-600 text-white text-sm"
                                >
                                    {copy.markComplete}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
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
                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {lang === 'ru' ? 'Сгенерировать занятия' : 'Сабактарды түзүү'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {lang === 'ru'
                                        ? 'Используйте даты и дни из курса. Режим: добавить или заменить.'
                                        : 'Курс даталарын колдонуп, сабактарды кошуу же алмаштыруу.'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={generateMode}
                                    onChange={(e) => setGenerateMode(e.target.value)}
                                    className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                                >
                                    <option value="append">{lang === 'ru' ? 'Добавить' : 'Кошуу'}</option>
                                    <option value="replace">{lang === 'ru' ? 'Заменить' : 'Алмаштыруу'}</option>
                                </select>
                                <input
                                    value={titlePrefix}
                                    onChange={(e) => setTitlePrefix(e.target.value)}
                                    placeholder={lang === 'ru' ? 'Префикс названий' : 'Аталыш префикси'}
                                    className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                                />
                                <button
                                    type="button"
                                    disabled={generating}
                                    onClick={() => handleGenerateSessions(generateMode)}
                                    className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {generating
                                        ? lang === 'ru'
                                            ? 'Генерация...'
                                            : 'Түзүлүүдө...'
                                        : lang === 'ru'
                                          ? 'Сгенерировать'
                                          : 'Түзүү'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded text-sm ${
                                viewMode === 'list'
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {lang === 'ru' ? 'Список' : 'Тизме'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-2 rounded text-sm ${
                                viewMode === 'calendar'
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {lang === 'ru' ? 'Календарь' : 'Календар'}
                        </button>
                        <div className="flex items-center gap-1 ml-auto">
                            {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setSessionStatusFilter(status)}
                                    className={`px-3 py-1 rounded-full text-xs ${
                                        sessionStatusFilter === status
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'border border-gray-200 dark:border-gray-700 text-gray-700'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    {viewMode === 'list' ? (
                        <SessionList
                            viewMode={viewMode}
                            renderCalendar={(list) => (
                                <div className="space-y-2">
                                    {list.slice(0, 10).map((s) => (
                                        <div
                                            key={s.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {s.title || 'Session'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {s.date} · {s.startTime} — {s.endTime}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                                                {s.status || 'scheduled'}
                                            </span>
                                        </div>
                                    ))}
                                    {!list.length && (
                                        <div className="text-sm text-gray-500">
                                            {lang === 'ru' ? 'Нет занятий' : 'Сабактар жок'}
                                        </div>
                                    )}
                                </div>
                            )}
                            sessions={
                                sessionStatusFilter === 'all'
                                    ? sessions
                                    : sessions.filter((s) => s.status === sessionStatusFilter)
                            }
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
                            onRelease={handleReleaseHomework}
                            releasingId={releasingId}
                            lang={lang}
                        />
                    ) : (
                        <SessionList
                            viewMode="calendar"
                            startIndex={calendarPage * CALENDAR_PAGE_SIZE}
                            pageSize={CALENDAR_PAGE_SIZE}
                            onPrevPage={
                                calendarPage > 0
                                    ? () => setCalendarPage((p) => Math.max(0, p - 1))
                                    : undefined
                            }
                            onNextPage={
                                (calendarPage + 1) * CALENDAR_PAGE_SIZE < sessions.length
                                    ? () => setCalendarPage((p) => p + 1)
                                    : undefined
                            }
                            sessions={
                                sessionStatusFilter === 'all'
                                    ? sessions
                                    : sessions.filter((s) => s.status === sessionStatusFilter)
                            }
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
                            onRelease={handleReleaseHomework}
                            releasingId={releasingId}
                            lang={lang}
                        />
                    )}
                </div>
            );
        if (activeTab === 'attendance')
            return (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const updated = {};
                                roster.forEach((s) => {
                                    if (s?.id) updated[s.id] = 'present';
                                });
                                setAttendance(updated);
                            }}
                            className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                        >
                            {lang === 'ru' ? 'Отметить всех' : 'Баарын катышты'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setAttendance({})}
                            className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm"
                        >
                            {lang === 'ru' ? 'Очистить' : 'Тазалоо'}
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-sm text-gray-600">
                            {lang === 'ru' ? 'Выберите сессию' : 'Сабакты тандаңыз'}
                        </label>
                        <select
                            value={attendanceSessionId}
                            onChange={(e) => setAttendanceSessionId(e.target.value)}
                            className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm w-full sm:w-auto"
                        >
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.title || `Session ${s.id}`} · {s.date} {s.startTime}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>{renderAttendanceTable()}</div>
                        <AttendanceSummary stats={attendanceStats} lang={lang} />
                    </div>
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {lang === 'ru' ? 'Аналитика' : 'Аналитика'}
                        </p>
                        {attendanceBySession.length ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {attendanceBySession.map((row) => {
                                    const total = row.present + row.late + row.absent || 1;
                                    const pct = (v) => Math.round((v / total) * 100);
                                    return (
                                        <div
                                            key={row.sessionId || row.sessionTitle}
                                            className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 space-y-1"
                                        >
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {row.sessionTitle}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {lang === 'ru' ? 'Присутствовали' : 'Катышты'}: {row.present} ({pct(row.present)}%)
                                                {' · '}
                                                {lang === 'ru' ? 'Опоздали' : 'Кечигишти'}: {row.late} ({pct(row.late)}%)
                                                {' · '}
                                                {lang === 'ru' ? 'Отсутствовали' : 'Келген жок'}: {row.absent} ({pct(row.absent)}%)
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                {lang === 'ru' ? 'Нет данных' : 'Маалымат жок'}
                            </p>
                        )}
                    </div>
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {lang === 'ru' ? 'Тарых' : 'Тарых'}
                        </p>
                        {attendanceHistory.length ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {attendanceHistory.map((row, idx) => (
                                    <div
                                        key={row.id || `${row.sessionId}-${row.studentId}-${idx}`}
                                        className="flex items-center justify-between text-sm border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {row.sessionTitle || `Session ${row.sessionId || ''}`}
                                            </p>
                                            <p className="text-xs text-gray-500">{row.date || row.recordedAt}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                                            {row.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                {lang === 'ru' ? 'Нет данных посещаемости' : 'Катышуу тарыхы жок'}
                            </p>
                        )}
                    </div>
                </div>
            );
        if (activeTab === 'homework') {
            const filteredAssignments =
                assignmentFilter === 'all'
                    ? assignments
                    : assignments.filter((a) => (assignmentFilter === 'draft' ? a.status === 'draft' : a.status === 'published'));
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAssignmentFilter('all')}
                                className={`px-3 py-2 rounded text-sm ${assignmentFilter === 'all' ? 'bg-emerald-600 text-white' : 'border border-gray-200 dark:border-gray-700'}`}
                            >
                                {copy.assignments?.draftTab} / {copy.assignments?.publishedTab}
                            </button>
                            <select
                                value={assignmentFilter}
                                onChange={(e) => setAssignmentFilter(e.target.value)}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                            >
                                <option value="all">{lang === 'ru' ? 'Все' : 'Баары'}</option>
                                <option value="draft">{copy.assignments?.draftTab}</option>
                                <option value="published">{copy.assignments?.publishedTab}</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAssignmentModalOpen(true)}
                            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                        >
                            {copy.assignments?.create}
                        </button>
                    </div>
                    {filteredAssignments.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredAssignments.map((a) => {
                                const release = a.releaseAt || a.publishedAt || '—';
                                const due = a.dueAt || a.dueDate || '—';
                                return (
                                    <div
                                        key={a.id}
                                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4 space-y-2 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-xs uppercase text-gray-500">
                                                    {a.status === 'draft'
                                                        ? copy.assignments?.badgeDraft
                                                        : copy.assignments?.badgePublished}
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {a.title}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                    {a.description || ''}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs ${
                                                    a.status === 'draft'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                }`}
                                            >
                                                {a.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex flex-col gap-1">
                                            <span>
                                                {copy.assignments?.releaseAt}: {release}
                                                {a.releaseAt && (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                                        {formatRelativeBadge(a.releaseAt)}
                                                    </span>
                                                )}
                                            </span>
                                            <span>
                                                {copy.assignments?.dueAt}: {due}
                                                {a.dueAt && (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                                        {formatRelativeBadge(a.dueAt)}
                                                    </span>
                                                )}
                                            </span>
                                            {a.sessionId && (
                                                <span>{copy.assignments?.session}: #{a.sessionId}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {a.status === 'draft' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handlePublishAssignment(a.id)}
                                                    className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                                                >
                                                    {copy.assignments?.publishNow}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAssignmentModalOpen(true);
                                                    setNewAssignment({
                                                        title: a.title || '',
                                                        description: a.description || '',
                                                        dueAt: a.dueAt || '',
                                                        releaseAt: a.releaseAt || '',
                                                        points: a.points || '',
                                                        sessionId: a.sessionId || '',
                                                        status: a.status || 'draft',
                                                        attachments: a.attachments || [],
                                                    });
                                                }}
                                                className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm"
                                            >
                                                {copy.assignments?.useTemplate}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            {lang === 'ru' ? 'Нет заданий' : 'Тапшырмалар жок'}
                        </div>
                    )}
                </div>
            );
        }
        if (activeTab === 'submissions') return renderSubmissions();
        if (activeTab === 'settings') {
            return (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4">
                    <p className="text-sm text-gray-600">{settingsTabMessage[lang] || settingsTabMessage.ky}</p>
                </div>
            );
        }
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
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div
                        className="h-full bg-emerald-500"
                        style={{
                            width: course?.seatLimit
                                ? `${Math.min(100, Math.round((roster.length / course.seatLimit) * 100))}%`
                                : `${roster.length ? 100 : 0}%`,
                        }}
                    />
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

    if (!initLoaded && loading) {
        return (
            <div className="pt-20 pb-10 max-w-6xl mx-auto px-4 space-y-4">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="grid lg:grid-cols-[260px_1fr] gap-4 items-start">
                    <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-10 max-w-6xl mx-auto px-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase text-gray-500">#{id}</p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {course?.title || copy.title}
                    </h1>
                    {loading && <p className="text-sm text-gray-500">Жүктөлүүдө...</p>}
                </div>
            </div>
            <div className="grid lg:grid-cols-[260px_1fr] gap-4 items-start">
                <DashboardSidebar
                    items={[
                        { id: 'overview', label: copy.tabs.overview, icon: FiHome },
                        { id: 'details', label: 'Курс маалыматтары', icon: FiBookOpen },
                        { id: 'sessions', label: copy.tabs.sessions, icon: FiCalendar },
                        { id: 'attendance', label: copy.tabs.attendance, icon: FiCheckSquare },
                        { id: 'homework', label: copy.tabs.homework, icon: FiBookOpen },
                        { id: 'submissions', label: copy.tabs.submissions, icon: FiInbox },
                        { id: 'students', label: copy.tabs.students, icon: FiUsers },
                        { id: 'settings', label: 'Settings', icon: FiSettings },
                    ]}
                    activeId={activeTab}
                    onSelect={setActiveTab}
                    defaultOpen
                    className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-700"
                />
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-5 shadow-sm min-h-[400px]">
                    {renderContent()}
                </div>
            </div>
            <Modal
                isOpen={assignmentModalOpen}
                onClose={() => setAssignmentModalOpen(false)}
                title={copy.assignments?.create}
                initialFocus={false}
            >
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">{copy.assignments?.title}</label>
                            <input
                                value={newAssignment.title}
                                onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">{copy.assignments?.session}</label>
                            <select
                                value={newAssignment.sessionId}
                                onChange={(e) => setNewAssignment((prev) => ({ ...prev, sessionId: e.target.value }))}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                            >
                                <option value="">{lang === 'ru' ? 'Без привязки' : 'Сессиясыз'}</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title || `Session ${s.id}`} · {s.date} {s.startTime}
                                    </option>
                                ))}
                            </select>
                        </div>
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="text-sm text-gray-600">{copy.assignments?.description}</label>
                                <textarea
                                    value={newAssignment.description}
                                    onChange={(e) => setNewAssignment((prev) => ({ ...prev, description: e.target.value }))}
                                    className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                                    rows={3}
                                />
                            </div>
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="text-sm text-gray-600">{copy.assignments?.attachments}</label>
                                <textarea
                                    placeholder="https://..., бир сапка бирден"
                                    value={(newAssignment.attachments || []).join('\n')}
                                    onChange={(e) =>
                                        setNewAssignment((prev) => ({
                                            ...prev,
                                            attachments: e.target.value
                                                .split('\n')
                                                .map((s) => s.trim())
                                                .filter(Boolean),
                                        }))
                                    }
                                    className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                                    rows={2}
                                />
                                <input
                                    type="file"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (!files.length) return;
                                        setUploadingAssignmentFiles(true);
                                        setUploadError('');
                                        try {
                                            const uploadedKeys = [];
                                            for (const file of files) {
                                                const progressKey = `${file.name}-${Date.now()}`;
                                                const key = await uploadWithPresign({
                                                    presignFn: (data) => presignAssignmentUpload(data),
                                                    payload: { courseId: id, fileName: file.name },
                                                    file,
                                                    progressKey,
                                                });
                                                uploadedKeys.push(key);
                                            }
                                            setAssignmentFileUrls((prev) => [...prev, ...uploadedKeys]);
                                            setNewAssignment((prev) => ({
                                                ...prev,
                                                attachments: [...(prev.attachments || []), ...uploadedKeys],
                                            }));
                                        } catch (error) {
                                            if (error.message === 'FILE_TOO_LARGE') {
                                                setUploadError(lang === 'ru' ? 'Файл слишком большой' : 'Файл өтө чоң');
                                            } else {
                                                setUploadError(lang === 'ru' ? 'Загрузка не удалась' : 'Жүктөө мүмкүн болбоду');
                                            }
                                        } finally {
                                            setUploadingAssignmentFiles(false);
                                        }
                                    }}
                                    className="text-sm text-gray-600"
                                />
                                {uploadingAssignmentFiles && (
                                    <p className="text-xs text-emerald-600">Жүктөлүүдө...</p>
                                )}
                                {uploadError && (
                                    <p className="text-xs text-red-600">{uploadError}</p>
                                )}
                                {Object.entries(uploadProgress).map(([k, v]) => (
                                    <div key={k} className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                                        <div className="h-2 bg-emerald-500" style={{ width: `${v}%` }} />
                                    </div>
                                ))}
                            </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">{copy.assignments?.releaseAt}</label>
                            <input
                                type="datetime-local"
                                value={newAssignment.releaseAt}
                                onChange={(e) => setNewAssignment((prev) => ({ ...prev, releaseAt: e.target.value }))}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">{copy.assignments?.dueAt}</label>
                            <input
                                type="datetime-local"
                                value={newAssignment.dueAt}
                                onChange={(e) => setNewAssignment((prev) => ({ ...prev, dueAt: e.target.value }))}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">{copy.assignments?.points}</label>
                            <input
                                type="number"
                                value={newAssignment.points}
                                onChange={(e) => setNewAssignment((prev) => ({ ...prev, points: e.target.value }))}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">{copy.assignments?.status}</label>
                            <select
                                value={newAssignment.status}
                                onChange={(e) => setNewAssignment((prev) => ({ ...prev, status: e.target.value }))}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                            >
                                <option value="draft">{copy.assignments?.draftTab}</option>
                                <option value="published">{copy.assignments?.publishedTab}</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setAssignmentModalOpen(false)}
                            className="px-4 py-2 rounded border border-gray-200 text-sm"
                        >
                            Жабуу
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateAssignment}
                            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                        >
                            Сактоо
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={reviewModal.open}
                onClose={() => setReviewModal({ open: false, submission: null })}
                title={lang === 'ru' ? 'Проверка отправки' : 'Жөнөтүүнү карап чыгуу'}
                initialFocus={false}
            >
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                {reviewModal.submission?.studentName} · {reviewModal.submission?.status}
                            </p>
                            <p className="text-xs text-gray-500">
                                {reviewModal.submission?.submittedAt || reviewModal.submission?.createdAt || ''}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setReviewFiles([])}
                                className="px-3 py-1 rounded border border-gray-200 text-xs"
                            >
                                {lang === 'ru' ? 'Тазалоо' : 'Тазалоо'}
                            </button>
                        </div>
                    </div>
                    {Array.isArray(reviewModal.submission?.attachments) && reviewModal.submission.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {reviewModal.submission.attachments.map((att, idx) => (
                                <a
                                    key={`${att}-${idx}`}
                                    href={att}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 underline"
                                >
                                    {att}
                                </a>
                            ))}
                        </div>
                    )}
                    {reviewModal.submission?.text && (
                        <p className="text-sm text-gray-800 dark:text-white">
                            {reviewModal.submission.text}
                        </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">
                                {lang === 'ru' ? 'Комментарий' : 'Комментарий'}
                            </label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">{lang === 'ru' ? 'Статус' : 'Статус'}</p>
                            <div className="flex flex-col gap-2">
                                {['approved', 'needs_changes'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => {
                                            if (reviewModal.submission?.id) {
                                                handleReview(reviewModal.submission.id, status, reviewComment);
                                            }
                                            setReviewModal({ open: false, submission: null });
                                        }}
                                        className={`px-3 py-2 rounded border text-sm ${
                                            status === 'approved'
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-amber-100 text-amber-800 border-amber-200'
                                        }`}
                                    >
                                        {status === 'approved'
                                            ? lang === 'ru'
                                                ? 'Одобрить'
                                                : 'Бекитүү'
                                            : lang === 'ru'
                                                ? 'Нужны правки'
                                                : 'Оңдоо керек'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setReviewModal({ open: false, submission: null })}
                            className="px-4 py-2 rounded border border-gray-200 text-sm"
                        >
                            Жабуу
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InstructorCourseManage;

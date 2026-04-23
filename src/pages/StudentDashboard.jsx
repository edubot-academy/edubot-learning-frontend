import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import {
    fetchStudentCourses,
    fetchStudentAccessState,
    fetchStudentDashboard,
    fetchStudentUpcomingSessions,
    fetchStudentRecordings,
    fetchStudentResources,
    fetchStudentTasks,
    submitSessionHomework,
    submitStudentActivity,
    submitStudentActivityQuiz,
    uploadSessionHomeworkAttachment,
    uploadStudentActivityAttachment,
    fetchUserProfile,
    updateUserProfile,
    fetchStudentProgress,
    fetchStudentCertificates,
    fetchStudentNotificationSettings,
    updateStudentNotificationSettings,
} from '@services/api';
import NotificationsTab from '@features/notifications/components/NotificationsTab';
import {
    NAV_ITEMS,
    DEFAULT_NOTIFICATION_SETTINGS,
} from '@features/student-dashboard/utils/studentDashboard.constants.js';
import {
    readNumber,
    toItems,
    getTaskKey,
    resolveSessionHomeworkIds,
    isOfflineOrLiveCourse,
} from '@features/student-dashboard/utils/studentDashboard.helpers.js';
import StudentEmptyState from '@features/student-dashboard/components/shared/StudentEmptyState.jsx';
import OverviewTab from '@features/student-dashboard/components/tabs/OverviewTab.jsx';
import CoursesTab from '@features/student-dashboard/components/tabs/CoursesTab.jsx';
import ScheduleTab from '@features/student-dashboard/components/tabs/ScheduleTab.jsx';
import ResourcesTab from '@features/student-dashboard/components/tabs/ResourcesTab.jsx';
import TasksTab from '@features/student-dashboard/components/tabs/TasksTab.jsx';
import ProgressTab from '@features/student-dashboard/components/tabs/ProgressTab.jsx';
import ProfileTab from '@features/student-dashboard/components/tabs/ProfileTab.jsx';
import ChatTab from '@features/student-dashboard/components/ChatTab.jsx';
import LeaderboardHub from '@features/leaderboard/components/LeaderboardHub.jsx';
import {
    DashboardLayout,
    DashboardHeader,
    DashboardTabs,
    LoadingState,
} from '../components/ui/dashboard';


const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialTab = searchParams.get('tab');
    const initialCourseFilter = searchParams.get('courseId') || '';
    const initialGroupFilter = searchParams.get('groupId') || '';
    const validTabIds = useMemo(() => NAV_ITEMS.map((item) => item.id), []);
    const studentId = user?.id;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState(
        validTabIds.includes(initialTab) ? initialTab : 'overview'
    );
    const [summary, setSummary] = useState(null);
    const [accessState, setAccessState] = useState(null);
    const [accessLoaded, setAccessLoaded] = useState(false);
    const [accessStateError, setAccessStateError] = useState(false);
    const [courses, setCourses] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [resources, setResources] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [filterCourseId, setFilterCourseId] = useState(initialCourseFilter);
    const [filterGroupId, setFilterGroupId] = useState(initialGroupFilter);
    const [progress, setProgress] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [notificationSettings, setNotificationSettings] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [tabLoading, setTabLoading] = useState(null);
    const [loadedTabs, setLoadedTabs] = useState({
        overview: false,
        'my-courses': false,
        schedule: false,
        resources: false,
        tasks: false,
        progress: false,
        leaderboard: true,
        notifications: true,
        profile: true,
        chat: true,
    });
    const [notificationsLoaded, setNotificationsLoaded] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);
    const [submittingTaskState, setSubmittingTaskState] = useState(null);
    const [openingCourseId, setOpeningCourseId] = useState(null);

    const studentFilters = useMemo(
        () => ({
            courseId: filterCourseId || undefined,
            groupId: filterGroupId || undefined,
            limit: 20,
        }),
        [filterCourseId, filterGroupId]
    );

    const groupOptions = useMemo(() => {
        const groups = [];
        offerings.forEach((item) => {
            const groupId = item.groupId || item.group?.id;
            if (!groupId) return;
            const groupName = item.groupName || item.group?.name || `Group #${groupId}`;
            if (!groups.some((g) => String(g.id) === String(groupId))) {
                groups.push({ id: String(groupId), name: groupName });
            }
        });
        return groups;
    }, [offerings]);

    const loadOverview = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('overview');
        try {
            const [accessResult, summaryResult] = await Promise.allSettled([
                fetchStudentAccessState(),
                fetchStudentDashboard(studentFilters),
            ]);

            if (accessResult.status === 'fulfilled') {
                setAccessStateError(false);
                setAccessState(accessResult.value || null);
            } else {
                console.error('Failed to load student access state', accessResult.reason);
                setAccessStateError(true);
            }

            if (summaryResult.status === 'fulfilled') {
                setSummary(summaryResult.value || null);
            } else {
                console.error('Failed to load overview summary', summaryResult.reason);
                toast.error('Кыскача маалымат жүктөлгөн жок');
            }

        } catch (error) {
            console.error('Failed to load overview', error);
            toast.error('Кыскача маалымат жүктөлгөн жок');
        } finally {
            setAccessLoaded(true);
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, overview: true }));
        }
    }, [studentId, studentFilters]);

    const loadCourses = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('my-courses');
        try {
            const coursesRes = await fetchStudentCourses(studentId);
            setCourses(Array.isArray(coursesRes?.items) ? coursesRes.items : coursesRes || []);
        } catch (error) {
            console.error('Failed to load courses', error);
            toast.error('Курстарды жүктөө мүмкүн болбоду');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, 'my-courses': true }));
        }
    }, [studentId]);

    const loadSchedule = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('schedule');
        try {
            const [offeringsRes, recordingsRes] = await Promise.all([
                fetchStudentUpcomingSessions(studentFilters),
                fetchStudentRecordings(studentFilters),
            ]);
            setOfferings(
                Array.isArray(offeringsRes?.items) ? offeringsRes.items : offeringsRes || []
            );
            setRecordings(
                Array.isArray(recordingsRes?.items) ? recordingsRes.items : recordingsRes || []
            );
        } catch (error) {
            console.error('Failed to load schedule', error);
            toast.error('Жүгүртмө жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, schedule: true }));
        }
    }, [studentId, studentFilters]);

    const loadTasks = useCallback(async ({ silent = false } = {}) => {
        if (!studentId) return;
        if (!silent) {
            setTabLoading('tasks');
        }
        try {
            const tasksRes = await fetchStudentTasks(studentFilters);
            setTasks(toItems(tasksRes));
        } catch (error) {
            console.error('Failed to load tasks', error);
            if (!silent) {
                toast.error('Тапшырмаларды жүктөө мүмкүн болбоду');
            }
        } finally {
            if (!silent) {
                setTabLoading(null);
            }
            setLoadedTabs((prev) => ({ ...prev, tasks: true }));
        }
    }, [studentId, studentFilters]);

    const loadResources = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('resources');
        try {
            const resourcesRes = await fetchStudentResources(studentFilters);
            setResources(Array.isArray(resourcesRes?.items) ? resourcesRes.items : resourcesRes || []);
        } catch (error) {
            console.error('Failed to load student resources', error);
            toast.error('Ресурстарды жүктөө мүмкүн болбоду');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, resources: true }));
        }
    }, [studentId, studentFilters]);

    const loadProgress = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('progress');
        try {
            const [progressRes, certificatesRes] = await Promise.all([
                fetchStudentProgress(studentId),
                fetchStudentCertificates(studentId),
            ]);
            setProgress(Array.isArray(progressRes?.items) ? progressRes.items : progressRes || []);
            setCertificates(
                Array.isArray(certificatesRes?.items)
                    ? certificatesRes.items
                    : certificatesRes || []
            );
        } catch (error) {
            console.error('Failed to load progress', error);
            toast.error('Прогресс маалыматтары жүктөлгөн жок');
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, progress: true }));
        }
    }, [studentId]);

    const loadNotificationSettings = useCallback(async () => {
        if (!studentId) return;
        setNotificationLoading(true);
        try {
            const data = await fetchStudentNotificationSettings(studentId);
            setNotificationSettings({
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(data || {}),
            });
        } catch (error) {
            console.error('Failed to load notification settings', error);
            toast.error('Эскертмелерди жүктөө мүмкүн болбоду');
            setNotificationSettings((prev) => prev ?? DEFAULT_NOTIFICATION_SETTINGS);
        } finally {
            setNotificationLoading(false);
            setNotificationsLoaded(true);
        }
    }, [studentId]);

    const loadProfileData = useCallback(async () => {
        if (!studentId) return;
        setProfileLoading(true);
        try {
            const data = await fetchUserProfile(studentId);
            setProfileData(data || null);
        } catch (error) {
            console.error('Failed to load profile data', error);
            toast.error('Профиль маалыматы жүктөлгөн жок');
            setProfileData(null);
        } finally {
            setProfileLoading(false);
            setProfileLoaded(true);
        }
    }, [studentId]);

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        const nextTab = validTabIds.includes(tabFromUrl) ? tabFromUrl : 'overview';
        setActiveTab((prev) => (nextTab !== prev ? nextTab : prev));
        const nextCourseId = searchParams.get('courseId') || '';
        const nextGroupId = searchParams.get('groupId') || '';
        setFilterCourseId((prev) => (prev !== nextCourseId ? nextCourseId : prev));
        setFilterGroupId((prev) => (prev !== nextGroupId ? nextGroupId : prev));
    }, [searchParams, validTabIds]);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Alt + shortcuts for navigation
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'm': {
                        e.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.focus();
                            mainContent.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                    case 'n': {
                        e.preventDefault();
                        const navigation = document.querySelector('nav[role="navigation"]');
                        if (navigation) {
                            navigation.focus();
                            navigation.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                    case 's': {
                        e.preventDefault();
                        const searchInput = document.querySelector('input[placeholder*="издөө" i], input[type="search"]');
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                    }
                }
            }

            // Arrow key navigation for sidebar
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const sidebarItems = document.querySelectorAll('[role="menuitem"]');
                const currentIndex = Array.from(sidebarItems).findIndex(item => item === document.activeElement);

                if (currentIndex !== -1) {
                    e.preventDefault();
                    let newIndex;
                    if (e.key === 'ArrowLeft') {
                        newIndex = currentIndex > 0 ? currentIndex - 1 : sidebarItems.length - 1;
                    } else {
                        newIndex = currentIndex < sidebarItems.length - 1 ? currentIndex + 1 : 0;
                    }
                    sidebarItems[newIndex].focus();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    useEffect(() => {
        if (!studentId) return;
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (activeTab === 'overview') {
                next.delete('tab');
            } else {
                next.set('tab', activeTab);
            }
            if (filterCourseId) {
                next.set('courseId', filterCourseId);
            } else {
                next.delete('courseId');
            }
            if (filterGroupId) {
                next.set('groupId', filterGroupId);
            } else {
                next.delete('groupId');
            }
            return next;
        });
        const tab = activeTab;
        if (tab === 'overview') {
            loadOverview();
        } else if (tab === 'my-courses') {
            loadCourses();
        } else if (tab === 'schedule') {
            loadSchedule();
        } else if (tab === 'resources') {
            loadResources();
        } else if (tab === 'tasks') {
            loadTasks();
        } else if (tab === 'progress') {
            loadProgress();
        } else if (tab === 'profile') {
            if (!profileLoaded && !profileLoading) {
                loadProfileData();
            }
        }
        if (activeTab === 'profile' && !notificationsLoaded && !notificationLoading) {
            loadNotificationSettings();
        }
    }, [
        studentId,
        activeTab,
        loadOverview,
        loadCourses,
        loadSchedule,
        loadResources,
        loadTasks,
        loadProgress,
        loadProfileData,
        loadNotificationSettings,
        notificationsLoaded,
        notificationLoading,
        profileLoaded,
        profileLoading,
        filterCourseId,
        filterGroupId,
        setSearchParams,
    ]);

    useEffect(() => {
        if (!filterCourseId) {
            setFilterGroupId('');
            return;
        }
        const selected = courses.find((course) => String(course.id) === String(filterCourseId));
        if (!isOfflineOrLiveCourse(selected)) {
            setFilterGroupId('');
            return;
        }
        const hasGroup = groupOptions.some((group) => String(group.id) === String(filterGroupId));
        if (!hasGroup) {
            setFilterGroupId('');
        }
    }, [filterCourseId, filterGroupId, courses, groupOptions]);

    useEffect(() => {
        if (activeTab !== 'tasks' || !studentId) return;

        const refreshTasksIfVisible = () => {
            if (document.visibilityState === 'visible') {
                loadTasks({ silent: true });
            }
        };

        const handleWindowFocus = () => {
            refreshTasksIfVisible();
        };

        const intervalId = window.setInterval(() => {
            refreshTasksIfVisible();
        }, 5000);

        document.addEventListener('visibilitychange', refreshTasksIfVisible);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', refreshTasksIfVisible);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [activeTab, studentId, loadTasks]);

    const hasAttendanceEligibleCourses = useMemo(() => {
        if (filterCourseId) {
            const selected = courses.find((course) => String(course.id) === String(filterCourseId));
            return isOfflineOrLiveCourse(selected);
        }
        return courses.some((course) => isOfflineOrLiveCourse(course));
    }, [courses, filterCourseId]);

    const overviewStudent = useMemo(
        () => ({
            id: user?.id || null,
            name: summary?.name || user?.fullName || 'Студент',
            lastLesson: summary?.lastLesson || null,
        }),
        [summary, user]
    );

    const overviewStats = useMemo(
        () =>
            summary?.stats || {
                activeCourses: 0,
                lessonsCompleted: 0,
                timeThisWeek: '—',
                pendingTasks: 0,
            },
        [summary]
    );

    const attendanceStats = useMemo(() => {
        if (!hasAttendanceEligibleCourses) {
            return { rate: 0, totalSessions: 0, present: 0, absent: 0 };
        }

        const rawRate = readNumber(summary, [
            'attendance.rate',
            'stats.attendanceRate',
            'attendanceRate',
            'attendance.percent',
        ]);
        const rawTotalSessions = readNumber(summary, [
            'attendance.totalSessions',
            'stats.totalSessions',
        ]);
        const rawPresent = readNumber(summary, [
            'attendance.present',
            'stats.attendedSessions',
        ]);
        const rawAbsent = readNumber(summary, ['attendance.absent', 'stats.absentSessions']);

        if (rawRate === null && rawTotalSessions === null && rawPresent === null && rawAbsent === null) {
            return { rate: 0, totalSessions: 0, present: 0, absent: 0 };
        }

        const rate = rawRate !== null ? Math.round(rawRate) : null;
        const totalSessions = rawTotalSessions ?? Math.max(0, (rawPresent || 0) + (rawAbsent || 0));
        const present = rawPresent ?? (
            rate !== null && totalSessions > 0 ? Math.round((totalSessions * rate) / 100) : 0
        );
        const absent = rawAbsent ?? Math.max(0, totalSessions - present);

        return {
            rate: rate ?? (totalSessions ? Math.round((present / totalSessions) * 100) : 0),
            totalSessions,
            present,
            absent,
        };
    }, [summary, hasAttendanceEligibleCourses]);

    const attendanceEnabled = useMemo(() => {
        if (!hasAttendanceEligibleCourses) return false;

        return [
            'attendance.rate',
            'stats.attendanceRate',
            'attendanceRate',
            'attendance.percent',
            'attendance.totalSessions',
            'stats.totalSessions',
            'attendance.present',
            'stats.attendedSessions',
            'attendance.absent',
            'stats.absentSessions',
        ].some((path) => readNumber(summary, path) !== null);
    }, [summary, hasAttendanceEligibleCourses]);

    const hasActiveStudentAccess = useMemo(() => {
        if (typeof accessState?.hasActiveAccess === 'boolean') {
            return accessState.hasActiveAccess;
        }

        if (accessStateError) return true;
        if (!accessLoaded) return true;

        if (Number(summary?.stats?.upcomingSessions || 0) > 0) return true;
        if (Number(summary?.stats?.availableRecordings || 0) > 0) return true;
        if (Number(summary?.stats?.homeworkOpen || 0) > 0) return true;
        if (Number(overviewStats.activeCourses || 0) > 0) return true;
        return false;
    }, [accessLoaded, accessState, accessStateError, summary, overviewStats.activeCourses]);

    const offeringsByCourse = useMemo(() => {
        const map = new Map();
        offerings.forEach((offering) => {
            const key = String(
                offering.courseId || offering.course?.id || offering.course?.courseId || ''
            );
            if (!key) return;
            const current = map.get(key) || [];
            current.push(offering);
            map.set(key, current);
        });
        return map;
    }, [offerings]);

    const progressItems = useMemo(() => {
        return (progress || []).map((item) => {
            const lessonsArray = Array.isArray(item.lessons) ? item.lessons : [];
            const sectionsMap = new Map();
            lessonsArray.forEach((lesson) => {
                const sectionKey =
                    lesson.sectionId ?? `section-${lesson.sectionTitle || 'unknown'}`;
                if (!sectionsMap.has(sectionKey)) {
                    sectionsMap.set(sectionKey, {
                        sectionId: lesson.sectionId,
                        sectionTitle: lesson.sectionTitle || 'Секция',
                        sectionOrder: lesson.sectionOrder ?? 0,
                        lessons: [],
                    });
                }
                sectionsMap.get(sectionKey).lessons.push(lesson);
            });
            const sections = Array.from(sectionsMap.values())
                .map((section) => ({
                    ...section,
                    lessons: section.lessons
                        .slice()
                        .sort(
                            (a, b) =>
                                (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0) ||
                                String(a.lessonTitle || '').localeCompare(b.lessonTitle || '')
                        ),
                }))
                .sort(
                    (a, b) =>
                        (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0) ||
                        String(a.sectionTitle || '').localeCompare(b.sectionTitle || '')
                );
            const totalLessons =
                item.lessonsTotal ?? (lessonsArray.length ? lessonsArray.length : 0);
            const completedLessons = item.lessonsCompleted ?? 0;
            const progressPercent =
                totalLessons > 0
                    ? Math.min(100, Math.round((completedLessons * 100) / totalLessons))
                    : 0;
            const flatOrderedLessons = sections.flatMap((section) => section.lessons);
            const resumeLesson =
                item.lastViewedLesson && item.lastViewedLesson.lessonId
                    ? item.lastViewedLesson
                    : flatOrderedLessons.find((lesson) => !lesson.completed) ||
                    flatOrderedLessons[0];
            const hasCertificate =
                item.certificate ??
                certificates.some(
                    (cert) => cert.courseId === item.courseId || cert.course === item.course
                );
            return {
                courseId: item.courseId,
                courseTitle: item.courseTitle || item.course || 'Course',
                lessonsCompleted: completedLessons,
                lessonsTotal: totalLessons,
                progressPercent,
                sections: sections.map((section) => ({
                    ...section,
                    lessons: section.lessons.map((lesson) => ({
                        ...lesson,
                        kind: lesson.kind || 'video',
                    })),
                })),
                resumeLesson,
                hasCertificate,
            };
        });
    }, [progress, certificates]);

    const handleNotificationChange = useCallback((key, value) => {
        setNotificationSettings((prev) => ({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(prev || {}),
            [key]: value,
        }));
    }, []);

    const handleSaveNotifications = useCallback(async () => {
        if (!studentId) return;
        setSavingNotifications(true);
        try {
            const payload = {
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(notificationSettings || {}),
            };
            const updated = await updateStudentNotificationSettings(studentId, payload);
            setNotificationSettings({
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(updated || {}),
            });
            toast.success('Эскертмелер сакталды');
        } catch (error) {
            console.error('Failed to save notifications', error);
            toast.error('Эскертмелерди сактоо мүмкүн болбоду');
        } finally {
            setSavingNotifications(false);
        }
    }, [studentId, notificationSettings]);

    const handleOpenCourse = useCallback(async (courseId) => {
        if (!courseId) {
            toast.error('Курс табылган жок');
            return;
        }

        try {
            setOpeningCourseId(courseId);
            navigate(`/courses/${courseId}`);
        } catch (error) {
            console.error('Failed to open course:', error);
            toast.error('Курсту ачууда ката кетти');
        } finally {
            setOpeningCourseId(null);
        }
    }, [navigate]);

    const handleSaveProfile = useCallback(
        async ({ fullName, phoneNumber, avatarFile, newPassword, confirmPassword }) => {
            if (!studentId) return false;

            if (newPassword && newPassword !== confirmPassword) {
                toast.error('Жаңы сырсөздөр дал келбейт.');
                return false;
            }
            if (newPassword && newPassword.length < 6) {
                toast.error('Сырсөз кеминде 6 белги болушу керек.');
                return false;
            }
            if (phoneNumber) {
                const digitsOnly = String(phoneNumber).replace(/\D/g, '');
                if (digitsOnly.length < 10 || !/^\+\d{10,15}$/.test(String(phoneNumber))) {
                    toast.error(
                        'Телефон номери эл аралык форматта болсун. Мисалы: +996700123456'
                    );
                    return false;
                }
            }

            setSavingProfile(true);
            try {
                const form = new FormData();
                form.append('fullName', (fullName || '').trim());
                if (phoneNumber) form.append('phoneNumber', String(phoneNumber).trim());
                if (avatarFile instanceof File) form.append('avatar', avatarFile);
                if (newPassword) form.append('password', newPassword);

                const updated = await updateUserProfile(studentId, form);
                const nextUser = updated?.user || {};

                setProfileData((prev) => ({
                    ...(prev || {}),
                    ...nextUser,
                    fullName: nextUser.fullName || fullName,
                    phoneNumber: nextUser.phoneNumber || phoneNumber,
                }));

                try {
                    const storedRaw = localStorage.getItem('user');
                    const stored = storedRaw ? JSON.parse(storedRaw) : {};
                    localStorage.setItem(
                        'user',
                        JSON.stringify({
                            ...stored,
                            ...nextUser,
                            fullName: nextUser.fullName || fullName,
                            phoneNumber: nextUser.phoneNumber || phoneNumber,
                        })
                    );
                } catch {
                    // no-op: profile was saved on backend even if local cache sync fails
                }

                toast.success('Профиль ийгиликтүү жаңыртылды');
                return true;
            } catch (error) {
                console.error('Failed to update profile', error);
                const rawMessage = error?.response?.data?.message || 'Профилди сактоо мүмкүн болбоду';
                const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
                toast.error(message);
                return false;
            } finally {
                setSavingProfile(false);
            }
        },
        [studentId]
    );

    const handleSubmitHomework = useCallback(async (task, submission) => {
        if (task?.kind === 'activity') {
            const sessionId = Number(task.sessionId);
            const activityId = Number(task.id || task.activityId);
            if (!sessionId || !activityId) {
                toast.error('Бул иш үчүн submit жеткиликтүү эмес.');
                return false;
            }

            const key = getTaskKey(task);
            setSubmittingTaskState({ key, phase: 'submitting' });
            try {
                if (task.taskType === 'quiz') {
                    const answers = Object.entries(submission?.quizAnswers || {}).map(([questionId, value]) => ({
                        questionId: Number(questionId),
                        optionIds: Array.isArray(value) ? value.map(Number) : value ? [Number(value)] : [],
                    }));
                    await submitStudentActivityQuiz(sessionId, activityId, { answers });
                } else {
                    const text = submission?.text?.trim() || '';
                    const link = submission?.link?.trim() || '';
                    const file = submission?.file instanceof File ? submission.file : null;
                    const removeAttachment = Boolean(submission?.removeAttachment);
                    if (!text && !link && !file) {
                        toast.error('Жооп, шилтеме же файл кошуңуз.');
                        return false;
                    }

                    let attachmentUrl = removeAttachment ? '' : link || '';
                    if (file) {
                        setSubmittingTaskState({ key, phase: 'uploading' });
                        const upload = await uploadStudentActivityAttachment(sessionId, activityId, file);
                        attachmentUrl = upload?.key || upload?.url || attachmentUrl;
                        setSubmittingTaskState({ key, phase: 'submitting' });
                    }

                    await submitStudentActivity(sessionId, activityId, {
                        text: text || undefined,
                        link: removeAttachment ? '' : attachmentUrl || undefined,
                    });
                }

                const tasksRes = await fetchStudentTasks(studentFilters);
                setTasks(toItems(tasksRes));
                toast.success('Иш ийгиликтүү жөнөтүлдү.');
                return true;
            } catch (error) {
                const rawMessage = error?.response?.data?.message || 'Ишти жөнөтүү катасы';
                const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
                toast.error(message);
                return false;
            } finally {
                setSubmittingTaskState(null);
            }
        }

        const { sessionId, homeworkId } = resolveSessionHomeworkIds(task);
        if (!sessionId || !homeworkId) {
            toast.error('Бул тапшырма үчүн submit жеткиликтүү эмес.');
            return false;
        }

        const key = getTaskKey(task);
        const text = submission?.text?.trim() || '';
        const link = submission?.link?.trim() || '';
        const file = submission?.file instanceof File ? submission.file : null;
        const removeAttachment = Boolean(submission?.removeAttachment);
        if (!text && !link && !file) {
            toast.error('Жооп, шилтеме же файл кошуңуз.');
            return false;
        }

        setSubmittingTaskState({ key, phase: file ? 'uploading' : 'submitting' });
        try {
            let attachmentUrl = removeAttachment ? '' : link || '';
            if (file) {
                const upload = await uploadSessionHomeworkAttachment(sessionId, homeworkId, file);
                attachmentUrl = upload?.key || upload?.url || attachmentUrl;
                setSubmittingTaskState({ key, phase: 'submitting' });
            }

            await submitSessionHomework(sessionId, homeworkId, {
                text: text || undefined,
                link: removeAttachment ? '' : attachmentUrl || undefined,
            });

            const tasksRes = await fetchStudentTasks(studentFilters);
            setTasks(toItems(tasksRes));
            toast.success('Тапшырма ийгиликтүү жөнөтүлдү.');
            return true;
        } catch (error) {
            console.error('Failed to submit session homework', error);
            const rawMessage = error?.response?.data?.message || 'Тапшырманы жөнөтүү катасы';
            const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
            const normalizedMessage = String(message || '').toLowerCase();

            if (normalizedMessage.includes('unsupported homework attachment type')) {
                toast.error('Файл түрү колдоого алынбайт. PDF же Word колдонуңуз.');
                return false;
            }

            if (
                normalizedMessage.includes('file too large') ||
                normalizedMessage.includes('file size') ||
                normalizedMessage.includes('larger than')
            ) {
                toast.error('Файл өтө чоң. Максималдуу көлөм 20 MB.');
                return false;
            }

            toast.error(message);
            return false;
        } finally {
            setSubmittingTaskState(null);
        }
    }, [studentFilters]);

    const mergedNotificationSettings = useMemo(
        () => ({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(notificationSettings || {}),
        }),
        [notificationSettings]
    );

    const profileStudent = useMemo(
        () => ({
            name: profileData?.fullName || user?.fullName || overviewStudent.name,
            email: profileData?.email || user?.email || '',
            phone: profileData?.phoneNumber || user?.phoneNumber || '',
            avatar: profileData?.avatar || user?.avatar || '',
        }),
        [overviewStudent.name, profileData, user]
    );

    const resolvedTab = activeTab;
    const isTabDataLoaded = loadedTabs[resolvedTab] || false;
    const isProfileReady =
        activeTab !== 'profile' ||
        ((notificationsLoaded && !notificationLoading) && (profileLoaded && !profileLoading));
    const isCurrentTabLoading =
        tabLoading === resolvedTab ||
        (activeTab === 'profile' && (notificationLoading || profileLoading));
    const renderTab = () => {
        const requiresActiveAccess = ['overview', 'my-courses', 'schedule', 'resources', 'tasks', 'progress', 'leaderboard'].includes(activeTab);
        if (requiresActiveAccess && !hasActiveStudentAccess) {
            return <StudentEmptyState />;
        }

        if (!isTabDataLoaded || !isProfileReady) {
            if (activeTab === 'overview') return <LoadingState type="card" count={3} />;
            if (['my-courses', 'schedule', 'resources', 'tasks'].includes(activeTab)) {
                return <LoadingState type="list" />;
            }
            return <LoadingState type="table" />;
        }

        // Don't show loader for tab switching if data is already loaded
        if (isCurrentTabLoading && isTabDataLoaded) {
            // Show content with loading overlay instead of replacing content
            return (
                <div className="relative">
                    {renderTabContent()}
                    {isCurrentTabLoading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-2xl">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-edubot-orange w-6 h-6"></div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return renderTabContent();
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'my-courses':
                return <CoursesTab courses={courses} offeringsByCourse={offeringsByCourse} />;
            case 'schedule':
                return <ScheduleTab offerings={offerings} recordings={recordings} />;
            case 'resources':
                return (
                    <ResourcesTab
                        items={resources}
                        onOpenTasks={() => setActiveTab('tasks')}
                    />
                );
            case 'tasks':
                return (
                    <TasksTab
                        tasks={tasks}
                        onSubmitHomework={handleSubmitHomework}
                        submittingTaskState={submittingTaskState}
                    />
                );
            case 'progress':
                return (
                    <ProgressTab
                        items={progressItems}
                        courses={courses}
                        attendanceStats={attendanceStats}
                        attendanceEnabled={attendanceEnabled}
                        courseId={filterCourseId || undefined}
                    />
                );
            case 'leaderboard':
                return <LeaderboardHub embedded initialTrack="all" />;
            case 'notifications':
                return <NotificationsTab />;
            case 'profile':
                return (
                    <ProfileTab
                        student={profileStudent}
                        notificationSettings={mergedNotificationSettings}
                        onSaveProfile={handleSaveProfile}
                        savingProfile={savingProfile}
                        onNotificationChange={handleNotificationChange}
                        onSaveNotifications={handleSaveNotifications}
                        savingNotifications={savingNotifications}
                    />
                );
            case 'chat':
                return <ChatTab />;
            case 'overview':
            default:
                return (
                    <OverviewTab
                        student={overviewStudent}
                        summary={summary}
                        courses={courses}
                        offerings={offerings}
                        tasks={tasks}
                        attendanceStats={attendanceStats}
                        attendanceEnabled={attendanceEnabled}
                        progressItems={progressItems}
                        onOpenCourse={handleOpenCourse}
                        openingCourseId={openingCourseId}
                    />
                );
        }
    };

    const handleDashboardNavSelect = useCallback(
        (id) => {
            if (!validTabIds.includes(id)) return;
            setActiveTab(id);
        },
        [validTabIds]
    );

    // Prepare navigation items for the standardized layout
    const dashboardNavItems = NAV_ITEMS.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: handleDashboardNavSelect,
    }));

    // Prepare header actions
    const headerActions = [
        {
            label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
            onClick: () => setSidebarOpen((prev) => !prev),
            variant: 'secondary',
        },
    ];

    // Prepare header content
    const headerContent = (
        <DashboardHeader
            user={{
                fullName: profileData?.fullName || user?.fullName || overviewStudent.name,
                email: user?.email || profileData?.email || '',
            }}
            role="student"
            subtitle="Чыгармачыл окуу жолуңузду көзөмөлдөңүз"
            actions={headerActions}
        />
    );

    // Mobile tabs
    const mobileTabs = (
        <DashboardTabs
            items={dashboardNavItems}
            activeId={activeTab}
            onSelect={handleDashboardNavSelect}
        />
    );

    return (
        <DashboardLayout
            role="student"
            user={overviewStudent}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
            {renderTab()}

            {/* Floating Action Button */}
            <FloatingActionButton role="student" />
        </DashboardLayout>
    );
};

export default StudentDashboard;

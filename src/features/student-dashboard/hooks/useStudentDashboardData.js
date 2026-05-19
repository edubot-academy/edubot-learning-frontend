import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    fetchStudentAccessState,
    fetchStudentCertificates,
    fetchStudentCourses,
    fetchStudentDashboard,
    fetchStudentProgress,
    fetchStudentRecordings,
    fetchStudentResources,
    fetchStudentTasks,
    fetchStudentUpcomingSessions,
} from '@services/api';
import { parseApiError } from '@shared/api/error';
import { toItems } from '../utils/studentDashboard.helpers.js';

const INITIAL_LOADED_TABS = {
    overview: false,
    'my-courses': false,
    schedule: false,
    resources: false,
    tasks: false,
    progress: false,
    certificates: false,
    leaderboard: true,
    notifications: true,
    profile: true,
    chat: true,
};

export const useStudentDashboardData = ({
    activeTab,
    filterCourseId,
    filterGroupId,
    loadNotificationSettings,
    loadProfileData,
    notificationLoading,
    notificationsLoaded,
    profileLoaded,
    profileLoading,
    studentId,
}) => {
    const { t } = useTranslation();
    const studentFilters = useMemo(
        () => ({
            courseId: filterCourseId || undefined,
            groupId: filterGroupId || undefined,
            limit: 20,
        }),
        [filterCourseId, filterGroupId]
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
    const [progress, setProgress] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [tabLoading, setTabLoading] = useState(null);
    const [loadedTabs, setLoadedTabs] = useState(INITIAL_LOADED_TABS);

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
                toast.error(
                    parseApiError(
                        summaryResult.reason,
                        t('studentDashboard.data.toasts.overviewLoadError')
                    ).message
                );
            }
        } catch (error) {
            console.error('Failed to load overview', error);
            toast.error(parseApiError(error, t('studentDashboard.data.toasts.overviewLoadError')).message);
        } finally {
            setAccessLoaded(true);
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, overview: true }));
        }
    }, [studentId, studentFilters, t]);

    const loadCourses = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('my-courses');
        try {
            const coursesRes = await fetchStudentCourses(studentId);
            setCourses(Array.isArray(coursesRes?.items) ? coursesRes.items : coursesRes || []);
        } catch (error) {
            console.error('Failed to load courses', error);
            toast.error(parseApiError(error, t('studentDashboard.data.toasts.coursesLoadError')).message);
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, 'my-courses': true }));
        }
    }, [studentId, t]);

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
            toast.error(parseApiError(error, t('studentDashboard.data.toasts.scheduleLoadError')).message);
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, schedule: true }));
        }
    }, [studentId, studentFilters, t]);

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
                toast.error(parseApiError(error, t('studentDashboard.data.toasts.tasksLoadError')).message);
            }
        } finally {
            if (!silent) {
                setTabLoading(null);
            }
            setLoadedTabs((prev) => ({ ...prev, tasks: true }));
        }
    }, [studentId, studentFilters, t]);

    const loadResources = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('resources');
        try {
            const resourcesRes = await fetchStudentResources(studentFilters);
            setResources(Array.isArray(resourcesRes?.items) ? resourcesRes.items : resourcesRes || []);
        } catch (error) {
            console.error('Failed to load student resources', error);
            toast.error(parseApiError(error, t('studentDashboard.data.toasts.resourcesLoadError')).message);
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, resources: true }));
        }
    }, [studentId, studentFilters, t]);

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
            toast.error(parseApiError(error, t('studentDashboard.data.toasts.progressLoadError')).message);
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, progress: true }));
        }
    }, [studentId, t]);

    const loadCertificates = useCallback(async () => {
        if (!studentId) return;
        setTabLoading('certificates');
        try {
            const certificatesRes = await fetchStudentCertificates(studentId);
            setCertificates(
                Array.isArray(certificatesRes?.items)
                    ? certificatesRes.items
                    : certificatesRes || []
            );
        } catch (error) {
            console.error('Failed to load certificates', error);
            toast.error(parseApiError(error, t('studentDashboard.data.toasts.certificatesLoadError')).message);
        } finally {
            setTabLoading(null);
            setLoadedTabs((prev) => ({ ...prev, certificates: true }));
        }
    }, [studentId, t]);

    useEffect(() => {
        if (!studentId) return;

        if (activeTab === 'overview') {
            loadOverview();
        } else if (activeTab === 'my-courses') {
            loadCourses();
        } else if (activeTab === 'schedule') {
            loadSchedule();
        } else if (activeTab === 'resources') {
            loadResources();
        } else if (activeTab === 'tasks') {
            loadTasks();
        } else if (activeTab === 'progress') {
            loadProgress();
        } else if (activeTab === 'certificates') {
            loadCertificates();
        } else if (activeTab === 'profile' && !profileLoaded && !profileLoading) {
            loadProfileData();
        }

        if (activeTab === 'profile' && !notificationsLoaded && !notificationLoading) {
            loadNotificationSettings();
        }
    }, [
        activeTab,
        loadCertificates,
        loadCourses,
        loadNotificationSettings,
        loadOverview,
        loadProfileData,
        loadProgress,
        loadResources,
        loadSchedule,
        loadTasks,
        notificationLoading,
        notificationsLoaded,
        profileLoaded,
        profileLoading,
        studentId,
    ]);

    return {
        accessLoaded,
        accessState,
        accessStateError,
        certificates,
        courses,
        loadedTabs,
        loadTasks,
        offerings,
        progress,
        recordings,
        resources,
        summary,
        tabLoading,
        tasks,
    };
};

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { COURSE_TYPE } from '@shared/contracts';
import {
    fetchCourseGroups,
    fetchCourseSessions,
    fetchInstructorCourses,
} from '@services/api';
import {
    getWorkspaceErrorMessage,
    getWorkspaceErrorStatusMessages,
    toArray,
} from '@features/groupSessions/utils/sessionWorkspace.helpers';

const toCourseList = (payload) => {
    if (Array.isArray(payload?.courses)) return payload.courses;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

export const useSessionWorkspaceSelections = ({ user, pendingRouteSelectionRef, onNotice }) => {
    const { t } = useTranslation();
    const workspaceErrorStatusMessages = useMemo(() => getWorkspaceErrorStatusMessages(t), [t]);
    const tRef = useRef(t);
    const workspaceErrorStatusMessagesRef = useRef(workspaceErrorStatusMessages);
    const [courses, setCourses] = useState([]);
    const [sourceVideoCourses, setSourceVideoCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);

    useEffect(() => {
        tRef.current = t;
        workspaceErrorStatusMessagesRef.current = workspaceErrorStatusMessages;
    }, [t, workspaceErrorStatusMessages]);

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        let cancelled = false;
        const loadCourses = async () => {
            setLoadingCourses(true);
            try {
                const [deliveryData, sourceVideoData] = await Promise.all([
                    fetchInstructorCourses({ status: 'approved', limit: 100 }),
                    fetchInstructorCourses({
                        status: 'all',
                        courseType: COURSE_TYPE.VIDEO,
                        limit: 100,
                    }),
                ]);
                if (cancelled) return;

                const allInstructorCourses = toCourseList(deliveryData);
                const allSourceVideoCourses = toCourseList(sourceVideoData);
                const teachingCourses = allInstructorCourses.filter((course) => {
                    const type = course?.courseType || course?.type;
                    return type === COURSE_TYPE.OFFLINE || type === COURSE_TYPE.ONLINE_LIVE;
                });
                const publishedVideos = allSourceVideoCourses.filter((course) => {
                    const type = String(course?.courseType || course?.type || '').trim().toLowerCase();
                    return type === COURSE_TYPE.VIDEO && Boolean(course?.isPublished);
                });

                setCourses(teachingCourses);
                setSourceVideoCourses(publishedVideos);
                onNotice?.(null);
                setSelectedCourseId((prev) => {
                    const pendingCourseId = pendingRouteSelectionRef.current.courseId;
                    if (
                        pendingCourseId &&
                        teachingCourses.some((course) => String(course.id) === String(pendingCourseId))
                    ) {
                        pendingRouteSelectionRef.current.courseId = '';
                        return String(pendingCourseId);
                    }
                    if (prev && teachingCourses.some((course) => String(course.id) === String(prev))) {
                        return prev;
                    }
                    return teachingCourses.length > 0 ? String(teachingCourses[0].id) : '';
                });
            } catch (error) {
                console.error(error);
                const translate = tRef.current;
                const message = getWorkspaceErrorMessage(error, translate('groupSessions.workspace.selections.toasts.coursesLoadError'), workspaceErrorStatusMessagesRef.current);
                toast.error(message);
                if (!cancelled) {
                    onNotice?.({ tone: 'error', title: translate('groupSessions.workspace.selections.notices.coursesLoadTitle'), message });
                    setSourceVideoCourses([]);
                }
            } finally {
                if (!cancelled) setLoadingCourses(false);
            }
        };
        loadCourses();
        return () => {
            cancelled = true;
        };
    }, [onNotice, pendingRouteSelectionRef, user]);

    useEffect(() => {
        if (!selectedCourseId) {
            setGroups([]);
            setSelectedGroupId('');
            setSessions([]);
            setSelectedSessionId('');
            return;
        }

        let cancelled = false;
        const loadGroups = async () => {
            setLoadingGroups(true);
            setGroups([]);
            setSelectedGroupId('');
            setSessions([]);
            setSelectedSessionId('');
            try {
                const res = await fetchCourseGroups({ courseId: Number(selectedCourseId) });
                if (cancelled) return;
                const list = toArray(res);
                setGroups(list);
                onNotice?.(null);
                setSelectedGroupId((prev) => {
                    const pendingGroupId = pendingRouteSelectionRef.current.groupId;
                    if (
                        pendingGroupId &&
                        list.some((group) => String(group.id) === String(pendingGroupId))
                    ) {
                        pendingRouteSelectionRef.current.groupId = '';
                        return String(pendingGroupId);
                    }
                    if (prev && list.some((group) => String(group.id) === String(prev))) {
                        return prev;
                    }
                    return list.length ? String(list[0].id) : '';
                });
            } catch (error) {
                console.error(error);
                const translate = tRef.current;
                const message = getWorkspaceErrorMessage(error, translate('groupSessions.workspace.selections.toasts.groupsLoadError'), workspaceErrorStatusMessagesRef.current);
                toast.error(message);
                if (!cancelled) {
                    onNotice?.({ tone: 'error', title: translate('groupSessions.workspace.selections.notices.groupsLoadTitle'), message });
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
    }, [onNotice, pendingRouteSelectionRef, selectedCourseId]);

    useEffect(() => {
        if (!selectedGroupId) {
            setSessions([]);
            setSelectedSessionId('');
            return;
        }

        let cancelled = false;
        const loadSessions = async () => {
            setLoadingSessions(true);
            setSessions([]);
            setSelectedSessionId('');
            try {
                const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
                if (cancelled) return;
                const list = toArray(res);
                setSessions(list);
                onNotice?.(null);
                setSelectedSessionId((prev) => {
                    const pendingSessionId = pendingRouteSelectionRef.current.sessionId;
                    if (
                        pendingSessionId &&
                        list.some((session) => String(session.id) === String(pendingSessionId))
                    ) {
                        pendingRouteSelectionRef.current.sessionId = '';
                        return String(pendingSessionId);
                    }
                    if (prev && list.some((session) => String(session.id) === String(prev))) {
                        return prev;
                    }
                    return list[0]?.id ? String(list[0].id) : '';
                });
            } catch (error) {
                console.error(error);
                const translate = tRef.current;
                const message = getWorkspaceErrorMessage(error, translate('groupSessions.workspace.selections.toasts.sessionsLoadError'), workspaceErrorStatusMessagesRef.current);
                toast.error(message);
                if (!cancelled) {
                    onNotice?.({ tone: 'error', title: translate('groupSessions.workspace.selections.notices.sessionsLoadTitle'), message });
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
    }, [onNotice, pendingRouteSelectionRef, selectedGroupId]);

    const handleCourseChange = (courseId) => {
        setSelectedCourseId(courseId);
        setSelectedGroupId('');
        setSelectedSessionId('');
        setGroups([]);
        setSessions([]);
    };

    const handleGroupChange = (groupId) => {
        setSelectedGroupId(groupId);
        setSelectedSessionId('');
        setSessions([]);
    };

    return {
        courses,
        groups,
        handleCourseChange,
        handleGroupChange,
        loadingCourses,
        loadingGroups,
        loadingSessions,
        selectedCourseId,
        selectedGroupId,
        selectedSessionId,
        sessions,
        setSessions,
        setSelectedCourseId,
        setSelectedGroupId,
        setSelectedSessionId,
        sourceVideoCourses,
    };
};

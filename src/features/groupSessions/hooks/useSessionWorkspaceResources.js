import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { COURSE_TYPE, MEETING_PROVIDER } from '@shared/contracts';
import {
    createSessionMeeting,
    deleteSessionMeeting,
    fetchCourseAttendance,
    fetchCourseSessions,
    fetchSessionAttendance,
    fetchSessionMeeting,
    fetchSections,
    importSessionAttendance,
    syncSessionRecordings,
    uploadSessionMaterial,
    updateCourseSession,
    updateSessionMeeting,
} from '@services/api';
import {
    getWorkspaceErrorMessage,
    getWorkspaceErrorStatusMessages,
    resolveSessionJoinUrl,
    toArray,
} from '@features/groupSessions/utils/sessionWorkspace.helpers';

export const useSessionWorkspaceResources = ({
    hydrateAttendanceRows,
    onRefreshInsights,
    selectedCourseId,
    selectedDeliveryType,
    selectedGroupId,
    selectedSession,
    selectedSessionId,
    setAttendanceHistory,
    setSessions,
    sourceVideoCourses,
}) => {
    const { t } = useTranslation();
    const workspaceErrorStatusMessages = useMemo(() => getWorkspaceErrorStatusMessages(t), [t]);
    const [meetingProvider, setMeetingProvider] = useState(MEETING_PROVIDER.CUSTOM);
    const [meetingJoinUrl, setMeetingJoinUrl] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [savingMeeting, setSavingMeeting] = useState(false);
    const [loadingMeetingState, setLoadingMeetingState] = useState(false);
    const [deletingMeeting, setDeletingMeeting] = useState(false);
    const [importingAttendance, setImportingAttendance] = useState(false);
    const [syncingRecordings, setSyncingRecordings] = useState(false);
    const [savingMaterials, setSavingMaterials] = useState(false);
    const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);
    const [courseResourceAssets, setCourseResourceAssets] = useState([]);
    const [loadingCourseResourceAssets, setLoadingCourseResourceAssets] = useState(false);
    const [selectedSourceVideoCourseId, setSelectedSourceVideoCourseId] = useState('');

    const selectedSessionJoinUrl = useMemo(
        () => resolveSessionJoinUrl(selectedSession),
        [selectedSession]
    );
    const selectedSessionMaterials = useMemo(
        () => (Array.isArray(selectedSession?.materials) ? selectedSession.materials : []),
        [selectedSession]
    );
    const selectedSessionRecordingUrl = selectedSession?.recordingUrl || '';
    const canReusePublishedCourseAssets = useMemo(
        () =>
            (selectedDeliveryType === COURSE_TYPE.OFFLINE ||
                selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE) &&
            sourceVideoCourses.length > 0,
        [selectedDeliveryType, sourceVideoCourses.length]
    );
    const canImportZoomAttendance = useMemo(
        () =>
            selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE &&
            meetingProvider === MEETING_PROVIDER.ZOOM &&
            Boolean(meetingId),
        [meetingId, meetingProvider, selectedDeliveryType]
    );

    useEffect(() => {
        if (!selectedSessionId) {
            setMeetingProvider(MEETING_PROVIDER.CUSTOM);
            setMeetingJoinUrl('');
            setMeetingId('');
            return;
        }

        let cancelled = false;
        const loadMeetingState = async () => {
            setLoadingMeetingState(true);
            try {
                const res = await fetchSessionMeeting(Number(selectedSessionId));
                if (cancelled) return;
                setMeetingJoinUrl(res?.joinUrl || '');
                setMeetingId(String(res?.meetingId || ''));
                if (res?.provider) setMeetingProvider(res.provider);
            } catch {
                if (cancelled) return;
                setMeetingProvider(MEETING_PROVIDER.CUSTOM);
                setMeetingJoinUrl('');
                setMeetingId('');
            } finally {
                if (!cancelled) setLoadingMeetingState(false);
            }
        };

        loadMeetingState();
        return () => {
            cancelled = true;
        };
    }, [selectedSessionId]);

    useEffect(() => {
        if (!sourceVideoCourses.length) {
            setSelectedSourceVideoCourseId('');
            return;
        }

        setSelectedSourceVideoCourseId((prev) => {
            if (
                prev &&
                sourceVideoCourses.some((course) => String(course.id) === String(prev))
            ) {
                return prev;
            }
            return String(sourceVideoCourses[0].id);
        });
    }, [sourceVideoCourses]);

    useEffect(() => {
        if (!selectedSourceVideoCourseId) {
            setCourseResourceAssets([]);
            setLoadingCourseResourceAssets(false);
            return;
        }

        let cancelled = false;
        const loadCourseAssets = async () => {
            setLoadingCourseResourceAssets(true);
            try {
                const sections = await fetchSections(Number(selectedSourceVideoCourseId));
                if (cancelled) return;

                const assets = (Array.isArray(sections) ? sections : []).flatMap((section) =>
                    (Array.isArray(section.lessons) ? section.lessons : []).flatMap((lesson) => {
                        const items = [];
                        if (
                            lesson.kind === 'video' &&
                            lesson.videoUrl &&
                            lesson.videoKey
                        ) {
                            items.push({
                                id: `video-${lesson.id}`,
                                lessonId: lesson.id,
                                lessonTitle: lesson.title,
                                sectionTitle: section.title,
                                assetType: 'video',
                                title: lesson.title || t('groupSessions.workspace.resources.fallbacks.lessonVideo'),
                                url: lesson.videoUrl,
                                storageKey: lesson.videoKey,
                            });
                        }
                        return items;
                    })
                );

                setCourseResourceAssets(assets);
            } catch (error) {
                if (!cancelled) {
                    setCourseResourceAssets([]);
                    toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.courseMaterialsLoadError'), workspaceErrorStatusMessages));
                }
            } finally {
                if (!cancelled) setLoadingCourseResourceAssets(false);
            }
        };

        loadCourseAssets();
        return () => {
            cancelled = true;
        };
    }, [selectedSourceVideoCourseId, t, workspaceErrorStatusMessages]);

    const saveSessionMaterials = async (
        materials,
        { successMessage = t('groupSessions.workspace.resources.toasts.materialsUpdated'), suppressSuccessToast = false } = {}
    ) => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return false;
        }

        setSavingMaterials(true);
        try {
            await updateCourseSession(Number(selectedSessionId), {
                materials,
            });

            const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
            const list = toArray(res);
            setSessions(list);
            if (!suppressSuccessToast) {
                toast.success(successMessage);
            }
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.materialsUpdateError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setSavingMaterials(false);
        }
    };

    const uploadSessionMaterialFile = async (file) => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return null;
        }

        setUploadingMaterialFile(true);
        try {
            const uploaded = await uploadSessionMaterial(Number(selectedSessionId), file);
            const nextMaterials = [
                ...selectedSessionMaterials,
                {
                    title: uploaded.title || file.name,
                    url: uploaded.url || '',
                    storageKey: uploaded.storageKey || undefined,
                },
            ];

            const saved = await saveSessionMaterials(nextMaterials, {
                successMessage: t('groupSessions.workspace.resources.toasts.fileAdded'),
            });

            return saved ? uploaded : null;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.fileUploadError'), workspaceErrorStatusMessages));
            return null;
        } finally {
            setUploadingMaterialFile(false);
        }
    };

    const addCourseAssetToSessionMaterials = async (asset) => {
        const exists = selectedSessionMaterials.some(
            (item) => item.storageKey && item.storageKey === asset.storageKey
        );
        if (exists) {
            toast.error(t('groupSessions.workspace.resources.toasts.materialAlreadyAdded'));
            return false;
        }

        return saveSessionMaterials([
            ...selectedSessionMaterials,
            {
                title: asset.title,
                url: asset.url,
                storageKey: asset.storageKey,
            },
        ]);
    };

    const saveMeetingLink = async () => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return;
        }
        setSavingMeeting(true);
        try {
            const payload = {
                provider: meetingProvider,
                customJoinUrl: meetingJoinUrl || undefined,
            };
            const res = meetingId
                ? await updateSessionMeeting(Number(selectedSessionId), payload)
                : await createSessionMeeting(Number(selectedSessionId), payload);
            setMeetingJoinUrl(res?.joinUrl || '');
            setMeetingId(String(res?.meetingId || meetingId || ''));
            toast.success(t('groupSessions.workspace.resources.toasts.meetingLinkUpdated'));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.meetingLinkSaveError'), workspaceErrorStatusMessages));
        } finally {
            setSavingMeeting(false);
        }
    };

    const restoreMeetingState = async () => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return;
        }

        setLoadingMeetingState(true);
        try {
            const res = await fetchSessionMeeting(Number(selectedSessionId), {
                provider: meetingProvider || undefined,
            });
            setMeetingJoinUrl(res?.joinUrl || '');
            setMeetingId(String(res?.meetingId || ''));
            if (res?.provider) setMeetingProvider(res.provider);
            toast.success(t('groupSessions.workspace.resources.toasts.meetingStateUpdated'));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.meetingNotFound'), workspaceErrorStatusMessages));
        } finally {
            setLoadingMeetingState(false);
        }
    };

    const removeMeeting = async () => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return;
        }

        setDeletingMeeting(true);
        try {
            await deleteSessionMeeting(Number(selectedSessionId), {
                provider: meetingProvider || undefined,
            });
            setMeetingJoinUrl('');
            setMeetingId('');
            toast.success(t('groupSessions.workspace.resources.toasts.meetingDeleted'));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.meetingDeleteError'), workspaceErrorStatusMessages));
        } finally {
            setDeletingMeeting(false);
        }
    };

    const importZoomAttendanceToSession = async () => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return;
        }

        setImportingAttendance(true);
        try {
            await importSessionAttendance(Number(selectedSessionId), {
                presentMinPercent: 70,
                lateGraceMinutes: 10,
            });

            if (selectedSessionId) {
                const res = await fetchSessionAttendance(Number(selectedSessionId));
                const list = toArray(res);
                hydrateAttendanceRows(list);
            }
            const refreshed = await fetchCourseAttendance({
                courseId: Number(selectedCourseId),
                groupId: Number(selectedGroupId),
            });
            setAttendanceHistory(refreshed?.items || []);
            await onRefreshInsights?.();

            toast.success(t('groupSessions.workspace.resources.toasts.zoomAttendanceImported'));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.attendanceImportError'), workspaceErrorStatusMessages));
        } finally {
            setImportingAttendance(false);
        }
    };

    const syncZoomRecordingsToSession = async () => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return;
        }

        setSyncingRecordings(true);
        try {
            const res = await syncSessionRecordings(Number(selectedSessionId), {
                setSessionRecordingUrl: true,
            });
            if (res?.recordingUrl) {
                setSessions((prev) =>
                    prev.map((session) =>
                        String(session.id) === String(selectedSessionId)
                            ? { ...session, recordingUrl: res.recordingUrl }
                            : session
                    )
                );
            }
            toast.success(t('groupSessions.workspace.resources.toasts.zoomRecordingsSynced'));
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.resources.toasts.recordingsSyncError'), workspaceErrorStatusMessages));
        } finally {
            setSyncingRecordings(false);
        }
    };

    const joinLiveSession = (joinUrl) => {
        if (!joinUrl) {
            toast.error(t('groupSessions.workspace.resources.toasts.meetingLinkMissing'));
            return;
        }
        window.open(joinUrl, '_blank', 'noopener,noreferrer');
    };

    return {
        addCourseAssetToSessionMaterials,
        canImportZoomAttendance,
        canReusePublishedCourseAssets,
        courseResourceAssets,
        deletingMeeting,
        importZoomAttendanceToSession,
        importingAttendance,
        joinLiveSession,
        loadingCourseResourceAssets,
        loadingMeetingState,
        meetingId,
        meetingJoinUrl,
        meetingProvider,
        removeMeeting,
        restoreMeetingState,
        saveMeetingLink,
        saveSessionMaterials,
        savingMaterials,
        savingMeeting,
        selectedSessionJoinUrl,
        selectedSessionMaterials,
        selectedSessionRecordingUrl,
        selectedSourceVideoCourseId,
        setMeetingJoinUrl,
        setMeetingProvider,
        setSelectedSourceVideoCourseId,
        syncZoomRecordingsToSession,
        syncingRecordings,
        uploadingMaterialFile,
        uploadSessionMaterialFile,
    };
};

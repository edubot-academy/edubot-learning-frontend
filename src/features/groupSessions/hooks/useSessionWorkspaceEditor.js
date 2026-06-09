import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { COURSE_SESSION_STATUS } from '@shared/contracts';
import {
    createCourseSession,
    fetchCourseSessions,
    updateCourseSession,
} from '@services/api';
import {
    EDIT_SESSION_DEFAULT,
    QUICK_SESSION_DEFAULT,
    getNextSessionIndex,
    getWorkspaceErrorMessage,
    getWorkspaceErrorStatusMessages,
    toArray,
    toInputDateTime,
} from '@features/groupSessions/utils/sessionWorkspace.helpers';

const VALID_SESSION_STATUS = new Set([
    COURSE_SESSION_STATUS.SCHEDULED,
    COURSE_SESSION_STATUS.COMPLETED,
    COURSE_SESSION_STATUS.CANCELLED,
]);

export const useSessionWorkspaceEditor = ({
    selectedGroupId,
    selectedSession,
    selectedSessionId,
    sessions,
    setIsSessionSetupOpen,
    setSessionNotes,
    setSelectedSessionId,
    setSessions,
    setWorkspaceFeedback,
    workspaceMode,
    onRefreshInsights,
}) => {
    const { t } = useTranslation();
    const workspaceErrorStatusMessages = getWorkspaceErrorStatusMessages(t);
    const [quickSession, setQuickSession] = useState(QUICK_SESSION_DEFAULT);
    const [editSession, setEditSession] = useState(EDIT_SESSION_DEFAULT);
    const [savingSession, setSavingSession] = useState(false);
    const [savingSessionUpdate, setSavingSessionUpdate] = useState(false);
    const [savingSessionStatus, setSavingSessionStatus] = useState(false);

    useEffect(() => {
        setQuickSession((prev) => ({
            ...prev,
            sessionIndex: prev.sessionIndex || getNextSessionIndex(sessions),
        }));
    }, [sessions]);

    useEffect(() => {
        if (!selectedSession) {
            setEditSession(EDIT_SESSION_DEFAULT);
            setSessionNotes('');
            return;
        }

        setEditSession({
            sessionIndex: selectedSession.sessionIndex ? String(selectedSession.sessionIndex) : '',
            title: selectedSession.title || '',
            startsAt: toInputDateTime(selectedSession.startsAt),
            endsAt: toInputDateTime(selectedSession.endsAt),
            status: selectedSession.status || COURSE_SESSION_STATUS.SCHEDULED,
            recordingUrl: selectedSession.recordingUrl || '',
        });
        setSessionNotes(selectedSession.notes || '');
    }, [selectedSession, setSessionNotes]);

    const refreshSelectedGroupSessions = async () => {
        const res = await fetchCourseSessions({ groupId: Number(selectedGroupId) });
        const list = toArray(res);
        setSessions(list);
        return list;
    };

    const createQuickSession = async () => {
        if (!selectedGroupId) {
            setWorkspaceFeedback({
                tone: 'warning',
                title: t('groupSessions.setup.feedback.noGroupTitle'),
                message: t('groupSessions.setup.feedback.noGroupMessage'),
            });
            toast.error(t('groupSessions.setup.toasts.selectGroup'));
            return;
        }
        if (
            !quickSession.title.trim() ||
            !quickSession.sessionIndex ||
            !quickSession.startsAt ||
            !quickSession.endsAt
        ) {
            setWorkspaceFeedback({
                tone: 'warning',
                title: t('groupSessions.setup.feedback.incompleteTitle'),
                message: t('groupSessions.setup.feedback.createIncompleteMessage'),
            });
            toast.error(t('groupSessions.setup.toasts.createIncomplete'));
            return;
        }

        setSavingSession(true);
        try {
            const materials =
                quickSession.materialTitle.trim() && quickSession.materialUrl.trim()
                    ? [
                        {
                            title: quickSession.materialTitle.trim(),
                            url: quickSession.materialUrl.trim(),
                            isPublished: false,
                        },
                    ]
                    : undefined;

            const payload = {
                groupId: Number(selectedGroupId),
                sessionIndex: Number(quickSession.sessionIndex),
                title: quickSession.title.trim(),
                startsAt: new Date(quickSession.startsAt).toISOString(),
                endsAt: new Date(quickSession.endsAt).toISOString(),
                status: quickSession.status || undefined,
                recordingUrl: quickSession.recordingUrl || undefined,
                materials,
            };

            const created = await createCourseSession(payload);
            setWorkspaceFeedback({
                tone: 'success',
                title: t('groupSessions.setup.feedback.createdTitle'),
                message: t('groupSessions.setup.feedback.createdMessage', { title: payload.title }),
            });
            toast.success(t('groupSessions.setup.toasts.created'));

            const list = await refreshSelectedGroupSessions();
            if (created?.id) setSelectedSessionId(String(created.id));
            setIsSessionSetupOpen(false);

            setQuickSession((prev) => ({
                ...QUICK_SESSION_DEFAULT,
                sessionIndex: getNextSessionIndex(list),
                status: prev.status,
            }));
        } catch (error) {
            const message = getWorkspaceErrorMessage(error, t('groupSessions.setup.toasts.createError'), workspaceErrorStatusMessages);
            setWorkspaceFeedback({ tone: 'error', title: t('groupSessions.setup.feedback.createFailedTitle'), message });
            toast.error(message);
        } finally {
            setSavingSession(false);
        }
    };

    const updateSelectedSession = async () => {
        if (!selectedSessionId) {
            setWorkspaceFeedback({
                tone: 'warning',
                title: t('groupSessions.setup.feedback.noSessionTitle'),
                message: t('groupSessions.setup.feedback.noSessionMessage'),
            });
            toast.error(t('groupSessions.setup.toasts.selectSession'));
            return;
        }
        if (!editSession.title.trim() || !editSession.startsAt || !editSession.endsAt) {
            setWorkspaceFeedback({
                tone: 'warning',
                title: t('groupSessions.setup.feedback.incompleteTitle'),
                message: t('groupSessions.setup.feedback.updateIncompleteMessage'),
            });
            toast.error(t('groupSessions.setup.toasts.updateIncomplete'));
            return;
        }

        setSavingSessionUpdate(true);
        try {
            await updateCourseSession(Number(selectedSessionId), {
                sessionIndex: editSession.sessionIndex
                    ? Number(editSession.sessionIndex)
                    : undefined,
                title: editSession.title.trim(),
                startsAt: new Date(editSession.startsAt).toISOString(),
                endsAt: new Date(editSession.endsAt).toISOString(),
                status: editSession.status || undefined,
                recordingUrl: editSession.recordingUrl || undefined,
            });

            await refreshSelectedGroupSessions();
            setIsSessionSetupOpen(false);
            setWorkspaceFeedback({
                tone: 'success',
                title: t('groupSessions.setup.feedback.updatedTitle'),
                message: t('groupSessions.setup.feedback.updatedMessage', { title: editSession.title.trim() }),
            });
            toast.success(t('groupSessions.setup.toasts.updated'));
        } catch (error) {
            const message = getWorkspaceErrorMessage(error, t('groupSessions.setup.toasts.updateError'), workspaceErrorStatusMessages);
            setWorkspaceFeedback({ tone: 'error', title: t('groupSessions.setup.feedback.updateFailedTitle'), message });
            toast.error(message);
        } finally {
            setSavingSessionUpdate(false);
        }
    };

    const updateSelectedSessionStatus = async (nextStatus) => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return false;
        }

        const normalizedStatus = VALID_SESSION_STATUS.has(nextStatus)
            ? nextStatus
            : COURSE_SESSION_STATUS.SCHEDULED;
        if ((selectedSession?.status || COURSE_SESSION_STATUS.SCHEDULED) === normalizedStatus) {
            return true;
        }

        setSavingSessionStatus(true);
        try {
            const updated = await updateCourseSession(Number(selectedSessionId), {
                status: normalizedStatus,
            });

            if (selectedGroupId) {
                await refreshSelectedGroupSessions();
            } else if (updated?.id) {
                setSessions((prev) =>
                    prev.map((session) =>
                        String(session.id) === String(updated.id) ? updated : session
                    )
                );
            }
            setEditSession((prev) => ({
                ...prev,
                status: normalizedStatus,
            }));
            await onRefreshInsights?.();
            toast.success(t('groupSessions.setup.toasts.statusUpdated'));
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.setup.toasts.statusUpdateError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setSavingSessionStatus(false);
        }
    };

    const nextSessionIndex = useMemo(() => getNextSessionIndex(sessions), [sessions]);
    const isCreateWorkspace = workspaceMode === 'create';
    const workspaceTitle = isCreateWorkspace
        ? t('groupSessions.setup.workspace.createTitle')
        : t('groupSessions.setup.workspace.editTitle');
    const workspaceDescription = isCreateWorkspace
        ? t('groupSessions.setup.workspace.createDescription')
        : t('groupSessions.setup.workspace.editDescription');
    const workspaceDisabled = isCreateWorkspace ? !selectedGroupId : !selectedSessionId;
    const workspaceDisabledReason = isCreateWorkspace
        ? t('groupSessions.setup.workspace.createDisabledReason')
        : t('groupSessions.setup.workspace.editDisabledReason');
    const workspaceActionLabel = isCreateWorkspace
        ? savingSession
            ? t('groupSessions.setup.workspace.creating')
            : t('groupSessions.setup.workspace.createAction')
        : savingSessionUpdate
            ? t('groupSessions.setup.workspace.saving')
            : t('groupSessions.setup.workspace.saveAction');
    const workspaceAction = isCreateWorkspace ? createQuickSession : updateSelectedSession;
    const workspaceSaving = isCreateWorkspace ? savingSession : savingSessionUpdate;

    return {
        editSession,
        isCreateWorkspace,
        nextSessionIndex,
        quickSession,
        refreshSelectedGroupSessions,
        savingSessionStatus,
        setEditSession,
        setQuickSession,
        updateSelectedSessionStatus,
        workspaceAction,
        workspaceActionLabel,
        workspaceDescription,
        workspaceDisabled,
        workspaceDisabledReason,
        workspaceSaving,
        workspaceTitle,
    };
};

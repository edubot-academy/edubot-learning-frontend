import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
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
                title: 'Группа тандалган эмес',
                message: 'Жаңы сессия түзүү үчүн адегенде группа тандаңыз.',
            });
            toast.error('Адегенде группаны тандаңыз.');
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
                title: 'Сессия маалыматы толук эмес',
                message: 'Сессия үчүн номер, аталыш, башталышы жана аягы милдеттүү.',
            });
            toast.error('Сессия үчүн номер, аталыш, башталышы жана аягы милдеттүү.');
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
                title: 'Сессия түзүлдү',
                message: `${payload.title} активдүү workspace ичинде ачылды.`,
            });
            toast.success('Session түзүлдү.');

            const list = await refreshSelectedGroupSessions();
            if (created?.id) setSelectedSessionId(String(created.id));
            setIsSessionSetupOpen(false);

            setQuickSession((prev) => ({
                ...QUICK_SESSION_DEFAULT,
                sessionIndex: getNextSessionIndex(list),
                status: prev.status,
            }));
        } catch (error) {
            const message = getWorkspaceErrorMessage(error, 'Сессия түзүү катасы');
            setWorkspaceFeedback({ tone: 'error', title: 'Сессия түзүлгөн жок', message });
            toast.error(message);
        } finally {
            setSavingSession(false);
        }
    };

    const updateSelectedSession = async () => {
        if (!selectedSessionId) {
            setWorkspaceFeedback({
                tone: 'warning',
                title: 'Сессия тандалган эмес',
                message: 'Түзөтүү үчүн активдүү сессияны тандаңыз.',
            });
            toast.error('Сессияны тандаңыз.');
            return;
        }
        if (!editSession.title.trim() || !editSession.startsAt || !editSession.endsAt) {
            setWorkspaceFeedback({
                tone: 'warning',
                title: 'Сессия маалыматы толук эмес',
                message: 'Сессия үчүн аталыш, башталышы жана аягы милдеттүү.',
            });
            toast.error('Сессия үчүн аталыш, башталышы жана аягы милдеттүү.');
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
                title: 'Сессия жаңыртылды',
                message: `${editSession.title.trim()} үчүн өзгөртүүлөр сакталды.`,
            });
            toast.success('Session жаңыртылды.');
        } catch (error) {
            const message = getWorkspaceErrorMessage(error, 'Сессияны жаңыртуу катасы');
            setWorkspaceFeedback({ tone: 'error', title: 'Сессия жаңырган жок', message });
            toast.error(message);
        } finally {
            setSavingSessionUpdate(false);
        }
    };

    const updateSelectedSessionStatus = async (nextStatus) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
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
            toast.success('Сессия статусу жаңыртылды.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Сессия статусун жаңыртуу катасы'));
            return false;
        } finally {
            setSavingSessionStatus(false);
        }
    };

    const nextSessionIndex = useMemo(() => getNextSessionIndex(sessions), [sessions]);
    const isCreateWorkspace = workspaceMode === 'create';
    const workspaceTitle = isCreateWorkspace ? 'Жаңы сессия' : 'Сессияны түзөтүү';
    const workspaceDescription = isCreateWorkspace
        ? 'Группанын кийинки сабагын түзүп, убакытын жана кошумча материалын кошуңуз.'
        : 'Тандалган сессиянын убакытын, статусун жана жазуу шилтемесин жаңыртыңыз.';
    const workspaceDisabled = isCreateWorkspace ? !selectedGroupId : !selectedSessionId;
    const workspaceDisabledReason = isCreateWorkspace
        ? 'Сессия түзүү үчүн алгач группа тандаңыз.'
        : 'Түзөтүү үчүн активдүү сессия тандаңыз.';
    const workspaceActionLabel = isCreateWorkspace
        ? savingSession
            ? 'Түзүлүүдө...'
            : 'Сессия түзүү'
        : savingSessionUpdate
            ? 'Сакталууда...'
            : 'Өзгөртүүлөрдү сактоо';
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

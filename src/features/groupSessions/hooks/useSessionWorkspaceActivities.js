import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    createSessionActivity,
    deleteSessionActivity,
    fetchSessionActivityResponses,
    reviewSessionActivitySubmission,
    updateSessionActivity,
} from '@services/api';
import {
    getWorkspaceErrorMessage,
    getWorkspaceErrorStatusMessages,
} from '@features/groupSessions/utils/sessionWorkspace.helpers';

export const useSessionWorkspaceActivities = ({
    selectedSessionId,
    onRefreshInsights,
    onRefreshSessions,
}) => {
    const { t } = useTranslation();
    const workspaceErrorStatusMessages = getWorkspaceErrorStatusMessages(t);
    const [creatingSessionActivity, setCreatingSessionActivity] = useState(false);
    const [savingSessionActivityId, setSavingSessionActivityId] = useState(null);
    const [deletingSessionActivityId, setDeletingSessionActivityId] = useState(null);
    const [loadingActivityResponsesId, setLoadingActivityResponsesId] = useState(null);
    const [reviewingActivitySubmissionId, setReviewingActivitySubmissionId] = useState(null);
    const [activityResponses, setActivityResponses] = useState({});

    useEffect(() => {
        setActivityResponses({});
        setLoadingActivityResponsesId(null);
        setReviewingActivitySubmissionId(null);
    }, [selectedSessionId]);

    const createActivityItem = async (activity) => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return false;
        }

        setCreatingSessionActivity(true);
        try {
            await createSessionActivity(Number(selectedSessionId), activity);
            await onRefreshSessions?.();
            await onRefreshInsights?.();
            toast.success(t('groupSessions.workspace.activities.toasts.created'));
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.activities.toasts.createError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setCreatingSessionActivity(false);
        }
    };

    const updateActivityItem = async (activityId, activity) => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return false;
        }

        setSavingSessionActivityId(String(activityId));
        try {
            await updateSessionActivity(Number(selectedSessionId), Number(activityId), activity);
            await onRefreshSessions?.();
            await onRefreshInsights?.();
            toast.success(t('groupSessions.workspace.activities.toasts.updated'));
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.activities.toasts.updateError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setSavingSessionActivityId(null);
        }
    };

    const deleteActivityItem = async (activityId) => {
        if (!selectedSessionId) {
            toast.error(t('groupSessions.workspace.validation.selectSession'));
            return false;
        }

        setDeletingSessionActivityId(String(activityId));
        try {
            await deleteSessionActivity(Number(selectedSessionId), Number(activityId));
            await onRefreshSessions?.();
            await onRefreshInsights?.();
            toast.success(t('groupSessions.workspace.activities.toasts.deleted'));
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.activities.toasts.deleteError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setDeletingSessionActivityId(null);
        }
    };

    const loadActivityResponses = async (activityId) => {
        if (!selectedSessionId) return null;

        setLoadingActivityResponsesId(String(activityId));
        try {
            const payload = await fetchSessionActivityResponses(Number(selectedSessionId), Number(activityId));
            setActivityResponses((prev) => ({ ...prev, [activityId]: payload }));
            return payload;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.activities.toasts.loadResponsesError'), workspaceErrorStatusMessages));
            return null;
        } finally {
            setLoadingActivityResponsesId(null);
        }
    };

    const reviewActivitySubmissionItem = async (activityId, submissionId, status, reviewComment = '', score = '') => {
        if (!selectedSessionId) return false;

        setReviewingActivitySubmissionId(String(submissionId));
        try {
            await reviewSessionActivitySubmission(Number(selectedSessionId), Number(activityId), Number(submissionId), {
                status,
                reviewComment,
                score: score === '' ? undefined : Number(score),
            });
            await loadActivityResponses(activityId);
            await onRefreshSessions?.();
            await onRefreshInsights?.();
            toast.success(t('groupSessions.workspace.activities.toasts.responseUpdated'));
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, t('groupSessions.workspace.activities.toasts.responseSaveError'), workspaceErrorStatusMessages));
            return false;
        } finally {
            setReviewingActivitySubmissionId(null);
        }
    };

    return {
        activityResponses,
        createActivityItem,
        creatingSessionActivity,
        deleteActivityItem,
        deletingSessionActivityId,
        loadActivityResponses,
        loadingActivityResponsesId,
        reviewActivitySubmissionItem,
        reviewingActivitySubmissionId,
        savingSessionActivityId,
        updateActivityItem,
    };
};

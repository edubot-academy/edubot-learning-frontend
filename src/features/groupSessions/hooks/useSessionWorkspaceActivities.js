import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    createSessionActivity,
    deleteSessionActivity,
    fetchSessionActivityResponses,
    reviewSessionActivitySubmission,
    updateSessionActivity,
} from '@services/api';
import { getWorkspaceErrorMessage } from '@features/groupSessions/utils/sessionWorkspace.helpers';

export const useSessionWorkspaceActivities = ({
    selectedSessionId,
    onRefreshInsights,
    onRefreshSessions,
}) => {
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
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setCreatingSessionActivity(true);
        try {
            await createSessionActivity(Number(selectedSessionId), activity);
            await onRefreshSessions?.();
            await onRefreshInsights?.();
            toast.success('Иш кошулду.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Ишти сактоо катасы'));
            return false;
        } finally {
            setCreatingSessionActivity(false);
        }
    };

    const updateActivityItem = async (activityId, activity) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setSavingSessionActivityId(String(activityId));
        try {
            await updateSessionActivity(Number(selectedSessionId), Number(activityId), activity);
            await onRefreshSessions?.();
            await onRefreshInsights?.();
            toast.success('Иш жаңыртылды.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Ишти жаңыртуу катасы'));
            return false;
        } finally {
            setSavingSessionActivityId(null);
        }
    };

    const deleteActivityItem = async (activityId) => {
        if (!selectedSessionId) {
            toast.error('Сессия тандаңыз.');
            return false;
        }

        setDeletingSessionActivityId(String(activityId));
        try {
            await deleteSessionActivity(Number(selectedSessionId), Number(activityId));
            await onRefreshSessions?.();
            await onRefreshInsights?.();
            toast.success('Иш өчүрүлдү.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Ишти өчүрүү катасы'));
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
            toast.error(getWorkspaceErrorMessage(error, 'Иш жыйынтыгын жүктөө катасы'));
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
            toast.success('Иш жообу жаңыртылды.');
            return true;
        } catch (error) {
            toast.error(getWorkspaceErrorMessage(error, 'Иш жообун сактоо катасы'));
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

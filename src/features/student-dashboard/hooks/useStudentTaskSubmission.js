import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    submitSessionHomework,
    submitStudentActivity,
    submitStudentActivityQuiz,
    uploadSessionHomeworkAttachment,
    uploadStudentActivityAttachment,
} from '@services/api';
import { seedVocabularyCards } from '../../student/api';
import { INTERACTIVE_ACTIVITY_TYPES } from '../components/ActivityInteractiveForm';
import {
    getTaskKey,
    resolveSessionHomeworkIds,
} from '../utils/studentDashboard.helpers.js';
import { parseApiError } from '@shared/api/error';

export const useStudentTaskSubmission = ({ onRefreshTasks }) => {
    const { t } = useTranslation();
    const [submittingTaskState, setSubmittingTaskState] = useState(null);

    const handleSubmitHomework = useCallback(async (task, submission) => {
        if (task?.kind === 'activity') {
            const sessionId = Number(task.sessionId);
            const activityId = Number(task.id || task.activityId);
            if (!sessionId || !activityId) {
                toast.error(t('studentDashboard.tasks.toasts.activitySubmitUnavailable'));
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
                } else if (INTERACTIVE_ACTIVITY_TYPES.has(task.activityType)) {
                    const interactiveAnswers = submission?.interactiveAnswers;
                    if (!interactiveAnswers) {
                        toast.error(t('studentDashboard.tasks.toasts.completeInteractiveActivity'));
                        return false;
                    }
                    await submitStudentActivity(sessionId, activityId, {
                        text: JSON.stringify(interactiveAnswers),
                    });
                    if (task.activityType === 'vocabulary') {
                        seedVocabularyCards(activityId).catch(() => {});
                    }
                } else {
                    const text = submission?.text?.trim() || '';
                    const link = submission?.link?.trim() || '';
                    const file = submission?.file instanceof File ? submission.file : null;
                    const removeAttachment = Boolean(submission?.removeAttachment);
                    if (!text && !link && !file) {
                        toast.error(t('studentDashboard.tasks.toasts.addAnswerLinkOrFile'));
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

                await onRefreshTasks({ silent: true });
                toast.success(t('studentDashboard.tasks.toasts.activitySubmitted'));
                return true;
            } catch (error) {
                toast.error(parseApiError(error, t('studentDashboard.tasks.toasts.activitySubmitError')).message);
                return false;
            } finally {
                setSubmittingTaskState(null);
            }
        }

        const { sessionId, homeworkId } = resolveSessionHomeworkIds(task);
        if (!sessionId || !homeworkId) {
            toast.error(t('studentDashboard.tasks.toasts.homeworkSubmitUnavailable'));
            return false;
        }

        const key = getTaskKey(task);
        const text = submission?.text?.trim() || '';
        const link = submission?.link?.trim() || '';
        const file = submission?.file instanceof File ? submission.file : null;
        const removeAttachment = Boolean(submission?.removeAttachment);
        if (!text && !link && !file) {
            toast.error(t('studentDashboard.tasks.toasts.addAnswerLinkOrFile'));
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

            await onRefreshTasks({ silent: true });
            toast.success(t('studentDashboard.tasks.toasts.homeworkSubmitted'));
            return true;
        } catch (error) {
            console.error('Failed to submit session homework', error);
            const message = parseApiError(error, t('studentDashboard.tasks.toasts.homeworkSubmitError')).message;
            const normalizedMessage = String(message || '').toLowerCase();

            if (normalizedMessage.includes('unsupported homework attachment type')) {
                toast.error(t('studentDashboard.tasks.toasts.unsupportedAttachment'));
                return false;
            }

            if (
                normalizedMessage.includes('file too large') ||
                normalizedMessage.includes('file size') ||
                normalizedMessage.includes('larger than')
            ) {
                toast.error(t('studentDashboard.tasks.toasts.fileTooLarge'));
                return false;
            }

            toast.error(message);
            return false;
        } finally {
            setSubmittingTaskState(null);
        }
    }, [onRefreshTasks, t]);

    return {
        handleSubmitHomework,
        submittingTaskState,
    };
};

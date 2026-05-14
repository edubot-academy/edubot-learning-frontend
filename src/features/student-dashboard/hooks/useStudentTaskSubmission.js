import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
    submitSessionHomework,
    submitStudentActivity,
    submitStudentActivityQuiz,
    uploadSessionHomeworkAttachment,
    uploadStudentActivityAttachment,
} from '@services/api';
import {
    getTaskKey,
    resolveSessionHomeworkIds,
} from '../utils/studentDashboard.helpers.js';

export const useStudentTaskSubmission = ({ onRefreshTasks }) => {
    const [submittingTaskState, setSubmittingTaskState] = useState(null);

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

                await onRefreshTasks({ silent: true });
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

            await onRefreshTasks({ silent: true });
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
    }, [onRefreshTasks]);

    return {
        handleSubmitHomework,
        submittingTaskState,
    };
};

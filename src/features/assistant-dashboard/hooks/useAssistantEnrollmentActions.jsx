import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    enrollUserInCourse,
    unenrollUserFromCourse,
} from '@services/api';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';

const confirmToast = (message, onConfirm, labels, confirmClass = 'bg-blue-600 hover:bg-blue-700') => {
    toast((toastInstance) => (
        <div>
            <div className="mb-2">{message}</div>
            <div className="mt-2 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={async () => {
                        toast.dismiss(toastInstance.id);
                        await onConfirm();
                    }}
                    className={`px-3 py-1 text-white rounded ${confirmClass}`}
                >
                    {labels.confirm}
                </button>
                <button
                    type="button"
                    onClick={() => toast.dismiss(toastInstance.id)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    {labels.cancel}
                </button>
            </div>
        </div>
    ));
};

export const useAssistantEnrollmentActions = ({
    coursesById,
    getMutationContext,
    onEnrollSuccess,
    onUnenrollSuccess,
}) => {
    const { t } = useTranslation();
    const [pendingEnrollmentAction, setPendingEnrollmentAction] = useState(null);
    const [lastEnrollmentFeedback, setLastEnrollmentFeedback] = useState(null);

    const getActionKey = useCallback((studentId, courseId, action) =>
        `${action}:${studentId}:${courseId}`, []);

    const handleEnroll = useCallback(
        async (student, selectedCourseId) => {
            const courseTitle = coursesById[selectedCourseId]?.title ?? t('assistantDashboard.enrollment.courseFallback');
            const mutationContext = getMutationContext();
            const actionKey = getActionKey(student.id, selectedCourseId, 'enroll');

            confirmToast(
                <>
                    <Trans
                        i18nKey="assistantDashboard.enrollment.confirmEnroll"
                        values={{ student: student.fullName, course: courseTitle }}
                        components={{ strong: <span className="font-bold" /> }}
                    />
                </>,
                async () => {
                    setPendingEnrollmentAction(actionKey);
                    setLastEnrollmentFeedback({
                        actionKey,
                        studentId: student.id,
                        courseId: Number(selectedCourseId),
                        type: 'pending',
                        message: t('assistantDashboard.enrollment.enrollPending', {
                            student: student.fullName,
                            course: courseTitle,
                        }),
                    });
                    try {
                        await enrollUserInCourse(student.id, selectedCourseId, {
                            courseType: normalizeEnrollmentCourseType(
                                coursesById[selectedCourseId]?.courseType
                            ),
                        });

                        toast.success(
                            <span>
                                <Trans
                                    i18nKey="assistantDashboard.enrollment.enrollSuccessToast"
                                    values={{ student: student.fullName }}
                                    components={{ strong: <span className="font-bold" /> }}
                                />
                            </span>
                        );

                        onEnrollSuccess(student.id, Number(selectedCourseId), mutationContext);
                        setLastEnrollmentFeedback({
                            actionKey,
                            studentId: student.id,
                            courseId: Number(selectedCourseId),
                            type: 'success',
                            message: t('assistantDashboard.enrollment.enrollSuccessFeedback', {
                                student: student.fullName,
                                course: courseTitle,
                            }),
                        });
                    } catch {
                        toast.error(t('assistantDashboard.enrollment.enrollErrorToast'));
                        setLastEnrollmentFeedback({
                            actionKey,
                            studentId: student.id,
                            courseId: Number(selectedCourseId),
                            type: 'error',
                            message: t('assistantDashboard.enrollment.enrollErrorFeedback', {
                                student: student.fullName,
                                course: courseTitle,
                            }),
                        });
                    } finally {
                        setPendingEnrollmentAction(null);
                    }
                },
                {
                    confirm: t('assistantDashboard.enrollment.confirmAction'),
                    cancel: t('common.cancel'),
                }
            );
        },
        [coursesById, getActionKey, getMutationContext, onEnrollSuccess, t]
    );

    const handleUnenroll = useCallback(
        (student, courseId) => {
            const courseTitle = coursesById[courseId]?.title ?? t('assistantDashboard.enrollment.courseFallback');
            const mutationContext = getMutationContext();
            const actionKey = getActionKey(student.id, courseId, 'unenroll');

            confirmToast(
                <>
                    <Trans
                        i18nKey="assistantDashboard.enrollment.confirmUnenroll"
                        values={{ student: student.fullName, course: courseTitle }}
                        components={{ strong: <span className="font-bold" /> }}
                    />
                </>,
                async () => {
                    setPendingEnrollmentAction(actionKey);
                    setLastEnrollmentFeedback({
                        actionKey,
                        studentId: student.id,
                        courseId: Number(courseId),
                        type: 'pending',
                        message: t('assistantDashboard.enrollment.unenrollPending', {
                            student: student.fullName,
                            course: courseTitle,
                        }),
                    });
                    try {
                        await unenrollUserFromCourse(student.id, courseId);
                        toast.success(
                            <span>
                                <Trans
                                    i18nKey="assistantDashboard.enrollment.unenrollSuccessToast"
                                    values={{ student: student.fullName }}
                                    components={{ strong: <span className="font-bold" /> }}
                                />
                            </span>
                        );
                        onUnenrollSuccess(student.id, Number(courseId), mutationContext);
                        setLastEnrollmentFeedback({
                            actionKey,
                            studentId: student.id,
                            courseId: Number(courseId),
                            type: 'success',
                            message: t('assistantDashboard.enrollment.unenrollSuccessFeedback', {
                                student: student.fullName,
                                course: courseTitle,
                            }),
                        });
                    } catch {
                        toast.error(t('assistantDashboard.enrollment.unenrollErrorToast'));
                        setLastEnrollmentFeedback({
                            actionKey,
                            studentId: student.id,
                            courseId: Number(courseId),
                            type: 'error',
                            message: t('assistantDashboard.enrollment.unenrollErrorFeedback', {
                                student: student.fullName,
                                course: courseTitle,
                            }),
                        });
                    } finally {
                        setPendingEnrollmentAction(null);
                    }
                },
                {
                    confirm: t('assistantDashboard.enrollment.confirmAction'),
                    cancel: t('common.cancel'),
                },
                'bg-red-600 hover:bg-red-700'
            );
        },
        [coursesById, getActionKey, getMutationContext, onUnenrollSuccess, t]
    );

    return {
        getActionKey,
        handleEnroll,
        handleUnenroll,
        lastEnrollmentFeedback,
        pendingEnrollmentAction,
    };
};

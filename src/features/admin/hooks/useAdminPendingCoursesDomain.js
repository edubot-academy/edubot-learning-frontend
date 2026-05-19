import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getPendingCourses, markCourseApproved, markCourseRejected } from '@services/api';
import { isForbiddenError, parseApiError } from '@shared/api/error';

export const useAdminPendingCoursesDomain = ({ requestConfirmation } = {}) => {
    const { t } = useTranslation();
    const [pendingCourses, setPendingCourses] = useState([]);

    const loadPendingCourses = useCallback(async () => {
        try {
            const res = await getPendingCourses();
            setPendingCourses(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(
                    parseApiError(error, t('adminPendingCourses.toasts.loadError')).message
                );
            }
        }
    }, [t]);

    const handleApprovePendingCourse = useCallback(
        async (targetCourse) => {
            const courseId = typeof targetCourse === 'object' ? targetCourse.id : targetCourse;
            const courseTitle =
                typeof targetCourse === 'object'
                    ? targetCourse.title || t('adminPendingCourses.courseFallback', { id: courseId })
                    : t('adminPendingCourses.courseFallback', { id: courseId });

            const approve = async () => {
                try {
                    await markCourseApproved(courseId);
                    setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
                    toast.success(t('adminPendingCourses.toasts.approved'));
                } catch (error) {
                    toast.error(
                        parseApiError(error, t('adminPendingCourses.toasts.approveError')).message
                    );
                }
            };

            if (!requestConfirmation) {
                await approve();
                return;
            }

            requestConfirmation({
                title: t('adminPendingCourses.confirm.approveTitle'),
                message: t('adminPendingCourses.confirm.approveMessage', { title: courseTitle }),
                confirmLabel: t('adminPendingCourses.actions.approve'),
                confirmVariant: 'success',
                onConfirm: approve,
            });
        },
        [requestConfirmation, t]
    );

    const handleRejectPendingCourse = useCallback(
        async (targetCourse) => {
            const courseId = typeof targetCourse === 'object' ? targetCourse.id : targetCourse;
            const courseTitle =
                typeof targetCourse === 'object'
                    ? targetCourse.title || t('adminPendingCourses.courseFallback', { id: courseId })
                    : t('adminPendingCourses.courseFallback', { id: courseId });

            const reject = async () => {
                try {
                    await markCourseRejected(courseId);
                    setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
                    toast.success(t('adminPendingCourses.toasts.rejected'));
                } catch (error) {
                    toast.error(
                        parseApiError(error, t('adminPendingCourses.toasts.rejectError')).message
                    );
                }
            };

            if (!requestConfirmation) {
                await reject();
                return;
            }

            requestConfirmation({
                title: t('adminPendingCourses.confirm.rejectTitle'),
                message: t('adminPendingCourses.confirm.rejectMessage', { title: courseTitle }),
                confirmLabel: t('adminPendingCourses.actions.reject'),
                confirmVariant: 'danger',
                onConfirm: reject,
            });
        },
        [requestConfirmation, t]
    );

    return {
        handleApprovePendingCourse,
        handleRejectPendingCourse,
        loadPendingCourses,
        pendingCourses,
    };
};

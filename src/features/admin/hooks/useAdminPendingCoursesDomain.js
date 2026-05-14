import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { getPendingCourses, markCourseApproved, markCourseRejected } from '@services/api';
import { isForbiddenError } from '@shared/api/error';

export const useAdminPendingCoursesDomain = ({ requestConfirmation } = {}) => {
    const [pendingCourses, setPendingCourses] = useState([]);

    const loadPendingCourses = useCallback(async () => {
        try {
            const res = await getPendingCourses();
            setPendingCourses(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Каралуудагы курстарды жүктөөдө ката кетти');
            }
        }
    }, []);

    const handleApprovePendingCourse = useCallback(
        async (targetCourse) => {
            const courseId = typeof targetCourse === 'object' ? targetCourse.id : targetCourse;
            const courseTitle =
                typeof targetCourse === 'object'
                    ? targetCourse.title || `Курс #${courseId}`
                    : `Курс #${courseId}`;

            const approve = async () => {
                try {
                    await markCourseApproved(courseId);
                    setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
                    toast.success('Курс ийгиликтүү бекитилди');
                } catch {
                    toast.error('Курсту бекитүүдө ката кетти');
                }
            };

            if (!requestConfirmation) {
                await approve();
                return;
            }

            requestConfirmation({
                title: 'Курсту бекитүү',
                message: `"${courseTitle}" курсун бекитесизби? Бекитилгенден кийин курс студенттерге жана каталог агымдарына жеткиликтүү болушу мүмкүн.`,
                confirmLabel: 'Бекитүү',
                confirmVariant: 'success',
                onConfirm: approve,
            });
        },
        [requestConfirmation]
    );

    const handleRejectPendingCourse = useCallback(
        async (targetCourse) => {
            const courseId = typeof targetCourse === 'object' ? targetCourse.id : targetCourse;
            const courseTitle =
                typeof targetCourse === 'object'
                    ? targetCourse.title || `Курс #${courseId}`
                    : `Курс #${courseId}`;

            const reject = async () => {
                try {
                    await markCourseRejected(courseId);
                    setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
                    toast.success('Курс баш тартылган тизмеге жылдырылды');
                } catch {
                    toast.error('Курстан баш тартууда ката кетти');
                }
            };

            if (!requestConfirmation) {
                await reject();
                return;
            }

            requestConfirmation({
                title: 'Курстан баш тартуу',
                message: `"${courseTitle}" курсун четке кагасызбы? Инструктор курсун оңдоп кайра жөнөтүшү керек болот.`,
                confirmLabel: 'Баш тартуу',
                confirmVariant: 'danger',
                onConfirm: reject,
            });
        },
        [requestConfirmation]
    );

    return {
        handleApprovePendingCourse,
        handleRejectPendingCourse,
        loadPendingCourses,
        pendingCourses,
    };
};

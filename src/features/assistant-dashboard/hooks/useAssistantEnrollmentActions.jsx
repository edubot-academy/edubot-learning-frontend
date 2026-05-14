import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
    enrollUserInCourse,
    unenrollUserFromCourse,
} from '@services/api';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';

const confirmToast = (message, onConfirm, confirmClass = 'bg-blue-600 hover:bg-blue-700') => {
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
                    Ооба
                </button>
                <button
                    type="button"
                    onClick={() => toast.dismiss(toastInstance.id)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Жок
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
    const [pendingEnrollmentAction, setPendingEnrollmentAction] = useState(null);

    const getActionKey = useCallback((studentId, courseId, action) =>
        `${action}:${studentId}:${courseId}`, []);

    const handleEnroll = useCallback(
        async (student, selectedCourseId) => {
            const courseTitle = coursesById[selectedCourseId]?.title ?? 'курс';
            const mutationContext = getMutationContext();
            const actionKey = getActionKey(student.id, selectedCourseId, 'enroll');

            confirmToast(
                <>
                    <span className="font-bold">{student.fullName}</span> студентин{' '}
                    <span className="font-bold">{courseTitle}</span> курсуна каттоо — макулсузбу?
                </>,
                async () => {
                    setPendingEnrollmentAction(actionKey);
                    try {
                        await enrollUserInCourse(student.id, selectedCourseId, {
                            courseType: normalizeEnrollmentCourseType(
                                coursesById[selectedCourseId]?.courseType
                            ),
                        });

                        toast.success(
                            <span>
                                <span className="font-bold">{student.fullName}</span> курска ийгиликтүү катталды
                            </span>
                        );

                        onEnrollSuccess(student.id, Number(selectedCourseId), mutationContext);
                    } catch {
                        toast.error('Курска каттоодо ката кетти');
                    } finally {
                        setPendingEnrollmentAction(null);
                    }
                }
            );
        },
        [coursesById, getActionKey, getMutationContext, onEnrollSuccess]
    );

    const handleUnenroll = useCallback(
        (student, courseId) => {
            const courseTitle = coursesById[courseId]?.title ?? 'курс';
            const mutationContext = getMutationContext();
            const actionKey = getActionKey(student.id, courseId, 'unenroll');

            confirmToast(
                <>
                    <span className="font-bold">{student.fullName}</span> студентин{' '}
                    <span className="font-bold">{courseTitle}</span> курсунан чыгаруу — макулсузбу?
                </>,
                async () => {
                    setPendingEnrollmentAction(actionKey);
                    try {
                        await unenrollUserFromCourse(student.id, courseId);
                        toast.success(
                            <span>
                                <span className="font-bold">{student.fullName}</span> курстан ийгиликтүү чыгарылды
                            </span>
                        );
                        onUnenrollSuccess(student.id, Number(courseId), mutationContext);
                    } catch {
                        toast.error('Курстан чыгарууда ката кетти');
                    } finally {
                        setPendingEnrollmentAction(null);
                    }
                },
                'bg-red-600 hover:bg-red-700'
            );
        },
        [coursesById, getActionKey, getMutationContext, onUnenrollSuccess]
    );

    return {
        getActionKey,
        handleEnroll,
        handleUnenroll,
        pendingEnrollmentAction,
    };
};

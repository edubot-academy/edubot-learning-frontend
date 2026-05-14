import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { getPendingCourses, markCourseApproved, markCourseRejected } from '@services/api';
import { isForbiddenError } from '@shared/api/error';

export const useAdminPendingCoursesDomain = () => {
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

    const handleApprovePendingCourse = useCallback(async (courseId) => {
        try {
            await markCourseApproved(courseId);
            setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
            toast.success('Курс ийгиликтүү бекитилди');
        } catch {
            toast.error('Курсту бекитүүдө ката кетти');
        }
    }, []);

    const handleRejectPendingCourse = useCallback(async (courseId) => {
        try {
            await markCourseRejected(courseId);
            setPendingCourses((prev) => prev.filter((course) => course.id !== courseId));
            toast.success('Курс баш тартылган тизмеге жылдырылды');
        } catch {
            toast.error('Курстан баш тартууда ката кетти');
        }
    }, []);

    return {
        handleApprovePendingCourse,
        handleRejectPendingCourse,
        loadPendingCourses,
        pendingCourses,
    };
};

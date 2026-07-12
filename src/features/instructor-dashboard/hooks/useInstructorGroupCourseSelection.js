import { useEffect, useMemo, useState } from 'react';
import {
    findGroupCourseById,
    getNextSelectedGroupCourseId,
    isGroupEligibleCourse,
    selectPendingDeliveryCourses,
} from '@features/instructor-dashboard/utils/groupCourses';

export const useInstructorGroupCourseSelection = ({
    courses = [],
    requestedCourseId = '',
} = {}) => {
    const deliveryCourses = useMemo(
        () => courses.filter(isGroupEligibleCourse),
        [courses]
    );
    const pendingDeliveryCourses = useMemo(
        () => selectPendingDeliveryCourses(courses),
        [courses]
    );
    const [selectedCourseId, setSelectedCourseId] = useState('');

    useEffect(() => {
        const nextCourseId = getNextSelectedGroupCourseId({
            deliveryCourses,
            requestedCourseId,
            selectedCourseId,
        });

        if (String(nextCourseId) !== String(selectedCourseId)) {
            setSelectedCourseId(nextCourseId);
        }
    }, [deliveryCourses, requestedCourseId, selectedCourseId]);

    const selectedCourse = useMemo(
        () => findGroupCourseById(deliveryCourses, selectedCourseId),
        [deliveryCourses, selectedCourseId]
    );

    return {
        deliveryCourses,
        pendingDeliveryCourses,
        selectedCourse,
        selectedCourseId,
        setSelectedCourseId,
    };
};

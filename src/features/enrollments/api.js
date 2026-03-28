import toast from 'react-hot-toast';
import api from '../../shared/api/client';
import { validateManualEnrollmentContext } from './policy';

export const enrollUserInCourse = async (userId, courseId, options = {}) => {
    const { discountPercentage, offeringId, groupId, courseType } = options || {};
    try {
        validateManualEnrollmentContext({ courseType, offeringId, groupId });
        const response = await api.post('/enrollments/enroll', {
            userId: parseInt(userId, 10),
            courseId: parseInt(courseId, 10),
            discountPercentage,
            offeringId,
            groupId: groupId !== undefined && groupId !== null ? parseInt(groupId, 10) : undefined,
        });
        return response.data;
    } catch (error) {
        console.error('Error enrolling user:', error);
        const message =
            error.response?.data?.message || error.message || 'Failed to enroll user in course';
        toast.error(Array.isArray(message) ? message.join(', ') : message);
        throw error;
    }
};

export const unenrollUserFromCourse = async (userId, courseId) => {
    try {
        const response = await api.delete(`/enrollments/${parseInt(courseId, 10)}/unenroll/${parseInt(userId, 10)}`);
        return response.data;
    } catch (error) {
        console.error('Error enrolling user:', error);
        toast.error('Failed to enroll user in course');
        throw error;
    }
};

export const fetchEnrollment = async (courseId, userId) => {
    try {
        const params = { courseId: parseInt(courseId, 10) };
        if (userId) params.userId = parseInt(userId, 10);
        const response = await api.get('/enrollments/check', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        throw error;
    }
};

export const checkEnrollments = async (courseIds, userIds = []) => {
    try {
        const response = await api.post('/enrollments/bulk-check', {
            courseIds: courseIds.map(id => parseInt(id, 10)),
            userIds: userIds.map(id => parseInt(id, 10)),
        });
        return response.data;
    } catch (error) {
        console.error('Error in bulk enrollment check:', error);
        throw error;
    }
};

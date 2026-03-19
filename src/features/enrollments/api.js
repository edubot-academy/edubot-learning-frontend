import toast from 'react-hot-toast';
import api from '../../shared/api/client';

export const enrollUserInCourse = async (userId, courseId, options = {}) => {
    const { discountPercentage, offeringId } = options || {};
    try {
        const response = await api.post('/enrollments/enroll', {
            userId,
            courseId,
            discountPercentage,
            offeringId,
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
        const response = await api.delete(`/enrollments/${courseId}/unenroll/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error enrolling user:', error);
        toast.error('Failed to enroll user in course');
        throw error;
    }
};

export const fetchEnrollment = async (courseId, userId) => {
    try {
        const params = { courseId };
        if (userId) params.userId = userId;

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
            courseIds,
            userIds,
        });
        return response.data;
    } catch (error) {
        console.error('Error in bulk enrollment check:', error);
        throw error;
    }
};

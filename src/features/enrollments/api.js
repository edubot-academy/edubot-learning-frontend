import api from '../../shared/api/client';
import { validateManualEnrollmentContext } from './policy';

const companyScopeConfig = (companyId) => {
    if (companyId === undefined || companyId === null || companyId === '') return undefined;
    return {
        headers: {
            'X-Company-Id': parseInt(companyId, 10),
        },
    };
};

export const enrollUserInCourse = async (userId, courseId, options = {}) => {
    const { companyId, discountPercentage, offeringId, groupId, courseType } = options || {};
    try {
        validateManualEnrollmentContext({ courseType, offeringId, groupId });
        const response = await api.post('/enrollments/enroll', {
            userId: parseInt(userId, 10),
            courseId: parseInt(courseId, 10),
            discountPercentage,
            offeringId,
            groupId: groupId !== undefined && groupId !== null ? parseInt(groupId, 10) : undefined,
        }, companyScopeConfig(companyId));
        return response.data;
    } catch (error) {
        console.error('Error enrolling user:', error);
        throw error;
    }
};

export const unenrollUserFromCourse = async (userId, courseId, options = {}) => {
    try {
        const response = await api.delete(
            `/enrollments/${parseInt(courseId, 10)}/unenroll/${parseInt(userId, 10)}`,
            companyScopeConfig(options?.companyId)
        );
        return response.data;
    } catch (error) {
        console.error('Error enrolling user:', error);
        throw error;
    }
};

export const fetchEnrollment = async (courseId, userId, options = {}) => {
    try {
        const params = { courseId: parseInt(courseId, 10) };
        if (userId) params.userId = parseInt(userId, 10);
        const response = await api.get('/enrollments/check', {
            ...companyScopeConfig(options?.companyId),
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        throw error;
    }
};

export const checkEnrollments = async (courseIds, userIds = [], options = {}) => {
    try {
        const response = await api.post('/enrollments/bulk-check', {
            courseIds: courseIds.map(id => parseInt(id, 10)),
            userIds: userIds.map(id => parseInt(id, 10)),
        }, companyScopeConfig(options?.companyId));
        return response.data;
    } catch (error) {
        console.error('Error in bulk enrollment check:', error);
        throw error;
    }
};

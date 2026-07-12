import api, { clean } from '@shared/api/client';
export { fetchCourseStudents } from './courseStudents';

export const fetchInstructorStudentCourses = async () => {
    const response = await api.get('/courses/instructor/my-students');
    return response.data;
};

export const fetchInstructorCourses = async ({
    page = 1,
    limit = 20,
    q = '',
    status = 'all',
    courseType = 'all',
} = {}) => {
    const params = clean({
        page,
        limit,
        q: q || undefined,
        status: status === 'all' ? undefined : status,
        courseType: courseType === 'all' ? undefined : courseType,
    });
    const response = await api.get('/courses/instructor/my-courses', { params });
    return response.data;
};

import { fetchCourseGroupStudents } from './api';
import { toArray } from '@shared/api/response';

export const toCourseStudentRows = (payload) => {
    if (Array.isArray(payload?.students)) return payload.students;
    return toArray(payload);
};

export const fetchGroupRoster = async ({ groupId, page = 1, limit = 200, ...rest }) => {
    const response = await fetchCourseGroupStudents(Number(groupId), { page, limit, ...rest });
    return toCourseStudentRows(response);
};

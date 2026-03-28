import { fetchCourseGroupStudents } from './api';

export const toCourseStudentRows = (payload) => {
    if (Array.isArray(payload?.students)) return payload.students;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

export const fetchGroupRoster = async ({ groupId, page = 1, limit = 200, ...rest }) => {
    const response = await fetchCourseGroupStudents(Number(groupId), { page, limit, ...rest });
    return toCourseStudentRows(response);
};

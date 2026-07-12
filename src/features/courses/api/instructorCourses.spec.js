import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    fetchInstructorCourses,
    fetchInstructorStudentCourses,
} from './instructorCourses';
import api from '@shared/api/client';

vi.mock('@shared/api/client', () => {
    const clean = (obj) =>
        Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== null));

    return {
        default: {
            get: vi.fn(),
        },
        clean,
    };
});

describe('instructor course API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches instructor student courses', async () => {
        api.get.mockResolvedValueOnce({ data: { courses: [{ id: 1 }] } });

        await expect(fetchInstructorStudentCourses()).resolves.toEqual({
            courses: [{ id: 1 }],
        });

        expect(api.get).toHaveBeenCalledWith('/courses/instructor/my-students');
    });

    it('omits all-filter params when fetching instructor courses', async () => {
        api.get.mockResolvedValueOnce({ data: { courses: [] } });

        await fetchInstructorCourses({
            page: 2,
            limit: 50,
            q: '',
            status: 'all',
            courseType: 'all',
        });

        expect(api.get).toHaveBeenCalledWith('/courses/instructor/my-courses', {
            params: {
                page: 2,
                limit: 50,
            },
        });
    });

    it('passes instructor course filters when present', async () => {
        api.get.mockResolvedValueOnce({ data: { courses: [] } });

        await fetchInstructorCourses({
            q: 'react',
            status: 'approved',
            courseType: 'offline',
        });

        expect(api.get).toHaveBeenCalledWith('/courses/instructor/my-courses', {
            params: {
                page: 1,
                limit: 20,
                q: 'react',
                status: 'approved',
                courseType: 'offline',
            },
        });
    });

});

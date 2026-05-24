import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../shared/api/client';
import {
    checkEnrollments,
    enrollUserInCourse,
    fetchEnrollment,
    unenrollUserFromCourse,
} from './api';

vi.mock('../../shared/api/client', () => ({
    default: {
        delete: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('enrollment API tenant scope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.delete.mockResolvedValue({ data: { ok: true } });
        api.get.mockResolvedValue({ data: { ok: true } });
        api.post.mockResolvedValue({ data: { ok: true } });
    });

    it('sends explicit company scope for tenant enrollment mutations', async () => {
        await enrollUserInCourse(22, 101, {
            companyId: '42',
            courseType: 'video',
        });

        expect(api.post).toHaveBeenCalledWith(
            '/enrollments/enroll',
            expect.objectContaining({ courseId: 101, userId: 22 }),
            { headers: { 'X-Company-Id': 42 } }
        );
    });

    it('sends explicit company scope for tenant unenrollment mutations', async () => {
        await unenrollUserFromCourse(22, 101, { companyId: 42 });

        expect(api.delete).toHaveBeenCalledWith(
            '/enrollments/101/unenroll/22',
            { headers: { 'X-Company-Id': 42 } }
        );
    });

    it('sends explicit company scope for enrollment checks', async () => {
        await fetchEnrollment(101, 22, { companyId: 42 });

        expect(api.get).toHaveBeenCalledWith('/enrollments/check', {
            headers: { 'X-Company-Id': 42 },
            params: { courseId: 101, userId: 22 },
        });
    });

    it('sends explicit company scope for bulk enrollment checks', async () => {
        await checkEnrollments([101], [22], { companyId: 42 });

        expect(api.post).toHaveBeenCalledWith(
            '/enrollments/bulk-check',
            { courseIds: [101], userIds: [22] },
            { headers: { 'X-Company-Id': 42 } }
        );
    });
});

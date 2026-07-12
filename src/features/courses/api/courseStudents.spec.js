import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCourseStudents } from './courseStudents';
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

describe('course students API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches course students with optional filters', async () => {
        api.get.mockResolvedValueOnce({ data: { students: [{ id: 3 }] } });

        await expect(
            fetchCourseStudents(10, {
                page: 3,
                limit: 25,
                q: 'ada',
                progressGte: 20,
                progressLte: 90,
            })
        ).resolves.toEqual({ students: [{ id: 3 }] });

        expect(api.get).toHaveBeenCalledWith('/courses/10/students', {
            params: {
                page: 3,
                limit: 25,
                q: 'ada',
                progressGte: 20,
                progressLte: 90,
            },
        });
    });
});

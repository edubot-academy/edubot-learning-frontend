import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../shared/api/client';
import {
    fetchAdminCoursePopularityAnalytics,
    fetchAdminOverviewAnalytics,
} from './api';

vi.mock('../../shared/api/client', () => ({
    clean: (obj) => Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined && value !== null)
    ),
    default: {
        get: vi.fn(),
    },
}));

describe('analytics API tenant scope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.get.mockResolvedValue({ data: { ok: true } });
    });

    it('preserves companyId for simplified admin analytics filters', async () => {
        await fetchAdminOverviewAnalytics({ companyId: '42' });

        expect(api.get).toHaveBeenCalledWith('/analytics/admin/overview', {
            params: { companyId: 42 },
        });
    });

    it('preserves companyId for legacy admin analytics filters', async () => {
        await fetchAdminCoursePopularityAnalytics({ companyId: 42, courseId: 101 });

        expect(api.get).toHaveBeenCalledWith('/analytics/admin/course-popularity', {
            params: { companyId: 42, courseId: 101 },
        });
    });
});

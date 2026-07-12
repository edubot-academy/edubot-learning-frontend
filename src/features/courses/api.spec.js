import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import api from '@shared/api/client';
import { uploadLessonFile } from './api';

vi.mock('axios', () => ({
    default: {
        put: vi.fn(),
    },
}));

vi.mock('@shared/api/client', () => {
    const clean = (obj) =>
        Object.fromEntries(
            Object.entries(obj).filter(([, value]) => value !== undefined && value !== null)
        );

    return {
        default: {
            delete: vi.fn(),
            get: vi.fn(),
            patch: vi.fn(),
            post: vi.fn(),
        },
        clean,
    };
});

vi.mock('@shared/contracts', () => ({
    COURSE_TYPE: {
        OFFLINE: 'offline',
        ONLINE_LIVE: 'online_live',
        VIDEO: 'video',
    },
}));

vi.mock('../../i18n', () => ({
    default: {
        t: (key) => key,
    },
}));

vi.mock('@shared/api/error', () => ({
    parseApiError: (error, fallback) => ({
        message: error?.message || fallback,
    }),
}));

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('course API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uploads lesson files through a presigned URL', async () => {
        const file = new File(['video'], 'Lesson.MP4', { type: 'video/mp4' });
        const onProgress = vi.fn();
        api.get.mockResolvedValueOnce({
            data: {
                key: 'lessons/1/video.mp4',
                maxFileSize: 1024,
                url: 'https://uploads.example/video',
            },
        });
        axios.put.mockImplementationOnce(async (_url, _file, options) => {
            options.onUploadProgress({ loaded: 75, total: 100 });
            return {};
        });

        await expect(uploadLessonFile(10, 20, 'video', file, 3, onProgress)).resolves.toBe(
            'lessons/1/video.mp4'
        );

        expect(api.get).toHaveBeenCalledWith('/courses/10/sections/20/lessons/upload-url', {
            params: {
                extension: 'mp4',
                lessonOrder: 3,
                type: 'video',
            },
        });
        expect(axios.put).toHaveBeenCalledWith(
            'https://uploads.example/video',
            file,
            expect.objectContaining({
                headers: { 'Content-Type': 'video/mp4' },
                maxBodyLength: Infinity,
            })
        );
        expect(onProgress).toHaveBeenCalledWith(75);
    });

    it('rejects lesson files without supported extensions before requesting upload URLs', async () => {
        const file = new File(['text'], 'notes.txt', { type: 'text/plain' });

        await expect(uploadLessonFile(10, 20, 'document', file, 1)).rejects.toThrow(
            'Unsupported file type: .txt'
        );

        expect(api.get).not.toHaveBeenCalled();
        expect(axios.put).not.toHaveBeenCalled();
    });
});

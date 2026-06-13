import { describe, expect, it } from 'vitest';

import { buildLessonPayload, handleLessonKindChange, resolveLessonVideoKey } from './lessonUtils';

describe('lessonUtils video state normalization', () => {
    it('resolves edit-mode video keys from backend lesson fields', () => {
        expect(resolveLessonVideoKey({ sourceVideoKey: 'source-key' })).toBe('source-key');
        expect(resolveLessonVideoKey({ playbackKey: 'playback-key' })).toBe('');
        expect(resolveLessonVideoKey({ videoKey: 'video-key', sourceVideoKey: 'source-key' })).toBe('video-key');
    });

    it('builds video lesson payloads with normalized source video key', () => {
        expect(buildLessonPayload({
            title: 'Lesson 1',
            kind: 'video',
            sourceVideoKey: 'source-key',
            playbackStatus: 'ready',
            playbackType: 'hls',
            resourceKey: 'resource-key',
            previewVideo: true,
            duration: 120,
        }, 0)).toMatchObject({
            title: 'Lesson 1',
            kind: 'video',
            videoKey: 'source-key',
            sourceVideoKey: 'source-key',
            order: 0,
        });
    });

    it('does not echo backend-owned playback fields for video lesson updates', () => {
        expect(buildLessonPayload({
            title: 'Lesson 1',
            kind: 'video',
            sourceVideoKey: 'source-key',
            playbackKey: 'playback-key',
            playbackStatus: 'ready',
            playbackType: 'hls',
        }, 0)).toMatchObject({
            videoKey: 'source-key',
            sourceVideoKey: 'source-key',
            playbackKey: undefined,
            playbackStatus: undefined,
            playbackType: undefined,
        });
    });

    it('clears backend-managed video state when switching away from video', () => {
        expect(handleLessonKindChange({
            title: 'Lesson 1',
            kind: 'video',
            videoKey: 'video-key',
            sourceVideoKey: 'source-key',
            playbackKey: 'playback-key',
            playbackStatus: 'ready',
            playbackType: 'hls',
            playbackUrl: 'https://cdn.example.com/master.m3u8',
            transcodingJobId: 'job-1',
        }, 'quiz')).toMatchObject({
            kind: 'quiz',
            videoKey: '',
            sourceVideoKey: null,
            playbackKey: null,
            playbackStatus: null,
            playbackType: null,
            playbackUrl: null,
            transcodingJobId: null,
        });
    });
});

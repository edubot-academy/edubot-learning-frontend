import { describe, expect, it } from 'vitest';
import { getPlayableVideoUrl, isHlsPlayback } from './videoUtils';

describe('videoUtils', () => {
    it('prioritizes ready HLS playback URLs over original uploads', () => {
        expect(
            getPlayableVideoUrl({
                playbackUrl: 'https://cdn.example.com/lesson/master.m3u8',
                playbackStatus: 'ready',
                playbackType: 'hls',
                videoUrl: 'https://cdn.example.com/lesson/original.mp4',
            })
        ).toBe('https://cdn.example.com/lesson/master.m3u8');
    });

    it('uses playback URLs unless the transcode status is explicitly unavailable', () => {
        expect(
            getPlayableVideoUrl({
                playbackUrl: 'https://cdn.example.com/lesson/master.m3u8',
                playbackStatus: 'completed',
                playbackType: 'hls',
                videoUrl: 'https://cdn.example.com/lesson/original.mp4',
            })
        ).toBe('https://cdn.example.com/lesson/master.m3u8');
    });

    it('falls back to original video while transcoding is not playable', () => {
        expect(
            getPlayableVideoUrl({
                playbackUrl: 'https://cdn.example.com/lesson/master.m3u8',
                playbackStatus: 'processing',
                playbackType: 'hls',
                videoUrl: 'https://cdn.example.com/lesson/original.mp4',
            })
        ).toBe('https://cdn.example.com/lesson/original.mp4');
    });

    it('detects HLS URLs with query strings', () => {
        expect(isHlsPlayback('https://cdn.example.com/lesson/master.m3u8?token=abc')).toBe(true);
    });
});

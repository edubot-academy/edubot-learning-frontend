import { describe, expect, it, vi } from 'vitest';
import {
    buildQualityOptions,
    canRecoverHlsError,
    createHlsRecoveryState,
    getAutoQualityOption,
    incrementHlsRecovery,
    isHlsUrl,
    resolveVideoFitMode,
} from './videoPlayer';

const t = vi.fn((key) => key);

describe('video player utilities', () => {
    it('detects HLS URLs across absolute, relative, and query-string URLs', () => {
        expect(isHlsUrl('https://cdn.example.com/video/master.m3u8')).toBe(true);
        expect(isHlsUrl('/media/master.m3u8?token=abc', 'https://app.example.com')).toBe(true);
        expect(isHlsUrl('video.M3U8#playlist')).toBe(true);
        expect(isHlsUrl('https://cdn.example.com/video.mp4')).toBe(false);
        expect(isHlsUrl(null)).toBe(false);
    });

    it('builds stable quality options with duplicate height labels disambiguated', () => {
        expect(buildQualityOptions([{ height: 720 }, { height: 720 }, {}], t)).toEqual([
            getAutoQualityOption(t),
            { id: '0', label: '720p' },
            { id: '1', label: '720p (2)' },
            { id: '2', label: 'Level 3' },
        ]);
    });

    it('falls back to contain for invalid fit modes', () => {
        expect(resolveVideoFitMode('cover')).toBe('cover');
        expect(resolveVideoFitMode('crop')).toBe('crop');
        expect(resolveVideoFitMode('stretch')).toBe('contain');
    });

    it('tracks HLS recovery limits without mutating unrelated counters', () => {
        const errorTypes = {
            NETWORK_ERROR: 'networkError',
            MEDIA_ERROR: 'mediaError',
        };
        const recovery = createHlsRecoveryState();

        expect(canRecoverHlsError(recovery, errorTypes.NETWORK_ERROR, errorTypes)).toBe(true);
        incrementHlsRecovery(recovery, errorTypes.NETWORK_ERROR, errorTypes);
        incrementHlsRecovery(recovery, errorTypes.NETWORK_ERROR, errorTypes);
        expect(canRecoverHlsError(recovery, errorTypes.NETWORK_ERROR, errorTypes)).toBe(false);
        expect(canRecoverHlsError(recovery, errorTypes.MEDIA_ERROR, errorTypes)).toBe(true);
        expect(recovery).toEqual({ network: 2, media: 0 });
    });
});

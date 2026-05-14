export const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration); // duration in seconds
        };

        video.onerror = () => {
            reject(new Error('Failed to load video metadata'));
        };

        video.src = URL.createObjectURL(file);
    });
};

const BLOCKED_PLAYBACK_STATUSES = new Set(['missing', 'uploaded', 'starting', 'processing', 'failed']);

const hasPlayablePlaybackUrl = (item) =>
    Boolean(
        item?.playbackUrl &&
        !BLOCKED_PLAYBACK_STATUSES.has(String(item.playbackStatus || '').toLowerCase())
    );

export const getPlayableVideoUrl = (item) => {
    if (!item) return null;
    if (hasPlayablePlaybackUrl(item)) {
        return item.playbackUrl;
    }
    if (item.videoUrl) return item.videoUrl;
    if (item.previewUrl) return item.previewUrl;
    if (item.previewVideo && typeof item.previewVideo === 'string') return item.previewVideo;
    if (hasPlayablePlaybackUrl(item.previewVideo)) {
        return item.previewVideo.playbackUrl;
    }
    if (item.previewVideo?.videoUrl) return item.previewVideo.videoUrl;
    if (hasPlayablePlaybackUrl(item.previewVideos?.[0])) {
        return item.previewVideos[0].playbackUrl;
    }
    if (item.previewVideos?.[0]?.videoUrl) return item.previewVideos[0].videoUrl;
    return null;
};

export const getPlaybackStatus = (item) => item?.playbackStatus || (getPlayableVideoUrl(item) ? 'ready' : 'missing');

export const isHlsPlayback = (url) => String(url || '').toLowerCase().includes('.m3u8');

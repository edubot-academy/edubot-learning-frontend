export const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration); // duration in seconds
        };

        video.onerror = (err) => {
            reject(new Error('Failed to load video metadata'));
        };

        video.src = URL.createObjectURL(file);
    });
};

export const getPlayableVideoUrl = (item) => {
    if (!item) return null;
    const playbackStatus = item.playbackStatus;
    if (item.playbackUrl && (!playbackStatus || playbackStatus === 'ready')) {
        return item.playbackUrl;
    }
    if (item.videoUrl) return item.videoUrl;
    if (item.previewUrl) return item.previewUrl;
    if (item.previewVideo && typeof item.previewVideo === 'string') return item.previewVideo;
    if (
        item.previewVideo?.playbackUrl &&
        (!item.previewVideo?.playbackStatus ||
            item.previewVideo.playbackStatus === 'ready')
    ) {
        return item.previewVideo.playbackUrl;
    }
    if (item.previewVideo?.videoUrl) return item.previewVideo.videoUrl;
    if (
        item.previewVideos?.[0]?.playbackUrl &&
        (!item.previewVideos[0]?.playbackStatus ||
            item.previewVideos[0].playbackStatus === 'ready')
    ) {
        return item.previewVideos[0].playbackUrl;
    }
    if (item.previewVideos?.[0]?.videoUrl) return item.previewVideos[0].videoUrl;
    return null;
};

export const getPlaybackStatus = (item) => item?.playbackStatus || (getPlayableVideoUrl(item) ? 'ready' : 'missing');

export const isHlsPlayback = (url) => String(url || '').toLowerCase().includes('.m3u8');

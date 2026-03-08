import { fetchMediaStatus } from '@services/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function pollMediaStatus(key, { interval = 3000, maxAttempts = 20, onUpdate } = {}) {
    let attempt = 0;
    let last;

    while (attempt < maxAttempts) {
        try {
            const status = await fetchMediaStatus(key);
            last = status;
            onUpdate?.(status);

            const mediaStatus = status?.mediaStatus || status?.status || status?.state;
            const mediaReady =
                status?.mediaReady ?? mediaStatus === 'ready' ?? mediaStatus === 'completed';

            if (mediaReady || mediaStatus === 'failed') {
                return { ...status, mediaStatus, mediaReady: Boolean(mediaReady) };
            }
        } catch (error) {
            console.error('Failed to poll media status', error);
            if (attempt > 1) {
                // Only break after a couple of attempts to reduce flakiness
                break;
            }
        }

        attempt += 1;
        await sleep(interval);
    }

    return {
        ...(last || {}),
        mediaStatus: last?.mediaStatus || last?.status || 'timeout',
        mediaReady: false,
    };
}

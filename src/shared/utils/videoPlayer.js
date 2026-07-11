export const HLS_RECOVERY_LIMITS = Object.freeze({
    network: 2,
    media: 2,
});

export const isHlsUrl = (url, baseUrl) => {
    if (!url) return false;

    try {
        return new URL(url, baseUrl).pathname.toLowerCase().endsWith('.m3u8');
    } catch {
        return String(url).toLowerCase().split(/[?#]/)[0].endsWith('.m3u8');
    }
};

export const getAutoQualityOption = (t) => ({ id: 'auto', label: t('videoPlayer.autoQuality') });

export const buildQualityOptions = (levels = [], t) => {
    const seenLabels = new Map();

    return [
        getAutoQualityOption(t),
        ...levels.map((level, index) => {
            const baseLabel = level.height ? `${level.height}p` : `Level ${index + 1}`;
            const count = seenLabels.get(baseLabel) || 0;
            seenLabels.set(baseLabel, count + 1);

            return {
                id: `${index}`,
                label: count > 0 ? `${baseLabel} (${count + 1})` : baseLabel,
            };
        }),
    ];
};

export const resolveVideoFitMode = (fitMode) =>
    ['contain', 'cover', 'crop'].includes(fitMode) ? fitMode : 'contain';

export const createHlsRecoveryState = () => ({ network: 0, media: 0 });

export const canRecoverHlsError = (recoveryState, type, errorTypes) => {
    if (type === errorTypes.NETWORK_ERROR) {
        return recoveryState.network < HLS_RECOVERY_LIMITS.network;
    }

    if (type === errorTypes.MEDIA_ERROR) {
        return recoveryState.media < HLS_RECOVERY_LIMITS.media;
    }

    return false;
};

export const incrementHlsRecovery = (recoveryState, type, errorTypes) => {
    if (type === errorTypes.NETWORK_ERROR) {
        recoveryState.network += 1;
        return;
    }

    if (type === errorTypes.MEDIA_ERROR) {
        recoveryState.media += 1;
    }
};

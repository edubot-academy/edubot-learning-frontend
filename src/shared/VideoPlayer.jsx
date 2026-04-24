import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import VideoPlayerUI from './ui/Play.jsx';
import VideoErrorBoundary from './VideoErrorBoundary.jsx';
import toast from 'react-hot-toast';
import Hls from 'hls.js';

const MAX_HLS_NETWORK_RECOVERIES = 2;
const MAX_HLS_MEDIA_RECOVERIES = 2;

const getStoredAuthToken = () => {
    try {
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
};

const VideoPlayerInner = ({
    videoUrl,
    videoRef: externalVideoRef,
    resumeTime,
    onProgress,
    onTimeUpdate,
    onPause,
    allowPlay = true,
    containerRef,
    onEnded,
    autoPlay = false,
}) => {
    const hlsRef = useRef(null);
    const internalVideoRef = useRef(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [qualityOptions, setQualityOptions] = useState([{ id: 'auto', label: 'Auto' }]);
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [reloadToken, setReloadToken] = useState(0);
    const hlsRecoveryRef = useRef({ network: 0, media: 0 });
    const lastAppliedResumeTimeRef = useRef(null);

    const setVideoRef = useCallback(
        (node) => {
            internalVideoRef.current = node;

            if (!externalVideoRef) return;

            if (typeof externalVideoRef === 'function') {
                externalVideoRef(node);
                return;
            }

            externalVideoRef.current = node;
        },
        [externalVideoRef]
    );

    const handleQualityChange = useCallback((id) => {
        if (!hlsRef.current) return;
        hlsRef.current.currentLevel = id === 'auto' ? -1 : Number(id);
        setCurrentQuality(id);
    }, []);

    const retryLoad = useCallback(() => {
        setHasError(false);
        setIsLoading(true);
        // Use setTimeout to prevent rapid retries
        setTimeout(() => {
            setReloadToken((current) => current + 1);
        }, 100);
    }, []);

    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl || !videoUrl) {
            // Clean up if videoUrl becomes null/undefined
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            return;
        }

        // Abort controller for cleanup
        const abortController = new AbortController();
        const signal = abortController.signal;

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();

        if (signal.aborted) return;

        setHasError(false);
        setIsLoading(true);
        setCurrentQuality('auto');
        setQualityOptions([{ id: 'auto', label: 'Auto' }]);
        hlsRecoveryRef.current = { network: 0, media: 0 };
        lastAppliedResumeTimeRef.current = null;

        const isHlsSource = videoUrl.includes('.m3u8');
        const tryAutoPlay = () => {
            if (!autoPlay || !allowPlay || signal.aborted) return;
            videoEl.play().catch(() => undefined);
        };
        const failPlayback = () => {
            if (signal.aborted) return;
            setHasError(true);
            setIsLoading(false);
            toast.error('Тилекке каршы, видео ойнотулбай калды.');
        };

        let hls = null;

        if (isHlsSource && Hls.isSupported()) {
            hls = new Hls({
                xhrSetup: (xhr) => {
                    xhr.withCredentials = true;
                    const token = getStoredAuthToken();
                    if (token) {
                        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    }
                },
            });
            hlsRef.current = hls;

            // Error handler with cleanup on fatal errors
            const handleError = (_, data) => {
                if (signal.aborted) return;

                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        if (hlsRecoveryRef.current.network >= MAX_HLS_NETWORK_RECOVERIES) {
                            failPlayback();
                            return;
                        }
                        hlsRecoveryRef.current.network += 1;
                        hls.startLoad();
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        if (hlsRecoveryRef.current.media >= MAX_HLS_MEDIA_RECOVERIES) {
                            failPlayback();
                            return;
                        }
                        hlsRecoveryRef.current.media += 1;
                        hls.recoverMediaError();
                        return;
                    }

                    failPlayback();
                }
            };

            hls.on(Hls.Events.ERROR, handleError);

            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                if (signal.aborted) return;
                const levels = data.levels || [];
                setQualityOptions([
                    { id: 'auto', label: 'Auto' },
                    ...levels.map((lvl, i) => ({ id: `${i}`, label: `${lvl.height}p` })),
                ]);
                tryAutoPlay();
            });

            hls.loadSource(videoUrl);
            hls.attachMedia(videoEl);
        } else if (isHlsSource && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari, iOS) - use native player
            videoEl.src = videoUrl;
            videoEl.load();
            tryAutoPlay();
        } else if (isHlsSource) {
            // HLS source but no HLS support - show error with fallback message
            failPlayback();
            toast.error('Браузер HLS форматын колдобойт. MP4 форматындагы видеону колдонууңузду суранабыз.');
        } else {
            // MP4 or other native format
            videoEl.src = videoUrl;
            videoEl.load();
            tryAutoPlay();
        }

        return () => {
            abortController.abort();

            if (hls) {
                hls.destroy();
                hlsRef.current = null;
            }

            if (videoEl) {
                videoEl.pause();
                videoEl.removeAttribute('src');
                videoEl.load();
            }
        };
    }, [allowPlay, autoPlay, reloadToken, videoUrl]);

    useEffect(() => {
        const video = internalVideoRef.current;
        if (!video) return;

        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);

        // Debounced timeupdate to reduce re-renders (100ms delay)
        let debounceTimer = null;
        const handleTimeProgress = () => {
            if (!Number.isFinite(video.duration) || video.duration <= 0) return;

            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                onProgress?.(video.currentTime / video.duration);
                onTimeUpdate?.(video.currentTime);
            }, 100);
        };

        const handleEnded = () => onEnded?.();

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('timeupdate', handleTimeProgress);
        video.addEventListener('ended', handleEnded);

        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('timeupdate', handleTimeProgress);
            video.removeEventListener('ended', handleEnded);
        };
    }, [onEnded, onProgress, onTimeUpdate]);

    useEffect(() => {
        const v = internalVideoRef.current;
        if (!v || resumeTime == null) return;
        if (
            lastAppliedResumeTimeRef.current != null &&
            Math.abs(lastAppliedResumeTimeRef.current - resumeTime) < 0.5
        ) {
            return;
        }

        const applyTime = () => {
            lastAppliedResumeTimeRef.current = resumeTime;
            v.currentTime = resumeTime;
        };

        if (v.readyState >= 1) applyTime();
        else v.addEventListener('loadedmetadata', applyTime, { once: true });
    }, [resumeTime]);

    useEffect(() => {
        const v = internalVideoRef.current;
        if (!v) return;

        const onPauseInternal = () => {
            onPause?.(v.currentTime, v.duration);
        };

        v.addEventListener('pause', onPauseInternal);
        return () => v.removeEventListener('pause', onPauseInternal);
    }, [onPause]);

    return (
        <div className="playerBox relative w-full aspect-video bg-black rounded-xl overflow-hidden">
            {allowPlay && !hasError && (
                <video
                    ref={setVideoRef}
                    className="absolute inset-0 w-full h-full object-contain"
                    preload="metadata"
                    playsInline
                    aria-label="Видео окуу"
                    aria-describedby="video-description"
                    controlsList="nodownload"
                    onError={() => {
                        setHasError(true);
                        setIsLoading(false);
                    }}
                />
            )}

            {isLoading && allowPlay && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="w-12 h-12 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin" />
                </div>
            )}

            {!allowPlay && (
                <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center text-white">
                    Видео табылган жок
                </div>
            )}

            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 text-white">
                    <p>Видео жүктөлбөй калды.</p>
                    <button
                        className="mt-4 px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
                        onClick={retryLoad}
                    >
                        Кайра аракет кылуу
                    </button>
                </div>
            )}

            {!hasError && allowPlay && (
                <VideoPlayerUI
                    videoRef={internalVideoRef}
                    containerRef={containerRef}
                    allowPlay={allowPlay}
                    onProgress={onProgress}
                    onTimeUpdate={onTimeUpdate}
                    onPause={onPause}
                    onEnded={onEnded}
                    qualityOptions={qualityOptions}
                    currentQuality={currentQuality}
                    onQualityChange={handleQualityChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

/**
 * VideoPlayer with Error Boundary wrapper.
 * Catches JavaScript errors and displays fallback UI.
 */
const VideoPlayer = (props) => (
    <VideoErrorBoundary>
        <VideoPlayerInner {...props} />
    </VideoErrorBoundary>
);

VideoPlayerInner.propTypes = {
    videoUrl: PropTypes.string,
    videoRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
    resumeTime: PropTypes.number,
    onProgress: PropTypes.func,
    onTimeUpdate: PropTypes.func,
    onPause: PropTypes.func,
    allowPlay: PropTypes.bool,
    containerRef: PropTypes.shape({ current: PropTypes.any }),
    onEnded: PropTypes.func,
    autoPlay: PropTypes.bool,
};

VideoPlayerInner.defaultProps = {
    videoUrl: null,
    videoRef: null,
    resumeTime: null,
    onProgress: null,
    onTimeUpdate: null,
    onPause: null,
    allowPlay: true,
    containerRef: null,
    onEnded: null,
    autoPlay: false,
};

export default VideoPlayer;

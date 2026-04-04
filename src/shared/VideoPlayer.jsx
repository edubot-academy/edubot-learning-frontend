import { useEffect, useRef, useState, useCallback } from 'react';
import VideoPlayerUI from './ui/Play.jsx';
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

const VideoPlayer = ({
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
        setReloadToken((current) => current + 1);
    }, []);

    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl || !videoUrl) return;

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
        setHasError(false);
        setIsLoading(true);
        setCurrentQuality('auto');
        setQualityOptions([{ id: 'auto', label: 'Auto' }]);
        hlsRecoveryRef.current = { network: 0, media: 0 };
        lastAppliedResumeTimeRef.current = null;

        const isHlsSource = videoUrl.includes('.m3u8');
        const tryAutoPlay = () => {
            if (!autoPlay || !allowPlay) return;
            videoEl.play().catch(() => undefined);
        };
        const failPlayback = () => {
            setHasError(true);
            setIsLoading(false);
            toast.error('Тилекке каршы, видео ойнотулбай калды.');
        };

        if (isHlsSource && Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: (xhr) => {
                    xhr.withCredentials = true;
                    const token = getStoredAuthToken();
                    if (token) {
                        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    }
                },
            });
            hlsRef.current = hls;

            hls.loadSource(videoUrl);
            hls.attachMedia(videoEl);

            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                const levels = data.levels || [];
                setQualityOptions([
                    { id: 'auto', label: 'Auto' },
                    ...levels.map((lvl, i) => ({ id: `${i}`, label: `${lvl.height}p` })),
                ]);
                tryAutoPlay();
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        if (
                            hlsRecoveryRef.current.network >=
                            MAX_HLS_NETWORK_RECOVERIES
                        ) {
                            failPlayback();
                            return;
                        }

                        hlsRecoveryRef.current.network += 1;
                        hls.startLoad();
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        if (
                            hlsRecoveryRef.current.media >=
                            MAX_HLS_MEDIA_RECOVERIES
                        ) {
                            failPlayback();
                            return;
                        }

                        hlsRecoveryRef.current.media += 1;
                        hls.recoverMediaError();
                        return;
                    }

                    failPlayback();
                }
            });

            return () => {
                hls.destroy();
                hlsRef.current = null;
            };
        } else {
            videoEl.src = videoUrl;
            videoEl.load();
            tryAutoPlay();
        }
    }, [allowPlay, autoPlay, reloadToken, videoUrl]);

    useEffect(() => {
        const video = internalVideoRef.current;
        if (!video) return;

        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);
        const handleTimeProgress = () => {
            if (!Number.isFinite(video.duration) || video.duration <= 0) return;
            onProgress?.(video.currentTime / video.duration);
        };
        const handleEnded = () => onEnded?.();

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('timeupdate', handleTimeProgress);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('timeupdate', handleTimeProgress);
            video.removeEventListener('ended', handleEnded);
        };
    }, [onEnded, onProgress]);

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

            {!hasError && allowPlay && !isLoading && (
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
                />
            )}
        </div>
    );
};

export default VideoPlayer;

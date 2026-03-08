import { useEffect, useRef, useState, useCallback } from 'react';
import VideoPlayerUI from './ui/Play.jsx';
import toast from 'react-hot-toast';
import Hls from 'hls.js';

const VideoPlayer = ({
    videoUrl,
    resumeTime,
    onProgress,
    onTimeUpdate,
    onPause,
    allowPlay = true,
    blockedMessage = 'Видео табылган жок',
    containerRef,
    onEnded,
    subtitleTracks = [],
    onRequestRefresh,
}) => {
    const hlsRef = useRef(null);
    const videoRef = useRef(null);
    const refreshAttemptedRef = useRef(false);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [qualityOptions, setQualityOptions] = useState([{ id: 'auto', label: 'Auto' }]);
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [sourceUrl, setSourceUrl] = useState(videoUrl);
    const [reloadToken, setReloadToken] = useState(0);

    const handleQualityChange = useCallback((id) => {
        if (!hlsRef.current) return;
        hlsRef.current.currentLevel = id === 'auto' ? -1 : Number(id);
        setCurrentQuality(id);
    }, []);

    const retryLoad = useCallback(() => {
        setHasError(false);
        setIsLoading(true);
        refreshAttemptedRef.current = false;
        setReloadToken(Date.now());
    }, []);

    useEffect(() => {
        setSourceUrl(videoUrl);
        refreshAttemptedRef.current = false;
    }, [videoUrl]);

    useEffect(() => {
        refreshAttemptedRef.current = false;
    }, [sourceUrl]);

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || !sourceUrl) return;

        if (!allowPlay) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            return;
        }

        setHasError(false);
        setIsLoading(true);
        setQualityOptions([{ id: 'auto', label: 'Auto' }]);
        setCurrentQuality('auto');

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
        setIsLoading(true);

        const isHlsSource = sourceUrl.includes('.m3u8');

        if (isHlsSource && Hls.isSupported()) {
            const hls = new Hls({ startLevel: -1 });
            hlsRef.current = hls;

            hls.loadSource(sourceUrl);
            hls.attachMedia(videoEl);

            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                const levels = data.levels || [];
                const startLevel = levels.length > 1 ? Math.max(0, Math.floor((levels.length - 1) / 2)) : 0;
                hls.currentLevel = startLevel;
                hls.nextAutoLevel = startLevel;
                setQualityOptions([
                    { id: 'auto', label: 'Auto' },
                    ...levels.map((lvl, i) => ({ id: `${i}`, label: `${lvl.height}p` })),
                ]);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    const status = data?.response?.code || data?.response?.status;
                    const shouldRetry = status === 403 && onRequestRefresh && !refreshAttemptedRef.current;

                    if (shouldRetry) {
                        refreshAttemptedRef.current = true;
                        onRequestRefresh()
                            .then((nextUrl) => {
                                if (nextUrl) {
                                    setSourceUrl(nextUrl);
                                    setReloadToken(Date.now());
                                } else {
                                    setHasError(true);
                                    setIsLoading(false);
                                }
                            })
                            .catch(() => {
                                setHasError(true);
                                setIsLoading(false);
                            });
                        return;
                    }

                    setHasError(true);
                    setIsLoading(false);
                    toast.error('Тилекке каршы, видео ойнотулбай калды.');
                }
            });

            return () => {
                hls.destroy();
                hlsRef.current = null;
            };
        } else {
            videoEl.src = sourceUrl;
            videoEl.load();
        }
    }, [sourceUrl, allowPlay, videoRef, setIsLoading, setHasError, reloadToken, onRequestRefresh]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('waiting', handleWaiting);

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('waiting', handleWaiting);
        };
    }, [videoRef]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || resumeTime == null) return;

        const applyTime = () => {
            v.currentTime = resumeTime;
        };

        if (v.readyState >= 1) applyTime();
        else v.addEventListener('loadedmetadata', applyTime, { once: true });
    }, [resumeTime]);

    useEffect(() => {
        const v = videoRef.current;
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
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-contain"
                    preload="metadata"
                    playsInline
                    onError={() => {
                        setHasError(true);
                        setIsLoading(false);
                    }}
                >
                    {subtitleTracks
                        ?.filter((track) => track?.src || track?.url)
                        .map((track, idx) => (
                            <track
                                key={track.id || track.label || track.src || track.url || idx}
                                kind={track.kind || 'subtitles'}
                                src={track.src || track.url}
                                srcLang={track.lang || track.srclang || track.language || 'en'}
                                label={track.label || track.language || track.lang || 'Subtitles'}
                                default={track.default}
                            />
                        ))}
                </video>
            )}

            {isLoading && allowPlay && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="w-12 h-12 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin" />
                </div>
            )}

            {!allowPlay && (
                <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center text-white px-4 text-center">
                    {blockedMessage}
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
                    videoRef={videoRef}
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

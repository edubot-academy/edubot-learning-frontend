import { useEffect, useState } from 'react';
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
    videoRef,
    onEnded,
}) => {
    const [hasError, setHasError] = useState(false);
    const [isHls, setIsHls] = useState(false);
    const [hlsInstance, setHlsInstance] = useState(null);
    const [qualityOptions, setQualityOptions] = useState([{ id: 'auto', label: 'Auto', index: -1 }]);
    const [currentQuality, setCurrentQuality] = useState('auto');

    const handleError = () => {
        setHasError(true);
        toast.error('Видео жүктөлбөй калды. Кайра аракет кылыңыз.');
    };

    const handleLoadedData = () => {
        if (hasError) setHasError(false);
    };

    const handleRetry = () => {
        if (!videoRef?.current) return;
        setHasError(false);
        videoRef.current.load();
        videoRef.current
            .play()
            .catch(() => {
                /* ignore autoplay failure */
            });
    };

    useEffect(() => {
        const videoEl = videoRef?.current;
        if (!videoEl || !videoUrl) return undefined;

        const isHlsSource = videoUrl?.includes('.m3u8');
        console.log(isHlsSource);
        setIsHls(isHlsSource);

        if (isHlsSource && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(videoUrl);
            hls.attachMedia(videoEl);
            setHlsInstance(hls);
            setQualityOptions([{ id: 'auto', label: 'Auto', index: -1 }]);
            setCurrentQuality('auto');

            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                const levels = data?.levels || hls.levels || [];
                if (levels.length) {
                    const opts = [
                        { id: 'auto', label: 'Auto', index: -1 },
                        ...levels.map((lvl, idx) => ({
                            id: `${idx}`,
                            label: `${lvl.height || lvl.bitrate || 'Level ' + idx}p`,
                            index: idx,
                        })),
                    ];
                    setQualityOptions(opts);
                }
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    setHasError(true);
                    toast.error('HLS видео жүктөлбөй калды.');
                }
            });

            return () => {
                hls.destroy();
            };
        }

        // Native HLS support fallback (Safari)
        if (isHlsSource && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = videoUrl;
            return undefined;
        }

        // MP4 or other sources
        videoEl.src = videoUrl;
        setQualityOptions([{ id: 'auto', label: 'Default', index: -1 }]);
        setCurrentQuality('auto');
        return undefined;
    }, [videoUrl, videoRef]);

    const handleQualityChange = (id) => {
        if (!isHls || !hlsInstance) return;
        const levelIndex = id === 'auto' ? -1 : Number(id);
        hlsInstance.currentLevel = levelIndex;
        setCurrentQuality(id);
    };

    if (!videoUrl) {
        return (
            <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center text-gray-400">
                Видео табылган жок
            </div>
        );
    }

    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden">
            {/* ==== VIDEO ==== */}
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video object-cover cursor-pointer"
                preload="metadata"
                playsInline
                crossOrigin="anonymous"
                onError={handleError}
                onLoadedData={handleLoadedData}
            />

            {hasError && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-3">
                    <p className="text-sm">Видео жүктөлбөй калды.</p>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="px-4 py-2 bg-orange-500 rounded-lg text-sm hover:bg-orange-600 transition"
                    >
                        Кайра аракет кылуу
                    </button>
                </div>
            )}

            {/* ==== UI КОНТРОЛЫ ==== */}
            {!hasError && (
                <VideoPlayerUI
                    videoRef={videoRef}
                    resumeTime={resumeTime}
                    onProgress={onProgress}
                    onTimeUpdate={onTimeUpdate}
                    onPause={onPause}
                    allowPlay={allowPlay}
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

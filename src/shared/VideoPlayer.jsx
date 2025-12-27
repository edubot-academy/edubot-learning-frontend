import { useEffect, useRef, useState } from 'react';
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
  containerRef,
  onEnded,
}) => {
  const hlsRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [qualityOptions, setQualityOptions] = useState([{ id: 'auto', label: 'Auto' }]);
  const [currentQuality, setCurrentQuality] = useState('auto');

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoUrl) return;

 
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();
    setIsLoading(true); 

    const isHlsSource = videoUrl.includes('.m3u8');

    if (isHlsSource && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels || [];
        setQualityOptions([
          { id: 'auto', label: 'Auto' },
          ...levels.map((lvl, i) => ({ id: `${i}`, label: `${lvl.height}p` })),
        ]);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setHasError(true);
          setIsLoading(false);
          toast.error('Ошибка загрузки видео');
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else {
      videoEl.src = videoUrl;
    }
  }, [videoUrl, videoRef]);

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
    const video = videoRef.current;
    if (!video || resumeTime == null) return;

    const setTime = () => {
      if (Number.isFinite(resumeTime)) {
        video.currentTime = resumeTime;
      }
    };

    if (video.readyState >= 1) setTime();
    else video.addEventListener('loadedmetadata', setTime, { once: true });
  }, [resumeTime, videoRef]);

  const handleQualityChange = (id) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = id === 'auto' ? -1 : Number(id);
    setCurrentQuality(id);
  };

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-video object-cover"
        preload="metadata"
        playsInline
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />

      {isLoading && allowPlay && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-12 h-12 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div> {/* Простой CSS спиннер */}
        </div>
      )}

      {!allowPlay && (
        <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center text-white">
          Урок заблокирован
        </div>
      )}

      {!hasError && (
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
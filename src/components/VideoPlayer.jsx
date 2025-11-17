import React, { useRef, useEffect, useState } from "react";
import {
  FaPlayCircle,
  FaPauseCircle,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const VideoPlayer = ({
  videoUrl,
  resumeTime = 0,
  onProgress,
  onTimeUpdate,
  onPause,
  allowPlay = true,
  videoRef,
  onEnded,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pauseTimeoutRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setLoading(true);
    setShowControls(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setLoading(false);
      setError(null);
      if (resumeTime > 0) {
        video.currentTime = resumeTime;
      }
      if (!allowPlay) {
        video.pause();
      }
    };

    const handleTimeUpdate = () => {
      if (!allowPlay) return;
      const percentWatched = (video.currentTime / video.duration) * 100;
      if (onProgress) onProgress(percentWatched);
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setShowControls(true);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (onPause) onPause(video.currentTime);
    };

    const handleError = (e) => {
      console.error("Video playback error:", e);
      setError("Failed to load video. Please try again later.");
      setLoading(false);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [resumeTime, onProgress, onTimeUpdate, allowPlay]);

  const requestFullscreen = (element) => {
    if (!element) return;
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen) element.msRequestFullscreen();
    else if (element.webkitEnterFullscreen) element.webkitEnterFullscreen();
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video && allowPlay) {
      video.play();
      setShowControls(false);
    }
  };

  // Кастомная кнопка воспроизведения с серым кружком и оранжевым треугольником
  const CustomPlayButton = () => (
    <div className="relative">
      {/* Серый кружок */}
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center opacity-90">
        {/* Оранжевый треугольник */}
        <div className="w-0 h-0 border-l-[24px] border-l-[#EA580C] border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent ml-2"></div>
      </div>
    </div>
  );

  // Кастомная кнопка паузы с серым кружком и оранжевыми полосками
  const CustomPauseButton = () => (
    <div className="relative">
      {/* Серый кружок */}
      <div className="w-20 h-20 white rounded-full flex items-center justify-center opacity-90">
        {/* Две оранжевые полоски */}
        <div className="flex gap-1">
          <div className="w-2 h-8 bg-[#EA580C]"></div>
          <div className="w-2 h-8 bg-[#EA580C]"></div>
        </div>
      </div>
    </div>
  );

  return (
    // ИЗМЕНЕНИЕ: Только добавил центрирование через margin
    <div className="video-player relative w-screen max-w-none mx-auto flex justify-center items-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA580C]"></div>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center p-4 z-20 bg-white">
          {error}
        </div>
      )}

      {/* Responsive video container на всю ширину */}
      <div className="relative w-full h-[600px] bg-black overflow-hidden">
        {/* Aspect ratio 16:9 для responsiveness */}
        <div className="relative pb-[56.25%]">
          {loading && (
            <div className="absolute inset-0 bg-gray-900/70 blur-sm z-5" />
          )}
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            controls={false}
            playsInline
            preload="metadata"
            disablePictureInPicture
            onClick={() => setShowControls(true)}
            onEnded={onEnded}
            onPlay={(e) => {
              if (!allowPlay) {
                e.preventDefault();
                e.target.pause();
              } else {
                setIsPlaying(true);
              }
            }}
            onPause={() => {
              setIsPlaying(false);
              setShowControls(true);
              if (onPause) onPause(videoRef.current?.currentTime || 0);
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Кастомные кнопки управления */}
        {allowPlay && !loading && showControls && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div
              className="cursor-pointer z-40 transition-transform hover:scale-110"
              onClick={
                isPlaying
                  ? () => {
                      const video = videoRef.current;
                      if (video && allowPlay) {
                        video.pause();
                        setShowControls(true);
                      }
                    }
                  : handlePlayClick
              }
            >
              {isPlaying ? <CustomPauseButton /> : <CustomPlayButton />}
            </div>
          </div>
        )}

        {allowPlay && !loading && (
          <button
            onClick={() =>
              isFullscreen
                ? exitFullscreen()
                : requestFullscreen(videoRef.current)
            }
            className="absolute bottom-4 right-4 z-30 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
            title={isFullscreen ? "Толук экрандан чыгуу" : "Толук экран"}
          >
            {isFullscreen ? (
              <FaCompress className="text-lg text-white" />
            ) : (
              <FaExpand className="text-lg text-white" />
            )}
          </button>
        )}

        {!allowPlay && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center text-center px-4 z-[5]">
            <CustomPlayButton />
            <p className="text-gray-700 font-medium mb-2 mt-4">
              Бул видеону көрүү үчүн курска катталыңыз.
            </p>
            <Link
              to="/contact"
              className="px-4 py-2 bg-[#EA580C] text-white rounded hover:bg-[#d14a08] transition-colors"
            >
              Байланышуу
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

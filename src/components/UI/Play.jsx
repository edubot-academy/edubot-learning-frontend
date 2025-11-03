import React, { useRef, useState } from "react";

const Play = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState("720p");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const togglePlay = () => {
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e) => {
    const vol = e.target.value;
    setVolume(vol);
    videoRef.current.volume = vol;
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleProgress = (e) => {
    const time = (e.target.value / 100) * duration;
    videoRef.current.currentTime = time;
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleQualityChange = (q) => {
    setQuality(q);
    setShowSettings(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl">
        {/* ВИДЕО */}
        <video
          ref={videoRef}
          className="w-full bg-gradient-to-b from-gray-400 to-black"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        ></video>

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-3 flex flex-col gap-2">
          {/* ПРОГРЕСС */}
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleProgress}
            className="w-full h-1 accent-orange-500"
          />

          {/* КНОПКИ */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              {/* Play */}
              <button onClick={togglePlay} className="hover:text-orange-400">
                {isPlaying ? "⏸️" : "▶️"}
              </button>

              {/* 10s back */}
              <button
                onClick={() => (videoRef.current.currentTime -= 10)}
                className="hover:text-orange-400"
              >
                ⏪10s
              </button>

              {/* Volume */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolume}
                className="w-20 accent-orange-500"
              />

              {/* Time */}
              <span className="text-gray-300 text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-orange-400"
                >
                  ⚙️
                </button>
                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black text-white rounded-md shadow-md w-24">
                    {["1080p", "720p", "480p", "360p", "240p"].map((q) => (
                      <div
                        key={q}
                        onClick={() => handleQualityChange(q)}
                        className={`px-3 py-1 hover:bg-gray-700 cursor-pointer ${
                          quality === q ? "text-orange-400" : ""
                        }`}
                      >
                        {q}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-orange-400"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Play;

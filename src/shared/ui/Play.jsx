import React, { useEffect, useState } from 'react';
import { CiPlay1, CiPause1, CiVolumeHigh, CiVolumeMute } from 'react-icons/ci';
import { IoSettingsOutline } from 'react-icons/io5';
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs';
import Rewind15sekBack from '@assets/icons/Rewind 15 Seconds Back.svg';
import Rewind15sekForward from '@assets/icons/Rewind 15 Seconds Forward.svg';
import PlayPauseIndicator from './PlayPauseIndicator';

const VideoPlayerUI = ({
  videoRef,
  containerRef,
  onProgress,
  onTimeUpdate,
  onPause,
  allowPlay = true,
  onEnded,
  qualityOptions = [],
  currentQuality,
  onQualityChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const [showFeedback, setShowFeedback] = useState(true);
  const [iconType, setIconType] = useState('play');

  const seek = (sec) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const newT = Math.min(Math.max(v.currentTime + sec, 0), duration);
    v.currentTime = newT;
    setCurrentTime(newT);
    onProgress?.(newT);
    onTimeUpdate?.(newT);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || !allowPlay) return;

    const wasPaused = v.paused;

    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
      if (typeof onPause === 'function') {
        onPause();
      }
    }

    setIconType('pause');
    setShowFeedback(true);

    setTimeout(() => {
      if (wasPaused) {
        setShowFeedback(false);
      } else {
        setIconType('play');
      }
    }, 800);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (!v.muted) setVolume(v.volume ?? 1);
  };

  const handleVolumeChange = (val) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const formatTime = (time) => {
    if (!time && time !== 0) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleLoadedMetadata = () => {
      setDuration(v.duration || 0);
      setVolume(v.volume ?? 1);
      setIsMuted(!!v.muted);
    };

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    const handleTimeUpdateEvent = () => {
      setCurrentTime(v.currentTime);
      onProgress?.(v.currentTime);
      onTimeUpdate?.(v.currentTime);
    };
    const handleEndedEvent = () => onEnded?.();

    v.addEventListener('loadedmetadata', handleLoadedMetadata);
    v.addEventListener('play', handlePlayEvent);
    v.addEventListener('pause', handlePauseEvent);
    v.addEventListener('timeupdate', handleTimeUpdateEvent);
    v.addEventListener('ended', handleEndedEvent);

    return () => {
      v.removeEventListener('loadedmetadata', handleLoadedMetadata);
      v.removeEventListener('play', handlePlayEvent);
      v.removeEventListener('pause', handlePauseEvent);
      v.removeEventListener('timeupdate', handleTimeUpdateEvent);
      v.removeEventListener('ended', handleEndedEvent);
    };
  }, [videoRef, onProgress, onTimeUpdate, onEnded, onPause]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seek(-15);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seek(15);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const v = videoRef.current;
        if (!v) return;
        const next = Math.min((v.volume ?? 1) + 0.1, 1);
        handleVolumeChange(next);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const v = videoRef.current;
        if (!v) return;
        const next = Math.max((v.volume ?? 1) - 0.1, 0);
        handleVolumeChange(next);
      }
    };

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }, [videoRef, containerRef, duration, allowPlay]);

  const changeQuality = (q) => {
    onQualityChange?.(q);
    setOpenMenu(false);
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newT = percent * duration;
    v.currentTime = newT;
    setCurrentTime(newT);
    onProgress?.(newT);
    onTimeUpdate?.(newT);
  };

  return (
    <>
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => togglePlay()}
        aria-hidden
      />
      <PlayPauseIndicator showFeedback={showFeedback} iconType={iconType} isPlaying={isPlaying} />
      <div
        className="absolute cursor-pointer bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black to-transparent"
        onClick={() => togglePlay()}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-full px-4 pb-3 z-50 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full h-1.5 bg-gray-500/40 rounded-full cursor-pointer mb-3 relative group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-orange-500 rounded-full relative"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => { togglePlay(); }} className="hover:opacity-80">
              {isPlaying ? <CiPause1 className="w-4 h-4 sm:w-5 sm:h-5" /> : <CiPlay1 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <button type="button" onClick={() => { seek(-15); }} className="hover:opacity-80">
              <img src={Rewind15sekBack} alt="rewind 15" className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button type="button" onClick={() => { seek(15); }} className="hover:opacity-80">
              <img src={Rewind15sekForward} alt="forward 15" className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div
              className="flex items-center gap-2 relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="hover:opacity-80"
                aria-label="mute"
              >
                {isMuted || volume === 0 ? (
                  <CiVolumeMute className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <CiVolumeHigh className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-150 flex items-center ${showVolumeSlider ? (isMuted || volume === 0 ? 'w-0' : 'w-24') : 'w-0'}`}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); handleVolumeChange(Number(e.target.value)); }}
                  className={`h-4 w-full cursor-pointer rounded-full ${isMuted || volume === 0 ? 'accent-transparent' : 'accent-orange-500'}`}
                />
              </div>
            </div>

            <span className="ml-1 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                className="hover:opacity-80 flex items-center"
                onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu); }}
              >
                <IoSettingsOutline className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {openMenu && (
                <div
                  className="absolute bottom-10 right-0 bg-black/90 text-white rounded-lg py-2 px-4 shadow-xl w-24 border border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(qualityOptions?.length ? qualityOptions : [{ id: 'auto', label: 'Auto' }]).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => changeQuality(item.id)}
                      className={`py-1 cursor-pointer hover:text-orange-400 text-center text-xs sm:text-sm ${currentQuality === item.id ? 'text-orange-400 font-bold' : ''}`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => { toggleFullscreen(e); }}
              className="hover:opacity-80 mb-1"
            >
              {fullScreen ? <BsFullscreenExit className="w-3 h-3 sm:w-4 sm:h-4" /> : <BsFullscreen className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayerUI;

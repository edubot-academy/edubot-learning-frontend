import React, { useState, useEffect } from 'react';
import { CiPlay1, CiPause1, CiVolumeHigh, CiVolumeMute } from 'react-icons/ci';
import { IoSettingsOutline } from 'react-icons/io5';
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs';
import Rewind15sekBack from '@assets/icons/Rewind 15 Seconds Back.svg';
import Rewind15sekForward from '@assets/icons/Rewind 15 Seconds Forward.svg';

const VideoPlayerUI = ({
    videoRef,
    resumeTime,
    onProgress,
    onTimeUpdate,
    onPause,
    allowPlay = true,
    onEnded,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [openMenu, setOpenMenu] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);

    // Play / Pause
    const togglePlay = () => {
        if (!allowPlay) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            const videoContainer = videoRef.current.parentElement;
            if (!document.fullscreenElement) {
                videoContainer.requestFullscreen();
                setFullScreen(!fullScreen);
            } else {
                document.exitFullscreen();
            }
        }
    };

    const formatTime = (time) => {
        if (!time) return '0:00';
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60)
            .toString()
            .padStart(2, '0');
        return `${m}:${s}`;
    };

    const onLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
        }
    };

    const handleTimeUpdateLocal = () => {
        if (videoRef.current) {
            const t = videoRef.current.currentTime;
            setCurrentTime(t);
            onTimeUpdate?.(t);
            onProgress?.(t);
        }
    };

    // Обработчик клика по видео
    const handleVideoClick = () => {
        togglePlay();
    };

    const handlePause = () => {
        setIsPlaying(false);
        onPause?.();
    };

    const handlePlay = () => {
        setIsPlaying(true);
    };

    // Restore progress
    useEffect(() => {
        if (resumeTime && videoRef.current) {
            videoRef.current.currentTime = resumeTime;
        }
    }, [resumeTime, videoRef]);

    // Добавляем обработчики событий к видео элементу
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.addEventListener('timeupdate', handleTimeUpdateLocal);
        videoElement.addEventListener('pause', handlePause);
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('ended', onEnded);

        return () => {
            videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
            videoElement.removeEventListener('timeupdate', handleTimeUpdateLocal);
            videoElement.removeEventListener('pause', handlePause);
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('ended', onEnded);
        };
    }, [videoRef, onEnded]);

    const changeQuality = (q) => {
        console.log('Quality changed:', q);
        setOpenMenu(false);
    };

    const handleProgressClick = (e) => {
        if (!videoRef.current || !duration) return;

        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = duration * percent;
    };

    return (
        <>
            {/* ==== OVERLAY CLICK AREA ==== */}
            <div className="absolute inset-0 cursor-pointer" onClick={handleVideoClick} />
            <div
                className="absolute cursor-pointer bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black to-transparent"
                onClick={handleVideoClick}
            />

            {/* ==== CONTROLS ==== */}
            <div className="absolute bottom-0 left-0 w-full px-4 pb-3">
                {/* === PROGRESS BAR === */}
                <div
                    className="w-full h-1.5 bg-gray-500/40 rounded-full cursor-pointer mb-3"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                {/* === BOTTOM ROW === */}
                <div className="flex items-center justify-between text-white text-sm">
                    {/* LEFT buttons */}
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:opacity-80">
                            {isPlaying ? (
                                <CiPause1 className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <CiPlay1 className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>

                        <button onClick={() => skip(-15)} className="hover:opacity-80">
                            <img src={Rewind15sekBack} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button onClick={() => skip(15)} className="hover:opacity-80">
                            <img
                                src={Rewind15sekForward}
                                alt=""
                                className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                        </button>

                        <button onClick={toggleMute} className="hover:opacity-80">
                            {isMuted ? (
                                <CiVolumeMute className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <CiVolumeHigh className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>

                        <span className="ml-1">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* RIGHT buttons */}
                    <div className="flex items-center gap-4">
                        {/* SETTINGS */}
                        <div className="relative">
                            <button
                                className="hover:opacity-80"
                                onClick={() => setOpenMenu(!openMenu)}
                            >
                                <IoSettingsOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {openMenu && (
                                <div className="absolute bottom-10 right-0 bg-black/90 text-white rounded-lg py-2 px-4 shadow-xl w-24">
                                    {['1080p', '720p', '480p', '360p', '240p'].map((item) => (
                                        <div
                                            key={item}
                                            onClick={() => changeQuality(item)}
                                            className="py-1 cursor-pointer hover:text-orange-400"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} className="hover:opacity-80 mb-1">
                            {fullScreen ? (
                                <BsFullscreenExit className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                                <BsFullscreen className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoPlayerUI;

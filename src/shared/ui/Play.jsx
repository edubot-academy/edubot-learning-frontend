import { useEffect, useState, useCallback, useRef } from 'react';
import { CiPlay1, CiPause1, CiVolumeHigh, CiVolumeMute } from 'react-icons/ci';
import { IoSettingsOutline } from 'react-icons/io5';
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs';
import Rewind15sekBack from '@assets/icons/Rewind 15 Seconds Back.svg';
import Rewind15sekForward from '@assets/icons/Rewind 15 Seconds Forward.svg';
import PlayPauseIndicator from './PlayPauseIndicator';

const VideoPlayerUI = ({
    videoRef,
    containerRef,
    onTimeUpdate,
    allowPlay = true,
    qualityOptions = [],
    currentQuality,
    onQualityChange,
    isLoading,
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [openMenu, setOpenMenu] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showFeedback, setShowFeedback] = useState(true);
    const feedbackTimeoutRef = useRef(null);

    // Добавляем refs для перетаскивания
    const isDraggingRef = useRef(false);
    const progressBarRef = useRef(null);

    const seek = useCallback(
        (sec) => {
            const v = videoRef.current;
            if (!v || !v.duration) return;

            const newTime = Math.min(Math.max(v.currentTime + sec, 0), v.duration);

            v.currentTime = newTime;
            setCurrentTime(newTime);
        },
        [videoRef]
    );

    const showIndicator = useCallback(() => {
        setShowFeedback(true);
        clearTimeout(feedbackTimeoutRef.current);

        // Показываем индикатор всегда при взаимодействии
        feedbackTimeoutRef.current = setTimeout(() => {
            setShowFeedback(false);
        }, 3000);
    }, []);

    const togglePlay = useCallback(() => {
        const v = videoRef.current;
        if (!v || !allowPlay) return;

        if (v.paused) {
            v.play();
        } else {
            v.pause();
        }

        showIndicator();
    }, [allowPlay, videoRef, showIndicator]);

    const handleVolumeChange = useCallback(
        (val) => {
            const v = videoRef.current;
            if (!v) return;

            v.volume = val;
            v.muted = false;

            setVolume(val);
            setIsMuted(false);
        },
        [videoRef]
    );

    const toggleFullscreen = useCallback(
        (e) => {
            if (e) e.stopPropagation();
            if (!containerRef.current) return;
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen?.();
            } else {
                document.exitFullscreen?.();
            }
        },
        [containerRef]
    );

    const formatTime = useCallback((time) => {
        if (!time && time !== 0) return '0:00';
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60)
            .toString()
            .padStart(2, '0');
        return `${m}:${s}`;
    }, []);

    // Функции для перетаскивания прогресс-бара
    const handleProgressMouseDown = useCallback((e) => {
        e.stopPropagation();
        isDraggingRef.current = true;

        const updateTimeFromMouse = (mouseEvent) => {
            const v = videoRef.current;
            if (!v || !v.duration || !progressBarRef.current) return;

            const rect = progressBarRef.current.getBoundingClientRect();
            const percent = Math.min(Math.max((mouseEvent.clientX - rect.left) / rect.width, 0), 1);
            const newTime = percent * v.duration;

            v.currentTime = newTime;
            setCurrentTime(newTime);
        };

        updateTimeFromMouse(e);

        const handleMouseMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            updateTimeFromMouse(moveEvent);
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [videoRef]);

    const handleProgressClick = useCallback(
        (e) => {
            e.stopPropagation();

            // Если это клик (не перетаскивание), обрабатываем
            if (!isDraggingRef.current) {
                const v = videoRef.current;
                if (!v || !v.duration || !progressBarRef.current) return;

                const rect = progressBarRef.current.getBoundingClientRect();
                const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                const newTime = percent * v.duration;

                v.currentTime = newTime;
                setCurrentTime(newTime);
            }
        },
        [videoRef]
    );

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const handleTimeUpdate = () => {
            // Обновляем currentTime только если не перетаскиваем
            if (!isDraggingRef.current) {
                setCurrentTime(v.currentTime);
                onTimeUpdate?.(v.currentTime);
            }
        };

        v.addEventListener('timeupdate', handleTimeUpdate);
        return () => v.removeEventListener('timeupdate', handleTimeUpdate);
    }, [videoRef, onTimeUpdate]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const syncDuration = () => {
            if (Number.isFinite(v.duration) && v.duration > 0) {
                setDuration(v.duration);
            }
        };

        syncDuration();

        v.addEventListener('loadedmetadata', syncDuration);
        v.addEventListener('durationchange', syncDuration);

        return () => {
            v.removeEventListener('loadedmetadata', syncDuration);
            v.removeEventListener('durationchange', syncDuration);
        };
    }, [videoRef]);

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
                handleVolumeChange(Math.min((videoRef.current.volume ?? 1) + 0.1, 1));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleVolumeChange(Math.max((videoRef.current.volume ?? 1) - 0.1, 0));
            }
        };

        container.addEventListener('keydown', handler);
        return () => container.removeEventListener('keydown', handler);
    }, [containerRef, togglePlay, seek, handleVolumeChange, videoRef]);

    const changeQuality = useCallback(
        (q) => {
            onQualityChange?.(q);
            setOpenMenu(false);
        },
        [onQualityChange]
    );

    // Слушаем событие play/pause для скрытия индикатора
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const handlePlay = () => {
            // Скрываем индикатор через 3 секунды после начала воспроизведения
            clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = setTimeout(() => {
                setShowFeedback(false);
            }, 3000);
        };

        const handlePause = () => {
            // Показываем индикатор при паузе
            setShowFeedback(true);
            clearTimeout(feedbackTimeoutRef.current);
        };

        v.addEventListener('play', handlePlay);
        v.addEventListener('pause', handlePause);

        return () => {
            v.removeEventListener('play', handlePlay);
            v.removeEventListener('pause', handlePause);
            clearTimeout(feedbackTimeoutRef.current);
        };
    }, [videoRef]);

    const isPlaying = videoRef.current ? !videoRef.current.paused : false;

    return (
        <>
            <div className="absolute inset-0 cursor-pointer" aria-hidden />
            {!isLoading && <PlayPauseIndicator
                showFeedback={showFeedback}
                isPlaying={isPlaying}
                onHideFeedback={() => setShowFeedback(false)}
            />}

            <div
                className="absolute cursor-pointer bottom-0 left-0 w-full h-[100%]"
                onClick={togglePlay}
            />

            <div
                className="absolute bottom-0 left-0 w-full px-4 pb-3 z-20 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    ref={progressBarRef}
                    className="w-full h-1.5 bg-gray-500/40 rounded-full cursor-pointer mb-3 relative z-10 group"
                    onMouseDown={handleProgressMouseDown}
                    onClick={handleProgressClick}
                >
                    <div
                        className="relative h-full bg-orange-500 rounded-full pointer-events-none"
                        style={{
                            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                        }}
                    >
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ right: '-6px' }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="hover:opacity-80"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <CiPause1 className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <CiPlay1 className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => seek(-15)}
                            className="hover:opacity-80"
                            aria-label="Rewind 15"
                        >
                            <img
                                src={Rewind15sekBack}
                                alt="rewind 15"
                                className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() => seek(15)}
                            className="hover:opacity-80"
                            aria-label="Forward 15"
                        >
                            <img
                                src={Rewind15sekForward}
                                alt="forward 15"
                                className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                        </button>

                        <div className="flex items-center gap-2 relative">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowVolumeSlider(!showVolumeSlider);
                                }}
                                aria-label="Volume"
                            >
                                {isMuted || volume === 0 ? (
                                    <CiVolumeMute className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                    <CiVolumeHigh className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-150 flex items-center ${showVolumeSlider ? 'w-24' : 'w-0'
                                    }`}
                            >
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleVolumeChange(Number(e.target.value));
                                    }}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenu(!openMenu);
                                }}
                                aria-label="Quality"
                            >
                                <IoSettingsOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {openMenu && (
                                <div
                                    className="absolute bottom-10 right-0 bg-black/90 text-white rounded-lg py-2 px-4 
                                    shadow-xl w-24 border border-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {(qualityOptions?.length
                                        ? qualityOptions
                                        : [{ id: 'auto', label: 'Auto' }]
                                    ).map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => changeQuality(item.id)}
                                            className={`py-1 cursor-pointer hover:text-orange-400 text-center 
                                              text-xs sm:text-sm ${currentQuality === item.id ? 'text-orange-400 font-bold' : ''}`}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="hover:opacity-80 mb-1"
                            aria-label="Fullscreen"
                        >
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
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CiPlay1, CiPause1, CiVolumeHigh, CiVolumeMute } from 'react-icons/ci';
import { IoSettingsOutline } from 'react-icons/io5';
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs';
import Rewind15sekBack from '@assets/icons/Rewind 15 Seconds Back.svg';
import Rewind15sekForward from '@assets/icons/Rewind 15 Seconds Forward.svg';
import PlayPauseIndicator from './PlayPauseIndicator';

const getFullscreenElement = () =>
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    null;

const requestElementFullscreen = (element) => {
    if (!element) return Promise.reject(new Error('Fullscreen element is unavailable'));

    const request =
        element.requestFullscreen ||
        element.webkitRequestFullscreen ||
        element.msRequestFullscreen;

    if (!request) return Promise.reject(new Error('Fullscreen API is unavailable'));

    const result = request.call(element);
    return result && typeof result.then === 'function' ? result : Promise.resolve();
};

const exitElementFullscreen = () => {
    const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;

    if (!exit) return Promise.resolve();

    const result = exit.call(document);
    return result && typeof result.then === 'function' ? result : Promise.resolve();
};

const requestLandscapeOrientation = () => {
    const orientation = typeof screen !== 'undefined' ? screen.orientation : null;
    if (!orientation?.lock) return;
    orientation.lock('landscape').catch(() => undefined);
};

const unlockOrientation = () => {
    const orientation = typeof screen !== 'undefined' ? screen.orientation : null;
    if (!orientation?.unlock) return;
    orientation.unlock();
};

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
    const { t } = useTranslation();
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [openMenu, setOpenMenu] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showFeedback, setShowFeedback] = useState(true);
    const feedbackTimeoutRef = useRef(null);

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
        async (e) => {
            if (e) e.stopPropagation();
            const container = containerRef.current;
            const video = videoRef.current;
            if (!container && !video) return;

            if (getFullscreenElement()) {
                try {
                    await exitElementFullscreen();
                } finally {
                    unlockOrientation();
                }
                return;
            }

            try {
                await requestElementFullscreen(container);
                requestLandscapeOrientation();
                return;
            } catch {
                // iOS Safari often only supports native video fullscreen.
            }

            if (video?.webkitEnterFullscreen) {
                try {
                    video.webkitEnterFullscreen();
                    requestLandscapeOrientation();
                } catch {
                    // Keep inline playback if the browser rejects fullscreen.
                }
            }
        },
        [containerRef, videoRef]
    );

    const formatTime = useCallback((time) => {
        if (!time && time !== 0) return '0:00';
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60)
            .toString()
            .padStart(2, '0');
        return `${m}:${s}`;
    }, []);

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
        const v = videoRef.current;
        const handleFullscreenChange = () => {
            const isFullscreen = Boolean(getFullscreenElement());
            setFullScreen(isFullscreen);
            if (!isFullscreen) unlockOrientation();
        };
        const handleWebkitBeginFullscreen = () => setFullScreen(true);
        const handleWebkitEndFullscreen = () => {
            setFullScreen(false);
            unlockOrientation();
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        v?.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
        v?.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            v?.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
            v?.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen);
        };
    }, [videoRef]);

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

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const handlePlay = () => {
            clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = setTimeout(() => {
                setShowFeedback(false);
            }, 3000);
        };

        const handlePause = () => {
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
                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pb-3 pt-14 z-20 pointer-events-auto"
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
                            aria-label={isPlaying ? t('videoPlayer.pause') : t('videoPlayer.play')}
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
                            aria-label={t('videoPlayer.rewind15')}
                        >
                            <img
                                src={Rewind15sekBack}
                                alt={t('videoPlayer.rewind15')}
                                className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() => seek(15)}
                            className="hover:opacity-80"
                            aria-label={t('videoPlayer.forward15')}
                        >
                            <img
                                src={Rewind15sekForward}
                                alt={t('videoPlayer.forward15')}
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
                                aria-label={t('videoPlayer.volume')}
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
                                aria-label={t('videoPlayer.quality')}
                            >
                                <IoSettingsOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {openMenu && (
                                <div
                                    className="absolute bottom-10 right-0 w-28 rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-white shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {(qualityOptions?.length
                                        ? qualityOptions
                                        : [{ id: 'auto', label: t('videoPlayer.autoQuality') }]
                                    ).map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => changeQuality(item.id)}
                                            className={`block w-full py-1 cursor-pointer hover:text-orange-400 text-left
                                              text-xs sm:text-sm ${currentQuality === item.id ? 'text-orange-400 font-bold' : ''}`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="hover:opacity-80 mb-1"
                            aria-label={fullScreen ? t('videoPlayer.exitFullscreen') : t('videoPlayer.fullscreen')}
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

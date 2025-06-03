import React, { useRef, useEffect, useState } from 'react';
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const VideoPlayer = ({ videoUrl, resumeTime = 0, onProgress, onTimeUpdate, onPause, allowPlay = true, videoRef, onEnded }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const pauseTimeoutRef = useRef(null);

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
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
        };

        const handlePause = () => {
            setIsPlaying(false);
            setShowControls(true);
            if (onPause) onPause(video.currentTime);
        };

        const handleError = (e) => {
            console.error('Video playback error:', e);
            setError('Failed to load video. Please try again later.');
            setLoading(false);
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('error', handleError);
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        };
    }, [resumeTime, onProgress, onTimeUpdate, allowPlay]);

    return (
        <div className="video-player relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
            {error && <div className="text-red-500 text-center p-4 z-20">{error}</div>}

            <div className="relative w-full pt-[56.25%] bg-black rounded-lg shadow-lg overflow-hidden">
                {loading && <div className="absolute inset-0 bg-gray-900/70 blur-sm" />}

                <video
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    controls
                    // playsInline
                    preload="metadata"
                    disablePictureInPicture
                    controlsList="nodownload"
                    onClick={() => setShowControls(true)}
                    onEnded={onEnded}
                    onPlay={(e) => {
                        if (!allowPlay) {
                            e.preventDefault();
                            e.target.pause();
                        }
                    }}
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {allowPlay && !loading && showControls && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {isPlaying ? (
                        <FaPauseCircle className="text-6xl text-white drop-shadow-lg opacity-80" />
                    ) : (
                        <FaPlayCircle className="text-6xl text-white drop-shadow-lg opacity-80" />
                    )}
                </div>
            )}

            {!allowPlay && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center text-center px-4 z-[5]">
                    <FaPlayCircle className="text-5xl text-gray-400 mb-4" />
                    <p className="text-gray-700 font-medium mb-2">Бул видеону көрүү үчүн курска катталыңыз.</p>
                    <Link to="/contact" className="px-4 py-2 bg-edubot-orange text-white rounded hover:bg-orange-600">Байланышуу</Link>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;

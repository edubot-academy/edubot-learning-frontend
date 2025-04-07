// Secure VideoPlayer with resume support and progress tracking
import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = ({ videoUrl, resumeTime = 0, onProgress, onTimeUpdate }) => {
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
            if (resumeTime > 0 && resumeTime < video.duration) {
                video.currentTime = resumeTime;
            }
        };

        const handleTimeUpdate = () => {
            const percentWatched = (video.currentTime / video.duration) * 100;
            if (onProgress) onProgress(percentWatched);
            if (onTimeUpdate) onTimeUpdate(video.currentTime);
        };

        const handleError = (e) => {
            console.error('Video playback error:', e);
            setError('Failed to load video. Please try again later.');
            setLoading(false);
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('error', handleError);
        };
    }, [resumeTime, onProgress, onTimeUpdate]);

    return (
        <div className="video-player relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
            {error && <div className="text-red-500 text-center p-4">{error}</div>}
            <video
                ref={videoRef}
                className="w-full rounded-lg shadow-lg"
                controls
                playsInline
                preload="metadata"
                disablePictureInPicture
                controlsList="nodownload"
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;

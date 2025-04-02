import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ videoUrl }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [videoUrl]);

    const handleError = (e) => {
        console.error('Video playback error:', e);
        setError('Failed to load video. Please try again later.');
        setLoading(false);
    };

    const handleLoaded = () => {
        setLoading(false);
        setError(null);
    };

    if (!videoUrl) {
        return <div className="text-gray-600">No video available</div>;
    }

    return (
        <div className="video-player relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {error && (
                <div className="text-red-500 text-center p-4">
                    {error}
                </div>
            )}

            <video
                ref={videoRef}
                className="w-full rounded-lg shadow-lg"
                controls
                onError={handleError}
                onLoadedData={handleLoaded}
                playsInline
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;

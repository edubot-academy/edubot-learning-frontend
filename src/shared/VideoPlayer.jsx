import React from 'react';
import VideoPlayerUI from './ui/Play.jsx';

const VideoPlayer = ({
    videoUrl,
    resumeTime,
    onProgress,
    onTimeUpdate,
    onPause,
    allowPlay = true,
    videoRef,
    onEnded,
}) => {
    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden">
            {/* ==== VIDEO ==== */}
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video object-cover cursor-pointer"
            />

            {/* ==== UI КОНТРОЛЫ ==== */}
            <VideoPlayerUI
                videoRef={videoRef}
                resumeTime={resumeTime}
                onProgress={onProgress}
                onTimeUpdate={onTimeUpdate}
                onPause={onPause}
                allowPlay={allowPlay}
                onEnded={onEnded}
            />
        </div>
    );
};

export default VideoPlayer;

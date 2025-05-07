import React, { useEffect } from "react";
import VideoPlayer from './VideoPlayer';

const CourseVideoPlayer = ({
    activeLesson,
    resumeVideoTime,
    handleVideoProgress,
    handleTimeUpdate,
    handlePause,
    videoRef,
    nextLesson,
    prevLesson,
    handleLessonClick,
    onEnded
}) => {

    // restore where the learner left off
    useEffect(() => {
        if (videoRef.current && resumeVideoTime) {
            videoRef.current.currentTime = resumeVideoTime;
        }
    }, [resumeVideoTime, videoRef]);

    return (
        <div className="mb-6 relative">
            <VideoPlayer
                key={activeLesson.id}
                videoUrl={activeLesson.videoUrl}
                resumeTime={resumeVideoTime}
                onProgress={(p) => handleVideoProgress(p, activeLesson)}
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
                disabled={activeLesson.locked}
                allowPlay={!activeLesson.locked}
                videoRef={videoRef}
                onEnded={onEnded}
            />

            <button
                onClick={() => handleLessonClick(prevLesson)}
                disabled={!prevLesson}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 text-3xl bg-white bg-opacity-50 rounded-full px-3 py-1 hover:bg-opacity-80 disabled:opacity-30"
            >
                ←
            </button>
            <button
                onClick={() => handleLessonClick(nextLesson)}
                disabled={!nextLesson}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-3xl bg-white bg-opacity-50 rounded-full px-3 py-1 hover:bg-opacity-80 disabled:opacity-30"
            >
                →
            </button>
        </div>
    );
};

export default CourseVideoPlayer;

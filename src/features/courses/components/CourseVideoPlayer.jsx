import React from 'react';
import VideoPlayer from '@shared/VideoPlayer';
import { getPlayableVideoUrl } from '../../../utils/videoUtils';

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
    onEnded,
}) => {
    const containerRef = React.useRef(null);
    const lessonVideoUrl = getPlayableVideoUrl(activeLesson);

    return (
        <div ref={containerRef} tabIndex={0} className="videoFs mb-6 relative w-full">
            <VideoPlayer
                videoRef={videoRef}
                videoUrl={lessonVideoUrl}
                resumeTime={resumeVideoTime}
                allowPlay={!activeLesson.locked && Boolean(lessonVideoUrl)}
                containerRef={containerRef}
                onEnded={onEnded}
                onProgress={(p) => handleVideoProgress(p, activeLesson)}
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
                autoPlay
            />

            <button
                onClick={() => prevLesson && handleLessonClick(prevLesson)}
                disabled={!prevLesson}
                aria-label="Предыдущий урок"
                className="absolute top-1/2 left-2 -translate-y-1/2 text-3xl bg-white/50 dark:bg-gray-800/50 rounded-full px-3 py-1 hover:bg-white/80 dark:hover:bg-gray-800/80 disabled:opacity-30"
            >
                ←
            </button>

            <button
                onClick={() => nextLesson && handleLessonClick(nextLesson)}
                disabled={!nextLesson}
                aria-label="Следующий урок"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-3xl bg-white/50 dark:bg-gray-800/50 rounded-full px-3 py-1 hover:bg-white/80 dark:hover:bg-gray-800/80 disabled:opacity-30"
            >
                →
            </button>
        </div>
    );
};

export default CourseVideoPlayer;

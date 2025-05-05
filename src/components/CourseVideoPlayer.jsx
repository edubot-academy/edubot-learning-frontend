import React from "react";
import VideoPlayer from './VideoPlayer'

const CourseVideoPlayer = ({
    activeLesson,
    resumeVideoTime,
    handleVideoProgress,
    handleTimeUpdate,
    videoRef,
    countdown,
    progressPercent,
    nextLesson,
    prevLesson,
    handleLessonClick,
    countdownRef,
    setCountdown,
    setProgressPercent,
    setCountdownStarted,
}) => {
    return (
        <div className="mb-6 relative">
            <VideoPlayer
                videoUrl={activeLesson.videoUrl}
                resumeTime={resumeVideoTime}
                onProgress={(percent) => handleVideoProgress(percent, activeLesson)}
                onTimeUpdate={handleTimeUpdate}
                disabled={activeLesson.locked}
                allowPlay={!activeLesson.locked}
                videoRef={videoRef}
            />

            {countdown > 0 && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white rounded-lg">
                    <div className="relative w-32 h-32 mb-4">
                        <svg className="absolute top-0 left-0 w-full h-full">
                            <circle
                                className="text-gray-500"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="50"
                                cx="64"
                                cy="64"
                            />
                            <circle
                                className="text-orange-500"
                                strokeWidth="8"
                                strokeDasharray="314"
                                strokeDashoffset={`${314 - (314 * progressPercent) / 100}`}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="50"
                                cx="64"
                                cy="64"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                            {countdown}
                        </div>
                    </div>
                    <p className="text-lg font-semibold">Кийинки сабак башталат...</p>
                    <button
                        onClick={() => {
                            if (countdownRef.current) clearInterval(countdownRef.current);
                            setCountdown(0);
                            setProgressPercent(0);
                            setCountdownStarted(false);
                            if (nextLesson) handleLessonClick(nextLesson);
                        }}
                        className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-full text-white font-semibold"
                    >
                        Дароо өтүү
                    </button>
                </div>
            )}

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

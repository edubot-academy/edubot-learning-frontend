import React from 'react';
import VideoPlayer from '@shared/VideoPlayer';

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
}) => {
  const containerRef = React.useRef(null);

  const handleEnded = () => {
    if (nextLesson) handleLessonClick(nextLesson);
  };

  return (
    <div ref={containerRef} tabIndex={0} className="mb-6 relative w-full">
      <VideoPlayer
        key={activeLesson.id}
        videoUrl={activeLesson.videoUrl}
        resumeTime={resumeVideoTime}
        allowPlay={!activeLesson.locked}
        videoRef={videoRef}
        containerRef={containerRef}
        onEnded={handleEnded}
        onProgress={(p) => handleVideoProgress(p, activeLesson)}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
      />

      <button
        onClick={() => prevLesson && handleLessonClick(prevLesson)}
        disabled={!prevLesson}
        aria-label="Предыдущий урок"
        className="absolute top-1/2 left-2 -translate-y-1/2 text-3xl bg-white/50 rounded-full px-3 py-1 hover:bg-white/80 disabled:opacity-30"
      >
        ←
      </button>

      <button
        onClick={() => nextLesson && handleLessonClick(nextLesson)}
        disabled={!nextLesson}
        aria-label="Следующий урок"
        className="absolute top-1/2 right-2 -translate-y-1/2 text-3xl bg-white/50 rounded-full px-3 py-1 hover:bg-white/80 disabled:opacity-30"
      >
        →
      </button>
    </div>
  );
};

export default CourseVideoPlayer;

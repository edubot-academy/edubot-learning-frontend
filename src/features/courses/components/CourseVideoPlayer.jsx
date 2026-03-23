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
    onEnded,
}) => {
    const containerRef = React.useRef(null);

    // Добавляем ключ для принудительного пересоздания VideoPlayer при смене урока
    const [videoKey, setVideoKey] = React.useState(Date.now());

    React.useEffect(() => {
        // При смене урока обновляем ключ
        setVideoKey(Date.now());

        // Принудительно запускаем воспроизведение через небольшую задержку
        const timer = setTimeout(() => {
            if (videoRef.current && !activeLesson.locked) {
                videoRef.current.play().catch(err => {
                    console.warn('Autoplay failed:', err);
                    // Если авто-воспроизведение заблокировано браузером,
                    // показываем кнопку воспроизведения
                });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [activeLesson.id, activeLesson.locked, videoRef]);

    return (
        <div ref={containerRef} tabIndex={0} className="videoFs mb-6 relative w-full">
            <VideoPlayer
                key={videoKey} // Используем ключ для принудительного пересоздания
                videoUrl={activeLesson.videoUrl}
                resumeTime={resumeVideoTime}
                allowPlay={!activeLesson.locked}
                containerRef={containerRef}
                onEnded={onEnded}
                onProgress={(p) => handleVideoProgress(p, activeLesson)}
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
                autoPlay={true} // Добавляем пропс для авто-воспроизведения
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
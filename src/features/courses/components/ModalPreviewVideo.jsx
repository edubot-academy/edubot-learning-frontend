import React, { useEffect, useState } from 'react';
import Modal from '@shared-ui/Modal';
import { fetchCoursePreview } from '../api';
import { formatSecondsToTime } from '../../../utils/timeUtils';
import VideoPlayer from '@shared/VideoPlayer';


function ModalPreviewVideo({ isOpen, onClose, courseId, previewData: previewDataProp = null, initialVideo = null,
    activeLesson,
    resumeVideoTime,
    handleVideoProgress,
    handleTimeUpdate,
    handlePause,
    videoRef,
    onEnded,
}) {
    const [previewData, setPreviewData] = useState(previewDataProp || null);
    const [loading, setLoading] = useState(previewDataProp ? false : true);
    const [activeVideo, setActiveVideo] = useState(initialVideo || previewDataProp?.previewVideos?.[0] || null);
    const containerRef = React.useRef(null);
    const [videoKey, setVideoKey] = React.useState(Date.now());

    React.useEffect(() => {
        // При смене урока обновляем ключ
        setVideoKey(Date.now());

        // Принудительно запускаем воспроизведение через небольшую задержку
        const timer = setTimeout(() => {
            if (videoRef.current && !activeVideo.locked) {
                videoRef.current.play().catch(err => {
                    console.warn('Autoplay failed:', err);
                    // Если авто-воспроизведение заблокировано браузером,
                    // показываем кнопку воспроизведения
                });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [activeVideo, videoRef]);

    useEffect(() => {
        if (!isOpen) {
            setPreviewData(previewDataProp || null);
            setActiveVideo(initialVideo || previewDataProp?.previewVideos?.[0] || null);
            setLoading(previewDataProp ? false : true);
            return;
        }

        if (previewDataProp) {
            setPreviewData(previewDataProp);
            setActiveVideo(initialVideo || previewDataProp.previewVideos?.[0] || null);
            setLoading(false);
            return;
        }

        if (!courseId) return;

        setLoading(true);
        const loadPreview = async () => {
            try {
                const data = await fetchCoursePreview(courseId);
                setPreviewData(data);
                setActiveVideo(initialVideo || data?.previewVideos?.[0] || null);
            } catch (e) {
                console.error('Failed to load course preview:', e);
            } finally {
                setLoading(false);
            }
        };

        loadPreview();
    }, [isOpen, courseId, previewDataProp, initialVideo]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={previewData?.title}
            size="lg"
        >
            {loading && (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-[#f17e22] rounded-full animate-spin" />
                </div>
            )}


            {!loading && previewData && (
                <div ref={containerRef} className="w-full videoFs pb-9 relative">
                    <p className="text-sm text-gray-500 dark:text-[#a6adba] mb-1">
                        {previewData.description || 'Курс жөнүндө маалымат жакында кошулат...'}
                    </p>

                    {activeVideo?.videoUrl && (
                        <VideoPlayer
                            key={videoKey}
                            videoUrl={activeVideo.videoUrl}
                            resumeTime={resumeVideoTime}
                            allowPlay={!activeVideo.locked}
                            containerRef={containerRef}
                            onEnded={onEnded}
                            onProgress={(p) => handleVideoProgress(p, activeVideo)}
                            onTimeUpdate={handleTimeUpdate}
                            onPause={handlePause}
                            autoPlay={true}
                            className="w-full aspect-video rounded"
                        />
                    )}

                    <div className="space-y-2 mt-4">
                        {previewData.previewVideos?.map((lesson, index) => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveVideo(lesson)}
                                className={`w-full flex items-center gap-3 p-3 rounded border
                                    ${activeVideo?.id === lesson.id
                                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 darck'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                                `}
                            >
                                <img
                                    src={previewData.coverImageUrl}
                                    alt={lesson.title}
                                    className="w-16 h-10 object-cover rounded"
                                />

                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium line-clamp-1">
                                        {index + 1}. {lesson.title}
                                    </p>
                                </div>

                                <span className="text-xs text-gray-500 dark:text-[#a6adba]">
                                    {formatSecondsToTime(lesson.duration)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default ModalPreviewVideo;

import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@shared-ui/Modal';
import { fetchCoursePreview } from '../api';
import { formatSecondsToTime } from '../../../utils/timeUtils';
import VideoPlayer from '@shared/VideoPlayer';


function ModalPreviewVideo({ isOpen, onClose, courseId, previewData: previewDataProp = null, initialVideo = null,
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
    const playableVideos = useMemo(() => {
        const videos = previewData?.previewVideos || [];
        return videos.filter(
            (v) =>
                v &&
                v.mediaReady !== false &&
                (v.manifestUrl || v.videoUrl || v.previewUrl || v.previewVideo?.videoUrl)
        );
    }, [previewData]);

    React.useEffect(() => {
        // При смене урока обновляем ключ
        setVideoKey(Date.now());

        // Принудительно запускаем воспроизведение через небольшую задержку
        const timer = setTimeout(() => {
            if (videoRef?.current && !activeVideo?.locked) {
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
            const initial =
                (initialVideo && initialVideo.mediaReady !== false && initialVideo) ||
                playableVideos[0] ||
                previewDataProp.previewVideos?.[0] ||
                null;
            setActiveVideo(initial);
            setLoading(false);
            return;
        }

        if (!courseId) return;

        setLoading(true);
        const loadPreview = async () => {
            try {
                const data = await fetchCoursePreview(courseId);
                setPreviewData(data);
                const initial =
                    (initialVideo && initialVideo.mediaReady !== false && initialVideo) ||
                    data?.previewVideos?.find((v) => v.mediaReady !== false) ||
                    null;
                setActiveVideo(initial);
            } catch (e) {
                console.error('Failed to load course preview:', e);
            } finally {
                setLoading(false);
            }
        };

        loadPreview();
    }, [isOpen, courseId, previewDataProp, initialVideo, playableVideos]);

    useEffect(() => {
        if (initialVideo && initialVideo.mediaReady !== false) {
            setActiveVideo(initialVideo);
        }
    }, [initialVideo]);

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

                    {activeVideo?.mediaReady !== false && (activeVideo?.manifestUrl || activeVideo?.videoUrl) ? (
                        <VideoPlayer
                            key={videoKey}
                            videoUrl={activeVideo.manifestUrl || activeVideo.videoUrl}
                            resumeTime={resumeVideoTime}
                            allowPlay={!activeVideo.locked && activeVideo.mediaReady !== false}
                            blockedMessage={
                                activeVideo.mediaStatus === 'failed'
                                    ? 'Видео иштетүүдө ката чыкты.'
                                    : 'Видео даярдалып жатат.'
                            }
                            containerRef={containerRef}
                            onEnded={onEnded}
                            onProgress={(p) => handleVideoProgress(p, activeVideo)}
                            onTimeUpdate={handleTimeUpdate}
                            onPause={handlePause}
                            autoPlay={true}
                            className="w-full aspect-video rounded"
                        />
                    ) : (
                        <div className="w-full aspect-video rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                            Видео даярдала элек
                        </div>
                    )}

                    <div className="space-y-2 mt-4">
                        {previewData.previewVideos?.map((lesson, index) => {
                            const disabled = lesson.mediaReady === false;
                            const label =
                                lesson.mediaStatus === 'failed'
                                    ? 'Ката'
                                    : lesson.mediaReady === false
                                    ? 'Даярдалып жатат'
                                    : null;
                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => !disabled && setActiveVideo(lesson)}
                                    className={`w-full flex items-center gap-3 p-3 rounded border
                                    ${activeVideo?.id === lesson.id || activeVideo?.videoUrl === lesson.videoUrl
                                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 darck'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                                        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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

                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-gray-500 dark:text-[#a6adba]">
                                            {formatSecondsToTime(lesson.duration)}
                                        </span>
                                        {label && (
                                            <span className="text-[11px] text-yellow-700 dark:text-yellow-400">
                                                {label}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default ModalPreviewVideo;

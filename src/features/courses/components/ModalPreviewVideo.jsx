import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '@shared/ui/BasicModal';
import { fetchCoursePreview } from '../api';
import { formatSecondsToTime } from '../../../utils/timeUtils';
import VideoPlayer from '@shared/VideoPlayer';
import { getPlayableVideoUrl } from '../../../utils/videoUtils';
import {
    FiShare2,
    FiTwitter,
    FiLinkedin,
    FiGlobe,
    FiCamera,
    FiDownload,
    FiCopy,
} from 'react-icons/fi';


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
    const activeVideoUrl = getPlayableVideoUrl(activeVideo);

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

    useEffect(() => {
        if (initialVideo) {
            setActiveVideo(initialVideo);
        }
    }, [initialVideo]);

    if (!isOpen) return null;

    return (
        <BasicModal
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

                    {activeVideoUrl && (
                        <VideoPlayer
                            videoRef={videoRef}
                            videoUrl={activeVideoUrl}
                            resumeTime={resumeVideoTime}
                            allowPlay={!activeVideo.locked && Boolean(activeVideoUrl)}
                            containerRef={containerRef}
                            onEnded={onEnded}
                            onProgress={(p) => handleVideoProgress?.(p, activeVideo)}
                            onTimeUpdate={handleTimeUpdate}
                            onPause={handlePause}
                            autoPlay
                            className="w-full aspect-video rounded"
                        />
                    )}

                    <div className="space-y-2 mt-4">
                        {previewData.previewVideos?.map((lesson, index) => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveVideo(lesson)}
                                className={`w-full flex items-center gap-3 p-3 rounded border
                                    ${activeVideo?.id === lesson.id ||
                                    getPlayableVideoUrl(activeVideo) === getPlayableVideoUrl(lesson)
                                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 darck'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
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
        </BasicModal>
    );
}

export default ModalPreviewVideo;

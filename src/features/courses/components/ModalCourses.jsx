import React, { useEffect, useState } from 'react';
import Modal from '@shared-ui/Modal';
import { fetchCoursePreview } from '../api';

function ModalCourses({ isOpen, onClose, courseId, previewData: previewDataProp = null, initialVideo = null }) {
    const [previewData, setPreviewData] = useState(previewDataProp || null);
    const [loading, setLoading] = useState(previewDataProp ? false : true);
    const [activeVideo, setActiveVideo] = useState(initialVideo || previewDataProp?.previewVideos?.[0] || null);

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
            {loading && <p>Загрузка...</p>}

            {!loading && previewData && (
                <>
                    <p className="text-sm text-gray-500 mb-4">
                        {previewData.description || 'Описание курса скоро будет добавлено...'}
                    </p>

                    {activeVideo?.videoUrl && (
                        <video
                            key={activeVideo.id}
                            src={activeVideo.videoUrl}
                            controls
                            autoPlay
                            className="w-full aspect-video rounded mb-4"
                        />
                    )}

                    <div className="space-y-2">
                        {previewData.previewVideos?.map((video, index) => (
                            <button
                                key={video.id}
                                onClick={() => setActiveVideo(video)}
                                className={`w-full flex items-center gap-3 p-3 rounded border
                                    ${activeVideo?.id === video.id
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'hover:bg-gray-100'}
                                `}
                            >
                                <img
                                    src={previewData.coverImageUrl}
                                    alt={video.title}
                                    className="w-16 h-10 object-cover rounded"
                                />

                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium line-clamp-1">
                                        {index + 1}. {video.title}
                                    </p>
                                </div>

                                <span className="text-xs text-gray-500">
                                    {previewData.durationInHours} саат
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </Modal>
    );
}

export default ModalCourses;

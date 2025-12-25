import React, { useEffect, useState } from 'react';
import { RiCloseLargeFill } from "react-icons/ri";
import { fetchCoursePreview } from '../api';

function ModalCourses({ onClose, courseId, }) {
    const [previewData, setPreviewData] = useState();
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        const loadPreview = async () => {
            try {
                const data = await fetchCoursePreview(courseId);
                setPreviewData(data);
            } catch (error) {
                console.error('Failed to load course preview:', error);
            } finally {
                setLoading(false);
            }
        };
        if (courseId) loadPreview();


    }, [courseId]);

    useEffect(() => {
        if (previewData?.previewVideos?.length) {
            setActiveVideo(previewData.previewVideos[0]);
        }
    }, [previewData]);


    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);
    if (loading) {
        return <div className="fixed inset-0 bg-black/40 flex items-center justify-center text-white">
            Загрузка...
        </div>;
    }
    if (!previewData) return null;


    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded max-w-xl w-full shadow-xl m-4 p-2 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between p-5 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">{previewData.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {previewData.description || 'Описание курса скоро будет добавлено...'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <RiCloseLargeFill className="w-5 h-5" />
                    </button>
                </div>
                {activeVideo && (
                    <video
                        key={activeVideo.id}
                        src={activeVideo.videoUrl}
                        controls
                        autoPlay
                        playsInline
                        className="w-full aspect-video rounded"
                    />
                )}

                <div className="mt-4 space-y-2">
                    {previewData.previewVideos.map((video, index) => (
                        <button
                            key={video.id}
                            onClick={() => setActiveVideo(video)}
                            className={`w-full flex items-center gap-3 p-3 rounded border transition
        ${activeVideo?.id === video.id
                                    ? 'bg-blue-50 border-blue-500'
                                    : 'hover:bg-gray-100'
                                }`}
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
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {previewData.durationInHours} часа
                            </span>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default ModalCourses;

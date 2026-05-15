import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '@shared/ui/BasicModal';
import { fetchCoursePreview } from '../api';
import { formatSecondsToTime } from '../../../utils/timeUtils';
import VideoPlayer from '@shared/VideoPlayer';
import { getPlayableVideoUrl } from '../../../utils/videoUtils';
import { FiAlertTriangle, FiPlayCircle } from 'react-icons/fi';
import NoImage from '@assets/icons/noImage.svg';
import { useTranslation } from 'react-i18next';

function ModalPreviewVideo({
    isOpen,
    onClose,
    courseId,
    previewData: previewDataProp = null,
    initialVideo = null,
    resumeVideoTime,
    handleVideoProgress,
    handleTimeUpdate,
    handlePause,
    videoRef,
    onEnded,
}) {
    const { t } = useTranslation();
    const [previewData, setPreviewData] = useState(previewDataProp || null);
    const [loading, setLoading] = useState(previewDataProp ? false : true);
    const [error, setError] = useState('');
    const [activeVideo, setActiveVideo] = useState(
        initialVideo || previewDataProp?.previewVideos?.[0] || null
    );
    const containerRef = useRef(null);
    const activeVideoUrl = getPlayableVideoUrl(activeVideo);

    useEffect(() => {
        if (!isOpen) {
            setPreviewData(previewDataProp || null);
            setActiveVideo(initialVideo || previewDataProp?.previewVideos?.[0] || null);
            setLoading(previewDataProp ? false : true);
            setError('');
            return;
        }

        if (previewDataProp) {
            setPreviewData(previewDataProp);
            setActiveVideo(initialVideo || previewDataProp.previewVideos?.[0] || null);
            setLoading(false);
            setError('');
            return;
        }

        if (!courseId) return;

        setLoading(true);
        setError('');
        const loadPreview = async () => {
            try {
                const data = await fetchCoursePreview(courseId);
                setPreviewData(data);
                setActiveVideo(initialVideo || data?.previewVideos?.[0] || null);
            } catch (e) {
                console.error('Failed to load course preview:', e);
                setError(t('public.courseShared.preview.loadError'));
            } finally {
                setLoading(false);
            }
        };

        loadPreview();
    }, [isOpen, courseId, previewDataProp, initialVideo, t]);

    useEffect(() => {
        if (initialVideo) {
            setActiveVideo(initialVideo);
        }
    }, [initialVideo]);

    if (!isOpen) return null;

    return (
        <BasicModal isOpen={isOpen} onClose={onClose} title={previewData?.title} size="lg">
            {loading && (
                <div className="flex min-h-[300px] items-center justify-center" role="status">
                    <div
                        className="w-12 h-12 border-4 border-gray-300 border-t-[#f17e22] rounded-full animate-spin"
                        aria-hidden="true"
                    />
                    <span className="sr-only">{t('public.courseShared.preview.loading')}</span>
                </div>
            )}

            {!loading && error && (
                <div
                    className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-6 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-100"
                    role="alert"
                >
                    <div className="flex gap-3">
                        <FiAlertTriangle className="mt-1 shrink-0" aria-hidden="true" />
                        <div>
                            <h3 className="font-semibold">
                                {t('public.courseShared.preview.errorTitle')}
                            </h3>
                            <p className="mt-2 text-sm leading-6">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && previewData && (
                <div ref={containerRef} className="w-full videoFs pb-9 relative">
                    {activeVideoUrl ? (
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
                            defaultFitMode="crop"
                            className="w-full aspect-video rounded"
                        />
                    ) : (
                        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                            <div className="text-center">
                                <FiPlayCircle
                                    className="mx-auto mb-3 h-10 w-10 text-gray-400"
                                    aria-hidden="true"
                                />
                                <p className="text-sm font-medium">
                                    {t('public.courseShared.preview.noVideo')}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 mt-4">
                        {previewData.previewVideos?.length ? (
                            previewData.previewVideos.map((lesson, index) => (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => setActiveVideo(lesson)}
                                    className={`w-full flex items-center gap-3 p-3 rounded border
                                    ${
                                        activeVideo?.id === lesson.id ||
                                        getPlayableVideoUrl(activeVideo) ===
                                            getPlayableVideoUrl(lesson)
                                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 darck'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                `}
                                >
                                    <img
                                        src={previewData.coverImageUrl || NoImage}
                                        alt={lesson.title}
                                        className="w-16 h-10 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.src = NoImage;
                                        }}
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
                            ))
                        ) : (
                            <p className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                {t('public.courseShared.preview.empty')}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </BasicModal>
    );
}

ModalPreviewVideo.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    previewData: PropTypes.shape({
        title: PropTypes.string,
        coverImageUrl: PropTypes.string,
        previewVideos: PropTypes.array,
    }),
    initialVideo: PropTypes.object,
    resumeVideoTime: PropTypes.number,
    handleVideoProgress: PropTypes.func,
    handleTimeUpdate: PropTypes.func,
    handlePause: PropTypes.func,
    videoRef: PropTypes.shape({ current: PropTypes.any }),
    onEnded: PropTypes.func,
};

export default ModalPreviewVideo;

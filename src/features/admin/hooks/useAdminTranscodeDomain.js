import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    bulkTranscodeLessonHls,
    getTranscodeStatus,
    transcodeLessonHls,
} from '@services/api';

export const useAdminTranscodeDomain = ({ loadCoursesAndCategories }) => {
    const [transcodeCourseId, setTranscodeCourseId] = useState('');
    const [transcodeSectionId, setTranscodeSectionId] = useState('');
    const [transcodeLessonId, setTranscodeLessonId] = useState('');
    const [transcodeLessonIds, setTranscodeLessonIds] = useState('');
    const [transcodeLoading, setTranscodeLoading] = useState(false);
    const [activeTranscodes, setActiveTranscodes] = useState([]);

    const handleTranscode = useCallback(async () => {
        if (!transcodeCourseId || !transcodeSectionId || !transcodeLessonId) {
            toast.error('Бардык ID полярын толтуруңуз');
            return;
        }

        setTranscodeLoading(true);
        try {
            const result = await transcodeLessonHls({
                courseId: Number(transcodeCourseId),
                sectionId: Number(transcodeSectionId),
                lessonId: Number(transcodeLessonId),
            });
            toast.success('Транскоддоо ийгиликтүү башталды');
            setActiveTranscodes((prev) => [
                ...prev,
                {
                    courseId: Number(transcodeCourseId),
                    sectionId: Number(transcodeSectionId),
                    lessonId: Number(transcodeLessonId),
                    status: 'processing',
                    jobId: result.jobId,
                },
            ]);
            setTranscodeCourseId('');
            setTranscodeSectionId('');
            setTranscodeLessonId('');
        } catch {
            toast.error('Транскоддоодо ката кетти');
        } finally {
            setTranscodeLoading(false);
        }
    }, [transcodeCourseId, transcodeLessonId, transcodeSectionId]);

    const handleBulkTranscode = useCallback(async () => {
        if (!transcodeCourseId || !transcodeSectionId) {
            toast.error('Course жана Section ID толтуруңуз');
            return;
        }

        const lessonIds = transcodeLessonIds
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
            .map(Number)
            .filter(Number.isFinite);

        setTranscodeLoading(true);
        try {
            const result = await bulkTranscodeLessonHls({
                courseId: Number(transcodeCourseId),
                sectionId: Number(transcodeSectionId),
                lessonIds: lessonIds.length ? lessonIds : undefined,
            });
            toast.success(`Топтук транскоддоо башталды: ${result.started}/${result.total}`);
            const startedLessons = result.results
                .filter((item) => item.status === 'started')
                .map((item) => ({
                    courseId: Number(transcodeCourseId),
                    sectionId: Number(transcodeSectionId),
                    lessonId: item.lessonId,
                    status: 'processing',
                    jobId: item.jobId,
                }));
            setActiveTranscodes((prev) => [...prev, ...startedLessons]);
            setTranscodeLessonIds('');
        } catch {
            toast.error('Топтук транскоддоодо ката кетти');
        } finally {
            setTranscodeLoading(false);
        }
    }, [transcodeCourseId, transcodeLessonIds, transcodeSectionId]);

    useEffect(() => {
        if (activeTranscodes.length === 0) return undefined;

        const interval = setInterval(async () => {
            const updates = await Promise.all(
                activeTranscodes.map(async (transcode) => {
                    try {
                        const status = await getTranscodeStatus({
                            courseId: transcode.courseId,
                            sectionId: transcode.sectionId,
                            lessonId: transcode.lessonId,
                        });
                        return {
                            ...transcode,
                            status: status.playbackStatus,
                            jobStatus: status.jobStatus,
                        };
                    } catch {
                        return transcode;
                    }
                })
            );

            const stillProcessing = updates.filter(
                (update) =>
                    update.status === 'processing' &&
                    !['COMPLETE', 'ERROR', 'CANCELED'].includes(update.jobStatus)
            );

            let shouldRefreshCourses = false;
            updates.forEach((update) => {
                if (update.status === 'ready' && !update.notified) {
                    toast.success(`Lesson ${update.lessonId} transcode complete`);
                    update.notified = true;
                    shouldRefreshCourses = true;
                } else if (update.status === 'failed' && !update.notified) {
                    toast.error(`Lesson ${update.lessonId} transcode failed`);
                    update.notified = true;
                }
            });

            if (shouldRefreshCourses) {
                loadCoursesAndCategories();
            }

            setActiveTranscodes(stillProcessing);
        }, 10000);

        return () => clearInterval(interval);
    }, [activeTranscodes, loadCoursesAndCategories]);

    return {
        handleBulkTranscode,
        handleTranscode,
        setTranscodeCourseId,
        setTranscodeLessonId,
        setTranscodeLessonIds,
        setTranscodeSectionId,
        transcodeCourseId,
        transcodeLessonId,
        transcodeLessonIds,
        transcodeLoading,
        transcodeSectionId,
    };
};

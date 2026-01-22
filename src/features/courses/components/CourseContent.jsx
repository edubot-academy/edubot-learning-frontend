import React, { useState, useRef, useMemo, useEffect } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { RiPlayCircleFill } from 'react-icons/ri';
import { TbLock } from 'react-icons/tb';
import { FiBookOpen, FiCode } from 'react-icons/fi';
import { MdQuiz } from 'react-icons/md';
import { HiOutlineFolderOpen } from 'react-icons/hi2';
import ReelsIcon from '@assets/icons/reelsIcon.svg';
import { formatMinutesToTime, formatSecondsToTime } from '../../../utils/timeUtils';
import ModalPreviewVideo from './ModalPreviewVideo';

const CourseContent = ({
    sections,
    enrolled = false,
    onLessonClick,
    activeLesson,
    completedLessons = [],
    lessonRefs,
    showHeader = true,
    handleCheckboxToggle,
}) => {
    const [openIds, setOpenIds] = useState([]);
    const contentRefs = useRef({});

    // preview modal state for lesson previews
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLesson, setPreviewLesson] = useState(null);
    const closePreview = () => {
        setPreviewOpen(false);
        setPreviewLesson(null);
    };

    useEffect(() => {
        if (sections?.length > 0 && openIds.length === 0) {
            setOpenIds([sections[0].id]);
        }
    }, [sections, openIds.length]);

    const toggleOpen = (id) => {
        setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    };

    const { totalLessons, totalMinutes } = useMemo(() => {
        const lessonsCount = sections?.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);
        const minutes =
            sections?.reduce(
                (acc, sec) =>
                    acc +
                    (sec.lessons || []).reduce(
                        (inner, l) => inner + Math.ceil((l.duration || 0) / 60),
                        0
                    ),
                0
            ) || 0;
        return { totalLessons: lessonsCount || 0, totalMinutes: minutes };
    }, [sections]);

    const isLocked = (lesson) => !enrolled && !lesson.previewVideo;
    const isActive = (lesson) => activeLesson && activeLesson.id === lesson.id;
    const isCompleted = (lesson) => completedLessons.includes(lesson.id);
    const getIcon = (lesson) => {
        if (lesson.kind === 'article') return <FiBookOpen size={18} />;
        if (lesson.kind === 'code') return <FiCode size={18} />;
        if (lesson.kind === 'quiz') return <MdQuiz size={18} />;
        return <RiPlayCircleFill size={22} />;
    };

    const getLessonPreviewVideoUrl = (lesson) => {
        if (!lesson) return null;
        if (lesson.videoUrl) return lesson.videoUrl;
        if (lesson.previewUrl) return lesson.previewUrl;
        if (lesson.previewVideo && typeof lesson.previewVideo === 'string') return lesson.previewVideo;
        if (lesson.previewVideo && lesson.previewVideo.videoUrl) return lesson.previewVideo.videoUrl;
        if (lesson.previewVideos?.[0]?.videoUrl) return lesson.previewVideos[0].videoUrl;
        return null;
    };

    return (
        <>
            <div className="w-full dark:bg-[#222222] bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden">
                {showHeader && (
                    <div className="px-4 sm:px-6 py-4 border-b border-[#DFE1E5]">
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900  dark:text-[#E8ECF3]">
                            Курстун мазмуну
                        </h3>
                        <p className="text-sm sm:text-base dark:text-[#a6adba] text-gray-600 mt-1">
                            {sections.length} бөлүм • {totalLessons} лекция •{' '}
                            {formatMinutesToTime(totalMinutes)}
                        </p>
                    </div>
                )}

                <div className="divide-y divide-[#E6E8EC]">
                    {sections.map((section) => (
                        <div key={section.id}>
                            <button
                                onClick={() => toggleOpen(section.id)}
                                className="flex justify-between items-center w-full px-4 sm:px-6 py-3 text-left transition hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-2 text-[#EA580C] font-semibold">
                                    {openIds.includes(section.id) ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                    <span className="truncate">{section.title}</span>
                                </div>
                                <span className="text-gray-500 dark:text-[#a6adba] text-sm">
                                    {section.lessons.length} лекция •{' '}
                                    {formatMinutesToTime(section.durationMinutes)}
                                </span>
                            </button>

                            <div
                                ref={(el) => (contentRefs.current[section.id] = el)}
                                style={{
                                    maxHeight: openIds.includes(section.id)
                                        ? contentRefs.current[section.id]?.scrollHeight
                                        : 0,
                                    transition: 'max-height 0.3s ease',
                                    overflow: 'hidden',
                                }}
                            >
                                <div className="dark:bg-[#222222] bg-white px-4 sm:px-6 pb-4 space-y-2">
                                    {section.lessons.map((lesson) => {
                                        const locked = isLocked(lesson);
                                        const active = isActive(lesson);
                                        const completed = isCompleted(lesson);
                                        return (
                                            <button
                                                key={lesson.id}
                                                ref={(el) => {
                                                    if (lessonRefs) {
                                                        // eslint-disable-next-line no-param-reassign
                                                        lessonRefs.current[lesson.id] = el;
                                                    }
                                                }}
                                                type="button"
                                                onClick={(e) => {
                                                    if (locked) return;
                                                    // If not enrolled and lesson has a preview video, open preview modal
                                                    if (!enrolled && lesson.previewVideo && lesson.kind !== 'article') {
                                                        e.stopPropagation();
                                                        setPreviewLesson(lesson);
                                                        setPreviewOpen(true);
                                                        return;
                                                    }
                                                    onLessonClick?.(lesson);
                                                }}
                                                disabled={locked}
                                                className={`w-full text-left px-3 sm:px-4 py-4 transition border-b border-[#E6E8EC] last:border-b-0 ${locked
                                                    ? 'bg-gray-50 dark:bg-[#141619] cursor-not-allowed'
                                                    : 'hover:bg-gray-50 cursor-pointer hover:text-gray-800'
                                                    } ${enrolled && active ? 'bg-orange-50 text-gray-800' : ''}`}
                                            >
                                                {enrolled ? (
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1"
                                                            checked={completed}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                if (handleCheckboxToggle) {
                                                                    handleCheckboxToggle(lesson);
                                                                }
                                                            }}
                                                            disabled={locked}
                                                        />
                                                        <div className="flex-1 flex flex-col gap-2">
                                                            <p className="text-sm sm:text-base leading-snug break-words">
                                                                {lesson.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#a6adba]">
                                                                {getIcon(lesson)}
                                                                <span className="text-gray-700 dark:text-[#a6adba]">
                                                                    {formatSecondsToTime(lesson.duration)}
                                                                </span>
                                                                {locked && <TbLock className="text-gray-400 dark:text-[#a6adba]" size={16} />}
                                                            </div>
                                                        </div>
                                                        {lesson.resourceUrl && (
                                                            <div className="flex-shrink-0">
                                                                <a
                                                                    href={lesson.resourceUrl}
                                                                    download
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#E05A22] text-[#E05A22] rounded-lg text-sm hover:bg-orange-50 transition"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    target="_blank"
                                                                >
                                                                    <HiOutlineFolderOpen />
                                                                    Ресурстар
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        {lesson.kind === 'article' ? (
                                                            <FiBookOpen className="text-[#4b4b4b]" size={20} />
                                                        ) : (
                                                            <img
                                                                src={ReelsIcon}
                                                                alt="lesson"
                                                                className="w-6 h-6 flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                            <p className="text-sm sm:text-base text-gray-800 dark:text-white leading-snug break-words">
                                                                {lesson.title}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#a6adba] whitespace-nowrap">
                                                                {lesson.previewVideo && lesson.kind !== 'article' && (
                                                                    <>
                                                                        <RiPlayCircleFill
                                                                            className="text-[#4b4b4b]"
                                                                            size={22}
                                                                        />
                                                                        <span className="text-[#1E72BE] font-semibold">
                                                                            Preview
                                                                        </span>
                                                                    </>
                                                                )}
                                                                <span className="text-gray-700 dark:text-[#a6adba]">
                                                                    {formatSecondsToTime(lesson.duration)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {previewOpen && (
                <ModalPreviewVideo
                    isOpen={previewOpen}
                    onClose={closePreview}
                    previewData={{
                        title: previewLesson?.title,
                        description: previewLesson?.description,
                        coverImageUrl: previewLesson?.coverImageUrl || previewLesson?.thumbnailUrl || '',
                        durationInHours: Math.ceil((previewLesson?.duration || 0) / 3600),
                        previewVideos: [
                            {
                                id: previewLesson?.id,
                                title: previewLesson?.title,
                                videoUrl: getLessonPreviewVideoUrl(previewLesson),
                            },
                        ],
                    }}
                    initialVideo={{
                        id: previewLesson?.id,
                        title: previewLesson?.title,
                        videoUrl: getLessonPreviewVideoUrl(previewLesson),
                    }}
                />
            )}
        </>
    );
};

export default CourseContent;

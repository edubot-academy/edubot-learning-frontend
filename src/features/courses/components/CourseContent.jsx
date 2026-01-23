import React, { useState, useRef, useMemo, useEffect } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { RiPlayCircleFill } from 'react-icons/ri';
import { TbLock } from 'react-icons/tb';
import { FiBookOpen, FiCode } from 'react-icons/fi';
import { MdQuiz, MdDownload } from 'react-icons/md';
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
    compact = false,
}) => {
    const [openIds, setOpenIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const contentRefs = useRef({});

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLesson, setPreviewLesson] = useState(null);
    const closePreview = () => {
        setPreviewOpen(false);
        setPreviewLesson(null);
    };

    useEffect(() => {
        if (sections?.length > 0 && openIds.length === 0) {
            const defaultOpenIds = [sections[0].id];
            if (activeLesson?.sectionId) {
                defaultOpenIds.push(activeLesson.sectionId);
            }
            setOpenIds([...new Set(defaultOpenIds)]);
        }
    }, [sections, activeLesson?.sectionId]);

    useEffect(() => {
        if (activeLesson?.sectionId && !openIds.includes(activeLesson.sectionId)) {
            setOpenIds(prev => [...prev, activeLesson.sectionId]);
        }
    }, [activeLesson?.sectionId, openIds]);

    const toggleOpen = (id) => {
        setOpenIds((prev) =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
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

    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return sections;

        return sections
            .map(section => ({
                ...section,
                lessons: section.lessons?.filter(lesson =>
                    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
                )
            }))
            .filter(section => section.lessons?.length > 0);
    }, [sections, searchQuery]);

    const isLocked = (lesson) => !enrolled && !lesson.previewVideo;
    const isActive = (lesson) => activeLesson && activeLesson.id === lesson.id;
    const isCompleted = (lesson) => completedLessons.includes(lesson.id);

    const getIcon = (lesson) => {
        switch (lesson.kind) {
            case 'article':
                return <FiBookOpen className="text-[#4b4b4b] flex-shrink-0" size={compact ? 16 : 18} />;
            case 'code':
                return <FiCode className="text-[#4b4b4b] flex-shrink-0" size={compact ? 16 : 18} />;
            case 'quiz':
                return <MdQuiz className="text-[#4b4b4b] flex-shrink-0" size={compact ? 16 : 18} />;
            default:
                return <RiPlayCircleFill className="text-[#4b4b4b] flex-shrink-0" size={compact ? 18 : 22} />;
        }
    };

    const getLessonStatus = (lesson) => {
        if (isLocked(lesson)) return 'locked';
        if (isActive(lesson)) return 'active';
        if (isCompleted(lesson)) return 'completed';
        return 'available';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'border-l-4 border-l-orange-500 bg-orange-50';
            case 'completed': return 'bg-green-50 border-l-4 border-l-green-500';
            case 'locked': return 'bg-gray-100 opacity-70';
            default: return 'hover:bg-gray-50';
        }
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

    const handleLessonClick = (e, lesson) => {
        const locked = isLocked(lesson);
        if (locked) return;

        if (!enrolled && lesson.previewVideo && lesson.kind !== 'article') {
            e.stopPropagation();
            setPreviewLesson(lesson);
            setPreviewOpen(true);
            return;
        }

        onLessonClick?.(lesson);
    };

    const handleDownload = (e, resourceUrl) => {
        e.stopPropagation();
        window.open(resourceUrl, '_blank');
    };

    return (
        <>
            <div className="w-full dark:bg-[#222222] bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden">
                {showHeader && (
                    <div className="px-4 sm:px-6 py-4 border-b border-[#DFE1E5]">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900  dark:text-[#E8ECF3]">
                                        Курстун мазмуну
                                    </h3>
                                    <p className="text-sm sm:text-base dark:text-[#a6adba] text-gray-600 mt-1">
                                        {sections.length} бөлүм • {totalLessons} лекция •{' '}
                                        {formatMinutesToTime(totalMinutes)}
                                    </p>
                                </div>

                                {enrolled && sections.length > 5 && (
                                    <div className="w-full sm:w-auto sm:max-w-xs">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Лекциялардан издөө..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {enrolled && !compact && (
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                                        <span className="whitespace-nowrap">Активдүү лекция</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                                        <span className="whitespace-nowrap">Аякталган</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0"></div>
                                        <span className="whitespace-nowrap">Кичинекей</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {searchQuery && filteredSections.length === 0 && (
                    <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                        " {searchQuery} " сураныч менен табылган жок
                    </div>
                )}

                <div className="divide-y divide-[#E6E8EC]">
                    {filteredSections.map((section) => {
                        const sectionCompleted = section.lessons?.every(lesson =>
                            completedLessons.includes(lesson.id)
                        );

                        return (
                            <div key={section.id}>
                                <button
                                    onClick={() => toggleOpen(section.id)}
                                    className={`flex items-center justify-between w-full px-4 sm:px-6 py-3 text-left transition hover:bg-gray-50 ${compact ? 'py-2' : 'py-3'}`}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className="text-[#EA580C] font-semibold flex items-center gap-2 min-w-0">
                                            {openIds.includes(section.id) ? (
                                                <IoIosArrowUp className="flex-shrink-0" />
                                            ) : (
                                                <IoIosArrowDown className="flex-shrink-0" />
                                            )}
                                            <span className="truncate">{section.title}</span>
                                        </div>
                                        {enrolled && sectionCompleted && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0 ml-2">
                                                Аякталды
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 ml-4 flex-shrink-0">
                                        <span className="whitespace-nowrap">
                                            {section.lessons?.length || 0} лекция
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="whitespace-nowrap">
                                            {formatMinutesToTime(section.durationMinutes)}
                                        </span>
                                        {enrolled && (
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded whitespace-nowrap ml-2">
                                                {section.lessons?.filter(l => completedLessons.includes(l.id)).length || 0}/
                                                {section.lessons?.length || 0}
                                            </span>
                                        )}
                                    </div>
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
                                    <div className={`bg-white px-4 sm:px-6 ${compact ? 'pb-2' : 'pb-4'} space-y-1`}>
                                        {section.lessons?.map((lesson) => {
                                            const locked = isLocked(lesson);
                                            const active = isActive(lesson);
                                            const completed = isCompleted(lesson);
                                            const status = getLessonStatus(lesson);
                                            const statusColor = getStatusColor(status);

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    ref={(el) => {
                                                        if (lessonRefs) {
                                                            lessonRefs.current[lesson.id] = el;
                                                        }
                                                    }}
                                                    type="button"
                                                    onClick={(e) => handleLessonClick(e, lesson)}
                                                    disabled={locked}
                                                    className={`w-full text-left p-3 sm:p-4 transition rounded-lg border border-transparent ${statusColor} ${locked ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'} ${compact ? 'py-2' : ''}`}
                                                >
                                                    {enrolled ? (
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                            <div className="flex items-start gap-3 w-full">
                                                                <div className="relative flex-shrink-0 mt-0.5">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
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
                                                                    {active && (
                                                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                                                                        <p className={`font-medium ${compact ? 'text-sm' : 'text-base'} text-gray-800 leading-snug break-words ${completed ? 'line-through opacity-70' : ''}`}>
                                                                            {lesson.title}
                                                                        </p>
                                                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                                            {getIcon(lesson)}
                                                                            <span className="whitespace-nowrap">
                                                                                {formatSecondsToTime(lesson.duration)}
                                                                            </span>
                                                                            {locked && <TbLock className="text-gray-400 flex-shrink-0" size={14} />}
                                                                        </div>
                                                                    </div>

                                                                    {!compact && lesson.description && (
                                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                                            {lesson.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {lesson.resourceUrl && (
                                                                <div className="sm:self-start flex-shrink-0">
                                                                    <button
                                                                        onClick={(e) => handleDownload(e, lesson.resourceUrl)}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-[#E05A22] text-[#E05A22] rounded-lg hover:bg-orange-50 transition whitespace-nowrap w-full sm:w-auto"
                                                                        title="Ресурстарды жүктөө"
                                                                    >
                                                                        <MdDownload size={16} />
                                                                        <span className="hidden sm:inline">Ресурстар</span>
                                                                        <span className="sm:hidden">Жүктөө</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                            <div className="flex items-start gap-3 w-full">
                                                                {lesson.kind === 'article' ? (
                                                                    <FiBookOpen className="text-[#4b4b4b] flex-shrink-0" size={compact ? 16 : 20} />
                                                                ) : (
                                                                    <img
                                                                        src={ReelsIcon}
                                                                        alt="video lesson"
                                                                        className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`}
                                                                    />
                                                                )}

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                                                                        <p className={`${compact ? 'text-sm' : 'text-base'} text-gray-800 leading-snug break-words`}>
                                                                            {lesson.title}
                                                                        </p>
                                                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                                            {lesson.previewVideo && lesson.kind !== 'article' && (
                                                                                <>
                                                                                    <RiPlayCircleFill
                                                                                        className="text-[#4b4b4b] flex-shrink-0"
                                                                                        size={compact ? 16 : 22}
                                                                                    />
                                                                                    <span className="text-[#1E72BE] font-semibold whitespace-nowrap">
                                                                                        Preview
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                            <span className="whitespace-nowrap">
                                                                                {formatSecondsToTime(lesson.duration)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
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
                        );
                    })}
                </div>

                {enrolled && completedLessons.length > 0 && !compact && (
                    <div className="px-4 sm:px-6 py-3 border-t border-[#DFE1E5] bg-gray-50">
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                            <div className="text-sm text-gray-600 whitespace-nowrap">
                                Прогресс: {completedLessons.length}/{totalLessons} лекция
                            </div>
                            <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                                {Math.round((completedLessons.length / totalLessons) * 100)}%
                            </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(completedLessons.length / totalLessons) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
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
                                duration: previewLesson?.duration,
                            },
                        ],
                    }}
                    initialVideo={{
                        id: previewLesson?.id,
                        title: previewLesson?.title,
                        videoUrl: getLessonPreviewVideoUrl(previewLesson),
                        duration: previewLesson?.duration,
                    }}
                />
            )}
        </>
    );
};

CourseContent.defaultProps = {
    compact: false,
};

export default CourseContent;
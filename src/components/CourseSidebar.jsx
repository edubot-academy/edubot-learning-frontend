import React from "react";
import { FiChevronDown, FiVideo, FiFileText, FiDownload, FiCode } from 'react-icons/fi';
import { formatDuration } from '../utils/timeUtils';
import { formatReadTime, getResourceMeta } from '../utils/lessonUtils';


const CourseSidebar = ({
    sections = [],
    activeSectionId,
    toggleSection,
    activeLesson,
    handleLessonClick,
    handleCheckboxToggle,
    completedLessons = [],
    enrolled,
    lessonRefs,
}) => {
    const handleResourceDownload = (event, url) => {
        event.stopPropagation();
        event.preventDefault();
        if (url && typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md md:sticky md:top-28 self-start 
            max-h-none overflow-visible 
            md:max-h-[calc(100vh-7rem)] md:overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Курстун мазмуну</h2>

            {sections.map((section) => {
                const isOpen = activeSectionId === section.id;

                return (
                    <div key={section.id} className="mb-4 border-b pb-2">
                        <div
                            className="flex justify-between items-center cursor-pointer hover:text-blue-600"
                            onClick={() => toggleSection(section.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && toggleSection(section.id)}
                        >
                            <h3 className="font-medium text-lg">{section.title}</h3>
                            <span
                                className={`ml-2 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                    }`}
                            >
                                <FiChevronDown className="w-5 h-5" />
                            </span>
                        </div>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px]" : "max-h-0"}`}>
                            {isOpen && section.lessons?.map((lesson) => {
                                const isActive = activeLesson?.id === lesson.id;
                                const isArticle = lesson.kind === 'article';
                                const isQuiz = lesson.kind === 'quiz';
                                const isCode = lesson.kind === 'code';
                                const durationLabel = isQuiz
                                    ? 'Квиз'
                                    : isCode
                                        ? 'Код тапшырма'
                                        : isArticle
                                            ? formatReadTime(lesson.duration)
                                            : formatDuration(lesson.duration);
                                const resourceMeta =
                                    !lesson.locked && lesson.resourceUrl
                                        ? getResourceMeta(lesson.resourceKey, lesson.resourceName)
                                        : null;

                                return (
                                    <button
                                        type="button"
                                        key={lesson.id}
                                        ref={(el) => {
                                            if (lesson.id === activeLesson?.id) {
                                                lessonRefs.current[lesson.id] = el;
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            if (!e.nativeEvent.isTrusted) return;
                                            e.preventDefault();
                                            handleLessonClick(lesson);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleLessonClick(lesson);
                                            }
                                        }}
                                        onPointerDown={(e) => {
                                            if (!e.nativeEvent.isTrusted) return;
                                            e.preventDefault();
                                            handleLessonClick(lesson);
                                        }}

                                        className={`flex items-center justify-between pl-2 pr-2 py-3 mt-1 rounded-md cursor-pointer transition-all w-full text-left
                                      ${isActive
                                                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                                                : "text-gray-800"
                                            }
                                      focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-transparent hover:bg-transparent active:outline-none`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={completedLessons.includes(lesson.id)}
                                                onClick={(e) => {
                                                    console.log('checkbox click sidebar');
                                                    e.stopPropagation()
                                                }}
                                                onChange={(e) => {
                                                    console.log('checkbox change sidebar');
                                                    e.stopPropagation();
                                                    if (e.nativeEvent.isTrusted) {
                                                        handleCheckboxToggle(lesson);
                                                    }
                                                }}
                                                disabled={!enrolled}
                                            />

                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-2">
                                                    {lesson.title}
                                                </span>
                                                {durationLabel && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        {isArticle ? (
                                                            <FiFileText className="w-4 h-4" />
                                                        ) : isQuiz ? (
                                                            <FiFileText className="w-4 h-4" />
                                                        ) : isCode ? (
                                                            <FiCode className="w-4 h-4" />
                                                        ) : (
                                                            <FiVideo className="w-4 h-4" />
                                                        )}
                                                        {durationLabel}
                                                    </span>
                                                )}
                                                {resourceMeta && isActive && (
                                                    <span
                                                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-edubot-orange bg-orange-50 border border-orange-100 rounded px-2 py-1 truncate max-w-[200px]"
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={(e) =>
                                                            handleResourceDownload(e, lesson.resourceUrl)
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleResourceDownload(e, lesson.resourceUrl);
                                                            }
                                                        }}
                                                    >
                                                        <FiDownload className="text-xs" />
                                                        <span className="truncate">{resourceMeta.fileName}</span>
                                                        <span className="text-[10px] uppercase text-gray-500">
                                                            {resourceMeta.typeLabel}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {lesson.kind !== 'article' && lesson.previewVideo && !enrolled && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded" title="Ачык сабак">
                                                    Превью
                                                </span>
                                            )}
                                            {lesson.locked && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded" title="Курс жазылуусу талап кылынат">
                                                    Жабык
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CourseSidebar;

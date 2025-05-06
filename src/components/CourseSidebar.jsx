import React from "react";
import { FiChevronDown } from 'react-icons/fi';

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
                                                {lesson.duration && (
                                                    <span className="text-xs text-gray-500">Узактыгы: {lesson.duration}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {lesson.previewVideo && !enrolled && (
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

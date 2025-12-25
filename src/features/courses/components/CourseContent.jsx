import React, { useState, useRef } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import ReelsIcon from '@assets/icons/reelsIcon.svg';
import VideoIcon from '@assets/icons/video.svg';
import { formatMinutesToTime, formatSecondsToTime } from '../../../utils/timeUtils';

const CourseContent = ({ sections }) => {
    const [openIds, setOpenIds] = useState([]);
    const contentRefs = useRef({});

    const toggleOpen = (id) => {
        if (openIds.includes(id)) {
            setOpenIds(openIds.filter((openId) => openId !== id));
        } else {
            setOpenIds([...openIds, id]);
        }
    };

    return (
        <div className="mx-auto rounded-sm w-full max-w-[613px] space-y-0">
            {sections.map((section) => (
                <div key={section.id} className="border border-[#DFE1E5] bg-white ">
                    <button
                        onClick={() => toggleOpen(section.id)}
                        className="flex justify-between items-center w-full px-4 py-3 text-left transition hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-2 text-[#EA580C] font-semibold">
                            {openIds.includes(section.id) ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            {section.title}
                        </div>
                        <span className="text-gray-500 text-sm">
                            {section.lessons.length} сабак {section.durationMinutes ? '• ' : ''}
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
                        <div className="border-t !border-white bg-white px-4 py-2 w-full space-y-2">
                            {section.lessons.map((lesson, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-start gap-4 border border-[#DFE1E5] rounded px-3 py-2 bg-white w-full"
                                >
                                    <div className="flex items-start gap-2 flex-1">
                                        <img src={ReelsIcon} alt="reel" className="w-5 h-5 mt-1" />
                                        <p className="text-gray-700 text-sm break-words">
                                            {lesson.title}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <img src={VideoIcon} alt="video" className="w-5 h-5" />
                                        <p className="text-gray-700 text-sm break-words">
                                            {lesson.previewVideo ? 'Превью' : ''}
                                        </p>
                                        <span className="text-gray-500 text-xs">
                                            {formatSecondsToTime(lesson.duration)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseContent;

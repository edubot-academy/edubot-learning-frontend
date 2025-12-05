import React, { useState, useRef, useEffect } from 'react';
import DownArrow from '@assets/icons/downArrow.svg';
import ReelsIcon from '@assets/icons/reelsIcon.svg';
import VideoIcon from '@assets/icons/video.svg';

const IntroductionBeforeRegistr = () => {
    const introductions = [
        {
            id: 1,
            title: 'Введение',
            lectures: '6 lectures • 20min',
            items: [
                {
                    reelText:
                        'When it comes to creating online courses, most people focus on the wrong things',
                    videoText: 'Preview',
                    videoDuration: '03:00',
                },
            ],
        },
        {
            id: 2,
            title: 'Введение',
            lectures: '4 lectures • 15min',
            items: [
                {
                    reelText: 'Planning your course content is key',
                    videoText: 'Preview',
                    videoDuration: '02:30',
                },
            ],
        },
    ];

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
            {introductions.map((intro) => (
                <div key={intro.id} className="border border-[#DFE1E5] bg-white ">
                    <button
                        onClick={() => toggleOpen(intro.id)}
                        className="flex justify-between items-center w-full px-4 py-3 text-left transition hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-2 text-[#EA580C] font-semibold">
                            <img src={DownArrow} alt="" className="w-4 h-4" />
                            {intro.title}
                        </div>
                        <span className="text-gray-500 text-sm">{intro.lectures}</span>
                    </button>

                    <div
                        ref={(el) => (contentRefs.current[intro.id] = el)}
                        style={{
                            maxHeight: openIds.includes(intro.id)
                                ? contentRefs.current[intro.id]?.scrollHeight
                                : 0,
                            transition: 'max-height 0.3s ease',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="border-t !border-white bg-white px-4 py-2 w-full space-y-2">
                            {intro.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-start gap-4 border border-[#DFE1E5] rounded px-3 py-2 bg-white w-full"
                                >
                                    <div className="flex items-start gap-2 flex-1">
                                        <img src={ReelsIcon} alt="reel" className="w-5 h-5 mt-1" />
                                        <p className="text-gray-700 text-sm break-words">
                                            {item.reelText}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <img src={VideoIcon} alt="video" className="w-5 h-5" />
                                        <p className="text-gray-700 text-sm break-words">
                                            {item.videoText}
                                        </p>
                                        <span className="text-gray-500 text-xs">
                                            {item.videoDuration}
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

export default IntroductionBeforeRegistr;

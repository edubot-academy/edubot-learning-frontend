import IntroductionBeforeRegistr from '@shared/ui/IntroductionBeforeRegistr';
import React, { useEffect } from 'react';
import { RiCloseLargeFill } from "react-icons/ri";

function ModalCourses({ onClose, course, videoUrl, videoRef }) {

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded max-w-xl w-full shadow-xl m-4 p-2 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between p-5 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">{course.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {course.description || 'Описание курса скоро будет добавлено...'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <RiCloseLargeFill className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative w-full ">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        autoPlay
                        playsInline
                        className="w-full aspect-video"
                    />
                </div>
                <div className='py-3'>
                    <IntroductionBeforeRegistr />
                </div>
            </div>
        </div>
    );
}

export default ModalCourses;

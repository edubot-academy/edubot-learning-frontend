import IntroductionBeforeRegistr from '@shared/ui/IntroductionBeforeRegistr';
import React from 'react';
import { RiCloseLargeFill } from "react-icons/ri";


function ModalCourses({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded max-w-xl w-full shadow-xl overflow-hidden p-4">
                <div className="flex items-start justify-between p-5 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">Figma UI UX Design Essentials</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Use Figma to get a job in UI Design, User Interfaces, User Experience design, UX Design & Web Design
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <RiCloseLargeFill className="w-5 h-5" />
                    </button>
                </div>
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative">
                    <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        ▶
                    </button>
                </div>
                <div className='py-3'>
                <IntroductionBeforeRegistr />
                </div>
            </div>
        </div>
    );
}

export default ModalCourses;

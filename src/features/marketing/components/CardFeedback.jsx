import React from 'react';
import { IoStarSharp } from 'react-icons/io5';

const CardFeedback = ({ index, text, image, name, role }) => {
    return (
        <div>
            <div
                key={index}
                className="bg-white p-6 rounded-xl border shadow-sm text-left flex flex-col h-96"
            >
                <div className="flex gap-3 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div className="border border-gray rounded-full px-2.5 py-1" key={i}>
                            <span className="text-xl md:text-3xl">★</span>
                        </div>
                    ))}
                </div>

                <h1 className="font-medium text-lg text-[#141619] leading-[36px] mt-4 mb-2">
                    Exceptional Service
                </h1>

                <p className="text-gray-700 leading-relaxed text-sm line-clamp-5">{text}</p>
                <div className="flex items-center gap-3 mt-auto">
                    <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <h4 className="font-medium text-lg text-[#141619] leading-[32px]">
                            {name}
                        </h4>
                        <p className="font-normal font-[Suisse Intl] text-sm text-[#3E424A]">
                            {role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardFeedback;

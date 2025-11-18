import React from 'react';

const CardInstructor = ({ img, name, position, students }) => {
    return (
        <div className="bg-white rounded flex flex-col overflow-hidden p-3 border border-[#C5C9D1]">
            <img src={img} alt={name} className="w-full h-96 object-cover rounded" />
            <h3 className="text-lg font-semibold text-black mt-4 mb-2">{name}</h3>
            <p className="text-sm text-gray-500">{position}</p>
            <div className="flex mt-4 gap-2 items-center">
                <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span className='text-2xl' key={i}>★</span>
                        ))}
                    </div>
                </div>
                <span className="text-sm text-gray-500">({students} студентов)</span>
            </div>
        </div>
    );
};

export default CardInstructor;

import React from 'react';
import StarImg from "../assets/icons/star.svg";

const CardInstructor = ({ img, name, position, rating, students }) => {
  return (
    <div className="bg-white shadow-md rounded-xl flex flex-col overflow-hidden px-6 py-7 border border-[#C5C9D1]">
      <img src={img} alt={name} className="w-full h-64 object-cover rounded-md" />
      <h3 className="text-lg font-semibold text-black mt-4 mb-2">{name}</h3>
      <p className="text-sm text-gray-500">{position}</p>
      <div className="flex mt-4 gap-2 items-center">
        <div className="flex items-center gap-1">
          <img src={StarImg} alt="звезда" className="w-5 h-5" />
          <span className="text-sm text-black">{rating}</span>
        </div>
        <span className="text-sm text-gray-500">({students} студентов)</span>
      </div>
    </div>
  );
};

export default CardInstructor;

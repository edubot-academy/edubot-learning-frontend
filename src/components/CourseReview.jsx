import React from "react";
import Star from "../assets/icons/star.svg";

const CourseReview = () => {
  return (
    <div className="w-full max-w-[360px] bg-white rounded-xl shadow-md p-5 flex flex-col justify-between gap-5">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">Отзывы (236)</h2>
        <button className="text-xs text-[#5A5F69] hover:text-[#7B818C]">
          смотреть все
        </button>
      </div>

      <div>
        <p className="text-[40px] font-bold text-[#C2410C] leading-none">4.9</p>
        <div className="flex items-center mt-1.5">
          <img src={Star} alt="star" className="w-4 h-4 mr-0.5" />
          <img src={Star} alt="star" className="w-4 h-4 mr-0.5" />
          <img src={Star} alt="star" className="w-4 h-4 mr-0.5" />
          <img src={Star} alt="star" className="w-4 h-4 mr-0.5" />
          <img src={Star} alt="star" className="w-4 h-4" />
        </div>
        <p className="text-xs text-[#5A5F69] mt-1.5">236 отзывов</p>
      </div>
    </div>
  );
};

export default CourseReview;

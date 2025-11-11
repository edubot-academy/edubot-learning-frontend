import React from "react";
import Star from "../assets/icons/star.svg";

const CourseReview = () => {
  return (
    <div className="w-full max-w-[360px] bg-white rounded-xl shadow-md p-5 flex flex-col justify-between gap-5">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">Отзывы (236)</h2>
        <button className="text-xs text-[#EA580C] hover:underline">
          смотреть все
        </button>
      </div>

      <div className="space-y-2.5">
        {[
          { label: "Доступность объяснений", value: 4.9 },
          { label: "Креативное мышление", value: 4.9 },
          { label: "Умение вдохновлять студентов", value: 4.9 },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-20">
            <p className="text-[10px] w-[120px] text-[#5A5F69]">{item.label}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-[90px] bg-[#C5C9D1] h-2 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(item.value / 5) * 100}%`,
                    backgroundColor: "#EA580C",
                  }}
                ></div>
              </div>
              <span className="w-[20px] text-gray-800 font-medium">
                {item.value.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
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

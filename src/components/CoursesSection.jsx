import React from "react";
import { AiOutlineLeftCircle, AiOutlineRightCircle } from "react-icons/ai";

const CoursesSection = ({ title, children }) => {
  return (
    <div className="mb-10 px-4 sm:px-6 lg:px-0">
      <div className="w-full max-w-[1200px] mx-auto flex justify-between items-center">
        <h3 className="text-base sm:text-xl md:text-2xl font-semibold">
          {title}
        </h3>
        {/* Иконки скрыты на телефонах (xs), показываются с sm */}
        <div className="hidden sm:flex gap-4 sm:gap-5 text-edubot-green #0EA78B">
          <AiOutlineLeftCircle size={34} />
          <AiOutlineRightCircle size={34} />
        </div>
      </div>
      {children}
    </div>
  );
};

export default CoursesSection;

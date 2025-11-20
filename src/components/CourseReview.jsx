import React, { useState } from "react";

const CourseReview = ({ ratingCount, ratingAverage }) => {
  const [rating, setRating] = useState(0);

  const handleStarClick = (clickedRating) => {
    setRating(clickedRating);
  };

  const getStarFillPercentage = (starIndex) => {
    const currentRating = ratingAverage || 0;

    if (currentRating >= starIndex) {
      return 100;
    } else if (currentRating > starIndex - 1) {
      return (currentRating - (starIndex - 1)) * 100;
    } else {
      return 0;
    }
  };

  const StarIcon = ({ fillPercentage }) => {
    const starId = `star-gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="relative w-4 h-4 mr-0.5">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={`url(#${starId})`}
          stroke="#F59E0B"
          strokeWidth="1.5"
        >
          <defs>
            <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset={`${fillPercentage}%`} stopColor="#F59E0B" />
              <stop offset={`${fillPercentage}%`} stopColor="white" />
            </linearGradient>
          </defs>
          <path d="M12 2l1.8 8.4 8.2.2-6.5 5 2.5 7.4-6-4.8-6 4.8 2.5-7.4-6.5-5 8.2-.2L12 2z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[360px] bg-white rounded-xl shadow-md p-5 flex flex-col justify-between gap-5">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">
          Отзывы {ratingCount}
        </h2>
        <button className="text-xs text-[#5A5F69] hover:text-[#7B818C]">
          смотреть все
        </button>
      </div>

      <div>
        <p className="text-[40px] font-bold text-[#C2410C] leading-none">
          {ratingAverage ? ratingAverage.toFixed(1) : 0}
        </p>
        <div className="flex items-center mt-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="focus:outline-none transition-transform duration-150 hover:scale-110"
              onClick={() => handleStarClick(star)}
            >
              <StarIcon fillPercentage={getStarFillPercentage(star)} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseReview;

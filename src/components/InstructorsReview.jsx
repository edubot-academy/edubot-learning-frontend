import React from "react";
import Star from "../assets/icons/star.svg";
import CheckCircle from "../assets/icons/check.svg";
import Briefcase from "../assets/icons/academicCap.svg";
import BookOpen from "../assets/icons/bookOpen.svg";
import ReviewersPhoto from "../assets/images/reviewersPhoto.png";
import People from "../assets/icons/people.svg";

function InstructorsReview() {
  return (
    <div className="max-w-[700px] w-full mx-auto bg-white rounded-xl shadow-md p-6 md:p-8 flex flex-col md:flex-row gap-6">
      <div className="flex-shrink-0 flex flex-col items-center justify-start">
        <img
          src={ReviewersPhoto}
          alt="Feruza"
          className="w-[90px] h-[90px] object-cover rounded-lg"
        />
      </div>

      <div className="flex-1 flex flex-col justify-start gap-2 max-w-full md:max-w-[600px]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="bg-green-100 text-green-600 px-2 py-0.5 text-xs font-semibold rounded-md">
              TOP tutor
            </span>
            <img src={Star} alt="star" className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">4.0</span>
          </div>

          <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-1 flex-wrap">
            Феруза Альменовна
            <img
              src={CheckCircle}
              alt="check"
              className="w-5 h-5 text-blue-500"
            />
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-3">UX-UI designer</p>
        
        {/* Сдвинутые влево элементы */}
        <div className="ml-0 md:ml-[-110px] flex flex-col gap-4">
          <p className="text-gray-700 text-m md:text-base leading-relaxed break-words">
            Я — UX/UI дизайнер с опытом более ___ лет в создании удобных и
            красивых цифровых продуктов. Прошла путь от первых макетов в Figma до
            работы над сложными платформами для бизнеса и стартапов. В своей
            менторской практике делюсь не только знаниями о дизайне, но и
            реальными кейсами из проектов, помогаю ученикам формировать
            насмотренность, развивать мышление и уверенно строить карьеру в IT.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-[500px]">
            {[
              "Ecommerce",
              "Design",
              "Graphic design",
              "UX-UI design",
              "Marketing",
              "Branding",
              "Illustration",
              "Web Design",
            ].map((tag, i) => (
              <span
                key={i}
                className="bg-black text-white text-sm px-3 py-1 rounded-2xl text-center truncate"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <img src={Briefcase} alt="briefcase" className="w-4 h-4" />
              <span>7+ years experience</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={BookOpen} alt="book" className="w-4 h-4" />
              <span>25 courses</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={People} alt="book" className="w-4 h-4" />
              <span>120+ students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorsReview;
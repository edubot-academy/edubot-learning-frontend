import React from 'react';
import { RiCheckboxCircleFill } from "react-icons/ri";
import { GrLanguage } from "react-icons/gr";
import { RiSpam2Line } from "react-icons/ri";

const CourseDescription = ({ course }) => {
    if (!course) return <div>Загрузка...</div>;

    const isNew = () => {
        if (course.createdAt) {
            const created = new Date(course.createdAt);
            const now = new Date();
            const diff = Math.ceil(Math.abs(now - created) / (1000 * 60 * 60 * 24));
            return diff < 30;
        }
        return false;
    };

    return (
        <div
    className="
        max-w-4xl 
        mx-auto 
        px-4 
        sm:px-6 
        lg:px-8 
        py-6 
        sm:py-8
        border 
        border-[#C5C9D1]
        rounded-xl
        mb-6
    "
>


            <div className="mb-6 sm:mb-8">
                <h1
                    className="
        whitespace-nowrap
        text-lg
        sm:text-xl
        md:text-2xl
        lg:text-3xl
        xl:text-4xl
        font-bold
        text-gray-900
        mb-4
        leading-tight
    "
                >
                    {course.title}
                </h1>


                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {isNew() && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800 w-fit">
                            Новый выпуск
                        </span>
                    )}

                    <div className="flex flex-wrap gap-3 sm:gap-6 text-sm">
                        {(course.updatedAt || course.createdAt) && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <RiSpam2Line size={18} />
                                {course.updatedAt
                                    ? `обновлен ${new Date(course.updatedAt).toLocaleDateString('ru-RU')}`
                                    : `создан ${new Date(course.createdAt).toLocaleDateString('ru-RU')}`}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600">
                            <GrLanguage />
                            {course.language || "Русский"}
                        </div>

                        {course.category && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-blue-500">📁</span>
                                {course.category.name || course.category}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DESCRIPTION — всегда центрируется по вертикали */}
            <div className="flex items-center gap-3">

                <RiCheckboxCircleFill
                    color="#EA580C"
                    size={22}
                    className="flex-shrink-0"
                />

                <p className="
        text-sm sm:text-base md:text-lg
        text-gray-600 leading-relaxed
        line-clamp-2 break-words
    ">
                    {course.description || "Описание курса скоро будет добавлено..."}
                </p>

            </div>

        </div>
    );
};

export default CourseDescription;

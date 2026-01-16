import React from 'react';
import { RiCheckboxCircleFill } from 'react-icons/ri';
import { GrLanguage } from 'react-icons/gr';
import { RiSpam2Line } from 'react-icons/ri';

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

    const outcomes =
        course.learningOutcomes && course.learningOutcomes.length > 0
            ? course.learningOutcomes
            : course.description
            ? [course.description]
            : [];

    return (
        <div className="w-full border border-[#C5C9D1] rounded-xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-4 sm:mb-6 space-y-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold leading-tight break-words">
                    {course.title}
                </h1>
                {course.subtitle && (
                    <p className="text-base sm:text-lg leading-relaxed break-words">
                        {course.subtitle}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                    {isNew() && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                            Новый выпуск
                        </span>
                    )}

                    {(course.updatedAt || course.createdAt) && (
                        <div className="flex items-center gap-2">
                            <RiSpam2Line size={18} />
                            {course.updatedAt
                                ? `последнее обновление ${new Date(course.updatedAt).toLocaleDateString('ru-RU')}`
                                : `создан ${new Date(course.createdAt).toLocaleDateString('ru-RU')}`}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <GrLanguage />
                        {course.language || 'Русский'}
                    </div>

                    {course.category && (
                        <div className="flex items-center gap-2">
                            <span className="text-blue-500">📁</span>
                            {course.category.name || course.category}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {outcomes.length === 0 ? (
                    <div className="flex items-center gap-3">
                        <RiCheckboxCircleFill color="#EA580C" size={20} className="flex-shrink-0" />
                        <p className="text-sm sm:text-base">
                            Описание курса скоро будет добавлено...
                        </p>
                    </div>
                ) : (
                    outcomes.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                            <RiCheckboxCircleFill
                                color="#EA580C"
                                size={20}
                                className="flex-shrink-0 mt-1"
                            />
                            <p className="text-sm sm:text-base md:text-lg leading-relaxed break-words">
                                {item}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseDescription;

import React from "react";
import { formatHoursToTime } from "../utils/timeUtils";

const CourseHeader = ({ course, progress, enrolled }) => {
    return (
        <div className="w-full bg-gray-800 text-white min-h-[380px] py-12 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
                <p className="text-md md:text-lg leading-relaxed whitespace-pre-line mb-2">
                    {course.description}
                </p>

                {course.durationInHours > 0 && (
                    <p className="text-sm text-gray-300 mb-4">
                        ⏱️ Жалпы узактыгы: {formatHoursToTime(course.durationInHours)}
                    </p>
                )}

                {course.instructor && (
                    <div className="mt-4 flex items-center gap-4">
                        {course.instructor.avatar ? (
                            <img
                                src={course.instructor.avatar}
                                alt={course.instructor.fullName}
                                className="w-12 h-12 rounded-full"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
                                {course.instructor.fullName?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">{course.instructor.fullName}</p>
                            <p className="text-sm text-gray-300">{course.instructor.bio}</p>
                        </div>
                    </div>
                )}

                {enrolled && (
                    <div className="max-w-6xl mx-auto my-6">
                        <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-white mt-1 text-right">{progress}% бүттү</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseHeader;

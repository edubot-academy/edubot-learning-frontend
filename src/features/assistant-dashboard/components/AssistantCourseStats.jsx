import React from "react";

const AssistantCourseStats = ({ courses, courseCounts, loading }) => {
    return (
        <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-[#a6adba]">
            {courses.map((course) => (
                <div key={course.id} className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded">
                    {course.title}: {courseCounts[course.id] || 0} студент
                </div>
            ))}

            {!courses.length && !loading && (
                <div className="text-gray-500 dark:text-[#a6adba] italic">Курс табылган жок.</div>
            )}
        </div>
    );
};

export default AssistantCourseStats;

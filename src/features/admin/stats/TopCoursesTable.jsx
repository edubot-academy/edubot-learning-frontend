import React from 'react';
import { SmoothTabTransition } from '@components/ui';
import Loader from '@shared/ui/Loader';

const TopCoursesTable = ({ courses, formatNumber, formatPercent, formatCurrency, loading }) => (
    <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Алдыңкы курстар</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                    Активдүүлүк & киреше
                </h3>
            </div>
        </div>

        <SmoothTabTransition isLoading={loading} isDataLoaded={courses.length > 0}>
            <div className="overflow-x-auto">
                {courses.length ? (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 dark:text-gray-400 text-left">
                                <th className="py-2 pr-3 font-medium">Курс</th>
                                <th className="py-2 pr-3 font-medium">Каттоолор</th>
                                <th className="py-2 pr-3 font-medium">Активдүү (7к)</th>
                                <th className="py-2 pr-3 font-medium">Аяктоо</th>
                                <th className="py-2 pr-3 font-medium">Ревеню</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {courses.map((course) => (
                                <tr key={course.courseId || course.title}>
                                    <td className="py-2 pr-3 font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                        {course.title}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                        {formatNumber(course.enrollments)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                        {formatNumber(course.activeStudents7d)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                        {formatPercent(course.completionRate)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                                        {formatCurrency(course.revenueTotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                        Алдыңкы курстар дагы жок.
                    </p>
                )}
            </div>
        </SmoothTabTransition>
    </div>
);

export default TopCoursesTable;

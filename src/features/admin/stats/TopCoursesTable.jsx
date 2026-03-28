import React from 'react';
import { SmoothTabTransition } from '@components/ui';
import Loader from '@shared/ui/Loader';

const TopCoursesTable = ({ courses, formatNumber, formatPercent, formatCurrency, loading }) => (
    <div className="group relative overflow-hidden rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-950 space-y-3">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-edubot-orange/8 opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5 dark:to-edubot-soft/10" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-edubot-orange/10 blur-3xl transition-all duration-300 group-hover:scale-125 dark:bg-edubot-soft/10" />
        <div className="relative flex items-center justify-between">
            <div>
                <p className="text-sm text-edubot-muted dark:text-slate-400">Курс рейтинги</p>
                <h3 className="text-xl font-semibold text-edubot-ink transition-colors duration-300 group-hover:text-edubot-orange dark:text-[#E8ECF3] dark:group-hover:text-edubot-soft">
                    Эң активдүү жана кирешелүү курстар
                </h3>
            </div>
        </div>

        <SmoothTabTransition isLoading={loading} isDataLoaded={courses.length > 0}>
            <div className="relative overflow-x-auto">
                {courses.length ? (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-edubot-muted dark:text-slate-400 text-left border-b border-edubot-line/70 dark:border-slate-700">
                                <th className="py-2 pr-3 font-medium">Курс</th>
                                <th className="py-2 pr-3 font-medium">Каттоолор</th>
                                <th className="py-2 pr-3 font-medium">Активдүү (7к)</th>
                                <th className="py-2 pr-3 font-medium">Аяктоо</th>
                                <th className="py-2 pr-3 font-medium">Ревеню</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-edubot-line/70 dark:divide-slate-700">
                            {courses.map((course) => (
                                <tr key={course.courseId || course.title}>
                                    <td className="py-3 pr-3 font-semibold text-edubot-ink dark:text-[#E8ECF3]">
                                        {course.title}
                                    </td>
                                    <td className="py-3 pr-3 text-edubot-muted dark:text-gray-300">
                                        {formatNumber(course.enrollments)}
                                    </td>
                                    <td className="py-3 pr-3 text-edubot-muted dark:text-gray-300">
                                        {formatNumber(course.activeStudents7d)}
                                    </td>
                                    <td className="py-3 pr-3 text-edubot-muted dark:text-gray-300">
                                        {formatPercent(course.completionRate)}
                                    </td>
                                    <td className="py-3 pr-3 text-edubot-muted dark:text-gray-300">
                                        {formatCurrency(course.revenueTotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-edubot-muted dark:text-slate-400 py-4">
                        Алдыңкы курстар дагы жок.
                    </p>
                )}
            </div>
        </SmoothTabTransition>
    </div>
);

export default TopCoursesTable;

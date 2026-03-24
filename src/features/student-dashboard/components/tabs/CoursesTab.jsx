import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    resolveInstructorName,
    resolveCourseType,
    courseTypeLabel,
    formatSessionDate,
    resolveRecordings,
} from '../../utils/studentDashboard.helpers.js';

const CoursesTab = ({ courses, offeringsByCourse }) => {
    if (!courses.length) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500 dark:text-slate-400 shadow-lg">
                Сизде активдүү курстар жок.
            </div>
        );
    }

    const fallbackCover =
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Менин курстарым
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => {
                    const courseId = String(course.id ?? course.courseId ?? '');
                    const cover =
                        course.coverImageUrl || course.coverImage || course.cover || fallbackCover;
                    const instructor = resolveInstructorName(course);
                    const progressValue = Math.max(
                        0,
                        Math.min(
                            100,
                            Math.round(Number(course.progressPercent ?? course.progress ?? 0))
                        )
                    );
                    const linkedOfferings = offeringsByCourse.get(courseId) || [];
                    const nextSession = linkedOfferings
                        .filter((item) => item.startAt)
                        .sort(
                            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
                        )[0];
                    const courseType = resolveCourseType(course);
                    const recordingsCount = linkedOfferings.reduce(
                        (acc, row) => acc + resolveRecordings(row).length,
                        0
                    );

                    return (
                        <div
                            key={courseId || course.title}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <img
                                src={cover}
                                alt={course.title}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm text-gray-500">{instructor}</p>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                            {course.title}
                                        </h3>
                                    </div>
                                    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {courseTypeLabel(courseType)}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Прогресс</span>
                                        <span>{progressValue}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-blue-500"
                                            style={{ width: `${progressValue}%` }}
                                        />
                                    </div>
                                </div>
                                {courseType === 'offline' && (
                                    <div className="text-sm text-gray-500">
                                        <p>
                                            Жайгашкан жери:{' '}
                                            {nextSession?.location ||
                                                nextSession?.room ||
                                                'Класс али дайындала элек'}
                                        </p>
                                        <p>Жүгүртмө: {formatSessionDate(nextSession?.startAt)}</p>
                                        <p>
                                            Мугалим: {resolveInstructorName(nextSession || course)}
                                        </p>
                                    </div>
                                )}
                                {courseType === 'online_live' && (
                                    <div className="text-sm text-gray-500">
                                        <p>Кийинки сабак: {formatSessionDate(nextSession?.startAt)}</p>
                                        <p>Жазуулар: {recordingsCount}</p>
                                    </div>
                                )}
                                <Link
                                    to={courseId ? `/courses/${courseId}` : '#'}
                                    className="inline-flex px-4 py-2 rounded-full border text-sm text-blue-600 dark:text-blue-400 dark:border-gray-700"
                                >
                                    Курсту ачуу
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

CoursesTab.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    offeringsByCourse: PropTypes.instanceOf(Map).isRequired,
};

export default CoursesTab;

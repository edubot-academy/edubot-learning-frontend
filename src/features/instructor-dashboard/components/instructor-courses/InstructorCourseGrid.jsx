import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { instructorCourseDisplayItemShape } from './propTypes';

const InstructorCourseGrid = ({ filteredCourses }) => {
    const { t } = useTranslation();

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(({ display }, index) => (
                <article
                    key={display.courseId || `course-${index}`}
                    aria-labelledby={`instructor-course-${display.courseId || index}`}
                    className="bg-white dark:bg-[#141619] rounded shadow p-4 relative"
                >
                    {display.coverImageUrl ? (
                        <img
                            src={display.coverImageUrl}
                            alt={display.title}
                            className="w-full h-48 object-cover mb-4"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="mb-4 flex h-48 w-full items-center justify-center rounded bg-gray-100 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                            {t('instructorDashboard.coursesPage.fallbacks.noImage')}
                        </div>
                    )}
                    <h2 id={`instructor-course-${display.courseId || index}`} className="text-xl font-semibold mb-2">{display.title}</h2>
                    <span className="inline-flex mb-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        {display.typeLabel}
                    </span>
                    <p className="text-gray-700 dark:text-[#a6adba] mb-2">
                        {display.instructorName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba] mb-2">
                        {t('instructorDashboard.coursesPage.price.label')}: {display.priceLabel}
                    </p>
                    <span
                        aria-label={t('instructorDashboard.coursesPage.lifecycle.aria', { status: display.lifecycle.label })}
                        className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${display.lifecycle.badgeClass}`}
                    >
                        {display.lifecycle.label}
                    </span>
                    {display.courseId ? (
                        <Link
                            to={`/instructor/courses/edit/${display.courseId}`}
                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded transition duration-300 hover:bg-blue-500 hover:shadow-lg"
                        >
                            {display.lifecycle.primaryActionLabel}
                        </Link>
                    ) : (
                        <span className="inline-block mt-4 rounded bg-gray-200 px-4 py-2 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                            {t('instructorDashboard.coursesPage.actions.unavailable')}
                        </span>
                    )}
                </article>
            ))}
        </div>
    );
};

InstructorCourseGrid.propTypes = {
    filteredCourses: PropTypes.arrayOf(instructorCourseDisplayItemShape).isRequired,
};

export default InstructorCourseGrid;
